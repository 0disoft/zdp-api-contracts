import { isAbsolute, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import type {
  ApiContractDiagnostic,
  ApiContractValidationResult
} from './types.js';

export type ApiContractCheckFormat = 'text' | 'json' | 'sarif';

export interface OpenApiComparisonReport {
  readonly file: string;
  readonly serviceId: string | null;
  readonly ok: boolean;
  readonly diagnostics: readonly ApiContractDiagnostic[];
}

export interface ApiContractCheckReport {
  readonly schemaVersion: 1;
  readonly root: string;
  readonly ok: boolean;
  readonly contractValidation: ApiContractValidationResult;
  readonly openApiComparison: OpenApiComparisonReport | null;
}

export function renderApiContractCheckReport(
  report: ApiContractCheckReport,
  format: ApiContractCheckFormat,
  cwd = process.cwd()
): string {
  if (format === 'json') {
    return `${JSON.stringify(report, null, 2)}\n`;
  }
  if (format === 'sarif') {
    return `${JSON.stringify(toSarif(report, resolve(cwd)), null, 2)}\n`;
  }
  return renderText(report);
}

function renderText(report: ApiContractCheckReport): string {
  const lines = [
    report.ok ? 'API contract check passed.' : 'API contract check failed.'
  ];

  if (report.contractValidation.ok) {
    lines.push('Contract validation passed.');
  } else {
    lines.push('Contract validation failed.');
    appendDiagnostics(lines, report.contractValidation.diagnostics);
  }

  if (report.openApiComparison !== null) {
    const service = report.openApiComparison.serviceId ?? '<unresolved>';
    if (report.openApiComparison.ok) {
      lines.push(
        `OpenAPI route catalog comparison passed for service ${service}.`
      );
    } else {
      lines.push(
        `OpenAPI route catalog comparison failed for service ${service}.`
      );
      appendDiagnostics(lines, report.openApiComparison.diagnostics);
    }
  }

  return `${lines.join('\n')}\n`;
}

function appendDiagnostics(
  lines: string[],
  diagnostics: readonly ApiContractDiagnostic[]
): void {
  for (const diagnostic of diagnostics) {
    lines.push(
      `${diagnostic.code} ${diagnostic.file}#${diagnostic.path}: ${diagnostic.message}`
    );
  }
}

function toSarif(report: ApiContractCheckReport, cwd: string): Record<string, unknown> {
  const diagnostics = [
    ...report.contractValidation.diagnostics.map((diagnostic) => ({
      ...diagnostic,
      file: resolve(cwd, report.root, diagnostic.file)
    })),
    ...(report.openApiComparison?.diagnostics ?? []).map((diagnostic) => ({
      ...diagnostic,
      file: resolve(cwd, diagnostic.file)
    }))
  ];
  const ruleIds = Array.from(
    new Set(diagnostics.map((diagnostic) => diagnostic.code))
  ).sort();

  return {
    $schema:
      'https://json.schemastore.org/sarif-2.1.0.json',
    version: '2.1.0',
    runs: [
      {
        originalUriBaseIds: {
          '%SRCROOT%': { uri: pathToFileURL(`${cwd}${sep}`).href }
        },
        tool: {
          driver: {
            name: 'zdp-api-contracts',
            rules: ruleIds.map((ruleId) => ({
              id: ruleId,
              name: ruleId,
              shortDescription: {
                text: `zdp-api-contracts diagnostic ${ruleId}`
              },
              defaultConfiguration: { level: 'error' }
            }))
          }
        },
        invocations: [
          {
            executionSuccessful: true,
            exitCode: report.ok ? 0 : 1
          }
        ],
        results: diagnostics.map((diagnostic) => ({
          ruleId: diagnostic.code,
          level: 'error',
          message: { text: diagnostic.message },
          locations: [
            {
              physicalLocation: {
                artifactLocation: artifactLocation(diagnostic.file, cwd),
                region: { startLine: 1 }
              },
              logicalLocations: [
                {
                  fullyQualifiedName: diagnostic.path
                }
              ]
            }
          ],
          properties: {
            contractPath: diagnostic.path
          }
        }))
      }
    ]
  };
}

function artifactLocation(file: string, cwd: string): Record<string, string> {
  const path = relative(cwd, file);
  if (isAbsolute(path)) {
    return { uri: pathToFileURL(file).href };
  }
  return {
    uri: (path || '.').replaceAll('\\', '/').split('/').map(encodeURIComponent).join('/'),
    uriBaseId: '%SRCROOT%'
  };
}
