# CONTRIBUTING.md

## 변경 원칙

- API 계약 변경은 resource, action, authorization, audit, idempotency, error shape를 함께 본다.
- breaking change는 새 version 또는 명시적 deprecation policy 없이는 넣지 않는다.
- SDK 생성 입력과 public docs에 영향을 주는 필드는 임의로 이름을 바꾸지 않는다.
- Backplane이나 제품 handler가 편하다는 이유로 계약 원천을 바꾸지 않는다.

## 검증

아키텍처 검증은 `zdp-architecture-linter`에서 이 저장소 루트를 대상으로 실행한다. schema 검증 명령은 실제 OpenAPI/AsyncAPI 파일이 생긴 뒤 추가한다.

## 릴리스

아직 패키지 릴리스는 없다. 계약 파일이 downstream generator에 연결되면 `CHANGELOG.md`에 호환성 영향을 기록한다.
