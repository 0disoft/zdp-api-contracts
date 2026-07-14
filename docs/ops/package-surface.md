# Package Surface

이 저장소는 public npm package metadata를 가진 API contract package다. package는 contract source와 운영 문서를 노출하되 generated artifact나 live endpoint를 포함하지 않는다.

## Public Surface

- root source: `src/index.ts`; consumer export: `dist/index.js` and `dist/index.d.ts`
- API checker source: `src/api-contracts/index.ts`; consumer export: `dist/api-contracts/index.js` and declaration
- export plan source: `src/api-export-plan/index.ts`; consumer export: `dist/api-export-plan/index.js` and declaration
- contract files: `contracts/*`
- calculator contract types: root와 `api-contracts` export를 통한 `CalculatorCatalogContract` 계열
- calculator source contract: `contracts/calculators/catalog.yaml`

## Package Files

Package files whitelist는 빌드된 `dist/`, 계약 원문과 운영 문서만 포함한다. TypeScript source, generated OpenAPI, generated SDK, live endpoint 정보, customer payload fixture는 포함하지 않는다. 공개 parser의 `yaml` 의존성은 package runtime dependency로 명시한다. npm publish는 `prepack`에서 `dist/`를 재생성하고, commit SHA로 고정한 Git dependency는 검증 후 커밋된 같은 `dist/`를 소비한다. Tarball smoke는 빈 Node 소비자에서 실제 import와 계약 로딩을 확인한다.

## Versioning

`package.json` version is the source of truth. README, package metadata, public export, contract source가 package consumer에게 보이는 방식으로 바뀌면 `VALIDATION.md`의 version impact 기준을 확인한다.
