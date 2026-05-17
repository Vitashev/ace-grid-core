import runtimeFeatureCatalogJson from "./feature-catalog.json";

import type { GridRuntimeModules } from "./modules";

export type GridRuntimeFeatureKey = keyof GridRuntimeModules;
export type GridRuntimeFeatureEdition =
  | "core"
  | "pro"
  | "enterprise"
  | "shared-internal";
export type GridRuntimeProductTier = Exclude<
  GridRuntimeFeatureEdition,
  "shared-internal"
>;

export interface GridRuntimeFeatureCatalogEntry {
  key: GridRuntimeFeatureKey;
  label: string;
  edition: GridRuntimeFeatureEdition;
}

const GRID_RUNTIME_TIER_RANK: Record<GridRuntimeProductTier, number> = {
  core: 0,
  pro: 1,
  enterprise: 2,
};

const validateGridRuntimeFeatureCatalog = (
  entries: readonly GridRuntimeFeatureCatalogEntry[],
) => {
  const seenKeys = new Set<string>();

  for (const entry of entries) {
    if (seenKeys.has(entry.key)) {
      throw new Error(
        `[grid] Duplicate runtime feature catalog entry "${entry.key}".`,
      );
    }
    seenKeys.add(entry.key);

    if (
      entry.edition !== "core" &&
      entry.edition !== "pro" &&
      entry.edition !== "enterprise" &&
      entry.edition !== "shared-internal"
    ) {
      throw new Error(
        `[grid] Unknown runtime feature edition "${entry.edition}" for "${entry.key}".`,
      );
    }
  }
};

const gridRuntimeFeatureCatalog =
  runtimeFeatureCatalogJson as GridRuntimeFeatureCatalogEntry[];

validateGridRuntimeFeatureCatalog(gridRuntimeFeatureCatalog);

export const GRID_RUNTIME_FEATURE_CATALOG =
  gridRuntimeFeatureCatalog as readonly GridRuntimeFeatureCatalogEntry[];

const GRID_RUNTIME_FEATURE_CATALOG_BY_KEY = new Map(
  GRID_RUNTIME_FEATURE_CATALOG.map((entry) => [entry.key, entry]),
);

export const getGridRuntimeFeatureCatalogEntry = (
  key: GridRuntimeFeatureKey,
): GridRuntimeFeatureCatalogEntry => {
  const entry = GRID_RUNTIME_FEATURE_CATALOG_BY_KEY.get(key);
  if (!entry) {
    throw new Error(`[grid] Unknown runtime feature "${key}".`);
  }
  return entry;
};

export const getGridRuntimeFeatureEdition = (
  key: GridRuntimeFeatureKey,
): GridRuntimeFeatureEdition => getGridRuntimeFeatureCatalogEntry(key).edition;

export const getGridRuntimeFeatureKeysForEdition = (
  edition: GridRuntimeFeatureEdition,
): GridRuntimeFeatureKey[] =>
  GRID_RUNTIME_FEATURE_CATALOG.filter((entry) => entry.edition === edition).map(
    (entry) => entry.key,
  );

export const getGridRuntimeFeatureKeysForTier = (
  tier: GridRuntimeProductTier,
): GridRuntimeFeatureKey[] =>
  GRID_RUNTIME_FEATURE_CATALOG.filter((entry) => {
    if (entry.edition === "shared-internal") return false;
    return GRID_RUNTIME_TIER_RANK[entry.edition] <= GRID_RUNTIME_TIER_RANK[tier];
  }).map((entry) => entry.key);

export const GRID_PAID_RUNTIME_FEATURE_CATALOG =
  GRID_RUNTIME_FEATURE_CATALOG.filter(
    (entry) => entry.edition === "pro" || entry.edition === "enterprise",
  );

const formatGridRuntimeModuleKeys = (keys: Iterable<string>) =>
  Array.from(keys).sort().join(", ") || "(none)";

const assertGridRuntimeModuleKeys = (
  scope: string,
  expectedKeys: readonly GridRuntimeFeatureKey[],
  actualKeys: readonly string[],
) => {
  const expected = new Set(expectedKeys);
  const actual = new Set(actualKeys);

  const missing = expectedKeys.filter((key) => !actual.has(key));
  const extra = actualKeys.filter(
    (key) => !expected.has(key as GridRuntimeFeatureKey),
  );

  if (missing.length === 0 && extra.length === 0) return;

  throw new Error(
    [
      `[grid] Runtime module registration drifted from the feature catalog for ${scope}.`,
      `Expected: ${formatGridRuntimeModuleKeys(expectedKeys)}`,
      `Actual: ${formatGridRuntimeModuleKeys(actualKeys)}`,
      `Missing: ${formatGridRuntimeModuleKeys(missing)}`,
      `Extra: ${formatGridRuntimeModuleKeys(extra)}`,
    ].join("\n"),
  );
};

export const assertGridRuntimeModuleKeysMatchEdition = <
  T extends Partial<GridRuntimeModules>,
>(
  edition: GridRuntimeFeatureEdition,
  modules: T,
): T => {
  assertGridRuntimeModuleKeys(
    `edition "${edition}"`,
    getGridRuntimeFeatureKeysForEdition(edition),
    Object.keys(modules),
  );
  return modules;
};

export const assertGridRuntimeModuleKeysMatchTier = <
  T extends Partial<GridRuntimeModules>,
>(
  tier: GridRuntimeProductTier,
  modules: T,
): T => {
  assertGridRuntimeModuleKeys(
    `tier "${tier}"`,
    getGridRuntimeFeatureKeysForTier(tier),
    Object.keys(modules),
  );
  return modules;
};
