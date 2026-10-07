import type { ApiContractDiagnostic, ApiContracts } from '../types.js';
export declare const OIDC_CLIENT_REGISTRY_FILE = "contracts/apis/core-api/oidc-client-registry.yaml";
export declare const OIDC_CLIENT_ACTIVATION_REQUIREMENTS: readonly ['product_bff_deployed_in_staging', 'staging_hostname_bound_and_tls_verified', 'private_key_jwt_key_registered_without_plaintext_secret', 'exact_callback_and_logout_smoke_passed', 'central_session_revocation_smoke_passed', 'core_access_denial_smoke_passed'];
export declare const OIDC_CLIENT_REGISTRY_LIFECYCLE_STATES: readonly ['disabled', 'active', 'suspended', 'retired'];
export declare const OIDC_CLIENT_REGISTRY_TRANSITIONS: readonly ['disabled:active:activation_requirements_and_review_receipt', 'active:suspended:security_or_operational_reason_and_revocation_receipt', 'suspended:active:remediation_evidence_and_reactivation_review_receipt', 'disabled:retired:retirement_reason_and_audit_receipt', 'suspended:retired:retirement_reason_and_audit_receipt'];
export declare const OIDC_CLIENT_REGISTRY_IMMUTABLE_FIELDS: readonly ['client_id', 'product_ref', 'environment', 'client_type'];
export declare const OIDC_CLIENT_REGISTRY_SECURITY_SENSITIVE_FIELDS: readonly ['exact_redirect_uris', 'exact_post_logout_redirect_uris', 'allowed_scope_refs', 'allowed_audience_refs', 'token_endpoint_auth_method', 'jwks_ref', 'session_policy_ref', 'revocation_policy_ref', 'runtime_boundary', 'callback_handler_ref'];
export declare const OIDC_CLIENT_REGISTRY_AUDIT_EVENTS: readonly ['oidc_client.registered', 'oidc_client.activation_reviewed', 'oidc_client.activated', 'oidc_client.security_configuration_changed', 'oidc_client.suspended', 'oidc_client.reactivated', 'oidc_client.retired', 'oidc_client.keyset_rotated'];
export declare const OIDC_CLIENT_REGISTRY_FORBIDDEN_VALUES: readonly ['client_secret_plaintext', 'private_key_material', 'authorization_code', 'access_token', 'id_token', 'refresh_token_plaintext', 'cookie_header', 'authorization_header', 'raw_customer_payload'];
export declare function validateOidcClientRegistry(contracts: ApiContracts, diagnostics: ApiContractDiagnostic[]): void;
export declare function hasUniqueStringValues(values: readonly string[]): boolean;
export declare function isExactHttpsOidcRedirectUri(uri: string): boolean;
//# sourceMappingURL=oidc-client-registry.d.ts.map