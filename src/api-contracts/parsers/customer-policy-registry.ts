import type { CustomerPolicyRegistryContract } from '../types.js';

import { assertOnlyKeys, parseYamlObject, requiredBoolean, requiredNumber, requiredObject, requiredString, requiredStringList } from './shared.js';

export function parseCustomerPolicyRegistryContract(
  source: string
): CustomerPolicyRegistryContract {
  const file = 'contracts/apis/core-api/customer-policy-registry.yaml';
  const data = parseYamlObject(source, file);
  assertOnlyKeys(data, ['customer_policy_registry', 'schema_bundle'], file);
  const contract = requiredObject(data, 'customer_policy_registry', file);
  const context = `${file}#customer_policy_registry`;
  assertOnlyKeys(
    contract,
    [
      'schema_version',
      'status',
      'owner_boundary',
      'authority',
      'operation_ids',
      'staging_implemented_operation_ids',
      'contract_only_operation_ids',
      'resolve_route',
      'resolve_transport_policy',
      'production_route_ready',
      'document_kinds',
      'publication_states',
      'resolution_statuses',
      'change_action_classes',
      'required_resolution_bindings',
      'server_authoritative_fields',
      'immutable_revision_fields',
      'version_selection_policy',
      'receipt_binding_policy',
      'missing_document_policy',
      'rights_surface_availability_policy',
      'optional_consent_policy',
      'receipt_storage_policy',
      'client_authority_policy',
      'content_digest_algorithm',
      'forbidden_request_authority_fields',
      'forbidden_consumer_uses',
      'forbidden_values'
    ],
    context
  );

  return {
    schemaVersion: requiredNumber(contract, 'schema_version', context),
    status: requiredString(contract, 'status', context),
    ownerBoundary: requiredString(contract, 'owner_boundary', context),
    authority: requiredString(contract, 'authority', context),
    operationIds: requiredStringList(contract, 'operation_ids', context),
    stagingImplementedOperationIds: requiredStringList(
      contract,
      'staging_implemented_operation_ids',
      context
    ),
    contractOnlyOperationIds: requiredStringList(
      contract,
      'contract_only_operation_ids',
      context
    ),
    resolveRoute: requiredString(contract, 'resolve_route', context),
    resolveTransportPolicy: requiredString(
      contract,
      'resolve_transport_policy',
      context
    ),
    productionRouteReady: requiredBoolean(
      contract,
      'production_route_ready',
      context
    ),
    documentKinds: requiredStringList(contract, 'document_kinds', context),
    publicationStates: requiredStringList(
      contract,
      'publication_states',
      context
    ),
    resolutionStatuses: requiredStringList(
      contract,
      'resolution_statuses',
      context
    ),
    changeActionClasses: requiredStringList(
      contract,
      'change_action_classes',
      context
    ),
    requiredResolutionBindings: requiredStringList(
      contract,
      'required_resolution_bindings',
      context
    ),
    serverAuthoritativeFields: requiredStringList(
      contract,
      'server_authoritative_fields',
      context
    ),
    immutableRevisionFields: requiredStringList(
      contract,
      'immutable_revision_fields',
      context
    ),
    versionSelectionPolicy: requiredString(
      contract,
      'version_selection_policy',
      context
    ),
    receiptBindingPolicy: requiredString(
      contract,
      'receipt_binding_policy',
      context
    ),
    missingDocumentPolicy: requiredString(
      contract,
      'missing_document_policy',
      context
    ),
    rightsSurfaceAvailabilityPolicy: requiredString(
      contract,
      'rights_surface_availability_policy',
      context
    ),
    optionalConsentPolicy: requiredString(
      contract,
      'optional_consent_policy',
      context
    ),
    receiptStoragePolicy: requiredString(
      contract,
      'receipt_storage_policy',
      context
    ),
    clientAuthorityPolicy: requiredString(
      contract,
      'client_authority_policy',
      context
    ),
    contentDigestAlgorithm: requiredString(
      contract,
      'content_digest_algorithm',
      context
    ),
    forbiddenRequestAuthorityFields: requiredStringList(
      contract,
      'forbidden_request_authority_fields',
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
