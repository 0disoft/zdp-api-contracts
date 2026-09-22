# 두블룬 digest v1

[프로파일](../../contracts/apis/core-api/doubloon-digest-v1.yaml)은 API·Core·operator의 공통 바이트 계산 규칙이다. [고정 벡터](../../contracts/apis/core-api/doubloon-digest-v1.vectors.json)는 실제 체인과 무관한 합성 입력, 정규화 문자열, UTF-8 바이트의 hex, 예상 digest를 제공한다.

## 계산

`sha256:` 뒤에 `SHA-256(UTF8(canonical({domain, payload})))`의 소문자 hex 64자를 붙인다. domain도 해시에 포함하며 BOM·끝 줄바꿈을 넣지 않는다. 세 domain은 프로파일의 transaction/evidence/approval 값을 정확히 사용한다.

정규화는 [RFC 8785](https://www.rfc-editor.org/rfc/rfc8785)의 부분집합이다. 값은 printable ASCII 문자열, 배열, 객체만 허용한다. 객체 키는 소문자 snake_case이고 오름차순 정렬한다. JSON 문자열의 따옴표·역슬래시를 escape하며 공백을 삽입하지 않는다. 배열 순서는 보존한다. Unicode·제어 문자·number·boolean·null은 거부하므로 범용 JCS 구현으로 부르면 안 된다. 정규화 전 문자열을 trim하거나 대소문자를 바꾸지 않는다.

gas_budget·amount·tranche는 선행 0 없는 u64 십진 문자열이다. revision은 비어 있지 않은 불투명 문자열로 정확히 비교한다. 시간은 UTC 밀리초까지 포함한 `YYYY-MM-DDTHH:mm:ss.sssZ`만 허용한다. source_commit은 소문자 hex 40자다. amount·tranche 등이 적용되지 않으면 필드를 생략하지 않고 `{"not_applicable":"action_has_no_amount"}` 같은 명시적 이유를 사용한다. gas_budget에는 이 표기를 허용하지 않는다.

## 결합 순서

1. transaction의 모든 필드를 확정하고 transaction_content_digest를 계산한다. API의 transaction_binding_digest는 이 값이다. transaction_bytes_digest는 실제 거래 원시 바이트를 직접 SHA-256한 값이며 Sui 자체 transaction digest와 다르다.
2. evidence entries의 subject_binding은 위 거래 digest와 같아야 한다. evidence_ref가 중복되지 않도록 오름차순으로 제공하고 manifest digest를 계산한다. 잘못된 순서를 구현이 조용히 정렬해서 고치지 않는다.
3. 거래·manifest digest와 approval revision·issuer·audience·expiry로 approval binding을 계산한다. 거래에 manifest나 최종 approval digest를 역으로 넣지 않는다.

거래의 dependencies·gas_objects·decoded_targets_and_arguments 배열도 순서 변경 시 다른 digest다. 최상위 키와 evidence entry 키는 닫힌 목록이다. 내부 거래 구조는 문자열 트리로 바인딩하지만, action별 내부 스키마와 실제 거래 바이트를 대조하는 decoder는 후속 구현에서 확정해야 한다. 현재 참고 구현은 체인 주소·허용 action·수령자·수량의 의미나 증거 신뢰성을 검증하는 운영 validator가 아니다. 해시가 같다고 실행 권한이 생기지 않는다.

## 재현과 소비

Python 표준 라이브러리 생성기로 고정 벡터를 만들고 독립적인 TypeScript 참고 구현을 Bun 테스트에서 대조한다. 테스트 중 기대값을 재생성하지 않는다. 생성 intent는 `doubloon_digest_vectors_generate`, 검증 intent는 `zdp_api_contracts_check`다. 참고 구현은 테스트 전용으로 public SDK에 export하지 않는다.

원시 JSON 입력은 중복 키를 거부해야 한다. 참고 구현의 hashCanonicalJson은 이미 정규화된 payload JSON만 허용하여 파싱 후 재직렬화가 원문과 다르면 거부한다. 일반 HTTP JSON을 손실 없이 검증하는 parser를 대신하지 않는다.

Core와 operator가 같은 벡터를 통과하고 action별 스키마·decoder·증거 인증을 갖추기 전까지 production_digest_implementation_ready와 실행 권한은 false다. 프로파일 변경으로 바이트가 달라지면 domain/profile 버전을 새로 만든다.
