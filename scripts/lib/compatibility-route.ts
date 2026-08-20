import type {
  ApiContracts,
  ApiRouteDefinition
} from '../../src/api-contracts/types';
import type { ApiContractCompatibilityChange } from './compatibility-types';
import {
  addChange,
  compareAllowlist,
  compareBreakingScalar,
  compareForbiddenSet,
  compareRequirementBoolean,
  compareRequiredSet,
  compareSetDelta,
  idempotencyStrength,
  mapBy
} from './compatibility-shared';

export function compareRouteContract(
  base: ApiContracts,
  head: ApiContracts,
  changes: ApiContractCompatibilityChange[]
): void {
  compareRequiredSet(
    base.route.requiredPerRoute,
    head.route.requiredPerRoute,
    'contracts/route-contract.yaml#route_contract.required_per_route',
    'API_COMPAT_ROUTE_REQUIRED_FIELD',
    changes
  );
  compareAllowlist(
    base.route.allowedMethods,
    head.route.allowedMethods,
    'contracts/route-contract.yaml#route_contract.allowed_methods',
    'API_COMPAT_ROUTE_METHOD',
    changes
  );
  compareAllowlist(
    base.route.allowedSuccessStatuses.map(String),
    head.route.allowedSuccessStatuses.map(String),
    'contracts/route-contract.yaml#route_contract.allowed_success_statuses',
    'API_COMPAT_ROUTE_SUCCESS_STATUS',
    changes
  );
  compareAllowlist(
    base.route.allowedSessionEffects,
    head.route.allowedSessionEffects,
    'contracts/route-contract.yaml#route_contract.allowed_session_effects',
    'API_COMPAT_ROUTE_SESSION_EFFECT',
    changes
  );
  compareForbiddenSet(
    base.route.forbiddenShapes,
    head.route.forbiddenShapes,
    'contracts/route-contract.yaml#route_contract.forbidden_shapes',
    'API_COMPAT_ROUTE_FORBIDDEN_SHAPE',
    changes
  );
}

export function compareRoutes(
  base: ApiContracts,
  head: ApiContracts,
  changes: ApiContractCompatibilityChange[]
): void {
  const baseRoutes = mapBy(base.apiCatalog.routes, (route) => route.operationId);
  const headRoutes = mapBy(head.apiCatalog.routes, (route) => route.operationId);

  for (const [operationId, baseRoute] of baseRoutes) {
    const headRoute = headRoutes.get(operationId);
    const routePath = `contracts/apis/catalog.yaml#routes.${operationId}`;
    if (headRoute === undefined) {
      addChange(
        changes,
        'breaking',
        'API_COMPAT_ROUTE_REMOVED',
        routePath,
        `Route \`${operationId}\` was removed.`
      );
      continue;
    }
    compareRoute(operationId, routePath, baseRoute, headRoute, changes);
  }

  for (const [operationId] of headRoutes) {
    if (!baseRoutes.has(operationId)) {
      addChange(
        changes,
        'feature',
        'API_COMPAT_ROUTE_ADDED',
        `contracts/apis/catalog.yaml#routes.${operationId}`,
        `Route \`${operationId}\` was added.`
      );
    }
  }
}

function compareRoute(
  operationId: string,
  routePath: string,
  base: ApiRouteDefinition,
  head: ApiRouteDefinition,
  changes: ApiContractCompatibilityChange[]
): void {
  compareBreakingScalar(
    base.serviceId,
    head.serviceId,
    'service_id',
    operationId,
    routePath,
    changes
  );
  compareBreakingScalar(
    base.resource,
    head.resource,
    'resource',
    operationId,
    routePath,
    changes
  );
  compareBreakingScalar(
    base.action,
    head.action,
    'action',
    operationId,
    routePath,
    changes
  );
  compareBreakingScalar(
    base.method,
    head.method,
    'method',
    operationId,
    routePath,
    changes
  );
  compareBreakingScalar(
    base.path,
    head.path,
    'path',
    operationId,
    routePath,
    changes
  );
  compareBreakingScalar(
    base.requestSchemaRef,
    head.requestSchemaRef,
    'request_schema_ref',
    operationId,
    routePath,
    changes
  );
  compareBreakingScalar(
    base.responseSchemaRef,
    head.responseSchemaRef,
    'response_schema_ref',
    operationId,
    routePath,
    changes
  );
  compareBreakingScalar(
    base.permissionCheck,
    head.permissionCheck,
    'permission_check',
    operationId,
    routePath,
    changes
  );
  compareBreakingScalar(
    base.ownerBoundary,
    head.ownerBoundary,
    'owner_boundary',
    operationId,
    routePath,
    changes
  );
  compareBreakingScalar(
    base.tenantBoundary,
    head.tenantBoundary,
    'tenant_boundary',
    operationId,
    routePath,
    changes
  );
  compareBreakingScalar(
    base.sessionEffect,
    head.sessionEffect,
    'session_effect',
    operationId,
    routePath,
    changes
  );
  compareBreakingScalar(
    base.exportPolicy ?? null,
    head.exportPolicy ?? null,
    'export_policy',
    operationId,
    routePath,
    changes
  );
  compareBreakingScalar(
    base.authorizationPolicy ?? null,
    head.authorizationPolicy ?? null,
    'authorization_policy',
    operationId,
    routePath,
    changes
  );

  compareSetDelta(
    base.successStatuses.map(String),
    head.successStatuses.map(String),
    `${routePath}.success_statuses`,
    {
      removedLevel: 'breaking',
      removedCode: 'API_COMPAT_ROUTE_SUCCESS_STATUS_REMOVED',
      removedMessage: (value) =>
        `Route \`${operationId}\` no longer accepts success status ${value}.`,
      addedLevel: 'feature',
      addedCode: 'API_COMPAT_ROUTE_SUCCESS_STATUS_ADDED',
      addedMessage: (value) =>
        `Route \`${operationId}\` added success status ${value}.`
    },
    changes
  );

  compareSetDelta(
    base.errorCodes,
    head.errorCodes,
    `${routePath}.error_codes`,
    {
      removedLevel: 'breaking',
      removedCode: 'API_COMPAT_ROUTE_ERROR_CODE_REMOVED',
      removedMessage: (value) =>
        `Route \`${operationId}\` removed error code \`${value}\`.`,
      addedLevel: 'feature',
      addedCode: 'API_COMPAT_ROUTE_ERROR_CODE_ADDED',
      addedMessage: (value) =>
        `Route \`${operationId}\` added error code \`${value}\`.`
    },
    changes
  );

  compareRequirementBoolean(
    base.authRequired,
    head.authRequired,
    `${routePath}.auth_required`,
    'API_COMPAT_ROUTE_AUTH_REQUIRED',
    `Route \`${operationId}\``,
    changes
  );
  compareRequirementBoolean(
    base.requestIdRequired,
    head.requestIdRequired,
    `${routePath}.request_id_required`,
    'API_COMPAT_ROUTE_REQUEST_ID_REQUIRED',
    `Route \`${operationId}\``,
    changes
  );
  compareRequirementBoolean(
    base.traceIdRequired,
    head.traceIdRequired,
    `${routePath}.trace_id_required`,
    'API_COMPAT_ROUTE_TRACE_ID_REQUIRED',
    `Route \`${operationId}\``,
    changes
  );

  if (base.idempotency !== head.idempotency) {
    const baseStrength = idempotencyStrength(base.idempotency);
    const headStrength = idempotencyStrength(head.idempotency);
    if (headStrength > baseStrength) {
      addChange(
        changes,
        'breaking',
        'API_COMPAT_ROUTE_IDEMPOTENCY_STRENGTHENED',
        `${routePath}.idempotency`,
        `Route \`${operationId}\` strengthened idempotency from ` +
          `\`${base.idempotency}\` to \`${head.idempotency}\`.`
      );
    } else if (headStrength < baseStrength) {
      addChange(
        changes,
        'patch',
        'API_COMPAT_ROUTE_IDEMPOTENCY_RELAXED',
        `${routePath}.idempotency`,
        `Route \`${operationId}\` relaxed idempotency from ` +
          `\`${base.idempotency}\` to \`${head.idempotency}\`.`
      );
    } else {
      addChange(
        changes,
        'breaking',
        'API_COMPAT_ROUTE_IDEMPOTENCY_CHANGED',
        `${routePath}.idempotency`,
        `Route \`${operationId}\` changed idempotency policy from ` +
          `\`${base.idempotency}\` to \`${head.idempotency}\`.`
      );
    }
  }

  if (base.auditEvent !== head.auditEvent) {
    addChange(
      changes,
      'breaking',
      'API_COMPAT_ROUTE_AUDIT_EVENT_CHANGED',
      `${routePath}.audit_event`,
      `Route \`${operationId}\` changed audit event from ` +
        `\`${base.auditEvent}\` to \`${head.auditEvent}\`.`
    );
  }

  if (base.credentialPolicy !== head.credentialPolicy) {
    addChange(
      changes,
      'patch',
      'API_COMPAT_ROUTE_CREDENTIAL_POLICY_CHANGED',
      `${routePath}.credential_policy`,
      `Route \`${operationId}\` changed credential handling policy.`
    );
  }
}
