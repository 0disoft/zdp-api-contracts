import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import {
  ApiContractLoadError,
  loadApiContracts
} from './parser.js';
import { validateApiContracts } from './validator.js';
import type {
  ApiContractDiagnostic,
  ApiContractValidationResult,
  ApiRouteDefinition
} from './types.js';
import {
  compareOpenApiRouteCatalog,
  type OpenApiRouteCatalogCheckResult
} from './openapi-route-catalog.js';
import {
  renderApiContractCheckReport,
  type ApiContractCheckFormat,
  type ApiContractCheckReport,
  type OpenApiComparisonReport
} from './cli-report.js';

interface ParsedCliOptions {
  readonly root: string;
  readonly format: ApiContractCheckFormat;
  readonly output: string | null;
  readonly openApi: string | null;
  readonly serviceId: string | null;
  readonly help: boolean;
}

export interface ApiContractCheckCliRuntime {
  readonly cwd: string;
  readonly writeStdout: (text: string) => void;
  readonly writeStderr: (text: string) => void;
}

class CliUsageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CliUsageError';
  }
}

export async function runApiContractCheckCli(
  argv: readonly string[],
  runtime: ApiContractCheckCliRuntime = defaultRuntime()
): Promise<number> {
  let options: ParsedCliOptions;
  try {
    options = parseArguments(argv);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    runtime.writeStderr(`${message}\n\n${helpText()}`);
    return 2;
  }

  if (options.help) {
    runtime.writeStdout(helpText());
    return 0;
  }

  const root = resolve(runtime.cwd, options.root);
  let contractValidation: ApiContractValidationResult;
  let openApiComparison: OpenApiComparisonReport | null = null;

  try {
    const contracts = await loadApiContracts(root);
    contractValidation = validateApiContracts(contracts);

    if (options.openApi !== null) {
      const openApiFile = resolve(runtime.cwd, options.openApi);
      const displayFile = displayPath(runtime.cwd, openApiFile);
      const comparison = await compareOpenApiFile(
        openApiFile,
        displayFile,
        contracts.apiCatalog.routes,
        options.serviceId
      );
      openApiComparison = toOpenApiComparisonReport(displayFile, comparison);
    }
  } catch (error) {
    contractValidation = {
      ok: false,
      diagnostics: contractLoadDiagnostics(error)
    };
  }

  const report: ApiContractCheckReport = {
    schemaVersion: 1,
    root: displayPath(runtime.cwd, root),
    ok:
      contractValidation.ok &&
      (openApiComparison === null || openApiComparison.ok),
    contractValidation,
    openApiComparison
  };

  try {
    await emitReport(report, options, runtime);
  } catch (error) {
    runtime.writeStderr(
      `API contract report write failed: ${error instanceof Error ? error.message : String(error)}\n`
    );
    return 1;
  }

  return report.ok ? 0 : 1;
}

function parseArguments(argv: readonly string[]): ParsedCliOptions {
  let root = '.';
  let format: ApiContractCheckFormat = 'text';
  let output: string | null = null;
  let openApi: string | null = null;
  let serviceId: string | null = null;
  let help = false;
  let formatWasSet = false;
  let index = 0;

  if (argv[0] === 'check') {
    index += 1;
  }

  while (index < argv.length) {
    const argument = argv[index];
    if (argument === undefined) {
      break;
    }
    if (argument === '--help' || argument === '-h') {
      help = true;
      index += 1;
      continue;
    }
    if (argument === '--json') {
      format = setFormat('json', formatWasSet);
      formatWasSet = true;
      index += 1;
      continue;
    }
    if (argument === '--sarif') {
      format = setFormat('sarif', formatWasSet);
      formatWasSet = true;
      index += 1;
      continue;
    }

    const inline = splitInlineOption(argument);
    const option = inline.name;
    if (option === '--root') {
      const value = inline.value ?? requireNextValue(argv, index, option);
      root = requireNonEmpty(value, option);
      index += inline.value === null ? 2 : 1;
      continue;
    }
    if (option === '--format') {
      const value = inline.value ?? requireNextValue(argv, index, option);
      if (formatWasSet) {
        throw new CliUsageError('Output format may be selected only once.');
      }
      format = parseFormat(value);
      formatWasSet = true;
      index += inline.value === null ? 2 : 1;
      continue;
    }
    if (option === '--output') {
      const value = inline.value ?? requireNextValue(argv, index, option);
      output = requireNonEmpty(value, option);
      index += inline.value === null ? 2 : 1;
      continue;
    }
    if (option === '--openapi') {
      const value = inline.value ?? requireNextValue(argv, index, option);
      openApi = requireNonEmpty(value, option);
      index += inline.value === null ? 2 : 1;
      continue;
    }
    if (option === '--service') {
      const value = inline.value ?? requireNextValue(argv, index, option);
      serviceId = requireNonEmpty(value, option);
      index += inline.value === null ? 2 : 1;
      continue;
    }

    throw new CliUsageError(`Unknown argument: ${argument}`);
  }

  if (!help && serviceId !== null && openApi === null) {
    throw new CliUsageError('--service requires --openapi.');
  }

  return { root, format, output, openApi, serviceId, help };
}

function splitInlineOption(argument: string): {
  readonly name: string;
  readonly value: string | null;
} {
  const separator = argument.indexOf('=');
  return separator === -1
    ? { name: argument, value: null }
    : {
        name: argument.slice(0, separator),
        value: argument.slice(separator + 1)
      };
}

function requireNextValue(
  argv: readonly string[],
  index: number,
  option: string
): string {
  const value = argv[index + 1];
  if (value === undefined || value.startsWith('--')) {
    throw new CliUsageError(`${option} requires a value.`);
  }
  return value;
}

function requireNonEmpty(value: string, option: string): string {
  if (value.trim().length === 0) {
    throw new CliUsageError(`${option} requires a non-empty value.`);
  }
  return value.trim();
}

function parseFormat(value: string): ApiContractCheckFormat {
  if (value === 'text' || value === 'json' || value === 'sarif') {
    return value;
  }
  throw new CliUsageError(
    `--format must be text, json, or sarif; received ${value}.`
  );
}

function setFormat(
  format: ApiContractCheckFormat,
  formatWasSet: boolean
): ApiContractCheckFormat {
  if (formatWasSet) {
    throw new CliUsageError('Output format may be selected only once.');
  }
  return format;
}

async function compareOpenApiFile(
  openApiFile: string,
  displayFile: string,
  routes: readonly ApiRouteDefinition[],
  serviceId: string | null
): Promise<OpenApiRouteCatalogCheckResult> {
  try {
    const source = await readFile(openApiFile, 'utf8');
    return compareOpenApiRouteCatalog(
      source,
      displayFile,
      routes,
      serviceId
    );
  } catch (error) {
    return {
      ok: false,
      serviceId,
      diagnostics: [
        {
          code: 'API_OPENAPI_READ_FAILED',
          file: displayFile,
          path: '$',
          message: error instanceof Error ? error.message : String(error)
        }
      ]
    };
  }
}

function toOpenApiComparisonReport(
  file: string,
  comparison: OpenApiRouteCatalogCheckResult
): OpenApiComparisonReport {
  return {
    file,
    serviceId: comparison.serviceId,
    ok: comparison.ok,
    diagnostics: comparison.diagnostics
  };
}

function contractLoadDiagnostics(error: unknown): readonly ApiContractDiagnostic[] {
  if (error instanceof ApiContractLoadError) {
    return error.failures.map((failure) => ({
      code: 'API_CONTRACT_LOAD_FAILED',
      file: failure.file,
      path: '$',
      message: failure.message
    }));
  }
  return [
    {
      code: 'API_CONTRACT_LOAD_FAILED',
      file: 'contracts',
      path: '$',
      message: error instanceof Error ? error.message : String(error)
    }
  ];
}

async function emitReport(
  report: ApiContractCheckReport,
  options: ParsedCliOptions,
  runtime: ApiContractCheckCliRuntime
): Promise<void> {
  const rendered = renderApiContractCheckReport(report, options.format);
  if (options.output === null || options.output === '-') {
    runtime.writeStdout(rendered);
    return;
  }
  const outputFile = resolve(runtime.cwd, options.output);
  await mkdir(dirname(outputFile), { recursive: true });
  await writeFile(outputFile, rendered, 'utf8');
}

function displayPath(root: string, file: string): string {
  const candidate = relative(root, file);
  return (candidate.length === 0 ? '.' : candidate).replaceAll('\\', '/');
}

function defaultRuntime(): ApiContractCheckCliRuntime {
  return {
    cwd: process.cwd(),
    writeStdout: (text) => process.stdout.write(text),
    writeStderr: (text) => process.stderr.write(text)
  };
}

function helpText(): string {
  return `Usage:
  zdp-api-contracts [check] [options]

Options:
  --root <directory>       Contract repository or installed package root.
  --openapi <file>         Compare one service OpenAPI document with the route catalog.
  --service <service-id>   Service to compare. May be omitted when OpenAPI declares x-zdp-service-id.
  --format <format>        text, json, or sarif. Default: text.
  --json                   Alias for --format json.
  --sarif                  Alias for --format sarif.
  --output <file|->        Write the report to a file, or use - for stdout.
  -h, --help               Show this help.

Exit codes:
  0  All requested checks passed.
  1  Contract validation, OpenAPI comparison, or report writing failed.
  2  Command-line usage was invalid.
`;
}
