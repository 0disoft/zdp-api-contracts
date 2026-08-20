import { apiContractFamilySourcesForExport } from '../api-contracts/family-registry.js';
import { buildApiExportPlan as buildLegacyApiExportPlan } from './plan.js';
/**
 * mf:anchor zdp.api-contracts.registry-export-plan
 * purpose: Add registry-owned singleton sources to every dry-run export output.
 * search: contract family registry, export plan sources, OpenAPI sources
 * invariant: Export outputs cannot omit a singleton source assigned to their target.
 * risk: dependency, data_consistency
 */
export function buildApiExportPlan(contracts) {
    const result = buildLegacyApiExportPlan(contracts);
    if (!result.ok || result.plan === null) {
        return result;
    }
    const outputs = result.plan.outputs.map((output) => ({
        ...output,
        sourceContracts: uniquePreservingOrder([
            ...output.sourceContracts,
            ...apiContractFamilySourcesForExport(output.kind)
        ])
    }));
    return {
        ok: true,
        plan: {
            ...result.plan,
            outputs
        },
        diagnostics: result.diagnostics
    };
}
function uniquePreservingOrder(values) {
    return Array.from(new Set(values));
}
//# sourceMappingURL=registry-plan.js.map