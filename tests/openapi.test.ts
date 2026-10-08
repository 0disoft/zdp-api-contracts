import { describe, expect, it } from 'bun:test';
import type { ApiSchemaBundleContract } from '../src/api-contracts/types';
import {
  buildOpenApi31Document,
  serializeOpenApi31Document
} from '../src/api-export-plan/openapi';
import { parseTypedSchemaBundle } from '../src/api-export-plan/typed-schema';
import { readFileSync } from 'node:fs';
import { cp, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parse, stringify } from 'yaml';
import { loadApiContracts, parseRouteContract } from '../src/api-contracts/index';
import { compareApiContracts } from '../scripts/lib/contract-compatibility';

describe('OpenAPI 3.1 export', () => {
  it('exports optional idempotency headers and rejects their schema-header collisions', async () => {
    const root = await mkdtemp(join(tmpdir(), 'zdp-openapi-optional-idempotency-'));
    try {
      await cp('contracts', join(root, 'contracts'), { recursive: true });
      await cp('package.json', join(root, 'package.json'));
      const file = 'contracts/apis/catalog.yaml';
      const catalog = parse(readFileSync(file, 'utf8'));
      const source = catalog.routes.find((route: { operation_id: string }) => route.operation_id === 'core.auth.sessions.get_current');
      const route = { ...source, operation_id: 'core.auth.sessions.optional_get', path: '/v1/auth/sessions/optional', idempotency: 'optional_idempotency_key' };
      catalog.routes.push(route);
      await writeFile(join(root, file), stringify(catalog));
      const result = await buildOpenApi31Document(root);
      expect(result.diagnostics).toEqual([]);
      expect(result.document?.paths[route.path]?.get?.parameters).toEqual(expect.arrayContaining([
        { name: 'Idempotency-Key', in: 'header', required: false, schema: { type: 'string', minLength: 1 } }
      ]));
      const [schemaFile, id] = route.request_schema_ref.split('#');
      const bundle = parse(readFileSync(schemaFile, 'utf8'));
      bundle.schema_bundle.schemas.find((schema: { id: string }) => schema.id === id).request_headers = [
        { name: 'idempotency-key', value: 'fixed', required_when: 'always' }
      ];
      await writeFile(join(root, schemaFile), stringify(bundle));
      const invalid = await buildOpenApi31Document(root);
      expect(invalid.document).toBeNull();
      expect(invalid.diagnostics).toContainEqual(expect.objectContaining({ code: 'API_EXPORT_PLAN_REQUEST_HEADER_COLLISION' }));
    } finally { await rm(root, { recursive: true, force: true }); }
  }, 15_000);

  it('rejects request header collisions through the real OpenAPI loading path', async () => {
    const root = await mkdtemp(join(tmpdir(), 'zdp-openapi-header-collision-'));
    try {
      await cp('contracts', join(root, 'contracts'), { recursive: true });
      const contracts = await loadApiContracts();
      const route = contracts.apiCatalog.routes.find(route => route.exportPolicy == null &&
        route.requestIdRequired && route.traceIdRequired && route.idempotency === 'required_idempotency_key')!;
      const metadata = contracts.route.serviceRequestMetadataHeaders?.[route.serviceId] ?? contracts.route.requestMetadataHeaders!;
      const [file, id] = route.requestSchemaRef.split('#');
      const data = parse(readFileSync(file!, 'utf8'));
      const schema = data.schema_bundle.schemas.find((schema: { id: string }) => schema.id === id);
      for (const name of [metadata.requestId, metadata.traceId, metadata.idempotencyKey]) {
        schema.request_headers = [{ name: name.toLowerCase(), value: 'fixture', required_when: 'always' }];
        await writeFile(join(root, file!), stringify(data));
        const result = await buildOpenApi31Document(root);
        expect(result.ok).toBe(false);
        expect(result.document).toBeNull();
        expect(result.diagnostics).toContainEqual(expect.objectContaining({ code: 'API_EXPORT_PLAN_REQUEST_HEADER_COLLISION' }));
      }
    } finally { await rm(root, { recursive: true, force: true }); }
  }, 15_000);
  it('exports required HTTP metadata with service transports and deduplicates specialized profiles', async () => {
    const result = await buildOpenApi31Document(process.cwd());
    expect(result.ok).toBe(true);
    const issue = result.document?.paths['/v1/abuse/challenges']?.post;
    expect(issue).toMatchObject({ parameters: expect.arrayContaining([
      { name: 'X-Request-ID', in: 'header', required: true, schema: { type: 'string', minLength: 1 } },
      { name: 'traceparent', in: 'header', required: true, schema: { type: 'string', minLength: 1 } },
      { name: 'Idempotency-Key', in: 'header', required: true, schema: { type: 'string', minLength: 1 } }
    ]) });
    const get = result.document?.paths['/v1/auth/sessions/current']?.get;
    const getParameters = [...(get?.parameters as { name: string }[])];
    expect(get).toMatchObject({ parameters: expect.arrayContaining([
      expect.objectContaining({ name: 'X-Request-ID', in: 'header', required: true }),
      expect.objectContaining({ name: 'X-Trace-ID', in: 'header', required: true })
    ]) });
    expect(getParameters.some(parameter => parameter.name === 'Idempotency-Key')).toBe(false);
    const access = result.document?.paths['/v1/access/authorization-decisions']?.post;
    const headers = (access?.parameters as { name: string; in: string }[]).filter(parameter => parameter.in === 'header');
    expect(headers).toHaveLength(3);
    expect(new Set(headers.map(header => header.name.toLowerCase())).size).toBe(3);
  });

  it('rejects invalid transport mappings and tracks header changes in compatibility checks', async () => {
    const source = readFileSync('contracts/route-contract.yaml', 'utf8');
    for (const invalid of ['X-Request-ID', 'Cookie', 'bad header']) {
      expect(() => parseRouteContract(source.replace('trace_id: X-Trace-ID', `trace_id: ${invalid}`))).toThrow();
    }
    const contracts = await loadApiContracts();
    const headers = contracts.route.requestMetadataHeaders!;
    const renamed = { ...contracts, route: { ...contracts.route, requestMetadataHeaders: { ...headers, traceId: 'Trace-ID' } } };
    expect(compareApiContracts(contracts, renamed).changes).toContainEqual(expect.objectContaining({
      code: 'API_COMPAT_ROUTE_METADATA_HEADERS_CHANGED', level: 'breaking'
    }));
  });

  it('emits deterministic typed schemas and keeps restricted routes opt-in', async () => {
    const first = await buildOpenApi31Document(process.cwd());
    const second = await buildOpenApi31Document(process.cwd());

    expect(first.ok).toBe(true);
    expect(first.diagnostics).toEqual([]);
    expect(first.document).not.toBeNull();
    expect(second.document).not.toBeNull();
    if (first.document === null || second.document === null) {
      throw new Error('Expected OpenAPI documents to be generated.');
    }

    expect(first.document.openapi).toBe('3.1.0');
    expect(first.document.jsonSchemaDialect).toBe(
      'https://json-schema.org/draft/2020-12/schema'
    );
    expect(first.typedSchemaRefs).toContain(
      'contracts/apis/core-api/auth-session-consumer.yaml#AuthSessionCurrentGetResponse'
    );
    expect(first.typedSchemaRefs).toContain(
      'contracts/apis/support-api/intake.yaml#SupportCaseCreateRequest'
    );
    expect(first.untypedSchemaRefs.length).toBeGreaterThan(0);
    expect(first.document['x-zdp-typed-schema-coverage']).toEqual({
      typed: first.typedSchemaRefs.length,
      total: first.typedSchemaRefs.length + first.untypedSchemaRefs.length
    });

    expect(
      first.document.components.schemas.AuthSessionCurrentGetResponse
    ).toMatchObject({
      type: 'object',
      additionalProperties: false,
      properties: {
        session_ref: { type: 'string' },
        expires_at: { type: 'string', format: 'date-time' }
      },
      'x-zdp-typed': true
    });
    expect(
      first.document.components.schemas.SupportCaseCreateRequest
    ).toMatchObject({
      properties: {
        reply_address: { type: 'string', format: 'email' },
        abuse_verification_ref: {
          type: 'string',
          writeOnly: true
        }
      }
    });
    expect(
      first.document.components.schemas.SupportCaseStatusChangeResponse
    ).toMatchObject({
      properties: {
        source_version: { type: 'integer' },
        replayed: { type: 'boolean' }
      }
    });
    expect(
      first.document.components.schemas.OperatorSessionContextGetResponse
    ).toMatchObject({
      properties: {
        capabilities: {
          type: 'array',
          items: { type: 'string' }
        }
      }
    });

    expect(
      first.document.paths['/v1/auth/sessions/current']?.get
    ).toMatchObject({
      operationId: 'core.auth.sessions.get_current',
      responses: {
        '200': {
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/AuthSessionCurrentGetResponse'
              }
            }
          }
        }
      }
    });
    expect(first.document.paths['/v1/admin/session-context']).toBeUndefined();

    const restricted = await buildOpenApi31Document(process.cwd(), {
      includeRestrictedRoutes: true
    });
    expect(restricted.ok).toBe(true);
    expect(
      restricted.document?.paths['/v1/admin/session-context']?.get
    ).toMatchObject({
      operationId: 'core.admin.operator_session_context.get',
      'x-zdp-export-policy': 'internal_admin_service_only_not_public_sdk'
    });

    expect(serializeOpenApi31Document(first.document)).toBe(
      serializeOpenApi31Document(second.document)
    );
  });

  it('reports every remaining field-list schema in strict mode', async () => {
    const result = await buildOpenApi31Document(process.cwd(), {
      strictTypedSchemas: true
    });

    expect(result.ok).toBe(false);
    expect(result.document).toBeNull();
    expect(result.untypedSchemaRefs.length).toBeGreaterThan(0);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_OPENAPI_TYPED_SCHEMA_REQUIRED'
    );
  });

  it('validates enum, array, object, nullable, and field-list alignment', () => {
    const bundle: ApiSchemaBundleContract = {
      file: 'contracts/apis/example-api/example.yaml',
      serviceId: 'example-api',
      ownerBoundary: 'example',
      status: 'contract-only',
      purpose: 'typed schema parser fixture',
      commonEnvelope: {
        requiredRequestMetadata: [],
        requiredResponseMetadata: [],
        forbiddenPayloadValues: []
      },
      schemas: [
        {
          id: 'ExampleRequest',
          kind: 'request',
          carriesSecretMaterial: false,
          secretMaterialPolicy: null,
          sessionEffect: null,
          requiredFields: ['status', 'tags', 'metadata'],
          optionalFields: ['note'],
          secretFields: []
        }
      ]
    };
    const result = parseTypedSchemaBundle(
      `schema_bundle:
  schemas:
    - id: ExampleRequest
      properties:
        status:
          type: string
          enum:
            - queued
            - completed
        tags:
          type: array
          items:
            type: string
        metadata:
          type: object
          nullable: true
          properties:
            attempt:
              type: integer
            active:
              type: boolean
          required:
            - attempt
        unexpected:
          type: string
`,
      bundle
    );

    expect(result.schemas[0]).toMatchObject({
      typed: true,
      properties: {
        status: {
          type: 'string',
          enumValues: ['queued', 'completed']
        },
        tags: {
          type: 'array',
          items: { type: 'string' }
        },
        metadata: {
          type: 'object',
          nullable: true,
          requiredProperties: ['attempt'],
          properties: {
            attempt: { type: 'integer' },
            active: { type: 'boolean' }
          }
        }
      }
    });
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(
      expect.arrayContaining([
        'API_TYPED_SCHEMA_PROPERTY_MISSING',
        'API_TYPED_SCHEMA_PROPERTY_UNDECLARED'
      ])
    );
  });
});
