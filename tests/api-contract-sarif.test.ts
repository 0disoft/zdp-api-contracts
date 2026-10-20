import { expect, test } from 'bun:test';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { renderApiContractCheckReport, type ApiContractCheckReport } from '../src/api-contracts/cli-report';
import { runApiContractCheckCli } from '../src/api-contracts/cli';

interface SarifLog {
  runs: {
    originalUriBaseIds?: Record<string, { uri: string }>;
    results: { locations: { physicalLocation: { artifactLocation: { uri: string; uriBaseId?: string } } }[] }[];
  }[];
}

function artifactUrls(source: string): URL[] {
  const run = (JSON.parse(source) as SarifLog).runs[0]!;
  return run.results.map((result) => {
    const location = result.locations[0]!.physicalLocation.artifactLocation;
    const base = location.uriBaseId === undefined ? undefined : run.originalUriBaseIds?.[location.uriBaseId]?.uri;
    return new URL(location.uri, base ?? pathToFileURL(`${process.cwd()}/`));
  });
}

function report(root: string, file: string): ApiContractCheckReport {
  return {
    schemaVersion: 1, root, ok: false,
    contractValidation: { ok: false, diagnostics: [{ code: 'CONTRACT_INVALID', file, path: '$', message: 'Invalid contract.' }] },
    openApiComparison: null
  };
}

test('SARIF contract locations resolve under the selected root and escape filename delimiters', () => {
  const root = 'nested contracts';
  const file = 'contracts/한글 #100%.yaml';
  const [location] = artifactUrls(renderApiContractCheckReport(report(root, file), 'sarif'));

  expect(location?.href).toBe(pathToFileURL(resolve(root, file)).href);
  expect(location?.hash).toBe('');
  expect(location?.search).toBe('');
});

test('SARIF OpenAPI locations stay relative to the invocation instead of the contract root', () => {
  const file = 'specs/api #100%.yaml';
  const input = {
    ...report('nested contracts', 'contracts/route-contract.yaml'),
    openApiComparison: { file, serviceId: 'demo-api', ok: false, diagnostics: [{ code: 'OPENAPI_INVALID', file, path: '$', message: 'Invalid OpenAPI.' }] }
  };
  const [, location] = artifactUrls(renderApiContractCheckReport(input, 'sarif'));

  expect(location?.href).toBe(pathToFileURL(resolve(file)).href);
  expect(location?.hash).toBe('');
});

test('SARIF CLI locations use the supplied invocation directory for a missing contract root', async () => {
  const cwd = resolve(tmpdir(), 'zdp-sarif-invocation');
  let stdout = '';
  const exitCode = await runApiContractCheckCli(['--root', 'missing contracts', '--sarif'], {
    cwd, writeStdout: (text) => { stdout += text; }, writeStderr: () => {}
  });
  const [location] = artifactUrls(stdout);

  expect(exitCode).toBe(1);
  expect(location?.href).toBe(pathToFileURL(resolve(cwd, 'missing contracts/contracts/route-contract.yaml')).href);
});

test('SARIF unknown-service comparison points to the selected contract catalog outside the invocation directory', async () => {
  const root = process.cwd();
  const cwd = mkdtempSync(join(tmpdir(), 'zdp-sarif-service-'));
  try {
    const file = 'api #100%.json';
    writeFileSync(join(cwd, file), JSON.stringify({
      openapi: '3.1.0', 'x-zdp-service-id': 'unknown-service', paths: {}
    }));
    let stdout = '';
    const exitCode = await runApiContractCheckCli(['--root', root, '--openapi', file, '--sarif'], {
      cwd, writeStdout: (text) => { stdout += text; }, writeStderr: () => {}
    });

    expect(exitCode).toBe(1);
    expect(JSON.parse(stdout).runs[0].results[0].ruleId).toBe('API_OPENAPI_SERVICE_NOT_FOUND');
    const [location] = artifactUrls(stdout);
    expect(location?.href).toBe(pathToFileURL(resolve(root, 'contracts/apis/catalog.yaml')).href);
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});
