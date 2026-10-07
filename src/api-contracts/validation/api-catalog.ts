import type { ApiContractDiagnostic, ApiContracts, ApiRouteDefinition, ApiSchemaBundleContract, ApiSchemaDefinition } from '../types.js';

import { CANONICAL_FORBIDDEN_VALUES } from '../forbidden-values.js';

import { ALLOWED_OWNER_BOUNDARIES, includesValue, parseSchemaRef } from './shared.js';

export const API_CATALOG_REQUIRED_ROUTE_FIELDS = [
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

export const API_CATALOG_EMPTY_STATUS = 'empty-until-service-routes-exist';

export const API_CATALOG_ACTIVE_STATUS = 'route-catalog-contract-only';

export const ALLOWED_IDEMPOTENCY_POLICIES = [
  'required_idempotency_key',
  'optional_idempotency_key',
  'not_required'
] as const;

export const MUTATING_METHODS_REQUIRING_IDEMPOTENCY = [
  'POST',
  'PUT',
  'PATCH',
  'DELETE'
] as const;

export const REQUIRED_MUTATION_IDEMPOTENCY_POLICY = 'required_idempotency_key';

export const ALLOWED_CREDENTIAL_POLICIES = [
  'no_refresh_token_plaintext_no_provider_secret_no_authorization_or_cookie_header_payload'
] as const;

export const REQUIRED_CREDENTIAL_POLICY_PARTS = [
  'no_refresh_token_plaintext',
  'no_provider_secret',
  'no_authorization_or_cookie_header_payload'
] as const;

export const PUBLIC_PERMISSION_CHECKS = [
  'core.identity.public_auth_entrypoint',
  'core.consent.public_policy_resolution',
  'platform.abuse.public_challenge_entrypoint',
  'platform.support.public_case_create',
  'platform.support.public_reply_address_verify'
] as const;

export const ALLOWED_TENANT_BOUNDARIES = [
  'none',
  'organization',
  'workspace',
  'pending_identity_or_organization',
  'personal_account',
  'common_zdp_wallet',
  'core_resolved_scope'
] as const;

export const SCHEMA_IDEMPOTENCY_METADATA = 'idempotency_key';

export const SESSION_EFFECT_REQUIRED_ERROR_CODES: Record<string, readonly string[]> = {
  issue: ['account_restricted'],
  refresh: ['session_expired', 'session_compromised', 'account_restricted'],
  revoke: ['session_expired', 'session_compromised']
};

export const OPERATION_ID_PATTERN = /^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/;

export interface ResolvedSchemaRef {
  readonly bundle: ApiSchemaBundleContract;
  readonly schema: ApiSchemaDefinition;
}

export function validateApiCatalogContract(
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

export function validateRouteDefinition(
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

  const responseSchema =
    route.responseSchemaRef === null
      ? null
      : validateRouteSchemaRef({
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
    route.idempotency !== REQUIRED_MUTATION_IDEMPOTENCY_POLICY &&
    !isSingleUsePasskeyLoginRoute(route)
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
    if (
      REQUIRED_CREDENTIAL_POLICY_PARTS.some(
        (part) => !route.credentialPolicy.includes(part)
      )
    ) {
      diagnostics.push({
        code: 'API_CATALOG_ROUTE_CREDENTIAL_POLICY_INCOMPLETE',
        file: 'contracts/apis/catalog.yaml',
        path: `${routePath}.credential_policy`,
        message: `API route \`${route.operationId}\` credential policy must name every required secret-exclusion part.`
      });
    }

    diagnostics.push({
      code: 'API_CATALOG_ROUTE_CREDENTIAL_POLICY_INVALID',
      file: 'contracts/apis/catalog.yaml',
      path: `${routePath}.credential_policy`,
      message: `API route \`${route.operationId}\` credential policy must exactly match an allowed policy.`
    });
  }

  if (!route.authRequired && !includesValue(PUBLIC_PERMISSION_CHECKS, route.permissionCheck)) {
    diagnostics.push({
      code: 'API_CATALOG_PUBLIC_ROUTE_PERMISSION_CHECK_INVALID',
      file: 'contracts/apis/catalog.yaml',
      path: `${routePath}.permission_check`,
      message: `Public API route \`${route.operationId}\` must use a reviewed public entrypoint permission check.`
    });
  }
  if (route.authRequired && (route.permissionCheck === 'none' || route.permissionCheck.trim().length === 0)) {
    diagnostics.push({
      code: 'API_CATALOG_ROUTE_PERMISSION_CHECK_INVALID',
      file: 'contracts/apis/catalog.yaml',
      path: `${routePath}.permission_check`,
      message: `Authenticated API route \`${route.operationId}\` must declare a concrete permission check.`
    });
  }
  if (route.auditEvent === 'none' || route.auditEvent.trim().length === 0) {
    diagnostics.push({
      code: 'API_CATALOG_ROUTE_AUDIT_EVENT_INVALID',
      file: 'contracts/apis/catalog.yaml',
      path: `${routePath}.audit_event`,
      message: `API route \`${route.operationId}\` must declare a concrete audit event.`
    });
  }

  if (
    route.operationId === 'core.consent.policy_sets.resolve' &&
    route.exportPolicy !== 'staging_trusted_edge_only_not_sdk_or_public_docs'
  ) {
    diagnostics.push({
      code: 'API_CUSTOMER_POLICY_RESOLVE_EXPORT_POLICY_INVALID',
      file: 'contracts/apis/catalog.yaml',
      path: `${routePath}.export_policy`,
      message: 'The staging trusted-edge policy resolver must remain excluded from SDK and public documentation exports.'
    });
  }

  if (
    route.operationId === 'platform.support.reply_address_verifications.create' &&
    route.exportPolicy !== 'comm_verification_handoff_only_not_general_public_sdk'
  ) {
    diagnostics.push({
      code: 'API_SUPPORT_REPLY_ADDRESS_VERIFY_EXPORT_POLICY_INVALID',
      file: 'contracts/apis/catalog.yaml',
      path: `${routePath}.export_policy`,
      message: 'Reply-address verification handoff must remain excluded from general public SDK and documentation exports.'
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

  validateRouteResponseBodyContract({
    route,
    routePath,
    noContentSuccessStatuses: contracts.route.noContentSuccessStatuses,
    diagnostics
  });

  for (const requiredErrorCode of SESSION_EFFECT_REQUIRED_ERROR_CODES[
    route.sessionEffect
  ] ?? []) {
    // Discoverable login deliberately masks restricted/unknown accounts alike.
    if (requiredErrorCode === 'account_restricted' && isSingleUsePasskeyLoginRoute(route)) continue;
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

// These browser/gateway ceremonies are single-use, not replayable mutations.
// The gateway still supplies the mandatory request key for private Edge proof.
export function isSingleUsePasskeyLoginRoute(route: ApiRouteDefinition): boolean {
  const phase = route.operationId === 'core.auth.passkey_login_begin.create'
    ? 'Begin'
    : route.operationId === 'core.auth.passkey_login_complete.create'
      ? 'Complete'
      : null;
  if (phase === null) return false;
  const prefix = 'contracts/apis/core-api/passkey-login.yaml#PasskeyLogin';
  return route.method === 'POST' &&
    route.path === `/v1/auth/passkey/login/${phase.toLowerCase()}` &&
    route.serviceId === 'core-api' && route.ownerBoundary === 'identity' &&
    route.authRequired === false && route.idempotency === 'not_required' &&
    route.requestSchemaRef === `${prefix}${phase}Request` &&
    route.responseSchemaRef === `${prefix}${phase}Response`;
}

export function validateRouteResponseBodyContract(input: {
  readonly route: ApiRouteDefinition;
  readonly routePath: string;
  readonly noContentSuccessStatuses: readonly number[];
  readonly diagnostics: ApiContractDiagnostic[];
}): void {
  const hasNoContentStatus = input.route.successStatuses.some((status) =>
    input.noContentSuccessStatuses.includes(status)
  );
  const hasBodyStatus = input.route.successStatuses.some(
    (status) => !input.noContentSuccessStatuses.includes(status)
  );

  if (hasNoContentStatus && hasBodyStatus) {
    input.diagnostics.push({
      code: 'API_CATALOG_ROUTE_SUCCESS_BODY_MODE_AMBIGUOUS',
      file: 'contracts/apis/catalog.yaml',
      path: `${input.routePath}.success_statuses`,
      message: `API route \`${input.route.operationId}\` must not mix bodyless and body-bearing success statuses while using one response_schema_ref.`
    });
  }

  if (hasNoContentStatus && input.route.responseSchemaRef !== null) {
    input.diagnostics.push({
      code: 'API_CATALOG_ROUTE_NO_CONTENT_SCHEMA_FORBIDDEN',
      file: 'contracts/apis/catalog.yaml',
      path: `${input.routePath}.response_schema_ref`,
      message: `API route \`${input.route.operationId}\` uses a bodyless success status and must set response_schema_ref to null.`
    });
  }

  if (!hasNoContentStatus && input.route.responseSchemaRef === null) {
    input.diagnostics.push({
      code: 'API_CATALOG_ROUTE_RESPONSE_SCHEMA_REQUIRED',
      file: 'contracts/apis/catalog.yaml',
      path: `${input.routePath}.response_schema_ref`,
      message: `API route \`${input.route.operationId}\` uses a body-bearing success status and must declare response_schema_ref.`
    });
  }
}

export function validateRouteSchemaRef(input: {
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

export function validateRouteRequestIdempotencyMetadata(input: {
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

export function validateSecretMaterialDoesNotEcho(input: {
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
    if (
      input.responseSchema.requiredFields.includes(secretField) ||
      input.responseSchema.optionalFields.includes(secretField)
    ) {
      input.diagnostics.push({
        code: 'API_CATALOG_ROUTE_SECRET_FIELD_ECHOED',
        file: 'contracts/apis/catalog.yaml',
        path: `${input.routePath}.response_schema_ref`,
        message: `API route \`${input.route.operationId}\` response schema must not echo secret request field \`${secretField}\`.`
      });
    }
  }
}

export function validateUniqueRouteKeys(
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
