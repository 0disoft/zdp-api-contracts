import { readFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import { parse } from 'yaml';
import * as parser from './parser.js';
import type {
  AbuseChallengeContract,
  ApiCatalogContract,
  ApiContracts,
  ApiSchemaBundleContract,
  ErrorEnvelopeContract,
  ProductLinkHandoffContract,
  RouteContract,
  SdkGenerationInputContract,
  WebhookContract
} from './types.js';

type SourceShapeAssertion = (source: string) => void;

const ABUSE_CHALLENGE_FILE = 'contracts/apis/abuse-api/challenge.yaml';
const PRODUCT_LINK_FILE = 'contracts/apis/core-api/product-link.yaml';
const ROUTE_CONTRACT_FILE = 'contracts/route-contract.yaml';
const ERROR_ENVELOPE_FILE = 'contracts/error-envelope.yaml';
const WEBHOOK_CONTRACT_FILE = 'contracts/webhook-contract.yaml';
const SDK_GENERATION_INPUT_FILE = 'contracts/sdk-generation-input.yaml';
const API_CATALOG_FILE = 'contracts/apis/catalog.yaml';

const ABUSE_CHALLENGE_KEYS = [
  'schema_version',
  'status',
  'owner_boundary',
  'operation_ids',
  'public_operation_ids',
  'private_operation_ids',
  'required_binding_fields',
  'provider_adapter_operations',
  'internal_caller_families',
  'verification_receipt_single_use',
  'verification_receipt_ttl_policy',
  'verification_receipt_binding',
  'verification_consumption_policy',
  'verification_consumer_operation_policy',
  'redeem_recovery_policy',
  'verification_receipt_derivation_policy',
  'public_origin_protection_policy',
  'internal_caller_topology_policy',
  'credential_ambiguity_policy',
  'internal_service_proof_policy',
  'idempotency_policy',
  'provider_abstraction_policy',
  'failure_policy',
  'product_authority_policy',
  'public_surface_policy',
  'health_surface_policy',
  'storage_policy',
  'forbidden_consumer_uses',
  'forbidden_values'
] as const;

const PRODUCT_LINK_KEYS = [
  'schema_version',
  'status',
  'owner_boundary',
  'challenge_ttl_seconds',
  'minimum_poll_interval_seconds',
  'proof_method',
  'proof_verifier_policy',
  'proof_challenge_policy',
  'lifecycle_states',
  'terminal_states',
  'allowed_transitions',
  'single_use_exchange',
  'correlation_binding',
  'required_bindings',
  'exchange_response_refs',
  'forbidden_values',
  'local_only_policy'
] as const;

const ROUTE_CONTRACT_KEYS = [
  'status',
  'required_per_route',
  'allowed_methods',
  'allowed_success_statuses',
  'no_content_success_statuses',
  'forbidden_shapes',
  'allowed_session_effects'
] as const;

const ERROR_ENVELOPE_KEYS = [
  'schema_version',
  'required_fields',
  'optional_fields',
  'forbidden_fields'
] as const;

const WEBHOOK_CONTRACT_KEYS = [
  'status',
  'required_controls',
  'forbidden_controls'
] as const;

const SDK_GENERATION_INPUT_KEYS = [
  'status',
  'source_contracts',
  'generation_targets',
  'allowed_generation_targets',
  'required_route_metadata',
  'required_error_metadata',
  'required_client_runtime_metadata',
  'required_webhook_metadata',
  'forbidden_ownership',
  'forbidden_values'
] as const;

const API_CATALOG_KEYS = [
  'status',
  'route_definition_required_fields',
  'forbidden_values'
] as const;

const API_ROUTE_KEYS = [
  'operation_id',
  'service_id',
  'resource',
  'action',
  'method',
  'path',
  'success_statuses',
  'request_schema_ref',
  'response_schema_ref',
  'auth_required',
  'permission_check',
  'audit_event',
  'idempotency',
  'owner_boundary',
  'tenant_boundary',
  'request_id_required',
  'trace_id_required',
  'session_effect',
  'credential_policy',
  'export_policy',
  'authorization_policy',
  'error_codes'
] as const;

const API_SCHEMA_BUNDLE_KEYS = [
  'service_id',
  'owner_boundary',
  'status',
  'purpose',
  'common_envelope',
  'schemas'
] as const;

const API_SCHEMA_COMMON_ENVELOPE_KEYS = [
  'required_request_metadata',
  'required_response_metadata',
  'forbidden_payload_values'
] as const;

const API_SCHEMA_DEFINITION_KEYS = [
  'id',
  'kind',
  'carries_secret_material',
  'secret_material_policy',
  'session_effect',
  'required_fields',
  'optional_fields',
  'secret_fields',
  'properties'
] as const;

const SCHEMA_BUNDLE_COMPANION_ROOT_BY_FILE: Readonly<Record<string, string>> = {
  'contracts/apis/abuse-api/challenge.yaml': 'abuse_challenge',
  'contracts/apis/core-api/access-decision.yaml': 'access_decision',
  'contracts/apis/core-api/customer-policy-registry.yaml':
    'customer_policy_registry',
  'contracts/apis/core-api/product-link.yaml': 'product_link_handoff',
  'contracts/apis/core-api/sensitive-action-authorization.yaml':
    'sensitive_action_authorization',
  'contracts/apis/money-api/credit-purchase.yaml': 'credit_purchase'
};

/**
 * Runs the existing typed loader and then rejects unknown fields in every
 * source shape that previously had a permissive parsing path.
 */
export async function loadApiContracts(
  root = process.cwd()
): Promise<ApiContracts> {
  const contracts = await parser.loadApiContracts(root);
  const assertions = new Map<string, SourceShapeAssertion>([
    [ABUSE_CHALLENGE_FILE, assertAbuseChallengeSource],
    [PRODUCT_LINK_FILE, assertProductLinkSource],
    [ROUTE_CONTRACT_FILE, assertRouteContractSource],
    [ERROR_ENVELOPE_FILE, assertErrorEnvelopeSource],
    [WEBHOOK_CONTRACT_FILE, assertWebhookContractSource],
    [SDK_GENERATION_INPUT_FILE, assertSdkGenerationInputSource],
    [API_CATALOG_FILE, assertApiCatalogSource]
  ]);

  for (const schemaBundle of contracts.schemaBundles) {
    if (!assertions.has(schemaBundle.file)) {
      assertions.set(schemaBundle.file, (source) =>
        assertApiSchemaBundleSource(source, schemaBundle.file)
      );
    }
  }

  await Promise.all(
    Array.from(assertions, ([file, assertSourceShape]) =>
      readAndAssertSource(root, file, assertSourceShape)
    )
  );

  return contracts;
}

export function parseAbuseChallengeContract(
  source: string
): AbuseChallengeContract {
  assertAbuseChallengeSource(source);
  return parser.parseAbuseChallengeContract(source);
}

export function parseProductLinkHandoffContract(
  source: string
): ProductLinkHandoffContract {
  assertProductLinkSource(source);
  return parser.parseProductLinkHandoffContract(source);
}

export function parseRouteContract(source: string): RouteContract {
  assertRouteContractSource(source);
  return parser.parseRouteContract(source);
}

export function parseErrorEnvelopeContract(
  source: string
): ErrorEnvelopeContract {
  assertErrorEnvelopeSource(source);
  return parser.parseErrorEnvelopeContract(source);
}

export function parseWebhookContract(source: string): WebhookContract {
  assertWebhookContractSource(source);
  return parser.parseWebhookContract(source);
}

export function parseSdkGenerationInputContract(
  source: string
): SdkGenerationInputContract {
  assertSdkGenerationInputSource(source);
  return parser.parseSdkGenerationInputContract(source);
}

export function parseApiCatalogContract(source: string): ApiCatalogContract {
  assertApiCatalogSource(source);
  return parser.parseApiCatalogContract(source);
}

export function parseApiSchemaBundleContract(
  source: string,
  file = 'contracts/apis/<service>/<schema>.yaml'
): ApiSchemaBundleContract {
  assertApiSchemaBundleSource(source, file);
  return parser.parseApiSchemaBundleContract(source, file);
}

async function readAndAssertSource(
  root: string,
  file: string,
  assertSourceShape: SourceShapeAssertion
): Promise<void> {
  const resolvedRoot = resolve(root);
  const resolvedFile = resolve(resolvedRoot, file);
  const relativeFile = relative(resolvedRoot, resolvedFile);
  if (
    relativeFile.startsWith('..') ||
    relativeFile.includes(':') ||
    relativeFile.startsWith('/') ||
    relativeFile.startsWith('\\')
  ) {
    throw new Error(`Contract path \`${file}\` must remain under the repository root.`);
  }

  assertSourceShape(await readFile(resolvedFile, 'utf8'));
}

function assertAbuseChallengeSource(source: string): void {
  const data = parseYamlObject(source, ABUSE_CHALLENGE_FILE);
  assertOnlyKeys(
    data,
    ['abuse_challenge', 'schema_bundle'],
    ABUSE_CHALLENGE_FILE
  );
  const contract = requiredObject(
    data,
    'abuse_challenge',
    ABUSE_CHALLENGE_FILE
  );
  assertOnlyKeys(
    contract,
    ABUSE_CHALLENGE_KEYS,
    `${ABUSE_CHALLENGE_FILE}#abuse_challenge`
  );
  assertApiSchemaBundleObject(data, ABUSE_CHALLENGE_FILE);
}

function assertProductLinkSource(source: string): void {
  const data = parseYamlObject(source, PRODUCT_LINK_FILE);
  assertOnlyKeys(
    data,
    ['product_link_handoff', 'schema_bundle'],
    PRODUCT_LINK_FILE
  );
  const contract = requiredObject(
    data,
    'product_link_handoff',
    PRODUCT_LINK_FILE
  );
  const context = `${PRODUCT_LINK_FILE}#product_link_handoff`;
  assertOnlyKeys(contract, PRODUCT_LINK_KEYS, context);
  requiredRecordListAllowEmpty(contract, 'allowed_transitions', context).forEach(
    (transition, index) =>
      assertOnlyKeys(
        transition,
        ['from', 'event', 'to'],
        `${context}.allowed_transitions[${index}]`
      )
  );
  assertApiSchemaBundleObject(data, PRODUCT_LINK_FILE);
}

function assertRouteContractSource(source: string): void {
  const data = parseYamlObject(source, ROUTE_CONTRACT_FILE);
  assertOnlyKeys(data, ['route_contract'], ROUTE_CONTRACT_FILE);
  assertOnlyKeys(
    requiredObject(data, 'route_contract', ROUTE_CONTRACT_FILE),
    ROUTE_CONTRACT_KEYS,
    `${ROUTE_CONTRACT_FILE}#route_contract`
  );
}

function assertErrorEnvelopeSource(source: string): void {
  const data = parseYamlObject(source, ERROR_ENVELOPE_FILE);
  assertOnlyKeys(data, ['error_envelope'], ERROR_ENVELOPE_FILE);
  assertOnlyKeys(
    requiredObject(data, 'error_envelope', ERROR_ENVELOPE_FILE),
    ERROR_ENVELOPE_KEYS,
    `${ERROR_ENVELOPE_FILE}#error_envelope`
  );
}

function assertWebhookContractSource(source: string): void {
  const data = parseYamlObject(source, WEBHOOK_CONTRACT_FILE);
  assertOnlyKeys(data, ['webhook_contract'], WEBHOOK_CONTRACT_FILE);
  assertOnlyKeys(
    requiredObject(data, 'webhook_contract', WEBHOOK_CONTRACT_FILE),
    WEBHOOK_CONTRACT_KEYS,
    `${WEBHOOK_CONTRACT_FILE}#webhook_contract`
  );
}

function assertSdkGenerationInputSource(source: string): void {
  const data = parseYamlObject(source, SDK_GENERATION_INPUT_FILE);
  assertOnlyKeys(data, ['sdk_generation_input'], SDK_GENERATION_INPUT_FILE);
  assertOnlyKeys(
    requiredObject(data, 'sdk_generation_input', SDK_GENERATION_INPUT_FILE),
    SDK_GENERATION_INPUT_KEYS,
    `${SDK_GENERATION_INPUT_FILE}#sdk_generation_input`
  );
}

function assertApiCatalogSource(source: string): void {
  const data = parseYamlObject(source, API_CATALOG_FILE);
  assertOnlyKeys(data, ['api_catalog', 'routes'], API_CATALOG_FILE);
  assertOnlyKeys(
    requiredObject(data, 'api_catalog', API_CATALOG_FILE),
    API_CATALOG_KEYS,
    `${API_CATALOG_FILE}#api_catalog`
  );
  requiredRecordListAllowEmpty(data, 'routes', API_CATALOG_FILE).forEach(
    (route, index) =>
      assertOnlyKeys(
        route,
        API_ROUTE_KEYS,
        `${API_CATALOG_FILE}#routes[${index}]`
      )
  );
}

function assertApiSchemaBundleSource(source: string, file: string): void {
  const data = parseYamlObject(source, file);
  const companionRoot = SCHEMA_BUNDLE_COMPANION_ROOT_BY_FILE[file];
  assertOnlyKeys(
    data,
    companionRoot === undefined
      ? ['schema_bundle']
      : ['schema_bundle', companionRoot],
    file
  );
  assertApiSchemaBundleObject(data, file);
}

function assertApiSchemaBundleObject(
  data: Record<string, unknown>,
  file: string
): void {
  const schemaBundleContext = `${file}#schema_bundle`;
  const schemaBundle = requiredObject(data, 'schema_bundle', file);
  assertOnlyKeys(schemaBundle, API_SCHEMA_BUNDLE_KEYS, schemaBundleContext);

  const commonEnvelopeContext = `${schemaBundleContext}.common_envelope`;
  assertOnlyKeys(
    requiredObject(schemaBundle, 'common_envelope', schemaBundleContext),
    API_SCHEMA_COMMON_ENVELOPE_KEYS,
    commonEnvelopeContext
  );

  requiredRecordListAllowEmpty(
    schemaBundle,
    'schemas',
    schemaBundleContext
  ).forEach((schema, index) =>
    assertOnlyKeys(
      schema,
      API_SCHEMA_DEFINITION_KEYS,
      `${schemaBundleContext}.schemas[${index}]`
    )
  );
}

function parseYamlObject(
  source: string,
  file: string
): Record<string, unknown> {
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
