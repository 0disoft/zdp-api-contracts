import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { loadApiContracts } from '../api-contracts/registry-loader.js';
import type {
  ApiContractDiagnostic,
  ApiContracts,
  ApiRouteDefinition,
  ApiSchemaBundleContract,
  ApiSchemaDefinition
} from '../api-contracts/types.js';
import { validateApiContracts } from '../api-contracts/validator.js';
import {
  loadTypedSchemaRegistry,
  type ApiTypedSchemaDefinition,
  type ApiTypedSchemaProperty,
  type ApiTypedSchemaRegistry
} from './typed-schema.js';

const OPENAPI_VERSION = '3.1.0' as const;
const JSON_SCHEMA_DIALECT =
  'https://json-schema.org/draft/2020-12/schema' as const;
const ERROR_COMPONENT_NAME = 'ErrorEnvelope';
const BODY_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export type ApiOpenApiSchema = Readonly<Record<string, unknown>>;
export type ApiOpenApiOperation = Readonly<Record<string, unknown>>;
export type ApiOpenApiPathItem = Readonly<Record<string, ApiOpenApiOperation>>;

export interface ApiOpenApi31Document {
  readonly openapi: typeof OPENAPI_VERSION;
  readonly info: Readonly<{
    readonly title: string;
    readonly version: string;
    readonly description: string;
  }>;
  readonly jsonSchemaDialect: typeof JSON_SCHEMA_DIALECT;
  readonly tags: readonly Readonly<{ readonly name: string }>[];
  readonly paths: Readonly<Record<string, ApiOpenApiPathItem>>;
  readonly components: Readonly<{
    readonly schemas: Readonly<Record<string, ApiOpenApiSchema>>;
  }>;
  readonly 'x-zdp-contract-source': 'zdp-api-contracts';
  readonly 'x-zdp-typed-schema-coverage': Readonly<{
    readonly typed: number;
    readonly total: number;
  }>;
  readonly 'x-zdp-untyped-schema-refs': readonly string[];
}

export interface ApiOpenApi31BuildOptions {
  readonly strictTypedSchemas?: boolean;
  readonly includeRestrictedRoutes?: boolean;
  readonly title?: string;
}

export interface ApiOpenApi31BuildResult {
  readonly ok: boolean;
  readonly document: ApiOpenApi31Document | null;
  readonly diagnostics: readonly ApiContractDiagnostic[];
  readonly typedSchemaRefs: readonly string[];
  readonly untypedSchemaRefs: readonly string[];
}

interface PackageManifest {
  readonly name: string;
  readonly version: string;
  readonly description: string;
}

interface SchemaContext {
  readonly bundle: ApiSchemaBundleContract;
  readonly schema: ApiSchemaDefinition;
  readonly typed: ApiTypedSchemaDefinition;
  readonly componentName: string;
}

/**
 * Builds a deterministic OpenAPI 3.1 document from the committed route catalog
 * and typed schema metadata. Legacy field-list schemas remain visible as
 * permissive properties unless strictTypedSchemas is enabled.
 */
export async function buildOpenApi31Document(
  root = process.cwd(),
  options: ApiOpenApi31BuildOptions = {}
): Promise<ApiOpenApi31BuildResult> {
  let contracts: ApiContracts;
  try {
    contracts = await loadApiContracts(root);
  } catch (error) {
    return failedBuild([
      diagnostic(
        'API_OPENAPI_CONTRACT_LOAD_FAILED',
        'contracts',
        'root',
        error instanceof Error ? error.message : String(error)
      )
    ]);
  }

  const contractValidation = validateApiContracts(contracts);
  if (!contractValidation.ok) {
    return failedBuild(contractValidation.diagnostics);
  }

  const typedRegistryResult = await loadTypedSchemaRegistry(
    root,
    contracts.schemaBundles
  );
  if (!typedRegistryResult.ok || typedRegistryResult.registry === null) {
    return failedBuild(typedRegistryResult.diagnostics);
  }
  const registry = typedRegistryResult.registry;

  if (
    options.strictTypedSchemas === true &&
    registry.untypedSchemaRefs.length > 0
  ) {
    return {
      ok: false,
      document: null,
      diagnostics: registry.untypedSchemaRefs.map((schemaRef) =>
        diagnostic(
          'API_OPENAPI_TYPED_SCHEMA_REQUIRED',
          schemaFile(schemaRef),
          `schema_bundle.schemas[${schemaId(schemaRef)}].properties`,
          `OpenAPI strict mode requires typed properties for \`${schemaRef}\`.`
        )
      ),
      typedSchemaRefs: registry.typedSchemaRefs,
      untypedSchemaRefs: registry.untypedSchemaRefs
    };
  }

  let manifest: PackageManifest;
  try {
    manifest = await loadPackageManifest(root);
  } catch (error) {
    return {
      ...failedBuild([
        diagnostic(
          'API_OPENAPI_PACKAGE_MANIFEST_INVALID',
          'package.json',
          'package',
          error instanceof Error ? error.message : String(error)
        )
      ]),
      typedSchemaRefs: registry.typedSchemaRefs,
      untypedSchemaRefs: registry.untypedSchemaRefs
    };
  }

  const contextResult = buildSchemaContexts(contracts, registry);
  if (contextResult.diagnostics.length > 0) {
    return {
      ok: false,
      document: null,
      diagnostics: contextResult.diagnostics,
      typedSchemaRefs: registry.typedSchemaRefs,
      untypedSchemaRefs: registry.untypedSchemaRefs
    };
  }

  const includeRestrictedRoutes = options.includeRestrictedRoutes === true;
  const routes = contracts.apiCatalog.routes
    .filter(
      (route) =>
        includeRestrictedRoutes ||
        route.exportPolicy === null ||
        route.exportPolicy === undefined
    )
    .slice()
    .sort(compareRoutes);
  const components = buildSchemaComponents(
    contextResult.contexts,
    contracts
  );
  const paths = buildPaths(routes, contextResult.contexts);
  const title = options.title?.trim() || manifest.name;

  return {
    ok: true,
    document: {
      openapi: OPENAPI_VERSION,
      info: {
        title,
        version: manifest.version,
        description: manifest.description
      },
      jsonSchemaDialect: JSON_SCHEMA_DIALECT,
      tags: uniqueSorted(routes.map((route) => route.serviceId)).map((name) => ({
        name
      })),
      paths,
      components: {
        schemas: components
      },
      'x-zdp-contract-source': 'zdp-api-contracts',
      'x-zdp-typed-schema-coverage': {
        typed: registry.typedSchemaRefs.length,
        total:
          registry.typedSchemaRefs.length + registry.untypedSchemaRefs.length
      },
      'x-zdp-untyped-schema-refs': registry.untypedSchemaRefs
    },
    diagnostics: [],
    typedSchemaRefs: registry.typedSchemaRefs,
    untypedSchemaRefs: registry.untypedSchemaRefs
  };
}

export function serializeOpenApi31Document(
  document: ApiOpenApi31Document
): string {
  return `${JSON.stringify(sortJsonValue(document), null, 2)}\n`;
}

function buildSchemaContexts(
  contracts: ApiContracts,
  registry: ApiTypedSchemaRegistry
): {
  readonly contexts: Readonly<Record<string, SchemaContext>>;
  readonly diagnostics: readonly ApiContractDiagnostic[];
} {
  const diagnostics: ApiContractDiagnostic[] = [];
  const componentOwners = new Map<string, string>();
  const entries: [string, SchemaContext][] = [];

  for (const bundle of contracts.schemaBundles) {
    for (const schema of bundle.schemas) {
      const schemaRef = `${bundle.file}#${schema.id}`;
      const typed = registry.schemas[schemaRef];
      if (typed === undefined) {
        diagnostics.push(
          diagnostic(
            'API_OPENAPI_TYPED_SCHEMA_LOOKUP_FAILED',
            bundle.file,
            `schema_bundle.schemas[${schema.id}]`,
            `Typed schema registry is missing \`${schemaRef}\`.`
          )
        );
        continue;
      }
      const componentName = schema.id;
      const existingOwner = componentOwners.get(componentName);
      if (existingOwner !== undefined && existingOwner !== schemaRef) {
        diagnostics.push(
          diagnostic(
            'API_OPENAPI_COMPONENT_NAME_CONFLICT',
            bundle.file,
            `schema_bundle.schemas[${schema.id}].id`,
            `OpenAPI component name \`${componentName}\` is shared by \`${existingOwner}\` and \`${schemaRef}\`.`
          )
        );
        continue;
      }
      if (componentName === ERROR_COMPONENT_NAME) {
        diagnostics.push(
          diagnostic(
            'API_OPENAPI_COMPONENT_NAME_RESERVED',
            bundle.file,
            `schema_bundle.schemas[${schema.id}].id`,
            `Schema id \`${ERROR_COMPONENT_NAME}\` is reserved for the standard error envelope.`
          )
        );
        continue;
      }
      componentOwners.set(componentName, schemaRef);
      entries.push([
        schemaRef,
        { bundle, schema, typed, componentName }
      ]);
    }
  }

  return {
    contexts: Object.fromEntries(
      entries.sort(([left], [right]) => left.localeCompare(right))
    ),
    diagnostics
  };
}

function buildSchemaComponents(
  contexts: Readonly<Record<string, SchemaContext>>,
  contracts: ApiContracts
): Readonly<Record<string, ApiOpenApiSchema>> {
  const entries = Object.values(contexts)
    .sort((left, right) =>
      left.componentName.localeCompare(right.componentName)
    )
    .map((context) => [
      context.componentName,
      buildSchemaComponent(context)
    ] as const);

  entries.push([
    ERROR_COMPONENT_NAME,
    buildErrorEnvelopeSchema(contracts)
  ]);
  entries.sort(([left], [right]) => left.localeCompare(right));
  return Object.fromEntries(entries);
}

function buildSchemaComponent(context: SchemaContext): ApiOpenApiSchema {
  const properties = Object.fromEntries(
    Object.entries(context.typed.properties)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([field, property]) => {
        const schema = {
          ...propertyToOpenApiSchema(property),
          ...(context.schema.secretFields.includes(field)
            ? context.schema.kind === 'request'
              ? { writeOnly: true }
              : { readOnly: true }
            : {})
        };
        return [field, schema] as const;
      })
  );

  return {
    type: 'object',
    additionalProperties: false,
    properties,
    ...(context.schema.requiredFields.length > 0
      ? { required: [...context.schema.requiredFields] }
      : {}),
    'x-zdp-schema-ref': context.typed.schemaRef,
    'x-zdp-service-id': context.bundle.serviceId,
    'x-zdp-owner-boundary': context.bundle.ownerBoundary,
    'x-zdp-contract-status': context.bundle.status,
    'x-zdp-schema-kind': context.schema.kind,
    'x-zdp-carries-secret-material': context.schema.carriesSecretMaterial,
    'x-zdp-typed': context.typed.typed,
    ...(context.schema.sessionEffect === null
      ? {}
      : { 'x-zdp-session-effect': context.schema.sessionEffect })
  };
}

function propertyToOpenApiSchema(
  property: ApiTypedSchemaProperty
): Record<string, unknown> {
  if (property.type === 'unknown') {
    return {
      'x-zdp-untyped': true
    };
  }

  const type = property.nullable
    ? [property.type, 'null']
    : property.type;
  const schema: Record<string, unknown> = { type };
  if (property.format !== null) {
    schema.format = property.format;
  }
  if (property.enumValues.length > 0) {
    schema.enum = property.nullable && !property.enumValues.includes(null)
      ? [...property.enumValues, null]
      : [...property.enumValues];
  }
  if (property.type === 'array' && property.items !== null) {
    schema.items = propertyToOpenApiSchema(property.items);
  }
  if (property.type === 'object') {
    schema.properties = Object.fromEntries(
      Object.entries(property.properties)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([field, nested]) => [
          field,
          propertyToOpenApiSchema(nested)
        ])
    );
    if (property.requiredProperties.length > 0) {
      schema.required = [...property.requiredProperties];
    }
    schema.additionalProperties = property.additionalProperties;
  }
  return schema;
}

function buildErrorEnvelopeSchema(contracts: ApiContracts): ApiOpenApiSchema {
  const knownProperties: Record<string, ApiOpenApiSchema> = {
    code: { type: 'string' },
    message: { type: 'string' },
    request_id: { type: 'string' },
    trace_id: { type: 'string' },
    details: { type: 'object', additionalProperties: true },
    retry_after_seconds: { type: 'integer', minimum: 0 },
    documentation_url: { type: 'string', format: 'uri' }
  };
  const fields = uniqueSorted([
    ...contracts.errorEnvelope.requiredFields,
    ...contracts.errorEnvelope.optionalFields
  ]);

  return {
    type: 'object',
    additionalProperties: false,
    properties: Object.fromEntries(
      fields.map((field) => [field, knownProperties[field] ?? {}])
    ),
    required: [...contracts.errorEnvelope.requiredFields],
    'x-zdp-forbidden-fields': [...contracts.errorEnvelope.forbiddenFields]
  };
}

function buildPaths(
  routes: readonly ApiRouteDefinition[],
  contexts: Readonly<Record<string, SchemaContext>>
): Readonly<Record<string, ApiOpenApiPathItem>> {
  const paths: Record<string, Record<string, ApiOpenApiOperation>> = {};

  for (const route of routes) {
    const method = route.method.toLowerCase();
    const pathItem = paths[route.path] ?? {};
    pathItem[method] = buildOperation(route, contexts);
    paths[route.path] = pathItem;
  }

  return Object.fromEntries(
    Object.entries(paths)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([path, pathItem]) => [
        path,
        Object.fromEntries(
          Object.entries(pathItem).sort(([left], [right]) =>
            left.localeCompare(right)
          )
        )
      ])
  );
}

function buildOperation(
  route: ApiRouteDefinition,
  contexts: Readonly<Record<string, SchemaContext>>
): ApiOpenApiOperation {
  const requestContext = requireContext(contexts, route.requestSchemaRef);
  const pathParameterNames = extractPathParameters(route.path);
  const parameters: Record<string, unknown>[] = pathParameterNames.map((name) => ({
    name,
    in: 'path',
    required: true,
    schema: requestContext.typed.properties[name] === undefined
      ? { type: 'string' }
      : propertyToOpenApiSchema(requestContext.typed.properties[name])
  }));

  if (route.method === 'GET') {
    const fields = uniqueSorted([
      ...requestContext.schema.requiredFields,
      ...requestContext.schema.optionalFields
    ]).filter((field) => !pathParameterNames.includes(field));
    for (const field of fields) {
      const property = requestContext.typed.properties[field];
      parameters.push({
        name: field,
        in: 'query',
        required: requestContext.schema.requiredFields.includes(field),
        schema: property === undefined
          ? { 'x-zdp-untyped': true }
          : propertyToOpenApiSchema(property)
      });
    }
  }

  const responses = Object.fromEntries(
    route.successStatuses.map((status) => [
      String(status),
      buildSuccessResponse(route, status, contexts)
    ])
  );
  responses.default = {
    description: 'Standard API error',
    content: {
      'application/json': {
        schema: {
          $ref: `#/components/schemas/${ERROR_COMPONENT_NAME}`
        }
      }
    },
    'x-zdp-error-codes': [...route.errorCodes]
  };

  const requestFields = uniqueSorted([
    ...requestContext.schema.requiredFields,
    ...requestContext.schema.optionalFields
  ]);
  const operation: Record<string, unknown> = {
    operationId: route.operationId,
    tags: [route.serviceId],
    responses,
    'x-zdp-resource': route.resource,
    'x-zdp-action': route.action,
    'x-zdp-auth-required': route.authRequired,
    'x-zdp-permission-check': route.permissionCheck,
    'x-zdp-audit-event': route.auditEvent,
    'x-zdp-idempotency': route.idempotency,
    'x-zdp-owner-boundary': route.ownerBoundary,
    'x-zdp-tenant-boundary': route.tenantBoundary,
    'x-zdp-request-id-required': route.requestIdRequired,
    'x-zdp-trace-id-required': route.traceIdRequired,
    'x-zdp-session-effect': route.sessionEffect,
    'x-zdp-credential-policy': route.credentialPolicy,
    'x-zdp-error-codes': [...route.errorCodes],
    ...(parameters.length > 0 ? { parameters } : {}),
    ...(BODY_METHODS.has(route.method) && requestFields.length > 0
      ? {
          requestBody: {
            required: requestContext.schema.requiredFields.length > 0,
            content: {
              'application/json': {
                schema: {
                  $ref: componentRef(requestContext)
                }
              }
            }
          }
        }
      : {}),
    ...(route.exportPolicy === null || route.exportPolicy === undefined
      ? {}
      : { 'x-zdp-export-policy': route.exportPolicy }),
    ...(route.authorizationPolicy === null ||
    route.authorizationPolicy === undefined
      ? {}
      : { 'x-zdp-authorization-policy': route.authorizationPolicy })
  };

  return operation;
}

function buildSuccessResponse(
  route: ApiRouteDefinition,
  status: number,
  contexts: Readonly<Record<string, SchemaContext>>
): Record<string, unknown> {
  const response: Record<string, unknown> = {
    description: successDescription(status)
  };
  if (status === 204 || route.responseSchemaRef === null) {
    return response;
  }
  const responseContext = requireContext(contexts, route.responseSchemaRef);
  response.content = {
    'application/json': {
      schema: {
        $ref: componentRef(responseContext)
      }
    }
  };
  return response;
}

function requireContext(
  contexts: Readonly<Record<string, SchemaContext>>,
  schemaRef: string
): SchemaContext {
  const context = contexts[schemaRef];
  if (context === undefined) {
    throw new Error(`Validated route references missing schema \`${schemaRef}\`.`);
  }
  return context;
}

function componentRef(context: SchemaContext): string {
  return `#/components/schemas/${context.componentName}`;
}

function extractPathParameters(path: string): readonly string[] {
  return Array.from(path.matchAll(/\{([A-Za-z_][A-Za-z0-9_]*)\}/g))
    .map((match) => match[1])
    .filter((value): value is string => value !== undefined);
}

function successDescription(status: number): string {
  if (status === 200) {
    return 'OK';
  }
  if (status === 201) {
    return 'Created';
  }
  if (status === 202) {
    return 'Accepted';
  }
  if (status === 204) {
    return 'No Content';
  }
  return `Success ${status}`;
}

async function loadPackageManifest(root: string): Promise<PackageManifest> {
  const parsed = JSON.parse(
    await readFile(join(root, 'package.json'), 'utf8')
  ) as unknown;
  if (!isRecord(parsed)) {
    throw new Error('package.json must contain an object.');
  }
  for (const field of ['name', 'version', 'description'] as const) {
    if (typeof parsed[field] !== 'string' || parsed[field].trim().length === 0) {
      throw new Error(`package.json must declare non-empty string \`${field}\`.`);
    }
  }
  return {
    name: parsed.name as string,
    version: parsed.version as string,
    description: parsed.description as string
  };
}

function compareRoutes(
  left: ApiRouteDefinition,
  right: ApiRouteDefinition
): number {
  return (
    left.path.localeCompare(right.path) ||
    left.method.localeCompare(right.method) ||
    left.operationId.localeCompare(right.operationId)
  );
}

function failedBuild(
  diagnostics: readonly ApiContractDiagnostic[]
): ApiOpenApi31BuildResult {
  return {
    ok: false,
    document: null,
    diagnostics,
    typedSchemaRefs: [],
    untypedSchemaRefs: []
  };
}

function diagnostic(
  code: string,
  file: string,
  path: string,
  message: string
): ApiContractDiagnostic {
  return { code, file, path, message };
}

function schemaFile(schemaRef: string): string {
  const index = schemaRef.indexOf('#');
  return index === -1 ? schemaRef : schemaRef.slice(0, index);
}

function schemaId(schemaRef: string): string {
  const index = schemaRef.indexOf('#');
  return index === -1 ? schemaRef : schemaRef.slice(index + 1);
}

function sortJsonValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortJsonValue);
  }
  if (isRecord(value)) {
    return Object.fromEntries(
      Object.keys(value)
        .sort((left, right) => left.localeCompare(right))
        .map((key) => [key, sortJsonValue(value[key])])
    );
  }
  return value;
}

function uniqueSorted(values: readonly string[]): string[] {
  return Array.from(new Set(values)).sort((left, right) =>
    left.localeCompare(right)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
