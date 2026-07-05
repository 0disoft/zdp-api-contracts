# Error Envelope Checklist

- error shape has `code`, `message`, `request_id`, `trace_id`.
- optional fields are bounded and documented.
- provider raw error is not exposed.
- customer private payload is not exposed.
- secrets, headers, plaintext refresh tokens, stack traces are forbidden.
- SDK generation input still requires the same error metadata.
- docs and README do not define a second incompatible error shape.
