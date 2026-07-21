# API Catalog

이 디렉터리는 개별 서비스의 실제 API route 정의를 받기 위한 자리다.

현재는 live endpoint나 public base URL을 확정하지 않는다. 서비스별 route가 생기면 `catalog.yaml`의 `routes`에 `route_contract.required_per_route`와 `sdk_generation_input.required_route_metadata`가 요구하는 필드를 모두 채운다.

첫 active catalog는 `core-api` auth/session과 access-decision route 계약이다. 이 계약은 실제 로그인·정책 서버 구현이 아니라 `zdp-web-apps`와 제품 backend가 route를 열기 전에 필요한 session effect, passkey challenge, OAuth callback, credential policy, request/trace propagation과 Core 소유 authorization 경계를 고정한다.

`core.auth.sessions.get_current`는 identity-only 조회다. `core.access.authorization_decisions.create`가 verified current session과 정확한 product/action/resource/scope를 묶은 allow/deny 판정을 별도 리소스로 만든다. consent receipt, client role 또는 current-session 응답을 최종 authorization으로 재해석하지 않는다.

`core-api/sensitive-action-authorization.yaml`은 route catalog에 연결되지 않은 contract-only schema
family다. Opaque receipt의 exact binding과 issuer/audience 상태를 고정하지만 issue, completion,
verify endpoint 또는 제품별 권한 handler를 활성화하지 않는다.

생성된 OpenAPI, SDK source, published docs artifact는 이 디렉터리에 넣지 않는다.
