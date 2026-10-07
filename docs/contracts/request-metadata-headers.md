# 요청 메타데이터 헤더

`contracts/route-contract.yaml`의 `request_metadata_headers`가 요청 식별자,
추적 식별자, 멱등 키의 HTTP 헤더 이름을 소유한다. 기본 이름은
`X-Request-ID`, `X-Trace-ID`, `Idempotency-Key`이며 서비스별 transport는
`service_request_metadata_headers`로 명시한다. Abuse는 추적 식별자를
W3C `traceparent`로 전달한다.

OpenAPI는 각 route의 `request_id_required`, `trace_id_required`,
`required_idempotency_key` 여부를 읽고 필요한 헤더를 표준 `parameters`에
선언한다. GET이라는 이유만으로 멱등 키를 요구하지 않는다.
Access Decision의 명시적 HTTP 프로파일은 같은 이름의 일반 헤더 선언을
대체하며 해당 프로파일의 길이 상한과 응답 정책을 유지한다.

헤더 이름은 유효한 HTTP 이름이어야 하며 대소문자를 무시했을 때 중복될 수 없다.
인증과 쿠키 헤더는 요청 메타데이터 매핑으로 선언하지 않는다.
기존 파서 입력은 이 선택적 매핑 없이도 읽을 수 있다. 호환성 검사는
매핑 추가를 기능 추가로, 기존 매핑의 변경·삭제를 호환성 파괴로 기록한다.
