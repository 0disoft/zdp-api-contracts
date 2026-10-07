import { expect, test } from 'bun:test';
import { compareTypedProperties } from '../scripts/lib/compatibility-typed-properties';
import type { ApiContractCompatibilityChange } from '../scripts/lib/compatibility-types';

function compare(base: Record<string, unknown>, head: Record<string, unknown>, kind = 'request') {
  const changes: ApiContractCompatibilityChange[] = [];
  compareTypedProperties(base, head, kind, 'schema.properties', changes);
  return changes;
}

test('enum and nested required ordering and explicit defaults preserve compatibility', () => {
  const base = { payload: { type: 'object', properties: { status: { type: 'string', enum: ['a', 'b'] }, count: { type: 'integer' } }, required: ['status', 'count'] } };
  const head = { payload: { type: 'object', additional_properties: false, nullable: false,
    properties: { count: { type: 'integer', nullable: false }, status: { type: 'string', enum: ['b', 'a'], nullable: false } }, required: ['count', 'status'] } };
  expect(compare(base, head)).toEqual([]);
});

test('request enum expansion is compatible while response expansion breaks exhaustive consumers', () => {
  const base = { status: { type: 'string', enum: ['a'] } };
  const head = { status: { type: 'string', enum: ['a', 'b'] } };
  expect(compare(base, head).map(item => item.level)).toEqual(['feature']);
  expect(compare(base, head, 'response').map(item => item.level)).toEqual(['breaking']);
  expect(compare(head, base).map(item => item.level)).toEqual(['breaking']);
  expect(compare(head, base, 'response').map(item => item.level)).toEqual(['feature']);
});

test('optional properties are additive but required input additions remain breaking', () => {
  const base = { payload: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] } };
  const head = { payload: { type: 'object', properties: { name: { type: 'string' }, note: { type: 'string' } }, required: ['name'] } };
  expect(compare(base, head).map(item => item.level)).toEqual(['feature']);
  head.payload.required.push('note');
  expect(compare(base, head).map(item => item.level)).toEqual(['breaking']);
  expect(compare(base, head, 'response').map(item => item.level)).toEqual(['feature']);
});

test('array item constraints and nullable domains respect input/output direction', () => {
  const base = { entries: { type: 'array', items: { type: 'string', nullable: false } } };
  const head = { entries: { type: 'array', items: { type: 'string', nullable: true } } };
  expect(compare(base, head).map(item => item.level)).toEqual(['feature']);
  expect(compare(base, head, 'response').map(item => item.level)).toEqual(['breaking']);
  expect(compare(base, { entries: { type: 'array', items: { type: 'integer' } } })[0]?.level).toBe('breaking');
});
