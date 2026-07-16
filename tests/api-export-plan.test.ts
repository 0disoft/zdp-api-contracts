import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  parseApiCatalogContract,
  parseApiSchemaBundleContract,
  parseCalculatorCatalogContract,
  parseCalculatorConformanceContract,
  parseErrorEnvelopeContract,
  parseProductLinkHandoffContract,
  parseRouteContract,
  parseSdkGenerationInputContract,
  parseWebhookContract
} from '../src/api-contracts/parser';
import type { ApiContracts } from '../src/api-contracts/types';
import { buildApiExportPlan } from '../src/api-export-plan/plan';

describe('api export plan', () => {
  it('builds a dry-run plan without writing generated artifacts', () => {
    const result = buildApiExportPlan(loadCommittedContracts());

    expect(result.ok).toBe(true);
    expect(result.diagnostics).toEqual([]);
    const plan = result.plan;
    expect(plan).not.toBeNull();
    if (plan === null) {
      throw new Error('Expected API export plan to be built.');
    }

    expect(plan).toMatchObject({
      status: 'plan-only',
      writesArtifacts: false,
      publishesSchemas: false,
      sdkTargets: ['typescript', 'dart', 'rust'],
      traceFields: ['request_id', 'trace_id'],
      clientRuntimeMetadata: [
        'typed_fetch_operation_map',
        'standard_error_envelope_normalization',
        'request_id_propagation',
        'trace_id_propagation',
        'timeout_ms_option',
        'abort_signal_option',
        'idempotency_key_required_for_mutations'
      ],
      mutatingMethodsRequiringIdempotency: ['POST', 'PUT', 'PATCH', 'DELETE'],
      requiredMutationIdempotencyPolicy: 'required_idempotency_key'
    });
    expect(plan.operationIds).toEqual([
      'core.auth.registrations.create',
      'core.auth.sessions.create',
      'core.auth.sessions.refresh',
      'core.auth.sessions.revoke_current',
      'core.auth.sessions.get_current',
      'core.auth.product_link_challenges.create',
      'core.auth.product_link_challenges.complete',
      'core.auth.product_link_challenges.exchange',
      'core.auth.recovery_requests.create',
      'core.auth.passkey_challenges.create',
      'core.auth.passkey_assertions.verify',
      'core.auth.oauth_callbacks.accept',
      'core.referral.uses.create',
      'money.referral_rewards.status.get'
    ]);
    expect(plan.typedFetchOperationMap).toMatchObject({
      'core.auth.sessions.create': {
        operationId: 'core.auth.sessions.create',
        method: 'POST',
        path: '/v1/auth/sessions',
        successStatuses: [201],
        requestSchemaRef:
          'contracts/apis/core-api/auth-session.yaml#AuthSessionCreateRequest',
        responseSchemaRef:
          'contracts/apis/core-api/auth-session.yaml#AuthSessionCreateResponse',
        authRequired: false,
        idempotency: 'required_idempotency_key',
        requestIdRequired: true,
        traceIdRequired: true,
        errorCodes: expect.arrayContaining([
          'authentication_failed',
          'idempotency_conflict'
        ])
      },
      'core.auth.sessions.get_current': {
        method: 'GET',
        path: '/v1/auth/sessions/current',
        authRequired: true,
        idempotency: 'not_required',
        requestSchemaRef:
          'contracts/apis/core-api/auth-session-consumer.yaml#AuthSessionCurrentGetRequest',
        responseSchemaRef:
          'contracts/apis/core-api/auth-session-consumer.yaml#AuthSessionCurrentGetResponse'
      },
      'money.referral_rewards.status.get': {
        method: 'GET',
        path: '/v1/referrals/uses/{referral_use_ref}/reward-status',
        authRequired: true,
        idempotency: 'not_required'
      }
    });
    expect(plan.schemaModelMap).toMatchObject({
      'contracts/apis/core-api/auth-session.yaml#AuthSessionCreateRequest': {
        schemaRef:
          'contracts/apis/core-api/auth-session.yaml#AuthSessionCreateRequest',
        schemaId: 'AuthSessionCreateRequest',
        sourceContract: 'contracts/apis/core-api/auth-session.yaml',
        serviceId: 'core-api',
        ownerBoundary: 'identity',
        status: 'contract-only',
        kind: 'request',
        carriesSecretMaterial: true,
        requiredFields: ['login_identifier', 'verifier'],
        optionalFields: [],
        secretFields: ['verifier'],
        sessionEffect: null
      },
      'contracts/apis/core-api/product-link.yaml#ProductLinkChallengeExchangeResponse': {
        kind: 'response',
        requiredFields: [
          'link_receipt_ref',
          'subject_ref',
          'consent_receipt_ref',
          'verified_at'
        ],
        optionalFields: ['workspace_ref'],
        sessionEffect: 'none'
      },
      'contracts/apis/money-api/referral-reward.yaml#ReferralRewardStatusGetResponse': {
        schemaId: 'ReferralRewardStatusGetResponse',
        serviceId: 'money-api',
        ownerBoundary: 'money',
        kind: 'response',
        requiredFields: expect.arrayContaining([
          'reward_status',
          'campaign_policy_version'
        ]),
        sessionEffect: 'none'
      }
    });
    expect(Object.keys(plan.typedFetchOperationMap)).toEqual([
      ...plan.operationIds
    ]);
    for (const operation of Object.values(plan.typedFetchOperationMap)) {
      expect(plan.schemaModelMap[operation.requestSchemaRef]).toBeDefined();
      expect(plan.schemaModelMap[operation.responseSchemaRef]).toBeDefined();
    }
    expect(plan.outputs.map((output) => output.kind)).toEqual([
      'openapi',
      'sdk_generation_input',
      'webhook_schema',
      'docs_contract'
    ]);
    expect(
      plan.outputs.find((output) => output.kind === 'openapi')?.requiredMetadata
    ).toContain('operation_id');
    expect(
      plan.outputs.find((output) => output.kind === 'openapi')
        ?.requiredMetadata
    ).toContain('success_statuses');
    expect(
      plan.outputs.find((output) => output.kind === 'openapi')
        ?.sourceContracts
    ).toContain('contracts/apis/catalog.yaml');
    expect(
      plan.outputs.find((output) => output.kind === 'openapi')
        ?.sourceContracts
    ).toContain('contracts/apis/core-api/auth-session.yaml');
    expect(
      plan.outputs.find((output) => output.kind === 'docs_contract')?.forbiddenValues
    ).toContain('authorization_header');
    expect(
      plan.outputs.find((output) => output.kind === 'docs_contract')
        ?.requiredMetadata
    ).toContain('success_statuses');
  });

  it('fails when SDK input no longer mirrors route metadata', () => {
    const contracts = loadCommittedContracts();
    const result = buildApiExportPlan({
      ...contracts,
      route: {
        ...contracts.route,
        requiredPerRoute: [
        ...contracts.route.requiredPerRoute,
          'cost_metering_ref'
        ]
      },
      apiCatalog: {
        ...contracts.apiCatalog,
        routeDefinitionRequiredFields: [
          ...contracts.apiCatalog.routeDefinitionRequiredFields,
          'cost_metering_ref'
        ]
      }
    });

    expect(result.ok).toBe(false);
    expect(result.plan).toBeNull();
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_EXPORT_PLAN_ROUTE_METADATA_DRIFT'
    );
  });

  it('fails when SDK input drops traceable error metadata', () => {
    const contracts = loadCommittedContracts();
    const result = buildApiExportPlan({
      ...contracts,
      errorEnvelope: {
        ...contracts.errorEnvelope,
        optionalFields: [
          ...contracts.errorEnvelope.optionalFields,
          'support_ticket_url'
        ]
      }
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_EXPORT_PLAN_ERROR_METADATA_DRIFT'
    );
  });

  it('fails when SDK input drops typed fetch client runtime metadata', () => {
    const contracts = loadCommittedContracts();
    const result = buildApiExportPlan({
      ...contracts,
      sdkGenerationInput: {
        ...contracts.sdkGenerationInput,
        requiredClientRuntimeMetadata:
          contracts.sdkGenerationInput.requiredClientRuntimeMetadata.filter(
            (metadata) => metadata !== 'abort_signal_option'
          )
      }
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_SDK_CLIENT_RUNTIME_METADATA_MISSING'
    );
  });

  it('fails when API catalog no longer mirrors SDK route metadata', () => {
    const contracts = loadCommittedContracts();
    const result = buildApiExportPlan({
      ...contracts,
      apiCatalog: {
        ...contracts.apiCatalog,
        routeDefinitionRequiredFields:
          contracts.apiCatalog.routeDefinitionRequiredFields.filter(
            (field) => field !== 'success_statuses'
          )
      }
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_CATALOG_ROUTE_FIELD_MISSING'
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
    ),
    productLinkHandoff: parseProductLinkHandoffContract(
      readFileSync(
        join(
          process.cwd(),
          'contracts',
          'apis',
          'core-api',
          'product-link.yaml'
        ),
        'utf8'
      )
    ),
    calculatorCatalog: parseCalculatorCatalogContract(
      readFileSync(
        join(process.cwd(), 'contracts', 'calculators', 'catalog.yaml'),
        'utf8'
      )
    ),
    calculatorConformance: parseCalculatorConformanceContract(
      readFileSync(
        join(process.cwd(), 'contracts', 'calculators', 'conformance.yaml'),
        'utf8'
      )
    ),
    schemaBundles: [
      parseApiSchemaBundleContract(
        readFileSync(
          join(
            process.cwd(),
            'contracts',
            'apis',
            'core-api',
            'product-link.yaml'
          ),
          'utf8'
        ),
        'contracts/apis/core-api/product-link.yaml'
      ),
      parseApiSchemaBundleContract(
        readFileSync(
          join(
            process.cwd(),
            'contracts',
            'apis',
            'core-api',
            'auth-session-consumer.yaml'
          ),
          'utf8'
        ),
        'contracts/apis/core-api/auth-session-consumer.yaml'
      ),
      parseApiSchemaBundleContract(
        readFileSync(
          join(
            process.cwd(),
            'contracts',
            'apis',
            'core-api',
            'auth-session.yaml'
          ),
          'utf8'
        ),
        'contracts/apis/core-api/auth-session.yaml'
      ),
      parseApiSchemaBundleContract(
        readFileSync(
          join(process.cwd(), 'contracts', 'apis', 'core-api', 'referral.yaml'),
          'utf8'
        ),
        'contracts/apis/core-api/referral.yaml'
      ),
      parseApiSchemaBundleContract(
        readFileSync(
          join(
            process.cwd(),
            'contracts',
            'apis',
            'money-api',
            'referral-reward.yaml'
          ),
          'utf8'
        ),
        'contracts/apis/money-api/referral-reward.yaml'
      )
    ]
  };
}
