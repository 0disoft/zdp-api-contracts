import type { ApiContractDiagnostic, ApiContracts } from '../types.js';
export declare const REQUIRED_ERROR_FIELDS: readonly ["code", "message", "request_id", "trace_id"];
export declare const FORBIDDEN_ERROR_FIELDS: readonly ["raw_customer_payload", "raw_provider_error", "provider_secret", "authorization_header", "cookie_header", "refresh_token_plaintext", "stack_trace", "screen_component_payload"];
export declare function validateErrorEnvelopeContract(contracts: ApiContracts, diagnostics: ApiContractDiagnostic[]): void;
//# sourceMappingURL=error-envelope.d.ts.map