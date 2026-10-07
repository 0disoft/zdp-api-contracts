import type { ApiContractDiagnostic, ApiContracts, CalculatorConformanceCase, CalculatorConformanceInputValue, CalculatorDefinition } from '../types.js';

import { REVIEWED_CALCULATOR_IDS, includesValue } from './shared.js';

export const CALCULATOR_CONFORMANCE_FILE = 'contracts/calculators/conformance.yaml';

export const CONFORMANCE_DECIMAL_INPUT_POLICY = 'canonical_ascii_decimal_string';

export const CONFORMANCE_ROUNDING_MODE = 'half_away_from_zero';

export const CONFORMANCE_MAX_INPUT_DIGITS = 1000;

export const CONFORMANCE_MAX_DECIMAL_PLACES = 100;

export const CANONICAL_CALCULATOR_DECIMAL_PATTERN = /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/;

export function validateCalculatorConformance(
  contracts: ApiContracts,
  diagnostics: ApiContractDiagnostic[]
): void {
  const conformance = contracts.calculatorConformance;
  if (conformance.schemaVersion !== 2) {
    pushCalculatorConformanceDiagnostic(
      diagnostics,
      'API_CALCULATOR_CONFORMANCE_SCHEMA_VERSION_INVALID',
      'calculator_conformance.schema_version',
      'Calculator conformance schema_version must be 2.'
    );
  }
  if (conformance.contractVersion !== contracts.calculatorCatalog.contractVersion) {
    pushCalculatorConformanceDiagnostic(
      diagnostics,
      'API_CALCULATOR_CONFORMANCE_VERSION_MISMATCH',
      'calculator_conformance.contract_version',
      'Calculator conformance contract_version must match the calculator catalog.'
    );
  }
  if (conformance.engineVersionRange !== '0.x') {
    pushCalculatorConformanceDiagnostic(
      diagnostics,
      'API_CALCULATOR_CONFORMANCE_ENGINE_VERSION_INVALID',
      'calculator_conformance.engine_version_range',
      'The calculator engine compatibility range must be `0.x`.'
    );
  }
  if (conformance.decimalInputPolicy !== CONFORMANCE_DECIMAL_INPUT_POLICY) {
    pushCalculatorConformanceDiagnostic(
      diagnostics,
      'API_CALCULATOR_CONFORMANCE_INPUT_POLICY_INVALID',
      'calculator_conformance.decimal_input_policy',
      `Decimal input policy must be \`${CONFORMANCE_DECIMAL_INPUT_POLICY}\`.`
    );
  }
  if (conformance.maxInputDigits !== CONFORMANCE_MAX_INPUT_DIGITS) {
    pushCalculatorConformanceDiagnostic(
      diagnostics,
      'API_CALCULATOR_CONFORMANCE_INPUT_LIMIT_INVALID',
      'calculator_conformance.max_input_digits',
      `max_input_digits must be ${CONFORMANCE_MAX_INPUT_DIGITS}.`
    );
  }
  if (conformance.maxDecimalPlaces !== CONFORMANCE_MAX_DECIMAL_PLACES) {
    pushCalculatorConformanceDiagnostic(
      diagnostics,
      'API_CALCULATOR_CONFORMANCE_DECIMAL_PLACES_INVALID',
      'calculator_conformance.max_decimal_places',
      `max_decimal_places must be ${CONFORMANCE_MAX_DECIMAL_PLACES}.`
    );
  }
  if (conformance.roundingMode !== CONFORMANCE_ROUNDING_MODE) {
    pushCalculatorConformanceDiagnostic(
      diagnostics,
      'API_CALCULATOR_CONFORMANCE_ROUNDING_INVALID',
      'calculator_conformance.rounding_mode',
      `rounding_mode must be \`${CONFORMANCE_ROUNDING_MODE}\`.`
    );
  }

  validateUniqueConformanceCaseIds(conformance.cases, diagnostics);
  for (const calculatorId of REVIEWED_CALCULATOR_IDS) {
    const definition = contracts.calculatorCatalog.definitions.find(
      (candidate) => candidate.id === calculatorId
    );
    const cases = conformance.cases.filter(
      (testCase) => testCase.calculatorId === calculatorId
    );
    if (!cases.some((testCase) => testCase.expected.status === 'success')) {
      pushCalculatorConformanceDiagnostic(
        diagnostics,
        'API_CALCULATOR_CONFORMANCE_SUCCESS_CASE_MISSING',
        'cases',
        `Reviewed calculator \`${calculatorId}\` needs a success fixture.`
      );
    }
    if (!cases.some((testCase) => testCase.expected.status === 'error')) {
      pushCalculatorConformanceDiagnostic(
        diagnostics,
        'API_CALCULATOR_CONFORMANCE_ERROR_CASE_MISSING',
        'cases',
        `Reviewed calculator \`${calculatorId}\` needs an error fixture.`
      );
    }
    if (definition) {
      for (const input of definition.inputs) {
        if (input.unitPolicy !== 'enumerated') {
          continue;
        }
        for (const unit of input.unitOptions) {
          const covered = cases.some((testCase) => {
            if (testCase.expected.status !== 'success') {
              return false;
            }
            const value = testCase.input[input.id];
            return value !== undefined && typeof value !== 'string' && value.unit === unit;
          });
          if (!covered) {
            pushCalculatorConformanceDiagnostic(
              diagnostics,
              'API_CALCULATOR_CONFORMANCE_UNIT_COVERAGE_MISSING',
              'cases',
              `Reviewed calculator \`${calculatorId}\` needs a successful \`${input.id}\` fixture for unit \`${unit}\`.`
            );
          }
        }
        for (const allowedValue of input.allowedValues) {
          const covered = cases.some((testCase) =>
            testCase.expected.status === 'success' &&
            testCase.input[input.id] === allowedValue
          );
          if (!covered) {
            pushCalculatorConformanceDiagnostic(
              diagnostics,
              'API_CALCULATOR_CONFORMANCE_ENUM_COVERAGE_MISSING',
              'cases',
              `Reviewed calculator \`${calculatorId}\` needs a successful \`${input.id}\` fixture for value \`${allowedValue}\`.`
            );
          }
        }
      }
    }
  }
  conformance.cases.forEach((testCase, index) =>
    validateCalculatorConformanceCase(contracts, testCase, index, diagnostics)
  );
}

export function validateCalculatorConformanceCase(
  contracts: ApiContracts,
  testCase: CalculatorConformanceCase,
  index: number,
  diagnostics: ApiContractDiagnostic[]
): void {
  const path = `cases[${index}]`;
  if (!/^[a-z][a-z0-9-]*\.[a-z][a-z0-9-]*$/.test(testCase.id)) {
    pushCalculatorConformanceDiagnostic(
      diagnostics,
      'API_CALCULATOR_CONFORMANCE_CASE_ID_INVALID',
      `${path}.id`,
      `Conformance case id \`${testCase.id}\` must use calculator.case kebab-case.`
    );
  }
  const definition = contracts.calculatorCatalog.definitions.find(
    (candidate) => candidate.id === testCase.calculatorId
  );
  if (!definition || !includesValue(REVIEWED_CALCULATOR_IDS, testCase.calculatorId)) {
    pushCalculatorConformanceDiagnostic(
      diagnostics,
      'API_CALCULATOR_CONFORMANCE_CALCULATOR_INVALID',
      `${path}.calculator_id`,
      `Conformance calculator \`${testCase.calculatorId}\` is not in the reviewed engine batch.`
    );
    return;
  }
  const expectsIntegerOutput = definition.outputs.every(
    (output) => output.valueKind === 'integer'
  );
  if (expectsIntegerOutput && testCase.options.decimalPlaces !== undefined) {
    pushCalculatorConformanceDiagnostic(
      diagnostics,
      'API_CALCULATOR_CONFORMANCE_DECIMAL_PLACES_NOT_APPLICABLE',
      `${path}.options.decimal_places`,
      'Exact integer calculators must not declare decimal_places.'
    );
  } else if (
    !expectsIntegerOutput && (
      !Number.isInteger(testCase.options.decimalPlaces) ||
      (testCase.options.decimalPlaces ?? -1) < 0 ||
      (testCase.options.decimalPlaces ?? -1) > CONFORMANCE_MAX_DECIMAL_PLACES
    )
  ) {
    pushCalculatorConformanceDiagnostic(
      diagnostics,
      'API_CALCULATOR_CONFORMANCE_DECIMAL_PLACES_OUT_OF_RANGE',
      `${path}.options.decimal_places`,
      `decimal_places must be an integer from 0 to ${CONFORMANCE_MAX_DECIMAL_PLACES}.`
    );
  }
  validateConformanceKeys(
    Object.keys(testCase.input),
    definition.inputs.map((input) => input.id),
    `${path}.input`,
    diagnostics,
    definition.inputs.filter((input) => input.required).map((input) => input.id)
  );
  const unsupportedInputUnits = validateCalculatorConformanceInputs(
    contracts,
    definition,
    testCase,
    path,
    diagnostics
  );
  if (testCase.expected.status === 'success') {
    validateConformanceKeys(
      Object.keys(testCase.expected.output),
      definition.outputs.map((output) => output.id),
      `${path}.expected.output`,
      diagnostics,
      definition.outputs.filter((output) => output.required !== false).map((output) => output.id)
    );
    for (const [field, output] of Object.entries(testCase.expected.output)) {
      const definitionOutput = definition.outputs.find(
        (candidate) => candidate.id === field
      );
      if (definitionOutput?.valueKind === 'integer') {
        if (!Number.isSafeInteger(output.value)) {
          pushCalculatorConformanceDiagnostic(
            diagnostics,
            'API_CALCULATOR_CONFORMANCE_OUTPUT_VALUE_INVALID',
            `${path}.expected.output.${field}.value`,
            'Successful exact-integer fixture output values must be safe JSON integers.'
          );
        }
      } else if (
        typeof output.value !== 'string' ||
        !CANONICAL_CALCULATOR_DECIMAL_PATTERN.test(output.value)
      ) {
        pushCalculatorConformanceDiagnostic(
          diagnostics,
          'API_CALCULATOR_CONFORMANCE_OUTPUT_VALUE_INVALID',
          `${path}.expected.output.${field}.value`,
          'Successful fixture output values must be canonical ASCII decimal strings.'
        );
      }
      if (!definitionOutput) {
        continue;
      }
      if (
        definitionOutput.unitPolicy === 'enumerated' &&
        !definitionOutput.unitOptions.includes(output.unit)
      ) {
        pushCalculatorConformanceDiagnostic(
          diagnostics,
          'API_CALCULATOR_CONFORMANCE_OUTPUT_UNIT_INVALID',
          `${path}.expected.output.${field}.unit`,
          `Successful fixture output unit \`${output.unit}\` is not declared by \`${field}\`.`
        );
      }
      if (
        definitionOutput.unitPolicy === 'caller_supplied' &&
        !calculatorCallerSuppliedUnits(definition, testCase.input).includes(
          output.unit
        )
      ) {
        pushCalculatorConformanceDiagnostic(
          diagnostics,
          'API_CALCULATOR_CONFORMANCE_OUTPUT_UNIT_INVALID',
          `${path}.expected.output.${field}.unit`,
          `Successful fixture output unit \`${output.unit}\` must come from a caller-supplied input unit.`
        );
      }
      if (
        definitionOutput.valueKind !== 'integer' &&
        typeof output.value === 'string' &&
        decimalPlacesInCanonicalValue(output.value) !==
        testCase.options.decimalPlaces
      ) {
        pushCalculatorConformanceDiagnostic(
          diagnostics,
          'API_CALCULATOR_CONFORMANCE_OUTPUT_PRECISION_INVALID',
          `${path}.expected.output.${field}.value`,
          `Successful fixture output must use exactly ${testCase.options.decimalPlaces} decimal places.`
        );
      }
    }
  } else if (!definition.errorCodes.includes(testCase.expected.errorCode)) {
    pushCalculatorConformanceDiagnostic(
      diagnostics,
      'API_CALCULATOR_CONFORMANCE_ERROR_CODE_INVALID',
      `${path}.expected.error_code`,
      `Error fixture code \`${testCase.expected.errorCode}\` is not declared by \`${definition.id}\`.`
    );
  } else if (
    testCase.expected.errorCode === 'unsupported_unit' &&
    unsupportedInputUnits.length === 0
  ) {
    pushCalculatorConformanceDiagnostic(
      diagnostics,
      'API_CALCULATOR_CONFORMANCE_UNSUPPORTED_UNIT_CASE_INVALID',
      `${path}.input`,
      'An unsupported_unit fixture must contain at least one unit outside its enumerated input contract.'
    );
  }
}

export function validateCalculatorConformanceInputs(
  contracts: ApiContracts,
  definition: CalculatorDefinition,
  testCase: CalculatorConformanceCase,
  path: string,
  diagnostics: ApiContractDiagnostic[]
): readonly string[] {
  const unsupportedUnits: string[] = [];
  const skipDecimalShape =
    testCase.expected.status === 'error' &&
    (testCase.expected.errorCode === 'invalid_input' ||
      testCase.expected.errorCode === 'limit_exceeded');

  for (const input of definition.inputs) {
    const value = testCase.input[input.id];
    if (value === undefined) {
      continue;
    }
    const inputPath = `${path}.input.${input.id}`;
    const decimalValue = calculatorConformanceDecimalValue(
      value,
      input.unitPolicy,
      inputPath,
      diagnostics
    );

    if (typeof value !== 'string' && input.unitPolicy === 'enumerated') {
      if (!input.unitOptions.includes(value.unit)) {
        unsupportedUnits.push(input.id);
        if (
          testCase.expected.status !== 'error' ||
          testCase.expected.errorCode !== 'unsupported_unit'
        ) {
          pushCalculatorConformanceDiagnostic(
            diagnostics,
            'API_CALCULATOR_CONFORMANCE_INPUT_UNIT_INVALID',
            `${inputPath}.unit`,
            `Fixture input unit \`${value.unit}\` is not declared by \`${input.id}\`.`
          );
        }
      }
    }

    if (
      input.valueKind === 'enum' &&
      typeof value === 'string' &&
      !input.allowedValues.includes(value) &&
      (testCase.expected.status !== 'error' ||
        testCase.expected.errorCode !== 'invalid_input')
    ) {
      pushCalculatorConformanceDiagnostic(
        diagnostics,
        'API_CALCULATOR_CONFORMANCE_ENUM_VALUE_INVALID',
        inputPath,
        `Fixture enum value \`${value}\` is not declared by \`${input.id}\`.`
      );
    }

    if (
      input.valueKind === 'decimal' &&
      decimalValue !== undefined &&
      !skipDecimalShape
    ) {
      if (!CANONICAL_CALCULATOR_DECIMAL_PATTERN.test(decimalValue)) {
        pushCalculatorConformanceDiagnostic(
          diagnostics,
          'API_CALCULATOR_CONFORMANCE_INPUT_VALUE_INVALID',
          `${inputPath}${typeof value === 'string' ? '' : '.value'}`,
          'Fixture decimal inputs must be canonical ASCII decimal strings.'
        );
      } else if (
        decimalValue.replace(/[-.]/g, '').length >
        contracts.calculatorConformance.maxInputDigits
      ) {
        pushCalculatorConformanceDiagnostic(
          diagnostics,
          'API_CALCULATOR_CONFORMANCE_INPUT_LIMIT_INVALID',
          `${inputPath}${typeof value === 'string' ? '' : '.value'}`,
          `Fixture decimal inputs must not exceed ${contracts.calculatorConformance.maxInputDigits} digits.`
        );
      }
    }
  }

  return unsupportedUnits;
}

export function calculatorConformanceDecimalValue(
  value: CalculatorConformanceInputValue,
  unitPolicy: string,
  path: string,
  diagnostics: ApiContractDiagnostic[]
): string | undefined {
  if (unitPolicy === 'none') {
    if (typeof value === 'string') {
      return value;
    }
    pushCalculatorConformanceDiagnostic(
      diagnostics,
      'API_CALCULATOR_CONFORMANCE_INPUT_SHAPE_INVALID',
      path,
      'A fixture input without units must be a decimal string.'
    );
    return undefined;
  }
  if (typeof value !== 'string') {
    return value.value;
  }
  pushCalculatorConformanceDiagnostic(
    diagnostics,
    'API_CALCULATOR_CONFORMANCE_INPUT_SHAPE_INVALID',
    path,
    'A fixture input with a unit policy must be a value/unit object.'
  );
  return undefined;
}

export function calculatorCallerSuppliedUnits(
  definition: CalculatorDefinition,
  input: Readonly<Record<string, CalculatorConformanceInputValue>>
): readonly string[] {
  return definition.inputs.flatMap((field) => {
    const value = input[field.id];
    return field.unitPolicy === 'caller_supplied' &&
      value !== undefined &&
      typeof value !== 'string'
      ? [value.unit]
      : [];
  });
}

export function decimalPlacesInCanonicalValue(value: string): number {
  const decimalPoint = value.indexOf('.');
  return decimalPoint === -1 ? 0 : value.length - decimalPoint - 1;
}

export function validateConformanceKeys(
  actual: readonly string[],
  expected: readonly string[],
  path: string,
  diagnostics: ApiContractDiagnostic[],
  required: readonly string[] = expected
): void {
  for (const key of required) {
    if (!actual.includes(key)) {
      pushCalculatorConformanceDiagnostic(
        diagnostics,
        'API_CALCULATOR_CONFORMANCE_FIELD_MISSING',
        path,
        `Conformance fixture must include field \`${key}\`.`
      );
    }
  }
  for (const key of actual) {
    if (!expected.includes(key)) {
      pushCalculatorConformanceDiagnostic(
        diagnostics,
        'API_CALCULATOR_CONFORMANCE_FIELD_UNKNOWN',
        `${path}.${key}`,
        `Conformance fixture field \`${key}\` is not declared by the calculator contract.`
      );
    }
  }
}

export function validateUniqueConformanceCaseIds(
  cases: readonly CalculatorConformanceCase[],
  diagnostics: ApiContractDiagnostic[]
): void {
  const seen = new Set<string>();
  cases.forEach((testCase, index) => {
    if (seen.has(testCase.id)) {
      pushCalculatorConformanceDiagnostic(
        diagnostics,
        'API_CALCULATOR_CONFORMANCE_CASE_DUPLICATE',
        `cases[${index}].id`,
        `Conformance case id \`${testCase.id}\` must be unique.`
      );
    }
    seen.add(testCase.id);
  });
}

export function pushCalculatorConformanceDiagnostic(
  diagnostics: ApiContractDiagnostic[],
  code: string,
  path: string,
  message: string
): void {
  diagnostics.push({
    code,
    file: CALCULATOR_CONFORMANCE_FILE,
    path,
    message
  });
}
