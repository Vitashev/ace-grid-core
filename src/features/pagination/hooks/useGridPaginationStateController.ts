import { useEffect, useMemo, useState } from "react";

import type { GridPaginationMode } from "../../../types";

type GridPaginationStateValue = {
  enabled: boolean;
  mode: GridPaginationMode;
  pageIndex: number;
  pageSize: number;
  pageSizeOptions: number[];
  keepPageOnSizeChange: boolean;
  showPageSize: boolean;
  showRange: boolean;
  showPageInfo: boolean;
  showControls: boolean;
  showFirstLast: boolean;
  disabled: boolean;
};

type GridPaginationStateController = GridPaginationStateValue & {
  setEnabled: (enabled: boolean) => void;
  setMode: (mode: GridPaginationMode) => void;
  setPageIndex: (index: number) => void;
  setPageSize: (size: number) => void;
  setKeepPageOnSizeChange: (enabled: boolean) => void;
  setShowPageSize: (enabled: boolean) => void;
  setShowRange: (enabled: boolean) => void;
  setShowPageInfo: (enabled: boolean) => void;
  setShowControls: (enabled: boolean) => void;
  setShowFirstLast: (enabled: boolean) => void;
  setDisabled: (disabled: boolean) => void;
  set: (patch: Partial<GridPaginationStateValue>) => void;
};

type UseGridPaginationStateControllerArgs = {
  initialEnabled: boolean;
  initialMode: GridPaginationMode;
  initialPageIndex: number;
  initialPageSize: number;
  pageSizeOptions: number[];
  initialKeepPageOnSizeChange: boolean;
  initialShowPageSize: boolean;
  initialShowRange: boolean;
  initialShowPageInfo: boolean;
  initialShowControls: boolean;
  initialShowFirstLast: boolean;
  initialDisabled: boolean;
};

export const useGridPaginationStateController = ({
  initialEnabled,
  initialMode,
  initialPageIndex,
  initialPageSize,
  pageSizeOptions,
  initialKeepPageOnSizeChange,
  initialShowPageSize,
  initialShowRange,
  initialShowPageInfo,
  initialShowControls,
  initialShowFirstLast,
  initialDisabled,
}: UseGridPaginationStateControllerArgs): {
  value: GridPaginationStateValue;
  state: GridPaginationStateController;
} => {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [mode, setMode] = useState<GridPaginationMode>(initialMode);
  const [pageIndex, setPageIndex] = useState(initialPageIndex);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [keepPageOnSizeChange, setKeepPageOnSizeChange] = useState(
    initialKeepPageOnSizeChange,
  );
  const [showPageSize, setShowPageSize] = useState(initialShowPageSize);
  const [showRange, setShowRange] = useState(initialShowRange);
  const [showPageInfo, setShowPageInfo] = useState(initialShowPageInfo);
  const [showControls, setShowControls] = useState(initialShowControls);
  const [showFirstLast, setShowFirstLast] = useState(initialShowFirstLast);
  const [disabled, setDisabled] = useState(initialDisabled);

  const value = useMemo<GridPaginationStateValue>(
    () => ({
      enabled,
      mode,
      pageIndex,
      pageSize,
      pageSizeOptions,
      keepPageOnSizeChange,
      showPageSize,
      showRange,
      showPageInfo,
      showControls,
      showFirstLast,
      disabled,
    }),
    [
      enabled,
      mode,
      pageIndex,
      pageSize,
      pageSizeOptions,
      keepPageOnSizeChange,
      showPageSize,
      showRange,
      showPageInfo,
      showControls,
      showFirstLast,
      disabled,
    ],
  );

  const state = useMemo<GridPaginationStateController>(
    () => ({
      ...value,
      setEnabled,
      setMode,
      setPageIndex,
      setPageSize,
      setKeepPageOnSizeChange,
      setShowPageSize,
      setShowRange,
      setShowPageInfo,
      setShowControls,
      setShowFirstLast,
      setDisabled,
      set: (patch) => {
        if (patch.enabled != null) setEnabled(patch.enabled);
        if (patch.mode != null) setMode(patch.mode);
        if (patch.pageIndex != null) setPageIndex(patch.pageIndex);
        if (patch.pageSize != null) setPageSize(patch.pageSize);
        if (patch.keepPageOnSizeChange != null) {
          setKeepPageOnSizeChange(patch.keepPageOnSizeChange);
        }
        if (patch.showPageSize != null) setShowPageSize(patch.showPageSize);
        if (patch.showRange != null) setShowRange(patch.showRange);
        if (patch.showPageInfo != null) setShowPageInfo(patch.showPageInfo);
        if (patch.showControls != null) setShowControls(patch.showControls);
        if (patch.showFirstLast != null) {
          setShowFirstLast(patch.showFirstLast);
        }
        if (patch.disabled != null) setDisabled(patch.disabled);
      },
    }),
    [value],
  );

  return { value, state };
};

type UseGridPaginationPageClampArgs = {
  enabled: boolean;
  pageIndex: number;
  pageSize: number;
  totalRowCount: number;
  setPageIndex: (index: number) => void;
};

export const useGridPaginationPageClamp = ({
  enabled,
  pageIndex,
  pageSize,
  totalRowCount,
  setPageIndex,
}: UseGridPaginationPageClampArgs) => {
  useEffect(() => {
    if (!enabled) return;
    const effectivePageSize = Math.max(1, Math.trunc(pageSize) || 0);
    const pageCount = Math.max(1, Math.ceil(totalRowCount / effectivePageSize));
    const nextIndex = Math.min(pageIndex, pageCount - 1);
    if (nextIndex !== pageIndex) setPageIndex(nextIndex);
  }, [enabled, pageIndex, pageSize, totalRowCount, setPageIndex]);
};
