export const REVIEWED_CALCULATOR_IDS = [
    'percentage-change',
    'margin-markup',
    'break-even-point',
    'compound-interest',
    'data-transfer-time',
    'date-difference',
    'studycafe-seat-occupancy',
    'studycafe-break-even',
    'kiosk-roi',
    'unattended-labor-savings',
    'locker-revenue',
    'study-room-schedule-revenue',
    'security-cost-break-even',
    'discount',
    'age',
    'work-hours',
    'fuel-cost',
    'percentage',
    'margin-pricing',
    'break-even-planning',
    'compound-savings'
];
export const ALLOWED_SESSION_EFFECTS = [
    'none',
    'issue',
    'refresh',
    'revoke',
    'expire',
    'compromise'
];
export const ALLOWED_OWNER_BOUNDARIES = [
    'identity',
    'accounts',
    'money',
    'access',
    'consent',
    'audit',
    'privacy',
    'platform',
    'architecture',
    'observability'
];
export const SCHEMA_REF_PATTERN = /^contracts\/apis\/[a-z0-9_-]+\/[a-z0-9_-]+\.yaml#[A-Z][A-Za-z0-9]+$/;
export function validateRequiredOidcValues(actual, required, code, path, push) {
    for (const value of required) {
        if (!actual.includes(value)) {
            push(code, path, `OIDC product-session contract must include \`${value}\`.`);
        }
    }
}
export function validateRequiredAccessDecisionValues(actual, required, code, path, push) {
    for (const value of required) {
        if (!actual.includes(value)) {
            push(code, path, `Access-decision contract must include \`${value}\`.`);
        }
    }
}
export function hasExactStringValues(actual, expected) {
    return (actual.length === expected.length &&
        new Set(actual).size === actual.length &&
        expected.every((value) => actual.includes(value)));
}
export function parseSchemaRef(ref) {
    if (!SCHEMA_REF_PATTERN.test(ref)) {
        return null;
    }
    const [file, schemaId] = ref.split('#');
    if (!file || !schemaId) {
        return null;
    }
    return { file, schemaId };
}
export function includesValue(values, value) {
    return values.includes(value);
}
//# sourceMappingURL=shared.js.map