# 접근 판정 소비자와 매장 연결 검토안

상태: 검토안. Core catalog 등록, role 부여, 제품 승인, DB migration 또는 runtime 활성화가 아니다.

## 먼저 구분할 세 가지 참조

| 참조 | 소유자와 의미 |
| --- | --- |
| 세션 tenant | Core가 확인한 현재 세션의 tenant. 제품 매장 tenant와 같다고 가정하지 않는다. |
| 판정 대상 resource | 서버가 확인한 제품 리소스에 연결된 Core resource. 브라우저가 제출한 URI를 그대로 쓰지 않는다. |
| 판정 scope | 이번 호출자에게 Core가 확인한 권한 범위. 리소스 소유 조직과 반드시 같은 개념은 아니다. |

Core 내부의 `LOAD_ACCESS_DECISION_BINDINGS_SQL`은 organization/workspace scope에서 활성 멤버십을 확인하고, personal_account scope에서는 해당 개인 계정의 소유자를 확인한다. 모든 경우 정확한 scope의 활성 role assignment와 permission binding이 필요하다. enum 이름만 바꾼다고 권한이 생기지 않는다.

## Orchid 첫 방문자와 점주를 같은 scope로 처리할 수 없는 이유

Orchid 제품 명세는 인증된 이용자의 첫 출석 commit에서 매장 회원 프로필을 만들 수 있도록 한다. 따라서 방문자에게 매장 조직의 기존 멤버십을 요구하는 Core fixture를 그대로 적용하면 첫 출석 전에 막힌다. 반대로 방문자를 조직의 직원·관리자 역할에 넣어 이 문제를 피하면 관리 권한 경계를 훼손한다.

권장 방향은 다음과 같다.

- 매장의 Core resource 연결은 `(Orchid tenant_id, store_id)`별 서버 소유 기록으로 고정한다. 명시적인 resource 참조, binding revision과 검토 증거를 보존한다.
- 점주·직원의 관리 행위는 별도로 승인된 organization/workspace scope와 관리 action을 사용한다. 현재 멤버십·역할 철회를 반영한다.
- 방문자 체크인은 관리 권한을 재사용하지 않는다. 개인 계정 scope를 후보로 검토하되, Core가 확인한 개인 계정 참조와 해당 제품의 방문자 permission을 얻는 경로를 먼저 정의한다.
- 매장마다 고정된 scope_ref를 방문자의 개인 계정 scope로 재사용하지 않는다. 매장 resource binding과 호출자 scope evidence를 서로 다른 입력으로 분리한다.
- 세션 tenant UUID를 개인 계정·조직·매장 참조로 변환하거나 URI를 조합하지 않는다. 명시적 Core 조회·검증 경로가 필요하다.

현재 Orchid의 `CoreStoreAccessBinding`은 resource와 scope를 한 기록에 담고 있다. 이를 운영 데이터로 채우기 전에 방문자 scope 결정과 입력 분리 변경을 함께 검토해야 한다. 이 문서는 새 binding schema를 승인하거나 기존 구조를 자동으로 마이그레이션하지 않는다.

## 다음 계약 변경의 입력과 완료 기준

1. Core 소유의 현재 actor-scope 조회 또는 동등한 검증 결과를 정한다. subject·session·tenant·scope와 유효기간을 명시하고 요청자의 scope 주장을 권한 근거로 삼지 않는다.
2. 방문자 제품 권한의 생성·철회 주체와 lifecycle을 정한다. Orchid가 Core role 테이블에 직접 쓰지 않는다. 개인 계정이 존재한다는 사실만으로 제품 권한을 추정하지 않는다.
3. 각 관리 행위와 방문자 check-in의 정확한 catalog tuple을 별도로 검토한다. 방문자 리소스 접근은 유효한 QR·매장 정책·제품 멤버 상태를 검증하는 Orchid transaction guard를 대체하지 않는다.
4. 첫 방문자의 출석 성공, 다른 매장 resource 치환, 다른 actor scope 재사용, 만료된 scope, 철회된 관리 멤버십, Core 장애, scope가 바뀐 동일 idempotency key를 검증한다.
5. 승인된 resource·scope binding과 실제 Core/Orchid transport 증거가 갖춰진 뒤에만 adapter를 연결한다. 그 전에는 기본 비활성 상태를 유지한다.

## 검토 근거

- [Orchid 제품 명세](https://github.com/0disoft/zdp-orchid-pass/blob/main/docs/product/02-spec.md)
- [Orchid 소비자 계약](https://github.com/0disoft/zdp-orchid-pass/blob/main/docs/integrations/backend-api.md)
- [Core 접근 판정 PostgreSQL adapter](https://github.com/0disoft/zdp-core-platform/blob/main/src/core_postgres_access_decision_adapter.rs)

위 참조는 소유 경계를 확인하기 위한 원천이다. 로컬 fixture나 이 문서의 존재를 운영 승인으로 사용하지 않는다.
