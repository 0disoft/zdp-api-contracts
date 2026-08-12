# VALIDATION.md

이 문서는 API 계약 저장소 변경 후 확인할 기준을 모은다. 실행 권한은 mustflow command contract와 package scripts가 별도로 소유한다.

## Configured Repository Validation

| 변경 범위 | 확인 기준 |
| --- | --- |
| `contracts/*`, `src/api-contracts/*`, `src/api-export-plan/*` | `zdp_api_contracts_check`, `zdp_architecture_validate_api_contracts_repository` |
| npm export, declaration, runtime dependency, package files | `zdp_api_contracts_build`, `zdp_api_contracts_package_smoke`, `zdp_api_contracts_npm_pack_dry_run` |
| 루트 `service.yaml` manifest 또는 CI gate | GitHub Actions `Validate service catalog manifest` step, using full-SHA-pinned `0disoft/service-catalog-generator` v0.5.11 with `input-schema: zdp-v2` |
| ZDP architecture catalog나 linter rule과 함께 바뀐 경우 | `zdp_architecture_validate_fast` |
| 문서 라우터와 agent guide만 바꾼 경우 | repository validation과 Markdown 링크 수동 확인 |

agent-facing 문서에는 raw package command를 실행 권한처럼 적지 않는다. package-local script는 사람이 직접 실행하거나 별도 command intent가 있을 때만 agent 검증으로 취급한다.

## Source Of Truth Checks

- route metadata source: `contracts/route-contract.yaml`와 `contracts/apis/catalog.yaml`
- core auth/session route source: `contracts/apis/core-api/auth-session.yaml`
- sensitive-action authorization source: `contracts/apis/core-api/sensitive-action-authorization.yaml`
- Core access-decision source: `contracts/apis/core-api/access-decision.yaml`
- Core customer-policy registry source: `contracts/apis/core-api/customer-policy-registry.yaml`
- abuse challenge source: `contracts/apis/abuse-api/challenge.yaml`
- standard error source: `contracts/error-envelope.yaml`
- webhook source: `contracts/webhook-contract.yaml`
- SDK handoff source: `contracts/sdk-generation-input.yaml`
- export dry-run source: `scripts/plan-api-exports.ts`와 `src/api-export-plan/*`
- package export source: `package.json`, `src/index.ts`, `tsconfig.build.json`; consumer output: generated `dist/`
- service catalog compile source: root `service.yaml`, consumed by full-SHA-pinned `0disoft/service-catalog-generator` v0.5.11 in GitHub Actions
- calculator contract sources: `contracts/calculators/catalog.yaml`, `contracts/calculators/conformance.yaml`
- credit purchase sources: `contracts/apis/money-api/credit-purchase.yaml`, `contracts/apis/money-api/credit-purchase-read.yaml`

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
- schema model export가 required field와 optional field를 분리하고 product-link의 선택적 `workspace_ref`를 보존하는지 확인한다.
- sensitive-action authorization이 opaque receipt, exact binding, issuer expiry/revocation, audience durable single-use 소비를 유지하고 live route나 제품 resource 관계 검증을 주장하지 않는지 확인한다.
- access-decision이 current-session을 identity-only로 유지하고, exact product/action/resource/scope binding, deny 기본값, policy/data revision, expiry, obligations와 non-bearer decision ref를 잃지 않는지 확인한다.
- abuse challenge catalog가 public issue/redeem과 private verify/health만 가지며 provider payload가 product contract로 새지 않는지 확인한다.
- abuse challenge contract가 direct-origin issue/redeem을 금지하고 Cloudflare BFF, private Hetzner service와
  operator health credential family를 분리하며 timestamp/key ID/nonce-bound proof와 ambiguous credential
  rejection을 유지하는지 확인한다.
- verification receipt가 exact product/environment/action binding, 짧은 TTL, consumer operation-bound 소비, 같은 operation의 성공 replay와 다른 operation의 fail-closed 거부를 유지하는지 확인한다. Provider 성공 후 verified 상태와 keyed deterministic receipt metadata가 durable하게 남아 redeem 응답 유실을 복구하는지도 확인한다.
- 내부 verification service proof가 method, pathname, canonical body SHA-256, idempotency key, permission과 exact binding을 한 envelope에 묶으며 header-only proof로 후퇴하지 않는지 확인한다.
- OIDC 제품 로그인 handoff가 Authorization Code Flow, RFC 9700, PKCE S256, exact redirect URI, 중앙 client registry, 제품 host-only session과 Core Access 재판단 경계를 유지하는지 확인한다.
- 첫 staging client가 disabled BFF 경계와 exact callback에서 이탈하거나 provider runtime의 TTL·single-use·key rotation·revocation 상한이 느슨해지는지 확인한다.
- 중앙 client registry가 revision compare-and-swap, 환경 격리, client ID 비재사용, 증거 기반 lifecycle, 보안 민감 변경 감사와 active 전 activation evidence 요구를 유지하는지 확인한다.
- 공통 귤 충전이 서버 재검증, immutable snapshot reference, 분리된 식별자, 결제·지급 상태 분리와 미확정 결과 reconciliation을 유지하는지 확인한다.
- client 금액·통화·지급량, success redirect와 임의 return URL이 결제 권위로 승격되거나 return receipt가 재사용 가능한 bearer가 되지 않는지 확인한다.
- provider payment evidence와 checkout completion evidence가 분리되고 ledger issuance 성공 전에는 `completed`를 허용하지 않는지 확인한다.
- checkout/payment/credit issuance/return receipt enum이 Money 상태기와 일치하며 receipt 평문 비저장·SHA-256 digest·exact retry 정책이 유지되는지 확인한다.
- 여러 제품 entry에서 client ID 중복, registry와 다른 environment, wildcard·credential·fragment URI, grant/response/PKCE drift와 평문 key material을 거부하는지 확인한다.
- export plan이 generated artifact를 쓰거나 schema publish를 주장하지 않는지 확인한다.
- package export map과 `files` whitelist가 README의 package surface 설명과 어긋나지 않는지 확인한다.
- tarball을 빈 Node 소비자에 설치했을 때 root와 공개 subpath가 Bun 전역이나 저장소 source layout에 기대지 않는지 확인한다.
- 계산기 계약이 국가 공통 6종, 소상공인·무인매장 7종, 글로벌 범용 4종(discount·age·work-hours·fuel-cost), 안정 오류, 허용 값 종류·단위, 계약·엔진 버전 handoff를 유지하는지 확인한다.
- 계산기 정의에 화면 payload, 로케일 문자열, 계산 함수 구현이 들어가지 않는지 확인한다.
- reviewed 계산기의 정밀도·반올림 정책과 공통 적합성 벡터가 같은 계약 버전을 유지하는지 확인한다.

## Version Impact

`package.json`이 package version source다. package files에 포함되는 README, package metadata, public export, contract source가 바뀌면 patch/minor/major 필요성을 판단한다.

- 문서 라우터만 추가하고 계약 의미가 바뀌지 않으면 patch급이다.
- route/error/webhook/SDK required field가 바뀌면 consumer compatibility를 보고 minor 또는 major를 판단한다.
- export map, package files, public type surface가 바뀌면 package consumer 영향으로 본다.
- 새 선택적 계약 family와 public type이 추가되면 minor, 기존 계산기 required field나 의미가 호환성 없이 바뀌면 major로 본다.
