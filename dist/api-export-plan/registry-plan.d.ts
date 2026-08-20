import type { ApiContracts, ApiExportPlanResult } from '../api-contracts/types.js';
/**
 * mf:anchor zdp.api-contracts.registry-export-plan
 * purpose: Add registry-owned singleton sources to every dry-run export output.
 * search: contract family registry, export plan sources, OpenAPI sources
 * invariant: Export outputs cannot omit a singleton source assigned to their target.
 * risk: dependency, data_consistency
 */
export declare function buildApiExportPlan(contracts: ApiContracts): ApiExportPlanResult;
//# sourceMappingURL=registry-plan.d.ts.map