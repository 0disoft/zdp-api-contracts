import type { ApiCatalogContract, ApiRouteDefinition } from '../types.js';
export declare function parseApiCatalogContract(source: string): ApiCatalogContract;
export declare function parseApiRouteDefinition(route: Record<string, unknown>, index: number): ApiRouteDefinition;
export declare function requiredNullableString(data: Record<string, unknown>, key: string, context: string): string | null;
//# sourceMappingURL=api-catalog.d.ts.map