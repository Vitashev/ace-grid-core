import { registerGridRuntimeModules } from "./runtime/modules";
import { gridCoreRuntimeModuleLayer } from "./runtime/tierModules/core";
import { createGridComponent } from "./components/Grid";
import { useGridInternal, type UseGridOptions } from "./hooks/useGrid";

registerGridRuntimeModules(gridCoreRuntimeModuleLayer);

export const Grid = createGridComponent("core");
export { Grid as AceGrid };
export { GridCell } from "./components/GridCell";
export { CellEditor } from "./features/edit/components/CellEditor";
export { ColumnFilter, RowFilter } from "./features/filtering";
export {
  GRID_CAPABILITY_DEFINITIONS,
  GRID_CAPABILITY_IDS,
  GRID_TIER_CAPABILITIES,
  createGridCapabilityError,
  isGridCapabilityId,
  resolveGridCapabilities,
} from "./capabilities";
export { GRID_SYSTEM_COLUMN_IDS, GRID_SYSTEM_COLUMN_KEYS } from "./types";
export const useGrid = (options: UseGridOptions) =>
  useGridInternal(options, "core");
export {
  PaginationBar,
  paginateRowGroups,
  usePagination,
} from "./features/pagination";
export {
  GridSearchProvider,
  collectSearchMatches,
  getNextSearchIndex,
  getPrevSearchIndex,
  useGridSearch,
} from "./features/search";
export * from "./features/column-groups/nodes";
export {
  GridThemeProvider,
  availableThemes,
  dataDarkTheme,
  dataTheme,
  defaultTheme,
  defaultThemeName,
  liquidGlassDarkTheme,
  liquidGlassTheme,
  material3DarkTheme,
  material3Theme,
  resolveTheme,
} from "./features/theming";
export {
  BUILT_IN_CONTEXT_MENU_ACTIONS,
  CellContextMenu,
  GRID_DEFAULT_CONTEXT_MENU_ITEM_IDS,
} from "./features/context-menu";
export { PinningEngine } from "./features/pinning";

export type * from "./capabilities";
export type * from "./features/context-menu";
export type * from "./features/pagination";
export type * from "./features/pinning";
export type * from "./features/theming";
export type * from "./hooks/useGrid";
export type * from "./types";
