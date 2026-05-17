import type { GridContextMenuBaseModule } from "../../runtime/modules";

import { CellContextMenu } from "./components/CellContextMenu";
import { useContextMenu } from "./hooks/useContextMenu";

export const gridContextMenuBaseModule: GridContextMenuBaseModule = {
  available: true,
  CellContextMenu,
  useContextMenu,
};
