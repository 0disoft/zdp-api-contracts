import {
  mkdir,
  readdir,
  rm,
  writeFile
} from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));
const smokeRoot = join(repositoryRoot, '.tmp', 'package-smoke');
const packageRoot = join(smokeRoot, 'package');
const consumerRoot = join(smokeRoot, 'consumer');

await rm(smokeRoot, { recursive: true, force: true });
await mkdir(packageRoot, { recursive: true });
await run(npmCommand(), [
  'pack',
  '--json',
  '--pack-destination',
  packageRoot
], repositoryRoot);

const tarballs = (await readdir(packageRoot)).filter((file) => file.endsWith('.tgz'));
if (tarballs.length !== 1 || tarballs[0] === undefined) {
  throw new Error(`Expected exactly one package tarball, found ${tarballs.length}.`);
}

await mkdir(consumerRoot, { recursive: true });
await writeFile(
  join(consumerRoot, 'package.json'),
  `${JSON.stringify({ name: 'zdp-api-contracts-smoke', private: true, type: 'module' }, null, 2)}\n`,
  'utf8'
);
await writeFile(
  join(consumerRoot, 'smoke.mjs'),
  `import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { parseCalculatorConformanceContract } from 'zdp-api-contracts';
import { loadApiContracts, validateApiContracts } from 'zdp-api-contracts/api-contracts';
import { buildApiExportPlan } from 'zdp-api-contracts/api-export-plan';

const contractUrl = import.meta.resolve(
  'zdp-api-contracts/contracts/calculators/conformance.yaml'
);
const source = await readFile(new URL(contractUrl), 'utf8');
const contract = parseCalculatorConformanceContract(source);
if (contract.contractVersion !== '1.0.0' || contract.cases.length < 1) {
  throw new Error('Calculator conformance contract was not consumable.');
}

const installedPackageRoot = fileURLToPath(new URL('../../', contractUrl));
const contracts = await loadApiContracts(installedPackageRoot);
const validation = validateApiContracts(contracts);
if (!validation.ok) {
  throw new Error('API contract validator subpath was not consumable.');
}

const exportPlan = buildApiExportPlan(contracts);
if (
  !exportPlan.ok ||
  exportPlan.plan === null ||
  exportPlan.plan.writesArtifacts !== false ||
  exportPlan.plan.publishesSchemas !== false
) {
  throw new Error('API export plan subpath was not consumable.');
}
console.log('zdp-api-contracts tarball smoke passed.');
`,
  'utf8'
);

const tarball = join(packageRoot, tarballs[0]);
await run(
  npmCommand(),
  [
    'install',
    '--ignore-scripts',
    '--no-audit',
    '--no-fund',
    '--package-lock=false',
    tarball
  ],
  consumerRoot
);
await run('node', ['smoke.mjs'], consumerRoot);

function npmCommand(): string {
  return process.platform === 'win32' ? 'npm.cmd' : 'npm';
}

async function run(
  command: string,
  args: readonly string[],
  cwd: string
): Promise<void> {
  const processHandle = Bun.spawn([command, ...args], {
    cwd,
    stdin: 'ignore',
    stdout: 'inherit',
    stderr: 'inherit'
  });
  const exitCode = await processHandle.exited;
  if (exitCode !== 0) {
    throw new Error(`${command} failed with exit code ${exitCode}.`);
  }
}
