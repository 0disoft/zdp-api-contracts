import type { ApiSchemaDefinition, ApiSchemaBundleContract } from '../types.js';
export declare function parseApiSchemaBundleContract(source: string, file?: string): ApiSchemaBundleContract;
export declare function parseApiSchemaDefinition(schema: Record<string, unknown>, context: string): ApiSchemaDefinition;
export declare function optionalStringList(data: Record<string, unknown>, key: string, context: string): readonly string[];
//# sourceMappingURL=api-schema-bundle.d.ts.map