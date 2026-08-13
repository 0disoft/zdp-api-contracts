# CHANGELOG.md

## 0.29.4

### Fixed

- catalog schema ref를 읽기 전에 canonical `contracts/apis/**` 형식과 contracts-root containment를 검증한다.
- sensitive-action schema의 route 승격, product-link의 추가 transition/ref, 일반 schema의 빈 required field를 거부한다.
- referral use의 account·campaign binding을 서버 권위로 옮기고 reward status에 current-session ownership 정책을 요구한다.
- authenticated route의 permission과 모든 route의 audit event가 구체적인 값을 갖도록 semantic gate를 강화한다.

## 0.29.3

### Fixed

- published package의 registry signature와 provenance를 확인한 뒤에만 consumer import를 실행한다.
- proposed staging OIDC registry가 evidence binding을 표현하기 전에는 active client를 인증하지 못하도록 fail closed 처리했다.
- staging trusted-edge policy resolver를 SDK와 public docs operation export에서 제외하고 ordered policy authority field를 request에서 거부한다.
- abuse verification receipt를 output-only secret으로 분류하고 Money credit-purchase request schema를 정확한 field set으로 제한한다.

## 0.29.2

### Changed

- staging password registration이 client-selected 약관 버전 대신 Core가 발급한
  `policy_set_resolution_ref`를 요구하도록 가입 요청 계약을 전환했다.
- 가입과 정책 영수증을 같은 Core 트랜잭션에서 기록할 수 있도록 해석 스냅샷을
  가입 명령의 유일한 정책 권위로 둔다.

## 0.29.1

### Changed

- Core customer-policy set resolve operation을 staging trusted-edge 구현으로 분류하고 `POST /v1/customer-policy-sets/resolve` route metadata를 추가했다.
- 소비자가 resolution 유효기간을 추정하지 않도록 응답에 서버 권위 `expires_at`을 요구한다.
- 문서 단건 조회와 policy receipt 생성·조회 operation은 계속 contract-only이며 production readiness는 열지 않는다.

## 0.29.0

### Added

- 공통 정책과 제품·관할·판매 채널 addendum을 exact ordered revision set으로 resolve하는 Core consent 계약을 추가했다.
- 가입과 결제가 client-selected version이나 URL 대신 server resolution reference로 불변 consent receipt를 만들도록 schema와 검증을 추가했다.

### Changed

- 필수 정책 누락은 대상 고위험 기능만 fail closed하고 정책 열람, 고객지원, 환불, 데이터 권리 surface는 계속 열어 두도록 경계를 명시했다.

## 0.28.0

### Changed

- 공개 abuse issue/redeem origin이 Edge transport identity와 versioned request proof 없이 상태를 만들지
  않도록 direct-origin 우회 차단 계약을 추가했다.
- Cloudflare BFF, private Hetzner service와 operator health caller family를 분리하고 ambiguous credential을
  adapter fallback 없이 거부하도록 계약을 강화했다.
- Edge proof에 versioned key ID, bounded timestamp, single-use nonce, request ID와 기존 exact envelope
  binding을 함께 요구한다.

## 0.27.0

### Changed

- 내부 abuse verification service proof가 method, pathname, canonical body SHA-256, idempotency key,
  permission과 exact binding을 하나의 authorization envelope로 검증하도록 계약을 강화했다.

## 0.26.2

### Fixed

- redeem 복구 identity에 normalized challenge response input을 함께 묶어 같은 idempotency key를 아는 다른 호출자도 원래 solution 없이 bearer receipt를 복구하지 못하게 했다.

## 0.26.1

### Fixed

- redeem 복구를 최초 요청과 동일한 idempotency key 및 exact binding에 묶어 다른 공개 호출자가 이미 redeem된 challenge의 bearer receipt를 복구하지 못하게 했다.

## 0.26.0

### Changed

- abuse redeem이 provider 성공을 durable `verified` 상태로 먼저 기록하고 같은 challenge 재시도에서 canonical 성공을 복구하도록 계약을 강화했다.
- verification receipt를 key ID가 있는 keyed deterministic derivation으로 정의해 plaintext 저장 없이 최종화 실패와 응답 유실을 복구하도록 했다.

## 0.25.0

### Changed

- 내부 abuse verification 요청에 opaque `consumer_operation_ref`를 필수로 추가했다.
- 같은 consumer operation의 verify 재호출은 이전 성공을 replay하고 다른 operation은 fail closed하도록 receipt 소비 계약을 강화했다.
- 제품 transaction이 verification consume과 동일한 operation ref를 durable idempotency identity로 사용하도록 handoff를 명시했다.

## 0.24.0

### Added

- provider-neutral abuse challenge issue/redeem, 내부 verify/health route와 schema bundle을 추가했다.
- exact product/environment/action binding, 짧은 TTL과 성공 시 단회 소비를 강제하는 verification receipt 계약을 추가했다.

### Changed

- challenge 성공을 인증, 권한, 결제 또는 제품 domain action 승인으로 사용할 수 없도록 parser, validator, SDK source와 문서 경계를 확장했다.
- challenge solution, verification receipt, raw IP/fingerprint, provider payload와 request body의 저장·로그·노출을 금지했다.

## 0.23.2

### Fixed

- credit-purchase 계약 설명이 이미 생성된 SDK metadata를 부정하지 않도록 고치고, generated SDK 존재와 live Money endpoint 활성화를 분리했다.

## 0.23.1

### Fixed

- 복리, 데이터 전송 시간, 날짜 차이 계약에 동작 의미를 보존한 계산 엔진 `0.6.0` 호환 선언을 추가했다.
- 세 계약이 shared `zdp-libs-ts` 0.6.0 엔진을 fail-closed 소비자가 직접 인정할 수 있는 회귀 검사를 추가했다.

## 0.23.0

### Added

- checkout, payment, credit issuance, return receipt의 독립 상태 enum과 Money persistence 계약 reference를 추가했다.
- return receipt SHA-256 digest 저장, 평문 비저장, 동일 idempotency 교환 replay 계약을 추가했다.
- discount·age·work-hours·fuel-cost 글로벌 범용 계산기 4종 계약과 공통 적합성 벡터를 추가했다.

### Changed

- provider webhook·상태 조회·reconciliation을 payment evidence로 한정하고, payment 성공과 ledger issuance 성공이 모두 있어야 checkout이 완료되도록 명확히 분리했다.
- checkout 생성·receipt 교환 응답에 `return_receipt_status`를 포함하고 상태 조회에 안전한 payment attempt·ledger issuance reference를 선택적으로 제공한다.
- reviewed 계산기 묶음을 13종에서 17종으로 확장하고 `age`를 정수 정책 정의로, `work-hours` 시각 입력을 자정 이후 분으로 정규화했다.

## 0.22.0

### Added

- 공통 함선 팩 catalog projection, checkout intent 생성, 상태 조회와 일회용 return receipt 교환 계약을 추가했다.
- 결제와 귤 지급을 분리한 상태, immutable 가격·세금·혜택 snapshot reference, 식별자 분리와 reconciliation 경계를 기계 검증한다.

### Changed

- SDK generation input이 credit-purchase schema bundle과 네 Money operation을 읽도록 확장했다.
- 클라이언트 금액·통화·지급량, success redirect와 임의 return URL을 결제 권위로 사용할 수 없게 계약을 닫았다.

## 0.21.1

### Fixed

- 기존 복리, 데이터 전송 시간, 날짜 차이 계약에 동작 의미를 보존한 계산 엔진 `0.5.0` 호환성을 추가했다.
- 모든 reviewed 계산기가 현재 `0.5.0` 엔진을 직접 또는 `0.x` 범위로 허용하는 회귀 검사를 추가했다.

## 0.21.0

### Added

- 소상공인·무인매장 후속 계산기 7종의 reviewed 입력·출력·오류·공식 계약을 추가했다.
- 좌석 가동률, 스터디카페 손익분기, 키오스크 투자 회수, 무인운영 인건비 절감, 사물함 수익, 스터디룸 매출, 보안비 포함 손익분기의 독립 성공·오류 벡터를 추가했다.

### Changed

- reviewed 계산기 묶음을 13종으로 확장하고 후속 7종의 최초 호환 엔진을 `0.5.0`으로 고정했다.
- 외부 정책값을 내장하지 않고 호출자가 제공한 좌석·시간·비용·비율만 계산하도록 소상공인 계약 경계를 명시했다.

## 0.20.2

### Fixed

- 기존 데이터 전송 계산이 그대로 포함된 엔진 `0.4.0`을 `data-transfer-time` 호환 버전에 추가했다.

## 0.20.1

### Fixed

- 성공 적합성 벡터가 계산기 정의의 `allowed_values` 밖 enum 값을 사용하는 경우 validator가 거부하도록 보강했다.

## 0.20.0

### Added

- `compound-interest`를 reviewed 계산기 계약으로 승격하고 principal, nominal annual rate, frequency, exact integer compounding periods를 고정했다.
- 연·반기·분기·월·일 복리, 음수 금리, identity, half-away tie, 통화 보존과 실행 한계 벡터를 추가했다.

### Changed

- 모호한 decimal `duration_years`를 canonical unsigned integer `compounding_periods`로 교체해 fractional compounding을 제거했다.
- 기간은 frequency당 최대 100년, 축약 후 거듭제곱 피연산자 예상 자릿수는 250,000으로 제한하고 exact rational 중간값은 반올림하지 않도록 고정했다.

## 0.19.0

### Added

- `date-difference`를 reviewed 계산기 계약으로 승격하고 strict `YYYY-MM-DD`, proleptic Gregorian, `0001`–`9999`, inclusive/exclusive 경계와 정확한 정수 일수 의미를 고정했다.
- 윤년·세기·전체 지원 범위·역전 범위·시간대 문자열 거부를 포함한 날짜 적합성 벡터를 추가했다.

### Changed

- 계산기 conformance schema를 v2로 올려 소수 계산기의 canonical decimal string과 날짜 계산기의 JSON integer 출력을 각각 검증한다.
- 모호한 `elapsed_days` 결과 ID를 `calendar_day_count`로 교체하고 날짜 계산에서 의미 없는 precision/rounding 오류를 제거했다.

## 0.18.0

### Added

- `data-transfer-time`을 reviewed 계산기 계약으로 승격하고 SI·IEC 데이터 크기, bit·byte 환산, bits-per-second 전송률과 초 단위 결과 의미를 고정했다.
- decimal·binary 단위, half-away 반올림, 0 크기, 0 전송률, 음수 크기와 미지원 단위 적합성 벡터를 추가했다.
- 최초 호환 엔진을 `0.3.0`으로 고정하고 모든 열거 입력 단위의 성공 벡터 누락과 성공 결과의 단위·소수 자릿수 drift를 validator가 거부하도록 강화했다.

## 0.17.0

### Added

- `break-even-point`를 reviewed 계산기 계약으로 승격하고 기여이익, 이론적 손익분기 수량, 통화 일치, 양수 기여이익과 반올림 의미를 고정했다.
- 정상값, 0 고정비, half-away 반올림, 0·음수 기여이익, 통화 불일치, 음수 고정비 적합성 벡터를 추가했다.

## 0.16.2

### Added

- Trusted Publisher 릴리스가 branch CI, tag push, npm publish, 공개 smoke, GitHub Release 단계에서 실패했을 때 재실행 가능 여부와 새 patch 버전 필요 여부를 판단하는 복구 절차를 추가했다.
- 공개 증거로 보존할 commit SHA, workflow run, npm integrity, provenance, GitHub Release 항목을 명시했다.

### Changed

- 이미 공개된 npm 버전의 재배포와 release tag 삭제·이동을 금지하고, `gitHead` 불일치는 즉시 incident로 중단하도록 운영 경계를 명확히 했다.

## 0.16.1

### Added

- npm 공개 직후 정확한 버전을 빈 소비자 프로젝트에 설치해 public export와 contract subpath를 실행하고 registry signature 및 provenance attestation을 검증하는 smoke를 추가했다.

### Changed

- Trusted Publisher release workflow가 registry metadata 확인만으로 끝나지 않고 공개 설치와 `npm audit signatures`까지 통과해야 완료되도록 강화했다.

## 0.16.0

### Added

- 중앙 OIDC client registry에 revision compare-and-swap, 환경 격리, immutable field, 보안 민감 변경, 감사 이벤트와 증거 기반 lifecycle 계약을 추가했다.
- client ID 중복, cross-environment entry, 부정확한 HTTPS redirect, unreviewed lifecycle, active client의 activation evidence 누락을 거부하는 회귀 검사를 추가했다.

### Changed

- 첫 `zdp-web-public-staging` fixture는 계속 disabled로 유지하되, 단일 fixture 전용 validator를 여러 제품을 수용하는 일반 registry validator로 확장했다.

## 0.15.0

### Added

- 웹 제품 BFF의 OIDC Authorization Code Flow, RFC 9700, PKCE S256, exact redirect URI와 중앙 client registry 경계를 `proposed-contract`로 추가했다.
- 제품 host-only session binding과 중앙 session·credential 정본, Core Access의 작업별 권한 판단을 분리하는 검증을 추가했다.
- disabled `zdp-web-public-staging` client fixture와 첫 provider runtime TTL·key·revocation Proposed profile을 추가했다.

### Changed

- 회원가입 요청을 현재 계정 정책과 맞춰 `login_id`, `password`, 필수 약관 동의로 정정하고 이메일을 가입 필수값에서 제거했다.

## 0.14.0

### Added

- verified current session과 정확한 product/action/resource/scope를 묶어 allow/deny, reason, policy/data revision, expiry, obligations와 non-bearer `decision_ref`를 반환하는 Core access-decision 계약을 추가했다.
- access-decision route와 schema bundle을 API catalog, SDK generation input, typed parser·validator·export plan에 연결했다.

### Changed

- current-session은 identity-only 응답으로 유지하고 consent receipt, client-supplied role·tenant 또는 `decision_ref`를 최종 authorization으로 재해석하지 못하도록 계약을 닫았다.

## 0.13.1

### Changed

- API validator와 export plan이 동일한 canonical forbidden-value 정책을 공유하도록 정본을 통합하고 전체 금지값의 export plan 전파를 회귀 테스트로 고정했다.

## 0.13.0

### Changed

- `204 No Content` route가 `response_schema_ref: null`을 명시하고 body-bearing 성공 상태와 섞이지 않도록 계약을 닫았다.
- typed fetch export plan이 `noContentSuccessStatuses`와 route별 `responseBodyMode`를 제공해 SDK가 `204` 응답에서 JSON body를 읽지 않도록 했다.

## 0.12.1

### Fixed

- API catalog parser가 최상위와 `api_catalog` 객체의 알 수 없는 필드를 거부하도록 경계를 닫았다.
- secret material policy가 안전한 문구를 부분 문자열로 포함하는 것만으로 통과하지 않고, 허용된 정책 식별자와 정확히 일치하도록 강화했다.

### Changed

- package smoke가 설치된 tarball의 root, `api-contracts`, `api-export-plan`, contract subpath를 모두 소비한다.
- CI가 계약 검사에 더해 export plan과 packed-package smoke를 실행한다.

## 0.12.0

### Added

- API schema model handoff에 `optionalFields`를 추가해 required field와 선택 field를 SDK가 구분할 수 있게 했다.
- product-link exchange 응답의 선택적 `workspace_ref`를 machine-readable schema metadata로 노출했다.

### Changed

- 같은 schema field를 required와 optional에 동시에 선언하면 계약 검증이 실패한다.

## 0.11.0

### Added

- 브라우저의 ZDP 가입·로그인 결과를 session token 전달 없이 설치형 제품에 연결하는 product-link challenge create·complete·exchange 계약을 추가했다.
- 10분 만료, 최소 5초 polling, S256 proof binding, single-use exchange, correlation-bound retry와 로컬 전용 모드 경계를 parser·validator·tests에 추가했다.

## 0.10.1

### Changed

- npm package가 TypeScript source 대신 빌드된 Node 호환 ESM과 declaration을 배포하도록 export와 file whitelist를 정리했다.
- 공개 YAML parser에서 Bun 전용 전역을 제거하고 `yaml` 2.9.0 runtime dependency를 사용하도록 바꿨다.
- npm publish는 `prepack`에서 `dist/`를 재생성하고, commit SHA로 고정한 Git dependency는 검증 후 커밋된 같은 `dist/`를 소비하도록 정리했다.
- 실제 tarball을 빈 Node 소비자에 설치해 root와 `api-contracts` subpath를 검증하는 package smoke를 추가했다.

## 0.10.0

### Added

- `percentage-change`와 `margin-markup`의 공통 성공·오류 적합성 벡터를 `contracts/calculators/conformance.yaml`에 추가했다.
- 적합성 벡터의 계약 버전, 입력 한계, 반올림 모드, 필드와 오류 코드 드리프트를 검사하는 parser와 validator를 추가했다.

### Changed

- 첫 구현 대상 두 계산기의 lifecycle을 reviewed로 올리고 ASCII decimal string, 최대 1000자리 입력, 호출자 지정 0-100 소수 자리, half-away-from-zero 반올림 정책을 확정했다.

## 0.9.0

### Added

- 국가 정책에 의존하지 않는 첫 계산기 6종의 정의, 표준 입력·결과 metadata, 안정 오류 코드, 계약·엔진 버전 handoff를 `contracts/calculators/catalog.yaml`에 추가했다.
- 계산기 계약 parser와 semantic validator를 public API contract checker에 연결하고, 중복 ID, 미검토 값 종류, 버전 드리프트, 화면 payload 침투를 막는 회귀 테스트를 추가했다.

### Changed

- 저장소 경계를 API route 계약뿐 아니라 여러 제품이 재사용하는 계산기 정의 계약까지 포함하도록 문서화했다. 계산 공식과 제품 화면 payload는 계속 소유하지 않는다.

## 0.8.0

### Added

- 제품 consumer가 현재 세션의 actor, tenant, 만료 상태를 검증할 수 있도록 `core.auth.sessions.get_current` 읽기 계약과 bodyless request schema를 추가했다.

## 0.7.6

### Changed

- Action bundle version을 바로잡은 `service-catalog-generator` v0.5.11 forward fix로 service catalog validation을 올렸다.

## 0.7.5

### Changed

- service catalog validation을 full-SHA-pinned `service-catalog-generator` v0.5.10으로 올렸다.

## 0.7.4

### Changed

- GitHub Actions CI의 모든 외부 Action을 full commit SHA로 고정하고 checkout credential persistence를 껐다.
- service catalog validation 문서를 full-SHA-pinned `service-catalog-generator` v0.5.9 계약과 동기화했다.

## 0.7.3

### Changed

- GitHub Actions CI now dogfoods `service-catalog-generator@v0.5.9` against the root ZDP `service.yaml` before package-local checks run.

## 0.7.2

### Changed

- ssealed식 문서 라우터, agent checklist, validation docs를 추가하고 package files에 consumer-facing 문서 표면을 포함했다.

## 0.7.1

### Changed

- public npm package surface에 `SECURITY.md`를 포함해 API 계약 저장소의 민감값 금지와 신고 경계를 명시했다.

## 0.7.0

### Added

- API export dry-run plan에 `schemaModelMap`을 추가해 SDK가 API schema bundle의 required field, secret field, session effect metadata를 같은 handoff에서 소비할 수 있게 했다.

## 0.6.0

### Added

- API export dry-run plan에 `typedFetchOperationMap`을 추가해 SDK가 route catalog의 method, path, success status, auth, idempotency, request/response schema ref, request/trace id, error code metadata를 직접 소비할 수 있게 했다.

## 0.5.0

### Added

- `core-api` auth/session route catalog를 추가해 registration, session issue/refresh/revoke, recovery, passkey challenge/assertion, OAuth callback 계약을 live handler 구현 전에 고정했다.
- route contract와 SDK generation input에 owner boundary, tenant boundary, request/trace id propagation, session effect, credential policy metadata를 추가했다.

## 0.4.1

### Changed

- `check:tsgo` fast typecheck 스크립트와 pinned `@typescript/native-preview` 의존성을 추가했다.
- contract loader 실패 타입 가드를 heterogeneous contract 결과 배열에서도 안전하게 좁히도록 정리했다.

## 0.4.0

### Added

- 실제 서비스 route 정의를 받을 `contracts/apis/catalog.yaml` 카탈로그 skeleton을 추가했다.
- route contract에 허용 HTTP method와 성공 status code 기준을 추가했다.
- SDK target을 고정 필수 목록이 아니라 `allowed_generation_targets` 안에서 선택하는 방식으로 바꿨다.
- contract loader가 여러 YAML 로드 오류를 한 번에 모아 보고하도록 개선했다.

## 0.3.0

### Added

- OpenAPI/SDK/docs/webhook schema export dry-run plan을 추가했다.
- `export:plan`이 route, error envelope, webhook, SDK generation input 사이의 metadata drift를 검사한다.

## 0.2.0

### Added

- SDK generation input 계약 skeleton을 추가했다.
- SDK 생성 입력이 TypeScript, Dart, Rust target과 route/error/webhook metadata를 유지하는지 검증한다.
- generated SDK source, SDK runtime, refresh token storage, final authorization decision이 API 계약 저장소로 새지 않도록 금지 소유권과 금지값 검사를 추가했다.

## 0.1.0

### Added

- API 계약 저장소 골격을 추가했다.
- route, error, webhook 계약 skeleton을 추가했다.
- Bun/TypeScript API contract checker skeleton을 추가했다.
- route 권한·감사·멱등성 hook, error envelope 추적·민감값 금지, webhook 서명·멱등성·재처리·dead-letter 기준을 기계 검증한다.
