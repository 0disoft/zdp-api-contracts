# 비공개 선택 프로필

Core의 `GET/POST /v1/account-settings/preferences`는 현재 세션 본인의 선택 정보를
조회·교체한다. 본인 식별자를 body로 받지 않으며, browser는 계정 BFF와 private Edge
binding을 사용한다. mutation에는 cookie-bound CSRF 입장과 request/trace 식별자가 필요하다.

POST body는 `birth_year`와 `interests` 두 필드만 허용한다. 전체 교체이며
`{"birth_year":null,"interests":[]}`는 선택 정보를 삭제한다. 같은 값을 다시 저장해도
결과 상태는 동일하다. mutation에 `idempotency-key`를 보내며 같은 세션·키·내용의
재시도는 감사 중복 없이 204, 같은 키로 내용을 바꾸면 409다. 새 저장 작업에는 새 키를 쓴다.
원문 없이 HMAC fingerprint만 보관하며 24시간 재시도 기한 뒤 다음 저장 때 정리하고
탈퇴 시 삭제한다. request id는 요청마다 새로 만든다.
성공은 body 없는 204, 조회는 200이다. 런타임 오류는 400/401/403/413/503의
`preferences_request_failed` 또는 gateway의 redacted 오류로 반환하며 원문을 노출하지 않는다.

출생연도는 1900~서버 현재 연도, 관심사는 catalog v1의 서로 다른 항목 최대 8개다.
기존 계정은 출생연도가 없으면 unknown으로 반환한다. 연도 차이가 14/19이면
생일을 알 수 없어 needs_confirmation이다. `age_verified`는 항상 false다.
선택 정보를 지우면 자기신고도 사라진다. 이 조회로 성인 전용 기능이나 결제 자격을 부여하지 않는다.

조회 원문은 응답 외에 공개 프로필·OIDC claims·analytics·감사 로그에 추가하지 않는다.
변경 감사는 `core.account.preferences.updated`이며 값 없이 변경 사실만 남긴다.
선택 데이터는 계정 탈퇴 완료 트랜잭션에서도 삭제한다. 가입의 만 14세 이상 자기신고
기록은 이 선택 프로필과 별개이며 출생연도 변경으로 덮어쓰지 않는다.

GET read hook은 계약에 선언되어 있고 변경 감사와 별도로 Core가 redacted receipt만 저장한다.
소스와 계약의 추가는 migration 적용·배포·활성화 증거가 아니다.
