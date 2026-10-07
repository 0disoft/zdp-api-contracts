import type { ApiContractDiagnostic, ApiContracts, ApiSchemaBundleContract } from '../types.js';

import { CANONICAL_FORBIDDEN_VALUES } from '../forbidden-values.js';

import { hasExactStringValues, validateRequiredAccessDecisionValues } from './shared.js';

export const CREDIT_PURCHASE_FILE =
  'contracts/apis/money-api/credit-purchase.yaml';

export const CREDIT_PURCHASE_OPERATION_IDS = [
  'money.credit_pack_catalog_projections.get',
  'money.credit_checkout_intents.create',
  'money.credit_checkout_intents.status.get',
  'money.credit_checkout_return_receipts.exchange'
] as const;

export const CREDIT_PURCHASE_CHECKOUT_STATES = [
  'created',
  'payment_pending',
  'credit_issuance_pending',
  'completed',
  'review_required',
  'failed',
  'cancelled',
  'expired'
] as const;

export const CREDIT_PURCHASE_PAYMENT_STATES = [
  'not_started',
  'pending',
  'succeeded',
  'review_required',
  'failed',
  'cancelled',
  'expired'
] as const;

export const CREDIT_PURCHASE_CREDIT_ISSUANCE_STATES = [
  'not_started',
  'pending',
  'succeeded',
  'review_required',
  'failed'
] as const;

export const CREDIT_PURCHASE_RETURN_RECEIPT_STATES = [
  'not_issued',
  'available',
  'consumed',
  'expired'
] as const;

export const CREDIT_PURCHASE_NON_TERMINAL_STATES = [
  'created',
  'payment_pending',
  'credit_issuance_pending',
  'review_required'
] as const;

export const CREDIT_PURCHASE_TERMINAL_STATES = [
  'completed',
  'failed',
  'cancelled',
  'expired'
] as const;

export const CREDIT_PURCHASE_INTENT_BINDINGS = [
  'product_ref',
  'ship_tier_id',
  'scope_type',
  'scope_ref',
  'environment',
  'locale',
  'return_target_id'
] as const;

export const CREDIT_PURCHASE_RETURN_RECEIPT_BINDINGS = [
  'return_receipt',
  'product_ref',
  'return_target_id'
] as const;

export const CREDIT_PURCHASE_SERVER_REVALIDATED_CLAIMS = [
  'product_ref',
  'ship_tier_id',
  'scope_type',
  'scope_ref',
  'environment',
  'account_payment_eligibility',
  'catalog_sale_state',
  'provider_capability'
] as const;

export const CREDIT_PURCHASE_SNAPSHOT_REFS = [
  'catalog_version',
  'price_snapshot_ref',
  'tax_snapshot_ref',
  'benefit_snapshot_ref'
] as const;

export const CREDIT_PURCHASE_SEPARATED_IDENTIFIERS = [
  'checkout_intent_ref',
  'operation_ref',
  'payment_attempt_ref',
  'provider_object_ref',
  'ledger_issuance_ref',
  'return_receipt_ref'
] as const;

export const CREDIT_PURCHASE_PAYMENT_EVIDENCE = [
  'signed_provider_webhook',
  'provider_state_query',
  'reconciliation'
] as const;

export const CREDIT_PURCHASE_COMPLETION_EVIDENCE = [
  'payment_status_succeeded',
  'credit_issuance_status_succeeded'
] as const;

export const CREDIT_PURCHASE_FORBIDDEN_URL_VALUES = [
  'provider_token',
  'payment_credential',
  'central_session',
  'raw_price_snapshot'
] as const;

export const CREDIT_PURCHASE_FORBIDDEN_CONSUMER_USES = [
  'client_supplied_price_or_credits_as_authority',
  'success_redirect_as_payment_proof',
  'return_receipt_as_reusable_bearer',
  'product_local_credit_issuance',
  'arbitrary_return_url'
] as const;

export const CREDIT_PURCHASE_CLIENT_AUTHORITY_FIELDS = [
  'amount',
  'currency',
  'credits',
  'bonus_credits',
  'tax_amount',
  'price_snapshot'
] as const;

export function validateCreditPurchase(
  contracts: ApiContracts,
  schemaBundlesByFile: ReadonlyMap<string, ApiSchemaBundleContract>,
  diagnostics: ApiContractDiagnostic[]
): void {
  const contract = contracts.creditPurchase;
  const push = (code: string, path: string, message: string): void => {
    diagnostics.push({ code, file: CREDIT_PURCHASE_FILE, path, message });
  };
  const requireValues = (
    actual: readonly string[],
    expected: readonly string[],
    code: string,
    path: string
  ): void => {
    validateRequiredAccessDecisionValues(
      actual,
      expected,
      code,
      path,
      push
    );
  };

  if (contract.schemaVersion !== 2) {
    push(
      'API_CREDIT_PURCHASE_SCHEMA_VERSION_INVALID',
      'credit_purchase.schema_version',
      'Credit-purchase schema_version must be 2.'
    );
  }
  if (contract.status !== 'contract-only' || contract.ownerBoundary !== 'money') {
    push(
      'API_CREDIT_PURCHASE_OWNERSHIP_INVALID',
      'credit_purchase',
      'Credit purchase must remain contract-only and owned by Money.'
    );
  }

  const exactValueSets: readonly [
    readonly string[],
    readonly string[],
    string,
    string
  ][] = [
    [contract.operationIds, CREDIT_PURCHASE_OPERATION_IDS, 'API_CREDIT_PURCHASE_OPERATION_SET_INVALID', 'credit_purchase.operation_ids'],
    [contract.checkoutStates, CREDIT_PURCHASE_CHECKOUT_STATES, 'API_CREDIT_PURCHASE_STATE_SET_INVALID', 'credit_purchase.checkout_states'],
    [contract.paymentStates, CREDIT_PURCHASE_PAYMENT_STATES, 'API_CREDIT_PURCHASE_PAYMENT_STATE_SET_INVALID', 'credit_purchase.payment_states'],
    [contract.creditIssuanceStates, CREDIT_PURCHASE_CREDIT_ISSUANCE_STATES, 'API_CREDIT_PURCHASE_CREDIT_ISSUANCE_STATE_SET_INVALID', 'credit_purchase.credit_issuance_states'],
    [contract.returnReceiptStates, CREDIT_PURCHASE_RETURN_RECEIPT_STATES, 'API_CREDIT_PURCHASE_RETURN_RECEIPT_STATE_SET_INVALID', 'credit_purchase.return_receipt_states'],
    [contract.nonTerminalStates, CREDIT_PURCHASE_NON_TERMINAL_STATES, 'API_CREDIT_PURCHASE_NON_TERMINAL_SET_INVALID', 'credit_purchase.non_terminal_states'],
    [contract.terminalStates, CREDIT_PURCHASE_TERMINAL_STATES, 'API_CREDIT_PURCHASE_TERMINAL_SET_INVALID', 'credit_purchase.terminal_states'],
    [contract.requiredIntentBindings, CREDIT_PURCHASE_INTENT_BINDINGS, 'API_CREDIT_PURCHASE_INTENT_BINDING_SET_INVALID', 'credit_purchase.required_intent_bindings'],
    [contract.serverRevalidatedClaims, CREDIT_PURCHASE_SERVER_REVALIDATED_CLAIMS, 'API_CREDIT_PURCHASE_REVALIDATION_SET_INVALID', 'credit_purchase.server_revalidated_claims'],
    [contract.immutableSnapshotRefs, CREDIT_PURCHASE_SNAPSHOT_REFS, 'API_CREDIT_PURCHASE_SNAPSHOT_SET_INVALID', 'credit_purchase.immutable_snapshot_refs'],
    [contract.separatedIdentifiers, CREDIT_PURCHASE_SEPARATED_IDENTIFIERS, 'API_CREDIT_PURCHASE_IDENTIFIER_SET_INVALID', 'credit_purchase.separated_identifiers'],
    [contract.authoritativePaymentEvidence, CREDIT_PURCHASE_PAYMENT_EVIDENCE, 'API_CREDIT_PURCHASE_PAYMENT_EVIDENCE_SET_INVALID', 'credit_purchase.authoritative_payment_evidence'],
    [contract.authoritativeCompletionEvidence, CREDIT_PURCHASE_COMPLETION_EVIDENCE, 'API_CREDIT_PURCHASE_EVIDENCE_SET_INVALID', 'credit_purchase.authoritative_completion_evidence'],
    [contract.forbiddenUrlValues, CREDIT_PURCHASE_FORBIDDEN_URL_VALUES, 'API_CREDIT_PURCHASE_URL_FORBIDDEN_SET_INVALID', 'credit_purchase.forbidden_url_values'],
    [contract.forbiddenConsumerUses, CREDIT_PURCHASE_FORBIDDEN_CONSUMER_USES, 'API_CREDIT_PURCHASE_CONSUMER_FORBIDDEN_SET_INVALID', 'credit_purchase.forbidden_consumer_uses']
  ];
  for (const [actual, expected, code, path] of exactValueSets) {
    requireValues(actual, expected, code, path);
    if (!hasExactStringValues(actual, expected)) {
      push(code, path, `Credit-purchase contract must use the canonical ${path} set.`);
    }
  }
  requireValues(
    contract.forbiddenValues,
    CANONICAL_FORBIDDEN_VALUES,
    'API_CREDIT_PURCHASE_FORBIDDEN_VALUE_MISSING',
    'credit_purchase.forbidden_values'
  );

  const exactPolicies: readonly [string, string, string, string][] = [
    [contract.idempotencyPolicy, 'same_key_same_normalized_binding_replays_different_binding_conflicts', 'API_CREDIT_PURCHASE_IDEMPOTENCY_POLICY_INVALID', 'credit_purchase.idempotency_policy'],
    [contract.returnTargetPolicy, 'exact_environment_product_registry_target_id_only', 'API_CREDIT_PURCHASE_RETURN_TARGET_POLICY_INVALID', 'credit_purchase.return_target_policy'],
    [contract.returnReceiptPolicy, 'short_lived_single_use_opaque_server_exchange_only', 'API_CREDIT_PURCHASE_RETURN_RECEIPT_POLICY_INVALID', 'credit_purchase.return_receipt_policy'],
    [contract.returnReceiptRetryPolicy, 'same_idempotency_key_same_exchange_replays_other_attempt_is_already_consumed', 'API_CREDIT_PURCHASE_RETURN_RECEIPT_RETRY_POLICY_INVALID', 'credit_purchase.return_receipt_retry_policy'],
    [contract.returnReceiptDigestAlgorithm, 'sha256', 'API_CREDIT_PURCHASE_RETURN_RECEIPT_DIGEST_INVALID', 'credit_purchase.return_receipt_digest_algorithm'],
    [contract.persistenceContractRef, 'zdp-money-platform/contracts/money-db-schema.yaml#credit_checkout_persistence', 'API_CREDIT_PURCHASE_PERSISTENCE_REF_INVALID', 'credit_purchase.persistence_contract_ref'],
    [contract.checkoutCompletionPolicy, 'verified_payment_success_then_ledger_issuance_success', 'API_CREDIT_PURCHASE_COMPLETION_POLICY_INVALID', 'credit_purchase.checkout_completion_policy'],
    [contract.balanceRefreshPolicy, 'reread_money_balance_after_receipt_exchange_or_completed_status', 'API_CREDIT_PURCHASE_BALANCE_REFRESH_POLICY_INVALID', 'credit_purchase.balance_refresh_policy'],
    [contract.unknownOutcomePolicy, 'remain_pending_or_review_required_until_reconciled', 'API_CREDIT_PURCHASE_UNKNOWN_OUTCOME_POLICY_INVALID', 'credit_purchase.unknown_outcome_policy']
  ];
  for (const [actual, expected, code, path] of exactPolicies) {
    if (actual !== expected) {
      push(code, path, `Credit-purchase policy must remain ${expected}.`);
    }
  }
  if (!contract.returnReceiptSingleUse) {
    push(
      'API_CREDIT_PURCHASE_RETURN_RECEIPT_REUSABLE',
      'credit_purchase.return_receipt_single_use',
      'Checkout return receipts must be single-use.'
    );
  }
  if (contract.returnReceiptPlaintextStored) {
    push(
      'API_CREDIT_PURCHASE_RETURN_RECEIPT_PLAINTEXT_STORED',
      'credit_purchase.return_receipt_plaintext_stored',
      'Checkout return receipt plaintext must never be stored.'
    );
  }
  if (contract.providerSuccessCompletesCheckout) {
    push(
      'API_CREDIT_PURCHASE_PROVIDER_SUCCESS_COMPLETES_CHECKOUT',
      'credit_purchase.provider_success_completes_checkout',
      'Provider payment success must not complete a checkout before ledger issuance.'
    );
  }
  if (!contract.ledgerIssuanceRequiredForCompletion) {
    push(
      'API_CREDIT_PURCHASE_LEDGER_ISSUANCE_NOT_REQUIRED',
      'credit_purchase.ledger_issuance_required_for_completion',
      'Checkout completion must require successful ledger issuance.'
    );
  }
  if (contract.successRedirectIsPaymentEvidence) {
    push(
      'API_CREDIT_PURCHASE_REDIRECT_TRUSTED',
      'credit_purchase.success_redirect_is_payment_evidence',
      'A success redirect must never be treated as payment evidence.'
    );
  }
  if (contract.clientAmountsAuthoritative) {
    push(
      'API_CREDIT_PURCHASE_CLIENT_AMOUNT_TRUSTED',
      'credit_purchase.client_amounts_authoritative',
      'Client-supplied amount, currency, credits, bonus, and tax must never be authoritative.'
    );
  }

  for (const operationId of CREDIT_PURCHASE_OPERATION_IDS) {
    const route = contracts.apiCatalog.routes.find(
      (candidate) => candidate.operationId === operationId
    );
    if (!route) {
      push(
        'API_CREDIT_PURCHASE_ROUTE_MISSING',
        'credit_purchase.operation_ids',
        `Credit-purchase operation ${operationId} must exist in the route catalog.`
      );
      continue;
    }
    if (
      route.serviceId !== 'money-api' ||
      route.ownerBoundary !== 'money' ||
      route.tenantBoundary !== 'common_zdp_wallet'
    ) {
      push(
        'API_CREDIT_PURCHASE_ROUTE_BOUNDARY_INVALID',
        `credit_purchase.operation_ids.${operationId}`,
        `Credit-purchase operation ${operationId} must stay on the Money common-wallet boundary.`
      );
    }
  }

  const schemaBundle = schemaBundlesByFile.get(CREDIT_PURCHASE_FILE);
  const intentRequest = schemaBundle?.schemas.find(
    (schema) => schema.id === 'CreditCheckoutIntentCreateRequest'
  );
  if (!intentRequest) {
    push(
      'API_CREDIT_PURCHASE_INTENT_SCHEMA_MISSING',
      'schema_bundle.schemas',
      'Credit checkout intent request schema must exist.'
    );
  } else {
    if (!hasExactStringValues(intentRequest.requiredFields, CREDIT_PURCHASE_INTENT_BINDINGS)) {
      push(
        'API_CREDIT_PURCHASE_INTENT_SCHEMA_FIELD_SET_INVALID',
        'schema_bundle.CreditCheckoutIntentCreateRequest.required_fields',
        'Checkout intent request must use exactly the canonical binding field set.'
      );
    }
    if (intentRequest.optionalFields.length > 0) {
      push(
        'API_CREDIT_PURCHASE_INTENT_SCHEMA_FIELD_SET_INVALID',
        'schema_bundle.CreditCheckoutIntentCreateRequest.optional_fields',
        'Checkout intent request must not add fields outside the canonical binding set.'
      );
    }
    const declaredFields = new Set([
      ...intentRequest.requiredFields,
      ...intentRequest.optionalFields
    ]);
    for (const field of CREDIT_PURCHASE_CLIENT_AUTHORITY_FIELDS) {
      if (declaredFields.has(field)) {
        push(
          'API_CREDIT_PURCHASE_CLIENT_AUTHORITY_FIELD_FORBIDDEN',
          'schema_bundle.CreditCheckoutIntentCreateRequest',
          `Checkout intent request must not accept client-authoritative field ${field}.`
        );
      }
    }
  }

  const receiptRequest = schemaBundle?.schemas.find(
    (schema) => schema.id === 'CreditCheckoutReturnReceiptExchangeRequest'
  );
  if (
    !receiptRequest ||
    !receiptRequest.carriesSecretMaterial ||
    receiptRequest.secretMaterialPolicy !==
      'one_time_receipt_input_only_never_echo_or_persist_plaintext' ||
    !hasExactStringValues(receiptRequest.requiredFields, CREDIT_PURCHASE_RETURN_RECEIPT_BINDINGS) ||
    receiptRequest.optionalFields.length > 0 ||
    !hasExactStringValues(receiptRequest.secretFields, ['return_receipt'])
  ) {
    push(
      'API_CREDIT_PURCHASE_RETURN_RECEIPT_SECRET_POLICY_INVALID',
      'schema_bundle.CreditCheckoutReturnReceiptExchangeRequest',
      'Return receipt exchange must treat the one-time receipt as non-echoing secret input.'
    );
  }
}
