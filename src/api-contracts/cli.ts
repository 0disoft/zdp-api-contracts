import { loadApiContracts } from './parser';
import { validateApiContracts } from './validator';

export async function runApiContractCheckCli(
  argv: readonly string[]
): Promise<number> {
  if (argv.includes('--help') || argv.includes('-h')) {
    printHelp();
    return 0;
  }

  let result;
  try {
    const contracts = await loadApiContracts();
    result = validateApiContracts(contracts);
  } catch (error) {
    console.error('API contract check failed.');
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  }

  if (result.ok) {
    console.log('API contract check passed.');
    return 0;
  }

  console.error('API contract check failed.');
  for (const diagnostic of result.diagnostics) {
    console.error(
      `${diagnostic.code} ${diagnostic.file}#${diagnostic.path}: ${diagnostic.message}`
    );
  }

  return 1;
}

function printHelp(): void {
  console.log(`Usage:
  bun scripts/check-api-contracts.ts

Checks contracts/route-contract.yaml, error-envelope.yaml, webhook-contract.yaml, sdk-generation-input.yaml, and apis/catalog.yaml without implementing live API handlers or generating SDK output.`);
}
