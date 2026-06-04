export interface ApiContracts {
  readonly route: RouteContract;
  readonly errorEnvelope: ErrorEnvelopeContract;
  readonly webhook: WebhookContract;
  readonly sdkGenerationInput: SdkGenerationInputContract;
  readonly apiCatalog: ApiCatalogContract;
}

export interface RouteContract {
  readonly status: string;
  readonly requiredPerRoute: readonly string[];
  readonly allowedMethods: readonly string[];
  readonly allowedSuccessStatuses: readonly number[];
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

export interface SdkGenerationInputContract {
  readonly status: string;
  readonly sourceContracts: readonly string[];
  readonly generationTargets: readonly string[];
  readonly allowedGenerationTargets: readonly string[];
  readonly requiredRouteMetadata: readonly string[];
  readonly requiredErrorMetadata: readonly string[];
  readonly requiredWebhookMetadata: readonly string[];
  readonly forbiddenOwnership: readonly string[];
  readonly forbiddenValues: readonly string[];
}

export interface ApiCatalogContract {
  readonly status: string;
  readonly routeDefinitionRequiredFields: readonly string[];
  readonly forbiddenValues: readonly string[];
  readonly routes: readonly ApiRouteDefinition[];
}

export interface ApiRouteDefinition {
  readonly operationId: string;
  readonly serviceId: string;
  readonly resource: string;
  readonly action: string;
  readonly method: string;
  readonly path: string;
  readonly successStatuses: readonly number[];
  readonly requestSchemaRef: string;
  readonly responseSchemaRef: string;
  readonly authRequired: boolean;
  readonly permissionCheck: string;
  readonly auditEvent: string;
  readonly idempotency: string;
  readonly errorCodes: readonly string[];
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

export interface ApiExportPlanOutput {
  readonly kind: 'openapi' | 'sdk_generation_input' | 'webhook_schema' | 'docs_contract';
  readonly sourceContracts: readonly string[];
  readonly requiredMetadata: readonly string[];
  readonly forbiddenValues: readonly string[];
}

export interface ApiExportPlan {
  readonly status: 'plan-only';
  readonly writesArtifacts: false;
  readonly publishesSchemas: false;
  readonly outputs: readonly ApiExportPlanOutput[];
  readonly sdkTargets: readonly string[];
  readonly traceFields: readonly string[];
}

export interface ApiExportPlanResult {
  readonly ok: boolean;
  readonly plan: ApiExportPlan | null;
  readonly diagnostics: readonly ApiContractDiagnostic[];
}
