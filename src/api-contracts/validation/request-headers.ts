import type { ApiContractDiagnostic, ApiContracts, ApiSchemaDefinition } from '../types.js';
import { resolveRequestMetadataHeaders } from '../request-metadata-headers.js';

export function validateTransportHeaderCollisions(contracts: ApiContracts): readonly ApiContractDiagnostic[] {
  const schemas = new Map<string, { file: string; schema: ApiSchemaDefinition }>(contracts.schemaBundles.flatMap(bundle => bundle.schemas.map(schema =>
    [`${bundle.file}#${schema.id}`, { file: bundle.file, schema }] as const)));
  return contracts.apiCatalog.routes.flatMap(route => {
    const context = schemas.get(route.requestSchemaRef);
    const metadata = resolveRequestMetadataHeaders(contracts.route, route.serviceId);
    if (!context || !metadata) return [];
    const names = new Set([
      ...(route.requestIdRequired ? [metadata.requestId] : []),
      ...(route.traceIdRequired ? [metadata.traceId] : []),
      ...(route.idempotency !== 'not_required' ? [metadata.idempotencyKey] : [])
    ].map(name => name.toLowerCase()));
    return (context.schema.requestHeaders ?? []).flatMap((rule, index) => names.has(rule.name.toLowerCase()) ? [{
      code: 'API_EXPORT_PLAN_REQUEST_HEADER_COLLISION', file: context.file,
      path: `schema_bundle.schemas.${context.schema.id}.request_headers.${index}.name`,
      message: `Request header ${rule.name} collides with transport metadata for ${route.operationId}.`
    }] : []);
  });
}
