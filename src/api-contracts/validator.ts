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
  'success_statuses',
  'auth_required',
  'permission_check',
  'audit_event',
  'idempotency',
  'owner_boundary',
  'tenant_boundary',
  'request_id_required',
  'trace_id_required',
  'session_effect',
  'credential_policy',
  'error_codes'
] as const;

const ALLOWED_ROUTE_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;

const ALLOWED_SUCCESS_STATUSES = [200, 201, 202, 204] as const;

const FORBIDDEN_ROUTE_SHAPES = [
  'screen_component_payload',
  'provider_specific_id_as_primary_id',
  'raw_storage_url',
  'authorization_header_payload',
  'cookie_header_payload',
  'refresh_token_plaintext'
] as const;

const ALLOWED_SESSION_EFFECTS = [
  'none',
  'issue',
  'refresh',
  'revoke'
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
  'contracts/webhook-contract.yaml',
  'contracts/sdk-generation-input.yaml',
  'contracts/apis/catalog.yaml'
] as const;

const REQUIRED_SDK_GENERATION_TARGETS = ['typescript', 'dart', 'rust'] as const;

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
  'success_statuses',
  'owner_boundary',
  'tenant_boundary',
  'request_id_required',
  'trace_id_required',
  'session_effect',
  'credential_policy',
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

const API_CATALOG_REQUIRED_ROUTE_FIELDS = [
  'operation_id',
  'service_id',
  'resource',
  'action',
  'method',
  'path',
  'success_statuses',
  'request_schema_ref',
  'response_schema_ref',
  'auth_required',
  'permission_check',
  'audit_event',
  'idempotency',
  'owner_boundary',
  'tenant_boundary',
  'request_id_required',
  'trace_id_required',
  'session_effect',
  'credential_policy',
  'error_codes'
] as const;

const API_CATALOG_EMPTY_STATUS = 'empty-until-service-routes-exist';
const API_CATALOG_ACTIVE_STATUS = 'route-catalog-active';

const SDK_TARGET_PATTERN = /^[a-z][a-z0-9_-]*$/;
const OPERATION_ID_PATTERN = /^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/;
const SCHEMA_REF_PATTERN =
  /^contracts\/apis\/[a-z0-9_-]+\/[a-z0-9_-]+\.yaml#[A-Z][A-Za-z0-9]+$/;
const REQUIRED_CREDENTIAL_POLICY_PARTS = [
  'no_refresh_token_plaintext',
  'no_provider_secret',
  'no_authorization_or_cookie_header_payload'
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

  for (const method of ALLOWED_ROUTE_METHODS) {
    if (!contracts.route.allowedMethods.includes(method)) {
      diagnostics.push({
        code: 'API_ROUTE_ALLOWED_METHOD_MISSING',
        file: 'contracts/route-contract.yaml',
        path: 'route_contract.allowed_methods',
        message: `Route contract must allow standard method \`${method}\`.`
      });
    }
  }

  for (const method of contracts.route.allowedMethods) {
    if (!isAllowedRouteMethod(method)) {
      diagnostics.push({
        code: 'API_ROUTE_ALLOWED_METHOD_INVALID',
        file: 'contracts/route-contract.yaml',
        path: 'route_contract.allowed_methods',
        message: `Route contract must not allow non-standard method \`${method}\`.`
      });
    }
  }

  for (const status of ALLOWED_SUCCESS_STATUSES) {
    if (!contracts.route.allowedSuccessStatuses.includes(status)) {
      diagnostics.push({
        code: 'API_ROUTE_ALLOWED_SUCCESS_STATUS_MISSING',
        file: 'contracts/route-contract.yaml',
        path: 'route_contract.allowed_success_statuses',
        message: `Route contract must allow success status \`${status}\`.`
      });
    }
  }

  for (const status of contracts.route.allowedSuccessStatuses) {
    if (!isAllowedSuccessStatus(status)) {
      diagnostics.push({
        code: 'API_ROUTE_ALLOWED_SUCCESS_STATUS_INVALID',
        file: 'contracts/route-contract.yaml',
        path: 'route_contract.allowed_success_statuses',
        message: `Route contract must not allow ambiguous success status \`${status}\`.`
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

  for (const effect of ALLOWED_SESSION_EFFECTS) {
    if (!contracts.route.allowedSessionEffects.includes(effect)) {
      diagnostics.push({
        code: 'API_ROUTE_ALLOWED_SESSION_EFFECT_MISSING',
        file: 'contracts/route-contract.yaml',
        path: 'route_contract.allowed_session_effects',
        message: `Route contract must allow session effect \`${effect}\`.`
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

  if (
    contracts.apiCatalog.routes.length === 0 &&
    contracts.apiCatalog.status !== API_CATALOG_EMPTY_STATUS
  ) {
    diagnostics.push({
      code: 'API_CATALOG_STATUS_INVALID',
      file: 'contracts/apis/catalog.yaml',
      path: 'api_catalog.status',
      message:
        'API catalog must stay empty-until-service-routes-exist while routes is empty.'
    });
  }

  if (
    contracts.apiCatalog.routes.length > 0 &&
    contracts.apiCatalog.status !== API_CATALOG_ACTIVE_STATUS
  ) {
    diagnostics.push({
      code: 'API_CATALOG_STATUS_INVALID',
      file: 'contracts/apis/catalog.yaml',
      path: 'api_catalog.status',
      message:
        'API catalog must use route-catalog-active status when route definitions exist.'
    });
  }

  for (const field of API_CATALOG_REQUIRED_ROUTE_FIELDS) {
    if (!contracts.apiCatalog.routeDefinitionRequiredFields.includes(field)) {
      diagnostics.push({
        code: 'API_CATALOG_ROUTE_FIELD_MISSING',
        file: 'contracts/apis/catalog.yaml',
        path: 'api_catalog.route_definition_required_fields',
        message: `API catalog route definitions must require \`${field}\`.`
      });
    }
  }

  for (const field of contracts.route.requiredPerRoute) {
    if (!contracts.apiCatalog.routeDefinitionRequiredFields.includes(field)) {
      diagnostics.push({
        code: 'API_CATALOG_ROUTE_CONTRACT_FIELD_MISSING',
        file: 'contracts/apis/catalog.yaml',
        path: 'api_catalog.route_definition_required_fields',
        message: `API catalog route definitions must mirror route contract field \`${field}\`.`
      });
    }
  }

  for (const metadata of contracts.sdkGenerationInput.requiredRouteMetadata) {
    if (!contracts.apiCatalog.routeDefinitionRequiredFields.includes(metadata)) {
      diagnostics.push({
        code: 'API_CATALOG_SDK_ROUTE_METADATA_MISSING',
        file: 'contracts/apis/catalog.yaml',
        path: 'api_catalog.route_definition_required_fields',
        message: `API catalog route definitions must carry SDK route metadata \`${metadata}\`.`
      });
    }
  }

  for (const value of contracts.sdkGenerationInput.forbiddenValues) {
    if (!contracts.apiCatalog.forbiddenValues.includes(value)) {
      diagnostics.push({
        code: 'API_CATALOG_FORBIDDEN_VALUE_MISSING',
        file: 'contracts/apis/catalog.yaml',
        path: 'api_catalog.forbidden_values',
        message: `API catalog must forbid \`${value}\`.`
      });
    }
  }

  contracts.apiCatalog.routes.forEach((route, index) => {
    const routePath = `routes[${index}]`;

    if (!OPERATION_ID_PATTERN.test(route.operationId)) {
      diagnostics.push({
        code: 'API_CATALOG_ROUTE_OPERATION_ID_INVALID',
        file: 'contracts/apis/catalog.yaml',
        path: `${routePath}.operation_id`,
        message: `API route operation_id \`${route.operationId}\` must be a stable lowercase identifier.`
      });
    }

    if (!contracts.route.allowedMethods.includes(route.method)) {
      diagnostics.push({
        code: 'API_CATALOG_ROUTE_METHOD_INVALID',
        file: 'contracts/apis/catalog.yaml',
        path: `${routePath}.method`,
        message: `API route \`${route.operationId}\` uses unsupported method \`${route.method}\`.`
      });
    }

    if (!route.path.startsWith('/')) {
      diagnostics.push({
        code: 'API_CATALOG_ROUTE_PATH_INVALID',
        file: 'contracts/apis/catalog.yaml',
        path: `${routePath}.path`,
        message: `API route \`${route.operationId}\` path must start with \`/\`.`
      });
    }

    if (!SCHEMA_REF_PATTERN.test(route.requestSchemaRef)) {
      diagnostics.push({
        code: 'API_CATALOG_ROUTE_SCHEMA_REF_INVALID',
        file: 'contracts/apis/catalog.yaml',
        path: `${routePath}.request_schema_ref`,
        message: `API route \`${route.operationId}\` request schema ref must point to contracts/apis/<service>/<schema>.yaml#PascalCaseSchema.`
      });
    }

    if (!SCHEMA_REF_PATTERN.test(route.responseSchemaRef)) {
      diagnostics.push({
        code: 'API_CATALOG_ROUTE_SCHEMA_REF_INVALID',
        file: 'contracts/apis/catalog.yaml',
        path: `${routePath}.response_schema_ref`,
        message: `API route \`${route.operationId}\` response schema ref must point to contracts/apis/<service>/<schema>.yaml#PascalCaseSchema.`
      });
    }

    if (!route.requestIdRequired) {
      diagnostics.push({
        code: 'API_CATALOG_ROUTE_REQUEST_ID_NOT_REQUIRED',
        file: 'contracts/apis/catalog.yaml',
        path: `${routePath}.request_id_required`,
        message: `API route \`${route.operationId}\` must require request_id propagation.`
      });
    }

    if (!route.traceIdRequired) {
      diagnostics.push({
        code: 'API_CATALOG_ROUTE_TRACE_ID_NOT_REQUIRED',
        file: 'contracts/apis/catalog.yaml',
        path: `${routePath}.trace_id_required`,
        message: `API route \`${route.operationId}\` must require trace_id propagation.`
      });
    }

    if (!contracts.route.allowedSessionEffects.includes(route.sessionEffect)) {
      diagnostics.push({
        code: 'API_CATALOG_ROUTE_SESSION_EFFECT_INVALID',
        file: 'contracts/apis/catalog.yaml',
        path: `${routePath}.session_effect`,
        message: `API route \`${route.operationId}\` uses unsupported session effect \`${route.sessionEffect}\`.`
      });
    }

    for (const policyPart of REQUIRED_CREDENTIAL_POLICY_PARTS) {
      if (!route.credentialPolicy.includes(policyPart)) {
        diagnostics.push({
          code: 'API_CATALOG_ROUTE_CREDENTIAL_POLICY_INCOMPLETE',
          file: 'contracts/apis/catalog.yaml',
          path: `${routePath}.credential_policy`,
          message: `API route \`${route.operationId}\` credential policy must include \`${policyPart}\`.`
        });
      }
    }

    for (const status of route.successStatuses) {
      if (!contracts.route.allowedSuccessStatuses.includes(status)) {
        diagnostics.push({
          code: 'API_CATALOG_ROUTE_SUCCESS_STATUS_INVALID',
          file: 'contracts/apis/catalog.yaml',
          path: `${routePath}.success_statuses`,
          message: `API route \`${route.operationId}\` uses unsupported success status \`${status}\`.`
        });
      }
    }
  });

  return {
    ok: diagnostics.length === 0,
    diagnostics
  };
}

function isAllowedRouteMethod(
  method: string
): method is (typeof ALLOWED_ROUTE_METHODS)[number] {
  return ALLOWED_ROUTE_METHODS.includes(
    method as (typeof ALLOWED_ROUTE_METHODS)[number]
  );
}

function isAllowedSuccessStatus(
  status: number
): status is (typeof ALLOWED_SUCCESS_STATUSES)[number] {
  return ALLOWED_SUCCESS_STATUSES.includes(
    status as (typeof ALLOWED_SUCCESS_STATUSES)[number]
  );
}
