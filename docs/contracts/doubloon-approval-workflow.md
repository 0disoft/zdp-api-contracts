# 두블룬 내부 승인 워크플로 구현 상태

[정책 원본](../../contracts/apis/core-api/doubloon-approval-workflow.yaml)과 [닫힌 요청·응답 스키마](../../contracts/apis/core-api/sensitive-action-authorization.yaml)를 함께 읽는다. 이 문서는 2026-09-16까지의 구현과 로컬 검증 범위를 기록한다. 전체 계약 적합성 인증이나 운영 활성화 선언은 아니다.

## 구현 범위와 활성화 조건

Core에는 제안 생성, 단일 승인 완료, 현재 상태 조회가 구현돼 있다. Admin에는 파일 입력, 동의·비밀번호 재확인, 응답 유실 시 같은 명령 키로 재시도하는 화면과 same-origin BFF가 있다. 기본값은 비활성이며 공개 path·base URL은 null, 생성 SDK operation은 없다.

| 소유자 | 명시적 모드 | 범위 |
| --- | --- | --- |
| Core | `ZDP_CORE_DOUBLOON_CONSENT_MODE=staging-postgres-v1` | 기존 review·confirm |
| Core | `staging-workflow-v1` | review·confirm 및 complete·status |
| Core | `staging-synthetic-create-v1` | 위 기능 및 합성 제안 생성; 서버 creation policy 필수 |
| Admin | `ZDP_ADMIN_DOUBLOON_MODE=core-v1` | 기존 review·confirm |
| Admin | `core-workflow-v1` | 생성·완료·조회 UI와 BFF 추가 |

Core 경로는 `/internal/admin/doubloon/proposals`, `/internal/admin/doubloon/complete`, `/internal/admin/doubloon/status`다. 기존 review·confirm 경로와 confirm의 동의 전용 의미는 유지한다. YAML의 `proposed_internal_paths` 표기는 실제 지원 상태에 맞춰 `supported_internal_paths`로 갱신했다. 이 메타데이터 변경은 공개 route catalog 등록이 아니다.

모드 값만 설정해서는 활성화되지 않는다. Core는 스테이징 환경, operator session 구성 및 `ZDP_CORE_DOUBLOON_CONSENT_CONFIG`의 tenant·chain·issuer·수명 정책과 생성 정책을 검증한다. 생성은 합성 chain/객체와 `create_grant`, 정확한 tenant·policy revision, quorum 1로 제한한다. Admin은 `ZDP_ADMIN_ORIGIN`, `ZDP_ADMIN_CORE_ORIGIN`과 `ZDP_ADMIN_DOUBLOON_REVIEW_PATH`, `_CONFIRM_PATH`, `_CREATE_PATH`, `_COMPLETE_PATH`, `_STATUS_PATH`의 명시적 구성을 요구한다. 실제 설정 정본은 각 구현 저장소에 있다.

생성은 제안·감사·명령 결과를, 완료는 동의·승인 기록·승인자·head·감사·명령 결과를 각각 한 DB 트랜잭션으로 저장한다. 동일 명령 키의 성공 재응답은 과거 결과를 복구한다. 현재 승인 효력은 status로 다시 확인해야 한다. 요청자 본인의 승인은 거부하며 모든 성공 응답의 `execution_authorized`는 false다.

## 로컬 검증 증거

| 검증 | 구현 및 증거 기준 | 확인한 범위 | 확인하지 않은 범위 |
| --- | --- | --- | --- |
| Core·Admin·Operator 연동 | Core `81b9a56`의 `core_doubloon_interop_test`; Admin `09e7b8a1a44d5eceeecd417955a0e655a24be371`; Operator `bd4bdaa35cbc12fb9f1053fd11105e8b3d3f1e48` | 실제 Admin client/BFF, Core Axum·일회용 PostgreSQL, Operator client를 stdio HTTP adapter로 연결 | 실제 브라우저, TCP/TLS 및 배포 환경 |
| Admin 브라우저 | Admin `872f934`의 `doubloon_admin_browser_test` | production SSR·hydration, Edge 153, 데스크톱·모바일 조작과 화면 | 실제 Core·DB·로그인; 응답과 세션은 합성 fixture |

연동 검사는 생성·완료 커밋 후 응답 유실과 같은 키 복구, 자기 승인 거부, 증거 누락 거부, 증거 등록 후 Operator valid, 권한 철회 후 invalidated 및 Operator 거부를 확인했다. 감사·명령 결과의 중복 생성도 확인했다. Operator valid여도 실행 권한은 생기지 않는다.

브라우저 검사는 파일 업로드, 중복 클릭 차단, 생성·완료 응답 유실 복구, 이동 경고, u64 원시 단위 표시, 명시적 동의, 비밀번호 제거, 현재 상태 표시, 실행 권한 주장 거부, 브라우저 저장소 미사용, 모바일 넘침과 안내문 대비를 확인했다. 이 증거와 별도의 stdio 연동 증거를 합쳐 실제 브라우저→배포 Core의 종단간 검증으로 주장하지 않는다.

## 남은 조건과 한계

- 실제 스테이징 DB migration, 배포, 모드 활성화와 해당 커밋의 hosted CI 결과는 이 기록에서 확인하지 않았다. 로컬 임시 DB 검증은 운영 migration 적용 증거가 아니다.
- 두 계정을 사용한 검사는 서로 독립된 두 사람이 운영한다는 증거가 아니다. 운영자·승인자 배정과 정책 검토가 필요하다.
- 화면의 재시도 문맥은 현재 페이지 메모리에 있다. 생성 응답을 잃은 뒤 페이지까지 닫으면 복구할 요청 목록 UI는 아직 없다.
- 실제 배포 환경의 인증·TLS·동일 출처 BFF를 통한 전체 흐름은 별도 리허설이 필요하다.
- 성공 작업의 throttle과 생성·완료·발급·철회가 공유하는 lock 순서 등 계약의 전체 보안·동시성 요구를 위 시나리오 통과만으로 충족했다고 단정하지 않는다. 해당 요구는 정책 원본에 유지하며 활성화 전 구현 대조 대상으로 남긴다.
- Core의 합성 거래 선언 검사는 실제 Sui 거래 바이트 해석, 잔액·객체 소유권 검증을 대신하지 않는다. 서명·제출·mint 및 실행 권한은 이 작업 범위에 없다.
