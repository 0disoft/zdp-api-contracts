import { parse } from 'yaml';
export function parseYamlObject(source, file) {
    const data = parse(source);
    if (!isRecord(data)) {
        throw new Error(`${file} must parse to a YAML object.`);
    }
    return data;
}
export function requiredObject(data, key, context) {
    const value = data[key];
    if (!isRecord(value)) {
        throw new Error(`${context} must declare object field \`${key}\`.`);
    }
    return value;
}
export function requiredStringList(data, key, context) {
    const value = data[key];
    if (!Array.isArray(value) ||
        value.length === 0 ||
        !value.every((item) => typeof item === 'string' && item.trim().length > 0)) {
        throw new Error(`${context} must declare non-empty string list \`${key}\`.`);
    }
    return value;
}
export function requiredStringListAllowEmpty(data, key, context) {
    const value = data[key];
    if (!Array.isArray(value) ||
        !value.every((item) => typeof item === 'string' && item.trim().length > 0)) {
        throw new Error(`${context} must declare string list \`${key}\`.`);
    }
    return value;
}
export function requiredNumberList(data, key, context) {
    const value = data[key];
    if (!Array.isArray(value) ||
        value.length === 0 ||
        !value.every((item) => typeof item === 'number' && Number.isInteger(item))) {
        throw new Error(`${context} must declare non-empty integer list \`${key}\`.`);
    }
    return value;
}
export function requiredRecordListAllowEmpty(data, key, context) {
    const value = data[key];
    if (!Array.isArray(value) || !value.every(isRecord)) {
        throw new Error(`${context} must declare object list \`${key}\`.`);
    }
    return value;
}
export function requiredRecordListNonEmpty(data, key, context) {
    const value = requiredRecordListAllowEmpty(data, key, context);
    if (value.length === 0) {
        throw new Error(`${context} must declare non-empty object list \`${key}\`.`);
    }
    return value;
}
export function requiredString(data, key, context) {
    const value = data[key];
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new Error(`${context} must declare string field \`${key}\`.`);
    }
    return value;
}
export function requiredBoolean(data, key, context) {
    const value = data[key];
    if (typeof value !== 'boolean') {
        throw new Error(`${context} must declare boolean field \`${key}\`.`);
    }
    return value;
}
export function optionalString(data, key, context) {
    const value = data[key];
    if (value === undefined || value === null) {
        return null;
    }
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new Error(`${context} must declare string field \`${key}\` when set.`);
    }
    return value;
}
export function requiredNumber(data, key, context) {
    const value = data[key];
    if (typeof value !== 'number' || !Number.isInteger(value)) {
        throw new Error(`${context} must declare integer field \`${key}\`.`);
    }
    return value;
}
export function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
export function assertOnlyKeys(data, allowedKeys, context) {
    for (const key of Object.keys(data)) {
        if (!allowedKeys.includes(key)) {
            throw new Error(`${context} must not declare unknown field \`${key}\`.`);
        }
    }
}
//# sourceMappingURL=shared.js.map