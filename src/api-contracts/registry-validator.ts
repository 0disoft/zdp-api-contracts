import {
  API_CONTRACT_FAMILY_KEYS,
  validateApiContractFamilyRegistry,
  type ApiContractFamilyKey
} from './family-registry.js';
import { validateApiContracts as validateLegacyApiContracts } from './validator.js';
import type {
  ApiContractDiagnostic,
  ApiContracts,
  ApiContractValidationResult
} from './types.js';

interface ApiContractValidationRegistration {
  readonly id: string;
  readonly familyKeys: readonly ApiContractFamilyKey[];
  readonly validate: (contracts: ApiContracts) => ApiContractValidationResult;
}

const API_CONTRACT_VALIDATION_REGISTRY = [
  {
    id: 'semantic-contract-invariants',
    familyKeys: API_CONTRACT_FAMILY_KEYS,
    validate: validateLegacyApiContracts
  }
] as const satisfies readonly ApiContractValidationRegistration[];

export function validateApiContractValidationRegistry(
  registrations: readonly ApiContractValidationRegistration[] =
    API_CONTRACT_VALIDATION_REGISTRY
): readonly ApiContractDiagnostic[] {
  const diagnostics: ApiContractDiagnostic[] = [];
  const seenIds = new Set<string>();
  const coveredFamilyKeys = new Set<ApiContractFamilyKey>();

  for (const [index, registration] of registrations.entries()) {
    const path = `registrations[${index}]`;
    if (seenIds.has(registration.id)) {
      diagnostics.push({
        code: 'API_CONTRACT_VALIDATION_ID_DUPLICATE',
        file: 'src/api-contracts/registry-validator.ts',
        path: `${path}.id`,
        message: `API contract validation \`${registration.id}\` is registered more than once.`
      });
    }
    seenIds.add(registration.id);

    if (registration.familyKeys.length === 0) {
      diagnostics.push({
        code: 'API_CONTRACT_VALIDATION_FAMILIES_EMPTY',
        file: 'src/api-contracts/registry-validator.ts',
        path: `${path}.familyKeys`,
        message: `API contract validation \`${registration.id}\` must own at least one family.`
      });
    }

    for (const familyKey of registration.familyKeys) {
      coveredFamilyKeys.add(familyKey);
    }
  }

  for (const familyKey of API_CONTRACT_FAMILY_KEYS) {
    if (!coveredFamilyKeys.has(familyKey)) {
      diagnostics.push({
        code: 'API_CONTRACT_VALIDATION_FAMILY_UNCOVERED',
        file: 'src/api-contracts/registry-validator.ts',
        path: 'registrations',
        message: `API contract family \`${familyKey}\` has no validation registration.`
      });
    }
  }

  return diagnostics;
}

/**
 * mf:anchor zdp.api-contracts.registry-validator
 * purpose: Dispatch API contract validation through explicit registry stages.
 * search: contract family registry, validation dispatch, semantic validator
 * invariant: Every singleton contract family is covered before semantic validation runs.
 * risk: data_consistency, dependency
 */
export function validateApiContracts(
  contracts: ApiContracts
): ApiContractValidationResult {
  const diagnostics: ApiContractDiagnostic[] = [
    ...validateApiContractFamilyRegistry(),
    ...validateApiContractValidationRegistry()
  ];

  for (const registration of API_CONTRACT_VALIDATION_REGISTRY) {
    diagnostics.push(...registration.validate(contracts).diagnostics);
  }

  return {
    ok: diagnostics.length === 0,
    diagnostics
  };
}
