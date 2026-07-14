import type { ApiContracts, ApiContractValidationResult } from './types.js';
/**
 * mf:anchor zdp.api-contracts.semantic-validator
 * purpose: Locate semantic rules that align API routes, schemas, SDK input, and webhooks.
 * search: api validation, route metadata, schema refs, idempotency, credential policy
 * invariant: Auth, tenant, credential, idempotency, and secret metadata stay explicit in contracts.
 * risk: authz, security, data_consistency
 */
export declare function validateApiContracts(contracts: ApiContracts): ApiContractValidationResult;
//# sourceMappingURL=validator.d.ts.map