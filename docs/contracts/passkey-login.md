# 패스키 로그인 계약

새 operation은 `core.auth.passkey_login_begin.create`와 `core.auth.passkey_login_complete.create`다. 기존 challenge·assertion operation은 제거하지 않는다. 이 계약 추가는 공개 handler 연결이나 운영 활성화를 의미하지 않는다.

| 단계 | SDK·브라우저 JSON 본문 | 성공 응답 |
| --- | --- | --- |
| POST `/v1/auth/passkey/login/begin` | `{}` | 200, `ceremony_id`, `options.publicKey` |
| POST `/v1/auth/passkey/login/complete` | `ceremony_id`, `credential` | 201, `session_ref`, `actor_ref`, `tenant_ref`, `expires_at` |

브라우저 SDK는 같은 origin의 계정 BFF를 호출한다. 비공개 Core를 직접 호출하지 않는다. BFF가 HttpOnly 쿠키에서 읽은 `browser_binding`을 전달 본문에 추가하고 Edge가 그 정확한 본문을 서명한다. Core의 시작 본문은 `browser_binding`, 완료 본문은 `ceremony_id`, `credential`, `browser_binding`이다. 개인 계정·RP·바인딩 힌트는 브라우저 payload로 받지 않는다. 서버의 RP·origin 및 사용자 확인 정책은 Core가 소유한다.

브라우저 바인딩은 32바이트 난수의 64자리 소문자 hex이며 `__Host-zdp_passkey_browser` 쿠키로 유지한다. 쿠키 속성은 `Path=/; Max-Age=300; HttpOnly; Secure; SameSite=Strict`다. 서버는 origin·fetch metadata·쿠키에 묶인 CSRF를 검증한다. 본문은 8192바이트 이내다. 세션 원문은 성공 본문에 포함하지 않고 HttpOnly 세션 쿠키로 전달한다.

두 ceremony는 `idempotency: not_required`다. 일반 mutation처럼 성공 응답을 replay하지 않으며, SDK는 요청 키가 명시되어도 자동 재시도하지 않는다. 비공개 전달에서는 별도의 요청 키가 서명 metadata로 필수이고 BFF가 생성한다. 이 키가 인증 응답 재소비를 허용하지는 않는다. 응답이 불확실하면 새 로그인 시작부터 진행한다.

Core 후보의 입력 오류는 `validation_failed` 400, 인증 거부는 `authentication_failed` 401, 제한에 걸린 경우도 열거 방지를 위해 같은 코드의 429와 `Retry-After: 60`이다. 인증 기반이 준비되지 않으면 `authentication_unavailable` 503이다. 오류 카탈로그의 401은 기본 상태이며 이 흐름의 429도 상태 코드로 판별해야 한다. BFF의 origin·CSRF·본문·gateway 실패는 별도 전송 경계 오류다.

현재 비공개 후보는 간략한 오류 본문을 사용한다. 공개 연결 전에 BFF가 표준 오류 envelope의 `message`, `request_id`, `trace_id`를 채우는 처리를 검증해야 한다. SDK는 WebAuthn 내부 JSON을 `ZdpJsonObject`로 운반하며 이를 인증된 credential로 판단하지 않는다. 브라우저 WebAuthn 변환·RP 검사와 Core의 서명·challenge·사용자 확인 검증이 필요하다.

남은 활성화 조건은 공용 UI 연결, BFF·Core 비공개 handler 연결, staging의 실제 브라우저 등록·로그인, 만료 정리와 알림 연결, 운영 검토다. 운영 활성화는 별도로 진행한다.
