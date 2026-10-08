import {expect,test} from 'bun:test';
import schema from '../contracts/apis/money-api/coupon-usage-compensation.schema.json';
import capture from '../contracts/apis/money-api/coupon-usage-capture.schema.json';

test('compensation preserves the original operation and requires a separate terminal-failure capability',()=>{
  const wire=schema['x-zdp-transport'];
  expect(schema.$defs.request.additionalProperties).toBe(false);
  expect(Object.keys(schema.$defs.request.properties)).toEqual(['hold_ref','usage_ref','failure_ref']);
  expect(wire.capability).not.toBe(capture['x-zdp-transport'].capability);
  expect(wire.captureTimeout).toBe('reconcile-capture-never-compensate-unknown-outcome');
  expect(wire.deliveryAfterCompensation).toBe('forbidden');
  for(const field of ['restored_credit_unit','restored_benefit_credit_unit'] as const) {
    const rule=schema.$defs.response.properties[field];
    expect(rule.type).toBe('string');expect(new RegExp(rule.pattern).test('9007199254740993')).toBe(true);
  }
  expect(schema.$defs.response.required.length).toBe(Object.keys(schema.$defs.response.properties).length);
});
