# 웹 제품 OIDC 로그인 handoff 계약

## 상태

이 문서는 `proposed-contract`다. 실제 authorization server, token endpoint, client provisioning API,
제품 BFF session store 또는 production DNS가 준비됐다는 뜻이 아니다.

## 표준 프로파일

웹 제품 로그인은 독자적인 일회용 코드 규격을 만들지 않는다. OpenID Connect Authorization Code
Flow를 사용하고 OAuth 2.0 Security Best Current Practice인 RFC 9700을 보안 기준으로 둔다. PKCE는
S256만 허용한다. OAuth 2.1은 아직 최종 RFC가 아니므로 구현 방향을 설명하는 draft profile로만
참조한다.

브라우저는 중앙 계정 issuer의 authorization endpoint로 이동하고, 중앙 계정 서비스는 사전에 등록된
callback URI로 authorization code만 돌려보낸다. 제품 BFF가 token endpoint에서 code와 PKCE verifier를
교환한다. access token, refresh token과 ID token을 URL, localStorage 또는 브라우저에서 읽을 수 있는
cookie에 넣지 않는다.

## 중앙 client registry

제품마다 환경별 `client_id`, 정확한 redirect URI와 logout URI, 허용 scope와 audience, client type,
token endpoint 인증 방식, JWKS reference, 상태, session·revocation policy reference를 중앙 registry에
등록한다. 요청이 보낸 임의 callback이나 `return_to`를 신뢰하지 않는다. wildcard redirect URI와
제품별 환경변수를 client 등록의 최종 정본으로 쓰지 않는다.

## 제품 세션 경계

제품 BFF는 해당 제품 host에서만 유효한 opaque `HttpOnly`, `Secure`, `SameSite` session binding만
브라우저에 발급한다. 중앙 account cookie를 제품에 전달하거나 한 제품 cookie를 다른 제품에서 재사용하지
않는다. 제품 BFF는 credential, 중앙 session, stable account 또는 권한 정본이 아니다.

로그인 성공은 제품 권한 허가가 아니다. 보호된 작업은 Core Access가 검증된 subject와 정확한 product,
tenant, resource, action, policy version을 사용해 다시 판단한다. 중앙 session 폐기, 계정 정지·삭제,
credential 침해 또는 product client 비활성화가 발생하면 제품 session binding도 빠르게 무효화해야 한다.

## 아직 확정하지 않는 것

- staging Proposed 값을 production에 그대로 승격할지 여부
- client 등록·회전·폐기 관리자 API
- 제품 BFF의 실제 배포 저장소와 session store 구현
- 외부 identity provider를 staging에 여는 순서

정본 데이터는 `contracts/apis/core-api/oidc-product-session.yaml`에 있다.
첫 staging client와 runtime 후보는 `oidc-client-registry.yaml`, `oidc-provider-runtime.yaml`에 있으며
구체적인 설명은 `oidc-client-registry-and-runtime.md`를 따른다.

## 표준 참고 문서

- [OAuth 2.0 Security Best Current Practice (RFC 9700)](https://www.rfc-editor.org/rfc/rfc9700.html)
- [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0-18.html)
