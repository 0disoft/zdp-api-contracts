import type { ApiContracts } from '../../src/api-contracts/types';
import { compareRouteContract, compareRoutes } from './compatibility-route';
import {
  compareErrorEnvelope,
  compareSchemaBundles,
  compareSdkGenerationInput,
  compareWebhookContract
} from './compatibility-schema';
import { highestLevel } from './compatibility-shared';
import type {
  ApiContractCompatibilityChange,
  ApiContractCompatibilityReport
} from './compatibility-types';

export * from './compatibility-semver';
export * from './compatibility-types';

export function compareApiContracts(
  base: ApiContracts,
  head: ApiContracts
): ApiContractCompatibilityReport {
  const changes: ApiContractCompatibilityChange[] = [];

  compareRouteContract(base, head, changes);
  compareRoutes(base, head, changes);
  compareSchemaBundles(base.schemaBundles, head.schemaBundles, changes);
  compareErrorEnvelope(base, head, changes);
  compareWebhookContract(base, head, changes);
  compareSdkGenerationInput(base, head, changes);

  changes.sort((left, right) => {
    const levelWeight = { patch: 1, feature: 2, breaking: 3 } as const;
    const levelDifference = levelWeight[right.level] - levelWeight[left.level];
    if (levelDifference !== 0) {
      return levelDifference;
    }
    const pathDifference = left.path.localeCompare(right.path);
    return pathDifference !== 0
      ? pathDifference
      : left.code.localeCompare(right.code);
  });

  return {
    level: highestLevel(changes),
    changes
  };
}
