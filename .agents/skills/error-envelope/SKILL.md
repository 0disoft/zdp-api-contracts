# Error Envelope Skill

## Use When

Standard error envelope, error metadata, error docs, SDK error normalization, or forbidden error values change.

## Read Order

1. `AGENTS.md`
2. `contracts/error-envelope.yaml`
3. `contracts/sdk-generation-input.yaml`
4. `src/api-contracts/validator.ts`
5. `tests/api-contracts.test.ts`
6. `VALIDATION.md`

## Contract

- every public error shape keeps `code`, `message`, `request_id`, and `trace_id`.
- raw provider errors, secrets, stack traces, headers, plaintext refresh tokens, and customer payloads are forbidden.
- SDK metadata does not drift from the standard envelope.

## Verification

- Use configured intent `zdp_architecture_validate_api_contracts_repository`.
- Package-local checks need explicit configured intent coverage before being treated as agent verification.
