# 공통 귤 충전 계약

이 계약은 여러 제품이 같은 귤 지갑과 함선 팩을 사용하더라도 가격표, 결제 성공 판정, 크레딧 지급을 제품마다 다시 구현하지 않게 하는 Money API 경계다. 현재 상태는 `contract-only`이며 live endpoint, 결제 제공자, 공개 base URL을 활성화하지 않는다.

GET operation은 idempotency metadata가 없는 `credit-purchase-read.yaml`, mutation operation은 idempotency key를 요구하는 `credit-purchase.yaml` schema bundle을 사용한다. 결제 의미 규칙의 정본은 `credit-purchase.yaml#credit_purchase`다.

## 작업별 계약

| operation | 역할 |
| --- | --- |
| `money.credit_pack_catalog_projections.get` | 제품·scope·환경·locale에 맞는 판매 가능 함선 팩 projection을 읽는다. |
| `money.credit_checkout_intents.create` | 등록된 복귀 대상과 선택한 함선 tier를 Money가 다시 검증하고 immutable snapshot reference를 만든다. |
| `money.credit_checkout_intents.status.get` | 결제와 귤 지급을 분리한 현재 상태를 읽는다. |
| `money.credit_checkout_return_receipts.exchange` | 짧은 수명의 일회용 복귀 receipt를 제품 BFF가 교환한다. |

제품이 intent에 보내는 값은 `product_ref`, `ship_tier_id`, account 또는 organization scope, `environment`, `locale`, `return_target_id`뿐이다. 금액, 통화, 지급 귤, 보너스 귤, 세금은 클라이언트 권위값으로 받지 않는다. Money가 catalog, account eligibility, risk, provider capability를 다시 읽어 가격·세금·혜택 snapshot을 고정한다.

## 상태와 성공 판정

checkout 상태는 다음 값을 사용한다.

- 진행 중: `created`, `payment_pending`, `credit_issuance_pending`, `review_required`
- 종료: `completed`, `failed`, `cancelled`, `expired`

브라우저 success redirect는 결제 증거가 아니다. 완료 근거는 서명 검증된 provider webhook, provider 상태 재조회 또는 reconciliation뿐이다. 결제가 확인돼도 원장 지급이 끝나지 않았으면 `credit_issuance_pending`으로 남겨 거짓 성공을 만들지 않는다. provider timeout 같은 미확정 결과는 실패로 단정하지 않고 pending 또는 review 상태에서 reconciliation을 기다린다.

## 복귀와 식별자

복귀 대상은 제품이 보낸 임의 URL이 아니라 환경별 Product Registry에 exact 등록된 `return_target_id`만 허용한다. URL에는 provider token, payment credential, 중앙 session, 원본 price snapshot을 넣지 않는다. 복귀 receipt는 짧은 수명의 opaque 일회용 값이며 제품 BFF에서만 교환하고 평문 저장·응답 echo를 금지한다.

`checkout_intent_ref`, stable `operation_ref`, payment attempt, provider object, ledger issuance, return receipt는 서로 다른 식별자로 유지한다. 같은 idempotency key와 같은 normalized binding은 기존 결과를 재생하고, 다른 binding에서 같은 key를 쓰면 conflict로 거부한다.

제품은 receipt 교환 또는 `completed` 상태 확인 뒤 Money 잔액을 다시 읽는다. receipt나 status response를 제품 로컬 잔액 정본으로 저장하거나 자체적으로 귤을 지급하면 안 된다.

## 현재 제외

- live 결제 handler와 provider adapter
- 카드·계좌 정보와 provider credential
- 제품별 pricing 화면 payload
- 함선 가격, 지급량, 보너스, 세율의 하드코딩
- checkout 성공 redirect 기반 지급
- 임의 return URL과 popup 기본 흐름
