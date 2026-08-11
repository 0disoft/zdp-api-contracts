# Abuse Challenge Contract

## 목적

공개 쓰기의 자동화 비용을 높이는 challenge를 제품 구현과 provider SDK shape에서 분리한다. 이 계약은
provider-neutral issue/redeem, 제품 서버용 verify, 운영 health와 짧은 수명의 단회 verification receipt를
정의한다. 실제 provider adapter, Valkey, rate limiter와 제품 transaction은 이 저장소가 구현하지 않는다.

## 호출 경계

- 브라우저는 `/v1/abuse/challenges`에서 challenge를 발급하고
  `/v1/abuse/challenges/{challenge_ref}/redeem`에서 solution을 제출한다.
- 제품 서버만 `/internal/v1/abuse/verifications/verify`에서 verification receipt, 안정적인
  `consumer_operation_ref`와 정확한 `product_ref`, `environment`, `action`을 함께 검증한다.
- verify 성공은 receipt를 최초 consumer operation에 한 번 소비한다. 같은 operation ref의 재호출에는
  이전 성공을 replay하고, 다른 operation ref, 만료, binding mismatch와 불명확한 상태는 fail closed한다.
- provider 검증 성공은 먼저 durable `verified` 상태와 receipt key ID로 기록한다. Receipt 최종화 또는
  응답이 유실되면 같은 idempotency key, normalized input과 exact binding의 challenge redeem만 provider를
  다시 호출하지 않고 canonical 성공을 복구한다. 다른 key, solution input이나 binding은 bearer receipt를
  받을 수 없다.
- `/internal/v1/abuse/health`는 인증된 운영·서비스 경로에만 안전한 상태 projection을 제공한다.

## 권위 분리

Challenge 성공은 사용자의 신원, 권한, 결제 성공 또는 제품 domain action 완료를 증명하지 않는다.
제품 API는 challenge verify와 제품 transaction에 같은 `consumer_operation_ref`를 사용하고, 자기
인증·권한·입력 검증·rate limit·durable idempotency와 transaction을 독립적으로 수행한다. Public read와
unrelated authenticated flow는 challenge provider 장애 때문에 함께 닫지 않는다.

## Provider와 개인정보 경계

제품과 SDK에는 provider payload, provider error 또는 provider management surface를 노출하지 않는다.
Adapter는 `issue`, `verify`, `health`와 안전하게 정규화된 실패만 구현한다. Challenge solution과
verification receipt는 plaintext 저장·로그·trace·metric label·오류 응답에 남기지 않는다. Raw IP,
browser fingerprint, challenge program과 request body도 runtime customer truth로 저장하지 않는다.

## 상태와 재시도

Challenge와 verification receipt는 TTL state이며 customer truth가 아니다. Receipt 수명은 challenge 또는
제품 요청 window보다 길 수 없고 exact product/environment/action과 redemption에 묶인다. 같은
idempotency key와 같은 normalized binding만 기존 결과를 replay하며 다른 binding은 conflict로 거부한다.
`consumer_operation_ref`는 secret, 개인 식별자 또는 request body가 아닌 opaque operation identity여야 하며,
제품 transaction의 durable idempotency record와 동일한 값으로 유지한다.
Verification receipt는 challenge ref, claim version, exact binding과 key ID에 묶인 keyed deterministic
derivation을 사용한다. Runtime은 key ID와 receipt digest만 TTL 상태에 저장하며 receipt plaintext나
derivation key는 저장·로그·응답 재료 외 surface에 남기지 않는다.
