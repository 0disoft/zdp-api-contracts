import type { AbuseChallengeContract, ApiCatalogContract, ApiContracts, ApiSchemaBundleContract, ErrorEnvelopeContract, ProductLinkHandoffContract, RouteContract, SdkGenerationInputContract, WebhookContract } from './types.js';
/**
 * Runs the existing typed loader and then rejects unknown fields in every
 * source shape that previously had a permissive parsing path.
 */
export declare function loadApiContracts(root?: string): Promise<ApiContracts>;
export declare function parseAbuseChallengeContract(source: string): AbuseChallengeContract;
export declare function parseProductLinkHandoffContract(source: string): ProductLinkHandoffContract;
export declare function parseRouteContract(source: string): RouteContract;
export declare function parseErrorEnvelopeContract(source: string): ErrorEnvelopeContract;
export declare function parseWebhookContract(source: string): WebhookContract;
export declare function parseSdkGenerationInputContract(source: string): SdkGenerationInputContract;
export declare function parseApiCatalogContract(source: string): ApiCatalogContract;
export declare function parseApiSchemaBundleContract(source: string, file?: string): ApiSchemaBundleContract;
//# sourceMappingURL=strict-parser.d.ts.map