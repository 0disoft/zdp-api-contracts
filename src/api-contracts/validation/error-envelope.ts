import type { ApiContractDiagnostic, ApiContracts } from '../types.js';

import { CANONICAL_FORBIDDEN_VALUES } from '../forbidden-values.js';

export const REQUIRED_ERROR_FIELDS = [
  'code',
  'message',
  'request_id',
  'trace_id'
] as const;

export const FORBIDDEN_ERROR_FIELDS = CANONICAL_FORBIDDEN_VALUES;

export function validateErrorEnvelopeContract(
  contracts: ApiContracts,
  diagnostics: ApiContractDiagnostic[]
): void {
  if (contracts.errorEnvelope.schemaVersion !== 1) {
    diagnostics.push({
      code: 'API_ERROR_SCHEMA_VERSION_INVALID',
      file: 'contracts/error-envelope.yaml',
      path: 'error_envelope.schema_version',
      message: 'Error envelope schema_version must remain 1 until a migration exists.'
    });
  }

  for (const field of REQUIRED_ERROR_FIELDS) {
    if (!contracts.errorEnvelope.requiredFields.includes(field)) {
      diagnostics.push({
        code: 'API_ERROR_REQUIRED_FIELD_MISSING',
        file: 'contracts/error-envelope.yaml',
        path: 'error_envelope.required_fields',
        message: `Error envelope must require \`${field}\`.`
      });
    }
  }

  for (const field of FORBIDDEN_ERROR_FIELDS) {
    if (!contracts.errorEnvelope.forbiddenFields.includes(field)) {
      diagnostics.push({
        code: 'API_ERROR_FORBIDDEN_FIELD_MISSING',
        file: 'contracts/error-envelope.yaml',
        path: 'error_envelope.forbidden_fields',
        message: `Error envelope must forbid \`${field}\`.`
      });
    }
  }
}
