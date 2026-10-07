import type { ApiContractDiagnostic, ApiContracts, CalculatorConformanceCase, CalculatorConformanceInputValue, CalculatorDefinition } from '../types.js';
export declare const CALCULATOR_CONFORMANCE_FILE = "contracts/calculators/conformance.yaml";
export declare const CONFORMANCE_DECIMAL_INPUT_POLICY = "canonical_ascii_decimal_string";
export declare const CONFORMANCE_ROUNDING_MODE = "half_away_from_zero";
export declare const CONFORMANCE_MAX_INPUT_DIGITS = 1000;
export declare const CONFORMANCE_MAX_DECIMAL_PLACES = 100;
export declare const CANONICAL_CALCULATOR_DECIMAL_PATTERN: RegExp;
export declare function validateCalculatorConformance(contracts: ApiContracts, diagnostics: ApiContractDiagnostic[]): void;
export declare function validateCalculatorConformanceCase(contracts: ApiContracts, testCase: CalculatorConformanceCase, index: number, diagnostics: ApiContractDiagnostic[]): void;
export declare function validateCalculatorConformanceInputs(contracts: ApiContracts, definition: CalculatorDefinition, testCase: CalculatorConformanceCase, path: string, diagnostics: ApiContractDiagnostic[]): readonly string[];
export declare function calculatorConformanceDecimalValue(value: CalculatorConformanceInputValue, unitPolicy: string, path: string, diagnostics: ApiContractDiagnostic[]): string | undefined;
export declare function calculatorCallerSuppliedUnits(definition: CalculatorDefinition, input: Readonly<Record<string, CalculatorConformanceInputValue>>): readonly string[];
export declare function decimalPlacesInCanonicalValue(value: string): number;
export declare function validateConformanceKeys(actual: readonly string[], expected: readonly string[], path: string, diagnostics: ApiContractDiagnostic[], required?: readonly string[]): void;
export declare function validateUniqueConformanceCaseIds(cases: readonly CalculatorConformanceCase[], diagnostics: ApiContractDiagnostic[]): void;
export declare function pushCalculatorConformanceDiagnostic(diagnostics: ApiContractDiagnostic[], code: string, path: string, message: string): void;
//# sourceMappingURL=calculator-conformance.d.ts.map