import type { AccessDecisionContract } from '../api-contracts/types.js';
import type { ApiOpenApiPathItem } from './openapi.js';

export function withAccessDecisionHttpProfile(
  paths: Readonly<Record<string, ApiOpenApiPathItem>>,
  decision: AccessDecisionContract
): Readonly<Record<string, ApiOpenApiPathItem>> {
  const profile = decision.httpProfile;
  const path = paths[decision.routePath];
  const operation = path?.post;
  if (profile === null || operation === undefined) return paths;

  const headers = Object.fromEntries(profile.responseMetadataHeaders.map((name) => [name, {
    required: true,
    schema: { type: 'string', maxLength: profile.maxIdentifierUtf8Bytes },
    'x-zdp-matches-request-header': name
  }]));
  const responses = operation.responses as Readonly<Record<string, Readonly<Record<string, unknown>>>>;
  return {
    ...paths,
    [decision.routePath]: {
      ...path,
      post: {
        ...operation,
        parameters: [
          ...((operation.parameters ?? []) as readonly unknown[]),
          ...profile.requestMetadataHeaders.map((name) => ({
            name, in: 'header', required: true,
            schema: { type: 'string', minLength: 1, maxLength: profile.maxIdentifierUtf8Bytes },
            'x-max-utf8-bytes': profile.maxIdentifierUtf8Bytes
          }))
        ],
        responses: Object.fromEntries(Object.entries(responses).map(([status, response]) => [status, {
          ...response,
          headers: {
            ...headers,
            'Cache-Control': { required: true, schema: { type: 'string', const: profile.cacheControl } },
            Pragma: { required: true, schema: { type: 'string', const: profile.pragma } }
          }
        }])),
        'x-zdp-http-profile': profile
      }
    }
  };
}
