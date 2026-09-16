import { describe, expect, it } from 'bun:test';
import { loadApiContracts } from '../src/api-contracts/parser';
import { validateApiContracts } from '../src/api-contracts/validator';

const file = 'contracts/apis/core-api/access-decision.yaml';

describe('Core access decision tenant binding', () => {
  it('requires a Core tenant in the response while forbidding request authority', async () => {
    const contracts = await loadApiContracts();
    expect(validateApiContracts(contracts).ok).toBe(true);
    expect(contracts.accessDecision.requiredResponseBindings).toContain('tenant_ref');
    expect(contracts.accessDecision.forbiddenRequestAuthorityFields).toContain('tenant_ref');
  });

  it('rejects removing tenant from the binding contract even when the schema keeps it', async () => {
    const contracts = await loadApiContracts();
    const result = validateApiContracts({
      ...contracts,
      accessDecision: {
        ...contracts.accessDecision,
        requiredResponseBindings: contracts.accessDecision.requiredResponseBindings.filter(
          (field) => field !== 'tenant_ref'
        )
      }
    });
    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((item) => item.code)).toContain(
      'API_ACCESS_DECISION_RESPONSE_BINDING_MISSING'
    );
  });

  for (const optional of [false, true]) {
    it(`rejects ${optional ? 'optional' : 'missing'} response tenant`, async () => {
      const contracts = await loadApiContracts();
      const result = validateApiContracts({
        ...contracts,
        schemaBundles: contracts.schemaBundles.map((bundle) => bundle.file !== file ? bundle : {
          ...bundle,
          schemas: bundle.schemas.map((schema) => schema.id !== 'AccessAuthorizationDecisionCreateResponse' ? schema : {
            ...schema,
            requiredFields: schema.requiredFields.filter((field) => field !== 'tenant_ref'),
            optionalFields: optional ? [...schema.optionalFields, 'tenant_ref'] : schema.optionalFields
          })
        })
      });
      expect(result.ok).toBe(false);
      expect(result.diagnostics.map((item) => item.code)).toContain(
        'API_ACCESS_DECISION_RESPONSE_SCHEMA_BINDING_MISSING'
      );
    });
  }

  it('rejects adding tenant authority to the request', async () => {
    const contracts = await loadApiContracts();
    const result = validateApiContracts({
      ...contracts,
      schemaBundles: contracts.schemaBundles.map((bundle) => bundle.file !== file ? bundle : {
        ...bundle,
        schemas: bundle.schemas.map((schema) => schema.id !== 'AccessAuthorizationDecisionCreateRequest' ? schema : {
          ...schema,
          optionalFields: [...schema.optionalFields, 'tenant_ref']
        })
      })
    });
    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((item) => item.code)).toContain(
      'API_ACCESS_DECISION_REQUEST_TRUSTS_AUTHORITY_FIELD'
    );
  });
});
