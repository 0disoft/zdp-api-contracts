# Context Map

## Source Surfaces

| Surface | Responsibility |
| --- | --- |
| `AGENTS.md` | API 계약 저장소 작업 원칙과 금지선 |
| `service.yaml` | 운영 경계, release/version source, human review, policy gate |
| `contracts/route-contract.yaml` | route별 필수 metadata와 forbidden shape |
| `contracts/apis/catalog.yaml` | 실제 service route catalog 자리 |
| `contracts/apis/core-api/auth-session.yaml` | auth/session promotion prerequisite |
| `contracts/apis/core-api/sensitive-action-authorization.yaml` | 민감 행위 receipt의 assurance/access/product guard 분리와 상태·소비 계약 |
| `contracts/error-envelope.yaml` | 표준 오류 응답 shape |
| `contracts/webhook-contract.yaml` | webhook signature, idempotency, replay, dead-letter handoff |
| `contracts/sdk-generation-input.yaml` | SDK generator가 읽을 source contract와 금지 ownership |
| `contracts/calculators/catalog.yaml` | 국가 공통 계산기 정의, 표준 입력·결과, 오류와 버전 handoff |
| `src/api-contracts/*` | contract parser and validator |
| `src/api-export-plan/*` | dry-run export plan builder |
| `scripts/*` | local checker and export plan entrypoints |
| `package.json` | public package metadata, export map, version source |

## Read Paths

- route change: `AGENTS.md` -> `CHECKLIST.md` -> `contracts/route-contract.yaml` -> `contracts/apis/catalog.yaml` -> related route catalog -> `VALIDATION.md`
- sensitive-action authorization change: `AGENTS.md` -> `CHECKLIST.md` -> `contracts/apis/core-api/sensitive-action-authorization.yaml` -> `contracts/sdk-generation-input.yaml` -> parser/tests -> `docs/contracts/sensitive-action-authorization.md` -> `VALIDATION.md`
- error change: `AGENTS.md` -> `contracts/error-envelope.yaml` -> `contracts/sdk-generation-input.yaml` -> validator tests -> `VALIDATION.md`
- SDK handoff change: `AGENTS.md` -> `contracts/sdk-generation-input.yaml` -> `src/api-export-plan/*` -> `README.md`
- package surface change: `package.json` -> `src/index.ts` -> README package section -> `VALIDATION.md`
- calculator contract change: `AGENTS.md` -> `BOUNDARY.md` -> `contracts/calculators/catalog.yaml` -> parser/validator/tests -> `docs/contracts/calculator-contract.md` -> `VALIDATION.md`
