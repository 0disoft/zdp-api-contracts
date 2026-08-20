# Package Surface

이 저장소는 public npm package metadata를 가진 API contract package다. package는 contract source와 운영 문서를 노출하되 generated OpenAPI, generated SDK 또는 live endpoint를 포함하지 않는다.

## Public Surface

- root source: `src/index.ts`; consumer export: `dist/index.js` and `dist/index.d.ts`
- API checker source: `src/api-contracts/index.ts`; consumer export: `dist/api-contracts/index.js` and declaration
- export plan source: `src/api-export-plan/index.ts`; consumer export: `dist/api-export-plan/index.js` and declaration
- contract files: `contracts/*`
- calculator contract types: root와 `api-contracts` export를 통한 `CalculatorCatalogContract` 계열
- calculator source contract: `contracts/calculators/catalog.yaml`

## Package Files

Package files whitelist는 빌드된 `dist/`, 계약 원문과 운영 문서만 포함한다. TypeScript source, generated OpenAPI, generated SDK, live endpoint 정보, customer payload fixture는 포함하지 않는다. 공개 parser의 `yaml` 의존성은 package runtime dependency로 명시한다. npm publish는 `prepack`에서 `dist/`를 재생성하고, commit SHA로 고정한 Git dependency는 검증 후 커밋된 같은 `dist/`를 소비한다. Tarball smoke는 빈 Node 소비자에서 실제 import와 계약 로딩을 확인한다.

## Generated Dist Policy

`src/`가 구현 원천이고 `dist/`는 npm과 Git dependency 소비자를 위한 추적된 compiler output이다. `dist/`를 직접 수정하지 않는다. `bun run dist:check`는 기존 `dist/`를 지우고 TypeScript 출력을 다시 생성한 뒤 tracked modification, deletion과 untracked addition이 하나라도 남으면 실패한다. pull request CI와 tag release workflow가 모두 이 검사를 실행하므로 source와 공개 package bytes가 다른 상태로 병합하거나 배포할 수 없다.

## Runtime Support

공개 JavaScript package는 Node.js 22와 24를 지원한다. `package.json#engines.node`가 이 범위를 선언하고 CI는 두 메이저에서 각각 tarball을 설치해 root, `api-contracts`, `api-export-plan`, raw contract subpath를 실제 Node process로 소비한다. 새 Node 메이저는 packed-consumer job을 먼저 통과시킨 뒤 engine 범위와 matrix를 같은 변경에서 함께 승격한다.

## Versioning

`package.json` version is the source of truth. README, package metadata, public export, contract source가 package consumer에게 보이는 방식으로 바뀌면 `VALIDATION.md`의 version impact 기준을 확인한다.
