import { useMemo } from "react";
import { GridColumn } from "../../../types";

export function useColumnLookups(columns: GridColumn[]) {
  const colIndex = useMemo(() => {
    const m = new Map<string, number>();
    columns.forEach((c, i) => m.set(c.key, i));
    return m;
  }, [columns]);
  const colByKey = useMemo(
    () => new Map(columns.map((c) => [c.key, c])),
    [columns]
  );
  return { colIndex, colByKey };
}
