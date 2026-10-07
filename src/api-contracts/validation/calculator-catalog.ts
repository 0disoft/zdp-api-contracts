import type { ApiContractDiagnostic, ApiContracts, CalculatorDefinition, CalculatorInputDefinition, CalculatorOutputDefinition } from '../types.js';

import { REVIEWED_CALCULATOR_IDS, includesValue } from './shared.js';

export const REQUIRED_CALCULATOR_DEFINITION_FIELDS = [
  'id',
  'lifecycle_status',
  'contract_version',
  'compatible_engine_versions',
  'jurisdiction',
  'precision_policy',
  'rounding_policy',
  'inputs',
  'outputs',
  'error_codes',
  'semantic_rules'
] as const;

export const REQUIRED_CALCULATOR_IDS = [
  'percentage-change',
  'margin-markup',
  'break-even-point',
  'compound-interest',
  'data-transfer-time',
  'date-difference',
  'studycafe-seat-occupancy',
  'studycafe-break-even',
  'kiosk-roi',
  'unattended-labor-savings',
  'locker-revenue',
  'study-room-schedule-revenue',
  'security-cost-break-even',
  'discount',
  'age',
  'work-hours',
  'fuel-cost',
  'percentage',
  'margin-pricing',
  'break-even-planning',
  'compound-savings'
] as const;

export const ALLOWED_CALCULATOR_LIFECYCLE_STATUSES = [
  'draft',
  'reviewed',
  'active',
  'retired'
] as const;

export const ALLOWED_CALCULATOR_VALUE_KINDS = [
  'decimal',
  'integer',
  'date',
  'enum'
] as const;

export const ALLOWED_CALCULATOR_UNIT_DIMENSIONS = [
  'dimensionless',
  'percent',
  'currency',
  'count',
  'duration',
  'data_size',
  'data_rate',
  'date'
] as const;

export const ALLOWED_CALCULATOR_UNIT_POLICIES = [
  'none',
  'caller_supplied',
  'enumerated'
] as const;

export const STABLE_CALCULATOR_ERROR_CODES = [
  'invalid_input',
  'domain_error',
  'limit_exceeded',
  'contract_mismatch',
  'denominator_zero',
  'non_positive_contribution_margin',
  'unsupported_unit',
  'incompatible_units',
  'invalid_date_range',
  'precision_policy_required',
  'rounding_policy_required'
] as const;

export const REQUIRED_CALCULATOR_BASE_ERROR_CODES = [
  'invalid_input',
  'domain_error',
  'limit_exceeded',
  'contract_mismatch',
  'precision_policy_required',
  'rounding_policy_required'
] as const;

export const CALCULATOR_CATALOG_FILE = 'contracts/calculators/catalog.yaml';

export const DATE_DIFFERENCE_PRECISION_POLICY =
  'exact_integer_calendar_days_years_0001_to_9999';

export const DATE_DIFFERENCE_ROUNDING_POLICY = 'not_applicable_exact_integer';

export const REVIEWED_DECIMAL_PRECISION_POLICY =
  'canonical_ascii_decimal_string_max_1000_digits';

export const REVIEWED_DECIMAL_ROUNDING_POLICY =
  'caller_decimal_places_0_to_100_half_away_from_zero';

export const CALCULATOR_ID_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

export const CALCULATOR_FIELD_ID_PATTERN = /^[a-z][a-z0-9_]*$/;

export const CALCULATOR_RULE_PATTERN = /^[a-z][a-z0-9_]*$/;

export const CALCULATOR_VERSION_PATTERN = /^\d+\.\d+\.\d+$/;

export const CALCULATOR_ENGINE_VERSION_PATTERN = /^(?:\d+\.x|\d+\.\d+\.\d+)$/;

export function validateCalculatorCatalog(
  contracts: ApiContracts,
  diagnostics: ApiContractDiagnostic[]
): void {
  const catalog = contracts.calculatorCatalog;
  if (catalog.schemaVersion !== 1) {
    diagnostics.push({
      code: 'API_CALCULATOR_SCHEMA_VERSION_INVALID',
      file: CALCULATOR_CATALOG_FILE,
      path: 'calculator_contract.schema_version',
      message: 'Calculator contract schema_version must be 1.'
    });
  }
  if (catalog.status !== 'draft') {
    diagnostics.push({
      code: 'API_CALCULATOR_STATUS_INVALID',
      file: CALCULATOR_CATALOG_FILE,
      path: 'calculator_contract.status',
      message: 'Calculator catalog must stay draft until every first-batch definition is reviewed.'
    });
  }
  if (!CALCULATOR_VERSION_PATTERN.test(catalog.contractVersion)) {
    diagnostics.push({
      code: 'API_CALCULATOR_CONTRACT_VERSION_INVALID',
      file: CALCULATOR_CATALOG_FILE,
      path: 'calculator_contract.contract_version',
      message: 'Calculator contract_version must use numeric semver.'
    });
  }
  if (catalog.ownerBoundary !== 'calculator_contracts') {
    diagnostics.push({
      code: 'API_CALCULATOR_OWNER_BOUNDARY_INVALID',
      file: CALCULATOR_CATALOG_FILE,
      path: 'calculator_contract.owner_boundary',
      message: 'Calculator definitions must stay in the calculator_contracts owner boundary.'
    });
  }

  validateRequiredCatalogValues(
    catalog.requiredDefinitionFields,
    REQUIRED_CALCULATOR_DEFINITION_FIELDS,
    'API_CALCULATOR_REQUIRED_FIELD',
    'calculator_contract.required_definition_fields',
    diagnostics
  );
  validateRequiredCatalogValues(
    catalog.allowedLifecycleStatuses,
    ALLOWED_CALCULATOR_LIFECYCLE_STATUSES,
    'API_CALCULATOR_LIFECYCLE_STATUS',
    'calculator_contract.allowed_lifecycle_statuses',
    diagnostics
  );
  validateRequiredCatalogValues(
    catalog.allowedValueKinds,
    ALLOWED_CALCULATOR_VALUE_KINDS,
    'API_CALCULATOR_VALUE_KIND',
    'calculator_contract.allowed_value_kinds',
    diagnostics
  );
  validateRequiredCatalogValues(
    catalog.allowedUnitDimensions,
    ALLOWED_CALCULATOR_UNIT_DIMENSIONS,
    'API_CALCULATOR_UNIT_DIMENSION',
    'calculator_contract.allowed_unit_dimensions',
    diagnostics
  );
  validateRequiredCatalogValues(
    catalog.allowedUnitPolicies,
    ALLOWED_CALCULATOR_UNIT_POLICIES,
    'API_CALCULATOR_UNIT_POLICY',
    'calculator_contract.allowed_unit_policies',
    diagnostics
  );
  validateRequiredCatalogValues(
    catalog.stableErrorCodes,
    STABLE_CALCULATOR_ERROR_CODES,
    'API_CALCULATOR_STABLE_ERROR_CODE',
    'calculator_contract.stable_error_codes',
    diagnostics
  );

  validateUniqueCalculatorIds(catalog.definitions, diagnostics);
  for (const calculatorId of REQUIRED_CALCULATOR_IDS) {
    if (!catalog.definitions.some((definition) => definition.id === calculatorId)) {
      diagnostics.push({
        code: 'API_CALCULATOR_DEFINITION_MISSING',
        file: CALCULATOR_CATALOG_FILE,
        path: 'definitions',
        message: `Calculator definition \`${calculatorId}\` is required for the reviewed global batches.`
      });
    }
  }

  catalog.definitions.forEach((definition, index) =>
    validateCalculatorDefinition(contracts, definition, index, diagnostics)
  );
}

export function validateCalculatorDefinition(
  contracts: ApiContracts,
  definition: CalculatorDefinition,
  index: number,
  diagnostics: ApiContractDiagnostic[]
): void {
  const path = `definitions[${index}]`;
  if (!CALCULATOR_ID_PATTERN.test(definition.id)) {
    pushCalculatorDiagnostic(
      diagnostics,
      'API_CALCULATOR_ID_INVALID',
      `${path}.id`,
      `Calculator id \`${definition.id}\` must use stable kebab-case.`
    );
  }
  if (!includesValue(REQUIRED_CALCULATOR_IDS, definition.id)) {
    pushCalculatorDiagnostic(
      diagnostics,
      'API_CALCULATOR_ID_UNREVIEWED',
      `${path}.id`,
      `Calculator id \`${definition.id}\` is outside the reviewed global batches.`
    );
  }
  if (!contracts.calculatorCatalog.allowedLifecycleStatuses.includes(definition.lifecycleStatus)) {
    pushCalculatorDiagnostic(
      diagnostics,
      'API_CALCULATOR_LIFECYCLE_STATUS_INVALID',
      `${path}.lifecycle_status`,
      `Calculator lifecycle status \`${definition.lifecycleStatus}\` is not allowed.`
    );
  }
  if (definition.contractVersion !== contracts.calculatorCatalog.contractVersion) {
    pushCalculatorDiagnostic(
      diagnostics,
      'API_CALCULATOR_VERSION_MISMATCH',
      `${path}.contract_version`,
      'Calculator definition contract_version must match the catalog contract_version.'
    );
  }
  if (
    definition.compatibleEngineVersions.some(
      (version) => !CALCULATOR_ENGINE_VERSION_PATTERN.test(version)
    )
  ) {
    pushCalculatorDiagnostic(
      diagnostics,
      'API_CALCULATOR_ENGINE_VERSION_INVALID',
      `${path}.compatible_engine_versions`,
      'Compatible engine versions must use numeric semver or a numeric major.x range.'
    );
  }
  if (definition.jurisdiction !== 'global') {
    pushCalculatorDiagnostic(
      diagnostics,
      'API_CALCULATOR_JURISDICTION_INVALID',
      `${path}.jurisdiction`,
      'The first calculator batch must stay jurisdiction global.'
    );
  }
  const isReviewedCalculator = includesValue(
    REVIEWED_CALCULATOR_IDS,
    definition.id
  );
  const expectedPrecisionPolicy = definition.id === 'date-difference' || definition.id === 'age'
    ? DATE_DIFFERENCE_PRECISION_POLICY
    : isReviewedCalculator
    ? REVIEWED_DECIMAL_PRECISION_POLICY
    : 'explicit_before_active';
  const expectedRoundingPolicy = definition.id === 'date-difference' || definition.id === 'age'
    ? DATE_DIFFERENCE_ROUNDING_POLICY
    : isReviewedCalculator
    ? REVIEWED_DECIMAL_ROUNDING_POLICY
    : 'explicit_before_active';
  if (definition.precisionPolicy !== expectedPrecisionPolicy) {
    pushCalculatorDiagnostic(
      diagnostics,
      'API_CALCULATOR_PRECISION_POLICY_INVALID',
      `${path}.precision_policy`,
      `Calculator precision_policy must be \`${expectedPrecisionPolicy}\`.`
    );
  }
  if (definition.roundingPolicy !== expectedRoundingPolicy) {
    pushCalculatorDiagnostic(
      diagnostics,
      'API_CALCULATOR_ROUNDING_POLICY_INVALID',
      `${path}.rounding_policy`,
      `Calculator rounding_policy must be \`${expectedRoundingPolicy}\`.`
    );
  }
  const expectedLifecycle = isReviewedCalculator ? 'reviewed' : 'draft';
  if (definition.lifecycleStatus !== expectedLifecycle) {
    pushCalculatorDiagnostic(
      diagnostics,
      'API_CALCULATOR_REVIEW_STATE_INVALID',
      `${path}.lifecycle_status`,
      `Calculator lifecycle_status must be \`${expectedLifecycle}\` for the current implementation batch.`
    );
  }

  validateUniqueCalculatorFieldIds(definition, path, diagnostics);
  definition.inputs.forEach((input, inputIndex) =>
    validateCalculatorInput(
      contracts,
      input,
      `${path}.inputs[${inputIndex}]`,
      diagnostics
    )
  );
  definition.outputs.forEach((output, outputIndex) =>
    validateCalculatorOutput(
      contracts,
      output,
      `${path}.outputs[${outputIndex}]`,
      diagnostics
    )
  );

  const requiredErrorCodes = definition.id === 'date-difference' || definition.id === 'age'
    ? REQUIRED_CALCULATOR_BASE_ERROR_CODES.filter(
        (code) => code !== 'precision_policy_required' && code !== 'rounding_policy_required'
      )
    : REQUIRED_CALCULATOR_BASE_ERROR_CODES;
  for (const errorCode of requiredErrorCodes) {
    if (!definition.errorCodes.includes(errorCode)) {
      pushCalculatorDiagnostic(
        diagnostics,
        'API_CALCULATOR_BASE_ERROR_CODE_MISSING',
        `${path}.error_codes`,
        `Calculator \`${definition.id}\` must declare base error code \`${errorCode}\`.`
      );
    }
  }
  for (const errorCode of definition.errorCodes) {
    if (!contracts.calculatorCatalog.stableErrorCodes.includes(errorCode)) {
      pushCalculatorDiagnostic(
        diagnostics,
        'API_CALCULATOR_ERROR_CODE_INVALID',
        `${path}.error_codes`,
        `Calculator error code \`${errorCode}\` is not stable catalog metadata.`
      );
    }
  }
  validateUniqueStrings(
    definition.errorCodes,
    'API_CALCULATOR_ERROR_CODE_DUPLICATE',
    `${path}.error_codes`,
    diagnostics
  );
  validateUniqueStrings(
    definition.semanticRules,
    'API_CALCULATOR_SEMANTIC_RULE_DUPLICATE',
    `${path}.semantic_rules`,
    diagnostics
  );
  for (const rule of definition.semanticRules) {
    if (!CALCULATOR_RULE_PATTERN.test(rule)) {
      pushCalculatorDiagnostic(
        diagnostics,
        'API_CALCULATOR_SEMANTIC_RULE_INVALID',
        `${path}.semantic_rules`,
        `Semantic rule \`${rule}\` must use stable snake_case.`
      );
    }
  }
}

export function validateCalculatorInput(
  contracts: ApiContracts,
  input: CalculatorInputDefinition,
  path: string,
  diagnostics: ApiContractDiagnostic[]
): void {
  validateCalculatorField(contracts, input, path, diagnostics);
  if (!CALCULATOR_RULE_PATTERN.test(input.domain)) {
    pushCalculatorDiagnostic(
      diagnostics,
      'API_CALCULATOR_INPUT_DOMAIN_INVALID',
      `${path}.domain`,
      `Input domain \`${input.domain}\` must use stable snake_case.`
    );
  }
  if (input.valueKind === 'enum' && input.allowedValues.length === 0) {
    pushCalculatorDiagnostic(
      diagnostics,
      'API_CALCULATOR_ENUM_VALUES_MISSING',
      `${path}.allowed_values`,
      'Enum inputs must declare allowed_values.'
    );
  }
  if (input.valueKind !== 'enum' && input.allowedValues.length > 0) {
    pushCalculatorDiagnostic(
      diagnostics,
      'API_CALCULATOR_ENUM_VALUES_UNEXPECTED',
      `${path}.allowed_values`,
      'Only enum inputs may declare allowed_values.'
    );
  }
  validateUniqueStrings(
    input.allowedValues,
    'API_CALCULATOR_ENUM_VALUE_DUPLICATE',
    `${path}.allowed_values`,
    diagnostics
  );
}

export function validateCalculatorOutput(
  contracts: ApiContracts,
  output: CalculatorOutputDefinition,
  path: string,
  diagnostics: ApiContractDiagnostic[]
): void {
  validateCalculatorField(contracts, output, path, diagnostics);
}

export function validateCalculatorField(
  contracts: ApiContracts,
  field: CalculatorInputDefinition | CalculatorOutputDefinition,
  path: string,
  diagnostics: ApiContractDiagnostic[]
): void {
  if (!CALCULATOR_FIELD_ID_PATTERN.test(field.id)) {
    pushCalculatorDiagnostic(
      diagnostics,
      'API_CALCULATOR_FIELD_ID_INVALID',
      `${path}.id`,
      `Calculator field id \`${field.id}\` must use stable snake_case.`
    );
  }
  if (!contracts.calculatorCatalog.allowedValueKinds.includes(field.valueKind)) {
    pushCalculatorDiagnostic(
      diagnostics,
      'API_CALCULATOR_VALUE_KIND_INVALID',
      `${path}.value_kind`,
      `Calculator value kind \`${field.valueKind}\` is not allowed.`
    );
  }
  if (!contracts.calculatorCatalog.allowedUnitDimensions.includes(field.unitDimension)) {
    pushCalculatorDiagnostic(
      diagnostics,
      'API_CALCULATOR_UNIT_DIMENSION_INVALID',
      `${path}.unit_dimension`,
      `Calculator unit dimension \`${field.unitDimension}\` is not allowed.`
    );
  }
  if (!contracts.calculatorCatalog.allowedUnitPolicies.includes(field.unitPolicy)) {
    pushCalculatorDiagnostic(
      diagnostics,
      'API_CALCULATOR_UNIT_POLICY_INVALID',
      `${path}.unit_policy`,
      `Calculator unit policy \`${field.unitPolicy}\` is not allowed.`
    );
  }
  if (field.unitPolicy === 'enumerated' && field.unitOptions.length === 0) {
    pushCalculatorDiagnostic(
      diagnostics,
      'API_CALCULATOR_UNIT_OPTIONS_MISSING',
      `${path}.unit_options`,
      'Enumerated unit policy must declare unit_options.'
    );
  }
  if (field.unitPolicy !== 'enumerated' && field.unitOptions.length > 0) {
    pushCalculatorDiagnostic(
      diagnostics,
      'API_CALCULATOR_UNIT_OPTIONS_UNEXPECTED',
      `${path}.unit_options`,
      'Only enumerated unit policy may declare unit_options.'
    );
  }
  validateUniqueStrings(
    field.unitOptions,
    'API_CALCULATOR_UNIT_OPTION_DUPLICATE',
    `${path}.unit_options`,
    diagnostics
  );
  if (field.valueKind === 'date' && field.unitDimension !== 'date') {
    pushCalculatorDiagnostic(
      diagnostics,
      'API_CALCULATOR_DATE_DIMENSION_INVALID',
      `${path}.unit_dimension`,
      'Date values must use the date unit dimension.'
    );
  }
}

export function validateRequiredCatalogValues(
  actual: readonly string[],
  required: readonly string[],
  codePrefix: string,
  path: string,
  diagnostics: ApiContractDiagnostic[]
): void {
  for (const value of required) {
    if (!actual.includes(value)) {
      pushCalculatorDiagnostic(
        diagnostics,
        `${codePrefix}_MISSING`,
        path,
        `Calculator catalog must declare \`${value}\`.`
      );
    }
  }
  for (const value of actual) {
    if (!required.includes(value)) {
      pushCalculatorDiagnostic(
        diagnostics,
        `${codePrefix}_INVALID`,
        path,
        `Calculator catalog value \`${value}\` is not reviewed.`
      );
    }
  }
  validateUniqueStrings(
    actual,
    `${codePrefix}_DUPLICATE`,
    path,
    diagnostics
  );
}

export function validateUniqueCalculatorIds(
  definitions: readonly CalculatorDefinition[],
  diagnostics: ApiContractDiagnostic[]
): void {
  const ids = definitions.map((definition) => definition.id);
  validateUniqueStrings(
    ids,
    'API_CALCULATOR_ID_DUPLICATE',
    'definitions',
    diagnostics
  );
}

export function validateUniqueCalculatorFieldIds(
  definition: CalculatorDefinition,
  path: string,
  diagnostics: ApiContractDiagnostic[]
): void {
  validateUniqueStrings(
    definition.inputs.map((input) => input.id),
    'API_CALCULATOR_INPUT_ID_DUPLICATE',
    `${path}.inputs`,
    diagnostics
  );
  validateUniqueStrings(
    definition.outputs.map((output) => output.id),
    'API_CALCULATOR_OUTPUT_ID_DUPLICATE',
    `${path}.outputs`,
    diagnostics
  );
}

export function validateUniqueStrings(
  values: readonly string[],
  code: string,
  path: string,
  diagnostics: ApiContractDiagnostic[]
): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) {
      pushCalculatorDiagnostic(
        diagnostics,
        code,
        path,
        `Calculator contract value \`${value}\` must be unique.`
      );
    }
    seen.add(value);
  }
}

export function pushCalculatorDiagnostic(
  diagnostics: ApiContractDiagnostic[],
  code: string,
  path: string,
  message: string
): void {
  diagnostics.push({ code, file: CALCULATOR_CATALOG_FILE, path, message });
}
