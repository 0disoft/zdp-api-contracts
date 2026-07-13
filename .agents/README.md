# Agent Guide

이 디렉터리는 ssealed식 agent surface를 API 계약 저장소에 맞춘 것이다. 실행 권한을 만들지 않고, 계약별 읽기 순서와 완료 기준을 알려준다.

## Route

| 작업 | 먼저 읽을 파일 |
| --- | --- |
| route catalog 또는 route contract 수정 | `.agents/skills/route-contract/SKILL.md` |
| standard error shape 수정 | `.agents/skills/error-envelope/SKILL.md` |
| webhook schema handoff 수정 | `.agents/checklists/webhook-contract.md` |
| SDK generation input 수정 | `.agents/skills/sdk-generation/SKILL.md` |
| export dry-run plan 수정 | `.agents/skills/export-plan/SKILL.md` |
| package metadata 또는 README 수정 | `.agents/checklists/package-surface.md` |
| 계산기 정의, 입력·결과·오류·버전 계약 수정 | `CHECKLIST.md`의 Calculator Contract와 `docs/contracts/calculator-contract.md` |

## Boundaries

- live API endpoint를 만들지 않는다.
- backend handler를 구현하지 않는다.
- generated SDK source를 계약 원천으로 삼지 않는다.
- token, webhook secret, customer payload, provider response payload를 fixture나 예시에 넣지 않는다.
- 계산기 계약에 제품 화면 payload, 로케일 문자열, 계산 함수를 넣지 않는다.
