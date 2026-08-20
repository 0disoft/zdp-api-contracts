# Package Surface Checklist

- `package.json` version source is respected.
- public export map stays limited to root, `api-contracts`, `api-export-plan`, and `contracts/*`.
- npm bin points to built Node-compatible ESM and is exercised by tarball smoke.
- `files` whitelist does not include generated artifacts.
- README preserves skeleton boundaries without promising live endpoints.
- package docs explain public CLI behavior without treating OpenAPI as a live contract source.
- package docs do not include real customer data, tokens, webhook secrets, or provider payloads.
- CHANGELOG is updated when package-visible behavior or contract meaning changes.
