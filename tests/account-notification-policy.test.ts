import { expect, test } from 'bun:test';
import schema from '../contracts/apis/core-api/account-notification-policy.schema.json';

test('optional login presentation keeps Core policy separate from Money delivery state', () => {
  const wire = schema['x-zdp-transport'];
  expect(wire.owner).toBe('zdp-core-platform');
  expect(wire.scope).toBe('current-session-personal-account');
  expect(wire.methods).toEqual(['GET', 'POST']);
  expect(wire.defaultEnabled).toBe(true);
  expect(wire.conflictStatus).toBe(409);
  expect(wire.recovery).toBe('read-current-policy-before-another-update');
  expect(wire.disabledOrUnavailable).toBe('skip-announce-without-advancing-money-watermark');
  expect(wire.securityOrMarketingConsent).toBe('unchanged');
  for (const shape of [schema.$defs.request, schema.$defs.response]) {
    expect(shape.additionalProperties).toBe(false);
    expect(shape.required).toEqual(Object.keys(shape.properties));
  }
  expect(Object.keys(schema.$defs.request.properties)).toEqual(['coupon_received_login_toast', 'expected_revision']);
  expect(Object.keys(schema.$defs.response.properties)).toEqual(['coupon_received_login_toast', 'revision']);
  const revision = new RegExp(schema.$defs.revision.pattern);
  for (const value of ['0', '1', wire.revisionMaximum]) expect(revision.test(value)).toBe(true);
  for (const value of ['', '01', '-1', '1.0', '1e2', '12345678901234567890']) expect(revision.test(value)).toBe(false);
});
