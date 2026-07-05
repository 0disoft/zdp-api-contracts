# Export Plan

Export plan은 OpenAPI, SDK generation input, webhook schema, docs contract 산출 계획을 dry-run으로 보여준다.

## Required Behavior

- generated artifact를 쓰지 않는다.
- schema를 publish하지 않는다.
- source contract와 required metadata를 나열한다.
- route operation id와 typed fetch operation map metadata를 보여준다.
- mutation idempotency policy와 error trace field를 빠뜨리지 않는다.

## Failure Signals

- `writesArtifacts`가 true다.
- `publishesSchemas`가 true다.
- route contract에는 있는 permission, audit, idempotency metadata가 plan에서 사라졌다.
- error envelope에는 있는 `trace_id`가 docs 또는 SDK 계획에서 사라졌다.
- webhook replay나 dead-letter metadata가 downstream handoff에서 빠졌다.
