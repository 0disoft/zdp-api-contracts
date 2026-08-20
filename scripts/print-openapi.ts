import {
  buildOpenApi31Document,
  serializeOpenApi31Document
} from '../src/api-export-plan/openapi';

let options: CliOptions;
try {
  options = parseArgs(process.argv.slice(2));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

const result = await buildOpenApi31Document(process.cwd(), {
  strictTypedSchemas: options.strict,
  includeRestrictedRoutes: options.includeRestricted
});

if (!result.ok || result.document === null) {
  console.error('OpenAPI 3.1 export failed.');
  for (const diagnostic of result.diagnostics) {
    console.error(
      `${diagnostic.code} ${diagnostic.file}#${diagnostic.path}: ${diagnostic.message}`
    );
  }
  process.exit(1);
}

if (!options.check) {
  process.stdout.write(serializeOpenApi31Document(result.document));
}

interface CliOptions {
  readonly check: boolean;
  readonly strict: boolean;
  readonly includeRestricted: boolean;
}

function parseArgs(args: readonly string[]): CliOptions {
  const allowed = new Set(['--check', '--strict', '--include-restricted']);
  const unknown = args.filter((arg) => !allowed.has(arg));
  if (unknown.length > 0) {
    throw new Error(
      `Unknown OpenAPI export option(s): ${unknown.join(', ')}. ` +
      'Use --check, --strict, or --include-restricted.'
    );
  }
  return {
    check: args.includes('--check'),
    strict: args.includes('--strict'),
    includeRestricted: args.includes('--include-restricted')
  };
}
