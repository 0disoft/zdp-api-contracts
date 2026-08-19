import type {
  ApiContracts,
  ApiSchemaBundleContract,
  ApiSchemaDefinition
} from '../../src/api-contracts/types';
import type {
  ApiContractChangeLevel,
  ApiContractCompatibilityChange
} from './compatibility-types';
import {
  addChange,
  compareAllowlist,
  compareBreakingScalar,
  compareForbiddenSet,
  compareRequiredSet,
  compareSetDelta,
  mapBy,
  schemaFieldPresence
} from './compatibility-shared';

type SchemaFieldPresence = 'absent' | 'optional' | 'required';

export function compareSchemaBundles(
  baseBundles: readonly ApiSchemaBundleContract[],
  headBundles: readonly ApiSchemaBundleContract[],
  changes: ApiContractCompatibilityChange[]
): void {
  const baseByFile = mapBy(baseBundles, (bundle) => bundle.file);
  const headByFile = mapBy(headBundles, (bundle) => bundle.file);

  for (const [file, baseBundle] of baseByFile) {
    const headBundle = headByFile.get(file);
    if (headBundle === undefined) {
      addChange(
        changes,
        'breaking',
        'API_COMPAT_SCHEMA_BUNDLE_REMOVED',
        file,
        `Schema bundle \`${file}\` was removed.`
      );
      continue;
    }
    compareSchemaBundle(baseBundle, headBundle, changes);
  }

  for (const [file] of headByFile) {
    if (!baseByFile.has(file)) {
      addChange(
        changes,
        'feature',
        'API_COMPAT_SCHEMA_BUNDLE_ADDED',
        file,
        `Schema bundle \`${file}\` was added.`
      );
    }
  }
}

function compareSchemaBundle(
  base: ApiSchemaBundleContract,
  head: ApiSchemaBundleContract,
  changes: ApiContractCompatibilityChange[]
): void {
  compareBreakingScalar(
    base.serviceId,
    head.serviceId,
    'service_id',
    base.file,
    base.file,
    changes
  );
  compareBreakingScalar(
    base.ownerBoundary,
    head.ownerBoundary,
    'owner_boundary',
    base.file,
    base.file,
    changes
  );

  compareRequiredSet(
    base.commonEnvelope.requiredRequestMetadata,
    head.commonEnvelope.requiredRequestMetadata,
    `${base.file}#schema_bundle.common_envelope.required_request_metadata`,
    'API_COMPAT_SCHEMA_REQUEST_METADATA',
    changes
  );
  compareRequiredSet(
    base.commonEnvelope.requiredResponseMetadata,
    head.commonEnvelope.requiredResponseMetadata,
    `${base.file}#schema_bundle.common_envelope.required_response_metadata`,
    'API_COMPAT_SCHEMA_RESPONSE_METADATA',
    changes
  );
  compareForbiddenSet(
    base.commonEnvelope.forbiddenPayloadValues,
    head.commonEnvelope.forbiddenPayloadValues,
    `${base.file}#schema_bundle.common_envelope.forbidden_payload_values`,
    'API_COMPAT_SCHEMA_FORBIDDEN_PAYLOAD',
    changes
  );

  const baseSchemas = mapBy(base.schemas, (schema) => schema.id);
  const headSchemas = mapBy(head.schemas, (schema) => schema.id);

  for (const [schemaId, baseSchema] of baseSchemas) {
    const headSchema = headSchemas.get(schemaId);
    const schemaPath = `${base.file}#${schemaId}`;
    if (headSchema === undefined) {
      addChange(
        changes,
        'breaking',
        'API_COMPAT_SCHEMA_REMOVED',
        schemaPath,
        `Schema \`${schemaId}\` was removed from \`${base.file}\`.`
      );
      continue;
    }
    compareSchema(base.file, baseSchema, headSchema, changes);
  }

  for (const [schemaId] of headSchemas) {
    if (!baseSchemas.has(schemaId)) {
      addChange(
        changes,
        'feature',
        'API_COMPAT_SCHEMA_ADDED',
        `${base.file}#${schemaId}`,
        `Schema \`${schemaId}\` was added to \`${base.file}\`.`
      );
    }
  }
}

function compareSchema(
  file: string,
  base: ApiSchemaDefinition,
  head: ApiSchemaDefinition,
  changes: ApiContractCompatibilityChange[]
): void {
  const schemaPath = `${file}#${base.id}`;
  compareBreakingScalar(
    base.kind,
    head.kind,
    'kind',
    base.id,
    schemaPath,
    changes
  );
  compareBreakingScalar(
    base.sessionEffect,
    head.sessionEffect,
    'session_effect',
    base.id,
    schemaPath,
    changes
  );

  if (base.carriesSecretMaterial !== head.carriesSecretMaterial) {
    addChange(
      changes,
      'breaking',
      'API_COMPAT_SCHEMA_SECRET_HANDLING_CHANGED',
      `${schemaPath}.carries_secret_material`,
      `Schema \`${base.id}\` changed whether it carries secret material.`
    );
  }

  if (base.secretMaterialPolicy !== head.secretMaterialPolicy) {
    addChange(
      changes,
      'patch',
      'API_COMPAT_SCHEMA_SECRET_POLICY_CHANGED',
      `${schemaPath}.secret_material_policy`,
      `Schema \`${base.id}\` changed secret material policy.`
    );
  }

  compareSchemaFields(file, base, head, changes);
  compareSetDelta(
    base.secretFields,
    head.secretFields,
    `${schemaPath}.secret_fields`,
    {
      removedLevel: 'patch',
      removedCode: 'API_COMPAT_SCHEMA_SECRET_FIELD_REMOVED',
      removedMessage: (value) =>
        `Schema \`${base.id}\` no longer marks \`${value}\` as secret.`,
      addedLevel: 'breaking',
      addedCode: 'API_COMPAT_SCHEMA_SECRET_FIELD_ADDED',
      addedMessage: (value) =>
        `Schema \`${base.id}\` newly marks \`${value}\` as secret.`
    },
    changes
  );
}

function compareSchemaFields(
  file: string,
  base: ApiSchemaDefinition,
  head: ApiSchemaDefinition,
  changes: ApiContractCompatibilityChange[]
): void {
  const allFields = new Set([
    ...base.requiredFields,
    ...base.optionalFields,
    ...head.requiredFields,
    ...head.optionalFields
  ]);

  for (const field of [...allFields].sort()) {
    const basePresence = schemaFieldPresence(base, field);
    const headPresence = schemaFieldPresence(head, field);
    if (basePresence === headPresence) {
      continue;
    }

    const transition = classifySchemaFieldTransition(
      base.kind,
      basePresence,
      headPresence
    );
    addChange(
      changes,
      transition.level,
      transition.code,
      `${file}#${base.id}.${field}`,
      `Schema \`${base.id}\` field \`${field}\` changed from ` +
        `\`${basePresence}\` to \`${headPresence}\`.`
    );
  }
}

function classifySchemaFieldTransition(
  schemaKind: string,
  base: SchemaFieldPresence,
  head: SchemaFieldPresence
): { readonly level: ApiContractChangeLevel; readonly code: string } {
  if (schemaKind === 'request') {
    if (head === 'required' && base !== 'required') {
      return {
        level: 'breaking',
        code: 'API_COMPAT_REQUEST_REQUIRED_FIELD_ADDED'
      };
    }
    if (base !== 'absent' && head === 'absent') {
      return {
        level: 'breaking',
        code: 'API_COMPAT_REQUEST_FIELD_REMOVED'
      };
    }
    return {
      level: 'feature',
      code: 'API_COMPAT_REQUEST_FIELD_RELAXED_OR_ADDED'
    };
  }

  if (schemaKind === 'response') {
    if (base === 'required' && head !== 'required') {
      return {
        level: 'breaking',
        code: 'API_COMPAT_RESPONSE_REQUIRED_FIELD_REMOVED'
      };
    }
    if (base === 'optional' && head === 'absent') {
      return {
        level: 'breaking',
        code: 'API_COMPAT_RESPONSE_OPTIONAL_FIELD_REMOVED'
      };
    }
    return {
      level: 'feature',
      code: 'API_COMPAT_RESPONSE_FIELD_ADDED_OR_STRENGTHENED'
    };
  }

  return {
    level: 'breaking',
    code: 'API_COMPAT_SCHEMA_FIELD_CHANGED'
  };
}

export function compareErrorEnvelope(
  base: ApiContracts,
  head: ApiContracts,
  changes: ApiContractCompatibilityChange[]
): void {
  compareRequiredSet(
    base.errorEnvelope.requiredFields,
    head.errorEnvelope.requiredFields,
    'contracts/error-envelope.yaml#error_envelope.required_fields',
    'API_COMPAT_ERROR_REQUIRED_FIELD',
    changes
  );
  compareSetDelta(
    base.errorEnvelope.optionalFields,
    head.errorEnvelope.optionalFields,
    'contracts/error-envelope.yaml#error_envelope.optional_fields',
    {
      removedLevel: 'breaking',
      removedCode: 'API_COMPAT_ERROR_OPTIONAL_FIELD_REMOVED',
      removedMessage: (value) =>
        `Error envelope optional field \`${value}\` was removed.`,
      addedLevel: 'feature',
      addedCode: 'API_COMPAT_ERROR_OPTIONAL_FIELD_ADDED',
      addedMessage: (value) =>
        `Error envelope optional field \`${value}\` was added.`
    },
    changes
  );
  compareForbiddenSet(
    base.errorEnvelope.forbiddenFields,
    head.errorEnvelope.forbiddenFields,
    'contracts/error-envelope.yaml#error_envelope.forbidden_fields',
    'API_COMPAT_ERROR_FORBIDDEN_FIELD',
    changes
  );
}

export function compareWebhookContract(
  base: ApiContracts,
  head: ApiContracts,
  changes: ApiContractCompatibilityChange[]
): void {
  compareRequiredSet(
    base.webhook.requiredControls,
    head.webhook.requiredControls,
    'contracts/webhook-contract.yaml#webhook_contract.required_controls',
    'API_COMPAT_WEBHOOK_REQUIRED_CONTROL',
    changes
  );
  compareForbiddenSet(
    base.webhook.forbiddenControls,
    head.webhook.forbiddenControls,
    'contracts/webhook-contract.yaml#webhook_contract.forbidden_controls',
    'API_COMPAT_WEBHOOK_FORBIDDEN_CONTROL',
    changes
  );
}

export function compareSdkGenerationInput(
  base: ApiContracts,
  head: ApiContracts,
  changes: ApiContractCompatibilityChange[]
): void {
  compareAllowlist(
    base.sdkGenerationInput.sourceContracts,
    head.sdkGenerationInput.sourceContracts,
    'contracts/sdk-generation-input.yaml#sdk_generation_input.source_contracts',
    'API_COMPAT_SDK_SOURCE_CONTRACT',
    changes
  );
  compareAllowlist(
    base.sdkGenerationInput.generationTargets,
    head.sdkGenerationInput.generationTargets,
    'contracts/sdk-generation-input.yaml#sdk_generation_input.generation_targets',
    'API_COMPAT_SDK_GENERATION_TARGET',
    changes
  );
  compareAllowlist(
    base.sdkGenerationInput.allowedGenerationTargets,
    head.sdkGenerationInput.allowedGenerationTargets,
    'contracts/sdk-generation-input.yaml#sdk_generation_input.allowed_generation_targets',
    'API_COMPAT_SDK_ALLOWED_TARGET',
    changes
  );
  compareRequiredSet(
    base.sdkGenerationInput.requiredRouteMetadata,
    head.sdkGenerationInput.requiredRouteMetadata,
    'contracts/sdk-generation-input.yaml#sdk_generation_input.required_route_metadata',
    'API_COMPAT_SDK_ROUTE_METADATA',
    changes
  );
  compareRequiredSet(
    base.sdkGenerationInput.requiredErrorMetadata,
    head.sdkGenerationInput.requiredErrorMetadata,
    'contracts/sdk-generation-input.yaml#sdk_generation_input.required_error_metadata',
    'API_COMPAT_SDK_ERROR_METADATA',
    changes
  );
  compareRequiredSet(
    base.sdkGenerationInput.requiredClientRuntimeMetadata,
    head.sdkGenerationInput.requiredClientRuntimeMetadata,
    'contracts/sdk-generation-input.yaml#sdk_generation_input.required_client_runtime_metadata',
    'API_COMPAT_SDK_RUNTIME_METADATA',
    changes
  );
  compareRequiredSet(
    base.sdkGenerationInput.requiredWebhookMetadata,
    head.sdkGenerationInput.requiredWebhookMetadata,
    'contracts/sdk-generation-input.yaml#sdk_generation_input.required_webhook_metadata',
    'API_COMPAT_SDK_WEBHOOK_METADATA',
    changes
  );
  compareForbiddenSet(
    base.sdkGenerationInput.forbiddenOwnership,
    head.sdkGenerationInput.forbiddenOwnership,
    'contracts/sdk-generation-input.yaml#sdk_generation_input.forbidden_ownership',
    'API_COMPAT_SDK_FORBIDDEN_OWNERSHIP',
    changes
  );
  compareForbiddenSet(
    base.sdkGenerationInput.forbiddenValues,
    head.sdkGenerationInput.forbiddenValues,
    'contracts/sdk-generation-input.yaml#sdk_generation_input.forbidden_values',
    'API_COMPAT_SDK_FORBIDDEN_VALUE',
    changes
  );
}
