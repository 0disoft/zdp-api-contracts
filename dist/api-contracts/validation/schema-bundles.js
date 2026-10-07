import { CANONICAL_FORBIDDEN_VALUES } from '../forbidden-values.js';
import { ALLOWED_OWNER_BOUNDARIES, ALLOWED_SESSION_EFFECTS, includesValue, parseSchemaRef } from './shared.js';
export const ALLOWED_SECRET_MATERIAL_POLICIES = [
    'verifier_input_only_never_echo',
    'password_verifier_input_only_never_echo',
    'session_rotation_proof_only_never_echo',
    'browser_assertion_only_never_echo',
    'provider_callback_code_only_never_store_plaintext',
    'proof_verifier_input_only_never_echo_or_persist_plaintext',
    'one_time_receipt_input_only_never_echo_or_persist_plaintext',
    'challenge_solution_input_only_never_echo_or_persist_plaintext',
    'verification_receipt_output_only_never_log_or_persist_plaintext',
    'verification_receipt_input_only_never_echo_or_persist_plaintext'
];
export const REQUIRED_SCHEMA_BASE_REQUEST_METADATA = [
    'request_id',
    'trace_id'
];
export const REQUIRED_SCHEMA_RESPONSE_METADATA = ['request_id', 'trace_id'];
export const ALLOWED_SCHEMA_STATUSES = ['contract-only'];
export const ALLOWED_SCHEMA_KINDS = ['request', 'response'];
export const SCHEMA_ID_PATTERN = /^[A-Z][A-Za-z0-9]+$/;
export const SCHEMA_FIELD_PATTERN = /^[a-z][a-z0-9_]*$/;
export function validateSchemaBundles(contracts, schemaBundlesByFile, diagnostics) {
    for (const schemaBundle of contracts.schemaBundles) {
        validateSchemaBundle(schemaBundle, diagnostics);
    }
    const referencedFiles = new Set(contracts.apiCatalog.routes.flatMap((route) => [
        parseSchemaRef(route.requestSchemaRef)?.file,
        route.responseSchemaRef === null
            ? undefined
            : parseSchemaRef(route.responseSchemaRef)?.file
    ]));
    for (const file of referencedFiles) {
        if (file && !schemaBundlesByFile.has(file)) {
            diagnostics.push({
                code: 'API_SCHEMA_BUNDLE_REFERENCED_FILE_NOT_LOADED',
                file,
                path: 'schema_bundle',
                message: `Referenced schema bundle \`${file}\` must be loaded before validation.`
            });
        }
    }
}
export function validateSchemaBundle(schemaBundle, diagnostics) {
    if (!includesValue(ALLOWED_SCHEMA_STATUSES, schemaBundle.status)) {
        diagnostics.push({
            code: 'API_SCHEMA_BUNDLE_STATUS_INVALID',
            file: schemaBundle.file,
            path: 'schema_bundle.status',
            message: `Schema bundle \`${schemaBundle.file}\` must use contract-only status.`
        });
    }
    if (!includesValue(ALLOWED_OWNER_BOUNDARIES, schemaBundle.ownerBoundary)) {
        diagnostics.push({
            code: 'API_SCHEMA_BUNDLE_OWNER_BOUNDARY_INVALID',
            file: schemaBundle.file,
            path: 'schema_bundle.owner_boundary',
            message: `Schema bundle \`${schemaBundle.file}\` uses unsupported owner boundary \`${schemaBundle.ownerBoundary}\`.`
        });
    }
    for (const metadata of REQUIRED_SCHEMA_BASE_REQUEST_METADATA) {
        if (!schemaBundle.commonEnvelope.requiredRequestMetadata.includes(metadata)) {
            diagnostics.push({
                code: 'API_SCHEMA_BUNDLE_REQUEST_METADATA_MISSING',
                file: schemaBundle.file,
                path: 'schema_bundle.common_envelope.required_request_metadata',
                message: `Schema bundle \`${schemaBundle.file}\` must require request metadata \`${metadata}\`.`
            });
        }
    }
    for (const metadata of REQUIRED_SCHEMA_RESPONSE_METADATA) {
        if (!schemaBundle.commonEnvelope.requiredResponseMetadata.includes(metadata)) {
            diagnostics.push({
                code: 'API_SCHEMA_BUNDLE_RESPONSE_METADATA_MISSING',
                file: schemaBundle.file,
                path: 'schema_bundle.common_envelope.required_response_metadata',
                message: `Schema bundle \`${schemaBundle.file}\` must require response metadata \`${metadata}\`.`
            });
        }
    }
    for (const value of CANONICAL_FORBIDDEN_VALUES) {
        if (!schemaBundle.commonEnvelope.forbiddenPayloadValues.includes(value)) {
            diagnostics.push({
                code: 'API_SCHEMA_BUNDLE_FORBIDDEN_VALUE_MISSING',
                file: schemaBundle.file,
                path: 'schema_bundle.common_envelope.forbidden_payload_values',
                message: `Schema bundle \`${schemaBundle.file}\` must forbid \`${value}\`.`
            });
        }
    }
    if (schemaBundle.schemas.length === 0) {
        diagnostics.push({
            code: 'API_SCHEMA_BUNDLE_EMPTY',
            file: schemaBundle.file,
            path: 'schema_bundle.schemas',
            message: `Schema bundle \`${schemaBundle.file}\` must define at least one schema.`
        });
        return;
    }
    validateUniqueSchemaIds(schemaBundle, diagnostics);
    schemaBundle.schemas.forEach((schema, index) => {
        validateSchemaDefinition(schemaBundle, schema, index, diagnostics);
    });
}
export function validateSchemaDefinition(schemaBundle, schema, index, diagnostics) {
    const path = `schema_bundle.schemas[${index}]`;
    if (!SCHEMA_ID_PATTERN.test(schema.id)) {
        diagnostics.push({
            code: 'API_SCHEMA_ID_INVALID',
            file: schemaBundle.file,
            path: `${path}.id`,
            message: `Schema id \`${schema.id}\` must be PascalCase.`
        });
    }
    if (!includesValue(ALLOWED_SCHEMA_KINDS, schema.kind)) {
        diagnostics.push({
            code: 'API_SCHEMA_KIND_INVALID',
            file: schemaBundle.file,
            path: `${path}.kind`,
            message: `Schema \`${schema.id}\` uses unsupported kind \`${schema.kind}\`.`
        });
    }
    if (schema.kind === 'request' && schema.sessionEffect !== null) {
        diagnostics.push({
            code: 'API_SCHEMA_REQUEST_SESSION_EFFECT_DECLARED',
            file: schemaBundle.file,
            path: `${path}.session_effect`,
            message: `Request schema \`${schema.id}\` must not declare session_effect.`
        });
    }
    if (schema.kind === 'response' && schema.sessionEffect === null) {
        diagnostics.push({
            code: 'API_SCHEMA_RESPONSE_SESSION_EFFECT_MISSING',
            file: schemaBundle.file,
            path: `${path}.session_effect`,
            message: `Response schema \`${schema.id}\` must declare session_effect.`
        });
    }
    if (schema.sessionEffect !== null &&
        !includesValue(ALLOWED_SESSION_EFFECTS, schema.sessionEffect)) {
        diagnostics.push({
            code: 'API_SCHEMA_SESSION_EFFECT_INVALID',
            file: schemaBundle.file,
            path: `${path}.session_effect`,
            message: `Schema \`${schema.id}\` uses unsupported session_effect \`${schema.sessionEffect}\`.`
        });
    }
    for (const field of schema.requiredFields) {
        if (!SCHEMA_FIELD_PATTERN.test(field)) {
            diagnostics.push({
                code: 'API_SCHEMA_REQUIRED_FIELD_INVALID',
                file: schemaBundle.file,
                path: `${path}.required_fields`,
                message: `Schema \`${schema.id}\` required field \`${field}\` must be snake_case.`
            });
        }
    }
    const allowedEmptyRequestSchemas = new Set([
        'AccountSettingsOverviewGetRequest',
        'CurrentPersonalAccountScopeGetRequest',
        'AuthSessionCurrentGetRequest',
        'OperatorSessionContextGetRequest',
        'AbuseHealthGetRequest',
        'PasskeyLoginBeginRequest'
    ]);
    if (schema.requiredFields.length === 0 &&
        !(schema.kind === 'request' && allowedEmptyRequestSchemas.has(schema.id))) {
        diagnostics.push({
            code: 'API_SCHEMA_REQUIRED_FIELDS_EMPTY',
            file: schemaBundle.file,
            path: `${path}.required_fields`,
            message: `Schema \`${schema.id}\` must declare at least one required field unless it is an explicitly bodyless request.`
        });
    }
    for (const field of schema.optionalFields) {
        if (!SCHEMA_FIELD_PATTERN.test(field)) {
            diagnostics.push({
                code: 'API_SCHEMA_OPTIONAL_FIELD_INVALID',
                file: schemaBundle.file,
                path: `${path}.optional_fields`,
                message: `Schema \`${schema.id}\` optional field \`${field}\` must be snake_case.`
            });
        }
        if (schema.requiredFields.includes(field)) {
            diagnostics.push({
                code: 'API_SCHEMA_FIELD_DECLARATION_OVERLAP',
                file: schemaBundle.file,
                path: `${path}.optional_fields`,
                message: `Schema \`${schema.id}\` field \`${field}\` must not be both required and optional.`
            });
        }
    }
    if (schema.carriesSecretMaterial) {
        if (schema.kind !== 'request' &&
            schema.secretMaterialPolicy !==
                'verification_receipt_output_only_never_log_or_persist_plaintext') {
            diagnostics.push({
                code: 'API_SCHEMA_SECRET_MATERIAL_ON_NON_REQUEST',
                file: schemaBundle.file,
                path: `${path}.carries_secret_material`,
                message: `Only request schemas and explicitly output-only verification receipts may carry secret material.`
            });
        }
        if (schema.secretMaterialPolicy === null ||
            !isSecretMaterialPolicySafe(schema.secretMaterialPolicy)) {
            diagnostics.push({
                code: 'API_SCHEMA_SECRET_MATERIAL_POLICY_INVALID',
                file: schemaBundle.file,
                path: `${path}.secret_material_policy`,
                message: `Secret-carrying schema \`${schema.id}\` must declare a non-echoing secret material policy.`
            });
        }
        if (schema.secretFields.length === 0) {
            diagnostics.push({
                code: 'API_SCHEMA_SECRET_FIELDS_MISSING',
                file: schemaBundle.file,
                path: `${path}.secret_fields`,
                message: `Secret-carrying schema \`${schema.id}\` must declare secret_fields.`
            });
        }
        for (const secretField of schema.secretFields) {
            if (!schema.requiredFields.includes(secretField)) {
                diagnostics.push({
                    code: 'API_SCHEMA_SECRET_FIELD_NOT_REQUIRED',
                    file: schemaBundle.file,
                    path: `${path}.secret_fields`,
                    message: `Secret field \`${secretField}\` must also be listed in required_fields for schema \`${schema.id}\`.`
                });
            }
        }
    }
    else if (schema.secretFields.length > 0) {
        diagnostics.push({
            code: 'API_SCHEMA_SECRET_FIELDS_ON_NON_SECRET_SCHEMA',
            file: schemaBundle.file,
            path: `${path}.secret_fields`,
            message: `Schema \`${schema.id}\` must not declare secret_fields unless carries_secret_material is true.`
        });
    }
}
export function validateUniqueSchemaIds(schemaBundle, diagnostics) {
    const seenSchemaIds = new Map();
    schemaBundle.schemas.forEach((schema, index) => {
        const previousIndex = seenSchemaIds.get(schema.id);
        if (previousIndex !== undefined) {
            diagnostics.push({
                code: 'API_SCHEMA_ID_DUPLICATE',
                file: schemaBundle.file,
                path: `schema_bundle.schemas[${index}].id`,
                message: `Schema id \`${schema.id}\` duplicates schema_bundle.schemas[${previousIndex}].`
            });
        }
        else {
            seenSchemaIds.set(schema.id, index);
        }
    });
}
export function isSecretMaterialPolicySafe(policy) {
    return includesValue(ALLOWED_SECRET_MATERIAL_POLICIES, policy);
}
//# sourceMappingURL=schema-bundles.js.map