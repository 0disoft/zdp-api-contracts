# 공통 계정 설정 overview

`GET /v1/account-settings/overview`는 공통 설정 shell이 첫 화면을 구성하는 데 필요한 읽기 전용 요약 계약이다. 현재 session을 다시 검증한 Core만 응답을 만들며, 클라이언트가 `actor_ref`, `workspace_ref`, 역할이나 권한을 요청 값으로 제출하지 않는다.

응답은 account, 현재 workspace, 현재 session, 연결된 제품 요약과 알림 선호를 한 번에 제공한다. 연결 제품과 알림 항목은 `unavailable` 상태를 표현할 수 있어 일부 owner가 준비되지 않았을 때 UI가 권위값을 추정하지 않는다.

이 route는 최종 authorization, account 수정, workspace 전환, session 폐기, 제품 연결 해제 또는 알림 변경을 수행하지 않는다. 각 mutation은 별도 operation과 owner 검증 계약이 생기기 전까지 비활성이다.

응답에는 password, token, credential, provider payload, 내부 역할 원문, 제품 DB row 또는 화면 컴포넌트 payload를 넣지 않는다.
