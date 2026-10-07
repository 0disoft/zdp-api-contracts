import type { CalculatorConformanceCase, CalculatorConformanceContract, CalculatorConformanceExpectation, CalculatorConformanceInputValue, CalculatorConformanceUnitValue } from '../types.js';

import { assertOnlyKeys, isRecord, parseYamlObject, requiredNumber, requiredObject, requiredRecordListNonEmpty, requiredString } from './shared.js';

export function parseCalculatorConformanceContract(
  source: string
): CalculatorConformanceContract {
  const file = 'contracts/calculators/conformance.yaml';
  const data = parseYamlObject(source, file);
  assertOnlyKeys(data, ['calculator_conformance', 'cases'], file);
  const contract = requiredObject(data, 'calculator_conformance', file);
  assertOnlyKeys(
    contract,
    [
      'schema_version',
      'contract_version',
      'engine_version_range',
      'decimal_input_policy',
      'max_input_digits',
      'max_decimal_places',
      'rounding_mode'
    ],
    `${file}#calculator_conformance`
  );
  const cases = requiredRecordListNonEmpty(data, 'cases', file);

  return {
    schemaVersion: requiredNumber(
      contract,
      'schema_version',
      `${file}#calculator_conformance`
    ),
    contractVersion: requiredString(
      contract,
      'contract_version',
      `${file}#calculator_conformance`
    ),
    engineVersionRange: requiredString(
      contract,
      'engine_version_range',
      `${file}#calculator_conformance`
    ),
    decimalInputPolicy: requiredString(
      contract,
      'decimal_input_policy',
      `${file}#calculator_conformance`
    ),
    maxInputDigits: requiredNumber(
      contract,
      'max_input_digits',
      `${file}#calculator_conformance`
    ),
    maxDecimalPlaces: requiredNumber(
      contract,
      'max_decimal_places',
      `${file}#calculator_conformance`
    ),
    roundingMode: requiredString(
      contract,
      'rounding_mode',
      `${file}#calculator_conformance`
    ),
    cases: cases.map(parseCalculatorConformanceCase)
  };
}

export function parseCalculatorConformanceCase(
  testCase: Record<string, unknown>,
  index: number
): CalculatorConformanceCase {
  const context = `contracts/calculators/conformance.yaml#cases[${index}]`;
  assertOnlyKeys(
    testCase,
    ['id', 'calculator_id', 'input', 'options', 'expected'],
    context
  );
  const input = requiredObject(testCase, 'input', context);
  const options = requiredObject(testCase, 'options', context);
  const expected = requiredObject(testCase, 'expected', context);
  assertOnlyKeys(options, ['decimal_places'], `${context}.options`);

  const decimalPlaces = options.decimal_places;
  if (decimalPlaces !== undefined && typeof decimalPlaces !== 'number') {
    throw new Error(`${context}.options.decimal_places must be a number when declared.`);
  }

  return {
    id: requiredString(testCase, 'id', context),
    calculatorId: requiredString(testCase, 'calculator_id', context),
    input: Object.fromEntries(
      Object.entries(input).map(([key, value]) => [
        key,
        parseCalculatorConformanceInputValue(value, `${context}.input.${key}`)
      ])
    ),
    options: decimalPlaces === undefined ? {} : { decimalPlaces },
    expected: parseCalculatorConformanceExpectation(expected, context)
  };
}

export function parseCalculatorConformanceInputValue(
  value: unknown,
  context: string
): CalculatorConformanceInputValue {
  if (typeof value === 'string') {
    return value;
  }
  if (!isRecord(value)) {
    throw new Error(`${context} must be a decimal string or value/unit object.`);
  }
  return parseCalculatorConformanceUnitValue(value, context);
}

export function parseCalculatorConformanceExpectation(
  expected: Record<string, unknown>,
  context: string
): CalculatorConformanceExpectation {
  const status = requiredString(expected, 'status', `${context}.expected`);
  if (status === 'success') {
    assertOnlyKeys(expected, ['status', 'output'], `${context}.expected`);
    const output = requiredObject(expected, 'output', `${context}.expected`);
    return {
      status,
      output: Object.fromEntries(
        Object.entries(output).map(([key, value]) => {
          if (!isRecord(value)) {
            throw new Error(`${context}.expected.output.${key} must be an object.`);
          }
          return [
            key,
            parseCalculatorConformanceOutputValue(
              value,
              `${context}.expected.output.${key}`
            )
          ];
        })
      )
    };
  }
  if (status === 'error') {
    assertOnlyKeys(expected, ['status', 'error_code'], `${context}.expected`);
    return {
      status,
      errorCode: requiredString(
        expected,
        'error_code',
        `${context}.expected`
      )
    };
  }
  throw new Error(`${context}.expected.status must be success or error.`);
}

export function parseCalculatorConformanceOutputValue(
  value: Record<string, unknown>,
  context: string
): { readonly value: string | number; readonly unit: string } {
  assertOnlyKeys(value, ['value', 'unit'], context);
  const outputValue = value.value;
  if (typeof outputValue !== 'string' && typeof outputValue !== 'number') {
    throw new Error(`${context}.value must be a decimal string or integer number.`);
  }
  return {
    value: outputValue,
    unit: requiredString(value, 'unit', context)
  };
}

export function parseCalculatorConformanceUnitValue(
  value: Record<string, unknown>,
  context: string
): CalculatorConformanceUnitValue {
  assertOnlyKeys(value, ['value', 'unit'], context);
  return {
    value: requiredString(value, 'value', context),
    unit: requiredString(value, 'unit', context)
  };
}
