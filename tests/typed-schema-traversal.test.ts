import { expect, test } from 'bun:test';
import type { ApiSchemaBundleContract } from '../src/api-contracts/types';
import { parseTypedSchemaBundle } from '../src/api-export-plan/typed-schema';

const bundle: ApiSchemaBundleContract = {
  file: 'contracts/example.yaml', serviceId: 'example', ownerBoundary: 'example',
  status: 'contract-only', purpose: 'bounded traversal fixture',
  commonEnvelope: { requiredRequestMetadata: [], requiredResponseMetadata: [], forbiddenPayloadValues: [] },
  schemas: [{ id: 'Example', kind: 'request', carriesSecretMaterial: false, secretMaterialPolicy: null,
    sessionEffect: null, requiredFields: ['payload'], optionalFields: [], secretFields: [] }]
};
const parseProperty = (property: string) => parseTypedSchemaBundle(
  `schema_bundle:\n  schemas:\n    - id: Example\n      properties:\n        payload: ${property}\n`, bundle);

test('reports a cyclic array item alias without throwing a stack error', () => {
  const result = parseProperty('&loop { type: array, items: *loop }');
  expect(result.diagnostics).toContainEqual(expect.objectContaining({
    code: 'API_TYPED_SCHEMA_CYCLE', path: 'schema_bundle.schemas[Example].properties.payload.items'
  }));
});

test('bounds mixed object and array nesting while accepting ordinary nested schemas', () => {
  const nested = (levels: number) => {
    let value = '{ type: string }';
    for (let index = 0; index < levels; index++) value = index % 2
      ? `{ type: object, properties: { child: ${value} } }`
      : `{ type: array, items: ${value} }`;
    return value;
  };
  expect(parseProperty(nested(8)).diagnostics).toEqual([]);
  expect(parseProperty(nested(70)).diagnostics).toContainEqual(expect.objectContaining({
    code: 'API_TYPED_SCHEMA_DEPTH_EXCEEDED'
  }));
});

test('allows non-cyclic aliases shared by sibling properties', () => {
  expect(parseProperty('{ type: object, properties: { first: &shared { type: string }, second: *shared } }')
    .diagnostics).toEqual([]);
});
