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

const REQUIRED_SDK_SOURCE_CONTRACTS = [
  'contracts/route-contract.yaml',
  'contracts/error-envelope.yaml',
  'contracts/webhook-contract.yaml'
] as const;

const REQUIRED_SDK_GENERATION_TARGETS = [
  'typescript',
  'dart',
  'rust'
] as const;

const REQUIRED_SDK_ROUTE_METADATA = [
  'operation_id',
  'resource',
  'action',
  'method',
  'path',
  'request_schema_ref',
  'response_schema_ref',
  'auth_required',
  'permission_check',
  'audit_event',
  'idempotency',
  'error_codes'
] as const;

const REQUIRED_SDK_ERROR_METADATA = [
  'code',
  'message',
  'request_id',
  'trace_id',
  'retry_after_seconds',
  'documentation_url'
] as const;

const REQUIRED_SDK_WEBHOOK_METADATA = [
  'event_id',
  'event_type',
  'schema_version',
  'signature_verification',
  'idempotency_key',
  'replay_policy',
  'dead_letter_policy'
] as const;

const FORBIDDEN_SDK_OWNERSHIP = [
  'generated_sdk_source',
  'sdk_runtime_implementation',
  'product_business_logic',
  'refresh_token_storage',
  'final_authorization_decision',
  'provider_credential_storage'
] as const;

const FORBIDDEN_SDK_VALUES = [
  'raw_customer_payload',
  'raw_provider_error',
  'provider_secret',
  'authorization_header',
  'cookie_header',
  'screen_component_payload'
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

  if (contracts.sdkGenerationInput.status !== 'skeleton') {
    diagnostics.push({
      code: 'API_SDK_GENERATION_STATUS_INVALID',
      file: 'contracts/sdk-generation-input.yaml',
      path: 'sdk_generation_input.status',
      message:
        'SDK generation input must stay in skeleton status until real generators exist.'
    });
  }

  for (const sourceContract of REQUIRED_SDK_SOURCE_CONTRACTS) {
    if (!contracts.sdkGenerationInput.sourceContracts.includes(sourceContract)) {
      diagnostics.push({
        code: 'API_SDK_GENERATION_SOURCE_CONTRACT_MISSING',
        file: 'contracts/sdk-generation-input.yaml',
        path: 'sdk_generation_input.source_contracts',
        message: `SDK generation input must read \`${sourceContract}\`.`
      });
    }
  }

  for (const target of REQUIRED_SDK_GENERATION_TARGETS) {
    if (!contracts.sdkGenerationInput.generationTargets.includes(target)) {
      diagnostics.push({
        code: 'API_SDK_GENERATION_TARGET_MISSING',
        file: 'contracts/sdk-generation-input.yaml',
        path: 'sdk_generation_input.generation_targets',
        message: `SDK generation input must preserve the \`${target}\` target.`
      });
    }
  }

  for (const metadata of REQUIRED_SDK_ROUTE_METADATA) {
    if (!contracts.sdkGenerationInput.requiredRouteMetadata.includes(metadata)) {
      diagnostics.push({
        code: 'API_SDK_ROUTE_METADATA_MISSING',
        file: 'contracts/sdk-generation-input.yaml',
        path: 'sdk_generation_input.required_route_metadata',
        message: `SDK generation input must carry route metadata \`${metadata}\`.`
      });
    }
  }

  for (const metadata of REQUIRED_SDK_ERROR_METADATA) {
    if (!contracts.sdkGenerationInput.requiredErrorMetadata.includes(metadata)) {
      diagnostics.push({
        code: 'API_SDK_ERROR_METADATA_MISSING',
        file: 'contracts/sdk-generation-input.yaml',
        path: 'sdk_generation_input.required_error_metadata',
        message: `SDK generation input must carry error metadata \`${metadata}\`.`
      });
    }
  }

  for (const metadata of REQUIRED_SDK_WEBHOOK_METADATA) {
    if (
      !contracts.sdkGenerationInput.requiredWebhookMetadata.includes(metadata)
    ) {
      diagnostics.push({
        code: 'API_SDK_WEBHOOK_METADATA_MISSING',
        file: 'contracts/sdk-generation-input.yaml',
        path: 'sdk_generation_input.required_webhook_metadata',
        message: `SDK generation input must carry webhook metadata \`${metadata}\`.`
      });
    }
  }

  for (const ownership of FORBIDDEN_SDK_OWNERSHIP) {
    if (!contracts.sdkGenerationInput.forbiddenOwnership.includes(ownership)) {
      diagnostics.push({
        code: 'API_SDK_FORBIDDEN_OWNERSHIP_MISSING',
        file: 'contracts/sdk-generation-input.yaml',
        path: 'sdk_generation_input.forbidden_ownership',
        message: `SDK generation input must not own \`${ownership}\`.`
      });
    }
  }

  for (const value of FORBIDDEN_SDK_VALUES) {
    if (!contracts.sdkGenerationInput.forbiddenValues.includes(value)) {
      diagnostics.push({
        code: 'API_SDK_FORBIDDEN_VALUE_MISSING',
        file: 'contracts/sdk-generation-input.yaml',
        path: 'sdk_generation_input.forbidden_values',
        message: `SDK generation input must forbid \`${value}\`.`
      });
    }
  }

  return {
    ok: diagnostics.length === 0,
    diagnostics
  };
}
