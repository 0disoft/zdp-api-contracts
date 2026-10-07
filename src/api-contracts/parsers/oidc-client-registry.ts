import type { OidcClientRegistryContract, OidcClientRegistryEntry } from '../types.js';

import { assertOnlyKeys, parseYamlObject, requiredNumber, requiredObject, requiredRecordListNonEmpty, requiredString, requiredStringList, requiredStringListAllowEmpty } from './shared.js';

export function parseOidcClientRegistryContract(
  source: string
): OidcClientRegistryContract {
  const file = 'contracts/apis/core-api/oidc-client-registry.yaml';
  const data = parseYamlObject(source, file);
  assertOnlyKeys(data, ['oidc_client_registry'], file);
  const context = `${file}#oidc_client_registry`;
  const contract = requiredObject(data, 'oidc_client_registry', file);
  assertOnlyKeys(
    contract,
    [
      'schema_version',
      'status',
      'owner_boundary',
      'authority',
      'environment',
      'registry_revision',
      'source_of_truth',
      'update_policy',
      'environment_isolation',
      'client_id_reuse_policy',
      'lifecycle',
      'immutable_fields',
      'security_sensitive_fields',
      'required_audit_events',
      'entries',
      'forbidden_values'
    ],
    context
  );
  const entries = requiredRecordListNonEmpty(contract, 'entries', context);

  return {
    schemaVersion: requiredNumber(contract, 'schema_version', context),
    status: requiredString(contract, 'status', context),
    ownerBoundary: requiredString(contract, 'owner_boundary', context),
    authority: requiredString(contract, 'authority', context),
    environment: requiredString(contract, 'environment', context),
    registryRevision: requiredNumber(contract, 'registry_revision', context),
    sourceOfTruth: requiredString(contract, 'source_of_truth', context),
    updatePolicy: requiredString(contract, 'update_policy', context),
    environmentIsolation: requiredString(
      contract,
      'environment_isolation',
      context
    ),
    clientIdReusePolicy: requiredString(
      contract,
      'client_id_reuse_policy',
      context
    ),
    lifecycle: parseOidcClientRegistryLifecycle(
      requiredObject(contract, 'lifecycle', context),
      `${context}.lifecycle`
    ),
    immutableFields: requiredStringList(
      contract,
      'immutable_fields',
      context
    ),
    securitySensitiveFields: requiredStringList(
      contract,
      'security_sensitive_fields',
      context
    ),
    requiredAuditEvents: requiredStringList(
      contract,
      'required_audit_events',
      context
    ),
    entries: entries.map((entry, index) =>
      parseOidcClientRegistryEntry(entry, `${context}.entries[${index}]`)
    ),
    forbiddenValues: requiredStringList(contract, 'forbidden_values', context)
  };
}

export function parseOidcClientRegistryLifecycle(
  lifecycle: Record<string, unknown>,
  context: string
): OidcClientRegistryContract['lifecycle'] {
  assertOnlyKeys(
    lifecycle,
    ['states', 'terminal_states', 'allowed_transitions'],
    context
  );
  const transitions = requiredRecordListNonEmpty(
    lifecycle,
    'allowed_transitions',
    context
  );

  return {
    states: requiredStringList(lifecycle, 'states', context),
    terminalStates: requiredStringList(lifecycle, 'terminal_states', context),
    transitions: transitions.map((transition, index) => {
      const transitionContext = `${context}.allowed_transitions[${index}]`;
      assertOnlyKeys(
        transition,
        ['from', 'to', 'required_evidence'],
        transitionContext
      );
      return {
        from: requiredString(transition, 'from', transitionContext),
        to: requiredString(transition, 'to', transitionContext),
        requiredEvidence: requiredString(
          transition,
          'required_evidence',
          transitionContext
        )
      };
    })
  };
}

export function parseOidcClientRegistryEntry(
  entry: Record<string, unknown>,
  context: string
): OidcClientRegistryEntry {
  assertOnlyKeys(
    entry,
    [
      'client_id',
      'product_ref',
      'owner_ref',
      'environment',
      'entry_revision',
      'application_type',
      'exact_redirect_uris',
      'exact_post_logout_redirect_uris',
      'allowed_scope_refs',
      'allowed_audience_refs',
      'allowed_grant_types',
      'allowed_response_types',
      'allowed_pkce_methods',
      'client_type',
      'token_endpoint_auth_method',
      'jwks_ref',
      'status',
      'status_reason',
      'session_policy_ref',
      'revocation_policy_ref',
      'key_rotation_policy_ref',
      'runtime_boundary',
      'callback_handler_ref',
      'activation_requirements',
      'activation_evidence_refs'
    ],
    context
  );

  return {
    clientId: requiredString(entry, 'client_id', context),
    productRef: requiredString(entry, 'product_ref', context),
    ownerRef: requiredString(entry, 'owner_ref', context),
    environment: requiredString(entry, 'environment', context),
    entryRevision: requiredNumber(entry, 'entry_revision', context),
    applicationType: requiredString(entry, 'application_type', context),
    exactRedirectUris: requiredStringList(
      entry,
      'exact_redirect_uris',
      context
    ),
    exactPostLogoutRedirectUris: requiredStringList(
      entry,
      'exact_post_logout_redirect_uris',
      context
    ),
    allowedScopeRefs: requiredStringList(
      entry,
      'allowed_scope_refs',
      context
    ),
    allowedAudienceRefs: requiredStringList(
      entry,
      'allowed_audience_refs',
      context
    ),
    allowedGrantTypes: requiredStringList(
      entry,
      'allowed_grant_types',
      context
    ),
    allowedResponseTypes: requiredStringList(
      entry,
      'allowed_response_types',
      context
    ),
    allowedPkceMethods: requiredStringList(
      entry,
      'allowed_pkce_methods',
      context
    ),
    clientType: requiredString(entry, 'client_type', context),
    tokenEndpointAuthMethod: requiredString(
      entry,
      'token_endpoint_auth_method',
      context
    ),
    jwksRef: requiredString(entry, 'jwks_ref', context),
    status: requiredString(entry, 'status', context),
    statusReason: requiredString(entry, 'status_reason', context),
    sessionPolicyRef: requiredString(entry, 'session_policy_ref', context),
    revocationPolicyRef: requiredString(
      entry,
      'revocation_policy_ref',
      context
    ),
    keyRotationPolicyRef: requiredString(
      entry,
      'key_rotation_policy_ref',
      context
    ),
    runtimeBoundary: requiredString(entry, 'runtime_boundary', context),
    callbackHandlerRef: requiredString(
      entry,
      'callback_handler_ref',
      context
    ),
    activationRequirements: requiredStringList(
      entry,
      'activation_requirements',
      context
    ),
    activationEvidenceRefs: requiredStringListAllowEmpty(
      entry,
      'activation_evidence_refs',
      context
    )
  };
}
