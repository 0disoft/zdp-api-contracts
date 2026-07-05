# Documentation Router

이 폴더는 API 계약 저장소를 처음 보는 사람이 계약별로 읽을 문서를 고르는 라우터다.

| 목적 | 문서 |
| --- | --- |
| 작업 전 체크리스트 | `../CHECKLIST.md` |
| 검증 기준 | `../VALIDATION.md` |
| route 계약 | `contracts/route-contract.md` |
| error envelope | `contracts/error-envelope.md` |
| webhook handoff | `contracts/webhook-contract.md` |
| SDK generation input | `contracts/sdk-generation.md` |
| export dry-run plan | `ops/export-plan.md` |
| package surface | `ops/package-surface.md` |

## Boundary

이 저장소는 API 계약 skeleton, route metadata, error envelope, webhook handoff, SDK generation input, export plan을 소유한다. live API endpoint, backend handler, generated SDK source, product screen payload는 소유하지 않는다.
