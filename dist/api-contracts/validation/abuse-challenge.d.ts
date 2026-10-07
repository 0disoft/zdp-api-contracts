import type { ApiContractDiagnostic, ApiContracts, ApiSchemaBundleContract } from '../types.js';
export declare const ABUSE_CHALLENGE_FILE = "contracts/apis/abuse-api/challenge.yaml";
export declare const ABUSE_CHALLENGE_OPERATION_IDS: readonly ["platform.abuse.challenges.issue", "platform.abuse.challenges.redeem", "platform.abuse.verifications.verify", "platform.abuse.health.get"];
export declare const ABUSE_CHALLENGE_PUBLIC_OPERATION_IDS: readonly ["platform.abuse.challenges.issue", "platform.abuse.challenges.redeem"];
export declare const ABUSE_CHALLENGE_PRIVATE_OPERATION_IDS: readonly ["platform.abuse.verifications.verify", "platform.abuse.health.get"];
export declare const ABUSE_CHALLENGE_BINDINGS: readonly ["product_ref", "environment", "action"];
export declare const ABUSE_PROVIDER_ADAPTER_OPERATIONS: readonly ["issue", "verify", "health"];
export declare const ABUSE_INTERNAL_CALLER_FAMILIES: readonly ["cloudflare_edge_gateway", "private_hetzner_service", "operator_health"];
export declare const ABUSE_FORBIDDEN_CONSUMER_USES: readonly ["verification_ref_as_authentication", "verification_ref_as_authorization", "verification_ref_as_payment_evidence", "verification_ref_as_domain_action_completion", "reuse_for_different_product_environment_or_action", "client_side_verification_as_final_product_decision"];
export declare function validateAbuseChallenge(contracts: ApiContracts, schemaBundlesByFile: ReadonlyMap<string, ApiSchemaBundleContract>, diagnostics: ApiContractDiagnostic[]): void;
//# sourceMappingURL=abuse-challenge.d.ts.map