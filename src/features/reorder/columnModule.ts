import type { GridColumnReorderModule } from "../../runtime/modules";
import { useColumnDnD } from "./hooks/useColumnDnD";

export const gridColumnReorderModule: GridColumnReorderModule = {
  available: true,
  useColumnDnD,
};
