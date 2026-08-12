# 공통 고객 정책 레지스트리

100개 제품이 이용약관·개인정보·크레딧·환불 정책을 각각 복제하면 문서 변경 시점과 동의 증거가 갈라진다. `contracts/apis/core-api/customer-policy-registry.yaml`은 Core consent가 제품·환경·기능·로케일에 맞는 정확한 정책 세트를 결정하고, 제품은 그 결과를 표시·수락하는 경계를 고정한다.

## 정책 조합

정책 문서는 공통 문서와 `product_addendum`, `jurisdiction_addendum`, `channel_addendum`으로 조합한다. 각 revision은 내용 digest, canonical path, 발행·효력 시각, 선행 revision, owner와 reviewer를 가진 불변 기록이다. 정책 세트는 ordered revision과 digest를 묶으므로 제목이나 `latest` 링크만으로 동의 대상을 추정하지 않는다.

resolve 요청은 `product_ref`, `environment`, `capability`, `locale`만 필수로 보내며 필요할 때 관할·판매 채널·seller role 참조를 추가한다. 클라이언트가 policy version, 문서 목록, digest 또는 canonical path를 골라 보내는 방식은 금지한다.

## 가입과 결제

가입은 resolve 결과의 `policy_set_resolution_ref`로 필수 수락 receipt를 만든다. 선택 마케팅 동의는 필수 약관 수락과 별도 기록한다. 결제도 같은 방식으로 checkout 시점의 정책 세트와 판매 조건을 묶되, 결제·원장 상태의 정본은 계속 Money가 소유한다.

필수 문서나 locale이 빠지면 해당 가입·구매 같은 고위험 기능만 닫는다. 정책 열람, 고객지원, 환불 요청, 데이터 내보내기와 삭제 요청까지 막아서는 안 된다.

## 현재 제외

- live Core route와 저장소 구현
- 법률 문안 자체와 법률 검토 승인
- 제품 UI 컴포넌트와 스타일
- 결제 provider, 가격표, 세금 또는 환불 실행 로직
- receipt를 authorization decision으로 사용하는 방식
