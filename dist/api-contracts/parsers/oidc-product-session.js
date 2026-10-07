import { assertOnlyKeys, parseYamlObject, requiredBoolean, requiredNumber, requiredObject, requiredString, requiredStringList } from './shared.js';
export function parseOidcProductSessionContract(source) {
    const file = 'contracts/apis/core-api/oidc-product-session.yaml';
    const data = parseYamlObject(source, file);
    assertOnlyKeys(data, ['oidc_product_session'], file);
    const context = `${file}#oidc_product_session`;
    const contract = requiredObject(data, 'oidc_product_session', file);
    assertOnlyKeys(contract, [
        'schema_version',
        'status',
        'owner_boundary',
        'protocol_profile',
        'oauth_security_baseline',
        'oauth_2_1_status',
        'response_type',
        'pkce_method',
        'staging_issuer',
        'production_issuer',
        'required_authorization_bindings',
        'required_token_exchange_bindings',
        'required_client_registry_fields',
        'required_access_decision_bindings',
        'invalidation_events',
        'exact_redirect_uri_match_required',
        'wildcard_redirect_uri_forbidden',
        'arbitrary_return_to_forbidden',
        'authorization_code_single_use',
        'authorization_code_ttl_policy',
        'token_endpoint_caller',
        'browser_token_exposure_policy',
        'product_cookie_policy',
        'product_session_owner',
        'central_session_owner',
        'authorization_owner',
        'authentication_is_authorization',
        'client_registry_policy',
        'forbidden_consumer_uses',
        'forbidden_values'
    ], context);
    return {
        schemaVersion: requiredNumber(contract, 'schema_version', context),
        status: requiredString(contract, 'status', context),
        ownerBoundary: requiredString(contract, 'owner_boundary', context),
        protocolProfile: requiredString(contract, 'protocol_profile', context),
        oauthSecurityBaseline: requiredString(contract, 'oauth_security_baseline', context),
        oauth21Status: requiredString(contract, 'oauth_2_1_status', context),
        responseType: requiredString(contract, 'response_type', context),
        pkceMethod: requiredString(contract, 'pkce_method', context),
        stagingIssuer: requiredString(contract, 'staging_issuer', context),
        productionIssuer: requiredString(contract, 'production_issuer', context),
        requiredAuthorizationBindings: requiredStringList(contract, 'required_authorization_bindings', context),
        requiredTokenExchangeBindings: requiredStringList(contract, 'required_token_exchange_bindings', context),
        requiredClientRegistryFields: requiredStringList(contract, 'required_client_registry_fields', context),
        requiredAccessDecisionBindings: requiredStringList(contract, 'required_access_decision_bindings', context),
        invalidationEvents: requiredStringList(contract, 'invalidation_events', context),
        exactRedirectUriMatchRequired: requiredBoolean(contract, 'exact_redirect_uri_match_required', context),
        wildcardRedirectUriForbidden: requiredBoolean(contract, 'wildcard_redirect_uri_forbidden', context),
        arbitraryReturnToForbidden: requiredBoolean(contract, 'arbitrary_return_to_forbidden', context),
        authorizationCodeSingleUse: requiredBoolean(contract, 'authorization_code_single_use', context),
        authorizationCodeTtlPolicy: requiredString(contract, 'authorization_code_ttl_policy', context),
        tokenEndpointCaller: requiredString(contract, 'token_endpoint_caller', context),
        browserTokenExposurePolicy: requiredString(contract, 'browser_token_exposure_policy', context),
        productCookiePolicy: requiredString(contract, 'product_cookie_policy', context),
        productSessionOwner: requiredString(contract, 'product_session_owner', context),
        centralSessionOwner: requiredString(contract, 'central_session_owner', context),
        authorizationOwner: requiredString(contract, 'authorization_owner', context),
        authenticationIsAuthorization: requiredBoolean(contract, 'authentication_is_authorization', context),
        clientRegistryPolicy: requiredString(contract, 'client_registry_policy', context),
        forbiddenConsumerUses: requiredStringList(contract, 'forbidden_consumer_uses', context),
        forbiddenValues: requiredStringList(contract, 'forbidden_values', context)
    };
}
//# sourceMappingURL=oidc-product-session.js.map