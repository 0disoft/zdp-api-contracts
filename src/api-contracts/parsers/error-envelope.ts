import type { ErrorEnvelopeContract } from '../types.js';

import { parseYamlObject, requiredNumber, requiredObject, requiredStringList } from './shared.js';

export function parseErrorEnvelopeContract(
  source: string
): ErrorEnvelopeContract {
  const data = parseYamlObject(source, 'contracts/error-envelope.yaml');
  const errorEnvelope = requiredObject(
    data,
    'error_envelope',
    'contracts/error-envelope.yaml'
  );

  return {
    schemaVersion: requiredNumber(
      errorEnvelope,
      'schema_version',
      'contracts/error-envelope.yaml#error_envelope'
    ),
    requiredFields: requiredStringList(
      errorEnvelope,
      'required_fields',
      'contracts/error-envelope.yaml#error_envelope'
    ),
    optionalFields: requiredStringList(
      errorEnvelope,
      'optional_fields',
      'contracts/error-envelope.yaml#error_envelope'
    ),
    forbiddenFields: requiredStringList(
      errorEnvelope,
      'forbidden_fields',
      'contracts/error-envelope.yaml#error_envelope'
    )
  };
}
