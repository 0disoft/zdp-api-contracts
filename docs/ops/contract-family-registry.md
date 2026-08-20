# Contract Family Registry

## 목적

계약 family를 추가할 때 `loadApiContracts`, 검증 진입점, export source 목록을 각각 따로 수정하던 구조를 registry 중심으로 바꾼다. 각 singleton family의 key, 사람이 읽을 이름, YAML 경로, parser, export 대상은 `src/api-contracts/family-registry.ts` 한곳에서 선언한다.

## 실행 경로

```text
package 또는 CLI
  -> registry-loader
    -> family-registry의 singleton 계약 병렬 로드
    -> API catalog에서 schema bundle 경로 발견
    -> schema bundle 병렬 로드
  -> registry-validator
    -> registry 자체 무결성 확인
    -> 등록된 semantic validation stage 실행
  -> registry-plan
    -> 기존 dry-run plan 생성
    -> export target에 등록된 singleton source 누락 방지
```

기존 `src/api-contracts/parser.ts`의 `loadApiContracts`는 직접 import 소비자를 위한 호환 경로로 남긴다. 패키지의 `zdp-api-contracts/api-contracts` export와 두 CLI는 registry 기반 진입점을 사용한다.

## 등록 항목

| 필드 | 의미 |
| --- | --- |
| `key` | `ApiContracts`에서 family 값을 담는 singleton property |
| `name` | load error와 진단에 사용하는 안정적인 lowercase 이름 |
| `sourcePath` | 저장소 루트 기준 YAML 원천 경로 |
| `parse` | YAML 문자열을 해당 family 타입으로 바꾸는 parser |
| `exportTargets` | OpenAPI, SDK input, webhook schema, docs plan이 반드시 포함할 singleton source 소유권 |

`schemaBundles`는 singleton family가 아니다. API catalog의 request와 response schema ref에서 동적으로 발견하고, route에 연결되지 않은 필수 Core bundle만 baseline 목록으로 유지한다.

## 검증 구조

`registry-validator.ts`는 registry 자체 검증과 semantic validator dispatch를 분리한다. 현재 `semantic-contract-invariants` stage가 기존 `validator.ts` 전체를 감싼다. 이후 family별 validator를 별도 모듈로 옮길 때 호출자와 CLI를 바꾸지 않고 registration만 나눌 수 있다.

registry 검증은 family key 누락과 중복, 이름과 source path 중복, 결정적 순서 이탈, 잘못된 YAML 경로, validation coverage 누락을 실패시킨다. 새 family가 `ApiContracts`에 추가됐는데 key 목록에 등록되지 않으면 TypeScript exhaustiveness check도 실패한다.

## 새 family 추가 절차

| 순서 | 변경 |
| --- | --- |
| 1 | `types.ts`에 family 타입과 `ApiContracts` property를 추가한다. |
| 2 | family YAML parser를 구현한다. |
| 3 | `API_CONTRACT_FAMILY_KEYS`와 `API_CONTRACT_FAMILY_REGISTRY`에 key, 경로, parser, export 대상을 등록한다. |
| 4 | 필요한 semantic invariant를 기존 validator에 추가하거나 독립 validation stage로 등록한다. |
| 5 | committed graph가 compatibility loader와 같고 export source가 누락되지 않는지 회귀 테스트를 추가한다. |

loader의 `Promise.all`, 반환 객체 조립, CLI import, export source 상수를 다시 편집하지 않는다.

## 실패 처리

registry 자체가 잘못되면 파일을 읽기 전에 `ApiContractFamilyRegistryError`로 중단한다. 계약 파일 누락이나 parser 실패는 기존 `ApiContractLoadError` 형식을 유지해 여러 실패를 한 번에 보고한다. schema ref가 허용 경로 형식을 벗어나면 bundle 파일을 열기 전에 중단한다.

## 경계

이 구조는 backend handler, generated OpenAPI, generated SDK, live endpoint를 만들지 않는다. registry는 계약 원천의 탐색과 검증, dry-run export source 연결만 소유한다.
