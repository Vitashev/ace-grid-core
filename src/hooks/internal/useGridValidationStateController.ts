import { useMemo, useState } from "react";

import type {
  GridValidationIndicator,
  GridValidationMode,
  GridValidationTrigger,
} from "../../types";

type GridValidationStateValue = {
  enabled: boolean;
  mode: GridValidationMode;
  validateOn: GridValidationTrigger;
  validateDebounceMs: number;
  validateOnVisibleChange: boolean;
  validateVisibleOnly: boolean;
  validateVisibleDebounceMs: number;
  validateAllToken: number | undefined;
  indicator: GridValidationIndicator;
  tooltip: boolean;
  highlightErrors: boolean;
  highlightWarnings: boolean;
  highlightInfo: boolean;
};

type GridValidationStateController = GridValidationStateValue & {
  setEnabled: (enabled: boolean) => void;
  setMode: (mode: GridValidationMode) => void;
  setValidateOn: (trigger: GridValidationTrigger) => void;
  setValidateDebounceMs: (debounceMs: number) => void;
  setValidateOnVisibleChange: (enabled: boolean) => void;
  setValidateVisibleOnly: (enabled: boolean) => void;
  setValidateVisibleDebounceMs: (debounceMs: number) => void;
  setValidateAllToken: (token: number | undefined) => void;
  setIndicator: (indicator: GridValidationIndicator) => void;
  setTooltip: (enabled: boolean) => void;
  setHighlightErrors: (enabled: boolean) => void;
  setHighlightWarnings: (enabled: boolean) => void;
  setHighlightInfo: (enabled: boolean) => void;
  set: (patch: Partial<GridValidationStateValue>) => void;
  requestValidateAll: () => void;
};

type UseGridValidationStateControllerArgs = {
  initialEnabled: boolean;
  initialMode: GridValidationMode;
  initialValidateOn: GridValidationTrigger;
  initialValidateDebounceMs: number;
  initialValidateOnVisibleChange: boolean;
  initialValidateVisibleOnly: boolean;
  initialValidateVisibleDebounceMs: number;
  initialValidateAllToken: number | undefined;
  initialIndicator: GridValidationIndicator;
  initialTooltip: boolean;
  initialHighlightErrors: boolean;
  initialHighlightWarnings: boolean;
  initialHighlightInfo: boolean;
};

export const useGridValidationStateController = ({
  initialEnabled,
  initialMode,
  initialValidateOn,
  initialValidateDebounceMs,
  initialValidateOnVisibleChange,
  initialValidateVisibleOnly,
  initialValidateVisibleDebounceMs,
  initialValidateAllToken,
  initialIndicator,
  initialTooltip,
  initialHighlightErrors,
  initialHighlightWarnings,
  initialHighlightInfo,
}: UseGridValidationStateControllerArgs): {
  value: GridValidationStateValue;
  state: GridValidationStateController;
} => {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [mode, setMode] = useState<GridValidationMode>(initialMode);
  const [validateOn, setValidateOn] =
    useState<GridValidationTrigger>(initialValidateOn);
  const [validateDebounceMs, setValidateDebounceMs] = useState(
    initialValidateDebounceMs,
  );
  const [validateOnVisibleChange, setValidateOnVisibleChange] = useState(
    initialValidateOnVisibleChange,
  );
  const [validateVisibleOnly, setValidateVisibleOnly] = useState(
    initialValidateVisibleOnly,
  );
  const [validateVisibleDebounceMs, setValidateVisibleDebounceMs] = useState(
    initialValidateVisibleDebounceMs,
  );
  const [validateAllToken, setValidateAllToken] = useState<number | undefined>(
    initialValidateAllToken,
  );
  const [indicator, setIndicator] =
    useState<GridValidationIndicator>(initialIndicator);
  const [tooltip, setTooltip] = useState(initialTooltip);
  const [highlightErrors, setHighlightErrors] = useState(
    initialHighlightErrors,
  );
  const [highlightWarnings, setHighlightWarnings] = useState(
    initialHighlightWarnings,
  );
  const [highlightInfo, setHighlightInfo] = useState(initialHighlightInfo);

  const value = useMemo<GridValidationStateValue>(
    () => ({
      enabled,
      mode,
      validateOn,
      validateDebounceMs,
      validateOnVisibleChange,
      validateVisibleOnly,
      validateVisibleDebounceMs,
      validateAllToken,
      indicator,
      tooltip,
      highlightErrors,
      highlightWarnings,
      highlightInfo,
    }),
    [
      enabled,
      mode,
      validateOn,
      validateDebounceMs,
      validateOnVisibleChange,
      validateVisibleOnly,
      validateVisibleDebounceMs,
      validateAllToken,
      indicator,
      tooltip,
      highlightErrors,
      highlightWarnings,
      highlightInfo,
    ],
  );

  const state = useMemo<GridValidationStateController>(
    () => ({
      ...value,
      setEnabled,
      setMode,
      setValidateOn,
      setValidateDebounceMs,
      setValidateOnVisibleChange,
      setValidateVisibleOnly,
      setValidateVisibleDebounceMs,
      setValidateAllToken,
      setIndicator,
      setTooltip,
      setHighlightErrors,
      setHighlightWarnings,
      setHighlightInfo,
      set: (patch) => {
        if (patch.enabled != null) setEnabled(patch.enabled);
        if (patch.mode != null) setMode(patch.mode);
        if (patch.validateOn != null) setValidateOn(patch.validateOn);
        if (patch.validateDebounceMs != null) {
          setValidateDebounceMs(Math.max(0, patch.validateDebounceMs));
        }
        if (patch.validateOnVisibleChange != null) {
          setValidateOnVisibleChange(patch.validateOnVisibleChange);
        }
        if (patch.validateVisibleOnly != null) {
          setValidateVisibleOnly(patch.validateVisibleOnly);
        }
        if (patch.validateVisibleDebounceMs != null) {
          setValidateVisibleDebounceMs(
            Math.max(0, patch.validateVisibleDebounceMs),
          );
        }
        if ("validateAllToken" in patch) {
          setValidateAllToken(patch.validateAllToken);
        }
        if (patch.indicator != null) setIndicator(patch.indicator);
        if (patch.tooltip != null) setTooltip(patch.tooltip);
        if (patch.highlightErrors != null) {
          setHighlightErrors(patch.highlightErrors);
        }
        if (patch.highlightWarnings != null) {
          setHighlightWarnings(patch.highlightWarnings);
        }
        if (patch.highlightInfo != null) {
          setHighlightInfo(patch.highlightInfo);
        }
      },
      requestValidateAll: () =>
        setValidateAllToken((prev) => (prev == null ? 1 : prev + 1)),
    }),
    [value],
  );

  return { value, state };
};
