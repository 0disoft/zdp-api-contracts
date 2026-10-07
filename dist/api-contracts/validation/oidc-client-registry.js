import { hasExactStringValues, validateRequiredOidcValues } from './shared.js';
export const OIDC_CLIENT_REGISTRY_FILE = 'contracts/apis/core-api/oidc-client-registry.yaml';
export const OIDC_CLIENT_ACTIVATION_REQUIREMENTS = [
    'product_bff_deployed_in_staging',
    'staging_hostname_bound_and_tls_verified',
    'private_key_jwt_key_registered_without_plaintext_secret',
    'exact_callback_and_logout_smoke_passed',
    'central_session_revocation_smoke_passed',
    'core_access_denial_smoke_passed'
];
export const OIDC_CLIENT_REGISTRY_LIFECYCLE_STATES = [
    'disabled',
    'active',
    'suspended',
    'retired'
];
export const OIDC_CLIENT_REGISTRY_TRANSITIONS = [
    'disabled:active:activation_requirements_and_review_receipt',
    'active:suspended:security_or_operational_reason_and_revocation_receipt',
    'suspended:active:remediation_evidence_and_reactivation_review_receipt',
    'disabled:retired:retirement_reason_and_audit_receipt',
    'suspended:retired:retirement_reason_and_audit_receipt'
];
export const OIDC_CLIENT_REGISTRY_IMMUTABLE_FIELDS = [
    'client_id',
    'product_ref',
    'environment',
    'client_type'
];
export const OIDC_CLIENT_REGISTRY_SECURITY_SENSITIVE_FIELDS = [
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
export const OIDC_CLIENT_REGISTRY_AUDIT_EVENTS = [
    'oidc_client.registered',
    'oidc_client.activation_reviewed',
    'oidc_client.activated',
    'oidc_client.security_configuration_changed',
    'oidc_client.suspended',
    'oidc_client.reactivated',
    'oidc_client.retired',
    'oidc_client.keyset_rotated'
];
export const OIDC_CLIENT_REGISTRY_FORBIDDEN_VALUES = [
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
export function validateOidcClientRegistry(contracts, diagnostics) {
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
        if (client.status === 'active') {
            push('API_OIDC_CLIENT_REGISTRY_ACTIVE_CLIENT_UNSUPPORTED', `${path}.status`, 'This proposed staging registry cannot certify active clients until evidence bindings are represented and reviewed by the contract.');
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
export function hasUniqueStringValues(values) {
    return new Set(values).size === values.length;
}
export function isExactHttpsOidcRedirectUri(uri) {
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
//# sourceMappingURL=oidc-client-registry.js.map