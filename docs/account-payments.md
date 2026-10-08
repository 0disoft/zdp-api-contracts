# 개인 계정 현금 결제 내역 v1

Money 소유의 private `GET /v1/account/payments` 읽기 모델이다. Web 계정 BFF는
route 없는 Edge `AccountPaymentsGatewayEntrypoint`를 service binding으로 호출한다.
계정·tenant·권한 값은 브라우저에서 선택하지 않으며, Money가 Core 세션으로
개인 계정 소유권을 매번 확인한다. 조직 청구·결제 실행·환불 요청은 포함하지 않는다.

쿼리는 선택적 `cursor=pay_<64자리 소문자 hex>` 하나이며 페이지는 최대 25건이다.
응답은 정확히 `schema_version: money.account-payments.v1`, `items`, `next_cursor`다.
다음 페이지가 있으면 마지막 항목 ID가 `next_cursor`이고, 없으면 null이다.
시각 내림차순과 ID 내림차순을 함께 사용하며 커서는 현재 소유 계정에 한정한다.

각 항목은 정확히 다음 13개 필드다.

- `id`: `pay_`와 64자리 소문자 hex. provider 주문번호가 아닌 표시용 ID.
- `kind`: `lemon_topup`, `lemon_auto_topup`, `doubloon_purchase`.
- `occurred_at`: UTC 밀리초 ISO, `YYYY-MM-DDTHH:mm:ss.SSSZ`.
- `currency`: 현재 `USD`만 지원.
- `amount_minor`, `tax_minor`, `refunded_minor`: 64비트 비음수 정수의 정규 십진 문자열. 청구액은 양수이며 세금과 성공 환불액은 청구액 이하.
- `payment_method`: `card`, `bank`, `wallet`, `crypto_invoice`, `manual_provider_reference`.
- `payment_status`: `pending`, `paid`, `failed`, `cancelled`, `expired`, `review_required`, `partially_refunded`, `refunded`.
- `fulfillment_status`: `pending`, `fulfilled`, `failed`, `review_required`, `unconfirmed`.
- `quantity`: 실제 지급 증거가 있는 양의 정수 문자열, 없으면 null.
- `quantity_unit`: 레몬은 `credit_unit` (1레몬=1,000단위), 두블룬은 `doubloon`.
- `receipt_url`: 현재 null. provider 증빙 정본을 연결하기 전 임의 링크를 반환하지 않는다.

결제 상태와 지급 상태는 독립이며 이미 지급한 결제에도 분쟁·환불이 생길 수 있다.
`refunded`는 환불액=청구액, `partially_refunded`는 0<환불액<청구액이다.
`review_required`는 성공 환불액을 유지할 수 있다. 나머지 결제 상태의 환불액은 0이다.
`fulfilled`의 수량은 양수이고 다른 지급 상태의 수량은 null이다. 새 지급을 허용하는
명령이나 provider SDK 계약이 아니다.

오류는 400 `invalid_request`, 401 `authentication_failed`, 503 `payments_unavailable`이다.
모든 Money/Edge 응답과 계정 페이지는 no-store다. 비밀, 결제 원문, 내부 소유자 ID,
provider 참조를 화면에 반환하거나 로그로 기록하지 않는다. 연결 누락·조회 실패를
빈 결제 내역으로 표현하지 않는다. UI의 시각은 방문자 시간대에서 변환한다.

현재 Money 구현은 레몬 결제 시도·성공 환불과 checkout/원장 지급 증거를 읽는다.
두블룬 구매는 wire 종류만 예약되어 있고 저장 원천과 운영 활성화는 별도다.
