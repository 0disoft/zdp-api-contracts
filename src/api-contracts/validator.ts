import type { ApiContractDiagnostic, ApiContracts, ApiContractValidationResult, ApiSchemaBundleContract } from './types.js';

import { validateRouteContract } from './validation/route.js';

import { validateErrorEnvelopeContract } from './validation/error-envelope.js';

import { validateWebhookContract } from './validation/webhook.js';

import { validateSdkGenerationInputContract } from './validation/sdk-generation-input.js';

import { validateApiCatalogContract } from './validation/api-catalog.js';

import { validateSchemaBundles } from './validation/schema-bundles.js';

import { validateCustomerPolicyRegistry } from './validation/customer-policy-registry.js';

import { validateCreditPurchase } from './validation/credit-purchase.js';

import { validateAbuseChallenge } from './validation/abuse-challenge.js';

import { validateAccessDecision } from './validation/access-decision.js';

import { validateOidcProductSession } from './validation/oidc-product-session.js';

import { validateOidcClientRegistry } from './validation/oidc-client-registry.js';

import { validateOidcProviderRuntime } from './validation/oidc-provider-runtime.js';

import { validateProductLinkHandoff } from './validation/product-link-handoff.js';

import { validateSensitiveActionAuthorization } from './validation/sensitive-action-authorization.js';

import { validateReferralContracts } from './validation/referral-contracts.js';

import { validateCalculatorCatalog } from './validation/calculator-catalog.js';

import { validateCalculatorConformance } from './validation/calculator-conformance.js';

const CREDIT_PURCHASE_READ_FILE =
  'contracts/apis/money-api/credit-purchase-read.yaml';

/**
 * mf:anchor zdp.api-contracts.semantic-validator
 * purpose: Locate semantic rules that align API routes, schemas, SDK input, and webhooks.
 * search: api validation, route metadata, schema refs, idempotency, credential policy
 * invariant: Auth, tenant, credential, idempotency, and secret metadata stay explicit in contracts.
 * risk: authz, security, data_consistency
 */
export function validateApiContracts(
  contracts: ApiContracts
): ApiContractValidationResult {
  const diagnostics: ApiContractDiagnostic[] = [];
  const schemaBundlesByFile = buildSchemaBundleMap(
    contracts.schemaBundles,
    diagnostics
  );

  validateRouteContract(contracts, diagnostics);
  validateErrorEnvelopeContract(contracts, diagnostics);
  validateWebhookContract(contracts, diagnostics);
  validateSdkGenerationInputContract(contracts, diagnostics);
  validateApiCatalogContract(contracts, schemaBundlesByFile, diagnostics);
  validateSchemaBundles(contracts, schemaBundlesByFile, diagnostics);
  validateCustomerPolicyRegistry(contracts, schemaBundlesByFile, diagnostics);
  validateCreditPurchase(contracts, schemaBundlesByFile, diagnostics);
  validateAbuseChallenge(contracts, schemaBundlesByFile, diagnostics);
  validateAccessDecision(contracts, schemaBundlesByFile, diagnostics);
  validateOidcProductSession(contracts, diagnostics);
  validateOidcClientRegistry(contracts, diagnostics);
  validateOidcProviderRuntime(contracts, diagnostics);
  validateProductLinkHandoff(contracts, diagnostics);
  validateSensitiveActionAuthorization(contracts, diagnostics);
  validateReferralContracts(contracts, schemaBundlesByFile, diagnostics);
  validateCalculatorCatalog(contracts, diagnostics);
  validateCalculatorConformance(contracts, diagnostics);

  return {
    ok: diagnostics.length === 0,
    diagnostics
  };
}

function buildSchemaBundleMap(
  schemaBundles: readonly ApiSchemaBundleContract[],
  diagnostics: ApiContractDiagnostic[]
): ReadonlyMap<string, ApiSchemaBundleContract> {
  const schemaBundlesByFile = new Map<string, ApiSchemaBundleContract>();

  schemaBundles.forEach((schemaBundle) => {
    if (schemaBundlesByFile.has(schemaBundle.file)) {
      diagnostics.push({
        code: 'API_SCHEMA_BUNDLE_FILE_DUPLICATE',
        file: schemaBundle.file,
        path: 'schema_bundle',
        message: `Schema bundle file \`${schemaBundle.file}\` must be loaded only once.`
      });
      return;
    }

    schemaBundlesByFile.set(schemaBundle.file, schemaBundle);
  });

  return schemaBundlesByFile;
}
