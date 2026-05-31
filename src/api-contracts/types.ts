export interface ApiContracts {
  readonly route: RouteContract;
  readonly errorEnvelope: ErrorEnvelopeContract;
  readonly webhook: WebhookContract;
}

export interface RouteContract {
  readonly status: string;
  readonly requiredPerRoute: readonly string[];
  readonly forbiddenShapes: readonly string[];
}

export interface ErrorEnvelopeContract {
  readonly schemaVersion: number;
  readonly requiredFields: readonly string[];
  readonly optionalFields: readonly string[];
  readonly forbiddenFields: readonly string[];
}

export interface WebhookContract {
  readonly status: string;
  readonly requiredControls: readonly string[];
  readonly forbiddenControls: readonly string[];
}

export interface ApiContractDiagnostic {
  readonly code: string;
  readonly file: string;
  readonly path: string;
  readonly message: string;
}

export interface ApiContractValidationResult {
  readonly ok: boolean;
  readonly diagnostics: readonly ApiContractDiagnostic[];
}
