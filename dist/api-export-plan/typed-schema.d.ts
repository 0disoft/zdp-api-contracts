import type { ApiContractDiagnostic, ApiSchemaBundleContract } from '../api-contracts/types.js';
declare const DECLARED_PROPERTY_TYPES: readonly ["string", "integer", "number", "boolean", "array", "object"];
export type ApiDeclaredSchemaPropertyType = (typeof DECLARED_PROPERTY_TYPES)[number];
export type ApiSchemaPropertyType = ApiDeclaredSchemaPropertyType | 'unknown';
export type ApiSchemaEnumValue = string | number | boolean | null;
export interface ApiTypedSchemaProperty {
    readonly type: ApiSchemaPropertyType;
    readonly format: string | null;
    readonly enumValues: readonly ApiSchemaEnumValue[];
    readonly nullable: boolean;
    readonly items: ApiTypedSchemaProperty | null;
    readonly properties: Readonly<Record<string, ApiTypedSchemaProperty>>;
    readonly requiredProperties: readonly string[];
    readonly additionalProperties: boolean;
}
export interface ApiTypedSchemaDefinition {
    readonly schemaRef: string;
    readonly schemaId: string;
    readonly typed: boolean;
    readonly properties: Readonly<Record<string, ApiTypedSchemaProperty>>;
}
export interface ApiTypedSchemaRegistry {
    readonly schemas: Readonly<Record<string, ApiTypedSchemaDefinition>>;
    readonly typedSchemaRefs: readonly string[];
    readonly untypedSchemaRefs: readonly string[];
}
export interface ApiTypedSchemaRegistryResult {
    readonly ok: boolean;
    readonly registry: ApiTypedSchemaRegistry | null;
    readonly diagnostics: readonly ApiContractDiagnostic[];
}
export interface ApiTypedSchemaBundleParseResult {
    readonly schemas: readonly ApiTypedSchemaDefinition[];
    readonly diagnostics: readonly ApiContractDiagnostic[];
}
/**
 * Reads opt-in `properties` metadata without breaking legacy field-list
 * contracts. Missing properties remain visible as explicitly untyped models.
 */
export declare function loadTypedSchemaRegistry(root: string, bundles: readonly ApiSchemaBundleContract[]): Promise<ApiTypedSchemaRegistryResult>;
export declare function parseTypedSchemaBundle(source: string, bundle: ApiSchemaBundleContract): ApiTypedSchemaBundleParseResult;
export {};
//# sourceMappingURL=typed-schema.d.ts.map