import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parse } from 'yaml';
import type {
  ApiCatalogContract,
  ApiContracts,
  ApiRouteDefinition,
  ApiSchemaDefinition,
  ApiSchemaBundleContract,
  CalculatorCatalogContract,
  CalculatorConformanceCase,
  CalculatorConformanceContract,
  CalculatorConformanceExpectation,
  CalculatorConformanceInputValue,
  CalculatorConformanceUnitValue,
  CalculatorDefinition,
  CalculatorInputDefinition,
  CalculatorOutputDefinition,
  ErrorEnvelopeContract,
  RouteContract,
  SdkGenerationInputContract,
  WebhookContract
} from './types.js';

const REQUIRED_CORE_API_SCHEMA_BUNDLE_FILES = [
  'contracts/apis/core-api/auth-session.yaml'
] as const;

interface ContractLoadFailure {
  readonly name: string;
  readonly file: string;
  readonly message: string;
}

type ContractLoadResult<T> =
  | {
      readonly ok: true;
      readonly name: string;
      readonly file: string;
      readonly value: T;
    }
  | {
      readonly ok: false;
      readonly name: string;
      readonly file: string;
      readonly message: string;
    };

type ContractLoadFailureResult = Extract<
  ContractLoadResult<unknown>,
  { readonly ok: false }
>;

export class ApiContractLoadError extends Error {
  readonly failures: readonly ContractLoadFailure[];

  constructor(failures: readonly ContractLoadFailure[]) {
    super(
      [
        'API contract load failed.',
        ...failures.map(
          (failure) => `- ${failure.file}: ${failure.message}`
        )
      ].join('\n')
    );
    this.name = 'ApiContractLoadError';
    this.failures = failures;
  }
}

/**
 * mf:anchor zdp.api-contracts.contract-loader
 * purpose: Locate the loader that turns YAML contract files into typed API contract objects.
 * search: api contracts, yaml load, route catalog, schema bundles, sdk input
 * invariant: Missing or malformed contract files fail before validator or export planning runs.
 * risk: data_consistency
 */
export async function loadApiContracts(root = process.cwd()): Promise<ApiContracts> {
  const contractsRoot = join(root, 'contracts');
  const [
    route,
    errorEnvelope,
    webhook,
    sdkGenerationInput,
    apiCatalog,
    calculatorCatalog,
    calculatorConformance
  ] =
    await Promise.all([
      loadContract(
        contractsRoot,
        'route',
        'route-contract.yaml',
        parseRouteContract
      ),
      loadContract(
        contractsRoot,
        'error-envelope',
        'error-envelope.yaml',
        parseErrorEnvelopeContract
      ),
      loadContract(
        contractsRoot,
        'webhook',
        'webhook-contract.yaml',
        parseWebhookContract
      ),
      loadContract(
        contractsRoot,
        'sdk-generation-input',
        'sdk-generation-input.yaml',
        parseSdkGenerationInputContract
      ),
      loadContract(
        contractsRoot,
        'api-catalog',
        join('apis', 'catalog.yaml'),
        parseApiCatalogContract
      ),
      loadContract(
        contractsRoot,
        'calculator-catalog',
        join('calculators', 'catalog.yaml'),
        parseCalculatorCatalogContract
      ),
      loadContract(
        contractsRoot,
        'calculator-conformance',
        join('calculators', 'conformance.yaml'),
        parseCalculatorConformanceContract
      )
    ]);

  const results = [
    route,
    errorEnvelope,
    webhook,
    sdkGenerationInput,
    apiCatalog,
    calculatorCatalog,
    calculatorConformance
  ] as const;
  const failures = results.filter(isContractLoadFailure);
  if (failures.length > 0) {
    throw new ApiContractLoadError(failures);
  }

  const loadedRoute = requireLoadedContract(route);
  const loadedErrorEnvelope = requireLoadedContract(errorEnvelope);
  const loadedWebhook = requireLoadedContract(webhook);
  const loadedSdkGenerationInput = requireLoadedContract(sdkGenerationInput);
  const loadedApiCatalog = requireLoadedContract(apiCatalog);
  const loadedCalculatorCatalog = requireLoadedContract(calculatorCatalog);
  const loadedCalculatorConformance = requireLoadedContract(
    calculatorConformance
  );
  const schemaBundleResults = await Promise.all(
    schemaBundleFilesFromCatalog(loadedApiCatalog.value).map((file) =>
      loadContract(
        contractsRoot,
        `schema-bundle:${file}`,
        schemaBundleRelativeFile(file),
        (source) => parseApiSchemaBundleContract(source, file)
      )
    )
  );
  const schemaBundleFailures = schemaBundleResults.filter(isContractLoadFailure);
  if (schemaBundleFailures.length > 0) {
    throw new ApiContractLoadError(schemaBundleFailures);
  }

  return {
    route: loadedRoute.value,
    errorEnvelope: loadedErrorEnvelope.value,
    webhook: loadedWebhook.value,
    sdkGenerationInput: loadedSdkGenerationInput.value,
    apiCatalog: loadedApiCatalog.value,
    schemaBundles: schemaBundleResults.map(
      (result) => requireLoadedContract(result).value
    ),
    calculatorCatalog: loadedCalculatorCatalog.value,
    calculatorConformance: loadedCalculatorConformance.value
  };
}

export function parseRouteContract(source: string): RouteContract {
  const data = parseYamlObject(source, 'contracts/route-contract.yaml');
  const routeContract = requiredObject(
    data,
    'route_contract',
    'contracts/route-contract.yaml'
  );

  return {
    status: requiredString(
      routeContract,
      'status',
      'contracts/route-contract.yaml#route_contract'
    ),
    requiredPerRoute: requiredStringList(
      routeContract,
      'required_per_route',
      'contracts/route-contract.yaml#route_contract'
    ),
    allowedMethods: requiredStringList(
      routeContract,
      'allowed_methods',
      'contracts/route-contract.yaml#route_contract'
    ),
    allowedSuccessStatuses: requiredNumberList(
      routeContract,
      'allowed_success_statuses',
      'contracts/route-contract.yaml#route_contract'
    ),
    forbiddenShapes: requiredStringList(
      routeContract,
      'forbidden_shapes',
      'contracts/route-contract.yaml#route_contract'
    ),
    allowedSessionEffects: requiredStringList(
      routeContract,
      'allowed_session_effects',
      'contracts/route-contract.yaml#route_contract'
    )
  };
}

export function parseErrorEnvelopeContract(
  source: string
): ErrorEnvelopeContract {
  const data = parseYamlObject(source, 'contracts/error-envelope.yaml');
  const errorEnvelope = requiredObject(
    data,
    'error_envelope',
    'contracts/error-envelope.yaml'
  );

  return {
    schemaVersion: requiredNumber(
      errorEnvelope,
      'schema_version',
      'contracts/error-envelope.yaml#error_envelope'
    ),
    requiredFields: requiredStringList(
      errorEnvelope,
      'required_fields',
      'contracts/error-envelope.yaml#error_envelope'
    ),
    optionalFields: requiredStringList(
      errorEnvelope,
      'optional_fields',
      'contracts/error-envelope.yaml#error_envelope'
    ),
    forbiddenFields: requiredStringList(
      errorEnvelope,
      'forbidden_fields',
      'contracts/error-envelope.yaml#error_envelope'
    )
  };
}

export function parseWebhookContract(source: string): WebhookContract {
  const data = parseYamlObject(source, 'contracts/webhook-contract.yaml');
  const webhookContract = requiredObject(
    data,
    'webhook_contract',
    'contracts/webhook-contract.yaml'
  );

  return {
    status: requiredString(
      webhookContract,
      'status',
      'contracts/webhook-contract.yaml#webhook_contract'
    ),
    requiredControls: requiredStringList(
      webhookContract,
      'required_controls',
      'contracts/webhook-contract.yaml#webhook_contract'
    ),
    forbiddenControls: requiredStringList(
      webhookContract,
      'forbidden_controls',
      'contracts/webhook-contract.yaml#webhook_contract'
    )
  };
}

export function parseSdkGenerationInputContract(
  source: string
): SdkGenerationInputContract {
  const data = parseYamlObject(source, 'contracts/sdk-generation-input.yaml');
  const sdkGenerationInput = requiredObject(
    data,
    'sdk_generation_input',
    'contracts/sdk-generation-input.yaml'
  );

  return {
    status: requiredString(
      sdkGenerationInput,
      'status',
      'contracts/sdk-generation-input.yaml#sdk_generation_input'
    ),
    sourceContracts: requiredStringList(
      sdkGenerationInput,
      'source_contracts',
      'contracts/sdk-generation-input.yaml#sdk_generation_input'
    ),
    generationTargets: requiredStringList(
      sdkGenerationInput,
      'generation_targets',
      'contracts/sdk-generation-input.yaml#sdk_generation_input'
    ),
    allowedGenerationTargets: requiredStringList(
      sdkGenerationInput,
      'allowed_generation_targets',
      'contracts/sdk-generation-input.yaml#sdk_generation_input'
    ),
    requiredRouteMetadata: requiredStringList(
      sdkGenerationInput,
      'required_route_metadata',
      'contracts/sdk-generation-input.yaml#sdk_generation_input'
    ),
    requiredErrorMetadata: requiredStringList(
      sdkGenerationInput,
      'required_error_metadata',
      'contracts/sdk-generation-input.yaml#sdk_generation_input'
    ),
    requiredClientRuntimeMetadata: requiredStringList(
      sdkGenerationInput,
      'required_client_runtime_metadata',
      'contracts/sdk-generation-input.yaml#sdk_generation_input'
    ),
    requiredWebhookMetadata: requiredStringList(
      sdkGenerationInput,
      'required_webhook_metadata',
      'contracts/sdk-generation-input.yaml#sdk_generation_input'
    ),
    forbiddenOwnership: requiredStringList(
      sdkGenerationInput,
      'forbidden_ownership',
      'contracts/sdk-generation-input.yaml#sdk_generation_input'
    ),
    forbiddenValues: requiredStringList(
      sdkGenerationInput,
      'forbidden_values',
      'contracts/sdk-generation-input.yaml#sdk_generation_input'
    )
  };
}

export function parseApiCatalogContract(source: string): ApiCatalogContract {
  const data = parseYamlObject(source, 'contracts/apis/catalog.yaml');
  const apiCatalog = requiredObject(
    data,
    'api_catalog',
    'contracts/apis/catalog.yaml'
  );
  const routes = requiredRecordListAllowEmpty(
    data,
    'routes',
    'contracts/apis/catalog.yaml'
  );

  return {
    status: requiredString(
      apiCatalog,
      'status',
      'contracts/apis/catalog.yaml#api_catalog'
    ),
    routeDefinitionRequiredFields: requiredStringList(
      apiCatalog,
      'route_definition_required_fields',
      'contracts/apis/catalog.yaml#api_catalog'
    ),
    forbiddenValues: requiredStringList(
      apiCatalog,
      'forbidden_values',
      'contracts/apis/catalog.yaml#api_catalog'
    ),
    routes: routes.map(parseApiRouteDefinition)
  };
}

export function parseCalculatorCatalogContract(
  source: string
): CalculatorCatalogContract {
  const file = 'contracts/calculators/catalog.yaml';
  const data = parseYamlObject(source, file);
  assertOnlyKeys(data, ['calculator_contract', 'definitions'], file);
  const calculatorContract = requiredObject(data, 'calculator_contract', file);
  assertOnlyKeys(
    calculatorContract,
    [
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
    ],
    `${file}#calculator_contract`
  );
  const definitions = requiredRecordListAllowEmpty(data, 'definitions', file);

  return {
    schemaVersion: requiredNumber(
      calculatorContract,
      'schema_version',
      `${file}#calculator_contract`
    ),
    status: requiredString(
      calculatorContract,
      'status',
      `${file}#calculator_contract`
    ),
    contractVersion: requiredString(
      calculatorContract,
      'contract_version',
      `${file}#calculator_contract`
    ),
    ownerBoundary: requiredString(
      calculatorContract,
      'owner_boundary',
      `${file}#calculator_contract`
    ),
    requiredDefinitionFields: requiredStringList(
      calculatorContract,
      'required_definition_fields',
      `${file}#calculator_contract`
    ),
    allowedLifecycleStatuses: requiredStringList(
      calculatorContract,
      'allowed_lifecycle_statuses',
      `${file}#calculator_contract`
    ),
    allowedValueKinds: requiredStringList(
      calculatorContract,
      'allowed_value_kinds',
      `${file}#calculator_contract`
    ),
    allowedUnitDimensions: requiredStringList(
      calculatorContract,
      'allowed_unit_dimensions',
      `${file}#calculator_contract`
    ),
    allowedUnitPolicies: requiredStringList(
      calculatorContract,
      'allowed_unit_policies',
      `${file}#calculator_contract`
    ),
    stableErrorCodes: requiredStringList(
      calculatorContract,
      'stable_error_codes',
      `${file}#calculator_contract`
    ),
    definitions: definitions.map(parseCalculatorDefinition)
  };
}

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

export function parseApiSchemaBundleContract(
  source: string,
  file = 'contracts/apis/<service>/<schema>.yaml'
): ApiSchemaBundleContract {
  const data = parseYamlObject(source, file);
  const schemaBundle = requiredObject(data, 'schema_bundle', file);
  const commonEnvelope = requiredObject(
    schemaBundle,
    'common_envelope',
    `${file}#schema_bundle`
  );
  const schemas = requiredRecordListAllowEmpty(
    schemaBundle,
    'schemas',
    `${file}#schema_bundle`
  );

  return {
    file,
    serviceId: requiredString(schemaBundle, 'service_id', `${file}#schema_bundle`),
    ownerBoundary: requiredString(
      schemaBundle,
      'owner_boundary',
      `${file}#schema_bundle`
    ),
    status: requiredString(schemaBundle, 'status', `${file}#schema_bundle`),
    purpose: requiredString(schemaBundle, 'purpose', `${file}#schema_bundle`),
    commonEnvelope: {
      requiredRequestMetadata: requiredStringList(
        commonEnvelope,
        'required_request_metadata',
        `${file}#schema_bundle.common_envelope`
      ),
      requiredResponseMetadata: requiredStringList(
        commonEnvelope,
        'required_response_metadata',
        `${file}#schema_bundle.common_envelope`
      ),
      forbiddenPayloadValues: requiredStringList(
        commonEnvelope,
        'forbidden_payload_values',
        `${file}#schema_bundle.common_envelope`
      )
    },
    schemas: schemas.map((schema, index) =>
      parseApiSchemaDefinition(schema, `${file}#schema_bundle.schemas[${index}]`)
    )
  };
}

async function loadContract<T>(
  contractsRoot: string,
  name: string,
  fileName: string,
  parse: (source: string) => T
): Promise<ContractLoadResult<T>> {
  const file = `contracts/${fileName.replaceAll('\\', '/')}`;

  try {
    return {
      ok: true,
      name,
      file,
      value: parse(await readFile(join(contractsRoot, fileName), 'utf8'))
    };
  } catch (error) {
    return {
      ok: false,
      name,
      file,
      message: error instanceof Error ? error.message : String(error)
    };
  }
}

function schemaBundleFilesFromCatalog(
  catalog: ApiCatalogContract
): readonly string[] {
  return uniqueSorted(
    [
      ...REQUIRED_CORE_API_SCHEMA_BUNDLE_FILES,
      ...catalog.routes.flatMap((route) => [
        schemaBundleFileFromRef(route.requestSchemaRef),
        schemaBundleFileFromRef(route.responseSchemaRef)
      ])
    ]
  );
}

function schemaBundleFileFromRef(schemaRef: string): string {
  const hashIndex = schemaRef.indexOf('#');
  return hashIndex === -1 ? schemaRef : schemaRef.slice(0, hashIndex);
}

function schemaBundleRelativeFile(file: string): string {
  return file.startsWith('contracts/') ? file.slice('contracts/'.length) : file;
}

function isContractLoadFailure(
  result: ContractLoadResult<unknown>
): result is ContractLoadFailureResult {
  return !result.ok;
}

function requireLoadedContract<T>(
  result: ContractLoadResult<T>
): Extract<ContractLoadResult<T>, { readonly ok: true }> {
  if (!result.ok) {
    throw new ApiContractLoadError([result]);
  }
  return result;
}

function parseApiRouteDefinition(
  route: Record<string, unknown>,
  index: number
): ApiRouteDefinition {
  const context = `contracts/apis/catalog.yaml#routes[${index}]`;

  return {
    operationId: requiredString(route, 'operation_id', context),
    serviceId: requiredString(route, 'service_id', context),
    resource: requiredString(route, 'resource', context),
    action: requiredString(route, 'action', context),
    method: requiredString(route, 'method', context),
    path: requiredString(route, 'path', context),
    successStatuses: requiredNumberList(route, 'success_statuses', context),
    requestSchemaRef: requiredString(route, 'request_schema_ref', context),
    responseSchemaRef: requiredString(route, 'response_schema_ref', context),
    authRequired: requiredBoolean(route, 'auth_required', context),
    permissionCheck: requiredString(route, 'permission_check', context),
    auditEvent: requiredString(route, 'audit_event', context),
    idempotency: requiredString(route, 'idempotency', context),
    ownerBoundary: requiredString(route, 'owner_boundary', context),
    tenantBoundary: requiredString(route, 'tenant_boundary', context),
    requestIdRequired: requiredBoolean(route, 'request_id_required', context),
    traceIdRequired: requiredBoolean(route, 'trace_id_required', context),
    sessionEffect: requiredString(route, 'session_effect', context),
    credentialPolicy: requiredString(route, 'credential_policy', context),
    errorCodes: requiredStringList(route, 'error_codes', context)
  };
}

function parseApiSchemaDefinition(
  schema: Record<string, unknown>,
  context: string
): ApiSchemaDefinition {
  return {
    id: requiredString(schema, 'id', context),
    kind: requiredString(schema, 'kind', context),
    carriesSecretMaterial: requiredBoolean(
      schema,
      'carries_secret_material',
      context
    ),
    secretMaterialPolicy: optionalString(
      schema,
      'secret_material_policy',
      context
    ),
    sessionEffect: optionalString(schema, 'session_effect', context),
    requiredFields: requiredStringListAllowEmpty(schema, 'required_fields', context),
    secretFields: optionalStringList(schema, 'secret_fields', context)
  };
}

function parseCalculatorDefinition(
  definition: Record<string, unknown>,
  index: number
): CalculatorDefinition {
  const context = `contracts/calculators/catalog.yaml#definitions[${index}]`;
  assertOnlyKeys(
    definition,
    [
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
    ],
    context
  );
  const inputs = requiredRecordListNonEmpty(definition, 'inputs', context);
  const outputs = requiredRecordListNonEmpty(definition, 'outputs', context);

  return {
    id: requiredString(definition, 'id', context),
    lifecycleStatus: requiredString(definition, 'lifecycle_status', context),
    contractVersion: requiredString(definition, 'contract_version', context),
    compatibleEngineVersions: requiredStringList(
      definition,
      'compatible_engine_versions',
      context
    ),
    jurisdiction: requiredString(definition, 'jurisdiction', context),
    precisionPolicy: requiredString(definition, 'precision_policy', context),
    roundingPolicy: requiredString(definition, 'rounding_policy', context),
    inputs: inputs.map((input, inputIndex) =>
      parseCalculatorInput(input, `${context}.inputs[${inputIndex}]`)
    ),
    outputs: outputs.map((output, outputIndex) =>
      parseCalculatorOutput(output, `${context}.outputs[${outputIndex}]`)
    ),
    errorCodes: requiredStringList(definition, 'error_codes', context),
    semanticRules: requiredStringList(definition, 'semantic_rules', context)
  };
}

function parseCalculatorInput(
  input: Record<string, unknown>,
  context: string
): CalculatorInputDefinition {
  assertOnlyKeys(
    input,
    [
      'id',
      'value_kind',
      'unit_dimension',
      'unit_policy',
      'unit_options',
      'allowed_values',
      'required',
      'domain'
    ],
    context
  );

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

function parseCalculatorOutput(
  output: Record<string, unknown>,
  context: string
): CalculatorOutputDefinition {
  assertOnlyKeys(
    output,
    ['id', 'value_kind', 'unit_dimension', 'unit_policy', 'unit_options'],
    context
  );

  return {
    id: requiredString(output, 'id', context),
    valueKind: requiredString(output, 'value_kind', context),
    unitDimension: requiredString(output, 'unit_dimension', context),
    unitPolicy: requiredString(output, 'unit_policy', context),
    unitOptions: requiredStringListAllowEmpty(output, 'unit_options', context)
  };
}

function parseCalculatorConformanceCase(
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

  return {
    id: requiredString(testCase, 'id', context),
    calculatorId: requiredString(testCase, 'calculator_id', context),
    input: Object.fromEntries(
      Object.entries(input).map(([key, value]) => [
        key,
        parseCalculatorConformanceInputValue(value, `${context}.input.${key}`)
      ])
    ),
    options: {
      decimalPlaces: requiredNumber(
        options,
        'decimal_places',
        `${context}.options`
      )
    },
    expected: parseCalculatorConformanceExpectation(expected, context)
  };
}

function parseCalculatorConformanceInputValue(
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

function parseCalculatorConformanceExpectation(
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
            parseCalculatorConformanceUnitValue(
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

function parseCalculatorConformanceUnitValue(
  value: Record<string, unknown>,
  context: string
): CalculatorConformanceUnitValue {
  assertOnlyKeys(value, ['value', 'unit'], context);
  return {
    value: requiredString(value, 'value', context),
    unit: requiredString(value, 'unit', context)
  };
}

function parseYamlObject(source: string, file: string): Record<string, unknown> {
  const data = parse(source) as unknown;
  if (!isRecord(data)) {
    throw new Error(`${file} must parse to a YAML object.`);
  }
  return data;
}

function requiredObject(
  data: Record<string, unknown>,
  key: string,
  context: string
): Record<string, unknown> {
  const value = data[key];
  if (!isRecord(value)) {
    throw new Error(`${context} must declare object field \`${key}\`.`);
  }
  return value;
}

function requiredStringList(
  data: Record<string, unknown>,
  key: string,
  context: string
): readonly string[] {
  const value = data[key];
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    !value.every((item) => typeof item === 'string' && item.trim().length > 0)
  ) {
    throw new Error(`${context} must declare non-empty string list \`${key}\`.`);
  }
  return value;
}

function requiredStringListAllowEmpty(
  data: Record<string, unknown>,
  key: string,
  context: string
): readonly string[] {
  const value = data[key];
  if (
    !Array.isArray(value) ||
    !value.every((item) => typeof item === 'string' && item.trim().length > 0)
  ) {
    throw new Error(`${context} must declare string list \`${key}\`.`);
  }
  return value;
}

function requiredNumberList(
  data: Record<string, unknown>,
  key: string,
  context: string
): readonly number[] {
  const value = data[key];
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    !value.every((item) => typeof item === 'number' && Number.isInteger(item))
  ) {
    throw new Error(`${context} must declare non-empty integer list \`${key}\`.`);
  }
  return value;
}

function requiredRecordListAllowEmpty(
  data: Record<string, unknown>,
  key: string,
  context: string
): readonly Record<string, unknown>[] {
  const value = data[key];
  if (!Array.isArray(value) || !value.every(isRecord)) {
    throw new Error(`${context} must declare object list \`${key}\`.`);
  }
  return value;
}

function requiredRecordListNonEmpty(
  data: Record<string, unknown>,
  key: string,
  context: string
): readonly Record<string, unknown>[] {
  const value = requiredRecordListAllowEmpty(data, key, context);
  if (value.length === 0) {
    throw new Error(`${context} must declare non-empty object list \`${key}\`.`);
  }
  return value;
}

function requiredString(
  data: Record<string, unknown>,
  key: string,
  context: string
): string {
  const value = data[key];
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${context} must declare string field \`${key}\`.`);
  }
  return value;
}

function requiredBoolean(
  data: Record<string, unknown>,
  key: string,
  context: string
): boolean {
  const value = data[key];
  if (typeof value !== 'boolean') {
    throw new Error(`${context} must declare boolean field \`${key}\`.`);
  }
  return value;
}

function optionalString(
  data: Record<string, unknown>,
  key: string,
  context: string
): string | null {
  const value = data[key];
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${context} must declare string field \`${key}\` when set.`);
  }
  return value;
}

function optionalStringList(
  data: Record<string, unknown>,
  key: string,
  context: string
): readonly string[] {
  const value = data[key];
  if (value === undefined || value === null) {
    return [];
  }
  if (
    !Array.isArray(value) ||
    !value.every((item) => typeof item === 'string' && item.trim().length > 0)
  ) {
    throw new Error(`${context} must declare string list \`${key}\` when set.`);
  }
  return value;
}

function requiredNumber(
  data: Record<string, unknown>,
  key: string,
  context: string
): number {
  const value = data[key];
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    throw new Error(`${context} must declare integer field \`${key}\`.`);
  }
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function assertOnlyKeys(
  data: Record<string, unknown>,
  allowedKeys: readonly string[],
  context: string
): void {
  for (const key of Object.keys(data)) {
    if (!allowedKeys.includes(key)) {
      throw new Error(`${context} must not declare unknown field \`${key}\`.`);
    }
  }
}

function uniqueSorted(values: readonly string[]): readonly string[] {
  return Array.from(new Set(values)).sort((left, right) =>
    left.localeCompare(right)
  );
}
