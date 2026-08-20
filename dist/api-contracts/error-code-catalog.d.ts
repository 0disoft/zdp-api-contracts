import type { ApiContracts, ApiContractValidationResult } from './types.js';
export declare const ERROR_CODE_CATALOG_FILE = "contracts/error-code-catalog.yaml";
export declare const SHARED_ERROR_OWNER_SERVICE_ID = "shared";
export interface ErrorCodeCatalogContract {
    readonly schemaVersion: number;
    readonly status: string;
    readonly defaults: ErrorCodeCatalogDefaults;
    readonly entries: readonly ErrorCodeCatalogEntry[];
}
export interface ErrorCodeCatalogDefaults {
    readonly retryable: boolean;
    readonly userVisible: boolean;
    readonly localizationKeyPrefix: string;
    readonly lifecycleStatus: string;
}
export interface ErrorCodeCatalogEntry {
    readonly code: string;
    readonly httpStatus: number;
    readonly retryable: boolean;
    readonly userVisible: boolean;
    readonly localizationKey: string;
    readonly ownerServiceId: string;
    readonly lifecycleStatus: string;
}
export declare function loadErrorCodeCatalog(root?: string): Promise<ErrorCodeCatalogContract>;
export declare function parseErrorCodeCatalog(source: string): ErrorCodeCatalogContract;
export declare function validateErrorCodeCatalog(catalog: ErrorCodeCatalogContract, contracts: ApiContracts): ApiContractValidationResult;
//# sourceMappingURL=error-code-catalog.d.ts.map