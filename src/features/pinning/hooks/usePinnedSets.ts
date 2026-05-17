import { useMemo } from "react";

export function usePinnedSets(pinnedColumns: {
  left: string[];
  right: string[];
}) {
  const leftPinnedSet = useMemo(
    () => new Set(pinnedColumns.left),
    [pinnedColumns.left]
  );
  const rightPinnedSet = useMemo(
    () => new Set(pinnedColumns.right),
    [pinnedColumns.right]
  );
  const pinnedSet = useMemo(
    () => new Set([...pinnedColumns.left, ...pinnedColumns.right]),
    [pinnedColumns.left, pinnedColumns.right]
  );
  return { leftPinnedSet, rightPinnedSet, pinnedSet };
}
