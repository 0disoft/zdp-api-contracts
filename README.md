# zdp-api-contracts

ZDP API 계약 저장소다. 초기 목적은 backend 구현보다 먼저 route contract, OpenAPI, 이벤트 스키마, 웹훅 스키마, 표준 오류, SDK 생성 입력의 자리를 고정하는 것이다.

## 현재 범위

- route contract와 OpenAPI skeleton
- webhook schema와 event schema handoff 기준
- 표준 error envelope 기준
- 권한, 감사, 멱등성, 비용 계량 hook 선언 기준
- SDK 생성 입력의 소유 경계

## 현재 제외

- 실제 public API endpoint
- backend handler 구현
- SDK 코드 생성 결과물
- 제품별 화면 payload
- 결제, 원장, 개인정보, AI 데이터 접근 로직

## 계약

루트 `service.yaml`이 이 저장소의 서비스 계약이다. `contracts/` 아래 파일은 아직 실행 가능한 OpenAPI 전체가 아니라 API 계약이 지켜야 할 최소 구조다.

## 검증

API 계약 검증기는 `contracts/route-contract.yaml`, `contracts/error-envelope.yaml`, `contracts/webhook-contract.yaml`을 읽는다. 이 검증기는 실제 API 서버나 SDK 생성기를 실행하지 않고, 계약 skeleton이 다음 경계를 잃지 않았는지만 확인한다.

- route contract: resource/action/method/path, 권한 검사, 감사 이벤트, 멱등성, error code 기준
- error envelope: `request_id`, `trace_id` 추적 필드와 stack trace/provider secret/customer private payload 금지 기준
- webhook contract: signature verification, idempotency key, replay policy, dead-letter policy 기준

이렇게 해두면 제품 handler나 화면 payload가 API 계약 원천인 척 들어오는 일을 초반에 막을 수 있다. 또한 에러 응답에 provider secret이나 customer private payload가 섞이는 사고, 웹훅이 중복 처리 방지 없이 열리는 사고를 checker 단계에서 먼저 잡는다.

```bash
bun run check
bun run contracts:check
```

아키텍처 검증은 `zdp-architecture-linter`에서 이 저장소를 대상으로 실행한다.

```bash
bun src/cli.ts validate --architecture ..\..\docs\zdp-architecture --repository ..\..\contracts\zdp-api-contracts --json
```
