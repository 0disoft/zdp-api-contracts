import type { CalculatorCatalogContract, CalculatorDefinition, CalculatorInputDefinition, CalculatorOutputDefinition } from '../types.js';
export declare function parseCalculatorCatalogContract(source: string): CalculatorCatalogContract;
export declare function parseCalculatorDefinition(definition: Record<string, unknown>, index: number): CalculatorDefinition;
export declare function parseCalculatorInput(input: Record<string, unknown>, context: string): CalculatorInputDefinition;
export declare function parseCalculatorOutput(output: Record<string, unknown>, context: string): CalculatorOutputDefinition;
//# sourceMappingURL=calculator-catalog.d.ts.map