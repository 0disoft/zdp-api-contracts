import { expect, test } from 'bun:test';
import { cp, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runApiContractCheckCli } from '../src/api-contracts/cli';
import { ERROR_CODE_CATALOG_FILE, loadErrorCodeCatalog, parseErrorCodeCatalog } from '../src/api-contracts/error-code-catalog';
import { ApiContractLoadError } from '../src/api-contracts/parser';

const cases = [
  { name: 'missing file', source: null },
  { name: 'malformed YAML', source: 'error_code_catalog:\n  entries: [\n' },
  { name: 'invalid catalog shape', source: 'error_code_catalog: []\n' }
] as const;

test('catalog loader rejects repository-external links and permits repository-internal links', async () => {
  const fixture = await mkdtemp(join(tmpdir(), 'zdp-error-catalog-links-'));
  try {
    const source = await readFile(ERROR_CODE_CATALOG_FILE, 'utf8');
    const checkout = join(fixture, 'checkout');
    const external = join(fixture, 'external-contracts');
    const internal = join(checkout, 'local-contracts');
    await mkdir(internal, { recursive: true });
    await mkdir(external);
    await writeFile(join(external, 'error-code-catalog.yaml'), source);
    await writeFile(join(internal, 'error-code-catalog.yaml'), source);
    const link = join(checkout, 'contracts');
    const linkType = process.platform === 'win32' ? 'junction' : 'dir';

    await symlink(external, link, linkType);
    await expect(loadErrorCodeCatalog(checkout)).rejects.toThrow('repository root');
    await rm(link, { recursive: true });
    await symlink(internal, link, linkType);
    expect((await loadErrorCodeCatalog(checkout)).entries.length).toBeGreaterThan(0);
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});

for (const { name, source } of cases) {
  test(`catalog load diagnostics identify the file and preserve the cause for ${name}`, async () => {
    const root = await mkdtemp(join(tmpdir(), 'zdp-error-catalog-load-'));
    try {
      await cp(join(process.cwd(), 'contracts'), join(root, 'contracts'), { recursive: true });
      const file = join(root, ERROR_CODE_CATALOG_FILE);
      let expectedMessage = 'ENOENT';
      if (source === null) {
        await rm(file);
      } else {
        await writeFile(file, source);
        try {
          parseErrorCodeCatalog(source);
          throw new Error('Expected invalid catalog fixture.');
        } catch (error) {
          expectedMessage = (error as Error).message;
        }
      }

      let stdout = '';
      let stderr = '';
      const exitCode = await runApiContractCheckCli(['--root', root, '--json'], {
        cwd: process.cwd(),
        writeStdout: (text) => { stdout += text; },
        writeStderr: (text) => { stderr += text; }
      });
      const report = JSON.parse(stdout);

      expect(exitCode).toBe(1);
      expect(stderr).toBe('');
      expect(report.contractValidation.diagnostics).toHaveLength(1);
      expect(report.contractValidation.diagnostics[0]).toMatchObject({
        code: 'API_CONTRACT_LOAD_FAILED', file: ERROR_CODE_CATALOG_FILE, path: '$'
      });
      expect(report.contractValidation.diagnostics[0].message).toContain(expectedMessage);

      const error = await loadErrorCodeCatalog(root).catch((failure: unknown) => failure);
      expect(error).toBeInstanceOf(ApiContractLoadError);
      if (!(error instanceof ApiContractLoadError)) throw new Error('Expected structured load failure.');
      expect(error.failures).toHaveLength(1);
      expect(error.failures[0]).toMatchObject({ name: 'error-code-catalog', file: ERROR_CODE_CATALOG_FILE });
      expect(error.failures[0]?.message).toContain(expectedMessage);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
}
