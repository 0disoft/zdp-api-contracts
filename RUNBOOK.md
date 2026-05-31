# zdp-api-contracts Runbook

This repository owns API contract sources only. It must not become the live API handler or generated SDK output directory.

## Normal Checks

- Run `bun run check`.
- Run `bun run contracts:check` when only API contract YAML changed.
- Validate this repository with `zdp-architecture-linter`.
- Review `contracts/` changes together with `service.yaml`.
- Keep breaking contract changes paired with `CHANGELOG.md` and migration notes.

The checker is intentionally local and provider-neutral. It reads committed YAML and does not start a backend server, publish OpenAPI, generate SDKs, or call external providers.

## Failure Response

If contract validation fails, freeze downstream SDK generation and product API adoption. Use the last reviewed contract until the invalid source is corrected.

## Manual Review Required

- Breaking route, error, event, or webhook shape changes
- Public or partner API promotion
- SDK generation input changes
