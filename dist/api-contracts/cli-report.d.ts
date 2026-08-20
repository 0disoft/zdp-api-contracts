import type { ApiContractDiagnostic, ApiContractValidationResult } from './types.js';
export type ApiContractCheckFormat = 'text' | 'json' | 'sarif';
export interface OpenApiComparisonReport {
    readonly file: string;
    readonly serviceId: string | null;
    readonly ok: boolean;
    readonly diagnostics: readonly ApiContractDiagnostic[];
}
export interface ApiContractCheckReport {
    readonly schemaVersion: 1;
    readonly root: string;
    readonly ok: boolean;
    readonly contractValidation: ApiContractValidationResult;
    readonly openApiComparison: OpenApiComparisonReport | null;
}
export declare function renderApiContractCheckReport(report: ApiContractCheckReport, format: ApiContractCheckFormat): string;
//# sourceMappingURL=cli-report.d.ts.map