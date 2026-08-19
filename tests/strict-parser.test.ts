import { describe, expect, it } from 'bun:test';
import {
  loadApiContracts,
  parseAbuseChallengeContract,
  parseApiCatalogContract,
  parseApiSchemaBundleContract,
  parseErrorEnvelopeContract,
  parseProductLinkHandoffContract,
  parseRouteContract,
  parseSdkGenerationInputContract,
  parseWebhookContract
} from '../src/api-contracts/strict-parser';

describe('strict API contract source shapes', () => {
  it('loads every committed contract through the strict source guard', async () => {
    const contracts = await loadApiContracts();

    expect(contracts.apiCatalog.routes.length).toBeGreaterThan(0);
    expect(contracts.schemaBundles.length).toBeGreaterThan(0);
  });

  it('rejects copied customer-policy fields in the abuse contract', () => {
    expect(() =>
      parseAbuseChallengeContract(`abuse_challenge:
  staging_implemented_operation_ids: []
schema_bundle: {}
`)
    ).toThrow(
      'contracts/apis/abuse-api/challenge.yaml#abuse_challenge must not declare unknown field `staging_implemented_operation_ids`.'
    );
  });

  it('rejects unknown route definition fields', () => {
    expect(() =>
      parseApiCatalogContract(`api_catalog:
  status: route-catalog-contract-only
  route_definition_required_fields: []
  forbidden_values: []
routes:
  - operation_id: core.example.get
    response_schema_reff: contracts/apis/core-api/example.yaml#ExampleResponse
`)
    ).toThrow(
      'contracts/apis/catalog.yaml#routes[0] must not declare unknown field `response_schema_reff`.'
    );
  });

  it('rejects unknown schema-bundle fields at every nested object boundary', () => {
    expect(() =>
      parseApiSchemaBundleContract(`schema_bundle:
  common_envelope:
    unexpected_metadata: []
  schemas: []
`)
    ).toThrow(
      'contracts/apis/<service>/<schema>.yaml#schema_bundle.common_envelope must not declare unknown field `unexpected_metadata`.'
    );

    expect(() =>
      parseApiSchemaBundleContract(`schema_bundle:
  common_envelope: {}
  schemas:
    - id: ExampleResponse
      unexpected_shape: true
`)
    ).toThrow(
      'contracts/apis/<service>/<schema>.yaml#schema_bundle.schemas[0] must not declare unknown field `unexpected_shape`.'
    );
  });

  it('rejects unknown product-link fields and transition fields', () => {
    expect(() =>
      parseProductLinkHandoffContract(`product_link_handoff:
  unexpected_policy: unsafe
schema_bundle: {}
`)
    ).toThrow(
      'contracts/apis/core-api/product-link.yaml#product_link_handoff must not declare unknown field `unexpected_policy`.'
    );

    expect(() =>
      parseProductLinkHandoffContract(`product_link_handoff:
  allowed_transitions:
    - from: pending
      event: approve
      to: approved
      side_effect: issue_token
schema_bundle: {}
`)
    ).toThrow(
      'contracts/apis/core-api/product-link.yaml#product_link_handoff.allowed_transitions[0] must not declare unknown field `side_effect`.'
    );
  });

  const basicContractCases: readonly {
    readonly name: string;
    readonly parseSource: (source: string) => unknown;
    readonly source: string;
    readonly expectedMessage: string;
  }[] = [
    {
      name: 'route contract',
      parseSource: parseRouteContract,
      source: `route_contract:\n  allowed_methodz: []\n`,
      expectedMessage:
        'contracts/route-contract.yaml#route_contract must not declare unknown field `allowed_methodz`.'
    },
    {
      name: 'error envelope',
      parseSource: parseErrorEnvelopeContract,
      source: `error_envelope:\n  required_fieldz: []\n`,
      expectedMessage:
        'contracts/error-envelope.yaml#error_envelope must not declare unknown field `required_fieldz`.'
    },
    {
      name: 'webhook contract',
      parseSource: parseWebhookContract,
      source: `webhook_contract:\n  required_controlz: []\n`,
      expectedMessage:
        'contracts/webhook-contract.yaml#webhook_contract must not declare unknown field `required_controlz`.'
    },
    {
      name: 'SDK generation input',
      parseSource: parseSdkGenerationInputContract,
      source: `sdk_generation_input:\n  generation_targetz: []\n`,
      expectedMessage:
        'contracts/sdk-generation-input.yaml#sdk_generation_input must not declare unknown field `generation_targetz`.'
    }
  ];

  for (const testCase of basicContractCases) {
    it(`rejects unknown fields in the ${testCase.name}`, () => {
      expect(() => testCase.parseSource(testCase.source)).toThrow(
        testCase.expectedMessage
      );
    });
  }
});
