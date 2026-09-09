# Core 접근 판정 계약

## 상태

계약 전용(contract-only). live handler, 배포 URL, 정책 엔진 구현 또는 제품 route 승격을 의미하지 않는다.

## 목적

`core.access.authorization_decisions.create`는 Core가 현재 세션을 직접 검증하고, 정확한 제품·행위·리소스·scope에 대한 접근 판정을 만든다. 제품 저장소와 SDK는 판정을 요청하거나 표시할 수 있지만 최종 authorization을 소유하지 않는다.

현재 세션 조회는 신원 확인 계약으로 유지한다. `core.auth.sessions.get_current` 응답에 제품별 allow/deny, 정책 버전 또는 증거 참조를 끼워 넣지 않는다. 보호된 제품 요청은 별도 접근 판정을 사용한다.

## 요청 경계

요청은 `product_ref`, `action`, `resource_type`, `resource_ref`, `requested_scope_type`, `requested_scope_ref`를 전달한다. 이 값은 판정 질문이지 권한 증명이 아니다.

다음 값은 요청 payload에서 권한 근거로 받지 않는다.

- subject, session, tenant;
- role 또는 permission;
- 기존 decision이나 policy version;
- consent receipt;
- client가 계산한 obligations.

Core는 현재 세션에서 subject와 session을 확인하고, 현재 relationship과 access 정책에서 실제 scope, 정책 버전, 데이터 revision을 다시 읽는다. product와 action도 닫힌 Core catalog에 존재해야 한다.

## 판정 결과

정상적인 allow와 deny는 모두 생성된 판정 리소스이며 `201` 응답을 사용한다. deny를 transport 오류로 숨기지 않는다. 인증 실패, 만료·철회된 세션, 잘못된 요청, rate limit, 정책 의존성 장애와 idempotency conflict는 표준 오류 envelope로 분리한다.

응답은 다음 binding을 함께 돌려준다.

- `decision_ref`, `decision`, `reason_code`;
- `policy_version`, `data_revision`;
- `subject_ref`, `session_ref`, `tenant_ref`;
- `product_ref`, `action`, `resource_type`, `resource_ref`;
- `scope_type`, `scope_ref`;
- `decided_at`, `decision_expires_at`, `session_expires_at`;
- 항상 존재하는 `obligations` 목록.

`decision_ref`는 불투명하고 비밀이 아닌 감사 참조다. bearer credential, 재사용 가능한 capability 또는 서명 토큰으로 해석하지 않는다. 제품 adapter는 `decision == allow`만 접근 허용으로 변환하고, deny·오류·누락·알 수 없는 값은 모두 fail closed로 처리한다.

`tenant_ref`는 검증된 현재 세션의 Core tenant 참조다. 제품은 응답의 subject·session·tenant를 먼저 확인한 세션 증거와 정확히 비교한다. 이 값은 요청 payload에서 받지 않으며, 제품의 매장 ID나 요청 scope에서 유도하지 않는다. 다른 scope 종류를 지원하더라도 세션 tenant binding과 판정 대상 scope는 별개다. 누락·불일치는 제품 작업을 허용하지 않는다.

이 변경은 응답 binding과 JSON body를 정의하는 계약 단위다. 인증 transport·헤더, 제품별 action catalog와 매장 binding, Core handler 및 소비자 연결은 후속 검토 대상이다. 내부 persistence record 전체를 HTTP 응답으로 직렬화하라는 뜻이 아니다.

`reason_code`는 안정된 비열거형(non-enumerating) 코드만 사용한다. raw policy, membership, role, 관계 graph 또는 customer payload를 노출하지 않는다. `obligations`는 정규화되고 길이가 제한된 식별자 목록이며, 제품 UI가 아니라 실제 effect 경계에서 집행한다.

## JSON 요청·응답 형태

`AccessAuthorizationDecisionCreateRequest`는 추가 필드를 허용하지 않는 JSON 객체다. 여섯 요청 binding은 모두 필수 문자열이고 `requested_scope_type`은 `platform`, `personal_account`, `organization`, `workspace` 중 하나다. subject·session·tenant는 여전히 Core가 검증한 세션에서 얻는다.

성공 응답은 `AccessAuthorizationDecisionCreateResponse` 객체를 직접 사용한다. `data` wrapper나 내부 persistence record를 추가하지 않는다. 응답의 모든 binding은 필수이며 `decision`은 `allow` 또는 `deny`, `scope_type`은 요청과 같은 네 가지 scope 종류를 사용한다. 세 시각은 `date-time` 문자열이고 `obligations`는 문자열 배열이다. 빈 배열과 필드 누락·null은 다르다. 제품이 모르는 obligation을 무시해서는 안 된다.

OpenAPI 산출물은 두 schema를 typed object와 `additionalProperties: false`로 내보낸다. `idempotency_key`, request fingerprint, fact revision hash, restriction/consent evidence 목록, audit event와 command ID는 내부 판정 기록에 남고 성공 본문에는 포함하지 않는다. request·trace metadata는 기존 common envelope에 따라 전달하며 성공 schema의 임의 필드로 추가하지 않는다.

표준 오류는 `contracts/error-envelope.yaml`의 객체를 따른다. 완료된 deny는 기존 catalog처럼 201 판정 리소스이고, 인증 실패나 의존성 장애와 구분한다. 이 schema 변경이 인증 cookie 이름·실제 origin·헤더 중복 처리·본문 byte 제한·동일 key replay의 HTTP 세부 정책까지 결정하지는 않는다. 그 항목은 Core transport와 소비자 연결의 다음 계약 단위다.

## 정책과 만료

명시적 deny가 allow보다 우선한다. no-match, missing, stale, unknown fact와 정책 의존성 장애는 allow가 아니다. `decision_expires_at`은 session, 정책 snapshot 또는 authority fact 중 먼저 만료되는 시점을 넘을 수 없다.

동일 idempotency key와 동일한 정규화 binding은 같은 판정을 replay할 수 있다. 같은 key로 다른 product, action, resource 또는 scope를 요청하면 conflict다.

## Consent와 제품 리뷰의 분리

Consent receipt는 사용자가 특정 목적과 scope에 동의했다는 입력 사실이다. 현재 요청의 최종 authorization이 아니다.

제품 reviewer approval은 어떤 operation을 배포 검토 대상으로 삼을지 정하는 promotion gate다. runtime access decision이나 사용자 consent를 대신하지 않는다.

## 승격 차단 조건

- Core access가 session, relationship, restriction, consent와 정책 snapshot을 같은 판정 경계에서 다시 확인하지 않음;
- append-only decision log와 idempotent replay/conflict가 구현되지 않음;
- 판정 expiry와 session·policy·authority fact expiry의 상한 관계가 검증되지 않음;
- deny, missing, stale, dependency failure와 explicit-deny precedence 테스트가 없음;
- 제품 adapter가 exact product/action/resource/scope binding을 검증하지 않음;
- Core와 제품의 배포·rollback·revocation 증거가 없음.
