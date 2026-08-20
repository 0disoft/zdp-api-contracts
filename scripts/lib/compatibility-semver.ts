import type {
  ApiContractCompatibilityLevel,
  ApiContractCompatibilityReport,
  ApiContractMigrationDocument,
  ApiContractVersionBump,
  ApiContractVersionGateDiagnostic,
  ApiContractVersionGateResult
} from './compatibility-types';

interface ParsedVersion {
  readonly major: number;
  readonly minor: number;
  readonly patch: number;
}

export function evaluateApiContractVersionGate(input: {
  readonly baseVersion: string;
  readonly headVersion: string;
  readonly report: ApiContractCompatibilityReport;
  readonly migrationDocument?: ApiContractMigrationDocument | null;
}): ApiContractVersionGateResult {
  const diagnostics: ApiContractVersionGateDiagnostic[] = [];
  const base = parseVersion(input.baseVersion);
  const head = parseVersion(input.headVersion);

  if (base === null) {
    diagnostics.push({
      code: 'API_COMPAT_BASE_VERSION_INVALID',
      message: `Base package version \`${input.baseVersion}\` must be strict SemVer x.y.z.`
    });
  }
  if (head === null) {
    diagnostics.push({
      code: 'API_COMPAT_HEAD_VERSION_INVALID',
      message: `Head package version \`${input.headVersion}\` must be strict SemVer x.y.z.`
    });
  }

  const requiredBump = requiredVersionBump(input.report.level, base);
  const minimum =
    base === null ? null : minimumVersionForBump(base, requiredBump);
  const minimumVersion = minimum === null ? null : formatVersion(minimum);

  if (base !== null && head !== null) {
    if (compareVersions(head, base) < 0) {
      diagnostics.push({
        code: 'API_COMPAT_VERSION_REGRESSION',
        message: `Package version regressed from ${input.baseVersion} to ${input.headVersion}.`
      });
    } else if (minimum !== null && compareVersions(head, minimum) < 0) {
      diagnostics.push({
        code: 'API_COMPAT_VERSION_BUMP_INSUFFICIENT',
        message:
          `Compatibility level \`${input.report.level}\` requires at least ` +
          `${minimumVersion}, but package.json declares ${input.headVersion}.`
      });
    }
  }

  const migrationPath =
    input.report.level === 'breaking' && base !== null && head !== null
      ? migrationDocumentPath(input.baseVersion, input.headVersion)
      : null;

  if (migrationPath !== null) {
    validateMigrationDocument(
      migrationPath,
      input.baseVersion,
      input.headVersion,
      input.migrationDocument ?? null,
      diagnostics
    );
  }

  return {
    ok: diagnostics.length === 0,
    baseVersion: input.baseVersion,
    headVersion: input.headVersion,
    requiredBump,
    minimumVersion,
    migrationPath,
    diagnostics
  };
}

export function migrationDocumentPath(
  baseVersion: string,
  headVersion: string
): string {
  return `docs/migrations/v${baseVersion}-to-v${headVersion}.md`;
}

function requiredVersionBump(
  level: ApiContractCompatibilityLevel,
  base: ParsedVersion | null
): ApiContractVersionBump {
  if (level === 'none') {
    return 'none';
  }
  if (level === 'patch') {
    return 'patch';
  }
  if (level === 'feature') {
    return 'minor';
  }
  return base?.major === 0 ? 'minor' : 'major';
}

function minimumVersionForBump(
  base: ParsedVersion,
  bump: ApiContractVersionBump
): ParsedVersion | null {
  if (bump === 'none') {
    return null;
  }
  if (bump === 'patch') {
    return { major: base.major, minor: base.minor, patch: base.patch + 1 };
  }
  if (bump === 'minor') {
    return { major: base.major, minor: base.minor + 1, patch: 0 };
  }
  return { major: base.major + 1, minor: 0, patch: 0 };
}

function validateMigrationDocument(
  expectedPath: string,
  baseVersion: string,
  headVersion: string,
  migrationDocument: ApiContractMigrationDocument | null,
  diagnostics: ApiContractVersionGateDiagnostic[]
): void {
  if (migrationDocument === null) {
    diagnostics.push({
      code: 'API_COMPAT_MIGRATION_DOCUMENT_MISSING',
      message: `Breaking contract changes require \`${expectedPath}\`.`
    });
    return;
  }
  if (migrationDocument.path !== expectedPath) {
    diagnostics.push({
      code: 'API_COMPAT_MIGRATION_DOCUMENT_PATH_INVALID',
      message:
        `Breaking contract migration must be written to \`${expectedPath}\`, ` +
        `not \`${migrationDocument.path}\`.`
    });
  }

  const content = migrationDocument.content.trim();
  const headings = content.match(/^##\s+.+$/gm) ?? [];
  if (
    content.length < 80 ||
    !content.includes(baseVersion) ||
    !content.includes(headVersion) ||
    headings.length < 2
  ) {
    diagnostics.push({
      code: 'API_COMPAT_MIGRATION_DOCUMENT_INCOMPLETE',
      message:
        'Migration document must name both package versions, contain at least ' +
        'two level-two sections, and explain the change and consumer action.'
    });
  }
}

function parseVersion(value: string): ParsedVersion | null {
  const match = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.exec(value);
  if (match === null) {
    return null;
  }
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3])
  };
}

function compareVersions(left: ParsedVersion, right: ParsedVersion): number {
  return (
    left.major - right.major ||
    left.minor - right.minor ||
    left.patch - right.patch
  );
}

function formatVersion(version: ParsedVersion): string {
  return `${version.major}.${version.minor}.${version.patch}`;
}
