import type { ApiContractDiagnostic, ApiContracts, ApiSchemaBundleContract } from '../types.js';
export declare const ACCESS_DECISION_FILE = "contracts/apis/core-api/access-decision.yaml";
export declare const ACCESS_DECISION_OPERATION_ID = "core.access.authorization_decisions.create";
export declare const ACCESS_DECISION_ROUTE_PATH = "/v1/access/authorization-decisions";
export declare const ACCESS_DECISION_VALUES: readonly ['allow', 'deny'];
export declare const ACCESS_DECISION_REQUEST_BINDINGS: readonly ['product_ref', 'action', 'resource_type', 'resource_ref', 'requested_scope_type', 'requested_scope_ref'];
export declare const ACCESS_DECISION_RESPONSE_BINDINGS: readonly ['decision_ref', 'decision', 'reason_code', 'policy_version', 'data_revision', 'subject_ref', 'session_ref', 'tenant_ref', 'product_ref', 'action', 'resource_type', 'resource_ref', 'scope_type', 'scope_ref', 'decided_at', 'decision_expires_at', 'session_expires_at', 'obligations'];
export declare const ACCESS_DECISION_TRUSTED_AUTHORITY_SOURCES: readonly ['subject_and_session_from_verified_current_session', 'scope_from_current_core_relationships', 'policy_and_data_revision_from_core_access', 'product_and_action_from_closed_core_catalog', 'consent_is_input_fact_not_final_authorization'];
export declare const ACCESS_DECISION_FORBIDDEN_REQUEST_AUTHORITY_FIELDS: readonly ['subject_ref', 'session_ref', 'tenant_ref', 'role', 'permission', 'decision', 'decision_ref', 'policy_version', 'data_revision', 'obligations', 'consent_receipt_ref'];
export declare const ACCESS_DECISION_FORBIDDEN_CONSUMER_USES: readonly ['decision_ref_as_bearer_credential', 'client_or_sdk_final_authorization', 'reuse_for_different_product_action_resource_or_scope', 'consent_receipt_as_authorization_decision', 'current_session_identity_as_product_authorization'];
export declare const ACCESS_DECISION_FORBIDDEN_VALUES: readonly ['password', 'authorization_header', 'cookie_header', 'access_token', 'refresh_token_plaintext', 'provider_secret', 'raw_provider_error', 'raw_customer_payload', 'raw_policy_document', 'raw_relationship_payload'];
export declare const CURRENT_SESSION_FORBIDDEN_ACCESS_FIELDS: readonly ['decision', 'decision_ref', 'platform_access_granted', 'access_evidence_ref', 'policy_version', 'obligations'];
export declare function validateAccessDecision(contracts: ApiContracts, schemaBundlesByFile: ReadonlyMap<string, ApiSchemaBundleContract>, diagnostics: ApiContractDiagnostic[]): void;
//# sourceMappingURL=access-decision.d.ts.map