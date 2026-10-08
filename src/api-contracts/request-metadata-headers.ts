import type { ApiRequestMetadataHeaders, RouteContract } from './types.js';

export function resolveRequestMetadataHeaders(
  contract: RouteContract,
  serviceId: string
): ApiRequestMetadataHeaders | undefined {
  const scoped = contract.serviceRequestMetadataHeaders;
  return scoped && Object.hasOwn(scoped, serviceId)
    ? scoped[serviceId] ?? contract.requestMetadataHeaders
    : contract.requestMetadataHeaders;
}
