import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type {
  ApiContracts,
  ErrorEnvelopeContract,
  RouteContract,
  WebhookContract
} from './types';

export async function loadApiContracts(root = process.cwd()): Promise<ApiContracts> {
  const contractsRoot = join(root, 'contracts');

  return {
    route: parseRouteContract(
      await readFile(join(contractsRoot, 'route-contract.yaml'), 'utf8')
    ),
    errorEnvelope: parseErrorEnvelopeContract(
      await readFile(join(contractsRoot, 'error-envelope.yaml'), 'utf8')
    ),
    webhook: parseWebhookContract(
      await readFile(join(contractsRoot, 'webhook-contract.yaml'), 'utf8')
    )
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
    forbiddenShapes: requiredStringList(
      routeContract,
      'forbidden_shapes',
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

function parseYamlObject(source: string, file: string): Record<string, unknown> {
  const data = Bun.YAML.parse(source) as unknown;
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
