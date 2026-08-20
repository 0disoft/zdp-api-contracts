import type { ApiContractDiagnostic } from '../api-contracts/types.js';
declare const OPENAPI_VERSION: "3.1.0";
declare const JSON_SCHEMA_DIALECT: "https://json-schema.org/draft/2020-12/schema";
export type ApiOpenApiSchema = Readonly<Record<string, unknown>>;
export type ApiOpenApiOperation = Readonly<Record<string, unknown>>;
export type ApiOpenApiPathItem = Readonly<Record<string, ApiOpenApiOperation>>;
export interface ApiOpenApi31Document {
    readonly openapi: typeof OPENAPI_VERSION;
    readonly info: Readonly<{
        readonly title: string;
        readonly version: string;
        readonly description: string;
    }>;
    readonly jsonSchemaDialect: typeof JSON_SCHEMA_DIALECT;
    readonly tags: readonly Readonly<{
        readonly name: string;
    }>[];
    readonly paths: Readonly<Record<string, ApiOpenApiPathItem>>;
    readonly components: Readonly<{
        readonly schemas: Readonly<Record<string, ApiOpenApiSchema>>;
    }>;
    readonly 'x-zdp-contract-source': 'zdp-api-contracts';
    readonly 'x-zdp-typed-schema-coverage': Readonly<{
        readonly typed: number;
        readonly total: number;
    }>;
    readonly 'x-zdp-untyped-schema-refs': readonly string[];
}
export interface ApiOpenApi31BuildOptions {
    readonly strictTypedSchemas?: boolean;
    readonly includeRestrictedRoutes?: boolean;
    readonly title?: string;
}
export interface ApiOpenApi31BuildResult {
    readonly ok: boolean;
    readonly document: ApiOpenApi31Document | null;
    readonly diagnostics: readonly ApiContractDiagnostic[];
    readonly typedSchemaRefs: readonly string[];
    readonly untypedSchemaRefs: readonly string[];
}
/**
 * Builds a deterministic OpenAPI 3.1 document from the committed route catalog
 * and typed schema metadata. Legacy field-list schemas remain visible as
 * permissive properties unless strictTypedSchemas is enabled.
 */
export declare function buildOpenApi31Document(root?: string, options?: ApiOpenApi31BuildOptions): Promise<ApiOpenApi31BuildResult>;
export declare function serializeOpenApi31Document(document: ApiOpenApi31Document): string;
export {};
//# sourceMappingURL=openapi.d.ts.map