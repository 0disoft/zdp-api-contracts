# Contract Drift Validation

Check these before claiming an API contract change is complete.

- route required fields in `contracts/route-contract.yaml` are represented in route catalogs.
- error envelope fields are represented in SDK generation input.
- webhook replay, idempotency, signature, and dead-letter fields are represented in SDK handoff metadata.
- export plan is still dry-run and does not write artifacts.
- package export map and README package boundary agree.
- forbidden values from `VALIDATION.md` do not appear in examples or fixtures.
