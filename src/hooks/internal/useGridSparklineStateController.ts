import { useMemo, useState } from "react";

type GridSparklineStateValue = {
  enabled: boolean;
  viewerEnabled: boolean;
  scaleMode: "stretch" | "fit" | "cover";
};

type GridSparklineStateController = GridSparklineStateValue & {
  set: (patch: Partial<GridSparklineStateValue>) => void;
  setEnabled: (enabled: boolean) => void;
  setViewerEnabled: (enabled: boolean) => void;
  setScaleMode: (mode: "stretch" | "fit" | "cover") => void;
};

type UseGridSparklineStateControllerArgs = {
  initialEnabled: boolean;
  initialViewerEnabled: boolean;
  initialScaleMode: "stretch" | "fit" | "cover";
};

export const useGridSparklineStateController = ({
  initialEnabled,
  initialViewerEnabled,
  initialScaleMode,
}: UseGridSparklineStateControllerArgs): {
  value: GridSparklineStateValue;
  state: GridSparklineStateController;
} => {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [viewerEnabled, setViewerEnabled] = useState(initialViewerEnabled);
  const [scaleMode, setScaleMode] = useState(initialScaleMode);

  const value = useMemo<GridSparklineStateValue>(
    () => ({
      enabled,
      viewerEnabled,
      scaleMode,
    }),
    [enabled, viewerEnabled, scaleMode],
  );

  const state = useMemo<GridSparklineStateController>(
    () => ({
      ...value,
      set: (patch) => {
        if (patch.enabled != null) setEnabled(patch.enabled);
        if (patch.viewerEnabled != null) {
          setViewerEnabled(patch.viewerEnabled);
        }
        if (patch.scaleMode != null) setScaleMode(patch.scaleMode);
      },
      setEnabled,
      setViewerEnabled,
      setScaleMode,
    }),
    [value],
  );

  return { value, state };
};
