import type { ApiContractDiagnostic, ApiContracts } from '../types.js';

import { hasExactStringValues } from './shared.js';

export function validateSensitiveActionAuthorization(
  contracts: ApiContracts,
  diagnostics: ApiContractDiagnostic[]
): void {
  const contract = contracts.sensitiveActionAuthorization;
  const file = 'contracts/apis/core-api/sensitive-action-authorization.yaml';
  const push = (code: string, path: string, message: string) =>
    diagnostics.push({ code, file, path, message });
  if (
    contract.schemaVersion !== 1 ||
    contract.status !== 'contract-only-no-live-route' ||
    contract.receiptFormat !== 'opaque_reference' ||
    contract.routeStatus !== 'no_route_defined'
  ) {
    push('API_SENSITIVE_ACTION_BOUNDARY_INVALID', 'sensitive_action_authorization', 'Sensitive-action authorization must remain an opaque contract-only receipt with no live route.');
  }
  if (
    contracts.apiCatalog.routes.some((route) =>
      [route.requestSchemaRef, route.responseSchemaRef].some((ref) =>
        ref?.startsWith(`${file}#`)
      )
    )
  ) {
    push('API_SENSITIVE_ACTION_ROUTE_FORBIDDEN', 'sensitive_action_authorization.route_status', 'Sensitive-action schemas must not be referenced by the route catalog before activation review.');
  }
  const requiredControls = [
    'server_to_server_verification',
    'exact_binding_match',
    'current_product_domain_guard',
    'durable_unique_receipt_ref',
    'domain_mutation_receipt_consumption_idempotency_and_audit_one_transaction',
    'same_idempotency_same_binding_stored_replay',
    'changed_binding_or_receipt_reuse_conflict',
    'failed_domain_transaction_does_not_consume_receipt'
  ];
  if (!hasExactStringValues(contract.requiredConsumerControls, requiredControls)) {
    push('API_SENSITIVE_ACTION_CONSUMER_CONTROL_SET_INVALID', 'sensitive_action_authorization.required_consumer_controls', 'Sensitive-action consumers must retain the exact reviewed verification and single-use control set.');
  }
}
