# SDK Generation Checklist

- generated SDK source is not committed as contract source.
- active generation targets are in `generation_targets`.
- candidate targets are only in `allowed_generation_targets`.
- required route metadata matches route contract and API catalog.
- required error metadata includes request id and trace id.
- typed fetch operation map can be derived from route catalog.
- SDK does not own token storage, final authorization, product business logic, provider credential storage, or refresh token storage.
- forbidden values from `VALIDATION.md` do not appear in SDK input.
