import { loadApiContracts } from '../api-contracts/registry-loader.js';
import { buildApiExportPlan } from './registry-plan.js';

export async function runApiExportPlanCli(
  argv: readonly string[]
): Promise<number> {
  let options: ReturnType<typeof readOptions>;
  try {
    options = readOptions(argv);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    console.error(helpText());
    return 2;
  }
  if (options.help) {
    printHelp();
    return 0;
  }

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
  readonly help: boolean;
} {
  let root: string | undefined;
  let json = false;
  let help = false;
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--json') { json = true; continue; }
    if (arg === '--help' || arg === '-h') { help = true; continue; }
    if (arg === '--root') {
      if (root !== undefined) throw new Error('Duplicate option: --root.');
      const value = argv[++index];
      if (value === undefined || !value.trim() || value.startsWith('-')) throw new Error('Option --root requires a path.');
      root = value;
    } else {
      throw new Error(`Unexpected argument: ${arg}.`);
    }
  }
  return { root: root ?? process.cwd(), json, help };
}

function printHelp(): void {
  console.log(helpText());
}

function helpText(): string {
  return `Usage:
  bun scripts/plan-api-exports.ts [--root <path>] [--json]

Builds a dry-run API export plan for OpenAPI, SDK generation input, webhook schema, and docs contract output without writing generated artifacts.`;
}
