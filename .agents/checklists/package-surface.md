# Package Surface Checklist

- `package.json` version source is respected.
- public export map stays limited to root, `api-contracts`, `api-export-plan`, and `contracts/*`.
- `files` whitelist does not include generated artifacts.
- README explains skeleton boundaries without promising live endpoints.
- package docs do not include real customer data, tokens, webhook secrets, or provider payloads.
- CHANGELOG is updated when package-visible behavior or contract meaning changes.
