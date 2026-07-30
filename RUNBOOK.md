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

## npm 릴리스 실패 복구

이 저장소의 npm 릴리스는 `package.json` 버전과 같은 `v<version>` 태그가 `main`에 포함된 정확한 커밋을 가리킬 때만 `.github/workflows/release.yml`을 통해 실행한다. npm Trusted Publisher가 유일한 공개 경로이며 로컬 `npm publish`, 장기 토큰, 임시 토큰, 태그 이동으로 우회하지 않는다.

복구를 시작하기 전에 먼저 npm registry에 해당 버전이 실제로 존재하는지 확인한다. GitHub Actions 화면의 실패 표시만 보고 "배포되지 않았다"고 단정하면 이미 공개된 같은 버전을 다시 처리하려 들 수 있다.

| 실패 지점 | 먼저 확인할 것 | 허용되는 복구 | 금지되는 복구 |
| --- | --- | --- | --- |
| 릴리스 태그 생성 전 branch CI 실패 | 대상 커밋, 실패한 check, `package.json` 버전 | 원인을 수정하고 branch CI를 다시 통과시킨 뒤 새 커밋에서 릴리스를 준비한다. npm에 아직 없는 버전이면 같은 예정 버전을 유지할 수 있다. | 실패한 커밋에 태그를 만들거나 check를 건너뛰지 않는다. |
| 태그 push 후 npm publish 이전 실패 | 원격 태그 SHA와 `main` 포함 여부, npm 버전 부재, workflow 실패 단계 | npm에 버전이 없고 태그가 원래 SHA를 그대로 가리키면 같은 tag workflow를 재실행한다. | 태그를 삭제하거나 다른 커밋으로 다시 만들지 않는다. 로컬 publish로 우회하지 않는다. |
| npm 공개 후 registry metadata 또는 published smoke 실패 | npm `version`, `gitHead`, `dist.integrity`, provenance, 실패한 smoke 단계 | `gitHead`가 태그 SHA와 같으면 registry 전파 지연인지 실제 패키지 결함인지 분리한다. 전파 지연은 같은 workflow 재실행으로 기존 버전 검증 경로를 다시 탄다. 실제 package/export 결함이면 수정 후 새 patch 버전을 낸다. | 이미 공개된 같은 버전을 다시 publish하거나 기존 태그를 고쳐 쓰지 않는다. |
| npm 공개 후 GitHub Release 누락 | 태그 SHA, npm `gitHead`, integrity, provenance, publish workflow 성공 | 태그, `gitHead`, integrity, provenance가 모두 맞을 때 누락된 GitHub Release만 같은 태그에 생성한다. | npm을 다시 publish하거나 새 태그를 만들지 않는다. GitHub Release 존재만으로 npm 성공을 주장하지 않는다. |
| npm `gitHead`와 태그 SHA 불일치 | npm metadata 원문, 원격 태그 SHA, workflow run과 actor | 즉시 릴리스를 중단하고 incident로 기록한다. 원인을 규명한 뒤 수정본은 새 patch 버전으로만 공개한다. | workflow 재실행, tag 삭제·이동, 같은 버전 재사용, dist-tag 이동으로 숨기기를 하지 않는다. |
| GitHub Release는 있으나 npm 버전이 없음 | release tag SHA, publish workflow 상태, npm 버전 부재 | Release를 성공 증거로 쓰지 말고 공개 안내를 멈춘다. 태그가 정확하고 npm에 버전이 없을 때만 tag workflow를 재실행한다. | Release 본문만 보고 배포 완료로 처리하지 않는다. |

### 판정 순서

1. 대상 package 이름과 버전을 고정한다.
2. 로컬 `main`, 원격 `main`, 원격 `v<version>`의 SHA를 각각 기록한다.
3. npm에서 정확한 `name@version`의 존재 여부를 확인한다.
4. npm 버전이 있으면 `gitHead`가 원격 tag SHA와 같은지 먼저 비교한다.
5. SHA가 같을 때만 integrity, tarball, provenance와 빈 소비자 설치 결과를 확인한다.
6. 공개 버전의 package bytes나 export가 잘못됐으면 기존 버전을 손대지 않고 patch 버전을 올린다.

### 반드시 남길 증거

- package 이름과 버전
- 로컬 `main`, 원격 `main`, 원격 tag SHA
- branch CI run URL과 결론
- tag publish workflow run URL, run ID, 실패 또는 성공 단계
- npm `version`, `gitHead`, `dist.integrity`, tarball URL
- provenance predicate와 registry signature 검증 결과
- GitHub Release URL, tag, draft/prerelease 상태
- 장애 확인 시각, 판단한 사람, 선택한 복구 동작

정상 배포 또는 복구가 끝난 뒤에는 루트에서 configured intent `zdp_api_contracts_release_evidence`를 실행해 GitHub와 npm의 현재 공개 상태를 다시 맞춘다. 이 검사는 새 publish를 수행하지 않으며, 공개됐다는 주장에 필요한 SHA, integrity, provenance, workflow, Release 증거가 서로 같은 버전을 가리키는지 확인하는 용도다.

## Manual Review Required

- Breaking route, error, event, or webhook shape changes
- Public or partner API promotion
- SDK generation input changes
- New SDK generation target activation
- Auth/session route catalog changes
