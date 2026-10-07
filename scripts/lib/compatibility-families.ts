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
    compareFields(left, right, `${family.sourcePath}#${family.key}`, family.key, changes);
  }
}

function compareFields(base: unknown, head: unknown, path: string, family: ApiContractFamilyKey, changes: ApiContractCompatibilityChange[]): void {
  if (canonical(base) === canonical(head)) return;
  if (isRecord(base) && isRecord(head)) {
    for (const field of [...new Set([...Object.keys(base), ...Object.keys(head)])].sort()) {
      compareFields(base[field], head[field], `${path}.${field}`, family, changes);
    }
    return;
  }
  if (family === 'oidcClientRegistry' && path.endsWith('.entries') && Array.isArray(base) && Array.isArray(head) &&
    [...base, ...head].every(entry => isRecord(entry) && typeof entry.clientId === 'string')) {
    const left = new Map(base.map(entry => [entry.clientId, entry]));
    const right = new Map(head.map(entry => [entry.clientId, entry]));
    for (const id of [...new Set([...left.keys(), ...right.keys()])].sort()) {
      if (!left.has(id) || !right.has(id)) {
        addFamilyChange(left.has(id) ? 'breaking' : 'feature', `${path}.${id}`, left.has(id) ? 'client removed' : 'client added', changes);
      } else compareFields(left.get(id), right.get(id), `${path}.${id}`, family, changes);
    }
    return;
  }
  const revisionIncrease = family === 'oidcClientRegistry' && /\.(?:registryRevision|entryRevision)$/.test(path) &&
    typeof base === 'number' && typeof head === 'number' && Number.isSafeInteger(base) && Number.isSafeInteger(head) && head > base;
  addFamilyChange(revisionIncrease ? 'patch' : 'breaking', path, revisionIncrease ? 'revision increased' : 'field changed', changes);
}

function addFamilyChange(level: ApiContractCompatibilityChange['level'], path: string, description: string, changes: ApiContractCompatibilityChange[]): void {
  changes.push({ level, code: 'API_COMPAT_CONTRACT_FAMILY_CHANGED', path, message: `Contract ${description} at \`${path}\`.` });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
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
