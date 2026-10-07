export declare const REVIEWED_CALCULATOR_IDS: readonly ['percentage-change', 'margin-markup', 'break-even-point', 'compound-interest', 'data-transfer-time', 'date-difference', 'studycafe-seat-occupancy', 'studycafe-break-even', 'kiosk-roi', 'unattended-labor-savings', 'locker-revenue', 'study-room-schedule-revenue', 'security-cost-break-even', 'discount', 'age', 'work-hours', 'fuel-cost', 'percentage', 'margin-pricing', 'break-even-planning', 'compound-savings'];
export declare const ALLOWED_SESSION_EFFECTS: readonly ['none', 'issue', 'refresh', 'revoke', 'expire', 'compromise'];
export declare const ALLOWED_OWNER_BOUNDARIES: readonly ['identity', 'accounts', 'money', 'access', 'consent', 'audit', 'privacy', 'platform', 'architecture', 'observability'];
export declare const SCHEMA_REF_PATTERN: RegExp;
export interface ParsedSchemaRef {
    readonly file: string;
    readonly schemaId: string;
}
export declare function validateRequiredOidcValues(actual: readonly string[], required: readonly string[], code: string, path: string, push: (code: string, path: string, message: string) => void): void;
export declare function validateRequiredAccessDecisionValues(actual: readonly string[], required: readonly string[], code: string, path: string, push: (code: string, path: string, message: string) => void): void;
export declare function hasExactStringValues(actual: readonly string[], expected: readonly string[]): boolean;
export declare function parseSchemaRef(ref: string): ParsedSchemaRef | null;
export declare function includesValue<T extends string | number>(values: readonly T[], value: string | number): value is T;
//# sourceMappingURL=shared.d.ts.map