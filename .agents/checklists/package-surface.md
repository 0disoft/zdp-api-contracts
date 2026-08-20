# Package Surface Checklist

- `package.json` version source is respected.
- public export map stays limited to root, `api-contracts`, `api-export-plan`, and `contracts/*`.
- `files` whitelist contains reviewed compiler output under `dist/`, contract sources, and operating documents only.
- `dist/` is regenerated from `src/` and `bun run dist:check` reports a clean worktree before merge or release.
- generated OpenAPI, generated SDK, live endpoint data, and customer payload fixtures stay outside the package.
- declared Node engine majors exactly match the CI packed-consumer matrix.
- README explains skeleton boundaries without promising live endpoints.
- package docs do not include real customer data, tokens, webhook secrets, or provider payloads.
- CHANGELOG is updated when package-visible behavior or contract meaning changes.
