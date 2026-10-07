import type { WebhookContract } from '../types.js';

import { parseYamlObject, requiredObject, requiredString, requiredStringList } from './shared.js';

export function parseWebhookContract(source: string): WebhookContract {
  const data = parseYamlObject(source, 'contracts/webhook-contract.yaml');
  const webhookContract = requiredObject(
    data,
    'webhook_contract',
    'contracts/webhook-contract.yaml'
  );

  return {
    status: requiredString(
      webhookContract,
      'status',
      'contracts/webhook-contract.yaml#webhook_contract'
    ),
    requiredControls: requiredStringList(
      webhookContract,
      'required_controls',
      'contracts/webhook-contract.yaml#webhook_contract'
    ),
    forbiddenControls: requiredStringList(
      webhookContract,
      'forbidden_controls',
      'contracts/webhook-contract.yaml#webhook_contract'
    )
  };
}
