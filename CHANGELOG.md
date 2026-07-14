# CHANGELOG.md

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
