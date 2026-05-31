import type {
  ApiContractDiagnostic,
  ApiContracts,
  ApiContractValidationResult
} from './types';

const REQUIRED_ROUTE_FIELDS = [
  'resource',
  'action',
  'method',
  'path',
  'auth_required',
  'permission_check',
  'audit_event',
  'idempotency',
  'error_codes'
] as const;

const FORBIDDEN_ROUTE_SHAPES = [
  'screen_component_payload',
  'provider_specific_id_as_primary_id',
  'raw_storage_url'
] as const;

const REQUIRED_ERROR_FIELDS = [
  'code',
  'message',
  'request_id',
  'trace_id'
] as const;

const FORBIDDEN_ERROR_FIELDS = [
  'stack_trace',
  'provider_secret',
  'raw_provider_error',
  'customer_private_payload'
] as const;

const REQUIRED_WEBHOOK_CONTROLS = [
  'event_id',
  'event_type',
  'schema_version',
  'signature_verification',
  'idempotency_key',
  'replay_policy',
  'dead_letter_policy'
] as const;

const FORBIDDEN_WEBHOOK_CONTROLS = [
  'unversioned_payload',
  'provider_secret_in_schema',
  'ledger_mutation_without_money_contract'
] as const;

export function validateApiContracts(
  contracts: ApiContracts
): ApiContractValidationResult {
  const diagnostics: ApiContractDiagnostic[] = [];

  if (contracts.route.status !== 'skeleton') {
    diagnostics.push({
      code: 'API_ROUTE_STATUS_INVALID',
      file: 'contracts/route-contract.yaml',
      path: 'route_contract.status',
      message: 'Route contract must stay in skeleton status until real routes exist.'
    });
  }

  for (const field of REQUIRED_ROUTE_FIELDS) {
    if (!contracts.route.requiredPerRoute.includes(field)) {
      diagnostics.push({
        code: 'API_ROUTE_REQUIRED_FIELD_MISSING',
        file: 'contracts/route-contract.yaml',
        path: 'route_contract.required_per_route',
        message: `Route contract must require \`${field}\` for every route.`
      });
    }
  }

  for (const shape of FORBIDDEN_ROUTE_SHAPES) {
    if (!contracts.route.forbiddenShapes.includes(shape)) {
      diagnostics.push({
        code: 'API_ROUTE_FORBIDDEN_SHAPE_MISSING',
        file: 'contracts/route-contract.yaml',
        path: 'route_contract.forbidden_shapes',
        message: `Route contract must forbid \`${shape}\`.`
      });
    }
  }

  if (contracts.errorEnvelope.schemaVersion !== 1) {
    diagnostics.push({
      code: 'API_ERROR_SCHEMA_VERSION_INVALID',
      file: 'contracts/error-envelope.yaml',
      path: 'error_envelope.schema_version',
      message: 'Error envelope schema_version must remain 1 until a migration exists.'
    });
  }

  for (const field of REQUIRED_ERROR_FIELDS) {
    if (!contracts.errorEnvelope.requiredFields.includes(field)) {
      diagnostics.push({
        code: 'API_ERROR_REQUIRED_FIELD_MISSING',
        file: 'contracts/error-envelope.yaml',
        path: 'error_envelope.required_fields',
        message: `Error envelope must require \`${field}\`.`
      });
    }
  }

  for (const field of FORBIDDEN_ERROR_FIELDS) {
    if (!contracts.errorEnvelope.forbiddenFields.includes(field)) {
      diagnostics.push({
        code: 'API_ERROR_FORBIDDEN_FIELD_MISSING',
        file: 'contracts/error-envelope.yaml',
        path: 'error_envelope.forbidden_fields',
        message: `Error envelope must forbid \`${field}\`.`
      });
    }
  }

  if (contracts.webhook.status !== 'skeleton') {
    diagnostics.push({
      code: 'API_WEBHOOK_STATUS_INVALID',
      file: 'contracts/webhook-contract.yaml',
      path: 'webhook_contract.status',
      message: 'Webhook contract must stay in skeleton status until real webhooks exist.'
    });
  }

  for (const control of REQUIRED_WEBHOOK_CONTROLS) {
    if (!contracts.webhook.requiredControls.includes(control)) {
      diagnostics.push({
        code: 'API_WEBHOOK_REQUIRED_CONTROL_MISSING',
        file: 'contracts/webhook-contract.yaml',
        path: 'webhook_contract.required_controls',
        message: `Webhook contract must require \`${control}\`.`
      });
    }
  }

  for (const control of FORBIDDEN_WEBHOOK_CONTROLS) {
    if (!contracts.webhook.forbiddenControls.includes(control)) {
      diagnostics.push({
        code: 'API_WEBHOOK_FORBIDDEN_CONTROL_MISSING',
        file: 'contracts/webhook-contract.yaml',
        path: 'webhook_contract.forbidden_controls',
        message: `Webhook contract must forbid \`${control}\`.`
      });
    }
  }

  return {
    ok: diagnostics.length === 0,
    diagnostics
  };
}
