import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
  memo,
  useMemo,
  useId,
} from "react";
import {
  GridColumn,
  GridFilterConfig,
  ColumnFilterType,
  FilterCondition,
  FilterJoin,
  FilterMode,
  FilterOperator,
  FilterBlock,
} from "../../../types";
import { useGridTheme } from "../../theming";
import type { ColumnFilterState } from "../../theming/types";
import { resolveFilterValueChoices } from "../utils/filterValueChoices";
import { ThemedSelect } from "../../../components/ThemedSelect";

interface ColumnFilterProps {
  column: GridColumn;
  currentFilter?: GridFilterConfig;
  uniqueValues: any[];
  hasBlanks?: boolean;
  enableAdvancedMultiFilter?: boolean;
  onFilterChange: (filter: GridFilterConfig | null) => void;
  onClose: () => void;
  triggerId?: string;
}

const FILTER_PANEL_VIEWPORT_GAP = 8;

type ConditionState = {
  operator: FilterOperator;
  value: any;
};

type AdvancedBlockState =
  | {
      id: string;
      kind: "condition";
      join: FilterJoin;
      conditions: ConditionState[];
    }
  | {
      id: string;
      kind: "set";
      selectedKeys: Set<string>;
      includeBlanks: boolean;
      valueSearch: string;
    };

const isBlankValue = (value: any) =>
  value === null || value === undefined || value === "";

const normalizeValue = (value: any) => {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value.trim().toLowerCase();
  return String(value);
};

const defaultModeForColumn = (column: GridColumn): FilterMode => {
  if (column.type === "boolean" || column.type === "select") return "set";
  return "condition";
};

const defaultOperatorForColumn = (column: GridColumn): FilterOperator => {
  if (column.type === "number") return "equals";
  if (
    column.type === "date" ||
    column.type === "datetime" ||
    column.type === "time"
  ) {
    return "equals";
  }
  if (column.type === "boolean") return "equals";
  return "contains";
};

const getOperatorOptions = (column: GridColumn) => {
  switch (column.type) {
    case "number":
      return [
        { value: "equals", label: "Equals" },
        { value: "gt", label: "Greater than" },
        { value: "gte", label: "Greater than or equal" },
        { value: "lt", label: "Less than" },
        { value: "lte", label: "Less than or equal" },
        { value: "between", label: "Between" },
        { value: "isBlank", label: "Is blank" },
        { value: "isNotBlank", label: "Is not blank" },
      ];
    case "date":
    case "datetime":
    case "time":
      return [
        { value: "equals", label: "Equals" },
        { value: "gt", label: "After" },
        { value: "lt", label: "Before" },
        { value: "between", label: "Between" },
        { value: "isBlank", label: "Is blank" },
        { value: "isNotBlank", label: "Is not blank" },
      ];
    case "boolean":
      return [
        { value: "equals", label: "Equals" },
        { value: "isBlank", label: "Is blank" },
        { value: "isNotBlank", label: "Is not blank" },
      ];
    default:
      return [
        { value: "contains", label: "Contains" },
        { value: "equals", label: "Equals" },
        { value: "startsWith", label: "Starts with" },
        { value: "endsWith", label: "Ends with" },
        { value: "isBlank", label: "Is blank" },
        { value: "isNotBlank", label: "Is not blank" },
      ];
  }
};

const resolveFilterType = (column: GridColumn): ColumnFilterType =>
  column.filterType ??
  (column.type === "number" || column.type === "date"
    ? column.type
    : column.type === "select" || column.type === "boolean"
      ? "select"
      : "text");

const toInputType = (column: GridColumn) => {
  switch (column.type) {
    case "number":
      return "number";
    case "date":
      return "date";
    case "datetime":
      return "datetime-local";
    case "time":
      return "time";
    default:
      return "text";
  }
};

const isConditionActive = (condition: ConditionState) => {
  if (condition.operator === "isBlank" || condition.operator === "isNotBlank") {
    return true;
  }
  if (condition.operator === "between") {
    if (Array.isArray(condition.value)) {
      const [start, end] = condition.value;
      return !isBlankValue(start) || !isBlankValue(end);
    }
    return false;
  }
  return !isBlankValue(condition.value);
};

export const ColumnFilter: React.FC<ColumnFilterProps> = memo(
  ({
    column,
    currentFilter,
    uniqueValues,
    hasBlanks = false,
    enableAdvancedMultiFilter = false,
    onFilterChange,
    onClose,
    triggerId,
  }) => {
    const { tokens, components } = useGridTheme();
    const panelRef = useRef<HTMLDivElement>(null);
    const panelMeasureRafRef = useRef<number | null>(null);
    const idBase = useId();
    const [measuredPanelMaxHeight, setMeasuredPanelMaxHeight] = useState<
      number | null
    >(null);
    const nextBlockIdRef = useRef(0);

    const measurePanelMaxHeight = useCallback(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const gridViewport = panel.closest(".ace-grid");
      if (!(gridViewport instanceof HTMLElement)) return;
      const viewportRect = gridViewport.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const nextHeight = Math.max(
        0,
        Math.floor(
          viewportRect.bottom - panelRect.top - FILTER_PANEL_VIEWPORT_GAP,
        ),
      );
      setMeasuredPanelMaxHeight((prev) =>
        prev === nextHeight ? prev : nextHeight,
      );
    }, []);

    const schedulePanelMeasure = useCallback(() => {
      if (typeof window === "undefined") return;
      if (panelMeasureRafRef.current != null) return;
      panelMeasureRafRef.current = window.requestAnimationFrame(() => {
        panelMeasureRafRef.current = null;
        measurePanelMaxHeight();
      });
    }, [measurePanelMaxHeight]);

    const { choices, hasBlanks: resolvedHasBlanks } = useMemo(
      () => resolveFilterValueChoices(column, uniqueValues, hasBlanks),
      [column, hasBlanks, uniqueValues],
    );

    const valueKeyMap = useMemo(() => {
      const map = new Map<string, any>();
      choices.forEach((choice) => {
        if (!map.has(choice.key)) map.set(choice.key, choice.value);
      });
      return map;
    }, [choices]);

    const allValueKeys = useMemo(
      () => Array.from(valueKeyMap.keys()),
      [valueKeyMap],
    );

    const nextBlockId = useCallback(() => {
      nextBlockIdRef.current += 1;
      return `block-${nextBlockIdRef.current}`;
    }, []);

    const buildConditionState = useCallback(
      (condition?: FilterCondition): ConditionState => ({
        operator: condition?.operator ?? defaultOperatorForColumn(column),
        value: condition?.value ?? "",
      }),
      [column],
    );

    const buildConditionBlock = useCallback(
      (
        conditions?: FilterCondition[],
        blockJoin?: FilterJoin,
      ): AdvancedBlockState => {
        const prepared =
          conditions && conditions.length
            ? conditions.map(buildConditionState)
            : [buildConditionState()];
        return {
          id: nextBlockId(),
          kind: "condition",
          join: blockJoin ?? "and",
          conditions: prepared,
        };
      },
      [buildConditionState, nextBlockId],
    );

    const buildSetBlock = useCallback(
      (values?: any[], includeBlanksValue?: boolean): AdvancedBlockState => {
        const nextValues =
          values === undefined
            ? Array.from(valueKeyMap.values())
            : (values ?? []);
        return {
          id: nextBlockId(),
          kind: "set",
          selectedKeys: new Set(nextValues.map(normalizeValue)),
          includeBlanks: includeBlanksValue ?? false,
          valueSearch: "",
        };
      },
      [nextBlockId, valueKeyMap],
    );

    const buildAdvancedBlocks = useCallback(
      (filter?: GridFilterConfig): AdvancedBlockState[] => {
        if (filter?.blocks && filter.blocks.length) {
          return filter.blocks.map((block) => {
            if (block.kind === "set") {
              return buildSetBlock(
                block.set?.values ?? [],
                block.set?.includeBlanks ?? false,
              );
            }
            return buildConditionBlock(block.conditions, block.join);
          });
        }
        if (
          filter?.set ||
          (filter?.operator === "in" && Array.isArray(filter.value))
        ) {
          const values =
            filter.set?.values ??
            (Array.isArray(filter.value) ? filter.value : []);
          return [buildSetBlock(values, filter.set?.includeBlanks ?? false)];
        }
        if (filter?.conditions?.length || filter?.operator) {
          const conditions = filter.conditions?.length
            ? filter.conditions
            : filter.operator
              ? [{ operator: filter.operator, value: filter.value }]
              : [];
          return [buildConditionBlock(conditions, filter.join)];
        }
        return [buildConditionBlock()];
      },
      [buildConditionBlock, buildSetBlock],
    );

    const [mode, setMode] = useState<FilterMode>(() => {
      if (currentFilter?.mode) {
        if (!enableAdvancedMultiFilter && currentFilter.mode === "advanced") {
          return defaultModeForColumn(column);
        }
        return currentFilter.mode;
      }
      if (currentFilter?.blocks?.length) {
        return enableAdvancedMultiFilter
          ? "advanced"
          : defaultModeForColumn(column);
      }
      if (
        currentFilter?.set ||
        (currentFilter?.operator === "in" && Array.isArray(currentFilter.value))
      ) {
        return "set";
      }
      return defaultModeForColumn(column);
    });

    const [valueSearch, setValueSearch] = useState("");
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(() => {
      if (currentFilter?.set?.values?.length) {
        return new Set(currentFilter.set.values.map(normalizeValue));
      }
      if (
        currentFilter?.operator === "in" &&
        Array.isArray(currentFilter.value)
      ) {
        return new Set(currentFilter.value.map(normalizeValue));
      }
      return new Set(allValueKeys);
    });
    const [includeBlanks, setIncludeBlanks] = useState<boolean>(
      currentFilter?.set?.includeBlanks ?? false,
    );

    const [join, setJoin] = useState<FilterJoin>(currentFilter?.join ?? "and");
    const [condition1, setCondition1] = useState<ConditionState>(() => {
      if (currentFilter?.conditions?.length) {
        const [first] = currentFilter.conditions;
        return {
          operator: first?.operator ?? defaultOperatorForColumn(column),
          value: first?.value ?? "",
        };
      }
      return {
        operator: currentFilter?.operator ?? defaultOperatorForColumn(column),
        value: currentFilter?.value ?? "",
      };
    });
    const [condition2Enabled, setCondition2Enabled] = useState<boolean>(
      Boolean(currentFilter?.conditions && currentFilter.conditions.length > 1),
    );
    const [condition2, setCondition2] = useState<ConditionState>(() => {
      if (currentFilter?.conditions && currentFilter.conditions.length > 1) {
        const second = currentFilter.conditions[1];
        return {
          operator: second?.operator ?? defaultOperatorForColumn(column),
          value: second?.value ?? "",
        };
      }
      return { operator: defaultOperatorForColumn(column), value: "" };
    });
    const [blockJoin, setBlockJoin] = useState<FilterJoin>(
      currentFilter?.blockJoin ?? "and",
    );
    const [advancedBlocks, setAdvancedBlocks] = useState<AdvancedBlockState[]>(
      () => buildAdvancedBlocks(currentFilter),
    );

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          panelRef.current &&
          !panelRef.current.contains(event.target as Node)
        ) {
          onClose();
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    const focusFirstInteractiveElement = useCallback(() => {
      if (typeof window === "undefined") return;
      const root = panelRef.current;
      if (!root) return;
      const first = root.querySelector<HTMLElement>(
        'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])'
      );
      first?.focus({ preventScroll: true });
    }, []);

    useEffect(() => {
      if (typeof window === "undefined") return;
      const tick = window.setTimeout(() => {
        focusFirstInteractiveElement();
      }, 0);
      return () => window.clearTimeout(tick);
    }, [focusFirstInteractiveElement, mode]);

    useLayoutEffect(() => {
      if (typeof window === "undefined") return;
      const panel = panelRef.current;
      if (!panel) return;

      const anchor =
        panel.offsetParent instanceof HTMLElement ? panel.offsetParent : null;
      const handleViewportChange = () => {
        schedulePanelMeasure();
      };
      // Compute once synchronously to avoid initial paint with stale max-height.
      measurePanelMaxHeight();
      schedulePanelMeasure();

      window.addEventListener("resize", handleViewportChange);
      document.addEventListener("scroll", handleViewportChange, true);

      let observer: ResizeObserver | null = null;
      if (typeof ResizeObserver !== "undefined") {
        observer = new ResizeObserver(() => {
          schedulePanelMeasure();
        });
        const gridViewport = panel.closest(".ace-grid");
        if (gridViewport instanceof HTMLElement) {
          observer.observe(gridViewport);
        }
        if (anchor) {
          observer.observe(anchor);
        }
      }

      return () => {
        window.removeEventListener("resize", handleViewportChange);
        document.removeEventListener("scroll", handleViewportChange, true);
        observer?.disconnect();
        if (panelMeasureRafRef.current != null) {
          window.cancelAnimationFrame(panelMeasureRafRef.current);
          panelMeasureRafRef.current = null;
        }
      };
    }, [measurePanelMaxHeight, schedulePanelMeasure]);

    useEffect(() => {
      if (currentFilter?.mode) {
        if (!enableAdvancedMultiFilter && currentFilter.mode === "advanced") {
          setMode(defaultModeForColumn(column));
        } else {
          setMode(currentFilter.mode);
        }
      } else if (currentFilter?.blocks?.length) {
        setMode(
          enableAdvancedMultiFilter ? "advanced" : defaultModeForColumn(column),
        );
      } else if (
        currentFilter?.set ||
        (currentFilter?.operator === "in" && Array.isArray(currentFilter.value))
      ) {
        setMode("set");
      } else {
        setMode(defaultModeForColumn(column));
      }

      if (
        currentFilter?.set ||
        (currentFilter?.operator === "in" && Array.isArray(currentFilter.value))
      ) {
        const values = currentFilter?.set?.values ?? currentFilter.value ?? [];
        setSelectedKeys(new Set((values as any[]).map(normalizeValue)));
        setIncludeBlanks(currentFilter?.set?.includeBlanks ?? false);
      } else {
        setSelectedKeys(new Set(allValueKeys));
        setIncludeBlanks(false);
      }

      const conditions = currentFilter?.conditions ?? [];
      if (conditions.length) {
        setCondition1({
          operator: conditions[0]?.operator ?? defaultOperatorForColumn(column),
          value: conditions[0]?.value ?? "",
        });
        setCondition2Enabled(conditions.length > 1);
        setCondition2({
          operator: conditions[1]?.operator ?? defaultOperatorForColumn(column),
          value: conditions[1]?.value ?? "",
        });
        setJoin(currentFilter?.join ?? "and");
      } else {
        setCondition1({
          operator: currentFilter?.operator ?? defaultOperatorForColumn(column),
          value: currentFilter?.value ?? "",
        });
        setCondition2Enabled(false);
        setCondition2({
          operator: defaultOperatorForColumn(column),
          value: "",
        });
        setJoin("and");
      }

      nextBlockIdRef.current = 0;
      setBlockJoin(currentFilter?.blockJoin ?? "and");
      setAdvancedBlocks(buildAdvancedBlocks(currentFilter));

      setValueSearch("");
    }, [column, currentFilter, allValueKeys, enableAdvancedMultiFilter, buildAdvancedBlocks]);

    const filteredChoices = useMemo(() => {
      if (!valueSearch.trim()) return choices;
      const needle = valueSearch.trim().toLowerCase();
      return choices.filter((choice) =>
        choice.label.toLowerCase().includes(needle),
      );
    }, [choices, valueSearch]);

    const filteredValueKeys = useMemo(
      () => filteredChoices.map((choice) => choice.key),
      [filteredChoices],
    );

    const applyFilter = useCallback(() => {
      const resolvedType = resolveFilterType(column);

      if (mode === "advanced") {
        const blocks = advancedBlocks
          .map((block) => {
            if (block.kind === "set") {
              const values = Array.from(block.selectedKeys)
                .map((key) => valueKeyMap.get(key))
                .filter((value) => value !== undefined);
              const allValuesSelected =
                allValueKeys.length > 0 &&
                allValueKeys.every((key) => block.selectedKeys.has(key));
              const blanksSelected = !resolvedHasBlanks || block.includeBlanks;
              const isActive = !(
                (values.length === 0 && !block.includeBlanks) ||
                (allValuesSelected && blanksSelected)
              );
              if (!isActive) return null;
              return {
                kind: "set" as const,
                set: { values, includeBlanks: block.includeBlanks },
              };
            }
            const conditions = block.conditions
              .filter(isConditionActive)
              .map((condition) => ({
                operator: condition.operator,
                value: condition.value,
              }));
            if (!conditions.length) return null;
            return {
              kind: "condition" as const,
              join: block.join,
              conditions,
            };
          })
          .filter(Boolean) as Array<FilterBlock | null>;

        const activeBlocks = blocks.filter((block): block is FilterBlock =>
          Boolean(block),
        );

        if (!activeBlocks.length) {
          onFilterChange(null);
          onClose();
          return;
        }

        onFilterChange({
          columnKey: column.key,
          type: resolvedType,
          mode: "advanced",
          blocks: activeBlocks,
          blockJoin,
        });
        onClose();
        return;
      }

      if (mode === "set") {
        const values = Array.from(selectedKeys)
          .map((key) => valueKeyMap.get(key))
          .filter((value) => value !== undefined);

        const allValuesSelected =
          allValueKeys.length > 0 &&
          allValueKeys.every((key) => selectedKeys.has(key));
        const blanksSelected = !resolvedHasBlanks || includeBlanks;

        if (
          (values.length === 0 && !includeBlanks) ||
          (allValuesSelected && blanksSelected)
        ) {
          onFilterChange(null);
        } else {
          onFilterChange({
            columnKey: column.key,
            type: resolvedType,
            mode: "set",
            set: { values, includeBlanks },
          });
        }
        onClose();
        return;
      }

      const conditions: FilterCondition[] = [];
      if (isConditionActive(condition1)) {
        conditions.push({
          operator: condition1.operator,
          value: condition1.value,
        });
      }
      if (condition2Enabled && isConditionActive(condition2)) {
        conditions.push({
          operator: condition2.operator,
          value: condition2.value,
        });
      }

      if (!conditions.length) {
        onFilterChange(null);
        onClose();
        return;
      }

      onFilterChange({
        columnKey: column.key,
        type: resolvedType,
        mode: "condition",
        conditions,
        join,
        operator: conditions[0]?.operator,
        value: conditions[0]?.value,
      });
      onClose();
    }, [
      column,
      mode,
      advancedBlocks,
      blockJoin,
      selectedKeys,
      includeBlanks,
      condition1,
      condition2,
      condition2Enabled,
      join,
      valueKeyMap,
      allValueKeys,
      resolvedHasBlanks,
      onFilterChange,
      onClose,
    ]);

    const clearFilter = useCallback(() => {
      onFilterChange(null);
      onClose();
    }, [onFilterChange, onClose]);

    const handlePanelKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          onClose();
        }
      },
      [onClose],
    );

    const toggleValueSelection = useCallback((key: string) => {
      setSelectedKeys((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
    }, []);

    const selectAllVisible = useCallback(() => {
      setSelectedKeys((prev) => {
        const next = new Set(prev);
        filteredValueKeys.forEach((key) => next.add(key));
        return next;
      });
    }, [filteredValueKeys]);

    const clearAllVisible = useCallback(() => {
      setSelectedKeys((prev) => {
        const next = new Set(prev);
        filteredValueKeys.forEach((key) => next.delete(key));
        return next;
      });
    }, [filteredValueKeys]);

    const updateAdvancedBlock = useCallback(
      (
        id: string,
        updater: (block: AdvancedBlockState) => AdvancedBlockState,
      ) => {
        setAdvancedBlocks((prev) =>
          prev.map((block) => (block.id === id ? updater(block) : block)),
        );
      },
      [],
    );

    const removeAdvancedBlock = useCallback((id: string) => {
      setAdvancedBlocks((prev) => prev.filter((block) => block.id !== id));
    }, []);

    const renderConditionInput = (
      condition: ConditionState,
      onChange: (next: ConditionState) => void,
    ) => {
      if (
        condition.operator === "isBlank" ||
        condition.operator === "isNotBlank"
      ) {
        return null;
      }

      if (condition.operator === "between") {
        const [start, end] = Array.isArray(condition.value)
          ? condition.value
          : ["", ""];
        return (
          <div className="ace-grid__column-filter-range">
            <input
              className="ace-grid__column-filter-range-input"
              type={toInputType(column)}
              value={start ?? ""}
              onChange={(e) =>
                onChange({
                  ...condition,
                  value: [e.target.value, end ?? ""],
                })
              }
              placeholder="From"
              aria-label={`${column.title} start value`}
            />
            <span className="ace-grid__column-filter-range-separator">to</span>
            <input
              className="ace-grid__column-filter-range-input"
              type={toInputType(column)}
              value={end ?? ""}
              onChange={(e) =>
                onChange({
                  ...condition,
                  value: [start ?? "", e.target.value],
                })
              }
              placeholder="To"
              aria-label={`${column.title} end value`}
            />
          </div>
        );
      }

      if (column.type === "boolean" && condition.operator === "equals") {
        return (
          <ThemedSelect
            value={String(condition.value ?? "")}
            onChange={(value) =>
              onChange({
                ...condition,
                value: value === "" ? "" : value === "true",
              })
            }
            className="ace-grid__column-filter-select"
            ariaLabel={`${column.title} boolean value`}
            options={[
              { value: "", label: "Select value" },
              { value: "true", label: "TRUE" },
              { value: "false", label: "FALSE" },
            ]}
          />
        );
      }

      if (column.type === "select" && condition.operator === "equals") {
        return (
          <ThemedSelect
            value={isBlankValue(condition.value) ? "" : normalizeValue(condition.value)}
            onChange={(value) =>
              onChange({
                ...condition,
                value:
                  value === ""
                    ? ""
                    : (valueKeyMap.get(value) ?? value),
              })
            }
            className="ace-grid__column-filter-select"
            ariaLabel={`${column.title} selected value`}
            options={[
              { value: "", label: "Select value" },
              ...choices.map((choice) => ({
                value: choice.key,
                label: choice.label,
              })),
            ]}
          />
        );
      }

      return (
        <input
          className="ace-grid__column-filter-input"
          type={toInputType(column)}
          value={condition.value ?? ""}
          onChange={(e) =>
            onChange({
              ...condition,
              value: e.target.value,
            })
          }
          placeholder={`Filter ${column.title}...`}
          aria-label={`Filter ${column.title}`}
        />
      );
    };

    const renderAdvancedBlock = (block: AdvancedBlockState, index: number) => {
      const blockStyle: React.CSSProperties = {
        border: `1px solid ${tokens.popupBorder}`,
        borderRadius: tokens.borderRadiusSmall,
        padding: "8px",
        backgroundColor: tokens.surfaceSubtle,
      };

      if (block.kind === "condition") {
        return (
          <div key={block.id} style={blockStyle}>
            <div className="ace-grid__column-filter-block-header">
              <strong className="ace-grid__column-filter-block-title">
                Condition block {index + 1}
              </strong>
              <button
                type="button"
                onClick={() => removeAdvancedBlock(block.id)}
                className="ace-grid__column-filter-text-button ace-grid__column-filter-text-button--muted"
              >
                Remove
              </button>
            </div>

            {block.conditions.length > 1 && (
              <ThemedSelect
                value={block.join}
                onChange={(value) =>
                  updateAdvancedBlock(block.id, (current) =>
                    current.kind === "condition"
                      ? { ...current, join: value as FilterJoin }
                      : current,
                  )
                }
                className="ace-grid__column-filter-select ace-grid__column-filter-mb-8"
                ariaLabel={`Condition block ${index + 1} join`}
                options={[
                  { value: "and", label: "AND" },
                  { value: "or", label: "OR" },
                ]}
              />
            )}

            {block.conditions.map((condition, idx) => (
              <div
                key={`${block.id}-cond-${idx}`}
                className="ace-grid__column-filter-condition-item"
              >
                <div className="ace-grid__column-filter-condition-row">
                  <ThemedSelect
                    value={condition.operator}
                    onChange={(value) =>
                      updateAdvancedBlock(block.id, (current) => {
                        if (current.kind !== "condition") return current;
                        const nextConditions = current.conditions.map((c, i) =>
                          i === idx
                            ? {
                                ...c,
                                operator: value as FilterOperator,
                                value:
                                  value === "between" &&
                                  !Array.isArray(c.value)
                                    ? ["", ""]
                                    : c.value,
                              }
                            : c,
                        );
                        return { ...current, conditions: nextConditions };
                      })
                    }
                    className="ace-grid__column-filter-select ace-grid__column-filter-condition-operator"
                    ariaLabel={`Condition block ${index + 1} operator ${idx + 1}`}
                    options={getOperatorOptions(column)}
                  />
                  {block.conditions.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        updateAdvancedBlock(block.id, (current) => {
                          if (current.kind !== "condition") return current;
                          const nextConditions = current.conditions.filter(
                            (_, i) => i !== idx,
                          );
                          return {
                            ...current,
                            conditions:
                              nextConditions.length > 0
                                ? nextConditions
                                : [buildConditionState()],
                          };
                        })
                      }
                      className="ace-grid__column-filter-text-button ace-grid__column-filter-text-button--muted"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {renderConditionInput(condition, (next) =>
                  updateAdvancedBlock(block.id, (current) => {
                    if (current.kind !== "condition") return current;
                    const nextConditions = current.conditions.map((c, i) =>
                      i === idx ? next : c,
                    );
                    return { ...current, conditions: nextConditions };
                  }),
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                updateAdvancedBlock(block.id, (current) => {
                  if (current.kind !== "condition") return current;
                  return {
                    ...current,
                    conditions: [...current.conditions, buildConditionState()],
                  };
                })
              }
              className="ace-grid__column-filter-surface-button"
            >
              Add condition
            </button>
          </div>
        );
      }

      const filteredChoicesForBlock = block.valueSearch.trim()
        ? choices.filter((choice) =>
            choice.label
              .toLowerCase()
              .includes(block.valueSearch.trim().toLowerCase()),
          )
        : choices;
      const filteredKeysForBlock = filteredChoicesForBlock.map(
        (choice) => choice.key,
      );

      return (
        <div key={block.id} style={blockStyle}>
          <div className="ace-grid__column-filter-block-header">
            <strong className="ace-grid__column-filter-block-title">
              Values block {index + 1}
            </strong>
            <button
              type="button"
              onClick={() => removeAdvancedBlock(block.id)}
              className="ace-grid__column-filter-text-button ace-grid__column-filter-text-button--muted"
            >
              Remove
            </button>
          </div>
          <input
            type="search"
            value={block.valueSearch}
            onChange={(e) =>
              updateAdvancedBlock(block.id, (current) =>
                current.kind === "set"
                  ? { ...current, valueSearch: e.target.value }
                  : current,
              )
            }
            placeholder="Search values"
            className="ace-grid__column-filter-search ace-grid__column-filter-mb-8"
            aria-label={`Search values in block ${index + 1}`}
          />
          <div className="ace-grid__column-filter-toolbar ace-grid__column-filter-mb-8">
            <div className="ace-grid__column-filter-toolbar-actions">
              <button
                type="button"
                onClick={() =>
                  updateAdvancedBlock(block.id, (current) => {
                    if (current.kind !== "set") return current;
                    const next = new Set(current.selectedKeys);
                    filteredKeysForBlock.forEach((key) => next.add(key));
                    return { ...current, selectedKeys: next };
                  })
                }
                className="ace-grid__column-filter-text-button ace-grid__column-filter-text-button--accent"
              >
                Select all
              </button>
              <button
                type="button"
                onClick={() =>
                  updateAdvancedBlock(block.id, (current) => {
                    if (current.kind !== "set") return current;
                    const next = new Set(current.selectedKeys);
                    filteredKeysForBlock.forEach((key) => next.delete(key));
                    return { ...current, selectedKeys: next };
                  })
                }
                className="ace-grid__column-filter-text-button ace-grid__column-filter-text-button--muted"
              >
                Clear
              </button>
            </div>
            <span className="ace-grid__column-filter-muted">
              {block.selectedKeys.size} / {allValueKeys.length}
            </span>
          </div>

          <div className="ace-grid__column-filter-options ace-grid__column-filter-options--capped">
            {resolvedHasBlanks && (
              <label
                className={`ace-grid__column-filter-option${
                  block.includeBlanks
                    ? " ace-grid__column-filter-option--selected"
                    : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={block.includeBlanks}
                  onChange={() =>
                    updateAdvancedBlock(block.id, (current) =>
                      current.kind === "set"
                        ? { ...current, includeBlanks: !current.includeBlanks }
                        : current,
                    )
                  }
                  className="ace-grid__column-filter-checkbox"
                />
                (Blanks)
              </label>
            )}
            {filteredChoicesForBlock.length === 0 ? (
              <div className="ace-grid__column-filter-empty">No matches</div>
            ) : (
              filteredChoicesForBlock.map((choice, idx) => {
                const key = choice.key;
                const isSelected = block.selectedKeys.has(key);
                return (
                  <label
                    key={`${block.id}-${key}-${idx}`}
                    className={`ace-grid__column-filter-option${
                      isSelected
                        ? " ace-grid__column-filter-option--selected"
                        : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() =>
                        updateAdvancedBlock(block.id, (current) => {
                          if (current.kind !== "set") return current;
                          const next = new Set(current.selectedKeys);
                          if (next.has(key)) next.delete(key);
                          else next.add(key);
                          return { ...current, selectedKeys: next };
                        })
                      }
                      className="ace-grid__column-filter-checkbox"
                    />
                    {choice.label}
                  </label>
                );
              })
            )}
          </div>
        </div>
      );
    };

    const panelState: ColumnFilterState = { column };
    const valuesTabId = `${idBase}-tab-values`;
    const conditionTabId = `${idBase}-tab-condition`;
    const advancedTabId = `${idBase}-tab-advanced`;
    const valuesPanelId = `${idBase}-panel-values`;
    const conditionPanelId = `${idBase}-panel-condition`;
    const advancedPanelId = `${idBase}-panel-advanced`;
    const measuredPanelMaxHeightCss =
      measuredPanelMaxHeight != null ? `${measuredPanelMaxHeight}px` : null;
    const resolvedPanelMaxHeight = measuredPanelMaxHeightCss
      ? `min(var(--ace-grid-filter-max-height, 60vh), ${measuredPanelMaxHeightCss})`
      : "var(--ace-grid-filter-max-height, 60vh)";
    const panelBaseStyle: React.CSSProperties = {
      position: "absolute",
      top: "100%",
      left: 0,
      zIndex: 2000,
      backgroundColor: tokens.popupBackground,
      border: `1px solid ${tokens.popupBorder}`,
      borderRadius: tokens.borderRadius,
      boxShadow: tokens.popupShadow,
      padding: "12px",
      minWidth: "280px",
      maxWidth: "min(420px, 92vw)",
      maxHeight: resolvedPanelMaxHeight,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      boxSizing: "border-box",
      fontSize: `${tokens.fontSize}px`,
      color: tokens.textPrimary,
    };
    const panelStyle = components.columnFilter
      ? components.columnFilter({
          base: panelBaseStyle,
          state: panelState,
          tokens,
        })
      : panelBaseStyle;
    const effectivePanelStyle: React.CSSProperties = {
      ...panelStyle,
      boxSizing: "border-box",
    };
    const measuredPanelMaxHeightValue = measuredPanelMaxHeight ?? 0;
    if (measuredPanelMaxHeightCss) {
      const themedMaxHeight = panelStyle.maxHeight;
      if (typeof themedMaxHeight === "number") {
        effectivePanelStyle.maxHeight = `${Math.min(
          themedMaxHeight,
          measuredPanelMaxHeightValue
        )}px`;
      } else if (typeof themedMaxHeight === "string") {
        const trimmedThemedMaxHeight = themedMaxHeight.trim();
        effectivePanelStyle.maxHeight =
          trimmedThemedMaxHeight.length === 0 ||
          trimmedThemedMaxHeight.toLowerCase() === "none"
            ? measuredPanelMaxHeightCss
            : `min(${trimmedThemedMaxHeight}, ${measuredPanelMaxHeightCss})`;
      } else {
        effectivePanelStyle.maxHeight = measuredPanelMaxHeightCss;
      }
      (
        effectivePanelStyle as React.CSSProperties & Record<string, string>
      )["--ace-grid-filter-max-height"] = measuredPanelMaxHeightCss;
    }

    return (
      <div
        ref={panelRef}
        className="ace-grid__column-filter"
        style={effectivePanelStyle}
        id={triggerId ? `${triggerId}-panel` : undefined}
        role="dialog"
        aria-modal="false"
        aria-label={`Filter ${column.title}`}
        aria-labelledby={
          mode === "set"
            ? valuesTabId
            : mode === "condition"
              ? conditionTabId
              : advancedTabId
        }
        onKeyDown={handlePanelKeyDown}
      >
        <div
          className="ace-grid__column-filter-tabs"
          role="tablist"
          aria-label={`Filter modes for ${column.title}`}
        >
          <button
            type="button"
            className={`ace-grid__column-filter-tab${
              mode === "set"
                ? " ace-grid__column-filter-tab--active"
                : " ace-grid__column-filter-tab--inactive"
            }`}
            onClick={() => setMode("set")}
            id={valuesTabId}
            role="tab"
            aria-selected={mode === "set"}
            aria-controls={valuesPanelId}
            tabIndex={mode === "set" ? 0 : -1}
          >
            Values
          </button>
          <button
            type="button"
            className={`ace-grid__column-filter-tab${
              mode === "condition"
                ? " ace-grid__column-filter-tab--active"
                : " ace-grid__column-filter-tab--inactive"
            }`}
            onClick={() => setMode("condition")}
            id={conditionTabId}
            role="tab"
            aria-selected={mode === "condition"}
            aria-controls={conditionPanelId}
            tabIndex={mode === "condition" ? 0 : -1}
          >
            Condition
          </button>
          {enableAdvancedMultiFilter && (
            <button
              type="button"
              className={`ace-grid__column-filter-tab${
                mode === "advanced"
                  ? " ace-grid__column-filter-tab--active"
                  : " ace-grid__column-filter-tab--inactive"
              }`}
              onClick={() => setMode("advanced")}
              id={advancedTabId}
              role="tab"
              aria-selected={mode === "advanced"}
              aria-controls={advancedPanelId}
              tabIndex={mode === "advanced" ? 0 : -1}
            >
              Advanced
            </button>
          )}
        </div>

        <div className="ace-grid__column-filter-body">
          {mode === "set" ? (
            <div
              className="ace-grid__column-filter-section"
              role="tabpanel"
              id={valuesPanelId}
              aria-labelledby={valuesTabId}
            >
              <label className="ace-grid__column-filter-label">
                Filter {column.title}
              </label>
              <input
                className="ace-grid__column-filter-search"
                type="search"
                value={valueSearch}
                onChange={(e) => setValueSearch(e.target.value)}
                placeholder="Search values"
                aria-label={`Search values for ${column.title}`}
              />
              <div className="ace-grid__column-filter-toolbar">
                <div className="ace-grid__column-filter-toolbar-actions">
                  <button
                    type="button"
                    className="ace-grid__column-filter-action ace-grid__column-filter-action--accent"
                    onClick={selectAllVisible}
                  >
                    Select all
                  </button>
                  <button
                    type="button"
                    className="ace-grid__column-filter-action ace-grid__column-filter-action--muted"
                    onClick={clearAllVisible}
                  >
                    Clear
                  </button>
                </div>
                <span className="ace-grid__column-filter-muted">
                  {selectedKeys.size} / {allValueKeys.length}
                </span>
              </div>

              <div className="ace-grid__column-filter-options">
                {resolvedHasBlanks && (
                  <label
                    className={`ace-grid__column-filter-option${
                      includeBlanks
                        ? " ace-grid__column-filter-option--selected"
                        : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={includeBlanks}
                      onChange={() => setIncludeBlanks((prev) => !prev)}
                      className="ace-grid__column-filter-checkbox"
                    />
                    (Blanks)
                  </label>
                )}
                {filteredChoices.length === 0 ? (
                  <div className="ace-grid__column-filter-empty">
                    No matches
                  </div>
                ) : (
                  filteredChoices.map((choice, index) => {
                    const key = choice.key;
                    const isSelected = selectedKeys.has(key);
                    return (
                      <label
                        key={`${key}-${index}`}
                        className={`ace-grid__column-filter-option${
                          isSelected
                            ? " ace-grid__column-filter-option--selected"
                            : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleValueSelection(key)}
                          className="ace-grid__column-filter-checkbox"
                        />
                        {choice.label}
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          ) : mode === "condition" ? (
            <div
              className="ace-grid__column-filter-section"
              role="tabpanel"
              id={conditionPanelId}
              aria-labelledby={conditionTabId}
            >
              <label className="ace-grid__column-filter-label ace-grid__column-filter-label--compact">
                Filter {column.title}
              </label>

              <ThemedSelect
                value={condition1.operator}
                onChange={(value) =>
                  setCondition1({
                    ...condition1,
                    operator: value as FilterOperator,
                    value:
                      value === "between" &&
                      !Array.isArray(condition1.value)
                        ? ["", ""]
                        : condition1.value,
                  })
                }
                className="ace-grid__column-filter-select ace-grid__column-filter-mb-8"
                ariaLabel={`${column.title} primary operator`}
                options={getOperatorOptions(column)}
              />

              {renderConditionInput(condition1, setCondition1)}

              <div className="ace-grid__column-filter-mt-10">
                <label className="ace-grid__column-filter-checkbox-row">
                  <input
                    type="checkbox"
                    checked={condition2Enabled}
                    onChange={(e) => setCondition2Enabled(e.target.checked)}
                    className="ace-grid__column-filter-switch"
                  />
                  Add second condition
                </label>
              </div>

              {condition2Enabled && (
                <div className="ace-grid__column-filter-mt-10">
                  <ThemedSelect
                    value={join}
                    onChange={(value) => setJoin(value as FilterJoin)}
                    className="ace-grid__column-filter-select ace-grid__column-filter-mb-8"
                    ariaLabel={`${column.title} condition join`}
                    options={[
                      { value: "and", label: "AND" },
                      { value: "or", label: "OR" },
                    ]}
                  />

                  <ThemedSelect
                    value={condition2.operator}
                    onChange={(value) =>
                      setCondition2({
                        ...condition2,
                        operator: value as FilterOperator,
                        value:
                          value === "between" &&
                          !Array.isArray(condition2.value)
                            ? ["", ""]
                            : condition2.value,
                      })
                    }
                    className="ace-grid__column-filter-select ace-grid__column-filter-mb-8"
                    ariaLabel={`${column.title} secondary operator`}
                    options={getOperatorOptions(column)}
                  />

                  {renderConditionInput(condition2, setCondition2)}
                </div>
              )}
            </div>
          ) : (
            <div
              className="ace-grid__column-filter-section"
              role="tabpanel"
              id={advancedPanelId}
              aria-labelledby={advancedTabId}
            >
              <label className="ace-grid__column-filter-label ace-grid__column-filter-label--compact">
                Filter {column.title}
              </label>
              {advancedBlocks.length > 1 && (
                <div className="ace-grid__column-filter-mb-8">
                  <ThemedSelect
                    value={blockJoin}
                    onChange={(value) => setBlockJoin(value as FilterJoin)}
                    className="ace-grid__column-filter-select"
                    ariaLabel={`${column.title} block join`}
                    options={[
                      { value: "and", label: "Combine blocks with AND" },
                      { value: "or", label: "Combine blocks with OR" },
                    ]}
                  />
                </div>
              )}

              <div className="ace-grid__column-filter-stack">
                {advancedBlocks.length === 0 ? (
                  <div className="ace-grid__column-filter-help">
                    No filters yet. Add a block below.
                  </div>
                ) : (
                  advancedBlocks.map(renderAdvancedBlock)
                )}
              </div>

              <div className="ace-grid__column-filter-inline-actions ace-grid__column-filter-mt-10">
                <button
                  type="button"
                  onClick={() =>
                    setAdvancedBlocks((prev) => [
                      ...prev,
                      buildConditionBlock(),
                    ])
                  }
                  className="ace-grid__column-filter-surface-button"
                >
                  Add condition block
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setAdvancedBlocks((prev) => [...prev, buildSetBlock()])
                  }
                  className="ace-grid__column-filter-surface-button"
                >
                  Add values block
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="ace-grid__column-filter-actions">
          <button
            type="button"
            onClick={clearFilter}
            className="ace-grid__column-filter-button ace-grid__column-filter-button--clear"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={applyFilter}
            className="ace-grid__column-filter-button ace-grid__column-filter-button--apply"
          >
            Apply
          </button>
        </div>
      </div>
    );
  },
);
