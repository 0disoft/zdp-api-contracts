import type { ApiContracts } from './types.js';
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
export { parseAbuseChallengeContract } from './parsers/abuse-challenge.js';
export { parseCreditPurchaseContract } from './parsers/credit-purchase.js';
export { parseCustomerPolicyRegistryContract } from './parsers/customer-policy-registry.js';
export { parseOidcProductSessionContract } from './parsers/oidc-product-session.js';
export { parseOidcClientRegistryContract } from './parsers/oidc-client-registry.js';
export { parseOidcProviderRuntimeContract } from './parsers/oidc-provider-runtime.js';
export { parseSensitiveActionAuthorizationContract } from './parsers/sensitive-action-authorization.js';
export { parseAccessDecisionContract } from './parsers/access-decision.js';
export { parseProductLinkHandoffContract } from './parsers/product-link-handoff.js';
export { parseRouteContract } from './parsers/route.js';
export { parseErrorEnvelopeContract } from './parsers/error-envelope.js';
export { parseWebhookContract } from './parsers/webhook.js';
export { parseSdkGenerationInputContract } from './parsers/sdk-generation-input.js';
export { parseApiCatalogContract } from './parsers/api-catalog.js';
export { parseCalculatorCatalogContract } from './parsers/calculator-catalog.js';
export { parseCalculatorConformanceContract } from './parsers/calculator-conformance.js';
export { parseApiSchemaBundleContract } from './parsers/api-schema-bundle.js';
//# sourceMappingURL=parser.d.ts.map