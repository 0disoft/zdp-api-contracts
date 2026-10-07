import type { ApiContractDiagnostic, ApiContracts, ApiSchemaBundleContract, ApiSchemaDefinition } from '../types.js';
export declare const ALLOWED_SECRET_MATERIAL_POLICIES: readonly ["verifier_input_only_never_echo", "password_verifier_input_only_never_echo", "session_rotation_proof_only_never_echo", "browser_assertion_only_never_echo", "provider_callback_code_only_never_store_plaintext", "proof_verifier_input_only_never_echo_or_persist_plaintext", "one_time_receipt_input_only_never_echo_or_persist_plaintext", "challenge_solution_input_only_never_echo_or_persist_plaintext", "verification_receipt_output_only_never_log_or_persist_plaintext", "verification_receipt_input_only_never_echo_or_persist_plaintext"];
export declare const REQUIRED_SCHEMA_BASE_REQUEST_METADATA: readonly ["request_id", "trace_id"];
export declare const REQUIRED_SCHEMA_RESPONSE_METADATA: readonly ["request_id", "trace_id"];
export declare const ALLOWED_SCHEMA_STATUSES: readonly ["contract-only"];
export declare const ALLOWED_SCHEMA_KINDS: readonly ["request", "response"];
export declare const SCHEMA_ID_PATTERN: RegExp;
export declare const SCHEMA_FIELD_PATTERN: RegExp;
export declare function validateSchemaBundles(contracts: ApiContracts, schemaBundlesByFile: ReadonlyMap<string, ApiSchemaBundleContract>, diagnostics: ApiContractDiagnostic[]): void;
export declare function validateSchemaBundle(schemaBundle: ApiSchemaBundleContract, diagnostics: ApiContractDiagnostic[]): void;
export declare function validateSchemaDefinition(schemaBundle: ApiSchemaBundleContract, schema: ApiSchemaDefinition, index: number, diagnostics: ApiContractDiagnostic[]): void;
export declare function validateUniqueSchemaIds(schemaBundle: ApiSchemaBundleContract, diagnostics: ApiContractDiagnostic[]): void;
export declare function isSecretMaterialPolicySafe(policy: string): boolean;
//# sourceMappingURL=schema-bundles.d.ts.map