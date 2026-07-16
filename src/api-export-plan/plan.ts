import { validateApiContracts } from '../api-contracts/validator.js';
import type {
  ApiContractDiagnostic,
  ApiContracts,
  ApiExportPlan,
  ApiExportPlanOutput,
  ApiExportPlanResult,
  ApiRouteDefinition,
  ApiSchemaBundleContract,
  ApiSchemaDefinition,
  ApiSchemaModel,
  ApiSchemaModelKind,
  ApiTypedFetchOperation
} from '../api-contracts/types.js';

const ROUTE_CONTRACT_FILE = 'contracts/route-contract.yaml';
const ERROR_ENVELOPE_FILE = 'contracts/error-envelope.yaml';
const WEBHOOK_CONTRACT_FILE = 'contracts/webhook-contract.yaml';
const SDK_GENERATION_INPUT_FILE = 'contracts/sdk-generation-input.yaml';
const API_CATALOG_FILE = 'contracts/apis/catalog.yaml';

const OPENAPI_EXTRA_ROUTE_METADATA = [
  'operation_id',
  'request_schema_ref',
  'response_schema_ref'
] as const;

const TRACE_FIELDS = ['request_id', 'trace_id'] as const;
const SDK_EXPORT_ERROR_DETAIL_FIELDS = ['details'] as const;
const MUTATING_METHODS_REQUIRING_IDEMPOTENCY = [
  'POST',
  'PUT',
  'PATCH',
  'DELETE'
] as const;
const REQUIRED_MUTATION_IDEMPOTENCY_POLICY = 'required_idempotency_key';

/**
 * mf:anchor zdp.api-contracts.export-plan
 * purpose: Locate the dry-run export plan for OpenAPI, docs, webhook, and SDK handoffs.
 * search: export plan, OpenAPI, SDK generation, docs contract, webhook schema
 * invariant: Export planning reports required metadata without publishing schemas or writing artifacts.
 * risk: dependency, data_consistency
 */
export function buildApiExportPlan(
  contracts: ApiContracts
): ApiExportPlanResult {
  const contractCheck = validateApiContracts(contracts);

  if (!contractCheck.ok) {
    return {
      ok: false,
      plan: null,
      diagnostics: contractCheck.diagnostics
    };
  }

  const diagnostics = validateExportPlanInputs(contracts);

  if (diagnostics.length > 0) {
    return {
      ok: false,
      plan: null,
      diagnostics
    };
  }

  const schemaBundleFiles = contracts.schemaBundles.map((bundle) => bundle.file);
  const outputs: readonly ApiExportPlanOutput[] = [
    {
      kind: 'openapi',
      sourceContracts: [
        ROUTE_CONTRACT_FILE,
        ERROR_ENVELOPE_FILE,
        API_CATALOG_FILE,
        ...schemaBundleFiles
      ],
      requiredMetadata: uniqueSorted([
        ...contracts.route.requiredPerRoute,
        ...OPENAPI_EXTRA_ROUTE_METADATA,
        ...contracts.errorEnvelope.requiredFields
      ]),
      forbiddenValues: uniqueSorted([
        ...contracts.route.forbiddenShapes,
        ...contracts.errorEnvelope.forbiddenFields
      ])
    },
    {
      kind: 'sdk_generation_input',
      sourceContracts: [...contracts.sdkGenerationInput.sourceContracts],
      requiredMetadata: uniqueSorted([
        ...contracts.sdkGenerationInput.requiredRouteMetadata,
        ...contracts.sdkGenerationInput.requiredErrorMetadata,
        ...contracts.sdkGenerationInput.requiredClientRuntimeMetadata,
        ...contracts.sdkGenerationInput.requiredWebhookMetadata
      ]),
      forbiddenValues: [...contracts.sdkGenerationInput.forbiddenValues]
    },
    {
      kind: 'webhook_schema',
      sourceContracts: [WEBHOOK_CONTRACT_FILE],
      requiredMetadata: [...contracts.webhook.requiredControls],
      forbiddenValues: [...contracts.webhook.forbiddenControls]
    },
    {
      kind: 'docs_contract',
      sourceContracts: [
        ROUTE_CONTRACT_FILE,
        ERROR_ENVELOPE_FILE,
        WEBHOOK_CONTRACT_FILE,
        SDK_GENERATION_INPUT_FILE,
        API_CATALOG_FILE,
        ...schemaBundleFiles
      ],
      requiredMetadata: uniqueSorted([
        'auth_required',
        'permission_check',
        'audit_event',
        'idempotency',
        'success_statuses',
        ...TRACE_FIELDS
      ]),
      forbiddenValues: uniqueSorted([
        ...contracts.route.forbiddenShapes,
        ...contracts.errorEnvelope.forbiddenFields,
        ...contracts.webhook.forbiddenControls,
        ...contracts.sdkGenerationInput.forbiddenValues
      ])
    }
  ];

  const plan: ApiExportPlan = {
    status: 'plan-only',
    writesArtifacts: false,
    publishesSchemas: false,
    outputs,
    sdkTargets: [...contracts.sdkGenerationInput.generationTargets],
    traceFields: [...TRACE_FIELDS],
    clientRuntimeMetadata: [
      ...contracts.sdkGenerationInput.requiredClientRuntimeMetadata
    ],
    noContentSuccessStatuses: [
      ...contracts.route.noContentSuccessStatuses
    ],
    operationIds: contracts.apiCatalog.routes.map((route) => route.operationId),
    typedFetchOperationMap: buildTypedFetchOperationMap(
      contracts.apiCatalog.routes
    ),
    schemaModelMap: buildSchemaModelMap(contracts.schemaBundles),
    mutatingMethodsRequiringIdempotency: [
      ...MUTATING_METHODS_REQUIRING_IDEMPOTENCY
    ],
    requiredMutationIdempotencyPolicy: REQUIRED_MUTATION_IDEMPOTENCY_POLICY
  };

  return {
    ok: true,
    plan,
    diagnostics: []
  };
}

function buildTypedFetchOperationMap(
  routes: readonly ApiRouteDefinition[]
): Readonly<Record<string, ApiTypedFetchOperation>> {
  const operationMap: Record<string, ApiTypedFetchOperation> = {};

  for (const route of routes) {
    operationMap[route.operationId] = {
      operationId: route.operationId,
      method: route.method,
      path: route.path,
      successStatuses: [...route.successStatuses],
      requestSchemaRef: route.requestSchemaRef,
      responseSchemaRef: route.responseSchemaRef,
      responseBodyMode: route.responseSchemaRef === null ? 'none' : 'schema',
      authRequired: route.authRequired,
      idempotency: route.idempotency,
      requestIdRequired: route.requestIdRequired,
      traceIdRequired: route.traceIdRequired,
      errorCodes: [...route.errorCodes]
    };
  }

  return operationMap;
}

function buildSchemaModelMap(
  schemaBundles: readonly ApiSchemaBundleContract[]
): Readonly<Record<string, ApiSchemaModel>> {
  const schemaModelEntries = schemaBundles.flatMap((bundle) =>
    bundle.schemas.map((schema) => {
      const model = buildSchemaModel(bundle, schema);
      return [model.schemaRef, model] as const;
    })
  );

  return Object.fromEntries(
    schemaModelEntries.sort(([left], [right]) => left.localeCompare(right))
  );
}

function buildSchemaModel(
  bundle: ApiSchemaBundleContract,
  schema: ApiSchemaDefinition
): ApiSchemaModel {
  return {
    schemaRef: `${bundle.file}#${schema.id}`,
    schemaId: schema.id,
    sourceContract: bundle.file,
    serviceId: bundle.serviceId,
    ownerBoundary: bundle.ownerBoundary,
    status: bundle.status,
    kind: requireSchemaModelKind(schema),
    carriesSecretMaterial: schema.carriesSecretMaterial,
    requiredFields: [...schema.requiredFields],
    optionalFields: [...schema.optionalFields],
    secretFields: [...schema.secretFields],
    sessionEffect: schema.sessionEffect
  };
}

function requireSchemaModelKind(schema: ApiSchemaDefinition): ApiSchemaModelKind {
  if (schema.kind === 'request' || schema.kind === 'response') {
    return schema.kind;
  }

  throw new Error(
    `Validated API schema \`${schema.id}\` has unsupported kind \`${schema.kind}\`.`
  );
}

function validateExportPlanInputs(
  contracts: ApiContracts
): readonly ApiContractDiagnostic[] {
  return [
    ...validateRequiredEntries({
      actual: contracts.sdkGenerationInput.requiredRouteMetadata,
      required: contracts.route.requiredPerRoute,
      code: 'API_EXPORT_PLAN_ROUTE_METADATA_DRIFT',
      file: SDK_GENERATION_INPUT_FILE,
      path: 'sdk_generation_input.required_route_metadata',
      label: 'SDK route metadata'
    }),
    ...validateRequiredEntries({
      actual: contracts.sdkGenerationInput.requiredRouteMetadata,
      required: OPENAPI_EXTRA_ROUTE_METADATA,
      code: 'API_EXPORT_PLAN_OPENAPI_METADATA_MISSING',
      file: SDK_GENERATION_INPUT_FILE,
      path: 'sdk_generation_input.required_route_metadata',
      label: 'OpenAPI route metadata'
    }),
    ...validateRequiredEntries({
      actual: contracts.apiCatalog.routeDefinitionRequiredFields,
      required: [
        ...contracts.route.requiredPerRoute,
        ...contracts.sdkGenerationInput.requiredRouteMetadata
      ],
      code: 'API_EXPORT_PLAN_CATALOG_METADATA_DRIFT',
      file: API_CATALOG_FILE,
      path: 'api_catalog.route_definition_required_fields',
      label: 'API catalog route metadata'
    }),
    ...validateRequiredEntries({
      actual: contracts.sdkGenerationInput.requiredErrorMetadata,
      required: [
        ...contracts.errorEnvelope.requiredFields,
        ...contracts.errorEnvelope.optionalFields.filter((field) =>
          !SDK_EXPORT_ERROR_DETAIL_FIELDS.includes(
            field as (typeof SDK_EXPORT_ERROR_DETAIL_FIELDS)[number]
          )
        )
      ],
      code: 'API_EXPORT_PLAN_ERROR_METADATA_DRIFT',
      file: SDK_GENERATION_INPUT_FILE,
      path: 'sdk_generation_input.required_error_metadata',
      label: 'SDK error metadata'
    }),
    ...validateRequiredEntries({
      actual: contracts.sdkGenerationInput.requiredClientRuntimeMetadata,
      required: [
        'typed_fetch_operation_map',
        'standard_error_envelope_normalization',
        'request_id_propagation',
        'trace_id_propagation',
        'timeout_ms_option',
        'abort_signal_option',
        'idempotency_key_required_for_mutations'
      ],
      code: 'API_EXPORT_PLAN_CLIENT_RUNTIME_METADATA_DRIFT',
      file: SDK_GENERATION_INPUT_FILE,
      path: 'sdk_generation_input.required_client_runtime_metadata',
      label: 'SDK client runtime metadata'
    }),
    ...validateRequiredEntries({
      actual: contracts.sdkGenerationInput.requiredWebhookMetadata,
      required: contracts.webhook.requiredControls,
      code: 'API_EXPORT_PLAN_WEBHOOK_METADATA_DRIFT',
      file: SDK_GENERATION_INPUT_FILE,
      path: 'sdk_generation_input.required_webhook_metadata',
      label: 'SDK webhook metadata'
    }),
    ...validateRequiredEntries({
      actual: contracts.sdkGenerationInput.sourceContracts,
      required: [
        ROUTE_CONTRACT_FILE,
        ERROR_ENVELOPE_FILE,
        WEBHOOK_CONTRACT_FILE,
        API_CATALOG_FILE,
        ...contracts.schemaBundles.map((bundle) => bundle.file)
      ],
      code: 'API_EXPORT_PLAN_SOURCE_CONTRACT_MISSING',
      file: SDK_GENERATION_INPUT_FILE,
      path: 'sdk_generation_input.source_contracts',
      label: 'SDK source contracts'
    }),
    ...validateRequiredEntries({
      actual: contracts.apiCatalog.forbiddenValues,
      required: contracts.sdkGenerationInput.forbiddenValues,
      code: 'API_EXPORT_PLAN_CATALOG_FORBIDDEN_VALUE_DRIFT',
      file: API_CATALOG_FILE,
      path: 'api_catalog.forbidden_values',
      label: 'API catalog forbidden values'
    }),
    ...validateRequiredEntries({
      actual: contracts.sdkGenerationInput.forbiddenValues,
      required: [
        'raw_customer_payload',
        'raw_provider_error',
        'provider_secret',
        'authorization_header',
        'cookie_header',
        'refresh_token_plaintext',
        'stack_trace',
        'screen_component_payload'
      ],
      code: 'API_EXPORT_PLAN_FORBIDDEN_VALUE_MISSING',
      file: SDK_GENERATION_INPUT_FILE,
      path: 'sdk_generation_input.forbidden_values',
      label: 'SDK forbidden values'
    })
  ];
}

function validateRequiredEntries(input: {
  readonly actual: readonly string[];
  readonly required: readonly string[];
  readonly code: string;
  readonly file: string;
  readonly path: string;
  readonly label: string;
}): readonly ApiContractDiagnostic[] {
  return input.required
    .filter((entry) => !input.actual.includes(entry))
    .map((entry) => ({
      code: input.code,
      file: input.file,
      path: input.path,
      message: `${input.label} must include \`${entry}\`.`
    }));
}

function uniqueSorted(values: readonly string[]): readonly string[] {
  return Array.from(new Set(values)).sort((left, right) =>
    left.localeCompare(right)
  );
}
