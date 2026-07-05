# SDK Generation Input

SDK generation input은 downstream SDK 저장소가 API 계약을 같은 방식으로 읽게 하는 handoff다. generated SDK source 자체가 아니다.

## Source Contracts

- route contract
- error envelope
- webhook contract
- API catalog
- service-specific route catalogs

## Required Client Runtime Metadata

- typed fetch operation map
- standard error envelope normalization
- request id propagation
- trace id propagation
- timeout option
- abort signal option
- idempotency key requirement for mutations

## Forbidden Ownership

- generated SDK source
- SDK runtime implementation
- product business logic
- refresh token storage
- final authorization decision
- provider credential storage

새 language target은 먼저 allowed list에 넣고, generation target으로 승격할 때 downstream owner와 runtime boundary를 같이 확인한다.
