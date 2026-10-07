import { hasExactStringValues } from './shared.js';
export const ABUSE_CHALLENGE_FILE = 'contracts/apis/abuse-api/challenge.yaml';
export const ABUSE_CHALLENGE_OPERATION_IDS = [
    'platform.abuse.challenges.issue',
    'platform.abuse.challenges.redeem',
    'platform.abuse.verifications.verify',
    'platform.abuse.health.get'
];
export const ABUSE_CHALLENGE_PUBLIC_OPERATION_IDS = [
    'platform.abuse.challenges.issue',
    'platform.abuse.challenges.redeem'
];
export const ABUSE_CHALLENGE_PRIVATE_OPERATION_IDS = [
    'platform.abuse.verifications.verify',
    'platform.abuse.health.get'
];
export const ABUSE_CHALLENGE_BINDINGS = [
    'product_ref',
    'environment',
    'action'
];
export const ABUSE_PROVIDER_ADAPTER_OPERATIONS = ['issue', 'verify', 'health'];
export const ABUSE_INTERNAL_CALLER_FAMILIES = [
    'cloudflare_edge_gateway',
    'private_hetzner_service',
    'operator_health'
];
export const ABUSE_FORBIDDEN_CONSUMER_USES = [
    'verification_ref_as_authentication',
    'verification_ref_as_authorization',
    'verification_ref_as_payment_evidence',
    'verification_ref_as_domain_action_completion',
    'reuse_for_different_product_environment_or_action',
    'client_side_verification_as_final_product_decision'
];
export function validateAbuseChallenge(contracts, schemaBundlesByFile, diagnostics) {
    const contract = contracts.abuseChallenge;
    const push = (code, path, message) => {
        diagnostics.push({ code, file: ABUSE_CHALLENGE_FILE, path, message });
    };
    if (contract.schemaVersion !== 1 ||
        contract.status !== 'contract-only' ||
        contract.ownerBoundary !== 'platform') {
        push('API_ABUSE_CHALLENGE_BOUNDARY_INVALID', 'abuse_challenge', 'Abuse challenge must remain a contract-only platform boundary at schema version 1.');
    }
    if (!hasExactStringValues(contract.operationIds, ABUSE_CHALLENGE_OPERATION_IDS) ||
        !hasExactStringValues(contract.publicOperationIds, ABUSE_CHALLENGE_PUBLIC_OPERATION_IDS) ||
        !hasExactStringValues(contract.privateOperationIds, ABUSE_CHALLENGE_PRIVATE_OPERATION_IDS)) {
        push('API_ABUSE_CHALLENGE_SURFACE_INVALID', 'abuse_challenge.operation_ids', 'Abuse challenge must expose only public issue/redeem and private verify/health operations.');
    }
    if (!hasExactStringValues(contract.requiredBindingFields, ABUSE_CHALLENGE_BINDINGS) ||
        contract.verificationReceiptBinding !==
            'exact_product_environment_action_and_challenge_redemption') {
        push('API_ABUSE_CHALLENGE_BINDING_INVALID', 'abuse_challenge.required_binding_fields', 'Challenge and verification evidence must bind the exact product, environment, action, and redemption.');
    }
    if (!hasExactStringValues(contract.providerAdapterOperations, ABUSE_PROVIDER_ADAPTER_OPERATIONS) ||
        contract.providerAbstractionPolicy !==
            'provider_payload_and_failure_details_never_cross_product_contract') {
        push('API_ABUSE_CHALLENGE_PROVIDER_BOUNDARY_INVALID', 'abuse_challenge.provider_adapter_operations', 'The provider adapter must remain limited to issue, verify, and health without leaking provider payloads.');
    }
    if (!contract.verificationReceiptSingleUse ||
        contract.verificationReceiptTtlPolicy !==
            'short_lived_and_not_longer_than_challenge_or_product_request_window' ||
        contract.verificationConsumptionPolicy !==
            'successful_internal_verify_consumes_once_same_consumer_operation_replays_success_other_operation_or_mismatch_fails_closed' ||
        contract.verificationConsumerOperationPolicy !==
            'same_consumer_operation_ref_replays_success_different_ref_fails_closed' ||
        contract.redeemRecoveryPolicy !==
            'provider_success_persists_verified_state_before_finalization_and_same_idempotency_key_normalized_input_binding_replays_canonical_success' ||
        contract.verificationReceiptDerivationPolicy !==
            'keyed_deterministic_receipt_recoverable_by_key_id_without_plaintext_persistence') {
        push('API_ABUSE_CHALLENGE_RECEIPT_POLICY_INVALID', 'abuse_challenge.verification_receipt_single_use', 'Verification evidence must be short-lived, exact-bound, recoverable after redeem response loss, and replay success only for the same operation.');
    }
    if (contract.idempotencyPolicy !==
        'same_key_same_normalized_binding_replays_different_binding_conflicts' ||
        contract.failurePolicy !==
            'challenge_required_write_fails_closed_without_closing_unrelated_reads_or_authenticated_flows') {
        push('API_ABUSE_CHALLENGE_FAILURE_POLICY_INVALID', 'abuse_challenge.failure_policy', 'Required writes must fail closed with exact idempotency while unrelated flows stay available.');
    }
    if (contract.internalServiceProofPolicy !==
        'versioned_key_id_bounded_timestamp_single_use_nonce_and_signed_envelope_bind_method_path_request_id_canonical_body_sha256_idempotency_key_permission_and_exact_binding') {
        push('API_ABUSE_CHALLENGE_INTERNAL_PROOF_POLICY_INVALID', 'abuse_challenge.internal_service_proof_policy', 'Internal Edge verification proof must validate key generation, bounded time, a single-use nonce, request identity, the full request envelope, permission, and exact challenge binding.');
    }
    if (contract.publicOriginProtectionPolicy !==
        'browser_uses_edge_only_origin_requires_transport_identity_and_versioned_request_proof_before_state_creation') {
        push('API_ABUSE_CHALLENGE_PUBLIC_ORIGIN_PROTECTION_INVALID', 'abuse_challenge.public_origin_protection_policy', 'Public challenge operations must enter through Edge and the origin must verify transport identity and a versioned request proof before creating state.');
    }
    if (!hasExactStringValues(contract.internalCallerFamilies, ABUSE_INTERNAL_CALLER_FAMILIES) ||
        contract.internalCallerTopologyPolicy !==
            'cloudflare_bff_uses_edge_gateway_hetzner_api_uses_private_internal_service_credential_health_uses_separate_operator_principal') {
        push('API_ABUSE_CHALLENGE_CALLER_TOPOLOGY_INVALID', 'abuse_challenge.internal_caller_families', 'Cloudflare BFF, private Hetzner service, and operator health callers must keep distinct paths, principals, and credential families.');
    }
    if (contract.credentialAmbiguityPolicy !==
        'multiple_or_mismatched_credential_families_fail_closed_without_adapter_fallback') {
        push('API_ABUSE_CHALLENGE_CREDENTIAL_AMBIGUITY_INVALID', 'abuse_challenge.credential_ambiguity_policy', 'Multiple, mismatched, or failed credential families must fail closed without trying a weaker adapter.');
    }
    if (contract.productAuthorityPolicy !==
        'challenge_success_is_never_authentication_authorization_payment_or_domain_action_approval' ||
        !ABUSE_FORBIDDEN_CONSUMER_USES.every((value) => contract.forbiddenConsumerUses.includes(value))) {
        push('API_ABUSE_CHALLENGE_AUTHORITY_CONFLATION', 'abuse_challenge.product_authority_policy', 'Challenge evidence must never become authentication, authorization, payment, or product completion authority.');
    }
    if (contract.publicSurfacePolicy !== 'only_issue_and_redeem_are_public' ||
        contract.healthSurfacePolicy !==
            'private_authenticated_safe_projection_without_provider_secret_or_raw_failure' ||
        contract.storagePolicy !==
            'ttl_state_only_no_customer_truth_no_raw_ip_fingerprint_program_solution_token_or_request_body') {
        push('API_ABUSE_CHALLENGE_PRIVACY_SURFACE_INVALID', 'abuse_challenge.storage_policy', 'Only issue/redeem may be public and runtime state must remain TTL-only without raw identifying or challenge material.');
    }
    const routes = new Map(contracts.apiCatalog.routes
        .filter((route) => contract.operationIds.includes(route.operationId))
        .map((route) => [route.operationId, route]));
    for (const operationId of ABUSE_CHALLENGE_OPERATION_IDS) {
        const route = routes.get(operationId);
        if (!route || route.serviceId !== 'abuse-api' || route.ownerBoundary !== 'platform') {
            push('API_ABUSE_CHALLENGE_ROUTE_MISSING', 'abuse_challenge.operation_ids', `Canonical abuse route \`${operationId}\` must be present and owned by abuse-api.`);
            continue;
        }
        const shouldBePublic = ABUSE_CHALLENGE_PUBLIC_OPERATION_IDS.includes(operationId);
        if (route.authRequired === shouldBePublic) {
            push('API_ABUSE_CHALLENGE_ROUTE_EXPOSURE_INVALID', 'abuse_challenge.operation_ids', `Abuse route \`${operationId}\` has the wrong public/private authentication boundary.`);
        }
    }
    const bundle = schemaBundlesByFile.get(ABUSE_CHALLENGE_FILE);
    const redeemRequest = bundle?.schemas.find((schema) => schema.id === 'AbuseChallengeRedeemRequest');
    const redeemResponse = bundle?.schemas.find((schema) => schema.id === 'AbuseChallengeRedeemResponse');
    const verifyRequest = bundle?.schemas.find((schema) => schema.id === 'AbuseVerificationVerifyRequest');
    if (!bundle || !redeemRequest || !redeemResponse || !verifyRequest) {
        push('API_ABUSE_CHALLENGE_SCHEMA_BUNDLE_INVALID', 'schema_bundle', 'Abuse redeem and internal verification schemas must exist.');
        return;
    }
    if (!ABUSE_CHALLENGE_BINDINGS.every((field) => redeemRequest.requiredFields.includes(field)) ||
        redeemRequest.secretMaterialPolicy !==
            'challenge_solution_input_only_never_echo_or_persist_plaintext' ||
        !redeemRequest.secretFields.includes('challenge_response')) {
        push('API_ABUSE_CHALLENGE_REDEEM_SECRET_POLICY_INVALID', 'schema_bundle.schemas.AbuseChallengeRedeemRequest', 'Redeem must carry exact bindings and treat the challenge response as non-echoing, non-persisted secret input.');
    }
    if (!redeemResponse.requiredFields.includes('verification_ref') ||
        !redeemResponse.carriesSecretMaterial ||
        redeemResponse.secretMaterialPolicy !==
            'verification_receipt_output_only_never_log_or_persist_plaintext' ||
        !redeemResponse.secretFields.includes('verification_ref') ||
        !verifyRequest.requiredFields.includes('consumer_operation_ref') ||
        verifyRequest.secretMaterialPolicy !==
            'verification_receipt_input_only_never_echo_or_persist_plaintext' ||
        !verifyRequest.secretFields.includes('verification_ref')) {
        push('API_ABUSE_CHALLENGE_VERIFICATION_SECRET_POLICY_INVALID', 'schema_bundle.schemas.AbuseVerificationVerifyRequest', 'The short-lived verification receipt must remain secret while a stable opaque consumer operation ref binds safe retry.');
    }
}
//# sourceMappingURL=abuse-challenge.js.map