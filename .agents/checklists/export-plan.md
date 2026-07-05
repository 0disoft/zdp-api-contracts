# Export Plan Checklist

- export plan is dry-run only.
- `writesArtifacts` remains false.
- `publishesSchemas` remains false.
- plan names source contracts and required metadata.
- plan exposes route operation id, typed fetch operation map, runtime metadata, mutation idempotency policy.
- plan does not claim generated OpenAPI, SDK, docs, or webhook schemas were written.
