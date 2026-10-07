import type { ApiContracts, CalculatorDefinition } from '../../src/api-contracts/types';
import type { ApiContractCompatibilityChange } from './compatibility-types';
import { addChange, compareAllowlist, mapBy } from './compatibility-shared';

const CATALOG = 'contracts/calculators/catalog.yaml';
const CONFORMANCE = 'contracts/calculators/conformance.yaml';

export function compareCalculators(
  base: ApiContracts,
  head: ApiContracts,
  changes: ApiContractCompatibilityChange[]
): void {
  const { definitions: baseDefinitions, contractVersion: baseVersion, status: baseStatus, ...baseCatalog } = base.calculatorCatalog;
  const { definitions: headDefinitions, contractVersion: headVersion, status: headStatus, ...headCatalog } = head.calculatorCatalog;
  compareValue(baseCatalog, headCatalog, 'breaking', 'CATALOG_CHANGED', CATALOG, changes);
  compareValue([baseVersion, baseStatus], [headVersion, headStatus], 'patch', 'CATALOG_METADATA_CHANGED', CATALOG, changes);

  const baseById = mapBy(baseDefinitions, (definition) => definition.id);
  const headById = mapBy(headDefinitions, (definition) => definition.id);
  for (const [id, definition] of baseById) {
    const next = headById.get(id);
    const path = `${CATALOG}#definitions.${id}`;
    if (!next) {
      addChange(changes, 'breaking', 'API_COMPAT_CALCULATOR_REMOVED', path, `Calculator \`${id}\` was removed.`);
      continue;
    }
    compareDefinition(definition, next, path, changes);
  }
  for (const [id] of headById) {
    if (!baseById.has(id)) {
      addChange(changes, 'feature', 'API_COMPAT_CALCULATOR_ADDED', `${CATALOG}#definitions.${id}`, `Calculator \`${id}\` was added.`);
    }
  }

  const { cases: baseCases, contractVersion: baseConformanceVersion, ...basePolicy } = base.calculatorConformance;
  const { cases: headCases, contractVersion: headConformanceVersion, ...headPolicy } = head.calculatorConformance;
  compareValue(basePolicy, headPolicy, 'breaking', 'CONFORMANCE_POLICY_CHANGED', CONFORMANCE, changes);
  compareValue(baseConformanceVersion, headConformanceVersion, 'patch', 'CONFORMANCE_VERSION_CHANGED', CONFORMANCE, changes);
  const baseCasesById = mapBy(baseCases, (item) => item.id);
  const headCasesById = mapBy(headCases, (item) => item.id);
  for (const [id, item] of baseCasesById) {
    const next = headCasesById.get(id);
    const path = `${CONFORMANCE}#cases.${id}`;
    if (!next) {
      addChange(changes, 'breaking', 'API_COMPAT_CALCULATOR_CONFORMANCE_REMOVED', path, `Conformance case \`${id}\` was removed.`);
    } else {
      compareValue(item, next, 'breaking', 'CONFORMANCE_CHANGED', path, changes);
    }
  }
  for (const [id] of headCasesById) {
    if (!baseCasesById.has(id)) {
      addChange(changes, 'patch', 'API_COMPAT_CALCULATOR_CONFORMANCE_ADDED', `${CONFORMANCE}#cases.${id}`, `Conformance case \`${id}\` was added.`);
    }
  }
}

function compareDefinition(base: CalculatorDefinition, head: CalculatorDefinition, path: string, changes: ApiContractCompatibilityChange[]): void {
  const { inputs: baseInputs, outputs: baseOutputs, compatibleEngineVersions: baseEngines, errorCodes: baseErrors, contractVersion: baseVersion, ...baseSemantics } = base;
  const { inputs: headInputs, outputs: headOutputs, compatibleEngineVersions: headEngines, errorCodes: headErrors, contractVersion: headVersion, ...headSemantics } = head;
  compareValue(baseSemantics, headSemantics, 'breaking', 'SEMANTICS_CHANGED', path, changes);
  compareValue(baseVersion, headVersion, 'patch', 'VERSION_CHANGED', path, changes);
  compareAllowlist(baseEngines, headEngines, `${path}.compatible_engine_versions`, 'API_COMPAT_CALCULATOR_ENGINE', changes);
  compareAllowlist(baseErrors, headErrors, `${path}.error_codes`, 'API_COMPAT_CALCULATOR_ERROR', changes);
  compareFields(baseInputs, headInputs, 'INPUT', path, changes);
  // Omitted output requiredness means true, matching the parser/validator contract.
  compareFields(baseOutputs.map((field) => ({ ...field, required: field.required ?? true })), headOutputs.map((field) => ({ ...field, required: field.required ?? true })), 'OUTPUT', path, changes);
}

function compareFields<T extends { readonly id: string; readonly required: boolean }>(base: readonly T[], head: readonly T[], kind: 'INPUT' | 'OUTPUT', path: string, changes: ApiContractCompatibilityChange[]): void {
  const baseById = mapBy(base, (field) => field.id);
  const headById = mapBy(head, (field) => field.id);
  for (const [id, field] of baseById) {
    const next = headById.get(id);
    const fieldPath = `${path}.${kind.toLowerCase()}s.${id}`;
    if (!next) {
      addChange(changes, 'breaking', `API_COMPAT_CALCULATOR_${kind}_REMOVED`, fieldPath, `Calculator ${kind.toLowerCase()} \`${id}\` was removed.`);
    } else {
      compareValue(field, next, 'breaking', `${kind}_CHANGED`, fieldPath, changes);
    }
  }
  for (const [id, field] of headById) {
    if (!baseById.has(id)) {
      addChange(changes, kind === 'INPUT' && field.required ? 'breaking' : 'feature', `API_COMPAT_CALCULATOR_${kind}_ADDED`, `${path}.${kind.toLowerCase()}s.${id}`, `Calculator ${kind.toLowerCase()} \`${id}\` was added.`);
    }
  }
}

function compareValue(base: unknown, head: unknown, level: ApiContractCompatibilityChange['level'], code: string, path: string, changes: ApiContractCompatibilityChange[]): void {
  if (canonical(base) !== canonical(head)) {
    addChange(changes, level, `API_COMPAT_CALCULATOR_${code}`, path, 'Calculator contract changed.');
  }
}

function canonical(value: unknown): string {
  // Calculator arrays are allowlists/sets; declaration and YAML mapping order carry no semantics.
  if (Array.isArray(value)) return JSON.stringify(value.map(canonical).sort());
  if (value !== null && typeof value === 'object') {
    return JSON.stringify(Object.entries(value).filter(([, item]) => item !== undefined).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, canonical(item)]));
  }
  return JSON.stringify(value) ?? 'undefined';
}
