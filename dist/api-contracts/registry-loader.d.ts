import { type ApiContractFamilyRegistration } from './family-registry.js';
import type { ApiContractDiagnostic, ApiContracts } from './types.js';
export declare class ApiContractFamilyRegistryError extends Error {
    readonly diagnostics: readonly ApiContractDiagnostic[];
    constructor(diagnostics: readonly ApiContractDiagnostic[]);
}
/**
 * mf:anchor zdp.api-contracts.registry-loader
 * purpose: Load singleton contract families and catalog-discovered schema bundles.
 * search: contract family registry, contract loader, schema bundle discovery
 * invariant: Registry integrity and complete singleton loading precede schema expansion.
 * risk: dependency, data_consistency
 */
export declare function loadApiContracts(root?: string, registrations?: readonly ApiContractFamilyRegistration[]): Promise<ApiContracts>;
//# sourceMappingURL=registry-loader.d.ts.map