import type { ApiContractDiagnostic, ApiContracts, ApiSchemaBundleContract } from '../types.js';
export declare const CUSTOMER_POLICY_REGISTRY_FILE = "contracts/apis/core-api/customer-policy-registry.yaml";
export declare const CUSTOMER_POLICY_OPERATION_IDS: readonly ['core.consent.policy_sets.resolve', 'core.consent.policy_documents.get', 'core.consent.policy_receipts.create', 'core.consent.policy_receipts.get'];
export declare const CUSTOMER_POLICY_DOCUMENT_KINDS: readonly ['common', 'product_addendum', 'jurisdiction_addendum', 'channel_addendum'];
export declare const CUSTOMER_POLICY_PUBLICATION_STATES: readonly ['draft', 'reviewed', 'published', 'superseded', 'retired'];
export declare const CUSTOMER_POLICY_RESOLUTION_STATUSES: readonly ['resolved', 'unavailable', 'review_required'];
export declare const CUSTOMER_POLICY_CHANGE_ACTION_CLASSES: readonly ['no_user_action', 'notice', 'acknowledgement', 'explicit_consent', 'feature_restriction'];
export declare const CUSTOMER_POLICY_RESOLUTION_BINDINGS: readonly ['product_ref', 'environment', 'capability', 'locale'];
export declare const CUSTOMER_POLICY_SERVER_AUTHORITY_FIELDS: readonly ['policy_set_id', 'policy_set_revision', 'ordered_document_revision_ids', 'ordered_content_digests', 'presentation_rule_version'];
export declare const CUSTOMER_POLICY_REQUEST_AUTHORITY_FIELDS: readonly ['policy_set_id', 'policy_set_revision', 'document_revision_ids', 'content_digests', 'ordered_document_revision_ids', 'ordered_content_digests', 'canonical_path', 'publication_status', 'reviewer_ref'];
export declare const CUSTOMER_POLICY_FORBIDDEN_CONSUMER_USES: readonly ['policy_receipt_as_authorization_decision', 'policy_link_display_as_consent', 'latest_alias_in_receipt', 'client_selected_policy_documents', 'missing_required_policy_allows_signup_or_purchase'];
export declare function validateCustomerPolicyRegistry(contracts: ApiContracts, schemaBundlesByFile: ReadonlyMap<string, ApiSchemaBundleContract>, diagnostics: ApiContractDiagnostic[]): void;
//# sourceMappingURL=customer-policy-registry.d.ts.map