import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { loadApiContracts, parseAccessDecisionContract } from '../src/api-contracts/parser';
import { validateApiContracts } from '../src/api-contracts/validator';
import { buildOpenApi31Document } from '../src/api-export-plan/openapi';
import { compareApiContracts } from '../scripts/lib/contract-compatibility';

describe('Core access HTTP profile', () => {
  it('exports required correlation and idempotency headers and private response policy', async () => {
    const result = await buildOpenApi31Document(process.cwd());
    expect(result.ok).toBe(true);
    expect(result.document?.paths['/v1/access/authorization-decisions']?.post).toMatchObject({
      parameters: expect.arrayContaining([
        { name: 'Idempotency-Key', in: 'header', required: true,
          schema: { type: 'string', minLength: 1, maxLength: 160 }, 'x-max-utf8-bytes': 160 },
        { name: 'X-Request-ID', in: 'header', required: true,
          schema: { type: 'string', minLength: 1, maxLength: 160 }, 'x-max-utf8-bytes': 160 },
        { name: 'X-Trace-ID', in: 'header', required: true,
          schema: { type: 'string', minLength: 1, maxLength: 160 }, 'x-max-utf8-bytes': 160 }
      ]),
      responses: {
        '201': { headers: {
          'Cache-Control': { schema: { const: 'no-store' } },
          Pragma: { schema: { const: 'no-cache' } },
          'X-Request-ID': { 'x-zdp-matches-request-header': 'X-Request-ID' }
        } },
        default: { headers: { 'Cache-Control': { schema: { const: 'no-store' } } } }
      },
      'x-zdp-http-profile': {
        credentialTransport: 'core_current_session_cookie',
        replayStatus: 201,
        duplicateHeaderPolicy: 'reject',
        redirectPolicy: 'reject_without_forwarding_credentials',
        maxRequestBytes: 8192, maxResponseBytes: 32768
      }
    });
  });

  for (const mutation of [
    { credentialTransport: 'caller_bearer_or_cookie_fallback' },
    { requestMetadataHeaders: ['X-Request-ID'] },
    { responseMetadataHeaders: ['X-Trace-ID'] },
    { cacheControl: 'public' },
    { replayStatus: 200 },
    { duplicateHeaderPolicy: 'first_wins' },
    { redirectPolicy: 'follow' },
    { maxRequestBytes: 0 },
    { maxResponseBytes: Number.MAX_SAFE_INTEGER },
    { successEnvelope: 'internal_persistence_record' }
  ]) {
    it(`rejects weakening ${Object.keys(mutation)[0]}`, async () => {
      const contracts = await loadApiContracts();
      const profile = contracts.accessDecision.httpProfile;
      if (profile === null) throw new Error('Committed HTTP profile missing');
      const result = validateApiContracts({ ...contracts, accessDecision: {
        ...contracts.accessDecision, httpProfile: { ...profile, ...mutation }
      } });
      expect(result.ok).toBe(false);
      expect(result.diagnostics.map((item) => item.code)).toContain('API_ACCESS_DECISION_HTTP_PROFILE_INVALID');
    });
  }

  it('loads old sources for compatibility comparison but rejects them as current contracts', async () => {
    const contracts = await loadApiContracts();
    const result = validateApiContracts({ ...contracts, accessDecision: {
      ...contracts.accessDecision, httpProfile: null
    } });
    expect(result.ok).toBe(false);
  });

  it('rejects undeclared transport settings', () => {
    const source = readFileSync('contracts/apis/core-api/access-decision.yaml', 'utf8');
    expect(() => parseAccessDecisionContract(source.replace(
      '  http_profile:', '  http_profile:\n    arbitrary_origin: invalid'
    ))).toThrow();
  });

  it('requires a migration for HTTP profile addition, removal or changed transport', async () => {
    const current = await loadApiContracts();
    const profile = current.accessDecision.httpProfile;
    if (profile === null) throw new Error('HTTP profile missing');
    const legacy = { ...current, accessDecision: { ...current.accessDecision, httpProfile: null } };
    expect(compareApiContracts(legacy, current).level).toBe('breaking');
    expect(compareApiContracts(current, legacy).level).toBe('breaking');
    const changed = { ...current, accessDecision: {
      ...current.accessDecision, httpProfile: { ...profile, replayStatus: 200 }
    } };
    expect(compareApiContracts(current, changed).changes).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'API_COMPAT_ACCESS_HTTP_PROFILE_CHANGED' })
    ]));
    const reordered = { ...current, accessDecision: {
      ...current.accessDecision, httpProfile: {
        ...profile, requestMetadataHeaders: [...profile.requestMetadataHeaders].reverse()
      }
    } };
    expect(compareApiContracts(current, reordered).level).toBe('none');
  });

  it('keeps maximum valid escaped identifiers within the selected body ceilings', async () => {
    const contracts = await loadApiContracts();
    const profile = contracts.accessDecision.httpProfile;
    if (profile === null) throw new Error('HTTP profile missing');
    const identifier = '"'.repeat(profile.maxIdentifierUtf8Bytes);
    const request = Object.fromEntries(contracts.accessDecision.requiredRequestBindings.map(
      (field) => [field, field === 'requested_scope_type' ? 'personal_account' : identifier]
    ));
    const response = Object.fromEntries(contracts.accessDecision.requiredResponseBindings.map(
      (field) => [field, field === 'obligations' ? Array(profile.maxObligations).fill(identifier)
        : field.endsWith('_at') ? '2026-09-09T12:00:00.123456789Z'
        : field === 'decision' ? 'allow' : field === 'scope_type' ? 'personal_account' : identifier]
    ));
    const bytes = (value: unknown): number => new TextEncoder().encode(JSON.stringify(value)).length;
    expect(bytes(request)).toBeLessThan(profile.maxRequestBytes);
    expect(bytes(response)).toBeLessThan(profile.maxResponseBytes);
  });
});
