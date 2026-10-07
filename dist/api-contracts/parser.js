import { readFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { parseRouteContract } from './parsers/route.js';
import { parseErrorEnvelopeContract } from './parsers/error-envelope.js';
import { parseWebhookContract } from './parsers/webhook.js';
import { parseSdkGenerationInputContract } from './parsers/sdk-generation-input.js';
import { parseApiCatalogContract } from './parsers/api-catalog.js';
import { parseCalculatorCatalogContract } from './parsers/calculator-catalog.js';
import { parseCalculatorConformanceContract } from './parsers/calculator-conformance.js';
import { parseCreditPurchaseContract } from './parsers/credit-purchase.js';
import { parseCustomerPolicyRegistryContract } from './parsers/customer-policy-registry.js';
import { parseAbuseChallengeContract } from './parsers/abuse-challenge.js';
import { parseAccessDecisionContract } from './parsers/access-decision.js';
import { parseProductLinkHandoffContract } from './parsers/product-link-handoff.js';
import { parseSensitiveActionAuthorizationContract } from './parsers/sensitive-action-authorization.js';
import { parseOidcProductSessionContract } from './parsers/oidc-product-session.js';
import { parseOidcClientRegistryContract } from './parsers/oidc-client-registry.js';
import { parseOidcProviderRuntimeContract } from './parsers/oidc-provider-runtime.js';
import { parseApiSchemaBundleContract } from './parsers/api-schema-bundle.js';
const REQUIRED_CORE_API_SCHEMA_BUNDLE_FILES = [
    'contracts/apis/core-api/auth-session.yaml',
    'contracts/apis/core-api/sensitive-action-authorization.yaml',
    'contracts/apis/core-api/customer-policy-registry.yaml'
];
export class ApiContractLoadError extends Error {
    failures;
    constructor(failures) {
        super([
            'API contract load failed.',
            ...failures.map((failure) => `- ${failure.file}: ${failure.message}`)
        ].join('\n'));
        this.name = 'ApiContractLoadError';
        this.failures = failures;
    }
}
/**
 * mf:anchor zdp.api-contracts.contract-loader
 * purpose: Locate the loader that turns YAML contract files into typed API contract objects.
 * search: api contracts, yaml load, route catalog, schema bundles, sdk input
 * invariant: Missing or malformed contract files fail before validator or export planning runs.
 * risk: data_consistency
 */
export async function loadApiContracts(root = process.cwd()) {
    const contractsRoot = join(root, 'contracts');
    const [route, errorEnvelope, webhook, sdkGenerationInput, apiCatalog, calculatorCatalog, calculatorConformance, creditPurchase, customerPolicyRegistry, abuseChallenge, accessDecision, productLinkHandoff, sensitiveActionAuthorization, oidcProductSession, oidcClientRegistry, oidcProviderRuntime] = await Promise.all([
        loadContract(contractsRoot, 'route', 'route-contract.yaml', parseRouteContract),
        loadContract(contractsRoot, 'error-envelope', 'error-envelope.yaml', parseErrorEnvelopeContract),
        loadContract(contractsRoot, 'webhook', 'webhook-contract.yaml', parseWebhookContract),
        loadContract(contractsRoot, 'sdk-generation-input', 'sdk-generation-input.yaml', parseSdkGenerationInputContract),
        loadContract(contractsRoot, 'api-catalog', join('apis', 'catalog.yaml'), parseApiCatalogContract),
        loadContract(contractsRoot, 'calculator-catalog', join('calculators', 'catalog.yaml'), parseCalculatorCatalogContract),
        loadContract(contractsRoot, 'calculator-conformance', join('calculators', 'conformance.yaml'), parseCalculatorConformanceContract),
        loadContract(contractsRoot, 'credit-purchase', join('apis', 'money-api', 'credit-purchase.yaml'), parseCreditPurchaseContract),
        loadContract(contractsRoot, 'customer-policy-registry', join('apis', 'core-api', 'customer-policy-registry.yaml'), parseCustomerPolicyRegistryContract),
        loadContract(contractsRoot, 'abuse-challenge', join('apis', 'abuse-api', 'challenge.yaml'), parseAbuseChallengeContract),
        loadContract(contractsRoot, 'access-decision', join('apis', 'core-api', 'access-decision.yaml'), parseAccessDecisionContract),
        loadContract(contractsRoot, 'product-link-handoff', join('apis', 'core-api', 'product-link.yaml'), parseProductLinkHandoffContract),
        loadContract(contractsRoot, 'sensitive-action-authorization', join('apis', 'core-api', 'sensitive-action-authorization.yaml'), parseSensitiveActionAuthorizationContract),
        loadContract(contractsRoot, 'oidc-product-session', join('apis', 'core-api', 'oidc-product-session.yaml'), parseOidcProductSessionContract),
        loadContract(contractsRoot, 'oidc-client-registry', join('apis', 'core-api', 'oidc-client-registry.yaml'), parseOidcClientRegistryContract),
        loadContract(contractsRoot, 'oidc-provider-runtime', join('apis', 'core-api', 'oidc-provider-runtime.yaml'), parseOidcProviderRuntimeContract)
    ]);
    const results = [
        route,
        errorEnvelope,
        webhook,
        sdkGenerationInput,
        apiCatalog,
        calculatorCatalog,
        calculatorConformance,
        creditPurchase,
        customerPolicyRegistry,
        abuseChallenge,
        accessDecision,
        productLinkHandoff,
        sensitiveActionAuthorization,
        oidcProductSession,
        oidcClientRegistry,
        oidcProviderRuntime
    ];
    const failures = results.filter(isContractLoadFailure);
    if (failures.length > 0) {
        throw new ApiContractLoadError(failures);
    }
    const loadedRoute = requireLoadedContract(route);
    const loadedErrorEnvelope = requireLoadedContract(errorEnvelope);
    const loadedWebhook = requireLoadedContract(webhook);
    const loadedSdkGenerationInput = requireLoadedContract(sdkGenerationInput);
    const loadedApiCatalog = requireLoadedContract(apiCatalog);
    const loadedCalculatorCatalog = requireLoadedContract(calculatorCatalog);
    const loadedCalculatorConformance = requireLoadedContract(calculatorConformance);
    const loadedCreditPurchase = requireLoadedContract(creditPurchase);
    const loadedCustomerPolicyRegistry = requireLoadedContract(customerPolicyRegistry);
    const loadedAbuseChallenge = requireLoadedContract(abuseChallenge);
    const loadedAccessDecision = requireLoadedContract(accessDecision);
    const loadedProductLinkHandoff = requireLoadedContract(productLinkHandoff);
    const loadedSensitiveActionAuthorization = requireLoadedContract(sensitiveActionAuthorization);
    const loadedOidcProductSession = requireLoadedContract(oidcProductSession);
    const loadedOidcClientRegistry = requireLoadedContract(oidcClientRegistry);
    const loadedOidcProviderRuntime = requireLoadedContract(oidcProviderRuntime);
    const schemaBundleResults = await Promise.all(schemaBundleFilesFromCatalog(loadedApiCatalog.value).map((file) => loadContract(contractsRoot, `schema-bundle:${file}`, schemaBundleRelativeFile(file), (source) => parseApiSchemaBundleContract(source, file))));
    const schemaBundleFailures = schemaBundleResults.filter(isContractLoadFailure);
    if (schemaBundleFailures.length > 0) {
        throw new ApiContractLoadError(schemaBundleFailures);
    }
    return {
        route: loadedRoute.value,
        errorEnvelope: loadedErrorEnvelope.value,
        webhook: loadedWebhook.value,
        sdkGenerationInput: loadedSdkGenerationInput.value,
        apiCatalog: loadedApiCatalog.value,
        schemaBundles: schemaBundleResults.map((result) => requireLoadedContract(result).value),
        creditPurchase: loadedCreditPurchase.value,
        customerPolicyRegistry: loadedCustomerPolicyRegistry.value,
        abuseChallenge: loadedAbuseChallenge.value,
        accessDecision: loadedAccessDecision.value,
        productLinkHandoff: loadedProductLinkHandoff.value,
        sensitiveActionAuthorization: loadedSensitiveActionAuthorization.value,
        oidcProductSession: loadedOidcProductSession.value,
        oidcClientRegistry: loadedOidcClientRegistry.value,
        oidcProviderRuntime: loadedOidcProviderRuntime.value,
        calculatorCatalog: loadedCalculatorCatalog.value,
        calculatorConformance: loadedCalculatorConformance.value
    };
}
async function loadContract(contractsRoot, name, fileName, parse) {
    const file = `contracts/${fileName.replaceAll('\\', '/')}`;
    const resolvedRoot = resolve(contractsRoot);
    const resolvedFile = resolve(contractsRoot, fileName);
    try {
        const relativeFile = relative(resolvedRoot, resolvedFile);
        if (relativeFile.startsWith('..') ||
            relativeFile.includes(':') ||
            relativeFile.startsWith('/') ||
            relativeFile.startsWith('\\')) {
            throw new Error(`Contract path \`${file}\` must remain under the contracts root.`);
        }
        return {
            ok: true,
            name,
            file,
            value: parse(await readFile(resolvedFile, 'utf8'))
        };
    }
    catch (error) {
        return {
            ok: false,
            name,
            file,
            message: error instanceof Error ? error.message : String(error)
        };
    }
}
function schemaBundleFilesFromCatalog(catalog) {
    return uniqueSorted([
        ...REQUIRED_CORE_API_SCHEMA_BUNDLE_FILES,
        ...catalog.routes.flatMap((route) => [
            schemaBundleFileFromRef(route.requestSchemaRef),
            ...(route.responseSchemaRef === null
                ? []
                : [schemaBundleFileFromRef(route.responseSchemaRef)])
        ])
    ]);
}
function schemaBundleFileFromRef(schemaRef) {
    if (!/^contracts\/apis\/[a-z0-9-]+\/[a-z0-9-]+\.yaml#[A-Z][A-Za-z0-9]+$/.test(schemaRef)) {
        throw new Error(`Schema ref \`${schemaRef}\` must use contracts/apis/<service>/<file>.yaml#PascalCaseSchema.`);
    }
    const hashIndex = schemaRef.indexOf('#');
    return hashIndex === -1 ? schemaRef : schemaRef.slice(0, hashIndex);
}
function schemaBundleRelativeFile(file) {
    return file.startsWith('contracts/') ? file.slice('contracts/'.length) : file;
}
function isContractLoadFailure(result) {
    return !result.ok;
}
function requireLoadedContract(result) {
    if (!result.ok) {
        throw new ApiContractLoadError([result]);
    }
    return result;
}
function uniqueSorted(values) {
    return Array.from(new Set(values)).sort((left, right) => left.localeCompare(right));
}
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
//# sourceMappingURL=parser.js.map