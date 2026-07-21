import type { ApiCatalogContract, ApiContracts, ApiSchemaBundleContract, CalculatorCatalogContract, CalculatorConformanceContract, ErrorEnvelopeContract, ProductLinkHandoffContract, RouteContract, SdkGenerationInputContract, SensitiveActionAuthorizationContract, WebhookContract } from './types.js';
interface ContractLoadFailure {
    readonly name: string;
    readonly file: string;
    readonly message: string;
}
export declare class ApiContractLoadError extends Error {
    readonly failures: readonly ContractLoadFailure[];
    constructor(failures: readonly ContractLoadFailure[]);
}
/**
 * mf:anchor zdp.api-contracts.contract-loader
 * purpose: Locate the loader that turns YAML contract files into typed API contract objects.
 * search: api contracts, yaml load, route catalog, schema bundles, sdk input
 * invariant: Missing or malformed contract files fail before validator or export planning runs.
 * risk: data_consistency
 */
export declare function loadApiContracts(root?: string): Promise<ApiContracts>;
export declare function parseSensitiveActionAuthorizationContract(source: string): SensitiveActionAuthorizationContract;
export declare function parseProductLinkHandoffContract(source: string): ProductLinkHandoffContract;
export declare function parseRouteContract(source: string): RouteContract;
export declare function parseErrorEnvelopeContract(source: string): ErrorEnvelopeContract;
export declare function parseWebhookContract(source: string): WebhookContract;
export declare function parseSdkGenerationInputContract(source: string): SdkGenerationInputContract;
export declare function parseApiCatalogContract(source: string): ApiCatalogContract;
export declare function parseCalculatorCatalogContract(source: string): CalculatorCatalogContract;
export declare function parseCalculatorConformanceContract(source: string): CalculatorConformanceContract;
export declare function parseApiSchemaBundleContract(source: string, file?: string): ApiSchemaBundleContract;
export {};
//# sourceMappingURL=parser.d.ts.map