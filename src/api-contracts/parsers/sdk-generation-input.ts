import type { SdkGenerationInputContract } from '../types.js';

import { parseYamlObject, requiredObject, requiredString, requiredStringList } from './shared.js';

export function parseSdkGenerationInputContract(
  source: string
): SdkGenerationInputContract {
  const data = parseYamlObject(source, 'contracts/sdk-generation-input.yaml');
  const sdkGenerationInput = requiredObject(
    data,
    'sdk_generation_input',
    'contracts/sdk-generation-input.yaml'
  );

  return {
    status: requiredString(
      sdkGenerationInput,
      'status',
      'contracts/sdk-generation-input.yaml#sdk_generation_input'
    ),
    sourceContracts: requiredStringList(
      sdkGenerationInput,
      'source_contracts',
      'contracts/sdk-generation-input.yaml#sdk_generation_input'
    ),
    generationTargets: requiredStringList(
      sdkGenerationInput,
      'generation_targets',
      'contracts/sdk-generation-input.yaml#sdk_generation_input'
    ),
    allowedGenerationTargets: requiredStringList(
      sdkGenerationInput,
      'allowed_generation_targets',
      'contracts/sdk-generation-input.yaml#sdk_generation_input'
    ),
    requiredRouteMetadata: requiredStringList(
      sdkGenerationInput,
      'required_route_metadata',
      'contracts/sdk-generation-input.yaml#sdk_generation_input'
    ),
    requiredErrorMetadata: requiredStringList(
      sdkGenerationInput,
      'required_error_metadata',
      'contracts/sdk-generation-input.yaml#sdk_generation_input'
    ),
    requiredClientRuntimeMetadata: requiredStringList(
      sdkGenerationInput,
      'required_client_runtime_metadata',
      'contracts/sdk-generation-input.yaml#sdk_generation_input'
    ),
    requiredWebhookMetadata: requiredStringList(
      sdkGenerationInput,
      'required_webhook_metadata',
      'contracts/sdk-generation-input.yaml#sdk_generation_input'
    ),
    forbiddenOwnership: requiredStringList(
      sdkGenerationInput,
      'forbidden_ownership',
      'contracts/sdk-generation-input.yaml#sdk_generation_input'
    ),
    forbiddenValues: requiredStringList(
      sdkGenerationInput,
      'forbidden_values',
      'contracts/sdk-generation-input.yaml#sdk_generation_input'
    )
  };
}
