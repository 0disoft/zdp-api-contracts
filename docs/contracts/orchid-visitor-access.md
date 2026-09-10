# Orchid 방문자 접근 등록·철회

POST `/v1/accounts/orchid-visitor-access`는 private BFF만 호출한다. 현재 host-only session
cookie, 중복 없는 `Idempotency-Key`, `X-Request-Id`, `X-Trace-Id`가 필요하다.
Origin, query, Authorization 혼용, 중복 cookie, Content-Encoding은 거부한다.
Content-Type은 `application/json`, 본문은 1 KiB 이하의 `{ "operation": "register" }`
또는 `{ "operation": "revoke" }`만 허용한다. 다른 필드와 중복 필드는 거부한다.

Core가 credential에서 현재 사용자와 소유한 활성 개인 계정을 직접 확인한다.
등록은 승인된 Orchid 출석 action 및 `orchid-visitor`의 단일 출석 allow binding만
허용하며 다른 active 권한이나 deny가 있으면 503 `policy_unavailable`이다.
철회는 정책이 retired 상태여도 가능하다. 철회된 역할을 이 API로 재활성화할 수 없다.

200 직접 JSON은 `personal_account_ref`, `status`(active/revoked), `replayed`만 포함한다.
같은 개인 계정·idempotency key·operation은 역사적 결과를 재전송한다. 다른 operation은
409 `idempotency_conflict`다. 이미 등록/미등록 상태의 새 요청은 409
`visitor_access_conflict`, 철회된 역할의 신규 등록은 403 `visitor_access_revoked`다.
응답은 권한 증명이 아니며 출석마다 현재 access decision을 별도로 요청해야 한다.

역할 변경·role event·감사는 원자적으로 commit한다. 인증 실패는 401
`authentication_failed`, metadata 오류는 400 `invalid_request_metadata`, 잘못된 입력은
400 `invalid_request`, DB/감사 실패는 503 `provider_unavailable`이다.
오류는 공통 4필드 envelope이며 처리 응답은 correlation header와 `Cache-Control: no-store`,
`Pragma: no-cache`를 포함한다. 운영 endpoint mount와 정책 배포는 별도 readiness gate다.