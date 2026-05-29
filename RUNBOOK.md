# zdp-api-contracts Runbook

This repository owns API contract sources only. It must not become the live API handler or generated SDK output directory.

## Normal Checks

- Validate this repository with `zdp-architecture-linter`.
- Review `contracts/` changes together with `service.yaml`.
- Keep breaking contract changes paired with `CHANGELOG.md` and migration notes.

## Failure Response

If contract validation fails, freeze downstream SDK generation and product API adoption. Use the last reviewed contract until the invalid source is corrected.

## Manual Review Required

- Breaking route, error, event, or webhook shape changes
- Public or partner API promotion
- SDK generation input changes
