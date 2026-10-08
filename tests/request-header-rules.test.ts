import { expect, test } from 'bun:test';
import { loadApiContracts } from '../src/api-contracts/registry-loader';
import { buildOpenApi31Document } from '../src/api-export-plan/openapi';
import { buildApiExportPlan } from '../src/api-export-plan/registry-plan';
import { compareApiContracts } from '../scripts/lib/contract-compatibility';
import { parseRequestHeaders } from '../src/api-contracts/parsers/request-headers';

test('exports conditional consent to OpenAPI and typed SDK without making clear requests require it', async () => {
  const contracts = await loadApiContracts();
  const result = await buildOpenApi31Document(process.cwd(), { includeRestrictedRoutes: true });
  const operation = result.document?.paths['/v1/account-settings/preferences']?.post;
  expect(operation?.parameters).toContainEqual({ name: 'x-zdp-profile-consent', in: 'header', required: false,
    schema: { type: 'string', const: 'account-optional-profile-v1' },
    'x-zdp-required-when': { any_nonempty_fields: ['birth_year', 'interests'] } });
  const plan = buildApiExportPlan(contracts);
  expect(plan.plan?.typedFetchOperationMap['core.account.preferences.update']?.requestHeaders).toEqual([
    { name: 'x-zdp-profile-consent', value: 'account-optional-profile-v1', requiredWhen: { anyNonemptyFields: ['birth_year', 'interests'] } }
  ]);
  const old = structuredClone(contracts);
  const schema = old.schemaBundles.flatMap(bundle => bundle.schemas).find(schema => schema.id === 'AccountPreferencesUpdateRequest')!;
  Object.assign(schema, { requestHeaders: undefined });
  expect(compareApiContracts(old, contracts).changes).toContainEqual(expect.objectContaining({ code: 'API_COMPAT_REQUEST_HEADER_CHANGED', level: 'breaking' }));
});

test('rejects ambiguous and undeclared header rules', () => {
  const rule = { name: 'x-zdp-consent', value: 'v1', required_when: { any_nonempty_fields: ['birth_year'] } };
  for (const rules of [[{ ...rule, name: 'authorization' }], [{ ...rule, value: 'v1\r\nInjected: yes' }],
    [rule, rule], [{ ...rule, extra: true }], [{ ...rule, required_when: { any_nonempty_fields: ['unknown'] } }]]) {
    expect(() => parseRequestHeaders(rules, ['birth_year'], 'fixture')).toThrow();
  }
});
