# Error Envelope

Standard error envelope는 API, docs, SDK가 같은 오류 shape를 쓰게 하는 source contract다.

## Required Fields

- `code`
- `message`
- `request_id`
- `trace_id`

## Optional Fields

- `details`
- `retry_after_seconds`
- `documentation_url`

## Forbidden Fields

- raw customer payload
- raw provider error
- provider secret
- authorization header
- cookie header
- refresh token plaintext
- stack trace
- screen component payload

SDK나 docs가 별도 오류 shape를 만들면 client가 같은 실패를 다르게 해석한다. 그래서 `contracts/error-envelope.yaml`이 source of truth다.
