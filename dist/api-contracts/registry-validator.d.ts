import { type ApiContractFamilyKey } from './family-registry.js';
import type { ApiContractDiagnostic, ApiContracts, ApiContractValidationResult } from './types.js';
interface ApiContractValidationRegistration {
    readonly id: string;
    readonly familyKeys: readonly ApiContractFamilyKey[];
    readonly validate: (contracts: ApiContracts) => ApiContractValidationResult;
}
export declare function validateApiContractValidationRegistry(registrations?: readonly ApiContractValidationRegistration[]): readonly ApiContractDiagnostic[];
/**
 * mf:anchor zdp.api-contracts.registry-validator
 * purpose: Dispatch API contract validation through explicit registry stages.
 * search: contract family registry, validation dispatch, semantic validator
 * invariant: Every singleton contract family is covered before semantic validation runs.
 * risk: data_consistency, dependency
 */
export declare function validateApiContracts(contracts: ApiContracts): ApiContractValidationResult;
export {};
//# sourceMappingURL=registry-validator.d.ts.map