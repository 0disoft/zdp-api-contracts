"""One-shot, stdlib-only golden-vector generator. No network or real chain input."""
import hashlib
import json
from pathlib import Path

DOMAINS = {
    "transaction": "zdp.doubloon/transaction-content/v1",
    "evidence": "zdp.doubloon/evidence-manifest/v1",
    "approval": "zdp.doubloon/approval-binding/v1",
}
def vector(kind, payload):
    text = json.dumps({"domain": DOMAINS[kind], "payload": payload},
                      sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    raw = text.encode("utf-8")
    return {"kind": kind, "payload": payload, "canonical_utf8": text,
            "preimage_hex": raw.hex(), "digest": "sha256:" + hashlib.sha256(raw).hexdigest()}

transaction = vector("transaction", {
    "schema_version": "1", "experiment_ref": "synthetic:experiment", "operation_ref": "synthetic:claim1",
    "plan_revision": "1", "network": "sui_testnet", "full_chain_identifier": "synthetic:chain",
    "action_ref": "mature_claim", "source_commit": "0" * 40, "linked_build_digest": "sha256:" + "1" * 64,
    "dependencies": ["synthetic:token", "synthetic:reserve"],
    "transaction_bytes_digest": "sha256:" + hashlib.sha256(bytes.fromhex("010203")).hexdigest(),
    "decoded_targets_and_arguments": [{"target": "synthetic:reserve-claim", "type_arguments": ["synthetic:coin"],
                                       "arguments": ["synthetic:grant", "0"]}],
    "sender": "synthetic:beneficiary", "gas_owner": "synthetic:beneficiary",
    "gas_objects": [{"id": "synthetic:gas", "version": "1", "digest": "sha256:" + "2" * 64}],
    "gas_budget": "100000000", "recipient": "synthetic:beneficiary", "amount": "100",
    "grant": "synthetic:grant", "tranche": "0", "policy_revision": "1", "custody_revision": "1",
    "approval_expiry": "2026-09-14T01:00:00.000Z",
})
evidence = vector("evidence", {
    "transaction_content_digest": transaction["digest"],
    "entries": [{"evidence_ref": "synthetic:evidence1", "evidence_kind": "simulation",
                 "producer_ref": "synthetic:producer", "revision": "1", "subject_binding": transaction["digest"],
                 "content_digest": "sha256:" + "3" * 64, "observed_at": "2026-09-14T00:01:00.000Z",
                 "valid_until": "2026-09-14T00:06:00.000Z", "observation_scope": "synthetic:checkpoint"}],
})
approval = vector("approval", {
    "transaction_content_digest": transaction["digest"], "evidence_manifest_digest": evidence["digest"],
    "approval_revision": "1", "issuer": "synthetic:core", "audience": "zdp-token-operator",
    "expiry": "2026-09-14T01:00:00.000Z",
})
output = Path("contracts/apis/core-api/doubloon-digest-v1.vectors.json")
output.write_text(json.dumps({"profile": "doubloon.digest/v1", "synthetic_only": True,
                             "vectors": [transaction, evidence, approval]}, indent=2) + "\n", encoding="utf-8")
print("Generated 3 fixed synthetic vectors.")
