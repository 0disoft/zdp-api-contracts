import { readFile } from 'node:fs/promises';
import { isAbsolute, relative, resolve } from 'node:path';
import { API_CONTRACT_FAMILY_KEYS, API_CONTRACT_FAMILY_REGISTRY, listApiSchemaBundleSourcePaths, validateApiContractFamilyRegistry } from './family-registry.js';
import { parseApiSchemaBundleContract } from './strict-parser.js';
import { ApiContractLoadError } from './parser.js';
export class ApiContractFamilyRegistryError extends Error {
    diagnostics;
    constructor(diagnostics) {
        super([
            'API contract family registry is invalid.',
            ...diagnostics.map((diagnostic) => `- ${diagnostic.code} ${diagnostic.file}#${diagnostic.path}: ${diagnostic.message}`)
        ].join('\n'));
        this.name = 'ApiContractFamilyRegistryError';
        this.diagnostics = diagnostics;
    }
}
/**
 * mf:anchor zdp.api-contracts.registry-loader
 * purpose: Load singleton contract families and catalog-discovered schema bundles.
 * search: contract family registry, contract loader, schema bundle discovery
 * invariant: Registry integrity and complete singleton loading precede schema expansion.
 * risk: dependency, data_consistency
 */
export async function loadApiContracts(root = process.cwd(), registrations = API_CONTRACT_FAMILY_REGISTRY) {
    const registryDiagnostics = validateApiContractFamilyRegistry(registrations);
    if (registryDiagnostics.length > 0) {
        throw new ApiContractFamilyRegistryError(registryDiagnostics);
    }
    const familyResults = await Promise.all(registrations.map((registration) => loadRegisteredFamily(root, registration)));
    throwContractLoadFailures(familyResults);
    const loadedFamilies = {};
    for (const result of familyResults) {
        if (result.ok) {
            loadedFamilies[result.key] = result.value;
        }
    }
    assertCompleteSingletonContracts(loadedFamilies);
    const schemaBundleResults = await Promise.all(listApiSchemaBundleSourcePaths(loadedFamilies.apiCatalog).map((file) => loadSchemaBundle(root, file)));
    throwContractLoadFailures(schemaBundleResults);
    return {
        ...loadedFamilies,
        schemaBundles: schemaBundleResults.map((result) => {
            if (!result.ok) {
                throw new Error(`Schema bundle \`${result.file}\` was not loaded.`);
            }
            return result.value;
        })
    };
}
async function loadRegisteredFamily(root, registration) {
    try {
        const source = await readContractSource(root, registration.sourcePath);
        return {
            ok: true,
            key: registration.key,
            name: registration.name,
            file: registration.sourcePath,
            value: registration.parse(source)
        };
    }
    catch (error) {
        return {
            ok: false,
            name: registration.name,
            file: registration.sourcePath,
            message: error instanceof Error ? error.message : String(error)
        };
    }
}
async function loadSchemaBundle(root, file) {
    try {
        const source = await readContractSource(root, file);
        return {
            ok: true,
            name: `schema-bundle:${file}`,
            file,
            value: parseApiSchemaBundleContract(source, file)
        };
    }
    catch (error) {
        return {
            ok: false,
            name: `schema-bundle:${file}`,
            file,
            message: error instanceof Error ? error.message : String(error)
        };
    }
}
async function readContractSource(root, sourcePath) {
    const resolvedRoot = resolve(root);
    const resolvedFile = resolve(resolvedRoot, sourcePath);
    const relativeFile = relative(resolvedRoot, resolvedFile);
    if (relativeFile.startsWith('..') ||
        isAbsolute(relativeFile) ||
        relativeFile.length === 0) {
        throw new Error(`Contract path \`${sourcePath}\` must remain under the repository root.`);
    }
    return readFile(resolvedFile, 'utf8');
}
function throwContractLoadFailures(results) {
    const failures = results.filter((result) => !result.ok);
    if (failures.length > 0) {
        throw new ApiContractLoadError(failures.map(({ name, file, message }) => ({ name, file, message })));
    }
}
function assertCompleteSingletonContracts(loaded) {
    for (const key of API_CONTRACT_FAMILY_KEYS) {
        if (!Object.hasOwn(loaded, key)) {
            throw new Error(`API contract family \`${key}\` was not loaded.`);
        }
    }
}
//# sourceMappingURL=registry-loader.js.map