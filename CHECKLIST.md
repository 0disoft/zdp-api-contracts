# CHECKLIST.md

이 저장소는 API 구현체가 아니라 API 계약 원천이다. 작업 전에 변경 대상이 route, error envelope, webhook, SDK generation input, export plan, package surface 중 어디인지 먼저 고른다.

## 공통

- 실제 endpoint, base URL, backend handler 구현을 이 저장소에서 확정하지 않는다.
- 제품 화면 payload, provider-specific SDK shape, 임시 handler shape를 공통 API 계약으로 승격하지 않는다.
- 실제 customer data, token, webhook secret, authorization header, cookie header, refresh token plaintext 예시를 넣지 않는다.
- 권한, 감사, 멱등성, tenant boundary, request id, trace id는 prose에 숨기지 말고 계약 필드에 둔다.
- 계약 변경 후 `VALIDATION.md`의 source drift와 forbidden value checks를 확인한다.

## Route Contract

- `contracts/route-contract.yaml`의 `required_per_route`가 API catalog route마다 유지되는지 확인한다.
- method는 허용 목록 안에 있어야 한다.
- success status는 허용 목록 안에 있어야 한다.
- mutation route는 idempotency handoff가 빠지지 않아야 한다.
- session 관련 route는 `session_effect`를 명시한다.
- credential 관련 route는 raw secret이나 provider payload를 싣지 않는다.

## Error Envelope

- 모든 공개 오류는 `code`, `message`, `request_id`, `trace_id`를 가진다.
- provider raw error, customer private payload, secret, authorization header, cookie header, refresh token plaintext, stack trace를 오류 본문에 넣지 않는다.
- retry 가능한 오류는 `retry_after_seconds`나 문서화 가능한 retry policy로 표현한다.
- SDK와 docs가 error shape를 따로 정의하지 않도록 `contracts/error-envelope.yaml`을 source of truth로 둔다.

## Webhook Contract

- signature verification, idempotency key, replay policy, dead-letter policy를 route prose가 아니라 webhook contract에 둔다.
- event id, event type, schema version은 downstream replay와 audit에서 다시 읽을 수 있어야 한다.
- raw provider payload를 표준 webhook schema처럼 노출하지 않는다.

## SDK Generation Input

- generated SDK source는 이 저장소의 source of truth가 아니다.
- 활성 target은 `generation_targets`, 후보 target은 `allowed_generation_targets`로 나눈다.
- SDK runtime implementation, token storage, final authorization decision, provider credential storage는 downstream owner 경계로 남긴다.
- typed fetch operation map은 route catalog에서 method, path, success status, auth, idempotency, schema ref, error code를 읽어야 한다.

## Export Plan

- export plan은 dry-run이다.
- plan JSON의 `writesArtifacts`와 `publishesSchemas`는 false여야 한다.
- OpenAPI, SDK generation input, webhook schema, docs contract 산출 계획은 생성 전 검토용이다.
- schema publish나 generated SDK commit은 이 저장소의 현재 범위가 아니다.

## Package Surface

- public export는 `src/index.ts`, `src/api-contracts`, `src/api-export-plan`, `contracts/*` 경계 안에 둔다.
- `files` whitelist는 source package skeleton만 포함한다.
- README, CHANGELOG, SECURITY, BOUNDARY, RUNBOOK은 package 사용자가 계약 경계를 확인할 수 있는 문서다.
- 실제 generated artifact, live endpoint, customer payload fixture를 package에 넣지 않는다.

## Calculator Contract

- `contracts/calculators/catalog.yaml`만 계산기 정의 원천으로 둔다.
- `contracts/calculators/conformance.yaml`은 reviewed 계산기의 구현 중립 성공·오류 벡터 원천으로 둔다.
- 계산기 ID, 계약 버전, 호환 엔진 버전, jurisdiction, 입력, 출력, 오류, semantic rule을 기계 검증한다.
- 표준 값과 로케일 표시 문자열을 섞지 않는다.
- 화면 field, SEO, 광고, 제품 문구, 계산 함수 구현을 계약에 넣지 않는다.
- 미검토 값 종류, 단위 차원, 단위 정책, 오류 코드를 임의로 추가하지 않는다.
- draft 계산기는 precision과 rounding 정책을 확정하기 전 active로 승격하지 않는다.
- reviewed 계산기의 contract version, 숫자 한계, 반올림 정책과 적합성 벡터를 함께 바꾼다.
