import type { ApiContractDiagnostic, ApiContracts } from '../types.js';

import { CANONICAL_FORBIDDEN_VALUES } from '../forbidden-values.js';

import { ALLOWED_SESSION_EFFECTS, includesValue } from './shared.js';

export const REQUIRED_ROUTE_FIELDS = [
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

export const ALLOWED_ROUTE_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;

export const ALLOWED_SUCCESS_STATUSES = [200, 201, 202, 204] as const;

export const NO_CONTENT_SUCCESS_STATUSES = [204] as const;

export const FORBIDDEN_ROUTE_SHAPES = [
  ...CANONICAL_FORBIDDEN_VALUES,
  'provider_specific_id_as_primary_id',
  'raw_storage_url'
] as const;

export function validateRouteContract(
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

  for (const status of NO_CONTENT_SUCCESS_STATUSES) {
    if (!contracts.route.noContentSuccessStatuses.includes(status)) {
      diagnostics.push({
        code: 'API_ROUTE_NO_CONTENT_SUCCESS_STATUS_MISSING',
        file: 'contracts/route-contract.yaml',
        path: 'route_contract.no_content_success_statuses',
        message: `Route contract must classify success status \`${status}\` as bodyless.`
      });
    }
  }

  for (const status of contracts.route.noContentSuccessStatuses) {
    if (!includesValue(NO_CONTENT_SUCCESS_STATUSES, status)) {
      diagnostics.push({
        code: 'API_ROUTE_NO_CONTENT_SUCCESS_STATUS_INVALID',
        file: 'contracts/route-contract.yaml',
        path: 'route_contract.no_content_success_statuses',
        message: `Route contract must not classify status \`${status}\` as bodyless.`
      });
    }
    if (!contracts.route.allowedSuccessStatuses.includes(status)) {
      diagnostics.push({
        code: 'API_ROUTE_NO_CONTENT_SUCCESS_STATUS_NOT_ALLOWED',
        file: 'contracts/route-contract.yaml',
        path: 'route_contract.no_content_success_statuses',
        message: `Bodyless success status \`${status}\` must also be allowed.`
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
