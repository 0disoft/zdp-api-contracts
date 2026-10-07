import type { AbuseChallengeContract } from '../types.js';

import { assertOnlyKeys, parseYamlObject, requiredBoolean, requiredNumber, requiredObject, requiredString, requiredStringList } from './shared.js';

export function parseAbuseChallengeContract(
  source: string
): AbuseChallengeContract {
  const file = 'contracts/apis/abuse-api/challenge.yaml';
  const data = parseYamlObject(source, file);
  assertOnlyKeys(data, ['abuse_challenge', 'schema_bundle'], file);
  const contract = requiredObject(data, 'abuse_challenge', file);
  const context = `${file}#abuse_challenge`;
  assertOnlyKeys(
    contract,
    [
      'schema_version',
      'status',
      'owner_boundary',
      'operation_ids',
      'staging_implemented_operation_ids',
      'contract_only_operation_ids',
      'resolve_route',
      'resolve_transport_policy',
      'production_route_ready',
      'public_operation_ids',
      'private_operation_ids',
      'required_binding_fields',
      'provider_adapter_operations',
      'internal_caller_families',
      'verification_receipt_single_use',
      'verification_receipt_ttl_policy',
      'verification_receipt_binding',
      'verification_consumption_policy',
      'verification_consumer_operation_policy',
      'redeem_recovery_policy',
      'verification_receipt_derivation_policy',
      'public_origin_protection_policy',
      'internal_caller_topology_policy',
      'credential_ambiguity_policy',
      'internal_service_proof_policy',
      'idempotency_policy',
      'provider_abstraction_policy',
      'failure_policy',
      'product_authority_policy',
      'public_surface_policy',
      'health_surface_policy',
      'storage_policy',
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
    publicOperationIds: requiredStringList(
      contract,
      'public_operation_ids',
      context
    ),
    privateOperationIds: requiredStringList(
      contract,
      'private_operation_ids',
      context
    ),
    requiredBindingFields: requiredStringList(
      contract,
      'required_binding_fields',
      context
    ),
    providerAdapterOperations: requiredStringList(
      contract,
      'provider_adapter_operations',
      context
    ),
    internalCallerFamilies: requiredStringList(
      contract,
      'internal_caller_families',
      context
    ),
    verificationReceiptSingleUse: requiredBoolean(
      contract,
      'verification_receipt_single_use',
      context
    ),
    verificationReceiptTtlPolicy: requiredString(
      contract,
      'verification_receipt_ttl_policy',
      context
    ),
    verificationReceiptBinding: requiredString(
      contract,
      'verification_receipt_binding',
      context
    ),
    verificationConsumptionPolicy: requiredString(
      contract,
      'verification_consumption_policy',
      context
    ),
    verificationConsumerOperationPolicy: requiredString(
      contract,
      'verification_consumer_operation_policy',
      context
    ),
    redeemRecoveryPolicy: requiredString(
      contract,
      'redeem_recovery_policy',
      context
    ),
    verificationReceiptDerivationPolicy: requiredString(
      contract,
      'verification_receipt_derivation_policy',
      context
    ),
    publicOriginProtectionPolicy: requiredString(
      contract,
      'public_origin_protection_policy',
      context
    ),
    internalCallerTopologyPolicy: requiredString(
      contract,
      'internal_caller_topology_policy',
      context
    ),
    credentialAmbiguityPolicy: requiredString(
      contract,
      'credential_ambiguity_policy',
      context
    ),
    internalServiceProofPolicy: requiredString(
      contract,
      'internal_service_proof_policy',
      context
    ),
    idempotencyPolicy: requiredString(contract, 'idempotency_policy', context),
    providerAbstractionPolicy: requiredString(
      contract,
      'provider_abstraction_policy',
      context
    ),
    failurePolicy: requiredString(contract, 'failure_policy', context),
    productAuthorityPolicy: requiredString(
      contract,
      'product_authority_policy',
      context
    ),
    publicSurfacePolicy: requiredString(
      contract,
      'public_surface_policy',
      context
    ),
    healthSurfacePolicy: requiredString(
      contract,
      'health_surface_policy',
      context
    ),
    storagePolicy: requiredString(contract, 'storage_policy', context),
    forbiddenConsumerUses: requiredStringList(
      contract,
      'forbidden_consumer_uses',
      context
    ),
    forbiddenValues: requiredStringList(contract, 'forbidden_values', context)
  };
}
