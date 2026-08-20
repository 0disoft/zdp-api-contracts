import { loadErrorCodeCatalog, validateErrorCodeCatalog } from './error-code-catalog.js';
import { loadApiContracts } from './registry-loader.js';
import { validateApiContracts } from './registry-validator.js';
export async function runApiContractCheckCli(argv) {
    if (argv.includes('--help') || argv.includes('-h')) {
        printHelp();
        return 0;
    }
    let diagnostics;
    try {
        const contracts = await loadApiContracts();
        const errorCodeCatalog = await loadErrorCodeCatalog();
        diagnostics = [
            ...validateApiContracts(contracts).diagnostics,
            ...validateErrorCodeCatalog(errorCodeCatalog, contracts).diagnostics
        ];
    }
    catch (error) {
        console.error('API contract check failed.');
        console.error(error instanceof Error ? error.message : String(error));
        return 1;
    }
    if (diagnostics.length === 0) {
        console.log('API contract check passed.');
        return 0;
    }
    console.error('API contract check failed.');
    for (const diagnostic of diagnostics) {
        console.error(`${diagnostic.code} ${diagnostic.file}#${diagnostic.path}: ${diagnostic.message}`);
    }
    return 1;
}
function printHelp() {
    console.log(`Usage:
  bun scripts/check-api-contracts.ts

Checks route, schema bundle, error envelope, central error code catalog, webhook,
SDK generation, calculator, and API catalog contracts without implementing live
API handlers, calculation engines, or SDK output.`);
}
//# sourceMappingURL=cli.js.map