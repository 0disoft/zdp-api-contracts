import type { ApiContracts, ApiExportPlanResult } from '../api-contracts/types.js';
/**
 * mf:anchor zdp.api-contracts.export-plan
 * purpose: Locate the dry-run export plan for OpenAPI, docs, webhook, and SDK handoffs.
 * search: export plan, OpenAPI, SDK generation, docs contract, webhook schema
 * invariant: Export planning reports required metadata without publishing schemas or writing artifacts.
 * risk: dependency, data_consistency
 */
export declare function buildApiExportPlan(contracts: ApiContracts): ApiExportPlanResult;
//# sourceMappingURL=plan.d.ts.map