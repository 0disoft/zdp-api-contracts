export interface ApiContracts {
    readonly route: RouteContract;
    readonly errorEnvelope: ErrorEnvelopeContract;
    readonly webhook: WebhookContract;
    readonly sdkGenerationInput: SdkGenerationInputContract;
    readonly apiCatalog: ApiCatalogContract;
    readonly schemaBundles: readonly ApiSchemaBundleContract[];
    readonly creditPurchase: CreditPurchaseContract;
    readonly abuseChallenge: AbuseChallengeContract;
    readonly accessDecision: AccessDecisionContract;
    readonly productLinkHandoff: ProductLinkHandoffContract;
    readonly sensitiveActionAuthorization: SensitiveActionAuthorizationContract;
    readonly oidcProductSession: OidcProductSessionContract;
    readonly oidcClientRegistry: OidcClientRegistryContract;
    readonly oidcProviderRuntime: OidcProviderRuntimeContract;
    readonly calculatorCatalog: CalculatorCatalogContract;
    readonly calculatorConformance: CalculatorConformanceContract;
}
export interface AbuseChallengeContract {
    readonly schemaVersion: number;
    readonly status: string;
    readonly ownerBoundary: string;
    readonly operationIds: readonly string[];
    readonly publicOperationIds: readonly string[];
    readonly privateOperationIds: readonly string[];
    readonly requiredBindingFields: readonly string[];
    readonly providerAdapterOperations: readonly string[];
    readonly verificationReceiptSingleUse: boolean;
    readonly verificationReceiptTtlPolicy: string;
    readonly verificationReceiptBinding: string;
    readonly verificationConsumptionPolicy: string;
    readonly verificationConsumerOperationPolicy: string;
    readonly redeemRecoveryPolicy: string;
    readonly verificationReceiptDerivationPolicy: string;
    readonly internalServiceProofPolicy: string;
    readonly idempotencyPolicy: string;
    readonly providerAbstractionPolicy: string;
    readonly failurePolicy: string;
    readonly productAuthorityPolicy: string;
    readonly publicSurfacePolicy: string;
    readonly healthSurfacePolicy: string;
    readonly storagePolicy: string;
    readonly forbiddenConsumerUses: readonly string[];
    readonly forbiddenValues: readonly string[];
}
export interface CreditPurchaseContract {
    readonly schemaVersion: number;
    readonly status: string;
    readonly ownerBoundary: string;
    readonly operationIds: readonly string[];
    readonly checkoutStates: readonly string[];
    readonly paymentStates: readonly string[];
    readonly creditIssuanceStates: readonly string[];
    readonly returnReceiptStates: readonly string[];
    readonly nonTerminalStates: readonly string[];
    readonly terminalStates: readonly string[];
    readonly requiredIntentBindings: readonly string[];
    readonly serverRevalidatedClaims: readonly string[];
    readonly immutableSnapshotRefs: readonly string[];
    readonly separatedIdentifiers: readonly string[];
    readonly authoritativePaymentEvidence: readonly string[];
    readonly authoritativeCompletionEvidence: readonly string[];
    readonly persistenceContractRef: string;
    readonly checkoutCompletionPolicy: string;
    readonly providerSuccessCompletesCheckout: boolean;
    readonly ledgerIssuanceRequiredForCompletion: boolean;
    readonly idempotencyPolicy: string;
    readonly returnTargetPolicy: string;
    readonly returnReceiptPolicy: string;
    readonly returnReceiptRetryPolicy: string;
    readonly returnReceiptSingleUse: boolean;
    readonly returnReceiptPlaintextStored: boolean;
    readonly returnReceiptDigestAlgorithm: string;
    readonly successRedirectIsPaymentEvidence: boolean;
    readonly clientAmountsAuthoritative: boolean;
    readonly balanceRefreshPolicy: string;
    readonly unknownOutcomePolicy: string;
    readonly forbiddenUrlValues: readonly string[];
    readonly forbiddenConsumerUses: readonly string[];
    readonly forbiddenValues: readonly string[];
}
export interface OidcProductSessionContract {
    readonly schemaVersion: number;
    readonly status: string;
    readonly ownerBoundary: string;
    readonly protocolProfile: string;
    readonly oauthSecurityBaseline: string;
    readonly oauth21Status: string;
    readonly responseType: string;
    readonly pkceMethod: string;
    readonly stagingIssuer: string;
    readonly productionIssuer: string;
    readonly requiredAuthorizationBindings: readonly string[];
    readonly requiredTokenExchangeBindings: readonly string[];
    readonly requiredClientRegistryFields: readonly string[];
    readonly requiredAccessDecisionBindings: readonly string[];
    readonly invalidationEvents: readonly string[];
    readonly exactRedirectUriMatchRequired: boolean;
    readonly wildcardRedirectUriForbidden: boolean;
    readonly arbitraryReturnToForbidden: boolean;
    readonly authorizationCodeSingleUse: boolean;
    readonly authorizationCodeTtlPolicy: string;
    readonly tokenEndpointCaller: string;
    readonly browserTokenExposurePolicy: string;
    readonly productCookiePolicy: string;
    readonly productSessionOwner: string;
    readonly centralSessionOwner: string;
    readonly authorizationOwner: string;
    readonly authenticationIsAuthorization: boolean;
    readonly clientRegistryPolicy: string;
    readonly forbiddenConsumerUses: readonly string[];
    readonly forbiddenValues: readonly string[];
}
export interface OidcClientRegistryContract {
    readonly schemaVersion: number;
    readonly status: string;
    readonly ownerBoundary: string;
    readonly authority: string;
    readonly environment: string;
    readonly registryRevision: number;
    readonly sourceOfTruth: string;
    readonly updatePolicy: string;
    readonly environmentIsolation: string;
    readonly clientIdReusePolicy: string;
    readonly lifecycle: OidcClientRegistryLifecycle;
    readonly immutableFields: readonly string[];
    readonly securitySensitiveFields: readonly string[];
    readonly requiredAuditEvents: readonly string[];
    readonly entries: readonly OidcClientRegistryEntry[];
    readonly forbiddenValues: readonly string[];
}
export interface OidcClientRegistryLifecycle {
    readonly states: readonly string[];
    readonly terminalStates: readonly string[];
    readonly transitions: readonly OidcClientRegistryTransition[];
}
export interface OidcClientRegistryTransition {
    readonly from: string;
    readonly to: string;
    readonly requiredEvidence: string;
}
export interface OidcClientRegistryEntry {
    readonly clientId: string;
    readonly productRef: string;
    readonly ownerRef: string;
    readonly environment: string;
    readonly entryRevision: number;
    readonly applicationType: string;
    readonly exactRedirectUris: readonly string[];
    readonly exactPostLogoutRedirectUris: readonly string[];
    readonly allowedScopeRefs: readonly string[];
    readonly allowedAudienceRefs: readonly string[];
    readonly allowedGrantTypes: readonly string[];
    readonly allowedResponseTypes: readonly string[];
    readonly allowedPkceMethods: readonly string[];
    readonly clientType: string;
    readonly tokenEndpointAuthMethod: string;
    readonly jwksRef: string;
    readonly status: string;
    readonly statusReason: string;
    readonly sessionPolicyRef: string;
    readonly revocationPolicyRef: string;
    readonly keyRotationPolicyRef: string;
    readonly runtimeBoundary: string;
    readonly callbackHandlerRef: string;
    readonly activationRequirements: readonly string[];
    readonly activationEvidenceRefs: readonly string[];
}
export interface OidcProviderRuntimeContract {
    readonly schemaVersion: number;
    readonly status: string;
    readonly ownerBoundary: string;
    readonly pilotEnvironment: string;
    readonly issuer: string;
    readonly discoveryPath: string;
    readonly authorizationPath: string;
    readonly tokenPath: string;
    readonly jwksPath: string;
    readonly revocationPath: string;
    readonly endSessionPath: string;
    readonly authorizationCodeTtlSeconds: number;
    readonly authorizationCodeSingleUse: boolean;
    readonly authorizationCodeStoragePolicy: string;
    readonly authorizationCodeRequiredBindings: readonly string[];
    readonly accessTokenTtlSeconds: number;
    readonly idTokenTtlSeconds: number;
    readonly refreshTokenPolicy: string;
    readonly clientAssertionAlgorithm: string;
    readonly clientAssertionTtlSeconds: number;
    readonly clientAssertionJtiSingleUse: boolean;
    readonly clientAssertionBindingPolicy: string;
    readonly signingAlgorithm: string;
    readonly signingKeyRotationDays: number;
    readonly retiredKeyVerificationSeconds: number;
    readonly jwksCacheMaxAgeSeconds: number;
    readonly centralSessionIdleSeconds: number;
    readonly centralSessionAbsoluteSeconds: number;
    readonly productSessionIdleMaxSeconds: number;
    readonly productSessionAbsoluteMaxSeconds: number;
    readonly sensitiveActionFreshSeconds: number;
    readonly revocationMaxStalenessSeconds: number;
    readonly productSessionRevalidationPolicy: string;
    readonly requiredDenialReasons: readonly string[];
    readonly forbiddenValues: readonly string[];
}
export interface SensitiveActionAuthorizationContract {
    readonly schemaVersion: number;
    readonly status: string;
    readonly receiptFormat: string;
    readonly ownerBoundaries: SensitiveActionAuthorizationOwnerBoundaries;
    readonly issuerLifecycle: SensitiveActionAuthorizationLifecycle;
    readonly audienceConsumptionLifecycle: SensitiveActionAuthorizationLifecycle;
    readonly requiredBindings: readonly string[];
    readonly requiredAssuranceFields: readonly string[];
    readonly requiredPlatformDecisionFields: readonly string[];
    readonly requiredConsumerControls: readonly string[];
    readonly verificationResultValues: readonly string[];
    readonly expiryPolicy: string;
    readonly routeStatus: string;
    readonly forbiddenClaims: readonly string[];
    readonly forbiddenValues: readonly string[];
}
export interface SensitiveActionAuthorizationOwnerBoundaries {
    readonly assurance: string;
    readonly platformDecision: string;
    readonly audienceDomainGuardAndConsumption: string;
}
export interface SensitiveActionAuthorizationLifecycle {
    readonly states: readonly string[];
    readonly terminalStates: readonly string[];
    readonly transitions: readonly SensitiveActionAuthorizationTransition[];
}
export interface SensitiveActionAuthorizationTransition {
    readonly from: string;
    readonly event: string;
    readonly to: string;
}
export interface AccessDecisionContract {
    readonly schemaVersion: number;
    readonly status: string;
    readonly ownerBoundary: string;
    readonly operationId: string;
    readonly routePath: string;
    readonly decisionValues: readonly string[];
    readonly requiredRequestBindings: readonly string[];
    readonly requiredResponseBindings: readonly string[];
    readonly trustedAuthoritySources: readonly string[];
    readonly decisionBinding: string;
    readonly denialPolicy: string;
    readonly reasonCodePolicy: string;
    readonly evidenceRefPolicy: string;
    readonly expiryPolicy: string;
    readonly obligationsPolicy: string;
    readonly idempotencyPolicy: string;
    readonly consumerMappingPolicy: string;
    readonly forbiddenRequestAuthorityFields: readonly string[];
    readonly forbiddenConsumerUses: readonly string[];
    readonly forbiddenValues: readonly string[];
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
    readonly decimalPlaces?: number;
}
export interface CalculatorConformanceOutputValue {
    readonly value: string | number;
    readonly unit: string;
}
export type CalculatorConformanceExpectation = {
    readonly status: 'success';
    readonly output: Readonly<Record<string, CalculatorConformanceOutputValue>>;
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
    readonly noContentSuccessStatuses: readonly number[];
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
    readonly responseSchemaRef: string | null;
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
    readonly optionalFields: readonly string[];
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
    readonly noContentSuccessStatuses: readonly number[];
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
    readonly responseSchemaRef: string | null;
    readonly responseBodyMode: 'schema' | 'none';
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
    readonly optionalFields: readonly string[];
    readonly secretFields: readonly string[];
    readonly sessionEffect: string | null;
}
//# sourceMappingURL=types.d.ts.map