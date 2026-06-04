# zdp-api-contracts

ZDP API 계약 저장소다. 초기 목적은 backend 구현보다 먼저 route contract, OpenAPI, 이벤트 스키마, 웹훅 스키마, 표준 오류, SDK 생성 입력의 자리를 고정하는 것이다.

## 현재 범위

- route contract와 OpenAPI skeleton
- 실제 service route 정의를 받을 API catalog skeleton
- webhook schema와 event schema handoff 기준
- 표준 error envelope 기준
- 권한, 감사, 멱등성, 비용 계량 hook 선언 기준
- SDK 생성 입력의 소유 경계
- OpenAPI/SDK/docs/webhook schema export dry-run plan

## 현재 제외

- 실제 public API endpoint
- backend handler 구현
- SDK 코드 생성 결과물
- 제품별 화면 payload
- 결제, 원장, 개인정보, AI 데이터 접근 로직

## 계약

루트 `service.yaml`이 이 저장소의 서비스 계약이다. `contracts/` 아래 파일은 아직 실행 가능한 OpenAPI 전체가 아니라 API 계약이 지켜야 할 최소 구조다.

## 검증

API 계약 검증기는 `contracts/route-contract.yaml`, `contracts/error-envelope.yaml`, `contracts/webhook-contract.yaml`, `contracts/sdk-generation-input.yaml`, `contracts/apis/catalog.yaml`을 읽는다. 이 검증기는 실제 API 서버나 SDK 생성기를 실행하지 않고, 계약 skeleton과 route catalog가 다음 경계를 잃지 않았는지만 확인한다.

- route contract: resource/action/method/path, 성공 status code, 권한 검사, 감사 이벤트, 멱등성, error code 기준
- error envelope: `request_id`, `trace_id` 추적 필드와 stack trace/provider secret/customer private payload 금지 기준
- webhook contract: signature verification, idempotency key, replay policy, dead-letter policy 기준
- API catalog: 실제 route 정의가 들어올 때 `operation_id`, `service_id`, schema ref, method, success status가 표준 계약과 맞는지 확인하는 자리
- SDK generation input: 활성 SDK target과 허용 target pool, route/error/webhook metadata, SDK가 소유하면 안 되는 runtime/token/final authorization 경계

이렇게 해두면 제품 handler나 화면 payload가 API 계약 원천인 척 들어오는 일을 초반에 막을 수 있다. 또한 에러 응답에 provider secret이나 customer private payload가 섞이는 사고, 웹훅이 중복 처리 방지 없이 열리는 사고를 checker 단계에서 먼저 잡는다.

SDK generation input은 generated SDK source 자체가 아니다. 활성 target은 `generation_targets`에 두고, 새 언어 후보는 먼저 `allowed_generation_targets`에 등록한다. 이 입력이 있으면 `zdp-client-sdks`가 route success status, idempotency, audit event, permission hook, error trace field, webhook replay/dead-letter 규칙을 같은 방식으로 읽을 수 있다. 즉 SDK가 "이 API는 그냥 호출하면 되겠지"라고 추측하는 일을 줄이고, 언어별 SDK가 서로 다른 안전장치를 갖는 문제를 초반에 막는다.

`export:plan`은 OpenAPI, SDK generation input, webhook schema, docs contract 산출 계획을 dry-run으로 만든다. 파일을 쓰거나 schema를 publish하지 않는다. plan JSON의 `writesArtifacts`와 `publishesSchemas`는 항상 false여야 한다. 대신 생성기가 나중에 읽어야 할 source contract, required metadata, forbidden value를 한 번에 보여준다. 이게 있으면 `permission_check`, `success_statuses`, `idempotency`가 route contract에는 있는데 API catalog나 SDK input에는 없는 상태, `trace_id`가 error envelope에는 있는데 문서/SDK 계획에는 빠진 상태를 일찍 잡을 수 있다. `trace_id`는 SDK 오류와 서버 로그를 같은 선으로 잇게 해주고, `idempotency`는 재시도나 webhook 중복 수신이 같은 일을 두 번 만들지 않게 해준다.

```bash
bun run check
bun run contracts:check
bun run export:plan
bun scripts/plan-api-exports.ts --json
```

아키텍처 검증은 `zdp-architecture-linter`에서 이 저장소를 대상으로 실행한다.

```bash
bun src/cli.ts validate --architecture ..\..\docs\zdp-architecture --repository ..\..\contracts\zdp-api-contracts --json
```
