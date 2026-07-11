# VALIDATION.md

이 문서는 API 계약 저장소 변경 후 확인할 기준을 모은다. 실행 권한은 mustflow command contract와 package scripts가 별도로 소유한다.

## Configured Repository Validation

| 변경 범위 | 확인 기준 |
| --- | --- |
| `contracts/*`, `src/api-contracts/*`, `src/api-export-plan/*`, package surface | `zdp_architecture_validate_api_contracts_repository` |
| 루트 `service.yaml` manifest 또는 CI gate | GitHub Actions `Validate service catalog manifest` step, using full-SHA-pinned `0disoft/service-catalog-generator` v0.5.10 with `input-schema: zdp-v2` |
| ZDP architecture catalog나 linter rule과 함께 바뀐 경우 | `zdp_architecture_validate_fast` |
| 문서 라우터와 agent guide만 바꾼 경우 | repository validation과 Markdown 링크 수동 확인 |

agent-facing 문서에는 raw package command를 실행 권한처럼 적지 않는다. package-local script는 사람이 직접 실행하거나 별도 command intent가 있을 때만 agent 검증으로 취급한다.

## Source Of Truth Checks

- route metadata source: `contracts/route-contract.yaml`와 `contracts/apis/catalog.yaml`
- core auth/session route source: `contracts/apis/core-api/auth-session.yaml`
- standard error source: `contracts/error-envelope.yaml`
- webhook source: `contracts/webhook-contract.yaml`
- SDK handoff source: `contracts/sdk-generation-input.yaml`
- export dry-run source: `scripts/plan-api-exports.ts`와 `src/api-export-plan/*`
- package export source: `package.json` and `src/index.ts`
- service catalog compile source: root `service.yaml`, consumed by full-SHA-pinned `0disoft/service-catalog-generator` v0.5.10 in GitHub Actions

## Forbidden Value Checks

아래 값은 route, error, webhook, SDK input, docs 예시에 들어가면 안 된다.

- raw customer payload
- raw provider error
- provider secret
- authorization header
- cookie header
- refresh token plaintext
- stack trace
- screen component payload
- raw storage URL
- real webhook secret

## Contract Drift Checks

- route catalog가 `required_per_route` 필드를 잃지 않았는지 확인한다.
- error envelope와 SDK required error metadata가 `request_id`와 `trace_id`를 함께 요구하는지 확인한다.
- webhook metadata가 signature verification, idempotency, replay, dead-letter를 잃지 않았는지 확인한다.
- SDK generation input이 generated SDK source나 final authorization decision을 소유하지 않는지 확인한다.
- export plan이 generated artifact를 쓰거나 schema publish를 주장하지 않는지 확인한다.
- package export map과 `files` whitelist가 README의 package surface 설명과 어긋나지 않는지 확인한다.

## Version Impact

`package.json`이 package version source다. package files에 포함되는 README, package metadata, public export, contract source가 바뀌면 patch/minor/major 필요성을 판단한다.

- 문서 라우터만 추가하고 계약 의미가 바뀌지 않으면 patch급이다.
- route/error/webhook/SDK required field가 바뀌면 consumer compatibility를 보고 minor 또는 major를 판단한다.
- export map, package files, public type surface가 바뀌면 package consumer 영향으로 본다.
