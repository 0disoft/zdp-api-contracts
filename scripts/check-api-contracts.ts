import { runApiContractCheckCli } from '../src/api-contracts/cli';

const exitCode = await runApiContractCheckCli(process.argv.slice(2));
process.exit(exitCode);
