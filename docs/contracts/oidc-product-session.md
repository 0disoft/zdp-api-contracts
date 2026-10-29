# 웹 제품 OIDC 로그인 handoff 계약

## 상태

이 문서는 `proposed-contract`다. 실제 authorization server, token endpoint, client provisioning API,
제품 BFF session store 또는 production DNS가 준비됐다는 뜻이 아니다.
refresh token opt-in 역시 local proposed 계약과 account BFF 경계일 뿐 Core·Edge 배포나 active
client 승격이 아니다.

## 표준 프로파일

웹 제품 로그인은 독자적인 일회용 코드 규격을 만들지 않는다. OpenID Connect Authorization Code
Flow를 사용하고 OAuth 2.0 Security Best Current Practice인 RFC 9700을 보안 기준으로 둔다. PKCE는
S256만 허용한다. OAuth 2.1은 아직 최종 RFC가 아니므로 구현 방향을 설명하는 draft profile로만
참조한다.

브라우저는 중앙 계정 issuer의 authorization endpoint로 이동하고, 중앙 계정 서비스는 사전에 등록된
callback URI로 authorization code만 돌려보낸다. 제품 BFF가 token endpoint에서 code와 PKCE verifier를
교환한다. access token, refresh token과 ID token을 URL, localStorage 또는 브라우저에서 읽을 수 있는
cookie에 넣지 않는다.

## Refresh token opt-in

`refresh_token` grant는 모든 client의 기본값이 아니다. 중앙 registry entry의
`allowed_grant_types`에 `refresh_token`이 명시된 client만 사용할 수 있다. 기존
`zdp-web-public-staging`은 `authorization_code`만 유지한다.

token endpoint 요청은 두 가지 정확한 모양만 허용한다.

- `authorization_code`: `client_id`, `grant_type`, `redirect_uri`, `code`, `code_verifier`,
  `client_assertion_type`, `client_assertion`
- `refresh_token`: `client_id`, `grant_type`, `refresh_token`, `client_assertion_type`,
  `client_assertion`. `redirect_uri`, `code`, `code_verifier`를 섞지 않는다.

두 모양 모두 중복 field, 빈 값, 미승인 field와 다른 grant와의 혼합을 거부한다. refresh는
`private_key_jwt` client assertion을 다시 검증하며 `unauthorized_client`, `invalid_grant`,
`invalid_client`, `invalid_request`로 실패할 수 있다.

초기 code 교환과 refresh 응답의 access/ID token 수명은 5분이다. opt-in client의 초기 응답에는
`refresh_token`과 `refresh_expires_in`이 선택적으로 추가되고, refresh 응답에는 둘 다 포함된다.
`refresh_expires_in`은 중앙 SSO 세션의 남은 수명과 12시간 중 짧은 쪽이며, refresh token은 매 교환마다
회전한다. 제품 BFF만 값을 다루고 브라우저·URL·localStorage·읽을 수 있는 cookie에 노출하지 않는다.
revoke의 `token_type_hint`는 `access_token`과 `refresh_token`을 허용하지만 introspect는
`access_token`만 허용한다. 회전되어 consumed가 된 refresh handle도 만료 전까지 조회해 그 handle을
발급한 중앙 SSO 세션을 폐기한다. 이 lookup·폐기는 local proposed Core 구현이며 배포 증거가 아니다.

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
- refresh token의 Core·Edge staging 배포와 실제 발급 증거

정본 데이터는 `contracts/apis/core-api/oidc-product-session.yaml`에 있다.
첫 staging client와 runtime 후보는 `oidc-client-registry.yaml`, `oidc-provider-runtime.yaml`에 있으며
구체적인 설명은 `oidc-client-registry-and-runtime.md`를 따른다.

## 표준 참고 문서

- [OAuth 2.0 Security Best Current Practice (RFC 9700)](https://www.rfc-editor.org/rfc/rfc9700.html)
- [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0-18.html)
