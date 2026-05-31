import { runApiExportPlanCli } from '../src/api-export-plan/cli';

const exitCode = await runApiExportPlanCli(process.argv.slice(2));

process.exitCode = exitCode;
