# zdp-api-contracts Runbook

This repository owns API contract sources only. It must not become the live API handler or generated SDK output directory.

## Normal Checks

- Use the configured mustflow intent `zdp_api_contracts_check` for TypeScript contracts, Bun tests, repo-local API contract validation, and export-plan coverage.
- Use the configured mustflow intent `zdp_architecture_validate_api_contracts_repository` for repository architecture validation.
- Use `zdp_api_contracts_build` after source, export, or declaration changes and `zdp_api_contracts_package_smoke` to install the produced tarball in an empty Node consumer.
- Use `zdp_api_contracts_npm_pack_dry_run` before package surface review or release preparation.
- Use `zdp_api_contracts_npm_publish_dry_run` only for approved publish-readiness dry runs; it is not a publish command.
- GitHub Actions CI validates the root `service.yaml` with full-SHA-pinned `0disoft/service-catalog-generator` v0.5.11, `input-schema: zdp-v2`, unknown service dependencies allowed, and warnings promoted to failure.
- Review `contracts/` changes together with `service.yaml`.
- Keep breaking contract changes paired with `CHANGELOG.md` and migration notes.
- Treat `contracts/sdk-generation-input.yaml` as the SDK handoff contract, not as generated SDK output.
- Add concrete service routes to `contracts/apis/catalog.yaml`, not to generated OpenAPI or SDK output.
- Keep route `method` and `success_statuses` inside the allowlists declared by `contracts/route-contract.yaml`.
- Keep auth/session routes carrying `owner_boundary`, `tenant_boundary`, `request_id_required`, `trace_id_required`, `session_effect`, and `credential_policy` before web app auth routes are promoted.
- Keep `contracts/apis/core-api/sensitive-action-authorization.yaml` contract-only and unreferenced by the route catalog until Core issue/verify lifecycle, audience domain guards, durable single-use consumption, and product promotion review are implemented. Never reinterpret recovery intake or product-link receipts as sensitive-action authority.
- Keep `contracts/apis/core-api/access-decision.yaml` contract-only until Core can verify the current session, resolve current relationships, pin policy and data revisions, append the decision atomically, replay idempotently, and prove denial behavior. Never add access fields to the current-session response or reinterpret a consent receipt as final authorization.
- Add a new SDK language to `allowed_generation_targets` before enabling it in `generation_targets`.
- Do not run raw package, generator, server, OpenAPI, AsyncAPI, SDK, publish, or provider commands as agent verification unless the root command contract exposes them as eligible mustflow intents.

The checker is intentionally local and provider-neutral. It reads committed YAML and does not start a backend server, publish OpenAPI, generate SDKs, or call external providers.

The service catalog action is a repository-local dogfood gate for the checked-in manifest. It does not replace the central `zdp-architecture` catalog workflow, which still owns multi-repository catalog assembly and cross-service graph evidence.

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
