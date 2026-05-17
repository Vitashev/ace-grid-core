import { useState, useCallback } from "react";
import { isSystemCol } from "../../cell-selection";
import type { GridColumnSelectionChangeMeta } from "../../../types";

export function useColumnSelection(
  isColSelection: boolean,
  onColumnSelectionChange?: (
    selectedColumnKeys: string[],
    meta?: GridColumnSelectionChangeMeta
  ) => void
) {
  const [internalSelectedColumnKeys, setInternalSelectedColumnKeys] = useState<
    string[]
  >([]);
  const selectedColumnKeys = internalSelectedColumnKeys;

  const toggleColumnSelection = useCallback(
    (key: string) => {
      if (!isColSelection) return;
      if (isSystemCol(key)) return;
      setInternalSelectedColumnKeys((prev) => {
        const next = prev.includes(key)
          ? prev.filter((k) => k !== key)
          : [...prev, key];
        if (onColumnSelectionChange)
          Promise.resolve().then(() =>
            onColumnSelectionChange(next, {
              source: "column",
              anchorColumnKey: key,
            })
          );
        return next;
      });
    },
    [isColSelection, onColumnSelectionChange]
  );

  return { selectedColumnKeys, toggleColumnSelection };
}
