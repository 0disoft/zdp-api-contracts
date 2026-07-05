# Route Contract Checklist

- route has `operation_id`, resource, action, method, path, request schema ref, response schema ref.
- route declares auth requirement and permission check.
- route declares audit event and owner boundary.
- mutation route declares idempotency policy.
- route declares tenant boundary, request id requirement, trace id requirement.
- route declares session effect and credential policy.
- success status is in allowed success status list.
- error codes map to standard error envelope.
- route does not include forbidden values from `VALIDATION.md`.
