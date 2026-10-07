import { optionalString, parseYamlObject, requiredBoolean, requiredObject, requiredRecordListAllowEmpty, requiredString, requiredStringList, requiredStringListAllowEmpty } from './shared.js';
export function parseApiSchemaBundleContract(source, file = 'contracts/apis/<service>/<schema>.yaml') {
    const data = parseYamlObject(source, file);
    const schemaBundle = requiredObject(data, 'schema_bundle', file);
    const commonEnvelope = requiredObject(schemaBundle, 'common_envelope', `${file}#schema_bundle`);
    const schemas = requiredRecordListAllowEmpty(schemaBundle, 'schemas', `${file}#schema_bundle`);
    return {
        file,
        serviceId: requiredString(schemaBundle, 'service_id', `${file}#schema_bundle`),
        ownerBoundary: requiredString(schemaBundle, 'owner_boundary', `${file}#schema_bundle`),
        status: requiredString(schemaBundle, 'status', `${file}#schema_bundle`),
        purpose: requiredString(schemaBundle, 'purpose', `${file}#schema_bundle`),
        commonEnvelope: {
            requiredRequestMetadata: requiredStringList(commonEnvelope, 'required_request_metadata', `${file}#schema_bundle.common_envelope`),
            requiredResponseMetadata: requiredStringList(commonEnvelope, 'required_response_metadata', `${file}#schema_bundle.common_envelope`),
            forbiddenPayloadValues: requiredStringList(commonEnvelope, 'forbidden_payload_values', `${file}#schema_bundle.common_envelope`)
        },
        schemas: schemas.map((schema, index) => parseApiSchemaDefinition(schema, `${file}#schema_bundle.schemas[${index}]`))
    };
}
export function parseApiSchemaDefinition(schema, context) {
    return {
        id: requiredString(schema, 'id', context),
        kind: requiredString(schema, 'kind', context),
        carriesSecretMaterial: requiredBoolean(schema, 'carries_secret_material', context),
        secretMaterialPolicy: optionalString(schema, 'secret_material_policy', context),
        sessionEffect: optionalString(schema, 'session_effect', context),
        requiredFields: requiredStringListAllowEmpty(schema, 'required_fields', context),
        optionalFields: optionalStringList(schema, 'optional_fields', context),
        secretFields: optionalStringList(schema, 'secret_fields', context),
        properties: schema.properties ?? null
    };
}
export function optionalStringList(data, key, context) {
    const value = data[key];
    if (value === undefined || value === null) {
        return [];
    }
    if (!Array.isArray(value) ||
        !value.every((item) => typeof item === 'string' && item.trim().length > 0)) {
        throw new Error(`${context} must declare string list \`${key}\` when set.`);
    }
    return value;
}
//# sourceMappingURL=api-schema-bundle.js.map