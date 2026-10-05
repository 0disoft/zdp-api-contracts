import { expect, test } from 'bun:test';
import schema from '../contracts/apis/money-api/coupon-usage-capture.schema.json';

test('private capture carries only durable references and exact credit strings', () => {
  const { request, response } = schema.$defs;
  expect(request.additionalProperties).toBe(false);
  expect(Object.keys(request.properties)).toEqual(['hold_ref', 'usage_ref']);
  expect([...response.required].sort()).toEqual(Object.keys(response.properties).sort());
  for (const key of ['original_credit_unit', 'benefit_credit_unit', 'settled_credit_unit'] as const) {
    expect(response.properties[key].type).toBe('string');
    expect(new RegExp(response.properties[key].pattern).test('9007199254740993')).toBe(true);
  }
  expect(response.properties.source_kind.const).toBe('usage');
  expect(response.properties.bonus_credit_lot_id.type).toBe('null');
  expect(schema['x-zdp-transport'].retry).toBe('same-durable-usage-and-hold-only');
  expect(schema['x-zdp-transport'].status).toBe('internal-local-staging');
  expect(schema['x-zdp-transport'].responseHeaders).toContain('x-request-id');
});
