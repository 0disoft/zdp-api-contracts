# 현재 개인 계정 scope 조회

`GET /v1/accounts/personal-scope/current`는 Core가 현재 세션과 계정 소유 관계를 확인한
scope snapshot을 반환한다. `personal_account_ref`를 얻는 조회이며 매장 접근 허가는 아니다.

- private BFF는 Core current-session 설정의 access-session cookie만 전송한다. Bearer 혼용,
  중복 Cookie, Origin, query, GET body와 요청 측 subject/tenant/scope 주장은 거부한다.
- `X-Request-ID`, `X-Trace-ID`는 각각 160 byte 이하의 비어 있지 않은 ASCII 식별자다.
  영숫자와 `.`, `_`, `:`, `-`만 허용하며 대소문자와 무관한 중복 header를 거부한다.
- 200은 schema의 5개 필드만 담은 직접 JSON 객체다. 개인 계정은 검증된 subject의 소유 관계로
  조회하며 tenant ID나 현재 workspace를 재사용하지 않는다. `expires_at`은 credential과
  parent session 중 이른 만료 시각의 UTC RFC3339 표현이다. 식별자 상한은 160 UTF-8 byte다.
- 세션·사용자·계정 조회와 redacted `core.accounts.personal_scope.read` 감사 append는 같은
  transaction에서 성공해야 한다. 감사 기록에는 검증된 사용자·tenant·session·개인 계정과
  요청 correlation만 넣고 cookie·credential hash·raw body·DB 오류는 포함하지 않는다.
- 재조회는 현재 상태를 다시 확인하고 별도 감사 event를 append한다. 과거 snapshot을 replay하지
  않으며 grant나 role assignment를 생성하지 않는다.
- 401 `authentication_failed`는 credential 누락·만료·폐기, 비활성 사용자·계정, 소유 계정 누락을
  구분해 노출하지 않는다. 잘못된 입력/metadata는 400, 조회·감사·commit 실패는
  503 `scope_lookup_unavailable`다. 오류는 공통 error envelope를 사용한다.
- 모든 처리 응답은 `Cache-Control: no-store`, `Pragma: no-cache`, 두 correlation header를
  포함한다. 잘못된 correlation 값은 Core가 만든 안전한 ID로 대체한다. 응답 상한은 8 KiB다.

소비자는 현재 로그인 세션과 subject/tenant/session binding을 대조한다. 조회 결과의 존재만으로
출석을 허용하지 않고 최종 authorization decision과 Orchid transaction guard를 모두 요구한다.
계약 등록은 운영 route 활성화나 방문자 permission 등록을 승인하지 않는다.
