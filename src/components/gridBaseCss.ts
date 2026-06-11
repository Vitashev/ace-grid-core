// Base grid styles injected by Grid
export const GRID_BASE_CSS = `

.ace-grid {
  background: var(--ace-grid-surface-base, #fff);
  color: var(--ace-grid-text-primary, #000);
  font-family: var(--ace-grid-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif);
  font-size: var(--ace-grid-font-size, 14px);
  --ace-grid-system-col-width-row-index: 52px;
  --ace-grid-system-col-width-row-detail: 28px;
  --ace-grid-system-col-width-row-pinning: 44px;
  --ace-grid-system-col-width-row-ordering: 36px;
  --ace-grid-system-col-width-row-selection: 36px;
  line-height: 1.4;
  border: var(--ace-grid-border, 1px solid var(--ace-grid-border-color, rgba(0,0,0,0.08)));
  border-radius: var(--ace-grid-border-radius, 6px);
  box-shadow: var(--ace-grid-shadow, none);
  backdrop-filter: var(--ace-grid-backdrop-filter, none);
  overflow: hidden;
  position: relative;
  overscroll-behavior: contain;
  overflow-anchor: none;
  transition: box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.ace-grid.ace-grid--with-formula-bar {
  border-top-left-radius: 0 !important;
  border-top-right-radius: 0 !important;
}

.ace-grid__wrapper:has(> .ace-grid__pagination) > .ace-grid {
  border-bottom-left-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}

.ace-grid__wrapper:has(> .ace-grid__pagination + .ace-grid) > .ace-grid {
  border-top-left-radius: 0 !important;
  border-top-right-radius: 0 !important;
}

.ace-grid.ace-grid--system-widths-roomy {
  --ace-grid-system-col-width-row-index: 56px;
  --ace-grid-system-col-width-row-detail: 32px;
  --ace-grid-system-col-width-row-pinning: 72px;
  --ace-grid-system-col-width-row-ordering: 40px;
  --ace-grid-system-col-width-row-selection: 40px;
}

.ace-grid.ace-grid--system-widths-compact {
  --ace-grid-system-col-width-row-index: 48px;
  --ace-grid-system-col-width-row-detail: 26px;
  --ace-grid-system-col-width-row-pinning: 40px;
  --ace-grid-system-col-width-row-ordering: 32px;
  --ace-grid-system-col-width-row-selection: 32px;
}

.ace-grid:focus,
.ace-grid:focus-visible {
  outline: none;
}

.ace-grid__wrapper {
  position: relative;
  overscroll-behavior: contain;
  overflow-anchor: none;
}

/*
 * Normalize browser-native controls so grid UI has the same geometry and
 * interaction styling on macOS, Windows, and Linux. Theme tokens still own
 * the colors, radii, and surfaces.
 */
.ace-grid,
.ace-grid__column-filter,
.ace-grid__chart-panel,
.ace-grid__json-editor,
.ace-grid__pagination,
.ace-grid__formula-bar {
  color-scheme: light;
}

[data-ace-grid-theme="classic-dark"] :where(
  .ace-grid,
  .ace-grid__column-filter,
  .ace-grid__chart-panel,
  .ace-grid__json-editor,
  .ace-grid__pagination,
  .ace-grid__formula-bar
),
[data-ace-grid-theme="data-dark"] :where(
  .ace-grid,
  .ace-grid__column-filter,
  .ace-grid__chart-panel,
  .ace-grid__json-editor,
  .ace-grid__pagination,
  .ace-grid__formula-bar
),
[data-ace-grid-theme="material-3-dark"] :where(
  .ace-grid,
  .ace-grid__column-filter,
  .ace-grid__chart-panel,
  .ace-grid__json-editor,
  .ace-grid__pagination,
  .ace-grid__formula-bar
),
[data-ace-grid-theme="liquid-glass-dark"] :where(
  .ace-grid,
  .ace-grid__column-filter,
  .ace-grid__chart-panel,
  .ace-grid__json-editor,
  .ace-grid__pagination,
  .ace-grid__formula-bar
) {
  color-scheme: dark;
}

.ace-grid :where(button, input, select, textarea),
.ace-grid__column-filter :where(button, input, select, textarea),
.ace-grid__chart-panel :where(button, input, select, textarea),
.ace-grid__json-editor :where(button, input, select, textarea),
.ace-grid__pagination :where(button, input, select, textarea),
.ace-grid__formula-bar :where(button, input, select, textarea) {
  font: inherit;
}

.ace-grid :where(button, select),
.ace-grid__column-filter :where(button, select),
.ace-grid__chart-panel :where(button, select),
.ace-grid__json-editor :where(button, select),
.ace-grid__pagination :where(button, select),
.ace-grid__formula-bar :where(button, select) {
  -webkit-appearance: none;
  appearance: none;
}

.ace-grid :where(select),
.ace-grid__column-filter :where(select),
.ace-grid__chart-panel :where(select),
.ace-grid__json-editor :where(select) {
  padding-right: 30px !important;
  background-image:
    linear-gradient(45deg, transparent 50%, currentColor 50%),
    linear-gradient(135deg, currentColor 50%, transparent 50%) !important;
  background-position:
    calc(100% - 14px) calc(50% - 1px),
    calc(100% - 9px) calc(50% - 1px) !important;
  background-repeat: no-repeat !important;
  background-size: 5px 5px, 5px 5px;
  cursor: pointer;
}

.ace-grid :where(select:disabled),
.ace-grid__column-filter :where(select:disabled),
.ace-grid__chart-panel :where(select:disabled),
.ace-grid__json-editor :where(select:disabled) {
  cursor: not-allowed;
  opacity: 0.58;
}

.ace-grid :where(input[type="checkbox"], input[type="radio"]),
.ace-grid__column-filter :where(input[type="checkbox"], input[type="radio"]),
.ace-grid__chart-panel :where(input[type="checkbox"], input[type="radio"]),
.ace-grid__json-editor :where(input[type="checkbox"], input[type="radio"]) {
  -webkit-appearance: none;
  appearance: none;
  position: relative;
  flex: 0 0 auto;
  width: 16px;
  height: 16px;
  margin: 0;
  border: 1px solid var(--ace-grid-border-color-strong, rgba(100, 116, 139, 0.72));
  background: var(--ace-grid-surface-raised, #fff);
  box-shadow: inset 0 1px 1px rgba(15, 23, 42, 0.06);
  cursor: pointer;
  box-sizing: border-box;
  transition:
    background-color 0.14s ease,
    border-color 0.14s ease,
    box-shadow 0.14s ease,
    opacity 0.14s ease;
}

.ace-grid :where(input[type="checkbox"]),
.ace-grid__column-filter :where(input[type="checkbox"]),
.ace-grid__chart-panel :where(input[type="checkbox"]),
.ace-grid__json-editor :where(input[type="checkbox"]) {
  border-radius: max(3px, calc(var(--ace-grid-border-radius-sm, 6px) * 0.65));
}

.ace-grid :where(input[type="radio"]),
.ace-grid__column-filter :where(input[type="radio"]),
.ace-grid__chart-panel :where(input[type="radio"]),
.ace-grid__json-editor :where(input[type="radio"]) {
  border-radius: 50%;
}

.ace-grid :where(input[type="checkbox"]:hover, input[type="radio"]:hover),
.ace-grid__column-filter :where(input[type="checkbox"]:hover, input[type="radio"]:hover),
.ace-grid__chart-panel :where(input[type="checkbox"]:hover, input[type="radio"]:hover),
.ace-grid__json-editor :where(input[type="checkbox"]:hover, input[type="radio"]:hover) {
  border-color: var(--ace-grid-checkbox-accent, #2563eb);
}

.ace-grid :where(input[type="checkbox"]:focus-visible, input[type="radio"]:focus-visible),
.ace-grid__column-filter :where(input[type="checkbox"]:focus-visible, input[type="radio"]:focus-visible),
.ace-grid__chart-panel :where(input[type="checkbox"]:focus-visible, input[type="radio"]:focus-visible),
.ace-grid__json-editor :where(input[type="checkbox"]:focus-visible, input[type="radio"]:focus-visible) {
  outline: none;
  box-shadow:
    0 0 0 var(--ace-grid-focus-outline-width, 2px)
      color-mix(in srgb, var(--ace-grid-focus-outline, #2563eb) 28%, transparent),
    inset 0 1px 1px rgba(15, 23, 42, 0.06);
}

.ace-grid :where(input[type="checkbox"]:checked, input[type="checkbox"]:indeterminate, input[type="radio"]:checked),
.ace-grid__column-filter :where(input[type="checkbox"]:checked, input[type="checkbox"]:indeterminate, input[type="radio"]:checked),
.ace-grid__chart-panel :where(input[type="checkbox"]:checked, input[type="checkbox"]:indeterminate, input[type="radio"]:checked),
.ace-grid__json-editor :where(input[type="checkbox"]:checked, input[type="checkbox"]:indeterminate, input[type="radio"]:checked) {
  border-color: var(--ace-grid-checkbox-accent, #2563eb);
  background: var(--ace-grid-checkbox-accent, #2563eb);
}

.ace-grid :where(input[type="checkbox"]:checked)::after,
.ace-grid__column-filter :where(input[type="checkbox"]:checked)::after,
.ace-grid__chart-panel :where(input[type="checkbox"]:checked)::after,
.ace-grid__json-editor :where(input[type="checkbox"]:checked)::after {
  content: "";
  position: absolute;
  left: 4px;
  top: 1px;
  width: 5px;
  height: 9px;
  border: solid var(--ace-grid-text-on-accent, #fff);
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  box-sizing: border-box;
}

.ace-grid :where(input[type="checkbox"]:indeterminate)::after,
.ace-grid__column-filter :where(input[type="checkbox"]:indeterminate)::after,
.ace-grid__chart-panel :where(input[type="checkbox"]:indeterminate)::after,
.ace-grid__json-editor :where(input[type="checkbox"]:indeterminate)::after {
  content: "";
  position: absolute;
  left: 3px;
  right: 3px;
  top: 6px;
  height: 2px;
  border-radius: 999px;
  background: var(--ace-grid-text-on-accent, #fff);
}

.ace-grid :where(input[type="radio"]:checked)::after,
.ace-grid__column-filter :where(input[type="radio"]:checked)::after,
.ace-grid__chart-panel :where(input[type="radio"]:checked)::after,
.ace-grid__json-editor :where(input[type="radio"]:checked)::after {
  content: "";
  position: absolute;
  inset: 4px;
  border-radius: 50%;
  background: var(--ace-grid-text-on-accent, #fff);
}

.ace-grid :where(input[type="checkbox"]:disabled, input[type="radio"]:disabled),
.ace-grid__column-filter :where(input[type="checkbox"]:disabled, input[type="radio"]:disabled),
.ace-grid__chart-panel :where(input[type="checkbox"]:disabled, input[type="radio"]:disabled),
.ace-grid__json-editor :where(input[type="checkbox"]:disabled, input[type="radio"]:disabled) {
  cursor: not-allowed;
  opacity: 0.48;
}

.ace-grid :where(input[type="number"]),
.ace-grid__column-filter :where(input[type="number"]),
.ace-grid__chart-panel :where(input[type="number"]),
.ace-grid__json-editor :where(input[type="number"]) {
  -moz-appearance: textfield;
}

.ace-grid :where(input[type="number"])::-webkit-inner-spin-button,
.ace-grid :where(input[type="number"])::-webkit-outer-spin-button,
.ace-grid__column-filter :where(input[type="number"])::-webkit-inner-spin-button,
.ace-grid__column-filter :where(input[type="number"])::-webkit-outer-spin-button,
.ace-grid__chart-panel :where(input[type="number"])::-webkit-inner-spin-button,
.ace-grid__chart-panel :where(input[type="number"])::-webkit-outer-spin-button,
.ace-grid__json-editor :where(input[type="number"])::-webkit-inner-spin-button,
.ace-grid__json-editor :where(input[type="number"])::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.ace-grid :where(input[type="search"])::-webkit-search-decoration,
.ace-grid :where(input[type="search"])::-webkit-search-cancel-button,
.ace-grid :where(input[type="search"])::-webkit-search-results-button,
.ace-grid :where(input[type="search"])::-webkit-search-results-decoration,
.ace-grid__column-filter :where(input[type="search"])::-webkit-search-decoration,
.ace-grid__column-filter :where(input[type="search"])::-webkit-search-cancel-button,
.ace-grid__column-filter :where(input[type="search"])::-webkit-search-results-button,
.ace-grid__column-filter :where(input[type="search"])::-webkit-search-results-decoration {
  -webkit-appearance: none;
}

.ace-grid :where(input[type="date"], input[type="time"], input[type="datetime-local"]) {
  min-width: 0;
  padding-right: 30px !important;
  background-repeat: no-repeat !important;
  background-position: right 8px center !important;
  background-size: 15px 15px !important;
}

.ace-grid :where(input[type="date"], input[type="datetime-local"]) {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='5' width='18' height='16' rx='2'/%3E%3Cpath d='M16 3v4M8 3v4M3 11h18'/%3E%3C/svg%3E") !important;
}

.ace-grid :where(input[type="time"]) {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='9'/%3E%3Cpath d='M12 7v5l3 2'/%3E%3C/svg%3E") !important;
}

.ace-grid :where(input[type="date"], input[type="time"], input[type="datetime-local"])::-webkit-calendar-picker-indicator {
  width: 18px;
  height: 18px;
  margin: 0 -24px 0 0;
  opacity: 0;
  cursor: pointer;
}

.ace-grid :where(input[type="color"]),
.ace-grid__column-filter :where(input[type="color"]),
.ace-grid__chart-panel :where(input[type="color"]) {
  -webkit-appearance: none;
  appearance: none;
  width: 32px;
  min-width: 32px;
  height: 28px;
  padding: 3px;
  border: 1px solid var(--ace-grid-border-color, rgba(148, 163, 184, 0.45));
  border-radius: var(--ace-grid-border-radius-sm, 6px);
  background: var(--ace-grid-surface-raised, #fff);
  cursor: pointer;
}

.ace-grid :where(input[type="color"])::-webkit-color-swatch-wrapper,
.ace-grid__column-filter :where(input[type="color"])::-webkit-color-swatch-wrapper,
.ace-grid__chart-panel :where(input[type="color"])::-webkit-color-swatch-wrapper {
  padding: 0;
}

.ace-grid :where(input[type="color"])::-webkit-color-swatch,
.ace-grid__column-filter :where(input[type="color"])::-webkit-color-swatch,
.ace-grid__chart-panel :where(input[type="color"])::-webkit-color-swatch {
  border: 0;
  border-radius: max(2px, calc(var(--ace-grid-border-radius-sm, 6px) * 0.55));
}

.ace-grid,
.ace-grid *,
.ace-grid__column-filter,
.ace-grid__column-filter *,
.ace-grid__chart-panel,
.ace-grid__chart-panel *,
.ace-grid__json-editor,
.ace-grid__json-editor * {
  scrollbar-width: thin;
  scrollbar-color:
    var(--ace-grid-scrollbar-thumb, rgba(100, 116, 139, 0.42))
    var(--ace-grid-scrollbar-track, rgba(148, 163, 184, 0.16));
}

.ace-grid::-webkit-scrollbar,
.ace-grid *::-webkit-scrollbar,
.ace-grid__column-filter::-webkit-scrollbar,
.ace-grid__column-filter *::-webkit-scrollbar,
.ace-grid__chart-panel::-webkit-scrollbar,
.ace-grid__chart-panel *::-webkit-scrollbar,
.ace-grid__json-editor::-webkit-scrollbar,
.ace-grid__json-editor *::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.ace-grid::-webkit-scrollbar-track,
.ace-grid *::-webkit-scrollbar-track,
.ace-grid__column-filter::-webkit-scrollbar-track,
.ace-grid__column-filter *::-webkit-scrollbar-track,
.ace-grid__chart-panel::-webkit-scrollbar-track,
.ace-grid__chart-panel *::-webkit-scrollbar-track,
.ace-grid__json-editor::-webkit-scrollbar-track,
.ace-grid__json-editor *::-webkit-scrollbar-track,
.ace-grid::-webkit-scrollbar-corner,
.ace-grid *::-webkit-scrollbar-corner,
.ace-grid__column-filter::-webkit-scrollbar-corner,
.ace-grid__column-filter *::-webkit-scrollbar-corner,
.ace-grid__chart-panel::-webkit-scrollbar-corner,
.ace-grid__chart-panel *::-webkit-scrollbar-corner,
.ace-grid__json-editor::-webkit-scrollbar-corner,
.ace-grid__json-editor *::-webkit-scrollbar-corner {
  background: var(--ace-grid-scrollbar-track, rgba(148, 163, 184, 0.16));
}

.ace-grid::-webkit-scrollbar-thumb,
.ace-grid *::-webkit-scrollbar-thumb,
.ace-grid__column-filter::-webkit-scrollbar-thumb,
.ace-grid__column-filter *::-webkit-scrollbar-thumb,
.ace-grid__chart-panel::-webkit-scrollbar-thumb,
.ace-grid__chart-panel *::-webkit-scrollbar-thumb,
.ace-grid__json-editor::-webkit-scrollbar-thumb,
.ace-grid__json-editor *::-webkit-scrollbar-thumb {
  min-width: 28px;
  min-height: 28px;
  border: 2px solid var(--ace-grid-scrollbar-track, rgba(148, 163, 184, 0.16));
  border-radius: 999px;
  background: var(--ace-grid-scrollbar-thumb, rgba(100, 116, 139, 0.42));
  background-clip: padding-box;
}

.ace-grid::-webkit-scrollbar-thumb:hover,
.ace-grid *::-webkit-scrollbar-thumb:hover,
.ace-grid__column-filter::-webkit-scrollbar-thumb:hover,
.ace-grid__column-filter *::-webkit-scrollbar-thumb:hover,
.ace-grid__chart-panel::-webkit-scrollbar-thumb:hover,
.ace-grid__chart-panel *::-webkit-scrollbar-thumb:hover,
.ace-grid__json-editor::-webkit-scrollbar-thumb:hover,
.ace-grid__json-editor *::-webkit-scrollbar-thumb:hover {
  background: var(--ace-grid-scrollbar-thumb-hover, rgba(100, 116, 139, 0.62));
  background-clip: padding-box;
}
.ace-grid__global-loading-indicator {
  position: absolute;
  top: calc(var(--ace-grid-header-total-height, 0px) + 8px);
  right: 10px;
  pointer-events: none;
  z-index: 690;
  opacity: 0;
  transform: translateY(-2px);
  transition: opacity 0.16s ease, transform 0.16s ease;
}

.ace-grid__themed-select {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
  text-align: left;
  cursor: pointer;
}
[data-ace-grid-theme] .ace-grid__themed-select.ace-grid__themed-select,
[data-ace-grid-theme] .ace-grid__column-filter .ace-grid__themed-select.ace-grid__themed-select,
[data-ace-grid-theme] .ace-grid__chart-panel .ace-grid__themed-select.ace-grid__themed-select {
  background-image: none !important;
  background-repeat: initial !important;
  background-position: initial !important;
  background-size: initial !important;
  padding-right: 9px !important;
}
.ace-grid__themed-select:disabled {
  cursor: not-allowed;
  opacity: 0.58;
}
.ace-grid__themed-select-value {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ace-grid__themed-select-caret {
  flex: 0 0 auto;
  margin-left: auto;
  width: 14px;
  height: 14px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0.72;
}
.ace-grid__themed-select-popup {
  position: fixed;
  z-index: 10000;
  overflow: auto;
  padding: 4px;
  box-sizing: border-box;
  border: 1px solid var(--ace-grid-select-popup-border);
  border-radius: var(--ace-grid-select-popup-radius);
  background: var(--ace-grid-select-popup-bg);
  color: var(--ace-grid-select-popup-text);
  box-shadow: var(--ace-grid-select-popup-shadow);
  font-family: var(--ace-grid-select-popup-font);
  font-size: var(--ace-grid-select-popup-font-size);
  scrollbar-width: thin;
  scrollbar-color:
    color-mix(in srgb, var(--ace-grid-select-popup-muted) 55%, transparent)
    transparent;
}
.ace-grid__themed-select-option {
  appearance: none;
  width: 100%;
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 6px 9px;
  border: 0;
  border-radius: max(3px, calc(var(--ace-grid-select-popup-radius) * 0.75));
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.ace-grid__themed-select-option--active {
  background: var(--ace-grid-select-popup-hover);
}
.ace-grid__themed-select-option--selected {
  background: var(--ace-grid-select-popup-selected);
  color: var(--ace-grid-select-popup-text);
  font-weight: 600;
}
.ace-grid__themed-select-option:disabled {
  color: var(--ace-grid-select-popup-muted);
  cursor: not-allowed;
  opacity: 0.52;
}
.ace-grid__themed-select-option-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ace-grid__themed-select-check {
  width: 16px;
  height: 16px;
  flex: 0 0 auto;
  fill: none;
  stroke: var(--ace-grid-select-popup-accent);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.ace-grid__global-loading-indicator--visible {
  opacity: 1;
  transform: translateY(0);
}
.ace-grid__global-loading-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 9px;
  border-radius: 999px;
  border: 1px solid var(
    --ace-grid-cell-border-color-alt,
    var(--ace-grid-cell-border-color, rgba(0, 0, 0, 0.08))
  );
  background: var(
    --ace-grid-surface-subtle,
    rgba(255, 255, 255, 0.9)
  );
  color: var(--ace-grid-text-muted, rgba(0, 0, 0, 0.62));
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.01em;
}
.ace-grid__global-loading-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: currentColor;
  opacity: 0.72;
}

.ace-grid__header-row {
  width: 100%;
  display: flex;
  position: relative;
  z-index: 1;
  align-items: stretch;
  box-shadow: var(--ace-grid-header-shadow, none);
  backdrop-filter: var(--ace-grid-header-backdrop, none);
  border-bottom: 1px solid var(--ace-grid-header-border-color, transparent);
}
.ace-grid__header-row--filter-open {
  z-index: 2600;
}

.ace-grid__header-cell {
  position: relative;
  border-right: 1px solid var(--ace-grid-header-border-color, transparent);
  border-bottom: none;
  border-radius: 0;
  transition: background 0.15s ease, color 0.15s ease;
}
.ace-grid__header-cell--filter-open {
  z-index: 2100;
}
.ace-grid__header-cell .ace-grid__drag-handle {
  margin-right: 6px;
  opacity: 0.7;
  cursor: grab;
  user-select: none;
  color: var(--ace-grid-text-muted, rgba(0,0,0,0.45));
}
.ace-grid__header-cell--drag-disabled,
.ace-grid__header-cell--drag-disabled .ace-grid__drag-handle,
.ace-grid__header-cell--drag-disabled .ace-grid__drag-handle-icon {
  cursor: not-allowed;
}
.ace-grid__header-cell-rendered-label {
  pointer-events: none;
}
.ace-grid__header-cell-content {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 8px;
  overflow: hidden;
}
.ace-grid__header-cell-content--system {
  gap: 0;
  justify-content: center;
}
.ace-grid__header-cell-title--system {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: var(--ace-grid-header-text-color, inherit);
  line-height: 1;
}
.ace-grid__header-cell-label {
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}
.ace-grid__header-cell-label-inner {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--ace-grid-header-text-color, inherit);
}
.ace-grid__header-cell-select {
  cursor: pointer;
  accent-color: var(--ace-grid-checkbox-accent);
}
.ace-grid__header-cell-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}
.ace-grid__sort-order {
  font-size: 9px;
  margin-left: 2px;
  color: var(--ace-grid-sort-icon-active, currentColor);
  line-height: 1;
}
.ace-grid__filter-trigger-icon {
  position: relative;
  display: inline-flex;
}
.ace-grid__header-cell--filter-open .ace-grid__filter-trigger-icon,
.ace-grid__header-cell--filter-open .ace-grid__filter-icon {
  color: var(--ace-grid-filter-icon-active, currentColor);
  opacity: 1;
}
.ace-grid__filter-indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  width: var(--ace-grid-filter-indicator-size, 6px);
  height: var(--ace-grid-filter-indicator-size, 6px);
  border-radius: 999px;
  background: var(--ace-grid-filter-indicator, currentColor);
  border: 1px solid var(--ace-grid-filter-indicator-border, transparent);
  box-sizing: border-box;
  pointer-events: none;
}
.ace-grid__header-cell:hover {
  background: var(--ace-grid-header-bg-hover, rgba(0,0,0,0.04));
}
.ace-grid__header-cell--dragging {
  cursor: grabbing;
  opacity: 0.92;
  box-shadow: var(--ace-grid-drag-ghost-shadow, none);
  transform: translateY(1px);
}

.ace-grid__floating-filter-row {
  width: 100%;
  display: flex;
  align-items: stretch;
  position: relative;
  z-index: 1;
  border-bottom: 1px solid var(--ace-grid-header-border-color, transparent);
  background: var(--ace-grid-header-bg, transparent);
}
.ace-grid__floating-filter-cell {
  position: relative;
  border-right: 1px solid var(--ace-grid-header-border-color, transparent);
  border-bottom: 1px solid var(--ace-grid-header-border-color, transparent);
  background: var(--ace-grid-header-bg, transparent);
  box-sizing: border-box;
  display: flex;
  align-items: center;
  padding: 0 6px;
}
.ace-grid__floating-filter-cell--system {
  border-right-color: var(
    --ace-grid-cell-border-color-alt,
    var(--ace-grid-header-border-color, transparent)
  );
}
.ace-grid__floating-filter-cell--disabled {
  pointer-events: none;
}
.ace-grid__floating-filter-input,
.ace-grid__floating-filter-select {
  width: 100%;
  min-width: 0;
  height: 26px;
  padding: 4px 6px;
  border-width: 1px;
  border-style: solid;
  border-color: var(
    --ace-grid-formula-input-border,
    var(--ace-grid-header-border-color, rgba(0, 0, 0, 0.18))
  );
  border-radius: var(--ace-grid-border-radius-sm, 8px);
  background: var(--ace-grid-popup-bg, #fff);
  color: var(--ace-grid-text-primary, #111827);
  font-size: 12px;
  line-height: 1.2;
  outline: none;
  box-sizing: border-box;
}
.ace-grid__floating-filter-input:focus,
.ace-grid__floating-filter-select:focus {
  border-color: var(--ace-grid-focus-outline, #2563eb);
  box-shadow: 0 0 0 2px
    color-mix(in srgb, var(--ace-grid-focus-outline, #2563eb) 22%, transparent);
}

.ace-grid__header-cell--drag-over-left::before,
.ace-grid__header-cell--drag-over-right::after,
.ace-grid__header-group-cell--drag-over-left::before,
.ace-grid__header-group-cell--drag-over-right::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--ace-grid-drop-indicator, #0d6efd);
  z-index: 40;
}
.ace-grid__header-cell--drag-over-left::before,
.ace-grid__header-group-cell--drag-over-left::before { left: -1px; }
.ace-grid__header-cell--drag-over-right::after,
.ace-grid__header-group-cell--drag-over-right::after { right: -1px; }

.ace-grid__header-cell--pin-drop.ace-grid__header-cell--drag-over-left::before,
.ace-grid__header-cell--pin-drop.ace-grid__header-cell--drag-over-right::after { background: var(--ace-grid-drop-indicator-pin, #fd7e14); }
.ace-grid__header-cell--unpin-drop.ace-grid__header-cell--drag-over-left::before,
.ace-grid__header-cell--unpin-drop.ace-grid__header-cell--drag-over-right::after { background: var(--ace-grid-drop-indicator-unpin, #198754); }
.ace-grid__header-cell--cross-pin-drop.ace-grid__header-cell--drag-over-left::before,
.ace-grid__header-cell--cross-pin-drop.ace-grid__header-cell--drag-over-right::after { background: var(--ace-grid-drop-indicator-cross, #dc3545); }

.ace-grid__header-group-cell--drag-over-inside {
  background: var(--ace-grid-header-drop-bg, rgba(13,110,253,0.08));
}
.ace-grid__header-group-chevron {
  display: block;
}
.ace-grid__header-group-spacer {
  width: 12px;
  flex: 0 0 12px;
}
.ace-grid__header-group-toggle {
  background: transparent;
  border: none;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}
.ace-grid__column-resize-handle--group-fallback {
  position: absolute;
  top: 0;
  bottom: 0;
  right: -2px;
  width: 6px;
  cursor: col-resize;
}
.ace-grid__group-inside-indicator {
  position: absolute;
  top: 4px;
  bottom: 4px;
  width: 3px;
  border-radius: 999px;
  background: var(--ace-grid-drop-indicator, #0d6efd);
  pointer-events: none;
  transform: translateX(-1.5px);
  z-index: 45;
  box-shadow: 0 0 0 1px rgba(255,255,255,0.45);
}

.ace-grid__row-group {
  position: relative;
  border-bottom: var(--ace-grid-row-border, 1px solid transparent);
  box-shadow: var(--ace-grid-row-shadow, none);
  transition: background 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
}
.ace-grid__row-group:hover {
  background: transparent;
}
.ace-grid__row-hover-overlay {
  position: absolute;
  left: 0;
  right: 0;
  pointer-events: none;
  z-index: 0;
  background: var(--ace-grid-row-hover-overlay-bg, transparent);
  box-shadow: var(--ace-grid-row-hover-overlay-shadow, none);
  opacity: var(--ace-grid-row-hover-overlay-opacity, 1);
  transition:
    top 0.08s ease,
    height 0.08s ease,
    background 0.12s ease,
    box-shadow 0.12s ease,
    opacity 0.12s ease;
}
.ace-grid__row-group--dragging {
  background: var(--ace-grid-row-active-bg, var(--ace-grid-drag-ghost-bg, rgba(255,255,255,0.92)));
  box-shadow: var(--ace-grid-drag-ghost-shadow, none);
  border-color: var(--ace-grid-drag-ghost-border, transparent);
  opacity: 0.88;
}
.ace-grid__row-group--dragging * {
  cursor: grabbing !important;
}

.ace-grid__row-group--drag-over-top::before,
.ace-grid__row-group--drag-over-bottom::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--ace-grid-drop-indicator, #0d6efd);
  z-index: 999;
}
.ace-grid__row-group--drag-over-top::before { top: -1px; }
.ace-grid__row-group--drag-over-bottom::after { bottom: -1px; }

.ace-grid__row-group--has-spans { outline: 1px dashed var(--ace-grid-span-border, rgba(0,0,0,.15)); }

.ace-grid__infinite-scroll-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 6px 10px;
  box-sizing: border-box;
  background: var(--ace-grid-cell-bg, var(--ace-grid-surface-base, #fff));
  border-bottom: var(--ace-grid-row-border, 1px solid transparent);
  position: relative;
}

.ace-grid__infinite-scroll-row--top {
  border-top: var(--ace-grid-row-border, 1px solid transparent);
  position: sticky;
  z-index: 330;
}

.ace-grid__infinite-scroll-row--bottom {
  border-bottom: var(--ace-grid-row-border, 1px solid transparent);
  position: sticky;
  z-index: 330;
}

.ace-grid__infinite-scroll-row-content {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 0 8px;
  box-sizing: border-box;
}

.ace-grid__infinite-scroll-loader {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid var(
    --ace-grid-cell-border-color-alt,
    var(--ace-grid-cell-border-color, rgba(0, 0, 0, 0.08))
  );
  background: var(
    --ace-grid-surface-subtle,
    rgba(255, 255, 255, 0.9)
  );
  font-weight: 600;
  letter-spacing: 0.01em;
}

.ace-grid__infinite-scroll-loader-spinner {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  opacity: 0.78;
  animation: ace-grid-infinite-scroll-loader-spin 0.72s linear infinite;
}

.ace-grid__infinite-scroll-loader-label {
  white-space: nowrap;
}

.ace-grid__virtual-spacer {
  --ace-grid-spacer-bg: var(--ace-grid-cell-bg, var(--ace-grid-surface-base, #fff));
  --ace-grid-spacer-border: var(
    --ace-grid-cell-border-color,
    var(--ace-grid-border-color, rgba(0, 0, 0, 0.08))
  );
  --ace-grid-spacer-pin-left-w: 0px;
  --ace-grid-spacer-pin-right-w: 0px;
  --ace-grid-spacer-pin-left-bg: var(--ace-grid-spacer-bg);
  --ace-grid-spacer-pin-right-bg: var(--ace-grid-spacer-bg);
  --ace-grid-spacer-pin-left-edge: none;
  --ace-grid-spacer-pin-right-edge: none;
  position: relative;
  overflow: hidden;
  contain: paint;
  background-color: var(--ace-grid-spacer-bg);
  background-image:
    repeating-linear-gradient(
      to bottom,
      transparent 0,
      transparent calc(var(--ace-grid-spacer-row-h, 32px) - 1px),
      var(--ace-grid-spacer-border) calc(var(--ace-grid-spacer-row-h, 32px) - 1px),
      var(--ace-grid-spacer-border) var(--ace-grid-spacer-row-h, 32px)
    ),
    linear-gradient(
      to right,
      var(--ace-grid-spacer-pin-left-bg) 0,
      var(--ace-grid-spacer-pin-left-bg) var(--ace-grid-spacer-pin-left-w),
      var(--ace-grid-spacer-bg) var(--ace-grid-spacer-pin-left-w),
      var(--ace-grid-spacer-bg) calc(100% - var(--ace-grid-spacer-pin-right-w)),
      var(--ace-grid-spacer-pin-right-bg) calc(100% - var(--ace-grid-spacer-pin-right-w)),
      var(--ace-grid-spacer-pin-right-bg) 100%
    );
  box-shadow: var(--ace-grid-spacer-pin-left-edge), var(--ace-grid-spacer-pin-right-edge);
}

.ace-grid__offset-cell {
  --ace-grid-offset-row-h: var(--ace-grid-spacer-row-h, 32px);
  --ace-grid-offset-col-w: 140px;
  --ace-grid-offset-bg: var(--ace-grid-cell-bg, var(--ace-grid-surface-base, #fff));
  --ace-grid-offset-border: var(
    --ace-grid-cell-border-color,
    var(--ace-grid-border-color, rgba(0, 0, 0, 0.08))
  );
  --ace-grid-offset-edge-shadow: none;
  position: relative;
  overflow: hidden;
  color: var(--ace-grid-text-muted, rgba(0, 0, 0, 0.5));
  font-style: italic;
  background-color: var(--ace-grid-offset-bg);
  background-image:
    repeating-linear-gradient(
      to bottom,
      transparent 0,
      transparent calc(var(--ace-grid-offset-row-h, 32px) - 1px),
      var(--ace-grid-offset-border) calc(var(--ace-grid-offset-row-h, 32px) - 1px),
      var(--ace-grid-offset-border) var(--ace-grid-offset-row-h, 32px)
    ),
    repeating-linear-gradient(
      to right,
      transparent 0,
      transparent calc(var(--ace-grid-offset-col-w, 140px) - 1px),
      var(--ace-grid-offset-border) calc(var(--ace-grid-offset-col-w, 140px) - 1px),
      var(--ace-grid-offset-border) var(--ace-grid-offset-col-w, 140px)
    );
}

.ace-grid__offset-cell--before {
  box-shadow: inset -1px 0 0 var(--ace-grid-offset-border), var(--ace-grid-offset-edge-shadow);
}

.ace-grid__offset-cell--after {
  box-shadow: inset 1px 0 0 var(--ace-grid-offset-border), var(--ace-grid-offset-edge-shadow);
}

.ace-grid__offset-cell--header {
  --ace-grid-offset-bg: var(
    --ace-grid-header-bg,
    var(--ace-grid-surface-subtle, rgba(0, 0, 0, 0.04))
  );
  --ace-grid-offset-border: var(
    --ace-grid-header-border-color,
    var(--ace-grid-border-color, rgba(0, 0, 0, 0.08))
  );
}

.ace-grid__offset-cell--system {
  --ace-grid-offset-bg: var(
    --ace-grid-surface-subtle,
    var(--ace-grid-cell-bg, var(--ace-grid-surface-base, #fff))
  );
  --ace-grid-offset-border: var(
    --ace-grid-cell-border-color-alt,
    var(--ace-grid-cell-border-color, rgba(0, 0, 0, 0.08))
  );
}

.ace-grid__offset-cell-label {
  padding: 0 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ace-grid__cell {
  border-radius: var(--ace-grid-cell-radius, 0px);
  box-shadow: var(--ace-grid-cell-shadow, none);
  background: var(--ace-grid-cell-bg, transparent);
  color: var(--ace-grid-cell-color, var(--ace-grid-cell-text, #111));
  font-size: var(--ace-grid-cell-font-size, var(--ace-grid-font-size, 14px));
  font-weight: var(--ace-grid-cell-font-weight, normal);
  font-style: var(--ace-grid-cell-font-style, normal);
  text-align: var(--ace-grid-cell-text-align, left);
  display: flex;
  align-items: var(--ace-grid-cell-align, center);
  padding: var(--ace-grid-cell-padding-y, 0px) var(--ace-grid-cell-padding-x, 0px);
  cursor: cell;
  user-select: none;
  box-sizing: border-box;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  transition: background 0.15s ease, box-shadow 0.15s ease;
}
.ace-grid__cell:hover {
  background: var(--ace-grid-cell-bg-hover, rgba(0,0,0,0.04));
  box-shadow: var(--ace-grid-cell-hover-shadow, var(--ace-grid-cell-shadow, none));
}
.ace-grid__cell--selected {
  background: var(--ace-grid-cell-bg-selected, rgba(0,0,0,0.08));
  box-shadow: var(--ace-grid-cell-selected-shadow, var(--ace-grid-cell-shadow, none));
}
.ace-grid__cell--loading {
  cursor: default;
  pointer-events: none;
}
.ace-grid__cell-loading-shell {
  display: flex;
  align-items: center;
  min-width: 0;
  width: 100%;
}
.ace-grid__cell-loading-bar {
  display: block;
  width: 100%;
  min-width: 14px;
  height: 12px;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    var(--ace-grid-surface-subtle, rgba(148, 163, 184, 0.16)) 0%,
    var(--ace-grid-cell-border-color-alt, var(--ace-grid-cell-border-color, rgba(148, 163, 184, 0.34))) 50%,
    var(--ace-grid-surface-subtle, rgba(148, 163, 184, 0.16)) 100%
  );
  background-size: 180% 100%;
  animation: ace-grid-cell-loading 0.78s linear infinite;
}
.ace-grid__cell--spanned {
  box-shadow: var(--ace-grid-cell-shadow, none);
}
.ace-grid__cell--spanned:not(.ace-grid__cell--selected) {
  border-left-color: transparent !important;
  border-right-color: transparent !important;
}
.ace-grid__cell--spanned::before {
  content: "";
  position: absolute;
  top: 1px;
  bottom: 1px;
  left: 0;
  right: 0;
  pointer-events: none;
  border-left: 1px solid var(
    --ace-grid-span-left-border-color,
    var(
      --ace-grid-cell-border-bottom-color,
      var(--ace-grid-cell-border-color, rgba(0,0,0,.15))
    )
  );
  border-right: 1px solid var(
    --ace-grid-span-right-border-color,
    var(
      --ace-grid-cell-border-bottom-color,
      var(--ace-grid-cell-border-color, rgba(0,0,0,.15))
    )
  );
  box-sizing: border-box;
  box-shadow: var(--ace-grid-span-shadow, none);
}
.ace-grid__cell--spanned.ace-grid__cell--selected::before {
  border-left-color: transparent;
  border-right-color: transparent;
  box-shadow: none;
}
.ace-grid__cell--validation {
  position: relative;
}
.ace-grid__cell--validation-error {
  --ace-grid-validation-color: var(--ace-grid-validation-error, #ef4444);
  --ace-grid-validation-bg: var(--ace-grid-validation-bg-error, rgba(239,68,68,0.12));
}
.ace-grid__cell--validation-warning {
  --ace-grid-validation-color: var(--ace-grid-validation-warning, #f59e0b);
  --ace-grid-validation-bg: var(--ace-grid-validation-bg-warning, rgba(245,158,11,0.12));
}
.ace-grid__cell--validation-info {
  --ace-grid-validation-color: var(--ace-grid-validation-info, #38bdf8);
  --ace-grid-validation-bg: var(--ace-grid-validation-bg-info, rgba(56,189,248,0.12));
}
.ace-grid__cell--validation-highlight.ace-grid__cell--validation-error,
.ace-grid__cell--validation-highlight.ace-grid__cell--validation-warning,
.ace-grid__cell--validation-highlight.ace-grid__cell--validation-info {
  background: var(--ace-grid-validation-bg);
  box-shadow: inset 0 0 0 1px var(--ace-grid-validation-color);
}
.ace-grid__cell--validation-indicator-dot::after {
  content: "";
  position: absolute;
  top: 4px;
  right: 4px;
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--ace-grid-validation-color);
  box-shadow: 0 0 0 1px rgba(0,0,0,0.06);
  pointer-events: none;
}
.ace-grid__cell--validation-indicator-corner::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  border-top: 10px solid var(--ace-grid-validation-color);
  border-left: 10px solid transparent;
  pointer-events: none;
}
.ace-grid__cell--validation-indicator-bar::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  background: var(--ace-grid-validation-color);
  pointer-events: none;
}
.ace-grid__cell--validation-pending::after {
  animation: ace-grid-validation-pulse 1.2s ease-in-out infinite;
}
.ace-grid__cell[data-validation-message] {
  overflow: visible;
}
.ace-grid__cell-editor[data-validation-message] {
  overflow: visible;
  z-index: 80;
}
.ace-grid__cell[data-validation-message]::before,
.ace-grid__cell-editor[data-validation-message]::before {
  content: none;
}
.ace-grid__cell[data-validation-message]:hover::before,
.ace-grid__cell[data-validation-message]:focus-within::before,
.ace-grid__cell-editor[data-validation-message]:hover::before,
.ace-grid__cell-editor[data-validation-message]:focus-within::before {
  position: absolute;
  content: attr(data-validation-message);
  left: 10px;
  top: calc(100% + 8px);
  max-width: 260px;
  padding: 6px 10px;
  font-size: 12px;
  line-height: 1.3;
  border-radius: 8px;
  color: var(--ace-grid-validation-tooltip-text, #f9fafb);
  background: var(--ace-grid-validation-tooltip-bg, #111827);
  box-shadow: var(--ace-grid-validation-tooltip-shadow, 0 10px 22px rgba(0,0,0,0.18));
  border-left: 3px solid var(--ace-grid-validation-color, #ef4444);
  white-space: pre-wrap;
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.15s ease, transform 0.15s ease;
  pointer-events: none;
  z-index: 900;
}
.ace-grid__row-group--pinned-bottom .ace-grid__cell[data-validation-message]:hover::before,
.ace-grid__row-group--pinned-bottom .ace-grid__cell[data-validation-message]:focus-within::before,
.ace-grid__row-group--pinned-bottom .ace-grid__cell-editor[data-validation-message]:hover::before,
.ace-grid__row-group--pinned-bottom .ace-grid__cell-editor[data-validation-message]:focus-within::before {
  top: auto;
  bottom: calc(100% + 8px);
}
.ace-grid__cell[data-validation-tooltip-placement="top"]:hover::before,
.ace-grid__cell[data-validation-tooltip-placement="top"]:focus-within::before,
.ace-grid__cell-editor[data-validation-tooltip-placement="top"]:hover::before,
.ace-grid__cell-editor[data-validation-tooltip-placement="top"]:focus-within::before {
  top: auto !important;
  bottom: calc(100% + 8px) !important;
}
.ace-grid__cell[data-validation-tooltip-placement="bottom"]:hover::before,
.ace-grid__cell[data-validation-tooltip-placement="bottom"]:focus-within::before,
.ace-grid__cell-editor[data-validation-tooltip-placement="bottom"]:hover::before,
.ace-grid__cell-editor[data-validation-tooltip-placement="bottom"]:focus-within::before {
  top: calc(100% + 8px) !important;
  bottom: auto !important;
}
@keyframes ace-grid-validation-pulse {
  0% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.15);
  }
  100% {
    opacity: 0.6;
    transform: scale(1);
  }
}
@keyframes ace-grid-formula-ants {
  to {
    background-position: 0 0, 8px 0, 100% 8px, -8px 100%, 0 -8px;
  }
}
@keyframes ace-grid-cell-loading {
  0% {
    background-position: 160% 0;
  }
  100% {
    background-position: -60% 0;
  }
}
@keyframes ace-grid-infinite-scroll-loader-spin {
  to {
    transform: rotate(360deg);
  }
}
.ace-grid__cell-editor--validation {
  position: relative;
}
.ace-grid__cell-editor--validation-error {
  --ace-grid-validation-color: var(--ace-grid-validation-error, #ef4444);
  --ace-grid-validation-bg: var(--ace-grid-validation-bg-error, rgba(239,68,68,0.12));
}
.ace-grid__cell-editor--validation-warning {
  --ace-grid-validation-color: var(--ace-grid-validation-warning, #f59e0b);
  --ace-grid-validation-bg: var(--ace-grid-validation-bg-warning, rgba(245,158,11,0.12));
}
.ace-grid__cell-editor--validation-info {
  --ace-grid-validation-color: var(--ace-grid-validation-info, #38bdf8);
  --ace-grid-validation-bg: var(--ace-grid-validation-bg-info, rgba(56,189,248,0.12));
}
.ace-grid__cell-editor--validation-error,
.ace-grid__cell-editor--validation-warning,
.ace-grid__cell-editor--validation-info {
  --ace-grid-editor-shadow: inset 0 0 0 1px var(--ace-grid-validation-color);
}
.ace-grid__cell-editor.ace-grid__cell--validation-highlight.ace-grid__cell--validation-error,
.ace-grid__cell-editor.ace-grid__cell--validation-highlight.ace-grid__cell--validation-warning,
.ace-grid__cell-editor.ace-grid__cell--validation-highlight.ace-grid__cell--validation-info {
  --ace-grid-editor-bg: var(--ace-grid-validation-bg);
  --ace-grid-editor-shadow: inset 0 0 0 1px var(--ace-grid-validation-color);
  --ace-grid-editor-border: 1px solid var(--ace-grid-validation-color);
}
.ace-grid__cell--sparkline {
  align-items: stretch;
}
.ace-grid__sparkline {
  width: 100%;
  height: 100%;
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  display: block;
  overflow: visible;
}
.ace-grid__sparkline-chart {
  width: 100%;
  height: 100%;
  flex: 1 1 auto;
  min-width: 24px;
  min-height: 24px;
  align-self: stretch;
  position: relative;
}
.ace-grid__sparkline-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: stretch;
  align-self: stretch;
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
}
.ace-grid__sparkline-container--clickable {
  cursor: pointer;
}
.ace-grid__cell-text {
  display: inline;
}
.ace-grid__cell mark.ace-grid__search-highlight {
  background: var(--ace-grid-search-highlight-bg, #fde68a);
  color: var(--ace-grid-search-highlight-text, #111);
  padding: 0 2px;
  border-radius: 2px;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.06);
}

.ace-grid__cell mark.ace-grid__search-highlight--active {
  background: var(
    --ace-grid-search-active-highlight-bg,
    var(--ace-grid-warning-border, #f59e0b)
  );
  color: var(
    --ace-grid-search-active-highlight-text,
    var(--ace-grid-search-highlight-text, #111)
  );
  box-shadow: inset 0 0 0 1px
    var(--ace-grid-search-active-highlight-ring, rgba(0, 0, 0, 0.14));
}
.ace-grid__cell-span-indicator {
  position: absolute;
  top: 6px;
  right: 6px;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.02em;
  background: var(--ace-grid-surface-subtle, rgba(0,0,0,0.05));
  color: var(--ace-grid-text-muted, rgba(0,0,0,0.45));
  border: 1px solid var(--ace-grid-cell-border-color, rgba(0,0,0,0.08));
  border-radius: 0;
  pointer-events: none;
  text-transform: uppercase;
}
.ace-grid__sparkline-tooltip {
  position: fixed;
  z-index: 9999;
  pointer-events: none;
  padding: 6px 8px;
  background: var(--ace-grid-tooltip-bg, var(--ace-grid-popup-bg, #fff));
  color: var(--ace-grid-tooltip-color, var(--ace-grid-text-primary, #111));
  border: 1px solid var(--ace-grid-tooltip-border, var(--ace-grid-popup-border, rgba(0,0,0,0.12)));
  border-radius: var(--ace-grid-tooltip-radius, 6px);
  box-shadow: var(--ace-grid-tooltip-shadow, var(--ace-grid-popup-shadow, 0 8px 24px rgba(15,23,42,0.12)));
  font-size: 12px;
  line-height: 1.2;
  display: inline-flex;
  flex-direction: column;
  gap: 2px;
  max-width: 280px;
  backdrop-filter: var(--ace-grid-tooltip-backdrop, none);
}
.ace-grid__sparkline-tooltip-title {
  font-weight: 600;
  color: var(--ace-grid-tooltip-title, var(--ace-grid-text-primary, #111));
}
.ace-grid__sparkline-tooltip-content {
  color: var(--ace-grid-tooltip-content, var(--ace-grid-text-secondary, #444));
}
.ace-grid__sparkline-value-label {
  fill: var(--ace-grid-text-secondary, #475569);
  font-size: 11px;
  font-weight: 600;
}

.ace-grid__fill-handle {
  position: absolute;
  width: var(--ace-grid-fill-handle-size, 10px);
  height: var(--ace-grid-fill-handle-size, 10px);
  right: var(--ace-grid-fill-handle-offset-x, var(--ace-grid-fill-handle-offset, 0px));
  bottom: var(--ace-grid-fill-handle-offset-y, var(--ace-grid-fill-handle-offset, 0px));
  background: var(--ace-grid-fill-handle-bg, var(--ace-grid-selection-border, #2563eb));
  border: var(--ace-grid-fill-handle-border-width, 0) solid
    var(--ace-grid-fill-handle-border, transparent);
  border-radius: var(--ace-grid-fill-handle-radius, 0px);
  box-shadow: var(--ace-grid-fill-handle-shadow, none);
  pointer-events: auto;
  z-index: var(--ace-grid-fill-handle-z, 30);
  cursor: nwse-resize;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.ace-grid__fill-handle:hover {
  background: var(--ace-grid-fill-handle-bg-hover, #1d4ed8);
}
.ace-grid__fill-handle--icon::after {
  display: none;
}
.ace-grid__fill-handle-icon {
  width: var(--ace-grid-fill-handle-icon-size, 8px);
  height: var(--ace-grid-fill-handle-icon-size, 8px);
  color: var(--ace-grid-fill-handle-icon-color, #fff);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.ace-grid__fill-handle-icon > svg {
  width: 100%;
  height: 100%;
}
.ace-grid__fill-handle::after {
  content: none;
}

.ace-grid__cell-editor {
  border-radius: var(--ace-grid-cell-radius, 0px);
  background: var(--ace-grid-editor-bg, var(--ace-grid-cell-bg));
  border: var(--ace-grid-editor-border, 1px solid var(--ace-grid-selection-border));
  box-shadow: var(--ace-grid-editor-shadow, none);
  backdrop-filter: var(--ace-grid-editor-backdrop, none);
  transition: box-shadow 0.15s ease, background 0.15s ease;
}
.ace-grid__cell-editor--preview {
  font-weight: 500;
  letter-spacing: 0.01em;
}

.ace-grid__formula-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: var(--ace-grid-formula-height, 36px);
  padding: var(--ace-grid-formula-padding-y, 4px) 8px;
  box-shadow: var(--ace-grid-formula-shadow, none);
  backdrop-filter: var(--ace-grid-header-backdrop, none);
  border-top-left-radius: var(--ace-grid-border-radius, 12px);
  border-top-right-radius: var(--ace-grid-border-radius, 12px);
}
.ace-grid__formula-bar-badge {
  min-width: 60px;
  height: var(--ace-grid-formula-control-height, 28px);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
  border-radius: var(--ace-grid-border-radius-sm, 8px);
  border-width: 1px;
  border-style: solid;
  border-color: var(--ace-grid-formula-input-border, #bfc9dd);
  background: var(--ace-grid-formula-badge-bg, #fff);
  color: var(--ace-grid-formula-badge-text, var(--ace-grid-text-primary, #1f2937));
  font-family: var(--ace-grid-formula-font, ui-monospace, SFMono-Regular, Menlo, monospace);
  font-weight: 600;
  letter-spacing: 0.01em;
  text-align: center;
  user-select: none;
}
.ace-grid__formula-bar-input-wrap {
  position: relative;
  flex: 1 1 auto;
  min-width: 0;
  border-radius: var(--ace-grid-border-radius, 12px);
}
.ace-grid__formula-bar-input {
  width: 100%;
  height: var(--ace-grid-formula-control-height, 28px);
  padding: 0 10px;
  border-width: 1px;
  border-style: solid;
  border-color: var(--ace-grid-formula-input-border, #bfc9dd);
  border-radius: inherit;
  background: #fff;
  color: var(--ace-grid-text-primary, #1f2937);
  font-size: var(--ace-grid-font-size, 13px);
  font-family: inherit;
  outline: none;
  transition: border-color 0.14s ease, box-shadow 0.14s ease, background 0.14s ease;
}
.ace-grid__formula-bar-input::placeholder {
  color: var(--ace-grid-text-muted, #6b7280);
}
.ace-grid__formula-bar-input:focus {
  border-color: var(--ace-grid-focus-outline, #2563eb);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--ace-grid-focus-outline, #2563eb) 22%, transparent);
}
.ace-grid__formula-suggestions {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: var(--ace-grid-formula-suggest-bg, #fff);
  border: 1px solid var(--ace-grid-formula-suggest-border, #e5e7eb);
  border-radius: 10px;
  box-shadow: var(--ace-grid-formula-suggest-shadow, 0 16px 30px rgba(15,23,42,0.12));
  padding: 6px 0 0;
  max-height: 280px;
  overflow-y: auto;
  z-index: 300;
}
.ace-grid__formula-suggestion {
  padding: 8px 12px;
  cursor: pointer;
}
.ace-grid__row-pin-button--active {
  color: var(--ace-grid-pin-icon-active, var(--ace-grid-focus-outline, #2563eb));
  opacity: 1;
}
.ace-grid__row-pin-button--active .ace-grid__row-pin-icon,
.ace-grid__row-pin-icon--active {
  color: currentColor;
  opacity: 1;
}
.ace-grid__formula-suggestion:hover,
.ace-grid__formula-suggestion--active {
  background: var(--ace-grid-formula-suggest-active-bg, rgba(15,23,42,0.06));
}
.ace-grid__formula-suggestion-title {
  font-weight: 600;
  font-size: 13px;
  color: var(--ace-grid-formula-suggest-title, #111827);
  font-family: var(--ace-grid-formula-font, ui-monospace, SFMono-Regular, Menlo, monospace);
}
.ace-grid__formula-suggestion-desc {
  margin-top: 2px;
  font-size: 12px;
  color: var(--ace-grid-formula-suggest-desc, #6b7280);
}
.ace-grid__formula-suggestion-footer {
  position: sticky;
  bottom: 0;
  margin-top: 4px;
  margin-bottom: 0;
  padding: 6px 12px 4px;
  font-size: 11px;
  color: var(--ace-grid-formula-suggest-footer, #6b7280);
  border-top: 1px solid var(--ace-grid-formula-suggest-divider, #f1f5f9);
  background: var(--ace-grid-formula-suggest-bg, #fff);
  z-index: 1;
}

.ace-grid__header-section {
  display: flex;
  width: 100%;
}
.ace-grid__header-section--sticky {
  position: sticky;
  top: 0;
  z-index: 100;
}

.ace-grid__system-cell {
  box-sizing: border-box;
}
.ace-grid__system-cell--detail-empty {
  background: var(--ace-grid-cell-bg, var(--ace-grid-surface-subtle));
}

.ace-grid__row-detail-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding-inline: var(--ace-grid-row-detail-cell-padding-inline, 2px);
}
.ace-grid__row-detail-toggle--disabled {
  cursor: not-allowed;
}
.ace-grid__row-detail-toggle-button {
  border: none;
  background: transparent;
  padding: 0;
}
.ace-grid__row-pin--disabled,
.ace-grid__row-pin-button:disabled,
.ace-grid__row-order-cell--disabled,
.ace-grid__row-order-cell--disabled .ace-grid__row-order-handle {
  cursor: not-allowed;
}

.ace-grid__row-resize-hitbox,
.ace-grid__row-resize-line {
  box-sizing: border-box;
}

.ace-grid__context-menu-color-section {
  display: grid;
  gap: 8px;
}
.ace-grid__context-menu-color-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.ace-grid__context-menu-color-grid {
  display: grid;
  grid-template-columns: repeat(10, 18px);
  gap: 6px;
}
.ace-grid__context-menu-color-swatch {
  width: 18px;
  height: 18px;
  border-radius: 6px;
  padding: 0;
  cursor: pointer;
}
.ace-grid__context-menu-color-custom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.ace-grid__context-menu-color-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}
.ace-grid__context-menu-color-input {
  width: 28px;
  height: 24px;
  border-radius: 6px;
  padding: 0;
}
.ace-grid__context-menu-color-apply {
  height: 24px;
  padding: 0 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.ace-grid__json-editor-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ace-grid__json-editor {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.ace-grid__json-editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.ace-grid__json-editor-title {
  font-weight: 600;
}
.ace-grid__json-editor-close {
  background: transparent;
  border: none;
  cursor: pointer;
}
.ace-grid__json-editor-close.ace-grid__chart-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  width: 32px;
  height: 32px;
  padding: 6px;
  border: 1px solid var(--ace-grid-border-color, rgba(148,163,184,0.35));
  background: var(--ace-grid-surface-raised, #fff);
  color: var(--ace-grid-text-primary, #1f2937);
  border-radius: 8px;
}
.ace-grid__json-editor-body {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 16px;
}
.ace-grid__json-editor-pane {
  display: flex;
  flex-direction: column;
  min-height: 0;
  gap: 8px;
}
.ace-grid__json-editor-pane-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.ace-grid__json-editor-pane-label {
  font-size: 11px;
  line-height: 1.2;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-weight: 600;
  color: var(--ace-grid-text-muted, #64748b);
  user-select: none;
}
.ace-grid__json-editor-textarea {
  width: 100%;
  height: 100%;
  min-height: 0;
  flex: 1;
  resize: none;
  box-sizing: border-box;
}
.ace-grid__json-editor-preview {
  overflow: auto;
  white-space: pre;
  min-height: 0;
  flex: 1;
}
.ace-grid__json-editor-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.ace-grid__json-editor-meta {
  font-size: 13px;
  min-height: 18px;
}
.ace-grid__json-editor-actions {
  display: flex;
  gap: 8px;
}
.ace-grid__json-editor-button {
  cursor: pointer;
}
.ace-grid__json-editor-button--format {
  min-height: 24px;
  padding: 0 10px;
  font-size: 11px;
}
.ace-grid__json-editor-button--primary {
  color: var(--ace-grid-text-on-accent, #fff);
}

.ace-grid__display-contents {
  display: contents;
}

.ace-grid__semantic-row-owner {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  padding: 0;
  overflow: hidden;
  opacity: 0;
  border: 0;
  pointer-events: none;
  z-index: -1;
}

.ace-grid__row-group-shell {
  display: flex;
  position: relative;
}
.ace-grid__row-group-shell--grid {
  display: grid;
  position: relative;
}
.ace-grid__row-group-pinned-grid {
  display: grid;
  position: relative;
}
.ace-grid__row-group-pinned--allow-overflow,
.ace-grid__row-group-pinned--allow-overflow .ace-grid__row-group-pinned-grid {
  overflow: visible;
}
@supports (clip-path: inset(0)) {
  .ace-grid__row-group-pinned--left {
    clip-path: inset(
      0 calc(-1 * var(--ace-grid-pinned-edge-shadow-bleed, 14px)) 0 0
    );
  }
  .ace-grid__row-group-pinned--right {
    clip-path: inset(
      0 0 0 calc(-1 * var(--ace-grid-pinned-edge-shadow-bleed, 14px))
    );
  }
  .ace-grid__row-group-pinned--allow-overflow {
    clip-path: none;
  }
}
.ace-grid__row-group-center {
  display: flex;
  align-items: stretch;
  position: relative;
  flex: 1 1 auto;
  min-width: 0;
}
.ace-grid__row-group-center-grid {
  display: grid;
  position: relative;
  flex: 0 0 auto;
}
.ace-grid__row-group-center-columns {
  display: flex;
  align-items: stretch;
  position: relative;
  flex: 0 0 auto;
}
.ace-grid__row-group-group-cell {
  font-weight: 600;
  cursor: pointer;
  color: var(--ace-grid-cell-text, inherit);
}
.ace-grid__row-group-group-agg {
  justify-content: flex-end;
  font-weight: 600;
}
.ace-grid__row-group-toggle-button {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  font-size: 12px;
  color: var(--ace-grid-text-muted, rgba(0, 0, 0, 0.55));
}
.ace-grid__row-group-label {
  flex: 1;
  font-weight: 600;
}
.ace-grid__row-group-count {
  color: var(--ace-grid-text-muted, rgba(0, 0, 0, 0.55));
}
.ace-grid__row-group-detail {
  position: absolute;
  left: 0;
  right: 0;
  z-index: var(--ace-grid-row-detail-z, 120);
  overflow: auto;
  box-sizing: border-box;
  padding: var(--ace-grid-row-detail-gutter, 0px);
  background: var(
    --ace-grid-row-detail-bg,
    var(--ace-grid-surface-subtle, var(--ace-grid-cell-bg, var(--ace-grid-surface-base, #fff)))
  );
  border-top: 1px solid
    var(
      --ace-grid-row-detail-border-top,
      var(--ace-grid-cell-border-color-alt, var(--ace-grid-cell-border-color, rgba(0, 0, 0, 0.14)))
    );
  box-shadow: var(--ace-grid-row-detail-shadow, none);
  backdrop-filter: var(--ace-grid-row-detail-backdrop, none);
  -webkit-backdrop-filter: var(--ace-grid-row-detail-backdrop, none);
}
.ace-grid__row-group-detail-inner {
  padding: var(--ace-grid-row-detail-padding, 12px);
  background: var(--ace-grid-row-detail-inner-bg, transparent);
  border: var(--ace-grid-row-detail-inner-border, none);
  border-radius: var(--ace-grid-row-detail-inner-radius, 0px);
  box-shadow: var(--ace-grid-row-detail-inner-shadow, none);
  min-height: 100%;
  box-sizing: border-box;
}
.ace-grid__row-group--detail-expanded .ace-grid__row-group-pinned--left,
.ace-grid__row-group--detail-expanded .ace-grid__row-group-pinned--right {
  box-shadow: none !important;
}
.ace-grid__row-group--detail-expanded .ace-grid__offset-cell--before,
.ace-grid__row-group--detail-expanded .ace-grid__offset-cell--after {
  box-shadow: none !important;
}

.ace-grid__column-filter-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
  flex-shrink: 0;
}
.ace-grid__column-filter-tab {
  flex: 1;
  padding: 6px 8px;
  border-radius: var(--ace-grid-border-radius-sm, 6px);
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
}
.ace-grid__column-filter-tab--active {
  border: 1px solid var(--ace-grid-sort-icon-active, #2563eb);
  background: var(--ace-grid-sort-icon-active, #2563eb);
  color: var(--ace-grid-text-on-accent, #fff);
}
.ace-grid__column-filter-tab--inactive {
  border: 1px solid var(--ace-grid-popup-border, rgba(0, 0, 0, 0.12));
  background: var(--ace-grid-popup-bg, #fff);
  color: var(--ace-grid-text-primary, #111827);
}
.ace-grid__column-filter-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  min-height: 0;
  overflow: auto;
}
.ace-grid__column-filter-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
}
.ace-grid__column-filter-label {
  display: block;
  font-weight: 600;
}
.ace-grid__column-filter-label--compact {
  margin-bottom: 6px;
}
.ace-grid__column-filter-range {
  display: flex;
  gap: 8px;
  align-items: center;
}
.ace-grid__column-filter-input,
.ace-grid__column-filter-select,
.ace-grid__column-filter-range-input,
.ace-grid__column-filter-search {
  width: 100%;
  border: 1px solid var(--ace-grid-formula-input-border, rgba(0, 0, 0, 0.18));
  border-radius: var(--ace-grid-border-radius-sm, 6px);
  box-sizing: border-box;
  background: var(--ace-grid-popup-bg, #fff);
  color: var(--ace-grid-text-primary, #111827);
}
.ace-grid__column-filter-input,
.ace-grid__column-filter-select,
.ace-grid__column-filter-range-input {
  padding: 4px 8px;
}
.ace-grid__column-filter-search {
  padding: 6px 8px;
}
.ace-grid__column-filter-range-input {
  flex: 1;
}
.ace-grid__column-filter-toolbar {
  display: flex;
  gap: 8px;
  justify-content: space-between;
  font-size: 12px;
}
.ace-grid__column-filter-toolbar-actions {
  display: flex;
  gap: 8px;
}
.ace-grid__column-filter-action {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  font-size: 12px;
}
.ace-grid__column-filter-action--accent {
  color: var(--ace-grid-sort-icon-active, #2563eb);
}
.ace-grid__column-filter-action--muted,
.ace-grid__column-filter-muted {
  color: var(--ace-grid-text-muted, #64748b);
}
.ace-grid__column-filter-options {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  border: 1px solid var(--ace-grid-formula-input-border, rgba(0, 0, 0, 0.18));
  border-radius: var(--ace-grid-border-radius-sm, 6px);
}
.ace-grid__column-filter-options--capped {
  max-height: 200px;
}
.ace-grid__column-filter-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  cursor: pointer;
}
.ace-grid__column-filter-option--selected {
  background: var(--ace-grid-cell-bg-selected, rgba(0, 0, 0, 0.08));
}
.ace-grid__column-filter-checkbox {
  margin: 0;
  flex: 0 0 auto;
}
.ace-grid__column-filter-empty {
  padding: 8px;
  font-size: 12px;
  color: var(--ace-grid-text-muted, #64748b);
}
.ace-grid__column-filter-block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.ace-grid__column-filter-block-title {
  font-size: 12px;
}
.ace-grid__column-filter-text-button {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  font-size: 12px;
}
.ace-grid__column-filter-text-button--muted {
  color: var(--ace-grid-text-muted, #64748b);
}
.ace-grid__column-filter-text-button--accent {
  color: var(--ace-grid-sort-icon-active, #2563eb);
}
.ace-grid__column-filter-condition-item {
  margin-bottom: 8px;
}
.ace-grid__column-filter-condition-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}
.ace-grid__column-filter-condition-operator {
  flex: 1;
}
.ace-grid__column-filter-stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.ace-grid__column-filter-help {
  color: var(--ace-grid-text-muted, #64748b);
  font-size: 12px;
}
.ace-grid__column-filter-inline-actions {
  display: flex;
  gap: 8px;
}
.ace-grid__column-filter-mt-10 {
  margin-top: 10px;
}
.ace-grid__column-filter-mb-8 {
  margin-bottom: 8px;
}
.ace-grid__column-filter-checkbox-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.ace-grid__column-filter-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 12px;
  border-top: 1px solid var(--ace-grid-popup-border, rgba(0, 0, 0, 0.12));
  padding-top: 10px;
}
.ace-grid__column-filter-button {
  padding: 6px 12px;
  border-radius: var(--ace-grid-border-radius-sm, 6px);
  cursor: pointer;
  font-size: 12px;
}
.ace-grid__column-filter-surface-button {
  border: 1px solid var(--ace-grid-popup-border, rgba(0, 0, 0, 0.12));
  background: var(--ace-grid-popup-bg, #fff);
  color: var(--ace-grid-text-primary, #111827);
  border-radius: var(--ace-grid-border-radius-sm, 6px);
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
}
.ace-grid__column-filter-button--clear {
  border: 1px solid var(--ace-grid-text-muted, #64748b);
  background: var(--ace-grid-popup-bg, #fff);
  color: var(--ace-grid-text-muted, #64748b);
}
.ace-grid__column-filter-button--apply {
  border: 1px solid var(--ace-grid-sort-icon-active, #2563eb);
  background: var(--ace-grid-sort-icon-active, #2563eb);
  color: var(--ace-grid-text-on-accent, #fff);
}

.ace-grid__cell-editor--checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}
.ace-grid__cell-editor--select {
  display: flex;
  align-items: center;
  justify-content: center;
}
.ace-grid__cell-editor-checkbox {
  width: 18px;
  height: 18px;
  accent-color: var(--ace-grid-checkbox-accent);
}
.ace-grid__cell-editor-select,
.ace-grid__cell-editor-input,
.ace-grid__cell-editor-textarea {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  box-sizing: border-box;
  font-size: var(--ace-grid-font-size);
  color: inherit;
}
.ace-grid__cell-editor-select,
.ace-grid__cell-editor-input {
  padding: 4px 8px;
}
.ace-grid__cell-editor--select .ace-grid__cell-editor-select {
  margin: 0;
}
.ace-grid__cell-editor-textarea {
  padding: 6px 8px;
  resize: none;
}
.ace-grid__cell-editor--radio {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 12px;
}
.ace-grid__cell-editor-radio-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--ace-grid-font-size);
  cursor: pointer;
}
.ace-grid__cell-editor--preview {
  display: flex;
  align-items: center;
  padding: 0 10px;
  font-family: Menlo, Monaco, 'Courier New', monospace;
  font-size: 12px;
  color: var(--ace-grid-text-muted, #475569);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ace-grid__json-editor-overlay {
  z-index: 1000;
  background: rgba(15, 23, 42, 0.45);
}
.ace-grid__json-editor {
  width: min(960px, 90vw);
  height: min(620px, 90vh);
  background: var(--ace-grid-surface-base, #fff);
  color: var(--ace-grid-text-primary, #0f172a);
  border-radius: 14px;
  box-shadow: 0 20px 52px rgba(15, 23, 42, 0.35);
}
.ace-grid__json-editor-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--ace-grid-border-color, #d0d7e6);
  background: var(--ace-grid-header-bg, #f8fafc);
  font-weight: 600;
}
.ace-grid__json-editor-close {
  font-size: 20px;
}
.ace-grid__json-editor-body {
  padding: 20px;
  background: var(--ace-grid-cell-bg, #fff);
}
.ace-grid__json-editor-textarea {
  font-family: Menlo, Monaco, 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  border: 1px solid var(--ace-grid-border-color, #cbd5f5);
  border-radius: 8px;
  padding: 12px 14px;
  background: var(--ace-grid-surface-base, #fff);
}
.ace-grid__json-editor-preview {
  border: 1px solid var(--ace-grid-border-color, #cbd5f5);
  border-radius: 8px;
  background: var(--ace-grid-surface-base, #fff);
  padding: 12px 14px;
  font-family: Menlo, Monaco, 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
}
.ace-grid__json-editor-footer {
  padding: 12px 20px;
  border-top: 1px solid var(--ace-grid-border-color, #d0d7e6);
  background: var(--ace-grid-header-bg, #f8fafc);
}
.ace-grid__json-editor-meta {
  color: var(--ace-grid-text-muted, #64748b);
}
.ace-grid__json-editor-meta--error {
  color: var(--ace-grid-danger-border, #b91c1c);
}
.ace-grid__json-editor-button {
  border: none;
  background: transparent;
  border-radius: 6px;
  padding: 6px 12px;
}
.ace-grid__json-editor-button--ghost {
  color: var(--ace-grid-text-muted, #64748b);
}
.ace-grid__json-editor-button--primary {
  background: var(--ace-grid-selection-border, #2563eb);
}
.ace-grid__json-editor-button--save {
  padding: 6px 16px;
}
.ace-grid__json-editor-button:disabled {
  cursor: not-allowed;
}
`;
