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
| calculator contract | `contracts/calculator-contract.md` |
| 데스크톱 제품 계정 연결 | `contracts/desktop-product-link.md` |
| 민감 행위 authorization receipt | `contracts/sensitive-action-authorization.md` |
| Core 접근 판정 | `contracts/access-decision.md` |
| 공통 abuse challenge | `contracts/abuse-challenge.md` |
| 웹 제품 OIDC 로그인 handoff | `contracts/oidc-product-session.md` |
| OIDC client registry와 첫 staging runtime | `contracts/oidc-client-registry-and-runtime.md` |
| 공통 귤 충전과 복귀 | `contracts/credit-purchase.md` |
| 공통 고객 정책 레지스트리 | `contracts/customer-policy-registry.md` |

## Boundary

이 저장소는 API 계약 skeleton, route metadata, error envelope, webhook handoff, SDK generation input, export plan, Core 접근 판정, 공통 abuse challenge, 공통 귤 충전, 공통 고객 정책 레지스트리, 데스크톱 제품 계정 연결, OIDC client/runtime Proposed profile과 교차 제품 계산기 정의 계약을 소유한다. live API endpoint, backend handler, challenge provider 구현, 최종 authorization 구현, generated SDK source, 계산 함수, product screen payload는 소유하지 않는다.
