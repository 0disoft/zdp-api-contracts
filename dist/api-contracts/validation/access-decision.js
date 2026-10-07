import { validateAccessDecisionHttpProfile } from '../access-decision-http.js';
import { hasExactStringValues, validateRequiredAccessDecisionValues } from './shared.js';
export const ACCESS_DECISION_FILE = 'contracts/apis/core-api/access-decision.yaml';
export const ACCESS_DECISION_OPERATION_ID = 'core.access.authorization_decisions.create';
export const ACCESS_DECISION_ROUTE_PATH = '/v1/access/authorization-decisions';
export const ACCESS_DECISION_VALUES = ['allow', 'deny'];
export const ACCESS_DECISION_REQUEST_BINDINGS = [
    'product_ref',
    'action',
    'resource_type',
    'resource_ref',
    'requested_scope_type',
    'requested_scope_ref'
];
export const ACCESS_DECISION_RESPONSE_BINDINGS = [
    'decision_ref',
    'decision',
    'reason_code',
    'policy_version',
    'data_revision',
    'subject_ref',
    'session_ref',
    'tenant_ref',
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
export const ACCESS_DECISION_TRUSTED_AUTHORITY_SOURCES = [
    'subject_and_session_from_verified_current_session',
    'scope_from_current_core_relationships',
    'policy_and_data_revision_from_core_access',
    'product_and_action_from_closed_core_catalog',
    'consent_is_input_fact_not_final_authorization'
];
export const ACCESS_DECISION_FORBIDDEN_REQUEST_AUTHORITY_FIELDS = [
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
export const ACCESS_DECISION_FORBIDDEN_CONSUMER_USES = [
    'decision_ref_as_bearer_credential',
    'client_or_sdk_final_authorization',
    'reuse_for_different_product_action_resource_or_scope',
    'consent_receipt_as_authorization_decision',
    'current_session_identity_as_product_authorization'
];
export const ACCESS_DECISION_FORBIDDEN_VALUES = [
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
export const CURRENT_SESSION_FORBIDDEN_ACCESS_FIELDS = [
    'decision',
    'decision_ref',
    'platform_access_granted',
    'access_evidence_ref',
    'policy_version',
    'obligations'
];
export function validateAccessDecision(contracts, schemaBundlesByFile, diagnostics) {
    const contract = contracts.accessDecision;
    diagnostics.push(...validateAccessDecisionHttpProfile(contract.httpProfile));
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
//# sourceMappingURL=access-decision.js.map