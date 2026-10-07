import type { ApiContractDiagnostic, ApiContracts } from '../types.js';
export declare const REQUIRED_SDK_SOURCE_CONTRACTS: readonly ['contracts/route-contract.yaml', 'contracts/error-envelope.yaml', 'contracts/webhook-contract.yaml', 'contracts/sdk-generation-input.yaml', 'contracts/apis/catalog.yaml'];
export declare const REQUIRED_SDK_GENERATION_TARGETS: readonly ['typescript', 'dart', 'rust'];
export declare const REQUIRED_SDK_ROUTE_METADATA: readonly ['operation_id', 'resource', 'action', 'method', 'path', 'request_schema_ref', 'response_schema_ref', 'auth_required', 'permission_check', 'audit_event', 'idempotency', 'success_statuses', 'owner_boundary', 'tenant_boundary', 'request_id_required', 'trace_id_required', 'session_effect', 'credential_policy', 'error_codes'];
export declare const REQUIRED_SDK_ERROR_METADATA: readonly ['code', 'message', 'request_id', 'trace_id', 'retry_after_seconds', 'documentation_url'];
export declare const REQUIRED_SDK_CLIENT_RUNTIME_METADATA: readonly ['typed_fetch_operation_map', 'standard_error_envelope_normalization', 'request_id_propagation', 'trace_id_propagation', 'timeout_ms_option', 'abort_signal_option', 'idempotency_key_required_for_mutations', 'no_content_response_body_handling'];
export declare const REQUIRED_SDK_WEBHOOK_METADATA: readonly ['event_id', 'event_type', 'schema_version', 'signature_verification', 'idempotency_key', 'replay_policy', 'dead_letter_policy'];
export declare const FORBIDDEN_SDK_OWNERSHIP: readonly ['generated_sdk_source', 'sdk_runtime_implementation', 'product_business_logic', 'refresh_token_storage', 'final_authorization_decision', 'provider_credential_storage'];
export declare const FORBIDDEN_SDK_VALUES: readonly ["raw_customer_payload", "raw_provider_error", "provider_secret", "authorization_header", "cookie_header", "refresh_token_plaintext", "stack_trace", "screen_component_payload"];
export declare const SDK_TARGET_PATTERN: RegExp;
export declare function validateSdkGenerationInputContract(contracts: ApiContracts, diagnostics: ApiContractDiagnostic[]): void;
//# sourceMappingURL=sdk-generation-input.d.ts.map