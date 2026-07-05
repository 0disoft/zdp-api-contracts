# Route Contract Skill

## Use When

Route metadata, route catalog, auth/session route contract, or route validator behavior changes.

## Read Order

1. `AGENTS.md`
2. `CHECKLIST.md`
3. `contracts/route-contract.yaml`
4. `contracts/apis/catalog.yaml`
5. related `contracts/apis/**`
6. `src/api-contracts/*`
7. `tests/api-contracts.test.ts`
8. `VALIDATION.md`

## Contract

- route metadata must express resource, action, method, path, auth, permission, audit, idempotency, owner, tenant, request id, trace id, session effect, credential policy, success statuses, and error codes.
- product handler shape is not a contract source.
- live base URL remains out of scope.

## Verification

- Use configured intent `zdp_architecture_validate_api_contracts_repository`.
- Use `zdp_architecture_validate_fast` when architecture catalog or linter policy changes are part of the same work.
