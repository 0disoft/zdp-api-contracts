import { expect, test } from 'bun:test';
import { buildOpenApi31Document } from '../src/api-export-plan/openapi';

test('personal scope read exports identity bindings without product authority inputs', async () => {
  const result = await buildOpenApi31Document(process.cwd());
  if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));
  expect(result.ok).toBe(true);
  const schemas = result.document!.components.schemas;
  expect(schemas.CurrentPersonalAccountScopeGetRequest).toMatchObject({ additionalProperties: false, properties: {} });
  const response = schemas.CurrentPersonalAccountScopeGetResponse;
  expect(response?.additionalProperties).toBe(false);
  expect(Object.keys(response?.properties ?? {}).sort()).toEqual(['expires_at', 'personal_account_ref', 'session_ref', 'subject_ref', 'tenant_ref']);
  expect(response).toMatchObject({ properties: { expires_at: { type: 'string', format: 'date-time' } } });
  expect(result.document!.paths['/v1/accounts/personal-scope/current']?.get).toMatchObject({ responses: { '200': { content: { 'application/json': { schema: { $ref: '#/components/schemas/CurrentPersonalAccountScopeGetResponse' } } } } } });
});
