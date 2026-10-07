import type { ApiContractDiagnostic, ApiContracts } from '../types.js';
export declare const REQUIRED_ROUTE_FIELDS: readonly ["resource", "action", "method", "path", "success_statuses", "auth_required", "permission_check", "audit_event", "idempotency", "owner_boundary", "tenant_boundary", "request_id_required", "trace_id_required", "session_effect", "credential_policy", "error_codes"];
export declare const ALLOWED_ROUTE_METHODS: readonly ["GET", "POST", "PUT", "PATCH", "DELETE"];
export declare const ALLOWED_SUCCESS_STATUSES: readonly [200, 201, 202, 204];
export declare const NO_CONTENT_SUCCESS_STATUSES: readonly [204];
export declare const FORBIDDEN_ROUTE_SHAPES: readonly ["raw_customer_payload", "raw_provider_error", "provider_secret", "authorization_header", "cookie_header", "refresh_token_plaintext", "stack_trace", "screen_component_payload", "provider_specific_id_as_primary_id", "raw_storage_url"];
export declare function validateRouteContract(contracts: ApiContracts, diagnostics: ApiContractDiagnostic[]): void;
//# sourceMappingURL=route.d.ts.map