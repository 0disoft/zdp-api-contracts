import type { ApiContractDiagnostic, ApiContracts } from '../types.js';
export declare const OIDC_PROVIDER_RUNTIME_FILE = "contracts/apis/core-api/oidc-provider-runtime.yaml";
export declare const OIDC_AUTHORIZATION_CODE_BINDINGS: readonly ['client_id', 'exact_redirect_uri', 'subject_ref', 'central_session_ref', 'nonce', 'code_challenge', 'code_challenge_method', 'granted_scope_refs', 'granted_audience_refs', 'issued_at', 'expires_at'];
export declare const OIDC_RUNTIME_DENIAL_REASONS: readonly ['authentication_required', 'session_expired', 'session_revoked', 'client_disabled', 'invalid_request', 'invalid_grant', 'unauthorized_client', 'access_denied', 'policy_unavailable'];
export declare const OIDC_REFRESH_TOKEN_REQUEST_BINDINGS: readonly ['client_id', 'client_assertion_type', 'client_assertion', 'refresh_token', 'grant_type'];
export declare const OIDC_AUTHORIZATION_CODE_RESPONSE_FIELDS: readonly ['access_token', 'token_type', 'expires_in', 'id_token', 'scope'];
export declare const OIDC_REFRESH_TOKEN_OPTIONAL_INITIAL_FIELDS: readonly ['refresh_token', 'refresh_expires_in'];
export declare const OIDC_REFRESH_TOKEN_RESPONSE_FIELDS: readonly ['access_token', 'token_type', 'expires_in', 'id_token', 'scope', 'refresh_token', 'refresh_expires_in'];
export declare const OIDC_REFRESH_TOKEN_DENIAL_REASONS: readonly ['invalid_request', 'invalid_client', 'unauthorized_client', 'invalid_grant'];
export declare const OIDC_REVOCATION_TOKEN_TYPE_HINTS: readonly ['access_token', 'refresh_token'];
export declare const OIDC_INTROSPECTION_TOKEN_TYPE_HINTS: readonly ['access_token'];
export declare const OIDC_PROVIDER_RUNTIME_FORBIDDEN_VALUES: readonly ['password', 'authorization_header', 'cookie_header', 'access_token', 'id_token', 'refresh_token_plaintext', 'client_secret_plaintext', 'private_key_material', 'authorization_code_plaintext_at_rest', 'code_verifier_plaintext_at_rest', 'raw_provider_error', 'raw_customer_payload'];
export declare function validateOidcProviderRuntime(contracts: ApiContracts, diagnostics: ApiContractDiagnostic[]): void;
//# sourceMappingURL=oidc-provider-runtime.d.ts.map