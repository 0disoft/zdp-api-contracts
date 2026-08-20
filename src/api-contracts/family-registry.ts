import {
  parseAbuseChallengeContract,
  parseApiCatalogContract,
  parseErrorEnvelopeContract,
  parseProductLinkHandoffContract,
  parseRouteContract,
  parseSdkGenerationInputContract,
  parseWebhookContract
} from './strict-parser.js';
import {
  parseAccessDecisionContract,
  parseCalculatorCatalogContract,
  parseCalculatorConformanceContract,
  parseCreditPurchaseContract,
  parseCustomerPolicyRegistryContract,
  parseOidcClientRegistryContract,
  parseOidcProductSessionContract,
  parseOidcProviderRuntimeContract,
  parseSensitiveActionAuthorizationContract
} from './parser.js';
import type {
  ApiCatalogContract,
  ApiContractDiagnostic,
  ApiContracts,
  ApiExportPlanOutput
} from './types.js';

export type ApiContractFamilyKey = Exclude<keyof ApiContracts, 'schemaBundles'>;
export type ApiContractExportTarget = ApiExportPlanOutput['kind'];

export interface ApiContractFamilyRegistration<
  Key extends ApiContractFamilyKey = ApiContractFamilyKey
> {
  readonly key: Key;
  readonly name: string;
  readonly sourcePath: string;
  readonly parse: (source: string) => ApiContracts[Key];
  readonly exportTargets: readonly ApiContractExportTarget[];
}

export function defineApiContractFamily<Key extends ApiContractFamilyKey>(
  registration: ApiContractFamilyRegistration<Key>
): ApiContractFamilyRegistration<Key> {
  return registration;
}

export const API_CONTRACT_FAMILY_KEYS = [
  'route',
  'errorEnvelope',
  'webhook',
  'sdkGenerationInput',
  'apiCatalog',
  'creditPurchase',
  'customerPolicyRegistry',
  'abuseChallenge',
  'accessDecision',
  'productLinkHandoff',
  'sensitiveActionAuthorization',
  'oidcProductSession',
  'oidcClientRegistry',
  'oidcProviderRuntime',
  'calculatorCatalog',
  'calculatorConformance'
] as const satisfies readonly ApiContractFamilyKey[];

type MissingApiContractFamilyKey = Exclude<
  ApiContractFamilyKey,
  (typeof API_CONTRACT_FAMILY_KEYS)[number]
>;
type AssertNever<Value extends never> = Value;
type ApiContractFamilyKeysAreExhaustive =
  AssertNever<MissingApiContractFamilyKey>;

const OPENAPI_AND_DOCS = [
  'openapi',
  'sdk_generation_input',
  'docs_contract'
] as const satisfies readonly ApiContractExportTarget[];
const SDK_AND_DOCS = [
  'sdk_generation_input',
  'docs_contract'
] as const satisfies readonly ApiContractExportTarget[];

/**
 * mf:anchor zdp.api-contracts.family-registry
 * purpose: Locate singleton contract path, parser, and export ownership registration.
 * search: contract family registry, parser registration, export source ownership
 * invariant: Every ApiContracts singleton key appears exactly once in deterministic order.
 * risk: dependency, data_consistency
 */
export const API_CONTRACT_FAMILY_REGISTRY = [
  defineApiContractFamily({
    key: 'route',
    name: 'route',
    sourcePath: 'contracts/route-contract.yaml',
    parse: parseRouteContract,
    exportTargets: OPENAPI_AND_DOCS
  }),
  defineApiContractFamily({
    key: 'errorEnvelope',
    name: 'error-envelope',
    sourcePath: 'contracts/error-envelope.yaml',
    parse: parseErrorEnvelopeContract,
    exportTargets: OPENAPI_AND_DOCS
  }),
  defineApiContractFamily({
    key: 'webhook',
    name: 'webhook',
    sourcePath: 'contracts/webhook-contract.yaml',
    parse: parseWebhookContract,
    exportTargets: [
      'webhook_schema',
      'sdk_generation_input',
      'docs_contract'
    ]
  }),
  defineApiContractFamily({
    key: 'sdkGenerationInput',
    name: 'sdk-generation-input',
    sourcePath: 'contracts/sdk-generation-input.yaml',
    parse: parseSdkGenerationInputContract,
    exportTargets: SDK_AND_DOCS
  }),
  defineApiContractFamily({
    key: 'apiCatalog',
    name: 'api-catalog',
    sourcePath: 'contracts/apis/catalog.yaml',
    parse: parseApiCatalogContract,
    exportTargets: OPENAPI_AND_DOCS
  }),
  defineApiContractFamily({
    key: 'creditPurchase',
    name: 'credit-purchase',
    sourcePath: 'contracts/apis/money-api/credit-purchase.yaml',
    parse: parseCreditPurchaseContract,
    exportTargets: []
  }),
  defineApiContractFamily({
    key: 'customerPolicyRegistry',
    name: 'customer-policy-registry',
    sourcePath: 'contracts/apis/core-api/customer-policy-registry.yaml',
    parse: parseCustomerPolicyRegistryContract,
    exportTargets: []
  }),
  defineApiContractFamily({
    key: 'abuseChallenge',
    name: 'abuse-challenge',
    sourcePath: 'contracts/apis/abuse-api/challenge.yaml',
    parse: parseAbuseChallengeContract,
    exportTargets: []
  }),
  defineApiContractFamily({
    key: 'accessDecision',
    name: 'access-decision',
    sourcePath: 'contracts/apis/core-api/access-decision.yaml',
    parse: parseAccessDecisionContract,
    exportTargets: []
  }),
  defineApiContractFamily({
    key: 'productLinkHandoff',
    name: 'product-link-handoff',
    sourcePath: 'contracts/apis/core-api/product-link.yaml',
    parse: parseProductLinkHandoffContract,
    exportTargets: []
  }),
  defineApiContractFamily({
    key: 'sensitiveActionAuthorization',
    name: 'sensitive-action-authorization',
    sourcePath: 'contracts/apis/core-api/sensitive-action-authorization.yaml',
    parse: parseSensitiveActionAuthorizationContract,
    exportTargets: []
  }),
  defineApiContractFamily({
    key: 'oidcProductSession',
    name: 'oidc-product-session',
    sourcePath: 'contracts/apis/core-api/oidc-product-session.yaml',
    parse: parseOidcProductSessionContract,
    exportTargets: []
  }),
  defineApiContractFamily({
    key: 'oidcClientRegistry',
    name: 'oidc-client-registry',
    sourcePath: 'contracts/apis/core-api/oidc-client-registry.yaml',
    parse: parseOidcClientRegistryContract,
    exportTargets: []
  }),
  defineApiContractFamily({
    key: 'oidcProviderRuntime',
    name: 'oidc-provider-runtime',
    sourcePath: 'contracts/apis/core-api/oidc-provider-runtime.yaml',
    parse: parseOidcProviderRuntimeContract,
    exportTargets: []
  }),
  defineApiContractFamily({
    key: 'calculatorCatalog',
    name: 'calculator-catalog',
    sourcePath: 'contracts/calculators/catalog.yaml',
    parse: parseCalculatorCatalogContract,
    exportTargets: []
  }),
  defineApiContractFamily({
    key: 'calculatorConformance',
    name: 'calculator-conformance',
    sourcePath: 'contracts/calculators/conformance.yaml',
    parse: parseCalculatorConformanceContract,
    exportTargets: []
  })
] as const;

export const REQUIRED_API_SCHEMA_BUNDLE_SOURCE_PATHS = [
  'contracts/apis/core-api/auth-session.yaml',
  'contracts/apis/core-api/sensitive-action-authorization.yaml',
  'contracts/apis/core-api/customer-policy-registry.yaml'
] as const;

export function apiContractFamilySourcePath(
  key: ApiContractFamilyKey
): string {
  const registration = API_CONTRACT_FAMILY_REGISTRY.find(
    (candidate) => candidate.key === key
  );
  if (registration === undefined) {
    throw new Error(`API contract family \`${key}\` is not registered.`);
  }
  return registration.sourcePath;
}

export function apiContractFamilySourcesForExport(
  target: ApiContractExportTarget
): readonly string[] {
  return API_CONTRACT_FAMILY_REGISTRY
    .filter((registration) => registration.exportTargets.includes(target))
    .map((registration) => registration.sourcePath);
}

export function listApiSchemaBundleSourcePaths(
  catalog: ApiCatalogContract
): readonly string[] {
  return uniqueSorted([
    ...REQUIRED_API_SCHEMA_BUNDLE_SOURCE_PATHS,
    ...catalog.routes.flatMap((route) => [
      schemaBundleSourcePathFromRef(route.requestSchemaRef),
      ...(route.responseSchemaRef === null
        ? []
        : [schemaBundleSourcePathFromRef(route.responseSchemaRef)])
    ])
  ]);
}

export function validateApiContractFamilyRegistry(
  registrations: readonly ApiContractFamilyRegistration[] =
    API_CONTRACT_FAMILY_REGISTRY
): readonly ApiContractDiagnostic[] {
  const diagnostics: ApiContractDiagnostic[] = [];
  const seenKeys = new Set<ApiContractFamilyKey>();
  const seenNames = new Set<string>();
  const seenSourcePaths = new Set<string>();

  for (const [index, registration] of registrations.entries()) {
    const path = `registrations[${index}]`;
    const expectedKey = API_CONTRACT_FAMILY_KEYS[index];
    if (expectedKey !== undefined && registration.key !== expectedKey) {
      diagnostics.push({
        code: 'API_CONTRACT_FAMILY_ORDER_INVALID',
        file: 'src/api-contracts/family-registry.ts',
        path: `${path}.key`,
        message:
          `API contract family position ${index} must register ` +
          `\`${expectedKey}\`, not \`${registration.key}\`.`
      });
    }
    if (seenKeys.has(registration.key)) {
      diagnostics.push({
        code: 'API_CONTRACT_FAMILY_KEY_DUPLICATE',
        file: 'src/api-contracts/family-registry.ts',
        path: `${path}.key`,
        message: `API contract family key \`${registration.key}\` is registered more than once.`
      });
    }
    seenKeys.add(registration.key);

    if (!/^[a-z][a-z0-9-]*$/.test(registration.name)) {
      diagnostics.push({
        code: 'API_CONTRACT_FAMILY_NAME_INVALID',
        file: 'src/api-contracts/family-registry.ts',
        path: `${path}.name`,
        message:
          `API contract family name \`${registration.name}\` must be a stable ` +
          'lowercase identifier.'
      });
    }
    if (seenNames.has(registration.name)) {
      diagnostics.push({
        code: 'API_CONTRACT_FAMILY_NAME_DUPLICATE',
        file: 'src/api-contracts/family-registry.ts',
        path: `${path}.name`,
        message: `API contract family name \`${registration.name}\` is registered more than once.`
      });
    }
    seenNames.add(registration.name);

    if (seenSourcePaths.has(registration.sourcePath)) {
      diagnostics.push({
        code: 'API_CONTRACT_FAMILY_SOURCE_DUPLICATE',
        file: 'src/api-contracts/family-registry.ts',
        path: `${path}.sourcePath`,
        message: `API contract source \`${registration.sourcePath}\` is registered more than once.`
      });
    }
    seenSourcePaths.add(registration.sourcePath);

    if (new Set(registration.exportTargets).size !== registration.exportTargets.length) {
      diagnostics.push({
        code: 'API_CONTRACT_FAMILY_EXPORT_TARGET_DUPLICATE',
        file: 'src/api-contracts/family-registry.ts',
        path: `${path}.exportTargets`,
        message: `API contract family \`${registration.key}\` repeats an export target.`
      });
    }

    if (!isContractSourcePath(registration.sourcePath)) {
      diagnostics.push({
        code: 'API_CONTRACT_FAMILY_SOURCE_INVALID',
        file: 'src/api-contracts/family-registry.ts',
        path: `${path}.sourcePath`,
        message:
          `API contract source \`${registration.sourcePath}\` must remain under ` +
          '`contracts/` and use a lowercase YAML path.'
      });
    }
  }

  for (const key of API_CONTRACT_FAMILY_KEYS) {
    if (!seenKeys.has(key)) {
      diagnostics.push({
        code: 'API_CONTRACT_FAMILY_MISSING',
        file: 'src/api-contracts/family-registry.ts',
        path: 'registrations',
        message: `API contract family \`${key}\` is not registered.`
      });
    }
  }

  return diagnostics;
}

function schemaBundleSourcePathFromRef(schemaRef: string): string {
  if (
    !/^contracts\/apis\/[a-z0-9-]+\/[a-z0-9-]+\.yaml#[A-Z][A-Za-z0-9]+$/.test(
      schemaRef
    )
  ) {
    throw new Error(
      `Schema ref \`${schemaRef}\` must use contracts/apis/<service>/<file>.yaml#PascalCaseSchema.`
    );
  }
  const hashIndex = schemaRef.indexOf('#');
  return hashIndex === -1 ? schemaRef : schemaRef.slice(0, hashIndex);
}

function isContractSourcePath(sourcePath: string): boolean {
  return /^contracts\/(?:[a-z0-9-]+\/)*[a-z0-9-]+\.yaml$/.test(sourcePath);
}

function uniqueSorted(values: readonly string[]): readonly string[] {
  return Array.from(new Set(values)).sort((left, right) =>
    left.localeCompare(right)
  );
}
