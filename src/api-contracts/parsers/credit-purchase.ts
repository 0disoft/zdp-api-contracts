import type { CreditPurchaseContract } from '../types.js';

import { assertOnlyKeys, parseYamlObject, requiredBoolean, requiredNumber, requiredObject, requiredString, requiredStringList } from './shared.js';

export function parseCreditPurchaseContract(
  source: string
): CreditPurchaseContract {
  const file = 'contracts/apis/money-api/credit-purchase.yaml';
  const data = parseYamlObject(source, file);
  assertOnlyKeys(data, ['credit_purchase', 'schema_bundle'], file);
  const contract = requiredObject(data, 'credit_purchase', file);
  const context = `${file}#credit_purchase`;
  assertOnlyKeys(
    contract,
    [
      'schema_version',
      'status',
      'owner_boundary',
      'operation_ids',
      'checkout_states',
      'payment_states',
      'credit_issuance_states',
      'return_receipt_states',
      'non_terminal_states',
      'terminal_states',
      'required_intent_bindings',
      'server_revalidated_claims',
      'immutable_snapshot_refs',
      'separated_identifiers',
      'authoritative_payment_evidence',
      'authoritative_completion_evidence',
      'persistence_contract_ref',
      'checkout_completion_policy',
      'provider_success_completes_checkout',
      'ledger_issuance_required_for_completion',
      'idempotency_policy',
      'return_target_policy',
      'return_receipt_policy',
      'return_receipt_retry_policy',
      'return_receipt_single_use',
      'return_receipt_plaintext_stored',
      'return_receipt_digest_algorithm',
      'success_redirect_is_payment_evidence',
      'client_amounts_authoritative',
      'balance_refresh_policy',
      'unknown_outcome_policy',
      'forbidden_url_values',
      'forbidden_consumer_uses',
      'forbidden_values'
    ],
    context
  );

  return {
    schemaVersion: requiredNumber(contract, 'schema_version', context),
    status: requiredString(contract, 'status', context),
    ownerBoundary: requiredString(contract, 'owner_boundary', context),
    operationIds: requiredStringList(contract, 'operation_ids', context),
    checkoutStates: requiredStringList(contract, 'checkout_states', context),
    paymentStates: requiredStringList(contract, 'payment_states', context),
    creditIssuanceStates: requiredStringList(
      contract,
      'credit_issuance_states',
      context
    ),
    returnReceiptStates: requiredStringList(
      contract,
      'return_receipt_states',
      context
    ),
    nonTerminalStates: requiredStringList(
      contract,
      'non_terminal_states',
      context
    ),
    terminalStates: requiredStringList(contract, 'terminal_states', context),
    requiredIntentBindings: requiredStringList(
      contract,
      'required_intent_bindings',
      context
    ),
    serverRevalidatedClaims: requiredStringList(
      contract,
      'server_revalidated_claims',
      context
    ),
    immutableSnapshotRefs: requiredStringList(
      contract,
      'immutable_snapshot_refs',
      context
    ),
    separatedIdentifiers: requiredStringList(
      contract,
      'separated_identifiers',
      context
    ),
    authoritativePaymentEvidence: requiredStringList(
      contract,
      'authoritative_payment_evidence',
      context
    ),
    authoritativeCompletionEvidence: requiredStringList(
      contract,
      'authoritative_completion_evidence',
      context
    ),
    persistenceContractRef: requiredString(
      contract,
      'persistence_contract_ref',
      context
    ),
    checkoutCompletionPolicy: requiredString(
      contract,
      'checkout_completion_policy',
      context
    ),
    providerSuccessCompletesCheckout: requiredBoolean(
      contract,
      'provider_success_completes_checkout',
      context
    ),
    ledgerIssuanceRequiredForCompletion: requiredBoolean(
      contract,
      'ledger_issuance_required_for_completion',
      context
    ),
    idempotencyPolicy: requiredString(contract, 'idempotency_policy', context),
    returnTargetPolicy: requiredString(contract, 'return_target_policy', context),
    returnReceiptPolicy: requiredString(
      contract,
      'return_receipt_policy',
      context
    ),
    returnReceiptRetryPolicy: requiredString(
      contract,
      'return_receipt_retry_policy',
      context
    ),
    returnReceiptSingleUse: requiredBoolean(
      contract,
      'return_receipt_single_use',
      context
    ),
    returnReceiptPlaintextStored: requiredBoolean(
      contract,
      'return_receipt_plaintext_stored',
      context
    ),
    returnReceiptDigestAlgorithm: requiredString(
      contract,
      'return_receipt_digest_algorithm',
      context
    ),
    successRedirectIsPaymentEvidence: requiredBoolean(
      contract,
      'success_redirect_is_payment_evidence',
      context
    ),
    clientAmountsAuthoritative: requiredBoolean(
      contract,
      'client_amounts_authoritative',
      context
    ),
    balanceRefreshPolicy: requiredString(
      contract,
      'balance_refresh_policy',
      context
    ),
    unknownOutcomePolicy: requiredString(
      contract,
      'unknown_outcome_policy',
      context
    ),
    forbiddenUrlValues: requiredStringList(
      contract,
      'forbidden_url_values',
      context
    ),
    forbiddenConsumerUses: requiredStringList(
      contract,
      'forbidden_consumer_uses',
      context
    ),
    forbiddenValues: requiredStringList(contract, 'forbidden_values', context)
  };
}
