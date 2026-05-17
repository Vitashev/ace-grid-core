import type { GridRowReorderModule } from "../../runtime/modules";

import { RowOrderCell } from "./components/RowOrderCell";
import { useRowDnD } from "./hooks/useRowDnD";

export const gridRowReorderModule: GridRowReorderModule = {
  available: true,
  RowOrderCell,
  useRowDnD,
};
