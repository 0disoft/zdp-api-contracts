# Webhook Contract Checklist

- webhook metadata includes event id, event type, and schema version.
- signature verification is explicit.
- idempotency key is explicit.
- replay policy is explicit.
- dead-letter policy is explicit.
- provider raw payload is not the standard schema.
- route catalog and SDK handoff can read webhook metadata without guessing.
