import type { ApiSchemaDefinition } from '../../src/api-contracts/types';
import type {
  ApiContractChangeLevel,
  ApiContractCompatibilityChange,
  ApiContractCompatibilityLevel
} from './compatibility-types';

const LEVEL_WEIGHT: Readonly<Record<ApiContractChangeLevel, number>> = {
  patch: 1,
  feature: 2,
  breaking: 3
};

const NO_IDEMPOTENCY_POLICIES = new Set([
  'none',
  'not_applicable',
  'not_required'
]);

type SchemaFieldPresence = 'absent' | 'optional' | 'required';

export function compareRequiredSet(
  base: readonly string[],
  head: readonly string[],
  path: string,
  codePrefix: string,
  changes: ApiContractCompatibilityChange[]
): void {
  compareSetDelta(
    base,
    head,
    path,
    {
      removedLevel: 'breaking',
      removedCode: `${codePrefix}_REMOVED`,
      removedMessage: (value) =>
        `Required contract item \`${value}\` was removed.`,
      addedLevel: 'breaking',
      addedCode: `${codePrefix}_ADDED`,
      addedMessage: (value) => `Required contract item \`${value}\` was added.`
    },
    changes
  );
}

export function compareAllowlist(
  base: readonly string[],
  head: readonly string[],
  path: string,
  codePrefix: string,
  changes: ApiContractCompatibilityChange[]
): void {
  compareSetDelta(
    base,
    head,
    path,
    {
      removedLevel: 'breaking',
      removedCode: `${codePrefix}_REMOVED`,
      removedMessage: (value) => `Allowed item \`${value}\` was removed.`,
      addedLevel: 'feature',
      addedCode: `${codePrefix}_ADDED`,
      addedMessage: (value) => `Allowed item \`${value}\` was added.`
    },
    changes
  );
}

export function compareForbiddenSet(
  base: readonly string[],
  head: readonly string[],
  path: string,
  codePrefix: string,
  changes: ApiContractCompatibilityChange[]
): void {
  compareSetDelta(
    base,
    head,
    path,
    {
      removedLevel: 'breaking',
      removedCode: `${codePrefix}_REMOVED`,
      removedMessage: (value) =>
        `Forbidden contract item \`${value}\` was removed.`,
      addedLevel: 'patch',
      addedCode: `${codePrefix}_ADDED`,
      addedMessage: (value) => `Forbidden contract item \`${value}\` was added.`
    },
    changes
  );
}

export function compareSetDelta(
  baseValues: readonly string[],
  headValues: readonly string[],
  path: string,
  policy: {
    readonly removedLevel: ApiContractChangeLevel;
    readonly removedCode: string;
    readonly removedMessage: (value: string) => string;
    readonly addedLevel: ApiContractChangeLevel;
    readonly addedCode: string;
    readonly addedMessage: (value: string) => string;
  },
  changes: ApiContractCompatibilityChange[]
): void {
  const base = new Set(baseValues);
  const head = new Set(headValues);

  for (const value of [...base].sort()) {
    if (!head.has(value)) {
      addChange(
        changes,
        policy.removedLevel,
        policy.removedCode,
        `${path}.${value}`,
        policy.removedMessage(value)
      );
    }
  }
  for (const value of [...head].sort()) {
    if (!base.has(value)) {
      addChange(
        changes,
        policy.addedLevel,
        policy.addedCode,
        `${path}.${value}`,
        policy.addedMessage(value)
      );
    }
  }
}

export function compareBreakingScalar(
  base: string | number | boolean | null,
  head: string | number | boolean | null,
  field: string,
  subject: string,
  path: string,
  changes: ApiContractCompatibilityChange[]
): void {
  if (base === head) {
    return;
  }
  addChange(
    changes,
    'breaking',
    `API_COMPAT_${field.toUpperCase()}_CHANGED`,
    `${path}.${field}`,
    `\`${subject}\` changed ${field} from \`${String(base)}\` to \`${String(head)}\`.`
  );
}

export function compareRequirementBoolean(
  base: boolean,
  head: boolean,
  path: string,
  codePrefix: string,
  subject: string,
  changes: ApiContractCompatibilityChange[]
): void {
  if (base === head) {
    return;
  }
  addChange(
    changes,
    head ? 'breaking' : 'patch',
    head ? `${codePrefix}_ENABLED` : `${codePrefix}_DISABLED`,
    path,
    `${subject} ${head ? 'now requires' : 'no longer requires'} this control.`
  );
}

export function schemaFieldPresence(
  schema: ApiSchemaDefinition,
  field: string
): SchemaFieldPresence {
  if (schema.requiredFields.includes(field)) {
    return 'required';
  }
  if (schema.optionalFields.includes(field)) {
    return 'optional';
  }
  return 'absent';
}

export function idempotencyStrength(policy: string): number {
  const normalized = policy.trim().toLowerCase();
  if (NO_IDEMPOTENCY_POLICIES.has(normalized)) {
    return 0;
  }
  if (normalized.includes('optional')) {
    return 1;
  }
  if (normalized.includes('required')) {
    return 2;
  }
  return 1;
}

export function highestLevel(
  changes: readonly ApiContractCompatibilityChange[]
): ApiContractCompatibilityLevel {
  let level: ApiContractCompatibilityLevel = 'none';
  let weight = 0;
  for (const change of changes) {
    const nextWeight = LEVEL_WEIGHT[change.level];
    if (nextWeight > weight) {
      weight = nextWeight;
      level = change.level;
    }
  }
  return level;
}

export function mapBy<T>(
  values: readonly T[],
  key: (value: T) => string
): ReadonlyMap<string, T> {
  return new Map(values.map((value) => [key(value), value]));
}

export function addChange(
  changes: ApiContractCompatibilityChange[],
  level: ApiContractChangeLevel,
  code: string,
  path: string,
  message: string
): void {
  changes.push({ level, code, path, message });
}
