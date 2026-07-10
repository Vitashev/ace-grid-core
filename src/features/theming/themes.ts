import { GridTheme } from "./types";

const classicLightTokens = {
  fontFamily:
    "'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
  fontSize: 14,
  borderRadius: "8px",
  borderRadiusSmall: "4px",
  surfaceBase: "#f7f9fc",
  surfaceSubtle: "#f1f3f8",
  surfaceRaised: "#ffffff",
  surfaceSunken: "#e8ecf5",
  borderColor: "#d8dee9",
  borderColorStrong: "#b8c2d6",
  headerBorderColor: "#c7d0e4",
  cellBorderColor: "#dfe4ee",
  cellBorderColorAlt: "#ccd4e6",
  gridBorder: "1px solid #ccd4e6",
  gridShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
  gridBackdropFilter: "blur(4px)",
  textPrimary: "#1f2937",
  textSecondary: "#334155",
  textMuted: "#64748b",
  textOnAccent: "#ffffff",
  headerBackground: "#f3f6fb",
  headerBackgroundPinned: "#e8edf6",
  headerBackgroundDragging: "#dae4f9",
  headerBackgroundSelected: "#dbe8ff",
  headerBackgroundHover: "rgba(59, 130, 246, 0.12)",
  headerTextColor: "#1f2937",
  headerShadow: "0 6px 18px rgba(15, 23, 42, 0.05)",
  headerBackdropFilter: "blur(4px)",
  pinnedLeftBackground: "#eef2fb",
  pinnedRightBackground: "#f8f1e6",
  pinnedShadowLeft: "inset -1px 0 0 rgba(148, 163, 184, 0.35)",
  pinnedShadowRight: "inset 1px 0 0 rgba(202, 138, 4, 0.28)",
  pinnedEdgeShadowLeft: "6px 0 12px rgba(59, 130, 246, 0.08)",
  pinnedEdgeShadowRight: "-6px 0 12px rgba(234, 179, 8, 0.15)",
  cellBackground: "#ffffff",
  cellBackgroundHover: "#f5f7fb",
  cellBackgroundSelected: "#e5edff",
  cellBackgroundPinned: "#f6f8ff",
  cellTextColor: "#1f2937",
  cellPaddingVertical: 7,
  cellPaddingHorizontal: 12,
  cellBorderRadius: "0px",
  cellShadow: "none",
  cellHoverShadow: "none",
  cellSelectedShadow: "inset 0 0 0 1px rgba(37, 99, 235, 0.25)",
  rowHoverBackground: "rgba(148, 163, 184, 0.15)",
  rowActiveBackground: "rgba(59, 130, 246, 0.12)",
  rowBorderColor: "rgba(209, 213, 219, 0.8)",
  rowShadow: "none",
  spanCellBackground: "#ffffff",
  spanCellSelectedBackground: "#e5edff",
  spanCellBorder: "#dfe4ee",
  spanCellShadow: "none",
  sparklineLineColor: "#2563eb",
  sparklineAreaFill: "rgba(37, 99, 235, 0.28)",
  sparklineAxisColor: "rgba(148, 163, 184, 0.6)",
  sparklineMarkerFill: "#ffffff",
  sparklineMarkerStroke: "#2563eb",
  sparklinePositiveColor: "#22c55e",
  sparklineNegativeColor: "#ef4444",
  sparklineZeroColor: "#94a3b8",
  sparklineHighlightMin: "#f97316",
  sparklineHighlightMax: "#16a34a",
  selectionBorder: "#2563eb",
  selectionFill: "rgba(37, 99, 235, 0.1)",
  fillHandleBackground: "#2563eb",
  fillHandleBorder: "transparent",
  fillHandleShadow: "none",
  dropIndicator: "#2563eb",
  dropIndicatorPin: "#f59e0b",
  dropIndicatorUnpin: "#059669",
  dropIndicatorCrossPin: "#dc2626",
  scrollbarTrack: "rgba(148, 163, 184, 0.2)",
  scrollbarThumb: "rgba(100, 116, 139, 0.38)",
  scrollbarThumbHover: "rgba(100, 116, 139, 0.55)",
  filterIconDefault: "#64748b",
  filterIconActive: "#1d4ed8",
  filterIndicatorColor: "#2563eb",
  filterIndicatorBorderColor: "#f8fafc",
  filterIndicatorSize: 6,
  sortIconDefault: "#64748b",
  sortIconActive: "#1d4ed8",
  pinIconDefault: "#64748b",
  pinIconActive: "#1d4ed8",
  pinIconDisabled: "rgba(100, 116, 139, 0.35)",
  focusOutline: "#2563eb",
  focusOutlineWidth: "2px",
  resizeHandleColor: "rgba(148, 163, 184, 0.45)",
  resizeHandleActiveColor: "rgba(37, 99, 235, 0.9)",
  resizeHandleShadow: "none",
  dragGhostBackground: "rgba(247, 249, 252, 0.95)",
  dragGhostBorder: "1px solid rgba(148, 163, 184, 0.45)",
  dragGhostShadow: "0 14px 32px rgba(148, 163, 184, 0.25)",
  successBackground: "rgba(34, 197, 94, 0.12)",
  successBorder: "rgba(22, 163, 74, 0.25)",
  successShadow: "none",
  dangerBackground: "rgba(239, 68, 68, 0.12)",
  dangerBorder: "rgba(220, 38, 38, 0.25)",
  dangerShadow: "none",
  warningBackground: "rgba(245, 158, 11, 0.12)",
  warningBorder: "rgba(217, 119, 6, 0.25)",
  warningShadow: "none",
  infoBackground: "rgba(59, 130, 246, 0.12)",
  infoBorder: "rgba(37, 99, 235, 0.25)",
  infoShadow: "none",
  formulaBarBackground: "#f3f6fb",
  formulaBarBorder: "#dce3f2",
  formulaBarInputBorder: "#bfc9dd",
  formulaBarSelectionBadgeBackground: "#ffffff",
  formulaBarSelectionBadgeText: "#1f2937",
  formulaBarShadow: "none",
  popupBackground: "#ffffff",
  popupBorder: "#d9e1f1",
  popupShadow: "0 18px 36px rgba(15, 23, 42, 0.12)",
  checkboxAccent: "#2563eb",
  editorBackground: "#ffffff",
  editorBorder: "1px solid rgba(37, 99, 235, 0.35)",
  editorShadow: "0 18px 40px rgba(15, 23, 42, 0.15)",
  editorBackdropFilter: "blur(8px)",
  contextMenuBackground: "#ffffff",
  contextMenuBorder: "1px solid rgba(148, 163, 184, 0.28)",
  contextMenuShadow: "0 16px 32px rgba(15, 23, 42, 0.12)",
  contextMenuDivider: "rgba(148, 163, 184, 0.28)",
  contextMenuText: "#1f2937",
  contextMenuTextMuted: "#475569",
  contextMenuTextDisabled: "rgba(100, 116, 139, 0.5)",
  contextMenuShortcut: "#64748b",
  contextMenuItemHoverBackground: "rgba(37, 99, 235, 0.12)",
  contextMenuItemActiveBackground: "rgba(37, 99, 235, 0.18)",
  chartBackground: "#ffffff",
  chartPlotBackground: "#f8fafc",
  chartAxisColor: "rgba(148, 163, 184, 0.8)",
  chartGridColor: "rgba(226, 232, 240, 0.9)",
  chartLabelColor: "#334155",
  chartLegendText: "#1f2937",
  chartLegendMuted: "#64748b",
  chartTooltipBackground: "#ffffff",
  chartTooltipBorder: "1px solid rgba(148, 163, 184, 0.35)",
  chartTooltipShadow: "0 10px 24px rgba(15, 23, 42, 0.12)",
  chartHeatmapColor: "#2563eb",
  chartHeatmapMissing: "rgba(148, 163, 184, 0.22)",
  chartPalette: [
    "#2563eb",
    "#f97316",
    "#10b981",
    "#ef4444",
    "#8b5cf6",
    "#0ea5e9",
    "#f59e0b",
    "#22c55e",
  ],
} as const;

const classicDarkTokens = {
  ...classicLightTokens,
  surfaceBase: "#12161f",
  surfaceSubtle: "#161c27",
  surfaceRaised: "#1b2331",
  surfaceSunken: "#101521",
  borderColor: "#222b3a",
  borderColorStrong: "#2f3a4e",
  headerBorderColor: "#293245",
  cellBorderColor: "#262f41",
  cellBorderColorAlt: "#2f3a4e",
  gridBorder: "1px solid #293245",
  gridShadow: "0 14px 40px rgba(2, 6, 16, 0.55)",
  gridBackdropFilter: "blur(8px)",
  textPrimary: "#e2e8f0",
  textSecondary: "#cbd5f5",
  textMuted: "#94a3b8",
  textOnAccent: "#0f172a",
  headerBackground: "#1b2331",
  headerBackgroundPinned: "#1f2a3c",
  headerBackgroundDragging: "#24324a",
  headerBackgroundSelected: "#1f3a5c",
  headerBackgroundHover: "rgba(148, 163, 184, 0.16)",
  headerTextColor: "#e2e8f0",
  headerShadow: "0 10px 28px rgba(2, 6, 16, 0.6)",
  headerBackdropFilter: "blur(8px)",
  pinnedLeftBackground: "#1a2739",
  pinnedRightBackground: "#2c1f2f",
  pinnedShadowLeft: "inset -1px 0 0 rgba(59, 130, 246, 0.35)",
  pinnedShadowRight: "inset 1px 0 0 rgba(214, 158, 46, 0.32)",
  pinnedEdgeShadowLeft: "6px 0 16px rgba(59, 130, 246, 0.25)",
  pinnedEdgeShadowRight: "-6px 0 16px rgba(244, 114, 182, 0.22)",
  cellBackground: "#161d2a",
  cellBackgroundHover: "#1d2636",
  cellBackgroundSelected: "#253655",
  cellBackgroundPinned: "#192333",
  cellTextColor: "#e2e8f0",
  cellSelectedShadow: "inset 0 0 0 1px rgba(96, 165, 250, 0.35)",
  rowHoverBackground: "rgba(148, 163, 184, 0.18)",
  rowActiveBackground: "rgba(96, 165, 250, 0.28)",
  rowBorderColor: "rgba(30, 41, 59, 0.85)",
  rowShadow: "none",
  spanCellBackground: "#161d2a",
  spanCellSelectedBackground: "#253655",
  spanCellBorder: "#2f3a4e",
  spanCellShadow: "none",
  sparklineLineColor: "#60a5fa",
  sparklineAreaFill: "rgba(96, 165, 250, 0.28)",
  sparklineAxisColor: "rgba(148, 163, 184, 0.55)",
  sparklineMarkerFill: "#0f172a",
  sparklineMarkerStroke: "#60a5fa",
  sparklinePositiveColor: "#34d399",
  sparklineNegativeColor: "#f87171",
  sparklineZeroColor: "#64748b",
  sparklineHighlightMin: "#fb923c",
  sparklineHighlightMax: "#4ade80",
  selectionBorder: "#60a5fa",
  selectionFill: "rgba(96, 165, 250, 0.22)",
  fillHandleBackground: "#60a5fa",
  fillHandleBorder: "transparent",
  fillHandleShadow: "none",
  dropIndicator: "#60a5fa",
  dropIndicatorPin: "#f59e0b",
  dropIndicatorUnpin: "#34d399",
  dropIndicatorCrossPin: "#f87171",
  scrollbarTrack: "#111827",
  scrollbarThumb: "rgba(100, 116, 139, 0.4)",
  scrollbarThumbHover: "rgba(148, 163, 184, 0.55)",
  filterIconDefault: "#94a3b8",
  filterIconActive: "#60a5fa",
  filterIndicatorColor: "#60a5fa",
  filterIndicatorBorderColor: "#0f172a",
  filterIndicatorSize: 6,
  sortIconDefault: "#94a3b8",
  sortIconActive: "#60a5fa",
  pinIconDefault: "#94a3b8",
  pinIconActive: "#60a5fa",
  pinIconDisabled: "rgba(71, 85, 105, 0.5)",
  focusOutline: "#60a5fa",
  resizeHandleColor: "rgba(96, 165, 250, 0.35)",
  resizeHandleActiveColor: "rgba(96, 165, 250, 0.85)",
  resizeHandleShadow: "none",
  dragGhostBackground: "rgba(13, 17, 23, 0.95)",
  dragGhostBorder: "1px solid rgba(96, 165, 250, 0.45)",
  dragGhostShadow: "0 24px 48px rgba(2, 6, 16, 0.75)",
  successBackground: "rgba(34, 197, 94, 0.2)",
  successBorder: "rgba(22, 163, 74, 0.35)",
  successShadow: "none",
  dangerBackground: "rgba(248, 113, 113, 0.2)",
  dangerBorder: "rgba(239, 68, 68, 0.35)",
  dangerShadow: "none",
  warningBackground: "rgba(251, 191, 36, 0.2)",
  warningBorder: "rgba(217, 119, 6, 0.35)",
  warningShadow: "none",
  infoBackground: "rgba(96, 165, 250, 0.2)",
  infoBorder: "rgba(59, 130, 246, 0.35)",
  infoShadow: "none",
  formulaBarBackground: "#1b2331",
  formulaBarBorder: "#253141",
  formulaBarInputBorder: "#32435a",
  formulaBarSelectionBadgeBackground: "#0f172a",
  formulaBarSelectionBadgeText: "#e2e8f0",
  formulaBarShadow: "none",
  popupBackground: "#1a2332",
  popupBorder: "#2b3649",
  popupShadow: "0 20px 40px rgba(2, 6, 16, 0.6)",
  checkboxAccent: "#60a5fa",
  editorBackground: "#1c2434",
  editorBorder: "1px solid rgba(96, 165, 250, 0.45)",
  editorShadow: "0 24px 50px rgba(2, 6, 16, 0.7)",
  editorBackdropFilter: "blur(12px)",
  contextMenuBackground: "#111827",
  contextMenuBorder: "1px solid rgba(30, 41, 59, 0.9)",
  contextMenuShadow: "0 20px 48px rgba(2, 6, 24, 0.75)",
  contextMenuDivider: "rgba(51, 65, 85, 0.65)",
  contextMenuText: "#e2e8f0",
  contextMenuTextMuted: "#94a3b8",
  contextMenuTextDisabled: "rgba(148, 163, 184, 0.45)",
  contextMenuShortcut: "#cbd5f5",
  contextMenuItemHoverBackground: "rgba(96, 165, 250, 0.2)",
  contextMenuItemActiveBackground: "rgba(96, 165, 250, 0.28)",
  chartBackground: "#1b2331",
  chartPlotBackground: "rgba(15, 23, 42, 0.4)",
  chartAxisColor: "rgba(148, 163, 184, 0.7)",
  chartGridColor: "rgba(51, 65, 85, 0.7)",
  chartLabelColor: "#cbd5f5",
  chartLegendText: "#e2e8f0",
  chartLegendMuted: "#94a3b8",
  chartTooltipBackground: "#111827",
  chartTooltipBorder: "1px solid rgba(71, 85, 105, 0.6)",
  chartTooltipShadow: "0 16px 32px rgba(2, 6, 24, 0.55)",
  chartHeatmapColor: "#60a5fa",
  chartHeatmapMissing: "rgba(148, 163, 184, 0.3)",
  chartPalette: [
    "#60a5fa",
    "#fb923c",
    "#34d399",
    "#f87171",
    "#a78bfa",
    "#38bdf8",
    "#fbbf24",
    "#4ade80",
  ],
} as const;

const materialTokens = {
  ...classicLightTokens,
  surfaceBase: "#fafbff",
  surfaceSubtle: "#f2f4ff",
  surfaceRaised: "#ffffff",
  surfaceSunken: "#eaebf5",
  borderColor: "#d5d9eb",
  borderColorStrong: "#c4cae6",
  headerBorderColor: "#d0d5ed",
  cellBorderColor: "#e2e5f4",
  cellBorderColorAlt: "#cfd4f0",
  gridBorder: "1px solid #d0d5ed",
  gridShadow: "0 12px 34px rgba(88, 80, 236, 0.12)",
  gridBackdropFilter: "blur(6px)",
  textPrimary: "#2c2a5f",
  textSecondary: "#3f3a89",
  textMuted: "#6b6abc",
  headerBackground: "#eff1ff",
  headerBackgroundPinned: "#e4e7fb",
  headerBackgroundDragging: "#dcdffd",
  headerBackgroundSelected: "#ded6ff",
  headerBackgroundHover: "rgba(88, 80, 236, 0.14)",
  headerTextColor: "#2f2a76",
  headerShadow: "0 8px 24px rgba(88, 80, 236, 0.16)",
  pinnedLeftBackground: "#e6e9fb",
  pinnedRightBackground: "#fbeadd",
  pinnedShadowLeft: "inset -1px 0 0 rgba(88, 80, 236, 0.3)",
  pinnedShadowRight: "inset 1px 0 0 rgba(249, 115, 22, 0.25)",
  pinnedEdgeShadowLeft: "6px 0 16px rgba(88, 80, 236, 0.18)",
  pinnedEdgeShadowRight: "-6px 0 16px rgba(249, 115, 22, 0.18)",
  cellBackground: "#ffffff",
  cellBackgroundHover: "#f5f5ff",
  cellBackgroundSelected: "#ece6ff",
  cellBackgroundPinned: "#f4f2ff",
  cellTextColor: "#2f2a76",
  cellSelectedShadow: "inset 0 0 0 1px rgba(88, 80, 236, 0.3)",
  rowHoverBackground: "rgba(88, 80, 236, 0.14)",
  rowActiveBackground: "rgba(88, 80, 236, 0.18)",
  rowBorderColor: "rgba(88, 80, 236, 0.22)",
  spanCellBackground: "#ffffff",
  spanCellSelectedBackground: "#ece6ff",
  spanCellBorder: "#d6d1fb",
  spanCellShadow: "none",
  selectionBorder: "#5b21b6",
  selectionFill: "rgba(91, 33, 182, 0.12)",
  fillHandleBackground: "#5b21b6",
  fillHandleBorder: "transparent",
  fillHandleShadow: "none",
  dropIndicator: "#5b21b6",
  dropIndicatorPin: "#f97316",
  dropIndicatorUnpin: "#10b981",
  dropIndicatorCrossPin: "#ef4444",
  scrollbarTrack: "rgba(88, 80, 236, 0.12)",
  scrollbarThumb: "rgba(88, 80, 236, 0.35)",
  scrollbarThumbHover: "rgba(88, 80, 236, 0.5)",
  filterIconDefault: "#6b6abc",
  filterIconActive: "#5b21b6",
  filterIndicatorColor: "#7c3aed",
  filterIndicatorBorderColor: "#f8fafc",
  filterIndicatorSize: 6,
  sortIconDefault: "#6b6abc",
  sortIconActive: "#5b21b6",
  pinIconDefault: "#6b6abc",
  pinIconActive: "#5b21b6",
  pinIconDisabled: "rgba(107, 106, 188, 0.35)",
  focusOutline: "#5b21b6",
  resizeHandleColor: "rgba(107, 106, 188, 0.4)",
  resizeHandleActiveColor: "rgba(88, 80, 236, 0.85)",
  resizeHandleShadow: "none",
  dragGhostBackground: "rgba(251, 250, 255, 0.96)",
  dragGhostBorder: "1px solid rgba(107, 106, 188, 0.35)",
  dragGhostShadow: "0 14px 36px rgba(88, 80, 236, 0.18)",
  successBackground: "rgba(16, 185, 129, 0.18)",
  successBorder: "rgba(16, 185, 129, 0.32)",
  successShadow: "none",
  dangerBackground: "rgba(239, 68, 68, 0.18)",
  dangerBorder: "rgba(239, 68, 68, 0.32)",
  dangerShadow: "none",
  warningBackground: "rgba(245, 158, 11, 0.18)",
  warningBorder: "rgba(245, 158, 11, 0.3)",
  warningShadow: "none",
  infoBackground: "rgba(88, 80, 236, 0.18)",
  infoBorder: "rgba(88, 80, 236, 0.3)",
  infoShadow: "none",
  formulaBarBackground: "#eff1ff",
  formulaBarBorder: "#d7daf5",
  formulaBarInputBorder: "#c7cbf1",
  formulaBarSelectionBadgeBackground: "#ffffff",
  formulaBarSelectionBadgeText: "#2f2a76",
  formulaBarShadow: "none",
  popupBackground: "#ffffff",
  popupBorder: "#d7daf5",
  popupShadow: "0 18px 36px rgba(88, 80, 236, 0.18)",
  checkboxAccent: "#5b21b6",
  editorBackground: "#ffffff",
  editorBorder: "1px solid rgba(88, 80, 236, 0.35)",
  editorShadow: "0 20px 44px rgba(88, 80, 236, 0.2)",
  editorBackdropFilter: "blur(10px)",
  chartBackground: "#ffffff",
  chartPlotBackground: "#f2f4ff",
  chartAxisColor: "rgba(107, 106, 188, 0.65)",
  chartGridColor: "rgba(204, 210, 236, 0.7)",
  chartLabelColor: "#3f3a89",
  chartLegendText: "#2c2a5f",
  chartLegendMuted: "#6b6abc",
  chartTooltipBackground: "#ffffff",
  chartTooltipBorder: "1px solid rgba(107, 106, 188, 0.35)",
  chartTooltipShadow: "0 14px 28px rgba(88, 80, 236, 0.18)",
  chartHeatmapColor: "#4f46e5",
  chartHeatmapMissing: "rgba(148, 163, 184, 0.22)",
  chartPalette: [
    "#5b21b6",
    "#2563eb",
    "#f97316",
    "#10b981",
    "#ef4444",
    "#7c3aed",
    "#06b6d4",
    "#f59e0b",
  ],
} as const;

const dataTokens = {
  ...classicLightTokens,
  fontFamily: "'Arial', 'Roboto', 'Helvetica Neue', sans-serif",
  fontSize: 13,
  borderRadius: "0px",
  borderRadiusSmall: "2px",
  surfaceBase: "#ffffff",
  surfaceSubtle: "#f8f9fa",
  surfaceRaised: "#ffffff",
  surfaceSunken: "#f1f3f4",
  borderColor: "#dadce0",
  borderColorStrong: "#c2c5ca",
  headerBorderColor: "#dadce0",
  cellBorderColor: "#e6e8eb",
  cellBorderColorAlt: "#dadce0",
  gridBorder: "1px solid #dadce0",
  gridShadow: "none",
  gridBackdropFilter: "none",
  textPrimary: "#202124",
  textSecondary: "#3c4043",
  textMuted: "#5f6368",
  headerBackground: "#f8f9fa",
  headerBackgroundPinned: "#f1f3f4",
  headerBackgroundDragging: "#eef3fd",
  headerBackgroundSelected: "#e8f0fe",
  headerBackgroundHover: "rgba(60, 64, 67, 0.08)",
  headerTextColor: "#202124",
  headerShadow: "none",
  headerBackdropFilter: "none",
  pinnedLeftBackground: "#f8f9fa",
  pinnedRightBackground: "#f8f9fa",
  pinnedShadowLeft: "inset -1px 0 0 #dadce0",
  pinnedShadowRight: "inset 1px 0 0 #dadce0",
  pinnedEdgeShadowLeft: "none",
  pinnedEdgeShadowRight: "none",
  cellBackground: "#ffffff",
  cellBackgroundHover: "#f8fbff",
  cellBackgroundSelected: "#e8f0fe",
  cellBackgroundPinned: "#ffffff",
  cellTextColor: "#202124",
  cellPaddingVertical: 6,
  cellPaddingHorizontal: 10,
  cellBorderRadius: "0px",
  cellShadow: "none",
  cellHoverShadow: "none",
  cellSelectedShadow: "inset 0 0 0 1px #1a73e8",
  rowHoverBackground: "rgba(26, 115, 232, 0.05)",
  rowActiveBackground: "rgba(26, 115, 232, 0.09)",
  rowBorderColor: "#e6e8eb",
  rowShadow: "none",
  spanCellBackground: "#ffffff",
  spanCellSelectedBackground: "#e8f0fe",
  spanCellBorder: "#d6e2fb",
  spanCellShadow: "none",
  sparklineLineColor: "#1a73e8",
  sparklineAreaFill: "rgba(26, 115, 232, 0.16)",
  sparklineAxisColor: "rgba(95, 99, 104, 0.52)",
  sparklineMarkerFill: "#ffffff",
  sparklineMarkerStroke: "#1a73e8",
  sparklinePositiveColor: "#188038",
  sparklineNegativeColor: "#d93025",
  sparklineZeroColor: "#5f6368",
  sparklineHighlightMin: "#d93025",
  sparklineHighlightMax: "#188038",
  selectionBorder: "#1a73e8",
  selectionFill: "rgba(26, 115, 232, 0.14)",
  fillHandleBackground: "#1a73e8",
  fillHandleBorder: "1px solid #ffffff",
  fillHandleShadow: "none",
  dropIndicator: "#1a73e8",
  dropIndicatorPin: "#f9ab00",
  dropIndicatorUnpin: "#188038",
  dropIndicatorCrossPin: "#d93025",
  scrollbarTrack: "#f1f3f4",
  scrollbarThumb: "rgba(95, 99, 104, 0.36)",
  scrollbarThumbHover: "rgba(95, 99, 104, 0.52)",
  filterIconDefault: "#5f6368",
  filterIconActive: "#1a73e8",
  filterIndicatorColor: "#1a73e8",
  filterIndicatorBorderColor: "#ffffff",
  filterIndicatorSize: 6,
  sortIconDefault: "#5f6368",
  sortIconActive: "#1a73e8",
  pinIconDefault: "#5f6368",
  pinIconActive: "#1a73e8",
  pinIconDisabled: "rgba(95, 99, 104, 0.35)",
  focusOutline: "#1a73e8",
  focusOutlineWidth: "2px",
  resizeHandleColor: "rgba(95, 99, 104, 0.4)",
  resizeHandleActiveColor: "#1a73e8",
  resizeHandleShadow: "none",
  dragGhostBackground: "#ffffff",
  dragGhostBorder: "1px solid #c2c5ca",
  dragGhostShadow: "0 6px 16px rgba(60, 64, 67, 0.2)",
  successBackground: "rgba(24, 128, 56, 0.12)",
  successBorder: "rgba(24, 128, 56, 0.28)",
  successShadow: "none",
  dangerBackground: "rgba(217, 48, 37, 0.12)",
  dangerBorder: "rgba(217, 48, 37, 0.28)",
  dangerShadow: "none",
  warningBackground: "rgba(249, 171, 0, 0.14)",
  warningBorder: "rgba(249, 171, 0, 0.3)",
  warningShadow: "none",
  infoBackground: "rgba(26, 115, 232, 0.12)",
  infoBorder: "rgba(26, 115, 232, 0.28)",
  infoShadow: "none",
  formulaBarBackground: "#f8f9fa",
  formulaBarBorder: "#dadce0",
  formulaBarInputBorder: "#dadce0",
  formulaBarSelectionBadgeBackground: "#ffffff",
  formulaBarSelectionBadgeText: "#202124",
  formulaBarShadow: "none",
  popupBackground: "#ffffff",
  popupBorder: "#dadce0",
  popupShadow: "0 8px 24px rgba(60, 64, 67, 0.2)",
  checkboxAccent: "#1a73e8",
  editorBackground: "#ffffff",
  editorBorder: "1px solid #1a73e8",
  editorShadow: "0 2px 8px rgba(26, 115, 232, 0.2)",
  editorBackdropFilter: "none",
  contextMenuBackground: "#ffffff",
  contextMenuBorder: "1px solid #dadce0",
  contextMenuShadow: "0 10px 24px rgba(60, 64, 67, 0.2)",
  contextMenuDivider: "rgba(95, 99, 104, 0.24)",
  contextMenuText: "#202124",
  contextMenuTextMuted: "#5f6368",
  contextMenuTextDisabled: "rgba(95, 99, 104, 0.48)",
  contextMenuShortcut: "#5f6368",
  contextMenuItemHoverBackground: "rgba(26, 115, 232, 0.1)",
  contextMenuItemActiveBackground: "rgba(26, 115, 232, 0.16)",
  chartBackground: "#ffffff",
  chartPlotBackground: "#f8f9fa",
  chartAxisColor: "rgba(95, 99, 104, 0.7)",
  chartGridColor: "rgba(218, 220, 224, 0.9)",
  chartLabelColor: "#3c4043",
  chartLegendText: "#202124",
  chartLegendMuted: "#5f6368",
  chartTooltipBackground: "#ffffff",
  chartTooltipBorder: "1px solid #dadce0",
  chartTooltipShadow: "0 8px 24px rgba(60, 64, 67, 0.2)",
  chartHeatmapColor: "#1a73e8",
  chartHeatmapMissing: "rgba(95, 99, 104, 0.2)",
  chartPalette: [
    "#1a73e8",
    "#34a853",
    "#fbbc04",
    "#ea4335",
    "#4285f4",
    "#188038",
    "#f9ab00",
    "#d93025",
  ],
} as const;

const dataDarkTokens: GridTheme["tokens"] = {
  ...dataTokens,
  surfaceBase: "#202124",
  surfaceSubtle: "#1f2124",
  surfaceRaised: "#202124",
  surfaceSunken: "#17181a",
  borderColor: "#3c4043",
  borderColorStrong: "#5f6368",
  headerBorderColor: "#3c4043",
  cellBorderColor: "#303134",
  cellBorderColorAlt: "#3c4043",
  gridBorder: "1px solid #3c4043",
  gridShadow: "none",
  gridBackdropFilter: "none",
  textPrimary: "#e8eaed",
  textSecondary: "#bdc1c6",
  textMuted: "#9aa0a6",
  textOnAccent: "#ffffff",
  headerBackground: "#2d2f31",
  headerBackgroundPinned: "#303134",
  headerBackgroundDragging: "#35373a",
  headerBackgroundSelected: "#263445",
  headerBackgroundHover: "rgba(232, 234, 237, 0.08)",
  headerTextColor: "#e8eaed",
  headerShadow: "none",
  headerBackdropFilter: "none",
  pinnedLeftBackground: "#2b2c2f",
  pinnedRightBackground: "#2b2c2f",
  pinnedShadowLeft: "inset -1px 0 0 #3c4043",
  pinnedShadowRight: "inset 1px 0 0 #3c4043",
  pinnedEdgeShadowLeft: "none",
  pinnedEdgeShadowRight: "none",
  cellBackground: "#202124",
  cellBackgroundHover: "#2a2b2f",
  cellBackgroundSelected: "#1f3a56",
  cellBackgroundPinned: "#242529",
  cellTextColor: "#e8eaed",
  cellSelectedShadow: "inset 0 0 0 1px #8ab4f8",
  rowHoverBackground: "rgba(138, 180, 248, 0.08)",
  rowActiveBackground: "rgba(138, 180, 248, 0.14)",
  rowBorderColor: "#303134",
  rowShadow: "none",
  spanCellBackground: "#202124",
  spanCellSelectedBackground: "#1f3a56",
  spanCellBorder: "#3c4043",
  spanCellShadow: "none",
  sparklineLineColor: "#8ab4f8",
  sparklineAreaFill: "rgba(138, 180, 248, 0.24)",
  sparklineAxisColor: "rgba(154, 160, 166, 0.62)",
  sparklineMarkerFill: "#202124",
  sparklineMarkerStroke: "#8ab4f8",
  sparklinePositiveColor: "#81c995",
  sparklineNegativeColor: "#f28b82",
  sparklineZeroColor: "#9aa0a6",
  sparklineHighlightMin: "#f28b82",
  sparklineHighlightMax: "#81c995",
  selectionBorder: "#8ab4f8",
  selectionFill: "rgba(138, 180, 248, 0.2)",
  fillHandleBackground: "#8ab4f8",
  fillHandleBorder: "1px solid #202124",
  fillHandleShadow: "none",
  dropIndicator: "#8ab4f8",
  dropIndicatorPin: "#fdd663",
  dropIndicatorUnpin: "#81c995",
  dropIndicatorCrossPin: "#f28b82",
  scrollbarTrack: "#17181a",
  scrollbarThumb: "rgba(154, 160, 166, 0.45)",
  scrollbarThumbHover: "rgba(154, 160, 166, 0.62)",
  filterIconDefault: "#9aa0a6",
  filterIconActive: "#8ab4f8",
  filterIndicatorColor: "#8ab4f8",
  filterIndicatorBorderColor: "#202124",
  sortIconDefault: "#9aa0a6",
  sortIconActive: "#8ab4f8",
  pinIconDefault: "#9aa0a6",
  pinIconActive: "#8ab4f8",
  pinIconDisabled: "rgba(154, 160, 166, 0.35)",
  focusOutline: "#8ab4f8",
  resizeHandleColor: "rgba(154, 160, 166, 0.48)",
  resizeHandleActiveColor: "#8ab4f8",
  resizeHandleShadow: "none",
  dragGhostBackground: "#26282c",
  dragGhostBorder: "1px solid #5f6368",
  dragGhostShadow: "0 8px 18px rgba(0, 0, 0, 0.45)",
  successBackground: "rgba(129, 201, 149, 0.2)",
  successBorder: "rgba(129, 201, 149, 0.38)",
  successShadow: "none",
  dangerBackground: "rgba(242, 139, 130, 0.2)",
  dangerBorder: "rgba(242, 139, 130, 0.4)",
  dangerShadow: "none",
  warningBackground: "rgba(252, 201, 52, 0.2)",
  warningBorder: "rgba(252, 201, 52, 0.4)",
  warningShadow: "none",
  infoBackground: "rgba(138, 180, 248, 0.22)",
  infoBorder: "rgba(138, 180, 248, 0.42)",
  infoShadow: "none",
  formulaBarBackground: "#2d2f31",
  formulaBarBorder: "#3c4043",
  formulaBarInputBorder: "#5f6368",
  formulaBarSelectionBadgeBackground: "#202124",
  formulaBarSelectionBadgeText: "#e8eaed",
  formulaBarShadow: "none",
  popupBackground: "#2b2c2f",
  popupBorder: "#5f6368",
  popupShadow: "0 10px 24px rgba(0, 0, 0, 0.45)",
  checkboxAccent: "#8ab4f8",
  editorBackground: "#202124",
  editorBorder: "1px solid #8ab4f8",
  editorShadow: "0 4px 14px rgba(138, 180, 248, 0.25)",
  editorBackdropFilter: "none",
  contextMenuBackground: "#2b2c2f",
  contextMenuBorder: "1px solid #5f6368",
  contextMenuShadow: "0 12px 28px rgba(0, 0, 0, 0.5)",
  contextMenuDivider: "rgba(154, 160, 166, 0.25)",
  contextMenuText: "#e8eaed",
  contextMenuTextMuted: "#9aa0a6",
  contextMenuTextDisabled: "rgba(154, 160, 166, 0.5)",
  contextMenuShortcut: "#9aa0a6",
  contextMenuItemHoverBackground: "rgba(138, 180, 248, 0.14)",
  contextMenuItemActiveBackground: "rgba(138, 180, 248, 0.22)",
  chartBackground: "#202124",
  chartPlotBackground: "#26282c",
  chartAxisColor: "rgba(154, 160, 166, 0.75)",
  chartGridColor: "rgba(95, 99, 104, 0.72)",
  chartLabelColor: "#bdc1c6",
  chartLegendText: "#e8eaed",
  chartLegendMuted: "#9aa0a6",
  chartTooltipBackground: "#2b2c2f",
  chartTooltipBorder: "1px solid #5f6368",
  chartTooltipShadow: "0 8px 22px rgba(0, 0, 0, 0.45)",
  chartHeatmapColor: "#8ab4f8",
  chartHeatmapMissing: "rgba(154, 160, 166, 0.28)",
  chartPalette: [
    "#8ab4f8",
    "#81c995",
    "#fdd663",
    "#f28b82",
    "#c58af9",
    "#78d9ec",
    "#f6aea9",
    "#a8c7fa",
  ],
};

const getMaterial3Tokens = (() => {
  let cached: GridTheme["tokens"] | null = null;
  return (): GridTheme["tokens"] => {
    if (cached) return cached;
    cached = {
  ...materialTokens,
  fontFamily: "'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
  fontSize: 15,
  borderRadius: "16px",
  borderRadiusSmall: "10px",
  surfaceBase: "#e8ecf2",
  surfaceSubtle: "#eceff5",
  surfaceRaised: "#f1f4f8",
  surfaceSunken: "#dfe4ec",
  borderColor: "#b6bdc9",
  borderColorStrong: "#7d8593",
  headerBorderColor: "#b4bbc8",
  cellBorderColor: "#b8bfcb",
  cellBorderColorAlt: "#aeb6c3",
  gridBorder: "1px solid #b6bdc9",
  gridShadow: "none",
  gridBackdropFilter: "none",
  textPrimary: "#1d242d",
  textSecondary: "#2c3440",
  textMuted: "#6a7381",
  textOnAccent: "#f6f8fb",
  headerBackground: "#eaedf3",
  headerBackgroundPinned: "#e7ebf2",
  headerBackgroundDragging: "#e2e7ef",
  headerBackgroundSelected: "#dbe3ef",
  headerBackgroundHover: "rgba(104, 115, 133, 0.1)",
  headerTextColor: "#1d242d",
  headerShadow: "none",
  headerBackdropFilter: "none",
  pinnedLeftBackground: "#e9edf3",
  pinnedRightBackground: "#e9edf3",
  pinnedShadowLeft: "inset -1px 0 0 #b4bbc8",
  pinnedShadowRight: "inset 1px 0 0 #b4bbc8",
  pinnedEdgeShadowLeft: "none",
  pinnedEdgeShadowRight: "none",
  cellBackground: "#f1f4f8",
  cellBackgroundHover: "#f5f7fb",
  cellBackgroundSelected: "#dde6f2",
  cellBackgroundPinned: "#edf1f6",
  cellTextColor: "#1d242d",
  cellPaddingVertical: 8,
  cellPaddingHorizontal: 14,
  cellBorderRadius: "0px",
  cellShadow: "none",
  cellHoverShadow: "none",
  cellSelectedShadow: "inset 0 0 0 1px rgba(111, 133, 168, 0.82)",
  rowHoverBackground: "rgba(104, 115, 133, 0.08)",
  rowActiveBackground: "rgba(111, 133, 168, 0.13)",
  rowBorderColor: "rgba(132, 141, 155, 0.62)",
  rowShadow: "none",
  spanCellBackground: "#eef1f5",
  spanCellSelectedBackground: "#dce4f1",
  spanCellBorder: "#b3bac7",
  spanCellShadow: "none",
  sparklineLineColor: "#6f85a8",
  sparklineAreaFill: "rgba(111, 133, 168, 0.2)",
  sparklineAxisColor: "rgba(105, 113, 128, 0.72)",
  sparklineMarkerFill: "#ffffff",
  sparklineMarkerStroke: "#6f85a8",
  sparklinePositiveColor: "#386a20",
  sparklineNegativeColor: "#ba1a1a",
  sparklineZeroColor: "#6d7380",
  sparklineHighlightMin: "#8f4c38",
  sparklineHighlightMax: "#386a20",
  selectionBorder: "#6f85a8",
  selectionFill: "rgba(111, 133, 168, 0.16)",
  fillHandleBackground: "#6f85a8",
  fillHandleBorder: "1px solid #ffffff",
  fillHandleShadow: "none",
  dropIndicator: "#6f85a8",
  dropIndicatorPin: "#5f6d82",
  dropIndicatorUnpin: "#386a20",
  dropIndicatorCrossPin: "#b3261e",
  scrollbarTrack: "#d7dce4",
  scrollbarThumb: "rgba(99, 109, 124, 0.5)",
  scrollbarThumbHover: "rgba(99, 109, 124, 0.64)",
  filterIconDefault: "#697180",
  filterIconActive: "#6f85a8",
  filterIndicatorColor: "#6f85a8",
  filterIndicatorBorderColor: "#eef1f5",
  filterIndicatorSize: 6,
  sortIconDefault: "#697180",
  sortIconActive: "#6f85a8",
  pinIconDefault: "#697180",
  pinIconActive: "#6f85a8",
  pinIconDisabled: "rgba(105, 113, 128, 0.44)",
  focusOutline: "#6f85a8",
  focusOutlineWidth: "2px",
  resizeHandleColor: "rgba(105, 113, 128, 0.5)",
  resizeHandleActiveColor: "#6f85a8",
  resizeHandleShadow: "none",
  dragGhostBackground: "#edf1f6",
  dragGhostBorder: "1px solid #b3bac7",
  dragGhostShadow: "0 8px 18px rgba(31, 36, 43, 0.14)",
  successBackground: "rgba(56, 106, 32, 0.16)",
  successBorder: "rgba(56, 106, 32, 0.38)",
  successShadow: "none",
  dangerBackground: "rgba(179, 38, 30, 0.14)",
  dangerBorder: "rgba(179, 38, 30, 0.36)",
  dangerShadow: "none",
  warningBackground: "rgba(122, 94, 32, 0.16)",
  warningBorder: "rgba(122, 94, 32, 0.36)",
  warningShadow: "none",
  infoBackground: "rgba(111, 133, 168, 0.15)",
  infoBorder: "rgba(111, 133, 168, 0.36)",
  infoShadow: "none",
  formulaBarBackground: "#e8ebf1",
  formulaBarBorder: "#b3bac7",
  formulaBarInputBorder: "#7a8290",
  formulaBarSelectionBadgeBackground: "#e8ebf1",
  formulaBarSelectionBadgeText: "#1e242d",
  formulaBarShadow: "none",
  popupBackground: "#eef1f5",
  popupBorder: "#b3bac7",
  popupShadow: "0 10px 20px rgba(31, 36, 43, 0.14)",
  checkboxAccent: "#6f85a8",
  editorBackground: "#eef1f5",
  editorBorder: "1px solid #7a8290",
  editorShadow: "0 8px 18px rgba(31, 36, 43, 0.14)",
  editorBackdropFilter: "none",
  contextMenuBackground: "#eef1f5",
  contextMenuBorder: "1px solid #b3bac7",
  contextMenuShadow: "0 10px 20px rgba(31, 36, 43, 0.14)",
  contextMenuDivider: "rgba(105, 113, 128, 0.28)",
  contextMenuText: "#1e242d",
  contextMenuTextMuted: "#4a5461",
  contextMenuTextDisabled: "rgba(105, 113, 128, 0.52)",
  contextMenuShortcut: "#5a6371",
  contextMenuItemHoverBackground: "rgba(111, 133, 168, 0.11)",
  contextMenuItemActiveBackground: "rgba(111, 133, 168, 0.17)",
  chartBackground: "#eef1f5",
  chartPlotBackground: "#e5e9f0",
  chartAxisColor: "rgba(105, 113, 128, 0.74)",
  chartGridColor: "rgba(169, 176, 188, 0.74)",
  chartLabelColor: "#4a5461",
  chartLegendText: "#1e242d",
  chartLegendMuted: "#697180",
  chartTooltipBackground: "#f0f2f6",
  chartTooltipBorder: "1px solid #b3bac7",
  chartTooltipShadow: "0 8px 16px rgba(31, 36, 43, 0.12)",
  chartHeatmapColor: "#6f85a8",
  chartHeatmapMissing: "rgba(105, 113, 128, 0.22)",
  chartPalette: [
    "#6f85a8",
    "#64748b",
    "#16a34a",
    "#b45309",
    "#be185d",
    "#0f766e",
    "#7c3aed",
    "#475569",
  ],
    } as const;
    return cached;
  };
})();

const getMaterial3DarkTokens = (() => {
  let cached: GridTheme["tokens"] | null = null;
  return (): GridTheme["tokens"] => {
    if (cached) return cached;
    cached = {
  ...classicDarkTokens,
  fontFamily: "'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
  fontSize: 15,
  borderRadius: "14px",
  borderRadiusSmall: "10px",
  surfaceBase: "#101722",
  surfaceSubtle: "#182231",
  surfaceRaised: "#1d2a3b",
  surfaceSunken: "#0d141f",
  borderColor: "#324256",
  borderColorStrong: "#4b5f79",
  headerBorderColor: "#475b75",
  cellBorderColor: "#2b394d",
  cellBorderColorAlt: "#3b4a61",
  gridBorder: "1px solid #435674",
  gridShadow: "none",
  gridBackdropFilter: "none",
  textPrimary: "#e8f0ff",
  textSecondary: "#c6d4ea",
  textMuted: "#8ea3c1",
  textOnAccent: "#081628",
  headerBackground: "#26364c",
  headerBackgroundPinned: "#223146",
  headerBackgroundDragging: "#2d3f59",
  headerBackgroundSelected: "#344d6e",
  headerBackgroundHover: "rgba(142, 186, 255, 0.16)",
  headerTextColor: "#e8f0ff",
  headerShadow: "none",
  headerBackdropFilter: "none",
  pinnedLeftBackground: "#223146",
  pinnedRightBackground: "#223146",
  pinnedShadowLeft: "inset -1px 0 0 #4f6481",
  pinnedShadowRight: "inset 1px 0 0 #4f6481",
  pinnedEdgeShadowLeft: "none",
  pinnedEdgeShadowRight: "none",
  cellBackground: "#182333",
  cellBackgroundHover: "#1e2b3f",
  cellBackgroundSelected: "#2e4461",
  cellBackgroundPinned: "#223146",
  cellTextColor: "#e8f0ff",
  cellPaddingVertical: 8,
  cellPaddingHorizontal: 13,
  cellBorderRadius: "0px",
  cellShadow: "none",
  cellHoverShadow: "none",
  cellSelectedShadow: "inset 0 0 0 1px #9ec5ff",
  rowHoverBackground: "rgba(147, 186, 245, 0.14)",
  rowActiveBackground: "rgba(147, 186, 245, 0.24)",
  rowBorderColor: "#2d3e54",
  rowShadow: "none",
  spanCellBackground: "#182333",
  spanCellSelectedBackground: "#2e4461",
  spanCellBorder: "#3b4a61",
  spanCellShadow: "none",
  sparklineLineColor: "#93c5fd",
  sparklineAreaFill: "rgba(147, 197, 253, 0.24)",
  sparklineAxisColor: "rgba(141, 165, 196, 0.72)",
  sparklineMarkerFill: "#101722",
  sparklineMarkerStroke: "#93c5fd",
  sparklinePositiveColor: "#7ad9b0",
  sparklineNegativeColor: "#f7a9a3",
  sparklineZeroColor: "#9ab0cb",
  sparklineHighlightMin: "#ffbe9a",
  sparklineHighlightMax: "#8adfb8",
  selectionBorder: "#93c5fd",
  selectionFill: "rgba(147, 197, 253, 0.2)",
  fillHandleBackground: "#93c5fd",
  fillHandleBorder: "1px solid #102238",
  fillHandleShadow: "none",
  dropIndicator: "#93c5fd",
  dropIndicatorPin: "#d1beff",
  dropIndicatorUnpin: "#8adfb8",
  dropIndicatorCrossPin: "#f7a9a3",
  scrollbarTrack: "#0f1725",
  scrollbarThumb: "rgba(143, 166, 197, 0.42)",
  scrollbarThumbHover: "rgba(196, 214, 237, 0.62)",
  filterIconDefault: "#b4c6df",
  filterIconActive: "#93c5fd",
  filterIndicatorColor: "#93c5fd",
  filterIndicatorBorderColor: "#101722",
  filterIndicatorSize: 6,
  sortIconDefault: "#b4c6df",
  sortIconActive: "#93c5fd",
  pinIconDefault: "#b4c6df",
  pinIconActive: "#93c5fd",
  pinIconDisabled: "rgba(142, 163, 192, 0.46)",
  focusOutline: "#93c5fd",
  focusOutlineWidth: "2px",
  resizeHandleColor: "rgba(143, 166, 197, 0.56)",
  resizeHandleActiveColor: "#93c5fd",
  resizeHandleShadow: "none",
  dragGhostBackground: "#1c2a3b",
  dragGhostBorder: "1px solid #51647f",
  dragGhostShadow: "0 8px 18px rgba(4, 9, 17, 0.44)",
  successBackground: "rgba(74, 204, 145, 0.2)",
  successBorder: "rgba(122, 222, 177, 0.38)",
  successShadow: "none",
  dangerBackground: "rgba(255, 146, 139, 0.2)",
  dangerBorder: "rgba(255, 170, 163, 0.42)",
  dangerShadow: "none",
  warningBackground: "rgba(255, 206, 122, 0.2)",
  warningBorder: "rgba(255, 217, 150, 0.42)",
  warningShadow: "none",
  infoBackground: "rgba(147, 197, 253, 0.2)",
  infoBorder: "rgba(173, 214, 255, 0.42)",
  infoShadow: "none",
  formulaBarBackground: "#25354a",
  formulaBarBorder: "#4f6380",
  formulaBarInputBorder: "#9bb4d6",
  formulaBarSelectionBadgeBackground: "#2c3f58",
  formulaBarSelectionBadgeText: "#e8f0ff",
  formulaBarShadow: "none",
  popupBackground: "#223247",
  popupBorder: "#4f6380",
  popupShadow: "0 14px 30px rgba(4, 9, 17, 0.48)",
  checkboxAccent: "#93c5fd",
  editorBackground: "#223247",
  editorBorder: "1px solid #7f99bc",
  editorShadow: "0 16px 34px rgba(4, 9, 17, 0.52)",
  editorBackdropFilter: "none",
  contextMenuBackground: "#223247",
  contextMenuBorder: "1px solid #4f6380",
  contextMenuShadow: "0 14px 32px rgba(4, 9, 17, 0.52)",
  contextMenuDivider: "rgba(143, 166, 197, 0.28)",
  contextMenuText: "#e8f0ff",
  contextMenuTextMuted: "#c6d4ea",
  contextMenuTextDisabled: "rgba(142, 163, 192, 0.52)",
  contextMenuShortcut: "#b8cbed",
  contextMenuItemHoverBackground: "rgba(147, 197, 253, 0.16)",
  contextMenuItemActiveBackground: "rgba(147, 197, 253, 0.24)",
  chartBackground: "#1d2a3b",
  chartPlotBackground: "#1b2738",
  chartAxisColor: "rgba(147, 170, 201, 0.78)",
  chartGridColor: "rgba(67, 86, 116, 0.76)",
  chartLabelColor: "#bfd0e8",
  chartLegendText: "#e8f0ff",
  chartLegendMuted: "#8ea3c1",
  chartTooltipBackground: "#213248",
  chartTooltipBorder: "1px solid #567095",
  chartTooltipShadow: "0 12px 28px rgba(4, 9, 17, 0.48)",
  chartHeatmapColor: "#93c5fd",
  chartHeatmapMissing: "rgba(143, 166, 197, 0.26)",
  chartPalette: [
    "#93c5fd",
    "#7dd3fc",
    "#7ad9b0",
    "#ffbe9a",
    "#e9b8ff",
    "#ffd37f",
    "#b2ccff",
    "#f9a8d4",
  ],
    } as const;
    return cached;
  };
})();

const material3Css = `
  [data-ace-grid-theme="material-3"] {
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
    --ace-grid-md3-state-hover: rgba(92, 102, 118, 0.09);
    --ace-grid-md3-state-active: rgba(92, 102, 118, 0.14);
    --ace-grid-md3-control-height: 32px;
    --ace-grid-md3-control-radius: 11px;
    --ace-grid-md3-control-padding-x: 13px;
    --ace-grid-md3-shell-border: #b2bac7;
    --ace-grid-md3-header-divider: color-mix(
      in srgb,
      var(--ace-grid-md3-shell-border) 56%,
      #ffffff 44%
    );
    --ace-grid-md3-row-divider: color-mix(
      in srgb,
      var(--ace-grid-md3-shell-border) 36%,
      transparent
    );
    --ace-grid-md3-system-divider: color-mix(
      in srgb,
      var(--ace-grid-md3-shell-border) 54%,
      transparent
    );
    --ace-grid-md3-shell-bg: #e7ebf2;
    --ace-grid-md3-header-band-bg: #ebeff5;
    --ace-grid-md3-formula-shell: var(--ace-grid-md3-header-band-bg);
    --ace-grid-md3-formula-height: 44px;
    --ace-grid-md3-formula-control-height: 32px;
    --ace-grid-md3-formula-radius: 10px;
    --ace-grid-md3-emphasis: #747d89;
    --ace-grid-md3-icon-muted: #6d7684;
    --ace-grid-md3-checkbox-size: 18px;
    --ace-grid-md3-checkbox-radius: 4px;
    --ace-grid-md3-checkbox-border: #8b94a2;
    --ace-grid-md3-checkbox-border-hover: #707a89;
    --ace-grid-md3-checkbox-bg: #f3f6fa;
    --ace-grid-md3-checkbox-active: #6f85a8;
    --ace-grid-md3-checkbox-mark: #f7f9fd;
    --ace-grid-md3-filter-radius: 20px;
    --ace-grid-md3-filter-control-height: 44px;
    --ace-grid-md3-filter-control-radius: 16px;
    --ace-grid-md3-filter-segment-height: 40px;
    --ace-grid-md3-filter-button-height: 40px;
    --ace-grid-md3-system-pin-gap: 4px;
    --ace-grid-md3-system-pin-pad-inline-start: 4px;
    --ace-grid-md3-system-pin-pad-inline-end: 4px;
    --ace-grid-md3-system-pin-boundary-pad-inline-start: 0px;
    --ace-grid-md3-system-pin-boundary-pad-inline-end: 0px;
    --ace-grid-md3-system-pin-button-size: 20px;
    --ace-grid-system-col-width-row-pinning: 72px;
    --ace-grid-md3-pinned-edge-border: rgba(108, 118, 134, 0.68);
    --ace-grid-header-border-color: var(--ace-grid-md3-header-divider);
    --ace-grid-cell-border-color: var(--ace-grid-md3-row-divider);
    --ace-grid-cell-border-color-alt: var(--ace-grid-md3-system-divider);
    --ace-grid-cell-border-top-color: transparent;
    --ace-grid-cell-border-right-color: transparent;
    --ace-grid-cell-border-bottom-color: var(--ace-grid-md3-row-divider);
    --ace-grid-cell-border-left-color: transparent;
    --ace-grid-row-border: 1px solid var(--ace-grid-md3-row-divider);
    --ace-grid-liquid-header-band-bg: var(--ace-grid-md3-header-band-bg);
    --ace-grid-liquid-picker-icon-color: rgba(79, 95, 119, 0.94);
    --ace-grid-liquid-picker-icon-color-hover: #6f85a8;
    --ace-grid-md3-validation-tooltip-bg: #f9dedc;
    --ace-grid-md3-validation-tooltip-border: #e9b4af;
    --ace-grid-md3-validation-tooltip-text: #3b1211;
    --ace-grid-md3-validation-tooltip-shadow:
      0 2px 8px rgba(39, 44, 53, 0.18),
      0 1px 2px rgba(39, 44, 53, 0.1);
    --ace-grid-md3-validation-tooltip-error-bg: #fdf0ef;
    --ace-grid-md3-validation-tooltip-error-border: #d06a64;
    --ace-grid-md3-validation-tooltip-error-text: #4b1713;
    --ace-grid-md3-validation-tooltip-warning-bg: #fff7e8;
    --ace-grid-md3-validation-tooltip-warning-border: #c68e35;
    --ace-grid-md3-validation-tooltip-warning-text: #4a390f;
    --ace-grid-md3-validation-tooltip-info-bg: #edf4ff;
    --ace-grid-md3-validation-tooltip-info-border: #6f95c7;
    --ace-grid-md3-validation-tooltip-info-text: #163961;
    --ace-grid-row-detail-bg: #dde5ef;
    --ace-grid-row-detail-border-top: #9faab9;
    --ace-grid-row-detail-gutter: 8px 10px 10px;
    --ace-grid-row-detail-padding: 14px 16px;
    --ace-grid-row-detail-inner-bg: #eaf0f6;
    --ace-grid-row-detail-inner-border: 1px solid #c1cad8;
    --ace-grid-row-detail-inner-radius: 12px;
    --ace-grid-row-detail-inner-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.56);
    --ace-grid-row-detail-shadow: none;
    --ace-grid-row-detail-backdrop: none;
    --ace-grid-md3-loader-track: rgba(131, 141, 157, 0.16);
    --ace-grid-md3-loader-border: rgba(124, 133, 148, 0.22);
    --ace-grid-md3-loader-sheen-soft: rgba(131, 141, 157, 0.32);
    --ace-grid-md3-loader-sheen-strong: rgba(245, 248, 252, 0.9);
    --ace-grid-fill-handle-size: 10px;
    --ace-grid-fill-handle-radius: 999px;
    --ace-grid-fill-handle-offset: -5px;
    --ace-grid-fill-handle-border-width: 0;
    --ace-grid-fill-handle-border: transparent;
    --ace-grid-fill-handle-bg: var(--ace-grid-selection-border);
    --ace-grid-fill-handle-bg-hover: color-mix(
      in srgb,
      var(--ace-grid-selection-border) 90%,
      #ffffff 10%
    );
    --ace-grid-fill-handle-inner: 0;
    --ace-grid-fill-handle-inner-border: none;
    --ace-grid-fill-handle-shadow: 0 1px 2px rgba(31, 36, 45, 0.2);
  }
  [data-ace-grid-theme="material-3"] .ace-grid.ace-grid--m3-roomy-system {
    --ace-grid-md3-system-pin-gap: 6px;
    --ace-grid-md3-system-pin-pad-inline-start: 6px;
    --ace-grid-md3-system-pin-pad-inline-end: 6px;
    --ace-grid-md3-system-pin-boundary-pad-inline-start: 0px;
    --ace-grid-md3-system-pin-boundary-pad-inline-end: 0px;
    --ace-grid-system-col-width-row-pinning: 80px;
  }

  [data-ace-grid-theme="material-3"] .ace-grid,
  [data-ace-grid-theme="material-3"].ace-grid {
    box-shadow: none !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }
  [data-ace-grid-theme="material-3"].ace-grid__wrapper {
    border-radius: 24px;
    border: 1px solid var(--ace-grid-md3-shell-border) !important;
    background: var(--ace-grid-md3-shell-bg) !important;
    box-shadow: 0 10px 24px rgba(31, 36, 45, 0.08) !important;
    overflow: hidden;
  }
  [data-ace-grid-theme="material-3"].ace-grid__wrapper::before,
  [data-ace-grid-theme="material-3"].ace-grid__wrapper::after {
    content: none !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__header,
  [data-ace-grid-theme="material-3"] .ace-grid__header-row,
  [data-ace-grid-theme="material-3"] .ace-grid__floating-filter-row {
    background: var(--ace-grid-md3-header-band-bg) !important;
    box-shadow: none !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__header-cell,
  [data-ace-grid-theme="material-3"] .ace-grid__header-group-cell,
  [data-ace-grid-theme="material-3"] .ace-grid__floating-filter-cell,
  [data-ace-grid-theme="material-3"] .ace-grid__header-cell--system,
  [data-ace-grid-theme="material-3"] .ace-grid__floating-filter-cell--system,
  [data-ace-grid-theme="material-3"] .ace-grid__header-segment--left,
  [data-ace-grid-theme="material-3"] .ace-grid__header-segment--right,
  [data-ace-grid-theme="material-3"] .ace-grid__floating-filter-segment--left,
  [data-ace-grid-theme="material-3"] .ace-grid__floating-filter-segment--right {
    background: var(--ace-grid-md3-header-band-bg) !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__header-segment--left,
  [data-ace-grid-theme="material-3"] .ace-grid__floating-filter-segment--left {
    box-shadow: none !important;
    border-right: 1px solid var(--ace-grid-md3-pinned-edge-border) !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__header-segment--right,
  [data-ace-grid-theme="material-3"] .ace-grid__floating-filter-segment--right {
    box-shadow: none !important;
    border-left: 1px solid var(--ace-grid-md3-pinned-edge-border) !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__row-group-pinned--left {
    box-shadow: none !important;
    border-right: 1px solid var(--ace-grid-md3-pinned-edge-border) !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__row-group-pinned--right {
    box-shadow: none !important;
    border-left: 1px solid var(--ace-grid-md3-pinned-edge-border) !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__header-row {
    border-bottom: 1px solid var(--ace-grid-md3-header-divider) !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__header-cell,
  [data-ace-grid-theme="material-3"] .ace-grid__header-group-cell,
  [data-ace-grid-theme="material-3"] .ace-grid__floating-filter-cell,
  [data-ace-grid-theme="material-3"] .ace-grid__header-row > [aria-hidden="true"] {
    border-right-color: var(--ace-grid-md3-header-divider) !important;
    border-bottom-color: var(--ace-grid-md3-header-divider) !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__header-cell--system,
  [data-ace-grid-theme="material-3"] .ace-grid__floating-filter-cell--system,
  [data-ace-grid-theme="material-3"] .ace-grid__header-placeholder-cell--system {
    border-right-color: transparent !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__header-cell,
  [data-ace-grid-theme="material-3"] .ace-grid__header-group-cell,
  [data-ace-grid-theme="material-3"] .ace-grid__floating-filter-cell,
  [data-ace-grid-theme="material-3"] .ace-grid__cell {
    border-radius: 0 !important;
    box-shadow: none !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__row-group {
    border-bottom: 0 !important;
  }
  @keyframes ace-grid-md3-cell-loading-slide {
    0% {
      transform: translateX(-140%);
    }
    100% {
      transform: translateX(250%);
    }
  }
  [data-ace-grid-theme="material-3"] .ace-grid__cell-loading-bar {
    position: relative;
    overflow: hidden;
    height: 10px;
    border-radius: 999px;
    background: var(--ace-grid-md3-loader-track);
    box-shadow: inset 0 0 0 1px var(--ace-grid-md3-loader-border);
    opacity: 0.98;
    animation: none;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__cell-loading-bar::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 42%;
    min-width: 24px;
    border-radius: inherit;
    background: linear-gradient(
      90deg,
      transparent 0%,
      var(--ace-grid-md3-loader-sheen-soft) 28%,
      var(--ace-grid-md3-loader-sheen-strong) 50%,
      var(--ace-grid-md3-loader-sheen-soft) 72%,
      transparent 100%
    );
    transform: translateX(-140%);
    animation: ace-grid-md3-cell-loading-slide 1.08s
      cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__fill-handle {
    transition: background-color 0.14s ease, box-shadow 0.14s ease;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__fill-handle::after {
    content: none;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__header-cell-title,
  [data-ace-grid-theme="material-3"] .ace-grid__header-group-label-text {
    font-weight: 640;
    letter-spacing: 0.003em;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__header-cell-content {
    gap: 7px;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__header-cell-content--system {
    padding-inline: 3px;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__header-cell-actions {
    gap: 6px;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__drag-handle {
    margin-right: 8px;
    opacity: 0.86;
    color: var(--ace-grid-md3-icon-muted);
  }
  [data-ace-grid-theme="material-3"] .ace-grid__sort-button,
  [data-ace-grid-theme="material-3"] .ace-grid__filter-trigger,
  [data-ace-grid-theme="material-3"] .ace-grid__header-group-toggle,
  [data-ace-grid-theme="material-3"] .ace-grid__pin-button,
  [data-ace-grid-theme="material-3"] .ace-grid__row-pin-button,
  [data-ace-grid-theme="material-3"] .ace-grid__row-detail-toggle-button,
  [data-ace-grid-theme="material-3"] .ace-grid__pagination-button,
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-button,
  [data-ace-grid-theme="material-3"] .ace-grid__json-editor-button,
  [data-ace-grid-theme="material-3"] .ace-grid__json-editor-close,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-action,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-toggle-button,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-type-button,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-close,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-settings-close,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-settings-reset,
  [data-ace-grid-theme="material-3"] .ace-grid__context-menu-color-apply {
    min-width: 30px;
    min-height: 30px;
    font-size: 13px !important;
    line-height: 1 !important;
    border: 0 !important;
    border-radius: 999px !important;
    background: transparent !important;
    box-shadow: none !important;
    color: var(--ace-grid-md3-icon-muted) !important;
    transition: background-color 0.16s ease, color 0.16s ease;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__sort-button:hover,
  [data-ace-grid-theme="material-3"] .ace-grid__filter-trigger:hover,
  [data-ace-grid-theme="material-3"] .ace-grid__header-group-toggle:hover,
  [data-ace-grid-theme="material-3"] .ace-grid__pin-button:hover,
  [data-ace-grid-theme="material-3"] .ace-grid__row-pin-button:not(:disabled):hover,
  [data-ace-grid-theme="material-3"] .ace-grid__row-detail-toggle-button:hover,
  [data-ace-grid-theme="material-3"] .ace-grid__pagination-button:hover,
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-button:hover,
  [data-ace-grid-theme="material-3"] .ace-grid__json-editor-button:hover,
  [data-ace-grid-theme="material-3"] .ace-grid__json-editor-close:hover,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-action:hover,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-toggle-button:hover,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-type-button:hover,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-close:hover,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-settings-close:hover,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-settings-reset:hover,
  [data-ace-grid-theme="material-3"] .ace-grid__context-menu-color-apply:hover {
    background: var(--ace-grid-md3-state-hover) !important;
    color: var(--ace-grid-text-primary) !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__sort-button:active,
  [data-ace-grid-theme="material-3"] .ace-grid__filter-trigger:active,
  [data-ace-grid-theme="material-3"] .ace-grid__header-group-toggle:active,
  [data-ace-grid-theme="material-3"] .ace-grid__pin-button:active,
  [data-ace-grid-theme="material-3"] .ace-grid__row-pin-button:not(:disabled):active,
  [data-ace-grid-theme="material-3"] .ace-grid__row-detail-toggle-button:active,
  [data-ace-grid-theme="material-3"] .ace-grid__pagination-button:active,
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-button:active,
  [data-ace-grid-theme="material-3"] .ace-grid__json-editor-button:active,
  [data-ace-grid-theme="material-3"] .ace-grid__json-editor-close:active,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-action:active,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-toggle-button:active,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-type-button:active,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-close:active,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-settings-close:active,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-settings-reset:active,
  [data-ace-grid-theme="material-3"] .ace-grid__context-menu-color-apply:active {
    background: var(--ace-grid-md3-state-active) !important;
    color: var(--ace-grid-text-primary) !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__sort-button:focus-visible,
  [data-ace-grid-theme="material-3"] .ace-grid__filter-trigger:focus-visible,
  [data-ace-grid-theme="material-3"] .ace-grid__header-group-toggle:focus-visible,
  [data-ace-grid-theme="material-3"] .ace-grid__pin-button:focus-visible,
  [data-ace-grid-theme="material-3"] .ace-grid__row-pin-button:focus-visible,
  [data-ace-grid-theme="material-3"] .ace-grid__row-detail-toggle-button:focus-visible,
  [data-ace-grid-theme="material-3"] .ace-grid__pagination-button:focus-visible,
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-button:focus-visible,
  [data-ace-grid-theme="material-3"] .ace-grid__json-editor-button:focus-visible,
  [data-ace-grid-theme="material-3"] .ace-grid__json-editor-close:focus-visible,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-action:focus-visible,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-toggle-button:focus-visible,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-type-button:focus-visible,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-close:focus-visible,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-settings-close:focus-visible,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-settings-reset:focus-visible,
  [data-ace-grid-theme="material-3"] .ace-grid__context-menu-color-apply:focus-visible {
    outline: 2px solid var(--ace-grid-focus-outline);
    outline-offset: 1px;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-button--apply,
  [data-ace-grid-theme="material-3"] .ace-grid__json-editor-button--primary,
  [data-ace-grid-theme="material-3"] .ace-grid__context-menu-color-apply {
    min-width: auto;
    min-height: 32px;
    padding: 0 16px !important;
    border-radius: 999px !important;
    background: var(--ace-grid-sort-icon-active) !important;
    color: var(--ace-grid-text-on-accent) !important;
    font-weight: 620 !important;
    letter-spacing: 0.01em;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-button--apply:hover,
  [data-ace-grid-theme="material-3"] .ace-grid__json-editor-button--primary:hover,
  [data-ace-grid-theme="material-3"] .ace-grid__context-menu-color-apply:hover {
    background: var(--ace-grid-sort-icon-active) !important;
    filter: brightness(1.06);
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-button--clear,
  [data-ace-grid-theme="material-3"] .ace-grid__json-editor-button--ghost,
  [data-ace-grid-theme="material-3"] .ace-grid__json-editor-button--format,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-settings-reset {
    min-width: auto;
    min-height: 30px;
    padding: 0 13px !important;
    border-radius: 999px !important;
  }

  [data-ace-grid-theme="material-3"] .ace-grid__floating-filter-input,
  [data-ace-grid-theme="material-3"] .ace-grid__floating-filter-select,
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-search,
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-input,
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-select,
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-range-input,
  [data-ace-grid-theme="material-3"] .ace-grid__pagination-select,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-type-select,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-grouping-select,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-settings-select,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-settings-input,
  [data-ace-grid-theme="material-3"] .ace-grid__cell-editor-select,
  [data-ace-grid-theme="material-3"] .ace-grid__cell-editor-input,
  [data-ace-grid-theme="material-3"] .ace-grid__cell-editor-textarea {
    border-radius: var(--ace-grid-md3-control-radius) !important;
    border: 1px solid var(--ace-grid-border-color-strong) !important;
    background: var(--ace-grid-surface-raised) !important;
    color: var(--ace-grid-text-primary) !important;
    font-size: 14px;
    box-shadow: none !important;
    -webkit-text-fill-color: var(--ace-grid-text-primary);
  }
  [data-ace-grid-theme="material-3"] .ace-grid__floating-filter-cell {
    padding: 0 8px;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__floating-filter-input,
  [data-ace-grid-theme="material-3"] .ace-grid__floating-filter-select {
    height: clamp(24px, calc(100% - 8px), 30px) !important;
    min-height: 24px;
    max-height: 30px;
    padding: 0 11px !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-search,
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-input,
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-select,
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-range-input,
  [data-ace-grid-theme="material-3"] .ace-grid__pagination-select,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-type-select,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-grouping-select,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-settings-select,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-settings-input,
  [data-ace-grid-theme="material-3"] .ace-grid__cell-editor-select,
  [data-ace-grid-theme="material-3"] .ace-grid__cell-editor-input {
    min-height: var(--ace-grid-md3-control-height);
    padding: 0 var(--ace-grid-md3-control-padding-x);
  }
  [data-ace-grid-theme="material-3"] .ace-grid__cell-editor-textarea {
    padding: 8px var(--ace-grid-md3-control-padding-x);
  }
  [data-ace-grid-theme="material-3"] .ace-grid__cell-editor--select {
    padding: 0 2px;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__cell-editor--select .ace-grid__cell-editor-select {
    width: 100%;
    min-height: 0;
    height: min(var(--ace-grid-md3-control-height), calc(100% - 4px));
    margin: 0;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__floating-filter-input:focus,
  [data-ace-grid-theme="material-3"] .ace-grid__floating-filter-select:focus,
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-search:focus,
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-input:focus,
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-select:focus,
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-range-input:focus,
  [data-ace-grid-theme="material-3"] .ace-grid__pagination-select:focus,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-type-select:focus,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-grouping-select:focus,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-settings-select:focus,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-settings-input:focus,
  [data-ace-grid-theme="material-3"] .ace-grid__cell-editor-select:focus,
  [data-ace-grid-theme="material-3"] .ace-grid__cell-editor-input:focus,
  [data-ace-grid-theme="material-3"] .ace-grid__cell-editor-textarea:focus {
    border-color: var(--ace-grid-focus-outline) !important;
    box-shadow: 0 0 0 1px var(--ace-grid-focus-outline) !important;
    outline: none;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__floating-filter-input::placeholder,
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-search::placeholder,
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-input::placeholder,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-settings-input::placeholder,
  [data-ace-grid-theme="material-3"] .ace-grid__cell-editor-input::placeholder,
  [data-ace-grid-theme="material-3"] .ace-grid__cell-editor-textarea::placeholder {
    color: var(--ace-grid-text-muted);
  }
  [data-ace-grid-theme="material-3"] .ace-grid :is(input[type="date"], input[type="time"], input[type="datetime-local"]) {
    color-scheme: light;
  }
  [data-ace-grid-theme="material-3"] .ace-grid :is(input[type="date"], input[type="time"], input[type="datetime-local"])::-webkit-calendar-picker-indicator {
    opacity: 0.92;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter select option,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-panel select option,
  [data-ace-grid-theme="material-3"] .ace-grid__json-editor select option,
  [data-ace-grid-theme="material-3"] .ace-grid__floating-filter-select option,
  [data-ace-grid-theme="material-3"] .ace-grid__pagination-select option,
  [data-ace-grid-theme="material-3"] .ace-grid__cell-editor-select option {
    background: var(--ace-grid-surface-raised);
    color: var(--ace-grid-text-primary);
  }

  [data-ace-grid-theme="material-3"].ace-grid__wrapper > .ace-grid__formula-bar,
  [data-ace-grid-theme="material-3"] .ace-grid__formula-bar {
    position: relative;
    z-index: 4200;
    isolation: isolate;
    overflow: visible;
    box-sizing: border-box;
    min-height: 0;
    height: var(--ace-grid-md3-formula-height) !important;
    max-height: var(--ace-grid-md3-formula-height) !important;
    padding: 4px 12px !important;
    gap: 8px !important;
    background: var(--ace-grid-md3-header-band-bg) !important;
    border-bottom: 0 !important;
    box-shadow: none !important;
  }
  [data-ace-grid-theme="material-3"].ace-grid__wrapper > .ace-grid__formula-bar .ace-grid__formula-bar-badge,
  [data-ace-grid-theme="material-3"] .ace-grid__formula-bar-badge {
    min-width: 54px;
    height: var(--ace-grid-md3-formula-control-height) !important;
    border-radius: var(--ace-grid-md3-formula-radius);
    border: 1px solid var(--ace-grid-md3-emphasis) !important;
    background: var(--ace-grid-md3-formula-shell) !important;
    color: var(--ace-grid-text-secondary) !important;
    font-size: 10px;
    font-family: var(--ace-grid-font-family);
    font-weight: 600;
    letter-spacing: 0.02em;
    padding: 0 10px;
  }
  [data-ace-grid-theme="material-3"].ace-grid__wrapper > .ace-grid__formula-bar .ace-grid__formula-bar-input-wrap,
  [data-ace-grid-theme="material-3"] .ace-grid__formula-bar-input-wrap {
    position: relative;
    z-index: 1;
    height: var(--ace-grid-md3-formula-control-height) !important;
    min-height: var(--ace-grid-md3-formula-control-height) !important;
    border-radius: var(--ace-grid-md3-formula-radius) !important;
    border: 1px solid var(--ace-grid-md3-emphasis) !important;
    background: var(--ace-grid-surface-raised) !important;
    overflow: visible;
    box-shadow: none !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__formula-bar-input-wrap:hover {
    border-color: var(--ace-grid-border-color-strong) !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__formula-bar-input-wrap:focus-within {
    border-color: var(--ace-grid-focus-outline);
    box-shadow:
      0 0 0 2px color-mix(
        in srgb,
        var(--ace-grid-focus-outline) 24%,
        transparent
      ) !important;
  }
  [data-ace-grid-theme="material-3"].ace-grid__wrapper > .ace-grid__formula-bar .ace-grid__formula-bar-input,
  [data-ace-grid-theme="material-3"] .ace-grid__formula-bar-input {
    height: 100% !important;
    border: 0 !important;
    background: transparent !important;
    line-height: 1.2;
    padding: 0 12px !important;
    color: var(--ace-grid-text-primary) !important;
    font-size: 13px !important;
    font-weight: 500 !important;
    letter-spacing: 0.002em;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__formula-bar-input::placeholder {
    color: var(--ace-grid-text-muted);
  }
  [data-ace-grid-theme="material-3"] .ace-grid__cell[data-validation-message],
  [data-ace-grid-theme="material-3"] .ace-grid__cell-editor[data-validation-message] {
    --ace-grid-md3-validation-tooltip-bg-current: var(
      --ace-grid-md3-validation-tooltip-error-bg
    );
    --ace-grid-md3-validation-tooltip-border-current: var(
      --ace-grid-md3-validation-tooltip-error-border
    );
    --ace-grid-md3-validation-tooltip-text-current: var(
      --ace-grid-md3-validation-tooltip-error-text
    );
  }
  [data-ace-grid-theme="material-3"] .ace-grid__cell--validation-warning[data-validation-message],
  [data-ace-grid-theme="material-3"] .ace-grid__cell-editor--validation-warning[data-validation-message] {
    --ace-grid-md3-validation-tooltip-bg-current: var(
      --ace-grid-md3-validation-tooltip-warning-bg
    );
    --ace-grid-md3-validation-tooltip-border-current: var(
      --ace-grid-md3-validation-tooltip-warning-border
    );
    --ace-grid-md3-validation-tooltip-text-current: var(
      --ace-grid-md3-validation-tooltip-warning-text
    );
  }
  [data-ace-grid-theme="material-3"] .ace-grid__cell--validation-info[data-validation-message],
  [data-ace-grid-theme="material-3"] .ace-grid__cell-editor--validation-info[data-validation-message] {
    --ace-grid-md3-validation-tooltip-bg-current: var(
      --ace-grid-md3-validation-tooltip-info-bg
    );
    --ace-grid-md3-validation-tooltip-border-current: var(
      --ace-grid-md3-validation-tooltip-info-border
    );
    --ace-grid-md3-validation-tooltip-text-current: var(
      --ace-grid-md3-validation-tooltip-info-text
    );
  }
  [data-ace-grid-theme="material-3"] .ace-grid__cell[data-validation-message]:hover::before,
  [data-ace-grid-theme="material-3"] .ace-grid__cell[data-validation-message]:focus-within::before,
  [data-ace-grid-theme="material-3"] .ace-grid__cell-editor[data-validation-message]:hover::before,
  [data-ace-grid-theme="material-3"] .ace-grid__cell-editor[data-validation-message]:focus-within::before {
    left: 8px;
    top: calc(100% + 10px);
    max-width: min(308px, 70vw);
    padding: 12px 14px;
    font-size: 12.5px;
    line-height: 1.42;
    font-weight: 500;
    letter-spacing: 0.001em;
    border-radius: 14px;
    border-left: 0 !important;
    border: 1px solid
      color-mix(
        in srgb,
        var(--ace-grid-md3-validation-tooltip-border-current) 82%,
        transparent
      ) !important;
    color: var(--ace-grid-md3-validation-tooltip-text-current) !important;
    background:
      color-mix(
        in srgb,
        var(--ace-grid-md3-validation-tooltip-bg-current) 92%,
        var(--ace-grid-surface-raised, #fff) 8%
      ) !important;
    box-shadow: var(--ace-grid-md3-validation-tooltip-shadow) !important;
    text-shadow: none !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    z-index: 3800;
    white-space: normal;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__cell[data-validation-message]:hover::before,
  [data-ace-grid-theme="material-3"] .ace-grid__cell[data-validation-message]:focus-within::before,
  [data-ace-grid-theme="material-3"] .ace-grid__cell-editor[data-validation-message]:hover::before,
  [data-ace-grid-theme="material-3"] .ace-grid__cell-editor[data-validation-message]:focus-within::before {
    content: attr(data-validation-message);
  }

  [data-ace-grid-theme="material-3"] .ace-grid__row-index-cell,
  [data-ace-grid-theme="material-3"] .ace-grid__row-order-cell,
  [data-ace-grid-theme="material-3"] .ace-grid__row-pin,
  [data-ace-grid-theme="material-3"] .ace-grid__row-detail-toggle,
  [data-ace-grid-theme="material-3"] .ace-grid__row-select,
  [data-ace-grid-theme="material-3"] .ace-grid__system-cell {
    background: var(--ace-grid-pinned-left-bg, #e6eaf1) !important;
    --ace-grid-cell-bg: var(--ace-grid-pinned-left-bg, #e6eaf1);
    border-right-color: transparent !important;
    border-left-color: transparent !important;
    border-bottom-width: 1px !important;
    border-bottom-style: solid !important;
    border-bottom-color: var(
      --ace-grid-cell-border-bottom-color,
      var(--ace-grid-cell-border-color)
    ) !important;
    box-shadow: none !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__system-cell--boundary,
  [data-ace-grid-theme="material-3"] .ace-grid__row-select--system-boundary,
  [data-ace-grid-theme="material-3"] .ace-grid__row-order-cell--system-boundary,
  [data-ace-grid-theme="material-3"] .ace-grid__row-pin--system-boundary,
  [data-ace-grid-theme="material-3"] .ace-grid__row-detail-toggle--system-boundary {
    border-right-color: transparent !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__row-pin {
    justify-content: center;
    gap: var(--ace-grid-md3-system-pin-gap);
    padding-inline-start: var(--ace-grid-md3-system-pin-pad-inline-start);
    padding-inline-end: var(--ace-grid-md3-system-pin-pad-inline-end);
  }
  [data-ace-grid-theme="material-3"] .ace-grid__row-pin--system-boundary {
    padding-inline-start: calc(
      var(--ace-grid-md3-system-pin-pad-inline-start) +
        var(--ace-grid-md3-system-pin-boundary-pad-inline-start)
    );
    padding-inline-end: calc(
      var(--ace-grid-md3-system-pin-pad-inline-end) +
        var(--ace-grid-md3-system-pin-boundary-pad-inline-end)
    );
  }
  [data-ace-grid-theme="material-3"] .ace-grid__row-order-handle,
  [data-ace-grid-theme="material-3"] .ace-grid__row-pin-button,
  [data-ace-grid-theme="material-3"] .ace-grid__row-detail-toggle-button {
    min-width: 24px;
    min-height: 24px;
    width: 24px;
    height: 24px;
    padding: 0 !important;
    border: 0 !important;
    border-radius: 999px !important;
    background: transparent !important;
    box-shadow: none !important;
    color: var(--ace-grid-md3-icon-muted) !important;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__row-pin-button {
    min-width: var(--ace-grid-md3-system-pin-button-size);
    min-height: var(--ace-grid-md3-system-pin-button-size);
    width: var(--ace-grid-md3-system-pin-button-size);
    height: var(--ace-grid-md3-system-pin-button-size);
  }
  [data-ace-grid-theme="material-3"] .ace-grid__row-order-cell:not(.ace-grid__row-order-cell--disabled) .ace-grid__row-order-handle:hover,
  [data-ace-grid-theme="material-3"] .ace-grid__row-pin-button:not(:disabled):hover,
  [data-ace-grid-theme="material-3"] .ace-grid__row-detail-toggle:hover .ace-grid__row-detail-toggle-button {
    background: var(--ace-grid-md3-state-hover) !important;
    color: var(--ace-grid-text-primary) !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__row-order-cell:not(.ace-grid__row-order-cell--disabled) .ace-grid__row-order-handle:active,
  [data-ace-grid-theme="material-3"] .ace-grid__row-pin-button:not(:disabled):active,
  [data-ace-grid-theme="material-3"] .ace-grid__row-detail-toggle:active .ace-grid__row-detail-toggle-button {
    background: var(--ace-grid-md3-state-active) !important;
    color: var(--ace-grid-text-primary) !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__row-detail-toggle:focus-visible {
    outline: 2px solid var(--ace-grid-focus-outline);
    outline-offset: 1px;
    border-radius: 8px;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__row-order-cell--disabled .ace-grid__row-order-handle,
  [data-ace-grid-theme="material-3"] .ace-grid__row-detail-toggle--disabled .ace-grid__row-detail-toggle-button,
  [data-ace-grid-theme="material-3"] .ace-grid__row-pin-button:disabled {
    background: transparent !important;
    color: var(--ace-grid-pin-icon-disabled) !important;
    cursor: not-allowed !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__row-order-icon,
  [data-ace-grid-theme="material-3"] .ace-grid__row-pin-icon,
  [data-ace-grid-theme="material-3"] .ace-grid__row-detail-toggle-icon {
    width: 14px;
    height: 14px;
    color: currentColor !important;
    opacity: 1;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__row-pin-button--active {
    color: var(--ace-grid-pin-icon-active) !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__row-pin-button--active .ace-grid__row-pin-icon,
  [data-ace-grid-theme="material-3"] .ace-grid__row-pin-icon--active {
    color: currentColor !important;
    opacity: 1 !important;
  }

  [data-ace-grid-theme="material-3"] .ace-grid input[type="checkbox"],
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter input[type="checkbox"],
  [data-ace-grid-theme="material-3"] .ace-grid__chart-panel input[type="checkbox"],
  [data-ace-grid-theme="material-3"] .ace-grid__row-select-checkbox,
  [data-ace-grid-theme="material-3"] .ace-grid__header-cell-select,
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-checkbox,
  [data-ace-grid-theme="material-3"] .ace-grid__cell-editor-checkbox {
    appearance: none;
    -webkit-appearance: none;
    transform: none !important;
    width: var(--ace-grid-md3-checkbox-size);
    height: var(--ace-grid-md3-checkbox-size);
    min-width: var(--ace-grid-md3-checkbox-size);
    min-height: var(--ace-grid-md3-checkbox-size);
    margin: 0;
    border-radius: var(--ace-grid-md3-checkbox-radius);
    border: 2px solid var(--ace-grid-md3-checkbox-border);
    background: var(--ace-grid-md3-checkbox-bg);
    box-shadow: none !important;
    cursor: pointer;
    display: inline-grid;
    place-content: center;
    position: relative;
    transition:
      border-color 0.15s ease,
      background-color 0.15s ease,
      box-shadow 0.15s ease;
  }
  [data-ace-grid-theme="material-3"] .ace-grid input[type="checkbox"]:hover,
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter input[type="checkbox"]:hover,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-panel input[type="checkbox"]:hover,
  [data-ace-grid-theme="material-3"] .ace-grid__row-select-checkbox:hover,
  [data-ace-grid-theme="material-3"] .ace-grid__header-cell-select:hover,
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-checkbox:hover,
  [data-ace-grid-theme="material-3"] .ace-grid__cell-editor-checkbox:hover {
    border-color: var(--ace-grid-md3-checkbox-border-hover);
  }
  [data-ace-grid-theme="material-3"] .ace-grid input[type="checkbox"]:focus-visible,
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter input[type="checkbox"]:focus-visible,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-panel input[type="checkbox"]:focus-visible,
  [data-ace-grid-theme="material-3"] .ace-grid__row-select-checkbox:focus-visible,
  [data-ace-grid-theme="material-3"] .ace-grid__header-cell-select:focus-visible,
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-checkbox:focus-visible,
  [data-ace-grid-theme="material-3"] .ace-grid__cell-editor-checkbox:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 2px color-mix(
        in srgb,
        var(--ace-grid-focus-outline) 26%,
        transparent
      ) !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid input[type="checkbox"]:checked,
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter input[type="checkbox"]:checked,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-panel input[type="checkbox"]:checked,
  [data-ace-grid-theme="material-3"] .ace-grid__row-select-checkbox:checked,
  [data-ace-grid-theme="material-3"] .ace-grid__header-cell-select:checked,
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-checkbox:checked,
  [data-ace-grid-theme="material-3"] .ace-grid__cell-editor-checkbox:checked,
  [data-ace-grid-theme="material-3"] .ace-grid input[type="checkbox"]:indeterminate,
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter input[type="checkbox"]:indeterminate,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-panel input[type="checkbox"]:indeterminate,
  [data-ace-grid-theme="material-3"] .ace-grid__row-select-checkbox:indeterminate,
  [data-ace-grid-theme="material-3"] .ace-grid__header-cell-select:indeterminate,
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-checkbox:indeterminate,
  [data-ace-grid-theme="material-3"] .ace-grid__cell-editor-checkbox:indeterminate {
    border-color: var(--ace-grid-md3-checkbox-active);
    background: var(--ace-grid-md3-checkbox-active);
  }
  [data-ace-grid-theme="material-3"] .ace-grid input[type="checkbox"]:checked::after,
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter input[type="checkbox"]:checked::after,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-panel input[type="checkbox"]:checked::after,
  [data-ace-grid-theme="material-3"] .ace-grid__row-select-checkbox:checked::after,
  [data-ace-grid-theme="material-3"] .ace-grid__header-cell-select:checked::after,
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-checkbox:checked::after,
  [data-ace-grid-theme="material-3"] .ace-grid__cell-editor-checkbox:checked::after {
    content: "";
    width: 4px;
    height: 8px;
    border-right: 2px solid var(--ace-grid-md3-checkbox-mark);
    border-bottom: 2px solid var(--ace-grid-md3-checkbox-mark);
    transform: rotate(42deg) translate(-0.5px, -0.5px);
  }
  [data-ace-grid-theme="material-3"] .ace-grid input[type="checkbox"]:indeterminate::after,
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter input[type="checkbox"]:indeterminate::after,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-panel input[type="checkbox"]:indeterminate::after,
  [data-ace-grid-theme="material-3"] .ace-grid__row-select-checkbox:indeterminate::after,
  [data-ace-grid-theme="material-3"] .ace-grid__header-cell-select:indeterminate::after,
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-checkbox:indeterminate::after,
  [data-ace-grid-theme="material-3"] .ace-grid__cell-editor-checkbox:indeterminate::after {
    content: "";
    width: 8px;
    height: 2px;
    border-radius: 999px;
    background: var(--ace-grid-md3-checkbox-mark);
  }
  [data-ace-grid-theme="material-3"] .ace-grid input[type="checkbox"]:disabled,
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter input[type="checkbox"]:disabled,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-panel input[type="checkbox"]:disabled,
  [data-ace-grid-theme="material-3"] .ace-grid__row-select-checkbox:disabled,
  [data-ace-grid-theme="material-3"] .ace-grid__header-cell-select:disabled,
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-checkbox:disabled,
  [data-ace-grid-theme="material-3"] .ace-grid__cell-editor-checkbox:disabled {
    opacity: 0.42 !important;
    cursor: not-allowed;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter {
    border-radius: var(--ace-grid-md3-filter-radius) !important;
    border: 1px solid var(--ace-grid-popup-border) !important;
    background: var(--ace-grid-popup-bg) !important;
    box-shadow: 0 16px 32px rgba(31, 36, 45, 0.14) !important;
    padding: 10px 16px 14px !important;
    min-width: 320px;
    max-width: min(436px, 92vw);
    max-height: min(var(--ace-grid-filter-max-height, 60vh), 640px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    gap: 0;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter::before {
    content: none !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-tabs {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 2px !important;
    margin-bottom: 8px !important;
    padding: 0 2px !important;
    border: 0 !important;
    border-bottom: 1px solid
      color-mix(in srgb, var(--ace-grid-border-color) 82%, transparent) !important;
    border-radius: 0 !important;
    background: transparent !important;
    box-shadow: none !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-tab {
    position: relative;
    flex: 0 0 auto !important;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 72px;
    min-height: 38px !important;
    height: 38px !important;
    padding: 0 10px !important;
    border-radius: 0 !important;
    border: 0 !important;
    background: transparent !important;
    color: var(--ace-grid-text-secondary) !important;
    font-size: 14px !important;
    font-weight: 600 !important;
    letter-spacing: 0.002em !important;
    box-shadow: none !important;
    transition:
      background-color 0.15s ease,
      color 0.15s ease;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-tab::after {
    content: "";
    position: absolute;
    left: 10px;
    right: 10px;
    bottom: -1px;
    height: 2px;
    border-radius: 999px;
    background: var(--ace-grid-sort-icon-active);
    transform: scaleX(0);
    opacity: 0;
    transition: transform 0.17s ease, opacity 0.17s ease;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-tab--active {
    border-color: transparent !important;
    background: transparent !important;
    color: var(--ace-grid-text-primary) !important;
    font-weight: 640 !important;
    box-shadow: none !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-tab--active::after {
    transform: scaleX(1);
    opacity: 1;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-tab--inactive {
    border-color: transparent !important;
    background: transparent !important;
    color: var(--ace-grid-text-secondary) !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-tab--inactive::after {
    transform: scaleX(0);
    opacity: 0;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-tab:hover {
    background: color-mix(
      in srgb,
      var(--ace-grid-sort-icon-active) 10%,
      transparent
    ) !important;
    color: var(--ace-grid-text-primary) !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-tab:focus-visible {
    outline: 2px solid color-mix(
      in srgb,
      var(--ace-grid-focus-outline) 58%,
      transparent
    );
    outline-offset: -4px;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-body {
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow: auto;
    min-height: 0;
    padding: 6px 10px 8px;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 0;
    padding-inline: 2px;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-label {
    font-size: 14px;
    font-weight: 640;
    letter-spacing: 0.002em;
    color: var(--ace-grid-text-primary);
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-label--compact {
    margin-bottom: 0;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter .ace-grid__column-filter-search,
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter .ace-grid__column-filter-input,
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter .ace-grid__column-filter-select,
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter .ace-grid__column-filter-range-input {
    min-height: var(--ace-grid-md3-filter-control-height);
    border-radius: var(--ace-grid-md3-filter-control-radius) !important;
    padding: 0 14px !important;
    border: 1px solid var(--ace-grid-border-color-strong) !important;
    background: var(--ace-grid-surface-raised) !important;
    font-size: 14px;
    font-weight: 500;
    color: var(--ace-grid-text-primary) !important;
    line-height: 1.2;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter .ace-grid__column-filter-select {
    padding-right: 34px !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter .ace-grid__column-filter-range {
    gap: 10px;
    align-items: center;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter .ace-grid__column-filter-range-separator {
    color: var(--ace-grid-text-muted);
    font-size: 13px;
    font-weight: 560;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter .ace-grid__column-filter-search:focus,
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter .ace-grid__column-filter-input:focus,
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter .ace-grid__column-filter-select:focus,
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter .ace-grid__column-filter-range-input:focus {
    border-color: var(--ace-grid-focus-outline) !important;
    box-shadow: 0 0 0 1px var(--ace-grid-focus-outline) !important;
    outline: none;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-toolbar {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    align-items: center;
    font-size: 13px;
    margin-top: 0;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-toolbar-actions {
    display: flex;
    gap: 16px;
    align-items: center;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-action,
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-text-button {
    border: 0 !important;
    background: transparent !important;
    padding: 0;
    font-size: 13px;
    font-weight: 620;
    letter-spacing: 0.005em;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-action--accent,
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-text-button--accent {
    color: var(--ace-grid-sort-icon-active);
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-action--muted,
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-text-button--muted,
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-muted,
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-help,
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-empty {
    color: var(--ace-grid-text-muted);
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-options {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    display: block !important;
    gap: 0 !important;
    padding: 0 !important;
    border-radius: 14px !important;
    border: 1px solid var(--ace-grid-border-color) !important;
    background: var(--ace-grid-surface-raised) !important;
    box-shadow: none !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-options--capped {
    max-height: 252px;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-option {
    display: flex;
    align-items: center;
    min-height: 42px;
    padding: 8px 12px;
    gap: 12px;
    font-size: 14px;
    font-weight: 520;
    color: var(--ace-grid-text-primary);
    margin: 0 !important;
    border-radius: 0 !important;
    background: transparent !important;
    border-bottom: 1px solid
      color-mix(in srgb, var(--ace-grid-border-color) 52%, transparent) !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-option:first-child {
    border-top-left-radius: 13px !important;
    border-top-right-radius: 13px !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-option:last-child {
    border-bottom: 0 !important;
    border-bottom-left-radius: 13px !important;
    border-bottom-right-radius: 13px !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-option:hover {
    background: color-mix(
      in srgb,
      var(--ace-grid-sort-icon-active) 8%,
      transparent
    ) !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-option--selected {
    background: color-mix(
      in srgb,
      var(--ace-grid-sort-icon-active) 12%,
      transparent
    ) !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-empty {
    padding: 10px 12px;
    font-size: 13px;
    font-weight: 520;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-checkbox-row {
    display: flex;
    align-items: center;
    min-height: 28px;
    gap: 12px;
    font-size: 14px;
    font-weight: 620;
    color: var(--ace-grid-text-secondary);
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter .ace-grid__column-filter-options .ace-grid__column-filter-checkbox {
    appearance: none !important;
    -webkit-appearance: none !important;
    width: 18px !important;
    height: 18px !important;
    min-width: 18px !important;
    min-height: 18px !important;
    border-radius: 2px !important;
    border: 2px solid var(--ace-grid-md3-checkbox-border) !important;
    background: var(--ace-grid-md3-checkbox-bg) !important;
    background-image: none !important;
    box-shadow: none !important;
    filter: none !important;
    transform: none !important;
    display: inline-grid !important;
    place-content: center !important;
    position: relative !important;
    outline: none !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter .ace-grid__column-filter-options .ace-grid__column-filter-checkbox:hover {
    border-color: var(--ace-grid-md3-checkbox-border-hover) !important;
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--ace-grid-sort-icon-active) 10%, transparent) !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter .ace-grid__column-filter-options .ace-grid__column-filter-checkbox:focus-visible {
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--ace-grid-focus-outline) 28%, transparent) !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter .ace-grid__column-filter-options .ace-grid__column-filter-checkbox:checked,
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter .ace-grid__column-filter-options .ace-grid__column-filter-checkbox:indeterminate {
    border-color: var(--ace-grid-md3-checkbox-active) !important;
    background: var(--ace-grid-md3-checkbox-active) !important;
    box-shadow: none !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter .ace-grid__column-filter-options .ace-grid__column-filter-checkbox:not(:checked):not(:indeterminate)::after {
    content: none !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter .ace-grid__column-filter-options .ace-grid__column-filter-checkbox:checked::after {
    content: "" !important;
    width: 4px !important;
    height: 8px !important;
    border-right-width: 2px !important;
    border-bottom-width: 2px !important;
    border-right-style: solid !important;
    border-bottom-style: solid !important;
    border-right-color: var(--ace-grid-md3-checkbox-mark) !important;
    border-bottom-color: var(--ace-grid-md3-checkbox-mark) !important;
    transform: rotate(42deg) translate(-0.5px, -0.5px) !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter .ace-grid__column-filter-options .ace-grid__column-filter-checkbox:indeterminate::after {
    content: "" !important;
    width: 8px !important;
    height: 2px !important;
    border: 0 !important;
    border-radius: 999px !important;
    background: var(--ace-grid-md3-checkbox-mark) !important;
    transform: none !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter .ace-grid__column-filter-options .ace-grid__column-filter-checkbox:disabled {
    opacity: 0.38 !important;
    box-shadow: none !important;
    cursor: not-allowed;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter input[type="checkbox"].ace-grid__column-filter-switch {
    appearance: none !important;
    -webkit-appearance: none !important;
    width: 34px !important;
    height: 20px !important;
    min-width: 34px !important;
    min-height: 20px !important;
    border-radius: 999px !important;
    border: 2px solid var(--ace-grid-border-color-strong) !important;
    background: var(--ace-grid-surface-raised) !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: flex-start !important;
    place-content: initial !important;
    position: relative !important;
    padding: 0 2px !important;
    margin: 0 !important;
    box-sizing: border-box !important;
    box-shadow: none !important;
    cursor: pointer;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter input[type="checkbox"].ace-grid__column-filter-switch::after {
    content: "";
    width: 12px !important;
    height: 12px !important;
    border: 0 !important;
    border-radius: 999px !important;
    background: var(--ace-grid-text-muted) !important;
    transform: translateX(0) !important;
    transition:
      transform 0.16s ease,
      background-color 0.16s ease;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter input[type="checkbox"].ace-grid__column-filter-switch:checked {
    border-color: var(--ace-grid-sort-icon-active) !important;
    background: color-mix(
      in srgb,
      var(--ace-grid-sort-icon-active) 16%,
      var(--ace-grid-surface-raised)
    ) !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter input[type="checkbox"].ace-grid__column-filter-switch:checked::after {
    border: 0 !important;
    background: var(--ace-grid-sort-icon-active) !important;
    transform: translateX(14px) !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter input[type="checkbox"].ace-grid__column-filter-switch:indeterminate {
    border: 2px solid var(--ace-grid-border-color-strong) !important;
    background: var(--ace-grid-surface-raised) !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter input[type="checkbox"].ace-grid__column-filter-switch:indeterminate::after {
    border: 0 !important;
    background: var(--ace-grid-text-muted) !important;
    transform: translateX(0) !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter input[type="checkbox"].ace-grid__column-filter-switch:focus-visible {
    box-shadow:
      0 0 0 2px color-mix(
        in srgb,
        var(--ace-grid-focus-outline) 24%,
        transparent
      ) !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-block-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 8px;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-condition-item {
    margin-bottom: 10px;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-condition-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-condition-operator {
    flex: 1;
    min-width: 0;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-stack {
    gap: 12px;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-stack > div {
    border-radius: 14px !important;
    border: 1px solid var(--ace-grid-border-color) !important;
    background: color-mix(
      in srgb,
      var(--ace-grid-surface-raised) 94%,
      var(--ace-grid-surface-subtle) 6%
    ) !important;
    padding: 12px !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-block-title {
    font-size: 13px;
    font-weight: 620;
    color: var(--ace-grid-text-secondary);
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-inline-actions {
    gap: 10px;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-surface-button {
    min-height: 36px;
    border-radius: 999px !important;
    border: 1px solid var(--ace-grid-border-color-strong) !important;
    background: var(--ace-grid-surface-raised) !important;
    color: var(--ace-grid-text-primary) !important;
    font-size: 13px;
    font-weight: 620;
    letter-spacing: 0.005em;
    padding: 0 14px;
    box-shadow: none !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-surface-button:hover {
    background: var(--ace-grid-md3-state-hover) !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter-actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid var(--ace-grid-border-color) !important;
    gap: 12px;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter .ace-grid__column-filter-button {
    min-height: var(--ace-grid-md3-filter-button-height);
    min-width: 112px;
    border-radius: 999px !important;
    padding: 0 20px !important;
    font-size: 14px;
    font-weight: 640;
    letter-spacing: 0.005em;
    border: 1px solid transparent !important;
    box-shadow: none !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter .ace-grid__column-filter-button--clear {
    border-color: var(--ace-grid-border-color-strong) !important;
    background: var(--ace-grid-surface-raised) !important;
    color: var(--ace-grid-text-primary) !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter .ace-grid__column-filter-button--clear:hover {
    background: var(--ace-grid-md3-state-hover) !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter .ace-grid__column-filter-button--apply {
    border-color: var(--ace-grid-sort-icon-active) !important;
    background: var(--ace-grid-sort-icon-active) !important;
    color: var(--ace-grid-text-on-accent) !important;
    box-shadow: none !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__column-filter .ace-grid__column-filter-button--apply:hover {
    background: color-mix(
      in srgb,
      var(--ace-grid-sort-icon-active) 90%,
      #ffffff 10%
    ) !important;
    filter: none;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__chart-toolbar-actions .ace-grid__chart-action:not(.ace-grid__chart-action--download):not(.ace-grid__chart-action--brush),
  [data-ace-grid-theme="material-3"] .ace-grid__chart-settings-actions .ace-grid__chart-settings-close,
  [data-ace-grid-theme="material-3"] .ace-grid__json-editor-header .ace-grid__json-editor-close {
    width: 32px;
    height: 32px;
    min-width: 32px;
    min-height: 32px;
    padding: 0 !important;
    border-radius: 10px !important;
    border: 1px solid
      color-mix(in srgb, var(--ace-grid-border-color-strong) 62%, transparent)
      !important;
    background: color-mix(
      in srgb,
      var(--ace-grid-surface-raised) 84%,
      var(--ace-grid-surface-subtle) 16%
    ) !important;
    color: var(--ace-grid-text-secondary) !important;
    box-shadow: 0 1px 2px rgba(37, 45, 57, 0.12) !important;
    transition:
      background-color 0.16s ease,
      border-color 0.16s ease,
      box-shadow 0.16s ease,
      color 0.16s ease !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__chart-toolbar-actions .ace-grid__chart-action:not(.ace-grid__chart-action--download):not(.ace-grid__chart-action--brush):hover,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-settings-actions .ace-grid__chart-settings-close:hover,
  [data-ace-grid-theme="material-3"] .ace-grid__json-editor-header .ace-grid__json-editor-close:hover {
    border-color: color-mix(
      in srgb,
      var(--ace-grid-sort-icon-active) 35%,
      var(--ace-grid-border-color) 65%
    ) !important;
    background: color-mix(
      in srgb,
      var(--ace-grid-sort-icon-active) 14%,
      var(--ace-grid-surface-raised) 86%
    ) !important;
    color: var(--ace-grid-text-primary) !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__chart-toolbar-actions .ace-grid__chart-action:not(.ace-grid__chart-action--download):not(.ace-grid__chart-action--brush):active,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-settings-actions .ace-grid__chart-settings-close:active,
  [data-ace-grid-theme="material-3"] .ace-grid__json-editor-header .ace-grid__json-editor-close:active {
    border-color: color-mix(
      in srgb,
      var(--ace-grid-sort-icon-active) 44%,
      var(--ace-grid-border-color) 56%
    ) !important;
    background: color-mix(
      in srgb,
      var(--ace-grid-sort-icon-active) 18%,
      var(--ace-grid-surface-raised) 82%
    ) !important;
    box-shadow: 0 1px 1px rgba(37, 45, 57, 0.09) inset !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__chart-toolbar-actions .ace-grid__chart-action:not(.ace-grid__chart-action--download):not(.ace-grid__chart-action--brush):focus-visible,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-settings-actions .ace-grid__chart-settings-close:focus-visible,
  [data-ace-grid-theme="material-3"] .ace-grid__json-editor-header .ace-grid__json-editor-close:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 3px
        color-mix(in srgb, var(--ace-grid-focus-outline) 28%, transparent),
      0 1px 2px rgba(37, 45, 57, 0.12) !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__chart-toolbar-actions .ace-grid__chart-action:not(.ace-grid__chart-action--download):not(.ace-grid__chart-action--brush):disabled {
    opacity: 0.46 !important;
    cursor: not-allowed;
    border-color: color-mix(
      in srgb,
      var(--ace-grid-border-color) 66%,
      transparent
    ) !important;
    background: color-mix(
      in srgb,
      var(--ace-grid-surface-subtle) 82%,
      var(--ace-grid-surface-raised) 18%
    ) !important;
    color: var(--ace-grid-text-muted) !important;
    box-shadow: none !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__chart-toolbar-actions .ace-grid__chart-action--settings-active,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-toolbar-actions .ace-grid__chart-action--maximize-active,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-toolbar-actions .ace-grid__chart-action[aria-pressed="true"] {
    border-color: color-mix(
      in srgb,
      var(--ace-grid-sort-icon-active) 52%,
      var(--ace-grid-border-color) 48%
    ) !important;
    background: color-mix(
      in srgb,
      var(--ace-grid-sort-icon-active) 22%,
      var(--ace-grid-surface-raised) 78%
    ) !important;
    color: var(--ace-grid-sort-icon-active) !important;
    box-shadow: 0 1px 2px rgba(37, 45, 57, 0.1) !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__json-editor-header .ace-grid__json-editor-close {
    font-size: 19px !important;
    line-height: 1 !important;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__chart-toolbar-actions .ace-grid__chart-action-icon,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-settings-actions .ace-grid__chart-action-icon {
    width: 16px;
    height: 16px;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__chart-toolbar-actions {
    gap: 8px;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__json-editor-body {
    gap: 12px;
    padding: 12px !important;
    background: color-mix(
      in srgb,
      var(--ace-grid-popup-bg) 97%,
      var(--ace-grid-surface-subtle) 3%
    ) !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__json-editor-pane {
    border: 1px solid
      color-mix(in srgb, var(--ace-grid-border-color-strong) 56%, transparent) !important;
    border-radius: 16px;
    background: color-mix(
      in srgb,
      var(--ace-grid-surface-raised) 98%,
      var(--ace-grid-surface-subtle) 2%
    );
    box-shadow: none !important;
    gap: 0;
    overflow: hidden;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__json-editor-pane-head {
    height: 34px;
    min-height: 34px;
    padding: 0 12px;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    border-bottom: 0;
    background: transparent;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__json-editor-pane-head .ace-grid__json-editor-pane-label {
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
    min-height: 0;
    padding: 0;
    border: 0 !important;
    border-radius: 0 !important;
    background: transparent !important;
    color: var(--ace-grid-text-secondary);
    font-size: 11px;
    font-weight: 650;
    letter-spacing: 0.075em;
    text-transform: uppercase;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__json-editor-button--format {
    min-height: 24px !important;
    height: 24px !important;
    padding: 0 10px !important;
    margin: 0 !important;
    align-self: center;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1 !important;
    border-radius: 999px !important;
    border: 1px solid
      color-mix(in srgb, var(--ace-grid-border-color-strong) 62%, transparent)
      !important;
    background: color-mix(
      in srgb,
      var(--ace-grid-sort-icon-active) 8%,
      var(--ace-grid-surface-raised) 92%
    ) !important;
    color: var(--ace-grid-text-secondary) !important;
    font-size: 12px !important;
    font-weight: 640 !important;
    letter-spacing: 0.01em;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__json-editor-button--format:hover {
    border-color: color-mix(
      in srgb,
      var(--ace-grid-sort-icon-active) 30%,
      var(--ace-grid-border-color) 70%
    ) !important;
    background: color-mix(
      in srgb,
      var(--ace-grid-sort-icon-active) 10%,
      var(--ace-grid-surface-raised) 90%
    ) !important;
    color: var(--ace-grid-text-primary) !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__json-editor-textarea,
  [data-ace-grid-theme="material-3"] .ace-grid__json-editor-preview {
    border: 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    background: transparent !important;
    color: var(--ace-grid-text-primary) !important;
    padding: 12px 14px !important;
    font-size: 13px;
    line-height: 1.52;
    border-top: 1px solid
      color-mix(in srgb, var(--ace-grid-border-color) 80%, transparent) !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__json-editor-preview {
    color: var(--ace-grid-text-secondary) !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__json-editor-textarea:focus {
    background: var(--ace-grid-surface-raised) !important;
    box-shadow: inset 0 0 0 2px
      color-mix(in srgb, var(--ace-grid-focus-outline) 34%, transparent)
      !important;
    outline: none;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__chart-toolbar-row--summary {
    justify-content: flex-start;
    padding-top: 0;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__chart-mapping {
    gap: 6px;
    font-size: 11px;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__chart-mapping-item {
    min-height: 26px;
    padding: 0 10px;
    gap: 4px;
    border-radius: 999px;
    border: 1px solid
      color-mix(
        in srgb,
        var(--ace-grid-border-color-strong) 74%,
        transparent
      ) !important;
    background: color-mix(
      in srgb,
      var(--ace-grid-sort-icon-active) 11%,
      var(--ace-grid-surface-raised) 89%
    ) !important;
    box-shadow: none !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__chart-mapping-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--ace-grid-text-secondary) !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__chart-mapping-value {
    font-size: 11px;
    font-weight: 650;
    color: var(--ace-grid-text-primary) !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__chart-series-toggle {
    gap: 3px;
    padding: 2px;
    border-radius: 13px;
    border: 1px solid var(--ace-grid-border-color) !important;
    background: color-mix(
      in srgb,
      var(--ace-grid-surface-subtle) 72%,
      var(--ace-grid-surface-raised) 28%
    ) !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__chart-series-toggle .ace-grid__chart-toggle-button {
    min-height: 32px;
    height: 32px;
    border-radius: 11px !important;
    padding: 0 14px !important;
    font-size: 13px !important;
    font-weight: 620 !important;
    color: var(--ace-grid-text-secondary) !important;
    background: transparent !important;
    border: 1px solid transparent !important;
    box-shadow: none !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__chart-series-toggle .ace-grid__chart-toggle-button:hover {
    background: var(--ace-grid-md3-state-hover) !important;
    color: var(--ace-grid-text-primary) !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__chart-series-toggle .ace-grid__chart-toggle-button--active,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-series-toggle .ace-grid__chart-toggle-button--active:hover {
    background: var(--ace-grid-surface-raised) !important;
    border-color: color-mix(
      in srgb,
      var(--ace-grid-sort-icon-active) 25%,
      var(--ace-grid-border-color) 75%
    ) !important;
    color: var(--ace-grid-text-primary) !important;
    box-shadow: 0 1px 2px rgba(42, 51, 64, 0.12) !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__chart-settings-toggle {
    min-height: 32px;
    font-size: 13px;
    font-weight: 520;
    color: var(--ace-grid-text-primary);
  }
  [data-ace-grid-theme="material-3"] .ace-grid__chart-settings-toggle input[type="checkbox"] {
    appearance: none !important;
    -webkit-appearance: none !important;
    width: 36px !important;
    height: 20px !important;
    min-width: 36px !important;
    min-height: 20px !important;
    margin: 0 !important;
    border-radius: 999px !important;
    border: 2px solid
      color-mix(
        in srgb,
        var(--ace-grid-border-color-strong) 88%,
        transparent
      ) !important;
    background: color-mix(
      in srgb,
      var(--ace-grid-surface-raised) 92%,
      var(--ace-grid-surface-subtle) 8%
    ) !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: flex-start !important;
    place-content: initial !important;
    position: relative !important;
    padding: 0 2px !important;
    box-sizing: border-box !important;
    box-shadow: none !important;
    cursor: pointer;
    transition:
      background-color 0.16s ease,
      border-color 0.16s ease,
      box-shadow 0.16s ease !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__chart-settings-toggle input[type="checkbox"]::after {
    content: "";
    width: 12px !important;
    height: 12px !important;
    border: 0 !important;
    border-radius: 999px !important;
    background: var(--ace-grid-text-muted) !important;
    transform: translateX(0) !important;
    transition:
      transform 0.16s ease,
      background-color 0.16s ease !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__chart-settings-toggle input[type="checkbox"]:hover {
    box-shadow: 0 0 0 4px
      color-mix(in srgb, var(--ace-grid-sort-icon-active) 10%, transparent)
      !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__chart-settings-toggle input[type="checkbox"]:checked {
    border-color: var(--ace-grid-sort-icon-active) !important;
    background: color-mix(
      in srgb,
      var(--ace-grid-sort-icon-active) 20%,
      var(--ace-grid-surface-raised)
    ) !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__chart-settings-toggle input[type="checkbox"]:checked::after {
    background: var(--ace-grid-sort-icon-active) !important;
    transform: translateX(14px) !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__chart-settings-toggle input[type="checkbox"]:focus-visible {
    box-shadow:
      0 0 0 3px color-mix(
        in srgb,
        var(--ace-grid-focus-outline) 26%,
        transparent
      ) !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__chart-settings-toggle input[type="checkbox"]:disabled {
    opacity: 0.48 !important;
    cursor: not-allowed;
    box-shadow: none !important;
  }

  [data-ace-grid-theme="material-3"] .ace-grid__formula-suggestions,
  [data-ace-grid-theme="material-3"] .ace-grid__context-menu,
  [data-ace-grid-theme="material-3"].ace-grid__context-menu,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-panel,
  [data-ace-grid-theme="material-3"].ace-grid__chart-panel,
  [data-ace-grid-theme="material-3"] .ace-grid__json-editor,
  [data-ace-grid-theme="material-3"].ace-grid__json-editor,
  [data-ace-grid-theme="material-3"] .ace-grid__chart-tooltip,
  [data-ace-grid-theme="material-3"] .ace-grid__sparkline-tooltip,
  [data-ace-grid-theme="material-3"].ace-grid__sparkline-tooltip {
    border-radius: 14px;
    border: 1px solid var(--ace-grid-popup-border) !important;
    background: var(--ace-grid-popup-bg) !important;
    box-shadow: 0 12px 24px rgba(31, 36, 45, 0.12) !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }
  [data-ace-grid-theme="material-3"] .ace-grid__formula-suggestions {
    z-index: 4500 !important;
  }
`;

const liquidGlassTokens = {
  ...classicLightTokens,
  fontFamily:
    "'SF Pro Display', 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontSize: 13,
  borderRadius: "16px",
  borderRadiusSmall: "10px",
  surfaceBase:
    "linear-gradient(165deg, rgba(248,250,253,0.96) 0%, rgba(239,244,250,0.94) 56%, rgba(231,238,247,0.9) 100%)",
  surfaceSubtle: "rgba(255, 255, 255, 0.52)",
  surfaceRaised: "rgba(255, 255, 255, 0.76)",
  surfaceSunken: "rgba(229, 235, 244, 0.62)",
  borderColor: "rgba(133, 147, 168, 0.32)",
  borderColorStrong: "rgba(123, 139, 161, 0.44)",
  headerBorderColor: "rgba(137, 151, 172, 0.22)",
  cellBorderColor: "rgba(140, 153, 175, 0.12)",
  cellBorderColorAlt: "rgba(132, 147, 170, 0.16)",
  gridBorder: "1px solid rgba(124, 140, 162, 0.36)",
  gridShadow:
    "0 16px 38px rgba(22, 35, 54, 0.18), 0 30px 74px rgba(91, 113, 141, 0.14)",
  gridBackdropFilter: "blur(16px) saturate(132%)",
  textPrimary: "#1a2332",
  textSecondary: "#3a485f",
  textMuted: "#6a768a",
  textOnAccent: "#f7fbff",
  headerBackground: "transparent",
  headerBackgroundPinned: "#f4f8fd",
  headerBackgroundDragging: "rgba(228, 237, 248, 0.62)",
  headerBackgroundSelected: "rgba(221, 233, 250, 0.54)",
  headerBackgroundHover: "rgba(106, 126, 154, 0.08)",
  headerTextColor: "#212c3e",
  headerShadow: "0 8px 22px rgba(48, 64, 90, 0.14)",
  headerBackdropFilter: "blur(12px) saturate(130%)",
  pinnedLeftBackground: "rgba(248, 252, 255, 0.985)",
  pinnedRightBackground: "rgba(248, 252, 255, 0.985)",
  pinnedShadowLeft: "inset -1px 0 0 rgba(132, 149, 173, 0.18)",
  pinnedShadowRight: "inset 1px 0 0 rgba(132, 149, 173, 0.18)",
  pinnedEdgeShadowLeft:
    "inset -1px 0 0 rgba(132, 149, 173, 0.28), 7px 0 12px rgba(48, 65, 92, 0.07)",
  pinnedEdgeShadowRight:
    "inset 1px 0 0 rgba(132, 149, 173, 0.28), -7px 0 12px rgba(48, 65, 92, 0.07)",
  cellBackground: "rgba(255, 255, 255, 0.4)",
  cellBackgroundHover: "rgba(252, 254, 255, 0.72)",
  cellBackgroundSelected: "rgba(219, 234, 255, 0.84)",
  cellBackgroundPinned: "rgba(243, 247, 252, 0.78)",
  cellTextColor: "#1e2b3f",
  cellPaddingVertical: 7,
  cellPaddingHorizontal: 12,
  cellBorderRadius: "0px",
  cellShadow: "none",
  cellHoverShadow: "none",
  cellSelectedShadow:
    "inset 0 0 0 1px rgba(10, 132, 255, 0.76), 0 2px 8px rgba(39, 112, 201, 0.14)",
  rowHoverBackground: "rgba(126, 142, 165, 0.08)",
  rowActiveBackground: "rgba(10, 132, 255, 0.13)",
  rowBorderColor: "transparent",
  rowShadow: "none",
  spanCellBackground: "rgba(244, 248, 253, 0.86)",
  spanCellSelectedBackground: "rgba(219, 234, 255, 0.9)",
  spanCellBorder: "rgba(133, 151, 176, 0.4)",
  spanCellShadow: "none",
  sparklineLineColor: "rgba(35, 173, 255, 0.96)",
  sparklineAreaFill: "rgba(35, 173, 255, 0.18)",
  sparklineAxisColor: "rgba(124, 142, 166, 0.36)",
  sparklineMarkerFill: "rgba(255, 255, 255, 0.96)",
  sparklineMarkerStroke: "rgba(35, 173, 255, 0.96)",
  sparklinePositiveColor: "rgba(37, 214, 154, 0.9)",
  sparklineNegativeColor: "rgba(255, 94, 126, 0.9)",
  sparklineZeroColor: "rgba(154, 166, 184, 0.62)",
  sparklineHighlightMin: "rgba(255, 184, 76, 0.94)",
  sparklineHighlightMax: "rgba(46, 228, 166, 0.94)",
  selectionBorder: "rgba(10, 132, 255, 0.96)",
  selectionFill: "rgba(10, 132, 255, 0.18)",
  checkboxAccent: "#0a84ff",
  fillHandleBackground: "rgba(10, 132, 255, 0.96)",
  fillHandleBorder: "1px solid rgba(255, 255, 255, 0.96)",
  fillHandleShadow: "0 4px 10px rgba(10, 132, 255, 0.24)",
  dropIndicator: "rgba(10, 132, 255, 0.96)",
  dropIndicatorPin: "rgba(255, 159, 10, 0.92)",
  dropIndicatorUnpin: "rgba(48, 209, 88, 0.9)",
  dropIndicatorCrossPin: "rgba(255, 69, 58, 0.92)",
  scrollbarTrack: "rgba(157, 171, 191, 0.3)",
  scrollbarThumb: "rgba(114, 129, 151, 0.54)",
  scrollbarThumbHover: "rgba(95, 111, 133, 0.7)",
  filterIconDefault: "rgba(101, 115, 137, 0.92)",
  filterIconActive: "#0a84ff",
  filterIndicatorColor: "#0a84ff",
  filterIndicatorBorderColor: "rgba(255, 255, 255, 0.98)",
  filterIndicatorSize: 6,
  sortIconDefault: "rgba(101, 115, 137, 0.92)",
  sortIconActive: "#0a84ff",
  pinIconDefault: "rgba(106, 121, 144, 0.8)",
  pinIconActive: "#0a84ff",
  pinIconDisabled: "rgba(124, 136, 153, 0.44)",
  focusOutline: "rgba(10, 132, 255, 0.92)",
  focusOutlineWidth: "2px",
  resizeHandleColor: "rgba(112, 130, 155, 0.46)",
  resizeHandleActiveColor: "rgba(10, 132, 255, 0.92)",
  resizeHandleShadow: "0 0 10px rgba(10, 132, 255, 0.28)",
  dragGhostBackground:
    "linear-gradient(165deg, rgba(252,254,255,0.96) 0%, rgba(242,247,252,0.9) 100%)",
  dragGhostBorder: "1px solid rgba(125, 141, 164, 0.4)",
  dragGhostShadow: "0 18px 44px rgba(45, 61, 88, 0.22)",
  successBackground: "rgba(48, 209, 88, 0.2)",
  successBorder: "rgba(48, 209, 88, 0.42)",
  successShadow: "0 8px 18px rgba(48, 209, 88, 0.12)",
  dangerBackground: "rgba(255, 69, 58, 0.2)",
  dangerBorder: "rgba(255, 69, 58, 0.42)",
  dangerShadow: "0 8px 18px rgba(255, 69, 58, 0.12)",
  warningBackground: "rgba(255, 159, 10, 0.2)",
  warningBorder: "rgba(255, 159, 10, 0.42)",
  warningShadow: "0 8px 18px rgba(255, 159, 10, 0.12)",
  infoBackground: "rgba(10, 132, 255, 0.2)",
  infoBorder: "rgba(10, 132, 255, 0.42)",
  infoShadow: "0 8px 18px rgba(10, 132, 255, 0.12)",
  formulaBarBackground: "#f4f7fb",
  formulaBarBorder: "rgba(127, 144, 168, 0.38)",
  formulaBarInputBorder: "rgba(125, 143, 168, 0.4)",
  formulaBarSelectionBadgeBackground: "#f4f7fb",
  formulaBarSelectionBadgeText: "#243348",
  formulaBarShadow: "none",
  popupBackground: "rgba(248, 251, 255, 0.82)",
  popupBorder: "rgba(125, 142, 166, 0.42)",
  popupShadow: "0 20px 44px rgba(40, 56, 82, 0.2)",
  editorBackground: "rgba(248, 251, 255, 0.9)",
  editorBorder: "1px solid rgba(120, 138, 163, 0.46)",
  editorShadow: "0 24px 52px rgba(40, 56, 82, 0.24)",
  editorBackdropFilter: "blur(18px) saturate(132%)",
  contextMenuBackground: "rgba(248, 251, 255, 0.86)",
  contextMenuBorder: "1px solid rgba(121, 139, 163, 0.42)",
  contextMenuShadow: "0 20px 42px rgba(38, 56, 84, 0.24)",
  contextMenuDivider: "rgba(127, 142, 166, 0.3)",
  contextMenuText: "#1d2738",
  contextMenuTextMuted: "#4a596f",
  contextMenuTextDisabled: "rgba(74, 89, 111, 0.48)",
  contextMenuShortcut: "#6a778b",
  contextMenuItemHoverBackground: "rgba(10, 132, 255, 0.14)",
  contextMenuItemActiveBackground: "rgba(10, 132, 255, 0.2)",
  chartBackground: "rgba(248, 251, 255, 0.84)",
  chartPlotBackground: "rgba(238, 244, 251, 0.7)",
  chartAxisColor: "rgba(112, 128, 151, 0.72)",
  chartGridColor: "rgba(136, 150, 172, 0.34)",
  chartLabelColor: "#3a485f",
  chartLegendText: "#1d2738",
  chartLegendMuted: "#657287",
  chartTooltipBackground: "rgba(248, 252, 255, 0.94)",
  chartTooltipBorder: "1px solid rgba(129, 145, 168, 0.46)",
  chartTooltipShadow: "0 16px 30px rgba(40, 56, 82, 0.22)",
  chartHeatmapColor: "#0a84ff",
  chartHeatmapMissing: "rgba(142, 154, 172, 0.24)",
  chartPalette: [
    "#0a84ff",
    "#5ac8fa",
    "#30d158",
    "#ff9f0a",
    "#bf5af2",
    "#ff375f",
    "#64d2ff",
    "#ffd60a",
  ],
} as const;

const liquidGlassDarkTokens = {
  ...classicDarkTokens,
  fontFamily:
    "'SF Pro Display', 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontSize: 13,
  borderRadius: "16px",
  borderRadiusSmall: "10px",
  surfaceBase:
    "linear-gradient(165deg, rgba(24,30,42,0.98) 0%, rgba(20,26,37,0.96) 56%, rgba(15,20,29,0.94) 100%)",
  surfaceSubtle: "rgba(41, 52, 72, 0.38)",
  surfaceRaised: "rgba(43, 56, 77, 0.62)",
  surfaceSunken: "rgba(19, 25, 36, 0.62)",
  borderColor: "rgba(146, 164, 188, 0.2)",
  borderColorStrong: "rgba(146, 164, 188, 0.28)",
  headerBorderColor: "rgba(146, 164, 188, 0.16)",
  cellBorderColor: "rgba(146, 164, 188, 0.1)",
  cellBorderColorAlt: "rgba(146, 164, 188, 0.14)",
  gridBorder: "1px solid rgba(144, 162, 187, 0.2)",
  gridShadow:
    "0 18px 44px rgba(0, 0, 0, 0.46), 0 34px 88px rgba(4, 8, 14, 0.4)",
  gridBackdropFilter: "blur(18px) saturate(128%)",
  textPrimary: "#eaf2ff",
  textSecondary: "#c8d6eb",
  textMuted: "#90a5c0",
  textOnAccent: "#eff8ff",
  headerBackground: "transparent",
  headerBackgroundPinned: "rgba(26, 34, 47, 0.9)",
  headerBackgroundDragging: "rgba(36, 47, 64, 0.62)",
  headerBackgroundSelected: "rgba(18, 64, 129, 0.34)",
  headerBackgroundHover: "rgba(143, 191, 255, 0.08)",
  headerTextColor: "#e7f0ff",
  headerShadow: "0 8px 22px rgba(0, 0, 0, 0.34)",
  headerBackdropFilter: "blur(12px) saturate(132%)",
  pinnedLeftBackground: "rgba(22, 28, 40, 0.98)",
  pinnedRightBackground: "rgba(22, 28, 40, 0.98)",
  pinnedShadowLeft: "inset -1px 0 0 rgba(116, 141, 171, 0.2)",
  pinnedShadowRight: "inset 1px 0 0 rgba(116, 141, 171, 0.2)",
  pinnedEdgeShadowLeft:
    "inset -1px 0 0 rgba(116, 141, 171, 0.28), 8px 0 14px rgba(0, 0, 0, 0.18)",
  pinnedEdgeShadowRight:
    "inset 1px 0 0 rgba(116, 141, 171, 0.28), -8px 0 14px rgba(0, 0, 0, 0.18)",
  cellBackground: "rgba(28, 36, 50, 0.44)",
  cellBackgroundHover: "rgba(34, 44, 61, 0.62)",
  cellBackgroundSelected: "rgba(17, 74, 149, 0.34)",
  cellBackgroundPinned: "rgba(24, 31, 44, 0.74)",
  cellTextColor: "#e7f0ff",
  cellPaddingVertical: 7,
  cellPaddingHorizontal: 12,
  cellBorderRadius: "0px",
  cellShadow: "none",
  cellHoverShadow: "none",
  cellSelectedShadow:
    "inset 0 0 0 1px rgba(42, 170, 255, 0.78), 0 2px 8px rgba(16, 88, 160, 0.2)",
  rowHoverBackground: "rgba(132, 149, 171, 0.11)",
  rowActiveBackground: "rgba(28, 142, 255, 0.16)",
  rowBorderColor: "transparent",
  rowShadow: "none",
  spanCellBackground: "rgba(21, 27, 38, 0.82)",
  spanCellSelectedBackground: "rgba(18, 76, 153, 0.36)",
  spanCellBorder: "rgba(134, 154, 180, 0.28)",
  spanCellShadow: "none",
  sparklineLineColor: "rgba(78, 201, 255, 0.96)",
  sparklineAreaFill: "rgba(78, 201, 255, 0.18)",
  sparklineAxisColor: "rgba(138, 158, 186, 0.34)",
  sparklineMarkerFill: "rgba(11, 15, 22, 0.96)",
  sparklineMarkerStroke: "rgba(78, 201, 255, 0.96)",
  sparklinePositiveColor: "rgba(61, 232, 161, 0.9)",
  sparklineNegativeColor: "rgba(255, 106, 134, 0.9)",
  sparklineZeroColor: "rgba(147, 160, 178, 0.56)",
  sparklineHighlightMin: "rgba(255, 194, 86, 0.94)",
  sparklineHighlightMax: "rgba(90, 246, 184, 0.94)",
  selectionBorder: "rgba(42, 170, 255, 0.98)",
  selectionFill: "rgba(42, 170, 255, 0.16)",
  checkboxAccent: "#2aa8ff",
  fillHandleBackground: "rgba(42, 170, 255, 0.98)",
  fillHandleBorder: "1px solid rgba(235, 247, 255, 0.88)",
  fillHandleShadow: "0 4px 10px rgba(22, 108, 194, 0.28)",
  dropIndicator: "rgba(42, 170, 255, 0.98)",
  dropIndicatorPin: "rgba(255, 179, 71, 0.92)",
  dropIndicatorUnpin: "rgba(61, 232, 161, 0.92)",
  dropIndicatorCrossPin: "rgba(255, 106, 134, 0.92)",
  scrollbarTrack: "rgba(10, 14, 21, 0.72)",
  scrollbarThumb: "rgba(117, 133, 155, 0.5)",
  scrollbarThumbHover: "rgba(141, 157, 180, 0.64)",
  filterIconDefault: "rgba(151, 167, 189, 0.9)",
  filterIconActive: "#2aa8ff",
  filterIndicatorColor: "#2aa8ff",
  filterIndicatorBorderColor: "rgba(10, 14, 21, 0.95)",
  filterIndicatorSize: 6,
  sortIconDefault: "rgba(151, 167, 189, 0.9)",
  sortIconActive: "#2aa8ff",
  pinIconDefault: "rgba(151, 167, 189, 0.86)",
  pinIconActive: "#2aa8ff",
  pinIconDisabled: "rgba(122, 137, 156, 0.42)",
  focusOutline: "rgba(42, 170, 255, 0.94)",
  focusOutlineWidth: "2px",
  resizeHandleColor: "rgba(132, 149, 171, 0.36)",
  resizeHandleActiveColor: "rgba(42, 170, 255, 0.92)",
  resizeHandleShadow: "0 0 10px rgba(42, 170, 255, 0.2)",
  dragGhostBackground:
    "linear-gradient(165deg, rgba(22,28,40,0.94) 0%, rgba(16,21,31,0.92) 100%)",
  dragGhostBorder: "1px solid rgba(135, 153, 177, 0.28)",
  dragGhostShadow: "0 20px 48px rgba(0, 0, 0, 0.5)",
  successBackground: "rgba(61, 232, 161, 0.18)",
  successBorder: "rgba(61, 232, 161, 0.32)",
  successShadow: "0 8px 18px rgba(12, 72, 53, 0.14)",
  dangerBackground: "rgba(255, 106, 134, 0.18)",
  dangerBorder: "rgba(255, 106, 134, 0.34)",
  dangerShadow: "0 8px 18px rgba(99, 28, 45, 0.14)",
  warningBackground: "rgba(255, 179, 71, 0.18)",
  warningBorder: "rgba(255, 179, 71, 0.34)",
  warningShadow: "0 8px 18px rgba(99, 58, 18, 0.14)",
  infoBackground: "rgba(42, 170, 255, 0.18)",
  infoBorder: "rgba(42, 170, 255, 0.34)",
  infoShadow: "0 8px 18px rgba(17, 74, 132, 0.14)",
  formulaBarBackground: "rgba(20, 26, 37, 0.94)",
  formulaBarBorder: "rgba(129, 147, 171, 0.26)",
  formulaBarInputBorder: "rgba(131, 149, 173, 0.28)",
  formulaBarSelectionBadgeBackground: "rgba(17, 23, 34, 0.88)",
  formulaBarSelectionBadgeText: "#dfeaff",
  formulaBarShadow: "none",
  popupBackground: "rgba(17, 23, 34, 0.84)",
  popupBorder: "rgba(134, 152, 176, 0.28)",
  popupShadow: "0 20px 44px rgba(0, 0, 0, 0.42)",
  editorBackground: "rgba(17, 23, 34, 0.9)",
  editorBorder: "1px solid rgba(134, 152, 176, 0.3)",
  editorShadow: "0 24px 52px rgba(0, 0, 0, 0.46)",
  editorBackdropFilter: "blur(18px) saturate(128%)",
  contextMenuBackground: "rgba(16, 21, 31, 0.92)",
  contextMenuBorder: "1px solid rgba(134, 152, 176, 0.26)",
  contextMenuShadow: "0 20px 42px rgba(0, 0, 0, 0.44)",
  contextMenuDivider: "rgba(132, 149, 171, 0.2)",
  contextMenuText: "#e6f0ff",
  contextMenuTextMuted: "#9db1cb",
  contextMenuTextDisabled: "rgba(157, 177, 203, 0.42)",
  contextMenuShortcut: "#bfd4f2",
  contextMenuItemHoverBackground: "rgba(42, 170, 255, 0.14)",
  contextMenuItemActiveBackground: "rgba(42, 170, 255, 0.2)",
  chartBackground: "rgba(16, 21, 31, 0.9)",
  chartPlotBackground: "rgba(10, 14, 21, 0.58)",
  chartAxisColor: "rgba(148, 165, 188, 0.68)",
  chartGridColor: "rgba(132, 149, 171, 0.2)",
  chartLabelColor: "#bfd1e8",
  chartLegendText: "#e4efff",
  chartLegendMuted: "#92a8c2",
  chartTooltipBackground: "rgba(15, 20, 29, 0.96)",
  chartTooltipBorder: "1px solid rgba(136, 154, 178, 0.3)",
  chartTooltipShadow: "0 16px 30px rgba(0, 0, 0, 0.4)",
  chartHeatmapColor: "#2aa8ff",
  chartHeatmapMissing: "rgba(140, 154, 172, 0.2)",
  chartPalette: [
    "#2aa8ff",
    "#55d8ff",
    "#3de6a1",
    "#ffb347",
    "#b88cff",
    "#ff6a86",
    "#7af7d5",
    "#ffe27a",
  ],
} as const;

export const classicLightTheme: GridTheme = {
  name: "Classic Light",
  description: "Modern glass-meets-material aesthetic with luminous surfaces.",
  tokens: classicLightTokens,
  css: `
   [data-ace-grid-theme="classic-light"] .ace-grid__row-group--has-spans {outline: none;}
  `,
};

const dataThemeCss = `
  [data-ace-grid-theme="data"] .ace-grid,
  [data-ace-grid-theme="data"].ace-grid {
    border-radius: 0 !important;
    box-shadow: none !important;
    backdrop-filter: none !important;
  }
  [data-ace-grid-theme="data"].ace-grid__wrapper {
    border-radius: 0 !important;
    border: 0 !important;
  }

  [data-ace-grid-theme="data"] .ace-grid__header,
  [data-ace-grid-theme="data"] .ace-grid__header-row,
  [data-ace-grid-theme="data"] .ace-grid__floating-filter-row {
    background: var(--ace-grid-header-bg) !important;
    box-shadow: none !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }

  [data-ace-grid-theme="data"] .ace-grid__header-cell,
  [data-ace-grid-theme="data"] .ace-grid__header-group-cell,
  [data-ace-grid-theme="data"] .ace-grid__floating-filter-cell,
  [data-ace-grid-theme="data"] .ace-grid__cell,
  [data-ace-grid-theme="data"] .ace-grid__system-cell {
    border-radius: 0 !important;
    box-shadow: none !important;
  }

  [data-ace-grid-theme="data"] .ace-grid__header-segment--left,
  [data-ace-grid-theme="data"] .ace-grid__floating-filter-segment--left,
  [data-ace-grid-theme="data"] .ace-grid__row-group-pinned--left {
    box-shadow: none !important;
    border-right: 1px solid var(--ace-grid-header-border-color) !important;
  }

  [data-ace-grid-theme="data"] .ace-grid__header-segment--right,
  [data-ace-grid-theme="data"] .ace-grid__floating-filter-segment--right,
  [data-ace-grid-theme="data"] .ace-grid__row-group-pinned--right {
    box-shadow: none !important;
    border-left: 1px solid var(--ace-grid-header-border-color) !important;
  }

  [data-ace-grid-theme="data"] .ace-grid__sort-button,
  [data-ace-grid-theme="data"] .ace-grid__filter-trigger,
  [data-ace-grid-theme="data"] .ace-grid__pin-button,
  [data-ace-grid-theme="data"] .ace-grid__pagination-button,
  [data-ace-grid-theme="data"] .ace-grid__row-pin-button,
  [data-ace-grid-theme="data"] .ace-grid__row-detail-toggle-button,
  [data-ace-grid-theme="data"] .ace-grid__column-filter-button,
  [data-ace-grid-theme="data"] .ace-grid__json-editor-button,
  [data-ace-grid-theme="data"] .ace-grid__chart-action,
  [data-ace-grid-theme="data"] .ace-grid__chart-toggle-button,
  [data-ace-grid-theme="data"] .ace-grid__chart-settings-reset,
  [data-ace-grid-theme="data"] .ace-grid__context-menu-color-apply {
    border-radius: 2px !important;
    box-shadow: none !important;
  }

  [data-ace-grid-theme="data"] .ace-grid__floating-filter-input,
  [data-ace-grid-theme="data"] .ace-grid__floating-filter-select,
  [data-ace-grid-theme="data"] .ace-grid__column-filter-search,
  [data-ace-grid-theme="data"] .ace-grid__column-filter-input,
  [data-ace-grid-theme="data"] .ace-grid__column-filter-select,
  [data-ace-grid-theme="data"] .ace-grid__column-filter-range-input,
  [data-ace-grid-theme="data"] .ace-grid__pagination-select,
  [data-ace-grid-theme="data"] .ace-grid__chart-type-select,
  [data-ace-grid-theme="data"] .ace-grid__chart-grouping-select,
  [data-ace-grid-theme="data"] .ace-grid__chart-settings-select,
  [data-ace-grid-theme="data"] .ace-grid__chart-settings-input,
  [data-ace-grid-theme="data"] .ace-grid__cell-editor-select,
  [data-ace-grid-theme="data"] .ace-grid__cell-editor-input,
  [data-ace-grid-theme="data"] .ace-grid__cell-editor-textarea,
  [data-ace-grid-theme="data"] .ace-grid__formula-bar-input {
    border-radius: 2px !important;
    box-shadow: none !important;
    backdrop-filter: none !important;
  }

  [data-ace-grid-theme="data"] .ace-grid__formula-bar,
  [data-ace-grid-theme="data"] .ace-grid__column-filter,
  [data-ace-grid-theme="data"] .ace-grid__context-menu,
  [data-ace-grid-theme="data"] .ace-grid__json-editor,
  [data-ace-grid-theme="data"] .ace-grid__chart-panel {
    border-radius: 0 !important;
  }

  [data-ace-grid-theme="data"] .ace-grid__formula-bar {
    --ace-grid-formula-height: 36px;
    --ace-grid-formula-control-height: 26px;
    --ace-grid-formula-padding-y: 4px;
    min-height: 36px !important;
    padding: 4px 8px !important;
    gap: 6px !important;
    width: 100% !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
  }

  [data-ace-grid-theme="data"] .ace-grid__formula-bar-badge {
    min-width: 48px !important;
    height: 26px !important;
    border-radius: 2px !important;
    padding: 0 8px !important;
    font-size: 11px !important;
    flex: 0 0 auto !important;
  }

  [data-ace-grid-theme="data"] .ace-grid__formula-bar-input-wrap {
    flex: 1 1 auto !important;
    min-width: 0 !important;
    height: var(--ace-grid-formula-control-height, 26px) !important;
    min-height: var(--ace-grid-formula-control-height, 26px) !important;
    max-height: var(--ace-grid-formula-control-height, 26px) !important;
    border-radius: 2px !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
  }

  [data-ace-grid-theme="data"] .ace-grid__formula-bar-input {
    width: 100% !important;
    max-width: 100% !important;
    height: 100% !important;
    min-height: 0 !important;
    font-size: 13px !important;
    padding: 0 8px !important;
    box-sizing: border-box !important;
  }

  [data-ace-grid-theme="data"] .ace-grid__formula-suggestions {
    left: 0 !important;
    right: auto !important;
    z-index: 4500 !important;
    width: min(420px, 100%) !important;
    min-width: min(260px, 100%) !important;
    max-height: 220px !important;
    border-radius: 2px !important;
    overflow-x: hidden !important;
  }

  [data-ace-grid-theme="data"] {
    --ace-grid-validation-tooltip-bg: #ffffff;
    --ace-grid-validation-tooltip-text: #202124;
    --ace-grid-validation-tooltip-shadow: 0 10px 22px rgba(60, 64, 67, 0.22);
  }

  [data-ace-grid-theme="data"] .ace-grid__cell[data-validation-message]:hover::before,
  [data-ace-grid-theme="data"] .ace-grid__cell[data-validation-message]:focus-within::before,
  [data-ace-grid-theme="data"] .ace-grid__cell-editor[data-validation-message]:hover::before,
  [data-ace-grid-theme="data"] .ace-grid__cell-editor[data-validation-message]:focus-within::before {
    color: var(--ace-grid-validation-tooltip-text) !important;
    background: var(--ace-grid-validation-tooltip-bg) !important;
    border: 1px solid #dadce0 !important;
    border-left: 3px solid var(--ace-grid-validation-color, #d93025) !important;
    box-shadow: var(--ace-grid-validation-tooltip-shadow) !important;
    z-index: 3800;
  }

  [data-ace-grid-theme="data"] .ace-grid__fill-handle {
    border-radius: 0 !important;
  }

  [data-ace-grid-theme="data"] .ace-grid__row-group--has-spans {
    outline: none;
  }
`;

const dataDarkThemeCss = `
${dataThemeCss
  .split('data-ace-grid-theme="data"')
  .join('data-ace-grid-theme="data-dark"')}

  [data-ace-grid-theme="data-dark"] {
    --ace-grid-validation-tooltip-bg: #2b2c2f;
    --ace-grid-validation-tooltip-text: #e8eaed;
    --ace-grid-validation-tooltip-shadow: 0 10px 22px rgba(0, 0, 0, 0.45);
  }

  [data-ace-grid-theme="data-dark"] .ace-grid__formula-bar-input {
    background: #202124 !important;
    color: var(--ace-grid-text-primary) !important;
    border-color: var(--ace-grid-formula-input-border) !important;
  }

  [data-ace-grid-theme="data-dark"] .ace-grid__formula-bar-input::placeholder {
    color: var(--ace-grid-text-muted) !important;
  }

  [data-ace-grid-theme="data-dark"] .ace-grid__json-editor-textarea,
  [data-ace-grid-theme="data-dark"] .ace-grid__json-editor-preview {
    color: var(--ace-grid-text-primary) !important;
  }

  [data-ace-grid-theme="data-dark"] .ace-grid__json-editor-textarea::placeholder {
    color: var(--ace-grid-text-muted) !important;
  }

  [data-ace-grid-theme="data-dark"] .ace-grid__json-editor-close {
    color: var(--ace-grid-text-primary) !important;
    background: transparent !important;
    border-radius: 4px !important;
  }

  [data-ace-grid-theme="data-dark"] .ace-grid__json-editor-close:hover {
    color: var(--ace-grid-text-primary) !important;
    background: rgba(138, 180, 248, 0.16) !important;
  }

  [data-ace-grid-theme="data-dark"] .ace-grid__json-editor-close:focus-visible {
    outline: none !important;
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--ace-grid-focus-outline) 30%, transparent) !important;
  }

  [data-ace-grid-theme="data-dark"] .ace-grid__cell[data-validation-message]:hover::before,
  [data-ace-grid-theme="data-dark"] .ace-grid__cell[data-validation-message]:focus-within::before,
  [data-ace-grid-theme="data-dark"] .ace-grid__cell-editor[data-validation-message]:hover::before,
  [data-ace-grid-theme="data-dark"] .ace-grid__cell-editor[data-validation-message]:focus-within::before {
    color: var(--ace-grid-validation-tooltip-text) !important;
    background: var(--ace-grid-validation-tooltip-bg) !important;
    border: 1px solid #5f6368 !important;
    border-left: 3px solid var(--ace-grid-validation-color, #f28b82) !important;
    box-shadow: var(--ace-grid-validation-tooltip-shadow) !important;
    z-index: 3800;
  }
`;

export const dataTheme: GridTheme = {
  name: "Data",
  description:
    "Strict Google Sheets-inspired data theme with flat surfaces, precise gridlines, and clear blue selection states.",
  tokens: dataTokens,
  css: dataThemeCss,
};

export const dataDarkTheme: GridTheme = {
  name: "Data Dark",
  description:
    "Strict Google Sheets-inspired dark data theme with flat surfaces, sharp gridlines, and high-contrast blue selection states.",
  tokens: dataDarkTokens,
  css: dataDarkThemeCss,
};

export const classicDarkTheme: GridTheme = {
  name: "Classic Dark",
  description: "High-contrast dark theme tuned for low-light environments.",
  tokens: classicDarkTokens,
};

export const materialTheme: GridTheme = {
  name: "Material",
  description: "Material-inspired palette with bold primary accents.",
  tokens: materialTokens,
};

export const liquidGlassTheme: GridTheme = {
  name: "Liquid Glass",
  description:
    "Apple-inspired premium glass with precise spacing, neutral depth, and refined controls.",
  tokens: liquidGlassTokens,
  css: `
    @keyframes ace-grid-liquid-pulse {
      0%, 100% {
        transform: scale(1);
        opacity: 0.65;
      }
      50% {
        transform: scale(1.05);
        opacity: 0.95;
      }
    }
    @keyframes ace-grid-liquid-cell-loading {
      0% {
        background-position: 170% 0;
        opacity: 0.82;
      }
      45% {
        opacity: 0.98;
      }
      100% {
        background-position: -70% 0;
        opacity: 0.86;
      }
    }

    [data-ace-grid-theme="liquid-glass"] {
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
      --ace-grid-liquid-shell:
        linear-gradient(
          180deg,
          rgba(249, 251, 254, 0.96) 0%,
          rgba(241, 246, 252, 0.94) 100%
        );
      --ace-grid-liquid-panel:
        linear-gradient(
          180deg,
          rgba(255, 255, 255, 0.86) 0%,
          rgba(250, 252, 255, 0.8) 100%
        );
      --ace-grid-liquid-panel-strong:
        linear-gradient(
          180deg,
          rgba(255, 255, 255, 0.96) 0%,
          rgba(249, 252, 255, 0.9) 100%
        );
      --ace-grid-liquid-border: rgba(132, 147, 170, 0.3);
      --ace-grid-liquid-border-strong: rgba(117, 133, 157, 0.38);
      --ace-grid-liquid-edge: rgba(132, 147, 170, 0.3);
      --ace-grid-liquid-edge-soft: rgba(255, 255, 255, 0.66);
      --ace-grid-liquid-shadow:
        0 2px 6px rgba(34, 49, 72, 0.08),
        0 14px 34px rgba(58, 78, 108, 0.1);
      --ace-grid-liquid-overlay-bg:
        linear-gradient(
          180deg,
          rgba(252, 254, 255, 0.96) 0%,
          rgba(247, 251, 255, 0.94) 100%
        );
      --ace-grid-liquid-overlay-bg-solid:
        linear-gradient(
          180deg,
          rgba(253, 254, 255, 0.99) 0%,
          rgba(250, 252, 255, 0.98) 100%
        );
      --ace-grid-liquid-overlay-bg-strong:
        linear-gradient(
          180deg,
          rgba(253, 254, 255, 0.98) 0%,
          rgba(249, 252, 255, 0.96) 100%
        );
      --ace-grid-liquid-overlay-border: rgba(132, 148, 172, 0.36);
      --ace-grid-liquid-overlay-shadow:
        0 8px 20px rgba(42, 57, 82, 0.12),
        0 20px 42px rgba(62, 81, 107, 0.1);
      --ace-grid-liquid-overlay-backdrop: blur(8px) saturate(112%);
      --ace-grid-liquid-overlay-radius: 14px;
      --ace-grid-liquid-tooltip-backdrop: blur(8px) saturate(110%);
      --ace-grid-liquid-border-gloss-top: rgba(255, 255, 255, 0.86);
      --ace-grid-liquid-border-gloss-bottom: rgba(160, 178, 204, 0.22);
      --ace-grid-liquid-hairline: rgba(146, 163, 187, 0.07);
      --ace-grid-liquid-hairline-strong: rgba(132, 148, 172, 0.1);
      --ace-grid-liquid-gridline: 1px solid var(--ace-grid-liquid-hairline);
      --ace-grid-liquid-header-band-bg: rgba(244, 248, 253, 0.98);
      --ace-grid-formula-bg: var(--ace-grid-liquid-header-band-bg);
      --ace-grid-formula-badge-bg: var(--ace-grid-liquid-header-band-bg);
      --ace-grid-cell-border-color: var(--ace-grid-liquid-hairline);
      --ace-grid-cell-border-color-alt: var(--ace-grid-liquid-hairline);
      --ace-grid-cell-border-top-color: var(--ace-grid-liquid-hairline);
      --ace-grid-cell-border-right-color: transparent;
      --ace-grid-cell-border-bottom-color: var(--ace-grid-liquid-hairline);
      --ace-grid-cell-border-left-color: transparent;
      --ace-grid-header-border-color: var(--ace-grid-liquid-hairline);
      --ace-grid-liquid-button-bg:
        linear-gradient(
          180deg,
          rgba(255, 255, 255, 0.92) 0%,
          rgba(247, 251, 255, 0.88) 100%
        );
      --ace-grid-liquid-button-bg-active:
        linear-gradient(
          180deg,
          rgba(60, 162, 255, 0.96) 0%,
          rgba(10, 132, 255, 0.94) 100%
        );
      --ace-grid-liquid-button-border: rgba(135, 152, 176, 0.4);
      --ace-grid-liquid-button-border-active: rgba(13, 120, 229, 0.86);
      --ace-grid-liquid-button-shadow:
        0 1px 1px rgba(43, 63, 90, 0.05),
        0 3px 8px rgba(53, 75, 106, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.86);
      --ace-grid-liquid-button-shadow-hover:
        0 2px 3px rgba(43, 63, 90, 0.08),
        0 6px 14px rgba(53, 75, 106, 0.12),
        inset 0 1px 0 rgba(255, 255, 255, 0.92);
      --ace-grid-liquid-button-shadow-active:
        0 1px 1px rgba(7, 66, 139, 0.14),
        0 5px 11px rgba(10, 104, 199, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.3);
      --ace-grid-pinned-row-top-bg: rgba(248, 252, 255, 0.985);
      --ace-grid-pinned-row-bottom-bg: rgba(248, 252, 255, 0.985);
      --ace-grid-pinned-row-top-shadow:
        inset 0 -1px 0 rgba(132, 149, 173, 0.24),
        0 4px 10px rgba(48, 65, 92, 0.08);
      --ace-grid-pinned-row-bottom-shadow:
        inset 0 1px 0 rgba(132, 149, 173, 0.24),
        0 -4px 10px rgba(48, 65, 92, 0.08);
      --ace-grid-validation-tooltip-bg:
        linear-gradient(
          180deg,
          rgba(252, 254, 255, 0.99) 0%,
          rgba(247, 251, 255, 0.97) 100%
        );
      --ace-grid-validation-tooltip-text: #1f2d42;
      --ace-grid-validation-tooltip-shadow:
        0 10px 22px rgba(42, 57, 82, 0.18),
        0 20px 42px rgba(62, 81, 107, 0.12);
      --ace-grid-liquid-ease: cubic-bezier(0.22, 1, 0.36, 1);
      --ace-grid-liquid-press: translateY(1px) scale(0.992);
      /* Native date/time icon tokens (override these vars to customize icons). */
      --ace-grid-liquid-date-icon: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22none%22%20d%3D%22M0%200h24v24H0z%22%2F%3E%3Cpath%20fill%3D%22black%22%20d%3D%22M9%2011H7v2h2v-2zm4%200h-2v2h2v-2zm4%200h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11%200-1.99.9-1.99%202L3%2020a2%202%200%200%200%202%202h14c1.1%200%202-.9%202-2V6c0-1.1-.9-2-2-2zm0%2016H5V9h14v11z%22%2F%3E%3C%2Fsvg%3E");
      --ace-grid-liquid-time-icon: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20512%20512%22%3E%3Cg%20fill%3D%22black%22%20fill-opacity%3D%22.9%22%3E%3Cpath%20d%3D%22M255.8%2048C141%2048%2048%20141.2%2048%20256s93%20208%20207.8%20208c115%200%20208.2-93.2%20208.2-208S370.8%2048%20255.8%2048zm.2%20374.4c-91.9%200-166.4-74.5-166.4-166.4S164.1%2089.6%20256%2089.6%20422.4%20164.1%20422.4%20256%20347.9%20422.4%20256%20422.4z%22%2F%3E%3Cpath%20d%3D%22M266.4%20152h-31.2v124.8l109.2%2065.5%2015.6-25.6-93.6-55.5V152z%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E");
      --ace-grid-liquid-datetime-icon: var(--ace-grid-liquid-date-icon);
      --ace-grid-liquid-picker-icon-color: rgba(58, 77, 104, 0.88);
      --ace-grid-liquid-picker-icon-color-hover: #0a84ff;
      --ace-grid-row-detail-bg:
        linear-gradient(
          180deg,
          rgba(244, 249, 255, 0.97) 0%,
          rgba(236, 243, 251, 0.95) 100%
        );
      --ace-grid-row-detail-border-top: rgba(132, 148, 172, 0.28);
      --ace-grid-row-detail-gutter: 8px 10px 10px;
      --ace-grid-row-detail-padding: 14px 16px;
      --ace-grid-row-detail-inner-bg:
        linear-gradient(
          180deg,
          rgba(248, 252, 255, 0.8) 0%,
          rgba(241, 247, 255, 0.72) 100%
        );
      --ace-grid-row-detail-inner-border: 1px solid rgba(132, 148, 172, 0.22);
      --ace-grid-row-detail-inner-radius: 14px;
      --ace-grid-row-detail-inner-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.68);
      --ace-grid-row-detail-shadow: none;
      --ace-grid-row-detail-backdrop: none;
      --ace-grid-fill-handle-size: 12px;
      --ace-grid-fill-handle-radius: 999px;
      --ace-grid-fill-handle-offset: -5px;
      --ace-grid-fill-handle-border-width: 1px;
      --ace-grid-fill-handle-border: rgba(255, 255, 255, 0.96);
      --ace-grid-fill-handle-bg: var(--ace-grid-selection-border);
      --ace-grid-fill-handle-bg-hover: color-mix(
        in srgb,
        var(--ace-grid-selection-border) 86%,
        #ffffff 14%
      );
      --ace-grid-fill-handle-inner: 2px;
      --ace-grid-fill-handle-inner-border: 1px solid rgba(255, 255, 255, 0.5);
      --ace-grid-fill-handle-shadow:
        0 3px 8px rgba(39, 112, 201, 0.22),
        0 0 0 1px rgba(10, 132, 255, 0.24);
    }

    [data-ace-grid-theme="liquid-glass"].ace-grid__wrapper {
      position: relative;
      isolation: isolate;
      /* Allow formula autocomplete popover to escape the input wrap. */
      overflow: hidden;
      border-radius: 22px;
      border: 1px solid rgba(255, 255, 255, 0.44);
      background:
        linear-gradient(
          180deg,
          rgba(255, 255, 255, 0.22) 0%,
          rgba(246, 251, 255, 0.18) 100%
        ),
        linear-gradient(
          145deg,
          rgba(255, 255, 255, 0.2) 0%,
          rgba(216, 227, 243, 0.16) 100%
        );
      box-shadow:
        0 10px 32px rgba(34, 52, 81, 0.12),
        0 2px 8px rgba(34, 52, 81, 0.06),
        inset 0 1px 0 rgba(255, 255, 255, 0.76),
        inset 0 -1px 0 rgba(145, 162, 185, 0.2);
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
    }
    [data-ace-grid-theme="liquid-glass"].ace-grid__wrapper::before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: inherit;
      pointer-events: none;
      z-index: 0;
      background: linear-gradient(
        132deg,
        rgba(255, 255, 255, 0.34) 7%,
        rgba(255, 255, 255, 0.12) 31%,
        rgba(255, 255, 255, 0.02) 54%,
        rgba(255, 255, 255, 0) 72%
      );
    }
    [data-ace-grid-theme="liquid-glass"].ace-grid__wrapper::after {
      content: "";
      position: absolute;
      inset: 1px;
      border-radius: 21px;
      pointer-events: none;
      z-index: 0;
      border: 1px solid rgba(255, 255, 255, 0.34);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.28);
    }
    [data-ace-grid-theme="liquid-glass"].ace-grid__wrapper > * {
      position: relative;
      z-index: 1;
    }

    [data-ace-grid-theme="liquid-glass"].ace-grid__wrapper > .ace-grid__formula-bar {
      margin: 0 !important;
      padding: 4px 10px 4px !important;
      border: 0 !important;
      border-bottom: 0 !important;
      border-radius: 0 !important;
      z-index: 1200;
      overflow: visible;
      background: var(--ace-grid-liquid-header-band-bg) !important;
      box-shadow: none !important;
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
    }
    [data-ace-grid-theme="liquid-glass"].ace-grid__wrapper > .ace-grid__pagination {
      margin: 0 !important;
      border: 0 !important;
      border-top: 1px solid var(--ace-grid-liquid-hairline-strong) !important;
      border-radius: 0 !important;
      background:
        linear-gradient(
          180deg,
          rgba(250, 253, 255, 0.72) 0%,
          rgba(246, 250, 255, 0.66) 100%
        ) !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.74) !important;
    }

    .ace-grid[data-ace-grid-theme="liquid-glass"] {
      position: relative;
      isolation: isolate;
      border: 0 !important;
      border-radius: 0 !important;
      background: var(--ace-grid-liquid-panel);
      box-shadow: none !important;
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
    }
    .ace-grid[data-ace-grid-theme="liquid-glass"]::before {
      content: none;
    }
    .ace-grid[data-ace-grid-theme="liquid-glass"] > * {
      position: relative;
      z-index: 3;
    }

    [data-ace-grid-theme="liquid-glass"] .ace-grid {
      scrollbar-color: rgba(105, 120, 143, 0.72) transparent;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid::-webkit-scrollbar-track,
    [data-ace-grid-theme="liquid-glass"] .ace-grid::-webkit-scrollbar-corner {
      background: transparent;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid::-webkit-scrollbar-thumb {
      border: 2px solid transparent;
      background-clip: padding-box;
      background: linear-gradient(
        180deg,
        rgba(118, 133, 156, 0.74) 0%,
        rgba(104, 119, 142, 0.64) 100%
      );
      border-radius: 999px;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.34);
      transition: background 0.16s ease, box-shadow 0.16s ease;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(
        180deg,
        rgba(106, 121, 143, 0.9) 0%,
        rgba(92, 107, 130, 0.8) 100%
      );
    }

    [data-ace-grid-theme="liquid-glass"] .ace-grid__header {
      background: var(--ace-grid-liquid-header-band-bg);
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-row,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__floating-filter-row {
      background: var(--ace-grid-liquid-header-band-bg);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header {
      border-top: 0 !important;
      box-shadow: none !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-row:first-child {
      border-top: 0 !important;
      box-shadow: none !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-row:first-child .ace-grid__header-cell,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-row:first-child .ace-grid__header-group-cell {
      border-top: 0 !important;
      border-top-width: 0 !important;
      border-top-color: transparent !important;
      box-shadow: none !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-row {
      position: relative;
      z-index: 2;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-row--filter-open {
      z-index: 3600;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-cell--filter-open {
      z-index: 3601;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-row {
      border-bottom: 0;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-cell,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-group-cell {
      background: var(--ace-grid-liquid-header-band-bg);
      box-shadow: none;
      border-right: var(--ace-grid-liquid-gridline) !important;
      border-left: 0 !important;
      border-bottom-color: var(--ace-grid-liquid-hairline);
      transition:
        background 0.16s var(--ace-grid-liquid-ease),
        box-shadow 0.16s var(--ace-grid-liquid-ease);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-segment .ace-grid__header-cell:first-child,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-segment .ace-grid__header-group-cell:first-child {
      border-left: var(--ace-grid-liquid-gridline) !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-cell:hover,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-group-cell:hover {
      background: rgba(250, 253, 255, 0.92);
      box-shadow: none;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-cell--system {
      border-right-color: transparent !important;
      border-left-color: transparent !important;
      box-shadow: none !important;
      background: #f4f8fd !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-segment .ace-grid__header-cell--system:first-child {
      border-left-color: transparent !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-cell--system + .ace-grid__header-cell:not(.ace-grid__header-cell--system),
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-cell--system + .ace-grid__header-group-cell {
      border-left: var(--ace-grid-liquid-hairline) !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-cell--system-boundary {
      border-right-color: var(--ace-grid-liquid-hairline-strong) !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-cell {
      border-bottom: 0 !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-cell-title,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-group-label-text {
      text-shadow: 0 1px 0 rgba(255, 255, 255, 0.7);
      letter-spacing: 0.002em;
      font-weight: 550;
      color: #1f2a3c;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-segment--left,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__floating-filter-segment--left {
      background: #f4f8fd;
      box-shadow: none;
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-segment--right,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__floating-filter-segment--right {
      background: #f4f8fd;
      box-shadow: none;
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-segment--left,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__floating-filter-segment--left {
      border-right: 1px solid var(--ace-grid-liquid-hairline-strong) !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-segment--right,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__floating-filter-segment--right {
      border-left: 1px solid var(--ace-grid-liquid-hairline-strong) !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-segment--left {
      box-shadow: var(--ace-grid-pinned-shadow-left-edge) !important;
      clip-path: inset(0 calc(-1 * var(--ace-grid-pinned-edge-shadow-bleed, 14px)) 0 0);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-segment--right {
      box-shadow: var(--ace-grid-pinned-shadow-right-edge) !important;
      clip-path: inset(0 0 0 calc(-1 * var(--ace-grid-pinned-edge-shadow-bleed, 14px)));
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__floating-filter-segment--left,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__floating-filter-segment--right {
      box-shadow: none !important;
      clip-path: none;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-group-pinned,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-group-pinned-grid--left,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-group-pinned-grid--right {
      background: var(--ace-grid-pinned-row-top-bg) !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-cell-content {
      gap: 8px !important;
      padding-inline: 0 6px;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-cell-content--system {
      padding-inline: 0 !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-group-label {
      padding-inline: 0 6px;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-cell-actions {
      gap: 4px !important;
      padding-right: 2px;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__sort-button,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__filter-trigger,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-group-toggle,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__pin-button,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-pin-button,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-detail-toggle-button,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__pagination-button {
      border: none !important;
      border-radius: 0 !important;
      background: transparent !important;
      min-width: 18px;
      min-height: 18px;
      width: 18px;
      height: 18px;
      padding: 0 !important;
      display: inline-flex !important;
      align-items: center;
      justify-content: center;
      box-shadow: none !important;
      color: var(--ace-grid-text-muted);
      opacity: 0.88;
      transition:
        color 0.14s var(--ace-grid-liquid-ease),
        opacity 0.14s var(--ace-grid-liquid-ease),
        transform 0.14s var(--ace-grid-liquid-ease);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__sort-button:hover,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__filter-trigger:hover,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-group-toggle:hover,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__pin-button:hover,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-pin-button:hover,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-detail-toggle-button:hover,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__pagination-button:hover {
      border-color: transparent !important;
      box-shadow: none !important;
      background: transparent !important;
      color: #0a84ff !important;
      opacity: 1;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__sort-button:focus-visible,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__filter-trigger:focus-visible,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-group-toggle:focus-visible,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__pin-button:focus-visible,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-pin-button:focus-visible,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-detail-toggle-button:focus-visible,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__pagination-button:focus-visible {
      outline: var(--ace-grid-focus-outline-width, 2px) solid var(--ace-grid-focus-outline);
      outline-offset: 2px;
      border-radius: 6px;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__sort-order {
      font-weight: 700;
      color: #0a84ff !important;
    }

    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-group,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__infinite-scroll-row {
      background: rgba(255, 255, 255, 0.56);
      transition: background 0.14s var(--ace-grid-liquid-ease);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-group:nth-child(2n) {
      background: rgba(252, 253, 255, 0.64);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-group:hover {
      background: rgba(248, 251, 255, 0.62);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-group--has-spans:hover {
      background: rgba(255, 255, 255, 0.58);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-group:nth-child(2n).ace-grid__row-group--has-spans:hover {
      background: rgba(252, 253, 255, 0.64);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-hover-overlay {
      --ace-grid-row-hover-overlay-bg: linear-gradient(
        180deg,
        rgba(222, 238, 255, 0.52),
        rgba(208, 230, 255, 0.36)
      );
      --ace-grid-row-hover-overlay-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.68),
        inset 0 -1px 0 rgba(163, 191, 226, 0.36);
      --ace-grid-row-hover-overlay-opacity: 1;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-group--has-spans {
      outline: none;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__cell {
      background: var(--ace-grid-cell-bg, rgba(255, 255, 255, 0.66));
      border-right-color: var(--ace-grid-liquid-hairline);
      border-bottom-color: var(--ace-grid-liquid-hairline);
      transition: background 0.12s var(--ace-grid-liquid-ease);
      font-variant-numeric: tabular-nums;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__cell-loading-bar {
      background: linear-gradient(
        90deg,
        rgba(179, 192, 212, 0.42) 0%,
        rgba(208, 223, 245, 0.84) 50%,
        rgba(179, 192, 212, 0.42) 100%
      );
      background-size: 210% 100%;
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.74),
        inset 0 0 0 1px rgba(138, 157, 184, 0.2);
      opacity: 0.98;
      animation: ace-grid-liquid-cell-loading 1.02s cubic-bezier(0.38, 0.08, 0.2, 0.98) infinite;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__cell:hover:not(.ace-grid__cell--selected) {
      background: color-mix(
        in srgb,
        var(--ace-grid-cell-bg, rgba(255, 255, 255, 0.66)) 72%,
        rgba(255, 255, 255, 0.99) 28%
      );
      box-shadow:
        var(--ace-grid-cell-shadow, 0 0 0 rgba(0, 0, 0, 0)),
        inset 0 0 0 1px rgba(122, 170, 234, 0.34),
        inset 0 1px 0 rgba(255, 255, 255, 0.78),
        inset 0 -1px 0 rgba(176, 197, 224, 0.3),
        0 1px 4px rgba(88, 126, 178, 0.08);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__cell.ace-grid__cell--validation-highlight,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__cell-editor.ace-grid__cell--validation-highlight {
      box-shadow: var(--ace-grid-cell-shadow, 0 0 0 rgba(0, 0, 0, 0)) !important;
      outline: 1px solid var(--ace-grid-validation-color);
      outline-offset: -1px;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__cell--selected {
      background: var(--ace-grid-cell-bg-selected);
      background: color-mix(
        in srgb,
        var(--ace-grid-cell-bg, rgba(255, 255, 255, 0.66)) 64%,
        var(--ace-grid-cell-bg-selected) 36%
      );
      box-shadow:
        var(--ace-grid-cell-shadow, 0 0 0 rgba(0, 0, 0, 0)),
        inset 0 0 0 1px rgba(10, 132, 255, 0.82),
        0 2px 8px rgba(34, 109, 200, 0.14);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__fill-handle,
    [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__fill-handle {
      backdrop-filter: blur(6px) saturate(124%);
      -webkit-backdrop-filter: blur(6px) saturate(124%);
      transition:
        background-color 0.14s var(--ace-grid-liquid-ease),
        box-shadow 0.14s var(--ace-grid-liquid-ease);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__virtual-spacer {
      --ace-grid-spacer-bg: var(--ace-grid-cell-bg, rgba(255, 255, 255, 0.66));
      --ace-grid-spacer-border: var(--ace-grid-liquid-hairline);
      background-color: var(--ace-grid-spacer-bg);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__offset-cell {
      --ace-grid-offset-bg: var(--ace-grid-cell-bg, rgba(255, 255, 255, 0.66));
      --ace-grid-offset-border: var(--ace-grid-liquid-hairline);
      --ace-grid-offset-edge-shadow: none;
      background-color: var(--ace-grid-offset-bg);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__offset-cell--header {
      --ace-grid-offset-bg: var(--ace-grid-liquid-header-band-bg);
      --ace-grid-offset-border: var(--ace-grid-liquid-hairline);
    }

    [data-ace-grid-theme="liquid-glass"] .ace-grid__floating-filter-row {
      position: relative;
      z-index: 3;
      border-bottom: 1px solid var(--ace-grid-liquid-hairline);
      background: var(--ace-grid-liquid-header-band-bg) !important;
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__floating-filter-cell {
      background: var(--ace-grid-liquid-header-band-bg) !important;
      border-right: var(--ace-grid-liquid-gridline) !important;
      border-left: 0 !important;
      border-bottom: 0 !important;
      padding: 4px 8px !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__floating-filter-cell:first-child {
      border-left: var(--ace-grid-liquid-gridline) !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__floating-filter-cell--system {
      background: #f4f8fd !important;
      border-right-color: transparent !important;
      border-left-color: transparent !important;
      padding: 4px 8px !important;
      box-shadow: none !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__floating-filter-cell--system:first-child {
      border-left-color: transparent !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__floating-filter-cell--system + .ace-grid__floating-filter-cell:not(.ace-grid__floating-filter-cell--system) {
      border-left: var(--ace-grid-liquid-hairline) !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__floating-filter-cell--system-boundary {
      border-right-color: var(--ace-grid-liquid-hairline-strong) !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__floating-filter-cell--disabled {
      padding: 4px 8px !important;
    }

    [data-ace-grid-theme="liquid-glass"] .ace-grid__floating-filter-input,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__floating-filter-select,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter-search,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter-input,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter-select,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter-range-input,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__pagination-select,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-type-select,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-grouping-select,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-settings-select,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-settings-input,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__cell-editor-select {
      height: 27px;
      padding: 0 8px;
      border-radius: 8px;
      border: 1px solid rgba(136, 152, 175, 0.34);
      background: rgba(255, 255, 255, 0.985);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.74);
      transition:
        border-color 0.16s var(--ace-grid-liquid-ease),
        box-shadow 0.16s var(--ace-grid-liquid-ease),
        background 0.16s var(--ace-grid-liquid-ease);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__floating-filter-input,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__floating-filter-select {
      height: clamp(20px, calc(100% - 8px), 24px) !important;
      min-height: 20px;
      max-height: 24px;
      padding: 0 10px !important;
      line-height: 1.2;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__floating-filter-select,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter-select,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-type-select,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-grouping-select,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-settings-select,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__cell-editor-select {
      appearance: none !important;
      -webkit-appearance: none !important;
      background-image: url("data:image/svg+xml,%3Csvg%20viewBox%3D%270%200%2016%2016%27%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20fill%3D%27none%27%20stroke%3D%27%236b7d96%27%20stroke-width%3D%272%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%3E%3Cpath%20d%3D%27M4.75%206.5%208%209.75%2011.25%206.5%27/%3E%3C/svg%3E") !important;
      background-repeat: no-repeat !important;
      background-size: 16px 16px !important;
      background-position: right 10px center !important;
      padding-right: 32px !important;
      line-height: normal !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__floating-filter-select {
      background-position: right 8px center !important;
      padding-right: 30px !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__pagination-select-wrap {
      align-items: center;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__pagination-caret {
      right: 10px !important;
      top: 50% !important;
      width: 16px !important;
      height: 16px !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      transform: translateY(-50%) !important;
      color: #6b7d96 !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__pagination-caret svg {
      display: block;
      width: 16px;
      height: 16px;
      stroke-width: 2;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__formula-bar {
      position: relative;
      z-index: 4200;
      isolation: isolate;
      overflow: visible;
      gap: 8px !important;
      min-height: 34px;
      background: var(--ace-grid-liquid-header-band-bg) !important;
      box-shadow: none !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__formula-bar-input-wrap {
      position: relative;
      z-index: 1;
      border-radius: 10px;
      border: 1px solid #d8e2ef;
      background: #fdfefe;
      box-shadow:
        inset 0 1px 2px rgba(43, 64, 96, 0.04),
        inset 0 0 0 1px rgba(255, 255, 255, 0.6);
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      overflow: visible;
      padding: 0;
      transition:
        border-color 0.18s var(--ace-grid-liquid-ease),
        box-shadow 0.18s var(--ace-grid-liquid-ease),
        background 0.18s var(--ace-grid-liquid-ease);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__formula-bar-input-wrap::before {
      content: none;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__formula-bar-input-wrap:hover {
      border-color: #d4dfed;
      background: #ffffff;
      box-shadow:
        inset 0 1px 2px rgba(43, 64, 96, 0.05),
        inset 0 0 0 1px rgba(255, 255, 255, 0.66);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__floating-filter-input:focus,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__floating-filter-select:focus,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter-search:focus,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter-input:focus,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter-select:focus,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter-range-input:focus,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__pagination-select:focus,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-type-select:focus,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-grouping-select:focus,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-settings-select:focus,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-settings-input:focus,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__cell-editor-select:focus {
      outline: var(--ace-grid-focus-outline-width, 2px) solid var(--ace-grid-focus-outline);
      outline-offset: 1px;
      border-color: rgba(10, 132, 255, 0.7);
      box-shadow:
        0 0 0 3px rgba(10, 132, 255, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.9);
    }

    /* Native date/time controls (best-effort browser support). */
    [data-ace-grid-theme="liquid-glass"] :is(
        .ace-grid__floating-filter-input,
        .ace-grid__column-filter-input,
        .ace-grid__column-filter-range-input,
        .ace-grid__chart-settings-input,
        .ace-grid__cell-editor-input
      ):is([type="date"], [type="time"], [type="datetime-local"]) {
      color-scheme: light;
      font-variant-numeric: tabular-nums;
      letter-spacing: 0.01em;
      padding-inline-end: 32px !important;
      --ace-grid-liquid-picker-icon-mask: var(--ace-grid-liquid-date-icon);
    }
    [data-ace-grid-theme="liquid-glass"] :is(
        .ace-grid__floating-filter-input,
        .ace-grid__column-filter-input,
        .ace-grid__column-filter-range-input,
        .ace-grid__chart-settings-input,
        .ace-grid__cell-editor-input
      ):is([type="date"], [type="time"], [type="datetime-local"])::-webkit-datetime-edit {
      color: #233249;
    }
    [data-ace-grid-theme="liquid-glass"] :is(
        .ace-grid__floating-filter-input,
        .ace-grid__column-filter-input,
        .ace-grid__column-filter-range-input,
        .ace-grid__chart-settings-input,
        .ace-grid__cell-editor-input
      )[type="date"]::-webkit-calendar-picker-indicator {
      --ace-grid-liquid-picker-icon-mask: var(--ace-grid-liquid-date-icon);
    }
    [data-ace-grid-theme="liquid-glass"] :is(
        .ace-grid__floating-filter-input,
        .ace-grid__column-filter-input,
        .ace-grid__column-filter-range-input,
        .ace-grid__chart-settings-input,
        .ace-grid__cell-editor-input
      )[type="time"]::-webkit-calendar-picker-indicator {
      --ace-grid-liquid-picker-icon-mask: var(--ace-grid-liquid-time-icon);
    }
    [data-ace-grid-theme="liquid-glass"] :is(
        .ace-grid__floating-filter-input,
        .ace-grid__column-filter-input,
        .ace-grid__column-filter-range-input,
        .ace-grid__chart-settings-input,
        .ace-grid__cell-editor-input
      )[type="datetime-local"]::-webkit-calendar-picker-indicator {
      --ace-grid-liquid-picker-icon-mask: var(--ace-grid-liquid-datetime-icon);
    }
    [data-ace-grid-theme="liquid-glass"] :is(
        .ace-grid__floating-filter-input,
        .ace-grid__column-filter-input,
        .ace-grid__column-filter-range-input,
        .ace-grid__chart-settings-input,
        .ace-grid__cell-editor-input
      ):is([type="date"], [type="time"], [type="datetime-local"])::-webkit-calendar-picker-indicator {
      -webkit-appearance: none;
      appearance: none;
      width: 16px;
      min-width: 16px;
      height: 16px;
      margin-inline-start: 6px;
      padding: 0;
      border: 0;
      border-radius: 0;
      background-color: var(--ace-grid-liquid-picker-icon-color);
      background-image: none;
      box-shadow: none;
      -webkit-mask-image: var(--ace-grid-liquid-picker-icon-mask);
      -webkit-mask-repeat: no-repeat;
      -webkit-mask-position: center;
      -webkit-mask-size: 16px 16px;
      mask-image: var(--ace-grid-liquid-picker-icon-mask);
      mask-repeat: no-repeat;
      mask-position: center;
      mask-size: 16px 16px;
      color: transparent;
      opacity: 0.96;
      cursor: pointer;
    }
    [data-ace-grid-theme="liquid-glass"] :is(
        .ace-grid__floating-filter-input,
        .ace-grid__column-filter-input,
        .ace-grid__column-filter-range-input,
        .ace-grid__chart-settings-input,
        .ace-grid__cell-editor-input
      ):is([type="date"], [type="time"], [type="datetime-local"])::-webkit-calendar-picker-indicator:hover {
      background-color: var(--ace-grid-liquid-picker-icon-color-hover);
      opacity: 1;
    }
    [data-ace-grid-theme="liquid-glass"] :is(
        .ace-grid__floating-filter-input,
        .ace-grid__column-filter-input,
        .ace-grid__column-filter-range-input,
        .ace-grid__chart-settings-input,
        .ace-grid__cell-editor-input
      ):is([type="date"], [type="time"], [type="datetime-local"]):focus::-webkit-calendar-picker-indicator {
      background-color: var(--ace-grid-liquid-picker-icon-color-hover);
      opacity: 1;
    }
    [data-ace-grid-theme="liquid-glass"] :is(
        .ace-grid__floating-filter-input,
        .ace-grid__column-filter-input,
        .ace-grid__column-filter-range-input,
        .ace-grid__chart-settings-input,
        .ace-grid__cell-editor-input
      ):is([type="date"], [type="time"], [type="datetime-local"])::-webkit-clear-button,
    [data-ace-grid-theme="liquid-glass"] :is(
        .ace-grid__floating-filter-input,
        .ace-grid__column-filter-input,
        .ace-grid__column-filter-range-input,
        .ace-grid__chart-settings-input,
        .ace-grid__cell-editor-input
      ):is([type="date"], [type="time"], [type="datetime-local"])::-webkit-inner-spin-button {
      opacity: 0.55;
    }

    [data-ace-grid-theme="liquid-glass"] .ace-grid__formula-bar-input {
      position: relative;
      z-index: 1;
      height: 30px !important;
      line-height: 30px;
      padding: 0 10px !important;
      border: 0 !important;
      border-radius: 10px !important;
      background: transparent !important;
      box-shadow: none !important;
      color: #233249;
      font-size: 12px !important;
      font-weight: 560;
      letter-spacing: 0.008em;
      text-shadow: none;
      caret-color: #0a84ff;
      transition: color 0.16s var(--ace-grid-liquid-ease);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__formula-bar-input::placeholder {
      color: rgba(74, 93, 122, 0.72);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__formula-bar-input-wrap:focus-within {
      z-index: 4300;
      border-color: rgba(10, 132, 255, 0.64);
      background: #ffffff;
      box-shadow:
        inset 0 0 0 1px rgba(10, 132, 255, 0.7),
        inset 0 1px 0 rgba(255, 255, 255, 0.9),
        0 1px 2px rgba(43, 64, 96, 0.1);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__formula-bar-input:focus {
      outline: none !important;
      box-shadow: none !important;
    }

    [data-ace-grid-theme="liquid-glass"] .ace-grid__formula-bar-badge {
      min-width: 54px !important;
      height: 30px !important;
      border-radius: 10px !important;
      border: 1px solid #d8e2ef !important;
      background: #fdfefe !important;
      box-shadow:
        inset 0 1px 2px rgba(43, 64, 96, 0.04),
        inset 0 0 0 1px rgba(255, 255, 255, 0.6) !important;
      color: #3b4f6d;
      padding: 0 9px !important;
      line-height: 30px !important;
      font-size: 11px !important;
      font-weight: 640 !important;
      letter-spacing: 0.015em !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__formula-suggestions,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__context-menu,
    [data-ace-grid-theme="liquid-glass"].ace-grid__context-menu,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-panel,
    [data-ace-grid-theme="liquid-glass"].ace-grid__chart-panel,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__json-editor,
    [data-ace-grid-theme="liquid-glass"].ace-grid__json-editor,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__sparkline-tooltip,
    [data-ace-grid-theme="liquid-glass"].ace-grid__sparkline-tooltip,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-tooltip {
      border-radius: var(--ace-grid-liquid-overlay-radius);
      border: 1px solid var(--ace-grid-liquid-overlay-border) !important;
      background: var(--ace-grid-liquid-overlay-bg-solid) !important;
      box-shadow:
        var(--ace-grid-liquid-overlay-shadow),
        inset 0 1px 0 var(--ace-grid-liquid-border-gloss-top) !important;
      backdrop-filter: var(--ace-grid-liquid-overlay-backdrop);
      -webkit-backdrop-filter: var(--ace-grid-liquid-overlay-backdrop);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-cell,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-group-cell,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__floating-filter-cell,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__cell,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__context-menu,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-panel,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__json-editor,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__formula-suggestions,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__formula-bar,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__pagination,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-toolbar,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-settings,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-legend,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-zoom,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__json-editor-header,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__json-editor-footer {
      border-color: var(--ace-grid-liquid-overlay-border);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__formula-suggestions {
      border-radius: 12px;
      z-index: 4500 !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__cell[data-validation-message]:hover::before,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__cell[data-validation-message]:focus-within::before,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__cell-editor[data-validation-message]:hover::before,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__cell-editor[data-validation-message]:focus-within::before {
      color: var(--ace-grid-validation-tooltip-text) !important;
      background: var(--ace-grid-validation-tooltip-bg) !important;
      border: 1px solid rgba(127, 143, 167, 0.44);
      border-left: 3px solid var(--ace-grid-validation-color, #ef4444);
      box-shadow: var(--ace-grid-validation-tooltip-shadow) !important;
      z-index: 3800;
      text-shadow: none;
      backdrop-filter: blur(6px) saturate(106%);
      -webkit-backdrop-filter: blur(6px) saturate(106%);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__formula-suggestion {
      margin: 0 6px;
      border-radius: 10px;
      transition: background 0.16s var(--ace-grid-liquid-ease);
    }

    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter {
      z-index: 3600 !important;
      margin-top: 0;
      transform: translateY(-1px);
      position: relative;
      overflow: hidden;
      min-width: 252px !important;
      max-width: min(336px, 90vw) !important;
      border-radius: 14px !important;
      padding: 10px !important;
      background: #f7faff !important;
      border: 1px solid #d7e0ec !important;
      box-shadow:
        0 12px 28px rgba(42, 60, 92, 0.18),
        0 3px 9px rgba(42, 60, 92, 0.07),
        inset 0 1px 0 rgba(255, 255, 255, 0.9) !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter::before {
      content: none;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter > * {
      position: relative;
      z-index: 1;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter-tabs {
      gap: 3px !important;
      margin-bottom: 8px !important;
      padding: 2px !important;
      border-radius: 11px !important;
      border: 1px solid #d8e1ee !important;
      background: #e8eef6 !important;
      box-shadow: inset 0 1px 4px rgba(28, 43, 72, 0.1) !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter-body,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter-section,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter-options,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter-actions {
      background: transparent;
      border-radius: 10px;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter-body {
      gap: 8px !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter-section {
      gap: 8px !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter-tab {
      border-radius: 9px !important;
      min-height: 28px !important;
      padding: 0 8px !important;
      border: 1px solid transparent !important;
      background: transparent !important;
      color: rgba(56, 74, 102, 0.88) !important;
      box-shadow: none !important;
      font-size: 11px !important;
      font-weight: 640 !important;
      letter-spacing: 0.01em;
      transition:
        border-color 0.16s var(--ace-grid-liquid-ease),
        box-shadow 0.16s var(--ace-grid-liquid-ease),
        background 0.16s var(--ace-grid-liquid-ease),
        color 0.16s var(--ace-grid-liquid-ease);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter-tab--active {
      border-color: #d3ddea !important;
      background: #ffffff !important;
      color: #23324a !important;
      box-shadow: 0 2px 6px rgba(47, 64, 92, 0.1) !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter-tab:hover {
      color: #2b3f61 !important;
      border-color: #d6deea !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter-section > label,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter-section > div > label:not(.ace-grid__column-filter-option) {
      color: #1f2d44 !important;
      font-size: 12px !important;
      font-weight: 660 !important;
      letter-spacing: 0.01em;
      margin-bottom: 6px !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter .ace-grid__column-filter-search,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter .ace-grid__column-filter-input,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter .ace-grid__column-filter-select,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter .ace-grid__column-filter-range-input {
      min-height: 32px !important;
      height: 32px !important;
      padding: 0 9px !important;
      border-radius: 10px !important;
      border: 1px solid #d8e2ef !important;
      background: #fdfefe !important;
      color: #233249 !important;
      box-shadow:
        inset 0 1px 2px rgba(43, 64, 96, 0.04),
        inset 0 0 0 1px rgba(255, 255, 255, 0.6) !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter .ace-grid__column-filter-range {
      gap: 6px !important;
      align-items: center;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter .ace-grid__column-filter-range-separator {
      font-size: 11px !important;
      color: rgba(74, 93, 122, 0.72) !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter .ace-grid__column-filter-search::placeholder,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter .ace-grid__column-filter-input::placeholder {
      color: rgba(74, 93, 122, 0.72) !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter .ace-grid__column-filter-search:focus,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter .ace-grid__column-filter-input:focus,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter .ace-grid__column-filter-select:focus,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter .ace-grid__column-filter-range-input:focus {
      outline: none !important;
      outline-offset: 0 !important;
      border-color: rgba(10, 132, 255, 0.64) !important;
      box-shadow:
        inset 0 0 0 1px rgba(10, 132, 255, 0.7),
        inset 0 1px 0 rgba(255, 255, 255, 0.9),
        0 1px 2px rgba(43, 64, 96, 0.1) !important;
      background: #ffffff !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter .ace-grid__column-filter-select {
      background-image: url("data:image/svg+xml,%3Csvg%20viewBox%3D%270%200%2016%2016%27%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20fill%3D%27none%27%20stroke%3D%27%236b7d96%27%20stroke-width%3D%272%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%3E%3Cpath%20d%3D%27M4.75%206.5%208%209.75%2011.25%206.5%27/%3E%3C/svg%3E") !important;
      background-repeat: no-repeat !important;
      background-size: 16px 16px !important;
      background-position: right 10px center !important;
      padding-right: 34px !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter-options {
      border: 1px solid #d8e2ef !important;
      border-radius: 12px !important;
      background: #f7fafd !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72) !important;
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 5px !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter-option {
      border-radius: 8px;
      padding: 5px 8px !important;
      margin: 0 !important;
      font-size: 12px !important;
      transition:
        background 0.16s var(--ace-grid-liquid-ease),
        color 0.16s var(--ace-grid-liquid-ease);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter-option:hover {
      background: #eef4fb !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter-actions {
      margin-top: 8px !important;
      padding-top: 8px !important;
      border-top: 1px solid rgba(137, 154, 179, 0.22) !important;
      border-radius: 0 !important;
      background: transparent !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter-button {
      min-width: 78px;
      min-height: 30px !important;
      border-radius: 10px !important;
      padding: 0 11px !important;
      font-size: 11px !important;
      font-weight: 640 !important;
      letter-spacing: 0.01em;
      border: 1px solid var(--ace-grid-liquid-button-border) !important;
      background: var(--ace-grid-liquid-button-bg) !important;
      color: rgba(53, 72, 101, 0.94) !important;
      box-shadow: var(--ace-grid-liquid-button-shadow) !important;
      transition:
        box-shadow 0.14s var(--ace-grid-liquid-ease),
        border-color 0.14s var(--ace-grid-liquid-ease),
        background 0.14s var(--ace-grid-liquid-ease),
        filter 0.14s var(--ace-grid-liquid-ease);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter-button:hover {
      box-shadow: var(--ace-grid-liquid-button-shadow-hover) !important;
      border-color: rgba(10, 132, 255, 0.56) !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter-button:active {
      transform: var(--ace-grid-liquid-press);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter-button--clear {
      background: #f4f8fd !important;
      border-color: #d1dceb !important;
      color: #4a5f82 !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter-button--apply {
      border-color: rgba(6, 109, 211, 0.82) !important;
      background: linear-gradient(
        138deg,
        rgba(52, 158, 255, 0.98) 0%,
        rgba(10, 132, 255, 0.98) 56%,
        rgba(0, 112, 236, 0.98) 100%
      ) !important;
      color: #f8fbff !important;
      box-shadow:
        0 6px 14px rgba(10, 132, 255, 0.28),
        inset 0 1px 0 rgba(198, 231, 255, 0.56) !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter-button--apply:hover {
      filter: brightness(1.05) saturate(1.04);
      border-color: rgba(6, 109, 211, 0.96) !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter-action {
      border: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
      border-radius: 7px !important;
      min-height: 18px !important;
      color: rgba(56, 77, 106, 0.82) !important;
      font-size: 11px !important;
      font-weight: 580 !important;
      padding: 2px 4px !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter-action:hover {
      color: rgba(23, 66, 142, 0.92) !important;
      background: #edf4fb !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter input[type="checkbox"],
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter .ace-grid__column-filter-checkbox {
      width: 15px !important;
      height: 15px !important;
      min-width: 15px !important;
      min-height: 15px !important;
      border-radius: 5px !important;
      border: 1px solid #b7c8dd !important;
      background: #f5f9ff !important;
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.86),
        0 1px 3px rgba(42, 62, 92, 0.12) !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter input[type="checkbox"]:checked,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter .ace-grid__column-filter-checkbox:checked {
      border-color: rgba(6, 109, 211, 0.84) !important;
      background: linear-gradient(
        180deg,
        rgba(92, 185, 255, 0.98) 0%,
        rgba(10, 132, 255, 0.95) 100%
      ) !important;
      box-shadow:
        inset 0 1px 0 rgba(206, 238, 255, 0.64),
        0 3px 7px rgba(10, 96, 187, 0.24) !important;
    }

    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-select,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-order-cell,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-pin,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-detail-toggle,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-index-cell,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__system-cell {
      background: color-mix(
        in srgb,
        var(--ace-grid-cell-bg, rgba(255, 255, 255, 0.66)) 92%,
        rgba(250, 253, 255, 0.92) 8%
      );
      border-right-color: transparent !important;
      border-left-color: transparent !important;
      border-bottom-color: var(--ace-grid-liquid-hairline) !important;
      box-shadow: none !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-select.ace-grid__row-select--active {
      background: color-mix(
        in srgb,
        var(--ace-grid-cell-bg, rgba(255, 255, 255, 0.66)) 92%,
        rgba(250, 253, 255, 0.92) 8%
      ) !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__offset-cell--system {
      --ace-grid-offset-bg: color-mix(
        in srgb,
        var(--ace-grid-cell-bg, rgba(255, 255, 255, 0.66)) 92%,
        rgba(250, 253, 255, 0.92) 8%
      );
      --ace-grid-offset-border: var(--ace-grid-liquid-hairline);
      --ace-grid-offset-edge-shadow: none;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__system-cell--boundary,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-select--system-boundary,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-order-cell--system-boundary,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-pin--system-boundary,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-detail-toggle--system-boundary {
      border-right-color: var(--ace-grid-liquid-hairline-strong) !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__offset-cell--header.ace-grid__offset-cell--system {
      background-image: none;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__offset-cell--header.ace-grid__offset-cell--system.ace-grid__offset-cell--before,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__offset-cell--header.ace-grid__offset-cell--system.ace-grid__offset-cell--after {
      box-shadow: var(--ace-grid-offset-edge-shadow);
    }

    [data-ace-grid-theme="liquid-glass"] .ace-grid__json-editor-button,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__json-editor-close,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-type-button,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-toggle-button,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-action,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-close,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-settings-close,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-settings-reset,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__context-menu-color-apply {
      border-radius: 10px;
      min-height: 26px;
      padding: 0 9px !important;
      border: 1px solid var(--ace-grid-liquid-button-border) !important;
      background: var(--ace-grid-liquid-button-bg) !important;
      box-shadow: var(--ace-grid-liquid-button-shadow) !important;
      transition:
        box-shadow 0.14s var(--ace-grid-liquid-ease),
        border-color 0.14s var(--ace-grid-liquid-ease),
        background 0.14s var(--ace-grid-liquid-ease);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-toggle-button--active,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-action--settings-active,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-action--maximize-active {
      border-color: var(--ace-grid-liquid-button-border-active) !important;
      background: var(--ace-grid-liquid-button-bg-active) !important;
      color: #f7fbff !important;
      box-shadow: var(--ace-grid-liquid-button-shadow-active) !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-settings-close {
      width: 26px;
      height: 26px;
      min-height: 26px;
      padding: 0 !important;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__json-editor-button:hover,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__json-editor-close:hover,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-action:hover,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-type-button:hover,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-toggle-button:hover,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-settings-close:hover,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-settings-reset:hover,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__context-menu-color-apply:hover {
      box-shadow: var(--ace-grid-liquid-button-shadow-hover) !important;
      border-color: rgba(10, 132, 255, 0.56) !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__sort-button:disabled,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__filter-trigger:disabled,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-group-toggle:disabled,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__json-editor-button:disabled,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-type-button:disabled,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-toggle-button:disabled,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-action:disabled,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-close:disabled,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-settings-close:disabled,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-settings-reset:disabled,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__context-menu-color-apply:disabled {
      opacity: 0.5;
      filter: saturate(0.72);
      box-shadow: var(--ace-grid-liquid-button-shadow) !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__json-editor-button:active,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__json-editor-close:active,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-action:active,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-type-button:active,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-toggle-button:active,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-settings-close:active {
      transform: var(--ace-grid-liquid-press);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__json-editor-button--primary:hover,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter-button--apply:hover {
      filter: brightness(1.05) saturate(1.04);
      border-color: var(--ace-grid-liquid-button-border-active) !important;
      box-shadow: var(--ace-grid-liquid-button-shadow-active) !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-toggle-button--active:hover,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-action--settings-active:hover,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-action--maximize-active:hover {
      border-color: var(--ace-grid-liquid-button-border-active) !important;
      background: var(--ace-grid-liquid-button-bg-active) !important;
      box-shadow: var(--ace-grid-liquid-button-shadow-active) !important;
    }

    [data-ace-grid-theme="liquid-glass"] .ace-grid__drag-handle-icon,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-order-icon,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__sort-icon,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__filter-icon,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__pin-icon,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__filter-trigger-icon,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__pagination-icon,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-action-icon,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-pin-icon,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-detail-toggle-icon {
      width: 14px;
      height: 14px;
      color: color-mix(
        in srgb,
        var(--ace-grid-text-secondary) 72%,
        rgba(125, 143, 167, 0.9) 28%
      );
      opacity: 0.92;
      filter: saturate(112%);
      transition:
        color 0.14s var(--ace-grid-liquid-ease),
        opacity 0.14s var(--ace-grid-liquid-ease),
        transform 0.14s var(--ace-grid-liquid-ease);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-order-icon,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-detail-toggle-icon {
      width: 15px;
      height: 15px;
      stroke-width: 1.85;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-cell:hover .ace-grid__sort-icon,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-cell:hover .ace-grid__filter-icon,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-cell:hover .ace-grid__pin-icon,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-cell:hover .ace-grid__drag-handle-icon {
      opacity: 1;
      color: #4f6585;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-pin-button:not(:disabled):hover .ace-grid__row-pin-icon,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-detail-toggle-button:hover .ace-grid__row-detail-toggle-icon,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__pin-button:hover .ace-grid__pin-icon,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__sort-button:hover .ace-grid__sort-icon,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__sort-button--active .ace-grid__sort-icon,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__sort-icon--active,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__filter-trigger:hover .ace-grid__filter-icon,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-cell--filter-open .ace-grid__filter-icon,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-cell--filter-open .ace-grid__filter-trigger-icon,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__filter-trigger--open .ace-grid__filter-icon,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__filter-trigger-icon--open .ace-grid__filter-icon,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__filter-trigger--active .ace-grid__filter-icon,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__filter-trigger-icon--active .ace-grid__filter-icon,
  [data-ace-grid-theme="liquid-glass"] .ace-grid__pin-button--active .ace-grid__pin-icon,
  [data-ace-grid-theme="liquid-glass"] .ace-grid__pin-icon--active,
  [data-ace-grid-theme="liquid-glass"] .ace-grid__row-pin-button--active .ace-grid__row-pin-icon,
  [data-ace-grid-theme="liquid-glass"] .ace-grid__row-pin-icon--active {
    color: #0a84ff !important;
    opacity: 1;
  }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-order-handle {
      font-size: 13px !important;
      font-weight: 600 !important;
      letter-spacing: 0.02em;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-order-cell:not(.ace-grid__row-order-cell--disabled):hover .ace-grid__row-order-icon {
      color: #5b7393;
      opacity: 1;
      transform: translateY(-0.25px);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-pin-button {
      min-width: 18px;
      min-height: 18px;
      width: 18px;
      height: 18px;
      border-radius: 999px !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-pin-button:not(:disabled):hover {
      background: rgba(10, 132, 255, 0.08) !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-pin-button:disabled,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-cell--drag-disabled .ace-grid__drag-handle,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-order-cell--disabled .ace-grid__row-order-handle {
      cursor: not-allowed !important;
      color: var(--ace-grid-pin-icon-disabled) !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-cell--drag-disabled .ace-grid__drag-handle-icon {
      color: var(--ace-grid-pin-icon-disabled) !important;
      opacity: 0.7;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-detail-toggle {
      cursor: pointer;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-detail-toggle--disabled {
      cursor: not-allowed;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-detail-toggle-button {
      min-width: auto;
      min-height: auto;
      width: auto;
      height: auto;
      border-radius: 0 !important;
      border: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
      padding: 0 !important;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: rgba(98, 114, 137, 0.94) !important;
      opacity: 1;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-detail-toggle:hover .ace-grid__row-detail-toggle-button,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-detail-toggle:focus-visible .ace-grid__row-detail-toggle-button {
      color: #0a84ff !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-detail-toggle--expanded .ace-grid__row-detail-toggle-button {
      color: #0a84ff !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-detail-toggle--disabled .ace-grid__row-detail-toggle-button {
      color: rgba(143, 157, 178, 0.76) !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-detail-toggle:focus-visible {
      outline: var(--ace-grid-focus-outline-width, 2px) solid var(--ace-grid-focus-outline);
      outline-offset: 2px;
      border-radius: 6px;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-detail-toggle-icon {
      width: 12px;
      height: 12px;
      opacity: 1;
      filter: none;
      transform: none;
      stroke-width: 1.85;
    }

    [data-ace-grid-theme="liquid-glass"] .ace-grid input[type="checkbox"],
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter input[type="checkbox"],
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-panel input[type="checkbox"],
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-select-checkbox,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-cell-select,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter-checkbox,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__cell-editor-checkbox {
      appearance: none;
      -webkit-appearance: none;
      transform: none !important;
      width: 16px;
      height: 16px;
      min-width: 16px;
      min-height: 16px;
      margin: 0;
      border-radius: 5px;
      border: 1px solid rgba(128, 145, 169, 0.56);
      background:
        linear-gradient(
          180deg,
          rgba(255, 255, 255, 0.98) 0%,
          rgba(245, 250, 255, 0.95) 100%
        );
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.9),
        0 1px 2px rgba(48, 65, 92, 0.14);
      cursor: pointer;
      display: inline-grid;
      place-content: center;
      position: relative;
      transition:
        border-color 0.14s var(--ace-grid-liquid-ease),
        background 0.14s var(--ace-grid-liquid-ease),
        box-shadow 0.14s var(--ace-grid-liquid-ease),
        transform 0.14s var(--ace-grid-liquid-ease);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid input[type="checkbox"]:hover,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter input[type="checkbox"]:hover,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-panel input[type="checkbox"]:hover,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-select-checkbox:hover,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-cell-select:hover,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter-checkbox:hover,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__cell-editor-checkbox:hover {
      border-color: rgba(105, 131, 168, 0.62);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.92),
        0 2px 5px rgba(54, 74, 104, 0.16);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid input[type="checkbox"]:checked,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter input[type="checkbox"]:checked,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-panel input[type="checkbox"]:checked,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-select-checkbox:checked,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-cell-select:checked,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter-checkbox:checked,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__cell-editor-checkbox:checked {
      border-color: rgba(7, 108, 210, 0.84);
      background:
        linear-gradient(
          180deg,
          rgba(84, 176, 255, 0.96) 0%,
          rgba(10, 132, 255, 0.93) 100%
        );
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.5),
        0 3px 8px rgba(10, 96, 187, 0.24);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid input[type="checkbox"]:checked::after,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter input[type="checkbox"]:checked::after,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-panel input[type="checkbox"]:checked::after,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-select-checkbox:checked::after,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-cell-select:checked::after,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter-checkbox:checked::after,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__cell-editor-checkbox:checked::after {
      content: "";
      position: absolute;
      left: 50%;
      top: 50%;
      width: 4px;
      height: 8px;
      border-right: 2px solid rgba(248, 251, 255, 0.98);
      border-bottom: 2px solid rgba(248, 251, 255, 0.98);
      transform: translate(-50%, -58%) rotate(42deg);
      box-sizing: border-box;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid input[type="checkbox"]:indeterminate,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter input[type="checkbox"]:indeterminate,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-panel input[type="checkbox"]:indeterminate,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-select-checkbox:indeterminate,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-cell-select:indeterminate,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter-checkbox:indeterminate,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__cell-editor-checkbox:indeterminate {
      border-color: rgba(7, 108, 210, 0.78);
      background:
        linear-gradient(
          180deg,
          rgba(96, 181, 255, 0.9) 0%,
          rgba(10, 132, 255, 0.84) 100%
        );
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.46),
        0 3px 8px rgba(10, 96, 187, 0.2);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid input[type="checkbox"]:indeterminate::after,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter input[type="checkbox"]:indeterminate::after,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-panel input[type="checkbox"]:indeterminate::after,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-select-checkbox:indeterminate::after,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-cell-select:indeterminate::after,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter-checkbox:indeterminate::after,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__cell-editor-checkbox:indeterminate::after {
      content: "";
      position: absolute;
      left: 50%;
      right: auto;
      top: 50%;
      width: 8px;
      height: 2px;
      border-radius: 999px;
      background: rgba(248, 251, 255, 0.98);
      transform: translate(-50%, -50%);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid input[type="checkbox"]:focus-visible,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter input[type="checkbox"]:focus-visible,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-panel input[type="checkbox"]:focus-visible,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-select-checkbox:focus-visible,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-cell-select:focus-visible,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter-checkbox:focus-visible,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__cell-editor-checkbox:focus-visible {
      outline: var(--ace-grid-focus-outline-width, 2px) solid var(--ace-grid-focus-outline);
      outline-offset: 2px;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid input[type="checkbox"]:disabled,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter input[type="checkbox"]:disabled,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-panel input[type="checkbox"]:disabled,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-select-checkbox:disabled,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__header-cell-select:disabled,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-filter-checkbox:disabled,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__cell-editor-checkbox:disabled {
      cursor: not-allowed;
      opacity: 0.56;
      filter: saturate(0.72);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid input[type="radio"],
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-panel input[type="radio"] {
      accent-color: var(--ace-grid-accent);
    }

    [data-ace-grid-theme="liquid-glass"] .ace-grid__context-menu-overlay,
    [data-ace-grid-theme="liquid-glass"].ace-grid__context-menu-overlay {
      background: rgba(82, 98, 122, 0.08);
      backdrop-filter: blur(2px);
      -webkit-backdrop-filter: blur(2px);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__context-menu,
    [data-ace-grid-theme="liquid-glass"].ace-grid__context-menu {
      border-radius: 12px;
      overflow: hidden;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__context-menu-item,
    [data-ace-grid-theme="liquid-glass"].ace-grid__context-menu-item {
      margin: 0 4px;
      border-radius: 8px;
      border: 1px solid transparent;
      box-shadow: none;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__context-menu-color-swatch {
      border: 1px solid rgba(127, 143, 167, 0.44);
      box-shadow: 0 2px 6px rgba(40, 56, 84, 0.12);
    }

    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-panel,
    [data-ace-grid-theme="liquid-glass"].ace-grid__chart-panel {
      border-radius: 14px !important;
      border: 1px solid #d7e0ec !important;
      background: #f7faff !important;
      box-shadow:
        0 12px 28px rgba(42, 60, 92, 0.18),
        0 3px 9px rgba(42, 60, 92, 0.07),
        inset 0 1px 0 rgba(255, 255, 255, 0.9) !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-toolbar {
      padding: 10px 12px !important;
      gap: 7px;
      border-bottom: 1px solid rgba(137, 154, 179, 0.22);
      background: #f7faff !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-toolbar-row {
      gap: 8px;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-toolbar-row--top {
      align-items: flex-start;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-toolbar-actions,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-action-group {
      gap: 4px;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-toolbar-left {
      min-width: 96px;
      gap: 2px;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-title {
      font-size: 16px;
      font-weight: 660;
      letter-spacing: 0.005em;
      color: #1f2d44;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-subtitle {
      font-size: 11px;
      color: rgba(74, 93, 122, 0.76);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-controls {
      gap: 7px 8px;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-type-label,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-grouping-label {
      font-size: 11px;
      font-weight: 640;
      color: rgba(56, 74, 102, 0.88);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-type-select,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-grouping-select {
      min-height: 32px !important;
      height: 32px !important;
      padding: 0 9px !important;
      border-radius: 10px !important;
      border: 1px solid #d8e2ef !important;
      background: #fdfefe !important;
      color: #233249 !important;
      box-shadow:
        inset 0 1px 2px rgba(43, 64, 96, 0.04),
        inset 0 0 0 1px rgba(255, 255, 255, 0.6) !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-series-toggle {
      gap: 3px;
      padding: 2px;
      border-radius: 11px;
      border: 1px solid #d8e1ee;
      background: #e8eef6;
      box-shadow: inset 0 1px 4px rgba(28, 43, 72, 0.1);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-series-toggle .ace-grid__chart-toggle-button {
      min-height: 28px;
      height: 28px;
      padding: 0 10px !important;
      border-radius: 9px !important;
      border: 1px solid transparent !important;
      background: transparent !important;
      color: rgba(56, 74, 102, 0.88) !important;
      box-shadow: none !important;
      font-size: 11px !important;
      font-weight: 640 !important;
      letter-spacing: 0.01em;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-series-toggle .ace-grid__chart-toggle-button--active {
      border-color: #d3ddea !important;
      background: #ffffff !important;
      color: #23324a !important;
      box-shadow: 0 2px 6px rgba(47, 64, 92, 0.1) !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-series-toggle .ace-grid__chart-toggle-button:hover {
      color: #2b3f61 !important;
      border-color: #d6deea !important;
      background: transparent !important;
      box-shadow: none !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-settings-row .ace-grid__chart-series-toggle {
      align-self: flex-start;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-action {
      min-height: 30px;
      height: 30px;
      padding: 0 10px !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-action--drag,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-action--maximize,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-action--resize,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-action--settings,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-close {
      min-width: 30px;
      width: 30px;
      padding: 0 !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-action-icon {
      width: 13px;
      height: 13px;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-mapping {
      gap: 4px 6px;
      align-items: center;
      font-size: 10.5px;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-mapping-item {
      min-height: 22px;
      border-radius: 999px;
      padding: 1px 8px;
      gap: 3px;
      border-color: var(--ace-grid-liquid-button-border) !important;
      background: var(--ace-grid-liquid-button-bg) !important;
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.82),
        0 1px 3px rgba(47, 63, 88, 0.09) !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-mapping-label {
      color: rgba(74, 93, 122, 0.88);
      font-size: 10.5px;
      font-weight: 620;
      letter-spacing: 0.002em;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-mapping-value {
      color: #1f2e45;
      font-size: 10.5px;
      font-weight: 670;
      letter-spacing: 0;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-toolbar-row--brush {
      padding: 6px 0 0;
      border-top: 1px solid rgba(137, 154, 179, 0.22);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-body {
      background: #f7faff !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-stage-wrap--vertical,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-stage-wrap--settings {
      gap: 8px;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-stage,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-canvas {
      background: #fdfefe;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-settings,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-legend,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-zoom {
      background: #f7faff !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-settings {
      width: 248px;
      min-width: 192px;
      border-left: 1px solid rgba(137, 154, 179, 0.22) !important;
      border-radius: 0 !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-settings-header {
      padding: 8px 10px;
      border-bottom: 1px solid rgba(137, 154, 179, 0.22);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-settings-title {
      font-size: 12px;
      font-weight: 660;
      color: #1f2d44;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-settings-actions {
      gap: 6px;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-settings-body {
      padding: 8px 10px 10px;
      gap: 10px;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-settings-section {
      gap: 6px;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-settings-section-title {
      font-size: 11px;
      font-weight: 660;
      text-transform: none;
      letter-spacing: 0.01em;
      color: #1f2d44;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-settings-label {
      font-size: 11px;
      font-weight: 620;
      color: rgba(74, 93, 122, 0.84);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-settings-select,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-settings-input {
      min-height: 30px !important;
      height: 30px !important;
      padding: 0 9px !important;
      border-radius: 10px !important;
      border: 1px solid #d8e2ef !important;
      background: #fdfefe !important;
      color: #233249 !important;
      box-shadow:
        inset 0 1px 2px rgba(43, 64, 96, 0.04),
        inset 0 0 0 1px rgba(255, 255, 255, 0.6) !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-settings-toggle {
      min-height: 24px;
      font-size: 11px;
      color: #233249;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-legend {
      gap: 8px 12px;
      padding: 7px 12px;
      border-top: 1px solid rgba(137, 154, 179, 0.22);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-zoom {
      padding: 7px 10px 9px;
      border-top: 1px solid rgba(137, 154, 179, 0.22);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-zoom--vertical {
      padding: 7px 6px 7px 5px;
      border-left: 1px solid rgba(137, 154, 179, 0.22);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-zoom-track {
      border-color: #d8e2ef;
      background: #eef4fb;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.74);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-zoom-window {
      border-color: rgba(7, 108, 210, 0.48);
      background: rgba(10, 132, 255, 0.18);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-zoom-handle {
      border-color: #b7c8dd;
      background: #fdfefe;
      box-shadow: 0 1px 3px rgba(42, 62, 92, 0.16);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-tooltip {
      border-radius: 10px;
      border: 1px solid #d7e0ec !important;
      background: #f7faff !important;
      box-shadow:
        0 10px 24px rgba(42, 60, 92, 0.16),
        0 3px 8px rgba(42, 60, 92, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.88) !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
    }

    [data-ace-grid-theme="liquid-glass"] .ace-grid__column-resize-guide,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__row-resize-line {
      box-shadow:
        0 0 0 1px rgba(255, 255, 255, 0.78),
        0 0 10px rgba(10, 132, 255, 0.44);
    }

    [data-ace-grid-theme="liquid-glass"] .ace-grid__json-editor-overlay,
    [data-ace-grid-theme="liquid-glass"].ace-grid__json-editor-overlay {
      background: rgba(87, 104, 129, 0.24) !important;
      backdrop-filter: blur(14px) saturate(128%) !important;
      -webkit-backdrop-filter: blur(14px) saturate(128%) !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__json-editor,
    [data-ace-grid-theme="liquid-glass"].ace-grid__json-editor {
      width: min(780px, 82vw) !important;
      height: min(500px, 78vh) !important;
      border-radius: 16px !important;
      border: 1px solid rgba(129, 145, 169, 0.44) !important;
      background: var(--ace-grid-liquid-overlay-bg-strong) !important;
      box-shadow:
        0 20px 44px rgba(37, 52, 76, 0.22),
        0 8px 18px rgba(42, 60, 92, 0.12),
        inset 0 1px 0 rgba(255, 255, 255, 0.86) !important;
      backdrop-filter: var(--ace-grid-liquid-overlay-backdrop) !important;
      -webkit-backdrop-filter: var(--ace-grid-liquid-overlay-backdrop) !important;
      font-family: var(--ace-grid-font-family) !important;
      color: #1e2b3f !important;
      overflow: hidden !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__json-editor-header,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__json-editor-footer {
      background: rgba(244, 249, 253, 0.9) !important;
      border-color: rgba(127, 143, 167, 0.34) !important;
      backdrop-filter: blur(8px) saturate(118%) !important;
      -webkit-backdrop-filter: blur(8px) saturate(118%) !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__json-editor-header {
      padding: 10px 12px !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__json-editor-footer {
      padding: 8px 12px !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__json-editor-title {
      font-size: 14px;
      line-height: 1.2;
      letter-spacing: 0.004em;
      font-weight: 630;
      color: #1f2a3c;
      text-shadow: 0 1px 0 rgba(255, 255, 255, 0.7);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__json-editor-close {
      min-width: 30px;
      width: 30px;
      height: 30px;
      min-height: 30px;
      padding: 0 !important;
      border-radius: 10px;
      border: 1px solid var(--ace-grid-liquid-button-border) !important;
      background: var(--ace-grid-liquid-button-bg) !important;
      box-shadow: var(--ace-grid-liquid-button-shadow) !important;
      color: #4f6483;
      font-size: 12px;
      line-height: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition:
        box-shadow 0.16s var(--ace-grid-liquid-ease),
        border-color 0.16s var(--ace-grid-liquid-ease),
        color 0.16s var(--ace-grid-liquid-ease),
        background 0.16s var(--ace-grid-liquid-ease);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__json-editor-close:hover {
      color: #0a84ff;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__json-editor-body {
      background: rgba(246, 250, 254, 0.7) !important;
      grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr) !important;
      gap: 8px !important;
      padding: 10px !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__json-editor-pane {
      gap: 5px !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__json-editor-pane-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__json-editor-pane-label {
      width: fit-content;
      font-size: 9px !important;
      font-weight: 620 !important;
      letter-spacing: 0.06em !important;
      text-transform: uppercase;
      color: #5f7593 !important;
      padding: 2px 8px;
      border-radius: 999px;
      border: 1px solid rgba(145, 162, 186, 0.34);
      background: rgba(248, 252, 255, 0.9);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__json-editor-textarea,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__json-editor-preview {
      border: 1px solid rgba(134, 151, 175, 0.34) !important;
      border-radius: 9px !important;
      background: rgba(252, 254, 255, 0.98) !important;
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.86),
        0 2px 8px rgba(59, 79, 109, 0.08) !important;
      color: #233249 !important;
      font-family:
        "SF Mono",
        "SFMono-Regular",
        ui-monospace,
        Menlo,
        Monaco,
        Consolas,
        "Liberation Mono",
        "Courier New",
        monospace !important;
      font-size: 11.5px !important;
      line-height: 1.45 !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__json-editor-textarea {
      padding: 8px 10px !important;
      caret-color: #0a84ff;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__json-editor-preview {
      padding: 8px 10px !important;
      white-space: pre-wrap !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__json-editor-textarea:focus {
      outline: none !important;
      border-color: rgba(10, 132, 255, 0.64) !important;
      box-shadow:
        0 0 0 2px rgba(10, 132, 255, 0.16),
        inset 0 1px 0 rgba(255, 255, 255, 0.92),
        0 3px 8px rgba(35, 104, 190, 0.14) !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__json-editor-meta {
      color: #5a6f8d !important;
      font-size: 11.5px !important;
      letter-spacing: 0.004em;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__json-editor-actions {
      gap: 6px !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__json-editor-button {
      min-height: 28px !important;
      padding: 0 10px !important;
      font-size: 11px !important;
      font-weight: 620 !important;
      letter-spacing: 0.012em;
      border-radius: 9px !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__json-editor-button--format {
      min-height: 22px !important;
      height: 22px !important;
      padding: 0 8px !important;
      font-size: 10px !important;
      font-weight: 620 !important;
      border-radius: 8px !important;
      line-height: 1 !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__json-editor-button--ghost {
      border: 1px solid var(--ace-grid-liquid-button-border) !important;
      background: var(--ace-grid-liquid-button-bg) !important;
      box-shadow: var(--ace-grid-liquid-button-shadow) !important;
      color: #5a6f8d !important;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__json-editor-button--primary {
      background:
        linear-gradient(
          180deg,
          rgba(22, 138, 255, 0.98) 0%,
          rgba(10, 122, 244, 0.98) 100%
        ) !important;
      border: 1px solid rgba(9, 111, 221, 0.95) !important;
      color: #f8fbff !important;
    }
    @media (max-width: 900px) {
      [data-ace-grid-theme="liquid-glass"] .ace-grid__json-editor {
        width: min(780px, 96vw) !important;
        height: min(520px, 88vh) !important;
      }
      [data-ace-grid-theme="liquid-glass"] .ace-grid__json-editor-body {
        grid-template-columns: minmax(0, 1fr) !important;
        gap: 6px !important;
        padding: 8px !important;
      }
      [data-ace-grid-theme="liquid-glass"] .ace-grid__json-editor-header,
      [data-ace-grid-theme="liquid-glass"] .ace-grid__json-editor-footer {
        padding-left: 10px !important;
        padding-right: 10px !important;
      }
    }
    @media (max-width: 640px) {
      [data-ace-grid-theme="liquid-glass"] .ace-grid__json-editor-footer {
        flex-direction: column;
        align-items: stretch;
        gap: 7px !important;
      }
      [data-ace-grid-theme="liquid-glass"] .ace-grid__json-editor-actions {
        justify-content: flex-end;
      }
      [data-ace-grid-theme="liquid-glass"] .ace-grid__json-editor-meta {
        font-size: 11px !important;
      }
    }

    [data-ace-grid-theme="liquid-glass"] .ace-grid__sparkline-container--native {
      position: relative;
      isolation: isolate;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__sparkline-container--native::before {
      content: "";
      position: absolute;
      inset: 2px 5px;
      z-index: 0;
      pointer-events: none;
      border-radius: 10px;
      background:
        linear-gradient(
          180deg,
          rgba(255, 255, 255, 0.34) 0%,
          rgba(248, 252, 255, 0.18) 48%,
          rgba(232, 240, 249, 0.12) 100%
        );
      border: 1px solid rgba(163, 178, 198, 0.12);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.36),
        inset 0 -1px 0 rgba(219, 229, 241, 0.16);
      opacity: 0.9;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__sparkline-container--native > .ace-grid__sparkline {
      position: relative;
      z-index: 1;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__sparkline-container--native.ace-grid__sparkline-container--clickable:hover::before {
      border-color: rgba(118, 142, 171, 0.18);
      opacity: 1;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__sparkline {
      overflow: visible;
      shape-rendering: geometricPrecision;
      color: var(--ace-grid-sparkline-line-color, #0a84ff);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__sparkline-axis {
      opacity: 0.42;
      stroke: var(--ace-grid-sparkline-axis-color, rgba(121, 137, 161, 0.34));
      stroke-linecap: round;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__sparkline-line-glow {
      opacity: 0.18;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__sparkline-line {
      opacity: 0.99;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__sparkline-area-glow {
      opacity: 0.12;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__sparkline-area {
      opacity: 0.82;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__sparkline-marker,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__sparkline-highlight {
      opacity: 0.98;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__sparkline-bar,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__sparkline-winloss-bar {
      opacity: 0.98;
      shape-rendering: geometricPrecision;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__sparkline-bar:not(.ace-grid__sparkline-bar--custom-stroke),
    [data-ace-grid-theme="liquid-glass"] .ace-grid__sparkline-winloss-bar:not(.ace-grid__sparkline-winloss-bar--custom-stroke) {
      stroke: rgba(255, 255, 255, 0.34);
      stroke-width: 0.55px;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__sparkline-winloss-bar--zero {
      opacity: 0.72;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__sparkline--win-loss .ace-grid__sparkline-axis {
      opacity: 0.34;
      stroke-dasharray: 3 3;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__sparkline-value-label {
      fill: color-mix(
        in srgb,
        var(--ace-grid-text-secondary) 74%,
        var(--ace-grid-sparkline-line) 26%
      );
      font-weight: 650;
      font-variant-numeric: tabular-nums;
      letter-spacing: 0.01em;
      paint-order: stroke;
      stroke: rgba(251, 254, 255, 0.78);
      stroke-width: 2px;
      stroke-linejoin: round;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__sparkline-value-label--negative {
      fill: color-mix(
        in srgb,
        var(--ace-grid-sparkline-negative) 70%,
        var(--ace-grid-text-primary) 30%
      );
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__sparkline-value-label--positive {
      fill: color-mix(
        in srgb,
        var(--ace-grid-sparkline-positive) 66%,
        var(--ace-grid-text-primary) 34%
      );
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__sparkline-value-label--zero {
      fill: color-mix(
        in srgb,
        var(--ace-grid-sparkline-zero) 62%,
        var(--ace-grid-text-primary) 38%
      );
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__sparkline--compact .ace-grid__sparkline-marker {
      opacity: 0;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__sparkline--compact .ace-grid__sparkline-value-label,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__sparkline--labels-hidden .ace-grid__sparkline-value-label--all {
      display: none;
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__sparkline-tooltip,
    [data-ace-grid-theme="liquid-glass"].ace-grid__sparkline-tooltip {
      border-radius: 10px;
      background: var(--ace-grid-liquid-overlay-bg-strong) !important;
      color: #1f2a3b;
      backdrop-filter: var(--ace-grid-liquid-tooltip-backdrop);
      -webkit-backdrop-filter: var(--ace-grid-liquid-tooltip-backdrop);
    }

    [data-ace-grid-theme="liquid-glass"] .ace-grid__global-loading-pill,
    [data-ace-grid-theme="liquid-glass"] .ace-grid__infinite-scroll-loader {
      border-color: rgba(126, 142, 165, 0.4);
      background: rgba(249, 252, 255, 0.84);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.84),
        0 8px 18px rgba(41, 57, 83, 0.16);
      backdrop-filter: blur(10px) saturate(124%);
      -webkit-backdrop-filter: blur(10px) saturate(124%);
    }
    [data-ace-grid-theme="liquid-glass"] .ace-grid__global-loading-dot {
      animation: ace-grid-liquid-pulse 1.2s ease-in-out infinite;
    }

    @media (prefers-reduced-motion: reduce) {
      [data-ace-grid-theme="liquid-glass"] .ace-grid__global-loading-dot {
        animation: none !important;
      }
      [data-ace-grid-theme="liquid-glass"] .ace-grid__cell-loading-bar {
        animation: none !important;
      }
      [data-ace-grid-theme="liquid-glass"] .ace-grid__header-cell,
      [data-ace-grid-theme="liquid-glass"] .ace-grid__header-group-cell,
      [data-ace-grid-theme="liquid-glass"] .ace-grid__pagination-button,
      [data-ace-grid-theme="liquid-glass"] .ace-grid__chart-action {
        transition: none !important;
      }
    }

  `,
};

const retargetThemeCss = (
  cssText: string | undefined,
  fromSlug: string,
  toSlug: string
) => (cssText ?? "").split(fromSlug).join(toSlug);

const material3DarkCssOverrides = `
  [data-ace-grid-theme="material-3-dark"] {
    --ace-grid-md3-state-hover: rgba(147, 197, 253, 0.16);
    --ace-grid-md3-state-active: rgba(147, 197, 253, 0.24);
    --ace-grid-md3-shell-border: #5a7090;
    --ace-grid-md3-header-divider: color-mix(
      in srgb,
      var(--ace-grid-md3-shell-border) 68%,
      transparent
    );
    --ace-grid-md3-row-divider: color-mix(
      in srgb,
      var(--ace-grid-md3-shell-border) 42%,
      transparent
    );
    --ace-grid-md3-system-divider: color-mix(
      in srgb,
      var(--ace-grid-md3-shell-border) 58%,
      transparent
    );
    --ace-grid-md3-pinned-edge-border: rgba(143, 166, 197, 0.62);
    --ace-grid-md3-shell-bg: #243247;
    --ace-grid-md3-header-band-bg: #2b3b52;
    --ace-grid-md3-formula-shell: #1a2535;
    --ace-grid-md3-emphasis: #9bb4d6;
    --ace-grid-md3-icon-muted: #b4c6df;
    --ace-grid-md3-checkbox-border: #9bb1cb;
    --ace-grid-md3-checkbox-border-hover: #b9cce3;
    --ace-grid-md3-checkbox-bg: #334960;
    --ace-grid-md3-checkbox-active: #93c5fd;
    --ace-grid-md3-checkbox-mark: #0e2238;
    --ace-grid-liquid-header-band-bg: var(--ace-grid-md3-header-band-bg);
    --ace-grid-liquid-picker-icon-color: rgba(216, 229, 248, 0.9);
    --ace-grid-liquid-picker-icon-color-hover: #93c5fd;
    --ace-grid-md3-validation-tooltip-bg: #4a2f31;
    --ace-grid-md3-validation-tooltip-border: #b67f7b;
    --ace-grid-md3-validation-tooltip-text: #ffe0dc;
    --ace-grid-md3-validation-tooltip-shadow:
      0 8px 22px rgba(4, 9, 17, 0.48),
      0 2px 6px rgba(4, 9, 17, 0.36);
    --ace-grid-md3-validation-tooltip-error-bg: #4f2d30;
    --ace-grid-md3-validation-tooltip-error-border: #d99b96;
    --ace-grid-md3-validation-tooltip-error-text: #ffe0dc;
    --ace-grid-md3-validation-tooltip-warning-bg: #4e3c23;
    --ace-grid-md3-validation-tooltip-warning-border: #e0be7c;
    --ace-grid-md3-validation-tooltip-warning-text: #ffe8bf;
    --ace-grid-md3-validation-tooltip-info-bg: #22364d;
    --ace-grid-md3-validation-tooltip-info-border: #a9c7ec;
    --ace-grid-md3-validation-tooltip-info-text: #deecff;
    --ace-grid-row-detail-bg: #223247;
    --ace-grid-row-detail-border-top: #5a7090;
    --ace-grid-row-detail-gutter: 8px 10px 10px;
    --ace-grid-row-detail-padding: 14px 16px;
    --ace-grid-row-detail-inner-bg: #2a3d57;
    --ace-grid-row-detail-inner-border: 1px solid #6c83a7;
    --ace-grid-row-detail-inner-radius: 12px;
    --ace-grid-row-detail-inner-shadow: inset 0 1px 0 rgba(236, 245, 255, 0.1);
    --ace-grid-row-detail-shadow: none;
    --ace-grid-row-detail-backdrop: none;
    --ace-grid-md3-loader-track: rgba(124, 150, 184, 0.22);
    --ace-grid-md3-loader-border: rgba(156, 188, 225, 0.28);
    --ace-grid-md3-loader-sheen-soft: rgba(147, 197, 253, 0.36);
    --ace-grid-md3-loader-sheen-strong: rgba(219, 236, 255, 0.54);
    --ace-grid-fill-handle-size: 10px;
    --ace-grid-fill-handle-radius: 999px;
    --ace-grid-fill-handle-offset: -5px;
    --ace-grid-fill-handle-border-width: 0;
    --ace-grid-fill-handle-border: transparent;
    --ace-grid-fill-handle-bg: var(--ace-grid-selection-border);
    --ace-grid-fill-handle-bg-hover: color-mix(
      in srgb,
      var(--ace-grid-selection-border) 92%,
      #ffffff 8%
    );
    --ace-grid-fill-handle-inner: 0;
    --ace-grid-fill-handle-inner-border: none;
    --ace-grid-fill-handle-shadow: 0 2px 4px rgba(4, 9, 17, 0.42);
    --ace-grid-md3-panel-bg: #1f2d41;
    --ace-grid-md3-panel-bg-subtle: #26374d;
    --ace-grid-md3-panel-bg-raised: #2b3f58;
    --ace-grid-md3-panel-border: #5a7090;
    --ace-grid-md3-panel-divider: rgba(143, 166, 197, 0.34);
    --ace-grid-md3-panel-shadow:
      0 16px 34px rgba(4, 9, 17, 0.5),
      0 6px 14px rgba(4, 9, 17, 0.32);
  }

  [data-ace-grid-theme="material-3-dark"] .ace-grid :is(input[type="date"], input[type="time"], input[type="datetime-local"]) {
    color-scheme: dark;
  }
  [data-ace-grid-theme="material-3-dark"] .ace-grid :is(input[type="date"], input[type="time"], input[type="datetime-local"])::-webkit-calendar-picker-indicator {
    opacity: 0.94;
  }
  [data-ace-grid-theme="material-3-dark"] .ace-grid__column-filter select option,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__chart-panel select option,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__json-editor select option,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__floating-filter-select option,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__pagination-select option,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__cell-editor-select option {
    background: #2a3b53;
    color: #e8f0ff;
  }
  [data-ace-grid-theme="material-3-dark"].ace-grid__wrapper {
    border-color: color-mix(
      in srgb,
      var(--ace-grid-md3-shell-border) 72%,
      transparent
    ) !important;
    background:
      linear-gradient(
        180deg,
        rgba(72, 100, 139, 0.2) 0%,
        rgba(35, 50, 73, 0.2) 100%
      ),
      var(--ace-grid-md3-shell-bg) !important;
    box-shadow:
      0 14px 36px rgba(4, 9, 17, 0.42),
      0 4px 12px rgba(4, 9, 17, 0.24),
      inset 0 1px 0 rgba(236, 245, 255, 0.06) !important;
  }
  [data-ace-grid-theme="material-3-dark"] .ace-grid {
    background:
      linear-gradient(
        180deg,
        color-mix(in srgb, var(--ace-grid-md3-shell-bg) 88%, #ffffff 12%) 0%,
        var(--ace-grid-md3-shell-bg) 58%,
        color-mix(in srgb, var(--ace-grid-md3-shell-bg) 92%, #000000 8%) 100%
      ) !important;
  }
  [data-ace-grid-theme="material-3-dark"] .ace-grid__header-cell:hover,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__header-group-cell:hover {
    background: color-mix(
      in srgb,
      var(--ace-grid-md3-header-band-bg) 84%,
      var(--ace-grid-sort-icon-active) 16%
    ) !important;
  }
  [data-ace-grid-theme="material-3-dark"] .ace-grid__header-cell-title,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__header-group-label-text,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__cell,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__formula-bar-input {
    color: var(--ace-grid-text-primary) !important;
    text-shadow: none !important;
  }
  [data-ace-grid-theme="material-3-dark"] .ace-grid__sort-button,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__filter-trigger,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__header-group-toggle,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__pin-button,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__row-pin-button,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__row-detail-toggle-button,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__pagination-button,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__column-filter-button,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__column-filter-clear-button {
    color: var(--ace-grid-md3-icon-muted) !important;
  }
  [data-ace-grid-theme="material-3-dark"] .ace-grid__row-pin-button--active {
    color: var(--ace-grid-pin-icon-active) !important;
  }
  [data-ace-grid-theme="material-3-dark"] .ace-grid__row-pin-button--active .ace-grid__row-pin-icon,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__row-pin-icon--active {
    color: currentColor !important;
    opacity: 1 !important;
  }
  [data-ace-grid-theme="material-3-dark"] .ace-grid__formula-bar-input-wrap {
    background: color-mix(
      in srgb,
      var(--ace-grid-surface-sunken) 72%,
      var(--ace-grid-surface-raised) 28%
    ) !important;
    border-color: color-mix(
      in srgb,
      var(--ace-grid-md3-emphasis) 76%,
      transparent
    ) !important;
    box-shadow: inset 0 1px 0 rgba(236, 245, 255, 0.06) !important;
  }
  [data-ace-grid-theme="material-3-dark"] .ace-grid__formula-bar-input-wrap:hover {
    border-color: color-mix(
      in srgb,
      var(--ace-grid-md3-emphasis) 86%,
      transparent
    ) !important;
    background: color-mix(
      in srgb,
      var(--ace-grid-surface-sunken) 64%,
      var(--ace-grid-surface-raised) 36%
    ) !important;
  }
  [data-ace-grid-theme="material-3-dark"] .ace-grid__formula-bar-input-wrap:focus-within {
    border-color: color-mix(
      in srgb,
      var(--ace-grid-sort-icon-active) 64%,
      var(--ace-grid-md3-emphasis) 36%
    ) !important;
    box-shadow:
      inset 0 0 0 1px
        color-mix(in srgb, var(--ace-grid-sort-icon-active) 44%, transparent),
      0 0 0 3px color-mix(in srgb, var(--ace-grid-focus-outline) 20%, transparent) !important;
  }
  [data-ace-grid-theme="material-3-dark"] .ace-grid__cell-loading-bar {
    opacity: 0.96;
  }
  [data-ace-grid-theme="material-3-dark"] .ace-grid__fill-handle::after {
    content: none;
  }

  [data-ace-grid-theme="material-3-dark"] .ace-grid__column-filter,
  [data-ace-grid-theme="material-3-dark"].ace-grid__column-filter,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__chart-panel,
  [data-ace-grid-theme="material-3-dark"].ace-grid__chart-panel,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__json-editor,
  [data-ace-grid-theme="material-3-dark"].ace-grid__json-editor {
    border-color: var(--ace-grid-md3-panel-border) !important;
    background:
      linear-gradient(
        180deg,
        color-mix(in srgb, var(--ace-grid-md3-panel-bg) 90%, #ffffff 10%),
        var(--ace-grid-md3-panel-bg)
      ) !important;
    box-shadow: var(--ace-grid-md3-panel-shadow) !important;
    color: var(--ace-grid-text-primary) !important;
  }

  [data-ace-grid-theme="material-3-dark"] .ace-grid__column-filter-tabs {
    border-bottom-color: var(--ace-grid-md3-panel-divider) !important;
  }
  [data-ace-grid-theme="material-3-dark"] .ace-grid__column-filter-body,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__column-filter-section {
    background: transparent !important;
  }
  [data-ace-grid-theme="material-3-dark"] .ace-grid__column-filter-options {
    border-color: var(--ace-grid-md3-panel-divider) !important;
    background: var(--ace-grid-md3-panel-bg-raised) !important;
  }
  [data-ace-grid-theme="material-3-dark"] .ace-grid__column-filter-option {
    border-bottom-color: color-mix(
      in srgb,
      var(--ace-grid-md3-panel-divider) 74%,
      transparent
    ) !important;
  }
  [data-ace-grid-theme="material-3-dark"] .ace-grid__column-filter-option:hover {
    background: color-mix(
      in srgb,
      var(--ace-grid-sort-icon-active) 14%,
      transparent
    ) !important;
  }
  [data-ace-grid-theme="material-3-dark"] .ace-grid__column-filter-option--selected {
    background: color-mix(
      in srgb,
      var(--ace-grid-sort-icon-active) 22%,
      transparent
    ) !important;
  }
  [data-ace-grid-theme="material-3-dark"] .ace-grid__column-filter-stack > div {
    border-color: var(--ace-grid-md3-panel-divider) !important;
    background: color-mix(
      in srgb,
      var(--ace-grid-md3-panel-bg-raised) 88%,
      var(--ace-grid-md3-panel-bg-subtle) 12%
    ) !important;
  }
  [data-ace-grid-theme="material-3-dark"] .ace-grid__column-filter-actions {
    border-top-color: var(--ace-grid-md3-panel-divider) !important;
  }
  [data-ace-grid-theme="material-3-dark"] .ace-grid__column-filter-label,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__column-filter-block-title {
    color: var(--ace-grid-text-primary) !important;
  }
  [data-ace-grid-theme="material-3-dark"] .ace-grid__column-filter-section > label,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__column-filter-section > div > label:not(.ace-grid__column-filter-option) {
    color: var(--ace-grid-text-primary) !important;
    text-shadow: none !important;
  }
  [data-ace-grid-theme="material-3-dark"] .ace-grid__column-filter-action,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__column-filter-text-button,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__column-filter-action--muted,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__column-filter-text-button--muted,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__column-filter-muted,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__column-filter-help,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__column-filter-empty,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__column-filter-checkbox-row {
    color: var(--ace-grid-text-secondary) !important;
  }
  [data-ace-grid-theme="material-3-dark"] .ace-grid__column-filter-action--accent,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__column-filter-text-button--accent {
    color: var(--ace-grid-sort-icon-active) !important;
  }
  [data-ace-grid-theme="material-3-dark"] .ace-grid__column-filter-action:hover,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__column-filter-text-button:hover {
    color: var(--ace-grid-text-primary) !important;
  }

  [data-ace-grid-theme="material-3-dark"] .ace-grid__chart-toolbar {
    border-bottom-color: var(--ace-grid-md3-panel-divider) !important;
    background:
      linear-gradient(
        180deg,
        color-mix(
          in srgb,
          var(--ace-grid-md3-panel-bg-subtle) 86%,
          #ffffff 14%
        ),
        var(--ace-grid-md3-panel-bg-subtle)
      ) !important;
  }
  [data-ace-grid-theme="material-3-dark"] .ace-grid__chart-toolbar-row--brush {
    border-top-color: var(--ace-grid-md3-panel-divider) !important;
    background: color-mix(
      in srgb,
      var(--ace-grid-md3-panel-bg-raised) 84%,
      var(--ace-grid-md3-panel-bg) 16%
    ) !important;
  }
  [data-ace-grid-theme="material-3-dark"] .ace-grid__chart-body,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__chart-zoom,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__chart-legend,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__chart-settings,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__chart-settings-body {
    background: var(--ace-grid-chart-bg) !important;
    border-color: var(--ace-grid-md3-panel-divider) !important;
  }
  [data-ace-grid-theme="material-3-dark"] .ace-grid__chart-settings-header {
    border-bottom-color: var(--ace-grid-md3-panel-divider) !important;
    background: var(--ace-grid-md3-panel-bg-subtle) !important;
  }
  [data-ace-grid-theme="material-3-dark"] .ace-grid__chart-mapping-item {
    border-color: var(--ace-grid-md3-panel-divider) !important;
    background: color-mix(
      in srgb,
      var(--ace-grid-sort-icon-active) 18%,
      var(--ace-grid-md3-panel-bg-raised) 82%
    ) !important;
  }
  [data-ace-grid-theme="material-3-dark"] .ace-grid__chart-tooltip {
    background: var(--ace-grid-chart-tooltip-bg) !important;
    border: var(--ace-grid-chart-tooltip-border) !important;
    box-shadow: var(--ace-grid-chart-tooltip-shadow) !important;
    color: var(--ace-grid-chart-legend) !important;
  }
  [data-ace-grid-theme="material-3-dark"] .ace-grid__chart-title,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__chart-settings-title,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__chart-mapping-value,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__chart-type-select,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__chart-grouping-select,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__chart-settings-select,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__chart-settings-input {
    color: var(--ace-grid-text-primary) !important;
  }
  [data-ace-grid-theme="material-3-dark"] .ace-grid__chart-subtitle,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__chart-type-label,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__chart-grouping-label,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__chart-mapping-label,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__chart-settings-section-title,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__chart-settings-label,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__chart-brush-summary {
    color: var(--ace-grid-text-secondary) !important;
  }

  [data-ace-grid-theme="material-3-dark"] .ace-grid__json-editor-overlay,
  [data-ace-grid-theme="material-3-dark"].ace-grid__json-editor-overlay {
    background: rgba(4, 9, 17, 0.62) !important;
  }
  [data-ace-grid-theme="material-3-dark"] .ace-grid__json-editor-header,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__json-editor-footer {
    border-color: var(--ace-grid-md3-panel-divider) !important;
    background: var(--ace-grid-md3-panel-bg-subtle) !important;
  }
  [data-ace-grid-theme="material-3-dark"] .ace-grid__json-editor-title {
    color: var(--ace-grid-text-primary) !important;
    text-shadow: none !important;
  }
  [data-ace-grid-theme="material-3-dark"] .ace-grid__json-editor-pane-label {
    color: var(--ace-grid-text-secondary) !important;
    text-shadow: none !important;
  }
  [data-ace-grid-theme="material-3-dark"] .ace-grid__json-editor-meta {
    color: var(--ace-grid-text-muted) !important;
  }
  [data-ace-grid-theme="material-3-dark"] .ace-grid__json-editor-meta--error {
    color: var(--ace-grid-danger-border) !important;
  }
  [data-ace-grid-theme="material-3-dark"] .ace-grid__json-editor-close,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__json-editor-button {
    color: var(--ace-grid-md3-icon-muted) !important;
    text-shadow: none !important;
  }
  [data-ace-grid-theme="material-3-dark"] .ace-grid__json-editor-body {
    background: var(--ace-grid-md3-panel-bg) !important;
  }
  [data-ace-grid-theme="material-3-dark"] .ace-grid__json-editor-pane {
    border-color: var(--ace-grid-md3-panel-divider) !important;
    background: var(--ace-grid-md3-panel-bg-raised) !important;
  }
  [data-ace-grid-theme="material-3-dark"] .ace-grid__json-editor-pane-head {
    border-bottom: 0 !important;
    background: color-mix(
      in srgb,
      var(--ace-grid-md3-panel-bg-subtle) 80%,
      transparent
    ) !important;
  }
  [data-ace-grid-theme="material-3-dark"] .ace-grid__json-editor-textarea,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__json-editor-preview {
    border-top-color: var(--ace-grid-md3-panel-divider) !important;
    background: var(--ace-grid-md3-panel-bg-raised) !important;
  }
  [data-ace-grid-theme="material-3-dark"] .ace-grid__json-editor-preview {
    color: var(--ace-grid-text-secondary) !important;
  }
  [data-ace-grid-theme="material-3-dark"] .ace-grid__json-editor-textarea::selection,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__json-editor-textarea *::selection {
    background: rgba(147, 197, 253, 0.34) !important;
    color: #071424 !important;
  }

  [data-ace-grid-theme="material-3-dark"] .ace-grid__column-filter-label,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__column-filter-option,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__chart-title,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__chart-subtitle,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__chart-mapping-label,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__chart-mapping-value,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__json-editor-title,
  [data-ace-grid-theme="material-3-dark"] .ace-grid__json-editor-pane-label {
    text-shadow: none !important;
  }
`;

const liquidGlassDarkCssOverrides = `
  [data-ace-grid-theme="liquid-glass-dark"] {
    --ace-grid-liquid-shell:
      linear-gradient(
        180deg,
        rgba(27, 34, 47, 0.96) 0%,
        rgba(20, 26, 37, 0.94) 100%
      );
    --ace-grid-liquid-panel:
      linear-gradient(
        180deg,
        rgba(31, 40, 56, 0.66) 0%,
        rgba(20, 27, 39, 0.62) 100%
      );
    --ace-grid-liquid-panel-strong:
      linear-gradient(
        180deg,
        rgba(34, 44, 62, 0.82) 0%,
        rgba(19, 26, 37, 0.78) 100%
      );
    --ace-grid-liquid-border: rgba(136, 154, 178, 0.22);
    --ace-grid-liquid-border-strong: rgba(136, 154, 178, 0.3);
    --ace-grid-liquid-edge: rgba(136, 154, 178, 0.24);
    --ace-grid-liquid-edge-soft: rgba(244, 250, 255, 0.08);
    --ace-grid-liquid-shadow:
      0 2px 6px rgba(0, 0, 0, 0.2),
      0 14px 34px rgba(0, 0, 0, 0.26);
    --ace-grid-liquid-overlay-bg:
      linear-gradient(
        180deg,
        rgba(23, 30, 42, 0.94) 0%,
        rgba(16, 22, 31, 0.92) 100%
      );
    --ace-grid-liquid-overlay-bg-solid:
      linear-gradient(
        180deg,
        rgba(20, 26, 37, 0.98) 0%,
        rgba(14, 19, 27, 0.97) 100%
      );
    --ace-grid-liquid-overlay-bg-strong:
      linear-gradient(
        180deg,
        rgba(28, 36, 50, 0.96) 0%,
        rgba(17, 24, 34, 0.94) 100%
      );
    --ace-grid-liquid-overlay-border: rgba(136, 154, 178, 0.28);
    --ace-grid-liquid-overlay-shadow:
      0 8px 20px rgba(0, 0, 0, 0.3),
      0 20px 42px rgba(0, 0, 0, 0.34);
    --ace-grid-liquid-overlay-backdrop: blur(10px) saturate(118%);
    --ace-grid-liquid-tooltip-backdrop: blur(10px) saturate(116%);
    --ace-grid-liquid-border-gloss-top: rgba(245, 250, 255, 0.12);
    --ace-grid-liquid-border-gloss-bottom: rgba(80, 97, 122, 0.2);
    --ace-grid-liquid-hairline: rgba(135, 153, 177, 0.12);
    --ace-grid-liquid-hairline-strong: rgba(135, 153, 177, 0.2);
    --ace-grid-liquid-gridline: 1px solid var(--ace-grid-liquid-hairline);
    --ace-grid-liquid-header-band-bg: rgba(28, 35, 49, 0.94);
    --ace-grid-formula-bg: var(--ace-grid-liquid-header-band-bg);
    --ace-grid-formula-badge-bg: var(--ace-grid-liquid-header-band-bg);
    --ace-grid-cell-border-color: var(--ace-grid-liquid-hairline);
    --ace-grid-cell-border-color-alt: var(--ace-grid-liquid-hairline);
    --ace-grid-cell-border-top-color: var(--ace-grid-liquid-hairline);
    --ace-grid-cell-border-bottom-color: var(--ace-grid-liquid-hairline);
    --ace-grid-fill-handle-size: 12px;
    --ace-grid-fill-handle-radius: 999px;
    --ace-grid-fill-handle-offset: -5px;
    --ace-grid-fill-handle-border-width: 1px;
    --ace-grid-fill-handle-border: rgba(226, 241, 255, 0.84);
    --ace-grid-fill-handle-bg: var(--ace-grid-selection-border);
    --ace-grid-fill-handle-bg-hover: color-mix(
      in srgb,
      var(--ace-grid-selection-border) 84%,
      #ffffff 16%
    );
    --ace-grid-fill-handle-inner: 2px;
    --ace-grid-fill-handle-inner-border: 1px solid rgba(233, 245, 255, 0.38);
    --ace-grid-fill-handle-shadow:
      0 4px 10px rgba(18, 90, 165, 0.36),
      0 0 0 1px rgba(42, 170, 255, 0.28);
    --ace-grid-liquid-button-bg:
      linear-gradient(
        180deg,
        rgba(38, 48, 65, 0.9) 0%,
        rgba(25, 33, 47, 0.88) 100%
      );
    --ace-grid-liquid-button-bg-active:
      linear-gradient(
        180deg,
        rgba(57, 182, 255, 0.98) 0%,
        rgba(42, 170, 255, 0.94) 100%
      );
    --ace-grid-liquid-button-border: rgba(136, 154, 178, 0.26);
    --ace-grid-liquid-button-border-active: rgba(42, 170, 255, 0.72);
    --ace-grid-liquid-button-shadow:
      0 1px 1px rgba(0, 0, 0, 0.2),
      0 3px 8px rgba(0, 0, 0, 0.22),
      inset 0 1px 0 rgba(245, 250, 255, 0.08);
    --ace-grid-liquid-button-shadow-hover:
      0 2px 3px rgba(0, 0, 0, 0.22),
      0 6px 14px rgba(0, 0, 0, 0.26),
      inset 0 1px 0 rgba(245, 250, 255, 0.11);
    --ace-grid-liquid-button-shadow-active:
      0 1px 1px rgba(7, 44, 84, 0.22),
      0 5px 11px rgba(9, 86, 162, 0.24),
      inset 0 1px 0 rgba(245, 250, 255, 0.16);
    --ace-grid-pinned-row-top-bg: rgba(24, 30, 42, 0.98);
    --ace-grid-pinned-row-bottom-bg: rgba(24, 30, 42, 0.98);
    --ace-grid-pinned-row-top-shadow:
      inset 0 -1px 0 rgba(136, 154, 178, 0.16),
      0 4px 10px rgba(0, 0, 0, 0.18);
    --ace-grid-pinned-row-bottom-shadow:
      inset 0 1px 0 rgba(136, 154, 178, 0.16),
      0 -4px 10px rgba(0, 0, 0, 0.18);
    --ace-grid-validation-tooltip-bg:
      linear-gradient(
        180deg,
        rgba(24, 30, 42, 0.98) 0%,
        rgba(17, 23, 33, 0.96) 100%
      );
    --ace-grid-validation-tooltip-text: #e4efff;
    --ace-grid-validation-tooltip-shadow:
      0 10px 22px rgba(0, 0, 0, 0.26),
      0 20px 42px rgba(0, 0, 0, 0.3);
    --ace-grid-liquid-picker-icon-color: rgba(213, 231, 251, 0.88);
    --ace-grid-liquid-picker-icon-color-hover: #57c6ff;
    --ace-grid-row-detail-bg:
      linear-gradient(
        180deg,
        rgba(23, 30, 42, 0.98) 0%,
        rgba(18, 24, 35, 0.97) 100%
      );
    --ace-grid-row-detail-border-top: rgba(136, 154, 178, 0.24);
    --ace-grid-row-detail-gutter: 8px 10px 10px;
    --ace-grid-row-detail-padding: 14px 16px;
    --ace-grid-row-detail-inner-bg:
      linear-gradient(
        180deg,
        rgba(30, 39, 54, 0.9) 0%,
        rgba(23, 31, 45, 0.86) 100%
      );
    --ace-grid-row-detail-inner-border: 1px solid rgba(136, 154, 178, 0.22);
    --ace-grid-row-detail-inner-radius: 14px;
    --ace-grid-row-detail-inner-shadow: inset 0 1px 0 rgba(244, 250, 255, 0.1);
    --ace-grid-row-detail-shadow: none;
    --ace-grid-row-detail-backdrop: none;
  }

  [data-ace-grid-theme="liquid-glass-dark"].ace-grid__wrapper {
    border-color: rgba(245, 250, 255, 0.08);
    background:
      linear-gradient(
        180deg,
        rgba(34, 42, 58, 0.34) 0%,
        rgba(24, 31, 43, 0.3) 100%
      ),
      linear-gradient(
        145deg,
        rgba(86, 104, 134, 0.14) 0%,
        rgba(39, 50, 69, 0.14) 100%
      );
    box-shadow:
      0 12px 34px rgba(0, 0, 0, 0.28),
      0 2px 10px rgba(0, 0, 0, 0.18),
      inset 0 1px 0 rgba(245, 250, 255, 0.08),
      inset 0 -1px 0 rgba(91, 108, 132, 0.14);
  }
  [data-ace-grid-theme="liquid-glass-dark"].ace-grid__wrapper::before {
    background: linear-gradient(
      132deg,
      rgba(255, 255, 255, 0.08) 7%,
      rgba(255, 255, 255, 0.03) 31%,
      rgba(255, 255, 255, 0.01) 54%,
      rgba(255, 255, 255, 0) 72%
    );
  }
  [data-ace-grid-theme="liquid-glass-dark"].ace-grid__wrapper::after {
    border-color: rgba(255, 255, 255, 0.07);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  }
  .ace-grid[data-ace-grid-theme="liquid-glass-dark"] {
    background:
      linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.03) 0%,
        rgba(255, 255, 255, 0.015) 100%
      );
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__header-cell:hover,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__header-group-cell:hover {
    background: rgba(34, 45, 62, 0.86);
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__header-cell--system,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__floating-filter-cell--system,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__header-segment--left,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__header-segment--right,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__floating-filter-segment--left,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__floating-filter-segment--right {
    background: rgba(24, 31, 43, 0.96) !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__header-cell-title,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__header-group-label-text {
    color: #e7f0ff;
    text-shadow: 0 1px 0 rgba(0, 0, 0, 0.28);
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__header-group-label {
    padding-inline: 0 6px;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__row-group,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__infinite-scroll-row {
    background: rgba(23, 30, 42, 0.46);
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__row-group:nth-child(2n) {
    background: rgba(27, 35, 49, 0.54);
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__row-group:hover {
    background: rgba(33, 42, 58, 0.6);
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__row-hover-overlay {
    --ace-grid-row-hover-overlay-bg: linear-gradient(
      180deg,
      rgba(48, 104, 174, 0.22),
      rgba(34, 82, 145, 0.14)
    );
    --ace-grid-row-hover-overlay-shadow:
      inset 0 1px 0 rgba(230, 244, 255, 0.05),
      inset 0 -1px 0 rgba(79, 126, 190, 0.18);
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__cell-loading-bar {
    background: linear-gradient(
      90deg,
      rgba(82, 100, 123, 0.28) 0%,
      rgba(74, 140, 212, 0.44) 50%,
      rgba(82, 100, 123, 0.28) 100%
    );
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.04),
      inset 0 0 0 1px rgba(124, 146, 174, 0.12);
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__formula-bar-input-wrap {
    border-color: rgba(131, 149, 173, 0.24);
    background: rgba(22, 28, 40, 0.9);
    box-shadow:
      inset 0 1px 2px rgba(0, 0, 0, 0.2),
      inset 0 0 0 1px rgba(255, 255, 255, 0.03);
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__formula-bar-input-wrap:hover {
    border-color: rgba(139, 157, 182, 0.28);
    background: rgba(25, 32, 45, 0.94);
    box-shadow:
      inset 0 1px 2px rgba(0, 0, 0, 0.22),
      inset 0 0 0 1px rgba(255, 255, 255, 0.04);
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__formula-bar-input-wrap:focus-within {
    background: rgba(26, 34, 47, 0.98);
    box-shadow:
      inset 0 0 0 1px rgba(42, 170, 255, 0.62),
      inset 0 1px 0 rgba(255, 255, 255, 0.06),
      0 1px 2px rgba(0, 0, 0, 0.22);
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__formula-bar-input {
    color: #dfeaff;
    caret-color: #2aa8ff;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__formula-bar-input::placeholder {
    color: rgba(156, 176, 201, 0.64);
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__formula-bar-badge {
    border-color: rgba(133, 151, 175, 0.24) !important;
    background: rgba(25, 32, 45, 0.94) !important;
    color: #d7e6fb !important;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.05),
      inset 0 0 0 1px rgba(255, 255, 255, 0.02) !important;
  }

  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__formula-suggestions,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__context-menu,
  [data-ace-grid-theme="liquid-glass-dark"].ace-grid__context-menu,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-panel,
  [data-ace-grid-theme="liquid-glass-dark"].ace-grid__chart-panel,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor,
  [data-ace-grid-theme="liquid-glass-dark"].ace-grid__json-editor,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-tooltip,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__sparkline-tooltip,
  [data-ace-grid-theme="liquid-glass-dark"].ace-grid__sparkline-tooltip {
    background: linear-gradient(
      180deg,
      rgba(32, 40, 56, 0.97) 0%,
      rgba(24, 31, 43, 0.95) 100%
    ) !important;
    border-color: rgba(137, 156, 182, 0.28) !important;
    box-shadow:
      0 12px 28px rgba(0, 0, 0, 0.28),
      0 3px 10px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.06) !important;
    color: #e4efff !important;
  }

  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-panel,
  [data-ace-grid-theme="liquid-glass-dark"].ace-grid__chart-panel,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor {
    background: linear-gradient(
      180deg,
      rgba(34, 43, 59, 0.98) 0%,
      rgba(25, 32, 45, 0.96) 100%
    ) !important;
    border: 1px solid rgba(137, 156, 182, 0.24) !important;
    box-shadow:
      0 14px 34px rgba(0, 0, 0, 0.3),
      0 4px 12px rgba(0, 0, 0, 0.16),
      inset 0 1px 0 rgba(255, 255, 255, 0.06) !important;
    color: #e4efff !important;
  }

  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-tabs,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-series-toggle {
    border-color: rgba(137, 156, 182, 0.2) !important;
    background: rgba(18, 24, 35, 0.46) !important;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.18) !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-tab,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-series-toggle .ace-grid__chart-toggle-button {
    color: rgba(197, 214, 238, 0.82) !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-tab--active,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-series-toggle .ace-grid__chart-toggle-button--active {
    border-color: rgba(137, 156, 182, 0.24) !important;
    background: rgba(241, 248, 255, 0.08) !important;
    color: #edf5ff !important;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08) !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-tab:hover,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-series-toggle .ace-grid__chart-toggle-button:hover {
    color: #edf5ff !important;
    border-color: rgba(137, 156, 182, 0.2) !important;
    background: rgba(241, 248, 255, 0.04) !important;
  }

  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-panel,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__context-menu {
    color: #e4efff !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-section > label,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-section > div > label:not(.ace-grid__column-filter-option),
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-title,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-settings-title,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-settings-section-title,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-title,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-pane-label {
    color: #e6f0ff !important;
    text-shadow: none !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-action,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-option,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-subtitle,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-type-label,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-grouping-label,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-settings-label,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-mapping-label,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-meta {
    color: rgba(176, 196, 222, 0.78) !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-mapping-value {
    color: #e4efff !important;
  }

  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-body,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-section,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-actions,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-toolbar,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-body,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-settings,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-legend,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-zoom,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-header,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-footer,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-body {
    background: transparent !important;
    border-color: rgba(137, 156, 182, 0.18) !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-toolbar,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-header,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-footer {
    background: rgba(255, 255, 255, 0.02) !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-toolbar,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-settings-header,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-toolbar-row--brush,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-legend,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-zoom,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-actions,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-header,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-footer {
    border-color: rgba(137, 156, 182, 0.18) !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-settings {
    border-left-color: rgba(137, 156, 182, 0.18) !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-zoom--vertical {
    border-left-color: rgba(137, 156, 182, 0.18) !important;
  }

  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-options,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-stage,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-canvas,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-pane,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-textarea,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-preview {
    background: rgba(18, 24, 35, 0.62) !important;
    border-color: rgba(137, 156, 182, 0.2) !important;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03) !important;
    color: #e4efff !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-option:hover {
    background: rgba(241, 248, 255, 0.05) !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-action:hover {
    color: #cbe6ff !important;
    background: rgba(42, 170, 255, 0.1) !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-button--clear,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-button--ghost {
    background: rgba(255, 255, 255, 0.03) !important;
    border-color: rgba(137, 156, 182, 0.2) !important;
    color: #cfe0f8 !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-action,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-button,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-close,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-type-button,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-toggle-button {
    color: rgba(205, 222, 246, 0.9) !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-action-icon,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-close {
    color: rgba(205, 222, 246, 0.9) !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-mapping-item {
    background: rgba(255, 255, 255, 0.03) !important;
    border-color: rgba(137, 156, 182, 0.18) !important;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.05),
      0 1px 3px rgba(0, 0, 0, 0.16) !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-zoom-track {
    border-color: rgba(137, 156, 182, 0.22) !important;
    background: rgba(17, 23, 33, 0.7) !important;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04) !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-zoom-window {
    border-color: rgba(42, 170, 255, 0.46) !important;
    background: rgba(42, 170, 255, 0.16) !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-zoom-handle {
    border-color: rgba(137, 156, 182, 0.24) !important;
    background: rgba(34, 43, 59, 0.96) !important;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.22) !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-panel input[type="radio"] {
    accent-color: #2aa8ff;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter .ace-grid__column-filter-search::placeholder,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter .ace-grid__column-filter-input::placeholder,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-settings-input::placeholder {
    color: rgba(156, 176, 201, 0.62) !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__floating-filter-input,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__floating-filter-select,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-search,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-input,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-select,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-range-input,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__pagination-select,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-type-select,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-grouping-select,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-settings-select,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-settings-input,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__cell-editor-select {
    border-color: rgba(133, 151, 175, 0.24);
    background: rgba(17, 23, 33, 0.96);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
    color: #e2ecff;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__floating-filter-input:focus,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__floating-filter-select:focus,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-search:focus,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-input:focus,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-select:focus,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-range-input:focus,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__pagination-select:focus,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-type-select:focus,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-grouping-select:focus,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-settings-select:focus,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-settings-input:focus,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__cell-editor-select:focus {
    border-color: rgba(42, 170, 255, 0.58);
    box-shadow:
      0 0 0 3px rgba(42, 170, 255, 0.16),
      inset 0 1px 0 rgba(255, 255, 255, 0.06);
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid::-webkit-scrollbar-thumb {
    background: linear-gradient(
      180deg,
      rgba(116, 132, 155, 0.56) 0%,
      rgba(96, 113, 137, 0.5) 100%
    );
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(
      180deg,
      rgba(136, 153, 177, 0.68) 0%,
      rgba(112, 129, 154, 0.62) 100%
    );
  }

  /* Final tuning pass: lighter charcoal glass + consistent panel/control surfaces. */
  [data-ace-grid-theme="liquid-glass-dark"] {
    --ace-grid-liquid-shell:
      linear-gradient(
        180deg,
        rgba(52, 63, 84, 0.94) 0%,
        rgba(41, 50, 68, 0.92) 100%
      );
    --ace-grid-liquid-header-band-bg: rgba(50, 61, 82, 0.9);
    --ace-grid-liquid-overlay-bg-solid:
      linear-gradient(
        180deg,
        rgba(68, 82, 108, 0.95) 0%,
        rgba(52, 64, 87, 0.92) 100%
      );
    --ace-grid-liquid-overlay-bg-strong:
      linear-gradient(
        180deg,
        rgba(74, 89, 116, 0.94) 0%,
        rgba(56, 69, 94, 0.92) 100%
      );
    --ace-grid-liquid-overlay-border: rgba(176, 196, 222, 0.22);
    --ace-grid-liquid-hairline: rgba(176, 196, 222, 0.1);
    --ace-grid-liquid-hairline-strong: rgba(176, 196, 222, 0.18);
    --ace-grid-liquid-button-bg:
      linear-gradient(
        180deg,
        rgba(92, 108, 136, 0.6) 0%,
        rgba(73, 88, 115, 0.56) 100%
      );
    --ace-grid-liquid-button-border: rgba(188, 207, 230, 0.16);
    --ace-grid-liquid-button-shadow:
      0 1px 1px rgba(0, 0, 0, 0.12),
      0 3px 10px rgba(0, 0, 0, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.12);
  }

  [data-ace-grid-theme="liquid-glass-dark"].ace-grid__wrapper {
    background:
      linear-gradient(
        180deg,
        rgba(84, 101, 130, 0.18) 0%,
        rgba(57, 70, 95, 0.16) 100%
      ),
      linear-gradient(
        145deg,
        rgba(133, 154, 189, 0.12) 0%,
        rgba(72, 88, 117, 0.12) 100%
      );
    box-shadow:
      0 14px 36px rgba(0, 0, 0, 0.18),
      0 3px 12px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.12),
      inset 0 -1px 0 rgba(142, 164, 195, 0.1);
  }

  .ace-grid[data-ace-grid-theme="liquid-glass-dark"] {
    background:
      linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.05) 0%,
        rgba(255, 255, 255, 0.03) 100%
      );
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__row-group,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__infinite-scroll-row {
    background: rgba(56, 68, 91, 0.34);
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__row-group:nth-child(2n) {
    background: rgba(62, 75, 101, 0.38);
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__row-group:hover {
    background: rgba(78, 93, 123, 0.34);
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__row-group--has-spans:hover {
    background: rgba(56, 68, 91, 0.34);
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__row-group:nth-child(2n).ace-grid__row-group--has-spans:hover {
    background: rgba(62, 75, 101, 0.38);
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__row-group--has-spans {
    outline: none;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__header-cell:hover,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__header-group-cell:hover {
    background: rgba(71, 86, 113, 0.66);
  }

  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__formula-suggestions,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__context-menu,
  [data-ace-grid-theme="liquid-glass-dark"].ace-grid__context-menu,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-panel,
  [data-ace-grid-theme="liquid-glass-dark"].ace-grid__chart-panel,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor,
  [data-ace-grid-theme="liquid-glass-dark"].ace-grid__json-editor,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-tooltip,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__sparkline-tooltip,
  [data-ace-grid-theme="liquid-glass-dark"].ace-grid__sparkline-tooltip {
    background: linear-gradient(
      180deg,
      rgba(78, 94, 123, 0.9) 0%,
      rgba(60, 73, 98, 0.88) 100%
    ) !important;
    border-color: rgba(193, 211, 234, 0.18) !important;
    box-shadow:
      0 14px 30px rgba(0, 0, 0, 0.16),
      0 4px 12px rgba(0, 0, 0, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.12) !important;
  }

  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-toolbar,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-settings,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-legend,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-zoom,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-header,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-footer,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-actions {
    background: rgba(255, 255, 255, 0.02) !important;
  }

  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-tabs,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-series-toggle {
    background: rgba(36, 45, 61, 0.4) !important;
    border-color: rgba(193, 211, 234, 0.14) !important;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08) !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-tab,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-series-toggle .ace-grid__chart-toggle-button {
    color: rgba(216, 230, 249, 0.86) !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-tab--active,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-series-toggle .ace-grid__chart-toggle-button--active {
    background: rgba(255, 255, 255, 0.14) !important;
    border-color: rgba(193, 211, 234, 0.16) !important;
    color: #f1f7ff !important;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12) !important;
  }

  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-section > label,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-section > div > label:not(.ace-grid__column-filter-option),
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-title,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-settings-title,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-settings-section-title,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-title {
    color: #eef5ff !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-subtitle,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-type-label,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-grouping-label,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-settings-label,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-action,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-option {
    color: rgba(196, 214, 239, 0.82) !important;
  }

  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter .ace-grid__column-filter-search,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter .ace-grid__column-filter-input,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter .ace-grid__column-filter-select,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter .ace-grid__column-filter-range-input,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__floating-filter-input,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__floating-filter-select,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__pagination-select,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-type-select,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-grouping-select,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-settings-select,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-settings-input,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__cell-editor-select {
    border: 1px solid rgba(193, 211, 234, 0.16) !important;
    background: rgba(255, 255, 255, 0.14) !important;
    color: #eef5ff !important;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.12),
      inset 0 0 0 1px rgba(255, 255, 255, 0.03) !important;
    -webkit-text-fill-color: #eef5ff;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter .ace-grid__column-filter-search::placeholder,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter .ace-grid__column-filter-input::placeholder,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-settings-input::placeholder {
    color: rgba(190, 209, 233, 0.56) !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter .ace-grid__column-filter-search:focus,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter .ace-grid__column-filter-input:focus,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter .ace-grid__column-filter-select:focus,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter .ace-grid__column-filter-range-input:focus,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__floating-filter-input:focus,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__floating-filter-select:focus,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__pagination-select:focus,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-type-select:focus,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-grouping-select:focus,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-settings-select:focus,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-settings-input:focus,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__cell-editor-select:focus {
    border-color: rgba(42, 170, 255, 0.52) !important;
    background: rgba(255, 255, 255, 0.18) !important;
    box-shadow:
      0 0 0 3px rgba(42, 170, 255, 0.14),
      inset 0 1px 0 rgba(255, 255, 255, 0.14) !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter select option,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-panel select option,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor select option {
    background: #2f3a4f;
    color: #eef5ff;
  }

  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-options,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-stage,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-canvas,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-textarea,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-preview {
    background: rgba(34, 43, 59, 0.44) !important;
    border-color: rgba(193, 211, 234, 0.14) !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-mapping-item {
    background: rgba(242, 248, 255, 0.06) !important;
    border-color: rgba(156, 177, 206, 0.16) !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-mapping-label {
    color: rgba(196, 214, 239, 0.74) !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-mapping-value {
    color: #eef5ff !important;
  }

  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-button--clear,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-button--ghost {
    background: rgba(255, 255, 255, 0.12) !important;
    border-color: rgba(193, 211, 234, 0.14) !important;
    color: #dbe9fc !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-button--clear:hover,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-button--ghost:hover {
    background: rgba(255, 255, 255, 0.16) !important;
    border-color: rgba(193, 211, 234, 0.2) !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-action,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-button,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-close,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-type-button,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-toggle-button {
    color: rgba(221, 234, 252, 0.92) !important;
  }

  /* JSON editor polish for dark mode */
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-overlay,
  [data-ace-grid-theme="liquid-glass-dark"].ace-grid__json-editor-overlay {
    background: rgba(22, 29, 42, 0.42) !important;
    backdrop-filter: blur(16px) saturate(118%) !important;
    -webkit-backdrop-filter: blur(16px) saturate(118%) !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor,
  [data-ace-grid-theme="liquid-glass-dark"].ace-grid__json-editor {
    background: linear-gradient(
      180deg,
      rgba(86, 104, 136, 0.86) 0%,
      rgba(66, 81, 108, 0.82) 100%
    ) !important;
    border: 1px solid rgba(206, 223, 244, 0.14) !important;
    box-shadow:
      0 22px 52px rgba(0, 0, 0, 0.18),
      0 8px 20px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.14) !important;
    color: #eff6ff !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-header,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-footer {
    background:
      linear-gradient(
        180deg,
        rgba(101, 122, 157, 0.28) 0%,
        rgba(77, 95, 124, 0.24) 100%
      ) !important;
    border-color: rgba(206, 223, 244, 0.12) !important;
    backdrop-filter: blur(10px) saturate(110%) !important;
    -webkit-backdrop-filter: blur(10px) saturate(110%) !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-title {
    color: #f2f7ff !important;
    text-shadow: 0 1px 0 rgba(0, 0, 0, 0.18) !important;
    letter-spacing: 0.006em;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-close {
    border: 1px solid rgba(206, 223, 244, 0.12) !important;
    background: rgba(255, 255, 255, 0.12) !important;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.08),
      0 1px 4px rgba(0, 0, 0, 0.12) !important;
    color: rgba(221, 234, 252, 0.92) !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-close:hover {
    background: rgba(255, 255, 255, 0.18) !important;
    border-color: rgba(206, 223, 244, 0.18) !important;
    color: #f3f8ff !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-body {
    background: rgba(42, 53, 73, 0.24) !important;
    gap: 10px !important;
    padding: 12px !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-pane {
    gap: 6px !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-pane-head {
    gap: 10px !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-pane-label {
    border: 1px solid rgba(206, 223, 244, 0.12) !important;
    background: rgba(255, 255, 255, 0.14) !important;
    color: rgba(210, 227, 248, 0.76) !important;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.14) !important;
    letter-spacing: 0.075em !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-textarea,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-preview {
    border: 1px solid rgba(206, 223, 244, 0.12) !important;
    border-radius: 12px !important;
    background:
      linear-gradient(
        180deg,
        rgba(38, 49, 67, 0.72) 0%,
        rgba(30, 39, 54, 0.68) 100%
      ) !important;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.1),
      inset 0 0 0 1px rgba(255, 255, 255, 0.015),
      0 1px 3px rgba(0, 0, 0, 0.12) !important;
    color: #e9f3ff !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-textarea {
    caret-color: #3bb4ff !important;
    selection-color: auto;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-textarea::selection,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-textarea *::selection {
    background: rgba(98, 183, 255, 0.32);
    color: #f5fbff;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-textarea:focus {
    border-color: rgba(59, 180, 255, 0.5) !important;
    box-shadow:
      0 0 0 2px rgba(59, 180, 255, 0.14),
      inset 0 1px 0 rgba(255, 255, 255, 0.12),
      0 3px 10px rgba(13, 93, 165, 0.16) !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-meta {
    color: rgba(190, 209, 233, 0.72) !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-actions {
    gap: 8px !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-button {
    border-radius: 10px !important;
    border: 1px solid rgba(206, 223, 244, 0.12) !important;
    background: rgba(255, 255, 255, 0.12) !important;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.12),
      0 1px 4px rgba(0, 0, 0, 0.12) !important;
    color: #dbe9fc !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-button:hover {
    background: rgba(255, 255, 255, 0.18) !important;
    border-color: rgba(206, 223, 244, 0.18) !important;
    color: #edf6ff !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-button--format {
    min-height: 24px !important;
    height: 24px !important;
    background: rgba(255, 255, 255, 0.16) !important;
    color: #dfeeff !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-button--ghost {
    background: rgba(255, 255, 255, 0.1) !important;
    color: rgba(211, 228, 249, 0.84) !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-button--primary {
    background:
      linear-gradient(
        180deg,
        rgba(70, 183, 255, 0.98) 0%,
        rgba(37, 156, 245, 0.96) 100%
      ) !important;
    border: 1px solid rgba(34, 145, 232, 0.9) !important;
    color: #f7fbff !important;
    box-shadow:
      0 6px 14px rgba(20, 115, 194, 0.24),
      inset 0 1px 0 rgba(214, 240, 255, 0.44) !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-button--primary:hover {
    filter: brightness(1.04) saturate(1.02);
  }

  /* Global control consistency for dark mode */
  [data-ace-grid-theme="liquid-glass-dark"] {
    --ace-grid-lgd-control-bg:
      linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.14) 0%,
        rgba(255, 255, 255, 0.1) 100%
      );
    --ace-grid-lgd-control-bg-hover:
      linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.2) 0%,
        rgba(255, 255, 255, 0.14) 100%
      );
    --ace-grid-lgd-control-bg-pressed:
      linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.1) 0%,
        rgba(255, 255, 255, 0.07) 100%
      );
    --ace-grid-lgd-control-border: rgba(204, 223, 246, 0.16);
    --ace-grid-lgd-control-border-strong: rgba(204, 223, 246, 0.22);
    --ace-grid-lgd-control-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.14),
      inset 0 0 0 1px rgba(255, 255, 255, 0.02),
      0 1px 4px rgba(0, 0, 0, 0.1);
    --ace-grid-lgd-control-shadow-hover:
      inset 0 1px 0 rgba(255, 255, 255, 0.18),
      inset 0 0 0 1px rgba(255, 255, 255, 0.03),
      0 2px 6px rgba(0, 0, 0, 0.12);
    --ace-grid-lgd-control-text: #eef5ff;
    --ace-grid-lgd-control-text-muted: rgba(202, 220, 244, 0.84);
    --ace-grid-lgd-control-placeholder: rgba(194, 214, 238, 0.58);
  }

  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__sort-button,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__filter-trigger,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__header-group-toggle,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__pin-button,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__row-pin-button,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__pagination-button,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-button,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-button,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-close,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-type-button,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-toggle-button,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-action,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-close,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-settings-close,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-settings-reset,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__context-menu-color-apply {
    border-color: var(--ace-grid-lgd-control-border) !important;
    background: var(--ace-grid-lgd-control-bg) !important;
    box-shadow: var(--ace-grid-lgd-control-shadow) !important;
    color: var(--ace-grid-lgd-control-text) !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__sort-button:hover,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__filter-trigger:hover,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__header-group-toggle:hover,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__pin-button:hover,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__row-pin-button:not(:disabled):hover,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__pagination-button:hover,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-button:hover,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-button:hover,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-close:hover,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-type-button:hover,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-toggle-button:hover,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-action:hover,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-close:hover,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-settings-close:hover,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-settings-reset:hover,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__context-menu-color-apply:hover {
    border-color: var(--ace-grid-lgd-control-border-strong) !important;
    background: var(--ace-grid-lgd-control-bg-hover) !important;
    box-shadow: var(--ace-grid-lgd-control-shadow-hover) !important;
    color: #f6fbff !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__sort-button:active,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__filter-trigger:active,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__header-group-toggle:active,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__pin-button:active,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__row-pin-button:not(:disabled):active,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__pagination-button:active,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-button:active,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-button:active,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-close:active,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-type-button:active,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-toggle-button:active,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-action:active,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-close:active,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-settings-close:active,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-settings-reset:active,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__context-menu-color-apply:active {
    background: var(--ace-grid-lgd-control-bg-pressed) !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-button--clear,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-button--ghost {
    border-color: var(--ace-grid-lgd-control-border) !important;
    background: var(--ace-grid-lgd-control-bg) !important;
    color: var(--ace-grid-lgd-control-text-muted) !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-button--apply,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-button--primary,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__context-menu-color-apply {
    color: #f7fbff !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__sort-button:disabled,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__filter-trigger:disabled,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__header-group-toggle:disabled,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__pin-button:disabled,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__row-pin-button:disabled,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__pagination-button:disabled,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-button:disabled,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-button:disabled,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-close:disabled,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-type-button:disabled,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-toggle-button:disabled,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-action:disabled,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-close:disabled,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-settings-close:disabled,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-settings-reset:disabled,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__context-menu-color-apply:disabled {
    opacity: 0.48;
    filter: saturate(0.72);
  }

  /* Header action icons should match row icon-button treatment */
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__sort-button,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__filter-trigger,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__header-group-toggle,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__pin-button {
    min-width: 18px !important;
    min-height: 18px !important;
    height: 18px !important;
    border-radius: 999px !important;
    border-width: 1px !important;
    border-style: solid !important;
    box-sizing: border-box;
    justify-content: center;
    line-height: 1;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__sort-button {
    width: auto !important;
    padding: 0 4px !important;
    gap: 2px;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__filter-trigger,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__header-group-toggle,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__pin-button {
    width: 18px !important;
    padding: 0 !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__header-cell-actions {
    gap: 5px !important;
  }

  /* Header icon contrast for dark pill buttons */
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__header-cell .ace-grid__sort-icon,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__header-cell .ace-grid__filter-icon,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__header-cell .ace-grid__pin-icon,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__header-cell .ace-grid__filter-trigger-icon,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__header-cell .ace-grid__drag-handle-icon {
    color: rgba(223, 237, 255, 0.82) !important;
    opacity: 0.96;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__header-cell .ace-grid__sort-order {
    color: rgba(223, 237, 255, 0.86) !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__header-group-cell .ace-grid__header-group-toggle {
    color: rgba(223, 237, 255, 0.82) !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__sort-button:hover .ace-grid__sort-icon,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__filter-trigger:hover .ace-grid__filter-icon,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__pin-button:hover .ace-grid__pin-icon,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__row-pin-button:not(:disabled):hover .ace-grid__row-pin-icon,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__row-detail-toggle-button:hover .ace-grid__row-detail-toggle-icon,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__header-group-toggle:hover {
    color: #57c6ff !important;
    opacity: 1 !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__header-cell:hover
      .ace-grid__sort-button:not(:hover):not(.ace-grid__sort-button--active)
      .ace-grid__sort-icon,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__header-cell:hover
      .ace-grid__filter-trigger:not(:hover):not(.ace-grid__filter-trigger--open):not(.ace-grid__filter-trigger--active)
      .ace-grid__filter-icon,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__header-cell:hover
      .ace-grid__pin-button:not(:hover):not(.ace-grid__pin-button--active)
      .ace-grid__pin-icon,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__header-cell:hover .ace-grid__drag-handle-icon {
    color: rgba(223, 237, 255, 0.82) !important;
    opacity: 0.96 !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__sort-button--active .ace-grid__sort-icon,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__sort-icon--active,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__filter-trigger--open .ace-grid__filter-icon,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__filter-trigger-icon--open .ace-grid__filter-icon,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__filter-trigger--active .ace-grid__filter-icon,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__filter-trigger-icon--active .ace-grid__filter-icon,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__pin-button--active .ace-grid__pin-icon,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__pin-icon--active,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__row-pin-button--active .ace-grid__row-pin-icon,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__row-pin-icon--active {
    color: #57c6ff !important;
    opacity: 1 !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__sort-button--active .ace-grid__sort-order {
    color: #57c6ff !important;
  }

  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid input[type="checkbox"],
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter input[type="checkbox"],
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-panel input[type="checkbox"],
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__row-select-checkbox,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__header-cell-select,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-checkbox,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__cell-editor-checkbox {
    border: 1px solid rgba(204, 223, 246, 0.16) !important;
    background:
      linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.16) 0%,
        rgba(255, 255, 255, 0.11) 100%
      ) !important;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.16),
      0 1px 3px rgba(0, 0, 0, 0.12) !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid input[type="checkbox"]:hover,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter input[type="checkbox"]:hover,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-panel input[type="checkbox"]:hover,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__row-select-checkbox:hover,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__header-cell-select:hover,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-checkbox:hover,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__cell-editor-checkbox:hover {
    border-color: rgba(204, 223, 246, 0.22) !important;
    background:
      linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.22) 0%,
        rgba(255, 255, 255, 0.14) 100%
      ) !important;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.2),
      0 2px 5px rgba(0, 0, 0, 0.14) !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid input[type="checkbox"]:checked,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter input[type="checkbox"]:checked,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-panel input[type="checkbox"]:checked,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__row-select-checkbox:checked,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__header-cell-select:checked,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-checkbox:checked,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__cell-editor-checkbox:checked {
    border-color: rgba(38, 161, 247, 0.72) !important;
    background:
      linear-gradient(
        180deg,
        rgba(95, 196, 255, 0.96) 0%,
        rgba(37, 156, 245, 0.94) 100%
      ) !important;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.36),
      0 3px 8px rgba(18, 106, 182, 0.2) !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid input[type="checkbox"]:indeterminate,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter input[type="checkbox"]:indeterminate,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-panel input[type="checkbox"]:indeterminate,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__row-select-checkbox:indeterminate,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__header-cell-select:indeterminate,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-checkbox:indeterminate,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__cell-editor-checkbox:indeterminate {
    border-color: rgba(38, 161, 247, 0.66) !important;
    background:
      linear-gradient(
        180deg,
        rgba(108, 201, 255, 0.9) 0%,
        rgba(37, 156, 245, 0.84) 100%
      ) !important;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.32),
      0 3px 8px rgba(18, 106, 182, 0.16) !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid input[type="checkbox"]:checked::after,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter input[type="checkbox"]:checked::after,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-panel input[type="checkbox"]:checked::after,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__row-select-checkbox:checked::after,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__header-cell-select:checked::after,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-checkbox:checked::after,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__cell-editor-checkbox:checked::after {
    border-color: rgba(248, 251, 255, 0.98);
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid input[type="checkbox"]:indeterminate::after,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter input[type="checkbox"]:indeterminate::after,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-panel input[type="checkbox"]:indeterminate::after,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__row-select-checkbox:indeterminate::after,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__header-cell-select:indeterminate::after,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-checkbox:indeterminate::after,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__cell-editor-checkbox:indeterminate::after {
    background: rgba(248, 251, 255, 0.98);
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid input[type="checkbox"]:disabled,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter input[type="checkbox"]:disabled,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-panel input[type="checkbox"]:disabled,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__row-select-checkbox:disabled,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__header-cell-select:disabled,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-checkbox:disabled,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__cell-editor-checkbox:disabled {
    opacity: 0.46 !important;
    filter: saturate(0.72);
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__row-select.ace-grid__row-select--active {
    background: var(--ace-grid-cell-bg, var(--ace-grid-surface-subtle)) !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid input[type="radio"],
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-panel input[type="radio"] {
    accent-color: #3bb4ff;
  }

  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__floating-filter-input,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__floating-filter-select,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-search,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-input,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-select,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-range-input,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__pagination-select,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-type-select,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-grouping-select,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-settings-select,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-settings-input,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__cell-editor-select,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__cell-editor-input,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__cell-editor-textarea {
    border-color: var(--ace-grid-lgd-control-border) !important;
    background: var(--ace-grid-lgd-control-bg) !important;
    color: var(--ace-grid-lgd-control-text) !important;
    box-shadow: var(--ace-grid-lgd-control-shadow) !important;
    -webkit-text-fill-color: var(--ace-grid-lgd-control-text);
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__floating-filter-select,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-select,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-type-select,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-grouping-select,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-settings-select,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__cell-editor-select {
    appearance: none !important;
    -webkit-appearance: none !important;
    background-image: url("data:image/svg+xml,%3Csvg%20viewBox%3D%270%200%2016%2016%27%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20fill%3D%27none%27%20stroke%3D%27%23c4d6ef%27%20stroke-width%3D%272%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%3E%3Cpath%20d%3D%27M4.75%206.5%208%209.75%2011.25%206.5%27/%3E%3C/svg%3E") !important;
    background-repeat: no-repeat !important;
    background-size: 16px 16px !important;
    background-position: right 10px center !important;
    padding-right: 32px !important;
    line-height: normal !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__floating-filter-select {
    background-position: right 8px center !important;
    padding-right: 30px !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter .ace-grid__column-filter-select {
    background-image: url("data:image/svg+xml,%3Csvg%20viewBox%3D%270%200%2016%2016%27%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20fill%3D%27none%27%20stroke%3D%27%23c4d6ef%27%20stroke-width%3D%272%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%3E%3Cpath%20d%3D%27M4.75%206.5%208%209.75%2011.25%206.5%27/%3E%3C/svg%3E") !important;
    background-repeat: no-repeat !important;
    background-size: 16px 16px !important;
    background-position: right 10px center !important;
    padding-right: 34px !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__pagination-select-wrap {
    align-items: center;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__pagination-caret {
    right: 10px !important;
    top: 50% !important;
    width: 16px !important;
    height: 16px !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    transform: translateY(-50%) !important;
    color: #c4d6ef !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__pagination-caret svg {
    display: block;
    width: 16px;
    height: 16px;
    stroke-width: 2;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__floating-filter-input::placeholder,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-search::placeholder,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-input::placeholder,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-settings-input::placeholder,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__cell-editor-input::placeholder,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__cell-editor-textarea::placeholder {
    color: var(--ace-grid-lgd-control-placeholder) !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__floating-filter-input:focus,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__floating-filter-select:focus,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-search:focus,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-input:focus,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-select:focus,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-range-input:focus,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__pagination-select:focus,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-type-select:focus,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-grouping-select:focus,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-settings-select:focus,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-settings-input:focus,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__cell-editor-select:focus,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__cell-editor-input:focus,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__cell-editor-textarea:focus {
    border-color: rgba(59, 180, 255, 0.46) !important;
    background: var(--ace-grid-lgd-control-bg-hover) !important;
    box-shadow:
      0 0 0 3px rgba(59, 180, 255, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.16) !important;
    color: #f6fbff !important;
  }

  [data-ace-grid-theme="liquid-glass-dark"] :is(
      .ace-grid__floating-filter-input,
      .ace-grid__column-filter-input,
      .ace-grid__column-filter-range-input,
      .ace-grid__chart-settings-input,
      .ace-grid__cell-editor-input
    ):is([type="date"], [type="time"], [type="datetime-local"]) {
    color-scheme: dark;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.01em;
    padding-inline-end: 32px !important;
    --ace-grid-liquid-picker-icon-mask: var(--ace-grid-liquid-date-icon);
  }
  [data-ace-grid-theme="liquid-glass-dark"] :is(
      .ace-grid__floating-filter-input,
      .ace-grid__column-filter-input,
      .ace-grid__column-filter-range-input,
      .ace-grid__chart-settings-input,
      .ace-grid__cell-editor-input
    ):is([type="date"], [type="time"], [type="datetime-local"])::-webkit-datetime-edit {
    color: var(--ace-grid-lgd-control-text) !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] :is(
      .ace-grid__floating-filter-input,
      .ace-grid__column-filter-input,
      .ace-grid__column-filter-range-input,
      .ace-grid__chart-settings-input,
      .ace-grid__cell-editor-input
    )[type="date"]::-webkit-calendar-picker-indicator {
    --ace-grid-liquid-picker-icon-mask: var(--ace-grid-liquid-date-icon);
  }
  [data-ace-grid-theme="liquid-glass-dark"] :is(
      .ace-grid__floating-filter-input,
      .ace-grid__column-filter-input,
      .ace-grid__column-filter-range-input,
      .ace-grid__chart-settings-input,
      .ace-grid__cell-editor-input
    )[type="time"]::-webkit-calendar-picker-indicator {
    --ace-grid-liquid-picker-icon-mask: var(--ace-grid-liquid-time-icon);
  }
  [data-ace-grid-theme="liquid-glass-dark"] :is(
      .ace-grid__floating-filter-input,
      .ace-grid__column-filter-input,
      .ace-grid__column-filter-range-input,
      .ace-grid__chart-settings-input,
      .ace-grid__cell-editor-input
    )[type="datetime-local"]::-webkit-calendar-picker-indicator {
    --ace-grid-liquid-picker-icon-mask: var(--ace-grid-liquid-datetime-icon);
  }
  [data-ace-grid-theme="liquid-glass-dark"] :is(
      .ace-grid__floating-filter-input,
      .ace-grid__column-filter-input,
      .ace-grid__column-filter-range-input,
      .ace-grid__chart-settings-input,
      .ace-grid__cell-editor-input
    ):is([type="date"], [type="time"], [type="datetime-local"])::-webkit-calendar-picker-indicator {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    min-width: 16px;
    height: 16px;
    margin-inline-start: 6px;
    padding: 0;
    border: 0;
    border-radius: 0;
    background-color: var(--ace-grid-liquid-picker-icon-color);
    background-image: none;
    box-shadow: none;
    -webkit-mask-image: var(--ace-grid-liquid-picker-icon-mask);
    -webkit-mask-repeat: no-repeat;
    -webkit-mask-position: center;
    -webkit-mask-size: 16px 16px;
    mask-image: var(--ace-grid-liquid-picker-icon-mask);
    mask-repeat: no-repeat;
    mask-position: center;
    mask-size: 16px 16px;
    color: transparent;
    opacity: 0.98;
    cursor: pointer;
  }
  [data-ace-grid-theme="liquid-glass-dark"] :is(
      .ace-grid__floating-filter-input,
      .ace-grid__column-filter-input,
      .ace-grid__column-filter-range-input,
      .ace-grid__chart-settings-input,
      .ace-grid__cell-editor-input
    ):is([type="date"], [type="time"], [type="datetime-local"])::-webkit-calendar-picker-indicator:hover {
    background-color: var(--ace-grid-liquid-picker-icon-color-hover);
    opacity: 1;
  }
  [data-ace-grid-theme="liquid-glass-dark"] :is(
      .ace-grid__floating-filter-input,
      .ace-grid__column-filter-input,
      .ace-grid__column-filter-range-input,
      .ace-grid__chart-settings-input,
      .ace-grid__cell-editor-input
    ):is([type="date"], [type="time"], [type="datetime-local"]):focus::-webkit-calendar-picker-indicator {
    background-color: var(--ace-grid-liquid-picker-icon-color-hover);
    opacity: 1;
  }
  [data-ace-grid-theme="liquid-glass-dark"] :is(
      .ace-grid__floating-filter-input,
      .ace-grid__column-filter-input,
      .ace-grid__column-filter-range-input,
      .ace-grid__chart-settings-input,
      .ace-grid__cell-editor-input
    ):is([type="date"], [type="time"], [type="datetime-local"])::-webkit-clear-button,
  [data-ace-grid-theme="liquid-glass-dark"] :is(
      .ace-grid__floating-filter-input,
      .ace-grid__column-filter-input,
      .ace-grid__column-filter-range-input,
      .ace-grid__chart-settings-input,
      .ace-grid__cell-editor-input
    ):is([type="date"], [type="time"], [type="datetime-local"])::-webkit-inner-spin-button {
    opacity: 0.72;
  }

  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter select option,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-panel select option,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor select option,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__floating-filter-select option,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__pagination-select option,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__cell-editor-select option {
    background: #556784;
    color: #f1f7ff;
  }

  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__context-menu-color-swatch {
    border-color: rgba(210, 227, 248, 0.22) !important;
    box-shadow:
      0 1px 4px rgba(0, 0, 0, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.18) !important;
  }

  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-toggle-button--active,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-action--settings-active,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-action--maximize-active {
    border-color: rgba(37, 156, 245, 0.78) !important;
    background:
      linear-gradient(
        180deg,
        rgba(83, 195, 255, 0.96) 0%,
        rgba(37, 156, 245, 0.94) 100%
      ) !important;
    box-shadow:
      0 6px 14px rgba(20, 115, 194, 0.2),
      inset 0 1px 0 rgba(214, 240, 255, 0.38) !important;
    color: #f7fbff !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-toggle-button--active:hover,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-action--settings-active:hover,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-action--maximize-active:hover,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-button--apply:hover,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-button--primary:hover,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__context-menu-color-apply:hover {
    filter: brightness(1.04) saturate(1.02);
    border-color: rgba(34, 145, 232, 0.9) !important;
  }

  /* Opaque dark panels (remove glass transparency in dark mode) */
  [data-ace-grid-theme="liquid-glass-dark"] {
    --ace-grid-lgd-panel-solid: #4a5872;
    --ace-grid-lgd-panel-solid-2: #414e66;
    --ace-grid-lgd-panel-edge: rgba(214, 228, 247, 0.14);
    --ace-grid-lgd-panel-divider: rgba(214, 228, 247, 0.1);
    --ace-grid-lgd-surface-solid: #36435a;
    --ace-grid-lgd-surface-solid-2: #303c51;
    --ace-grid-lgd-header-solid: #35425a;
    --ace-grid-lgd-header-solid-2: #2f3b51;
    --ace-grid-lgd-header-divider: rgba(214, 228, 247, 0.11);
    --ace-grid-pinned-shadow-left-edge: 7px 0 12px rgba(7, 12, 20, 0.16);
    --ace-grid-pinned-shadow-right-edge: -7px 0 12px rgba(7, 12, 20, 0.16);
  }

  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__formula-suggestions,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__context-menu,
  [data-ace-grid-theme="liquid-glass-dark"].ace-grid__context-menu,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-panel,
  [data-ace-grid-theme="liquid-glass-dark"].ace-grid__chart-panel,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor,
  [data-ace-grid-theme="liquid-glass-dark"].ace-grid__json-editor,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-tooltip,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__sparkline-tooltip,
  [data-ace-grid-theme="liquid-glass-dark"].ace-grid__sparkline-tooltip {
    background: var(--ace-grid-lgd-panel-solid) !important;
    border-color: var(--ace-grid-lgd-panel-edge) !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    box-shadow:
      0 14px 30px rgba(0, 0, 0, 0.16),
      0 4px 12px rgba(0, 0, 0, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
  }

  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-tabs,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-body,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-section,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-options,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-actions,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-toolbar,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-body,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-settings,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-legend,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-zoom,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-header,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-footer,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-body {
    background: var(--ace-grid-lgd-panel-solid) !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }

  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-settings,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-legend,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-zoom,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-toolbar,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-settings-header,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-toolbar-row--brush,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-actions,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-header,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-footer {
    border-color: var(--ace-grid-lgd-panel-divider) !important;
  }

  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-stage,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-canvas,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-textarea,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-preview,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-options {
    background: var(--ace-grid-lgd-surface-solid) !important;
    border-color: rgba(214, 228, 247, 0.12) !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.06),
      inset 0 0 0 1px rgba(255, 255, 255, 0.015) !important;
  }

  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-tabs,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-series-toggle {
    background: var(--ace-grid-lgd-surface-solid-2) !important;
    border-color: rgba(214, 228, 247, 0.1) !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-settings-row .ace-grid__chart-series-toggle {
    align-self: flex-start;
  }

  /* Formula bar should blend into the header band and use the same control styling */
  [data-ace-grid-theme="liquid-glass-dark"].ace-grid__wrapper > .ace-grid__formula-bar,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__formula-bar {
    background: var(--ace-grid-lgd-header-solid) !important;
    border-bottom-color: var(--ace-grid-lgd-header-divider) !important;
    box-shadow: none !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__formula-bar-input-wrap {
    border-color: var(--ace-grid-lgd-control-border) !important;
    background: var(--ace-grid-lgd-control-bg) !important;
    box-shadow: var(--ace-grid-lgd-control-shadow) !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__formula-bar-input-wrap:hover {
    border-color: var(--ace-grid-lgd-control-border-strong) !important;
    background: var(--ace-grid-lgd-control-bg-hover) !important;
    box-shadow: var(--ace-grid-lgd-control-shadow-hover) !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__formula-bar-input-wrap:focus-within {
    border-color: rgba(59, 180, 255, 0.46) !important;
    background: var(--ace-grid-lgd-control-bg-hover) !important;
    box-shadow:
      0 0 0 3px rgba(59, 180, 255, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.16) !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__formula-bar-input {
    border: 0 !important;
    background: transparent !important;
    box-shadow: none !important;
    color: var(--ace-grid-lgd-control-text) !important;
    -webkit-text-fill-color: var(--ace-grid-lgd-control-text);
    caret-color: #57c6ff !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__formula-bar-input::placeholder {
    color: var(--ace-grid-lgd-control-placeholder) !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__formula-bar-input:focus {
    outline: none !important;
    box-shadow: none !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__formula-bar-badge {
    border-color: var(--ace-grid-lgd-control-border) !important;
    background: var(--ace-grid-lgd-control-bg) !important;
    box-shadow: var(--ace-grid-lgd-control-shadow) !important;
    color: var(--ace-grid-lgd-control-text-muted) !important;
  }

  /* Remove dark pane wrapper blocks in JSON editor (keep only inner pane surfaces) */
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-pane,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-pane-head {
    background: transparent !important;
    border-color: transparent !important;
    box-shadow: none !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }

  /* Panel action buttons: shared primary/secondary styling */
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-button,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-button,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__context-menu-color-apply,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-settings-reset {
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
    min-height: 32px !important;
    padding: 0 14px !important;
    border-radius: 12px !important;
    line-height: 1 !important;
    font-size: 11px !important;
    font-weight: 620 !important;
    letter-spacing: 0.01em;
    text-shadow: none !important;
    border-width: 1px !important;
    border-style: solid !important;
    box-sizing: border-box;
    transition:
      background 0.16s ease,
      border-color 0.16s ease,
      box-shadow 0.16s ease,
      color 0.16s ease,
      transform 0.12s ease !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-button--format {
    min-height: 24px !important;
    height: 24px !important;
    padding: 0 12px !important;
    border-radius: 999px !important;
    font-size: 10px !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-button--clear,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-button--ghost,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-button--format,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-settings-reset,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-surface-button {
    border-color: rgba(214, 228, 247, 0.2) !important;
    background:
      linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.16) 0%,
        rgba(255, 255, 255, 0.1) 100%
      ) !important;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.16),
      inset 0 0 0 1px rgba(255, 255, 255, 0.02),
      0 2px 6px rgba(0, 0, 0, 0.12) !important;
    color: rgba(230, 241, 255, 0.92) !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-button--clear:hover,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-button--ghost:hover,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-button--format:hover,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-settings-reset:hover,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-surface-button:hover {
    border-color: rgba(214, 228, 247, 0.28) !important;
    background:
      linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.22) 0%,
        rgba(255, 255, 255, 0.14) 100%
      ) !important;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.22),
      inset 0 0 0 1px rgba(255, 255, 255, 0.03),
      0 3px 8px rgba(0, 0, 0, 0.14) !important;
    color: #f3f9ff !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-button--clear:active,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-button--ghost:active,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-button--format:active,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-settings-reset:active,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-surface-button:active {
    transform: translateY(0.5px) !important;
    background:
      linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.11) 0%,
        rgba(255, 255, 255, 0.08) 100%
      ) !important;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.1),
      0 1px 4px rgba(0, 0, 0, 0.12) !important;
  }

  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-button--apply,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-button--primary,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__context-menu-color-apply {
    border-color: rgba(38, 153, 240, 0.9) !important;
    background:
      linear-gradient(
        180deg,
        rgba(89, 202, 255, 0.98) 0%,
        rgba(44, 166, 246, 0.96) 46%,
        rgba(28, 135, 232, 0.96) 100%
      ) !important;
    box-shadow:
      0 6px 12px rgba(15, 96, 168, 0.2),
      0 2px 5px rgba(10, 62, 114, 0.16),
      inset 0 1px 0 rgba(232, 248, 255, 0.5),
      inset 0 -1px 0 rgba(16, 96, 171, 0.28) !important;
    color: #f7fbff !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-button--apply:hover,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-button--primary:hover,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__context-menu-color-apply:hover {
    border-color: rgba(46, 164, 248, 0.95) !important;
    background:
      linear-gradient(
        180deg,
        rgba(108, 212, 255, 0.99) 0%,
        rgba(56, 176, 252, 0.97) 46%,
        rgba(34, 143, 238, 0.97) 100%
      ) !important;
    box-shadow:
      0 8px 14px rgba(15, 102, 178, 0.22),
      0 2px 6px rgba(10, 66, 124, 0.17),
      inset 0 1px 0 rgba(238, 251, 255, 0.56),
      inset 0 -1px 0 rgba(19, 104, 183, 0.28) !important;
    filter: none !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-button--apply:active,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-button--primary:active,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__context-menu-color-apply:active {
    transform: translateY(0.5px) !important;
    background:
      linear-gradient(
        180deg,
        rgba(61, 184, 255, 0.97) 0%,
        rgba(34, 151, 242, 0.96) 100%
      ) !important;
    box-shadow:
      0 3px 7px rgba(13, 86, 152, 0.18),
      inset 0 1px 0 rgba(220, 243, 255, 0.34) !important;
  }

  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__column-filter-button:disabled,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__json-editor-button:disabled,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__context-menu-color-apply:disabled,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__chart-settings-reset:disabled {
    transform: none !important;
  }

  /* Opaque dark header surfaces */
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__header,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__header-row,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__floating-filter-row {
    background: var(--ace-grid-lgd-header-solid) !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }

  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__header-cell,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__header-group-cell,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__floating-filter-cell,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__header-cell--system,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__floating-filter-cell--system {
    background: var(--ace-grid-lgd-header-solid) !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    border-bottom-color: var(--ace-grid-lgd-header-divider) !important;
  }

  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__header-segment--left,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__header-segment--right,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__floating-filter-segment--left,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__floating-filter-segment--right {
    background: var(--ace-grid-lgd-header-solid-2) !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    box-shadow: none !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__header-segment--left,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__floating-filter-segment--left {
    border-right-color: transparent !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__header-segment--right,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__floating-filter-segment--right {
    border-left-color: transparent !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__header-segment--left {
    box-shadow: var(--ace-grid-pinned-shadow-left-edge) !important;
    clip-path: inset(0 calc(-1 * var(--ace-grid-pinned-edge-shadow-bleed, 14px)) 0 0);
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__header-segment--right {
    box-shadow: var(--ace-grid-pinned-shadow-right-edge) !important;
    clip-path: inset(0 0 0 calc(-1 * var(--ace-grid-pinned-edge-shadow-bleed, 14px)));
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__floating-filter-segment--left,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__floating-filter-segment--right {
    box-shadow: none !important;
    clip-path: none;
  }

  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__header-cell:hover,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__header-group-cell:hover {
    background: var(--ace-grid-lgd-header-solid) !important;
  }
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__cell.ace-grid__cell--validation-highlight,
  [data-ace-grid-theme="liquid-glass-dark"] .ace-grid__cell-editor.ace-grid__cell--validation-highlight {
    box-shadow: var(--ace-grid-cell-shadow, 0 0 0 rgba(0, 0, 0, 0)) !important;
    outline: 1px solid var(--ace-grid-validation-color) !important;
    outline-offset: -1px;
  }
`;

const getMaterial3Css = (() => {
  let cached: string | null = null;
  return (): string => {
    if (cached != null) return cached;
    cached = `${retargetThemeCss(liquidGlassTheme.css, "liquid-glass", "material-3")}
${material3Css}`;
    return cached;
  };
})();

const getMaterial3DarkCss = (() => {
  let cached: string | null = null;
  return (): string => {
    if (cached != null) return cached;
    cached = `${retargetThemeCss(getMaterial3Css(), "material-3", "material-3-dark")}
${material3DarkCssOverrides}`;
    return cached;
  };
})();

const getLiquidGlassDarkCss = (() => {
  let cached: string | null = null;
  return (): string => {
    if (cached != null) return cached;
    cached = `${retargetThemeCss(liquidGlassTheme.css, "liquid-glass", "liquid-glass-dark")}
${liquidGlassDarkCssOverrides}`;
    return cached;
  };
})();

export const material3Theme: GridTheme = {
  name: "Material 3",
  description:
    "Material 3 refined theme built on the Liquid Glass layout system with neutral Android-like surfaces and disciplined spacing.",
  get tokens() {
    return getMaterial3Tokens();
  },
  get css() {
    return getMaterial3Css();
  },
};

export const material3DarkTheme: GridTheme = {
  name: "Material 3 Dark",
  description:
    "Material 3 dark variant built on the Liquid Glass layout system with neutral Android-like contrast and flat controls.",
  get tokens() {
    return getMaterial3DarkTokens();
  },
  get css() {
    return getMaterial3DarkCss();
  },
};

export const liquidGlassDarkTheme: GridTheme = {
  name: "Liquid Glass Dark",
  description:
    "Dark liquid-glass variant with layered translucent surfaces, cool accents, and low-light contrast tuning.",
  tokens: liquidGlassDarkTokens,
  get css() {
    return getLiquidGlassDarkCss();
  },
};

export const builtInThemes = {
  data: dataTheme,
  dataDark: dataDarkTheme,
  material3: material3Theme,
  material3Dark: material3DarkTheme,
  liquidGlass: liquidGlassTheme,
  liquidGlassDark: liquidGlassDarkTheme,
} as const;
