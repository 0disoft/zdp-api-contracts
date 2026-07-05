# SDK Generation Skill

## Use When

SDK generation input, typed fetch operation map metadata, language target policy, or generator handoff changes.

## Read Order

1. `AGENTS.md`
2. `contracts/sdk-generation-input.yaml`
3. `contracts/route-contract.yaml`
4. `contracts/error-envelope.yaml`
5. `contracts/webhook-contract.yaml`
6. `src/api-export-plan/*`
7. `tests/api-export-plan.test.ts`
8. `VALIDATION.md`

## Contract

- SDK generation input is a handoff contract, not generated SDK source.
- SDKs do not own runtime token storage, final authorization, provider credential storage, or product business logic.
- typed fetch metadata must be derivable from route catalog and standard error metadata.

## Verification

- Use configured intent `zdp_architecture_validate_api_contracts_repository`.
- Check package version impact when README, package metadata, exported surface, or contract source changes.
