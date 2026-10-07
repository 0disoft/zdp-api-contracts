import { hasExactStringValues } from './shared.js';
export function validateReferralContracts(contracts, schemaBundlesByFile, diagnostics) {
    const create = schemaBundlesByFile.get('contracts/apis/core-api/referral.yaml')
        ?.schemas.find((schema) => schema.id === 'ReferralUseCreateRequest');
    if (!create || !hasExactStringValues(create.requiredFields, ['referral_code']) || create.optionalFields.length > 0) {
        diagnostics.push({
            code: 'API_REFERRAL_USE_CLIENT_AUTHORITY_INVALID',
            file: 'contracts/apis/core-api/referral.yaml',
            path: 'schema_bundle.ReferralUseCreateRequest',
            message: 'Referral use creation may accept only referral_code; campaign and referred account are server-derived.'
        });
    }
    const createRoute = contracts.apiCatalog.routes.find((route) => route.operationId === 'core.referral.uses.create');
    const statusRoute = contracts.apiCatalog.routes.find((route) => route.operationId === 'money.referral_rewards.status.get');
    if (createRoute?.authorizationPolicy !== 'verified_session_account_and_referral_code_campaign_binding') {
        diagnostics.push({ code: 'API_REFERRAL_USE_AUTHORIZATION_POLICY_INVALID', file: 'contracts/apis/catalog.yaml', path: 'core.referral.uses.create.authorization_policy', message: 'Referral use creation must bind the referred account to the verified session and derive campaign from the referral code.' });
    }
    if (statusRoute?.authorizationPolicy !== 'verified_session_owns_referral_use') {
        diagnostics.push({ code: 'API_REFERRAL_STATUS_AUTHORIZATION_POLICY_INVALID', file: 'contracts/apis/catalog.yaml', path: 'money.referral_rewards.status.get.authorization_policy', message: 'Referral reward status must verify that the current session owns the referral use.' });
    }
}
//# sourceMappingURL=referral-contracts.js.map