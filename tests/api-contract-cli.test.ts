import { describe, expect, it } from 'bun:test';
import {
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  runApiContractCheckCli,
  type ApiContractCheckCliRuntime
} from '../src/api-contracts/cli';
import { compareOpenApiRouteCatalog } from '../src/api-contracts/openapi-route-catalog';
import type { ApiRouteDefinition } from '../src/api-contracts/types';

interface JsonReport {
  readonly schemaVersion: number;
  readonly ok: boolean;
  readonly contractValidation: {
    readonly ok: boolean;
    readonly diagnostics: readonly { readonly code: string }[];
  };
  readonly openApiComparison: {
    readonly ok: boolean;
    readonly serviceId: string | null;
    readonly diagnostics: readonly { readonly code: string }[];
  } | null;
}

interface SarifReport {
  readonly version: string;
  readonly runs: readonly {
    readonly tool: {
      readonly driver: {
        readonly name: string;
      };
    };
    readonly results: readonly unknown[];
  }[];
}

describe('public contract checker CLI', () => {
  it('publishes the Node CLI through the package bin map', () => {
    const manifest: unknown = JSON.parse(
      readFileSync(join(process.cwd(), 'package.json'), 'utf8')
    );

    expect(manifest).toMatchObject({
      bin: {
        'zdp-api-contracts': './dist/api-contracts/cli-bin.js'
      }
    });
  });

  it('emits deterministic JSON for committed contract validation', async () => {
    const capture = createCapture();
    const exitCode = await runApiContractCheckCli(
      ['--format', 'json'],
      capture.runtime
    );
    const report = JSON.parse(capture.stdout()) as JsonReport;

    expect(exitCode).toBe(0);
    expect(capture.stderr()).toBe('');
    expect(report.schemaVersion).toBe(1);
    expect(report.ok).toBe(true);
    expect(report.contractValidation).toEqual({ ok: true, diagnostics: [] });
    expect(report.openApiComparison).toBeNull();
  });

  it('writes a valid empty SARIF report when contracts pass', async () => {
    const temporaryRoot = mkdtempSync(
      join(tmpdir(), 'zdp-api-contracts-cli-')
    );
    try {
      const output = join(temporaryRoot, 'reports', 'contracts.sarif');
      const capture = createCapture();
      const exitCode = await runApiContractCheckCli(
        ['--format', 'sarif', '--output', output],
        capture.runtime
      );
      const report = JSON.parse(readFileSync(output, 'utf8')) as SarifReport;

      expect(exitCode).toBe(0);
      expect(capture.stdout()).toBe('');
      expect(capture.stderr()).toBe('');
      expect(report.version).toBe('2.1.0');
      expect(report.runs[0]?.tool.driver.name).toBe('zdp-api-contracts');
      expect(report.runs[0]?.results).toEqual([]);
    } finally {
      rmSync(temporaryRoot, { recursive: true, force: true });
    }
  });

  it('compares service method, path, operationId, and explicit 2xx statuses', () => {
    const route = createRoute();
    const matching = compareOpenApiRouteCatalog(
      JSON.stringify({
        openapi: '3.1.0',
        'x-zdp-service-id': 'demo-api',
        paths: {
          '/v1/widgets': {
            post: {
              operationId: 'demo.widgets.create',
              responses: { '201': { description: 'Created' } }
            }
          }
        }
      }),
      'openapi.json',
      [route]
    );
    const drifting = compareOpenApiRouteCatalog(
      JSON.stringify({
        openapi: '3.1.0',
        'x-zdp-service-id': 'demo-api',
        paths: {
          '/v1/widgets': {
            post: {
              operationId: 'demo.widgets.write',
              responses: {
                '200': { description: 'Unexpected' },
                '202': { description: 'Unexpected' }
              }
            }
          }
        }
      }),
      'openapi.json',
      [route]
    );
    const codes = drifting.diagnostics.map((diagnostic) => diagnostic.code);

    expect(matching).toEqual({
      ok: true,
      serviceId: 'demo-api',
      diagnostics: []
    });
    expect(codes).toContain('API_OPENAPI_OPERATION_ID_MISMATCH');
    expect(codes).toContain('API_OPENAPI_SUCCESS_STATUS_MISSING');
    expect(codes).toContain('API_OPENAPI_SUCCESS_STATUS_UNDECLARED');
  });

  it('returns machine-readable OpenAPI drift and reserves exit 2 for usage errors', async () => {
    const temporaryRoot = mkdtempSync(
      join(tmpdir(), 'zdp-api-contracts-openapi-')
    );
    try {
      const openApiFile = join(temporaryRoot, 'openapi.json');
      writeFileSync(
        openApiFile,
        JSON.stringify({
          openapi: '3.1.0',
          'x-zdp-service-id': 'core-api',
          paths: {}
        }),
        'utf8'
      );

      const capture = createCapture();
      const exitCode = await runApiContractCheckCli(
        ['--openapi', openApiFile, '--format', 'json'],
        capture.runtime
      );
      const report = JSON.parse(capture.stdout()) as JsonReport;
      const codes =
        report.openApiComparison?.diagnostics.map(
          (diagnostic) => diagnostic.code
        ) ?? [];

      expect(exitCode).toBe(1);
      expect(report.contractValidation.ok).toBe(true);
      expect(report.openApiComparison?.serviceId).toBe('core-api');
      expect(codes).toContain('API_OPENAPI_OPERATION_MISSING');

      const usageCapture = createCapture();
      const usageExitCode = await runApiContractCheckCli(
        ['--service', 'core-api'],
        usageCapture.runtime
      );
      expect(usageExitCode).toBe(2);
      expect(usageCapture.stderr()).toContain('--service requires --openapi.');
    } finally {
      rmSync(temporaryRoot, { recursive: true, force: true });
    }
  });
});

function createRoute(): ApiRouteDefinition {
  return {
    operationId: 'demo.widgets.create',
    serviceId: 'demo-api',
    resource: 'widget',
    action: 'create',
    method: 'POST',
    path: '/v1/widgets',
    successStatuses: [201],
    requestSchemaRef: 'contracts/apis/demo-api/widgets.yaml#WidgetCreateRequest',
    responseSchemaRef:
      'contracts/apis/demo-api/widgets.yaml#WidgetCreateResponse',
    authRequired: true,
    permissionCheck: 'demo.widgets.create',
    auditEvent: 'demo.widget.created',
    idempotency: 'required_idempotency_key',
    ownerBoundary: 'demo',
    tenantBoundary: 'organization',
    requestIdRequired: true,
    traceIdRequired: true,
    sessionEffect: 'none',
    credentialPolicy: 'no_secret_payload',
    errorCodes: ['validation_failed']
  };
}

function createCapture(): {
  readonly runtime: ApiContractCheckCliRuntime;
  readonly stdout: () => string;
  readonly stderr: () => string;
} {
  let stdout = '';
  let stderr = '';
  return {
    runtime: {
      cwd: process.cwd(),
      writeStdout: (text) => {
        stdout += text;
      },
      writeStderr: (text) => {
        stderr += text;
      }
    },
    stdout: () => stdout,
    stderr: () => stderr
  };
}
