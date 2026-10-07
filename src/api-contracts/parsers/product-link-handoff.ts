import type { ProductLinkHandoffContract, ProductLinkTransition } from '../types.js';

import { assertOnlyKeys, parseYamlObject, requiredBoolean, requiredNumber, requiredObject, requiredRecordListNonEmpty, requiredString, requiredStringList } from './shared.js';

export function parseProductLinkHandoffContract(
  source: string
): ProductLinkHandoffContract {
  const file = 'contracts/apis/core-api/product-link.yaml';
  const data = parseYamlObject(source, file);
  const contract = requiredObject(data, 'product_link_handoff', file);
  const transitions = requiredRecordListNonEmpty(
    contract,
    'allowed_transitions',
    `${file}#product_link_handoff`
  );

  return {
    schemaVersion: requiredNumber(contract, 'schema_version', `${file}#product_link_handoff`),
    status: requiredString(contract, 'status', `${file}#product_link_handoff`),
    ownerBoundary: requiredString(contract, 'owner_boundary', `${file}#product_link_handoff`),
    challengeTtlSeconds: requiredNumber(contract, 'challenge_ttl_seconds', `${file}#product_link_handoff`),
    minimumPollIntervalSeconds: requiredNumber(contract, 'minimum_poll_interval_seconds', `${file}#product_link_handoff`),
    proofMethod: requiredString(contract, 'proof_method', `${file}#product_link_handoff`),
    proofVerifierPolicy: requiredString(contract, 'proof_verifier_policy', `${file}#product_link_handoff`),
    proofChallengePolicy: requiredString(contract, 'proof_challenge_policy', `${file}#product_link_handoff`),
    lifecycleStates: requiredStringList(contract, 'lifecycle_states', `${file}#product_link_handoff`),
    terminalStates: requiredStringList(contract, 'terminal_states', `${file}#product_link_handoff`),
    transitions: transitions.map(parseProductLinkTransition),
    singleUseExchange: requiredBoolean(contract, 'single_use_exchange', `${file}#product_link_handoff`),
    correlationBinding: requiredString(contract, 'correlation_binding', `${file}#product_link_handoff`),
    requiredBindings: requiredStringList(contract, 'required_bindings', `${file}#product_link_handoff`),
    exchangeResponseRefs: requiredStringList(contract, 'exchange_response_refs', `${file}#product_link_handoff`),
    forbiddenValues: requiredStringList(contract, 'forbidden_values', `${file}#product_link_handoff`),
    localOnlyPolicy: requiredString(contract, 'local_only_policy', `${file}#product_link_handoff`)
  };
}

export function parseProductLinkTransition(
  transition: Record<string, unknown>,
  index: number
): ProductLinkTransition {
  const context = `contracts/apis/core-api/product-link.yaml#product_link_handoff.allowed_transitions[${index}]`;
  assertOnlyKeys(transition, ['from', 'event', 'to'], context);
  return {
    from: requiredString(transition, 'from', context),
    event: requiredString(transition, 'event', context),
    to: requiredString(transition, 'to', context)
  };
}
