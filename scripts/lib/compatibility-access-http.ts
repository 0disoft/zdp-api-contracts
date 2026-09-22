import type { AccessDecisionHttpProfile } from '../../src/api-contracts/types';
import type { ApiContractCompatibilityChange } from './compatibility-types';

export function compareAccessDecisionHttp(
  base: AccessDecisionHttpProfile | null,
  head: AccessDecisionHttpProfile | null,
  changes: ApiContractCompatibilityChange[]
): void {
  const normalized = (profile: AccessDecisionHttpProfile | null): string => JSON.stringify(
    profile === null ? null : Object.fromEntries(Object.entries(profile)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => [key, Array.isArray(value) ? [...value].sort() : value]))
  );
  if (normalized(base) === normalized(head)) return;
  changes.push({
    level: 'breaking',
    code: 'API_COMPAT_ACCESS_HTTP_PROFILE_CHANGED',
    path: 'contracts/apis/core-api/access-decision.yaml#access_decision.http_profile',
    message: 'Access decision authentication, metadata, replay or transport bounds changed; consumers require a coordinated rollout.'
  });
}
