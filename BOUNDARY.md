# BOUNDARY.md

## 소유 경계

`zdp-api-contracts`는 API 계약의 원천을 소유한다.

소유한다:

- route contract
- OpenAPI와 webhook schema 입력
- event schema handoff
- standard error envelope
- SDK generation input
- export dry-run plan for OpenAPI, SDK, webhook schema, and docs
- typed fetch client handoff metadata
- authorization, audit, idempotency, metering hook declaration
- Core 접근 판정의 request/response binding, deny 기본값, expiry와 비-bearer evidence 의미
- 국가 공통 계산기의 정의, 표준 입력·결과 metadata, 안정 오류 코드와 계약·엔진 버전 handoff

소유하지 않는다:

- backend handler 구현
- SDK runtime 구현
- generated SDK source
- 제품별 화면 payload
- provider-specific API client
- refresh token storage
- final authorization decision
- access policy evaluation 또는 decision persistence 구현
- 실제 public endpoint 운영
- generated OpenAPI, generated SDK, or published docs artifacts
- 계산 공식과 실행 엔진
- 로케일 파싱·표시 문자열
- 제품별 계산기 페이지, SEO, 광고, 전환 payload

## 분리 트리거

- public API와 internal API가 서로 다른 release cadence를 요구한다.
- SDK generator 입력과 human-facing docs가 독립 검증을 요구한다.
- webhook schema가 provider별 운영 장애 대응을 독립적으로 요구한다.
- export plan이 실제 artifact 생성, publish, 또는 live endpoint 검증을 시작해야 한다.
- 계산기 계약과 실행 엔진이 서로 다른 릴리스 주기와 호환성 정책을 요구한다.
