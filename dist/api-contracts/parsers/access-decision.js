import { assertOnlyKeys, parseYamlObject, requiredNumber, requiredObject, requiredString, requiredStringList } from './shared.js';
export function parseAccessDecisionContract(source) {
    const file = 'contracts/apis/core-api/access-decision.yaml';
    const data = parseYamlObject(source, file);
    assertOnlyKeys(data, ['access_decision', 'schema_bundle'], file);
    const contract = requiredObject(data, 'access_decision', file);
    const context = `${file}#access_decision`;
    assertOnlyKeys(contract, [
        'schema_version',
        'status',
        'owner_boundary',
        'operation_id',
        'route_path',
        'http_profile',
        'decision_values',
        'required_request_bindings',
        'required_response_bindings',
        'trusted_authority_sources',
        'decision_binding',
        'denial_policy',
        'reason_code_policy',
        'evidence_ref_policy',
        'expiry_policy',
        'obligations_policy',
        'idempotency_policy',
        'consumer_mapping_policy',
        'forbidden_request_authority_fields',
        'forbidden_consumer_uses',
        'forbidden_values'
    ], context);
    return {
        schemaVersion: requiredNumber(contract, 'schema_version', context),
        status: requiredString(contract, 'status', context),
        ownerBoundary: requiredString(contract, 'owner_boundary', context),
        operationId: requiredString(contract, 'operation_id', context),
        routePath: requiredString(contract, 'route_path', context),
        httpProfile: contract.http_profile === undefined ? null : parseAccessDecisionHttpProfile(requiredObject(contract, 'http_profile', context), `${context}.http_profile`),
        decisionValues: requiredStringList(contract, 'decision_values', context),
        requiredRequestBindings: requiredStringList(contract, 'required_request_bindings', context),
        requiredResponseBindings: requiredStringList(contract, 'required_response_bindings', context),
        trustedAuthoritySources: requiredStringList(contract, 'trusted_authority_sources', context),
        decisionBinding: requiredString(contract, 'decision_binding', context),
        denialPolicy: requiredString(contract, 'denial_policy', context),
        reasonCodePolicy: requiredString(contract, 'reason_code_policy', context),
        evidenceRefPolicy: requiredString(contract, 'evidence_ref_policy', context),
        expiryPolicy: requiredString(contract, 'expiry_policy', context),
        obligationsPolicy: requiredString(contract, 'obligations_policy', context),
        idempotencyPolicy: requiredString(contract, 'idempotency_policy', context),
        consumerMappingPolicy: requiredString(contract, 'consumer_mapping_policy', context),
        forbiddenRequestAuthorityFields: requiredStringList(contract, 'forbidden_request_authority_fields', context),
        forbiddenConsumerUses: requiredStringList(contract, 'forbidden_consumer_uses', context),
        forbiddenValues: requiredStringList(contract, 'forbidden_values', context)
    };
}
export function parseAccessDecisionHttpProfile(profile, context) {
    assertOnlyKeys(profile, [
        'credential_transport', 'request_content_type', 'response_content_type',
        'success_envelope', 'error_envelope_ref', 'request_metadata_headers',
        'response_metadata_headers', 'cache_control', 'pragma', 'replay_status',
        'duplicate_header_policy', 'redirect_policy', 'max_identifier_utf8_bytes',
        'max_obligations', 'max_request_bytes', 'max_response_bytes'
    ], context);
    return {
        credentialTransport: requiredString(profile, 'credential_transport', context),
        requestContentType: requiredString(profile, 'request_content_type', context),
        responseContentType: requiredString(profile, 'response_content_type', context),
        successEnvelope: requiredString(profile, 'success_envelope', context),
        errorEnvelopeRef: requiredString(profile, 'error_envelope_ref', context),
        requestMetadataHeaders: requiredStringList(profile, 'request_metadata_headers', context),
        responseMetadataHeaders: requiredStringList(profile, 'response_metadata_headers', context),
        cacheControl: requiredString(profile, 'cache_control', context),
        pragma: requiredString(profile, 'pragma', context),
        replayStatus: requiredNumber(profile, 'replay_status', context),
        duplicateHeaderPolicy: requiredString(profile, 'duplicate_header_policy', context),
        redirectPolicy: requiredString(profile, 'redirect_policy', context),
        maxIdentifierUtf8Bytes: requiredNumber(profile, 'max_identifier_utf8_bytes', context),
        maxObligations: requiredNumber(profile, 'max_obligations', context),
        maxRequestBytes: requiredNumber(profile, 'max_request_bytes', context),
        maxResponseBytes: requiredNumber(profile, 'max_response_bytes', context)
    };
}
//# sourceMappingURL=access-decision.js.map