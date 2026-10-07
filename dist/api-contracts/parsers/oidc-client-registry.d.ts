import type { OidcClientRegistryContract, OidcClientRegistryEntry } from '../types.js';
export declare function parseOidcClientRegistryContract(source: string): OidcClientRegistryContract;
export declare function parseOidcClientRegistryLifecycle(lifecycle: Record<string, unknown>, context: string): OidcClientRegistryContract['lifecycle'];
export declare function parseOidcClientRegistryEntry(entry: Record<string, unknown>, context: string): OidcClientRegistryEntry;
//# sourceMappingURL=oidc-client-registry.d.ts.map