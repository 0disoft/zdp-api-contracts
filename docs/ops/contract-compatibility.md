# API 계약 호환성 및 SemVer 게이트

이 게이트는 pull request의 계약을 base commit과 비교해 소비자 호환성 등급을 계산하고 `package.json` 버전이 충분히 올라갔는지 검사한다. 기존 validator가 현재 계약의 내부 일관성을 확인한다면, 이 검사는 이전 공개 계약을 깨뜨렸는지 확인한다.

## 판정 등급

| 등급 | 대표 변경 | 요구 버전 |
| --- | --- | --- |
| `patch` | 금지값 추가, credential 처리 정책 변경, 요구사항 완화 | patch |
| `feature` | route 추가, schema 추가, optional field 추가, success status나 error code 추가 | minor |
| `breaking` | route 제거, method 또는 path 변경, success status 축소, request required field 추가, response field 제거, 인증·멱등성 요구 강화 | 1.0 이후 major, 0.x에서는 minor |
| `none` | 비교 대상 계약의 의미 변화 없음 | 버전 상승 불필요 |

0.x에서 breaking과 feature가 모두 minor를 요구하더라도 breaking 변경에는 마이그레이션 문서가 추가로 필요하다. 따라서 호환되지 않는 변경을 일반 기능 추가로 숨길 수 없다.

## 마이그레이션 문서

breaking 판정이 나오면 다음 경로를 추가한다.

```text
docs/migrations/v<base-version>-to-v<head-version>.md
```

문서는 이전 버전과 새 버전을 모두 명시하고, 최소 두 개의 `##` 절에서 변경 내용과 소비자 조치를 설명해야 한다. 빈 문서나 버전만 적은 문서는 통과하지 않는다.

## CI 실행

pull request checkout은 base SHA를 읽을 수 있도록 전체 history를 가져온다. CI는 base SHA의 `contracts/`를 임시 디렉터리에 복원한 뒤 현재 작업 트리와 비교한다.

```sh
bun run compatibility:check --base-ref "$BASE_SHA"
```

로컬에서는 비교할 commit, tag 또는 branch를 직접 넘긴다.

```sh
bun run compatibility:check --base-ref origin/main
bun run compatibility:check --base-ref v0.32.0 --json
```

## 현재 비교 범위

| 계약 면 | 검사 내용 |
| --- | --- |
| route catalog | operation 존재 여부, transport와 schema ref, auth, idempotency, status, error code, 권한·경계 metadata |
| schema bundle | bundle와 schema 존재 여부, request·response field 전이, secret 처리, 공통 metadata |
| error envelope | required·optional·forbidden field 변화 |
| webhook contract | required·forbidden control 변화 |
| SDK generation input | source contract, target, required metadata, 금지 ownership과 값 변화 |
| route skeleton | 허용 method·status·session effect와 required·forbidden 항목 변화 |

현재 parser가 base 계약을 읽지 못하면 세부 diff 대신 `API_COMPAT_BASELINE_CONTRACT_UNREADABLE` breaking 변경으로 처리한다. 이 경우에도 충분한 버전 상승과 마이그레이션 문서 없이는 통과하지 않는다.

이 게이트는 계약의 유효성을 대신하지 않는다. 현재 구조 검사는 `contracts:check`, 이전 버전과의 호환성은 `compatibility:check`가 각각 담당한다.
