import { expect, test } from 'bun:test';
import { compareTypedProperties } from '../scripts/lib/compatibility-typed-properties';
import type { ApiContractCompatibilityChange } from '../scripts/lib/compatibility-types';

function compare(base: Record<string, unknown>, head: Record<string, unknown>, kind = 'request') {
  const changes: ApiContractCompatibilityChange[] = [];
  compareTypedProperties(base, head, kind, 'schema.properties', changes);
  return changes;
}

test('reports cyclic property comparisons instead of overflowing the stack', () => {
  const cyclic: Record<string, unknown> = { type: 'array' };
  cyclic.items = cyclic;
  const ordinary = { type: 'array', items: { type: 'string' } };
  for (const [base, head] of [[cyclic, cyclic], [cyclic, ordinary], [ordinary, cyclic]]) {
    expect(compare({ payload: base }, { payload: head })).toContainEqual(expect.objectContaining({
      level: 'breaking', code: 'API_COMPAT_SCHEMA_TRAVERSAL_INVALID'
    }));
  }
});

test('bounds nested comparisons without rejecting shared acyclic properties', () => {
  let nested: Record<string, unknown> = { type: 'string' };
  for (let index = 0; index < 70; index++) nested = { type: 'array', items: nested };
  expect(compare({ payload: nested }, { payload: nested })).toContainEqual(expect.objectContaining({
    code: 'API_COMPAT_SCHEMA_TRAVERSAL_INVALID'
  }));
  const shared = { type: 'object', properties: { name: { type: 'string' } } };
  expect(compare({ first: shared, second: shared }, { first: shared, second: shared })).toEqual([]);
});

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

test('format constraints respect request and response direction without treating replacements as safe', () => {
  const plain = { entries: { type: 'array', items: { type: 'string' } } };
  const email = { entries: { type: 'array', items: { type: 'string', format: 'email' } } };
  const uri = { entries: { type: 'array', items: { type: 'string', format: 'uri' } } };
  expect(compare(plain, email).map(item => item.level)).toEqual(['breaking']);
  expect(compare(email, plain).map(item => item.level)).toEqual(['feature']);
  expect(compare(plain, email, 'response').map(item => item.level)).toEqual(['feature']);
  expect(compare(email, plain, 'response').map(item => item.level)).toEqual(['breaking']);
  for (const kind of ['request', 'response', 'unknown']) {
    expect(compare(email, uri, kind).map(item => item.level)).toEqual(['breaking']);
  }
});

test('optional properties are additive but required input additions remain breaking', () => {
  const base = { payload: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] } };
  const head = { payload: { type: 'object', properties: { name: { type: 'string' }, note: { type: 'string' } }, required: ['name'] } };
  expect(compare(base, head).map(item => item.level)).toEqual(['feature']);
  head.payload.required.push('note');
  expect(compare(base, head).map(item => item.level)).toEqual(['breaking']);
  expect(compare(base, head, 'response').map(item => item.level)).toEqual(['feature']);
});

test('adding a typed optional field constrains previously allowed extra request values', () => {
  const open = { payload: { type: 'object', additional_properties: true, properties: {} } };
  const closed = { payload: { type: 'object', additional_properties: false, properties: {} } };
  const withNote = { payload: { type: 'object', additional_properties: true,
    properties: { note: { type: 'string' } } } };
  // Previously { payload: { note: 42 } } was valid for the open request object.
  expect(compare(open, withNote)).toContainEqual(expect.objectContaining({
    path: 'schema.properties.payload.properties.note', level: 'breaking'
  }));
  const closedWithNote = { payload: { ...withNote.payload, additional_properties: false } };
  expect(compare(closed, closedWithNote).map(item => item.level)).toEqual(['feature']);
  expect(compare(open, withNote, 'response').map(item => item.level)).toEqual(['feature']);
});

test('array item constraints and nullable domains respect input/output direction', () => {
  const base = { entries: { type: 'array', items: { type: 'string', nullable: false } } };
  const head = { entries: { type: 'array', items: { type: 'string', nullable: true } } };
  expect(compare(base, head).map(item => item.level)).toEqual(['feature']);
  expect(compare(base, head, 'response').map(item => item.level)).toEqual(['breaking']);
  expect(compare(base, { entries: { type: 'array', items: { type: 'integer' } } })[0]?.level).toBe('breaking');
});
