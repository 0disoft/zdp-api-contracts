import { describe, expect, it } from 'bun:test';
import { fileURLToPath } from 'node:url';
import { cp, mkdir, mkdtemp, rename, rm, symlink } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  API_CONTRACT_FAMILY_KEYS,
  API_CONTRACT_FAMILY_REGISTRY,
  apiContractFamilySourcesForExport,
  listApiSchemaBundleSourcePaths,
  validateApiContractFamilyRegistry
} from '../src/api-contracts/family-registry';
import { loadApiContracts as loadStrictApiContracts } from '../src/api-contracts/strict-parser';
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
  it('rejects links to repository-external families and catalog-discovered schema bundles', async () => {
    const root = await mkdtemp(join(tmpdir(), 'zdp-contract-links-'));
    try {
      for (const sourcePath of ['contracts', 'contracts/apis/support-api']) {
        const checkout = join(root, sourcePath === 'contracts' ? 'families' : 'schemas');
        await mkdir(checkout);
        await cp(join(repositoryRoot, 'contracts'), join(checkout, 'contracts'), { recursive: true });
        const original = join(checkout, sourcePath);
        const external = join(root, sourcePath === 'contracts' ? 'external-families' : 'external-schemas');
        await rename(original, external);
        await symlink(external, original, process.platform === 'win32' ? 'junction' : 'dir');
        await expect(loadApiContracts(checkout)).rejects.toThrow('repository root');
      }
    } finally { await rm(root, { recursive: true, force: true }); }
  }, 15_000);

  it('allows contract links that resolve within the repository', async () => {
    const root = await mkdtemp(join(tmpdir(), 'zdp-contract-internal-link-'));
    try {
      const target = join(root, 'local-contracts');
      await cp(join(repositoryRoot, 'contracts'), target, { recursive: true });
      await symlink(target, join(root, 'contracts'), process.platform === 'win32' ? 'junction' : 'dir');
      expect((await loadApiContracts(root)).schemaBundles.length).toBeGreaterThan(0);
    } finally { await rm(root, { recursive: true, force: true }); }
  }, 15_000);

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

  it('loads the same committed contract graph as the strict loader', async () => {
    const [registeredContracts, strictContracts] = await Promise.all([
      loadApiContracts(repositoryRoot),
      loadStrictApiContracts(repositoryRoot)
    ]);

    expect(registeredContracts).toEqual(strictContracts);
    expect(
      registeredContracts.schemaBundles.map((bundle) => bundle.file)
    ).toEqual([
      ...listApiSchemaBundleSourcePaths(registeredContracts.apiCatalog)
    ]);
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
