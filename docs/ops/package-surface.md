# Package Surface

이 저장소는 public npm package metadata를 가진 API contract package다. package는 contract source와 운영 문서를 노출하되 generated artifact나 live endpoint를 포함하지 않는다.

## Public Surface

- root export: `src/index.ts`
- API checker export: `src/api-contracts/index.ts`
- export plan export: `src/api-export-plan/index.ts`
- contract files: `contracts/*`

## Package Files

Package files whitelist는 source package skeleton과 운영 문서만 포함한다. generated OpenAPI, generated SDK, live endpoint 정보, customer payload fixture는 포함하지 않는다.

## Versioning

`package.json` version is the source of truth. README, package metadata, public export, contract source가 package consumer에게 보이는 방식으로 바뀌면 `VALIDATION.md`의 version impact 기준을 확인한다.
