import { describe, expect, it } from 'bun:test';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  ApiContractLoadError,
  loadApiContracts,
  parseAbuseChallengeContract,
  parseAccessDecisionContract,
  parseApiCatalogContract,
  parseApiSchemaBundleContract,
  parseCalculatorCatalogContract,
  parseCalculatorConformanceContract,
  parseCreditPurchaseContract,
  parseCustomerPolicyRegistryContract,
  parseErrorEnvelopeContract,
  parseOidcClientRegistryContract,
  parseOidcProductSessionContract,
  parseOidcProviderRuntimeContract,
  parseProductLinkHandoffContract,
  parseRouteContract,
  parseSdkGenerationInputContract,
  parseSensitiveActionAuthorizationContract,
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

  it('keeps abuse challenge evidence provider-neutral, single-use, and non-authoritative', () => {
    const contracts = loadCommittedContracts();

    expect(contracts.abuseChallenge.operationIds).toEqual([
      'platform.abuse.challenges.issue',
      'platform.abuse.challenges.redeem',
      'platform.abuse.verifications.verify',
      'platform.abuse.health.get'
    ]);
    expect(contracts.abuseChallenge.publicOperationIds).toEqual([
      'platform.abuse.challenges.issue',
      'platform.abuse.challenges.redeem'
    ]);
    expect(contracts.abuseChallenge.verificationReceiptSingleUse).toBe(true);
    expect(contracts.abuseChallenge.verificationConsumerOperationPolicy).toBe(
      'same_consumer_operation_ref_replays_success_different_ref_fails_closed'
    );
    expect(contracts.abuseChallenge.redeemRecoveryPolicy).toBe(
      'provider_success_persists_verified_state_before_finalization_and_same_idempotency_key_normalized_input_binding_replays_canonical_success'
    );
    expect(contracts.abuseChallenge.verificationReceiptDerivationPolicy).toBe(
      'keyed_deterministic_receipt_recoverable_by_key_id_without_plaintext_persistence'
    );
    expect(contracts.abuseChallenge.internalServiceProofPolicy).toBe(
      'versioned_key_id_bounded_timestamp_single_use_nonce_and_signed_envelope_bind_method_path_request_id_canonical_body_sha256_idempotency_key_permission_and_exact_binding'
    );
    expect(contracts.abuseChallenge.internalCallerFamilies).toEqual([
      'cloudflare_edge_gateway',
      'private_hetzner_service',
      'operator_health'
    ]);
    expect(contracts.abuseChallenge.publicOriginProtectionPolicy).toBe(
      'browser_uses_edge_only_origin_requires_transport_identity_and_versioned_request_proof_before_state_creation'
    );
    expect(contracts.abuseChallenge.internalCallerTopologyPolicy).toBe(
      'cloudflare_bff_uses_edge_gateway_hetzner_api_uses_private_internal_service_credential_health_uses_separate_operator_principal'
    );
    expect(contracts.abuseChallenge.credentialAmbiguityPolicy).toBe(
      'multiple_or_mismatched_credential_families_fail_closed_without_adapter_fallback'
    );
    expect(contracts.abuseChallenge.productAuthorityPolicy).toBe(
      'challenge_success_is_never_authentication_authorization_payment_or_domain_action_approval'
    );
    expect(contracts.abuseChallenge.providerAdapterOperations).toEqual([
      'issue',
      'verify',
      'health'
    ]);
    const verifyRequest = schemaBundleByFile(
      contracts,
      'contracts/apis/abuse-api/challenge.yaml'
    ).schemas.find((schema) => schema.id === 'AbuseVerificationVerifyRequest');
    expect(verifyRequest?.requiredFields).toContain('consumer_operation_ref');
  });

  it('rejects reusable abuse verification evidence and product-authority conflation', () => {
    const contracts = loadCommittedContracts();
    const result = validateApiContracts({
      ...contracts,
      abuseChallenge: {
        ...contracts.abuseChallenge,
        verificationReceiptSingleUse: false,
        verificationConsumerOperationPolicy:
          'different_consumer_operation_may_replay_success',
        redeemRecoveryPolicy: 'provider_success_may_be_forgotten',
        verificationReceiptDerivationPolicy: 'random_plaintext_only',
        publicOriginProtectionPolicy: 'browser_may_call_origin_directly',
        internalCallerFamilies: ['shared_caller'],
        internalCallerTopologyPolicy: 'all_callers_use_one_edge_key',
        credentialAmbiguityPolicy: 'try_every_adapter_until_one_passes',
        internalServiceProofPolicy: 'header_only_proof_may_ignore_request_body',
        productAuthorityPolicy: 'challenge_success_authorizes_product_write'
      }
    });

    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_ABUSE_CHALLENGE_RECEIPT_POLICY_INVALID'
    );
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_ABUSE_CHALLENGE_AUTHORITY_CONFLATION'
    );
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_ABUSE_CHALLENGE_INTERNAL_PROOF_POLICY_INVALID'
    );
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_ABUSE_CHALLENGE_PUBLIC_ORIGIN_PROTECTION_INVALID'
    );
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_ABUSE_CHALLENGE_CALLER_TOPOLOGY_INVALID'
    );
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_ABUSE_CHALLENGE_CREDENTIAL_AMBIGUITY_INVALID'
    );
  });

  it('keeps credit purchase on server-authoritative Money contracts', () => {
    const contracts = loadCommittedContracts();

    expect(contracts.creditPurchase.checkoutStates).toEqual([
      'created',
      'payment_pending',
      'credit_issuance_pending',
      'completed',
      'review_required',
      'failed',
      'cancelled',
      'expired'
    ]);
    expect(contracts.creditPurchase.paymentStates).toEqual([
      'not_started',
      'pending',
      'succeeded',
      'review_required',
      'failed',
      'cancelled',
      'expired'
    ]);
    expect(contracts.creditPurchase.creditIssuanceStates).toEqual([
      'not_started',
      'pending',
      'succeeded',
      'review_required',
      'failed'
    ]);
    expect(contracts.creditPurchase.returnReceiptStates).toEqual([
      'not_issued',
      'available',
      'consumed',
      'expired'
    ]);
    expect(contracts.creditPurchase.successRedirectIsPaymentEvidence).toBe(false);
    expect(contracts.creditPurchase.clientAmountsAuthoritative).toBe(false);
    expect(contracts.creditPurchase.returnReceiptSingleUse).toBe(true);
    expect(contracts.creditPurchase.providerSuccessCompletesCheckout).toBe(false);
    expect(contracts.creditPurchase.ledgerIssuanceRequiredForCompletion).toBe(true);
    expect(contracts.creditPurchase.returnReceiptPlaintextStored).toBe(false);
    expect(contracts.creditPurchase.returnReceiptDigestAlgorithm).toBe('sha256');
    expect(
      contracts.apiCatalog.routes
        .filter((route) => route.operationId.startsWith('money.credit_'))
        .map((route) => route.operationId)
    ).toEqual([...contracts.creditPurchase.operationIds]);
  });

  it('keeps checkout completion ledger-backed and receipt persistence digest-only', () => {
    const contracts = loadCommittedContracts();
    const bundle = schemaBundleByFile(
      contracts,
      'contracts/apis/money-api/credit-purchase.yaml'
    );
    const readBundle = schemaBundleByFile(
      contracts,
      'contracts/apis/money-api/credit-purchase-read.yaml'
    );

    expect(contracts.creditPurchase.authoritativePaymentEvidence).toEqual([
      'signed_provider_webhook',
      'provider_state_query',
      'reconciliation'
    ]);
    expect(contracts.creditPurchase.authoritativeCompletionEvidence).toEqual([
      'payment_status_succeeded',
      'credit_issuance_status_succeeded'
    ]);
    expect(
      bundle.schemas.find((schema) => schema.id === 'CreditCheckoutIntentCreateResponse')
    ).toMatchObject({
      requiredFields: expect.arrayContaining(['return_receipt_status'])
    });
    expect(
      bundle.schemas.find(
        (schema) => schema.id === 'CreditCheckoutReturnReceiptExchangeResponse'
      )
    ).toMatchObject({
      requiredFields: expect.arrayContaining(['return_receipt_status'])
    });
    expect(
      readBundle.schemas.find(
        (schema) => schema.id === 'CreditCheckoutIntentStatusGetResponse'
      )
    ).toMatchObject({
      optionalFields: ['payment_attempt_ref', 'ledger_issuance_ref']
    });
  });

  it('rejects provider-only completion and plaintext return receipt storage', () => {
    const contracts = loadCommittedContracts();
    const result = validateApiContracts({
      ...contracts,
      creditPurchase: {
        ...contracts.creditPurchase,
        providerSuccessCompletesCheckout: true,
        ledgerIssuanceRequiredForCompletion: false,
        returnReceiptPlaintextStored: true
      }
    });

    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(
      expect.arrayContaining([
        'API_CREDIT_PURCHASE_PROVIDER_SUCCESS_COMPLETES_CHECKOUT',
        'API_CREDIT_PURCHASE_LEDGER_ISSUANCE_NOT_REQUIRED',
        'API_CREDIT_PURCHASE_RETURN_RECEIPT_PLAINTEXT_STORED'
      ])
    );
  });

  it('rejects client-authoritative checkout amounts and reusable return receipts', () => {
    const contracts = loadCommittedContracts();
    const bundle = schemaBundleByFile(
      contracts,
      'contracts/apis/money-api/credit-purchase.yaml'
    );
    const schemas = bundle.schemas.map((schema) =>
      schema.id === 'CreditCheckoutIntentCreateRequest'
        ? { ...schema, optionalFields: [...schema.optionalFields, 'amount'] }
        : schema
    );
    const result = validateApiContracts({
      ...contracts,
      creditPurchase: {
        ...contracts.creditPurchase,
        returnReceiptSingleUse: false
      },
      schemaBundles: contracts.schemaBundles.map((candidate) =>
        candidate.file === bundle.file ? { ...candidate, schemas } : candidate
      )
    });

    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'API_CREDIT_PURCHASE_RETURN_RECEIPT_REUSABLE'
        }),
        expect.objectContaining({
          code: 'API_CREDIT_PURCHASE_CLIENT_AUTHORITY_FIELD_FORBIDDEN'
        })
      ])
    );
  });

  it('rejects extra credit-purchase request fields', () => {
    const contracts = loadCommittedContracts();
    const file = 'contracts/apis/money-api/credit-purchase.yaml';
    const bundle = schemaBundleByFile(contracts, file);
    const schemas = bundle.schemas.map((schema) =>
      schema.id === 'CreditCheckoutIntentCreateRequest'
        ? { ...schema, optionalFields: ['return_url', 'total_price'] }
        : schema.id === 'CreditCheckoutReturnReceiptExchangeRequest'
          ? { ...schema, optionalFields: ['provider_return_url'] }
          : schema
    );
    const result = validateApiContracts({
      ...contracts,
      schemaBundles: contracts.schemaBundles.map((candidate) =>
        candidate.file === file ? { ...candidate, schemas } : candidate
      )
    });
    expect(result.diagnostics.map((item) => item.code)).toContain(
      'API_CREDIT_PURCHASE_INTENT_SCHEMA_FIELD_SET_INVALID'
    );
    expect(result.diagnostics.map((item) => item.code)).toContain(
      'API_CREDIT_PURCHASE_RETURN_RECEIPT_SECRET_POLICY_INVALID'
    );
  });

  it('keeps customer policy selection server-authoritative and receipt-bound', () => {
    const contracts = loadCommittedContracts();
    const registry = contracts.customerPolicyRegistry;

    expect(registry.status).toBe('partial-staging-implementation');
    expect(registry.stagingImplementedOperationIds).toEqual([
      'core.consent.policy_sets.resolve'
    ]);
    expect(registry.contractOnlyOperationIds).toEqual([
      'core.consent.policy_documents.get',
      'core.consent.policy_receipts.create',
      'core.consent.policy_receipts.get'
    ]);
    expect(registry.resolveRoute).toBe(
      'POST /v1/customer-policy-sets/resolve'
    );
    expect(registry.productionRouteReady).toBe(false);
    const policyBundle = schemaBundleByFile(
      contracts,
      'contracts/apis/core-api/customer-policy-registry.yaml'
    );
    expect(
      policyBundle.schemas.find(
        (schema) => schema.id === 'CustomerPolicySetResolveResponse'
      )?.requiredFields
    ).toContain('expires_at');
    expect(registry.authority).toBe('core_consent');
    expect(registry.requiredResolutionBindings).toEqual([
      'product_ref',
      'environment',
      'capability',
      'locale'
    ]);
    expect(registry.versionSelectionPolicy).toBe(
      'server_only_exact_policy_set_resolution'
    );
    expect(registry.rightsSurfaceAvailabilityPolicy).toBe(
      'support_refund_export_deletion_and_policy_browsing_remain_available'
    );
  });

  it('rejects client-selected policy versions in resolve and receipt requests', () => {
    const contracts = loadCommittedContracts();
    const file = 'contracts/apis/core-api/customer-policy-registry.yaml';
    const bundle = schemaBundleByFile(contracts, file);
    const schemas = bundle.schemas.map((schema) =>
      schema.id === 'CustomerPolicySetResolveRequest'
        ? {
            ...schema,
            optionalFields: [...schema.optionalFields, 'policy_set_revision']
          }
        : schema
    );
    const result = validateApiContracts({
      ...contracts,
      schemaBundles: contracts.schemaBundles.map((candidate) =>
        candidate.file === file ? { ...candidate, schemas } : candidate
      )
    });

    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'API_CUSTOMER_POLICY_CLIENT_AUTHORITY_FIELD_FORBIDDEN'
        })
      ])
    );
  });

  it('rejects ordered policy digest fields in requests', () => {
    const contracts = loadCommittedContracts();
    const file = 'contracts/apis/core-api/customer-policy-registry.yaml';
    const bundle = schemaBundleByFile(contracts, file);
    const schemas = bundle.schemas.map((schema) =>
      schema.id === 'CustomerPolicySetResolveRequest'
        ? { ...schema, optionalFields: [...schema.optionalFields, 'ordered_content_digests'] }
        : schema
    );
    const result = validateApiContracts({
      ...contracts,
      schemaBundles: contracts.schemaBundles.map((candidate) =>
        candidate.file === file ? { ...candidate, schemas } : candidate
      )
    });
    expect(result.diagnostics.map((item) => item.code)).toContain(
      'API_CUSTOMER_POLICY_CLIENT_AUTHORITY_FIELD_FORBIDDEN'
    );
  });

  it('keeps product web sign-in on the proposed OIDC BFF handoff boundary', () => {
    const contracts = loadCommittedContracts();
    const registration = schemaBundleByFile(
      contracts,
      'contracts/apis/core-api/auth-session.yaml'
    ).schemas.find((schema) => schema.id === 'AuthRegistrationCreateRequest');

    expect(registration).toMatchObject({
      carriesSecretMaterial: true,
      secretMaterialPolicy: 'password_verifier_input_only_never_echo',
      requiredFields: ['login_id', 'password', 'policy_set_resolution_ref'],
      optionalFields: ['locale'],
      secretFields: ['password']
    });
    expect(contracts.oidcProductSession).toMatchObject({
      status: 'proposed-contract',
      protocolProfile: 'openid_connect_authorization_code_flow',
      oauthSecurityBaseline: 'oauth_2_0_security_bcp_rfc9700',
      oauth21Status: 'draft_profile_not_final_rfc',
      pkceMethod: 'S256',
      exactRedirectUriMatchRequired: true,
      wildcardRedirectUriForbidden: true,
      arbitraryReturnToForbidden: true,
      authorizationCodeSingleUse: true,
      productSessionOwner: 'product_bff_binding_only',
      centralSessionOwner: 'core_identity',
      authorizationOwner: 'core_access_per_protected_action',
      authenticationIsAuthorization: false
    });
    expect(contracts.oidcClientRegistry).toMatchObject({
      schemaVersion: 2,
      status: 'proposed-contract',
      authority: 'core_identity',
      environment: 'staging',
      registryRevision: 1,
      updatePolicy: 'compare_and_swap_registry_revision_and_audit_receipt',
      lifecycle: {
        states: ['disabled', 'active', 'suspended', 'retired'],
        terminalStates: ['retired']
      },
      entries: [
        {
          clientId: 'zdp-web-public-staging',
          productRef: 'web-public-home',
          ownerRef: 'zdp-web-public',
          entryRevision: 1,
          status: 'disabled',
          clientType: 'confidential',
          tokenEndpointAuthMethod: 'private_key_jwt',
          runtimeBoundary: 'product_bff_required_static_site_forbidden',
          activationEvidenceRefs: []
        }
      ]
    });
    expect(contracts.oidcProviderRuntime).toMatchObject({
      status: 'proposed-contract',
      pilotEnvironment: 'staging',
      issuer: 'https://account.staging.8ailors.xyz',
      authorizationCodeTtlSeconds: 60,
      authorizationCodeSingleUse: true,
      accessTokenTtlSeconds: 300,
      idTokenTtlSeconds: 300,
      refreshTokenPolicy: 'not_issued_in_first_staging_pilot',
      clientAssertionTtlSeconds: 60,
      clientAssertionJtiSingleUse: true,
      signingAlgorithm: 'RS256',
      revocationMaxStalenessSeconds: 60
    });
  });

  it('rejects OIDC handoff drift toward arbitrary redirects or global product access', () => {
    const contracts = loadCommittedContracts();
    const result = validateApiContracts({
      ...contracts,
      oidcProductSession: {
        ...contracts.oidcProductSession,
        arbitraryReturnToForbidden: false,
        authenticationIsAuthorization: true,
        requiredClientRegistryFields: ['client_id']
      }
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(
      expect.arrayContaining([
        'API_OIDC_REDIRECT_OR_CODE_POLICY_INVALID',
        'API_OIDC_SESSION_OR_AUTHORIZATION_BOUNDARY_INVALID',
        'API_OIDC_CLIENT_REGISTRY_FIELD_MISSING'
      ])
    );
  });

  it('rejects activation of the static public site as an OIDC callback runtime', () => {
    const contracts = loadCommittedContracts();
    const client = contracts.oidcClientRegistry.entries[0];
    if (client === undefined) {
      throw new Error('Expected the first staging OIDC client fixture.');
    }
    const result = validateApiContracts({
      ...contracts,
      oidcClientRegistry: {
        ...contracts.oidcClientRegistry,
        entries: [
          {
            ...client,
            status: 'active',
            exactRedirectUris: ['https://*.staging.8ailors.xyz/auth/callback'],
            runtimeBoundary: 'static_site_callback_handler'
          }
        ]
      }
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(
      expect.arrayContaining([
        'API_OIDC_CLIENT_REGISTRY_FIXTURE_IDENTITY_INVALID',
        'API_OIDC_CLIENT_REGISTRY_REDIRECT_INVALID',
        'API_OIDC_CLIENT_REGISTRY_RUNTIME_BOUNDARY_INVALID',
        'API_OIDC_CLIENT_REGISTRY_ACTIVATION_EVIDENCE_MISSING'
      ])
    );
  });

  it('rejects duplicate clients and cross-environment registry entries', () => {
    const contracts = loadCommittedContracts();
    const client = contracts.oidcClientRegistry.entries[0];
    if (client === undefined) {
      throw new Error('Expected the first staging OIDC client fixture.');
    }
    const result = validateApiContracts({
      ...contracts,
      oidcClientRegistry: {
        ...contracts.oidcClientRegistry,
        entries: [
          client,
          {
            ...client,
            environment: 'production',
            entryRevision: 0
          }
        ]
      }
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(
      expect.arrayContaining([
        'API_OIDC_CLIENT_REGISTRY_CLIENT_ID_DUPLICATE',
        'API_OIDC_CLIENT_REGISTRY_ENTRY_BOUNDARY_INVALID'
      ])
    );
  });

  it('fails closed for active OIDC clients without modeled evidence binding', () => {
    const contracts = loadCommittedContracts();
    const client = contracts.oidcClientRegistry.entries[0];
    if (client === undefined) throw new Error('Expected staging OIDC fixture.');
    const result = validateApiContracts({
      ...contracts,
      oidcClientRegistry: {
        ...contracts.oidcClientRegistry,
        entries: [{ ...client, status: 'active', activationEvidenceRefs: ['placeholder'] }]
      }
    });
    expect(result.diagnostics.map((item) => item.code)).toContain(
      'API_OIDC_CLIENT_REGISTRY_ACTIVE_CLIENT_UNSUPPORTED'
    );
  });

  it('rejects unsafe redirect and browser-token grant drift', () => {
    const contracts = loadCommittedContracts();
    const client = contracts.oidcClientRegistry.entries[0];
    if (client === undefined) {
      throw new Error('Expected the first staging OIDC client fixture.');
    }
    const result = validateApiContracts({
      ...contracts,
      oidcClientRegistry: {
        ...contracts.oidcClientRegistry,
        entries: [
          {
            ...client,
            exactRedirectUris: [
              'https://operator:secret@web-public.staging.8ailors.xyz/auth/callback#token'
            ],
            allowedGrantTypes: ['implicit'],
            allowedResponseTypes: ['token'],
            allowedPkceMethods: ['plain']
          }
        ]
      }
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(
      expect.arrayContaining([
        'API_OIDC_CLIENT_REGISTRY_REDIRECT_INVALID',
        'API_OIDC_CLIENT_REGISTRY_GRANT_INVALID',
        'API_OIDC_CLIENT_REGISTRY_FIXTURE_CONFIGURATION_INVALID'
      ])
    );
  });

  it('rejects unreviewed registry lifecycle and authority drift', () => {
    const contracts = loadCommittedContracts();
    const result = validateApiContracts({
      ...contracts,
      oidcClientRegistry: {
        ...contracts.oidcClientRegistry,
        registryRevision: 0,
        updatePolicy: 'last_write_wins',
        clientIdReusePolicy: 'reuse_after_retirement',
        lifecycle: {
          ...contracts.oidcClientRegistry.lifecycle,
          states: ['active', 'deleted'],
          transitions: []
        },
        requiredAuditEvents: ['oidc_client.activated']
      }
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(
      expect.arrayContaining([
        'API_OIDC_CLIENT_REGISTRY_BOUNDARY_INVALID',
        'API_OIDC_CLIENT_REGISTRY_AUTHORITY_POLICY_INVALID',
        'API_OIDC_CLIENT_REGISTRY_LIFECYCLE_INVALID',
        'API_OIDC_CLIENT_REGISTRY_TRANSITION_INVALID',
        'API_OIDC_CLIENT_REGISTRY_AUDIT_EVENT_MISSING'
      ])
    );
  });

  it('rejects long-lived or replayable first-pilot OIDC credentials', () => {
    const contracts = loadCommittedContracts();
    const result = validateApiContracts({
      ...contracts,
      oidcProviderRuntime: {
        ...contracts.oidcProviderRuntime,
        authorizationCodeTtlSeconds: 600,
        authorizationCodeSingleUse: false,
        refreshTokenPolicy: 'issued_to_browser',
        clientAssertionJtiSingleUse: false,
        productSessionAbsoluteMaxSeconds:
          contracts.oidcProviderRuntime.centralSessionAbsoluteSeconds + 1
      }
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(
      expect.arrayContaining([
        'API_OIDC_PROVIDER_RUNTIME_CODE_POLICY_INVALID',
        'API_OIDC_PROVIDER_RUNTIME_TOKEN_POLICY_INVALID',
        'API_OIDC_PROVIDER_RUNTIME_CLIENT_ASSERTION_INVALID',
        'API_OIDC_PROVIDER_RUNTIME_SESSION_POLICY_INVALID'
      ])
    );
  });

  it('keeps Core access decisions exact, fail-closed, and separate from current-session identity', () => {
    const contracts = loadCommittedContracts();
    const route = contracts.apiCatalog.routes.find(
      (candidate) =>
        candidate.operationId === 'core.access.authorization_decisions.create'
    );
    const accessBundle = schemaBundleByFile(
      contracts,
      'contracts/apis/core-api/access-decision.yaml'
    );
    const requestSchema = accessBundle.schemas.find(
      (schema) => schema.id === 'AccessAuthorizationDecisionCreateRequest'
    );
    const responseSchema = accessBundle.schemas.find(
      (schema) => schema.id === 'AccessAuthorizationDecisionCreateResponse'
    );
    const currentSessionResponse = schemaBundleByFile(
      contracts,
      'contracts/apis/core-api/auth-session-consumer.yaml'
    ).schemas.find((schema) => schema.id === 'AuthSessionCurrentGetResponse');

    expect(contracts.accessDecision).toMatchObject({
      status: 'contract-only',
      ownerBoundary: 'access',
      operationId: 'core.access.authorization_decisions.create',
      routePath: '/v1/access/authorization-decisions',
      decisionValues: ['allow', 'deny'],
      denialPolicy:
        'explicit_deny_no_match_missing_stale_unknown_or_dependency_failure_never_allows',
      reasonCodePolicy:
        'stable_safe_non_enumerating_code_without_raw_policy_or_relationship_details',
      evidenceRefPolicy: 'opaque_non_secret_non_bearer_audit_reference'
    });
    expect(route).toMatchObject({
      method: 'POST',
      successStatuses: [201],
      authRequired: true,
      ownerBoundary: 'access',
      tenantBoundary: 'core_resolved_scope',
      idempotency: 'required_idempotency_key',
      sessionEffect: 'none'
    });
    expect(requestSchema?.requiredFields).toEqual(
      contracts.accessDecision.requiredRequestBindings
    );
    expect(responseSchema?.requiredFields).toEqual(
      contracts.accessDecision.requiredResponseBindings
    );
    expect(currentSessionResponse?.requiredFields).toEqual([
      'session_ref',
      'actor_ref',
      'tenant_ref',
      'expires_at'
    ]);
  });

  it('rejects request-supplied authority and access fields in current-session identity', () => {
    const contracts = loadCommittedContracts();
    const result = validateApiContracts({
      ...contracts,
      schemaBundles: contracts.schemaBundles.map((bundle) => {
        if (bundle.file === 'contracts/apis/core-api/access-decision.yaml') {
          return {
            ...bundle,
            schemas: bundle.schemas.map((schema) =>
              schema.id === 'AccessAuthorizationDecisionCreateRequest'
                ? { ...schema, optionalFields: ['subject_ref'] }
                : schema
            )
          };
        }
        if (
          bundle.file ===
          'contracts/apis/core-api/auth-session-consumer.yaml'
        ) {
          return {
            ...bundle,
            schemas: bundle.schemas.map((schema) =>
              schema.id === 'AuthSessionCurrentGetResponse'
                ? {
                    ...schema,
                    requiredFields: [...schema.requiredFields, 'decision_ref']
                  }
                : schema
            )
          };
        }
        return bundle;
      })
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(
      expect.arrayContaining([
        'API_ACCESS_DECISION_REQUEST_TRUSTS_AUTHORITY_FIELD',
        'API_ACCESS_DECISION_CURRENT_SESSION_CONFLATION'
      ])
    );
  });

  it('rejects access-decision contracts that weaken deny or evidence semantics', () => {
    const contracts = loadCommittedContracts();
    const result = validateApiContracts({
      ...contracts,
      accessDecision: {
        ...contracts.accessDecision,
        decisionValues: ['allow', 'deny', 'unknown'],
        denialPolicy: 'dependency_failure_allows',
        evidenceRefPolicy: 'reusable_bearer_token',
        reasonCodePolicy: 'raw_policy_dump'
      },
      apiCatalog: {
        ...contracts.apiCatalog,
        routes: contracts.apiCatalog.routes.map((route) =>
          route.operationId === 'core.access.authorization_decisions.create'
            ? { ...route, errorCodes: [...route.errorCodes, 'access_denied'] }
            : route
        )
      }
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(
      expect.arrayContaining([
        'API_ACCESS_DECISION_DENIAL_POLICY_INVALID',
        'API_ACCESS_DECISION_EVIDENCE_POLICY_INVALID',
        'API_ACCESS_DECISION_REASON_CODE_POLICY_INVALID',
        'API_ACCESS_DECISION_VALUES_INVALID',
        'API_ACCESS_DECISION_DENY_AS_TRANSPORT_ERROR'
      ])
    );
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

  it('keeps sensitive-action authorization composite and audience-consumed', () => {
    const contracts = loadCommittedContracts();
    const authorization = contracts.sensitiveActionAuthorization;
    const receiptBundle = contracts.schemaBundles.find(
      (bundle) =>
        bundle.file ===
        'contracts/apis/core-api/sensitive-action-authorization.yaml'
    );
    const receipt = receiptBundle?.schemas.find(
      (schema) => schema.id === 'SensitiveActionAuthorizationReceipt'
    );

    expect(authorization.status).toBe('contract-only-no-live-route');
    expect(authorization.receiptFormat).toBe('opaque_reference');
    expect(authorization.ownerBoundaries).toEqual({
      assurance: 'identity',
      platformDecision: 'access',
      audienceDomainGuardAndConsumption: 'audience_product'
    });
    expect(authorization.issuerLifecycle.states).toEqual([
      'active',
      'expired',
      'revoked'
    ]);
    expect(authorization.issuerLifecycle.terminalStates).toEqual([
      'expired',
      'revoked'
    ]);
    expect(authorization.audienceConsumptionLifecycle.transitions).toEqual([
      {
        from: 'unused',
        event: 'domain_transaction_committed',
        to: 'consumed'
      }
    ]);
    expect(authorization.routeStatus).toBe('no_route_defined');
    expect(authorization.requiredConsumerControls).toContain(
      'domain_mutation_receipt_consumption_idempotency_and_audit_one_transaction'
    );
    expect(receipt?.requiredFields).toContain('session_generation_ref');
    expect(receipt?.requiredFields).toContain('decision_revision');
    expect(
      contracts.apiCatalog.routes.some((route) =>
        route.requestSchemaRef?.startsWith(
          'contracts/apis/core-api/sensitive-action-authorization.yaml#'
        )
      )
    ).toBe(false);
  });

  it('rejects unknown sensitive-action authorization fields', () => {
    const source = readFileSync(
      join(
        process.cwd(),
        'contracts',
        'apis',
        'core-api',
        'sensitive-action-authorization.yaml'
      ),
      'utf8'
    );

    expect(() =>
      parseSensitiveActionAuthorizationContract(
        source.replace(
          '  route_status: no_route_defined',
          '  route_status: no_route_defined\n  route_statuz: no_route_defined'
        )
      )
    ).toThrow(
      'contracts/apis/core-api/sensitive-action-authorization.yaml#sensitive_action_authorization must not declare unknown field `route_statuz`'
    );
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

  it('rejects extra product-link transitions and response refs', () => {
    const contracts = loadCommittedContracts();
    const result = validateApiContracts({
      ...contracts,
      productLinkHandoff: {
        ...contracts.productLinkHandoff,
        transitions: [
          ...contracts.productLinkHandoff.transitions,
          { from: 'consumed', event: 'exchange', to: 'approved' }
        ],
        exchangeResponseRefs: [
          ...contracts.productLinkHandoff.exchangeResponseRefs,
          'access_token'
        ]
      }
    });
    expect(result.diagnostics.map((item) => item.code)).toContain(
      'API_PRODUCT_LINK_TRANSITION_SET_INVALID'
    );
    expect(result.diagnostics.map((item) => item.code)).toContain(
      'API_PRODUCT_LINK_RESPONSE_REF_SET_INVALID'
    );
  });

  it('rejects sensitive-action route promotion and boundary drift', () => {
    const contracts = loadCommittedContracts();
    const route = routeByOperation(contracts, 'core.auth.registrations.create');
    const result = validateApiContracts({
      ...contracts,
      sensitiveActionAuthorization: {
        ...contracts.sensitiveActionAuthorization,
        routeStatus: 'live_route_ready'
      },
      apiCatalog: {
        ...contracts.apiCatalog,
        routes: [{
          ...route,
          requestSchemaRef: 'contracts/apis/core-api/sensitive-action-authorization.yaml#SensitiveActionAuthorizationReceiptVerifyRequest',
          responseSchemaRef: 'contracts/apis/core-api/sensitive-action-authorization.yaml#SensitiveActionAuthorizationReceiptVerifyResponse',
          ownerBoundary: 'access'
        }]
      }
    });
    const codes = result.diagnostics.map((item) => item.code);
    expect(codes).toContain('API_SENSITIVE_ACTION_BOUNDARY_INVALID');
    expect(codes).toContain('API_SENSITIVE_ACTION_ROUTE_FORBIDDEN');
  });

  it('rejects empty fields outside explicit bodyless request schemas', () => {
    const contracts = loadCommittedContracts();
    const file = 'contracts/apis/core-api/auth-session-consumer.yaml';
    const bundle = schemaBundleByFile(contracts, file);
    const schemas = bundle.schemas.map((schema) =>
      schema.id === 'AuthSessionCurrentGetResponse'
        ? { ...schema, requiredFields: [] }
        : schema
    );
    const result = validateApiContracts({
      ...contracts,
      schemaBundles: contracts.schemaBundles.map((candidate) =>
        candidate.file === file ? { ...candidate, schemas } : candidate
      )
    });
    expect(result.diagnostics.map((item) => item.code)).toContain(
      'API_SCHEMA_REQUIRED_FIELDS_EMPTY'
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
      'date-difference',
      'studycafe-seat-occupancy',
      'studycafe-break-even',
      'kiosk-roi',
      'unattended-labor-savings',
      'locker-revenue',
      'study-room-schedule-revenue',
      'security-cost-break-even',
      'discount',
      'age',
      'work-hours',
      'fuel-cost'
    ]);
    const reviewed = contracts.calculatorCatalog.definitions.filter(
      (definition) => definition.lifecycleStatus === 'reviewed'
    );
    expect(reviewed.map((definition) => definition.id)).toEqual([
      'percentage-change',
      'margin-markup',
      'break-even-point',
      'compound-interest',
      'data-transfer-time',
      'date-difference',
      'studycafe-seat-occupancy',
      'studycafe-break-even',
      'kiosk-roi',
      'unattended-labor-savings',
      'locker-revenue',
      'study-room-schedule-revenue',
      'security-cost-break-even',
      'discount',
      'age',
      'work-hours',
      'fuel-cost'
    ]);
    expect(
      reviewed
        .filter(
          (definition) =>
            definition.id !== 'date-difference' && definition.id !== 'age'
        )
        .every(
          (definition) =>
            definition.jurisdiction === 'global' &&
            definition.precisionPolicy ===
              'canonical_ascii_decimal_string_max_1000_digits' &&
            definition.roundingPolicy ===
              'caller_decimal_places_0_to_100_half_away_from_zero'
        )
    ).toBe(true);
    expect(
      reviewed.find((definition) => definition.id === 'date-difference')
    ).toMatchObject({
      precisionPolicy: 'exact_integer_calendar_days_years_0001_to_9999',
      roundingPolicy: 'not_applicable_exact_integer',
      compatibleEngineVersions: ['0.4.0', '0.5.0', '0.6.0']
    });
    expect(
      reviewed.find((definition) => definition.id === 'age')
    ).toMatchObject({
      precisionPolicy: 'exact_integer_calendar_days_years_0001_to_9999',
      roundingPolicy: 'not_applicable_exact_integer',
      compatibleEngineVersions: ['0.x']
    });
    expect(contracts.calculatorConformance.schemaVersion).toBe(2);
    expect(contracts.calculatorConformance.cases).toHaveLength(112);
    expect(
      reviewed.find((definition) => definition.id === 'compound-interest')
    ).toMatchObject({
      compatibleEngineVersions: ['0.4.0', '0.5.0', '0.6.0'],
      precisionPolicy: 'canonical_ascii_decimal_string_max_1000_digits',
      roundingPolicy: 'caller_decimal_places_0_to_100_half_away_from_zero'
    });
    expect(
      contracts.calculatorCatalog.definitions.find(
        (definition) => definition.id === 'data-transfer-time'
      )?.compatibleEngineVersions
    ).toEqual(['0.3.0', '0.4.0', '0.5.0', '0.6.0']);
    expect(
      reviewed.every((definition) =>
        definition.compatibleEngineVersions.some(
          (version) => version === '0.x' || version === '0.5.0'
        )
      )
    ).toBe(true);
    expect(
      ['compound-interest', 'data-transfer-time', 'date-difference'].every(
        (id) =>
          contracts.calculatorCatalog.definitions
            .find((definition) => definition.id === id)
            ?.compatibleEngineVersions.includes('0.6.0')
      )
    ).toBe(true);
    expect(
      reviewed
        .filter((definition) => [
          'studycafe-seat-occupancy',
          'studycafe-break-even',
          'kiosk-roi',
          'unattended-labor-savings',
          'locker-revenue',
          'study-room-schedule-revenue',
          'security-cost-break-even'
        ].includes(definition.id))
        .every((definition) =>
          definition.compatibleEngineVersions.includes('0.5.0')
        )
    ).toBe(true);
    expect(contracts.calculatorConformance.roundingMode).toBe(
      'half_away_from_zero'
    );
  });

  it('rejects screen-shaped fields in calculator definitions at parse time', () => {
    const source = readFileSync(
      join(process.cwd(), 'contracts', 'calculators', 'catalog.yaml'),
      'utf8'
    ).replace(
      '  - id: percentage-change\n    lifecycle_status: reviewed',
      '  - id: percentage-change\n    lifecycle_status: reviewed\n    screen_component_payload: forbidden'
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

  it('rejects calculator conformance unit and precision drift', () => {
    const contracts = loadCommittedContracts();
    const original = contracts.calculatorConformance.cases.find(
      (testCase) => testCase.id === 'data-transfer-time.decimal-gigabyte'
    );
    if (!original || original.expected.status !== 'success') {
      throw new Error('Expected the data transfer success fixture.');
    }
    const dataSize = original.input.data_size;
    const transferDuration = original.expected.output.transfer_duration;
    if (
      dataSize === undefined ||
      typeof dataSize === 'string' ||
      transferDuration === undefined
    ) {
      throw new Error('Expected unit-bearing data transfer fixture values.');
    }

    const invalidInputUnit = validateApiContracts({
      ...contracts,
      calculatorConformance: {
        ...contracts.calculatorConformance,
        cases: [
          {
            ...original,
            input: {
              ...original.input,
              data_size: { ...dataSize, unit: 'petabyte' }
            }
          },
          ...contracts.calculatorConformance.cases.filter(
            (testCase) => testCase.id !== original.id
          )
        ]
      }
    });
    expect(
      invalidInputUnit.diagnostics.map((diagnostic) => diagnostic.code)
    ).toContain('API_CALCULATOR_CONFORMANCE_INPUT_UNIT_INVALID');

    const invalidOutput = validateApiContracts({
      ...contracts,
      calculatorConformance: {
        ...contracts.calculatorConformance,
        cases: [
          {
            ...original,
            expected: {
              status: 'success',
              output: {
                ...original.expected.output,
                transfer_duration: {
                  value: '80.0',
                  unit: 'minutes'
                }
              }
            }
          },
          ...contracts.calculatorConformance.cases.filter(
            (testCase) => testCase.id !== original.id
          )
        ]
      }
    });
    const invalidOutputCodes = invalidOutput.diagnostics.map(
      (diagnostic) => diagnostic.code
    );
    expect(invalidOutputCodes).toContain(
      'API_CALCULATOR_CONFORMANCE_OUTPUT_UNIT_INVALID'
    );
    expect(invalidOutputCodes).toContain(
      'API_CALCULATOR_CONFORMANCE_OUTPUT_PRECISION_INVALID'
    );
  });

  it('requires successful conformance coverage for every enumerated input unit', () => {
    const contracts = loadCommittedContracts();
    const result = validateApiContracts({
      ...contracts,
      calculatorConformance: {
        ...contracts.calculatorConformance,
        cases: contracts.calculatorConformance.cases.filter(
          (testCase) => testCase.id !== 'data-transfer-time.size-tebibyte'
        )
      }
    });

    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_CALCULATOR_CONFORMANCE_UNIT_COVERAGE_MISSING'
    );
  });

  it('rejects successful conformance cases with undeclared enum values', () => {
    const contracts = loadCommittedContracts();
    const original = contracts.calculatorConformance.cases.find(
      (testCase) => testCase.id === 'date-difference.same-day-exclusive'
    );
    if (!original || original.expected.status !== 'success') {
      throw new Error('Expected the date-difference success fixture.');
    }
    const result = validateApiContracts({
      ...contracts,
      calculatorConformance: {
        ...contracts.calculatorConformance,
        cases: [
          {
            ...original,
            input: { ...original.input, boundary_mode: 'both' }
          },
          ...contracts.calculatorConformance.cases.filter(
            (testCase) => testCase.id !== original.id
          )
        ]
      }
    });

    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_CALCULATOR_CONFORMANCE_ENUM_VALUE_INVALID'
    );
  });

  it('keeps core auth session routes explicit in the API catalog with money, abuse, and support routes', () => {
    const contracts = loadCommittedContracts();

    expect(contracts.apiCatalog.status).toBe('route-catalog-contract-only');
    expect(contracts.apiCatalog.routes.map((route) => route.operationId)).toEqual([
      'platform.support.cases.create',
      'platform.support.case_detail_reads.create',
      'platform.support.case_status_changes.create',
      'platform.support.case_replies.create',
      'platform.support.reply_address_verifications.create',
      'core.consent.policy_sets.resolve',
      'core.auth.registrations.create',
      'core.auth.sessions.create',
      'core.auth.sessions.refresh',
      'core.auth.sessions.revoke_current',
      'core.auth.sessions.get_current',
      'core.admin.operator_session_context.get',
      'core.access.authorization_decisions.create',
      'core.auth.product_link_challenges.create',
      'core.auth.product_link_challenges.complete',
      'core.auth.product_link_challenges.exchange',
      'core.auth.recovery_requests.create',
      'core.auth.passkey_challenges.create',
      'core.auth.passkey_assertions.verify',
      'core.auth.oauth_callbacks.accept',
      'core.referral.uses.create',
      'money.referral_rewards.status.get',
      'money.credit_pack_catalog_projections.get',
      'money.credit_checkout_intents.create',
      'money.credit_checkout_intents.status.get',
      'money.credit_checkout_return_receipts.exchange',
      'platform.abuse.challenges.issue',
      'platform.abuse.challenges.redeem',
      'platform.abuse.verifications.verify',
      'platform.abuse.health.get'
    ]);
    const supportCreate = contracts.apiCatalog.routes.find(
      (route) => route.operationId === 'platform.support.cases.create'
    );
    expect(supportCreate).toMatchObject({
      method: 'POST',
      authRequired: false,
      permissionCheck: 'platform.support.public_case_create',
      tenantBoundary: 'pending_identity_or_organization',
      exportPolicy: 'edge_bff_only_transport_proof_and_deployment_registered_organization_not_direct_origin'
    });
    const replyAddressVerification = contracts.apiCatalog.routes.find(
      (route) => route.operationId === 'platform.support.reply_address_verifications.create'
    );
    expect(replyAddressVerification).toMatchObject({
      authRequired: false,
      permissionCheck: 'platform.support.public_reply_address_verify',
      exportPolicy: 'comm_verification_handoff_only_not_general_public_sdk'
    });
    const supportSchema = schemaBundleByFile(
      contracts,
      'contracts/apis/support-api/intake.yaml'
    ).schemas.find((schema) => schema.id === 'SupportCaseCreateRequest');
    expect(supportSchema?.requiredFields).not.toContain('organization_ref');
    expect(supportSchema?.requiredFields).not.toContain('edge_origin_proof');
    expect(supportSchema?.secretFields).toEqual(['abuse_verification_ref']);
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
        (route) => route.operationId === 'core.admin.operator_session_context.get'
      )
    ).toMatchObject({
      method: 'GET',
      path: '/v1/admin/session-context',
      authRequired: true,
      idempotency: 'not_required',
      permissionCheck: 'core.admin.operator_session.context.read',
      ownerBoundary: 'access',
      tenantBoundary: 'organization',
      exportPolicy: 'internal_admin_service_only_not_public_sdk',
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

  it('enforces explicit bodyless contracts for 204 responses', () => {
    const contracts = loadCommittedContracts();
    const revokeRoute = routeByOperation(contracts, 'core.auth.sessions.revoke_current');
    const bodyRoute = routeByOperation(contracts, 'core.auth.sessions.create');

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
        routes: contracts.apiCatalog.routes.map((route) =>
          route.operationId === revokeRoute.operationId
            ? {
                ...route,
                responseSchemaRef:
                  'contracts/apis/core-api/auth-session.yaml#AuthSessionRefreshResponse'
              }
            : route
        )
      }
    });
    expect(
      schemaOnNoContent.diagnostics.map((diagnostic) => diagnostic.code)
    ).toContain('API_CATALOG_ROUTE_NO_CONTENT_SCHEMA_FORBIDDEN');

    const missingBodySchema = validateApiContracts({
      ...contracts,
      apiCatalog: {
        ...contracts.apiCatalog,
        routes: contracts.apiCatalog.routes.map((route) =>
          route.operationId === bodyRoute.operationId
            ? { ...route, responseSchemaRef: null }
            : route
        )
      }
    });
    expect(
      missingBodySchema.diagnostics.map((diagnostic) => diagnostic.code)
    ).toContain('API_CATALOG_ROUTE_RESPONSE_SCHEMA_REQUIRED');

    const mixedBodyModes = validateApiContracts({
      ...contracts,
      apiCatalog: {
        ...contracts.apiCatalog,
        routes: contracts.apiCatalog.routes.map((route) =>
          route.operationId === revokeRoute.operationId
            ? { ...route, successStatuses: [200, 204] }
            : route
        )
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
      'contracts/apis/abuse-api/challenge.yaml',
      'contracts/apis/abuse-api/health.yaml',
      'contracts/apis/core-api/access-decision.yaml',
      'contracts/apis/core-api/auth-session-consumer.yaml',
      'contracts/apis/core-api/auth-session.yaml',
      'contracts/apis/core-api/customer-policy-registry.yaml',
      'contracts/apis/core-api/operator-session-context.yaml',
      'contracts/apis/core-api/product-link.yaml',
      'contracts/apis/core-api/referral.yaml',
      'contracts/apis/core-api/sensitive-action-authorization.yaml',
      'contracts/apis/money-api/credit-purchase-read.yaml',
      'contracts/apis/money-api/credit-purchase.yaml',
      'contracts/apis/money-api/referral-reward.yaml',
      'contracts/apis/support-api/intake.yaml'
    ]);
    expect(
      schemaBundleByFile(
        contracts,
        'contracts/apis/core-api/access-decision.yaml'
      ).schemas.map((schema) => schema.id)
    ).toContain('AccessAuthorizationDecisionCreateResponse');
    expect(
      schemaBundleByFile(
        contracts,
        'contracts/apis/core-api/auth-session-consumer.yaml'
      ).schemas.map((schema) => schema.id)
    ).toContain('AuthSessionCurrentGetRequest');
    expect(
      schemaBundleByFile(
        contracts,
        'contracts/apis/core-api/auth-session.yaml'
      ).schemas.map((schema) => schema.id)
    ).toContain('AuthSessionCreateRequest');
    expect(
      schemaBundleByFile(
        contracts,
        'contracts/apis/core-api/product-link.yaml'
      ).schemas.map((schema) => schema.id)
    ).toContain('ProductLinkChallengeExchangeResponse');
    expect(
      schemaBundleByFile(
        contracts,
        'contracts/apis/core-api/referral.yaml'
      ).schemas.map((schema) => schema.id)
    ).toContain('ReferralUseCreateRequest');
    expect(
      schemaBundleByFile(
        contracts,
        'contracts/apis/core-api/sensitive-action-authorization.yaml'
      ).schemas.map((schema) => schema.id)
    ).toContain('SensitiveActionAuthorizationReceiptVerifyResponse');
    expect(
      schemaBundleByFile(
        contracts,
        'contracts/apis/money-api/referral-reward.yaml'
      ).schemas.map((schema) => schema.id)
    ).toContain('ReferralRewardStatusGetResponse');
    expect(
      schemaBundleByFile(
        contracts,
        'contracts/apis/support-api/intake.yaml'
      ).schemas.map((schema) => schema.id)
    ).toContain('SupportCaseDetailReadResponse');
  });

  it('rejects traversing schema refs before reading outside contracts', async () => {
    const root = mkdtempSync(join(tmpdir(), 'zdp-api-contracts-traversal-'));
    const contractsRoot = join(root, 'contracts');
    cpSync(join(process.cwd(), 'contracts'), contractsRoot, { recursive: true });
    writeFileSync(
      join(contractsRoot, 'apis', 'catalog.yaml'),
      readFileSync(join(process.cwd(), 'contracts', 'apis', 'catalog.yaml'), 'utf8')
        .replace(
          'contracts/apis/core-api/customer-policy-registry.yaml#CustomerPolicySetResolveRequest',
          'contracts/apis/../../../outside.yaml#OutsideRequest'
        )
    );
    await expect(loadApiContracts(root)).rejects.toThrow(
      'must use contracts/apis/<service>/<file>.yaml#PascalCaseSchema'
    );
  });

  it('fails when a catalog route references a missing schema id', () => {
    const contracts = loadCommittedContracts();
    const route = routeByOperation(contracts, 'core.auth.registrations.create');
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
    const schemaBundle = schemaBundleByFile(
      contracts,
      'contracts/apis/core-api/auth-session.yaml'
    );
    const result = validateApiContracts({
      ...contracts,
      schemaBundles: contracts.schemaBundles.map((bundle) =>
        bundle.file === schemaBundle.file
          ? {
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
          : bundle
      )
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_CATALOG_ROUTE_SECRET_FIELD_ECHOED'
    );
  });

  it('fails when credential policy adds unsafe suffix text', () => {
    const contracts = loadCommittedContracts();
    const route = routeByOperation(contracts, 'core.auth.registrations.create');
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
    const route = routeByOperation(contracts, 'core.auth.registrations.create');
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
    const route = routeByOperation(contracts, 'core.auth.registrations.create');
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
    const route = routeByOperation(contracts, 'core.auth.registrations.create');
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
    const schemaBundle = schemaBundleByFile(
      contracts,
      'contracts/apis/core-api/auth-session.yaml'
    );
    const result = validateApiContracts({
      ...contracts,
      schemaBundles: contracts.schemaBundles.map((bundle) =>
        bundle.file === schemaBundle.file
          ? {
              ...schemaBundle,
              commonEnvelope: {
                ...schemaBundle.commonEnvelope,
                requiredRequestMetadata:
                  schemaBundle.commonEnvelope.requiredRequestMetadata.filter(
                    (metadata) => metadata !== 'idempotency_key'
                  )
              }
            }
          : bundle
      )
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_CATALOG_ROUTE_IDEMPOTENCY_METADATA_MISSING'
    );
  });

  it('fails when a non-idempotent route schema requires idempotency metadata', () => {
    const contracts = loadCommittedContracts();
    const schemaBundle = schemaBundleByFile(
      contracts,
      'contracts/apis/money-api/referral-reward.yaml'
    );
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

function routeByOperation(
  contracts: ApiContracts,
  operationId: string
): ApiRouteDefinition {
  const route = contracts.apiCatalog.routes.find(
    (candidate) => candidate.operationId === operationId
  );
  if (!route) {
    throw new Error(`Expected committed route \`${operationId}\`.`);
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

function schemaBundleByFile(
  contracts: ApiContracts,
  file: string
): ApiSchemaBundleContract {
  const schemaBundle = contracts.schemaBundles.find(
    (candidate) => candidate.file === file
  );
  if (!schemaBundle) {
    throw new Error(`Expected committed schema bundle \`${file}\`.`);
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
    abuseChallenge: parseAbuseChallengeContract(
      readFileSync(
        join(
          process.cwd(),
          'contracts',
          'apis',
          'abuse-api',
          'challenge.yaml'
        ),
        'utf8'
      )
    ),
    creditPurchase: parseCreditPurchaseContract(
      readFileSync(
        join(
          process.cwd(),
          'contracts',
          'apis',
          'money-api',
          'credit-purchase.yaml'
        ),
        'utf8'
      )
    ),
    customerPolicyRegistry: parseCustomerPolicyRegistryContract(
      readFileSync(
        join(
          process.cwd(),
          'contracts',
          'apis',
          'core-api',
          'customer-policy-registry.yaml'
        ),
        'utf8'
      )
    ),
    accessDecision: parseAccessDecisionContract(
      readFileSync(
        join(
          process.cwd(),
          'contracts',
          'apis',
          'core-api',
          'access-decision.yaml'
        ),
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
    sensitiveActionAuthorization: parseSensitiveActionAuthorizationContract(
      readFileSync(
        join(
          process.cwd(),
          'contracts',
          'apis',
          'core-api',
          'sensitive-action-authorization.yaml'
        ),
        'utf8'
      )
    ),
    oidcProductSession: parseOidcProductSessionContract(
      readFileSync(
        join(
          process.cwd(),
          'contracts',
          'apis',
          'core-api',
          'oidc-product-session.yaml'
        ),
        'utf8'
      )
    ),
    oidcClientRegistry: parseOidcClientRegistryContract(
      readFileSync(
        join(
          process.cwd(),
          'contracts',
          'apis',
          'core-api',
          'oidc-client-registry.yaml'
        ),
        'utf8'
      )
    ),
    oidcProviderRuntime: parseOidcProviderRuntimeContract(
      readFileSync(
        join(
          process.cwd(),
          'contracts',
          'apis',
          'core-api',
          'oidc-provider-runtime.yaml'
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
            'abuse-api',
            'challenge.yaml'
          ),
          'utf8'
        ),
        'contracts/apis/abuse-api/challenge.yaml'
      ),
      parseApiSchemaBundleContract(
        readFileSync(
          join(
            process.cwd(),
            'contracts',
            'apis',
            'abuse-api',
            'health.yaml'
          ),
          'utf8'
        ),
        'contracts/apis/abuse-api/health.yaml'
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
          join(
            process.cwd(),
            'contracts',
            'apis',
            'core-api',
            'operator-session-context.yaml'
          ),
          'utf8'
        ),
        'contracts/apis/core-api/operator-session-context.yaml'
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
            'core-api',
            'sensitive-action-authorization.yaml'
          ),
          'utf8'
        ),
        'contracts/apis/core-api/sensitive-action-authorization.yaml'
      ),
      parseApiSchemaBundleContract(
        readFileSync(
          join(
            process.cwd(),
            'contracts',
            'apis',
            'core-api',
            'customer-policy-registry.yaml'
          ),
          'utf8'
        ),
        'contracts/apis/core-api/customer-policy-registry.yaml'
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
      ),
      parseApiSchemaBundleContract(
        readFileSync(
          join(
            process.cwd(),
            'contracts',
            'apis',
            'core-api',
            'access-decision.yaml'
          ),
          'utf8'
        ),
        'contracts/apis/core-api/access-decision.yaml'
      ),
      parseApiSchemaBundleContract(
        readFileSync(
          join(
            process.cwd(),
            'contracts',
            'apis',
            'money-api',
            'credit-purchase-read.yaml'
          ),
          'utf8'
        ),
        'contracts/apis/money-api/credit-purchase-read.yaml'
      ),
      parseApiSchemaBundleContract(
        readFileSync(
          join(
            process.cwd(),
            'contracts',
            'apis',
            'money-api',
            'credit-purchase.yaml'
          ),
          'utf8'
        ),
        'contracts/apis/money-api/credit-purchase.yaml'
      ),
      parseApiSchemaBundleContract(
        readFileSync(
          join(process.cwd(), 'contracts', 'apis', 'support-api', 'intake.yaml'),
          'utf8'
        ),
        'contracts/apis/support-api/intake.yaml'
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
