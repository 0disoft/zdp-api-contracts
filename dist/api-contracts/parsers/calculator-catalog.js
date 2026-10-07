import { assertOnlyKeys, parseYamlObject, requiredBoolean, requiredNumber, requiredObject, requiredRecordListAllowEmpty, requiredRecordListNonEmpty, requiredString, requiredStringList, requiredStringListAllowEmpty } from './shared.js';
export function parseCalculatorCatalogContract(source) {
    const file = 'contracts/calculators/catalog.yaml';
    const data = parseYamlObject(source, file);
    assertOnlyKeys(data, ['calculator_contract', 'definitions'], file);
    const calculatorContract = requiredObject(data, 'calculator_contract', file);
    assertOnlyKeys(calculatorContract, [
        'schema_version',
        'status',
        'contract_version',
        'owner_boundary',
        'required_definition_fields',
        'allowed_lifecycle_statuses',
        'allowed_value_kinds',
        'allowed_unit_dimensions',
        'allowed_unit_policies',
        'stable_error_codes'
    ], `${file}#calculator_contract`);
    const definitions = requiredRecordListAllowEmpty(data, 'definitions', file);
    return {
        schemaVersion: requiredNumber(calculatorContract, 'schema_version', `${file}#calculator_contract`),
        status: requiredString(calculatorContract, 'status', `${file}#calculator_contract`),
        contractVersion: requiredString(calculatorContract, 'contract_version', `${file}#calculator_contract`),
        ownerBoundary: requiredString(calculatorContract, 'owner_boundary', `${file}#calculator_contract`),
        requiredDefinitionFields: requiredStringList(calculatorContract, 'required_definition_fields', `${file}#calculator_contract`),
        allowedLifecycleStatuses: requiredStringList(calculatorContract, 'allowed_lifecycle_statuses', `${file}#calculator_contract`),
        allowedValueKinds: requiredStringList(calculatorContract, 'allowed_value_kinds', `${file}#calculator_contract`),
        allowedUnitDimensions: requiredStringList(calculatorContract, 'allowed_unit_dimensions', `${file}#calculator_contract`),
        allowedUnitPolicies: requiredStringList(calculatorContract, 'allowed_unit_policies', `${file}#calculator_contract`),
        stableErrorCodes: requiredStringList(calculatorContract, 'stable_error_codes', `${file}#calculator_contract`),
        definitions: definitions.map(parseCalculatorDefinition)
    };
}
export function parseCalculatorDefinition(definition, index) {
    const context = `contracts/calculators/catalog.yaml#definitions[${index}]`;
    assertOnlyKeys(definition, [
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
    ], context);
    const inputs = requiredRecordListNonEmpty(definition, 'inputs', context);
    const outputs = requiredRecordListNonEmpty(definition, 'outputs', context);
    return {
        id: requiredString(definition, 'id', context),
        lifecycleStatus: requiredString(definition, 'lifecycle_status', context),
        contractVersion: requiredString(definition, 'contract_version', context),
        compatibleEngineVersions: requiredStringList(definition, 'compatible_engine_versions', context),
        jurisdiction: requiredString(definition, 'jurisdiction', context),
        precisionPolicy: requiredString(definition, 'precision_policy', context),
        roundingPolicy: requiredString(definition, 'rounding_policy', context),
        inputs: inputs.map((input, inputIndex) => parseCalculatorInput(input, `${context}.inputs[${inputIndex}]`)),
        outputs: outputs.map((output, outputIndex) => parseCalculatorOutput(output, `${context}.outputs[${outputIndex}]`)),
        errorCodes: requiredStringList(definition, 'error_codes', context),
        semanticRules: requiredStringList(definition, 'semantic_rules', context)
    };
}
export function parseCalculatorInput(input, context) {
    assertOnlyKeys(input, [
        'id',
        'value_kind',
        'unit_dimension',
        'unit_policy',
        'unit_options',
        'allowed_values',
        'required',
        'domain'
    ], context);
    return {
        id: requiredString(input, 'id', context),
        valueKind: requiredString(input, 'value_kind', context),
        unitDimension: requiredString(input, 'unit_dimension', context),
        unitPolicy: requiredString(input, 'unit_policy', context),
        unitOptions: requiredStringListAllowEmpty(input, 'unit_options', context),
        allowedValues: requiredStringListAllowEmpty(input, 'allowed_values', context),
        required: requiredBoolean(input, 'required', context),
        domain: requiredString(input, 'domain', context)
    };
}
export function parseCalculatorOutput(output, context) {
    assertOnlyKeys(output, ['id', 'value_kind', 'unit_dimension', 'unit_policy', 'unit_options', 'required'], context);
    return {
        id: requiredString(output, 'id', context),
        valueKind: requiredString(output, 'value_kind', context),
        unitDimension: requiredString(output, 'unit_dimension', context),
        unitPolicy: requiredString(output, 'unit_policy', context),
        unitOptions: requiredStringListAllowEmpty(output, 'unit_options', context),
        ...(output.required === undefined ? {} : { required: requiredBoolean(output, 'required', context) })
    };
}
//# sourceMappingURL=calculator-catalog.js.map