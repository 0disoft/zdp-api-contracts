import { expect, test } from 'bun:test';
import type { ApiSchemaBundleContract } from '../src/api-contracts/types';
import { loadTypedSchemaRegistry, parseTypedSchemaBundle } from '../src/api-export-plan/typed-schema';
import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const bundle: ApiSchemaBundleContract = {
  file: 'contracts/example.yaml', serviceId: 'example', ownerBoundary: 'example',
  status: 'contract-only', purpose: 'bounded traversal fixture',
  commonEnvelope: { requiredRequestMetadata: [], requiredResponseMetadata: [], forbiddenPayloadValues: [] },
  schemas: [{ id: 'Example', kind: 'request', carriesSecretMaterial: false, secretMaterialPolicy: null,
    sessionEffect: null, requiredFields: ['payload'], optionalFields: [], secretFields: [] }]
};
const parseProperty = (property: string) => parseTypedSchemaBundle(
  `schema_bundle:\n  schemas:\n    - id: Example\n      properties:\n        payload: ${property}\n`, bundle);

test('typed schema loading rejects external links and allows internal and linked roots', async () => {
  const temp = await mkdtemp(join(tmpdir(), 'zdp-typed-schema-links-'));
  try {
    const root = join(temp, 'checkout');
    const external = join(temp, 'external');
    const internal = join(root, 'internal');
    await mkdir(external);
    await mkdir(internal, { recursive: true });
    const source = 'schema_bundle:\n  schemas:\n    - id: Example\n      properties:\n        payload: { type: string }\n';
    for (const target of [external, internal]) await writeFile(join(target, 'example.yaml'), source);
    const linkType = process.platform === 'win32' ? 'junction' : 'dir';
    await symlink(external, join(root, 'contracts'), linkType);
    const escaped = await loadTypedSchemaRegistry(root, [bundle]);
    expect(escaped.ok).toBe(false);
    expect(escaped.diagnostics[0]?.code).toBe('API_TYPED_SCHEMA_PATH_ESCAPE');
    await rm(join(root, 'contracts'));
    await symlink(internal, join(root, 'contracts'), linkType);
    expect((await loadTypedSchemaRegistry(root, [bundle])).ok).toBe(true);
    await symlink(root, join(temp, 'linked-root'), linkType);
    expect((await loadTypedSchemaRegistry(join(temp, 'linked-root'), [bundle])).ok).toBe(true);
  } finally { await rm(temp, { recursive: true, force: true }); }
});

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
