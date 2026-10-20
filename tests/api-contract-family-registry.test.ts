import { describe, expect, it } from 'bun:test';
import { fileURLToPath } from 'node:url';
import { cp, mkdir, mkdtemp, readFile, rename, rm, symlink, writeFile } from 'node:fs/promises';
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
import { ApiContractLoadError } from '../src/api-contracts/parser';
import { runApiContractCheckCli } from '../src/api-contracts/cli';
import {
  validateApiContractValidationRegistry,
  validateApiContracts
} from '../src/api-contracts/registry-validator';
import { validateApiContracts as validateLegacyApiContracts } from '../src/api-contracts/validator';
import { buildApiExportPlan as buildLegacyApiExportPlan } from '../src/api-export-plan/plan';
import { buildApiExportPlan } from '../src/api-export-plan/registry-plan';

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));

describe('api contract family registry', () => {
  it('attributes schema discovery failures to the registered catalog in loaders and CLI reports', async () => {
    const root = await mkdtemp(join(tmpdir(), 'zdp-schema-discovery-'));
    try {
      await cp(join(repositoryRoot, 'contracts'), join(root, 'contracts'), { recursive: true });
      const source = await readFile(join(root, 'contracts/apis/catalog.yaml'), 'utf8');
      const invalid = source.replace(
        'request_schema_ref: contracts/apis/support-api/intake.yaml#SupportCaseCreateRequest',
        'request_schema_ref: invalid-ref'
      );
      expect(invalid).not.toBe(source);
      for (const file of ['contracts/apis/catalog.yaml', 'contracts/apis/custom-catalog.yaml']) {
        await writeFile(join(root, file), invalid);
        const registrations = API_CONTRACT_FAMILY_REGISTRY.map((registration) =>
          registration.key === 'apiCatalog' ? { ...registration, sourcePath: file } : registration
        );
        const error = await loadApiContracts(root, registrations).catch((failure: unknown) => failure);
        expect(error).toBeInstanceOf(ApiContractLoadError);
        if (!(error instanceof ApiContractLoadError)) throw error;
        expect(error.failures).toHaveLength(1);
        expect(error.failures[0]).toMatchObject({ name: 'api-catalog', file });
        expect(error.failures[0]?.message).toContain('Schema ref `invalid-ref`');
      }
      let stdout = '';
      const exitCode = await runApiContractCheckCli(['--root', root, '--json'], {
        cwd: repositoryRoot, writeStdout: (text) => { stdout += text; }, writeStderr: () => {}
      });
      expect(exitCode).toBe(1);
      expect(JSON.parse(stdout).contractValidation.diagnostics).toContainEqual(expect.objectContaining({
        code: 'API_CONTRACT_LOAD_FAILED', file: 'contracts/apis/catalog.yaml',
        message: expect.stringContaining('Schema ref `invalid-ref`')
      }));
    } finally { await rm(root, { recursive: true, force: true }); }
  });

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
