import { createHash } from 'node:crypto';

export const domains = {
  transaction: 'zdp.doubloon/transaction-content/v1',
  evidence: 'zdp.doubloon/evidence-manifest/v1',
  approval: 'zdp.doubloon/approval-binding/v1'
} as const;

const keys = {
  transaction: ['schema_version','experiment_ref','operation_ref','plan_revision','network','full_chain_identifier','action_ref','source_commit','linked_build_digest','dependencies','transaction_bytes_digest','decoded_targets_and_arguments','sender','gas_owner','gas_objects','gas_budget','recipient','amount','grant','tranche','policy_revision','custody_revision','approval_expiry'],
  evidence: ['transaction_content_digest','entries'],
  approval: ['transaction_content_digest','evidence_manifest_digest','approval_revision','issuer','audience','expiry']
};
const sha = /^sha256:[0-9a-f]{64}$/;
function object(value: unknown): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype) throw Error('INVALID_OBJECT');
  return value as Record<string, unknown>;
}
function exact(value: unknown, names: readonly string[]) {
  const data = object(value);
  if (JSON.stringify(Object.keys(data).sort()) !== JSON.stringify([...names].sort())) throw Error('INVALID_FIELDS');
  return data;
}

/** Restricted JCS profile, NOT a general RFC 8785 implementation. */
export function canonical(value: unknown, depth = 0): string {
  if (depth > 16) throw Error('DEPTH_LIMIT');
  if (typeof value === 'string') {
    if (!/^[\x20-\x7e]*$/.test(value) || value.length > 4096) throw Error('INVALID_STRING');
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    if (value.length > 256 || Reflect.ownKeys(value).length !== value.length + 1) throw Error('INVALID_ARRAY');
    for (let i = 0; i < value.length; i++) {
      const descriptor = Object.getOwnPropertyDescriptor(value, String(i));
      if (!descriptor || !Object.hasOwn(descriptor, 'value')) throw Error('INVALID_ARRAY');
    }
    return '[' + value.map(item => canonical(item, depth + 1)).join(',') + ']';
  }
  const data = object(value);
  if (Reflect.ownKeys(data).length !== Object.keys(data).length) throw Error('INVALID_FIELDS');
  return '{' + Object.keys(data).sort().map(key => {
    if (!/^[a-z][a-z0-9_]*$/.test(key) || !Object.hasOwn(Object.getOwnPropertyDescriptor(data, key)!, 'value')) throw Error('INVALID_KEY');
    return JSON.stringify(key) + ':' + canonical(data[key], depth + 1);
  }).join(',') + '}';
}
function date(value: unknown) {
  if (typeof value !== 'string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(value)
      || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString() !== value) throw Error('INVALID_TIME');
}
function digest(value: unknown) {
  if (typeof value !== 'string' || !sha.test(value)) throw Error('INVALID_DIGEST');
}
export function encode(kind: keyof typeof domains, payload: unknown) {
  if (!Object.hasOwn(domains, kind)) throw Error('INVALID_DOMAIN');
  const p = exact(payload, keys[kind]);
  // Validate the data tree before inspecting fields (including accessors).
  canonical(p);
  const strings = (names: string[], data = p) => {
    for (const name of names) if (typeof data[name] !== 'string' || !(data[name] as string).length) throw Error('INVALID_SCALAR');
  };
  if (kind === 'transaction') {
    strings(['experiment_ref','operation_ref','plan_revision','full_chain_identifier','action_ref','source_commit','sender','gas_owner','policy_revision','custody_revision']);
    if (!/^[0-9a-f]{40}$/.test(p.source_commit as string)) throw Error('INVALID_COMMIT');
    for (const name of ['dependencies','gas_objects','decoded_targets_and_arguments']) if (!Array.isArray(p[name])) throw Error('INVALID_ARRAY');
    if (p.schema_version !== '1' || p.network !== 'sui_testnet') throw Error('INVALID_SCOPE');
    for (const name of ['gas_budget', 'amount', 'tranche']) {
      const value = p[name];
      if (typeof value === 'object' && name !== 'gas_budget') {
        const absent = exact(value, ['not_applicable']);
        if (typeof absent.not_applicable !== 'string' || !/^[a-z][a-z0-9_]+$/.test(absent.not_applicable)) throw Error('INVALID_ABSENCE');
      } else if (typeof value !== 'string' || !/^(0|[1-9][0-9]{0,19})$/.test(value) || BigInt(value) > 18446744073709551615n) throw Error('INVALID_INTEGER');
    }
    for (const name of ['linked_build_digest', 'transaction_bytes_digest']) digest(p[name]);
    date(p.approval_expiry);
  } else {
    digest(p.transaction_content_digest);
    if (kind === 'approval') {
      strings(['approval_revision','issuer']);
      digest(p.evidence_manifest_digest);
      if (p.audience !== 'zdp-token-operator') throw Error('INVALID_AUDIENCE');
      date(p.expiry);
    } else {
      if (!Array.isArray(p.entries) || p.entries.length === 0) throw Error('INVALID_ENTRIES');
      let previous = '';
      for (const entry of p.entries) {
        const e = exact(entry, ['evidence_ref','evidence_kind','producer_ref','revision','subject_binding','content_digest','observed_at','valid_until','observation_scope']);
        strings(['evidence_ref','evidence_kind','producer_ref','revision','observation_scope'], e);
        if (typeof e.evidence_ref !== 'string' || e.evidence_ref <= previous) throw Error('ENTRY_ORDER');
        previous = e.evidence_ref;
        if (e.subject_binding !== p.transaction_content_digest) throw Error('SUBJECT_MISMATCH');
        digest(e.content_digest); date(e.observed_at); date(e.valid_until);
      }
    }
  }
  const text = canonical({ domain: domains[kind], payload: p });
  if (Buffer.byteLength(text, 'utf8') > 65536) throw Error('SIZE_LIMIT');
  return text;
}
export function hash(kind: keyof typeof domains, payload: unknown) {
  return 'sha256:' + createHash('sha256').update(encode(kind, payload), 'utf8').digest('hex');
}
export function hashCanonicalJson(kind: keyof typeof domains, text: string) {
  if (Buffer.byteLength(text, 'utf8') > 65536) throw Error('SIZE_LIMIT');
  const payload: unknown = JSON.parse(text);
  if (canonical(payload) !== text) throw Error('NON_CANONICAL_INPUT');
  return hash(kind, payload);
}
