import { describe, expect, it } from 'bun:test';
import { loadApiContracts } from '../src/api-contracts/registry-loader';
import { validateApiContracts } from '../src/api-contracts/validator';
import { buildApiExportPlan } from '../src/api-export-plan/plan';
import { loadErrorCodeCatalog } from '../src/api-contracts/error-code-catalog';
import { buildOpenApi31Document } from '../src/api-export-plan/openapi';

describe('discoverable passkey login contract', () => {
  it('exports browser-only payloads, single-use semantics and cookie-only sessions', async () => {
    const contracts = await loadApiContracts(process.cwd());
    const result = buildApiExportPlan(contracts);
    expect(result.diagnostics).toEqual([]);
    const plan = result.plan;
    if (!plan) throw new Error('Expected export plan');
    const begin = plan.typedFetchOperationMap['core.auth.passkey_login_begin.create'];
    const complete = plan.typedFetchOperationMap['core.auth.passkey_login_complete.create'];
    expect(begin).toMatchObject({ method: 'POST', path: '/v1/auth/passkey/login/begin', successStatuses: [200], authRequired: false, idempotency: 'not_required' });
    expect(complete).toMatchObject({ method: 'POST', path: '/v1/auth/passkey/login/complete', successStatuses: [201], authRequired: false, idempotency: 'not_required' });
    expect(complete?.errorCodes).not.toContain('account_restricted');
    if (!begin || !complete || !complete.responseSchemaRef) throw new Error('Missing operations');
    expect(plan.schemaModelMap[begin.requestSchemaRef]?.requiredFields).toEqual([]);
    expect(plan.schemaModelMap[complete.requestSchemaRef]?.requiredFields).toEqual(['ceremony_id', 'credential']);
    expect(plan.schemaModelMap[complete.requestSchemaRef]?.secretFields).toEqual(['credential']);
    expect(plan.schemaModelMap[complete.responseSchemaRef]?.requiredFields).toEqual(['session_ref', 'actor_ref', 'tenant_ref', 'expires_at']);
    for (const ref of [begin.requestSchemaRef, complete.requestSchemaRef, complete.responseSchemaRef]) {
      const model = plan.schemaModelMap[ref];
      expect([...(model?.requiredFields ?? []), ...(model?.optionalFields ?? [])]).not.toContain('browser_binding');
      expect([...(model?.requiredFields ?? []), ...(model?.optionalFields ?? [])]).not.toContain('access_token');
    }
    const errorCatalog = await loadErrorCodeCatalog(process.cwd());
    expect(errorCatalog.entries.find(entry => entry.code === 'authentication_unavailable')).toMatchObject({ httpStatus: 503, retryable: false });
    const openapi = await buildOpenApi31Document(process.cwd());
    expect(openapi.diagnostics).toEqual([]);
    expect(openapi.ok).toBe(true);
  });

  it('does not extend the retry exception to other mutations or renamed paths', async () => {
    const contracts = await loadApiContracts(process.cwd());
    for (const operationId of ['core.auth.sessions.create', 'core.auth.passkey_login_complete.create']) {
      const result = validateApiContracts({
        ...contracts,
        apiCatalog: {
          ...contracts.apiCatalog,
          routes: contracts.apiCatalog.routes.map(route => route.operationId !== operationId ? route : {
            ...route, idempotency: 'not_required',
            ...(operationId.includes('passkey_login') ? { path: '/v1/auth/passkey/login/other' } : {})
          })
        }
      });
      expect(result.diagnostics.map(entry => entry.code)).toContain('API_CATALOG_ROUTE_MUTATION_IDEMPOTENCY_NOT_REQUIRED');
    }
  });
});
