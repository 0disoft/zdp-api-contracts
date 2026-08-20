# Contract Migration Documents

호환되지 않는 계약 변경은 `v<base>-to-v<head>.md` 형식의 문서를 이 디렉터리에 추가한다.

```md
# 0.32.0에서 0.33.0으로 이전

## 변경 사항

제거되거나 의미가 달라진 operation, status, field와 영향을 받는 소비자를 적는다.

## 마이그레이션

호출 순서, SDK 수정, 배포 순서와 구버전 제거 조건을 적는다.
```

문서에는 base와 head package version을 모두 적고 최소 두 개의 `##` 절을 둔다. breaking 변경이 여러 개라면 operation 또는 schema별 하위 절로 나눈다.
