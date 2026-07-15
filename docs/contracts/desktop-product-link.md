# 데스크톱 제품 계정 연결 계약

## 상태

계약 전용(contract-only). live handler와 배포 URL을 의미하지 않는다.

## 목적

Talos 같은 설치형 제품이 브라우저의 ZDP 가입·로그인 세션을 직접 복사하지 않고, 사용자가 브라우저에서 승인한 결과만 1회 교환하도록 한다. 제품은 비밀번호, 쿠키, access token, refresh token, 연락 수단, 통합 프로필, 약관 원문을 받지 않는다.

## 흐름

1. 데스크톱은 32-octet random verifier와 S256 proof challenge를 만든다.
2. `core.auth.product_link_challenges.create`가 제품, 설치본, correlation, 요청 scope와 proof challenge를 10분짜리 challenge에 묶는다.
3. 데스크톱은 응답의 신뢰된 HTTPS `verification_uri`를 시스템 브라우저로 연다. URI에는 verifier나 session credential을 넣지 않는다.
4. ZDP 인증 UI는 기존 ZDP 세션으로 사용자를 확인하고, 요청 제품·scope·워크스페이스·동의 결과를 보여준 뒤 `complete`를 호출한다.
5. 데스크톱은 최소 5초 간격으로 `exchange`를 재시도한다. `proof_verifier`는 이 요청에서만 사용하고 평문 저장·로그·응답 반사를 금지한다.
6. 승인된 challenge는 한 번만 `consumed`로 전환된다. 같은 challenge와 correlation의 동일 명령 재전송은 같은 결과를 돌려줄 수 있지만, 다른 correlation이나 verifier는 거부한다.

## 상태

```text
pending -> approved -> consumed
   |          |
   +-> denied +-> expired
   +-> expired
```

`denied`, `expired`, `consumed`는 terminal state다. 만료·거절·소비된 challenge를 되살리지 않고 새 challenge를 만든다.

## 결과 경계

성공 응답은 `link_receipt_ref`, `subject_ref`, 선택적 `workspace_ref`, `consent_receipt_ref`, `verified_at`만 제품에 전달한다. 이 reference는 로그인 ID, 이메일, 전화번호, 닉네임이나 session token으로 해석할 수 없는 opaque value다.

계정 연결은 데이터 동기화 승인이 아니다. Talos의 저장소, 프롬프트, 모델 응답, 터미널 출력, diff, memory, Vault는 별도 sync 계약과 명시적 사용자 동의 없이는 ZDP로 전송하지 않는다.

## 로컬 전용 모드

Talos는 계정 연결 없이 로컬 Vault와 로컬 작업 기능을 사용할 수 있다. 이 모드는 원격 동기화, 계정 entitlement, 원격 계정 기능을 열지 않는다. 이미 열린 로컬 Vault는 ZDP 장애나 challenge 만료 때문에 잠기지 않는다.

## 승격 차단 조건

- core challenge 저장소가 verifier hash, expiry, state, correlation, product, client instance, requested scopes를 durable하게 보존하지 않음;
- 승인과 consent receipt 생성이 같은 core transaction 또는 복구 가능한 outbox 경계로 묶이지 않음;
- exchange의 single-use compare-and-set과 동일 명령 idempotency가 증명되지 않음;
- ZDP 인증 UI가 제품·scope·워크스페이스·동의를 사용자에게 표시하지 않음;
- Talos production adapter가 verifier를 Vault event, log, crash report, UI state에 남기지 않는다는 검증이 없음;
- 실제 endpoint, TLS, rate limit, audit retention, 운영 배포가 검증되지 않음.
