import { validateRequiredOidcValues } from './shared.js';
export const OIDC_PRODUCT_SESSION_FILE = 'contracts/apis/core-api/oidc-product-session.yaml';
export const OIDC_AUTHORIZATION_BINDINGS = [
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
export const OIDC_TOKEN_EXCHANGE_BINDINGS = [
    'client_id',
    'authorization_code',
    'code_verifier',
    'exact_redirect_uri',
    'issuer'
];
export const OIDC_CLIENT_REGISTRY_FIELDS = [
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
export const OIDC_ACCESS_DECISION_BINDINGS = [
    'subject_ref',
    'product_ref',
    'tenant_ref',
    'resource_type',
    'resource_ref',
    'action',
    'policy_version'
];
export const OIDC_INVALIDATION_EVENTS = [
    'central_session_revoked',
    'account_restricted',
    'account_deleted',
    'credential_compromised',
    'product_client_disabled'
];
export const OIDC_FORBIDDEN_CONSUMER_USES = [
    'central_session_cookie_forwarded_to_product',
    'cross_product_session_cookie_reuse',
    'login_success_as_global_product_authorization',
    'product_bff_as_credential_or_account_truth',
    'arbitrary_return_to_redirect',
    'wildcard_redirect_uri',
    'unregistered_scope_or_audience',
    'callback_uri_selected_from_request_without_registry_match'
];
export const OIDC_FORBIDDEN_VALUES = [
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
export function validateOidcProductSession(contracts, diagnostics) {
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
//# sourceMappingURL=oidc-product-session.js.map