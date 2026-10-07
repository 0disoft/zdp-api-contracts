import { API_CONTRACT_FAMILY_REGISTRY, type ApiContractFamilyKey } from '../../src/api-contracts/family-registry';
import type { ApiContracts } from '../../src/api-contracts/types';
import type { ApiContractCompatibilityChange } from './compatibility-types';

// Exhaustive: adding a contract family requires an intentional compatibility strategy.
export const FAMILY_COMPATIBILITY_STRATEGIES = {
  route: 'specialized', errorEnvelope: 'specialized', webhook: 'specialized',
  sdkGenerationInput: 'specialized', apiCatalog: 'specialized',
  creditPurchase: 'structural', customerPolicyRegistry: 'structural',
  abuseChallenge: 'structural', accessDecision: 'structural',
  productLinkHandoff: 'structural', sensitiveActionAuthorization: 'structural',
  oidcProductSession: 'structural', oidcClientRegistry: 'structural', oidcProviderRuntime: 'structural',
  calculatorCatalog: 'specialized', calculatorConformance: 'specialized'
} as const satisfies Record<ApiContractFamilyKey, 'specialized' | 'structural'>;

export function compareRemainingContractFamilies(base: ApiContracts, head: ApiContracts, changes: ApiContractCompatibilityChange[]): void {
  for (const family of API_CONTRACT_FAMILY_REGISTRY) {
    if (FAMILY_COMPATIBILITY_STRATEGIES[family.key] !== 'structural') continue;
    const left = family.key === 'accessDecision' ? withoutHttp(base.accessDecision) : base[family.key];
    const right = family.key === 'accessDecision' ? withoutHttp(head.accessDecision) : head[family.key];
    if (canonical(left) === canonical(right)) continue;
    changes.push({ level: 'breaking', code: 'API_COMPAT_CONTRACT_FAMILY_CHANGED',
      path: `${family.sourcePath}#${family.key}`,
      message: `Contract family \`${family.key}\` changed; review consumer compatibility and migration.` });
  }
}

function withoutHttp(value: ApiContracts['accessDecision']) {
  const { httpProfile: _http, ...rest } = value;
  return rest;
}

function canonical(value: unknown): string {
  // These contracts contain unordered allowlists, bindings and identified entries.
  if (Array.isArray(value)) return JSON.stringify(value.map(canonical).sort());
  if (value !== null && typeof value === 'object') {
    return JSON.stringify(Object.entries(value).filter(([, item]) => item !== undefined)
      .sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, canonical(item)]));
  }
  return JSON.stringify(value) ?? 'undefined';
}
