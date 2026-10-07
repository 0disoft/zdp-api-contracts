import type { ApiContractDiagnostic, ApiContracts } from '../types.js';
export declare const PRODUCT_LINK_FILE = "contracts/apis/core-api/product-link.yaml";
export declare const PRODUCT_LINK_STATES: readonly ['pending', 'approved', 'denied', 'expired', 'consumed'];
export declare const PRODUCT_LINK_TERMINAL_STATES: readonly ['denied', 'expired', 'consumed'];
export declare const PRODUCT_LINK_REQUIRED_BINDINGS: readonly ['product_ref', 'client_instance_ref', 'client_correlation_ref', 'proof_challenge', 'requested_scope_refs'];
export declare const PRODUCT_LINK_EXCHANGE_REFS: readonly ['subject_ref', 'workspace_ref', 'consent_receipt_ref', 'link_receipt_ref', 'verified_at'];
export declare const PRODUCT_LINK_FORBIDDEN_VALUES: readonly ['password', 'authorization_header', 'cookie_header', 'access_token', 'refresh_token_plaintext', 'login_identifier', 'contact_method', 'integrated_profile', 'raw_consent_document'];
export declare const PRODUCT_LINK_TRANSITIONS: readonly ['pending:approve:approved', 'pending:deny:denied', 'pending:expire:expired', 'approved:exchange:consumed', 'approved:expire:expired'];
export declare function validateProductLinkHandoff(contracts: ApiContracts, diagnostics: ApiContractDiagnostic[]): void;
export declare function validateExactProductLinkValues(actual: readonly string[], required: readonly string[], code: string, path: string, push: (code: string, path: string, message: string) => void): void;
//# sourceMappingURL=product-link-handoff.d.ts.map