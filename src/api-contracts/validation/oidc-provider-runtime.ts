import type { ApiContractDiagnostic, ApiContracts } from '../types.js';

import { validateRequiredOidcValues } from './shared.js';

export const OIDC_PROVIDER_RUNTIME_FILE =
  'contracts/apis/core-api/oidc-provider-runtime.yaml';

export const OIDC_AUTHORIZATION_CODE_BINDINGS = [
  'client_id',
  'exact_redirect_uri',
  'subject_ref',
  'central_session_ref',
  'nonce',
  'code_challenge',
  'code_challenge_method',
  'granted_scope_refs',
  'granted_audience_refs',
  'issued_at',
  'expires_at'
] as const;

export const OIDC_RUNTIME_DENIAL_REASONS = [
  'authentication_required',
  'session_expired',
  'session_revoked',
  'client_disabled',
  'invalid_request',
  'invalid_grant',
  'access_denied',
  'policy_unavailable'
] as const;

export const OIDC_PROVIDER_RUNTIME_FORBIDDEN_VALUES = [
  'password',
  'authorization_header',
  'cookie_header',
  'access_token',
  'id_token',
  'refresh_token_plaintext',
  'client_secret_plaintext',
  'private_key_material',
  'authorization_code_plaintext_at_rest',
  'code_verifier_plaintext_at_rest',
  'raw_provider_error',
  'raw_customer_payload'
] as const;

export function validateOidcProviderRuntime(
  contracts: ApiContracts,
  diagnostics: ApiContractDiagnostic[]
): void {
  const contract = contracts.oidcProviderRuntime;
  const push = (code: string, path: string, message: string): void => {
    diagnostics.push({ code, file: OIDC_PROVIDER_RUNTIME_FILE, path, message });
  };

  if (
    contract.schemaVersion !== 1 ||
    contract.status !== 'proposed-contract' ||
    contract.ownerBoundary !== 'identity' ||
    contract.pilotEnvironment !== 'staging' ||
    contract.issuer !== 'https://account.staging.8ailors.xyz'
  ) {
    push(
      'API_OIDC_PROVIDER_RUNTIME_BOUNDARY_INVALID',
      'oidc_provider_runtime',
      'The first provider runtime profile must remain a proposed staging-only Core identity contract.'
    );
  }
  if (
    contract.discoveryPath !== '/.well-known/openid-configuration' ||
    contract.authorizationPath !== '/oauth2/authorize' ||
    contract.tokenPath !== '/oauth2/token' ||
    contract.jwksPath !== '/.well-known/jwks.json' ||
    contract.revocationPath !== '/oauth2/revoke' ||
    contract.endSessionPath !== '/oauth2/logout'
  ) {
    push(
      'API_OIDC_PROVIDER_RUNTIME_ENDPOINT_INVALID',
      'oidc_provider_runtime.discovery_path',
      'The staging runtime profile must keep one exact discovery, authorization, token, JWKS, revocation, and logout path set.'
    );
  }
  if (
    contract.authorizationCodeTtlSeconds !== 60 ||
    !contract.authorizationCodeSingleUse ||
    contract.authorizationCodeStoragePolicy !==
      'opaque_random_code_hash_only_atomic_consume'
  ) {
    push(
      'API_OIDC_PROVIDER_RUNTIME_CODE_POLICY_INVALID',
      'oidc_provider_runtime.authorization_code_ttl_seconds',
      'Authorization codes must expire after 60 seconds, be opaque, be stored only as a hash, and be consumed atomically once.'
    );
  }
  validateRequiredOidcValues(
    contract.authorizationCodeRequiredBindings,
    OIDC_AUTHORIZATION_CODE_BINDINGS,
    'API_OIDC_PROVIDER_RUNTIME_CODE_BINDING_MISSING',
    'oidc_provider_runtime.authorization_code_required_bindings',
    push
  );
  if (
    contract.accessTokenTtlSeconds !== 300 ||
    contract.idTokenTtlSeconds !== 300 ||
    contract.refreshTokenPolicy !== 'not_issued_in_first_staging_pilot'
  ) {
    push(
      'API_OIDC_PROVIDER_RUNTIME_TOKEN_POLICY_INVALID',
      'oidc_provider_runtime.access_token_ttl_seconds',
      'The first staging pilot must use five-minute access and ID tokens and must not issue refresh tokens.'
    );
  }
  if (
    contract.clientAssertionAlgorithm !== 'RS256' ||
    contract.clientAssertionTtlSeconds !== 60 ||
    !contract.clientAssertionJtiSingleUse ||
    contract.clientAssertionBindingPolicy !==
      'iss_and_sub_equal_client_id_aud_exact_token_endpoint'
  ) {
    push(
      'API_OIDC_PROVIDER_RUNTIME_CLIENT_ASSERTION_INVALID',
      'oidc_provider_runtime.client_assertion_algorithm',
      'private_key_jwt assertions must use RS256, expire after 60 seconds, reject jti replay, bind iss/sub to client_id, and use the exact token endpoint as audience.'
    );
  }
  if (
    contract.signingAlgorithm !== 'RS256' ||
    contract.signingKeyRotationDays !== 30 ||
    contract.retiredKeyVerificationSeconds !== 86400 ||
    contract.jwksCacheMaxAgeSeconds !== 300
  ) {
    push(
      'API_OIDC_PROVIDER_RUNTIME_KEY_POLICY_INVALID',
      'oidc_provider_runtime.signing_algorithm',
      'The proposed interoperable key profile is RS256, 30-day rotation, one-day retired-key verification, and five-minute JWKS caching.'
    );
  }
  if (
    contract.centralSessionIdleSeconds !== 1209600 ||
    contract.centralSessionAbsoluteSeconds !== 2592000 ||
    contract.productSessionIdleMaxSeconds > contract.centralSessionIdleSeconds ||
    contract.productSessionAbsoluteMaxSeconds >
      contract.centralSessionAbsoluteSeconds ||
    contract.sensitiveActionFreshSeconds !== 900 ||
    contract.revocationMaxStalenessSeconds !== 60
  ) {
    push(
      'API_OIDC_PROVIDER_RUNTIME_SESSION_POLICY_INVALID',
      'oidc_provider_runtime.central_session_idle_seconds',
      'Central sessions use 14-day idle and 30-day absolute limits; product bindings cannot outlive them, sensitive actions require a 15-minute fresh check, and revocation staleness is capped at 60 seconds.'
    );
  }
  if (
    contract.productSessionRevalidationPolicy !==
    'binding_must_not_outlive_central_session_and_core_access_rechecks_every_protected_action'
  ) {
    push(
      'API_OIDC_PROVIDER_RUNTIME_REVALIDATION_POLICY_INVALID',
      'oidc_provider_runtime.product_session_revalidation_policy',
      'Product bindings must not outlive central sessions and Core access must recheck every protected action.'
    );
  }
  validateRequiredOidcValues(
    contract.requiredDenialReasons,
    OIDC_RUNTIME_DENIAL_REASONS,
    'API_OIDC_PROVIDER_RUNTIME_DENIAL_REASON_MISSING',
    'oidc_provider_runtime.required_denial_reasons',
    push
  );
  validateRequiredOidcValues(
    contract.forbiddenValues,
    OIDC_PROVIDER_RUNTIME_FORBIDDEN_VALUES,
    'API_OIDC_PROVIDER_RUNTIME_FORBIDDEN_VALUE_MISSING',
    'oidc_provider_runtime.forbidden_values',
    push
  );
}
