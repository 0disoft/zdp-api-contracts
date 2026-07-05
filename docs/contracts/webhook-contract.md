# Webhook Contract

Webhook contract는 이벤트 수신자가 재처리, 중복 수신, 실패 큐를 추측하지 않게 하는 handoff다.

## Required Metadata

- event id
- event type
- schema version
- signature verification
- idempotency key
- replay policy
- dead-letter policy

## Boundaries

- raw provider payload는 표준 webhook schema가 아니다.
- webhook secret은 예시에 넣지 않는다.
- replay와 dead-letter는 운영 문구가 아니라 계약 필드로 남긴다.
- SDK와 downstream handler는 webhook metadata를 route prose에서 추출하지 않는다.
