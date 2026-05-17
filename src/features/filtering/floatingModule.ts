import type { GridFloatingFilterModule } from "../../runtime/modules";
import { FloatingFilterRow } from "../../components/FloatingFilterRow";

export const gridFloatingFilterModule: GridFloatingFilterModule = {
  available: true,
  implementationMarker: "__ACE_GRID_CORE_FILTER_FLOATING__",
  FloatingFilterRow,
};
