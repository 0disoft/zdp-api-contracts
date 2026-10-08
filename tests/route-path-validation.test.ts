import { expect, test } from 'bun:test';
import { loadApiContracts } from '../src/api-contracts/registry-loader';
import { validateApiContracts } from '../src/api-contracts/validator';

test('rejects route paths with queries, fragments, whitespace or malformed template braces', async () => {
  const base = await loadApiContracts();
  const route = base.apiCatalog.routes[0]!;
  for (const path of ['/v1/items?limit=1', '/v1/items#details', '/v1/items\n', '/v1/item list',
    '/v1/items/{id', '/v1/items/id}', '/v1/items/{}', '/v1/items/{nested{id}}']) {
    const result = validateApiContracts({ ...base, apiCatalog: { ...base.apiCatalog,
      routes: base.apiCatalog.routes.map(candidate => candidate === route ? { ...route, path } : candidate) } });
    expect(result.diagnostics).toContainEqual(expect.objectContaining({ code: 'API_CATALOG_ROUTE_PATH_INVALID' }));
  }
  for (const path of ['/v1/items/{id}', '/v1/items', '/v1/item%20list']) {
    const result = validateApiContracts({ ...base, apiCatalog: { ...base.apiCatalog,
      routes: base.apiCatalog.routes.map(candidate => candidate === route ? { ...route, path } : candidate) } });
    expect(result.diagnostics.some(item => item.code === 'API_CATALOG_ROUTE_PATH_INVALID')).toBe(false);
  }
});
