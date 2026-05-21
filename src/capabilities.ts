import {
  getGridRuntimeFeatureEdition,
  type GridRuntimeFeatureKey,
} from "./runtime/featureCatalog";

export type GridTierPreset = "core" | "pro" | "enterprise";

export interface GridCapabilityDefinition {
  tier: GridTierPreset;
  dependsOn?: readonly string[];
  description: string;
}

interface GridCapabilityDefinitionDraft {
  tier?: GridTierPreset;
  runtimeFeature?: GridRuntimeFeatureKey;
  dependsOn?: readonly string[];
  description: string;
}

const resolveGridCapabilityTier = (
  definition: GridCapabilityDefinitionDraft,
): GridTierPreset => {
  if (!definition.runtimeFeature) {
    return definition.tier ?? "core";
  }

  const edition = getGridRuntimeFeatureEdition(definition.runtimeFeature);
  if (edition === "shared-internal") {
    throw new Error(
      `[grid] Capability definitions cannot point at shared-internal runtime feature "${definition.runtimeFeature}".`,
    );
  }
  return edition;
};

const defineGridCapability = <T extends GridCapabilityDefinitionDraft>(
  definition: T,
) => {
  const tier = resolveGridCapabilityTier(definition);
  if (definition.dependsOn?.length) {
    return {
      tier,
      dependsOn: definition.dependsOn,
      description: definition.description,
    } as const;
  }
  return {
    tier,
    description: definition.description,
  } as const;
};

export const GRID_CAPABILITY_DEFINITIONS = {
  selection: defineGridCapability({
    tier: "core",
    description: "Cell, row, and column selection interactions.",
  }),
  edit: defineGridCapability({
    tier: "core",
    description: "Cell editing and row/column mutation workflows.",
  }),
  clipboard: defineGridCapability({
    tier: "core",
    description: "Copy, cut, and paste support.",
  }),
  resize: defineGridCapability({
    tier: "core",
    description: "Column and row resizing.",
  }),
  "sort.basic": defineGridCapability({
    tier: "core",
    description: "Single-column sorting.",
  }),
  "filter.basic": defineGridCapability({
    tier: "core",
    description: "Basic client/server filter state and filter popovers.",
  }),
  search: defineGridCapability({
    tier: "core",
    description: "Grid search and result navigation.",
  }),
  pagination: defineGridCapability({
    tier: "core",
    description: "Client and server pagination state.",
  }),
  virtualization: defineGridCapability({
    tier: "core",
    description: "Horizontal, vertical, and cell-content virtualization.",
  }),
  theming: defineGridCapability({
    tier: "core",
    description: "Theme tokens, icons, and inline overrides.",
  }),
  "io.csv": defineGridCapability({
    tier: "core",
    description: "CSV import and export.",
  }),
  "contextMenu.base": defineGridCapability({
    runtimeFeature: "contextMenuBase",
    description: "Built-in context-menu state, actions, and overlay rendering.",
  }),
  "reorder.column": defineGridCapability({
    runtimeFeature: "columnReorderBasic",
    description: "Basic single-column reorder interactions.",
  }),
  "reorder.row": defineGridCapability({
    runtimeFeature: "rowReorderBasic",
    description: "Basic single-row reorder interactions.",
  }),
  "schema.core": defineGridCapability({
    tier: "core",
    description: "Core schema validate/apply/extract contracts.",
  }),
  formula: defineGridCapability({
    runtimeFeature: "formula",
    description: "Formula bar and formula-engine workflows.",
  }),
  pinning: defineGridCapability({
    runtimeFeature: "pinning",
    description: "Pinned rows and columns.",
  }),
  reorder: defineGridCapability({
    runtimeFeature: "reorder",
    dependsOn: ["reorder.column", "reorder.row"],
    description:
      "Advanced multi-row, grouped, pinned, external, and multi-column drag/reorder behaviors.",
  }),
  spanning: defineGridCapability({
    runtimeFeature: "spanning",
    description: "Merged cells and spanning behavior.",
  }),
  validation: defineGridCapability({
    runtimeFeature: "validation",
    description: "Cell validation rules and indicators.",
  }),
  keyedHeaders: defineGridCapability({
    runtimeFeature: "keyedHeaders",
    description: "Spreadsheet-style keyed row and column headers.",
  }),
  "sort.multi": defineGridCapability({
    runtimeFeature: "multiSort",
    dependsOn: ["sort.basic"],
    description: "Multi-column sort models.",
  }),
  "filter.floating": defineGridCapability({
    runtimeFeature: "floatingFilter",
    dependsOn: ["filter.basic"],
    description: "Floating filter row below headers.",
  }),
  "filter.advanced": defineGridCapability({
    runtimeFeature: "advancedFiltering",
    dependsOn: ["filter.basic"],
    description: "Advanced multi-filter blocks and set filters.",
  }),
  grouping: defineGridCapability({
    runtimeFeature: "grouping",
    description: "Client row grouping interactions.",
  }),
  treeData: defineGridCapability({
    runtimeFeature: "treeData",
    description: "Client tree data rendering.",
  }),
  sparkline: defineGridCapability({
    runtimeFeature: "sparkline",
    description: "Inline sparkline rendering and viewer support.",
  }),
  "io.excel": defineGridCapability({
    runtimeFeature: "excelIo",
    description: "Excel import and export.",
  }),
  "contextMenu.customization": defineGridCapability({
    runtimeFeature: "contextMenuCustomization",
    dependsOn: ["contextMenu.base"],
    description: "Custom context-menu actions and presentation.",
  }),
  charts: defineGridCapability({
    runtimeFeature: "charts",
    description: "Integrated chart panels and chart settings.",
  }),
  pivot: defineGridCapability({
    runtimeFeature: "pivot",
    description: "Client and server pivot workflows.",
  }),
  serverRowModel: defineGridCapability({
    runtimeFeature: "serverRowModel",
    description: "Server-side row model, grouping, tree data, and pagination.",
  }),
  masterDetail: defineGridCapability({
    runtimeFeature: "masterDetail",
    description: "Master/detail rows and detail renderers.",
  }),
} as const satisfies Record<string, GridCapabilityDefinition>;

export type GridCapabilityId = keyof typeof GRID_CAPABILITY_DEFINITIONS;

export interface GridCapabilityPolicyInput {
  tier?: GridTierPreset;
  enable?: GridCapabilityId[];
  disable?: GridCapabilityId[];
}

export interface GridResolvedCapabilities {
  tier: GridTierPreset;
  enabled: GridCapabilityId[];
  disabled: GridCapabilityId[];
  has: (capability: GridCapabilityId) => boolean;
}

const GRID_TIER_ORDER: Record<GridTierPreset, number> = {
  core: 0,
  pro: 1,
  enterprise: 2,
};

export const GRID_CAPABILITY_IDS = Object.keys(
  GRID_CAPABILITY_DEFINITIONS,
) as GridCapabilityId[];

export const GRID_TIER_CAPABILITIES: Record<GridTierPreset, GridCapabilityId[]> = {
  core: GRID_CAPABILITY_IDS.filter(
    (capability) =>
      GRID_TIER_ORDER[GRID_CAPABILITY_DEFINITIONS[capability].tier] <=
      GRID_TIER_ORDER.core,
  ),
  pro: GRID_CAPABILITY_IDS.filter(
    (capability) =>
      GRID_TIER_ORDER[GRID_CAPABILITY_DEFINITIONS[capability].tier] <=
      GRID_TIER_ORDER.pro,
  ),
  enterprise: GRID_CAPABILITY_IDS.filter(
    (capability) =>
      GRID_TIER_ORDER[GRID_CAPABILITY_DEFINITIONS[capability].tier] <=
      GRID_TIER_ORDER.enterprise,
  ),
};

export const isGridCapabilityId = (
  value: unknown,
): value is GridCapabilityId =>
  typeof value === "string" && value in GRID_CAPABILITY_DEFINITIONS;

const addCapabilityWithDependencies = (
  enabled: Set<GridCapabilityId>,
  capability: GridCapabilityId,
) => {
  if (enabled.has(capability)) return;
  enabled.add(capability);
  const definition = GRID_CAPABILITY_DEFINITIONS[capability];
  const dependencies =
    "dependsOn" in definition ? definition.dependsOn : undefined;
  dependencies?.forEach((dependency) =>
    addCapabilityWithDependencies(enabled, dependency as GridCapabilityId),
  );
};

const pruneIncompatibleCapabilities = (enabled: Set<GridCapabilityId>) => {
  let changed = true;
  while (changed) {
    changed = false;
    GRID_CAPABILITY_IDS.forEach((capability) => {
      if (!enabled.has(capability)) return;
      const definition = GRID_CAPABILITY_DEFINITIONS[capability];
      const dependencies =
        "dependsOn" in definition ? definition.dependsOn : undefined;
      if (!dependencies?.length) return;
      const missingDependency = dependencies.some(
        (dependency) => !enabled.has(dependency as GridCapabilityId),
      );
      if (!missingDependency) return;
      enabled.delete(capability);
      changed = true;
    });
  }
};

export const resolveGridCapabilities = (
  input?: GridCapabilityPolicyInput,
): GridResolvedCapabilities => {
  const tier = input?.tier ?? "enterprise";
  const enabled = new Set<GridCapabilityId>(GRID_TIER_CAPABILITIES[tier]);

  input?.enable?.forEach((capability) =>
    addCapabilityWithDependencies(enabled, capability),
  );

  input?.disable?.forEach((capability) => {
    enabled.delete(capability);
  });

  pruneIncompatibleCapabilities(enabled);

  const enabledList = GRID_CAPABILITY_IDS.filter((capability) =>
    enabled.has(capability),
  );
  const disabledList = GRID_CAPABILITY_IDS.filter(
    (capability) => !enabled.has(capability),
  );

  return {
    tier,
    enabled: enabledList,
    disabled: disabledList,
    has: (capability) => enabled.has(capability),
  };
};

export const createGridCapabilityError = (
  capability: GridCapabilityId,
): Error =>
  new Error(
    `Grid capability "${capability}" is disabled for the current tier or capability policy.`,
  );
