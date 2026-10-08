import type { ApiCatalogContract, ApiRouteDefinition } from '../types.js';

import { assertOnlyKeys, optionalString, parseYamlObject, requiredBoolean, requiredNumberList, requiredObject, requiredRecordListAllowEmpty, requiredString, requiredStringList } from './shared.js';

export function parseApiCatalogContract(source: string): ApiCatalogContract {
  const file = 'contracts/apis/catalog.yaml';
  const data = parseYamlObject(source, file);
  assertOnlyKeys(data, ['api_catalog', 'routes'], file);
  const apiCatalog = requiredObject(
    data,
    'api_catalog',
    file
  );
  assertOnlyKeys(
    apiCatalog,
    ['status', 'route_definition_required_fields', 'forbidden_values'],
    `${file}#api_catalog`
  );
  const routes = requiredRecordListAllowEmpty(
    data,
    'routes',
    file
  );

  return {
    status: requiredString(
      apiCatalog,
      'status',
      'contracts/apis/catalog.yaml#api_catalog'
    ),
    routeDefinitionRequiredFields: requiredStringList(
      apiCatalog,
      'route_definition_required_fields',
      'contracts/apis/catalog.yaml#api_catalog'
    ),
    forbiddenValues: requiredStringList(
      apiCatalog,
      'forbidden_values',
      'contracts/apis/catalog.yaml#api_catalog'
    ),
    routes: routes.map(parseApiRouteDefinition)
  };
}

export function parseApiRouteDefinition(
  route: Record<string, unknown>,
  index: number
): ApiRouteDefinition {
  const context = `contracts/apis/catalog.yaml#routes[${index}]`;
  assertOnlyKeys(route, [
    'operation_id', 'service_id', 'resource', 'action', 'method', 'path',
    'success_statuses', 'request_schema_ref', 'response_schema_ref', 'auth_required',
    'permission_check', 'audit_event', 'idempotency', 'owner_boundary', 'tenant_boundary',
    'request_id_required', 'trace_id_required', 'session_effect', 'credential_policy',
    'export_policy', 'authorization_policy', 'error_codes'
  ], context);

  return {
    operationId: requiredString(route, 'operation_id', context),
    serviceId: requiredString(route, 'service_id', context),
    resource: requiredString(route, 'resource', context),
    action: requiredString(route, 'action', context),
    method: requiredString(route, 'method', context),
    path: requiredString(route, 'path', context),
    successStatuses: requiredNumberList(route, 'success_statuses', context),
    requestSchemaRef: requiredString(route, 'request_schema_ref', context),
    responseSchemaRef: requiredNullableString(
      route,
      'response_schema_ref',
      context
    ),
    authRequired: requiredBoolean(route, 'auth_required', context),
    permissionCheck: requiredString(route, 'permission_check', context),
    auditEvent: requiredString(route, 'audit_event', context),
    idempotency: requiredString(route, 'idempotency', context),
    ownerBoundary: requiredString(route, 'owner_boundary', context),
    tenantBoundary: requiredString(route, 'tenant_boundary', context),
    requestIdRequired: requiredBoolean(route, 'request_id_required', context),
    traceIdRequired: requiredBoolean(route, 'trace_id_required', context),
    sessionEffect: requiredString(route, 'session_effect', context),
    credentialPolicy: requiredString(route, 'credential_policy', context),
    exportPolicy: optionalString(route, 'export_policy', context),
    authorizationPolicy: optionalString(route, 'authorization_policy', context),
    errorCodes: requiredStringList(route, 'error_codes', context)
  };
}

export function requiredNullableString(
  data: Record<string, unknown>,
  key: string,
  context: string
): string | null {
  if (!Object.hasOwn(data, key)) {
    throw new Error(`${context} must declare nullable string field \`${key}\`.`);
  }
  const value = data[key];
  if (value === null) {
    return null;
  }
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${context} must declare nullable string field \`${key}\`.`);
  }
  return value;
}
