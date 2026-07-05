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

## Non-Goals

- live endpoint base URL
- backend handler implementation
- product screen payload
- provider-specific SDK shape
- hidden auth or payment policy in description text

Route가 추가되면 `contracts/route-contract.yaml`, `contracts/apis/catalog.yaml`, service-specific catalog, SDK generation input, export plan이 서로 같은 metadata를 읽을 수 있어야 한다.
