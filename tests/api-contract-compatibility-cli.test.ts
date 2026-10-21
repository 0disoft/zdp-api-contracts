import { expect, test } from 'bun:test';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('invalid baseline refs preserve other temporary files', async () => {
  const root = await mkdtemp(join(tmpdir(), 'contract-compatibility-cli-'));
  try {
    await mkdir(join(root, 'scripts/lib'), { recursive: true });
    await mkdir(join(root, 'src/api-contracts'), { recursive: true });
    await copyFile('scripts/check-contract-compatibility.ts', join(root, 'scripts/check-contract-compatibility.ts'));
    // Isolate CLI filesystem handling from unrelated contract parsing.
    await writeFile(join(root, 'scripts/lib/contract-compatibility.ts'),
      'export const compareApiContracts = () => {}; export const evaluateApiContractVersionGate = () => {};');
    await writeFile(join(root, 'src/api-contracts/registry-loader.ts'),
      'export const loadApiContracts = async () => { throw Error("Unexpected contract load"); };');
    for (const ref of ['..', '.', 'missing-baseline']) {
      await mkdir(join(root, '.tmp/contract-compatibility'), { recursive: true });
      const markers = [join(root, '.tmp/other-task.txt'), join(root, '.tmp/contract-compatibility/other-run.txt')];
      for (const marker of markers) await writeFile(marker, 'preserved');
      const child = Bun.spawn([process.execPath, join(root, 'scripts/check-contract-compatibility.ts'), '--base-ref', ref],
        { cwd: root, stdout: 'pipe', stderr: 'pipe' });
      const [stdout, stderr, exit] = await Promise.all([
        new Response(child.stdout).text(), new Response(child.stderr).text(), child.exited
      ]);
      expect(exit).toBe(1);
      expect(stdout).toBe('');
      expect(stderr).toContain('API contract compatibility check failed.');
      for (const marker of markers) expect(await readFile(marker, 'utf8')).toBe('preserved');
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}, 15_000);
