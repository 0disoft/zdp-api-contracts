import { expect, test } from 'bun:test';
import { execFileSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
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

test('failed baseline reads finish pending writes before removing their temporary directory', async () => {
  const root = await mkdtemp(join(tmpdir(), 'contract-compatibility-failure-'));
  try {
    await mkdir(join(root, 'scripts/lib'), { recursive: true });
    await mkdir(join(root, 'src/api-contracts'), { recursive: true });
    await mkdir(join(root, '.tmp/contract-compatibility'), { recursive: true });
    await writeFile(join(root, '.tmp/contract-compatibility/other-run.txt'), 'preserved');
    const source = await readFile('scripts/check-contract-compatibility.ts', 'utf8');
    expect(source).toContain("from 'node:child_process'");
    await writeFile(join(root, 'scripts/check-contract-compatibility.ts'),
      source.replace("from 'node:child_process'", "from '../git-failure'"));
    await writeFile(join(root, 'scripts/lib/contract-compatibility.ts'),
      'export const compareApiContracts = () => {}; export const evaluateApiContractVersionGate = () => {};');
    await writeFile(join(root, 'src/api-contracts/registry-loader.ts'),
      'export const loadApiContracts = async () => { throw Error("Unexpected contract load"); };');
    // Substitute only the Git process port; exercise real mkdir/write/cleanup.
    await writeFile(join(root, 'git-failure.ts'), String.raw`
      import { promisify } from 'node:util';
      export const execFile = () => {};
      execFile[promisify.custom] = async (_command, args) => {
        if (args[0] === 'ls-tree') return { stdout: 'contracts/failed.yaml\0contracts/delayed.yaml\0' };
        if (args[1].endsWith('failed.yaml')) throw Error('Injected baseline read failure');
        await new Promise(resolve => setTimeout(resolve, 750));
        return { stdout: 'delayed contract content' };
      };
    `);
    const child = Bun.spawn([process.execPath,
      join(root, 'scripts/check-contract-compatibility.ts'), '--base-ref', 'fixture'],
      { cwd: root, stdout: 'pipe', stderr: 'pipe' });
    const [stdout, stderr, exit] = await Promise.all([
      new Response(child.stdout).text(), new Response(child.stderr).text(), child.exited
    ]);
    expect(exit).toBe(1);
    expect(stdout).toBe('');
    expect(stderr).toContain('Injected baseline read failure');
    expect(await readdir(join(root, '.tmp/contract-compatibility'))).toEqual(['other-run.txt']);
    expect(await readFile(join(root, '.tmp/contract-compatibility/other-run.txt'), 'utf8')).toBe('preserved');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}, 15_000);

test('materializes baseline contract filenames without Git path quoting', async () => {
  const root = await mkdtemp(join(tmpdir(), 'contract-compatibility-unicode-'));
  try {
    await mkdir(join(root, 'scripts/lib'), { recursive: true });
    await mkdir(join(root, 'src/api-contracts'), { recursive: true });
    await mkdir(join(root, 'contracts'), { recursive: true });
    await copyFile('scripts/check-contract-compatibility.ts', join(root, 'scripts/check-contract-compatibility.ts'));
    await writeFile(join(root, 'scripts/lib/contract-compatibility.ts'),
      'export const compareApiContracts = () => ({level:"none",changes:[]}); ' +
      'export const evaluateApiContractVersionGate = () => ({ok:true,migrationPath:null});');
    await writeFile(join(root, 'src/api-contracts/registry-loader.ts'),
      'import {readFile} from "node:fs/promises"; import {join} from "node:path"; ' +
      'export const loadApiContracts = async root => { ' +
      'for (const file of ["한글 계약.md", "space name.yaml"]) ' +
      'if (await readFile(join(root,"contracts",file),"utf8") !== "preserved") throw Error("Changed contract"); ' +
      'return {}; };');
    await writeFile(join(root, 'package.json'), JSON.stringify({ version: '0.51.1' }));
    for (const file of ['한글 계약.md', 'space name.yaml']) await writeFile(join(root, 'contracts', file), 'preserved');
    const git = (...args: string[]) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
    git('init', '--quiet');
    git('config', 'core.quotePath', 'true');
    git('add', '--', 'contracts', 'package.json');
    const baseline = git('write-tree');
    const child = Bun.spawn([process.execPath, join(root, 'scripts/check-contract-compatibility.ts'), '--base-ref', baseline, '--json'],
      { cwd: root, stdout: 'pipe', stderr: 'pipe' });
    const [stdout, stderr, exit] = await Promise.all([
      new Response(child.stdout).text(), new Response(child.stderr).text(), child.exited
    ]);
    expect(stderr).toBe('');
    expect(exit).toBe(0);
    expect(JSON.parse(stdout).gate.ok).toBe(true);
    expect(JSON.parse(stdout).report.level).toBe('none');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}, 15_000);
