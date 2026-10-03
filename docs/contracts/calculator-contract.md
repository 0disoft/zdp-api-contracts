# Calculator Contract

`contracts/calculators/catalog.yaml`은 여러 제품이 함께 소비하는 계산기 정의의 원천이고 `contracts/calculators/conformance.yaml`은 구현체가 같은 답과 오류를 내는지 확인하는 공통 적합성 벡터다. 둘 다 계산 함수를 실행하거나 사용자 화면을 설명하지 않는다.

## 소유하는 의미

- 언어와 무관한 안정 계산기 ID
- contract version과 호환 engine version
- jurisdiction과 lifecycle status
- 표준 입력·결과 field, 값 종류, 단위 차원과 단위 정책
- 안정 오류 코드
- 계산 공식이 지켜야 할 semantic rule ID
- 구현 전에 확정해야 하는 precision과 rounding policy
- 계약 버전과 연결된 성공·오류 적합성 벡터

## Reviewed 정의 묶음

- `percentage-change`
- `margin-markup`
- `break-even-point`
- `compound-interest`
- `data-transfer-time`
- `date-difference`

소상공인·무인매장 후속 묶음:

- `studycafe-seat-occupancy`
- `studycafe-break-even`
- `kiosk-roi`
- `unattended-labor-savings`
- `locker-revenue`
- `study-room-schedule-revenue`
- `security-cost-break-even`

글로벌 범용 후속 묶음:

- `discount`
- `age`
- `work-hours`
- `fuel-cost`

17개 정의 모두 `jurisdiction: global`이며 reviewed 구현 묶음이다. 소상공인·무인매장 후속 7종은 사용자 제공 좌석·시간·비용·비율만 계산하고 최저임금, 임대료, 보안업체 요금 같은 외부 정책값을 내장하지 않는다. 국가별 세금, 노동, 금융 규제나 기관 정책을 정답 조건으로 사용하지 않는다.

소상공인·무인매장 7종의 비율 입력은 표준 decimal ratio이며 0–1 경계를 계약에서 검사한다. 좌석시간과 룸시간은 각각 `seat_hours`, `room_hours`로 구분하고, 금액 입력은 한 호출 안에서 같은 caller-supplied currency를 사용한다. 음수 순절감액과 순매출은 손실 신호로 보존하지만 음수 입력 비용이나 가동률 범위 이탈은 정의역 오류다.

글로벌 범용 4종은 `discount`, `age`, `work-hours`, `fuel-cost`다. `discount`는 정가 입력(`final-price`)과 최종가 역산(`original-price`) 모드를 가지며 1차·2차 할인율을 연속 적용한다. 할인율은 0 이상 100 미만이고, 100% 할인에서 역산은 불가능하므로 `domain_error`다. 세금·부가세 규칙은 적용하지 않는다. `age`는 시간대 없는 ASCII `YYYY-MM-DD` 생년월일·기준일을 받아 연·월·일 나이, 살아온 일수, 다음 생일까지 남은 일수를 정수로 반환한다. 2월 29일 생일은 평년에 2월 28일로 관측하고, 법적 성년 판정은 하지 않는다. `work-hours`는 자정 이후 분(`0`–`1439`) 시작·종료, 명시적 자정 넘김 여부, 휴게시간 분을 받아 총 분과 소수 시간을 반환한다. `HH:MM` 표시는 `total_minutes`에서 파생되는 표현 경계이며, 임금·야근수당·노동법은 적용하지 않는다. `fuel-cost`는 거리, 연비, 사용자 입력 연료 단가, 인원 수를 받고 `km_per_liter`, `liters_per_100km`, `miles_per_gallon`(US gallon만) 단위로 사용 연료량, 총비용, 인당 비용을 계산한다. 자동 연료 가격 조회나 통화 환율은 적용하지 않는다.

## 표현 경계

입력 원문이나 로케일 표시 문자열은 계약의 표준 값이 아니다. 제품은 사용자가 입력한 문자열을 계약의 표준 값으로 정규화하고, 계산 엔진 결과를 다시 로케일에 맞게 표시한다. 표시 형식이 표준 결과를 바꾸면 안 된다.

## 숫자 정책

reviewed 소수 계산기는 로케일 구분자가 없는 ASCII decimal string을 입력으로 받는다. 부호와 소수점을 제외한 입력 숫자는 최대 1000자리이며 결과 소수 자리는 호출자가 0-100 범위에서 지정한다. 반올림은 정확한 중간값에서 0에서 멀어지는 `half_away_from_zero`다. `1,000`이나 `1.000,5` 같은 표시 문자열은 제품의 locale adapter가 표준 값으로 바꾼 뒤 엔진에 전달해야 한다.

`date-difference`와 `age`는 ASCII `YYYY-MM-DD`만 받으며 연도 `0001`–`9999`의 proleptic Gregorian 달력을 사용한다. 시간, timezone, offset은 받지 않는다. `date-difference`의 `exclusive`는 `[start_date, end_date)`, `inclusive`는 `[start_date, end_date]`를 뜻하고 결과 `calendar_day_count`는 반올림 없는 JSON 정수다. `age`의 기준일이 생년월일보다 이르면 `invalid_date_range`다.

`compound-interest`는 소수 연수를 지수로 쓰지 않는다. 호출자는 frequency와 정확한 비음수 정수 `compounding_periods`를 제공한다. 기간은 frequency당 100년을 넘지 못하고, 축약 후 거듭제곱 피연산자의 예상 자릿수는 250,000을 넘지 못한다. principal과 rate를 exact rational로 계산한 뒤 future value와 interest를 각각 마지막에만 반올림한다.

active 승격에는 다음이 필요하다.

- 숫자·날짜 표현과 계산 한계
- 반올림 모드와 적용 시점
- 공통 적합성 벡터
- 계약과 엔진 버전 호환성 테스트
- 모든 로케일에서 같은 표준 결과를 내는 소비자 증거

## 금지

- 계산 함수와 라이브러리 구현
- 화면 component 이름과 layout field
- SEO, 광고, 결제, 크레딧, AI payload
- 번역 label과 사용자 문구
- provider 가격이나 국가 정책 기준값

## 퍼센트 계산기

`percentage`는 `of`(값 × 퍼센트 ÷ 100), `ratio`(부분 ÷ 전체 × 100), `apply`(값 × (1 ± 퍼센트 ÷ 100))를 제공한다. 모드별 입력은 필수이며 사용하지 않는 필드는 무시한다. `ratio`의 전체가 0이면 `denominator_zero`다. `apply`는 증가·감소 방향과 비음수 퍼센트를 요구하며 상한은 없다. 결과 단위는 `ratio`에서 `percent`, 나머지에서 `number`이며 마지막 결과만 반올림한다. 기존 `percentage-change`의 증감률 계약과 분리한다.

## 마진·가격 책정

`margin-pricing`는 기존 `margin-markup` API와 별개다. `measure`는 비음수 원가·판매가와 같은 단위를 요구하며 판매가·이익액을 항상 반환하고 분모가 0인 비율만 생략한다. 출력의 `required: false`는 해당 결과가 없을 수 있음을 뜻하며 생략된 선언은 필수다. `target-margin`은 0 이상 100 미만, `target-markup`은 비음수 목표 비율과 양수 원가를 요구한다. 이론 판매가를 호출자가 지정한 양수 `price_increment`의 배수로 올림한 뒤 실제 비율을 재계산한다. 증분을 표현할 수 없는 출력 정밀도는 `precision_policy_required`다. 엔진은 통화별 최소 단위를 추정하지 않고 수수료·세금을 차감하지 않는다. 모든 결과의 마지막 표시 반올림은 기존 half-away-from-zero를 따른다.


## 손익분기·목표이익 계획

`break-even-planning`은 기존 `break-even-point`를 유지하는 별도 계약이다. 고정비·목표이익은 같은 기간의 비음수 금액이며 판매가는 양수, 변동비는 비음수, 단위당 공헌이익은 양수여야 한다. 이론 수량과 매출액은 반올림 전 유리수에서 계산하고 정수 판매량은 정확한 올림을 정수 값의 canonical decimal string으로 반환한다. 매출액은 이론 수량 기준이며 정수 수량의 매출과 구분한다. 기간 환산·세금·수수료는 적용하지 않는다.


## 복리·정기 적립

`compound-savings`는 복리 주기마다 같은 금액을 기초 또는 기말에 납입한다. n회 기간에는 정확히 n회 납입하고 0회 기간에는 납입하지 않는다. 총 납입액은 초기 원금 + 적립액 × n이고 발생 이자는 정확한 미래 가치에서 총 납입액을 뺀 값이다. 실효 연이율은 납입액과 무관한 1년 복리 효과다. 100년 기간 한도와 250,000자리 거듭제곱 작업 한도를 함께 적용하며 입력 조건에 따라 기간 한도보다 먼저 거부할 수 있다. 세금·수수료·분수 기간·다른 납입 주기 환산은 적용하지 않는다.
