import type { ApiContractDiagnostic, ApiContracts, ApiSchemaBundleContract } from '../types.js';

import { CANONICAL_FORBIDDEN_VALUES } from '../forbidden-values.js';

import { hasExactStringValues } from './shared.js';

export const CUSTOMER_POLICY_REGISTRY_FILE =
  'contracts/apis/core-api/customer-policy-registry.yaml';

export const CUSTOMER_POLICY_OPERATION_IDS = [
  'core.consent.policy_sets.resolve',
  'core.consent.policy_documents.get',
  'core.consent.policy_receipts.create',
  'core.consent.policy_receipts.get'
] as const;

export const CUSTOMER_POLICY_DOCUMENT_KINDS = [
  'common',
  'product_addendum',
  'jurisdiction_addendum',
  'channel_addendum'
] as const;

export const CUSTOMER_POLICY_PUBLICATION_STATES = [
  'draft',
  'reviewed',
  'published',
  'superseded',
  'retired'
] as const;

export const CUSTOMER_POLICY_RESOLUTION_STATUSES = [
  'resolved',
  'unavailable',
  'review_required'
] as const;

export const CUSTOMER_POLICY_CHANGE_ACTION_CLASSES = [
  'no_user_action',
  'notice',
  'acknowledgement',
  'explicit_consent',
  'feature_restriction'
] as const;

export const CUSTOMER_POLICY_RESOLUTION_BINDINGS = [
  'product_ref',
  'environment',
  'capability',
  'locale'
] as const;

export const CUSTOMER_POLICY_SERVER_AUTHORITY_FIELDS = [
  'policy_set_id',
  'policy_set_revision',
  'ordered_document_revision_ids',
  'ordered_content_digests',
  'presentation_rule_version'
] as const;

export const CUSTOMER_POLICY_REQUEST_AUTHORITY_FIELDS = [
  'policy_set_id',
  'policy_set_revision',
  'document_revision_ids',
  'content_digests',
  'ordered_document_revision_ids',
  'ordered_content_digests',
  'canonical_path',
  'publication_status',
  'reviewer_ref'
] as const;

export const CUSTOMER_POLICY_FORBIDDEN_CONSUMER_USES = [
  'policy_receipt_as_authorization_decision',
  'policy_link_display_as_consent',
  'latest_alias_in_receipt',
  'client_selected_policy_documents',
  'missing_required_policy_allows_signup_or_purchase'
] as const;

export function validateCustomerPolicyRegistry(
  contracts: ApiContracts,
  schemaBundlesByFile: ReadonlyMap<string, ApiSchemaBundleContract>,
  diagnostics: ApiContractDiagnostic[]
): void {
  const contract = contracts.customerPolicyRegistry;
  const push = (code: string, path: string, message: string): void => {
    diagnostics.push({
      code,
      file: CUSTOMER_POLICY_REGISTRY_FILE,
      path,
      message
    });
  };
  const requireExact = (
    actual: readonly string[],
    expected: readonly string[],
    code: string,
    path: string
  ): void => {
    if (!hasExactStringValues(actual, expected)) {
      push(code, path, `Customer-policy registry must use the canonical ${path} set.`);
    }
  };

  if (
    contract.schemaVersion !== 1 ||
    contract.status !== 'partial-staging-implementation' ||
    contract.ownerBoundary !== 'consent' ||
    contract.authority !== 'core_consent'
  ) {
    push(
      'API_CUSTOMER_POLICY_BOUNDARY_INVALID',
      'customer_policy_registry',
      'Customer-policy registry must expose only its reviewed partial staging implementation under Core consent authority.'
    );
  }

  requireExact(
    contract.operationIds,
    CUSTOMER_POLICY_OPERATION_IDS,
    'API_CUSTOMER_POLICY_OPERATION_SET_INVALID',
    'customer_policy_registry.operation_ids'
  );
  requireExact(
    contract.stagingImplementedOperationIds,
    ['core.consent.policy_sets.resolve'],
    'API_CUSTOMER_POLICY_STAGING_OPERATION_SET_INVALID',
    'customer_policy_registry.staging_implemented_operation_ids'
  );
  requireExact(
    contract.contractOnlyOperationIds,
    [
      'core.consent.policy_documents.get',
      'core.consent.policy_receipts.create',
      'core.consent.policy_receipts.get'
    ],
    'API_CUSTOMER_POLICY_CONTRACT_ONLY_OPERATION_SET_INVALID',
    'customer_policy_registry.contract_only_operation_ids'
  );
  if (
    contract.resolveRoute !== 'POST /v1/customer-policy-sets/resolve' ||
    contract.resolveTransportPolicy !==
      'trusted_edge_exact_body_proof_and_staging_core_origin_only' ||
    contract.productionRouteReady
  ) {
    push(
      'API_CUSTOMER_POLICY_RESOLVE_RUNTIME_INVALID',
      'customer_policy_registry.resolve_route',
      'Policy resolution must remain a trusted-edge-only staging POST and cannot claim production readiness.'
    );
  }
  requireExact(
    contract.documentKinds,
    CUSTOMER_POLICY_DOCUMENT_KINDS,
    'API_CUSTOMER_POLICY_DOCUMENT_KIND_SET_INVALID',
    'customer_policy_registry.document_kinds'
  );
  requireExact(
    contract.publicationStates,
    CUSTOMER_POLICY_PUBLICATION_STATES,
    'API_CUSTOMER_POLICY_PUBLICATION_STATE_SET_INVALID',
    'customer_policy_registry.publication_states'
  );
  requireExact(
    contract.resolutionStatuses,
    CUSTOMER_POLICY_RESOLUTION_STATUSES,
    'API_CUSTOMER_POLICY_RESOLUTION_STATUS_SET_INVALID',
    'customer_policy_registry.resolution_statuses'
  );
  requireExact(
    contract.changeActionClasses,
    CUSTOMER_POLICY_CHANGE_ACTION_CLASSES,
    'API_CUSTOMER_POLICY_CHANGE_ACTION_SET_INVALID',
    'customer_policy_registry.change_action_classes'
  );
  requireExact(
    contract.requiredResolutionBindings,
    CUSTOMER_POLICY_RESOLUTION_BINDINGS,
    'API_CUSTOMER_POLICY_RESOLUTION_BINDING_SET_INVALID',
    'customer_policy_registry.required_resolution_bindings'
  );
  requireExact(
    contract.serverAuthoritativeFields,
    CUSTOMER_POLICY_SERVER_AUTHORITY_FIELDS,
    'API_CUSTOMER_POLICY_SERVER_AUTHORITY_SET_INVALID',
    'customer_policy_registry.server_authoritative_fields'
  );
  requireExact(
    contract.forbiddenRequestAuthorityFields,
    CUSTOMER_POLICY_REQUEST_AUTHORITY_FIELDS,
    'API_CUSTOMER_POLICY_REQUEST_AUTHORITY_SET_INVALID',
    'customer_policy_registry.forbidden_request_authority_fields'
  );
  requireExact(
    contract.forbiddenConsumerUses,
    CUSTOMER_POLICY_FORBIDDEN_CONSUMER_USES,
    'API_CUSTOMER_POLICY_FORBIDDEN_USE_SET_INVALID',
    'customer_policy_registry.forbidden_consumer_uses'
  );
  for (const value of CANONICAL_FORBIDDEN_VALUES) {
    if (!contract.forbiddenValues.includes(value)) {
      push(
        'API_CUSTOMER_POLICY_FORBIDDEN_VALUE_MISSING',
        'customer_policy_registry.forbidden_values',
        `Customer-policy registry must forbid ${value}.`
      );
    }
  }

  const policies: readonly [string, string, string][] = [
    [contract.versionSelectionPolicy, 'server_only_exact_policy_set_resolution', 'version_selection_policy'],
    [contract.receiptBindingPolicy, 'immutable_exact_ordered_policy_set_and_content_digests', 'receipt_binding_policy'],
    [contract.missingDocumentPolicy, 'fail_closed_for_target_high_risk_capability_only', 'missing_document_policy'],
    [contract.rightsSurfaceAvailabilityPolicy, 'support_refund_export_deletion_and_policy_browsing_remain_available', 'rights_surface_availability_policy'],
    [contract.optionalConsentPolicy, 'separate_from_required_policy_acceptance', 'optional_consent_policy'],
    [contract.receiptStoragePolicy, 'immutable_append_only_receipt_no_latest_alias', 'receipt_storage_policy'],
    [contract.clientAuthorityPolicy, 'client_version_url_document_list_and_digest_are_non_authoritative', 'client_authority_policy'],
    [contract.contentDigestAlgorithm, 'sha256', 'content_digest_algorithm']
  ];
  for (const [actual, expected, field] of policies) {
    if (actual !== expected) {
      push(
        'API_CUSTOMER_POLICY_SEMANTIC_POLICY_INVALID',
        `customer_policy_registry.${field}`,
        `Customer-policy registry ${field} must remain ${expected}.`
      );
    }
  }

  const bundle = schemaBundlesByFile.get(CUSTOMER_POLICY_REGISTRY_FILE);
  const resolveRequest = bundle?.schemas.find(
    (schema) => schema.id === 'CustomerPolicySetResolveRequest'
  );
  const receiptRequest = bundle?.schemas.find(
    (schema) => schema.id === 'CustomerPolicyReceiptCreateRequest'
  );
  if (!resolveRequest || !receiptRequest) {
    push(
      'API_CUSTOMER_POLICY_REQUEST_SCHEMA_MISSING',
      'schema_bundle.schemas',
      'Policy-set resolution and receipt-create request schemas must exist.'
    );
    return;
  }
  requireExact(
    resolveRequest.requiredFields,
    CUSTOMER_POLICY_RESOLUTION_BINDINGS,
    'API_CUSTOMER_POLICY_RESOLVE_REQUEST_INVALID',
    'schema_bundle.CustomerPolicySetResolveRequest.required_fields'
  );
  for (const request of [resolveRequest, receiptRequest]) {
    const fields = new Set([...request.requiredFields, ...request.optionalFields]);
    for (const field of CUSTOMER_POLICY_REQUEST_AUTHORITY_FIELDS) {
      if (fields.has(field)) {
        push(
          'API_CUSTOMER_POLICY_CLIENT_AUTHORITY_FIELD_FORBIDDEN',
          `schema_bundle.${request.id}`,
          `Customer-policy request must not accept client-authoritative field ${field}.`
        );
      }
    }
  }
}
