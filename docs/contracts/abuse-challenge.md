# Abuse Challenge Contract

## 목적

공개 쓰기의 자동화 비용을 높이는 challenge를 제품 구현과 provider SDK shape에서 분리한다. 이 계약은
provider-neutral issue/redeem, 제품 서버용 verify, 운영 health와 짧은 수명의 단회 verification receipt를
정의한다. 실제 provider adapter, Valkey, rate limiter와 제품 transaction은 이 저장소가 구현하지 않는다.

## 호출 경계

- 브라우저는 `/v1/abuse/challenges`에서 challenge를 발급하고
  `/v1/abuse/challenges/{challenge_ref}/redeem`에서 solution을 제출한다.
- 제품 서버만 `/internal/v1/abuse/verifications/verify`에서 verification receipt와 정확한
  `product_ref`, `environment`, `action`을 함께 검증한다.
- verify 성공은 receipt를 한 번 소비한다. 만료, replay, binding mismatch와 불명확한 상태는
  challenge-required 제품 쓰기에서 fail closed한다.
- `/internal/v1/abuse/health`는 인증된 운영·서비스 경로에만 안전한 상태 projection을 제공한다.

## 권위 분리

Challenge 성공은 사용자의 신원, 권한, 결제 성공 또는 제품 domain action 완료를 증명하지 않는다.
제품 API는 challenge verify 뒤에도 자기 인증·권한·입력 검증·rate limit·durable idempotency와 transaction을
독립적으로 수행한다. Public read와 unrelated authenticated flow는 challenge provider 장애 때문에 함께
닫지 않는다.

## Provider와 개인정보 경계

제품과 SDK에는 provider payload, provider error 또는 provider management surface를 노출하지 않는다.
Adapter는 `issue`, `verify`, `health`와 안전하게 정규화된 실패만 구현한다. Challenge solution과
verification receipt는 plaintext 저장·로그·trace·metric label·오류 응답에 남기지 않는다. Raw IP,
browser fingerprint, challenge program과 request body도 runtime customer truth로 저장하지 않는다.

## 상태와 재시도

Challenge와 verification receipt는 TTL state이며 customer truth가 아니다. Receipt 수명은 challenge 또는
제품 요청 window보다 길 수 없고 exact product/environment/action과 redemption에 묶인다. 같은
idempotency key와 같은 normalized binding만 기존 결과를 replay하며 다른 binding은 conflict로 거부한다.
