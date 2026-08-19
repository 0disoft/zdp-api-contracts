# 중앙 Error Code Catalog

`contracts/error-code-catalog.yaml`은 route가 반환할 수 있는 안정 오류 코드를 한곳에서 관리한다. Route catalog는 오류 코드의 사용처를 선언하고, 이 catalog는 각 코드의 HTTP 의미와 소비자 노출 정책을 소유한다.

## 계약 필드

| 필드 | 의미 |
| --- | --- |
| `code` | API와 SDK가 분기 기준으로 사용하는 안정적인 snake_case 식별자 |
| `http_status` | error envelope을 반환할 때의 기본 HTTP 상태 |
| `retryable` | 동일 작업을 재시도할 수 있는 오류인지 여부 |
| `user_visible` | 제품이 해당 오류 의미를 사용자에게 직접 노출해도 되는지 여부 |
| `localization_key` | 다국어 메시지 조회 키. 생략하면 `api.errors.<code>`로 결정된다 |
| `owner_service_id` | 코드 의미와 폐기 결정을 소유하는 서비스. 여러 서비스가 공유하면 `shared`를 사용한다 |
| `lifecycle_status` | `active`, `deprecated`, `retired` 중 하나 |

`defaults`는 반복되는 `retryable`, `user_visible`, localization prefix와 lifecycle을 고정한다. Entry가 해당 값을 명시하면 그 entry에만 override된다. 파서가 반환하는 `ErrorCodeCatalogEntry`는 defaults가 적용된 완전한 메타데이터다.

## 검증 규칙

모든 route의 `error_codes`는 catalog에 등록돼야 한다. 서비스 전용 코드는 소유 서비스의 route에서만 사용할 수 있고 `shared` 코드는 여러 서비스에서 사용할 수 있다. `retired` 코드는 route에서 참조할 수 없다. Catalog는 코드 순으로 정렬하며 중복 코드, 400에서 599 범위를 벗어난 상태, 잘못된 localization key, 알 수 없는 owner service를 거부한다.

`user_visible: false`는 오류 자체를 숨기라는 뜻이다. 제품은 해당 코드를 로그와 관측성에는 남길 수 있지만 사용자 메시지는 일반 오류로 치환해야 한다. `retryable: true`는 무조건 즉시 재시도하라는 뜻이 아니다. 제품과 SDK는 `Retry-After`, backoff, 작업 상태 재조회 같은 route별 정책을 함께 적용해야 한다.

## 변경 절차

새 route 오류를 추가할 때 같은 PR에서 catalog entry를 먼저 등록한다. 기존 코드의 의미를 바꾸지 말고 새 코드를 만든다. 폐기할 때는 먼저 `deprecated`로 바꾸고 모든 route와 SDK 소비자를 이전한 뒤 `retired`로 승격한다. HTTP status, 사용자 노출, 소유 서비스 변경도 소비자 동작을 바꾸므로 계약 변경으로 취급한다.

## 소비자 API

```ts
import {
  loadApiContracts,
  loadErrorCodeCatalog,
  validateErrorCodeCatalog
} from 'zdp-api-contracts/api-contracts';

const contracts = await loadApiContracts();
const errorCodes = await loadErrorCodeCatalog();
const result = validateErrorCodeCatalog(errorCodes, contracts);

if (!result.ok) {
  throw new Error(result.diagnostics.map((item) => item.code).join(', '));
}
```
