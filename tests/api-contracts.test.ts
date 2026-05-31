import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  parseErrorEnvelopeContract,
  parseRouteContract,
  parseWebhookContract
} from '../src/api-contracts/parser';
import { validateApiContracts } from '../src/api-contracts/validator';
import type { ApiContracts } from '../src/api-contracts/types';

describe('api contract checker', () => {
  it('validates the committed API contracts', () => {
    const result = validateApiContracts(loadCommittedContracts());

    expect(result.diagnostics).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it('fails when route contracts stop requiring authorization hooks', () => {
    const contracts = loadCommittedContracts();
    const result = validateApiContracts({
      ...contracts,
      route: {
        ...contracts.route,
        requiredPerRoute: contracts.route.requiredPerRoute.filter(
          (field) => field !== 'permission_check'
        )
      }
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_ROUTE_REQUIRED_FIELD_MISSING'
    );
  });

  it('fails when route contracts allow screen-shaped payloads', () => {
    const contracts = loadCommittedContracts();
    const result = validateApiContracts({
      ...contracts,
      route: {
        ...contracts.route,
        forbiddenShapes: contracts.route.forbiddenShapes.filter(
          (shape) => shape !== 'screen_component_payload'
        )
      }
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_ROUTE_FORBIDDEN_SHAPE_MISSING'
    );
  });

  it('fails when error envelopes stop carrying trace identifiers', () => {
    const contracts = loadCommittedContracts();
    const result = validateApiContracts({
      ...contracts,
      errorEnvelope: {
        ...contracts.errorEnvelope,
        requiredFields: contracts.errorEnvelope.requiredFields.filter(
          (field) => field !== 'trace_id'
        )
      }
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_ERROR_REQUIRED_FIELD_MISSING'
    );
  });

  it('fails when error envelopes stop forbidding provider secrets', () => {
    const contracts = loadCommittedContracts();
    const result = validateApiContracts({
      ...contracts,
      errorEnvelope: {
        ...contracts.errorEnvelope,
        forbiddenFields: contracts.errorEnvelope.forbiddenFields.filter(
          (field) => field !== 'provider_secret'
        )
      }
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_ERROR_FORBIDDEN_FIELD_MISSING'
    );
  });

  it('fails when webhook contracts stop requiring idempotency', () => {
    const contracts = loadCommittedContracts();
    const result = validateApiContracts({
      ...contracts,
      webhook: {
        ...contracts.webhook,
        requiredControls: contracts.webhook.requiredControls.filter(
          (control) => control !== 'idempotency_key'
        )
      }
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_WEBHOOK_REQUIRED_CONTROL_MISSING'
    );
  });

  it('fails when webhook contracts allow ledger mutation bypasses', () => {
    const contracts = loadCommittedContracts();
    const result = validateApiContracts({
      ...contracts,
      webhook: {
        ...contracts.webhook,
        forbiddenControls: contracts.webhook.forbiddenControls.filter(
          (control) => control !== 'ledger_mutation_without_money_contract'
        )
      }
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_WEBHOOK_FORBIDDEN_CONTROL_MISSING'
    );
  });
});

function loadCommittedContracts(): ApiContracts {
  return {
    route: parseRouteContract(
      readFileSync(join(process.cwd(), 'contracts', 'route-contract.yaml'), 'utf8')
    ),
    errorEnvelope: parseErrorEnvelopeContract(
      readFileSync(join(process.cwd(), 'contracts', 'error-envelope.yaml'), 'utf8')
    ),
    webhook: parseWebhookContract(
      readFileSync(join(process.cwd(), 'contracts', 'webhook-contract.yaml'), 'utf8')
    )
  };
}
