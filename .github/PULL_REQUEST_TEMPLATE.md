# Repository Pull Request

## Change

Describe the contract, template, implementation, or documentation change.

## Boundary Check

- [ ] The change stays inside this repository's documented ownership boundary.
- [ ] The change does not include secrets, tokens, API keys, or provider credentials.
- [ ] The change does not include payment payloads, payment data, or card data.
- [ ] The change does not include customer raw data, raw customer data copies, private message bodies, prompt bodies, or account identifiers.

## Compatibility

State the compatibility result from `compatibility:check`: `none`, `patch`, `feature`, or `breaking`.

For `breaking`, link `docs/migrations/v<base>-to-v<head>.md` and explain the required consumer rollout order.

## Verification

List the configured command intents or manual checks used to verify the change.
