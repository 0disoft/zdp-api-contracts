# AGENTS.md

## 역할

이 저장소는 ZDP API 계약의 원천을 소유한다. route contract, OpenAPI, 이벤트 스키마, 웹훅 스키마, 표준 오류, SDK 생성 입력을 제품 구현보다 먼저 고정한다.

## 작업 원칙

- 문서는 한국어로 작성한다.
- API 계약은 화면 컴포넌트 모양이 아니라 리소스, 상태, 오류, 권한, 멱등성, 감사 hook을 표현해야 한다.
- Backplane, SDK, 문서 생성기는 이 저장소의 계약을 소비한다. 계약의 원천이 되면 안 된다.
- 공개 또는 partner API가 되기 전까지 live endpoint나 base URL을 확정하지 않는다.
- `service.yaml`이 이 저장소의 운영 계약이며 변경 시 `zdp-architecture` catalog와 함께 맞춘다.

## 금지

- 제품별 임시 handler shape를 공통 API 계약으로 승격하지 않는다.
- 인증, 권한, 결제, 원장 정책을 OpenAPI 설명문 안에만 숨기지 않는다.
- provider-specific SDK shape를 표준 계약처럼 노출하지 않는다.
- 실제 customer data, token, webhook secret 예시를 넣지 않는다.

## 검증

초기 검증은 `zdp-architecture-linter`에서 이 저장소 루트를 대상으로 수행한다. OpenAPI/AsyncAPI 검증은 실제 schema 파일이 추가될 때 별도 명령으로 연결한다.
