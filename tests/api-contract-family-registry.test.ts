import { describe, expect, it } from 'bun:test';
import { fileURLToPath } from 'node:url';
import {
  API_CONTRACT_FAMILY_KEYS,
  API_CONTRACT_FAMILY_REGISTRY,
  apiContractFamilySourcesForExport,
  listApiSchemaBundleSourcePaths,
  validateApiContractFamilyRegistry
} from '../src/api-contracts/family-registry';
import { loadApiContracts as loadLegacyApiContracts } from '../src/api-contracts/parser';
import { loadApiContracts } from '../src/api-contracts/registry-loader';
import {
  validateApiContractValidationRegistry,
  validateApiContracts
} from '../src/api-contracts/registry-validator';
import { validateApiContracts as validateLegacyApiContracts } from '../src/api-contracts/validator';
import { buildApiExportPlan as buildLegacyApiExportPlan } from '../src/api-export-plan/plan';
import { buildApiExportPlan } from '../src/api-export-plan/registry-plan';

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));

describe('api contract family registry', () => {
  it('keeps singleton families complete, ordered, and uniquely owned', () => {
    expect(
      API_CONTRACT_FAMILY_REGISTRY.map((registration) => registration.key)
    ).toEqual([...API_CONTRACT_FAMILY_KEYS]);
    expect(validateApiContractFamilyRegistry()).toEqual([]);
    expect(validateApiContractValidationRegistry()).toEqual([]);
  });

  it('rejects duplicate family keys and source ownership', () => {
    const diagnostics = validateApiContractFamilyRegistry([
      API_CONTRACT_FAMILY_REGISTRY[0],
      API_CONTRACT_FAMILY_REGISTRY[0],
      ...API_CONTRACT_FAMILY_REGISTRY.slice(1)
    ]);
    const codes = diagnostics.map((diagnostic) => diagnostic.code);

    expect(codes).toContain('API_CONTRACT_FAMILY_KEY_DUPLICATE');
    expect(codes).toContain('API_CONTRACT_FAMILY_SOURCE_DUPLICATE');
  });

  it('loads the same committed contract graph as the compatibility loader', async () => {
    const [registeredContracts, legacyContracts] = await Promise.all([
      loadApiContracts(repositoryRoot),
      loadLegacyApiContracts(repositoryRoot)
    ]);

    expect(registeredContracts).toEqual(legacyContracts);
    expect(
      registeredContracts.schemaBundles.map((bundle) => bundle.file)
    ).toEqual(listApiSchemaBundleSourcePaths(registeredContracts.apiCatalog));
  });

  it('preserves validation and export plan behavior behind registry entrypoints', async () => {
    const contracts = await loadApiContracts(repositoryRoot);

    expect(validateApiContracts(contracts)).toEqual(
      validateLegacyApiContracts(contracts)
    );
    expect(buildApiExportPlan(contracts)).toEqual(
      buildLegacyApiExportPlan(contracts)
    );

    const plan = buildApiExportPlan(contracts).plan;
    expect(plan).not.toBeNull();
    for (const output of plan?.outputs ?? []) {
      expect(output.sourceContracts).toEqual(
        expect.arrayContaining([
          ...apiContractFamilySourcesForExport(output.kind)
        ])
      );
    }
  });
});
