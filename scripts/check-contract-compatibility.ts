import { execFile } from 'node:child_process';
import {
  mkdir,
  readFile,
  rm,
  writeFile
} from 'node:fs/promises';
import { dirname, isAbsolute, join, normalize, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import {
  compareApiContracts,
  evaluateApiContractVersionGate,
  type ApiContractCompatibilityReport,
  type ApiContractMigrationDocument
} from './lib/contract-compatibility';
import { loadApiContracts } from '../src/api-contracts/registry-loader';

const execFileAsync = promisify(execFile);
const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));

const exitCode = await run(process.argv.slice(2));
process.exitCode = exitCode;

async function run(argv: readonly string[]): Promise<number> {
  const options = parseOptions(argv);
  if (options.help) {
    printHelp();
    return 0;
  }

  const temporaryRoot = join(
    repositoryRoot,
    '.tmp',
    'contract-compatibility',
    safeDirectoryName(options.baseRef)
  );

  try {
    await materializeContractsAtRef(options.baseRef, temporaryRoot);
    const [headContracts, basePackageSource, headPackageSource] =
      await Promise.all([
        loadApiContracts(repositoryRoot),
        gitText(['show', `${options.baseRef}:package.json`]),
        readFile(join(repositoryRoot, 'package.json'), 'utf8')
      ]);

    const baseVersion = packageVersion(basePackageSource, options.baseRef);
    const headVersion = packageVersion(headPackageSource, 'working tree');
    const report = await compareAgainstMaterializedBase(
      options.baseRef,
      temporaryRoot,
      headContracts
    );
    const preliminaryGate = evaluateApiContractVersionGate({
      baseVersion,
      headVersion,
      report
    });
    const migrationDocument =
      preliminaryGate.migrationPath === null
        ? null
        : await readMigrationDocument(preliminaryGate.migrationPath);
    const gate =
      preliminaryGate.migrationPath === null
        ? preliminaryGate
        : evaluateApiContractVersionGate({
            baseVersion,
            headVersion,
            report,
            migrationDocument
          });

    if (options.json) {
      console.log(
        JSON.stringify(
          {
            baseRef: options.baseRef,
            report,
            gate
          },
          null,
          2
        )
      );
    } else {
      printHumanReport(options.baseRef, report, gate);
    }

    return gate.ok ? 0 : 1;
  } catch (error) {
    console.error('API contract compatibility check failed.');
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}

async function compareAgainstMaterializedBase(
  baseRef: string,
  temporaryRoot: string,
  headContracts: Awaited<ReturnType<typeof loadApiContracts>>
): Promise<ApiContractCompatibilityReport> {
  try {
    const baseContracts = await loadApiContracts(temporaryRoot);
    return compareApiContracts(baseContracts, headContracts);
  } catch (error) {
    return {
      level: 'breaking',
      changes: [
        {
          level: 'breaking',
          code: 'API_COMPAT_BASELINE_CONTRACT_UNREADABLE',
          path: 'contracts/',
          message:
            `Current parser cannot read base ref \`${baseRef}\`: ` +
            (error instanceof Error ? error.message : String(error))
        }
      ]
    };
  }
}

async function materializeContractsAtRef(
  baseRef: string,
  destinationRoot: string
): Promise<void> {
  await rm(destinationRoot, { recursive: true, force: true });
  const listing = await gitText([
    'ls-tree',
    '-r',
    '--name-only',
    baseRef,
    '--',
    'contracts'
  ]);
  const contractFiles = listing
    .split(/\r?\n/u)
    .map((path) => path.trim())
    .filter((path) => path.length > 0);

  if (contractFiles.length === 0) {
    throw new Error(`Base ref \`${baseRef}\` does not contain contracts/.`);
  }

  await Promise.all(
    contractFiles.map(async (path) => {
      assertSafeContractPath(path);
      const content = await gitText(['show', `${baseRef}:${path}`]);
      const destination = join(destinationRoot, path);
      await mkdir(dirname(destination), { recursive: true });
      await writeFile(destination, content, 'utf8');
    })
  );
}

async function readMigrationDocument(
  path: string
): Promise<ApiContractMigrationDocument | null> {
  try {
    return {
      path,
      content: await readFile(join(repositoryRoot, path), 'utf8')
    };
  } catch (error) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

async function gitText(args: readonly string[]): Promise<string> {
  const result = await execFileAsync('git', args, {
    cwd: repositoryRoot,
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024
  });
  return String(result.stdout);
}

function packageVersion(source: string, label: string): string {
  const manifest = JSON.parse(source) as { readonly version?: unknown };
  if (typeof manifest.version !== 'string' || manifest.version.length === 0) {
    throw new Error(`${label} package.json must declare a string version.`);
  }
  return manifest.version;
}

function assertSafeContractPath(path: string): void {
  const normalized = normalize(path);
  const relativePath = relative('contracts', normalized);
  if (
    isAbsolute(normalized) ||
    normalized === 'contracts' ||
    relativePath.startsWith('..') ||
    relativePath.includes(':')
  ) {
    throw new Error(`Unsafe contract path returned by git: \`${path}\`.`);
  }
}

function safeDirectoryName(value: string): string {
  return value.replaceAll(/[^A-Za-z0-9._-]/gu, '_').slice(0, 120) || 'base';
}

function parseOptions(argv: readonly string[]): {
  readonly baseRef: string;
  readonly json: boolean;
  readonly help: boolean;
} {
  let baseRef = process.env.API_CONTRACT_BASE_REF ?? 'origin/main';
  let json = false;
  let help = false;

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--json') {
      json = true;
      continue;
    }
    if (argument === '--help' || argument === '-h') {
      help = true;
      continue;
    }
    if (argument === '--base-ref') {
      const value = argv[index + 1];
      if (value === undefined || value.length === 0) {
        throw new Error('--base-ref requires a git ref or commit SHA.');
      }
      baseRef = value;
      index += 1;
      continue;
    }
    if (argument?.startsWith('--base-ref=')) {
      const value = argument.slice('--base-ref='.length);
      if (value.length === 0) {
        throw new Error('--base-ref requires a git ref or commit SHA.');
      }
      baseRef = value;
      continue;
    }
    throw new Error(`Unknown argument \`${argument}\`.`);
  }

  return { baseRef, json, help };
}

function printHumanReport(
  baseRef: string,
  report: ReturnType<typeof compareApiContracts>,
  gate: ReturnType<typeof evaluateApiContractVersionGate>
): void {
  console.log(`API contract compatibility against ${baseRef}: ${report.level}`);
  for (const change of report.changes) {
    console.log(
      `[${change.level}] ${change.code} ${change.path}: ${change.message}`
    );
  }
  console.log(
    `Version ${gate.baseVersion} -> ${gate.headVersion}; required bump: ` +
      `${gate.requiredBump}` +
      (gate.minimumVersion === null
        ? ''
        : `; minimum version: ${gate.minimumVersion}`)
  );
  if (gate.migrationPath !== null) {
    console.log(`Migration document: ${gate.migrationPath}`);
  }
  for (const diagnostic of gate.diagnostics) {
    console.error(`${diagnostic.code}: ${diagnostic.message}`);
  }
  console.log(
    gate.ok
      ? 'API contract compatibility gate passed.'
      : 'API contract compatibility gate failed.'
  );
}

function printHelp(): void {
  console.log(`Usage:
  bun run compatibility:check --base-ref <git-ref>

Options:
  --base-ref <git-ref>  Compare the working tree against this commit or ref.
                        Defaults to API_CONTRACT_BASE_REF or origin/main.
  --json                Print a machine-readable report.
  -h, --help            Show this help.

Breaking changes require the SemVer bump selected by the compatibility policy
and docs/migrations/v<base>-to-v<head>.md.`);
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}
