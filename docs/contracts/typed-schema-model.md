# Typed schema model and OpenAPI 3.1 export

## 목적

기존 `required_fields`, `optional_fields`, `secret_fields`는 필드의 존재와 비밀 취급 여부만 표현한다. SDK 생성기와 OpenAPI 소비자는 문자열, 정수, 배열, 날짜 시각, enum, null 허용 여부를 알 수 없었다. `properties`는 기존 목록을 권위 있는 필드 집합으로 유지하면서 각 필드의 실제 JSON Schema 의미를 추가한다.

## 선언 형식

```yaml
schemas:
  - id: ExampleResponse
    kind: response
    carries_secret_material: false
    required_fields:
      - state
      - items
      - expires_at
    optional_fields:
      - detail
    properties:
      state:
        type: string
        enum:
          - pending
          - completed
      items:
        type: array
        items:
          type: string
      expires_at:
        type: string
        format: date-time
      detail:
        type: object
        nullable: true
        properties:
          code:
            type: string
        required:
          - code
        additional_properties: false
```

지원 타입은 `string`, `integer`, `number`, `boolean`, `array`, `object`다. 스칼라는 `format`, `enum`, `nullable`을 사용할 수 있다. 배열은 `items`가 필수다. 객체는 재귀적인 `properties`, `required`, `additional_properties`를 사용한다.

## 일관성 규칙

`properties`를 선언한 schema는 `required_fields`와 `optional_fields`의 모든 필드를 정확히 한 번 포함해야 한다. 목록에 없는 property는 거부한다. `secret_fields`는 required 또는 optional 필드여야 한다. 배열에는 `items`가 필수다. 객체가 아닌 타입에는 객체 전용 키를 둘 수 없다. enum 값과 숫자·문자열·배열 제약은 선언 타입과 일치해야 한다.

기존 schema에 `properties`가 없으면 전환 모드에서 필드별 빈 JSON Schema와 `x-zdp-untyped: true`를 출력한다. 문서 최상단의 `x-zdp-typed-schema-coverage`와 `x-zdp-untyped-schema-refs`가 남은 마이그레이션 범위를 공개한다. `--strict`는 미타입 schema가 하나라도 있으면 실패하므로 전체 이전을 끝낸 뒤 CI 게이트로 승격할 수 있다.

## 명령

```bash
bun run openapi:check
bun run openapi:print
bun run openapi:print -- --include-restricted
bun run openapi:print -- --strict
```

`openapi:check`는 파일을 쓰지 않고 계약, typed property, OpenAPI 변환 가능 여부만 검사한다. `openapi:print`는 키를 재귀적으로 정렬한 OpenAPI 3.1 JSON을 표준 출력으로 보낸다. 기본 출력은 `export_policy`가 붙은 제한 경로를 제외한다. `--include-restricted`는 내부 검토용으로 해당 경로를 포함한다.

## 경계

이 산출물은 계약 문서다. live endpoint, 실제 인증 transport, 서버 URL, SDK runtime 구현을 선언하지 않는다. schema가 타입을 갖게 되더라도 제품 화면 payload나 backend handler의 소유권은 이 저장소로 이동하지 않는다.
