# 두블룬 승인 검증 계약

이 문서는 Core access 경계가 소유할 두블룬 테스트넷 승인 검증의 계약 정본이다. [정책 원본](../../contracts/apis/core-api/doubloon-approval.yaml)과 [typed schema 원본](../../contracts/apis/core-api/sensitive-action-authorization.yaml)의 DoubloonApprovalVerifyRequest/Response를 함께 소비한다.

## 실행 상태

계약은 contract-only-no-live-route다. 검토할 비공개 POST 경로를 `/v1/internal/doubloon-approvals/verify`, 전용 capability를 `doubloon-approval:verify`로 예약했다. 공개 path·base URL은 null이고 route catalog에 등록하지 않았으므로 OpenAPI components에는 schema가 있어도 paths나 SDK 호출은 추가되지 않는다. Core 라우트 연결과 capability·credential 발급은 아직 없으며 기존 Orchid/Admin 대상의 허용 범위를 넓히지 않는다.

Core가 서비스 identity의 정확한 organization grant로 호출자를 인증하고 token-operator 전용 검증 권한을 확인해야 한다. permission 문구나 operation ID가 있다는 사실만으로 grant가 만들어지지 않는다. credential은 별도 보관 경계에서 전달하며 사용자 cookie나 요청에 첨부한 issuer key를 사용하지 않는다.

## 요청과 binding

허용 작업은 token 게시·Currency 등록·reserve 게시·Grant 생성·만기 전/제3자/정상/중복 청구의 8가지다. 네트워크는 sui_testnet, audience는 zdp-token-operator, resource type은 doubloon.testnet-operation으로 제한한다. cap 보관 배정, upgrade·mint·burn·mainnet·임의 전송은 포함하지 않는다.

ADR-0060에 따라 두 게시 작업은 각각 `Publish`가 반환한 UpgradeCap을 **같은 PTB**의 `sui::package::make_immutable`에서 소비해야 한다. 독립적인 `make_immutable` 작업이나 게시 직후 별도 고정 거래는 허용하지 않는다. 승인 binding과 시뮬레이션은 게시와 cap 소비를 포함한 전체 거래 바이트를 대상으로 하며, 성공 effects·package ID·cap 소비·생존 cap 부재를 대조해야 완료로 본다. 현재 Core 검증기는 PTB 명령을 해독하지 않으므로 이 계약만으로 불변화 조건이 강제됐다고 주장할 수 없다.

receipt와 예상 승인 revision, 거래 binding digest, 증거 manifest digest, 전체 체인 식별자와 exact action/resource를 요청한다. 예상 revision은 비교값이며 승인 근거가 아니다. binding은 실제 거래 바이트에서 해석한 대상·인자·sender·gas owner·gas 객체/예산·수량·수령자·Grant·tranche와 source/dependency/policy/custody revision·만료를 포함해야 한다.

거래 내용 digest → 증거 manifest digest → 최종 승인 binding 순서로 만들어 순환 참조를 피한다. canonical encoding과 hash는 [digest v1](doubloon-digest.md)을 따른다. 현재 string schema가 임의 문자열을 실제 digest로 신뢰한다는 뜻은 아니다. mock syntheticBinding과 Sui transaction digest를 승인 binding으로 대체할 수 없다.

## 검증 응답과 실패

200은 검증 요청을 처리했다는 뜻이며 승인 성공은 아니다. verification_result가 valid이고 모든 요청 binding과 현재 권한·승인·정책·철회·증거·시간 조건이 충족돼야 한다. 그래도 execution_authorized는 항상 false다. 이 API는 승인 소비, Grant 잠금, gas 예약, 서명이나 제출을 수행하지 않는다.

원장을 찾을 수 없는 authenticated 요청은 대상 존재 여부를 자세히 노출하지 않는 invalid로 처리한다. non-valid 응답의 binding은 요청 echo일 수 있으므로 정본 존재 증거가 아니다. 원장 metadata가 없는 경우에만 제한된 not-available marker를 사용하고 valid에는 허용하지 않는다. 인증 실패는 401, 권한 부족은 403, 입력 오류는 400, 의존성·감사 기록 실패는 503과 중앙 error envelope를 사용한다. unavailable에서는 캐시된 valid로 대체하지 않는다.

모든 조회는 현재 상태를 다시 확인한다. 같은 요청을 재전송해도 과거 valid를 멱등성 replay하지 않는다. request/trace ID로 감사 연결을 남기며 raw credential·거래 payload·개인정보는 기록하지 않는다. 조회 후 철회 경쟁과 이미 서명된 바이트의 외부 제출은 이 검증 API만으로 차단하지 못한다.

## 검증과 다음 단계

zdp_api_contracts_check에서 두블룬 schema export, 닫힌 입력/응답, 허용 작업과 정책 일치, route 부재, 중앙 오류 코드를 확인한다. 문서와 typed schema를 추가한 것이 런타임 인증·DB migration·네트워크 활성화를 증명하지 않는다.

Core의 닫힌 binding 타입·verdict와 digest profile은 구현돼 있다. 다음은 예약한 비공개 경로를 기본 비활성 staging 조립에 연결하고, 합성 HTTP/disposable DB에서 정확한 서비스 grant를 검증하는 단계다. 실제 credential 발급·조직/승인자 정책과 배포 활성화는 별도 결정한다.
