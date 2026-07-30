import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

interface PackageManifest {
  readonly name: string;
  readonly version: string;
}

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));
const manifest = JSON.parse(
  await readFile(join(repositoryRoot, 'package.json'), 'utf8')
) as PackageManifest;
const requestedSpec = readPackageSpec(process.argv.slice(2)) ??
  `${manifest.name}@${manifest.version}`;
const expectedVersion = parseExpectedVersion(requestedSpec, manifest.name);
const smokeRoot = join(tmpdir(), `zdp-api-contracts-registry-smoke-${process.pid}`);

await rm(smokeRoot, { recursive: true, force: true });
await mkdir(smokeRoot, { recursive: true });

try {
  await writeFile(
    join(smokeRoot, 'package.json'),
    `${JSON.stringify({ name: 'zdp-api-contracts-registry-smoke', private: true, type: 'module' }, null, 2)}\n`,
    'utf8'
  );
  await writeFile(
    join(smokeRoot, 'smoke.mjs'),
    `import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseCalculatorConformanceContract } from 'zdp-api-contracts';
import { loadApiContracts, validateApiContracts } from 'zdp-api-contracts/api-contracts';
import { buildApiExportPlan } from 'zdp-api-contracts/api-export-plan';

const expectedVersion = process.argv[2];
const installedManifest = JSON.parse(
  await readFile(join(process.cwd(), 'node_modules', 'zdp-api-contracts', 'package.json'), 'utf8')
);
if (installedManifest.version !== expectedVersion) {
  throw new Error(\`Expected zdp-api-contracts@\${expectedVersion}, installed \${installedManifest.version}.\`);
}

const contractUrl = import.meta.resolve(
  'zdp-api-contracts/contracts/calculators/conformance.yaml'
);
const source = await readFile(new URL(contractUrl), 'utf8');
const contract = parseCalculatorConformanceContract(source);
if (contract.contractVersion !== '1.0.0' || contract.cases.length < 1) {
  throw new Error('Published calculator conformance contract was not consumable.');
}

const installedPackageRoot = join(process.cwd(), 'node_modules', 'zdp-api-contracts');
const contracts = await loadApiContracts(installedPackageRoot);
const validation = validateApiContracts(contracts);
if (!validation.ok) {
  throw new Error('Published API contract validator subpath was not consumable.');
}

const exportPlan = buildApiExportPlan(contracts);
if (
  !exportPlan.ok ||
  exportPlan.plan === null ||
  exportPlan.plan.writesArtifacts !== false ||
  exportPlan.plan.publishesSchemas !== false
) {
  throw new Error('Published API export plan subpath was not consumable.');
}
console.log(\`zdp-api-contracts@\${expectedVersion} registry consumer smoke passed.\`);
`,
    'utf8'
  );

  await run(
    npmCommand(),
    [
      'install',
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
      '--save-exact',
      requestedSpec
    ],
    smokeRoot
  );
  await run('node', ['smoke.mjs', expectedVersion], smokeRoot);
  await run(npmCommand(), ['audit', 'signatures'], smokeRoot);
} finally {
  await rm(smokeRoot, { recursive: true, force: true });
}

function readPackageSpec(args: readonly string[]): string | undefined {
  if (args.length === 0) {
    return undefined;
  }
  if (args.length !== 2 || args[0] !== '--package-spec' || args[1] === undefined) {
    throw new Error('Usage: bun scripts/smoke-published-package.ts [--package-spec <name@version>]');
  }
  return args[1];
}

function parseExpectedVersion(packageSpec: string, packageName: string): string {
  const prefix = `${packageName}@`;
  if (!packageSpec.startsWith(prefix)) {
    throw new Error(`Package spec must start with ${prefix}.`);
  }
  const version = packageSpec.slice(prefix.length);
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) {
    throw new Error(`Package spec must use an exact semver version, received ${packageSpec}.`);
  }
  return version;
}

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
