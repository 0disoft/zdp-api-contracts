import { loadApiContracts } from '../api-contracts/parser.js';
import { buildApiExportPlan } from './plan.js';

export async function runApiExportPlanCli(
  argv: readonly string[]
): Promise<number> {
  if (argv.includes('--help') || argv.includes('-h')) {
    printHelp();
    return 0;
  }

  const options = readOptions(argv);

  try {
    const result = buildApiExportPlan(await loadApiContracts(options.root));

    if (!result.ok) {
      for (const diagnostic of result.diagnostics) {
        console.error(
          `${diagnostic.code} ${diagnostic.file}#${diagnostic.path}: ${diagnostic.message}`
        );
      }

      return 1;
    }

    if (options.json) {
      console.log(JSON.stringify(result.plan, null, 2));
      return 0;
    }

    console.log(
      `API export plan: ${result.plan?.outputs.length ?? 0} output(s), ${result.plan?.sdkTargets.length ?? 0} SDK target(s)`
    );

    for (const output of result.plan?.outputs ?? []) {
      console.log(
        `- ${output.kind}: ${output.sourceContracts.join(', ')}`
      );
    }

    return 0;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  }
}

function readOptions(argv: readonly string[]): {
  readonly root: string;
  readonly json: boolean;
} {
  return {
    root: readStringOption(argv, '--root') ?? process.cwd(),
    json: argv.includes('--json')
  };
}

function readStringOption(
  argv: readonly string[],
  optionName: string
): string | null {
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] !== optionName) {
      continue;
    }

    const value = argv[index + 1];
    return value === undefined || value.startsWith('--') ? null : value;
  }

  return null;
}

function printHelp(): void {
  console.log(`Usage:
  bun scripts/plan-api-exports.ts [--root <path>] [--json]

Builds a dry-run API export plan for OpenAPI, SDK generation input, webhook schema, and docs contract output without writing generated artifacts.`);
}
