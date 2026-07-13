# Calculator Contract

`contracts/calculators/catalog.yaml`은 여러 제품이 함께 소비하는 계산기 정의의 원천이다. 계산 공식을 실행하거나 사용자 화면을 설명하는 파일이 아니다.

## 소유하는 의미

- 언어와 무관한 안정 계산기 ID
- contract version과 호환 engine version
- jurisdiction과 lifecycle status
- 표준 입력·결과 field, 값 종류, 단위 차원과 단위 정책
- 안정 오류 코드
- 계산 공식이 지켜야 할 semantic rule ID
- active 승격 전에 확정해야 하는 precision과 rounding policy

## 첫 정의 묶음

- `percentage-change`
- `margin-markup`
- `break-even-point`
- `compound-interest`
- `data-transfer-time`
- `date-difference`

모두 `jurisdiction: global`인 draft 계약이다. 국가별 세금, 노동, 금융 규제나 기관 정책을 정답 조건으로 사용하지 않는다.

## 표현 경계

입력 원문이나 로케일 표시 문자열은 계약의 표준 값이 아니다. 제품은 사용자가 입력한 문자열을 계약의 표준 값으로 정규화하고, 계산 엔진 결과를 다시 로케일에 맞게 표시한다. 표시 형식이 표준 결과를 바꾸면 안 된다.

## Draft 승격

현재 precision과 rounding policy는 `explicit_before_active`다. 이 값은 임의 반올림을 허용한다는 뜻이 아니라, 계산 엔진 구현과 독립 검증 벡터가 정책을 확정하기 전에는 계약을 active로 올리지 못한다는 뜻이다.

active 승격에는 다음이 필요하다.

- 숫자·날짜 표현과 계산 한계
- 반올림 모드와 적용 시점
- 독립 검증 벡터
- 계약과 엔진 버전 호환성 테스트
- 모든 로케일에서 같은 표준 결과를 내는 소비자 증거

## 금지

- 계산 함수와 라이브러리 구현
- 화면 component 이름과 layout field
- SEO, 광고, 결제, 크레딧, AI payload
- 번역 label과 사용자 문구
- provider 가격이나 국가 정책 기준값
