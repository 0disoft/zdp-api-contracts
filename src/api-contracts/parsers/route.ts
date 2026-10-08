import type { ApiRequestMetadataHeaders, RouteContract } from '../types.js';
import { isReservedRequestHeaderName } from './http-header-name.js';

import { parseYamlObject, requiredNumberList, requiredObject, requiredString, requiredStringList } from './shared.js';

export function parseRouteContract(source: string): RouteContract {
  const data = parseYamlObject(source, 'contracts/route-contract.yaml');
  const routeContract = requiredObject(
    data,
    'route_contract',
    'contracts/route-contract.yaml'
  );

  return {
    ...(routeContract.request_metadata_headers === undefined ? {} : {
      requestMetadataHeaders: parseMetadataHeaders(requiredObject(routeContract, 'request_metadata_headers', 'route_contract'), 'request_metadata_headers')
    }),
    ...(routeContract.service_request_metadata_headers === undefined ? {} : {
      serviceRequestMetadataHeaders: Object.fromEntries(Object.entries(
        requiredObject(routeContract, 'service_request_metadata_headers', 'route_contract')
      ).map(([service, value]) => [service, parseMetadataHeaders(
        requiredObject({ value }, 'value', `service_request_metadata_headers.${service}`), `service_request_metadata_headers.${service}`
      )]))
    }),
    status: requiredString(
      routeContract,
      'status',
      'contracts/route-contract.yaml#route_contract'
    ),
    requiredPerRoute: requiredStringList(
      routeContract,
      'required_per_route',
      'contracts/route-contract.yaml#route_contract'
    ),
    allowedMethods: requiredStringList(
      routeContract,
      'allowed_methods',
      'contracts/route-contract.yaml#route_contract'
    ),
    allowedSuccessStatuses: requiredNumberList(
      routeContract,
      'allowed_success_statuses',
      'contracts/route-contract.yaml#route_contract'
    ),
    noContentSuccessStatuses: requiredNumberList(
      routeContract,
      'no_content_success_statuses',
      'contracts/route-contract.yaml#route_contract'
    ),
    forbiddenShapes: requiredStringList(
      routeContract,
      'forbidden_shapes',
      'contracts/route-contract.yaml#route_contract'
    ),
    allowedSessionEffects: requiredStringList(
      routeContract,
      'allowed_session_effects',
      'contracts/route-contract.yaml#route_contract'
    )
  };
}

function parseMetadataHeaders(value: Record<string, unknown>, context: string): ApiRequestMetadataHeaders {
  const keys = ['request_id', 'trace_id', 'idempotency_key'];
  if (Object.keys(value).some(key => !keys.includes(key))) throw new Error(`Unknown metadata header field in ${context}.`);
  const names = keys.map(key => requiredString(value, key, context));
  if (names.some(name => !/^[A-Za-z][A-Za-z0-9-]*$/.test(name) || isReservedRequestHeaderName(name)) ||
    new Set(names.map(name => name.toLowerCase())).size !== names.length) {
    throw new Error(`Metadata headers in ${context} must be distinct non-credential HTTP header names.`);
  }
  return { requestId: names[0]!, traceId: names[1]!, idempotencyKey: names[2]! };
}
