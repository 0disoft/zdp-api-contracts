# SECURITY.md

## 보안 경계

`zdp-api-contracts`는 API route, error envelope, webhook, SDK generation handoff 계약을 소유한다. 이 저장소는 live endpoint, provider credential, 고객 데이터, 인증 토큰, 결제 secret, webhook secret의 원천이 아니다.

## 금지 항목

다음 값은 계약, 예시, 테스트 fixture, 문서, package output에 넣지 않는다.

- 실제 access token, refresh token, session cookie
- 실제 API key, OAuth client secret, webhook secret
- 실제 고객 식별자, 이메일, 전화번호, 결제 식별자
- provider raw response 전문
- 내부 운영 URL, private dashboard URL, secret-bearing callback URL
- stack trace, SQL, upstream error body처럼 공개 오류에 노출되면 안 되는 값

## 신고 기준

아래 변경은 보안 리뷰가 필요하다.

- 공개 API 오류 envelope가 `request_id`, `trace_id`, 안정적인 error code 없이 바뀌는 경우
- request schema의 secret field가 response schema로 되돌아갈 수 있는 경우
- webhook 계약이 signature, idempotency, replay 방어, dead-letter 기준을 잃는 경우
- SDK generation input이 authorization header, raw credential, provider secret을 생성 대상으로 넘기는 경우

## 신고 방법

공개 issue에는 secret이나 실제 고객 데이터를 쓰지 않는다. 재현에는 synthetic value를 사용하고, 민감값이 포함된 사고는 maintainer에게 비공개 채널로 먼저 전달한다.

