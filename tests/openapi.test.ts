import { describe, expect, it } from 'bun:test';
import type { ApiSchemaBundleContract } from '../src/api-contracts/types';
import {
  buildOpenApi31Document,
  serializeOpenApi31Document
} from '../src/api-export-plan/openapi';
import { parseTypedSchemaBundle } from '../src/api-export-plan/typed-schema';

describe('OpenAPI 3.1 export', () => {
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
