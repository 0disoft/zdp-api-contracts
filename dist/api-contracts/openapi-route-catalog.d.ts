import type { ApiContractDiagnostic, ApiRouteDefinition } from './types.js';
export interface OpenApiRouteCatalogCheckResult {
    readonly ok: boolean;
    readonly serviceId: string | null;
    readonly diagnostics: readonly ApiContractDiagnostic[];
}
/**
 * Compares one service OpenAPI document with the route catalog entries owned by
 * the same service. The comparison intentionally stays at the route metadata
 * layer and does not treat generated OpenAPI as the contract source.
 */
export declare function compareOpenApiRouteCatalog(source: string, file: string, routes: readonly ApiRouteDefinition[], requestedServiceId?: string | null): OpenApiRouteCatalogCheckResult;
//# sourceMappingURL=openapi-route-catalog.d.ts.map