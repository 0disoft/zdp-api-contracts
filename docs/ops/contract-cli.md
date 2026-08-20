# Contract CLI

`zdp-api-contracts` npm package는 저장소 내부 스크립트에 의존하지 않는 Node CLI를 제공한다. CLI는 package의 `contracts/` 원천을 검증하고, 선택적으로 한 서비스의 OpenAPI 문서가 route catalog와 어긋나는지 검사한다. OpenAPI 문서를 계약 원천으로 승격하거나 파일을 생성·게시하지 않는다.

## 기본 사용

```bash
npm install --save-dev zdp-api-contracts
npx zdp-api-contracts --root node_modules/zdp-api-contracts
```

`--root`는 `contracts/`가 들어 있는 저장소 또는 설치된 package 디렉터리다. `--openapi`와 `--output` 상대 경로는 CLI를 실행한 현재 디렉터리를 기준으로 해석한다.

## CI 출력

| 명령 | 결과 |
| --- | --- |
| `npx zdp-api-contracts --root node_modules/zdp-api-contracts --format json` | 안정적인 `schemaVersion: 1` JSON report를 stdout에 출력한다. |
| `npx zdp-api-contracts --root node_modules/zdp-api-contracts --format sarif --output artifacts/api-contracts.sarif` | SARIF 2.1.0 report를 지정한 파일에 기록한다. |
| `npx zdp-api-contracts --root node_modules/zdp-api-contracts --output -` | 명시적으로 stdout에 text report를 출력한다. |

JSON report는 전체 `ok`, 계약 검증 결과인 `contractValidation`, 선택적 OpenAPI 결과인 `openApiComparison`을 분리한다. SARIF rule ID는 기존 contract diagnostic code와 OpenAPI drift diagnostic code를 그대로 사용한다.

## OpenAPI와 route catalog 대조

```bash
npx zdp-api-contracts \
  --root node_modules/zdp-api-contracts \
  --openapi openapi/core-api.yaml \
  --service core-api \
  --format sarif \
  --output artifacts/core-api-contracts.sarif
```

`--service`를 생략하려면 OpenAPI root 또는 `info`에 `x-zdp-service-id`를 선언해야 한다. CLI 인자와 문서 선언이 함께 있으면 두 값이 정확히 같아야 한다.

대조 범위는 service ID, HTTP method, path, `operationId`, 명시적인 2xx response status다. route catalog에 없는 OpenAPI operation, OpenAPI에 없는 catalog route, 중복 `operationId`, `2XX` 범위 응답, path item 또는 operation `$ref`는 실패한다. request/response schema 내부 구조, 인증 구현, handler 동작과 live endpoint 준비 상태는 이 검사로 승인하지 않는다.

## 종료 코드

| 코드 | 의미 |
| --- | --- |
| `0` | 요청한 검사가 모두 통과했다. |
| `1` | 계약 검증, OpenAPI 대조 또는 report 기록이 실패했다. |
| `2` | CLI 인자가 잘못됐다. |
