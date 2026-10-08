# 계정 정보와 로그인·동의 관리

Core 소유의 비공개 계정 BFF 계약이다. 소스 구현과 운영 배포는 별개다.

- `GET /v1/account-settings/details`: 현재 유효한 개인 계정 세션으로 본인의 가입일,
  비밀번호 최근 변경일, 활성 세션과 동의 기록을 조회한다. 현재 세션 모드와 환경 Host 검증을 따른다.
- `POST /v1/account-settings/sessions/revoke`: 정확한 JSON `{handle: string}`을 받으며
  다른 활성 세션을 로그아웃한다. 현재 세션은 기존 현재 로그아웃 경로를 사용한다.
- 조회 응답은 `joined_at`, nullable `password_changed_at`, `sessions`, `sessions_truncated`,
  `consents`, `consents_truncated`다. 시간은 RFC3339다.
- 세션 항목은 `handle`, `current`, `started_at`, nullable `last_seen_at`, `expires_at`이다.
  handle은 현재 access-token digest를 키로 대상 세션 ID에 도메인 분리 HMAC-SHA256한
  소문자 64자리 값이다. 현재 세션/쿠키 교체나 다른 사용자 간에 재사용할 수 없다.
  내부 ID·기기 해시·IP·접근/갱신 토큰은 브라우저에 반환하지 않는다.
- 동의 항목은 `kind`, `version`, `state`(granted/withdrawn/not_given), `required`,
  nullable `changed_at`이다. 기존 acceptance와 완료된 withdrawal 기록을 읽는다.
  optional_profile은 현재 선택 정보와 원문 없는 최신 변경 감사 기록을 함께 읽는다.
  기록 없는 동의 날짜는 추정하지 않는다.
- 목록은 각각 최대 50개이며 초과 여부를 표시한다. 서버의 개인정보·권한 판단을
  Edge/BFF가 대체하지 않는다. 응답은 `no-store, private`다.
- 변경 요청은 같은 origin의 POST, 세션, CSRF, request/trace metadata를 필요로 한다.
  Core에서 사용자 잠금 후 세션 유효성을 재확인하고 대상의 사용자·개인 계정 일치를
  확인한다. 세션·갱신 family·access credentials 폐기와 원문 없는 감사는 한 트랜잭션이다.
  이미 폐기된 본인의 동일 대상은 성공으로 처리한다. 다른 계정·현재 세션은 거절한다.
- 선택 동의 철회는 기존 `POST /v1/account-settings/preferences`의
  `{birth_year:null, interests:[]}`를 사용한다. 값 삭제와 철회 감사가 함께 완료된다.
  필수 약관 철회를 임의의 토글로 구현하지 않는다.
- 400 잘못된 입력, 401 만료/무효 세션, 403 권한/CSRF/현재 세션 대상,
  404 대상 없음, 503 조회·저장 불가. Edge는 원문 오류와 식별자를 전달하지 않는다.
