import type { ApiContractDiagnostic, ApiContracts } from '../types.js';

import { hasExactStringValues } from './shared.js';

export const PRODUCT_LINK_FILE = 'contracts/apis/core-api/product-link.yaml';

export const PRODUCT_LINK_STATES = [
  'pending',
  'approved',
  'denied',
  'expired',
  'consumed'
] as const;

export const PRODUCT_LINK_TERMINAL_STATES = ['denied', 'expired', 'consumed'] as const;

export const PRODUCT_LINK_REQUIRED_BINDINGS = [
  'product_ref',
  'client_instance_ref',
  'client_correlation_ref',
  'proof_challenge',
  'requested_scope_refs'
] as const;

export const PRODUCT_LINK_EXCHANGE_REFS = [
  'subject_ref',
  'workspace_ref',
  'consent_receipt_ref',
  'link_receipt_ref',
  'verified_at'
] as const;

export const PRODUCT_LINK_FORBIDDEN_VALUES = [
  'password',
  'authorization_header',
  'cookie_header',
  'access_token',
  'refresh_token_plaintext',
  'login_identifier',
  'contact_method',
  'integrated_profile',
  'raw_consent_document'
] as const;

export const PRODUCT_LINK_TRANSITIONS = [
  'pending:approve:approved',
  'pending:deny:denied',
  'pending:expire:expired',
  'approved:exchange:consumed',
  'approved:expire:expired'
] as const;

export function validateProductLinkHandoff(
  contracts: ApiContracts,
  diagnostics: ApiContractDiagnostic[]
): void {
  const contract = contracts.productLinkHandoff;
  const push = (code: string, path: string, message: string): void => {
    diagnostics.push({ code, file: PRODUCT_LINK_FILE, path, message });
  };

  if (contract.schemaVersion !== 1) {
    push('API_PRODUCT_LINK_SCHEMA_VERSION_INVALID', 'product_link_handoff.schema_version', 'Product-link handoff schema_version must be 1.');
  }
  if (contract.status !== 'contract-only' || contract.ownerBoundary !== 'identity') {
    push('API_PRODUCT_LINK_OWNERSHIP_INVALID', 'product_link_handoff', 'Product-link handoff must remain contract-only and owned by identity.');
  }
  if (contract.challengeTtlSeconds !== 600 || contract.minimumPollIntervalSeconds !== 5) {
    push('API_PRODUCT_LINK_TIMING_INVALID', 'product_link_handoff.challenge_ttl_seconds', 'Product-link challenges must expire after 600 seconds and enforce a minimum five-second polling interval.');
  }
  if (
    contract.proofMethod !== 'S256' ||
    contract.proofVerifierPolicy !== 'random_32_octets_base64url_no_padding' ||
    contract.proofChallengePolicy !== 'base64url_no_padding_sha256_of_verifier'
  ) {
    push('API_PRODUCT_LINK_PROOF_POLICY_INVALID', 'product_link_handoff.proof_method', 'Product-link proof must use the contracted S256 verifier binding.');
  }
  validateExactProductLinkValues(contract.lifecycleStates, PRODUCT_LINK_STATES, 'API_PRODUCT_LINK_STATE_SET_INVALID', 'product_link_handoff.lifecycle_states', push);
  validateExactProductLinkValues(contract.terminalStates, PRODUCT_LINK_TERMINAL_STATES, 'API_PRODUCT_LINK_TERMINAL_STATE_SET_INVALID', 'product_link_handoff.terminal_states', push);
  validateExactProductLinkValues(contract.requiredBindings, PRODUCT_LINK_REQUIRED_BINDINGS, 'API_PRODUCT_LINK_BINDING_SET_INVALID', 'product_link_handoff.required_bindings', push);
  validateExactProductLinkValues(contract.exchangeResponseRefs, PRODUCT_LINK_EXCHANGE_REFS, 'API_PRODUCT_LINK_RESPONSE_REF_SET_INVALID', 'product_link_handoff.exchange_response_refs', push);
  validateExactProductLinkValues(contract.forbiddenValues, PRODUCT_LINK_FORBIDDEN_VALUES, 'API_PRODUCT_LINK_FORBIDDEN_VALUE_SET_INVALID', 'product_link_handoff.forbidden_values', push);

  const transitions = new Set(
    contract.transitions.map((transition) => `${transition.from}:${transition.event}:${transition.to}`)
  );
  if (!hasExactStringValues([...transitions], PRODUCT_LINK_TRANSITIONS)) {
    push('API_PRODUCT_LINK_TRANSITION_SET_INVALID', 'product_link_handoff.allowed_transitions', 'Product-link handoff must declare exactly the reviewed transition set.');
  }
  if (!contract.singleUseExchange) {
    push('API_PRODUCT_LINK_SINGLE_USE_REQUIRED', 'product_link_handoff.single_use_exchange', 'Product-link exchange must be single use.');
  }
  if (contract.correlationBinding !== 'same_challenge_same_correlation_idempotent_different_correlation_rejected') {
    push('API_PRODUCT_LINK_CORRELATION_POLICY_INVALID', 'product_link_handoff.correlation_binding', 'Product-link retries must preserve correlation and reject cross-correlation reuse.');
  }
  if (contract.localOnlyPolicy !== 'allowed_without_account_link_no_sync_entitlement_or_remote_account_features') {
    push('API_PRODUCT_LINK_LOCAL_ONLY_POLICY_INVALID', 'product_link_handoff.local_only_policy', 'Local-only mode must remain available without sync, entitlement, or remote account features.');
  }
}

export function validateExactProductLinkValues(
  actual: readonly string[],
  required: readonly string[],
  code: string,
  path: string,
  push: (code: string, path: string, message: string) => void
): void {
  if (!hasExactStringValues(actual, required)) {
    push(code, path, 'Product-link handoff must use exactly the reviewed value set.');
  }
}
