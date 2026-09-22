import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { canonical, encode, hash, hashCanonicalJson, domains } from './helpers/doubloon-digest-reference';

const fixture = JSON.parse(readFileSync(new URL('../contracts/apis/core-api/doubloon-digest-v1.vectors.json', import.meta.url), 'utf8'));
const vectors = fixture.vectors as {kind: keyof typeof domains; payload: Record<string, any>; canonical_utf8: string; preimage_hex: string; digest: string}[];
const tx = () => structuredClone(vectors[0]!.payload);
describe('Doubloon digest v1', () => {
  for (const v of vectors) test(`independent Python vector: ${v.kind}`, () => {
    expect(encode(v.kind, v.payload)).toBe(v.canonical_utf8);
    expect(Buffer.from(encode(v.kind, v.payload)).toString('hex')).toBe(v.preimage_hex);
    expect(hash(v.kind, v.payload)).toBe(v.digest);
    expect(hashCanonicalJson(v.kind, canonical(v.payload))).toBe(v.digest);
  });
  test('key order is irrelevant but array order and content are bound', () => {
    const p = tx();
    expect(hash('transaction', Object.fromEntries(Object.entries(p).reverse()))).toBe(vectors[0]!.digest);
    p.dependencies.reverse();
    expect(hash('transaction', p)).not.toBe(vectors[0]!.digest);
    const changed = tx(); changed.amount = '101';
    expect(hash('transaction', changed)).not.toBe(vectors[0]!.digest);
    expect(tx().amount).toBe('100');
  });
  test('rejects ambiguous integers and unknown or missing fields', () => {
    for (const value of ['01', '-1', '18446744073709551616', 1, null]) {
      const p = tx(); p.gas_budget = value;
      expect(() => hash('transaction', p)).toThrow();
    }
    const p = tx(); p.extra = 'x'; expect(() => hash('transaction', p)).toThrow();
    delete p.extra; delete p.recipient; expect(() => hash('transaction', p)).toThrow();
  });
  test('rejects duplicate JSON keys, Unicode and noncanonical input', () => {
    expect(() => hashCanonicalJson('transaction', '{"amount":"1","amount":"2"}')).toThrow();
    expect(() => hashCanonicalJson('transaction', ' ' + canonical(tx()))).toThrow();
    for (const s of ['한글', '\ud800', '\n']) expect(() => canonical(s)).toThrow();
    expect(canonical({text: 'quote"slash\\'})).toBe('{"text":"quote\\"slash\\\\"}');
  });
  test('evidence is ordered, unique and bound to transaction', () => {
    const p = structuredClone(vectors[1]!.payload);
    p.entries.push(structuredClone(p.entries[0]));
    expect(() => hash('evidence', p)).toThrow('ENTRY_ORDER');
    p.entries.pop(); p.entries[0].subject_binding = 'sha256:' + 'f'.repeat(64);
    expect(() => hash('evidence', p)).toThrow('SUBJECT_MISMATCH');
  });
  test('transaction changes propagate through manifest and approval', () => {
    const p = tx(); p.amount = '101'; const transaction = hash('transaction', p);
    const evidence = structuredClone(vectors[1]!.payload);
    evidence.transaction_content_digest = transaction; evidence.entries[0].subject_binding = transaction;
    const manifest = hash('evidence', evidence);
    const approval = structuredClone(vectors[2]!.payload);
    approval.transaction_content_digest = transaction; approval.evidence_manifest_digest = manifest;
    expect(manifest).not.toBe(vectors[1]!.digest);
    expect(hash('approval', approval)).not.toBe(vectors[2]!.digest);
  });
});
