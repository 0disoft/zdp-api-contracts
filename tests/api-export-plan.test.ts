import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  parseApiCatalogContract,
  parseErrorEnvelopeContract,
  parseRouteContract,
  parseSdkGenerationInputContract,
  parseWebhookContract
} from '../src/api-contracts/parser';
import type { ApiContracts } from '../src/api-contracts/types';
import { buildApiExportPlan } from '../src/api-export-plan/plan';

describe('api export plan', () => {
  it('builds a dry-run plan without writing generated artifacts', () => {
    const result = buildApiExportPlan(loadCommittedContracts());

    expect(result.ok).toBe(true);
    expect(result.diagnostics).toEqual([]);
    expect(result.plan).toMatchObject({
      status: 'plan-only',
      writesArtifacts: false,
      publishesSchemas: false,
      sdkTargets: ['typescript', 'dart', 'rust'],
      traceFields: ['request_id', 'trace_id']
    });
    expect(result.plan?.outputs.map((output) => output.kind)).toEqual([
      'openapi',
      'sdk_generation_input',
      'webhook_schema',
      'docs_contract'
    ]);
    expect(
      result.plan?.outputs.find((output) => output.kind === 'openapi')?.requiredMetadata
    ).toContain('operation_id');
    expect(
      result.plan?.outputs.find((output) => output.kind === 'openapi')
        ?.requiredMetadata
    ).toContain('success_statuses');
    expect(
      result.plan?.outputs.find((output) => output.kind === 'openapi')
        ?.sourceContracts
    ).toContain('contracts/apis/catalog.yaml');
    expect(
      result.plan?.outputs.find((output) => output.kind === 'docs_contract')?.forbiddenValues
    ).toContain('authorization_header');
    expect(
      result.plan?.outputs.find((output) => output.kind === 'docs_contract')
        ?.requiredMetadata
    ).toContain('success_statuses');
  });

  it('fails when SDK input no longer mirrors route metadata', () => {
    const contracts = loadCommittedContracts();
    const result = buildApiExportPlan({
      ...contracts,
      route: {
        ...contracts.route,
        requiredPerRoute: [
          ...contracts.route.requiredPerRoute,
          'tenant_boundary'
        ]
      },
      apiCatalog: {
        ...contracts.apiCatalog,
        routeDefinitionRequiredFields: [
          ...contracts.apiCatalog.routeDefinitionRequiredFields,
          'tenant_boundary'
        ]
      }
    });

    expect(result.ok).toBe(false);
    expect(result.plan).toBeNull();
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_EXPORT_PLAN_ROUTE_METADATA_DRIFT'
    );
  });

  it('fails when SDK input drops traceable error metadata', () => {
    const contracts = loadCommittedContracts();
    const result = buildApiExportPlan({
      ...contracts,
      errorEnvelope: {
        ...contracts.errorEnvelope,
        optionalFields: [
          ...contracts.errorEnvelope.optionalFields,
          'support_ticket_url'
        ]
      }
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_EXPORT_PLAN_ERROR_METADATA_DRIFT'
    );
  });

  it('fails when API catalog no longer mirrors SDK route metadata', () => {
    const contracts = loadCommittedContracts();
    const result = buildApiExportPlan({
      ...contracts,
      apiCatalog: {
        ...contracts.apiCatalog,
        routeDefinitionRequiredFields:
          contracts.apiCatalog.routeDefinitionRequiredFields.filter(
            (field) => field !== 'success_statuses'
          )
      }
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'API_CATALOG_ROUTE_FIELD_MISSING'
    );
  });
});

function loadCommittedContracts(): ApiContracts {
  return {
    route: parseRouteContract(
      readFileSync(join(process.cwd(), 'contracts', 'route-contract.yaml'), 'utf8')
    ),
    errorEnvelope: parseErrorEnvelopeContract(
      readFileSync(join(process.cwd(), 'contracts', 'error-envelope.yaml'), 'utf8')
    ),
    webhook: parseWebhookContract(
      readFileSync(join(process.cwd(), 'contracts', 'webhook-contract.yaml'), 'utf8')
    ),
    sdkGenerationInput: parseSdkGenerationInputContract(
      readFileSync(
        join(process.cwd(), 'contracts', 'sdk-generation-input.yaml'),
        'utf8'
      )
    ),
    apiCatalog: parseApiCatalogContract(
      readFileSync(
        join(process.cwd(), 'contracts', 'apis', 'catalog.yaml'),
        'utf8'
      )
    )
  };
}
