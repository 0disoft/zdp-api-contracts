# Route Contract

Route contract는 API 구현 전에 각 route가 가져야 할 최소 metadata를 고정한다.

## Required Metadata

- resource and action
- method and path
- request and response schema references
- auth requirement and permission check
- audit event
- idempotency
- owner and tenant boundary
- request id and trace id requirement
- session effect
- credential policy
- success statuses
- error codes

## No Content

`route_contract.no_content_success_statuses`가 본문을 가질 수 없는 성공 상태를 정의한다. 현재 `204`만 허용한다.

- `204` route는 `response_schema_ref: null`을 명시해야 한다.
- 본문이 있는 성공 상태는 유효한 response schema ref를 가져야 한다.
- 단일 `response_schema_ref` 모델에서는 `204`와 본문이 있는 성공 상태를 한 route에 섞지 않는다.
- `204`에서도 request id, trace id와 리소스 metadata는 header로 전달할 수 있지만 response content와 trailer는 만들지 않는다.

## Non-Goals

- live endpoint base URL
- backend handler implementation
- product screen payload
- provider-specific SDK shape
- hidden auth or payment policy in description text

Route가 추가되면 `contracts/route-contract.yaml`, `contracts/apis/catalog.yaml`, service-specific catalog, SDK generation input, export plan이 서로 같은 metadata를 읽을 수 있어야 한다.
