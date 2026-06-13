# API Catalog

이 디렉터리는 개별 서비스의 실제 API route 정의를 받기 위한 자리다.

현재는 live endpoint나 public base URL을 확정하지 않는다. 서비스별 route가 생기면 `catalog.yaml`의 `routes`에 `route_contract.required_per_route`와 `sdk_generation_input.required_route_metadata`가 요구하는 필드를 모두 채운다.

첫 active catalog는 `core-api` auth/session route 계약이다. 이 계약은 실제 로그인 서버 구현이 아니라 `zdp-web-apps`가 auth route를 열기 전에 필요한 session effect, passkey challenge, OAuth callback, credential policy, request/trace propagation 경계를 고정한다.

생성된 OpenAPI, SDK source, published docs artifact는 이 디렉터리에 넣지 않는다.
