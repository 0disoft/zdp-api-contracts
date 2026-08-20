#!/usr/bin/env node
import { runApiContractCheckCli } from './cli.js';
process.exitCode = await runApiContractCheckCli(process.argv.slice(2));
//# sourceMappingURL=cli-bin.js.map