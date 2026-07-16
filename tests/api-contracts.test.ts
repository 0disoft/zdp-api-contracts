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
  parseCalculatorConformanceContract,
  parseErrorEnvelopeContract,
  parseProductLinkHandoffContract,
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

  it('rejects unknown fields at API catalog object boundaries', () => {
    const source = readFileSync(
      join(process.cwd(), 'contracts', 'apis', 'catalog.yaml'),
      'utf8'
    );

    expect(() =>
      parseApiCatalogContract(`${source}\nroutez: []\n`)
    ).toThrow('contracts/apis/catalog.yaml must not declare unknown field `routez`');
    expect(() =>
      parseApiCatalogContract(
        source.replace(
          '  status: route-catalog-contract-only',
          '  status: route-catalog-contract-only\n  statuz: route-catalog-contract-only'
        )
      )
    ).toThrow(
      'contracts/apis/catalog.yaml#api_catalog must not declare unknown field `statuz`'
    );
  });

  it('keeps desktop product linking single-use and bound to S256 proof', () => {
    const contracts = loadCommittedContracts();
    const productLinkSchemas = contracts.schemaBundles.find(
      (bundle) => bundle.file === 'contracts/apis/core-api/product-link.yaml'
    );
    const exchangeResponse = productLinkSchemas?.schemas.find(
      (schema) => schema.id === 'ProductLinkChallengeExchangeResponse'
    );

    expect(contracts.productLinkHandoff.proofMethod).toBe('S256');
    expect(contracts.productLinkHandoff.challengeTtlSeconds).toBe(600);
    expect(contracts.productLinkHandoff.singleUseExchange).toBe(true);
    expect(contracts.productLinkHandoff.exchangeResponseRefs).toEqual([
      'subject_ref',
      'workspace_ref',
      'consent_receipt_ref',
      'link_receipt_ref',
      'verified_at'
    ]);
    expect(exchangeResponse?.optionalFields).toEqual(['workspace_ref']);
    expect(
      contracts.apiCatalog.routes
        .filter((route) => route.resource === 'product_link_challenge')
        .map((route) => route.operationId)
    ).toEqual([
      'core.auth.product_link_challenges.create',
      'core.auth.product_link_challenges.complete',
      'core.auth.product_link_challenges.exchange'
    ]);
  });

  it('rejects schema fields declared as both required and optional', () => {
    const contracts = loadCommittedContracts();
    const result = validateApiContracts({
      ...contracts,
      schemaBundles: contracts.schemaBundles.map((bundle) =>
        bundle.file === 'contracts/apis/core-api/product-link.yaml'
          ? {
              ...bundle,
              schemas: bundle.schemas.map((schema) =>
                schema.id === 'ProductLinkChallengeExchangeResponse'
                  ? {
                      ...schema,
                      optionalFields: [
                        ...schema.optionalFields,
                        'link_receipt_ref'
                      ]
                    }
                  : schema
              )
            }
          : bundle
      )
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_SCHEMA_FIELD_DECLARATION_OVERLAP'
    );
  });

  it('rejects reusable desktop product-link exchange', () => {
    const contracts = loadCommittedContracts();
    const result = validateApiContracts({
      ...contracts,
      productLinkHandoff: {
        ...contracts.productLinkHandoff,
        singleUseExchange: false
      }
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_PRODUCT_LINK_SINGLE_USE_REQUIRED'
    );
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
      contracts.calculatorCatalog.definitions.slice(0, 2).every(
        (definition) =>
          definition.jurisdiction === 'global' &&
          definition.lifecycleStatus === 'reviewed' &&
          definition.precisionPolicy ===
            'canonical_ascii_decimal_string_max_1000_digits' &&
          definition.roundingPolicy ===
            'caller_decimal_places_0_to_100_half_away_from_zero'
      )
    ).toBe(true);
    expect(contracts.calculatorConformance.cases).toHaveLength(11);
    expect(contracts.calculatorConformance.roundingMode).toBe(
      'half_away_from_zero'
    );
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

  it('rejects calculator conformance version drift', () => {
    const contracts = loadCommittedContracts();
    const result = validateApiContracts({
      ...contracts,
      calculatorConformance: {
        ...contracts.calculatorConformance,
        contractVersion: '2.0.0'
      }
    });

    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_CALCULATOR_CONFORMANCE_VERSION_MISMATCH'
    );
  });

  it('rejects unknown calculator conformance input fields', () => {
    const contracts = loadCommittedContracts();
    const firstCase = contracts.calculatorConformance.cases[0];
    if (!firstCase) {
      throw new Error('Expected a committed calculator conformance case.');
    }
    const result = validateApiContracts({
      ...contracts,
      calculatorConformance: {
        ...contracts.calculatorConformance,
        cases: [
          {
            ...firstCase,
            input: { ...firstCase.input, localized_value: '100' }
          },
          ...contracts.calculatorConformance.cases.slice(1)
        ]
      }
    });

    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_CALCULATOR_CONFORMANCE_FIELD_UNKNOWN'
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
      authRoutes.find(
        (route) => route.operationId === 'core.auth.sessions.revoke_current'
      )
    ).toMatchObject({
      method: 'DELETE',
      successStatuses: [204],
      responseSchemaRef: null,
      sessionEffect: 'revoke'
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

  it('enforces explicit bodyless contracts for 204 responses', () => {
    const contracts = loadCommittedContracts();
    const revokeRoute = routeAt(contracts, 3);
    const bodyRoute = routeAt(contracts, 1);

    expect(contracts.route.noContentSuccessStatuses).toEqual([204]);

    const missingNoContentClassification = validateApiContracts({
      ...contracts,
      route: {
        ...contracts.route,
        noContentSuccessStatuses: []
      }
    });
    expect(
      missingNoContentClassification.diagnostics.map(
        (diagnostic) => diagnostic.code
      )
    ).toContain('API_ROUTE_NO_CONTENT_SUCCESS_STATUS_MISSING');

    const schemaOnNoContent = validateApiContracts({
      ...contracts,
      apiCatalog: {
        ...contracts.apiCatalog,
        routes: [
          ...contracts.apiCatalog.routes.slice(0, 3),
          {
            ...revokeRoute,
            responseSchemaRef:
              'contracts/apis/core-api/auth-session.yaml#AuthSessionRefreshResponse'
          },
          ...contracts.apiCatalog.routes.slice(4)
        ]
      }
    });
    expect(
      schemaOnNoContent.diagnostics.map((diagnostic) => diagnostic.code)
    ).toContain('API_CATALOG_ROUTE_NO_CONTENT_SCHEMA_FORBIDDEN');

    const missingBodySchema = validateApiContracts({
      ...contracts,
      apiCatalog: {
        ...contracts.apiCatalog,
        routes: [
          contracts.apiCatalog.routes[0]!,
          { ...bodyRoute, responseSchemaRef: null },
          ...contracts.apiCatalog.routes.slice(2)
        ]
      }
    });
    expect(
      missingBodySchema.diagnostics.map((diagnostic) => diagnostic.code)
    ).toContain('API_CATALOG_ROUTE_RESPONSE_SCHEMA_REQUIRED');

    const mixedBodyModes = validateApiContracts({
      ...contracts,
      apiCatalog: {
        ...contracts.apiCatalog,
        routes: [
          ...contracts.apiCatalog.routes.slice(0, 3),
          { ...revokeRoute, successStatuses: [200, 204] },
          ...contracts.apiCatalog.routes.slice(4)
        ]
      }
    });
    expect(
      mixedBodyModes.diagnostics.map((diagnostic) => diagnostic.code)
    ).toContain('API_CATALOG_ROUTE_SUCCESS_BODY_MODE_AMBIGUOUS');
  });

  it('requires an explicit nullable response schema field in route YAML', () => {
    const source = readFileSync(
      join(process.cwd(), 'contracts', 'apis', 'catalog.yaml'),
      'utf8'
    );
    const withoutNoContentSchema = source.replace(
      '    response_schema_ref: null\n',
      ''
    );

    expect(() => parseApiCatalogContract(withoutNoContentSchema)).toThrow(
      'must declare nullable string field `response_schema_ref`'
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
      'contracts/apis/core-api/product-link.yaml',
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
      'ProductLinkChallengeExchangeResponse'
    );
    expect(contracts.schemaBundles[3]?.schemas.map((schema) => schema.id)).toContain(
      'ReferralUseCreateRequest'
    );
    expect(contracts.schemaBundles[4]?.schemas.map((schema) => schema.id)).toContain(
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

  it('fails when secret material policy adds unsafe suffix text', () => {
    const contracts = loadCommittedContracts();
    const result = validateApiContracts({
      ...contracts,
      schemaBundles: contracts.schemaBundles.map((bundle) => ({
        ...bundle,
        schemas: bundle.schemas.map((schema) =>
          schema.secretMaterialPolicy === 'verifier_input_only_never_echo'
            ? {
                ...schema,
                secretMaterialPolicy:
                  'verifier_input_only_never_echo_but_log_plaintext'
              }
            : schema
        )
      }))
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_SCHEMA_SECRET_MATERIAL_POLICY_INVALID'
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
    const schemaBundle = schemaBundleAt(contracts, 4);
    const result = validateApiContracts({
      ...contracts,
      schemaBundles: contracts.schemaBundles.map((bundle) =>
        bundle.file === schemaBundle.file
          ? {
              ...schemaBundle,
              commonEnvelope: {
                ...schemaBundle.commonEnvelope,
                requiredRequestMetadata: [
                  ...schemaBundle.commonEnvelope.requiredRequestMetadata,
                  'idempotency_key'
                ]
              }
            }
          : bundle
      )
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
    ),
    calculatorConformance: parseCalculatorConformanceContract(
      readFileSync(
        join(process.cwd(), 'contracts', 'calculators', 'conformance.yaml'),
        'utf8'
      )
    )
  };
}
