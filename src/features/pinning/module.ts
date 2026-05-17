import type { GridPinningModule } from "../../runtime/modules";
import { RowPinCell } from "./components/RowPinCell";
import { usePinnedSets, useStickyOffsets } from "./index";

export const gridPinningModule: GridPinningModule = {
  available: true,
  implementationMarker: "__ACE_GRID_CORE_PINNING__",
  RowPinCell,
  usePinnedSets,
  useStickyOffsets,
};
