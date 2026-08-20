import { describe, expect, it } from 'bun:test';
import {
  compareApiContracts,
  evaluateApiContractVersionGate,
  migrationDocumentPath,
  type ApiContractCompatibilityReport
} from '../scripts/lib/contract-compatibility';
import { loadApiContracts } from '../src/api-contracts/registry-loader';
import type {
  ApiContracts,
  ApiRouteDefinition,
  ApiSchemaDefinition
} from '../src/api-contracts/types';

describe('API contract compatibility gate', () => {
  it('reports no compatibility change for identical contracts', async () => {
    const contracts = await loadApiContracts();

    expect(compareApiContracts(contracts, contracts)).toEqual({
      level: 'none',
      changes: []
    });
  });

  it('classifies removed routes and changed transport semantics as breaking', async () => {
    const base = await loadApiContracts();
    const operationId = 'platform.support.cases.create';
    const changed = replaceRoute(base, operationId, (route) => ({
      ...route,
      method: 'PUT',
      path: '/v2/support/cases',
      successStatuses: [],
      authRequired: true
    }));
    const head: ApiContracts = {
      ...changed,
      apiCatalog: {
        ...changed.apiCatalog,
        routes: changed.apiCatalog.routes.filter(
          (route) => route.operationId !== 'core.admin.operator_session_context.get'
        )
      }
    };

    const report = compareApiContracts(base, head);
    const codes = report.changes.map((change) => change.code);

    expect(report.level).toBe('breaking');
    expect(codes).toContain('API_COMPAT_ROUTE_REMOVED');
    expect(codes).toContain('API_COMPAT_METHOD_CHANGED');
    expect(codes).toContain('API_COMPAT_PATH_CHANGED');
    expect(codes).toContain('API_COMPAT_ROUTE_SUCCESS_STATUS_REMOVED');
    expect(codes).toContain('API_COMPAT_ROUTE_AUTH_REQUIRED_ENABLED');
  });

  it('classifies idempotency strengthening as breaking', async () => {
    const base = await loadApiContracts();
    const head = replaceRoute(
      base,
      'core.admin.operator_session_context.get',
      (route) => ({
        ...route,
        idempotency: 'required_idempotency_key'
      })
    );

    const report = compareApiContracts(base, head);

    expect(report.level).toBe('breaking');
    expect(report.changes.map((change) => change.code)).toContain(
      'API_COMPAT_ROUTE_IDEMPOTENCY_STRENGTHENED'
    );
  });

  it('classifies removing a request field as breaking', async () => {
    const base = await loadApiContracts();
    const head = replaceSchema(
      base,
      'contracts/apis/support-api/intake.yaml',
      'SupportCaseCreateRequest',
      (schema) => ({
        ...schema,
        requiredFields: schema.requiredFields.filter(
          (field) => field !== schema.requiredFields[0]
        )
      })
    );

    const report = compareApiContracts(base, head);

    expect(report.level).toBe('breaking');
    expect(report.changes.map((change) => change.code)).toContain(
      'API_COMPAT_REQUEST_FIELD_REMOVED'
    );
  });

  it('classifies a new request required field as breaking', async () => {
    const base = await loadApiContracts();
    const head = replaceSchema(
      base,
      'contracts/apis/support-api/intake.yaml',
      'SupportCaseCreateRequest',
      (schema) => ({
        ...schema,
        requiredFields: [...schema.requiredFields, 'compatibility_test_required']
      })
    );

    const report = compareApiContracts(base, head);

    expect(report.level).toBe('breaking');
    expect(report.changes).toContainEqual(
      expect.objectContaining({
        code: 'API_COMPAT_REQUEST_REQUIRED_FIELD_ADDED',
        path:
          'contracts/apis/support-api/intake.yaml#SupportCaseCreateRequest.compatibility_test_required'
      })
    );
  });

  it('classifies additive routes and optional fields as features', async () => {
    const base = await loadApiContracts();
    const template = requireRoute(base, 'platform.support.cases.create');
    const withRoute: ApiContracts = {
      ...base,
      apiCatalog: {
        ...base.apiCatalog,
        routes: [
          ...base.apiCatalog.routes,
          {
            ...template,
            operationId: 'platform.support.compatibility_examples.create',
            path: '/v1/support/compatibility-examples'
          }
        ]
      }
    };
    const head = replaceSchema(
      withRoute,
      'contracts/apis/support-api/intake.yaml',
      'SupportCaseCreateResponse',
      (schema) => ({
        ...schema,
        optionalFields: [...schema.optionalFields, 'compatibility_hint']
      })
    );

    const report = compareApiContracts(base, head);
    const codes = report.changes.map((change) => change.code);

    expect(report.level).toBe('feature');
    expect(codes).toContain('API_COMPAT_ROUTE_ADDED');
    expect(codes).toContain('API_COMPAT_RESPONSE_FIELD_ADDED_OR_STRENGTHENED');
  });

  it('classifies typed schema metadata additions and changes', async () => {
    const base = await loadApiContracts();
    const untyped = replaceSchema(
      base,
      'contracts/apis/support-api/intake.yaml',
      'SupportCaseCreateRequest',
      (schema) => ({ ...schema, properties: undefined })
    );
    const typed = replaceSchema(
      untyped,
      'contracts/apis/support-api/intake.yaml',
      'SupportCaseCreateRequest',
      (schema) => ({
        ...schema,
        properties: { subject: { type: 'string' } }
      })
    );

    expect(compareApiContracts(untyped, typed)).toMatchObject({
      level: 'feature',
      changes: [expect.objectContaining({ code: 'API_COMPAT_SCHEMA_TYPING_ADDED' })]
    });

    const changed = replaceSchema(
      typed,
      'contracts/apis/support-api/intake.yaml',
      'SupportCaseCreateRequest',
      (schema) => ({
        ...schema,
        properties: { subject: { type: 'integer' } }
      })
    );
    expect(compareApiContracts(typed, changed)).toMatchObject({
      level: 'breaking',
      changes: [expect.objectContaining({ code: 'API_COMPAT_SCHEMA_TYPING_CHANGED' })]
    });
  });

  it('requires a pre-1.0 minor bump and migration document for breaking changes', () => {
    const report = reportWithLevel('breaking');
    const missing = evaluateApiContractVersionGate({
      baseVersion: '0.32.0',
      headVersion: '0.32.1',
      report
    });

    expect(missing.ok).toBe(false);
    expect(missing.minimumVersion).toBe('0.33.0');
    expect(missing.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(
      expect.arrayContaining([
        'API_COMPAT_VERSION_BUMP_INSUFFICIENT',
        'API_COMPAT_MIGRATION_DOCUMENT_MISSING'
      ])
    );

    const path = migrationDocumentPath('0.32.0', '0.33.0');
    const passing = evaluateApiContractVersionGate({
      baseVersion: '0.32.0',
      headVersion: '0.33.0',
      report,
      migrationDocument: {
        path,
        content: `# 0.32.0에서 0.33.0으로 이전

## 변경 사항

기존 소비자가 수정해야 하는 계약 변경을 설명한다.

## 마이그레이션

영향받는 operation과 SDK 호출을 새 계약에 맞게 수정하고 배포 순서를 검증한다.`
      }
    });

    expect(passing).toMatchObject({
      ok: true,
      requiredBump: 'minor',
      minimumVersion: '0.33.0',
      migrationPath: path,
      diagnostics: []
    });
  });

  it('requires a major bump for stable breaking changes', () => {
    const result = evaluateApiContractVersionGate({
      baseVersion: '1.7.4',
      headVersion: '2.0.0',
      report: reportWithLevel('breaking'),
      migrationDocument: {
        path: migrationDocumentPath('1.7.4', '2.0.0'),
        content: `# 1.7.4에서 2.0.0으로 이전

## 변경 사항

안정 API의 호환되지 않는 route 변경을 기록한다.

## 마이그레이션

소비자는 새 route와 schema로 전환하고 구버전 호출 제거를 확인한다.`
      }
    });

    expect(result.ok).toBe(true);
    expect(result.requiredBump).toBe('major');
    expect(result.minimumVersion).toBe('2.0.0');
  });
});

function replaceRoute(
  contracts: ApiContracts,
  operationId: string,
  update: (route: ApiRouteDefinition) => ApiRouteDefinition
): ApiContracts {
  let found = false;
  const routes = contracts.apiCatalog.routes.map((route) => {
    if (route.operationId !== operationId) {
      return route;
    }
    found = true;
    return update(route);
  });
  if (!found) {
    throw new Error(`Missing route fixture \`${operationId}\`.`);
  }
  return {
    ...contracts,
    apiCatalog: {
      ...contracts.apiCatalog,
      routes
    }
  };
}

function replaceSchema(
  contracts: ApiContracts,
  file: string,
  schemaId: string,
  update: (schema: ApiSchemaDefinition) => ApiSchemaDefinition
): ApiContracts {
  let found = false;
  const schemaBundles = contracts.schemaBundles.map((bundle) => {
    if (bundle.file !== file) {
      return bundle;
    }
    return {
      ...bundle,
      schemas: bundle.schemas.map((schema) => {
        if (schema.id !== schemaId) {
          return schema;
        }
        found = true;
        return update(schema);
      })
    };
  });
  if (!found) {
    throw new Error(`Missing schema fixture \`${file}#${schemaId}\`.`);
  }
  return { ...contracts, schemaBundles };
}

function requireRoute(
  contracts: ApiContracts,
  operationId: string
): ApiRouteDefinition {
  const route = contracts.apiCatalog.routes.find(
    (candidate) => candidate.operationId === operationId
  );
  if (route === undefined) {
    throw new Error(`Missing route fixture \`${operationId}\`.`);
  }
  return route;
}

function reportWithLevel(
  level: ApiContractCompatibilityReport['level']
): ApiContractCompatibilityReport {
  return {
    level,
    changes:
      level === 'none'
        ? []
        : [
            {
              level,
              code: 'API_COMPAT_TEST_CHANGE',
              path: 'contracts/test.yaml',
              message: 'test change'
            }
          ]
  };
}
