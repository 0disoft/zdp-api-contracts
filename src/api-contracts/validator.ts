import type {
  ApiContractDiagnostic,
  ApiContracts,
  ApiContractValidationResult,
  ApiRouteDefinition,
  ApiSchemaBundleContract,
  ApiSchemaDefinition
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

const CANONICAL_FORBIDDEN_VALUES = [
  'raw_customer_payload',
  'raw_provider_error',
  'provider_secret',
  'authorization_header',
  'cookie_header',
  'refresh_token_plaintext',
  'stack_trace',
  'screen_component_payload'
] as const;

const FORBIDDEN_ROUTE_SHAPES = [
  ...CANONICAL_FORBIDDEN_VALUES,
  'provider_specific_id_as_primary_id',
  'raw_storage_url'
] as const;

const ALLOWED_SESSION_EFFECTS = [
  'none',
  'issue',
  'refresh',
  'revoke',
  'expire',
  'compromise'
] as const;

const REQUIRED_ERROR_FIELDS = [
  'code',
  'message',
  'request_id',
  'trace_id'
] as const;

const FORBIDDEN_ERROR_FIELDS = CANONICAL_FORBIDDEN_VALUES;

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

const FORBIDDEN_SDK_VALUES = CANONICAL_FORBIDDEN_VALUES;

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
const API_CATALOG_ACTIVE_STATUS = 'route-catalog-contract-only';

const ALLOWED_IDEMPOTENCY_POLICIES = [
  'required_idempotency_key',
  'optional_idempotency_key',
  'not_required'
] as const;

const MUTATING_METHODS_REQUIRING_IDEMPOTENCY = [
  'POST',
  'PUT',
  'PATCH',
  'DELETE'
] as const;

const REQUIRED_MUTATION_IDEMPOTENCY_POLICY = 'required_idempotency_key';

const ALLOWED_CREDENTIAL_POLICIES = [
  'no_refresh_token_plaintext_no_provider_secret_no_authorization_or_cookie_header_payload'
] as const;

const PUBLIC_AUTH_PERMISSION_CHECK = 'core.identity.public_auth_entrypoint';

const ALLOWED_OWNER_BOUNDARIES = [
  'identity',
  'money',
  'access',
  'consent',
  'audit',
  'privacy',
  'platform',
  'architecture',
  'observability'
] as const;

const ALLOWED_TENANT_BOUNDARIES = [
  'none',
  'organization',
  'workspace',
  'pending_identity_or_organization',
  'personal_account',
  'common_zdp_wallet'
] as const;

const REQUIRED_SCHEMA_BASE_REQUEST_METADATA = [
  'request_id',
  'trace_id'
] as const;

const SCHEMA_IDEMPOTENCY_METADATA = 'idempotency_key';
const REQUIRED_SCHEMA_RESPONSE_METADATA = ['request_id', 'trace_id'] as const;

const ALLOWED_SCHEMA_STATUSES = ['contract-only'] as const;
const ALLOWED_SCHEMA_KINDS = ['request', 'response'] as const;

const SESSION_EFFECT_REQUIRED_ERROR_CODES: Record<string, readonly string[]> = {
  issue: ['account_restricted'],
  refresh: ['session_expired', 'session_compromised', 'account_restricted'],
  revoke: ['session_expired', 'session_compromised']
};

const SDK_TARGET_PATTERN = /^[a-z][a-z0-9_-]*$/;
const OPERATION_ID_PATTERN = /^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/;
const SCHEMA_ID_PATTERN = /^[A-Z][A-Za-z0-9]+$/;
const SCHEMA_FIELD_PATTERN = /^[a-z][a-z0-9_]*$/;
const SCHEMA_REF_PATTERN =
  /^contracts\/apis\/[a-z0-9_-]+\/[a-z0-9_-]+\.yaml#[A-Z][A-Za-z0-9]+$/;

interface ParsedSchemaRef {
  readonly file: string;
  readonly schemaId: string;
}

interface ResolvedSchemaRef {
  readonly bundle: ApiSchemaBundleContract;
  readonly schema: ApiSchemaDefinition;
}

export function validateApiContracts(
  contracts: ApiContracts
): ApiContractValidationResult {
  const diagnostics: ApiContractDiagnostic[] = [];
  const schemaBundlesByFile = buildSchemaBundleMap(
    contracts.schemaBundles,
    diagnostics
  );

  validateRouteContract(contracts, diagnostics);
  validateErrorEnvelopeContract(contracts, diagnostics);
  validateWebhookContract(contracts, diagnostics);
  validateSdkGenerationInputContract(contracts, diagnostics);
  validateApiCatalogContract(contracts, schemaBundlesByFile, diagnostics);
  validateSchemaBundles(contracts, schemaBundlesByFile, diagnostics);

  return {
    ok: diagnostics.length === 0,
    diagnostics
  };
}

function validateRouteContract(
  contracts: ApiContracts,
  diagnostics: ApiContractDiagnostic[]
): void {
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
    if (!includesValue(ALLOWED_ROUTE_METHODS, method)) {
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
    if (!includesValue(ALLOWED_SUCCESS_STATUSES, status)) {
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
}

function validateErrorEnvelopeContract(
  contracts: ApiContracts,
  diagnostics: ApiContractDiagnostic[]
): void {
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
}

function validateWebhookContract(
  contracts: ApiContracts,
  diagnostics: ApiContractDiagnostic[]
): void {
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
}

function validateSdkGenerationInputContract(
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

function validateApiCatalogContract(
  contracts: ApiContracts,
  schemaBundlesByFile: ReadonlyMap<string, ApiSchemaBundleContract>,
  diagnostics: ApiContractDiagnostic[]
): void {
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
        'API catalog must use route-catalog-contract-only status when route definitions exist.'
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

  for (const value of CANONICAL_FORBIDDEN_VALUES) {
    if (!contracts.apiCatalog.forbiddenValues.includes(value)) {
      diagnostics.push({
        code: 'API_CATALOG_CANONICAL_FORBIDDEN_VALUE_MISSING',
        file: 'contracts/apis/catalog.yaml',
        path: 'api_catalog.forbidden_values',
        message: `API catalog must carry canonical forbidden value \`${value}\`.`
      });
    }
  }

  validateUniqueRouteKeys(contracts.apiCatalog.routes, diagnostics);

  contracts.apiCatalog.routes.forEach((route, index) => {
    validateRouteDefinition(
      route,
      index,
      contracts,
      schemaBundlesByFile,
      diagnostics
    );
  });
}

function validateRouteDefinition(
  route: ApiRouteDefinition,
  index: number,
  contracts: ApiContracts,
  schemaBundlesByFile: ReadonlyMap<string, ApiSchemaBundleContract>,
  diagnostics: ApiContractDiagnostic[]
): void {
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

  const requestSchema = validateRouteSchemaRef({
    route,
    routePath,
    ref: route.requestSchemaRef,
    field: 'request_schema_ref',
    expectedKind: 'request',
    schemaBundlesByFile,
    diagnostics
  });

  const responseSchema = validateRouteSchemaRef({
    route,
    routePath,
    ref: route.responseSchemaRef,
    field: 'response_schema_ref',
    expectedKind: 'response',
    schemaBundlesByFile,
    diagnostics
  });

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

  if (!includesValue(ALLOWED_IDEMPOTENCY_POLICIES, route.idempotency)) {
    diagnostics.push({
      code: 'API_CATALOG_ROUTE_IDEMPOTENCY_POLICY_INVALID',
      file: 'contracts/apis/catalog.yaml',
      path: `${routePath}.idempotency`,
      message: `API route \`${route.operationId}\` uses unsupported idempotency policy \`${route.idempotency}\`.`
    });
  }

  if (
    includesValue(MUTATING_METHODS_REQUIRING_IDEMPOTENCY, route.method) &&
    route.idempotency !== REQUIRED_MUTATION_IDEMPOTENCY_POLICY
  ) {
    diagnostics.push({
      code: 'API_CATALOG_ROUTE_MUTATION_IDEMPOTENCY_NOT_REQUIRED',
      file: 'contracts/apis/catalog.yaml',
      path: `${routePath}.idempotency`,
      message: `Mutating API route \`${route.operationId}\` must require idempotency keys.`
    });
  }

  if (requestSchema) {
    validateRouteRequestIdempotencyMetadata({
      route,
      routePath,
      requestSchemaBundle: requestSchema.bundle,
      diagnostics
    });
  }

  if (!includesValue(ALLOWED_CREDENTIAL_POLICIES, route.credentialPolicy)) {
    diagnostics.push({
      code: 'API_CATALOG_ROUTE_CREDENTIAL_POLICY_INVALID',
      file: 'contracts/apis/catalog.yaml',
      path: `${routePath}.credential_policy`,
      message: `API route \`${route.operationId}\` credential policy must exactly match an allowed policy.`
    });
  }

  if (!route.authRequired && route.permissionCheck !== PUBLIC_AUTH_PERMISSION_CHECK) {
    diagnostics.push({
      code: 'API_CATALOG_PUBLIC_ROUTE_PERMISSION_CHECK_INVALID',
      file: 'contracts/apis/catalog.yaml',
      path: `${routePath}.permission_check`,
      message: `Public API route \`${route.operationId}\` must use \`${PUBLIC_AUTH_PERMISSION_CHECK}\`.`
    });
  }

  if (!includesValue(ALLOWED_OWNER_BOUNDARIES, route.ownerBoundary)) {
    diagnostics.push({
      code: 'API_CATALOG_ROUTE_OWNER_BOUNDARY_INVALID',
      file: 'contracts/apis/catalog.yaml',
      path: `${routePath}.owner_boundary`,
      message: `API route \`${route.operationId}\` uses unsupported owner boundary \`${route.ownerBoundary}\`.`
    });
  }

  if (!includesValue(ALLOWED_TENANT_BOUNDARIES, route.tenantBoundary)) {
    diagnostics.push({
      code: 'API_CATALOG_ROUTE_TENANT_BOUNDARY_INVALID',
      file: 'contracts/apis/catalog.yaml',
      path: `${routePath}.tenant_boundary`,
      message: `API route \`${route.operationId}\` uses unsupported tenant boundary \`${route.tenantBoundary}\`.`
    });
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

  for (const requiredErrorCode of SESSION_EFFECT_REQUIRED_ERROR_CODES[
    route.sessionEffect
  ] ?? []) {
    if (!route.errorCodes.includes(requiredErrorCode)) {
      diagnostics.push({
        code: 'API_CATALOG_ROUTE_SESSION_ERROR_CODE_MISSING',
        file: 'contracts/apis/catalog.yaml',
        path: `${routePath}.error_codes`,
        message: `API route \`${route.operationId}\` with session effect \`${route.sessionEffect}\` must include error code \`${requiredErrorCode}\`.`
      });
    }
  }

  if (requestSchema && responseSchema) {
    validateSecretMaterialDoesNotEcho({
      route,
      routePath,
      requestSchema: requestSchema.schema,
      responseSchema: responseSchema.schema,
      diagnostics
    });
  }
}

function validateRouteSchemaRef(input: {
  readonly route: ApiRouteDefinition;
  readonly routePath: string;
  readonly ref: string;
  readonly field: 'request_schema_ref' | 'response_schema_ref';
  readonly expectedKind: 'request' | 'response';
  readonly schemaBundlesByFile: ReadonlyMap<string, ApiSchemaBundleContract>;
  readonly diagnostics: ApiContractDiagnostic[];
}): ResolvedSchemaRef | null {
  const parsed = parseSchemaRef(input.ref);

  if (!parsed) {
    input.diagnostics.push({
      code: 'API_CATALOG_ROUTE_SCHEMA_REF_INVALID',
      file: 'contracts/apis/catalog.yaml',
      path: `${input.routePath}.${input.field}`,
      message: `API route \`${input.route.operationId}\` ${input.field} must point to contracts/apis/<service>/<schema>.yaml#PascalCaseSchema.`
    });
    return null;
  }

  const bundle = input.schemaBundlesByFile.get(parsed.file);
  if (!bundle) {
    input.diagnostics.push({
      code: 'API_CATALOG_ROUTE_SCHEMA_BUNDLE_MISSING',
      file: 'contracts/apis/catalog.yaml',
      path: `${input.routePath}.${input.field}`,
      message: `API route \`${input.route.operationId}\` references schema bundle \`${parsed.file}\`, but that bundle was not loaded.`
    });
    return null;
  }

  const schema = bundle.schemas.find((candidate) => candidate.id === parsed.schemaId);
  if (!schema) {
    input.diagnostics.push({
      code: 'API_CATALOG_ROUTE_SCHEMA_ID_MISSING',
      file: 'contracts/apis/catalog.yaml',
      path: `${input.routePath}.${input.field}`,
      message: `API route \`${input.route.operationId}\` references missing schema \`${parsed.schemaId}\` in \`${parsed.file}\`.`
    });
    return null;
  }

  if (bundle.serviceId !== input.route.serviceId) {
    input.diagnostics.push({
      code: 'API_CATALOG_ROUTE_SCHEMA_SERVICE_MISMATCH',
      file: 'contracts/apis/catalog.yaml',
      path: `${input.routePath}.${input.field}`,
      message: `API route \`${input.route.operationId}\` service_id must match schema bundle service_id \`${bundle.serviceId}\`.`
    });
  }

  if (bundle.ownerBoundary !== input.route.ownerBoundary) {
    input.diagnostics.push({
      code: 'API_CATALOG_ROUTE_SCHEMA_OWNER_BOUNDARY_MISMATCH',
      file: 'contracts/apis/catalog.yaml',
      path: `${input.routePath}.${input.field}`,
      message: `API route \`${input.route.operationId}\` owner_boundary must match schema bundle owner_boundary \`${bundle.ownerBoundary}\`.`
    });
  }

  if (schema.kind !== input.expectedKind) {
    input.diagnostics.push({
      code: 'API_CATALOG_ROUTE_SCHEMA_KIND_MISMATCH',
      file: 'contracts/apis/catalog.yaml',
      path: `${input.routePath}.${input.field}`,
      message: `API route \`${input.route.operationId}\` ${input.field} must reference a ${input.expectedKind} schema.`
    });
  }

  if (
    input.expectedKind === 'response' &&
    schema.sessionEffect !== input.route.sessionEffect
  ) {
    input.diagnostics.push({
      code: 'API_CATALOG_ROUTE_SCHEMA_SESSION_EFFECT_MISMATCH',
      file: 'contracts/apis/catalog.yaml',
      path: `${input.routePath}.${input.field}`,
      message: `API route \`${input.route.operationId}\` session_effect must match response schema session_effect.`
    });
  }

  return { bundle, schema };
}

function validateRouteRequestIdempotencyMetadata(input: {
  readonly route: ApiRouteDefinition;
  readonly routePath: string;
  readonly requestSchemaBundle: ApiSchemaBundleContract;
  readonly diagnostics: ApiContractDiagnostic[];
}): void {
  const requiresIdempotency =
    input.route.idempotency === REQUIRED_MUTATION_IDEMPOTENCY_POLICY;
  const schemaRequiresIdempotency =
    input.requestSchemaBundle.commonEnvelope.requiredRequestMetadata.includes(
      SCHEMA_IDEMPOTENCY_METADATA
    );

  if (requiresIdempotency && !schemaRequiresIdempotency) {
    input.diagnostics.push({
      code: 'API_CATALOG_ROUTE_IDEMPOTENCY_METADATA_MISSING',
      file: 'contracts/apis/catalog.yaml',
      path: `${input.routePath}.request_schema_ref`,
      message: `API route \`${input.route.operationId}\` requires idempotency, so its request schema bundle must require \`${SCHEMA_IDEMPOTENCY_METADATA}\`.`
    });
  }

  if (!requiresIdempotency && schemaRequiresIdempotency) {
    input.diagnostics.push({
      code: 'API_CATALOG_ROUTE_IDEMPOTENCY_METADATA_UNEXPECTED',
      file: 'contracts/apis/catalog.yaml',
      path: `${input.routePath}.request_schema_ref`,
      message: `API route \`${input.route.operationId}\` does not require idempotency, so its request schema bundle must not require \`${SCHEMA_IDEMPOTENCY_METADATA}\`.`
    });
  }
}

function validateSecretMaterialDoesNotEcho(input: {
  readonly route: ApiRouteDefinition;
  readonly routePath: string;
  readonly requestSchema: ApiSchemaDefinition;
  readonly responseSchema: ApiSchemaDefinition;
  readonly diagnostics: ApiContractDiagnostic[];
}): void {
  if (!input.requestSchema.carriesSecretMaterial) {
    return;
  }

  for (const secretField of input.requestSchema.secretFields) {
    if (input.responseSchema.requiredFields.includes(secretField)) {
      input.diagnostics.push({
        code: 'API_CATALOG_ROUTE_SECRET_FIELD_ECHOED',
        file: 'contracts/apis/catalog.yaml',
        path: `${input.routePath}.response_schema_ref`,
        message: `API route \`${input.route.operationId}\` response schema must not echo secret request field \`${secretField}\`.`
      });
    }
  }
}

function validateSchemaBundles(
  contracts: ApiContracts,
  schemaBundlesByFile: ReadonlyMap<string, ApiSchemaBundleContract>,
  diagnostics: ApiContractDiagnostic[]
): void {
  for (const schemaBundle of contracts.schemaBundles) {
    validateSchemaBundle(schemaBundle, diagnostics);
  }

  const referencedFiles = new Set(
    contracts.apiCatalog.routes.flatMap((route) => [
      parseSchemaRef(route.requestSchemaRef)?.file,
      parseSchemaRef(route.responseSchemaRef)?.file
    ])
  );

  for (const file of referencedFiles) {
    if (file && !schemaBundlesByFile.has(file)) {
      diagnostics.push({
        code: 'API_SCHEMA_BUNDLE_REFERENCED_FILE_NOT_LOADED',
        file,
        path: 'schema_bundle',
        message: `Referenced schema bundle \`${file}\` must be loaded before validation.`
      });
    }
  }
}

function validateSchemaBundle(
  schemaBundle: ApiSchemaBundleContract,
  diagnostics: ApiContractDiagnostic[]
): void {
  if (!includesValue(ALLOWED_SCHEMA_STATUSES, schemaBundle.status)) {
    diagnostics.push({
      code: 'API_SCHEMA_BUNDLE_STATUS_INVALID',
      file: schemaBundle.file,
      path: 'schema_bundle.status',
      message: `Schema bundle \`${schemaBundle.file}\` must use contract-only status.`
    });
  }

  if (!includesValue(ALLOWED_OWNER_BOUNDARIES, schemaBundle.ownerBoundary)) {
    diagnostics.push({
      code: 'API_SCHEMA_BUNDLE_OWNER_BOUNDARY_INVALID',
      file: schemaBundle.file,
      path: 'schema_bundle.owner_boundary',
      message: `Schema bundle \`${schemaBundle.file}\` uses unsupported owner boundary \`${schemaBundle.ownerBoundary}\`.`
    });
  }

  for (const metadata of REQUIRED_SCHEMA_BASE_REQUEST_METADATA) {
    if (!schemaBundle.commonEnvelope.requiredRequestMetadata.includes(metadata)) {
      diagnostics.push({
        code: 'API_SCHEMA_BUNDLE_REQUEST_METADATA_MISSING',
        file: schemaBundle.file,
        path: 'schema_bundle.common_envelope.required_request_metadata',
        message: `Schema bundle \`${schemaBundle.file}\` must require request metadata \`${metadata}\`.`
      });
    }
  }

  for (const metadata of REQUIRED_SCHEMA_RESPONSE_METADATA) {
    if (!schemaBundle.commonEnvelope.requiredResponseMetadata.includes(metadata)) {
      diagnostics.push({
        code: 'API_SCHEMA_BUNDLE_RESPONSE_METADATA_MISSING',
        file: schemaBundle.file,
        path: 'schema_bundle.common_envelope.required_response_metadata',
        message: `Schema bundle \`${schemaBundle.file}\` must require response metadata \`${metadata}\`.`
      });
    }
  }

  for (const value of CANONICAL_FORBIDDEN_VALUES) {
    if (!schemaBundle.commonEnvelope.forbiddenPayloadValues.includes(value)) {
      diagnostics.push({
        code: 'API_SCHEMA_BUNDLE_FORBIDDEN_VALUE_MISSING',
        file: schemaBundle.file,
        path: 'schema_bundle.common_envelope.forbidden_payload_values',
        message: `Schema bundle \`${schemaBundle.file}\` must forbid \`${value}\`.`
      });
    }
  }

  if (schemaBundle.schemas.length === 0) {
    diagnostics.push({
      code: 'API_SCHEMA_BUNDLE_EMPTY',
      file: schemaBundle.file,
      path: 'schema_bundle.schemas',
      message: `Schema bundle \`${schemaBundle.file}\` must define at least one schema.`
    });
    return;
  }

  validateUniqueSchemaIds(schemaBundle, diagnostics);

  schemaBundle.schemas.forEach((schema, index) => {
    validateSchemaDefinition(schemaBundle, schema, index, diagnostics);
  });
}

function validateSchemaDefinition(
  schemaBundle: ApiSchemaBundleContract,
  schema: ApiSchemaDefinition,
  index: number,
  diagnostics: ApiContractDiagnostic[]
): void {
  const path = `schema_bundle.schemas[${index}]`;

  if (!SCHEMA_ID_PATTERN.test(schema.id)) {
    diagnostics.push({
      code: 'API_SCHEMA_ID_INVALID',
      file: schemaBundle.file,
      path: `${path}.id`,
      message: `Schema id \`${schema.id}\` must be PascalCase.`
    });
  }

  if (!includesValue(ALLOWED_SCHEMA_KINDS, schema.kind)) {
    diagnostics.push({
      code: 'API_SCHEMA_KIND_INVALID',
      file: schemaBundle.file,
      path: `${path}.kind`,
      message: `Schema \`${schema.id}\` uses unsupported kind \`${schema.kind}\`.`
    });
  }

  if (schema.kind === 'request' && schema.sessionEffect !== null) {
    diagnostics.push({
      code: 'API_SCHEMA_REQUEST_SESSION_EFFECT_DECLARED',
      file: schemaBundle.file,
      path: `${path}.session_effect`,
      message: `Request schema \`${schema.id}\` must not declare session_effect.`
    });
  }

  if (schema.kind === 'response' && schema.sessionEffect === null) {
    diagnostics.push({
      code: 'API_SCHEMA_RESPONSE_SESSION_EFFECT_MISSING',
      file: schemaBundle.file,
      path: `${path}.session_effect`,
      message: `Response schema \`${schema.id}\` must declare session_effect.`
    });
  }

  if (
    schema.sessionEffect !== null &&
    !includesValue(ALLOWED_SESSION_EFFECTS, schema.sessionEffect)
  ) {
    diagnostics.push({
      code: 'API_SCHEMA_SESSION_EFFECT_INVALID',
      file: schemaBundle.file,
      path: `${path}.session_effect`,
      message: `Schema \`${schema.id}\` uses unsupported session_effect \`${schema.sessionEffect}\`.`
    });
  }

  for (const field of schema.requiredFields) {
    if (!SCHEMA_FIELD_PATTERN.test(field)) {
      diagnostics.push({
        code: 'API_SCHEMA_REQUIRED_FIELD_INVALID',
        file: schemaBundle.file,
        path: `${path}.required_fields`,
        message: `Schema \`${schema.id}\` required field \`${field}\` must be snake_case.`
      });
    }
  }

  if (schema.carriesSecretMaterial) {
    if (schema.kind !== 'request') {
      diagnostics.push({
        code: 'API_SCHEMA_SECRET_MATERIAL_ON_NON_REQUEST',
        file: schemaBundle.file,
        path: `${path}.carries_secret_material`,
        message: `Only request schemas may carry secret material.`
      });
    }

    if (
      schema.secretMaterialPolicy === null ||
      !isSecretMaterialPolicySafe(schema.secretMaterialPolicy)
    ) {
      diagnostics.push({
        code: 'API_SCHEMA_SECRET_MATERIAL_POLICY_INVALID',
        file: schemaBundle.file,
        path: `${path}.secret_material_policy`,
        message: `Secret-carrying schema \`${schema.id}\` must declare a non-echoing secret material policy.`
      });
    }

    if (schema.secretFields.length === 0) {
      diagnostics.push({
        code: 'API_SCHEMA_SECRET_FIELDS_MISSING',
        file: schemaBundle.file,
        path: `${path}.secret_fields`,
        message: `Secret-carrying schema \`${schema.id}\` must declare secret_fields.`
      });
    }

    for (const secretField of schema.secretFields) {
      if (!schema.requiredFields.includes(secretField)) {
        diagnostics.push({
          code: 'API_SCHEMA_SECRET_FIELD_NOT_REQUIRED',
          file: schemaBundle.file,
          path: `${path}.secret_fields`,
          message: `Secret field \`${secretField}\` must also be listed in required_fields for schema \`${schema.id}\`.`
        });
      }
    }
  } else if (schema.secretFields.length > 0) {
    diagnostics.push({
      code: 'API_SCHEMA_SECRET_FIELDS_ON_NON_SECRET_SCHEMA',
      file: schemaBundle.file,
      path: `${path}.secret_fields`,
      message: `Schema \`${schema.id}\` must not declare secret_fields unless carries_secret_material is true.`
    });
  }
}

function buildSchemaBundleMap(
  schemaBundles: readonly ApiSchemaBundleContract[],
  diagnostics: ApiContractDiagnostic[]
): ReadonlyMap<string, ApiSchemaBundleContract> {
  const schemaBundlesByFile = new Map<string, ApiSchemaBundleContract>();

  schemaBundles.forEach((schemaBundle) => {
    if (schemaBundlesByFile.has(schemaBundle.file)) {
      diagnostics.push({
        code: 'API_SCHEMA_BUNDLE_FILE_DUPLICATE',
        file: schemaBundle.file,
        path: 'schema_bundle',
        message: `Schema bundle file \`${schemaBundle.file}\` must be loaded only once.`
      });
      return;
    }

    schemaBundlesByFile.set(schemaBundle.file, schemaBundle);
  });

  return schemaBundlesByFile;
}

function validateUniqueRouteKeys(
  routes: readonly ApiRouteDefinition[],
  diagnostics: ApiContractDiagnostic[]
): void {
  const seenOperationIds = new Map<string, number>();
  const seenMethodPaths = new Map<string, number>();

  routes.forEach((route, index) => {
    const operationIndex = seenOperationIds.get(route.operationId);
    if (operationIndex !== undefined) {
      diagnostics.push({
        code: 'API_CATALOG_ROUTE_OPERATION_ID_DUPLICATE',
        file: 'contracts/apis/catalog.yaml',
        path: `routes[${index}].operation_id`,
        message: `API route operation_id \`${route.operationId}\` duplicates routes[${operationIndex}].`
      });
    } else {
      seenOperationIds.set(route.operationId, index);
    }

    const methodPath = `${route.method} ${route.path}`;
    const methodPathIndex = seenMethodPaths.get(methodPath);
    if (methodPathIndex !== undefined) {
      diagnostics.push({
        code: 'API_CATALOG_ROUTE_METHOD_PATH_DUPLICATE',
        file: 'contracts/apis/catalog.yaml',
        path: `routes[${index}].path`,
        message: `API route method/path \`${methodPath}\` duplicates routes[${methodPathIndex}].`
      });
    } else {
      seenMethodPaths.set(methodPath, index);
    }
  });
}

function validateUniqueSchemaIds(
  schemaBundle: ApiSchemaBundleContract,
  diagnostics: ApiContractDiagnostic[]
): void {
  const seenSchemaIds = new Map<string, number>();

  schemaBundle.schemas.forEach((schema, index) => {
    const previousIndex = seenSchemaIds.get(schema.id);
    if (previousIndex !== undefined) {
      diagnostics.push({
        code: 'API_SCHEMA_ID_DUPLICATE',
        file: schemaBundle.file,
        path: `schema_bundle.schemas[${index}].id`,
        message: `Schema id \`${schema.id}\` duplicates schema_bundle.schemas[${previousIndex}].`
      });
    } else {
      seenSchemaIds.set(schema.id, index);
    }
  });
}

function parseSchemaRef(ref: string): ParsedSchemaRef | null {
  if (!SCHEMA_REF_PATTERN.test(ref)) {
    return null;
  }

  const [file, schemaId] = ref.split('#');
  if (!file || !schemaId) {
    return null;
  }

  return { file, schemaId };
}

function isSecretMaterialPolicySafe(policy: string): boolean {
  return policy.includes('never_echo') || policy.includes('never_store_plaintext');
}

function includesValue<T extends string | number>(
  values: readonly T[],
  value: string | number
): value is T {
  return (values as readonly (string | number)[]).includes(value);
}
