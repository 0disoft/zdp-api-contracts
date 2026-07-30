# OIDC client registry와 첫 staging runtime

이 문서는 제품 웹 로그인 계약의 첫 번째 구체화다. 둘 다 `proposed-contract`이며 실제 endpoint,
DNS, key, session store 또는 배포가 준비됐다는 뜻이 아니다.

## 중앙 registry 운영 계약

Core identity가 환경별 registry의 정본을 소유한다. 제품 저장소의 환경변수나 배포 설정은 registry를
복제한 projection일 수 있지만 `client_id`, callback, scope, audience 또는 상태를 독자적으로 확정할 수
없다. staging과 production 항목은 서로 섞지 않으며 retired `client_id`는 tombstone으로 보존하고 다시
사용하지 않는다.

registry와 각 client entry는 revision을 가진다. 변경은 현재 revision을 확인하는 compare-and-swap과
감사 receipt를 함께 요구한다. 경쟁하는 두 변경 중 먼저 반영된 변경만 성공하고, 뒤늦은 변경은 최신
registry를 다시 읽어 재검토해야 한다. `last write wins`로 callback이나 keyset 변경을 덮어쓰지 않는다.

client 상태는 `disabled`, `active`, `suspended`, `retired` 네 가지다.

- `disabled → active`: 활성화 요구사항과 검토 receipt가 모두 필요하다.
- `active → suspended`: 보안·운영 사유와 session/token revocation receipt가 필요하다.
- `suspended → active`: 문제 해결 증거와 재활성화 검토 receipt가 필요하다.
- `disabled|suspended → retired`: 폐기 사유와 감사 receipt가 필요하다.
- `retired`는 terminal state이며 되돌리지 않는다.

`active`가 아닌 client는 새 authorization과 token exchange를 허용하지 않는다. callback, logout URI,
scope, audience, token endpoint 인증 방식, JWKS, session·revocation policy 또는 BFF 경계를 바꾸면 보안
민감 변경으로 감사하고 재활성화 증거를 다시 확인한다. `client_id`, product, environment와 client type은
수정하지 않고 기존 항목을 retire한 뒤 새 client를 등록한다.

모든 web client는 Authorization Code Flow, response type `code`, PKCE `S256`만 허용한다. callback과
logout URI는 wildcard, credential, fragment가 없는 exact HTTPS URI여야 한다. client ID 중복, registry와
다른 environment, revision 없는 변경, 평문 secret/key material은 검증 단계에서 거부한다.

## 첫 client fixture

`zdp-web-public`은 현재 정적 사이트이므로 OIDC callback과 token 교환을 처리할 수 없다. registry에는
`zdp-web-public-staging`을 정확한 callback URI와 함께 등록하되 상태를 `disabled`로 유지한다. 실제
callback은 별도 제품 BFF 후보가 처리해야 한다.

활성화하려면 다음 증거가 모두 필요하다.

- staging 제품 BFF 배포
- staging hostname과 TLS 검증
- 평문 client secret 없는 `private_key_jwt` key 등록
- exact callback과 logout smoke
- 중앙 session revocation 전파 smoke
- Core Access deny smoke

실제 활성 상태는 위 증거를 가리키는 `activation_evidence_refs`가 있어야 한다. 요구사항 목록만 채운 것은
배포·검증 증거가 아니다. 현재 fixture의 목록은 비어 있으므로 `disabled`가 맞다.

정적 사이트에 callback handler를 추가하거나 등록되지 않은 `return_to`, wildcard callback, production
hostname을 fixture에 섞지 않는다.

## 첫 runtime profile

첫 파일럿은 `account.staging.8ailors.xyz`에만 적용한다. authorization code는 60초 동안 한 번만 사용할 수
있고, opaque random value의 hash만 저장하며 원자적으로 consume한다. access token과 ID token은 5분,
refresh token은 첫 파일럿에서 발급하지 않는다.

제품 BFF는 `private_key_jwt`로 token endpoint에 인증한다. client assertion은 RS256, 60초 TTL,
단일 사용 `jti`를 요구하고 `iss`와 `sub`는 `client_id`, `aud`는 정확한 token endpoint에 결박한다.
private key는 registry나 계약 파일에 저장하지 않는다.

서명은 호환성이 넓은 RS256을 첫 후보로 두고 30일 회전, 이전 key 24시간 검증, JWKS 5분 cache를
제안한다. 중앙 session은 idle 14일, absolute 30일이며 제품 session binding은 이를 넘을 수 없다.
민감 작업은 최근 15분 이내 fresh check가 필요하고, revocation stale window는 최대 60초다.

이 숫자는 production 확정값이 아니다. staging 장애·replay·revocation·key rotation 증거를 남긴 뒤 ADR
승격 과정에서 조정한다.

## 인증과 권한의 분리

OIDC 로그인은 subject를 검증할 뿐 제품 기능 권한을 부여하지 않는다. 제품의 보호된 action은 Core
Access가 `subject + product + tenant + resource + action + policy version`으로 다시 판단한다. Core
Access나 session truth가 unavailable이면 제품 BFF는 성공을 꾸미지 않고 fail closed한다.

## 정본

- `contracts/apis/core-api/oidc-client-registry.yaml`
- `contracts/apis/core-api/oidc-provider-runtime.yaml`
- `contracts/apis/core-api/oidc-product-session.yaml`
