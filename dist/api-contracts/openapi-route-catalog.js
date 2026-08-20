import { parse } from 'yaml';
const OPENAPI_OPERATION_METHODS = [
    'get',
    'put',
    'post',
    'delete',
    'options',
    'head',
    'patch',
    'trace'
];
/**
 * Compares one service OpenAPI document with the route catalog entries owned by
 * the same service. The comparison intentionally stays at the route metadata
 * layer and does not treat generated OpenAPI as the contract source.
 */
export function compareOpenApiRouteCatalog(source, file, routes, requestedServiceId = null) {
    const diagnostics = [];
    const document = parseOpenApiDocument(source, file, diagnostics);
    if (document === null) {
        return { ok: false, serviceId: requestedServiceId, diagnostics };
    }
    validateOpenApiVersion(document, file, diagnostics);
    const declaredServiceIds = readDeclaredServiceIds(document);
    const declaredServiceId = declaredServiceIds.root ?? declaredServiceIds.info;
    const serviceId = requestedServiceId ?? declaredServiceId;
    if (declaredServiceIds.root !== null &&
        declaredServiceIds.info !== null &&
        declaredServiceIds.root !== declaredServiceIds.info) {
        diagnostics.push(createDiagnostic('API_OPENAPI_DECLARED_SERVICE_ID_MISMATCH', file, 'info.x-zdp-service-id', `OpenAPI root service \`${declaredServiceIds.root}\` does not match info service \`${declaredServiceIds.info}\`.`));
    }
    if (serviceId === null) {
        diagnostics.push(createDiagnostic('API_OPENAPI_SERVICE_ID_REQUIRED', file, 'x-zdp-service-id', 'OpenAPI comparison requires --service or a root/info x-zdp-service-id value.'));
    }
    if (requestedServiceId !== null &&
        declaredServiceId !== null &&
        requestedServiceId !== declaredServiceId) {
        diagnostics.push(createDiagnostic('API_OPENAPI_SERVICE_ID_MISMATCH', file, 'x-zdp-service-id', `OpenAPI declares service \`${declaredServiceId}\` but the CLI requested \`${requestedServiceId}\`.`));
    }
    const paths = document.paths;
    if (!isRecord(paths)) {
        diagnostics.push(createDiagnostic('API_OPENAPI_PATHS_MISSING', file, 'paths', 'OpenAPI document must declare a paths object.'));
        return { ok: false, serviceId, diagnostics };
    }
    const operations = collectOpenApiOperations(paths, file, diagnostics);
    validateUniqueOperationIds(operations, file, diagnostics);
    if (serviceId !== null) {
        compareServiceRoutes(serviceId, routes, operations, file, diagnostics);
    }
    return {
        ok: diagnostics.length === 0,
        serviceId,
        diagnostics
    };
}
function parseOpenApiDocument(source, file, diagnostics) {
    try {
        const parsed = parse(source);
        if (!isRecord(parsed)) {
            diagnostics.push(createDiagnostic('API_OPENAPI_DOCUMENT_INVALID', file, '$', 'OpenAPI source must parse to an object.'));
            return null;
        }
        return parsed;
    }
    catch (error) {
        diagnostics.push(createDiagnostic('API_OPENAPI_PARSE_FAILED', file, '$', error instanceof Error ? error.message : String(error)));
        return null;
    }
}
function validateOpenApiVersion(document, file, diagnostics) {
    const version = document.openapi;
    if (typeof version !== 'string' ||
        !/^3\.(?:0|1)\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(version)) {
        diagnostics.push(createDiagnostic('API_OPENAPI_VERSION_UNSUPPORTED', file, 'openapi', 'OpenAPI route comparison supports explicit OpenAPI 3.0.x and 3.1.x documents.'));
    }
}
function readDeclaredServiceIds(document) {
    const info = document.info;
    return {
        root: nonEmptyString(document['x-zdp-service-id']),
        info: isRecord(info) ? nonEmptyString(info['x-zdp-service-id']) : null
    };
}
function collectOpenApiOperations(paths, file, diagnostics) {
    const operations = [];
    for (const [path, pathValue] of Object.entries(paths)) {
        const pathContext = `paths.${path}`;
        if (!path.startsWith('/')) {
            diagnostics.push(createDiagnostic('API_OPENAPI_PATH_INVALID', file, pathContext, `OpenAPI path \`${path}\` must start with \`/\`.`));
        }
        if (!isRecord(pathValue)) {
            diagnostics.push(createDiagnostic('API_OPENAPI_PATH_ITEM_INVALID', file, pathContext, `OpenAPI path \`${path}\` must declare an object path item.`));
            continue;
        }
        if (typeof pathValue.$ref === 'string') {
            diagnostics.push(createDiagnostic('API_OPENAPI_PATH_ITEM_REF_UNSUPPORTED', file, `${pathContext}.$ref`, 'Route catalog comparison requires inline path operations instead of a path-item $ref.'));
        }
        for (const method of OPENAPI_OPERATION_METHODS) {
            const operationValue = pathValue[method];
            if (operationValue === undefined) {
                continue;
            }
            const operationContext = `${pathContext}.${method}`;
            if (!isRecord(operationValue)) {
                diagnostics.push(createDiagnostic('API_OPENAPI_OPERATION_INVALID', file, operationContext, `OpenAPI operation ${method.toUpperCase()} ${path} must be an object.`));
                continue;
            }
            if (typeof operationValue.$ref === 'string') {
                diagnostics.push(createDiagnostic('API_OPENAPI_OPERATION_REF_UNSUPPORTED', file, `${operationContext}.$ref`, 'Route catalog comparison requires inline operation metadata instead of an operation $ref.'));
            }
            operations.push({
                method: method.toUpperCase(),
                path,
                operationId: nonEmptyString(operationValue.operationId),
                successStatuses: readSuccessStatuses(operationValue.responses, file, `${operationContext}.responses`, diagnostics),
                diagnosticPath: operationContext
            });
        }
    }
    return operations;
}
function readSuccessStatuses(value, file, path, diagnostics) {
    if (!isRecord(value)) {
        diagnostics.push(createDiagnostic('API_OPENAPI_RESPONSES_MISSING', file, path, 'OpenAPI operation must declare a responses object.'));
        return [];
    }
    const statuses = [];
    for (const responseStatus of Object.keys(value)) {
        if (/^2\d\d$/.test(responseStatus)) {
            statuses.push(Number(responseStatus));
            continue;
        }
        if (/^2XX$/i.test(responseStatus)) {
            diagnostics.push(createDiagnostic('API_OPENAPI_SUCCESS_STATUS_RANGE_UNSUPPORTED', file, `${path}.${responseStatus}`, 'OpenAPI comparison requires explicit 2xx response statuses instead of a 2XX range.'));
        }
    }
    return Array.from(new Set(statuses)).sort((left, right) => left - right);
}
function validateUniqueOperationIds(operations, file, diagnostics) {
    const firstOperationById = new Map();
    for (const operation of operations) {
        if (operation.operationId === null) {
            diagnostics.push(createDiagnostic('API_OPENAPI_OPERATION_ID_MISSING', file, `${operation.diagnosticPath}.operationId`, `OpenAPI operation ${operation.method} ${operation.path} must declare operationId.`));
            continue;
        }
        const first = firstOperationById.get(operation.operationId);
        if (first === undefined) {
            firstOperationById.set(operation.operationId, operation);
            continue;
        }
        diagnostics.push(createDiagnostic('API_OPENAPI_OPERATION_ID_DUPLICATE', file, `${operation.diagnosticPath}.operationId`, `OpenAPI operationId \`${operation.operationId}\` is already used by ${first.method} ${first.path}.`));
    }
}
function compareServiceRoutes(serviceId, routes, operations, file, diagnostics) {
    const serviceRoutes = routes.filter((route) => route.serviceId === serviceId);
    if (serviceRoutes.length === 0) {
        diagnostics.push(createDiagnostic('API_OPENAPI_SERVICE_NOT_FOUND', 'contracts/apis/catalog.yaml', 'routes', `Route catalog has no entries for service \`${serviceId}\`.`));
        return;
    }
    const catalogRouteByKey = new Map(serviceRoutes.map((route) => [routeKey(route.method, route.path), route]));
    const openApiOperationByKey = new Map(operations.map((operation) => [
        routeKey(operation.method, operation.path),
        operation
    ]));
    for (const route of serviceRoutes) {
        const operation = openApiOperationByKey.get(routeKey(route.method, route.path));
        const operationPath = `paths.${route.path}.${route.method.toLowerCase()}`;
        if (operation === undefined) {
            diagnostics.push(createDiagnostic('API_OPENAPI_OPERATION_MISSING', file, operationPath, `OpenAPI is missing catalog route ${route.method} ${route.path} (${route.operationId}).`));
            continue;
        }
        if (operation.operationId !== null &&
            operation.operationId !== route.operationId) {
            diagnostics.push(createDiagnostic('API_OPENAPI_OPERATION_ID_MISMATCH', file, `${operation.diagnosticPath}.operationId`, `OpenAPI operationId \`${operation.operationId ?? '<missing>'}\` must equal catalog operationId \`${route.operationId}\`.`));
        }
        for (const status of route.successStatuses) {
            if (!operation.successStatuses.includes(status)) {
                diagnostics.push(createDiagnostic('API_OPENAPI_SUCCESS_STATUS_MISSING', file, `${operation.diagnosticPath}.responses`, `OpenAPI operation ${route.operationId} is missing catalog success status ${status}.`));
            }
        }
        for (const status of operation.successStatuses) {
            if (!route.successStatuses.includes(status)) {
                diagnostics.push(createDiagnostic('API_OPENAPI_SUCCESS_STATUS_UNDECLARED', file, `${operation.diagnosticPath}.responses.${status}`, `OpenAPI operation ${route.operationId} declares 2xx status ${status} outside the route catalog.`));
            }
        }
    }
    for (const operation of operations) {
        if (!catalogRouteByKey.has(routeKey(operation.method, operation.path))) {
            diagnostics.push(createDiagnostic('API_OPENAPI_ROUTE_UNDECLARED', file, operation.diagnosticPath, `OpenAPI operation ${operation.method} ${operation.path} is not declared for service \`${serviceId}\` in the route catalog.`));
        }
    }
}
function routeKey(method, path) {
    return `${method.toUpperCase()} ${path}`;
}
function createDiagnostic(code, file, path, message) {
    return { code, file, path, message };
}
function nonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0
        ? value.trim()
        : null;
}
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
//# sourceMappingURL=openapi-route-catalog.js.map