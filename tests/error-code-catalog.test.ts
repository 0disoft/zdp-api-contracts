import { describe, expect, it } from 'bun:test';
import { fileURLToPath } from 'node:url';
import {
  loadErrorCodeCatalog,
  parseErrorCodeCatalog,
  validateErrorCodeCatalog
} from '../src/api-contracts/error-code-catalog';
import { loadApiContracts } from '../src/api-contracts/parser';
import type {
  ErrorCodeCatalogContract,
  ErrorCodeCatalogEntry
} from '../src/api-contracts/error-code-catalog';

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));

describe('error code catalog', () => {
  it('covers every committed route error with valid metadata', async () => {
    const [contracts, catalog] = await Promise.all([
      loadApiContracts(repositoryRoot),
      loadErrorCodeCatalog(repositoryRoot)
    ]);

    const result = validateErrorCodeCatalog(catalog, contracts);

    expect(catalog.entries.length).toBeGreaterThan(0);
    expect(contracts.sdkGenerationInput.sourceContracts).toContain(
      'contracts/error-code-catalog.yaml'
    );
    expect(contracts.sdkGenerationInput.requiredErrorMetadata).toEqual(
      expect.arrayContaining([
        'http_status',
        'retryable',
        'user_visible',
        'localization_key',
        'owner_service_id',
        'lifecycle_status'
      ])
    );
    expect(result.diagnostics).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it('rejects an unregistered route error code', async () => {
    const [contracts, catalog] = await Promise.all([
      loadApiContracts(repositoryRoot),
      loadErrorCodeCatalog(repositoryRoot)
    ]);
    const route = contracts.apiCatalog.routes[0];
    if (route === undefined) {
      throw new Error('Expected at least one committed API route.');
    }
    const routeErrorCode = route.errorCodes[0];
    if (routeErrorCode === undefined) {
      throw new Error('Expected the first committed API route to declare an error code.');
    }

    const result = validateErrorCodeCatalog(
      {
        ...catalog,
        entries: catalog.entries.filter((entry) => entry.code !== routeErrorCode)
      },
      contracts
    );

    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_ROUTE_ERROR_CODE_UNREGISTERED'
    );
  });

  it('rejects owner drift and retired route errors', async () => {
    const [contracts, catalog] = await Promise.all([
      loadApiContracts(repositoryRoot),
      loadErrorCodeCatalog(repositoryRoot)
    ]);
    const original = requiredEntry(catalog, 'support_intake_unavailable');
    const changed = replaceEntry(catalog, {
      ...original,
      ownerServiceId: 'core-api',
      lifecycleStatus: 'retired'
    });

    const result = validateErrorCodeCatalog(changed, contracts);
    const diagnosticCodes = result.diagnostics.map(
      (diagnostic) => diagnostic.code
    );

    expect(diagnosticCodes).toContain('API_ROUTE_ERROR_CODE_OWNER_MISMATCH');
    expect(diagnosticCodes).toContain('API_ROUTE_ERROR_CODE_RETIRED');
  });

  it('rejects unknown fields and malformed localization metadata', async () => {
    expect(() =>
      parseErrorCodeCatalog(`error_code_catalog:
  schema_version: 1
  status: active
  defaults:
    retryable: false
    user_visible: true
    localization_key_prefix: api.errors.
    lifecycle_status: active
  entries:
    - code: validation_failed
      http_status: 400
      owner_service_id: shared
      undocumented_field: true
`)
    ).toThrow('must not declare unknown field `undocumented_field`');

    const [contracts, catalog] = await Promise.all([
      loadApiContracts(repositoryRoot),
      loadErrorCodeCatalog(repositoryRoot)
    ]);
  const original = requiredEntry(catalog, 'validation_failed');
    const result = validateErrorCodeCatalog(
      replaceEntry(catalog, {
        ...original,
        localizationKey: 'errors.validation'
      }),
      contracts
    );

    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_ERROR_CODE_LOCALIZATION_KEY_INVALID'
    );
  });
});

function requiredEntry(
  catalog: ErrorCodeCatalogContract,
  code: string
): ErrorCodeCatalogEntry {
  const entry = catalog.entries.find((candidate) => candidate.code === code);
  if (entry === undefined) {
    throw new Error(`Expected committed error code catalog entry \`${code}\`.`);
  }
  return entry;
}

function replaceEntry(
  catalog: ErrorCodeCatalogContract,
  replacement: ErrorCodeCatalogEntry
): ErrorCodeCatalogContract {
  return {
    ...catalog,
    entries: catalog.entries.map((entry) =>
      entry.code === replacement.code ? replacement : entry
   )
  };
}
