import { CANONICAL_FORBIDDEN_VALUES } from './forbidden-values.js';
const REQUIRED_CALCULATOR_DEFINITION_FIELDS = [
    'id',
    'lifecycle_status',
    'contract_version',
    'compatible_engine_versions',
    'jurisdiction',
    'precision_policy',
    'rounding_policy',
    'inputs',
    'outputs',
    'error_codes',
    'semantic_rules'
];
const REQUIRED_CALCULATOR_IDS = [
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
];
const ALLOWED_CALCULATOR_LIFECYCLE_STATUSES = [
    'draft',
    'reviewed',
    'active',
    'retired'
];
const ALLOWED_CALCULATOR_VALUE_KINDS = [
    'decimal',
    'integer',
    'date',
    'enum'
];
const ALLOWED_CALCULATOR_UNIT_DIMENSIONS = [
    'dimensionless',
    'percent',
    'currency',
    'count',
    'duration',
    'data_size',
    'data_rate',
    'date'
];
const ALLOWED_CALCULATOR_UNIT_POLICIES = [
    'none',
    'caller_supplied',
    'enumerated'
];
const STABLE_CALCULATOR_ERROR_CODES = [
    'invalid_input',
    'domain_error',
    'limit_exceeded',
    'contract_mismatch',
    'denominator_zero',
    'non_positive_contribution_margin',
    'unsupported_unit',
    'incompatible_units',
    'invalid_date_range',
    'precision_policy_required',
    'rounding_policy_required'
];
const REQUIRED_CALCULATOR_BASE_ERROR_CODES = [
    'invalid_input',
    'domain_error',
    'limit_exceeded',
    'contract_mismatch',
    'precision_policy_required',
    'rounding_policy_required'
];
const CALCULATOR_CATALOG_FILE = 'contracts/calculators/catalog.yaml';
const CALCULATOR_CONFORMANCE_FILE = 'contracts/calculators/conformance.yaml';
const REVIEWED_CALCULATOR_IDS = [
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
];
const DATE_DIFFERENCE_PRECISION_POLICY = 'exact_integer_calendar_days_years_0001_to_9999';
const DATE_DIFFERENCE_ROUNDING_POLICY = 'not_applicable_exact_integer';
const REVIEWED_DECIMAL_PRECISION_POLICY = 'canonical_ascii_decimal_string_max_1000_digits';
const REVIEWED_DECIMAL_ROUNDING_POLICY = 'caller_decimal_places_0_to_100_half_away_from_zero';
const CONFORMANCE_DECIMAL_INPUT_POLICY = 'canonical_ascii_decimal_string';
const CONFORMANCE_ROUNDING_MODE = 'half_away_from_zero';
const CONFORMANCE_MAX_INPUT_DIGITS = 1000;
const CONFORMANCE_MAX_DECIMAL_PLACES = 100;
const CALCULATOR_ID_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const CALCULATOR_FIELD_ID_PATTERN = /^[a-z][a-z0-9_]*$/;
const CALCULATOR_RULE_PATTERN = /^[a-z][a-z0-9_]*$/;
const CALCULATOR_VERSION_PATTERN = /^\d+\.\d+\.\d+$/;
const CALCULATOR_ENGINE_VERSION_PATTERN = /^(?:\d+\.x|\d+\.\d+\.\d+)$/;
const CANONICAL_CALCULATOR_DECIMAL_PATTERN = /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/;
const REQUIRED_ROUTE_FIELDS = [
    'resource',
    'action',
    'method',
    'path',
    'success_statuses',
    'auth_required',
    'permission_check',
    'audit_event',
    'idempotency',
    'owner_boundary',
    'tenant_boundary',
    'request_id_required',
    'trace_id_required',
    'session_effect',
    'credential_policy',
    'error_codes'
];
const ALLOWED_ROUTE_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const ALLOWED_SUCCESS_STATUSES = [200, 201, 202, 204];
const NO_CONTENT_SUCCESS_STATUSES = [204];
const ACCESS_DECISION_FILE = 'contracts/apis/core-api/access-decision.yaml';
const ACCESS_DECISION_OPERATION_ID = 'core.access.authorization_decisions.create';
const ACCESS_DECISION_ROUTE_PATH = '/v1/access/authorization-decisions';
const ACCESS_DECISION_VALUES = ['allow', 'deny'];
const ACCESS_DECISION_REQUEST_BINDINGS = [
    'product_ref',
    'action',
    'resource_type',
    'resource_ref',
    'requested_scope_type',
    'requested_scope_ref'
];
const ACCESS_DECISION_RESPONSE_BINDINGS = [
    'decision_ref',
    'decision',
    'reason_code',
    'policy_version',
    'data_revision',
    'subject_ref',
    'session_ref',
    'product_ref',
    'action',
    'resource_type',
    'resource_ref',
    'scope_type',
    'scope_ref',
    'decided_at',
    'decision_expires_at',
    'session_expires_at',
    'obligations'
];
const ACCESS_DECISION_TRUSTED_AUTHORITY_SOURCES = [
    'subject_and_session_from_verified_current_session',
    'scope_from_current_core_relationships',
    'policy_and_data_revision_from_core_access',
    'product_and_action_from_closed_core_catalog',
    'consent_is_input_fact_not_final_authorization'
];
const ACCESS_DECISION_FORBIDDEN_REQUEST_AUTHORITY_FIELDS = [
    'subject_ref',
    'session_ref',
    'tenant_ref',
    'role',
    'permission',
    'decision',
    'decision_ref',
    'policy_version',
    'data_revision',
    'obligations',
    'consent_receipt_ref'
];
const ACCESS_DECISION_FORBIDDEN_CONSUMER_USES = [
    'decision_ref_as_bearer_credential',
    'client_or_sdk_final_authorization',
    'reuse_for_different_product_action_resource_or_scope',
    'consent_receipt_as_authorization_decision',
    'current_session_identity_as_product_authorization'
];
const ACCESS_DECISION_FORBIDDEN_VALUES = [
    'password',
    'authorization_header',
    'cookie_header',
    'access_token',
    'refresh_token_plaintext',
    'provider_secret',
    'raw_provider_error',
    'raw_customer_payload',
    'raw_policy_document',
    'raw_relationship_payload'
];
const CREDIT_PURCHASE_FILE = 'contracts/apis/money-api/credit-purchase.yaml';
const CREDIT_PURCHASE_READ_FILE = 'contracts/apis/money-api/credit-purchase-read.yaml';
const CREDIT_PURCHASE_OPERATION_IDS = [
    'money.credit_pack_catalog_projections.get',
    'money.credit_checkout_intents.create',
    'money.credit_checkout_intents.status.get',
    'money.credit_checkout_return_receipts.exchange'
];
const CREDIT_PURCHASE_CHECKOUT_STATES = [
    'created',
    'payment_pending',
    'credit_issuance_pending',
    'completed',
    'review_required',
    'failed',
    'cancelled',
    'expired'
];
const CREDIT_PURCHASE_PAYMENT_STATES = [
    'not_started',
    'pending',
    'succeeded',
    'review_required',
    'failed',
    'cancelled',
    'expired'
];
const CREDIT_PURCHASE_CREDIT_ISSUANCE_STATES = [
    'not_started',
    'pending',
    'succeeded',
    'review_required',
    'failed'
];
const CREDIT_PURCHASE_RETURN_RECEIPT_STATES = [
    'not_issued',
    'available',
    'consumed',
    'expired'
];
const CREDIT_PURCHASE_NON_TERMINAL_STATES = [
    'created',
    'payment_pending',
    'credit_issuance_pending',
    'review_required'
];
const CREDIT_PURCHASE_TERMINAL_STATES = [
    'completed',
    'failed',
    'cancelled',
    'expired'
];
const CREDIT_PURCHASE_INTENT_BINDINGS = [
    'product_ref',
    'ship_tier_id',
    'scope_type',
    'scope_ref',
    'environment',
    'locale',
    'return_target_id'
];
const CREDIT_PURCHASE_SERVER_REVALIDATED_CLAIMS = [
    'product_ref',
    'ship_tier_id',
    'scope_type',
    'scope_ref',
    'environment',
    'account_payment_eligibility',
    'catalog_sale_state',
    'provider_capability'
];
const CREDIT_PURCHASE_SNAPSHOT_REFS = [
    'catalog_version',
    'price_snapshot_ref',
    'tax_snapshot_ref',
    'benefit_snapshot_ref'
];
const CREDIT_PURCHASE_SEPARATED_IDENTIFIERS = [
    'checkout_intent_ref',
    'operation_ref',
    'payment_attempt_ref',
    'provider_object_ref',
    'ledger_issuance_ref',
    'return_receipt_ref'
];
const CREDIT_PURCHASE_PAYMENT_EVIDENCE = [
    'signed_provider_webhook',
    'provider_state_query',
    'reconciliation'
];
const CREDIT_PURCHASE_COMPLETION_EVIDENCE = [
    'payment_status_succeeded',
    'credit_issuance_status_succeeded'
];
const CREDIT_PURCHASE_FORBIDDEN_URL_VALUES = [
    'provider_token',
    'payment_credential',
    'central_session',
    'raw_price_snapshot'
];
const CREDIT_PURCHASE_FORBIDDEN_CONSUMER_USES = [
    'client_supplied_price_or_credits_as_authority',
    'success_redirect_as_payment_proof',
    'return_receipt_as_reusable_bearer',
    'product_local_credit_issuance',
    'arbitrary_return_url'
];
const CREDIT_PURCHASE_CLIENT_AUTHORITY_FIELDS = [
    'amount',
    'currency',
    'credits',
    'bonus_credits',
    'tax_amount',
    'price_snapshot'
];
const CURRENT_SESSION_FORBIDDEN_ACCESS_FIELDS = [
    'decision',
    'decision_ref',
    'platform_access_granted',
    'access_evidence_ref',
    'policy_version',
    'obligations'
];
const OIDC_PRODUCT_SESSION_FILE = 'contracts/apis/core-api/oidc-product-session.yaml';
const OIDC_CLIENT_REGISTRY_FILE = 'contracts/apis/core-api/oidc-client-registry.yaml';
const OIDC_PROVIDER_RUNTIME_FILE = 'contracts/apis/core-api/oidc-provider-runtime.yaml';
const OIDC_AUTHORIZATION_BINDINGS = [
    'client_id',
    'exact_redirect_uri',
    'state',
    'nonce',
    'code_challenge',
    'code_challenge_method',
    'issuer',
    'requested_scope_refs',
    'requested_audience_refs'
];
const OIDC_TOKEN_EXCHANGE_BINDINGS = [
    'client_id',
    'authorization_code',
    'code_verifier',
    'exact_redirect_uri',
    'issuer'
];
const OIDC_CLIENT_REGISTRY_FIELDS = [
    'client_id',
    'product_ref',
    'owner_ref',
    'environment',
    'entry_revision',
    'application_type',
    'exact_redirect_uris',
    'exact_post_logout_redirect_uris',
    'allowed_scope_refs',
    'allowed_audience_refs',
    'allowed_grant_types',
    'allowed_response_types',
    'allowed_pkce_methods',
    'client_type',
    'token_endpoint_auth_method',
    'jwks_ref',
    'status',
    'status_reason',
    'session_policy_ref',
    'revocation_policy_ref',
    'key_rotation_policy_ref',
    'runtime_boundary',
    'callback_handler_ref',
    'activation_requirements',
    'activation_evidence_refs'
];
const OIDC_ACCESS_DECISION_BINDINGS = [
    'subject_ref',
    'product_ref',
    'tenant_ref',
    'resource_type',
    'resource_ref',
    'action',
    'policy_version'
];
const OIDC_INVALIDATION_EVENTS = [
    'central_session_revoked',
    'account_restricted',
    'account_deleted',
    'credential_compromised',
    'product_client_disabled'
];
const OIDC_FORBIDDEN_CONSUMER_USES = [
    'central_session_cookie_forwarded_to_product',
    'cross_product_session_cookie_reuse',
    'login_success_as_global_product_authorization',
    'product_bff_as_credential_or_account_truth',
    'arbitrary_return_to_redirect',
    'wildcard_redirect_uri',
    'unregistered_scope_or_audience',
    'callback_uri_selected_from_request_without_registry_match'
];
const OIDC_FORBIDDEN_VALUES = [
    'password',
    'authorization_header',
    'cookie_header',
    'access_token',
    'id_token',
    'refresh_token_plaintext',
    'client_secret_plaintext',
    'code_verifier_plaintext_at_rest',
    'authorization_code_plaintext_at_rest',
    'provider_secret',
    'raw_provider_error',
    'raw_customer_payload'
];
const OIDC_CLIENT_ACTIVATION_REQUIREMENTS = [
    'product_bff_deployed_in_staging',
    'staging_hostname_bound_and_tls_verified',
    'private_key_jwt_key_registered_without_plaintext_secret',
    'exact_callback_and_logout_smoke_passed',
    'central_session_revocation_smoke_passed',
    'core_access_denial_smoke_passed'
];
const OIDC_CLIENT_REGISTRY_LIFECYCLE_STATES = [
    'disabled',
    'active',
    'suspended',
    'retired'
];
const OIDC_CLIENT_REGISTRY_TRANSITIONS = [
    'disabled:active:activation_requirements_and_review_receipt',
    'active:suspended:security_or_operational_reason_and_revocation_receipt',
    'suspended:active:remediation_evidence_and_reactivation_review_receipt',
    'disabled:retired:retirement_reason_and_audit_receipt',
    'suspended:retired:retirement_reason_and_audit_receipt'
];
const OIDC_CLIENT_REGISTRY_IMMUTABLE_FIELDS = [
    'client_id',
    'product_ref',
    'environment',
    'client_type'
];
const OIDC_CLIENT_REGISTRY_SECURITY_SENSITIVE_FIELDS = [
    'exact_redirect_uris',
    'exact_post_logout_redirect_uris',
    'allowed_scope_refs',
    'allowed_audience_refs',
    'token_endpoint_auth_method',
    'jwks_ref',
    'session_policy_ref',
    'revocation_policy_ref',
    'runtime_boundary',
    'callback_handler_ref'
];
const OIDC_CLIENT_REGISTRY_AUDIT_EVENTS = [
    'oidc_client.registered',
    'oidc_client.activation_reviewed',
    'oidc_client.activated',
    'oidc_client.security_configuration_changed',
    'oidc_client.suspended',
    'oidc_client.reactivated',
    'oidc_client.retired',
    'oidc_client.keyset_rotated'
];
const OIDC_CLIENT_REGISTRY_FORBIDDEN_VALUES = [
    'client_secret_plaintext',
    'private_key_material',
    'authorization_code',
    'access_token',
    'id_token',
    'refresh_token_plaintext',
    'cookie_header',
    'authorization_header',
    'raw_customer_payload'
];
const OIDC_AUTHORIZATION_CODE_BINDINGS = [
    'client_id',
    'exact_redirect_uri',
    'subject_ref',
    'central_session_ref',
    'nonce',
    'code_challenge',
    'code_challenge_method',
    'granted_scope_refs',
    'granted_audience_refs',
    'issued_at',
    'expires_at'
];
const OIDC_RUNTIME_DENIAL_REASONS = [
    'authentication_required',
    'session_expired',
    'session_revoked',
    'client_disabled',
    'invalid_request',
    'invalid_grant',
    'access_denied',
    'policy_unavailable'
];
const OIDC_PROVIDER_RUNTIME_FORBIDDEN_VALUES = [
    'password',
    'authorization_header',
    'cookie_header',
    'access_token',
    'id_token',
    'refresh_token_plaintext',
    'client_secret_plaintext',
    'private_key_material',
    'authorization_code_plaintext_at_rest',
    'code_verifier_plaintext_at_rest',
    'raw_provider_error',
    'raw_customer_payload'
];
const PRODUCT_LINK_FILE = 'contracts/apis/core-api/product-link.yaml';
const PRODUCT_LINK_STATES = [
    'pending',
    'approved',
    'denied',
    'expired',
    'consumed'
];
const PRODUCT_LINK_TERMINAL_STATES = ['denied', 'expired', 'consumed'];
const PRODUCT_LINK_REQUIRED_BINDINGS = [
    'product_ref',
    'client_instance_ref',
    'client_correlation_ref',
    'proof_challenge',
    'requested_scope_refs'
];
const PRODUCT_LINK_EXCHANGE_REFS = [
    'subject_ref',
    'workspace_ref',
    'consent_receipt_ref',
    'link_receipt_ref',
    'verified_at'
];
const PRODUCT_LINK_FORBIDDEN_VALUES = [
    'password',
    'authorization_header',
    'cookie_header',
    'access_token',
    'refresh_token_plaintext',
    'login_identifier',
    'contact_method',
    'integrated_profile',
    'raw_consent_document'
];
const PRODUCT_LINK_TRANSITIONS = [
    'pending:approve:approved',
    'pending:deny:denied',
    'pending:expire:expired',
    'approved:exchange:consumed',
    'approved:expire:expired'
];
const FORBIDDEN_ROUTE_SHAPES = [
    ...CANONICAL_FORBIDDEN_VALUES,
    'provider_specific_id_as_primary_id',
    'raw_storage_url'
];
const ALLOWED_SESSION_EFFECTS = [
    'none',
    'issue',
    'refresh',
    'revoke',
    'expire',
    'compromise'
];
const REQUIRED_ERROR_FIELDS = [
    'code',
    'message',
    'request_id',
    'trace_id'
];
const FORBIDDEN_ERROR_FIELDS = CANONICAL_FORBIDDEN_VALUES;
const REQUIRED_WEBHOOK_CONTROLS = [
    'event_id',
    'event_type',
    'schema_version',
    'signature_verification',
    'idempotency_key',
    'replay_policy',
    'dead_letter_policy'
];
const FORBIDDEN_WEBHOOK_CONTROLS = [
    'unversioned_payload',
    'provider_secret_in_schema',
    'ledger_mutation_without_money_contract'
];
const REQUIRED_SDK_SOURCE_CONTRACTS = [
    'contracts/route-contract.yaml',
    'contracts/error-envelope.yaml',
    'contracts/webhook-contract.yaml',
    'contracts/sdk-generation-input.yaml',
    'contracts/apis/catalog.yaml'
];
const REQUIRED_SDK_GENERATION_TARGETS = ['typescript', 'dart', 'rust'];
const REQUIRED_SDK_ROUTE_METADATA = [
    'operation_id',
    'resource',
    'action',
    'method',
    'path',
    'request_schema_ref',
    'response_schema_ref',
    'auth_required',
    'permission_check',
    'audit_event',
    'idempotency',
    'success_statuses',
    'owner_boundary',
    'tenant_boundary',
    'request_id_required',
    'trace_id_required',
    'session_effect',
    'credential_policy',
    'error_codes'
];
const REQUIRED_SDK_ERROR_METADATA = [
    'code',
    'message',
    'request_id',
    'trace_id',
    'retry_after_seconds',
    'documentation_url'
];
const REQUIRED_SDK_CLIENT_RUNTIME_METADATA = [
    'typed_fetch_operation_map',
    'standard_error_envelope_normalization',
    'request_id_propagation',
    'trace_id_propagation',
    'timeout_ms_option',
    'abort_signal_option',
    'idempotency_key_required_for_mutations',
    'no_content_response_body_handling'
];
const REQUIRED_SDK_WEBHOOK_METADATA = [
    'event_id',
    'event_type',
    'schema_version',
    'signature_verification',
    'idempotency_key',
    'replay_policy',
    'dead_letter_policy'
];
const FORBIDDEN_SDK_OWNERSHIP = [
    'generated_sdk_source',
    'sdk_runtime_implementation',
    'product_business_logic',
    'refresh_token_storage',
    'final_authorization_decision',
    'provider_credential_storage'
];
const FORBIDDEN_SDK_VALUES = CANONICAL_FORBIDDEN_VALUES;
const API_CATALOG_REQUIRED_ROUTE_FIELDS = [
    'operation_id',
    'service_id',
    'resource',
    'action',
    'method',
    'path',
    'success_statuses',
    'request_schema_ref',
    'response_schema_ref',
    'auth_required',
    'permission_check',
    'audit_event',
    'idempotency',
    'owner_boundary',
    'tenant_boundary',
    'request_id_required',
    'trace_id_required',
    'session_effect',
    'credential_policy',
    'error_codes'
];
const API_CATALOG_EMPTY_STATUS = 'empty-until-service-routes-exist';
const API_CATALOG_ACTIVE_STATUS = 'route-catalog-contract-only';
const ALLOWED_IDEMPOTENCY_POLICIES = [
    'required_idempotency_key',
    'optional_idempotency_key',
    'not_required'
];
const MUTATING_METHODS_REQUIRING_IDEMPOTENCY = [
    'POST',
    'PUT',
    'PATCH',
    'DELETE'
];
const REQUIRED_MUTATION_IDEMPOTENCY_POLICY = 'required_idempotency_key';
const ALLOWED_CREDENTIAL_POLICIES = [
    'no_refresh_token_plaintext_no_provider_secret_no_authorization_or_cookie_header_payload'
];
const ALLOWED_SECRET_MATERIAL_POLICIES = [
    'verifier_input_only_never_echo',
    'password_verifier_input_only_never_echo',
    'session_rotation_proof_only_never_echo',
    'browser_assertion_only_never_echo',
    'provider_callback_code_only_never_store_plaintext',
    'proof_verifier_input_only_never_echo_or_persist_plaintext',
    'one_time_receipt_input_only_never_echo_or_persist_plaintext'
];
const REQUIRED_CREDENTIAL_POLICY_PARTS = [
    'no_refresh_token_plaintext',
    'no_provider_secret',
    'no_authorization_or_cookie_header_payload'
];
const PUBLIC_AUTH_PERMISSION_CHECK = 'core.identity.public_auth_entrypoint';
const ALLOWED_OWNER_BOUNDARIES = [
    'identity',
    'money',
    'access',
    'consent',
    'audit',
    'privacy',
    'platform',
    'architecture',
    'observability'
];
const ALLOWED_TENANT_BOUNDARIES = [
    'none',
    'organization',
    'workspace',
    'pending_identity_or_organization',
    'personal_account',
    'common_zdp_wallet',
    'core_resolved_scope'
];
const REQUIRED_SCHEMA_BASE_REQUEST_METADATA = [
    'request_id',
    'trace_id'
];
const SCHEMA_IDEMPOTENCY_METADATA = 'idempotency_key';
const REQUIRED_SCHEMA_RESPONSE_METADATA = ['request_id', 'trace_id'];
const ALLOWED_SCHEMA_STATUSES = ['contract-only'];
const ALLOWED_SCHEMA_KINDS = ['request', 'response'];
const SESSION_EFFECT_REQUIRED_ERROR_CODES = {
    issue: ['account_restricted'],
    refresh: ['session_expired', 'session_compromised', 'account_restricted'],
    revoke: ['session_expired', 'session_compromised']
};
const SDK_TARGET_PATTERN = /^[a-z][a-z0-9_-]*$/;
const OPERATION_ID_PATTERN = /^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/;
const SCHEMA_ID_PATTERN = /^[A-Z][A-Za-z0-9]+$/;
const SCHEMA_FIELD_PATTERN = /^[a-z][a-z0-9_]*$/;
const SCHEMA_REF_PATTERN = /^contracts\/apis\/[a-z0-9_-]+\/[a-z0-9_-]+\.yaml#[A-Z][A-Za-z0-9]+$/;
/**
 * mf:anchor zdp.api-contracts.semantic-validator
 * purpose: Locate semantic rules that align API routes, schemas, SDK input, and webhooks.
 * search: api validation, route metadata, schema refs, idempotency, credential policy
 * invariant: Auth, tenant, credential, idempotency, and secret metadata stay explicit in contracts.
 * risk: authz, security, data_consistency
 */
export function validateApiContracts(contracts) {
    const diagnostics = [];
    const schemaBundlesByFile = buildSchemaBundleMap(contracts.schemaBundles, diagnostics);
    validateRouteContract(contracts, diagnostics);
    validateErrorEnvelopeContract(contracts, diagnostics);
    validateWebhookContract(contracts, diagnostics);
    validateSdkGenerationInputContract(contracts, diagnostics);
    validateApiCatalogContract(contracts, schemaBundlesByFile, diagnostics);
    validateSchemaBundles(contracts, schemaBundlesByFile, diagnostics);
    validateCreditPurchase(contracts, schemaBundlesByFile, diagnostics);
    validateAccessDecision(contracts, schemaBundlesByFile, diagnostics);
    validateOidcProductSession(contracts, diagnostics);
    validateOidcClientRegistry(contracts, diagnostics);
    validateOidcProviderRuntime(contracts, diagnostics);
    validateProductLinkHandoff(contracts, diagnostics);
    validateCalculatorCatalog(contracts, diagnostics);
    validateCalculatorConformance(contracts, diagnostics);
    return {
        ok: diagnostics.length === 0,
        diagnostics
    };
}
function validateOidcProductSession(contracts, diagnostics) {
    const contract = contracts.oidcProductSession;
    const push = (code, path, message) => {
        diagnostics.push({ code, file: OIDC_PRODUCT_SESSION_FILE, path, message });
    };
    if (contract.schemaVersion !== 1 ||
        contract.status !== 'proposed-contract' ||
        contract.ownerBoundary !== 'identity') {
        push('API_OIDC_PRODUCT_SESSION_BOUNDARY_INVALID', 'oidc_product_session', 'OIDC product-session handoff must remain a proposed identity-owned contract.');
    }
    if (contract.protocolProfile !== 'openid_connect_authorization_code_flow' ||
        contract.oauthSecurityBaseline !== 'oauth_2_0_security_bcp_rfc9700' ||
        contract.oauth21Status !== 'draft_profile_not_final_rfc' ||
        contract.responseType !== 'code' ||
        contract.pkceMethod !== 'S256') {
        push('API_OIDC_PRODUCT_SESSION_PROTOCOL_INVALID', 'oidc_product_session.protocol_profile', 'Product web sign-in must use OIDC Authorization Code Flow, RFC 9700 security guidance, and PKCE S256 without claiming OAuth 2.1 is a final RFC.');
    }
    if (contract.stagingIssuer !== 'https://account.staging.8ailors.xyz' ||
        contract.productionIssuer !== 'https://account.8ailors.xyz') {
        push('API_OIDC_PRODUCT_SESSION_ISSUER_INVALID', 'oidc_product_session.staging_issuer', 'Staging and production account issuers must remain separate and exact.');
    }
    validateRequiredOidcValues(contract.requiredAuthorizationBindings, OIDC_AUTHORIZATION_BINDINGS, 'API_OIDC_AUTHORIZATION_BINDING_MISSING', 'oidc_product_session.required_authorization_bindings', push);
    validateRequiredOidcValues(contract.requiredTokenExchangeBindings, OIDC_TOKEN_EXCHANGE_BINDINGS, 'API_OIDC_TOKEN_EXCHANGE_BINDING_MISSING', 'oidc_product_session.required_token_exchange_bindings', push);
    validateRequiredOidcValues(contract.requiredClientRegistryFields, OIDC_CLIENT_REGISTRY_FIELDS, 'API_OIDC_CLIENT_REGISTRY_FIELD_MISSING', 'oidc_product_session.required_client_registry_fields', push);
    validateRequiredOidcValues(contract.requiredAccessDecisionBindings, OIDC_ACCESS_DECISION_BINDINGS, 'API_OIDC_ACCESS_DECISION_BINDING_MISSING', 'oidc_product_session.required_access_decision_bindings', push);
    validateRequiredOidcValues(contract.invalidationEvents, OIDC_INVALIDATION_EVENTS, 'API_OIDC_INVALIDATION_EVENT_MISSING', 'oidc_product_session.invalidation_events', push);
    validateRequiredOidcValues(contract.forbiddenConsumerUses, OIDC_FORBIDDEN_CONSUMER_USES, 'API_OIDC_FORBIDDEN_CONSUMER_USE_MISSING', 'oidc_product_session.forbidden_consumer_uses', push);
    validateRequiredOidcValues(contract.forbiddenValues, OIDC_FORBIDDEN_VALUES, 'API_OIDC_FORBIDDEN_VALUE_MISSING', 'oidc_product_session.forbidden_values', push);
    if (!contract.exactRedirectUriMatchRequired ||
        !contract.wildcardRedirectUriForbidden ||
        !contract.arbitraryReturnToForbidden ||
        !contract.authorizationCodeSingleUse) {
        push('API_OIDC_REDIRECT_OR_CODE_POLICY_INVALID', 'oidc_product_session.exact_redirect_uri_match_required', 'Redirect URIs must match the central registry exactly, wildcard and arbitrary return_to redirects must be forbidden, and authorization codes must be single use.');
    }
    if (contract.authorizationCodeTtlPolicy !==
        'short_server_configured_ttl_recorded_in_the_reviewed_identity_policy' ||
        contract.tokenEndpointCaller !== 'confidential_product_bff_only' ||
        contract.browserTokenExposurePolicy !==
            'no_access_refresh_or_id_token_in_url_local_storage_or_browser_readable_cookie') {
        push('API_OIDC_TOKEN_HANDOFF_POLICY_INVALID', 'oidc_product_session.token_endpoint_caller', 'Authorization codes must have a reviewed short TTL, only a confidential product BFF may exchange them, and browser-readable token exposure is forbidden.');
    }
    if (contract.productCookiePolicy !==
        'opaque_secure_http_only_same_site_product_host_only_binding' ||
        contract.productSessionOwner !== 'product_bff_binding_only' ||
        contract.centralSessionOwner !== 'core_identity' ||
        contract.authorizationOwner !== 'core_access_per_protected_action' ||
        contract.authenticationIsAuthorization) {
        push('API_OIDC_SESSION_OR_AUTHORIZATION_BOUNDARY_INVALID', 'oidc_product_session.product_cookie_policy', 'The product BFF may own only its host-only session binding; Core identity owns central sessions and Core access authorizes every protected action.');
    }
    if (contract.clientRegistryPolicy !==
        'reviewed_central_environment_scoped_registry_no_product_local_env_var_as_authority') {
        push('API_OIDC_CLIENT_REGISTRY_POLICY_INVALID', 'oidc_product_session.client_registry_policy', 'OIDC client configuration must come from a reviewed environment-scoped central registry rather than product-local environment variables as authority.');
    }
}
function validateOidcClientRegistry(contracts, diagnostics) {
    const contract = contracts.oidcClientRegistry;
    const push = (code, path, message) => {
        diagnostics.push({ code, file: OIDC_CLIENT_REGISTRY_FILE, path, message });
    };
    if (contract.schemaVersion !== 2 ||
        contract.status !== 'proposed-contract' ||
        contract.ownerBoundary !== 'identity' ||
        contract.authority !== 'core_identity' ||
        contract.environment !== 'staging' ||
        !Number.isInteger(contract.registryRevision) ||
        contract.registryRevision < 1) {
        push('API_OIDC_CLIENT_REGISTRY_BOUNDARY_INVALID', 'oidc_client_registry', 'The OIDC client registry must remain a revisioned proposed Core identity-owned staging contract.');
    }
    if (contract.sourceOfTruth !== 'reviewed_core_identity_registry' ||
        contract.updatePolicy !==
            'compare_and_swap_registry_revision_and_audit_receipt' ||
        contract.environmentIsolation !==
            'exact_environment_match_no_cross_environment_projection' ||
        contract.clientIdReusePolicy !==
            'retired_client_ids_are_tombstoned_and_never_reused') {
        push('API_OIDC_CLIENT_REGISTRY_AUTHORITY_POLICY_INVALID', 'oidc_client_registry.update_policy', 'Registry changes must use reviewed Core identity authority, revision compare-and-swap, environment isolation, audit evidence, and non-reusable retired client IDs.');
    }
    if (!hasExactStringValues(contract.lifecycle.states, OIDC_CLIENT_REGISTRY_LIFECYCLE_STATES) ||
        !hasExactStringValues(contract.lifecycle.terminalStates, ['retired'])) {
        push('API_OIDC_CLIENT_REGISTRY_LIFECYCLE_INVALID', 'oidc_client_registry.lifecycle.states', 'OIDC clients must use disabled, active, suspended, and retired states with retired as the only terminal state.');
    }
    const transitions = contract.lifecycle.transitions.map((transition) => `${transition.from}:${transition.to}:${transition.requiredEvidence}`);
    if (!hasExactStringValues(transitions, OIDC_CLIENT_REGISTRY_TRANSITIONS)) {
        push('API_OIDC_CLIENT_REGISTRY_TRANSITION_INVALID', 'oidc_client_registry.lifecycle.allowed_transitions', 'OIDC client activation, suspension, reactivation, and retirement must follow the reviewed evidence-bearing transition set.');
    }
    validateRequiredOidcValues(contract.immutableFields, OIDC_CLIENT_REGISTRY_IMMUTABLE_FIELDS, 'API_OIDC_CLIENT_REGISTRY_IMMUTABLE_FIELD_MISSING', 'oidc_client_registry.immutable_fields', push);
    validateRequiredOidcValues(contract.securitySensitiveFields, OIDC_CLIENT_REGISTRY_SECURITY_SENSITIVE_FIELDS, 'API_OIDC_CLIENT_REGISTRY_SECURITY_FIELD_MISSING', 'oidc_client_registry.security_sensitive_fields', push);
    validateRequiredOidcValues(contract.requiredAuditEvents, OIDC_CLIENT_REGISTRY_AUDIT_EVENTS, 'API_OIDC_CLIENT_REGISTRY_AUDIT_EVENT_MISSING', 'oidc_client_registry.required_audit_events', push);
    const seenClientIds = new Map();
    contract.entries.forEach((client, index) => {
        const path = `oidc_client_registry.entries[${index}]`;
        const previousIndex = seenClientIds.get(client.clientId);
        if (previousIndex !== undefined) {
            push('API_OIDC_CLIENT_REGISTRY_CLIENT_ID_DUPLICATE', `${path}.client_id`, `OIDC client_id \`${client.clientId}\` duplicates entries[${previousIndex}] and must remain globally unique.`);
        }
        else {
            seenClientIds.set(client.clientId, index);
        }
        if (client.environment !== contract.environment ||
            !Number.isInteger(client.entryRevision) ||
            client.entryRevision < 1 ||
            client.applicationType !== 'web' ||
            !OIDC_CLIENT_REGISTRY_LIFECYCLE_STATES.includes(client.status)) {
            push('API_OIDC_CLIENT_REGISTRY_ENTRY_BOUNDARY_INVALID', path, 'Each client must match the registry environment, use a positive entry revision, be a web application, and use a reviewed lifecycle state.');
        }
        if (!hasUniqueStringValues(client.exactRedirectUris) ||
            !hasUniqueStringValues(client.exactPostLogoutRedirectUris) ||
            !client.exactRedirectUris.every(isExactHttpsOidcRedirectUri) ||
            !client.exactPostLogoutRedirectUris.every(isExactHttpsOidcRedirectUri)) {
            push('API_OIDC_CLIENT_REGISTRY_REDIRECT_INVALID', `${path}.exact_redirect_uris`, 'OIDC redirect and post-logout URIs must be unique exact HTTPS URIs without wildcards, credentials, or fragments.');
        }
        if (!client.allowedScopeRefs.includes('openid') ||
            !hasUniqueStringValues(client.allowedScopeRefs) ||
            !hasUniqueStringValues(client.allowedAudienceRefs) ||
            !hasExactStringValues(client.allowedGrantTypes, ['authorization_code']) ||
            !hasExactStringValues(client.allowedResponseTypes, ['code']) ||
            !hasExactStringValues(client.allowedPkceMethods, ['S256'])) {
            push('API_OIDC_CLIENT_REGISTRY_GRANT_INVALID', `${path}.allowed_scope_refs`, 'Web clients must request openid, keep scope and audience values unique, and use only authorization_code, code, and PKCE S256.');
        }
        if (client.clientType !== 'confidential' ||
            client.tokenEndpointAuthMethod !== 'private_key_jwt' ||
            !client.jwksRef.startsWith('client-keyset://') ||
            client.keyRotationPolicyRef !==
                'oidc-provider-runtime-v1-client-key-rotation') {
            push('API_OIDC_CLIENT_REGISTRY_AUTH_METHOD_INVALID', `${path}.token_endpoint_auth_method`, 'Product BFFs must be confidential private_key_jwt clients with logical keyset and key-rotation policy references.');
        }
        if (client.sessionPolicyRef !==
            'oidc-provider-runtime-v1-product-session' ||
            client.revocationPolicyRef !== 'oidc-provider-runtime-v1-revocation' ||
            !client.runtimeBoundary.startsWith('product_bff_required')) {
            push('API_OIDC_CLIENT_REGISTRY_RUNTIME_BOUNDARY_INVALID', `${path}.runtime_boundary`, 'Every web client must use the reviewed product-session and revocation policies and place callback exchange in a product BFF boundary.');
        }
        validateRequiredOidcValues(client.activationRequirements, OIDC_CLIENT_ACTIVATION_REQUIREMENTS, 'API_OIDC_CLIENT_REGISTRY_ACTIVATION_REQUIREMENT_MISSING', `${path}.activation_requirements`, push);
        if (client.status === 'active' && client.activationEvidenceRefs.length === 0) {
            push('API_OIDC_CLIENT_REGISTRY_ACTIVATION_EVIDENCE_MISSING', `${path}.activation_evidence_refs`, 'An active OIDC client must reference reviewed activation evidence; declaring requirements alone is not proof.');
        }
    });
    const firstFixture = contract.entries.find((client) => client.clientId === 'zdp-web-public-staging');
    if (firstFixture === undefined ||
        firstFixture.productRef !== 'web-public-home' ||
        firstFixture.ownerRef !== 'zdp-web-public' ||
        firstFixture.environment !== 'staging' ||
        firstFixture.status !== 'disabled' ||
        firstFixture.statusReason !== 'callback_runtime_not_deployed') {
        push('API_OIDC_CLIENT_REGISTRY_FIXTURE_IDENTITY_INVALID', 'oidc_client_registry.entries', 'The registry must retain the disabled zdp-web-public staging fixture until its callback runtime is deployed and reviewed.');
    }
    else {
        if (!hasExactStringValues(firstFixture.exactRedirectUris, [
            'https://web-public.staging.8ailors.xyz/auth/callback'
        ]) ||
            !hasExactStringValues(firstFixture.exactPostLogoutRedirectUris, [
                'https://web-public.staging.8ailors.xyz/'
            ]) ||
            !hasExactStringValues(firstFixture.allowedScopeRefs, [
                'openid',
                'profile'
            ]) ||
            !hasExactStringValues(firstFixture.allowedAudienceRefs, [
                'zdp-web-public'
            ]) ||
            firstFixture.jwksRef !== 'client-keyset://zdp-web-public-staging' ||
            firstFixture.runtimeBoundary !==
                'product_bff_required_static_site_forbidden' ||
            firstFixture.callbackHandlerRef !== 'zdp-web-public-bff-candidate' ||
            firstFixture.activationEvidenceRefs.length !== 0) {
            push('API_OIDC_CLIENT_REGISTRY_FIXTURE_CONFIGURATION_INVALID', 'oidc_client_registry.entries', 'The first disabled fixture must keep its exact staging URI, grant, keyset, BFF candidate, and empty activation-evidence configuration.');
        }
    }
    validateRequiredOidcValues(contract.forbiddenValues, OIDC_CLIENT_REGISTRY_FORBIDDEN_VALUES, 'API_OIDC_CLIENT_REGISTRY_FORBIDDEN_VALUE_MISSING', 'oidc_client_registry.forbidden_values', push);
}
function hasUniqueStringValues(values) {
    return new Set(values).size === values.length;
}
function isExactHttpsOidcRedirectUri(uri) {
    if (uri.includes('*')) {
        return false;
    }
    try {
        const parsed = new URL(uri);
        return (parsed.protocol === 'https:' &&
            parsed.hostname.length > 0 &&
            parsed.username.length === 0 &&
            parsed.password.length === 0 &&
            parsed.hash.length === 0);
    }
    catch {
        return false;
    }
}
function validateOidcProviderRuntime(contracts, diagnostics) {
    const contract = contracts.oidcProviderRuntime;
    const push = (code, path, message) => {
        diagnostics.push({ code, file: OIDC_PROVIDER_RUNTIME_FILE, path, message });
    };
    if (contract.schemaVersion !== 1 ||
        contract.status !== 'proposed-contract' ||
        contract.ownerBoundary !== 'identity' ||
        contract.pilotEnvironment !== 'staging' ||
        contract.issuer !== 'https://account.staging.8ailors.xyz') {
        push('API_OIDC_PROVIDER_RUNTIME_BOUNDARY_INVALID', 'oidc_provider_runtime', 'The first provider runtime profile must remain a proposed staging-only Core identity contract.');
    }
    if (contract.discoveryPath !== '/.well-known/openid-configuration' ||
        contract.authorizationPath !== '/oauth2/authorize' ||
        contract.tokenPath !== '/oauth2/token' ||
        contract.jwksPath !== '/.well-known/jwks.json' ||
        contract.revocationPath !== '/oauth2/revoke' ||
        contract.endSessionPath !== '/oauth2/logout') {
        push('API_OIDC_PROVIDER_RUNTIME_ENDPOINT_INVALID', 'oidc_provider_runtime.discovery_path', 'The staging runtime profile must keep one exact discovery, authorization, token, JWKS, revocation, and logout path set.');
    }
    if (contract.authorizationCodeTtlSeconds !== 60 ||
        !contract.authorizationCodeSingleUse ||
        contract.authorizationCodeStoragePolicy !==
            'opaque_random_code_hash_only_atomic_consume') {
        push('API_OIDC_PROVIDER_RUNTIME_CODE_POLICY_INVALID', 'oidc_provider_runtime.authorization_code_ttl_seconds', 'Authorization codes must expire after 60 seconds, be opaque, be stored only as a hash, and be consumed atomically once.');
    }
    validateRequiredOidcValues(contract.authorizationCodeRequiredBindings, OIDC_AUTHORIZATION_CODE_BINDINGS, 'API_OIDC_PROVIDER_RUNTIME_CODE_BINDING_MISSING', 'oidc_provider_runtime.authorization_code_required_bindings', push);
    if (contract.accessTokenTtlSeconds !== 300 ||
        contract.idTokenTtlSeconds !== 300 ||
        contract.refreshTokenPolicy !== 'not_issued_in_first_staging_pilot') {
        push('API_OIDC_PROVIDER_RUNTIME_TOKEN_POLICY_INVALID', 'oidc_provider_runtime.access_token_ttl_seconds', 'The first staging pilot must use five-minute access and ID tokens and must not issue refresh tokens.');
    }
    if (contract.clientAssertionAlgorithm !== 'RS256' ||
        contract.clientAssertionTtlSeconds !== 60 ||
        !contract.clientAssertionJtiSingleUse ||
        contract.clientAssertionBindingPolicy !==
            'iss_and_sub_equal_client_id_aud_exact_token_endpoint') {
        push('API_OIDC_PROVIDER_RUNTIME_CLIENT_ASSERTION_INVALID', 'oidc_provider_runtime.client_assertion_algorithm', 'private_key_jwt assertions must use RS256, expire after 60 seconds, reject jti replay, bind iss/sub to client_id, and use the exact token endpoint as audience.');
    }
    if (contract.signingAlgorithm !== 'RS256' ||
        contract.signingKeyRotationDays !== 30 ||
        contract.retiredKeyVerificationSeconds !== 86400 ||
        contract.jwksCacheMaxAgeSeconds !== 300) {
        push('API_OIDC_PROVIDER_RUNTIME_KEY_POLICY_INVALID', 'oidc_provider_runtime.signing_algorithm', 'The proposed interoperable key profile is RS256, 30-day rotation, one-day retired-key verification, and five-minute JWKS caching.');
    }
    if (contract.centralSessionIdleSeconds !== 1209600 ||
        contract.centralSessionAbsoluteSeconds !== 2592000 ||
        contract.productSessionIdleMaxSeconds > contract.centralSessionIdleSeconds ||
        contract.productSessionAbsoluteMaxSeconds >
            contract.centralSessionAbsoluteSeconds ||
        contract.sensitiveActionFreshSeconds !== 900 ||
        contract.revocationMaxStalenessSeconds !== 60) {
        push('API_OIDC_PROVIDER_RUNTIME_SESSION_POLICY_INVALID', 'oidc_provider_runtime.central_session_idle_seconds', 'Central sessions use 14-day idle and 30-day absolute limits; product bindings cannot outlive them, sensitive actions require a 15-minute fresh check, and revocation staleness is capped at 60 seconds.');
    }
    if (contract.productSessionRevalidationPolicy !==
        'binding_must_not_outlive_central_session_and_core_access_rechecks_every_protected_action') {
        push('API_OIDC_PROVIDER_RUNTIME_REVALIDATION_POLICY_INVALID', 'oidc_provider_runtime.product_session_revalidation_policy', 'Product bindings must not outlive central sessions and Core access must recheck every protected action.');
    }
    validateRequiredOidcValues(contract.requiredDenialReasons, OIDC_RUNTIME_DENIAL_REASONS, 'API_OIDC_PROVIDER_RUNTIME_DENIAL_REASON_MISSING', 'oidc_provider_runtime.required_denial_reasons', push);
    validateRequiredOidcValues(contract.forbiddenValues, OIDC_PROVIDER_RUNTIME_FORBIDDEN_VALUES, 'API_OIDC_PROVIDER_RUNTIME_FORBIDDEN_VALUE_MISSING', 'oidc_provider_runtime.forbidden_values', push);
}
function validateRequiredOidcValues(actual, required, code, path, push) {
    for (const value of required) {
        if (!actual.includes(value)) {
            push(code, path, `OIDC product-session contract must include \`${value}\`.`);
        }
    }
}
function validateCreditPurchase(contracts, schemaBundlesByFile, diagnostics) {
    const contract = contracts.creditPurchase;
    const push = (code, path, message) => {
        diagnostics.push({ code, file: CREDIT_PURCHASE_FILE, path, message });
    };
    const requireValues = (actual, expected, code, path) => {
        validateRequiredAccessDecisionValues(actual, expected, code, path, push);
    };
    if (contract.schemaVersion !== 2) {
        push('API_CREDIT_PURCHASE_SCHEMA_VERSION_INVALID', 'credit_purchase.schema_version', 'Credit-purchase schema_version must be 2.');
    }
    if (contract.status !== 'contract-only' || contract.ownerBoundary !== 'money') {
        push('API_CREDIT_PURCHASE_OWNERSHIP_INVALID', 'credit_purchase', 'Credit purchase must remain contract-only and owned by Money.');
    }
    const exactValueSets = [
        [contract.operationIds, CREDIT_PURCHASE_OPERATION_IDS, 'API_CREDIT_PURCHASE_OPERATION_SET_INVALID', 'credit_purchase.operation_ids'],
        [contract.checkoutStates, CREDIT_PURCHASE_CHECKOUT_STATES, 'API_CREDIT_PURCHASE_STATE_SET_INVALID', 'credit_purchase.checkout_states'],
        [contract.paymentStates, CREDIT_PURCHASE_PAYMENT_STATES, 'API_CREDIT_PURCHASE_PAYMENT_STATE_SET_INVALID', 'credit_purchase.payment_states'],
        [contract.creditIssuanceStates, CREDIT_PURCHASE_CREDIT_ISSUANCE_STATES, 'API_CREDIT_PURCHASE_CREDIT_ISSUANCE_STATE_SET_INVALID', 'credit_purchase.credit_issuance_states'],
        [contract.returnReceiptStates, CREDIT_PURCHASE_RETURN_RECEIPT_STATES, 'API_CREDIT_PURCHASE_RETURN_RECEIPT_STATE_SET_INVALID', 'credit_purchase.return_receipt_states'],
        [contract.nonTerminalStates, CREDIT_PURCHASE_NON_TERMINAL_STATES, 'API_CREDIT_PURCHASE_NON_TERMINAL_SET_INVALID', 'credit_purchase.non_terminal_states'],
        [contract.terminalStates, CREDIT_PURCHASE_TERMINAL_STATES, 'API_CREDIT_PURCHASE_TERMINAL_SET_INVALID', 'credit_purchase.terminal_states'],
        [contract.requiredIntentBindings, CREDIT_PURCHASE_INTENT_BINDINGS, 'API_CREDIT_PURCHASE_INTENT_BINDING_SET_INVALID', 'credit_purchase.required_intent_bindings'],
        [contract.serverRevalidatedClaims, CREDIT_PURCHASE_SERVER_REVALIDATED_CLAIMS, 'API_CREDIT_PURCHASE_REVALIDATION_SET_INVALID', 'credit_purchase.server_revalidated_claims'],
        [contract.immutableSnapshotRefs, CREDIT_PURCHASE_SNAPSHOT_REFS, 'API_CREDIT_PURCHASE_SNAPSHOT_SET_INVALID', 'credit_purchase.immutable_snapshot_refs'],
        [contract.separatedIdentifiers, CREDIT_PURCHASE_SEPARATED_IDENTIFIERS, 'API_CREDIT_PURCHASE_IDENTIFIER_SET_INVALID', 'credit_purchase.separated_identifiers'],
        [contract.authoritativePaymentEvidence, CREDIT_PURCHASE_PAYMENT_EVIDENCE, 'API_CREDIT_PURCHASE_PAYMENT_EVIDENCE_SET_INVALID', 'credit_purchase.authoritative_payment_evidence'],
        [contract.authoritativeCompletionEvidence, CREDIT_PURCHASE_COMPLETION_EVIDENCE, 'API_CREDIT_PURCHASE_EVIDENCE_SET_INVALID', 'credit_purchase.authoritative_completion_evidence'],
        [contract.forbiddenUrlValues, CREDIT_PURCHASE_FORBIDDEN_URL_VALUES, 'API_CREDIT_PURCHASE_URL_FORBIDDEN_SET_INVALID', 'credit_purchase.forbidden_url_values'],
        [contract.forbiddenConsumerUses, CREDIT_PURCHASE_FORBIDDEN_CONSUMER_USES, 'API_CREDIT_PURCHASE_CONSUMER_FORBIDDEN_SET_INVALID', 'credit_purchase.forbidden_consumer_uses']
    ];
    for (const [actual, expected, code, path] of exactValueSets) {
        requireValues(actual, expected, code, path);
        if (!hasExactStringValues(actual, expected)) {
            push(code, path, `Credit-purchase contract must use the canonical ${path} set.`);
        }
    }
    requireValues(contract.forbiddenValues, CANONICAL_FORBIDDEN_VALUES, 'API_CREDIT_PURCHASE_FORBIDDEN_VALUE_MISSING', 'credit_purchase.forbidden_values');
    const exactPolicies = [
        [contract.idempotencyPolicy, 'same_key_same_normalized_binding_replays_different_binding_conflicts', 'API_CREDIT_PURCHASE_IDEMPOTENCY_POLICY_INVALID', 'credit_purchase.idempotency_policy'],
        [contract.returnTargetPolicy, 'exact_environment_product_registry_target_id_only', 'API_CREDIT_PURCHASE_RETURN_TARGET_POLICY_INVALID', 'credit_purchase.return_target_policy'],
        [contract.returnReceiptPolicy, 'short_lived_single_use_opaque_server_exchange_only', 'API_CREDIT_PURCHASE_RETURN_RECEIPT_POLICY_INVALID', 'credit_purchase.return_receipt_policy'],
        [contract.returnReceiptRetryPolicy, 'same_idempotency_key_same_exchange_replays_other_attempt_is_already_consumed', 'API_CREDIT_PURCHASE_RETURN_RECEIPT_RETRY_POLICY_INVALID', 'credit_purchase.return_receipt_retry_policy'],
        [contract.returnReceiptDigestAlgorithm, 'sha256', 'API_CREDIT_PURCHASE_RETURN_RECEIPT_DIGEST_INVALID', 'credit_purchase.return_receipt_digest_algorithm'],
        [contract.persistenceContractRef, 'zdp-money-platform/contracts/money-db-schema.yaml#credit_checkout_persistence', 'API_CREDIT_PURCHASE_PERSISTENCE_REF_INVALID', 'credit_purchase.persistence_contract_ref'],
        [contract.checkoutCompletionPolicy, 'verified_payment_success_then_ledger_issuance_success', 'API_CREDIT_PURCHASE_COMPLETION_POLICY_INVALID', 'credit_purchase.checkout_completion_policy'],
        [contract.balanceRefreshPolicy, 'reread_money_balance_after_receipt_exchange_or_completed_status', 'API_CREDIT_PURCHASE_BALANCE_REFRESH_POLICY_INVALID', 'credit_purchase.balance_refresh_policy'],
        [contract.unknownOutcomePolicy, 'remain_pending_or_review_required_until_reconciled', 'API_CREDIT_PURCHASE_UNKNOWN_OUTCOME_POLICY_INVALID', 'credit_purchase.unknown_outcome_policy']
    ];
    for (const [actual, expected, code, path] of exactPolicies) {
        if (actual !== expected) {
            push(code, path, `Credit-purchase policy must remain ${expected}.`);
        }
    }
    if (!contract.returnReceiptSingleUse) {
        push('API_CREDIT_PURCHASE_RETURN_RECEIPT_REUSABLE', 'credit_purchase.return_receipt_single_use', 'Checkout return receipts must be single-use.');
    }
    if (contract.returnReceiptPlaintextStored) {
        push('API_CREDIT_PURCHASE_RETURN_RECEIPT_PLAINTEXT_STORED', 'credit_purchase.return_receipt_plaintext_stored', 'Checkout return receipt plaintext must never be stored.');
    }
    if (contract.providerSuccessCompletesCheckout) {
        push('API_CREDIT_PURCHASE_PROVIDER_SUCCESS_COMPLETES_CHECKOUT', 'credit_purchase.provider_success_completes_checkout', 'Provider payment success must not complete a checkout before ledger issuance.');
    }
    if (!contract.ledgerIssuanceRequiredForCompletion) {
        push('API_CREDIT_PURCHASE_LEDGER_ISSUANCE_NOT_REQUIRED', 'credit_purchase.ledger_issuance_required_for_completion', 'Checkout completion must require successful ledger issuance.');
    }
    if (contract.successRedirectIsPaymentEvidence) {
        push('API_CREDIT_PURCHASE_REDIRECT_TRUSTED', 'credit_purchase.success_redirect_is_payment_evidence', 'A success redirect must never be treated as payment evidence.');
    }
    if (contract.clientAmountsAuthoritative) {
        push('API_CREDIT_PURCHASE_CLIENT_AMOUNT_TRUSTED', 'credit_purchase.client_amounts_authoritative', 'Client-supplied amount, currency, credits, bonus, and tax must never be authoritative.');
    }
    for (const operationId of CREDIT_PURCHASE_OPERATION_IDS) {
        const route = contracts.apiCatalog.routes.find((candidate) => candidate.operationId === operationId);
        if (!route) {
            push('API_CREDIT_PURCHASE_ROUTE_MISSING', 'credit_purchase.operation_ids', `Credit-purchase operation ${operationId} must exist in the route catalog.`);
            continue;
        }
        if (route.serviceId !== 'money-api' ||
            route.ownerBoundary !== 'money' ||
            route.tenantBoundary !== 'common_zdp_wallet') {
            push('API_CREDIT_PURCHASE_ROUTE_BOUNDARY_INVALID', `credit_purchase.operation_ids.${operationId}`, `Credit-purchase operation ${operationId} must stay on the Money common-wallet boundary.`);
        }
    }
    const schemaBundle = schemaBundlesByFile.get(CREDIT_PURCHASE_FILE);
    const intentRequest = schemaBundle?.schemas.find((schema) => schema.id === 'CreditCheckoutIntentCreateRequest');
    if (!intentRequest) {
        push('API_CREDIT_PURCHASE_INTENT_SCHEMA_MISSING', 'schema_bundle.schemas', 'Credit checkout intent request schema must exist.');
    }
    else {
        requireValues(intentRequest.requiredFields, CREDIT_PURCHASE_INTENT_BINDINGS, 'API_CREDIT_PURCHASE_INTENT_SCHEMA_BINDING_MISSING', 'schema_bundle.CreditCheckoutIntentCreateRequest.required_fields');
        const declaredFields = new Set([
            ...intentRequest.requiredFields,
            ...intentRequest.optionalFields
        ]);
        for (const field of CREDIT_PURCHASE_CLIENT_AUTHORITY_FIELDS) {
            if (declaredFields.has(field)) {
                push('API_CREDIT_PURCHASE_CLIENT_AUTHORITY_FIELD_FORBIDDEN', 'schema_bundle.CreditCheckoutIntentCreateRequest', `Checkout intent request must not accept client-authoritative field ${field}.`);
            }
        }
    }
    const receiptRequest = schemaBundle?.schemas.find((schema) => schema.id === 'CreditCheckoutReturnReceiptExchangeRequest');
    if (!receiptRequest ||
        !receiptRequest.carriesSecretMaterial ||
        receiptRequest.secretMaterialPolicy !==
            'one_time_receipt_input_only_never_echo_or_persist_plaintext' ||
        !receiptRequest.secretFields.includes('return_receipt')) {
        push('API_CREDIT_PURCHASE_RETURN_RECEIPT_SECRET_POLICY_INVALID', 'schema_bundle.CreditCheckoutReturnReceiptExchangeRequest', 'Return receipt exchange must treat the one-time receipt as non-echoing secret input.');
    }
}
function validateAccessDecision(contracts, schemaBundlesByFile, diagnostics) {
    const contract = contracts.accessDecision;
    const push = (code, path, message) => {
        diagnostics.push({ code, file: ACCESS_DECISION_FILE, path, message });
    };
    if (contract.schemaVersion !== 1) {
        push('API_ACCESS_DECISION_SCHEMA_VERSION_INVALID', 'access_decision.schema_version', 'Access-decision schema_version must be 1.');
    }
    if (contract.status !== 'contract-only' || contract.ownerBoundary !== 'access') {
        push('API_ACCESS_DECISION_OWNERSHIP_INVALID', 'access_decision', 'Access decisions must remain contract-only and owned by Core access.');
    }
    if (contract.operationId !== ACCESS_DECISION_OPERATION_ID ||
        contract.routePath !== ACCESS_DECISION_ROUTE_PATH) {
        push('API_ACCESS_DECISION_ROUTE_BINDING_INVALID', 'access_decision.operation_id', 'Access-decision contract must stay bound to the canonical operation and route path.');
    }
    validateRequiredAccessDecisionValues(contract.decisionValues, ACCESS_DECISION_VALUES, 'API_ACCESS_DECISION_VALUE_MISSING', 'access_decision.decision_values', push);
    if (!hasExactStringValues(contract.decisionValues, ACCESS_DECISION_VALUES)) {
        push('API_ACCESS_DECISION_VALUES_INVALID', 'access_decision.decision_values', 'Access decisions support exactly allow and deny outcomes.');
    }
    validateRequiredAccessDecisionValues(contract.requiredRequestBindings, ACCESS_DECISION_REQUEST_BINDINGS, 'API_ACCESS_DECISION_REQUEST_BINDING_MISSING', 'access_decision.required_request_bindings', push);
    validateRequiredAccessDecisionValues(contract.requiredResponseBindings, ACCESS_DECISION_RESPONSE_BINDINGS, 'API_ACCESS_DECISION_RESPONSE_BINDING_MISSING', 'access_decision.required_response_bindings', push);
    validateRequiredAccessDecisionValues(contract.trustedAuthoritySources, ACCESS_DECISION_TRUSTED_AUTHORITY_SOURCES, 'API_ACCESS_DECISION_AUTHORITY_SOURCE_MISSING', 'access_decision.trusted_authority_sources', push);
    validateRequiredAccessDecisionValues(contract.forbiddenRequestAuthorityFields, ACCESS_DECISION_FORBIDDEN_REQUEST_AUTHORITY_FIELDS, 'API_ACCESS_DECISION_REQUEST_AUTHORITY_FIELD_NOT_FORBIDDEN', 'access_decision.forbidden_request_authority_fields', push);
    validateRequiredAccessDecisionValues(contract.forbiddenConsumerUses, ACCESS_DECISION_FORBIDDEN_CONSUMER_USES, 'API_ACCESS_DECISION_CONSUMER_USE_NOT_FORBIDDEN', 'access_decision.forbidden_consumer_uses', push);
    validateRequiredAccessDecisionValues(contract.forbiddenValues, ACCESS_DECISION_FORBIDDEN_VALUES, 'API_ACCESS_DECISION_FORBIDDEN_VALUE_MISSING', 'access_decision.forbidden_values', push);
    if (contract.decisionBinding !==
        'exact_subject_session_product_action_resource_scope_policy_version_data_revision_and_normalized_request') {
        push('API_ACCESS_DECISION_EXACT_BINDING_INVALID', 'access_decision.decision_binding', 'Access decisions must bind the verified identity, exact request, policy version, and data revision.');
    }
    if (contract.denialPolicy !==
        'explicit_deny_no_match_missing_stale_unknown_or_dependency_failure_never_allows') {
        push('API_ACCESS_DECISION_DENIAL_POLICY_INVALID', 'access_decision.denial_policy', 'Access decisions must fail closed for explicit deny, no-match, missing, stale, unknown, and dependency failure states.');
    }
    if (contract.evidenceRefPolicy !==
        'opaque_non_secret_non_bearer_audit_reference') {
        push('API_ACCESS_DECISION_EVIDENCE_POLICY_INVALID', 'access_decision.evidence_ref_policy', 'Access decision_ref must remain an opaque non-bearer audit reference.');
    }
    if (contract.reasonCodePolicy !==
        'stable_safe_non_enumerating_code_without_raw_policy_or_relationship_details') {
        push('API_ACCESS_DECISION_REASON_CODE_POLICY_INVALID', 'access_decision.reason_code_policy', 'Access decision reason codes must be stable, safe, and non-enumerating.');
    }
    if (contract.expiryPolicy !==
        'decision_expiry_must_not_exceed_session_policy_or_authority_fact_expiry') {
        push('API_ACCESS_DECISION_EXPIRY_POLICY_INVALID', 'access_decision.expiry_policy', 'Access decision expiry must be bounded by session, policy, and authority-fact expiry.');
    }
    if (contract.idempotencyPolicy !==
        'same_key_same_normalized_binding_replays_different_binding_conflicts') {
        push('API_ACCESS_DECISION_IDEMPOTENCY_POLICY_INVALID', 'access_decision.idempotency_policy', 'Access decisions must replay only the same normalized binding and reject conflicting reuse.');
    }
    if (contract.obligationsPolicy !==
        'normalized_bounded_identifiers_enforced_at_the_product_effect_boundary') {
        push('API_ACCESS_DECISION_OBLIGATIONS_POLICY_INVALID', 'access_decision.obligations_policy', 'Access decision obligations must be bounded identifiers enforced at the product effect boundary.');
    }
    if (contract.consumerMappingPolicy !==
        'only_allow_maps_to_platform_access_granted_and_every_other_result_fails_closed') {
        push('API_ACCESS_DECISION_CONSUMER_MAPPING_INVALID', 'access_decision.consumer_mapping_policy', 'Consumers must map only allow to platform access and fail closed otherwise.');
    }
    const route = contracts.apiCatalog.routes.find((candidate) => candidate.operationId === ACCESS_DECISION_OPERATION_ID);
    if (!route) {
        push('API_ACCESS_DECISION_ROUTE_MISSING', 'access_decision.operation_id', 'API catalog must include the access-decision operation.');
    }
    else if (route.serviceId !== 'core-api' ||
        route.resource !== 'authorization_decision' ||
        route.action !== 'create' ||
        route.method !== 'POST' ||
        route.path !== ACCESS_DECISION_ROUTE_PATH ||
        route.successStatuses.length !== 1 ||
        route.successStatuses[0] !== 201 ||
        !route.authRequired ||
        route.permissionCheck !==
            'core.access.authorization_decision.evaluate_authenticated' ||
        route.auditEvent !== 'core.access.authorization_decision.recorded' ||
        route.idempotency !== 'required_idempotency_key' ||
        route.ownerBoundary !== 'access' ||
        route.tenantBoundary !== 'core_resolved_scope' ||
        route.sessionEffect !== 'none') {
        push('API_ACCESS_DECISION_ROUTE_INVALID', 'access_decision.operation_id', 'Access-decision route must create an authenticated, idempotent Core access decision with a 201 response.');
    }
    if (route &&
        (route.requestSchemaRef !==
            `${ACCESS_DECISION_FILE}#AccessAuthorizationDecisionCreateRequest` ||
            route.responseSchemaRef !==
                `${ACCESS_DECISION_FILE}#AccessAuthorizationDecisionCreateResponse`)) {
        push('API_ACCESS_DECISION_ROUTE_SCHEMA_REF_INVALID', 'access_decision.operation_id', 'Access-decision route must use the canonical access-owned request and response schemas.');
    }
    if (route &&
        route.errorCodes.some((code) => ['access_denied', 'scope_not_allowed', 'consent_required'].includes(code))) {
        push('API_ACCESS_DECISION_DENY_AS_TRANSPORT_ERROR', 'access_decision.operation_id', 'A completed deny decision must remain a 201 decision resource instead of a transport error.');
    }
    const bundle = schemaBundlesByFile.get(ACCESS_DECISION_FILE);
    const requestSchema = bundle?.schemas.find((schema) => schema.id === 'AccessAuthorizationDecisionCreateRequest');
    const responseSchema = bundle?.schemas.find((schema) => schema.id === 'AccessAuthorizationDecisionCreateResponse');
    if (!bundle || !requestSchema || !responseSchema) {
        push('API_ACCESS_DECISION_SCHEMA_BUNDLE_INVALID', 'schema_bundle', 'Access-decision request and response schemas must exist in the access-owned schema bundle.');
    }
    else {
        validateRequiredAccessDecisionValues(requestSchema.requiredFields, contract.requiredRequestBindings, 'API_ACCESS_DECISION_REQUEST_SCHEMA_BINDING_MISSING', 'schema_bundle.schemas.AccessAuthorizationDecisionCreateRequest.required_fields', push);
        validateRequiredAccessDecisionValues(responseSchema.requiredFields, contract.requiredResponseBindings, 'API_ACCESS_DECISION_RESPONSE_SCHEMA_BINDING_MISSING', 'schema_bundle.schemas.AccessAuthorizationDecisionCreateResponse.required_fields', push);
        const requestFields = [
            ...requestSchema.requiredFields,
            ...requestSchema.optionalFields
        ];
        for (const field of contract.forbiddenRequestAuthorityFields) {
            if (requestFields.includes(field)) {
                push('API_ACCESS_DECISION_REQUEST_TRUSTS_AUTHORITY_FIELD', 'schema_bundle.schemas.AccessAuthorizationDecisionCreateRequest', `Access-decision request must not accept authority field \`${field}\`.`);
            }
        }
    }
    const currentSessionResponse = schemaBundlesByFile
        .get('contracts/apis/core-api/auth-session-consumer.yaml')
        ?.schemas.find((schema) => schema.id === 'AuthSessionCurrentGetResponse');
    if (!currentSessionResponse) {
        push('API_ACCESS_DECISION_CURRENT_SESSION_SCHEMA_MISSING', 'schema_bundle', 'Current-session response schema must remain available for identity-only separation checks.');
    }
    else {
        const currentSessionFields = [
            ...currentSessionResponse.requiredFields,
            ...currentSessionResponse.optionalFields
        ];
        for (const field of CURRENT_SESSION_FORBIDDEN_ACCESS_FIELDS) {
            if (currentSessionFields.includes(field)) {
                push('API_ACCESS_DECISION_CURRENT_SESSION_CONFLATION', 'schema_bundle.schemas.AuthSessionCurrentGetResponse', `Current-session identity response must not carry access field \`${field}\`.`);
            }
        }
    }
}
function validateRequiredAccessDecisionValues(actual, required, code, path, push) {
    for (const value of required) {
        if (!actual.includes(value)) {
            push(code, path, `Access-decision contract must include \`${value}\`.`);
        }
    }
}
function hasExactStringValues(actual, expected) {
    return (actual.length === expected.length &&
        new Set(actual).size === actual.length &&
        expected.every((value) => actual.includes(value)));
}
function validateProductLinkHandoff(contracts, diagnostics) {
    const contract = contracts.productLinkHandoff;
    const push = (code, path, message) => {
        diagnostics.push({ code, file: PRODUCT_LINK_FILE, path, message });
    };
    if (contract.schemaVersion !== 1) {
        push('API_PRODUCT_LINK_SCHEMA_VERSION_INVALID', 'product_link_handoff.schema_version', 'Product-link handoff schema_version must be 1.');
    }
    if (contract.status !== 'contract-only' || contract.ownerBoundary !== 'identity') {
        push('API_PRODUCT_LINK_OWNERSHIP_INVALID', 'product_link_handoff', 'Product-link handoff must remain contract-only and owned by identity.');
    }
    if (contract.challengeTtlSeconds !== 600 || contract.minimumPollIntervalSeconds !== 5) {
        push('API_PRODUCT_LINK_TIMING_INVALID', 'product_link_handoff.challenge_ttl_seconds', 'Product-link challenges must expire after 600 seconds and enforce a minimum five-second polling interval.');
    }
    if (contract.proofMethod !== 'S256' ||
        contract.proofVerifierPolicy !== 'random_32_octets_base64url_no_padding' ||
        contract.proofChallengePolicy !== 'base64url_no_padding_sha256_of_verifier') {
        push('API_PRODUCT_LINK_PROOF_POLICY_INVALID', 'product_link_handoff.proof_method', 'Product-link proof must use the contracted S256 verifier binding.');
    }
    validateRequiredProductLinkValues(contract.lifecycleStates, PRODUCT_LINK_STATES, 'API_PRODUCT_LINK_STATE_MISSING', 'product_link_handoff.lifecycle_states', push);
    validateRequiredProductLinkValues(contract.terminalStates, PRODUCT_LINK_TERMINAL_STATES, 'API_PRODUCT_LINK_TERMINAL_STATE_MISSING', 'product_link_handoff.terminal_states', push);
    validateRequiredProductLinkValues(contract.requiredBindings, PRODUCT_LINK_REQUIRED_BINDINGS, 'API_PRODUCT_LINK_BINDING_MISSING', 'product_link_handoff.required_bindings', push);
    validateRequiredProductLinkValues(contract.exchangeResponseRefs, PRODUCT_LINK_EXCHANGE_REFS, 'API_PRODUCT_LINK_RESPONSE_REF_MISSING', 'product_link_handoff.exchange_response_refs', push);
    validateRequiredProductLinkValues(contract.forbiddenValues, PRODUCT_LINK_FORBIDDEN_VALUES, 'API_PRODUCT_LINK_FORBIDDEN_VALUE_MISSING', 'product_link_handoff.forbidden_values', push);
    const transitions = new Set(contract.transitions.map((transition) => `${transition.from}:${transition.event}:${transition.to}`));
    for (const transition of PRODUCT_LINK_TRANSITIONS) {
        if (!transitions.has(transition)) {
            push('API_PRODUCT_LINK_TRANSITION_MISSING', 'product_link_handoff.allowed_transitions', `Product-link handoff must declare transition \`${transition}\`.`);
        }
    }
    if (!contract.singleUseExchange) {
        push('API_PRODUCT_LINK_SINGLE_USE_REQUIRED', 'product_link_handoff.single_use_exchange', 'Product-link exchange must be single use.');
    }
    if (contract.correlationBinding !== 'same_challenge_same_correlation_idempotent_different_correlation_rejected') {
        push('API_PRODUCT_LINK_CORRELATION_POLICY_INVALID', 'product_link_handoff.correlation_binding', 'Product-link retries must preserve correlation and reject cross-correlation reuse.');
    }
    if (contract.localOnlyPolicy !== 'allowed_without_account_link_no_sync_entitlement_or_remote_account_features') {
        push('API_PRODUCT_LINK_LOCAL_ONLY_POLICY_INVALID', 'product_link_handoff.local_only_policy', 'Local-only mode must remain available without sync, entitlement, or remote account features.');
    }
}
function validateRequiredProductLinkValues(actual, required, code, path, push) {
    for (const value of required) {
        if (!actual.includes(value)) {
            push(code, path, `Product-link handoff must include \`${value}\`.`);
        }
    }
}
function validateCalculatorCatalog(contracts, diagnostics) {
    const catalog = contracts.calculatorCatalog;
    if (catalog.schemaVersion !== 1) {
        diagnostics.push({
            code: 'API_CALCULATOR_SCHEMA_VERSION_INVALID',
            file: CALCULATOR_CATALOG_FILE,
            path: 'calculator_contract.schema_version',
            message: 'Calculator contract schema_version must be 1.'
        });
    }
    if (catalog.status !== 'draft') {
        diagnostics.push({
            code: 'API_CALCULATOR_STATUS_INVALID',
            file: CALCULATOR_CATALOG_FILE,
            path: 'calculator_contract.status',
            message: 'Calculator catalog must stay draft until every first-batch definition is reviewed.'
        });
    }
    if (!CALCULATOR_VERSION_PATTERN.test(catalog.contractVersion)) {
        diagnostics.push({
            code: 'API_CALCULATOR_CONTRACT_VERSION_INVALID',
            file: CALCULATOR_CATALOG_FILE,
            path: 'calculator_contract.contract_version',
            message: 'Calculator contract_version must use numeric semver.'
        });
    }
    if (catalog.ownerBoundary !== 'calculator_contracts') {
        diagnostics.push({
            code: 'API_CALCULATOR_OWNER_BOUNDARY_INVALID',
            file: CALCULATOR_CATALOG_FILE,
            path: 'calculator_contract.owner_boundary',
            message: 'Calculator definitions must stay in the calculator_contracts owner boundary.'
        });
    }
    validateRequiredCatalogValues(catalog.requiredDefinitionFields, REQUIRED_CALCULATOR_DEFINITION_FIELDS, 'API_CALCULATOR_REQUIRED_FIELD', 'calculator_contract.required_definition_fields', diagnostics);
    validateRequiredCatalogValues(catalog.allowedLifecycleStatuses, ALLOWED_CALCULATOR_LIFECYCLE_STATUSES, 'API_CALCULATOR_LIFECYCLE_STATUS', 'calculator_contract.allowed_lifecycle_statuses', diagnostics);
    validateRequiredCatalogValues(catalog.allowedValueKinds, ALLOWED_CALCULATOR_VALUE_KINDS, 'API_CALCULATOR_VALUE_KIND', 'calculator_contract.allowed_value_kinds', diagnostics);
    validateRequiredCatalogValues(catalog.allowedUnitDimensions, ALLOWED_CALCULATOR_UNIT_DIMENSIONS, 'API_CALCULATOR_UNIT_DIMENSION', 'calculator_contract.allowed_unit_dimensions', diagnostics);
    validateRequiredCatalogValues(catalog.allowedUnitPolicies, ALLOWED_CALCULATOR_UNIT_POLICIES, 'API_CALCULATOR_UNIT_POLICY', 'calculator_contract.allowed_unit_policies', diagnostics);
    validateRequiredCatalogValues(catalog.stableErrorCodes, STABLE_CALCULATOR_ERROR_CODES, 'API_CALCULATOR_STABLE_ERROR_CODE', 'calculator_contract.stable_error_codes', diagnostics);
    validateUniqueCalculatorIds(catalog.definitions, diagnostics);
    for (const calculatorId of REQUIRED_CALCULATOR_IDS) {
        if (!catalog.definitions.some((definition) => definition.id === calculatorId)) {
            diagnostics.push({
                code: 'API_CALCULATOR_DEFINITION_MISSING',
                file: CALCULATOR_CATALOG_FILE,
                path: 'definitions',
                message: `Calculator definition \`${calculatorId}\` is required for the reviewed global batches.`
            });
        }
    }
    catalog.definitions.forEach((definition, index) => validateCalculatorDefinition(contracts, definition, index, diagnostics));
}
function validateCalculatorDefinition(contracts, definition, index, diagnostics) {
    const path = `definitions[${index}]`;
    if (!CALCULATOR_ID_PATTERN.test(definition.id)) {
        pushCalculatorDiagnostic(diagnostics, 'API_CALCULATOR_ID_INVALID', `${path}.id`, `Calculator id \`${definition.id}\` must use stable kebab-case.`);
    }
    if (!includesValue(REQUIRED_CALCULATOR_IDS, definition.id)) {
        pushCalculatorDiagnostic(diagnostics, 'API_CALCULATOR_ID_UNREVIEWED', `${path}.id`, `Calculator id \`${definition.id}\` is outside the reviewed global batches.`);
    }
    if (!contracts.calculatorCatalog.allowedLifecycleStatuses.includes(definition.lifecycleStatus)) {
        pushCalculatorDiagnostic(diagnostics, 'API_CALCULATOR_LIFECYCLE_STATUS_INVALID', `${path}.lifecycle_status`, `Calculator lifecycle status \`${definition.lifecycleStatus}\` is not allowed.`);
    }
    if (definition.contractVersion !== contracts.calculatorCatalog.contractVersion) {
        pushCalculatorDiagnostic(diagnostics, 'API_CALCULATOR_VERSION_MISMATCH', `${path}.contract_version`, 'Calculator definition contract_version must match the catalog contract_version.');
    }
    if (definition.compatibleEngineVersions.some((version) => !CALCULATOR_ENGINE_VERSION_PATTERN.test(version))) {
        pushCalculatorDiagnostic(diagnostics, 'API_CALCULATOR_ENGINE_VERSION_INVALID', `${path}.compatible_engine_versions`, 'Compatible engine versions must use numeric semver or a numeric major.x range.');
    }
    if (definition.jurisdiction !== 'global') {
        pushCalculatorDiagnostic(diagnostics, 'API_CALCULATOR_JURISDICTION_INVALID', `${path}.jurisdiction`, 'The first calculator batch must stay jurisdiction global.');
    }
    const isReviewedCalculator = includesValue(REVIEWED_CALCULATOR_IDS, definition.id);
    const expectedPrecisionPolicy = definition.id === 'date-difference' || definition.id === 'age'
        ? DATE_DIFFERENCE_PRECISION_POLICY
        : isReviewedCalculator
            ? REVIEWED_DECIMAL_PRECISION_POLICY
            : 'explicit_before_active';
    const expectedRoundingPolicy = definition.id === 'date-difference' || definition.id === 'age'
        ? DATE_DIFFERENCE_ROUNDING_POLICY
        : isReviewedCalculator
            ? REVIEWED_DECIMAL_ROUNDING_POLICY
            : 'explicit_before_active';
    if (definition.precisionPolicy !== expectedPrecisionPolicy) {
        pushCalculatorDiagnostic(diagnostics, 'API_CALCULATOR_PRECISION_POLICY_INVALID', `${path}.precision_policy`, `Calculator precision_policy must be \`${expectedPrecisionPolicy}\`.`);
    }
    if (definition.roundingPolicy !== expectedRoundingPolicy) {
        pushCalculatorDiagnostic(diagnostics, 'API_CALCULATOR_ROUNDING_POLICY_INVALID', `${path}.rounding_policy`, `Calculator rounding_policy must be \`${expectedRoundingPolicy}\`.`);
    }
    const expectedLifecycle = isReviewedCalculator ? 'reviewed' : 'draft';
    if (definition.lifecycleStatus !== expectedLifecycle) {
        pushCalculatorDiagnostic(diagnostics, 'API_CALCULATOR_REVIEW_STATE_INVALID', `${path}.lifecycle_status`, `Calculator lifecycle_status must be \`${expectedLifecycle}\` for the current implementation batch.`);
    }
    validateUniqueCalculatorFieldIds(definition, path, diagnostics);
    definition.inputs.forEach((input, inputIndex) => validateCalculatorInput(contracts, input, `${path}.inputs[${inputIndex}]`, diagnostics));
    definition.outputs.forEach((output, outputIndex) => validateCalculatorOutput(contracts, output, `${path}.outputs[${outputIndex}]`, diagnostics));
    const requiredErrorCodes = definition.id === 'date-difference' || definition.id === 'age'
        ? REQUIRED_CALCULATOR_BASE_ERROR_CODES.filter((code) => code !== 'precision_policy_required' && code !== 'rounding_policy_required')
        : REQUIRED_CALCULATOR_BASE_ERROR_CODES;
    for (const errorCode of requiredErrorCodes) {
        if (!definition.errorCodes.includes(errorCode)) {
            pushCalculatorDiagnostic(diagnostics, 'API_CALCULATOR_BASE_ERROR_CODE_MISSING', `${path}.error_codes`, `Calculator \`${definition.id}\` must declare base error code \`${errorCode}\`.`);
        }
    }
    for (const errorCode of definition.errorCodes) {
        if (!contracts.calculatorCatalog.stableErrorCodes.includes(errorCode)) {
            pushCalculatorDiagnostic(diagnostics, 'API_CALCULATOR_ERROR_CODE_INVALID', `${path}.error_codes`, `Calculator error code \`${errorCode}\` is not stable catalog metadata.`);
        }
    }
    validateUniqueStrings(definition.errorCodes, 'API_CALCULATOR_ERROR_CODE_DUPLICATE', `${path}.error_codes`, diagnostics);
    validateUniqueStrings(definition.semanticRules, 'API_CALCULATOR_SEMANTIC_RULE_DUPLICATE', `${path}.semantic_rules`, diagnostics);
    for (const rule of definition.semanticRules) {
        if (!CALCULATOR_RULE_PATTERN.test(rule)) {
            pushCalculatorDiagnostic(diagnostics, 'API_CALCULATOR_SEMANTIC_RULE_INVALID', `${path}.semantic_rules`, `Semantic rule \`${rule}\` must use stable snake_case.`);
        }
    }
}
function validateCalculatorConformance(contracts, diagnostics) {
    const conformance = contracts.calculatorConformance;
    if (conformance.schemaVersion !== 2) {
        pushCalculatorConformanceDiagnostic(diagnostics, 'API_CALCULATOR_CONFORMANCE_SCHEMA_VERSION_INVALID', 'calculator_conformance.schema_version', 'Calculator conformance schema_version must be 2.');
    }
    if (conformance.contractVersion !== contracts.calculatorCatalog.contractVersion) {
        pushCalculatorConformanceDiagnostic(diagnostics, 'API_CALCULATOR_CONFORMANCE_VERSION_MISMATCH', 'calculator_conformance.contract_version', 'Calculator conformance contract_version must match the calculator catalog.');
    }
    if (conformance.engineVersionRange !== '0.x') {
        pushCalculatorConformanceDiagnostic(diagnostics, 'API_CALCULATOR_CONFORMANCE_ENGINE_VERSION_INVALID', 'calculator_conformance.engine_version_range', 'The calculator engine compatibility range must be `0.x`.');
    }
    if (conformance.decimalInputPolicy !== CONFORMANCE_DECIMAL_INPUT_POLICY) {
        pushCalculatorConformanceDiagnostic(diagnostics, 'API_CALCULATOR_CONFORMANCE_INPUT_POLICY_INVALID', 'calculator_conformance.decimal_input_policy', `Decimal input policy must be \`${CONFORMANCE_DECIMAL_INPUT_POLICY}\`.`);
    }
    if (conformance.maxInputDigits !== CONFORMANCE_MAX_INPUT_DIGITS) {
        pushCalculatorConformanceDiagnostic(diagnostics, 'API_CALCULATOR_CONFORMANCE_INPUT_LIMIT_INVALID', 'calculator_conformance.max_input_digits', `max_input_digits must be ${CONFORMANCE_MAX_INPUT_DIGITS}.`);
    }
    if (conformance.maxDecimalPlaces !== CONFORMANCE_MAX_DECIMAL_PLACES) {
        pushCalculatorConformanceDiagnostic(diagnostics, 'API_CALCULATOR_CONFORMANCE_DECIMAL_PLACES_INVALID', 'calculator_conformance.max_decimal_places', `max_decimal_places must be ${CONFORMANCE_MAX_DECIMAL_PLACES}.`);
    }
    if (conformance.roundingMode !== CONFORMANCE_ROUNDING_MODE) {
        pushCalculatorConformanceDiagnostic(diagnostics, 'API_CALCULATOR_CONFORMANCE_ROUNDING_INVALID', 'calculator_conformance.rounding_mode', `rounding_mode must be \`${CONFORMANCE_ROUNDING_MODE}\`.`);
    }
    validateUniqueConformanceCaseIds(conformance.cases, diagnostics);
    for (const calculatorId of REVIEWED_CALCULATOR_IDS) {
        const definition = contracts.calculatorCatalog.definitions.find((candidate) => candidate.id === calculatorId);
        const cases = conformance.cases.filter((testCase) => testCase.calculatorId === calculatorId);
        if (!cases.some((testCase) => testCase.expected.status === 'success')) {
            pushCalculatorConformanceDiagnostic(diagnostics, 'API_CALCULATOR_CONFORMANCE_SUCCESS_CASE_MISSING', 'cases', `Reviewed calculator \`${calculatorId}\` needs a success fixture.`);
        }
        if (!cases.some((testCase) => testCase.expected.status === 'error')) {
            pushCalculatorConformanceDiagnostic(diagnostics, 'API_CALCULATOR_CONFORMANCE_ERROR_CASE_MISSING', 'cases', `Reviewed calculator \`${calculatorId}\` needs an error fixture.`);
        }
        if (definition) {
            for (const input of definition.inputs) {
                if (input.unitPolicy !== 'enumerated') {
                    continue;
                }
                for (const unit of input.unitOptions) {
                    const covered = cases.some((testCase) => {
                        if (testCase.expected.status !== 'success') {
                            return false;
                        }
                        const value = testCase.input[input.id];
                        return value !== undefined && typeof value !== 'string' && value.unit === unit;
                    });
                    if (!covered) {
                        pushCalculatorConformanceDiagnostic(diagnostics, 'API_CALCULATOR_CONFORMANCE_UNIT_COVERAGE_MISSING', 'cases', `Reviewed calculator \`${calculatorId}\` needs a successful \`${input.id}\` fixture for unit \`${unit}\`.`);
                    }
                }
                for (const allowedValue of input.allowedValues) {
                    const covered = cases.some((testCase) => testCase.expected.status === 'success' &&
                        testCase.input[input.id] === allowedValue);
                    if (!covered) {
                        pushCalculatorConformanceDiagnostic(diagnostics, 'API_CALCULATOR_CONFORMANCE_ENUM_COVERAGE_MISSING', 'cases', `Reviewed calculator \`${calculatorId}\` needs a successful \`${input.id}\` fixture for value \`${allowedValue}\`.`);
                    }
                }
            }
        }
    }
    conformance.cases.forEach((testCase, index) => validateCalculatorConformanceCase(contracts, testCase, index, diagnostics));
}
function validateCalculatorConformanceCase(contracts, testCase, index, diagnostics) {
    const path = `cases[${index}]`;
    if (!/^[a-z][a-z0-9-]*\.[a-z][a-z0-9-]*$/.test(testCase.id)) {
        pushCalculatorConformanceDiagnostic(diagnostics, 'API_CALCULATOR_CONFORMANCE_CASE_ID_INVALID', `${path}.id`, `Conformance case id \`${testCase.id}\` must use calculator.case kebab-case.`);
    }
    const definition = contracts.calculatorCatalog.definitions.find((candidate) => candidate.id === testCase.calculatorId);
    if (!definition || !includesValue(REVIEWED_CALCULATOR_IDS, testCase.calculatorId)) {
        pushCalculatorConformanceDiagnostic(diagnostics, 'API_CALCULATOR_CONFORMANCE_CALCULATOR_INVALID', `${path}.calculator_id`, `Conformance calculator \`${testCase.calculatorId}\` is not in the reviewed engine batch.`);
        return;
    }
    const expectsIntegerOutput = definition.outputs.every((output) => output.valueKind === 'integer');
    if (expectsIntegerOutput && testCase.options.decimalPlaces !== undefined) {
        pushCalculatorConformanceDiagnostic(diagnostics, 'API_CALCULATOR_CONFORMANCE_DECIMAL_PLACES_NOT_APPLICABLE', `${path}.options.decimal_places`, 'Exact integer calculators must not declare decimal_places.');
    }
    else if (!expectsIntegerOutput && (!Number.isInteger(testCase.options.decimalPlaces) ||
        (testCase.options.decimalPlaces ?? -1) < 0 ||
        (testCase.options.decimalPlaces ?? -1) > CONFORMANCE_MAX_DECIMAL_PLACES)) {
        pushCalculatorConformanceDiagnostic(diagnostics, 'API_CALCULATOR_CONFORMANCE_DECIMAL_PLACES_OUT_OF_RANGE', `${path}.options.decimal_places`, `decimal_places must be an integer from 0 to ${CONFORMANCE_MAX_DECIMAL_PLACES}.`);
    }
    validateConformanceKeys(Object.keys(testCase.input), definition.inputs.map((input) => input.id), `${path}.input`, diagnostics);
    const unsupportedInputUnits = validateCalculatorConformanceInputs(contracts, definition, testCase, path, diagnostics);
    if (testCase.expected.status === 'success') {
        validateConformanceKeys(Object.keys(testCase.expected.output), definition.outputs.map((output) => output.id), `${path}.expected.output`, diagnostics);
        for (const [field, output] of Object.entries(testCase.expected.output)) {
            const definitionOutput = definition.outputs.find((candidate) => candidate.id === field);
            if (definitionOutput?.valueKind === 'integer') {
                if (!Number.isSafeInteger(output.value)) {
                    pushCalculatorConformanceDiagnostic(diagnostics, 'API_CALCULATOR_CONFORMANCE_OUTPUT_VALUE_INVALID', `${path}.expected.output.${field}.value`, 'Successful exact-integer fixture output values must be safe JSON integers.');
                }
            }
            else if (typeof output.value !== 'string' ||
                !CANONICAL_CALCULATOR_DECIMAL_PATTERN.test(output.value)) {
                pushCalculatorConformanceDiagnostic(diagnostics, 'API_CALCULATOR_CONFORMANCE_OUTPUT_VALUE_INVALID', `${path}.expected.output.${field}.value`, 'Successful fixture output values must be canonical ASCII decimal strings.');
            }
            if (!definitionOutput) {
                continue;
            }
            if (definitionOutput.unitPolicy === 'enumerated' &&
                !definitionOutput.unitOptions.includes(output.unit)) {
                pushCalculatorConformanceDiagnostic(diagnostics, 'API_CALCULATOR_CONFORMANCE_OUTPUT_UNIT_INVALID', `${path}.expected.output.${field}.unit`, `Successful fixture output unit \`${output.unit}\` is not declared by \`${field}\`.`);
            }
            if (definitionOutput.unitPolicy === 'caller_supplied' &&
                !calculatorCallerSuppliedUnits(definition, testCase.input).includes(output.unit)) {
                pushCalculatorConformanceDiagnostic(diagnostics, 'API_CALCULATOR_CONFORMANCE_OUTPUT_UNIT_INVALID', `${path}.expected.output.${field}.unit`, `Successful fixture output unit \`${output.unit}\` must come from a caller-supplied input unit.`);
            }
            if (definitionOutput.valueKind !== 'integer' &&
                typeof output.value === 'string' &&
                decimalPlacesInCanonicalValue(output.value) !==
                    testCase.options.decimalPlaces) {
                pushCalculatorConformanceDiagnostic(diagnostics, 'API_CALCULATOR_CONFORMANCE_OUTPUT_PRECISION_INVALID', `${path}.expected.output.${field}.value`, `Successful fixture output must use exactly ${testCase.options.decimalPlaces} decimal places.`);
            }
        }
    }
    else if (!definition.errorCodes.includes(testCase.expected.errorCode)) {
        pushCalculatorConformanceDiagnostic(diagnostics, 'API_CALCULATOR_CONFORMANCE_ERROR_CODE_INVALID', `${path}.expected.error_code`, `Error fixture code \`${testCase.expected.errorCode}\` is not declared by \`${definition.id}\`.`);
    }
    else if (testCase.expected.errorCode === 'unsupported_unit' &&
        unsupportedInputUnits.length === 0) {
        pushCalculatorConformanceDiagnostic(diagnostics, 'API_CALCULATOR_CONFORMANCE_UNSUPPORTED_UNIT_CASE_INVALID', `${path}.input`, 'An unsupported_unit fixture must contain at least one unit outside its enumerated input contract.');
    }
}
function validateCalculatorConformanceInputs(contracts, definition, testCase, path, diagnostics) {
    const unsupportedUnits = [];
    const skipDecimalShape = testCase.expected.status === 'error' &&
        (testCase.expected.errorCode === 'invalid_input' ||
            testCase.expected.errorCode === 'limit_exceeded');
    for (const input of definition.inputs) {
        const value = testCase.input[input.id];
        if (value === undefined) {
            continue;
        }
        const inputPath = `${path}.input.${input.id}`;
        const decimalValue = calculatorConformanceDecimalValue(value, input.unitPolicy, inputPath, diagnostics);
        if (typeof value !== 'string' && input.unitPolicy === 'enumerated') {
            if (!input.unitOptions.includes(value.unit)) {
                unsupportedUnits.push(input.id);
                if (testCase.expected.status !== 'error' ||
                    testCase.expected.errorCode !== 'unsupported_unit') {
                    pushCalculatorConformanceDiagnostic(diagnostics, 'API_CALCULATOR_CONFORMANCE_INPUT_UNIT_INVALID', `${inputPath}.unit`, `Fixture input unit \`${value.unit}\` is not declared by \`${input.id}\`.`);
                }
            }
        }
        if (input.valueKind === 'enum' &&
            typeof value === 'string' &&
            !input.allowedValues.includes(value) &&
            (testCase.expected.status !== 'error' ||
                testCase.expected.errorCode !== 'invalid_input')) {
            pushCalculatorConformanceDiagnostic(diagnostics, 'API_CALCULATOR_CONFORMANCE_ENUM_VALUE_INVALID', inputPath, `Fixture enum value \`${value}\` is not declared by \`${input.id}\`.`);
        }
        if (input.valueKind === 'decimal' &&
            decimalValue !== undefined &&
            !skipDecimalShape) {
            if (!CANONICAL_CALCULATOR_DECIMAL_PATTERN.test(decimalValue)) {
                pushCalculatorConformanceDiagnostic(diagnostics, 'API_CALCULATOR_CONFORMANCE_INPUT_VALUE_INVALID', `${inputPath}${typeof value === 'string' ? '' : '.value'}`, 'Fixture decimal inputs must be canonical ASCII decimal strings.');
            }
            else if (decimalValue.replace(/[-.]/g, '').length >
                contracts.calculatorConformance.maxInputDigits) {
                pushCalculatorConformanceDiagnostic(diagnostics, 'API_CALCULATOR_CONFORMANCE_INPUT_LIMIT_INVALID', `${inputPath}${typeof value === 'string' ? '' : '.value'}`, `Fixture decimal inputs must not exceed ${contracts.calculatorConformance.maxInputDigits} digits.`);
            }
        }
    }
    return unsupportedUnits;
}
function calculatorConformanceDecimalValue(value, unitPolicy, path, diagnostics) {
    if (unitPolicy === 'none') {
        if (typeof value === 'string') {
            return value;
        }
        pushCalculatorConformanceDiagnostic(diagnostics, 'API_CALCULATOR_CONFORMANCE_INPUT_SHAPE_INVALID', path, 'A fixture input without units must be a decimal string.');
        return undefined;
    }
    if (typeof value !== 'string') {
        return value.value;
    }
    pushCalculatorConformanceDiagnostic(diagnostics, 'API_CALCULATOR_CONFORMANCE_INPUT_SHAPE_INVALID', path, 'A fixture input with a unit policy must be a value/unit object.');
    return undefined;
}
function calculatorCallerSuppliedUnits(definition, input) {
    return definition.inputs.flatMap((field) => {
        const value = input[field.id];
        return field.unitPolicy === 'caller_supplied' &&
            value !== undefined &&
            typeof value !== 'string'
            ? [value.unit]
            : [];
    });
}
function decimalPlacesInCanonicalValue(value) {
    const decimalPoint = value.indexOf('.');
    return decimalPoint === -1 ? 0 : value.length - decimalPoint - 1;
}
function validateConformanceKeys(actual, expected, path, diagnostics) {
    for (const key of expected) {
        if (!actual.includes(key)) {
            pushCalculatorConformanceDiagnostic(diagnostics, 'API_CALCULATOR_CONFORMANCE_FIELD_MISSING', path, `Conformance fixture must include field \`${key}\`.`);
        }
    }
    for (const key of actual) {
        if (!expected.includes(key)) {
            pushCalculatorConformanceDiagnostic(diagnostics, 'API_CALCULATOR_CONFORMANCE_FIELD_UNKNOWN', `${path}.${key}`, `Conformance fixture field \`${key}\` is not declared by the calculator contract.`);
        }
    }
}
function validateUniqueConformanceCaseIds(cases, diagnostics) {
    const seen = new Set();
    cases.forEach((testCase, index) => {
        if (seen.has(testCase.id)) {
            pushCalculatorConformanceDiagnostic(diagnostics, 'API_CALCULATOR_CONFORMANCE_CASE_DUPLICATE', `cases[${index}].id`, `Conformance case id \`${testCase.id}\` must be unique.`);
        }
        seen.add(testCase.id);
    });
}
function pushCalculatorConformanceDiagnostic(diagnostics, code, path, message) {
    diagnostics.push({
        code,
        file: CALCULATOR_CONFORMANCE_FILE,
        path,
        message
    });
}
function validateCalculatorInput(contracts, input, path, diagnostics) {
    validateCalculatorField(contracts, input, path, diagnostics);
    if (!CALCULATOR_RULE_PATTERN.test(input.domain)) {
        pushCalculatorDiagnostic(diagnostics, 'API_CALCULATOR_INPUT_DOMAIN_INVALID', `${path}.domain`, `Input domain \`${input.domain}\` must use stable snake_case.`);
    }
    if (input.valueKind === 'enum' && input.allowedValues.length === 0) {
        pushCalculatorDiagnostic(diagnostics, 'API_CALCULATOR_ENUM_VALUES_MISSING', `${path}.allowed_values`, 'Enum inputs must declare allowed_values.');
    }
    if (input.valueKind !== 'enum' && input.allowedValues.length > 0) {
        pushCalculatorDiagnostic(diagnostics, 'API_CALCULATOR_ENUM_VALUES_UNEXPECTED', `${path}.allowed_values`, 'Only enum inputs may declare allowed_values.');
    }
    validateUniqueStrings(input.allowedValues, 'API_CALCULATOR_ENUM_VALUE_DUPLICATE', `${path}.allowed_values`, diagnostics);
}
function validateCalculatorOutput(contracts, output, path, diagnostics) {
    validateCalculatorField(contracts, output, path, diagnostics);
}
function validateCalculatorField(contracts, field, path, diagnostics) {
    if (!CALCULATOR_FIELD_ID_PATTERN.test(field.id)) {
        pushCalculatorDiagnostic(diagnostics, 'API_CALCULATOR_FIELD_ID_INVALID', `${path}.id`, `Calculator field id \`${field.id}\` must use stable snake_case.`);
    }
    if (!contracts.calculatorCatalog.allowedValueKinds.includes(field.valueKind)) {
        pushCalculatorDiagnostic(diagnostics, 'API_CALCULATOR_VALUE_KIND_INVALID', `${path}.value_kind`, `Calculator value kind \`${field.valueKind}\` is not allowed.`);
    }
    if (!contracts.calculatorCatalog.allowedUnitDimensions.includes(field.unitDimension)) {
        pushCalculatorDiagnostic(diagnostics, 'API_CALCULATOR_UNIT_DIMENSION_INVALID', `${path}.unit_dimension`, `Calculator unit dimension \`${field.unitDimension}\` is not allowed.`);
    }
    if (!contracts.calculatorCatalog.allowedUnitPolicies.includes(field.unitPolicy)) {
        pushCalculatorDiagnostic(diagnostics, 'API_CALCULATOR_UNIT_POLICY_INVALID', `${path}.unit_policy`, `Calculator unit policy \`${field.unitPolicy}\` is not allowed.`);
    }
    if (field.unitPolicy === 'enumerated' && field.unitOptions.length === 0) {
        pushCalculatorDiagnostic(diagnostics, 'API_CALCULATOR_UNIT_OPTIONS_MISSING', `${path}.unit_options`, 'Enumerated unit policy must declare unit_options.');
    }
    if (field.unitPolicy !== 'enumerated' && field.unitOptions.length > 0) {
        pushCalculatorDiagnostic(diagnostics, 'API_CALCULATOR_UNIT_OPTIONS_UNEXPECTED', `${path}.unit_options`, 'Only enumerated unit policy may declare unit_options.');
    }
    validateUniqueStrings(field.unitOptions, 'API_CALCULATOR_UNIT_OPTION_DUPLICATE', `${path}.unit_options`, diagnostics);
    if (field.valueKind === 'date' && field.unitDimension !== 'date') {
        pushCalculatorDiagnostic(diagnostics, 'API_CALCULATOR_DATE_DIMENSION_INVALID', `${path}.unit_dimension`, 'Date values must use the date unit dimension.');
    }
}
function validateRequiredCatalogValues(actual, required, codePrefix, path, diagnostics) {
    for (const value of required) {
        if (!actual.includes(value)) {
            pushCalculatorDiagnostic(diagnostics, `${codePrefix}_MISSING`, path, `Calculator catalog must declare \`${value}\`.`);
        }
    }
    for (const value of actual) {
        if (!required.includes(value)) {
            pushCalculatorDiagnostic(diagnostics, `${codePrefix}_INVALID`, path, `Calculator catalog value \`${value}\` is not reviewed.`);
        }
    }
    validateUniqueStrings(actual, `${codePrefix}_DUPLICATE`, path, diagnostics);
}
function validateUniqueCalculatorIds(definitions, diagnostics) {
    const ids = definitions.map((definition) => definition.id);
    validateUniqueStrings(ids, 'API_CALCULATOR_ID_DUPLICATE', 'definitions', diagnostics);
}
function validateUniqueCalculatorFieldIds(definition, path, diagnostics) {
    validateUniqueStrings(definition.inputs.map((input) => input.id), 'API_CALCULATOR_INPUT_ID_DUPLICATE', `${path}.inputs`, diagnostics);
    validateUniqueStrings(definition.outputs.map((output) => output.id), 'API_CALCULATOR_OUTPUT_ID_DUPLICATE', `${path}.outputs`, diagnostics);
}
function validateUniqueStrings(values, code, path, diagnostics) {
    const seen = new Set();
    for (const value of values) {
        if (seen.has(value)) {
            pushCalculatorDiagnostic(diagnostics, code, path, `Calculator contract value \`${value}\` must be unique.`);
        }
        seen.add(value);
    }
}
function pushCalculatorDiagnostic(diagnostics, code, path, message) {
    diagnostics.push({ code, file: CALCULATOR_CATALOG_FILE, path, message });
}
function validateRouteContract(contracts, diagnostics) {
    if (contracts.route.status !== 'skeleton') {
        diagnostics.push({
            code: 'API_ROUTE_STATUS_INVALID',
            file: 'contracts/route-contract.yaml',
            path: 'route_contract.status',
            message: 'Route contract must stay in skeleton status until real routes exist.'
        });
    }
    for (const field of REQUIRED_ROUTE_FIELDS) {
        if (!contracts.route.requiredPerRoute.includes(field)) {
            diagnostics.push({
                code: 'API_ROUTE_REQUIRED_FIELD_MISSING',
                file: 'contracts/route-contract.yaml',
                path: 'route_contract.required_per_route',
                message: `Route contract must require \`${field}\` for every route.`
            });
        }
    }
    for (const method of ALLOWED_ROUTE_METHODS) {
        if (!contracts.route.allowedMethods.includes(method)) {
            diagnostics.push({
                code: 'API_ROUTE_ALLOWED_METHOD_MISSING',
                file: 'contracts/route-contract.yaml',
                path: 'route_contract.allowed_methods',
                message: `Route contract must allow standard method \`${method}\`.`
            });
        }
    }
    for (const method of contracts.route.allowedMethods) {
        if (!includesValue(ALLOWED_ROUTE_METHODS, method)) {
            diagnostics.push({
                code: 'API_ROUTE_ALLOWED_METHOD_INVALID',
                file: 'contracts/route-contract.yaml',
                path: 'route_contract.allowed_methods',
                message: `Route contract must not allow non-standard method \`${method}\`.`
            });
        }
    }
    for (const status of ALLOWED_SUCCESS_STATUSES) {
        if (!contracts.route.allowedSuccessStatuses.includes(status)) {
            diagnostics.push({
                code: 'API_ROUTE_ALLOWED_SUCCESS_STATUS_MISSING',
                file: 'contracts/route-contract.yaml',
                path: 'route_contract.allowed_success_statuses',
                message: `Route contract must allow success status \`${status}\`.`
            });
        }
    }
    for (const status of contracts.route.allowedSuccessStatuses) {
        if (!includesValue(ALLOWED_SUCCESS_STATUSES, status)) {
            diagnostics.push({
                code: 'API_ROUTE_ALLOWED_SUCCESS_STATUS_INVALID',
                file: 'contracts/route-contract.yaml',
                path: 'route_contract.allowed_success_statuses',
                message: `Route contract must not allow ambiguous success status \`${status}\`.`
            });
        }
    }
    for (const status of NO_CONTENT_SUCCESS_STATUSES) {
        if (!contracts.route.noContentSuccessStatuses.includes(status)) {
            diagnostics.push({
                code: 'API_ROUTE_NO_CONTENT_SUCCESS_STATUS_MISSING',
                file: 'contracts/route-contract.yaml',
                path: 'route_contract.no_content_success_statuses',
                message: `Route contract must classify success status \`${status}\` as bodyless.`
            });
        }
    }
    for (const status of contracts.route.noContentSuccessStatuses) {
        if (!includesValue(NO_CONTENT_SUCCESS_STATUSES, status)) {
            diagnostics.push({
                code: 'API_ROUTE_NO_CONTENT_SUCCESS_STATUS_INVALID',
                file: 'contracts/route-contract.yaml',
                path: 'route_contract.no_content_success_statuses',
                message: `Route contract must not classify status \`${status}\` as bodyless.`
            });
        }
        if (!contracts.route.allowedSuccessStatuses.includes(status)) {
            diagnostics.push({
                code: 'API_ROUTE_NO_CONTENT_SUCCESS_STATUS_NOT_ALLOWED',
                file: 'contracts/route-contract.yaml',
                path: 'route_contract.no_content_success_statuses',
                message: `Bodyless success status \`${status}\` must also be allowed.`
            });
        }
    }
    for (const shape of FORBIDDEN_ROUTE_SHAPES) {
        if (!contracts.route.forbiddenShapes.includes(shape)) {
            diagnostics.push({
                code: 'API_ROUTE_FORBIDDEN_SHAPE_MISSING',
                file: 'contracts/route-contract.yaml',
                path: 'route_contract.forbidden_shapes',
                message: `Route contract must forbid \`${shape}\`.`
            });
        }
    }
    for (const effect of ALLOWED_SESSION_EFFECTS) {
        if (!contracts.route.allowedSessionEffects.includes(effect)) {
            diagnostics.push({
                code: 'API_ROUTE_ALLOWED_SESSION_EFFECT_MISSING',
                file: 'contracts/route-contract.yaml',
                path: 'route_contract.allowed_session_effects',
                message: `Route contract must allow session effect \`${effect}\`.`
            });
        }
    }
}
function validateErrorEnvelopeContract(contracts, diagnostics) {
    if (contracts.errorEnvelope.schemaVersion !== 1) {
        diagnostics.push({
            code: 'API_ERROR_SCHEMA_VERSION_INVALID',
            file: 'contracts/error-envelope.yaml',
            path: 'error_envelope.schema_version',
            message: 'Error envelope schema_version must remain 1 until a migration exists.'
        });
    }
    for (const field of REQUIRED_ERROR_FIELDS) {
        if (!contracts.errorEnvelope.requiredFields.includes(field)) {
            diagnostics.push({
                code: 'API_ERROR_REQUIRED_FIELD_MISSING',
                file: 'contracts/error-envelope.yaml',
                path: 'error_envelope.required_fields',
                message: `Error envelope must require \`${field}\`.`
            });
        }
    }
    for (const field of FORBIDDEN_ERROR_FIELDS) {
        if (!contracts.errorEnvelope.forbiddenFields.includes(field)) {
            diagnostics.push({
                code: 'API_ERROR_FORBIDDEN_FIELD_MISSING',
                file: 'contracts/error-envelope.yaml',
                path: 'error_envelope.forbidden_fields',
                message: `Error envelope must forbid \`${field}\`.`
            });
        }
    }
}
function validateWebhookContract(contracts, diagnostics) {
    if (contracts.webhook.status !== 'skeleton') {
        diagnostics.push({
            code: 'API_WEBHOOK_STATUS_INVALID',
            file: 'contracts/webhook-contract.yaml',
            path: 'webhook_contract.status',
            message: 'Webhook contract must stay in skeleton status until real webhooks exist.'
        });
    }
    for (const control of REQUIRED_WEBHOOK_CONTROLS) {
        if (!contracts.webhook.requiredControls.includes(control)) {
            diagnostics.push({
                code: 'API_WEBHOOK_REQUIRED_CONTROL_MISSING',
                file: 'contracts/webhook-contract.yaml',
                path: 'webhook_contract.required_controls',
                message: `Webhook contract must require \`${control}\`.`
            });
        }
    }
    for (const control of FORBIDDEN_WEBHOOK_CONTROLS) {
        if (!contracts.webhook.forbiddenControls.includes(control)) {
            diagnostics.push({
                code: 'API_WEBHOOK_FORBIDDEN_CONTROL_MISSING',
                file: 'contracts/webhook-contract.yaml',
                path: 'webhook_contract.forbidden_controls',
                message: `Webhook contract must forbid \`${control}\`.`
            });
        }
    }
}
function validateSdkGenerationInputContract(contracts, diagnostics) {
    if (contracts.sdkGenerationInput.status !== 'skeleton') {
        diagnostics.push({
            code: 'API_SDK_GENERATION_STATUS_INVALID',
            file: 'contracts/sdk-generation-input.yaml',
            path: 'sdk_generation_input.status',
            message: 'SDK generation input must stay in skeleton status until real generators exist.'
        });
    }
    for (const sourceContract of REQUIRED_SDK_SOURCE_CONTRACTS) {
        if (!contracts.sdkGenerationInput.sourceContracts.includes(sourceContract)) {
            diagnostics.push({
                code: 'API_SDK_GENERATION_SOURCE_CONTRACT_MISSING',
                file: 'contracts/sdk-generation-input.yaml',
                path: 'sdk_generation_input.source_contracts',
                message: `SDK generation input must read \`${sourceContract}\`.`
            });
        }
    }
    for (const schemaBundle of contracts.schemaBundles) {
        if (!contracts.sdkGenerationInput.sourceContracts.includes(schemaBundle.file)) {
            diagnostics.push({
                code: 'API_SDK_GENERATION_SCHEMA_BUNDLE_SOURCE_MISSING',
                file: 'contracts/sdk-generation-input.yaml',
                path: 'sdk_generation_input.source_contracts',
                message: `SDK generation input must read schema bundle \`${schemaBundle.file}\`.`
            });
        }
    }
    for (const target of contracts.sdkGenerationInput.allowedGenerationTargets) {
        if (!SDK_TARGET_PATTERN.test(target)) {
            diagnostics.push({
                code: 'API_SDK_ALLOWED_GENERATION_TARGET_INVALID',
                file: 'contracts/sdk-generation-input.yaml',
                path: 'sdk_generation_input.allowed_generation_targets',
                message: `SDK generation target \`${target}\` must be a stable lowercase identifier.`
            });
        }
    }
    for (const target of REQUIRED_SDK_GENERATION_TARGETS) {
        if (!contracts.sdkGenerationInput.generationTargets.includes(target)) {
            diagnostics.push({
                code: 'API_SDK_GENERATION_TARGET_MISSING',
                file: 'contracts/sdk-generation-input.yaml',
                path: 'sdk_generation_input.generation_targets',
                message: `SDK generation input must keep required target \`${target}\` active.`
            });
        }
    }
    for (const target of contracts.sdkGenerationInput.generationTargets) {
        if (!contracts.sdkGenerationInput.allowedGenerationTargets.includes(target)) {
            diagnostics.push({
                code: 'API_SDK_GENERATION_TARGET_INVALID',
                file: 'contracts/sdk-generation-input.yaml',
                path: 'sdk_generation_input.generation_targets',
                message: `SDK generation target \`${target}\` must be declared in allowed_generation_targets.`
            });
        }
    }
    for (const metadata of REQUIRED_SDK_ROUTE_METADATA) {
        if (!contracts.sdkGenerationInput.requiredRouteMetadata.includes(metadata)) {
            diagnostics.push({
                code: 'API_SDK_ROUTE_METADATA_MISSING',
                file: 'contracts/sdk-generation-input.yaml',
                path: 'sdk_generation_input.required_route_metadata',
                message: `SDK generation input must carry route metadata \`${metadata}\`.`
            });
        }
    }
    for (const metadata of REQUIRED_SDK_ERROR_METADATA) {
        if (!contracts.sdkGenerationInput.requiredErrorMetadata.includes(metadata)) {
            diagnostics.push({
                code: 'API_SDK_ERROR_METADATA_MISSING',
                file: 'contracts/sdk-generation-input.yaml',
                path: 'sdk_generation_input.required_error_metadata',
                message: `SDK generation input must carry error metadata \`${metadata}\`.`
            });
        }
    }
    for (const metadata of REQUIRED_SDK_CLIENT_RUNTIME_METADATA) {
        if (!contracts.sdkGenerationInput.requiredClientRuntimeMetadata.includes(metadata)) {
            diagnostics.push({
                code: 'API_SDK_CLIENT_RUNTIME_METADATA_MISSING',
                file: 'contracts/sdk-generation-input.yaml',
                path: 'sdk_generation_input.required_client_runtime_metadata',
                message: `SDK generation input must carry client runtime metadata ` +
                    `\`${metadata}\`.`
            });
        }
    }
    for (const metadata of REQUIRED_SDK_WEBHOOK_METADATA) {
        if (!contracts.sdkGenerationInput.requiredWebhookMetadata.includes(metadata)) {
            diagnostics.push({
                code: 'API_SDK_WEBHOOK_METADATA_MISSING',
                file: 'contracts/sdk-generation-input.yaml',
                path: 'sdk_generation_input.required_webhook_metadata',
                message: `SDK generation input must carry webhook metadata \`${metadata}\`.`
            });
        }
    }
    for (const ownership of FORBIDDEN_SDK_OWNERSHIP) {
        if (!contracts.sdkGenerationInput.forbiddenOwnership.includes(ownership)) {
            diagnostics.push({
                code: 'API_SDK_FORBIDDEN_OWNERSHIP_MISSING',
                file: 'contracts/sdk-generation-input.yaml',
                path: 'sdk_generation_input.forbidden_ownership',
                message: `SDK generation input must not own \`${ownership}\`.`
            });
        }
    }
    for (const value of FORBIDDEN_SDK_VALUES) {
        if (!contracts.sdkGenerationInput.forbiddenValues.includes(value)) {
            diagnostics.push({
                code: 'API_SDK_FORBIDDEN_VALUE_MISSING',
                file: 'contracts/sdk-generation-input.yaml',
                path: 'sdk_generation_input.forbidden_values',
                message: `SDK generation input must forbid \`${value}\`.`
            });
        }
    }
}
function validateApiCatalogContract(contracts, schemaBundlesByFile, diagnostics) {
    if (contracts.apiCatalog.routes.length === 0 &&
        contracts.apiCatalog.status !== API_CATALOG_EMPTY_STATUS) {
        diagnostics.push({
            code: 'API_CATALOG_STATUS_INVALID',
            file: 'contracts/apis/catalog.yaml',
            path: 'api_catalog.status',
            message: 'API catalog must stay empty-until-service-routes-exist while routes is empty.'
        });
    }
    if (contracts.apiCatalog.routes.length > 0 &&
        contracts.apiCatalog.status !== API_CATALOG_ACTIVE_STATUS) {
        diagnostics.push({
            code: 'API_CATALOG_STATUS_INVALID',
            file: 'contracts/apis/catalog.yaml',
            path: 'api_catalog.status',
            message: 'API catalog must use route-catalog-contract-only status when route definitions exist.'
        });
    }
    for (const field of API_CATALOG_REQUIRED_ROUTE_FIELDS) {
        if (!contracts.apiCatalog.routeDefinitionRequiredFields.includes(field)) {
            diagnostics.push({
                code: 'API_CATALOG_ROUTE_FIELD_MISSING',
                file: 'contracts/apis/catalog.yaml',
                path: 'api_catalog.route_definition_required_fields',
                message: `API catalog route definitions must require \`${field}\`.`
            });
        }
    }
    for (const field of contracts.route.requiredPerRoute) {
        if (!contracts.apiCatalog.routeDefinitionRequiredFields.includes(field)) {
            diagnostics.push({
                code: 'API_CATALOG_ROUTE_CONTRACT_FIELD_MISSING',
                file: 'contracts/apis/catalog.yaml',
                path: 'api_catalog.route_definition_required_fields',
                message: `API catalog route definitions must mirror route contract field \`${field}\`.`
            });
        }
    }
    for (const metadata of contracts.sdkGenerationInput.requiredRouteMetadata) {
        if (!contracts.apiCatalog.routeDefinitionRequiredFields.includes(metadata)) {
            diagnostics.push({
                code: 'API_CATALOG_SDK_ROUTE_METADATA_MISSING',
                file: 'contracts/apis/catalog.yaml',
                path: 'api_catalog.route_definition_required_fields',
                message: `API catalog route definitions must carry SDK route metadata \`${metadata}\`.`
            });
        }
    }
    for (const value of contracts.sdkGenerationInput.forbiddenValues) {
        if (!contracts.apiCatalog.forbiddenValues.includes(value)) {
            diagnostics.push({
                code: 'API_CATALOG_FORBIDDEN_VALUE_MISSING',
                file: 'contracts/apis/catalog.yaml',
                path: 'api_catalog.forbidden_values',
                message: `API catalog must forbid \`${value}\`.`
            });
        }
    }
    for (const value of CANONICAL_FORBIDDEN_VALUES) {
        if (!contracts.apiCatalog.forbiddenValues.includes(value)) {
            diagnostics.push({
                code: 'API_CATALOG_CANONICAL_FORBIDDEN_VALUE_MISSING',
                file: 'contracts/apis/catalog.yaml',
                path: 'api_catalog.forbidden_values',
                message: `API catalog must carry canonical forbidden value \`${value}\`.`
            });
        }
    }
    validateUniqueRouteKeys(contracts.apiCatalog.routes, diagnostics);
    contracts.apiCatalog.routes.forEach((route, index) => {
        validateRouteDefinition(route, index, contracts, schemaBundlesByFile, diagnostics);
    });
}
function validateRouteDefinition(route, index, contracts, schemaBundlesByFile, diagnostics) {
    const routePath = `routes[${index}]`;
    if (!OPERATION_ID_PATTERN.test(route.operationId)) {
        diagnostics.push({
            code: 'API_CATALOG_ROUTE_OPERATION_ID_INVALID',
            file: 'contracts/apis/catalog.yaml',
            path: `${routePath}.operation_id`,
            message: `API route operation_id \`${route.operationId}\` must be a stable lowercase identifier.`
        });
    }
    if (!contracts.route.allowedMethods.includes(route.method)) {
        diagnostics.push({
            code: 'API_CATALOG_ROUTE_METHOD_INVALID',
            file: 'contracts/apis/catalog.yaml',
            path: `${routePath}.method`,
            message: `API route \`${route.operationId}\` uses unsupported method \`${route.method}\`.`
        });
    }
    if (!route.path.startsWith('/')) {
        diagnostics.push({
            code: 'API_CATALOG_ROUTE_PATH_INVALID',
            file: 'contracts/apis/catalog.yaml',
            path: `${routePath}.path`,
            message: `API route \`${route.operationId}\` path must start with \`/\`.`
        });
    }
    const requestSchema = validateRouteSchemaRef({
        route,
        routePath,
        ref: route.requestSchemaRef,
        field: 'request_schema_ref',
        expectedKind: 'request',
        schemaBundlesByFile,
        diagnostics
    });
    const responseSchema = route.responseSchemaRef === null
        ? null
        : validateRouteSchemaRef({
            route,
            routePath,
            ref: route.responseSchemaRef,
            field: 'response_schema_ref',
            expectedKind: 'response',
            schemaBundlesByFile,
            diagnostics
        });
    if (!route.requestIdRequired) {
        diagnostics.push({
            code: 'API_CATALOG_ROUTE_REQUEST_ID_NOT_REQUIRED',
            file: 'contracts/apis/catalog.yaml',
            path: `${routePath}.request_id_required`,
            message: `API route \`${route.operationId}\` must require request_id propagation.`
        });
    }
    if (!route.traceIdRequired) {
        diagnostics.push({
            code: 'API_CATALOG_ROUTE_TRACE_ID_NOT_REQUIRED',
            file: 'contracts/apis/catalog.yaml',
            path: `${routePath}.trace_id_required`,
            message: `API route \`${route.operationId}\` must require trace_id propagation.`
        });
    }
    if (!contracts.route.allowedSessionEffects.includes(route.sessionEffect)) {
        diagnostics.push({
            code: 'API_CATALOG_ROUTE_SESSION_EFFECT_INVALID',
            file: 'contracts/apis/catalog.yaml',
            path: `${routePath}.session_effect`,
            message: `API route \`${route.operationId}\` uses unsupported session effect \`${route.sessionEffect}\`.`
        });
    }
    if (!includesValue(ALLOWED_IDEMPOTENCY_POLICIES, route.idempotency)) {
        diagnostics.push({
            code: 'API_CATALOG_ROUTE_IDEMPOTENCY_POLICY_INVALID',
            file: 'contracts/apis/catalog.yaml',
            path: `${routePath}.idempotency`,
            message: `API route \`${route.operationId}\` uses unsupported idempotency policy \`${route.idempotency}\`.`
        });
    }
    if (includesValue(MUTATING_METHODS_REQUIRING_IDEMPOTENCY, route.method) &&
        route.idempotency !== REQUIRED_MUTATION_IDEMPOTENCY_POLICY) {
        diagnostics.push({
            code: 'API_CATALOG_ROUTE_MUTATION_IDEMPOTENCY_NOT_REQUIRED',
            file: 'contracts/apis/catalog.yaml',
            path: `${routePath}.idempotency`,
            message: `Mutating API route \`${route.operationId}\` must require idempotency keys.`
        });
    }
    if (requestSchema) {
        validateRouteRequestIdempotencyMetadata({
            route,
            routePath,
            requestSchemaBundle: requestSchema.bundle,
            diagnostics
        });
    }
    if (!includesValue(ALLOWED_CREDENTIAL_POLICIES, route.credentialPolicy)) {
        if (REQUIRED_CREDENTIAL_POLICY_PARTS.some((part) => !route.credentialPolicy.includes(part))) {
            diagnostics.push({
                code: 'API_CATALOG_ROUTE_CREDENTIAL_POLICY_INCOMPLETE',
                file: 'contracts/apis/catalog.yaml',
                path: `${routePath}.credential_policy`,
                message: `API route \`${route.operationId}\` credential policy must name every required secret-exclusion part.`
            });
        }
        diagnostics.push({
            code: 'API_CATALOG_ROUTE_CREDENTIAL_POLICY_INVALID',
            file: 'contracts/apis/catalog.yaml',
            path: `${routePath}.credential_policy`,
            message: `API route \`${route.operationId}\` credential policy must exactly match an allowed policy.`
        });
    }
    if (!route.authRequired && route.permissionCheck !== PUBLIC_AUTH_PERMISSION_CHECK) {
        diagnostics.push({
            code: 'API_CATALOG_PUBLIC_ROUTE_PERMISSION_CHECK_INVALID',
            file: 'contracts/apis/catalog.yaml',
            path: `${routePath}.permission_check`,
            message: `Public API route \`${route.operationId}\` must use \`${PUBLIC_AUTH_PERMISSION_CHECK}\`.`
        });
    }
    if (!includesValue(ALLOWED_OWNER_BOUNDARIES, route.ownerBoundary)) {
        diagnostics.push({
            code: 'API_CATALOG_ROUTE_OWNER_BOUNDARY_INVALID',
            file: 'contracts/apis/catalog.yaml',
            path: `${routePath}.owner_boundary`,
            message: `API route \`${route.operationId}\` uses unsupported owner boundary \`${route.ownerBoundary}\`.`
        });
    }
    if (!includesValue(ALLOWED_TENANT_BOUNDARIES, route.tenantBoundary)) {
        diagnostics.push({
            code: 'API_CATALOG_ROUTE_TENANT_BOUNDARY_INVALID',
            file: 'contracts/apis/catalog.yaml',
            path: `${routePath}.tenant_boundary`,
            message: `API route \`${route.operationId}\` uses unsupported tenant boundary \`${route.tenantBoundary}\`.`
        });
    }
    for (const status of route.successStatuses) {
        if (!contracts.route.allowedSuccessStatuses.includes(status)) {
            diagnostics.push({
                code: 'API_CATALOG_ROUTE_SUCCESS_STATUS_INVALID',
                file: 'contracts/apis/catalog.yaml',
                path: `${routePath}.success_statuses`,
                message: `API route \`${route.operationId}\` uses unsupported success status \`${status}\`.`
            });
        }
    }
    validateRouteResponseBodyContract({
        route,
        routePath,
        noContentSuccessStatuses: contracts.route.noContentSuccessStatuses,
        diagnostics
    });
    for (const requiredErrorCode of SESSION_EFFECT_REQUIRED_ERROR_CODES[route.sessionEffect] ?? []) {
        if (!route.errorCodes.includes(requiredErrorCode)) {
            diagnostics.push({
                code: 'API_CATALOG_ROUTE_SESSION_ERROR_CODE_MISSING',
                file: 'contracts/apis/catalog.yaml',
                path: `${routePath}.error_codes`,
                message: `API route \`${route.operationId}\` with session effect \`${route.sessionEffect}\` must include error code \`${requiredErrorCode}\`.`
            });
        }
    }
    if (requestSchema && responseSchema) {
        validateSecretMaterialDoesNotEcho({
            route,
            routePath,
            requestSchema: requestSchema.schema,
            responseSchema: responseSchema.schema,
            diagnostics
        });
    }
}
function validateRouteResponseBodyContract(input) {
    const hasNoContentStatus = input.route.successStatuses.some((status) => input.noContentSuccessStatuses.includes(status));
    const hasBodyStatus = input.route.successStatuses.some((status) => !input.noContentSuccessStatuses.includes(status));
    if (hasNoContentStatus && hasBodyStatus) {
        input.diagnostics.push({
            code: 'API_CATALOG_ROUTE_SUCCESS_BODY_MODE_AMBIGUOUS',
            file: 'contracts/apis/catalog.yaml',
            path: `${input.routePath}.success_statuses`,
            message: `API route \`${input.route.operationId}\` must not mix bodyless and body-bearing success statuses while using one response_schema_ref.`
        });
    }
    if (hasNoContentStatus && input.route.responseSchemaRef !== null) {
        input.diagnostics.push({
            code: 'API_CATALOG_ROUTE_NO_CONTENT_SCHEMA_FORBIDDEN',
            file: 'contracts/apis/catalog.yaml',
            path: `${input.routePath}.response_schema_ref`,
            message: `API route \`${input.route.operationId}\` uses a bodyless success status and must set response_schema_ref to null.`
        });
    }
    if (!hasNoContentStatus && input.route.responseSchemaRef === null) {
        input.diagnostics.push({
            code: 'API_CATALOG_ROUTE_RESPONSE_SCHEMA_REQUIRED',
            file: 'contracts/apis/catalog.yaml',
            path: `${input.routePath}.response_schema_ref`,
            message: `API route \`${input.route.operationId}\` uses a body-bearing success status and must declare response_schema_ref.`
        });
    }
}
function validateRouteSchemaRef(input) {
    const parsed = parseSchemaRef(input.ref);
    if (!parsed) {
        input.diagnostics.push({
            code: 'API_CATALOG_ROUTE_SCHEMA_REF_INVALID',
            file: 'contracts/apis/catalog.yaml',
            path: `${input.routePath}.${input.field}`,
            message: `API route \`${input.route.operationId}\` ${input.field} must point to contracts/apis/<service>/<schema>.yaml#PascalCaseSchema.`
        });
        return null;
    }
    const bundle = input.schemaBundlesByFile.get(parsed.file);
    if (!bundle) {
        input.diagnostics.push({
            code: 'API_CATALOG_ROUTE_SCHEMA_BUNDLE_MISSING',
            file: 'contracts/apis/catalog.yaml',
            path: `${input.routePath}.${input.field}`,
            message: `API route \`${input.route.operationId}\` references schema bundle \`${parsed.file}\`, but that bundle was not loaded.`
        });
        return null;
    }
    const schema = bundle.schemas.find((candidate) => candidate.id === parsed.schemaId);
    if (!schema) {
        input.diagnostics.push({
            code: 'API_CATALOG_ROUTE_SCHEMA_ID_MISSING',
            file: 'contracts/apis/catalog.yaml',
            path: `${input.routePath}.${input.field}`,
            message: `API route \`${input.route.operationId}\` references missing schema \`${parsed.schemaId}\` in \`${parsed.file}\`.`
        });
        return null;
    }
    if (bundle.serviceId !== input.route.serviceId) {
        input.diagnostics.push({
            code: 'API_CATALOG_ROUTE_SCHEMA_SERVICE_MISMATCH',
            file: 'contracts/apis/catalog.yaml',
            path: `${input.routePath}.${input.field}`,
            message: `API route \`${input.route.operationId}\` service_id must match schema bundle service_id \`${bundle.serviceId}\`.`
        });
    }
    if (bundle.ownerBoundary !== input.route.ownerBoundary) {
        input.diagnostics.push({
            code: 'API_CATALOG_ROUTE_SCHEMA_OWNER_BOUNDARY_MISMATCH',
            file: 'contracts/apis/catalog.yaml',
            path: `${input.routePath}.${input.field}`,
            message: `API route \`${input.route.operationId}\` owner_boundary must match schema bundle owner_boundary \`${bundle.ownerBoundary}\`.`
        });
    }
    if (schema.kind !== input.expectedKind) {
        input.diagnostics.push({
            code: 'API_CATALOG_ROUTE_SCHEMA_KIND_MISMATCH',
            file: 'contracts/apis/catalog.yaml',
            path: `${input.routePath}.${input.field}`,
            message: `API route \`${input.route.operationId}\` ${input.field} must reference a ${input.expectedKind} schema.`
        });
    }
    if (input.expectedKind === 'response' &&
        schema.sessionEffect !== input.route.sessionEffect) {
        input.diagnostics.push({
            code: 'API_CATALOG_ROUTE_SCHEMA_SESSION_EFFECT_MISMATCH',
            file: 'contracts/apis/catalog.yaml',
            path: `${input.routePath}.${input.field}`,
            message: `API route \`${input.route.operationId}\` session_effect must match response schema session_effect.`
        });
    }
    return { bundle, schema };
}
function validateRouteRequestIdempotencyMetadata(input) {
    const requiresIdempotency = input.route.idempotency === REQUIRED_MUTATION_IDEMPOTENCY_POLICY;
    const schemaRequiresIdempotency = input.requestSchemaBundle.commonEnvelope.requiredRequestMetadata.includes(SCHEMA_IDEMPOTENCY_METADATA);
    if (requiresIdempotency && !schemaRequiresIdempotency) {
        input.diagnostics.push({
            code: 'API_CATALOG_ROUTE_IDEMPOTENCY_METADATA_MISSING',
            file: 'contracts/apis/catalog.yaml',
            path: `${input.routePath}.request_schema_ref`,
            message: `API route \`${input.route.operationId}\` requires idempotency, so its request schema bundle must require \`${SCHEMA_IDEMPOTENCY_METADATA}\`.`
        });
    }
    if (!requiresIdempotency && schemaRequiresIdempotency) {
        input.diagnostics.push({
            code: 'API_CATALOG_ROUTE_IDEMPOTENCY_METADATA_UNEXPECTED',
            file: 'contracts/apis/catalog.yaml',
            path: `${input.routePath}.request_schema_ref`,
            message: `API route \`${input.route.operationId}\` does not require idempotency, so its request schema bundle must not require \`${SCHEMA_IDEMPOTENCY_METADATA}\`.`
        });
    }
}
function validateSecretMaterialDoesNotEcho(input) {
    if (!input.requestSchema.carriesSecretMaterial) {
        return;
    }
    for (const secretField of input.requestSchema.secretFields) {
        if (input.responseSchema.requiredFields.includes(secretField) ||
            input.responseSchema.optionalFields.includes(secretField)) {
            input.diagnostics.push({
                code: 'API_CATALOG_ROUTE_SECRET_FIELD_ECHOED',
                file: 'contracts/apis/catalog.yaml',
                path: `${input.routePath}.response_schema_ref`,
                message: `API route \`${input.route.operationId}\` response schema must not echo secret request field \`${secretField}\`.`
            });
        }
    }
}
function validateSchemaBundles(contracts, schemaBundlesByFile, diagnostics) {
    for (const schemaBundle of contracts.schemaBundles) {
        validateSchemaBundle(schemaBundle, diagnostics);
    }
    const referencedFiles = new Set(contracts.apiCatalog.routes.flatMap((route) => [
        parseSchemaRef(route.requestSchemaRef)?.file,
        route.responseSchemaRef === null
            ? undefined
            : parseSchemaRef(route.responseSchemaRef)?.file
    ]));
    for (const file of referencedFiles) {
        if (file && !schemaBundlesByFile.has(file)) {
            diagnostics.push({
                code: 'API_SCHEMA_BUNDLE_REFERENCED_FILE_NOT_LOADED',
                file,
                path: 'schema_bundle',
                message: `Referenced schema bundle \`${file}\` must be loaded before validation.`
            });
        }
    }
}
function validateSchemaBundle(schemaBundle, diagnostics) {
    if (!includesValue(ALLOWED_SCHEMA_STATUSES, schemaBundle.status)) {
        diagnostics.push({
            code: 'API_SCHEMA_BUNDLE_STATUS_INVALID',
            file: schemaBundle.file,
            path: 'schema_bundle.status',
            message: `Schema bundle \`${schemaBundle.file}\` must use contract-only status.`
        });
    }
    if (!includesValue(ALLOWED_OWNER_BOUNDARIES, schemaBundle.ownerBoundary)) {
        diagnostics.push({
            code: 'API_SCHEMA_BUNDLE_OWNER_BOUNDARY_INVALID',
            file: schemaBundle.file,
            path: 'schema_bundle.owner_boundary',
            message: `Schema bundle \`${schemaBundle.file}\` uses unsupported owner boundary \`${schemaBundle.ownerBoundary}\`.`
        });
    }
    for (const metadata of REQUIRED_SCHEMA_BASE_REQUEST_METADATA) {
        if (!schemaBundle.commonEnvelope.requiredRequestMetadata.includes(metadata)) {
            diagnostics.push({
                code: 'API_SCHEMA_BUNDLE_REQUEST_METADATA_MISSING',
                file: schemaBundle.file,
                path: 'schema_bundle.common_envelope.required_request_metadata',
                message: `Schema bundle \`${schemaBundle.file}\` must require request metadata \`${metadata}\`.`
            });
        }
    }
    for (const metadata of REQUIRED_SCHEMA_RESPONSE_METADATA) {
        if (!schemaBundle.commonEnvelope.requiredResponseMetadata.includes(metadata)) {
            diagnostics.push({
                code: 'API_SCHEMA_BUNDLE_RESPONSE_METADATA_MISSING',
                file: schemaBundle.file,
                path: 'schema_bundle.common_envelope.required_response_metadata',
                message: `Schema bundle \`${schemaBundle.file}\` must require response metadata \`${metadata}\`.`
            });
        }
    }
    for (const value of CANONICAL_FORBIDDEN_VALUES) {
        if (!schemaBundle.commonEnvelope.forbiddenPayloadValues.includes(value)) {
            diagnostics.push({
                code: 'API_SCHEMA_BUNDLE_FORBIDDEN_VALUE_MISSING',
                file: schemaBundle.file,
                path: 'schema_bundle.common_envelope.forbidden_payload_values',
                message: `Schema bundle \`${schemaBundle.file}\` must forbid \`${value}\`.`
            });
        }
    }
    if (schemaBundle.schemas.length === 0) {
        diagnostics.push({
            code: 'API_SCHEMA_BUNDLE_EMPTY',
            file: schemaBundle.file,
            path: 'schema_bundle.schemas',
            message: `Schema bundle \`${schemaBundle.file}\` must define at least one schema.`
        });
        return;
    }
    validateUniqueSchemaIds(schemaBundle, diagnostics);
    schemaBundle.schemas.forEach((schema, index) => {
        validateSchemaDefinition(schemaBundle, schema, index, diagnostics);
    });
}
function validateSchemaDefinition(schemaBundle, schema, index, diagnostics) {
    const path = `schema_bundle.schemas[${index}]`;
    if (!SCHEMA_ID_PATTERN.test(schema.id)) {
        diagnostics.push({
            code: 'API_SCHEMA_ID_INVALID',
            file: schemaBundle.file,
            path: `${path}.id`,
            message: `Schema id \`${schema.id}\` must be PascalCase.`
        });
    }
    if (!includesValue(ALLOWED_SCHEMA_KINDS, schema.kind)) {
        diagnostics.push({
            code: 'API_SCHEMA_KIND_INVALID',
            file: schemaBundle.file,
            path: `${path}.kind`,
            message: `Schema \`${schema.id}\` uses unsupported kind \`${schema.kind}\`.`
        });
    }
    if (schema.kind === 'request' && schema.sessionEffect !== null) {
        diagnostics.push({
            code: 'API_SCHEMA_REQUEST_SESSION_EFFECT_DECLARED',
            file: schemaBundle.file,
            path: `${path}.session_effect`,
            message: `Request schema \`${schema.id}\` must not declare session_effect.`
        });
    }
    if (schema.kind === 'response' && schema.sessionEffect === null) {
        diagnostics.push({
            code: 'API_SCHEMA_RESPONSE_SESSION_EFFECT_MISSING',
            file: schemaBundle.file,
            path: `${path}.session_effect`,
            message: `Response schema \`${schema.id}\` must declare session_effect.`
        });
    }
    if (schema.sessionEffect !== null &&
        !includesValue(ALLOWED_SESSION_EFFECTS, schema.sessionEffect)) {
        diagnostics.push({
            code: 'API_SCHEMA_SESSION_EFFECT_INVALID',
            file: schemaBundle.file,
            path: `${path}.session_effect`,
            message: `Schema \`${schema.id}\` uses unsupported session_effect \`${schema.sessionEffect}\`.`
        });
    }
    for (const field of schema.requiredFields) {
        if (!SCHEMA_FIELD_PATTERN.test(field)) {
            diagnostics.push({
                code: 'API_SCHEMA_REQUIRED_FIELD_INVALID',
                file: schemaBundle.file,
                path: `${path}.required_fields`,
                message: `Schema \`${schema.id}\` required field \`${field}\` must be snake_case.`
            });
        }
    }
    for (const field of schema.optionalFields) {
        if (!SCHEMA_FIELD_PATTERN.test(field)) {
            diagnostics.push({
                code: 'API_SCHEMA_OPTIONAL_FIELD_INVALID',
                file: schemaBundle.file,
                path: `${path}.optional_fields`,
                message: `Schema \`${schema.id}\` optional field \`${field}\` must be snake_case.`
            });
        }
        if (schema.requiredFields.includes(field)) {
            diagnostics.push({
                code: 'API_SCHEMA_FIELD_DECLARATION_OVERLAP',
                file: schemaBundle.file,
                path: `${path}.optional_fields`,
                message: `Schema \`${schema.id}\` field \`${field}\` must not be both required and optional.`
            });
        }
    }
    if (schema.carriesSecretMaterial) {
        if (schema.kind !== 'request') {
            diagnostics.push({
                code: 'API_SCHEMA_SECRET_MATERIAL_ON_NON_REQUEST',
                file: schemaBundle.file,
                path: `${path}.carries_secret_material`,
                message: `Only request schemas may carry secret material.`
            });
        }
        if (schema.secretMaterialPolicy === null ||
            !isSecretMaterialPolicySafe(schema.secretMaterialPolicy)) {
            diagnostics.push({
                code: 'API_SCHEMA_SECRET_MATERIAL_POLICY_INVALID',
                file: schemaBundle.file,
                path: `${path}.secret_material_policy`,
                message: `Secret-carrying schema \`${schema.id}\` must declare a non-echoing secret material policy.`
            });
        }
        if (schema.secretFields.length === 0) {
            diagnostics.push({
                code: 'API_SCHEMA_SECRET_FIELDS_MISSING',
                file: schemaBundle.file,
                path: `${path}.secret_fields`,
                message: `Secret-carrying schema \`${schema.id}\` must declare secret_fields.`
            });
        }
        for (const secretField of schema.secretFields) {
            if (!schema.requiredFields.includes(secretField)) {
                diagnostics.push({
                    code: 'API_SCHEMA_SECRET_FIELD_NOT_REQUIRED',
                    file: schemaBundle.file,
                    path: `${path}.secret_fields`,
                    message: `Secret field \`${secretField}\` must also be listed in required_fields for schema \`${schema.id}\`.`
                });
            }
        }
    }
    else if (schema.secretFields.length > 0) {
        diagnostics.push({
            code: 'API_SCHEMA_SECRET_FIELDS_ON_NON_SECRET_SCHEMA',
            file: schemaBundle.file,
            path: `${path}.secret_fields`,
            message: `Schema \`${schema.id}\` must not declare secret_fields unless carries_secret_material is true.`
        });
    }
}
function buildSchemaBundleMap(schemaBundles, diagnostics) {
    const schemaBundlesByFile = new Map();
    schemaBundles.forEach((schemaBundle) => {
        if (schemaBundlesByFile.has(schemaBundle.file)) {
            diagnostics.push({
                code: 'API_SCHEMA_BUNDLE_FILE_DUPLICATE',
                file: schemaBundle.file,
                path: 'schema_bundle',
                message: `Schema bundle file \`${schemaBundle.file}\` must be loaded only once.`
            });
            return;
        }
        schemaBundlesByFile.set(schemaBundle.file, schemaBundle);
    });
    return schemaBundlesByFile;
}
function validateUniqueRouteKeys(routes, diagnostics) {
    const seenOperationIds = new Map();
    const seenMethodPaths = new Map();
    routes.forEach((route, index) => {
        const operationIndex = seenOperationIds.get(route.operationId);
        if (operationIndex !== undefined) {
            diagnostics.push({
                code: 'API_CATALOG_ROUTE_OPERATION_ID_DUPLICATE',
                file: 'contracts/apis/catalog.yaml',
                path: `routes[${index}].operation_id`,
                message: `API route operation_id \`${route.operationId}\` duplicates routes[${operationIndex}].`
            });
        }
        else {
            seenOperationIds.set(route.operationId, index);
        }
        const methodPath = `${route.method} ${route.path}`;
        const methodPathIndex = seenMethodPaths.get(methodPath);
        if (methodPathIndex !== undefined) {
            diagnostics.push({
                code: 'API_CATALOG_ROUTE_METHOD_PATH_DUPLICATE',
                file: 'contracts/apis/catalog.yaml',
                path: `routes[${index}].path`,
                message: `API route method/path \`${methodPath}\` duplicates routes[${methodPathIndex}].`
            });
        }
        else {
            seenMethodPaths.set(methodPath, index);
        }
    });
}
function validateUniqueSchemaIds(schemaBundle, diagnostics) {
    const seenSchemaIds = new Map();
    schemaBundle.schemas.forEach((schema, index) => {
        const previousIndex = seenSchemaIds.get(schema.id);
        if (previousIndex !== undefined) {
            diagnostics.push({
                code: 'API_SCHEMA_ID_DUPLICATE',
                file: schemaBundle.file,
                path: `schema_bundle.schemas[${index}].id`,
                message: `Schema id \`${schema.id}\` duplicates schema_bundle.schemas[${previousIndex}].`
            });
        }
        else {
            seenSchemaIds.set(schema.id, index);
        }
    });
}
function parseSchemaRef(ref) {
    if (!SCHEMA_REF_PATTERN.test(ref)) {
        return null;
    }
    const [file, schemaId] = ref.split('#');
    if (!file || !schemaId) {
        return null;
    }
    return { file, schemaId };
}
function isSecretMaterialPolicySafe(policy) {
    return includesValue(ALLOWED_SECRET_MATERIAL_POLICIES, policy);
}
function includesValue(values, value) {
    return values.includes(value);
}
//# sourceMappingURL=validator.js.map