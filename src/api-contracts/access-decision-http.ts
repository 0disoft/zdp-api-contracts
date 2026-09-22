import type { AccessDecisionHttpProfile, ApiContractDiagnostic } from './types.js';

const expected: AccessDecisionHttpProfile = {
  credentialTransport: 'core_current_session_cookie',
  requestContentType: 'application/json',
  responseContentType: 'application/json',
  successEnvelope: 'direct_schema_object',
  errorEnvelopeRef: 'contracts/error-envelope.yaml',
  requestMetadataHeaders: ['Idempotency-Key', 'X-Request-ID', 'X-Trace-ID'],
  responseMetadataHeaders: ['X-Request-ID', 'X-Trace-ID'],
  cacheControl: 'no-store',
  pragma: 'no-cache',
  replayStatus: 201,
  duplicateHeaderPolicy: 'reject',
  redirectPolicy: 'reject_without_forwarding_credentials',
  maxIdentifierUtf8Bytes: 160,
  maxObligations: 16,
  maxRequestBytes: 8192,
  maxResponseBytes: 32768
};

export function validateAccessDecisionHttpProfile(
  profile: AccessDecisionHttpProfile | null
): ApiContractDiagnostic[] {
  const failure = (field: string): ApiContractDiagnostic => ({
    code: 'API_ACCESS_DECISION_HTTP_PROFILE_INVALID',
    file: 'contracts/apis/core-api/access-decision.yaml',
    path: `access_decision.http_profile.${field}`,
    message: `Access decision HTTP profile must preserve the reviewed ${field} boundary.`
  });
  if (profile === null) return [failure('missing')];
  const diagnostics: ApiContractDiagnostic[] = [];
  for (const field of Object.keys(expected) as (keyof AccessDecisionHttpProfile)[]) {
    const actual = profile[field];
    const required = expected[field];
    const matches = Array.isArray(actual) && Array.isArray(required)
      ? JSON.stringify([...actual].sort()) === JSON.stringify([...required].sort())
      : actual === required;
    if (!matches) diagnostics.push(failure(field));
  }
  return diagnostics;
}
