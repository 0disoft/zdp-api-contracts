import type { CalculatorConformanceCase, CalculatorConformanceContract, CalculatorConformanceExpectation, CalculatorConformanceInputValue, CalculatorConformanceUnitValue } from '../types.js';
export declare function parseCalculatorConformanceContract(source: string): CalculatorConformanceContract;
export declare function parseCalculatorConformanceCase(testCase: Record<string, unknown>, index: number): CalculatorConformanceCase;
export declare function parseCalculatorConformanceInputValue(value: unknown, context: string): CalculatorConformanceInputValue;
export declare function parseCalculatorConformanceExpectation(expected: Record<string, unknown>, context: string): CalculatorConformanceExpectation;
export declare function parseCalculatorConformanceOutputValue(value: Record<string, unknown>, context: string): {
    readonly value: string | number;
    readonly unit: string;
};
export declare function parseCalculatorConformanceUnitValue(value: Record<string, unknown>, context: string): CalculatorConformanceUnitValue;
//# sourceMappingURL=calculator-conformance.d.ts.map