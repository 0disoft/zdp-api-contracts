import { expect, test } from 'bun:test';
import { readFile } from 'node:fs/promises';
import { parse } from 'yaml';
import { buildOpenApi31Document } from '../src/api-export-plan/openapi';

test('Doubloon schemas export without registering an executable route', async () => {
  const result = await buildOpenApi31Document(process.cwd());
  expect(result.ok).toBe(true);
  const schemas = result.document!.components.schemas;
  const request = schemas.DoubloonApprovalVerifyRequest!;
  const response = schemas.DoubloonApprovalVerifyResponse!;
  expect(request.additionalProperties).toBe(false);
  expect(response.additionalProperties).toBe(false);
  expect(request.required).toContain('transaction_binding_digest');
  expect(request.required).toContain('evidence_manifest_digest');
  expect(response.required).toContain('actor_authority_revision');
  expect(response.required).toContain('revocation_revision');
  expect(response).toMatchObject({ properties: { execution_authorized: { type: 'boolean', enum: [false] } } });
  expect(request).toMatchObject({ properties: { network: { type: 'string', enum: ['sui_testnet'] } } });
  for (const field of ['issuer', 'decision', 'role', 'approver_quorum', 'revocation_state']) {
    expect(request.properties).not.toHaveProperty(field);
  }
  expect(JSON.stringify(result.document!.paths)).not.toContain('DoubloonApprovalVerify');
});

test('closed actions and schema references match the no-route policy', async () => {
  const policy = parse(await readFile('contracts/apis/core-api/doubloon-approval.yaml', 'utf8')).doubloon_approval;
  const result = await buildOpenApi31Document(process.cwd());
  expect(result.ok).toBe(true);
  expect(policy.path).toBeNull();
  expect(policy.runtime_enabled).toBe(false);
  expect(policy.sdk_operation_generated).toBe(false);
  expect(policy.validation.execution_authorized).toBe(false);
  expect(policy.validation.verify_consumes_or_reserves).toBe(false);
  expect(result.document!.components.schemas.DoubloonApprovalVerifyRequest)
    .toMatchObject({ properties: { action_ref: { enum: policy.closed_binding.actions } } });
  expect(policy.closed_binding.actions).not.toContain('upgrade');
  expect(policy.closed_binding.actions).not.toContain('mint');
  expect(policy.closed_binding.actions).not.toContain('burn');
  const catalog = parse(await readFile('contracts/error-code-catalog.yaml', 'utf8')).error_code_catalog.entries;
  for (const [status, code] of Object.entries(policy.errors)) {
    expect(catalog.find((entry: { code: string }) => entry.code === code)?.http_status).toBe(Number(status));
  }
});
