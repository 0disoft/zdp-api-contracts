export function parseRequestHeaders(value, fields, context) {
    if (value === undefined)
        return [];
    if (!Array.isArray(value))
        throw new Error(`${context}.request_headers must be an array.`);
    const names = new Set();
    return value.map((entry) => {
        if (!entry || typeof entry !== 'object' || Array.isArray(entry))
            throw new Error(`${context}: invalid request header rule.`);
        const rule = entry;
        if (Object.keys(rule).some(key => !['name', 'value', 'required_when'].includes(key)) ||
            typeof rule.name !== 'string' || !/^[a-z][a-z0-9-]{0,126}$/.test(rule.name) ||
            /^(authorization|cookie|set-cookie|proxy-authorization)$/.test(rule.name) || names.has(rule.name) ||
            typeof rule.value !== 'string' || !/^[\x21-\x7e]{1,128}$/.test(rule.value)) {
            throw new Error(`${context}: invalid or duplicate request header name/value.`);
        }
        names.add(rule.name);
        const condition = rule.required_when;
        if (condition === 'always')
            return { name: rule.name, value: rule.value, requiredWhen: 'always' };
        if (!condition || typeof condition !== 'object' || Array.isArray(condition) ||
            Object.keys(condition).join() !== 'any_nonempty_fields')
            throw new Error(`${context}: invalid request header condition.`);
        const requiredFields = condition.any_nonempty_fields;
        if (!Array.isArray(requiredFields) || requiredFields.length === 0 ||
            requiredFields.some(field => typeof field !== 'string' || !fields.includes(field)) ||
            new Set(requiredFields).size !== requiredFields.length)
            throw new Error(`${context}: unknown or duplicate request header condition field.`);
        return { name: rule.name, value: rule.value, requiredWhen: { anyNonemptyFields: [...requiredFields].sort() } };
    });
}
//# sourceMappingURL=request-headers.js.map