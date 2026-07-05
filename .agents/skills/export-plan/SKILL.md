# Export Plan Skill

## Use When

OpenAPI, SDK, webhook schema, docs contract export planning or dry-run plan output changes.

## Read Order

1. `AGENTS.md`
2. `contracts/sdk-generation-input.yaml`
3. `src/api-export-plan/*`
4. `scripts/plan-api-exports.ts`
5. `tests/api-export-plan.test.ts`
6. `README.md`
7. `VALIDATION.md`

## Contract

- export plan is dry-run only.
- generated artifacts are not written.
- schema publish is not performed.
- plan output must expose required metadata and forbidden ownership boundaries clearly enough for downstream generators.

## Verification

- Use configured intent `zdp_architecture_validate_api_contracts_repository`.
- Missing configured package-local export-plan verification should be reported instead of replaced by raw command execution.
