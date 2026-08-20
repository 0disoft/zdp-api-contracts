export type ApiContractChangeLevel = 'patch' | 'feature' | 'breaking';
export type ApiContractCompatibilityLevel = 'none' | ApiContractChangeLevel;
export type ApiContractVersionBump = 'none' | 'patch' | 'minor' | 'major';

export interface ApiContractCompatibilityChange {
  readonly level: ApiContractChangeLevel;
  readonly code: string;
  readonly path: string;
  readonly message: string;
}

export interface ApiContractCompatibilityReport {
  readonly level: ApiContractCompatibilityLevel;
  readonly changes: readonly ApiContractCompatibilityChange[];
}

export interface ApiContractMigrationDocument {
  readonly path: string;
  readonly content: string;
}

export interface ApiContractVersionGateDiagnostic {
  readonly code: string;
  readonly message: string;
}

export interface ApiContractVersionGateResult {
  readonly ok: boolean;
  readonly baseVersion: string;
  readonly headVersion: string;
  readonly requiredBump: ApiContractVersionBump;
  readonly minimumVersion: string | null;
  readonly migrationPath: string | null;
  readonly diagnostics: readonly ApiContractVersionGateDiagnostic[];
}
