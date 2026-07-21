# zdp-api-contracts

ZDP API 계약 저장소다. 초기 목적은 backend 구현보다 먼저 route contract, OpenAPI, 이벤트 스키마, 웹훅 스키마, 표준 오류, SDK 생성 입력의 자리를 고정하는 것이다.

## 문서 라우터

| 목적 | 경로 |
| --- | --- |
| 작업 전 체크리스트 | `CHECKLIST.md` |
| 검증 기준 | `VALIDATION.md` |
| agent별 읽기 경로 | `.agents/README.md` |
| source surface 지도 | `.agents/context-map.md` |
| 상세 문서 인덱스 | `docs/README.md` |
| route 계약 | `docs/contracts/route-contract.md` |
| error envelope | `docs/contracts/error-envelope.md` |
| SDK generation input | `docs/contracts/sdk-generation.md` |
| calculator contract | `docs/contracts/calculator-contract.md` |
| 데스크톱 제품 계정 연결 | `docs/contracts/desktop-product-link.md` |
| 민감 행위 authorization receipt | `docs/contracts/sensitive-action-authorization.md` |
| Core 접근 판정 | `docs/contracts/access-decision.md` |
| package surface | `docs/ops/package-surface.md` |

## 현재 범위

- route contract와 OpenAPI skeleton
- `core-api` auth/session route catalog
- 실제 service route 정의를 받을 API catalog
- webhook schema와 event schema handoff 기준
- 표준 error envelope 기준
- 권한, 감사, 멱등성, 비용 계량 hook 선언 기준
- SDK 생성 입력의 소유 경계
- OpenAPI/SDK/docs/webhook schema export dry-run plan
- auth/session route 승격에 필요한 session issue, refresh, logout/revocation, passkey challenge, OAuth callback 계약
- 브라우저 승인을 session token 전달 없이 데스크톱 제품에 연결하는 single-use S256 product-link 계약
- fresh 인증 assurance와 Core access 결정을 exact product/action/resource에 묶고 제품 도메인 guard와 함께 소비하는 민감 행위 authorization receipt 계약
- verified current session과 정확한 product/action/resource/scope를 묶고 allow/deny, policy version, expiry, obligations와 비-bearer 증거 참조를 반환하는 Core access-decision 계약
- schema model handoff가 required field와 optional field를 분리해 SDK가 선택적 reference를 잃지 않게 하는 계약
- typed fetch client가 읽어야 할 error envelope, request/trace id, timeout, abort signal, mutation idempotency handoff
- npm package metadata, MIT license, public export map, package file whitelist
- 국가 공통 계산기 6종의 정의, reviewed 2종의 숫자·반올림 정책과 공통 적합성 벡터, 안정 오류와 계약·엔진 버전 handoff

## 현재 제외

- 실제 public API endpoint
- backend handler 구현
- 실제 로그인 서버 구현
- SDK 코드 생성 결과물
- 제품별 화면 payload
- 결제, 원장, 개인정보, AI 데이터 접근 로직
- refresh token plaintext, provider secret, authorization header, cookie header를 request/response payload로 싣는 방식
- 실제 npm publish 실행
- 계산 함수, 숫자·날짜 엔진, 로케일 파싱·표시
- 제품별 계산기 페이지, SEO, 광고, 전환 payload

## 계약

루트 `service.yaml`이 이 저장소의 서비스 계약이다. `contracts/` 아래 파일은 아직 실행 가능한 OpenAPI 전체가 아니라 API 계약이 지켜야 할 최소 구조다.

CI는 full commit SHA로 고정한 `0disoft/service-catalog-generator` v0.5.11을 사용해 루트 `service.yaml`을 `zdp-v2` 입력으로 컴파일한다. 이 검증은 중앙 `zdp-architecture` 카탈로그 산출물의 대체물이 아니라, 이 저장소가 자기 서비스 manifest를 깨뜨리지 않았는지 pull request 단계에서 먼저 확인하는 dogfood gate다. 이 저장소의 service dependency는 전체 카탈로그가 아니라 단일 repo context에서 검사되므로 unknown dependency는 허용하되 warning은 실패로 처리한다. 같은 CI job은 계약 검사와 export plan을 확인하고, `prepack` build를 거친 실제 tarball을 빈 Node 소비자에 설치해 공개 JavaScript subpath까지 smoke한다.

패키지 구현 원천은 `src/`에 두되 소비자 export는 빌드된 Node 호환 ESM과 declaration인 `dist/`만 가리킨다. 하위 export는 `zdp-api-contracts/api-contracts`, `zdp-api-contracts/api-export-plan`, `zdp-api-contracts/contracts/*`만 허용한다. 계산기 계약 타입은 기존 root와 `api-contracts` export로 제공하고 원본은 `contracts/calculators/catalog.yaml`에 둔다. `files` whitelist는 `dist/`, `contracts/`, 운영 문서, `LICENSE`만 포함한다. 공개 YAML parser는 Bun 전역 대신 명시된 `yaml` runtime dependency를 사용한다. package smoke는 root parser, `api-contracts` validator, `api-export-plan` builder와 원본 contract subpath를 설치된 tarball에서 직접 소비한다. 실제 OpenAPI artifact, generated SDK, live endpoint 정보는 이 패키지에 포함하지 않는다.

## 검증

API 계약 검증기는 `contracts/route-contract.yaml`, `contracts/error-envelope.yaml`, `contracts/webhook-contract.yaml`, `contracts/sdk-generation-input.yaml`, `contracts/apis/catalog.yaml`, `contracts/calculators/catalog.yaml`, `contracts/calculators/conformance.yaml`을 읽는다. 이 검증기는 실제 API 서버, 계산 엔진, SDK 생성기를 실행하지 않고 계약 skeleton과 catalog가 다음 경계를 잃지 않았는지만 확인한다.

- route contract: resource/action/method/path, 성공 status code, `204`의 bodyless response, 권한 검사, 감사 이벤트, 멱등성, owner boundary, tenant boundary, request/trace id, session effect, credential policy, error code 기준
- error envelope: `request_id`, `trace_id` 추적 필드와 stack trace/provider secret/customer private payload 금지 기준
- webhook contract: signature verification, idempotency key, replay policy, dead-letter policy 기준
- API catalog: 실제 route 정의가 들어올 때 `operation_id`, `service_id`, schema ref, method, success status가 표준 계약과 맞는지 확인하는 자리
- SDK generation input: 활성 SDK target과 허용 target pool, route/error/webhook metadata, SDK가 소유하면 안 되는 runtime/token/final authorization 경계
- calculator catalog: 첫 국가 공통 6종, 값 종류·단위·오류 allowlist, 계약·엔진 버전, 화면 payload와 계산 함수 금지 경계
- calculator conformance: reviewed 계산기의 ASCII decimal 입력, 한계, 반올림과 구현 중립 성공·오류 벡터

첫 route catalog는 `core-api` auth/session과 access-decision 계약이다. 이 계약은 `/v1/auth/registrations`, `/v1/auth/sessions`, `/v1/auth/sessions/refresh`, `/v1/auth/sessions/current`의 GET·DELETE, `/v1/auth/recovery/requests`, `/v1/auth/passkey/challenges`, `/v1/auth/passkey/assertions`, `/v1/auth/oauth/callbacks/{provider}`, `/v1/auth/product-link-challenges`의 create·complete·exchange와 `/v1/access/authorization-decisions`의 method, schema ref, session effect, audit event, idempotency, credential policy를 고정한다. GET current-session은 identity-only 조회고, access-decision은 Core가 session을 다시 검증해 별도 authorization 판정을 만들며, 데스크톱 product-link는 브라우저 session credential을 복사하지 않는 single-use handoff다. 이 경로들은 live endpoint가 아니라 `zdp-web-apps`, `zdp-auth-ui`, 설치형 제품 consumer의 route 승격 전제 조건이다.

`sensitive-action-authorization.yaml`은 route catalog에 연결되지 않은 contract-only family다. Core의
assurance와 플랫폼 정책 결정, audience 제품의 domain guard를 분리하고 opaque receipt의 exact
binding, issuer expiry/revocation과 제품 transaction 안의 durable single-use 소비를 고정한다. Issue,
completion, verify route와 live runtime은 별도 검토 전까지 정의하지 않는다.

이렇게 해두면 제품 handler나 화면 payload가 API 계약 원천인 척 들어오는 일을 초반에 막을 수 있다. 또한 에러 응답에 provider secret이나 customer private payload가 섞이는 사고, 웹훅이 중복 처리 방지 없이 열리는 사고를 checker 단계에서 먼저 잡는다.

SDK generation input은 generated SDK source 자체가 아니다. 활성 target은 `generation_targets`에 두고, 새 언어 후보는 먼저 `allowed_generation_targets`에 등록한다. 이 입력이 있으면 `zdp-client-sdks`가 route success status, idempotency, audit event, permission hook, error trace field, typed fetch runtime metadata, webhook replay/dead-letter 규칙을 같은 방식으로 읽을 수 있다. 즉 SDK가 "이 API는 그냥 호출하면 되겠지"라고 추측하는 일을 줄이고, 언어별 SDK가 서로 다른 안전장치를 갖는 문제를 초반에 막는다.

`export:plan`은 OpenAPI, SDK generation input, webhook schema, docs contract 산출 계획을 dry-run으로 만든다. 파일을 쓰거나 schema를 publish하지 않는다. plan JSON의 `writesArtifacts`와 `publishesSchemas`는 항상 false여야 한다. 대신 생성기가 나중에 읽어야 할 source contract, required metadata, forbidden value, route operation id, typed fetch operation map, typed fetch runtime metadata, mutation idempotency policy를 한 번에 보여준다. 이게 있으면 `permission_check`, `success_statuses`, `idempotency`가 route contract에는 있는데 API catalog나 SDK input에는 없는 상태, `trace_id`가 error envelope에는 있는데 문서/SDK 계획에는 빠진 상태를 일찍 잡을 수 있다. `typedFetchOperationMap`은 SDK가 method, path, success status, auth requirement, idempotency policy, request/response schema ref, response body mode, request/trace id requirement, error code를 route catalog에서 그대로 소비하게 해준다. `204` operation은 `responseSchemaRef: null`, `responseBodyMode: none`으로 노출되어 SDK가 JSON body를 읽지 않는다. `trace_id`는 SDK 오류와 서버 로그를 같은 선으로 잇게 해주고, `idempotency`는 재시도나 webhook 중복 수신이 같은 일을 두 번 만들지 않게 해준다.

아래 package script 예시는 사람 운영자용이다. 에이전트 검증은 configured mustflow intent가 있을 때만 실행 결과로 취급한다.

```bash
bun run check
bun run build
bun run smoke:package
bun run contracts:check
bun run export:plan
bun scripts/plan-api-exports.ts --json
```

아키텍처 검증은 `zdp-architecture-linter`에서 이 저장소를 대상으로 실행한다.

서비스 카탈로그 검증은 GitHub Actions에서 `service-catalog-generator` action이 담당한다. 로컬 agent 검증은 mustflow command contract에 등록된 intent만 결과로 보고하고, SCG action 자체의 최종 dogfood 증거는 push 이후 GitHub Actions run으로 확인한다.

아래 architecture validation 예시는 현재 mustflow intent `zdp_architecture_validate_api_contracts_repository`가 감싸는 검증과 같은 목적이다.

```bash
bun src/cli.ts validate --architecture ..\..\docs\zdp-architecture --repository ..\..\contracts\zdp-api-contracts --json
```
