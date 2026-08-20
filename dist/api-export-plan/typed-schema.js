import { readFile } from 'node:fs/promises';
import { isAbsolute, relative, resolve, sep } from 'node:path';
import { parse } from 'yaml';
const DECLARED_PROPERTY_TYPES = [
    'string',
    'integer',
    'number',
    'boolean',
    'array',
    'object'
];
const PROPERTY_KEYS = [
    'type',
    'format',
    'enum',
    'nullable',
    'items',
    'properties',
    'required',
    'additional_properties'
];
/**
 * Reads opt-in `properties` metadata without breaking legacy field-list
 * contracts. Missing properties remain visible as explicitly untyped models.
 */
export async function loadTypedSchemaRegistry(root, bundles) {
    const resolvedRoot = resolve(root);
    const results = await Promise.all(bundles.map(async (bundle) => {
        const resolvedFile = resolve(root, bundle.file);
        const relativeFile = relative(resolvedRoot, resolvedFile);
        if (relativeFile === '..' ||
            relativeFile.startsWith(`..${sep}`) ||
            isAbsolute(relativeFile)) {
            return failedBundle(bundle.file, 'API_TYPED_SCHEMA_PATH_ESCAPE', 'schema_bundle', `Typed schema source \`${bundle.file}\` must remain under the package root.`);
        }
        try {
            return parseTypedSchemaBundle(await readFile(resolvedFile, 'utf8'), bundle);
        }
        catch (error) {
            return failedBundle(bundle.file, 'API_TYPED_SCHEMA_READ_FAILED', 'schema_bundle', error instanceof Error ? error.message : String(error));
        }
    }));
    const diagnostics = results.flatMap((result) => result.diagnostics);
    if (diagnostics.length > 0) {
        return { ok: false, registry: null, diagnostics };
    }
    const entries = results
        .flatMap((result) => result.schemas)
        .map((schema) => [schema.schemaRef, schema])
        .sort(([left], [right]) => left.localeCompare(right));
    return {
        ok: true,
        registry: {
            schemas: Object.fromEntries(entries),
            typedSchemaRefs: entries
                .filter(([, schema]) => schema.typed)
                .map(([schemaRef]) => schemaRef),
            untypedSchemaRefs: entries
                .filter(([, schema]) => !schema.typed)
                .map(([schemaRef]) => schemaRef)
        },
        diagnostics: []
    };
}
export function parseTypedSchemaBundle(source, bundle) {
    let parsed;
    try {
        parsed = parse(source);
    }
    catch (error) {
        return failedBundle(bundle.file, 'API_TYPED_SCHEMA_YAML_INVALID', 'schema_bundle', error instanceof Error ? error.message : String(error));
    }
    if (!isRecord(parsed)) {
        return failedBundle(bundle.file, 'API_TYPED_SCHEMA_BUNDLE_INVALID', 'schema_bundle', 'Schema bundle YAML must parse to an object.');
    }
    const rawBundle = parsed.schema_bundle;
    if (!isRecord(rawBundle) || !Array.isArray(rawBundle.schemas)) {
        return failedBundle(bundle.file, 'API_TYPED_SCHEMA_BUNDLE_INVALID', 'schema_bundle.schemas', 'Schema bundle must declare a schemas array.');
    }
    const diagnostics = [];
    const rawSchemasById = new Map();
    for (const [index, rawSchema] of rawBundle.schemas.entries()) {
        if (!isRecord(rawSchema) || typeof rawSchema.id !== 'string') {
            diagnostics.push(diagnostic('API_TYPED_SCHEMA_DEFINITION_INVALID', bundle.file, `schema_bundle.schemas[${index}]`, 'Typed schema metadata requires a string schema id.'));
            continue;
        }
        if (rawSchemasById.has(rawSchema.id)) {
            diagnostics.push(diagnostic('API_TYPED_SCHEMA_ID_DUPLICATE', bundle.file, `schema_bundle.schemas[${index}].id`, `Schema id \`${rawSchema.id}\` is duplicated.`));
            continue;
        }
        rawSchemasById.set(rawSchema.id, rawSchema);
    }
    const schemas = bundle.schemas.map((schema) => {
        const rawSchema = rawSchemasById.get(schema.id);
        if (rawSchema === undefined) {
            diagnostics.push(diagnostic('API_TYPED_SCHEMA_DEFINITION_MISSING', bundle.file, `schema_bundle.schemas[${schema.id}]`, `Parsed schema \`${schema.id}\` is missing from its source bundle.`));
            return buildLegacySchema(bundle, schema);
        }
        return parseSchemaDefinition(bundle, schema, rawSchema, diagnostics);
    });
    return { schemas, diagnostics };
}
function parseSchemaDefinition(bundle, schema, rawSchema, diagnostics) {
    const propertiesValue = rawSchema.properties;
    if (propertiesValue === undefined) {
        return buildLegacySchema(bundle, schema);
    }
    const path = `schema_bundle.schemas[${schema.id}].properties`;
    if (!isRecord(propertiesValue)) {
        diagnostics.push(diagnostic('API_TYPED_SCHEMA_PROPERTIES_INVALID', bundle.file, path, 'Typed schema properties must be an object keyed by field name.'));
        return buildLegacySchema(bundle, schema);
    }
    const declaredFields = unique([
        ...schema.requiredFields,
        ...schema.optionalFields
    ]);
    for (const secretField of schema.secretFields) {
        if (!declaredFields.includes(secretField)) {
            diagnostics.push(diagnostic('API_TYPED_SCHEMA_SECRET_FIELD_UNDECLARED', bundle.file, `schema_bundle.schemas[${schema.id}].secret_fields`, `Secret field \`${secretField}\` must also be required or optional.`));
        }
    }
    const propertyNames = Object.keys(propertiesValue);
    for (const field of declaredFields) {
        if (!Object.hasOwn(propertiesValue, field)) {
            diagnostics.push(diagnostic('API_TYPED_SCHEMA_PROPERTY_MISSING', bundle.file, path, `Typed schema \`${schema.id}\` must define property \`${field}\`.`));
        }
    }
    for (const field of propertyNames) {
        if (!declaredFields.includes(field)) {
            diagnostics.push(diagnostic('API_TYPED_SCHEMA_PROPERTY_UNDECLARED', bundle.file, `${path}.${field}`, `Typed property \`${field}\` must be listed in required_fields or optional_fields.`));
        }
    }
    return {
        schemaRef: `${bundle.file}#${schema.id}`,
        schemaId: schema.id,
        typed: true,
        properties: Object.fromEntries(propertyNames
            .sort((left, right) => left.localeCompare(right))
            .map((field) => [
            field,
            parseProperty(propertiesValue[field], bundle.file, `${path}.${field}`, diagnostics)
        ]))
    };
}
function parseProperty(value, file, path, diagnostics) {
    if (!isRecord(value)) {
        diagnostics.push(diagnostic('API_TYPED_SCHEMA_PROPERTY_INVALID', file, path, 'Schema property must be an object.'));
        return unknownProperty();
    }
    for (const key of Object.keys(value)) {
        if (!PROPERTY_KEYS.includes(key)) {
            diagnostics.push(diagnostic('API_TYPED_SCHEMA_PROPERTY_KEY_UNKNOWN', file, `${path}.${key}`, `Schema property must not declare unknown key \`${key}\`.`));
        }
    }
    const type = readDeclaredType(value.type, file, `${path}.type`, diagnostics);
    if (type === null) {
        return unknownProperty();
    }
    const format = readOptionalString(value.format, file, `${path}.format`, diagnostics);
    if (format !== null &&
        !['string', 'integer', 'number'].includes(type)) {
        diagnostics.push(diagnostic('API_TYPED_SCHEMA_FORMAT_TYPE_INVALID', file, `${path}.format`, 'format is only valid for string, integer, or number properties.'));
    }
    const nullable = readOptionalBoolean(value.nullable, false, file, `${path}.nullable`, diagnostics);
    const enumValues = parseEnumValues(value.enum, type, nullable, file, `${path}.enum`, diagnostics);
    let items = null;
    if (type === 'array') {
        if (!Object.hasOwn(value, 'items')) {
            diagnostics.push(diagnostic('API_TYPED_SCHEMA_ARRAY_ITEMS_MISSING', file, `${path}.items`, 'Array schema property must declare items.'));
            items = unknownProperty();
        }
        else {
            items = parseProperty(value.items, file, `${path}.items`, diagnostics);
        }
    }
    else if (Object.hasOwn(value, 'items')) {
        diagnostics.push(diagnostic('API_TYPED_SCHEMA_ITEMS_FORBIDDEN', file, `${path}.items`, 'Only array schema properties may declare items.'));
    }
    let properties = {};
    let requiredProperties = [];
    let additionalProperties = false;
    if (type === 'object') {
        properties = parseNestedProperties(value.properties, file, `${path}.properties`, diagnostics);
        requiredProperties = readOptionalStringList(value.required, file, `${path}.required`, diagnostics);
        for (const field of requiredProperties) {
            if (!Object.hasOwn(properties, field)) {
                diagnostics.push(diagnostic('API_TYPED_SCHEMA_OBJECT_REQUIRED_FIELD_MISSING', file, `${path}.required`, `Object required field \`${field}\` must exist in properties.`));
            }
        }
        additionalProperties = readOptionalBoolean(value.additional_properties, false, file, `${path}.additional_properties`, diagnostics);
    }
    else {
        for (const key of ['properties', 'required', 'additional_properties']) {
            if (Object.hasOwn(value, key)) {
                diagnostics.push(diagnostic('API_TYPED_SCHEMA_OBJECT_KEY_FORBIDDEN', file, `${path}.${key}`, `Only object schema properties may declare ${key}.`));
            }
        }
    }
    return {
        type,
        format,
        enumValues,
        nullable,
        items,
        properties,
        requiredProperties,
        additionalProperties
    };
}
function parseNestedProperties(value, file, path, diagnostics) {
    if (value === undefined) {
        return {};
    }
    if (!isRecord(value)) {
        diagnostics.push(diagnostic('API_TYPED_SCHEMA_OBJECT_PROPERTIES_INVALID', file, path, 'Object properties must be an object when set.'));
        return {};
    }
    return Object.fromEntries(Object.keys(value)
        .sort((left, right) => left.localeCompare(right))
        .map((field) => [
        field,
        parseProperty(value[field], file, `${path}.${field}`, diagnostics)
    ]));
}
function parseEnumValues(value, type, nullable, file, path, diagnostics) {
    if (value === undefined) {
        return [];
    }
    if (!Array.isArray(value) || value.length === 0) {
        diagnostics.push(diagnostic('API_TYPED_SCHEMA_ENUM_INVALID', file, path, 'enum must be a non-empty scalar array.'));
        return [];
    }
    if (type === 'array' || type === 'object') {
        diagnostics.push(diagnostic('API_TYPED_SCHEMA_ENUM_TYPE_INVALID', file, path, 'enum is only supported for scalar properties.'));
        return [];
    }
    const values = [];
    for (const item of value) {
        if (!isEnumValue(item) || !enumMatchesType(item, type, nullable)) {
            diagnostics.push(diagnostic('API_TYPED_SCHEMA_ENUM_VALUE_INVALID', file, path, `enum value \`${String(item)}\` does not match ${type}${nullable ? ' or null' : ''}.`));
            continue;
        }
        if (!values.some((existing) => Object.is(existing, item))) {
            values.push(item);
        }
    }
    return values;
}
function enumMatchesType(value, type, nullable) {
    if (value === null) {
        return nullable;
    }
    if (type === 'string') {
        return typeof value === 'string';
    }
    if (type === 'integer') {
        return typeof value === 'number' && Number.isInteger(value);
    }
    if (type === 'number') {
        return typeof value === 'number' && Number.isFinite(value);
    }
    return type === 'boolean' && typeof value === 'boolean';
}
function buildLegacySchema(bundle, schema) {
    const fields = unique([
        ...schema.requiredFields,
        ...schema.optionalFields
    ]).sort((left, right) => left.localeCompare(right));
    return {
        schemaRef: `${bundle.file}#${schema.id}`,
        schemaId: schema.id,
        typed: false,
        properties: Object.fromEntries(fields.map((field) => [field, unknownProperty()]))
    };
}
function unknownProperty() {
    return {
        type: 'unknown',
        format: null,
        enumValues: [],
        nullable: false,
        items: null,
        properties: {},
        requiredProperties: [],
        additionalProperties: true
    };
}
function readDeclaredType(value, file, path, diagnostics) {
    if (typeof value === 'string' &&
        DECLARED_PROPERTY_TYPES.includes(value)) {
        return value;
    }
    diagnostics.push(diagnostic('API_TYPED_SCHEMA_PROPERTY_TYPE_INVALID', file, path, `Schema property type must be one of ${DECLARED_PROPERTY_TYPES.join(', ')}.`));
    return null;
}
function readOptionalString(value, file, path, diagnostics) {
    if (value === undefined || value === null) {
        return null;
    }
    if (typeof value === 'string' && value.trim().length > 0) {
        return value;
    }
    diagnostics.push(diagnostic('API_TYPED_SCHEMA_STRING_INVALID', file, path, 'Expected a non-empty string when set.'));
    return null;
}
function readOptionalBoolean(value, fallback, file, path, diagnostics) {
    if (value === undefined) {
        return fallback;
    }
    if (typeof value === 'boolean') {
        return value;
    }
    diagnostics.push(diagnostic('API_TYPED_SCHEMA_BOOLEAN_INVALID', file, path, 'Expected a boolean when set.'));
    return fallback;
}
function readOptionalStringList(value, file, path, diagnostics) {
    if (value === undefined) {
        return [];
    }
    if (Array.isArray(value) &&
        value.every((item) => typeof item === 'string' && item.trim().length > 0)) {
        return unique(value);
    }
    diagnostics.push(diagnostic('API_TYPED_SCHEMA_STRING_LIST_INVALID', file, path, 'Expected a string array when set.'));
    return [];
}
function failedBundle(file, code, path, message) {
    return { schemas: [], diagnostics: [diagnostic(code, file, path, message)] };
}
function diagnostic(code, file, path, message) {
    return { code, file, path, message };
}
function isEnumValue(value) {
    return (value === null ||
        typeof value === 'string' ||
        typeof value === 'boolean' ||
        (typeof value === 'number' && Number.isFinite(value)));
}
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function unique(values) {
    return Array.from(new Set(values));
}
//# sourceMappingURL=typed-schema.js.map