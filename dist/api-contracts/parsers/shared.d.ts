export declare function parseYamlObject(source: string, file: string): Record<string, unknown>;
export declare function requiredObject(data: Record<string, unknown>, key: string, context: string): Record<string, unknown>;
export declare function requiredStringList(data: Record<string, unknown>, key: string, context: string): readonly string[];
export declare function requiredStringListAllowEmpty(data: Record<string, unknown>, key: string, context: string): readonly string[];
export declare function requiredNumberList(data: Record<string, unknown>, key: string, context: string): readonly number[];
export declare function requiredRecordListAllowEmpty(data: Record<string, unknown>, key: string, context: string): readonly Record<string, unknown>[];
export declare function requiredRecordListNonEmpty(data: Record<string, unknown>, key: string, context: string): readonly Record<string, unknown>[];
export declare function requiredString(data: Record<string, unknown>, key: string, context: string): string;
export declare function requiredBoolean(data: Record<string, unknown>, key: string, context: string): boolean;
export declare function optionalString(data: Record<string, unknown>, key: string, context: string): string | null;
export declare function requiredNumber(data: Record<string, unknown>, key: string, context: string): number;
export declare function isRecord(value: unknown): value is Record<string, unknown>;
export declare function assertOnlyKeys(data: Record<string, unknown>, allowedKeys: readonly string[], context: string): void;
//# sourceMappingURL=shared.d.ts.map