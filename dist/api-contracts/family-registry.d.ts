import type { ApiCatalogContract, ApiContractDiagnostic, ApiContracts, ApiExportPlanOutput } from './types.js';
export type ApiContractFamilyKey = Exclude<keyof ApiContracts, 'schemaBundles'>;
export type ApiContractExportTarget = ApiExportPlanOutput['kind'];
export interface ApiContractFamilyRegistration<Key extends ApiContractFamilyKey = ApiContractFamilyKey> {
    readonly key: Key;
    readonly name: string;
    readonly sourcePath: string;
    readonly parse: (source: string) => ApiContracts[Key];
    readonly exportTargets: readonly ApiContractExportTarget[];
}
export declare function defineApiContractFamily<Key extends ApiContractFamilyKey>(registration: ApiContractFamilyRegistration<Key>): ApiContractFamilyRegistration<Key>;
export declare const API_CONTRACT_FAMILY_KEYS: readonly ["route", "errorEnvelope", "webhook", "sdkGenerationInput", "apiCatalog", "creditPurchase", "customerPolicyRegistry", "abuseChallenge", "accessDecision", "productLinkHandoff", "sensitiveActionAuthorization", "oidcProductSession", "oidcClientRegistry", "oidcProviderRuntime", "calculatorCatalog", "calculatorConformance"];
/**
 * mf:anchor zdp.api-contracts.family-registry
 * purpose: Locate singleton contract path, parser, and export ownership registration.
 * search: contract family registry, parser registration, export source ownership
 * invariant: Every ApiContracts singleton key appears exactly once in deterministic order.
 * risk: dependency, data_consistency
 */
export declare const API_CONTRACT_FAMILY_REGISTRY: readonly [ApiContractFamilyRegistration<"route">, ApiContractFamilyRegistration<"errorEnvelope">, ApiContractFamilyRegistration<"webhook">, ApiContractFamilyRegistration<"sdkGenerationInput">, ApiContractFamilyRegistration<"apiCatalog">, ApiContractFamilyRegistration<"creditPurchase">, ApiContractFamilyRegistration<"customerPolicyRegistry">, ApiContractFamilyRegistration<"abuseChallenge">, ApiContractFamilyRegistration<"accessDecision">, ApiContractFamilyRegistration<"productLinkHandoff">, ApiContractFamilyRegistration<"sensitiveActionAuthorization">, ApiContractFamilyRegistration<"oidcProductSession">, ApiContractFamilyRegistration<"oidcClientRegistry">, ApiContractFamilyRegistration<"oidcProviderRuntime">, ApiContractFamilyRegistration<"calculatorCatalog">, ApiContractFamilyRegistration<"calculatorConformance">];
export declare const REQUIRED_API_SCHEMA_BUNDLE_SOURCE_PATHS: readonly ["contracts/apis/core-api/auth-session.yaml", "contracts/apis/core-api/sensitive-action-authorization.yaml", "contracts/apis/core-api/customer-policy-registry.yaml"];
export declare function apiContractFamilySourcePath(key: ApiContractFamilyKey): string;
export declare function apiContractFamilySourcesForExport(target: ApiContractExportTarget): readonly string[];
export declare function listApiSchemaBundleSourcePaths(catalog: ApiCatalogContract): readonly string[];
export declare function validateApiContractFamilyRegistry(registrations?: readonly ApiContractFamilyRegistration[]): readonly ApiContractDiagnostic[];
//# sourceMappingURL=family-registry.d.ts.map