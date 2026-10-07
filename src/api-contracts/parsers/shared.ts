import { parse } from 'yaml';

export function parseYamlObject(source: string, file: string): Record<string, unknown> {
  const data = parse(source) as unknown;
  if (!isRecord(data)) {
    throw new Error(`${file} must parse to a YAML object.`);
  }
  return data;
}

export function requiredObject(
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

export function requiredStringList(
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

export function requiredStringListAllowEmpty(
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

export function requiredNumberList(
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

export function requiredRecordListAllowEmpty(
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

export function requiredRecordListNonEmpty(
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

export function requiredString(
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

export function requiredBoolean(
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

export function optionalString(
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

export function requiredNumber(
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

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function assertOnlyKeys(
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
