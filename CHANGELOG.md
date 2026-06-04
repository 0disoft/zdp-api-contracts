# CHANGELOG.md

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
