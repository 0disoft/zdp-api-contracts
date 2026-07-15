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
    'date-difference'
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
const REVIEWED_CALCULATOR_IDS = ['percentage-change', 'margin-markup'];
const REVIEWED_PRECISION_POLICY = 'canonical_ascii_decimal_string_max_1000_digits';
const REVIEWED_ROUNDING_POLICY = 'caller_decimal_places_0_to_100_half_away_from_zero';
const CONFORMANCE_DECIMAL_INPUT_POLICY = 'canonical_ascii_decimal_string';
const CONFORMANCE_ROUNDING_MODE = 'half_away_from_zero';
const CONFORMANCE_MAX_INPUT_DIGITS = 1000;
const CONFORMANCE_MAX_DECIMAL_PLACES = 100;
const CALCULATOR_ID_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const CALCULATOR_FIELD_ID_PATTERN = /^[a-z][a-z0-9_]*$/;
const CALCULATOR_RULE_PATTERN = /^[a-z][a-z0-9_]*$/;
const CALCULATOR_VERSION_PATTERN = /^\d+\.\d+\.\d+$/;
const CALCULATOR_ENGINE_VERSION_PATTERN = /^(?:\d+\.x|\d+\.\d+\.\d+)$/;
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
const CANONICAL_FORBIDDEN_VALUES = [
    'raw_customer_payload',
    'raw_provider_error',
    'provider_secret',
    'authorization_header',
    'cookie_header',
    'refresh_token_plaintext',
    'stack_trace',
    'screen_component_payload'
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
    'idempotency_key_required_for_mutations'
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
    'common_zdp_wallet'
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
    validateProductLinkHandoff(contracts, diagnostics);
    validateCalculatorCatalog(contracts, diagnostics);
    validateCalculatorConformance(contracts, diagnostics);
    return {
        ok: diagnostics.length === 0,
        diagnostics
    };
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
                message: `Calculator definition \`${calculatorId}\` is required for the first global batch.`
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
        pushCalculatorDiagnostic(diagnostics, 'API_CALCULATOR_ID_UNREVIEWED', `${path}.id`, `Calculator id \`${definition.id}\` is outside the reviewed first batch.`);
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
    const expectedPrecisionPolicy = isReviewedCalculator
        ? REVIEWED_PRECISION_POLICY
        : 'explicit_before_active';
    const expectedRoundingPolicy = isReviewedCalculator
        ? REVIEWED_ROUNDING_POLICY
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
    for (const errorCode of REQUIRED_CALCULATOR_BASE_ERROR_CODES) {
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
    if (conformance.schemaVersion !== 1) {
        pushCalculatorConformanceDiagnostic(diagnostics, 'API_CALCULATOR_CONFORMANCE_SCHEMA_VERSION_INVALID', 'calculator_conformance.schema_version', 'Calculator conformance schema_version must be 1.');
    }
    if (conformance.contractVersion !== contracts.calculatorCatalog.contractVersion) {
        pushCalculatorConformanceDiagnostic(diagnostics, 'API_CALCULATOR_CONFORMANCE_VERSION_MISMATCH', 'calculator_conformance.contract_version', 'Calculator conformance contract_version must match the calculator catalog.');
    }
    if (conformance.engineVersionRange !== '0.x') {
        pushCalculatorConformanceDiagnostic(diagnostics, 'API_CALCULATOR_CONFORMANCE_ENGINE_VERSION_INVALID', 'calculator_conformance.engine_version_range', 'The first calculator engine compatibility range must be `0.x`.');
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
        const cases = conformance.cases.filter((testCase) => testCase.calculatorId === calculatorId);
        if (!cases.some((testCase) => testCase.expected.status === 'success')) {
            pushCalculatorConformanceDiagnostic(diagnostics, 'API_CALCULATOR_CONFORMANCE_SUCCESS_CASE_MISSING', 'cases', `Reviewed calculator \`${calculatorId}\` needs a success fixture.`);
        }
        if (!cases.some((testCase) => testCase.expected.status === 'error')) {
            pushCalculatorConformanceDiagnostic(diagnostics, 'API_CALCULATOR_CONFORMANCE_ERROR_CASE_MISSING', 'cases', `Reviewed calculator \`${calculatorId}\` needs an error fixture.`);
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
    if (!Number.isInteger(testCase.options.decimalPlaces) ||
        testCase.options.decimalPlaces < 0 ||
        testCase.options.decimalPlaces > CONFORMANCE_MAX_DECIMAL_PLACES) {
        pushCalculatorConformanceDiagnostic(diagnostics, 'API_CALCULATOR_CONFORMANCE_DECIMAL_PLACES_OUT_OF_RANGE', `${path}.options.decimal_places`, `decimal_places must be an integer from 0 to ${CONFORMANCE_MAX_DECIMAL_PLACES}.`);
    }
    validateConformanceKeys(Object.keys(testCase.input), definition.inputs.map((input) => input.id), `${path}.input`, diagnostics);
    if (testCase.expected.status === 'success') {
        validateConformanceKeys(Object.keys(testCase.expected.output), definition.outputs.map((output) => output.id), `${path}.expected.output`, diagnostics);
        for (const [field, output] of Object.entries(testCase.expected.output)) {
            if (!/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(output.value)) {
                pushCalculatorConformanceDiagnostic(diagnostics, 'API_CALCULATOR_CONFORMANCE_OUTPUT_VALUE_INVALID', `${path}.expected.output.${field}.value`, 'Successful fixture output values must be canonical ASCII decimal strings.');
            }
        }
    }
    else if (!definition.errorCodes.includes(testCase.expected.errorCode)) {
        pushCalculatorConformanceDiagnostic(diagnostics, 'API_CALCULATOR_CONFORMANCE_ERROR_CODE_INVALID', `${path}.expected.error_code`, `Error fixture code \`${testCase.expected.errorCode}\` is not declared by \`${definition.id}\`.`);
    }
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
    const responseSchema = validateRouteSchemaRef({
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
        if (input.responseSchema.requiredFields.includes(secretField)) {
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
        parseSchemaRef(route.responseSchemaRef)?.file
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
    return policy.includes('never_echo') || policy.includes('never_store_plaintext');
}
function includesValue(values, value) {
    return values.includes(value);
}
//# sourceMappingURL=validator.js.map