import { assertOnlyKeys, parseYamlObject, requiredNumber, requiredObject, requiredRecordListNonEmpty, requiredString, requiredStringList } from './shared.js';
export function parseSensitiveActionAuthorizationContract(source) {
    const file = 'contracts/apis/core-api/sensitive-action-authorization.yaml';
    const data = parseYamlObject(source, file);
    assertOnlyKeys(data, ['sensitive_action_authorization', 'schema_bundle'], file);
    const context = `${file}#sensitive_action_authorization`;
    const contract = requiredObject(data, 'sensitive_action_authorization', file);
    assertOnlyKeys(contract, [
        'schema_version',
        'status',
        'receipt_format',
        'owner_boundaries',
        'issuer_lifecycle',
        'audience_consumption_lifecycle',
        'required_bindings',
        'required_assurance_fields',
        'required_platform_decision_fields',
        'required_consumer_controls',
        'verification_result_values',
        'expiry_policy',
        'route_status',
        'forbidden_claims',
        'forbidden_values'
    ], context);
    const ownerBoundaries = requiredObject(contract, 'owner_boundaries', context);
    assertOnlyKeys(ownerBoundaries, [
        'assurance',
        'platform_decision',
        'audience_domain_guard_and_consumption'
    ], `${context}.owner_boundaries`);
    return {
        schemaVersion: requiredNumber(contract, 'schema_version', context),
        status: requiredString(contract, 'status', context),
        receiptFormat: requiredString(contract, 'receipt_format', context),
        ownerBoundaries: {
            assurance: requiredString(ownerBoundaries, 'assurance', `${context}.owner_boundaries`),
            platformDecision: requiredString(ownerBoundaries, 'platform_decision', `${context}.owner_boundaries`),
            audienceDomainGuardAndConsumption: requiredString(ownerBoundaries, 'audience_domain_guard_and_consumption', `${context}.owner_boundaries`)
        },
        issuerLifecycle: parseSensitiveActionAuthorizationLifecycle(requiredObject(contract, 'issuer_lifecycle', context), `${context}.issuer_lifecycle`),
        audienceConsumptionLifecycle: parseSensitiveActionAuthorizationLifecycle(requiredObject(contract, 'audience_consumption_lifecycle', context), `${context}.audience_consumption_lifecycle`),
        requiredBindings: requiredStringList(contract, 'required_bindings', context),
        requiredAssuranceFields: requiredStringList(contract, 'required_assurance_fields', context),
        requiredPlatformDecisionFields: requiredStringList(contract, 'required_platform_decision_fields', context),
        requiredConsumerControls: requiredStringList(contract, 'required_consumer_controls', context),
        verificationResultValues: requiredStringList(contract, 'verification_result_values', context),
        expiryPolicy: requiredString(contract, 'expiry_policy', context),
        routeStatus: requiredString(contract, 'route_status', context),
        forbiddenClaims: requiredStringList(contract, 'forbidden_claims', context),
        forbiddenValues: requiredStringList(contract, 'forbidden_values', context)
    };
}
export function parseSensitiveActionAuthorizationLifecycle(lifecycle, context) {
    assertOnlyKeys(lifecycle, ['states', 'terminal_states', 'allowed_transitions'], context);
    const transitions = requiredRecordListNonEmpty(lifecycle, 'allowed_transitions', context);
    return {
        states: requiredStringList(lifecycle, 'states', context),
        terminalStates: requiredStringList(lifecycle, 'terminal_states', context),
        transitions: transitions.map((transition, index) => parseSensitiveActionAuthorizationTransition(transition, `${context}.allowed_transitions[${index}]`))
    };
}
export function parseSensitiveActionAuthorizationTransition(transition, context) {
    assertOnlyKeys(transition, ['from', 'event', 'to'], context);
    return {
        from: requiredString(transition, 'from', context),
        event: requiredString(transition, 'event', context),
        to: requiredString(transition, 'to', context)
    };
}
//# sourceMappingURL=sensitive-action-authorization.js.map