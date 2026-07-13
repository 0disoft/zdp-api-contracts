# AGENTS.md

## 역할

이 저장소는 ZDP API와 교차 제품 계약의 원천을 소유한다. route contract, OpenAPI, 이벤트 스키마, 웹훅 스키마, 표준 오류, SDK 생성 입력과 재사용 가능한 계산기 정의를 제품 구현보다 먼저 고정한다.

## 읽기 순서

1. `AGENTS.md`
2. `service.yaml`
3. `CHECKLIST.md`
4. `VALIDATION.md`
5. `.agents/README.md`
6. `.agents/context-map.md`
7. `README.md`
8. `BOUNDARY.md`
9. `RUNBOOK.md`
10. `docs/README.md`
11. 작업에 맞는 `.agents/checklists/*.md`
12. 작업에 맞는 `.agents/skills/*/SKILL.md`
13. 작업에 맞는 `.agents/validations/*.md`
14. 관련 `contracts/`, `src/`, `scripts/`, `tests/`

## 작업 원칙

- 문서는 한국어로 작성한다.
- API 계약은 화면 컴포넌트 모양이 아니라 리소스, 상태, 오류, 권한, 멱등성, 감사 hook을 표현해야 한다.
- Backplane, SDK, 문서 생성기는 이 저장소의 계약을 소비한다. 계약의 원천이 되면 안 된다.
- 계산기 계약은 표준 입력·결과·오류·버전 의미를 소유하지만 계산 함수, 로케일 문자열, 제품 화면 payload는 소유하지 않는다.
- 공개 또는 partner API가 되기 전까지 live endpoint나 base URL을 확정하지 않는다.
- `service.yaml`이 이 저장소의 운영 계약이며 변경 시 `zdp-architecture` catalog와 함께 맞춘다.
- 에이전트 검증은 README의 사람용 package script 예시가 아니라 루트 mustflow command contract의 configured intent로만 보고한다.

## 금지

- 제품별 임시 handler shape를 공통 API 계약으로 승격하지 않는다.
- 인증, 권한, 결제, 원장 정책을 OpenAPI 설명문 안에만 숨기지 않는다.
- provider-specific SDK shape를 표준 계약처럼 노출하지 않는다.
- 특정 제품의 계산기 화면, SEO, 광고, 문구를 공통 계산기 계약으로 승격하지 않는다.
- 실제 customer data, token, webhook secret 예시를 넣지 않는다.

## 검증

루트 command contract에 등록된 다음 intent 중 변경 범위를 덮는 가장 좁은 검증을 선택한다.

- `zdp_architecture_validate_api_contracts_repository`: 이 저장소 루트가 중앙 architecture 정책을 따르는지 검증한다.
- `zdp_api_contracts_check`: TypeScript 계약, Bun tests, repo-local API contract checker를 검증한다.
- `zdp_api_contracts_npm_pack_dry_run`: package file surface를 release 전 미리 확인한다.
- `zdp_api_contracts_npm_publish_dry_run`: publish 승인 전 npm publish surface를 dry-run으로 확인한다.
