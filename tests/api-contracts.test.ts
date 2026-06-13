import { describe, expect, it } from 'bun:test';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  ApiContractLoadError,
  loadApiContracts,
  parseApiCatalogContract,
  parseErrorEnvelopeContract,
  parseRouteContract,
  parseSdkGenerationInputContract,
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

  it('keeps core auth session routes explicit in the API catalog', () => {
    const contracts = loadCommittedContracts();

    expect(contracts.apiCatalog.status).toBe('route-catalog-active');
    expect(contracts.apiCatalog.routes.map((route) => route.operationId)).toEqual([
      'core.auth.registrations.create',
      'core.auth.sessions.create',
      'core.auth.sessions.refresh',
      'core.auth.sessions.revoke_current',
      'core.auth.recovery_requests.create',
      'core.auth.passkey_challenges.create',
      'core.auth.passkey_assertions.verify',
      'core.auth.oauth_callbacks.accept'
    ]);
    expect(
      contracts.apiCatalog.routes.every(
        (route) =>
          route.serviceId === 'core-api' &&
          route.ownerBoundary === 'identity' &&
          route.requestIdRequired &&
          route.traceIdRequired &&
          route.credentialPolicy.includes('no_refresh_token_plaintext')
      )
    ).toBe(true);
    expect(
      contracts.apiCatalog.routes.filter((route) => route.sessionEffect === 'issue')
        .length
    ).toBe(3);
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

  it('fails when SDK generation input drops a language target', () => {
    const contracts = loadCommittedContracts();
    const result = validateApiContracts({
      ...contracts,
      sdkGenerationInput: {
        ...contracts.sdkGenerationInput,
        generationTargets: contracts.sdkGenerationInput.generationTargets.filter(
          (target) => target !== 'rust'
        )
      }
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_SDK_GENERATION_TARGET_MISSING'
    );
  });

  it('fails when SDK generation input selects a target outside the allowed pool', () => {
    const contracts = loadCommittedContracts();
    const result = validateApiContracts({
      ...contracts,
      sdkGenerationInput: {
        ...contracts.sdkGenerationInput,
        generationTargets: [
          ...contracts.sdkGenerationInput.generationTargets,
          'php'
        ]
      }
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_SDK_GENERATION_TARGET_INVALID'
    );
  });

  it('fails when route contracts drop success status metadata', () => {
    const contracts = loadCommittedContracts();
    const result = validateApiContracts({
      ...contracts,
      route: {
        ...contracts.route,
        requiredPerRoute: contracts.route.requiredPerRoute.filter(
          (field) => field !== 'success_statuses'
        )
      }
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_ROUTE_REQUIRED_FIELD_MISSING'
    );
  });

  it('fails when route contracts allow unsupported HTTP methods', () => {
    const contracts = loadCommittedContracts();
    const result = validateApiContracts({
      ...contracts,
      route: {
        ...contracts.route,
        allowedMethods: [...contracts.route.allowedMethods, 'TRACE']
      }
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_ROUTE_ALLOWED_METHOD_INVALID'
    );
  });

  it('fails when route contracts allow ambiguous success statuses', () => {
    const contracts = loadCommittedContracts();
    const result = validateApiContracts({
      ...contracts,
      route: {
        ...contracts.route,
        allowedSuccessStatuses: [
          ...contracts.route.allowedSuccessStatuses,
          299
        ]
      }
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_ROUTE_ALLOWED_SUCCESS_STATUS_INVALID'
    );
  });

  it('fails when SDK generation input drops route idempotency metadata', () => {
    const contracts = loadCommittedContracts();
    const result = validateApiContracts({
      ...contracts,
      sdkGenerationInput: {
        ...contracts.sdkGenerationInput,
        requiredRouteMetadata:
          contracts.sdkGenerationInput.requiredRouteMetadata.filter(
            (metadata) => metadata !== 'idempotency'
          )
      }
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_SDK_ROUTE_METADATA_MISSING'
    );
  });

  it('fails when SDK generation input owns generated SDK source', () => {
    const contracts = loadCommittedContracts();
    const result = validateApiContracts({
      ...contracts,
      sdkGenerationInput: {
        ...contracts.sdkGenerationInput,
        forbiddenOwnership:
          contracts.sdkGenerationInput.forbiddenOwnership.filter(
            (ownership) => ownership !== 'generated_sdk_source'
          )
      }
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_SDK_FORBIDDEN_OWNERSHIP_MISSING'
    );
  });

  it('fails when SDK generation input can carry authorization headers', () => {
    const contracts = loadCommittedContracts();
    const result = validateApiContracts({
      ...contracts,
      sdkGenerationInput: {
        ...contracts.sdkGenerationInput,
        forbiddenValues: contracts.sdkGenerationInput.forbiddenValues.filter(
          (value) => value !== 'authorization_header'
        )
      }
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_SDK_FORBIDDEN_VALUE_MISSING'
    );
  });

  it('fails when an API catalog route uses unsupported method or status', () => {
    const contracts = loadCommittedContracts();
    const result = validateApiContracts({
      ...contracts,
      apiCatalog: {
        ...contracts.apiCatalog,
        routes: [
          {
            operationId: 'create_lead',
            serviceId: 'zdp-leads',
            resource: 'lead',
            action: 'create',
            method: 'TRACE',
            path: 'leads',
            successStatuses: [299],
            requestSchemaRef: 'schemas/lead-create-request.yaml',
            responseSchemaRef: 'schemas/lead-response.yaml',
            authRequired: true,
            permissionCheck: 'lead.create',
            auditEvent: 'lead.created',
            idempotency: 'required',
            ownerBoundary: 'identity',
            tenantBoundary: 'organization',
            requestIdRequired: false,
            traceIdRequired: false,
            sessionEffect: 'invalid',
            credentialPolicy: 'allows_refresh_token_plaintext',
            errorCodes: ['validation_failed']
          }
        ]
      }
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_CATALOG_ROUTE_METHOD_INVALID'
    );
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_CATALOG_ROUTE_SUCCESS_STATUS_INVALID'
    );
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_CATALOG_ROUTE_PATH_INVALID'
    );
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_CATALOG_ROUTE_REQUEST_ID_NOT_REQUIRED'
    );
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_CATALOG_ROUTE_TRACE_ID_NOT_REQUIRED'
    );
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_CATALOG_ROUTE_SESSION_EFFECT_INVALID'
    );
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_CATALOG_ROUTE_CREDENTIAL_POLICY_INCOMPLETE'
    );
  });

  it('accumulates load errors across contract files', async () => {
    const root = mkdtempSync(join(tmpdir(), 'zdp-api-contracts-'));
    const contractsRoot = join(root, 'contracts');
    const apiRoot = join(contractsRoot, 'apis');

    mkdirSync(apiRoot, { recursive: true });
    writeFileSync(join(contractsRoot, 'route-contract.yaml'), 'route_contract:\n');
    writeFileSync(
      join(contractsRoot, 'error-envelope.yaml'),
      'error_envelope:\n  schema_version: one\n'
    );
    writeFileSync(join(contractsRoot, 'webhook-contract.yaml'), 'webhook_contract:\n');
    writeFileSync(
      join(contractsRoot, 'sdk-generation-input.yaml'),
      'sdk_generation_input:\n'
    );
    writeFileSync(join(apiRoot, 'catalog.yaml'), 'api_catalog:\n');

    await expect(loadApiContracts(root)).rejects.toThrow(ApiContractLoadError);

    try {
      await loadApiContracts(root);
    } catch (error) {
      expect(error).toBeInstanceOf(ApiContractLoadError);
      expect((error as ApiContractLoadError).failures.length).toBeGreaterThan(1);
    }
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
    ),
    sdkGenerationInput: parseSdkGenerationInputContract(
      readFileSync(
        join(process.cwd(), 'contracts', 'sdk-generation-input.yaml'),
        'utf8'
      )
    ),
    apiCatalog: parseApiCatalogContract(
      readFileSync(
        join(process.cwd(), 'contracts', 'apis', 'catalog.yaml'),
        'utf8'
      )
    )
  };
}
