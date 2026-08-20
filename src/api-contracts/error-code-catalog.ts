import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parse } from 'yaml';
import type {
  ApiContractDiagnostic,
  ApiContracts,
  ApiContractValidationResult
} from './types.js';

export const ERROR_CODE_CATALOG_FILE = 'contracts/error-code-catalog.yaml';
export const SHARED_ERROR_OWNER_SERVICE_ID = 'shared';

const ERROR_CODE_CATALOG_SCHEMA_VERSION = 1;
const ERROR_CODE_CATALOG_STATUS = 'active';
const ERROR_CODE_LOCALIZATION_KEY_PREFIX = 'api.errors.';
const ERROR_CODE_PATTERN = /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/;
const SERVICE_ID_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const ERROR_CODE_LIFECYCLE_STATUSES: readonly string[] = [
  'active',
  'deprecated',
  'retired'
];

export interface ErrorCodeCatalogContract {
  readonly schemaVersion: number;
  readonly status: string;
  readonly defaults: ErrorCodeCatalogDefaults;
  readonly entries: readonly ErrorCodeCatalogEntry[];
}

export interface ErrorCodeCatalogDefaults {
  readonly retryable: boolean;
  readonly userVisible: boolean;
  readonly localizationKeyPrefix: string;
  readonly lifecycleStatus: string;
}

export interface ErrorCodeCatalogEntry {
  readonly code: string;
  readonly httpStatus: number;
  readonly retryable: boolean;
  readonly userVisible: boolean;
  readonly localizationKey: string;
  readonly ownerServiceId: string;
  readonly lifecycleStatus: string;
}

export async function loadErrorCodeCatalog(
  root = process.cwd()
): Promise<ErrorCodeCatalogContract> {
  const source = await readFile(join(root, ERROR_CODE_CATALOG_FILE), 'utf8');
  return parseErrorCodeCatalog(source);
}

export function parseErrorCodeCatalog(
  source: string
): ErrorCodeCatalogContract {
  const parsed: unknown = parse(source);
  const document = requiredRecord(parsed, ERROR_CODE_CATALOG_FILE);
  assertOnlyKeys(document, ['error_code_catalog'], ERROR_CODE_CATALOG_FILE);

  const catalog = requiredRecord(
    document.error_code_catalog,
    `${ERROR_CODE_CATALOG_FILE}#error_code_catalog`
  );
  const context = `${ERROR_CODE_CATALOG_FILE}#error_code_catalog`;
  assertOnlyKeys(
    catalog,
    ['schema_version', 'status', 'defaults', 'entries'],
    context
  );

  const defaults = parseErrorCodeCatalogDefaults(
    requiredRecord(catalog.defaults, `${context}.defaults`),
    `${context}.defaults`
  );

  return {
    schemaVersion: requiredInteger(
      catalog.schema_version,
      `${context}.schema_version`
    ),
    status: requiredString(catalog.status, `${context}.status`),
    defaults,
    entries: requiredRecordList(catalog.entries, `${context}.entries`).map(
      (entry, index) => parseErrorCodeCatalogEntry(entry, index, defaults)
    )
  };
}

export function validateErrorCodeCatalog(
  catalog: ErrorCodeCatalogContract,
  contracts: ApiContracts
): ApiContractValidationResult {
  const diagnostics: ApiContractDiagnostic[] = [];
  const knownServiceIds = new Set(
    contracts.apiCatalog.routes.map((route) => route.serviceId)
  );
  const entriesByCode = new Map<
    string,
    { readonly entry: ErrorCodeCatalogEntry; readonly index: number }
  >();

  validateCatalogHeader(catalog, diagnostics);

  let previousCode: string | null = null;
  catalog.entries.forEach((entry, index) => {
    const path = `error_code_catalog.entries[${index}]`;

    if (!ERROR_CODE_PATTERN.test(entry.code)) {
      diagnostics.push({
        code: 'API_ERROR_CODE_INVALID',
        file: ERROR_CODE_CATALOG_FILE,
        path: `${path}.code`,
        message:
          `Error code \`${entry.code}\` must be a stable lowercase ` +
          'snake_case identifier.'
      });
    }

    if (previousCode !== null && previousCode.localeCompare(entry.code) >= 0) {
      diagnostics.push({
        code: 'API_ERROR_CODE_CATALOG_ORDER_INVALID',
        file: ERROR_CODE_CATALOG_FILE,
        path: `${path}.code`,
        message:
          `Error code catalog entries must be strictly sorted; ` +
          `\`${entry.code}\` follows \`${previousCode}\`.`
      });
    }
    previousCode = entry.code;

    const existing = entriesByCode.get(entry.code);
    if (existing !== undefined) {
      diagnostics.push({
        code: 'API_ERROR_CODE_DUPLICATE',
        file: ERROR_CODE_CATALOG_FILE,
        path: `${path}.code`,
        message:
          `Error code \`${entry.code}\` duplicates ` +
          `error_code_catalog.entries[${existing.index}].code.`
      });
    } else {
      entriesByCode.set(entry.code, { entry, index });
    }

    if (
      !Number.isInteger(entry.httpStatus) ||
      entry.httpStatus < 400 ||
      entry.httpStatus > 599
    ) {
      diagnostics.push({
        code: 'API_ERROR_CODE_HTTP_STATUS_INVALID',
        file: ERROR_CODE_CATALOG_FILE,
        path: `${path}.http_status`,
        message:
          `Error code \`${entry.code}\` must declare an integer HTTP error ` +
          'status from 400 through 599.'
      });
    }

    const expectedLocalizationKey =
      `${ERROR_CODE_LOCALIZATION_KEY_PREFIX}${entry.code}`;
    if (entry.localizationKey !== expectedLocalizationKey) {
      diagnostics.push({
        code: 'API_ERROR_CODE_LOCALIZATION_KEY_INVALID',
        file: ERROR_CODE_CATALOG_FILE,
        path: `${path}.localization_key`,
        message:
          `Error code \`${entry.code}\` must use localization key ` +
          `\`${expectedLocalizationKey}\`.`
      });
    }

    if (
      entry.ownerServiceId !== SHARED_ERROR_OWNER_SERVICE_ID &&
      !SERVICE_ID_PATTERN.test(entry.ownerServiceId)
    ) {
      diagnostics.push({
        code: 'API_ERROR_CODE_OWNER_SERVICE_INVALID',
        file: ERROR_CODE_CATALOG_FILE,
        path: `${path}.owner_service_id`,
        message:
          `Error code \`${entry.code}\` owner_service_id must be ` +
          `\`${SHARED_ERROR_OWNER_SERVICE_ID}\` or a stable service id.`
      });
    } else if (
      entry.ownerServiceId !== SHARED_ERROR_OWNER_SERVICE_ID &&
      !knownServiceIds.has(entry.ownerServiceId)
    ) {
      diagnostics.push({
        code: 'API_ERROR_CODE_OWNER_SERVICE_UNKNOWN',
        file: ERROR_CODE_CATALOG_FILE,
        path: `${path}.owner_service_id`,
        message:
          `Error code \`${entry.code}\` names unknown owner service ` +
          `\`${entry.ownerServiceId}\`.`
      });
    }

    if (!ERROR_CODE_LIFECYCLE_STATUSES.includes(entry.lifecycleStatus)) {
      diagnostics.push({
        code: 'API_ERROR_CODE_LIFECYCLE_INVALID',
        file: ERROR_CODE_CATALOG_FILE,
        path: `${path}.lifecycle_status`,
        message:
          `Error code \`${entry.code}\` lifecycle_status must be one of ` +
          ERROR_CODE_LIFECYCLE_STATUSES.map((status) => `\`${status}\``).join(
            ', '
          ) +
          '.'
      });
    }
  });

  validateRouteErrorCodeReferences(contracts, entriesByCode, diagnostics);

  return {
    ok: diagnostics.length === 0,
    diagnostics
  };
}

function validateCatalogHeader(
  catalog: ErrorCodeCatalogContract,
  diagnostics: ApiContractDiagnostic[]
): void {
  if (catalog.schemaVersion !== ERROR_CODE_CATALOG_SCHEMA_VERSION) {
    diagnostics.push({
      code: 'API_ERROR_CODE_CATALOG_SCHEMA_VERSION_INVALID',
      file: ERROR_CODE_CATALOG_FILE,
      path: 'error_code_catalog.schema_version',
      message:
        `Error code catalog schema_version must be ` +
        `${ERROR_CODE_CATALOG_SCHEMA_VERSION}.`
    });
  }

  if (catalog.status !== ERROR_CODE_CATALOG_STATUS) {
    diagnostics.push({
      code: 'API_ERROR_CODE_CATALOG_STATUS_INVALID',
      file: ERROR_CODE_CATALOG_FILE,
      path: 'error_code_catalog.status',
      message: `Error code catalog status must be \`${ERROR_CODE_CATALOG_STATUS}\`.`
    });
  }

  if (
    catalog.defaults.localizationKeyPrefix !==
    ERROR_CODE_LOCALIZATION_KEY_PREFIX
  ) {
    diagnostics.push({
      code: 'API_ERROR_CODE_LOCALIZATION_PREFIX_INVALID',
      file: ERROR_CODE_CATALOG_FILE,
      path: 'error_code_catalog.defaults.localization_key_prefix',
      message:
        `Error code localization_key_prefix must be ` +
        `\`${ERROR_CODE_LOCALIZATION_KEY_PREFIX}\`.`
    });
  }

  if (
    !ERROR_CODE_LIFECYCLE_STATUSES.includes(catalog.defaults.lifecycleStatus)
  ) {
    diagnostics.push({
      code: 'API_ERROR_CODE_DEFAULT_LIFECYCLE_INVALID',
      file: ERROR_CODE_CATALOG_FILE,
      path: 'error_code_catalog.defaults.lifecycle_status',
      message:
        'Error code default lifecycle_status must be active, deprecated, or retired.'
    });
  }
}

function validateRouteErrorCodeReferences(
  contracts: ApiContracts,
  entriesByCode: ReadonlyMap<
    string,
    { readonly entry: ErrorCodeCatalogEntry; readonly index: number }
  >,
  diagnostics: ApiContractDiagnostic[]
): void {
  contracts.apiCatalog.routes.forEach((route, routeIndex) => {
    const routeCodes = new Set<string>();

    route.errorCodes.forEach((errorCode, errorIndex) => {
      const path = `routes[${routeIndex}].error_codes[${errorIndex}]`;

      if (routeCodes.has(errorCode)) {
        diagnostics.push({
          code: 'API_ROUTE_ERROR_CODE_DUPLICATE',
          file: 'contracts/apis/catalog.yaml',
          path,
          message:
            `API route \`${route.operationId}\` declares duplicate error code ` +
            `\`${errorCode}\`.`
        });
        return;
      }
      routeCodes.add(errorCode);

      const registered = entriesByCode.get(errorCode);
      if (registered === undefined) {
        diagnostics.push({
          code: 'API_ROUTE_ERROR_CODE_UNREGISTERED',
          file: 'contracts/apis/catalog.yaml',
          path,
          message:
            `API route \`${route.operationId}\` references unregistered error ` +
            `code \`${errorCode}\`.`
        });
        return;
      }

      const { entry } = registered;
      if (
        entry.ownerServiceId !== SHARED_ERROR_OWNER_SERVICE_ID &&
        entry.ownerServiceId !== route.serviceId
      ) {
        diagnostics.push({
          code: 'API_ROUTE_ERROR_CODE_OWNER_MISMATCH',
          file: 'contracts/apis/catalog.yaml',
          path,
          message:
            `API route \`${route.operationId}\` in service ` +
            `\`${route.serviceId}\` cannot use error code \`${errorCode}\` ` +
            `owned by \`${entry.ownerServiceId}\`.`
        });
      }

      if (entry.lifecycleStatus === 'retired') {
        diagnostics.push({
          code: 'API_ROUTE_ERROR_CODE_RETIRED',
          file: 'contracts/apis/catalog.yaml',
          path,
          message:
            `API route \`${route.operationId}\` must not reference retired ` +
            `error code \`${errorCode}\`.`
        });
      }
    });
  });
}

function parseErrorCodeCatalogDefaults(
  defaults: Record<string, unknown>,
  context: string
): ErrorCodeCatalogDefaults {
  assertOnlyKeys(
    defaults,
    [
      'retryable',
      'user_visible',
      'localization_key_prefix',
      'lifecycle_status'
    ],
    context
  );

  return {
    retryable: requiredBoolean(defaults.retryable, `${context}.retryable`),
    userVisible: requiredBoolean(
      defaults.user_visible,
      `${context}.user_visible`
    ),
    localizationKeyPrefix: requiredString(
      defaults.localization_key_prefix,
      `${context}.localization_key_prefix`
    ),
    lifecycleStatus: requiredString(
      defaults.lifecycle_status,
      `${context}.lifecycle_status`
    )
  };
}

function parseErrorCodeCatalogEntry(
  entry: Record<string, unknown>,
  index: number,
  defaults: ErrorCodeCatalogDefaults
): ErrorCodeCatalogEntry {
  const context = `${ERROR_CODE_CATALOG_FILE}#error_code_catalog.entries[${index}]`;
  assertOnlyKeys(
    entry,
    [
      'code',
      'http_status',
      'retryable',
      'user_visible',
      'localization_key',
      'owner_service_id',
      'lifecycle_status'
    ],
    context
  );

  const code = requiredString(entry.code, `${context}.code`);

  return {
    code,
    httpStatus: requiredInteger(entry.http_status, `${context}.http_status`),
    retryable: optionalBoolean(
      entry.retryable,
      defaults.retryable,
      `${context}.retryable`
    ),
    userVisible: optionalBoolean(
      entry.user_visible,
      defaults.userVisible,
      `${context}.user_visible`
    ),
    localizationKey: optionalString(
      entry.localization_key,
      `${defaults.localizationKeyPrefix}${code}`,
      `${context}.localization_key`
    ),
    ownerServiceId: requiredString(
      entry.owner_service_id,
      `${context}.owner_service_id`
    ),
    lifecycleStatus: optionalString(
      entry.lifecycle_status,
      defaults.lifecycleStatus,
      `${context}.lifecycle_status`
    )
  };
}

function requiredRecord(
  value: unknown,
  context: string
): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new Error(`${context} must be an object.`);
  }
  return value;
}

function requiredRecordList(
  value: unknown,
  context: string
): readonly Record<string, unknown>[] {
  if (!Array.isArray(value) || value.length === 0 || !value.every(isRecord)) {
    throw new Error(`${context} must be a non-empty object list.`);
  }
  return value;
}

function requiredString(value: unknown, context: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${context} must be a non-empty string.`);
  }
  return value;
}

function optionalString(
  value: unknown,
  fallback: string,
  context: string
): string {
  if (value === undefined) {
    return fallback;
  }
  return requiredString(value, context);
}

function requiredInteger(value: unknown, context: string): number {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    throw new Error(`${context} must be an integer.`);
  }
  return value;
}

function requiredBoolean(value: unknown, context: string): boolean {
  if (typeof value !== 'boolean') {
    throw new Error(`${context} must be a boolean.`);
  }
  return value;
}

function optionalBoolean(
  value: unknown,
  fallback: boolean,
  context: string
): boolean {
  if (value === undefined) {
    return fallback;
  }
  return requiredBoolean(value, context);
}

function assertOnlyKeys(
  value: Record<string, unknown>,
  allowedKeys: readonly string[],
  context: string
): void {
  for (const key of Object.keys(value)) {
    if (!allowedKeys.includes(key)) {
      throw new Error(`${context} must not declare unknown field \`${key}\`.`);
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
