import { describe, expect, it } from 'bun:test';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  ApiContractLoadError,
  loadApiContracts,
  parseApiCatalogContract,
  parseApiSchemaBundleContract,
  parseCalculatorCatalogContract,
  parseErrorEnvelopeContract,
  parseRouteContract,
  parseSdkGenerationInputContract,
  parseWebhookContract
} from '../src/api-contracts/parser';
import { validateApiContracts } from '../src/api-contracts/validator';
import type {
  ApiContracts,
  ApiRouteDefinition,
  ApiSchemaBundleContract,
  CalculatorDefinition
} from '../src/api-contracts/types';

describe('api contract checker', () => {
  it('validates the committed API contracts', () => {
    const result = validateApiContracts(loadCommittedContracts());

    expect(result.diagnostics).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it('loads the reviewed global calculator batch with stable contract metadata', () => {
    const contracts = loadCommittedContracts();

    expect(contracts.calculatorCatalog.contractVersion).toBe('1.0.0');
    expect(
      contracts.calculatorCatalog.definitions.map((definition) => definition.id)
    ).toEqual([
      'percentage-change',
      'margin-markup',
      'break-even-point',
      'compound-interest',
      'data-transfer-time',
      'date-difference'
    ]);
    expect(
      contracts.calculatorCatalog.definitions.every(
        (definition) =>
          definition.jurisdiction === 'global' &&
          definition.lifecycleStatus === 'draft' &&
          definition.precisionPolicy === 'explicit_before_active' &&
          definition.roundingPolicy === 'explicit_before_active'
      )
    ).toBe(true);
  });

  it('rejects screen-shaped fields in calculator definitions at parse time', () => {
    const source = readFileSync(
      join(process.cwd(), 'contracts', 'calculators', 'catalog.yaml'),
      'utf8'
    ).replace(
      '    lifecycle_status: draft',
      '    lifecycle_status: draft\n    screen_component_payload: forbidden'
    );

    expect(() => parseCalculatorCatalogContract(source)).toThrow(
      'must not declare unknown field `screen_component_payload`'
    );
  });

  it('rejects duplicate calculator ids', () => {
    const contracts = loadCommittedContracts();
    const duplicate = calculatorAt(contracts, 0);
    const result = validateApiContracts({
      ...contracts,
      calculatorCatalog: {
        ...contracts.calculatorCatalog,
        definitions: [...contracts.calculatorCatalog.definitions, duplicate]
      }
    });

    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_CALCULATOR_ID_DUPLICATE'
    );
  });

  it('rejects unreviewed calculator value kinds', () => {
    const contracts = loadCommittedContracts();
    const definition = calculatorAt(contracts, 0);
    const firstInput = definition.inputs[0];
    if (!firstInput) {
      throw new Error('Expected percentage-change to have an input.');
    }
    const result = validateApiContracts({
      ...contracts,
      calculatorCatalog: {
        ...contracts.calculatorCatalog,
        definitions: [
          {
            ...definition,
            inputs: [{ ...firstInput, valueKind: 'localized_number' }, ...definition.inputs.slice(1)]
          },
          ...contracts.calculatorCatalog.definitions.slice(1)
        ]
      }
    });

    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_CALCULATOR_VALUE_KIND_INVALID'
    );
  });

  it('rejects calculator definition and catalog version drift', () => {
    const contracts = loadCommittedContracts();
    const definition = calculatorAt(contracts, 0);
    const result = validateApiContracts({
      ...contracts,
      calculatorCatalog: {
        ...contracts.calculatorCatalog,
        definitions: [
          { ...definition, contractVersion: '2.0.0' },
          ...contracts.calculatorCatalog.definitions.slice(1)
        ]
      }
    });

    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_CALCULATOR_VERSION_MISMATCH'
    );
  });

  it('keeps core auth session routes explicit in the API catalog with referral and money reward routes', () => {
    const contracts = loadCommittedContracts();

    expect(contracts.apiCatalog.status).toBe('route-catalog-contract-only');
    expect(contracts.apiCatalog.routes.map((route) => route.operationId)).toEqual([
      'core.auth.registrations.create',
      'core.auth.sessions.create',
      'core.auth.sessions.refresh',
      'core.auth.sessions.revoke_current',
      'core.auth.sessions.get_current',
      'core.auth.recovery_requests.create',
      'core.auth.passkey_challenges.create',
      'core.auth.passkey_assertions.verify',
      'core.auth.oauth_callbacks.accept',
      'core.referral.uses.create',
      'money.referral_rewards.status.get'
    ]);
    const authRoutes = contracts.apiCatalog.routes.filter((route) =>
      route.operationId.startsWith('core.auth.')
    );
    expect(
      authRoutes.every(
        (route) =>
          route.serviceId === 'core-api' &&
          route.ownerBoundary === 'identity' &&
          route.requestIdRequired &&
          route.traceIdRequired &&
          route.credentialPolicy ===
            'no_refresh_token_plaintext_no_provider_secret_no_authorization_or_cookie_header_payload'
      )
    ).toBe(true);
    expect(
      authRoutes.filter((route) => route.sessionEffect === 'issue').length
    ).toBe(3);
    expect(
      authRoutes.find((route) => route.operationId === 'core.auth.sessions.get_current')
    ).toMatchObject({
      method: 'GET',
      path: '/v1/auth/sessions/current',
      authRequired: true,
      idempotency: 'not_required',
      permissionCheck: 'core.identity.session.read_self',
      sessionEffect: 'none'
    });
    expect(
      contracts.apiCatalog.routes.find(
        (route) => route.operationId === 'core.referral.uses.create'
      )
    ).toMatchObject({
      serviceId: 'core-api',
      ownerBoundary: 'identity',
      tenantBoundary: 'personal_account',
      idempotency: 'required_idempotency_key'
    });
    expect(
      contracts.apiCatalog.routes.find(
        (route) => route.operationId === 'money.referral_rewards.status.get'
      )
    ).toMatchObject({
      serviceId: 'money-api',
      ownerBoundary: 'money',
      tenantBoundary: 'personal_account',
      idempotency: 'not_required'
    });
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

  it('fails when SDK generation input drops typed fetch runtime metadata', () => {
    const contracts = loadCommittedContracts();
    const result = validateApiContracts({
      ...contracts,
      sdkGenerationInput: {
        ...contracts.sdkGenerationInput,
        requiredClientRuntimeMetadata:
          contracts.sdkGenerationInput.requiredClientRuntimeMetadata.filter(
            (metadata) => metadata !== 'timeout_ms_option'
          )
      }
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_SDK_CLIENT_RUNTIME_METADATA_MISSING'
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
      'API_CATALOG_ROUTE_CREDENTIAL_POLICY_INVALID'
    );
  });

  it('loads schema bundles referenced by the catalog', async () => {
    const contracts = await loadApiContracts(process.cwd());

    expect(contracts.schemaBundles.map((bundle) => bundle.file)).toEqual([
      'contracts/apis/core-api/auth-session-consumer.yaml',
      'contracts/apis/core-api/auth-session.yaml',
      'contracts/apis/core-api/referral.yaml',
      'contracts/apis/money-api/referral-reward.yaml'
    ]);
    expect(contracts.schemaBundles[0]?.schemas.map((schema) => schema.id)).toContain(
      'AuthSessionCurrentGetRequest'
    );
    expect(contracts.schemaBundles[1]?.schemas.map((schema) => schema.id)).toContain(
      'AuthSessionCreateRequest'
    );
    expect(contracts.schemaBundles[2]?.schemas.map((schema) => schema.id)).toContain(
      'ReferralUseCreateRequest'
    );
    expect(contracts.schemaBundles[3]?.schemas.map((schema) => schema.id)).toContain(
      'ReferralRewardStatusGetResponse'
    );
  });

  it('fails when a catalog route references a missing schema id', () => {
    const contracts = loadCommittedContracts();
    const route = routeAt(contracts, 0);
    const result = validateApiContracts({
      ...contracts,
      apiCatalog: {
        ...contracts.apiCatalog,
        routes: [
          {
            ...route,
            requestSchemaRef:
              'contracts/apis/core-api/auth-session.yaml#MissingSchema'
          }
        ]
      }
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_CATALOG_ROUTE_SCHEMA_ID_MISSING'
    );
  });

  it('fails when a secret request field is echoed by the response schema', () => {
    const contracts = loadCommittedContracts();
    const schemaBundle = schemaBundleAt(contracts, 1);
    const result = validateApiContracts({
      ...contracts,
      schemaBundles: [
        {
          ...schemaBundle,
          schemas: schemaBundle.schemas.map((schema) =>
            schema.id === 'AuthSessionCreateResponse'
              ? {
                  ...schema,
                  requiredFields: [...schema.requiredFields, 'verifier']
                }
              : schema
          )
        }
      ]
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_CATALOG_ROUTE_SECRET_FIELD_ECHOED'
    );
  });

  it('fails when credential policy adds unsafe suffix text', () => {
    const contracts = loadCommittedContracts();
    const route = routeAt(contracts, 0);
    const result = validateApiContracts({
      ...contracts,
      apiCatalog: {
        ...contracts.apiCatalog,
        routes: [
          {
            ...route,
            credentialPolicy:
              'no_refresh_token_plaintext_no_provider_secret_no_authorization_or_cookie_header_payload_but_allow_cookie'
          }
        ]
      }
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_CATALOG_ROUTE_CREDENTIAL_POLICY_INVALID'
    );
  });

  it('fails when route operation ids or method paths are duplicated', () => {
    const contracts = loadCommittedContracts();
    const route = routeAt(contracts, 1);
    const duplicate = {
      ...route,
      requestSchemaRef:
        'contracts/apis/core-api/auth-session.yaml#AuthSessionCreateRequest',
      responseSchemaRef:
        'contracts/apis/core-api/auth-session.yaml#AuthSessionCreateResponse'
    };
    const result = validateApiContracts({
      ...contracts,
      apiCatalog: {
        ...contracts.apiCatalog,
        routes: [route, duplicate]
      }
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_CATALOG_ROUTE_OPERATION_ID_DUPLICATE'
    );
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_CATALOG_ROUTE_METHOD_PATH_DUPLICATE'
    );
  });

  it('fails when a public auth route uses a private permission check', () => {
    const contracts = loadCommittedContracts();
    const route = routeAt(contracts, 0);
    const result = validateApiContracts({
      ...contracts,
      apiCatalog: {
        ...contracts.apiCatalog,
        routes: [
          {
            ...route,
            permissionCheck: 'core.identity.registration.create'
          }
        ]
      }
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_CATALOG_PUBLIC_ROUTE_PERMISSION_CHECK_INVALID'
    );
  });

  it('fails when route boundary or idempotency values are outside the allowed set', () => {
    const contracts = loadCommittedContracts();
    const route = routeAt(contracts, 0);
    const result = validateApiContracts({
      ...contracts,
      apiCatalog: {
        ...contracts.apiCatalog,
        routes: [
          {
            ...route,
            idempotency: 'required',
            ownerBoundary: 'screen',
            tenantBoundary: 'floating'
          }
        ]
      }
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_CATALOG_ROUTE_IDEMPOTENCY_POLICY_INVALID'
    );
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_CATALOG_ROUTE_OWNER_BOUNDARY_INVALID'
    );
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_CATALOG_ROUTE_TENANT_BOUNDARY_INVALID'
    );
  });

  it('fails when an idempotent route schema drops idempotency metadata', () => {
    const contracts = loadCommittedContracts();
    const schemaBundle = schemaBundleAt(contracts, 1);
    const result = validateApiContracts({
      ...contracts,
      schemaBundles: [
        {
          ...schemaBundle,
          commonEnvelope: {
            ...schemaBundle.commonEnvelope,
            requiredRequestMetadata:
              schemaBundle.commonEnvelope.requiredRequestMetadata.filter(
                (metadata) => metadata !== 'idempotency_key'
              )
          }
        },
        ...contracts.schemaBundles.slice(1)
      ]
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_CATALOG_ROUTE_IDEMPOTENCY_METADATA_MISSING'
    );
  });

  it('fails when a non-idempotent route schema requires idempotency metadata', () => {
    const contracts = loadCommittedContracts();
    const schemaBundle = schemaBundleAt(contracts, 3);
    const result = validateApiContracts({
      ...contracts,
      schemaBundles: [
        ...contracts.schemaBundles.slice(0, 2),
        {
          ...schemaBundle,
          commonEnvelope: {
            ...schemaBundle.commonEnvelope,
            requiredRequestMetadata: [
              ...schemaBundle.commonEnvelope.requiredRequestMetadata,
              'idempotency_key'
            ]
          }
        }
      ]
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_CATALOG_ROUTE_IDEMPOTENCY_METADATA_UNEXPECTED'
    );
  });

  it('fails when schema bundles drop canonical forbidden values', () => {
    const contracts = loadCommittedContracts();
    const schemaBundle = schemaBundleAt(contracts, 0);
    const result = validateApiContracts({
      ...contracts,
      schemaBundles: [
        {
          ...schemaBundle,
          commonEnvelope: {
            ...schemaBundle.commonEnvelope,
            forbiddenPayloadValues:
              schemaBundle.commonEnvelope.forbiddenPayloadValues.filter(
                (value) => value !== 'refresh_token_plaintext'
              )
          }
        }
      ]
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_SCHEMA_BUNDLE_FORBIDDEN_VALUE_MISSING'
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

function routeAt(contracts: ApiContracts, index: number): ApiRouteDefinition {
  const route = contracts.apiCatalog.routes[index];
  if (!route) {
    throw new Error(`Expected committed route at index ${index}.`);
  }
  return route;
}

function schemaBundleAt(
  contracts: ApiContracts,
  index: number
): ApiSchemaBundleContract {
  const schemaBundle = contracts.schemaBundles[index];
  if (!schemaBundle) {
    throw new Error(`Expected committed schema bundle at index ${index}.`);
  }
  return schemaBundle;
}

function calculatorAt(
  contracts: ApiContracts,
  index: number
): CalculatorDefinition {
  const calculator = contracts.calculatorCatalog.definitions[index];
  if (!calculator) {
    throw new Error(`Expected committed calculator at index ${index}.`);
  }
  return calculator;
}

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
    schemaBundles: [
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
    ],
    calculatorCatalog: parseCalculatorCatalogContract(
      readFileSync(
        join(process.cwd(), 'contracts', 'calculators', 'catalog.yaml'),
        'utf8'
      )
    )
  };
}
