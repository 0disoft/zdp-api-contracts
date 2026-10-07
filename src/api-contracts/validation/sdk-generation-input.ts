import type { ApiContractDiagnostic, ApiContracts } from '../types.js';

import { CANONICAL_FORBIDDEN_VALUES } from '../forbidden-values.js';

export const REQUIRED_SDK_SOURCE_CONTRACTS = [
  'contracts/route-contract.yaml',
  'contracts/error-envelope.yaml',
  'contracts/webhook-contract.yaml',
  'contracts/sdk-generation-input.yaml',
  'contracts/apis/catalog.yaml'
] as const;

export const REQUIRED_SDK_GENERATION_TARGETS = ['typescript', 'dart', 'rust'] as const;

export const REQUIRED_SDK_ROUTE_METADATA = [
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
  'success_statuses',
  'owner_boundary',
  'tenant_boundary',
  'request_id_required',
  'trace_id_required',
  'session_effect',
  'credential_policy',
  'error_codes'
] as const;

export const REQUIRED_SDK_ERROR_METADATA = [
  'code',
  'message',
  'request_id',
  'trace_id',
  'retry_after_seconds',
  'documentation_url'
] as const;

export const REQUIRED_SDK_CLIENT_RUNTIME_METADATA = [
  'typed_fetch_operation_map',
  'standard_error_envelope_normalization',
  'request_id_propagation',
  'trace_id_propagation',
  'timeout_ms_option',
  'abort_signal_option',
  'idempotency_key_required_for_mutations',
  'no_content_response_body_handling'
] as const;

export const REQUIRED_SDK_WEBHOOK_METADATA = [
  'event_id',
  'event_type',
  'schema_version',
  'signature_verification',
  'idempotency_key',
  'replay_policy',
  'dead_letter_policy'
] as const;

export const FORBIDDEN_SDK_OWNERSHIP = [
  'generated_sdk_source',
  'sdk_runtime_implementation',
  'product_business_logic',
  'refresh_token_storage',
  'final_authorization_decision',
  'provider_credential_storage'
] as const;

export const FORBIDDEN_SDK_VALUES = CANONICAL_FORBIDDEN_VALUES;

export const SDK_TARGET_PATTERN = /^[a-z][a-z0-9_-]*$/;

export function validateSdkGenerationInputContract(
  contracts: ApiContracts,
  diagnostics: ApiContractDiagnostic[]
): void {
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

  for (const schemaBundle of contracts.schemaBundles) {
    if (!contracts.sdkGenerationInput.sourceContracts.includes(schemaBundle.file)) {
      diagnostics.push({
        code: 'API_SDK_GENERATION_SCHEMA_BUNDLE_SOURCE_MISSING',
        file: 'contracts/sdk-generation-input.yaml',
        path: 'sdk_generation_input.source_contracts',
        message: `SDK generation input must read schema bundle \`${schemaBundle.file}\`.`
      });
    }
  }

  for (const target of contracts.sdkGenerationInput.allowedGenerationTargets) {
    if (!SDK_TARGET_PATTERN.test(target)) {
      diagnostics.push({
        code: 'API_SDK_ALLOWED_GENERATION_TARGET_INVALID',
        file: 'contracts/sdk-generation-input.yaml',
        path: 'sdk_generation_input.allowed_generation_targets',
        message: `SDK generation target \`${target}\` must be a stable lowercase identifier.`
      });
    }
  }

  for (const target of REQUIRED_SDK_GENERATION_TARGETS) {
    if (!contracts.sdkGenerationInput.generationTargets.includes(target)) {
      diagnostics.push({
        code: 'API_SDK_GENERATION_TARGET_MISSING',
        file: 'contracts/sdk-generation-input.yaml',
        path: 'sdk_generation_input.generation_targets',
        message: `SDK generation input must keep required target \`${target}\` active.`
      });
    }
  }

  for (const target of contracts.sdkGenerationInput.generationTargets) {
    if (!contracts.sdkGenerationInput.allowedGenerationTargets.includes(target)) {
      diagnostics.push({
        code: 'API_SDK_GENERATION_TARGET_INVALID',
        file: 'contracts/sdk-generation-input.yaml',
        path: 'sdk_generation_input.generation_targets',
        message: `SDK generation target \`${target}\` must be declared in allowed_generation_targets.`
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

  for (const metadata of REQUIRED_SDK_CLIENT_RUNTIME_METADATA) {
    if (
      !contracts.sdkGenerationInput.requiredClientRuntimeMetadata.includes(
        metadata
      )
    ) {
      diagnostics.push({
        code: 'API_SDK_CLIENT_RUNTIME_METADATA_MISSING',
        file: 'contracts/sdk-generation-input.yaml',
        path: 'sdk_generation_input.required_client_runtime_metadata',
        message:
          `SDK generation input must carry client runtime metadata ` +
          `\`${metadata}\`.`
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
}
