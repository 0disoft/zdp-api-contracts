import type { ApiContractDiagnostic, ApiContracts, ApiRouteDefinition, ApiSchemaBundleContract, ApiSchemaDefinition } from '../types.js';
export declare const API_CATALOG_REQUIRED_ROUTE_FIELDS: readonly ["operation_id", "service_id", "resource", "action", "method", "path", "success_statuses", "request_schema_ref", "response_schema_ref", "auth_required", "permission_check", "audit_event", "idempotency", "owner_boundary", "tenant_boundary", "request_id_required", "trace_id_required", "session_effect", "credential_policy", "error_codes"];
export declare const API_CATALOG_EMPTY_STATUS = "empty-until-service-routes-exist";
export declare const API_CATALOG_ACTIVE_STATUS = "route-catalog-contract-only";
export declare const ALLOWED_IDEMPOTENCY_POLICIES: readonly ["required_idempotency_key", "optional_idempotency_key", "not_required"];
export declare const MUTATING_METHODS_REQUIRING_IDEMPOTENCY: readonly ["POST", "PUT", "PATCH", "DELETE"];
export declare const REQUIRED_MUTATION_IDEMPOTENCY_POLICY = "required_idempotency_key";
export declare const ALLOWED_CREDENTIAL_POLICIES: readonly ["no_refresh_token_plaintext_no_provider_secret_no_authorization_or_cookie_header_payload"];
export declare const REQUIRED_CREDENTIAL_POLICY_PARTS: readonly ["no_refresh_token_plaintext", "no_provider_secret", "no_authorization_or_cookie_header_payload"];
export declare const PUBLIC_PERMISSION_CHECKS: readonly ["core.identity.public_auth_entrypoint", "core.consent.public_policy_resolution", "platform.abuse.public_challenge_entrypoint", "platform.support.public_case_create", "platform.support.public_reply_address_verify"];
export declare const ALLOWED_TENANT_BOUNDARIES: readonly ["none", "organization", "workspace", "pending_identity_or_organization", "personal_account", "common_zdp_wallet", "core_resolved_scope"];
export declare const SCHEMA_IDEMPOTENCY_METADATA = "idempotency_key";
export declare const SESSION_EFFECT_REQUIRED_ERROR_CODES: Record<string, readonly string[]>;
export declare const OPERATION_ID_PATTERN: RegExp;
export interface ResolvedSchemaRef {
    readonly bundle: ApiSchemaBundleContract;
    readonly schema: ApiSchemaDefinition;
}
export declare function validateApiCatalogContract(contracts: ApiContracts, schemaBundlesByFile: ReadonlyMap<string, ApiSchemaBundleContract>, diagnostics: ApiContractDiagnostic[]): void;
export declare function validateRouteDefinition(route: ApiRouteDefinition, index: number, contracts: ApiContracts, schemaBundlesByFile: ReadonlyMap<string, ApiSchemaBundleContract>, diagnostics: ApiContractDiagnostic[]): void;
export declare function isSingleUsePasskeyLoginRoute(route: ApiRouteDefinition): boolean;
export declare function validateRouteResponseBodyContract(input: {
    readonly route: ApiRouteDefinition;
    readonly routePath: string;
    readonly noContentSuccessStatuses: readonly number[];
    readonly diagnostics: ApiContractDiagnostic[];
}): void;
export declare function validateRouteSchemaRef(input: {
    readonly route: ApiRouteDefinition;
    readonly routePath: string;
    readonly ref: string;
    readonly field: 'request_schema_ref' | 'response_schema_ref';
    readonly expectedKind: 'request' | 'response';
    readonly schemaBundlesByFile: ReadonlyMap<string, ApiSchemaBundleContract>;
    readonly diagnostics: ApiContractDiagnostic[];
}): ResolvedSchemaRef | null;
export declare function validateRouteRequestIdempotencyMetadata(input: {
    readonly route: ApiRouteDefinition;
    readonly routePath: string;
    readonly requestSchemaBundle: ApiSchemaBundleContract;
    readonly diagnostics: ApiContractDiagnostic[];
}): void;
export declare function validateSecretMaterialDoesNotEcho(input: {
    readonly route: ApiRouteDefinition;
    readonly routePath: string;
    readonly requestSchema: ApiSchemaDefinition;
    readonly responseSchema: ApiSchemaDefinition;
    readonly diagnostics: ApiContractDiagnostic[];
}): void;
export declare function validateUniqueRouteKeys(routes: readonly ApiRouteDefinition[], diagnostics: ApiContractDiagnostic[]): void;
//# sourceMappingURL=api-catalog.d.ts.map