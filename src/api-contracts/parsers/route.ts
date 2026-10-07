import type { RouteContract } from '../types.js';

import { parseYamlObject, requiredNumberList, requiredObject, requiredString, requiredStringList } from './shared.js';

export function parseRouteContract(source: string): RouteContract {
  const data = parseYamlObject(source, 'contracts/route-contract.yaml');
  const routeContract = requiredObject(
    data,
    'route_contract',
    'contracts/route-contract.yaml'
  );

  return {
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
