export interface ApiContracts {
    readonly route: RouteContract;
    readonly errorEnvelope: ErrorEnvelopeContract;
    readonly webhook: WebhookContract;
    readonly sdkGenerationInput: SdkGenerationInputContract;
    readonly apiCatalog: ApiCatalogContract;
    readonly schemaBundles: readonly ApiSchemaBundleContract[];
    readonly productLinkHandoff: ProductLinkHandoffContract;
    readonly calculatorCatalog: CalculatorCatalogContract;
    readonly calculatorConformance: CalculatorConformanceContract;
}
export interface ProductLinkHandoffContract {
    readonly schemaVersion: number;
    readonly status: string;
    readonly ownerBoundary: string;
    readonly challengeTtlSeconds: number;
    readonly minimumPollIntervalSeconds: number;
    readonly proofMethod: string;
    readonly proofVerifierPolicy: string;
    readonly proofChallengePolicy: string;
    readonly lifecycleStates: readonly string[];
    readonly terminalStates: readonly string[];
    readonly transitions: readonly ProductLinkTransition[];
    readonly singleUseExchange: boolean;
    readonly correlationBinding: string;
    readonly requiredBindings: readonly string[];
    readonly exchangeResponseRefs: readonly string[];
    readonly forbiddenValues: readonly string[];
    readonly localOnlyPolicy: string;
}
export interface ProductLinkTransition {
    readonly from: string;
    readonly event: string;
    readonly to: string;
}
export interface CalculatorConformanceContract {
    readonly schemaVersion: number;
    readonly contractVersion: string;
    readonly engineVersionRange: string;
    readonly decimalInputPolicy: string;
    readonly maxInputDigits: number;
    readonly maxDecimalPlaces: number;
    readonly roundingMode: string;
    readonly cases: readonly CalculatorConformanceCase[];
}
export interface CalculatorConformanceCase {
    readonly id: string;
    readonly calculatorId: string;
    readonly input: Readonly<Record<string, CalculatorConformanceInputValue>>;
    readonly options: CalculatorConformanceOptions;
    readonly expected: CalculatorConformanceExpectation;
}
export type CalculatorConformanceInputValue = string | CalculatorConformanceUnitValue;
export interface CalculatorConformanceUnitValue {
    readonly value: string;
    readonly unit: string;
}
export interface CalculatorConformanceOptions {
    readonly decimalPlaces: number;
}
export type CalculatorConformanceExpectation = {
    readonly status: 'success';
    readonly output: Readonly<Record<string, CalculatorConformanceUnitValue>>;
} | {
    readonly status: 'error';
    readonly errorCode: string;
};
export interface CalculatorCatalogContract {
    readonly schemaVersion: number;
    readonly status: string;
    readonly contractVersion: string;
    readonly ownerBoundary: string;
    readonly requiredDefinitionFields: readonly string[];
    readonly allowedLifecycleStatuses: readonly string[];
    readonly allowedValueKinds: readonly string[];
    readonly allowedUnitDimensions: readonly string[];
    readonly allowedUnitPolicies: readonly string[];
    readonly stableErrorCodes: readonly string[];
    readonly definitions: readonly CalculatorDefinition[];
}
export interface CalculatorDefinition {
    readonly id: string;
    readonly lifecycleStatus: string;
    readonly contractVersion: string;
    readonly compatibleEngineVersions: readonly string[];
    readonly jurisdiction: string;
    readonly precisionPolicy: string;
    readonly roundingPolicy: string;
    readonly inputs: readonly CalculatorInputDefinition[];
    readonly outputs: readonly CalculatorOutputDefinition[];
    readonly errorCodes: readonly string[];
    readonly semanticRules: readonly string[];
}
export interface CalculatorInputDefinition {
    readonly id: string;
    readonly valueKind: string;
    readonly unitDimension: string;
    readonly unitPolicy: string;
    readonly unitOptions: readonly string[];
    readonly allowedValues: readonly string[];
    readonly required: boolean;
    readonly domain: string;
}
export interface CalculatorOutputDefinition {
    readonly id: string;
    readonly valueKind: string;
    readonly unitDimension: string;
    readonly unitPolicy: string;
    readonly unitOptions: readonly string[];
}
export interface RouteContract {
    readonly status: string;
    readonly requiredPerRoute: readonly string[];
    readonly allowedMethods: readonly string[];
    readonly allowedSuccessStatuses: readonly number[];
    readonly forbiddenShapes: readonly string[];
    readonly allowedSessionEffects: readonly string[];
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
    readonly requiredClientRuntimeMetadata: readonly string[];
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
    readonly ownerBoundary: string;
    readonly tenantBoundary: string;
    readonly requestIdRequired: boolean;
    readonly traceIdRequired: boolean;
    readonly sessionEffect: string;
    readonly credentialPolicy: string;
    readonly errorCodes: readonly string[];
}
export interface ApiSchemaBundleContract {
    readonly file: string;
    readonly serviceId: string;
    readonly ownerBoundary: string;
    readonly status: string;
    readonly purpose: string;
    readonly commonEnvelope: ApiSchemaCommonEnvelope;
    readonly schemas: readonly ApiSchemaDefinition[];
}
export interface ApiSchemaCommonEnvelope {
    readonly requiredRequestMetadata: readonly string[];
    readonly requiredResponseMetadata: readonly string[];
    readonly forbiddenPayloadValues: readonly string[];
}
export interface ApiSchemaDefinition {
    readonly id: string;
    readonly kind: string;
    readonly carriesSecretMaterial: boolean;
    readonly secretMaterialPolicy: string | null;
    readonly sessionEffect: string | null;
    readonly requiredFields: readonly string[];
    readonly secretFields: readonly string[];
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
    readonly clientRuntimeMetadata: readonly string[];
    readonly operationIds: readonly string[];
    readonly typedFetchOperationMap: Readonly<Record<string, ApiTypedFetchOperation>>;
    readonly schemaModelMap: Readonly<Record<string, ApiSchemaModel>>;
    readonly mutatingMethodsRequiringIdempotency: readonly string[];
    readonly requiredMutationIdempotencyPolicy: string;
}
export interface ApiExportPlanResult {
    readonly ok: boolean;
    readonly plan: ApiExportPlan | null;
    readonly diagnostics: readonly ApiContractDiagnostic[];
}
export interface ApiTypedFetchOperation {
    readonly operationId: string;
    readonly method: string;
    readonly path: string;
    readonly successStatuses: readonly number[];
    readonly requestSchemaRef: string;
    readonly responseSchemaRef: string;
    readonly authRequired: boolean;
    readonly idempotency: string;
    readonly requestIdRequired: boolean;
    readonly traceIdRequired: boolean;
    readonly errorCodes: readonly string[];
}
export type ApiSchemaModelKind = 'request' | 'response';
export interface ApiSchemaModel {
    readonly schemaRef: string;
    readonly schemaId: string;
    readonly sourceContract: string;
    readonly serviceId: string;
    readonly ownerBoundary: string;
    readonly status: string;
    readonly kind: ApiSchemaModelKind;
    readonly carriesSecretMaterial: boolean;
    readonly requiredFields: readonly string[];
    readonly secretFields: readonly string[];
    readonly sessionEffect: string | null;
}
//# sourceMappingURL=types.d.ts.map