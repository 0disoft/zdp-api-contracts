export const REQUIRED_WEBHOOK_CONTROLS = [
    'event_id',
    'event_type',
    'schema_version',
    'signature_verification',
    'idempotency_key',
    'replay_policy',
    'dead_letter_policy'
];
export const FORBIDDEN_WEBHOOK_CONTROLS = [
    'unversioned_payload',
    'provider_secret_in_schema',
    'ledger_mutation_without_money_contract'
];
export function validateWebhookContract(contracts, diagnostics) {
    if (contracts.webhook.status !== 'skeleton') {
        diagnostics.push({
            code: 'API_WEBHOOK_STATUS_INVALID',
            file: 'contracts/webhook-contract.yaml',
            path: 'webhook_contract.status',
            message: 'Webhook contract must stay in skeleton status until real webhooks exist.'
        });
    }
    for (const control of REQUIRED_WEBHOOK_CONTROLS) {
        if (!contracts.webhook.requiredControls.includes(control)) {
            diagnostics.push({
                code: 'API_WEBHOOK_REQUIRED_CONTROL_MISSING',
                file: 'contracts/webhook-contract.yaml',
                path: 'webhook_contract.required_controls',
                message: `Webhook contract must require \`${control}\`.`
            });
        }
    }
    for (const control of FORBIDDEN_WEBHOOK_CONTROLS) {
        if (!contracts.webhook.forbiddenControls.includes(control)) {
            diagnostics.push({
                code: 'API_WEBHOOK_FORBIDDEN_CONTROL_MISSING',
                file: 'contracts/webhook-contract.yaml',
                path: 'webhook_contract.forbidden_controls',
                message: `Webhook contract must forbid \`${control}\`.`
            });
        }
    }
}
//# sourceMappingURL=webhook.js.map