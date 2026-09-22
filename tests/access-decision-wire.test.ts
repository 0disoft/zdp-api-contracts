import { describe, expect, it } from 'bun:test';
import { buildOpenApi31Document } from '../src/api-export-plan/openapi';

describe('Core access decision JSON contract', () => {
  it('exports a closed, typed request without caller-supplied authority', async () => {
    const result = await buildOpenApi31Document(process.cwd());
    expect(result.ok).toBe(true);
    const request = result.document?.components.schemas.AccessAuthorizationDecisionCreateRequest;
    expect(request).toMatchObject({
      type: 'object',
      additionalProperties: false,
      'x-zdp-typed': true,
      properties: {
        product_ref: { type: 'string' },
        action: { type: 'string' },
        resource_type: { type: 'string' },
        resource_ref: { type: 'string' },
        requested_scope_type: {
          type: 'string',
          enum: ['platform', 'personal_account', 'organization', 'workspace']
        },
        requested_scope_ref: { type: 'string' }
      }
    });
    expect(Object.keys(request?.properties ?? {}).sort()).toEqual([
      'action', 'product_ref', 'requested_scope_ref', 'requested_scope_type',
      'resource_ref', 'resource_type'
    ]);
    expect(result.document?.paths['/v1/access/authorization-decisions']?.post).toMatchObject({
      requestBody: {
        content: { 'application/json': { schema: { $ref: '#/components/schemas/AccessAuthorizationDecisionCreateRequest' } } }
      }
    });
  });

  it('exports direct decision objects and excludes internal persistence evidence', async () => {
    const result = await buildOpenApi31Document(process.cwd());
    expect(result.ok).toBe(true);
    const response = result.document?.components.schemas.AccessAuthorizationDecisionCreateResponse;
    expect(response).toMatchObject({
      type: 'object',
      additionalProperties: false,
      'x-zdp-typed': true,
      properties: {
        decision: { type: 'string', enum: ['allow', 'deny'] },
        tenant_ref: { type: 'string' },
        scope_type: { type: 'string', enum: ['platform', 'personal_account', 'organization', 'workspace'] },
        decided_at: { type: 'string', format: 'date-time' },
        decision_expires_at: { type: 'string', format: 'date-time' },
        session_expires_at: { type: 'string', format: 'date-time' },
        obligations: { type: 'array', items: { type: 'string' } }
      }
    });
    expect(Object.keys(response?.properties ?? {}).sort()).toEqual([
      'action', 'data_revision', 'decided_at', 'decision', 'decision_expires_at',
      'decision_ref', 'obligations', 'policy_version', 'product_ref', 'reason_code',
      'resource_ref', 'resource_type', 'scope_ref', 'scope_type', 'session_expires_at',
      'session_ref', 'subject_ref', 'tenant_ref'
    ]);
    expect(response?.required).toContain('obligations');
    expect(result.document?.paths['/v1/access/authorization-decisions']?.post).toMatchObject({
      responses: {
        '201': {
          content: { 'application/json': { schema: { $ref: '#/components/schemas/AccessAuthorizationDecisionCreateResponse' } } }
        }
      }
    });
  });
});
