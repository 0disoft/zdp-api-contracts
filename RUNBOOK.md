# zdp-api-contracts Runbook

This repository owns API contract sources only. It must not become the live API handler or generated SDK output directory.

## Normal Checks

- Run `bun run check`.
- Run `bun run contracts:check` when only API contract YAML changed.
- Run `bun run export:plan` after route, error, webhook, or SDK generation input changes.
- Validate this repository with `zdp-architecture-linter`.
- Review `contracts/` changes together with `service.yaml`.
- Keep breaking contract changes paired with `CHANGELOG.md` and migration notes.
- Treat `contracts/sdk-generation-input.yaml` as the SDK handoff contract, not as generated SDK output.
- Add concrete service routes to `contracts/apis/catalog.yaml`, not to generated OpenAPI or SDK output.
- Keep route `method` and `success_statuses` inside the allowlists declared by `contracts/route-contract.yaml`.
- Keep auth/session routes carrying `owner_boundary`, `tenant_boundary`, `request_id_required`, `trace_id_required`, `session_effect`, and `credential_policy` before web app auth routes are promoted.
- Add a new SDK language to `allowed_generation_targets` before enabling it in `generation_targets`.

The checker is intentionally local and provider-neutral. It reads committed YAML and does not start a backend server, publish OpenAPI, generate SDKs, or call external providers.

If SDK generation input validation fails, downstream SDK refresh must stop. The useful effect is simple: SDKs keep receiving route metadata, success statuses, error trace fields, webhook replay policy, and forbidden sensitive values from one source instead of each SDK inventing its own interpretation.

If API catalog validation fails, freeze new route adoption. The catalog is the bridge between abstract contract policy and real service route definitions, so unsupported methods, ambiguous success statuses, or missing schema refs must be fixed before any export work.

If an auth or session route omits session issue/refresh/revoke semantics, passkey challenge ownership, OAuth callback ownership, request/trace propagation, or the no-plaintext credential policy, freeze `zdp-web-apps` auth route promotion and keep only the `zdp-auth-ui` consumer smoke.

If export plan validation fails, freeze OpenAPI, docs, webhook schema, and SDK generation work. The plan exists so `permission_check`, `audit_event`, `success_statuses`, `idempotency`, `request_id`, and `trace_id` travel together from the API source into generated surfaces. Without this, the API can look reviewed while generated clients or docs quietly omit the fields needed for authorization, audit, retry safety, status handling, and log correlation.

## Failure Response

If contract validation fails, freeze downstream SDK generation and product API adoption. Use the last reviewed contract until the invalid source is corrected.

## Manual Review Required

- Breaking route, error, event, or webhook shape changes
- Public or partner API promotion
- SDK generation input changes
- New SDK generation target activation
- Auth/session route catalog changes
