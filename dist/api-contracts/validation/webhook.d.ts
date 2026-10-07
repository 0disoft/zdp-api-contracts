import type { ApiContractDiagnostic, ApiContracts } from '../types.js';
export declare const REQUIRED_WEBHOOK_CONTROLS: readonly ["event_id", "event_type", "schema_version", "signature_verification", "idempotency_key", "replay_policy", "dead_letter_policy"];
export declare const FORBIDDEN_WEBHOOK_CONTROLS: readonly ["unversioned_payload", "provider_secret_in_schema", "ledger_mutation_without_money_contract"];
export declare function validateWebhookContract(contracts: ApiContracts, diagnostics: ApiContractDiagnostic[]): void;
//# sourceMappingURL=webhook.d.ts.map