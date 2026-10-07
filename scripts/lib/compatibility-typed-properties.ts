import type { ApiContractCompatibilityChange } from './compatibility-types';

type Property = Record<string, unknown>;
const record = (value: unknown): Property => value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Property : {};
const list = (value: unknown): readonly unknown[] => Array.isArray(value) ? value : [];
const set = (value: unknown) => new Set(list(value).map(item => JSON.stringify(item)));

/** Typed request constraints describe accepted inputs; response constraints describe promised outputs. */
export function compareTypedProperties(baseValue: unknown, headValue: unknown, kind: string, path: string,
  changes: ApiContractCompatibilityChange[], baseRequired: readonly unknown[] = [], headRequired: readonly unknown[] = []): void {
  const base = record(baseValue), head = record(headValue);
  for (const field of [...new Set([...Object.keys(base), ...Object.keys(head)])].sort()) {
    const fieldPath = `${path}.${field}`;
    if (!Object.hasOwn(base, field)) {
      change(kind === 'request' && headRequired.includes(field), fieldPath, 'property added', changes);
    } else if (!Object.hasOwn(head, field)) {
      change(true, fieldPath, 'property removed', changes);
    } else {
      const wasRequired = baseRequired.includes(field), isRequired = headRequired.includes(field);
      if (wasRequired !== isRequired) change(kind === 'request' ? isRequired : wasRequired, `${fieldPath}.required`, 'requiredness changed', changes);
      compareProperty(record(base[field]), record(head[field]), kind, fieldPath, changes);
    }
  }
}

function compareProperty(base: Property, head: Property, kind: string, path: string, changes: ApiContractCompatibilityChange[]): void {
  if (base.type !== head.type) {
    const widened = base.type === 'integer' && head.type === 'number';
    const narrowed = base.type === 'number' && head.type === 'integer';
    change(!(kind === 'request' ? widened : narrowed), `${path}.type`, 'type changed', changes);
  }
  if ((base.format ?? null) !== (head.format ?? null)) change(true, `${path}.format`, 'format changed', changes);
  for (const key of ['nullable', 'additional_properties'] as const) {
    const before = base[key] ?? false, after = head[key] ?? false;
    if (before !== after) change(kind === 'request' ? after !== true : after === true, `${path}.${key}`, 'constraint changed', changes);
  }
  const left = set(base.enum), right = set(head.enum);
  const removed = [...left].some(value => !right.has(value));
  const added = [...right].some(value => !left.has(value));
  if (removed || added) {
    // An omitted/empty enum leaves the value domain unrestricted.
    const narrowed = left.size === 0 || (right.size > 0 && removed);
    const widened = right.size === 0 || (left.size > 0 && added);
    change(kind === 'request' ? narrowed : widened, `${path}.enum`, 'enum domain changed', changes);
  }
  if (base.type === 'object' && head.type === 'object') {
    compareTypedProperties(record(base.properties), record(head.properties), kind, `${path}.properties`, changes, list(base.required), list(head.required));
  }
  if (base.type === 'array' && head.type === 'array') {
    compareProperty(record(base.items), record(head.items), kind, `${path}.items`, changes);
  }
}

function change(breaking: boolean, path: string, description: string, changes: ApiContractCompatibilityChange[]): void {
  changes.push({ level: breaking ? 'breaking' : 'feature', code: 'API_COMPAT_SCHEMA_TYPING_CHANGED', path,
    message: `Typed schema ${description} at \`${path}\`.` });
}
