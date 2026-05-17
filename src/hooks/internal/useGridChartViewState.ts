import { useCallback, useMemo } from "react";

import type {
  GridChartCategoryAggregation,
  GridChartBrushActionOptions,
  GridChartModel,
  GridChartOptions,
  GridChartSamplingOptions,
  GridChartSeriesBy,
} from "../../types";

type ChartAxisArgs = {
  xScale: "linear" | "log" | "symlog";
  setXScale: (scale: "linear" | "log" | "symlog") => void;
  yScale: "linear" | "log" | "symlog";
  setYScale: (scale: "linear" | "log" | "symlog") => void;
  showAllXTicks: boolean;
  setShowAllXTicks: (value: boolean) => void;
  showAllYTicks: boolean;
  setShowAllYTicks: (value: boolean) => void;
  pinXAxis: boolean;
  setPinXAxis: (value: boolean) => void;
  pinYAxis: boolean;
  setPinYAxis: (value: boolean) => void;
  autoFitTicks: boolean;
  setAutoFitTicks: (value: boolean) => void;
};

export const useGridChartAxisState = ({
  xScale,
  setXScale,
  yScale,
  setYScale,
  showAllXTicks,
  setShowAllXTicks,
  showAllYTicks,
  setShowAllYTicks,
  pinXAxis,
  setPinXAxis,
  pinYAxis,
  setPinYAxis,
  autoFitTicks,
  setAutoFitTicks,
}: ChartAxisArgs) =>
  useMemo(
    () => ({
      xScale,
      setXScale,
      yScale,
      setYScale,
      showAllXTicks,
      setShowAllXTicks,
      showAllYTicks,
      setShowAllYTicks,
      pinXAxis,
      setPinXAxis,
      pinYAxis,
      setPinYAxis,
      autoFitTicks,
      setAutoFitTicks,
    }),
    [
      xScale,
      setXScale,
      yScale,
      setYScale,
      showAllXTicks,
      setShowAllXTicks,
      showAllYTicks,
      setShowAllYTicks,
      pinXAxis,
      setPinXAxis,
      pinYAxis,
      setPinYAxis,
      autoFitTicks,
      setAutoFitTicks,
    ],
  );

type ChartSamplingArgs = {
  mode: "none" | "top" | "random" | "stratified";
  setMode: (mode: "none" | "top" | "random" | "stratified") => void;
  size: number;
  setSize: (size: number) => void;
  seed: number;
  setSeed: (seed: number) => void;
  columnKey: string;
  setColumnKey: (key: string) => void;
  options: GridChartSamplingOptions | undefined;
  columnOptions: Array<{ value: string; label: string }>;
};

export const useGridChartSamplingState = ({
  mode,
  setMode,
  size,
  setSize,
  seed,
  setSeed,
  columnKey,
  setColumnKey,
  options,
  columnOptions,
}: ChartSamplingArgs) =>
  useMemo(
    () => ({
      mode,
      setMode,
      size,
      setSize,
      seed,
      setSeed,
      columnKey,
      setColumnKey,
      options,
      columnOptions,
    }),
    [
      mode,
      setMode,
      size,
      setSize,
      seed,
      setSeed,
      columnKey,
      setColumnKey,
      options,
      columnOptions,
    ],
  );

type ChartOptionsArgs = {
  showAllXTicks: boolean;
  showAllYTicks: boolean;
  autoFitTicks: boolean;
  pinXAxis: boolean;
  pinYAxis: boolean;
  xAxisScale: "linear" | "log" | "symlog";
  yAxisScale: "linear" | "log" | "symlog";
  histogramBins: number;
  boxShowOutliers: boolean;
  violinShowMedian: boolean;
};

export const useGridChartOptions = ({
  showAllXTicks,
  showAllYTicks,
  autoFitTicks,
  pinXAxis,
  pinYAxis,
  xAxisScale,
  yAxisScale,
  histogramBins,
  boxShowOutliers,
  violinShowMedian,
}: ChartOptionsArgs) =>
  useCallback(
    (model: GridChartModel): GridChartOptions => {
      const isHistogram = model.type === "histogram";
      const isHeatmap = model.type === "heatmap";
      const isBox = model.type === "box";
      const isViolin = model.type === "violin";
      const isWaterfall = model.type === "waterfall";
      const isBullet = model.type === "bullet";
      const isCandlestick = model.type === "candlestick";
      const hasDateCategory = model.categories.some(
        (value) => value instanceof Date,
      );
      const xAxisType: NonNullable<
        NonNullable<GridChartOptions["axis"]>["x"]
      >["type"] =
        isHistogram ||
        isBullet ||
        model.type === "scatter" ||
        model.type === "bubble"
          ? "number"
          : hasDateCategory
            ? "time"
            : "category";
      return {
        legend: { show: true, position: "bottom" },
        tooltip: { enabled: true },
        axis: {
          x: {
            type: xAxisType,
            showAllTicks: showAllXTicks,
            autoFitTicks,
            pin: pinXAxis,
            scale: xAxisScale,
          },
          y: {
            showAllTicks: showAllYTicks,
            autoFitTicks,
            pin: pinYAxis,
            scale: yAxisScale,
          },
        },
        histogram: isHistogram
          ? {
              bins: histogramBins,
            }
          : undefined,
        heatmap: isHeatmap
          ? {
              gap: 3,
              radius: 3,
              minOpacity: 0.18,
              maxOpacity: 0.92,
            }
          : undefined,
        boxPlot: isBox
          ? {
              boxWidth: 0.55,
              fillOpacity: 0.2,
              showOutliers: boxShowOutliers,
            }
          : undefined,
        violin: isViolin
          ? {
              bins: 24,
              maxWidth: 0.8,
              fillOpacity: 0.2,
              showMedian: violinShowMedian,
            }
          : undefined,
        waterfall: isWaterfall
          ? {
              barWidth: 0.6,
            }
          : undefined,
        bullet: isBullet
          ? {
              barHeightRatio: 0.35,
            }
          : undefined,
        candlestick: isCandlestick
          ? {
              bodyWidth: 0.6,
            }
          : undefined,
      };
    },
    [
      showAllXTicks,
      showAllYTicks,
      autoFitTicks,
      pinXAxis,
      pinYAxis,
      xAxisScale,
      yAxisScale,
      histogramBins,
      boxShowOutliers,
      violinShowMedian,
    ],
  );

type ChartStateFacadeArgs = {
  chartsCapabilityEnabled: boolean;
  chartEnabled: boolean;
  setChartEnabled: (value: boolean) => void;
  chartCreateMenuEnabled: boolean;
  setChartCreateMenuEnabled: (value: boolean) => void;
  chartAutoUpdateSelection: boolean;
  setChartAutoUpdateSelection: (value: boolean) => void;
  chartAutoDetectType: boolean;
  setChartAutoDetectType: (value: boolean) => void;
  chartEnableDownload: boolean;
  setChartEnableDownload: (value: boolean) => void;
  chartAutoSortCategories: boolean;
  setChartAutoSortCategories: (value: boolean) => void;
  chartUniqueCategories: boolean;
  setChartUniqueCategories: (value: boolean) => void;
  chartUniqueCategoryMode: "aggregate" | "raw";
  setChartUniqueCategoryMode: (value: "aggregate" | "raw") => void;
  chartCategoryAggregation: GridChartCategoryAggregation;
  setChartCategoryAggregation: (value: GridChartCategoryAggregation) => void;
  chartScatterCategoryMode: "raw" | "aggregate";
  setChartScatterCategoryMode: (value: "raw" | "aggregate") => void;
  chartNormalization: "none" | "minmax" | "zscore" | "percent";
  setChartNormalization: (
    value: "none" | "minmax" | "zscore" | "percent",
  ) => void;
  chartMissingValueMode: "keep" | "zero" | "exclude";
  setChartMissingValueMode: (value: "keep" | "zero" | "exclude") => void;
  chartTimeBucket: "none" | "hour" | "day" | "week" | "month";
  setChartTimeBucket: (
    value: "none" | "hour" | "day" | "week" | "month",
  ) => void;
  chartHistogramBins: number;
  setChartHistogramBins: (value: number) => void;
  chartBoxShowOutliers: boolean;
  setChartBoxShowOutliers: (value: boolean) => void;
  chartViolinShowMedian: boolean;
  setChartViolinShowMedian: (value: boolean) => void;
  chartSeriesByMode: "both" | "columns" | "rows";
  setChartSeriesByMode: (value: "both" | "columns" | "rows") => void;
  chartSeriesByOptions: GridChartSeriesBy[];
  chartShowTypeSelector: boolean;
  setChartShowTypeSelector: (value: boolean) => void;
  chartShowSeriesBy: boolean;
  setChartShowSeriesBy: (value: boolean) => void;
  chartShowGroupBy: boolean;
  setChartShowGroupBy: (value: boolean) => void;
  chartShowMappingSummary: boolean;
  setChartShowMappingSummary: (value: boolean) => void;
  chartEnableBrushSelection: boolean;
  setChartEnableBrushSelection: (value: boolean) => void;
  chartBrushSelectionModifier: "none" | "shift" | "alt" | "meta";
  setChartBrushSelectionModifier: (
    value: "none" | "shift" | "alt" | "meta",
  ) => void;
  chartUseCustomIcons: boolean;
  setChartUseCustomIcons: (value: boolean) => void;
  chartSamplingState: ReturnType<typeof useGridChartSamplingState>;
  chartAxisState: ReturnType<typeof useGridChartAxisState>;
  handleChartSettingsChange: (next: any) => void;
  getChartOptions: (model: GridChartModel) => GridChartOptions;
  setChartStateValue: (patch: {
    enabled?: boolean;
    createChartMenuEnabled?: boolean;
    autoUpdateSelection?: boolean;
    autoDetectType?: boolean;
    enableDownload?: boolean;
    showTypeSelector?: boolean;
    showSeriesBy?: boolean;
    showGroupBy?: boolean;
    showMappingSummary?: boolean;
    enableBrushSelection?: boolean;
    brushSelectionModifier?: "none" | "shift" | "alt" | "meta";
    useCustomIcons?: boolean;
  }) => void;
};

export const useGridChartStateFacade = ({
  chartsCapabilityEnabled,
  chartEnabled,
  setChartEnabled,
  chartCreateMenuEnabled,
  setChartCreateMenuEnabled,
  chartAutoUpdateSelection,
  setChartAutoUpdateSelection,
  chartAutoDetectType,
  setChartAutoDetectType,
  chartEnableDownload,
  setChartEnableDownload,
  chartAutoSortCategories,
  setChartAutoSortCategories,
  chartUniqueCategories,
  setChartUniqueCategories,
  chartUniqueCategoryMode,
  setChartUniqueCategoryMode,
  chartCategoryAggregation,
  setChartCategoryAggregation,
  chartScatterCategoryMode,
  setChartScatterCategoryMode,
  chartNormalization,
  setChartNormalization,
  chartMissingValueMode,
  setChartMissingValueMode,
  chartTimeBucket,
  setChartTimeBucket,
  chartHistogramBins,
  setChartHistogramBins,
  chartBoxShowOutliers,
  setChartBoxShowOutliers,
  chartViolinShowMedian,
  setChartViolinShowMedian,
  chartSeriesByMode,
  setChartSeriesByMode,
  chartSeriesByOptions,
  chartShowTypeSelector,
  setChartShowTypeSelector,
  chartShowSeriesBy,
  setChartShowSeriesBy,
  chartShowGroupBy,
  setChartShowGroupBy,
  chartShowMappingSummary,
  setChartShowMappingSummary,
  chartEnableBrushSelection,
  setChartEnableBrushSelection,
  chartBrushSelectionModifier,
  setChartBrushSelectionModifier,
  chartUseCustomIcons,
  setChartUseCustomIcons,
  chartSamplingState,
  chartAxisState,
  handleChartSettingsChange,
  getChartOptions,
  setChartStateValue,
}: ChartStateFacadeArgs) =>
  useMemo(
    () => ({
      enabled: chartsCapabilityEnabled && chartEnabled,
      setEnabled: (value: boolean) => {
        if (!chartsCapabilityEnabled) return;
        setChartEnabled(value);
      },
      createChartMenuEnabled: chartsCapabilityEnabled && chartCreateMenuEnabled,
      setCreateChartMenuEnabled: (value: boolean) => {
        if (!chartsCapabilityEnabled) return;
        setChartCreateMenuEnabled(value);
      },
      autoUpdateSelection: chartsCapabilityEnabled && chartAutoUpdateSelection,
      setAutoUpdateSelection: (value: boolean) => {
        if (!chartsCapabilityEnabled) return;
        setChartAutoUpdateSelection(value);
      },
      autoDetectChartType: chartsCapabilityEnabled && chartAutoDetectType,
      setAutoDetectChartType: (value: boolean) => {
        if (!chartsCapabilityEnabled) return;
        setChartAutoDetectType(value);
      },
      enableDownload: chartsCapabilityEnabled && chartEnableDownload,
      setEnableDownload: (value: boolean) => {
        if (!chartsCapabilityEnabled) return;
        setChartEnableDownload(value);
      },
      autoSortCategories: chartAutoSortCategories,
      setAutoSortCategories: (value: boolean) => {
        if (!chartsCapabilityEnabled) return;
        setChartAutoSortCategories(value);
      },
      uniqueCategories: chartUniqueCategories,
      setUniqueCategories: (value: boolean) => {
        if (!chartsCapabilityEnabled) return;
        setChartUniqueCategories(value);
      },
      uniqueCategoryMode: chartUniqueCategoryMode,
      setUniqueCategoryMode: (value: "aggregate" | "raw") => {
        if (!chartsCapabilityEnabled) return;
        setChartUniqueCategoryMode(value);
      },
      categoryAggregation: chartCategoryAggregation,
      setCategoryAggregation: (value: GridChartCategoryAggregation) => {
        if (!chartsCapabilityEnabled) return;
        setChartCategoryAggregation(value);
      },
      scatterCategoryMode: chartScatterCategoryMode,
      setScatterCategoryMode: (value: "raw" | "aggregate") => {
        if (!chartsCapabilityEnabled) return;
        setChartScatterCategoryMode(value);
      },
      normalization: chartNormalization,
      setNormalization: (
        value: "none" | "minmax" | "zscore" | "percent",
      ) => {
        if (!chartsCapabilityEnabled) return;
        setChartNormalization(value);
      },
      missingValueMode: chartMissingValueMode,
      setMissingValueMode: (value: "keep" | "zero" | "exclude") => {
        if (!chartsCapabilityEnabled) return;
        setChartMissingValueMode(value);
      },
      timeBucket: chartTimeBucket,
      setTimeBucket: (value: "none" | "hour" | "day" | "week" | "month") => {
        if (!chartsCapabilityEnabled) return;
        setChartTimeBucket(value);
      },
      histogramBins: chartHistogramBins,
      setHistogramBins: (value: number) => {
        if (!chartsCapabilityEnabled) return;
        setChartHistogramBins(value);
      },
      boxShowOutliers: chartBoxShowOutliers,
      setBoxShowOutliers: (value: boolean) => {
        if (!chartsCapabilityEnabled) return;
        setChartBoxShowOutliers(value);
      },
      violinShowMedian: chartViolinShowMedian,
      setViolinShowMedian: (value: boolean) => {
        if (!chartsCapabilityEnabled) return;
        setChartViolinShowMedian(value);
      },
      seriesByMode: chartSeriesByMode,
      setSeriesByMode: (value: "both" | "columns" | "rows") => {
        if (!chartsCapabilityEnabled) return;
        setChartSeriesByMode(value);
      },
      seriesByOptions: chartSeriesByOptions,
      controls: {
        showTypeSelector: chartShowTypeSelector,
        setShowTypeSelector: (value: boolean) => {
          if (!chartsCapabilityEnabled) return;
          setChartShowTypeSelector(value);
        },
        showSeriesBy: chartShowSeriesBy,
        setShowSeriesBy: (value: boolean) => {
          if (!chartsCapabilityEnabled) return;
          setChartShowSeriesBy(value);
        },
        showGroupBy: chartShowGroupBy,
        setShowGroupBy: (value: boolean) => {
          if (!chartsCapabilityEnabled) return;
          setChartShowGroupBy(value);
        },
        showMappingSummary: chartShowMappingSummary,
        setShowMappingSummary: (value: boolean) => {
          if (!chartsCapabilityEnabled) return;
          setChartShowMappingSummary(value);
        },
        enableBrushSelection:
          chartsCapabilityEnabled && chartEnableBrushSelection,
        setEnableBrushSelection: (value: boolean) => {
          if (!chartsCapabilityEnabled) return;
          setChartEnableBrushSelection(value);
        },
        brushSelectionModifier: chartBrushSelectionModifier,
        setBrushSelectionModifier: (
          value: "none" | "shift" | "alt" | "meta",
        ) => {
          if (!chartsCapabilityEnabled) return;
          setChartBrushSelectionModifier(value);
        },
        useCustomIcons: chartUseCustomIcons,
        setUseCustomIcons: (value: boolean) => {
          if (!chartsCapabilityEnabled) return;
          setChartUseCustomIcons(value);
        },
      },
      sampling: chartSamplingState,
      axis: chartAxisState,
      handleSettingsChange: handleChartSettingsChange,
      getOptions: getChartOptions,
      set: (patch: {
        enabled?: boolean;
        createChartMenuEnabled?: boolean;
        autoUpdateSelection?: boolean;
        autoDetectChartType?: boolean;
        enableDownload?: boolean;
        showTypeSelector?: boolean;
        showSeriesBy?: boolean;
        showGroupBy?: boolean;
        showMappingSummary?: boolean;
        enableBrushSelection?: boolean;
        brushSelectionModifier?: "none" | "shift" | "alt" | "meta";
        useCustomIcons?: boolean;
      }) => {
        if (!chartsCapabilityEnabled) return;
        setChartStateValue({
          enabled: patch.enabled,
          createChartMenuEnabled: patch.createChartMenuEnabled,
          autoUpdateSelection: patch.autoUpdateSelection,
          autoDetectType: patch.autoDetectChartType,
          enableDownload: patch.enableDownload,
          showTypeSelector: patch.showTypeSelector,
          showSeriesBy: patch.showSeriesBy,
          showGroupBy: patch.showGroupBy,
          showMappingSummary: patch.showMappingSummary,
          enableBrushSelection: patch.enableBrushSelection,
          brushSelectionModifier: patch.brushSelectionModifier,
          useCustomIcons: patch.useCustomIcons,
        });
      },
    }),
    [
      chartsCapabilityEnabled,
      chartEnabled,
      setChartEnabled,
      chartCreateMenuEnabled,
      setChartCreateMenuEnabled,
      chartAutoUpdateSelection,
      setChartAutoUpdateSelection,
      chartAutoDetectType,
      setChartAutoDetectType,
      chartEnableDownload,
      setChartEnableDownload,
      chartAutoSortCategories,
      setChartAutoSortCategories,
      chartUniqueCategories,
      setChartUniqueCategories,
      chartUniqueCategoryMode,
      setChartUniqueCategoryMode,
      chartCategoryAggregation,
      setChartCategoryAggregation,
      chartScatterCategoryMode,
      setChartScatterCategoryMode,
      chartNormalization,
      setChartNormalization,
      chartMissingValueMode,
      setChartMissingValueMode,
      chartTimeBucket,
      setChartTimeBucket,
      chartHistogramBins,
      setChartHistogramBins,
      chartBoxShowOutliers,
      setChartBoxShowOutliers,
      chartViolinShowMedian,
      setChartViolinShowMedian,
      chartSeriesByMode,
      setChartSeriesByMode,
      chartSeriesByOptions,
      chartShowTypeSelector,
      setChartShowTypeSelector,
      chartShowSeriesBy,
      setChartShowSeriesBy,
      chartShowGroupBy,
      setChartShowGroupBy,
      chartShowMappingSummary,
      setChartShowMappingSummary,
      chartEnableBrushSelection,
      setChartEnableBrushSelection,
      chartBrushSelectionModifier,
      setChartBrushSelectionModifier,
      chartUseCustomIcons,
      setChartUseCustomIcons,
      chartSamplingState,
      chartAxisState,
      handleChartSettingsChange,
      getChartOptions,
      setChartStateValue,
    ],
  );

type ChartBrushArgs = {
  lastRowIds: (string | number)[];
  setLastRowIds: (ids: (string | number)[]) => void;
  rowIdFilterIds: string[];
  rowIdFilterActive: boolean;
  onBrushSelection: (rowIds: (string | number)[]) => void;
  getBrushActions: (enabled?: boolean) => GridChartBrushActionOptions[];
};

export const useGridChartBrushState = ({
  lastRowIds,
  setLastRowIds,
  rowIdFilterIds,
  rowIdFilterActive,
  onBrushSelection,
  getBrushActions,
}: ChartBrushArgs) =>
  useMemo(
    () => ({
      lastRowIds,
      setLastRowIds,
      rowIdFilterIds,
      rowIdFilterActive,
      onBrushSelection,
      getBrushActions,
    }),
    [
      lastRowIds,
      setLastRowIds,
      rowIdFilterIds,
      rowIdFilterActive,
      onBrushSelection,
      getBrushActions,
    ],
  );
