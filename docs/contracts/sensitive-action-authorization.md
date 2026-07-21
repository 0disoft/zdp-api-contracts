# 민감 행위 authorization receipt 계약

`contracts/apis/core-api/sensitive-action-authorization.yaml`은 최근 인증 assurance와 Core access의
플랫폼 정책 결정을 exact product, action, resource에 묶는 opaque receipt family다. 현재는
contract-only이며 issue, completion, verify route를 선언하거나 live endpoint를 활성화하지 않는다.

## 합성 권한 경계

민감 행위는 다음 두 조건을 모두 요구한다.

1. Core가 receipt의 issuer state, freshness, session generation, policy revision과 exact binding을
   server-to-server로 검증한다.
2. audience 제품이 자기 정본에서 actor와 resource 관계 및 현재 상태를 다시 확인한다.

receipt는 제품 도메인 guard를 대신하지 않고, 제품 guard도 fresh ZDP 인증을 대신하지 않는다.
Core는 제품별 매장·기기·주문 관계를 소유하거나 검증했다고 주장하지 않는다.

## 상태와 소비

Core issuer 상태는 `active`, `expired`, `revoked`이고 `expired`와 `revoked`는 terminal이다. Audience
소비 상태는 `unused`, `consumed`이고 `consumed`가 terminal이다. 둘을 하나의 분산 transaction으로
표현하지 않는다.

Audience 제품은 `receipt_ref`에 durable unique constraint를 두고 receipt 소비, domain mutation,
idempotency 결과와 sanitized audit을 자기 business transaction에서 함께 commit한다. Core 검증 뒤
제품 transaction이 실패하면 소비 기록을 남기지 않고, 재시도 때 Core state와 제품 guard를 다시
검증한다.

## Orchid Pass 첫 consumer

분실 기기 키 복구는 exact device credential recovery action과 store/device resource에 receipt를
묶는다. Orchid는 active owner/store/device 관계를 transaction 안에서 재확인하고 receipt를 recovery
grant, 기존 credential 전체 revoke, replacement 생성, audit와 idempotency와 함께 한 번만 소비해야
한다.

공용 issue/verify runtime과 route promotion이 별도 검토를 통과하기 전에는 Orchid recovery input,
transaction 또는 HTTP route를 활성화하지 않는다.
