import { useMemo, useState } from "react";

import type {
  GridChartAxisScale,
  GridChartCategoryAggregation,
  GridChartMissingValueMode,
  GridChartNormalizationMode,
  GridChartSamplingMode,
  GridChartScatterCategoryMode,
  GridChartTimeBucket,
  GridChartUniqueCategoryMode,
} from "../../types";

type GridChartStateValue = {
  autoSortCategories: boolean;
  enabled: boolean;
  createChartMenuEnabled: boolean;
  autoUpdateSelection: boolean;
  autoDetectType: boolean;
  enableDownload: boolean;
  showTypeSelector: boolean;
  showSeriesBy: boolean;
  showGroupBy: boolean;
  showMappingSummary: boolean;
  enableBrushSelection: boolean;
  brushSelectionModifier: "none" | "shift" | "alt" | "meta";
  useCustomIcons: boolean;
  uniqueCategories: boolean;
  uniqueCategoryMode: GridChartUniqueCategoryMode;
  categoryAggregation: GridChartCategoryAggregation;
  scatterCategoryMode: GridChartScatterCategoryMode;
  histogramBins: number;
  boxShowOutliers: boolean;
  violinShowMedian: boolean;
  normalization: GridChartNormalizationMode;
  samplingMode: GridChartSamplingMode;
  samplingSize: number;
  samplingSeed: number;
  samplingColumnKey: string;
  missingValueMode: GridChartMissingValueMode;
  timeBucket: GridChartTimeBucket;
  xAxisScale: GridChartAxisScale;
  yAxisScale: GridChartAxisScale;
  showAllXTicks: boolean;
  showAllYTicks: boolean;
  pinXAxis: boolean;
  pinYAxis: boolean;
  autoFitTicks: boolean;
  seriesByMode: "both" | "columns" | "rows";
};

type GridChartStateController = GridChartStateValue & {
  set: (patch: Partial<GridChartStateValue>) => void;
  setAutoSortCategories: (value: boolean) => void;
  setEnabled: (value: boolean) => void;
  setCreateChartMenuEnabled: (value: boolean) => void;
  setAutoUpdateSelection: (value: boolean) => void;
  setAutoDetectType: (value: boolean) => void;
  setEnableDownload: (value: boolean) => void;
  setShowTypeSelector: (value: boolean) => void;
  setShowSeriesBy: (value: boolean) => void;
  setShowGroupBy: (value: boolean) => void;
  setShowMappingSummary: (value: boolean) => void;
  setEnableBrushSelection: (value: boolean) => void;
  setBrushSelectionModifier: (
    value: "none" | "shift" | "alt" | "meta",
  ) => void;
  setUseCustomIcons: (value: boolean) => void;
  setUniqueCategories: (value: boolean) => void;
  setUniqueCategoryMode: (value: GridChartUniqueCategoryMode) => void;
  setCategoryAggregation: (value: GridChartCategoryAggregation) => void;
  setScatterCategoryMode: (value: GridChartScatterCategoryMode) => void;
  setHistogramBins: (value: number) => void;
  setBoxShowOutliers: (value: boolean) => void;
  setViolinShowMedian: (value: boolean) => void;
  setNormalization: (value: GridChartNormalizationMode) => void;
  setSamplingMode: (value: GridChartSamplingMode) => void;
  setSamplingSize: (value: number) => void;
  setSamplingSeed: (value: number) => void;
  setSamplingColumnKey: (value: string) => void;
  setMissingValueMode: (value: GridChartMissingValueMode) => void;
  setTimeBucket: (value: GridChartTimeBucket) => void;
  setXAxisScale: (value: GridChartAxisScale) => void;
  setYAxisScale: (value: GridChartAxisScale) => void;
  setShowAllXTicks: (value: boolean) => void;
  setShowAllYTicks: (value: boolean) => void;
  setPinXAxis: (value: boolean) => void;
  setPinYAxis: (value: boolean) => void;
  setAutoFitTicks: (value: boolean) => void;
  setSeriesByMode: (value: "both" | "columns" | "rows") => void;
};

type UseGridChartStateControllerArgs = GridChartStateValue;

export const useGridChartStateController = ({
  autoSortCategories: initialAutoSortCategories,
  enabled: initialEnabled,
  createChartMenuEnabled: initialCreateChartMenuEnabled,
  autoUpdateSelection: initialAutoUpdateSelection,
  autoDetectType: initialAutoDetectType,
  enableDownload: initialEnableDownload,
  showTypeSelector: initialShowTypeSelector,
  showSeriesBy: initialShowSeriesBy,
  showGroupBy: initialShowGroupBy,
  showMappingSummary: initialShowMappingSummary,
  enableBrushSelection: initialEnableBrushSelection,
  brushSelectionModifier: initialBrushSelectionModifier,
  useCustomIcons: initialUseCustomIcons,
  uniqueCategories: initialUniqueCategories,
  uniqueCategoryMode: initialUniqueCategoryMode,
  categoryAggregation: initialCategoryAggregation,
  scatterCategoryMode: initialScatterCategoryMode,
  histogramBins: initialHistogramBins,
  boxShowOutliers: initialBoxShowOutliers,
  violinShowMedian: initialViolinShowMedian,
  normalization: initialNormalization,
  samplingMode: initialSamplingMode,
  samplingSize: initialSamplingSize,
  samplingSeed: initialSamplingSeed,
  samplingColumnKey: initialSamplingColumnKey,
  missingValueMode: initialMissingValueMode,
  timeBucket: initialTimeBucket,
  xAxisScale: initialXAxisScale,
  yAxisScale: initialYAxisScale,
  showAllXTicks: initialShowAllXTicks,
  showAllYTicks: initialShowAllYTicks,
  pinXAxis: initialPinXAxis,
  pinYAxis: initialPinYAxis,
  autoFitTicks: initialAutoFitTicks,
  seriesByMode: initialSeriesByMode,
}: UseGridChartStateControllerArgs): {
  value: GridChartStateValue;
  state: GridChartStateController;
} => {
  const [autoSortCategories, setAutoSortCategories] = useState(
    initialAutoSortCategories,
  );
  const [enabled, setEnabled] = useState(initialEnabled);
  const [createChartMenuEnabled, setCreateChartMenuEnabled] = useState(
    initialCreateChartMenuEnabled,
  );
  const [autoUpdateSelection, setAutoUpdateSelection] = useState(
    initialAutoUpdateSelection,
  );
  const [autoDetectType, setAutoDetectType] = useState(initialAutoDetectType);
  const [enableDownload, setEnableDownload] = useState(initialEnableDownload);
  const [showTypeSelector, setShowTypeSelector] = useState(
    initialShowTypeSelector,
  );
  const [showSeriesBy, setShowSeriesBy] = useState(initialShowSeriesBy);
  const [showGroupBy, setShowGroupBy] = useState(initialShowGroupBy);
  const [showMappingSummary, setShowMappingSummary] = useState(
    initialShowMappingSummary,
  );
  const [enableBrushSelection, setEnableBrushSelection] = useState(
    initialEnableBrushSelection,
  );
  const [brushSelectionModifier, setBrushSelectionModifier] = useState(
    initialBrushSelectionModifier,
  );
  const [useCustomIcons, setUseCustomIcons] = useState(initialUseCustomIcons);
  const [uniqueCategories, setUniqueCategories] = useState(
    initialUniqueCategories,
  );
  const [uniqueCategoryMode, setUniqueCategoryMode] = useState(
    initialUniqueCategoryMode,
  );
  const [categoryAggregation, setCategoryAggregation] = useState(
    initialCategoryAggregation,
  );
  const [scatterCategoryMode, setScatterCategoryMode] = useState(
    initialScatterCategoryMode,
  );
  const [histogramBins, setHistogramBins] = useState(initialHistogramBins);
  const [boxShowOutliers, setBoxShowOutliers] = useState(
    initialBoxShowOutliers,
  );
  const [violinShowMedian, setViolinShowMedian] = useState(
    initialViolinShowMedian,
  );
  const [normalization, setNormalization] = useState(initialNormalization);
  const [samplingMode, setSamplingMode] = useState(initialSamplingMode);
  const [samplingSize, setSamplingSize] = useState(initialSamplingSize);
  const [samplingSeed, setSamplingSeed] = useState(initialSamplingSeed);
  const [samplingColumnKey, setSamplingColumnKey] = useState(
    initialSamplingColumnKey,
  );
  const [missingValueMode, setMissingValueMode] = useState(
    initialMissingValueMode,
  );
  const [timeBucket, setTimeBucket] = useState(initialTimeBucket);
  const [xAxisScale, setXAxisScale] = useState(initialXAxisScale);
  const [yAxisScale, setYAxisScale] = useState(initialYAxisScale);
  const [showAllXTicks, setShowAllXTicks] = useState(initialShowAllXTicks);
  const [showAllYTicks, setShowAllYTicks] = useState(initialShowAllYTicks);
  const [pinXAxis, setPinXAxis] = useState(initialPinXAxis);
  const [pinYAxis, setPinYAxis] = useState(initialPinYAxis);
  const [autoFitTicks, setAutoFitTicks] = useState(initialAutoFitTicks);
  const [seriesByMode, setSeriesByMode] = useState(initialSeriesByMode);

  const value = useMemo<GridChartStateValue>(
    () => ({
      autoSortCategories,
      enabled,
      createChartMenuEnabled,
      autoUpdateSelection,
      autoDetectType,
      enableDownload,
      showTypeSelector,
      showSeriesBy,
      showGroupBy,
      showMappingSummary,
      enableBrushSelection,
      brushSelectionModifier,
      useCustomIcons,
      uniqueCategories,
      uniqueCategoryMode,
      categoryAggregation,
      scatterCategoryMode,
      histogramBins,
      boxShowOutliers,
      violinShowMedian,
      normalization,
      samplingMode,
      samplingSize,
      samplingSeed,
      samplingColumnKey,
      missingValueMode,
      timeBucket,
      xAxisScale,
      yAxisScale,
      showAllXTicks,
      showAllYTicks,
      pinXAxis,
      pinYAxis,
      autoFitTicks,
      seriesByMode,
    }),
    [
      autoSortCategories,
      enabled,
      createChartMenuEnabled,
      autoUpdateSelection,
      autoDetectType,
      enableDownload,
      showTypeSelector,
      showSeriesBy,
      showGroupBy,
      showMappingSummary,
      enableBrushSelection,
      brushSelectionModifier,
      useCustomIcons,
      uniqueCategories,
      uniqueCategoryMode,
      categoryAggregation,
      scatterCategoryMode,
      histogramBins,
      boxShowOutliers,
      violinShowMedian,
      normalization,
      samplingMode,
      samplingSize,
      samplingSeed,
      samplingColumnKey,
      missingValueMode,
      timeBucket,
      xAxisScale,
      yAxisScale,
      showAllXTicks,
      showAllYTicks,
      pinXAxis,
      pinYAxis,
      autoFitTicks,
      seriesByMode,
    ],
  );

  const state = useMemo<GridChartStateController>(
    () => ({
      ...value,
      set: (patch) => {
        if (patch.autoSortCategories != null) {
          setAutoSortCategories(patch.autoSortCategories);
        }
        if (patch.enabled != null) setEnabled(patch.enabled);
        if (patch.createChartMenuEnabled != null) {
          setCreateChartMenuEnabled(patch.createChartMenuEnabled);
        }
        if (patch.autoUpdateSelection != null) {
          setAutoUpdateSelection(patch.autoUpdateSelection);
        }
        if (patch.autoDetectType != null) {
          setAutoDetectType(patch.autoDetectType);
        }
        if (patch.enableDownload != null) {
          setEnableDownload(patch.enableDownload);
        }
        if (patch.showTypeSelector != null) {
          setShowTypeSelector(patch.showTypeSelector);
        }
        if (patch.showSeriesBy != null) setShowSeriesBy(patch.showSeriesBy);
        if (patch.showGroupBy != null) setShowGroupBy(patch.showGroupBy);
        if (patch.showMappingSummary != null) {
          setShowMappingSummary(patch.showMappingSummary);
        }
        if (patch.enableBrushSelection != null) {
          setEnableBrushSelection(patch.enableBrushSelection);
        }
        if (patch.brushSelectionModifier != null) {
          setBrushSelectionModifier(patch.brushSelectionModifier);
        }
        if (patch.useCustomIcons != null) {
          setUseCustomIcons(patch.useCustomIcons);
        }
        if (patch.uniqueCategories != null) {
          setUniqueCategories(patch.uniqueCategories);
        }
        if (patch.uniqueCategoryMode != null) {
          setUniqueCategoryMode(patch.uniqueCategoryMode);
        }
        if (patch.categoryAggregation != null) {
          setCategoryAggregation(patch.categoryAggregation);
        }
        if (patch.scatterCategoryMode != null) {
          setScatterCategoryMode(patch.scatterCategoryMode);
        }
        if (patch.histogramBins != null) {
          setHistogramBins(patch.histogramBins);
        }
        if (patch.boxShowOutliers != null) {
          setBoxShowOutliers(patch.boxShowOutliers);
        }
        if (patch.violinShowMedian != null) {
          setViolinShowMedian(patch.violinShowMedian);
        }
        if (patch.normalization != null) {
          setNormalization(patch.normalization);
        }
        if (patch.samplingMode != null) {
          setSamplingMode(patch.samplingMode);
        }
        if (patch.samplingSize != null) {
          setSamplingSize(patch.samplingSize);
        }
        if (patch.samplingSeed != null) {
          setSamplingSeed(patch.samplingSeed);
        }
        if (patch.samplingColumnKey != null) {
          setSamplingColumnKey(patch.samplingColumnKey);
        }
        if (patch.missingValueMode != null) {
          setMissingValueMode(patch.missingValueMode);
        }
        if (patch.timeBucket != null) {
          setTimeBucket(patch.timeBucket);
        }
        if (patch.xAxisScale != null) setXAxisScale(patch.xAxisScale);
        if (patch.yAxisScale != null) setYAxisScale(patch.yAxisScale);
        if (patch.showAllXTicks != null) {
          setShowAllXTicks(patch.showAllXTicks);
        }
        if (patch.showAllYTicks != null) {
          setShowAllYTicks(patch.showAllYTicks);
        }
        if (patch.pinXAxis != null) setPinXAxis(patch.pinXAxis);
        if (patch.pinYAxis != null) setPinYAxis(patch.pinYAxis);
        if (patch.autoFitTicks != null) {
          setAutoFitTicks(patch.autoFitTicks);
        }
        if (patch.seriesByMode != null) {
          setSeriesByMode(patch.seriesByMode);
        }
      },
      setAutoSortCategories,
      setEnabled,
      setCreateChartMenuEnabled,
      setAutoUpdateSelection,
      setAutoDetectType,
      setEnableDownload,
      setShowTypeSelector,
      setShowSeriesBy,
      setShowGroupBy,
      setShowMappingSummary,
      setEnableBrushSelection,
      setBrushSelectionModifier,
      setUseCustomIcons,
      setUniqueCategories,
      setUniqueCategoryMode,
      setCategoryAggregation,
      setScatterCategoryMode,
      setHistogramBins,
      setBoxShowOutliers,
      setViolinShowMedian,
      setNormalization,
      setSamplingMode,
      setSamplingSize,
      setSamplingSeed,
      setSamplingColumnKey,
      setMissingValueMode,
      setTimeBucket,
      setXAxisScale,
      setYAxisScale,
      setShowAllXTicks,
      setShowAllYTicks,
      setPinXAxis,
      setPinYAxis,
      setAutoFitTicks,
      setSeriesByMode,
    }),
    [value],
  );

  return { value, state };
};
