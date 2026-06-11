import React, {
  useEffect,
  useRef,
  useCallback,
  useState,
  useMemo,
  memo,
  useId,
} from "react";
import { createPortal } from "react-dom";
import type { GridColumn, GridRow, GridValidationSeverity } from "../../../types";
import { coerceInputValue } from "../../cell-format";
import { useGridTheme } from "../../theming";
import { cx } from "../../../utils/cx";
import { updateValidationTooltipPlacement } from "../../../components/validationTooltipPlacement";
import { ThemedSelect } from "../../../components/ThemedSelect";

const DATE_ONLY_LENGTH = 10;
const DATETIME_LENGTH = 16;
const TIME_LENGTH = 5;

export type EditorKind =
  | "input"
  | "number"
  | "checkbox"
  | "select"
  | "radio"
  | "date"
  | "datetime"
  | "time"
  | "textarea"
  | "json"
  | "custom";

type SelectOption = string | number | boolean | { value: unknown; label?: string };
type NormalizedOption = { value: string; label: string; raw: unknown };

type CellEditorProps = {
  column: GridColumn;
  row?: GridRow;
  value: any;
  version: number;
  style?: React.CSSProperties;
  onChange: (value: any) => void;
  onSubmit: (value: any) => void;
  onCancel: () => void;
  registerValueListener: (listener: ((value: any) => void) | null) => void;
  validationMessage?: string;
  validationSeverity?: GridValidationSeverity;
  validationClassName?: string;
};

const normalizeOptions = (
  options: SelectOption[] | undefined,
  fallback: SelectOption[] = []
): NormalizedOption[] => {
  const source = options && options.length > 0 ? options : fallback;
  return source.map((option) => {
    if (typeof option === "object" && option !== null && "value" in option) {
      const rawValue = option.value;
      const label =
        option.label !== undefined ? option.label : String(option.value);
      return { value: String(rawValue), label, raw: rawValue };
    }
    return {
      value: String(option),
      label: String(option),
      raw: option,
    };
  });
};

const stringifyJsonValue = (value: any): string => {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "string") {
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

const summarizeJson = (value: any): string => {
  const flattened = stringifyJsonValue(value).replace(/\s+/g, " ");
  return flattened.length > 60 ? `${flattened.slice(0, 57)}…` : flattened;
};

type JsonEditorOverlayProps = {
  value: any;
  onChange: (value: any) => void;
  onSubmit: (value: any) => void;
  onCancel: () => void;
  registerValueListener: (listener: ((value: any) => void) | null) => void;
};

const JsonEditorOverlay: React.FC<JsonEditorOverlayProps> = memo(
  ({ value, onChange, onSubmit, onCancel, registerValueListener }) => {
    const { icons, slug } = useGridTheme();
    const [text, setText] = useState(() => stringifyJsonValue(value));
    const [preview, setPreview] = useState(() => stringifyJsonValue(value));
    const [error, setError] = useState<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);
    const lastValidRef = useRef<any>(value);
    const titleId = useId();
    const descriptionId = useId();

    const syncFromExternal = useCallback(
      (next: any) => {
        const nextText = stringifyJsonValue(next);
        setText((prev) => (prev === nextText ? prev : nextText));
        setPreview(nextText);
        setError(null);
        lastValidRef.current = next;
      },
      []
    );

    useEffect(() => {
      syncFromExternal(value);
    }, [value, syncFromExternal]);

    useEffect(() => {
      registerValueListener((next) => syncFromExternal(next));
      return () => registerValueListener(null);
    }, [registerValueListener, syncFromExternal]);

    useEffect(() => {
      const tick = window.setTimeout(() => {
        const el = textareaRef.current;
        if (el && typeof el.focus === "function") {
          el.focus({ preventScroll: true });
          el.select();
        }
      }, 0);
      return () => window.clearTimeout(tick);
    }, []);

    const handleDraftChange = useCallback(
      (draft: string, propagate: boolean) => {
        setText(draft);
        try {
          const parsed = draft.trim() === "" ? null : JSON.parse(draft);
          setError(null);
          setPreview(parsed === null ? "" : JSON.stringify(parsed, null, 2));
          lastValidRef.current = parsed;
          if (propagate) onChange(parsed);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Invalid JSON");
          if (propagate) onChange(lastValidRef.current);
        }
      },
      [onChange]
    );

    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        handleDraftChange(event.target.value, true);
      },
      [handleDraftChange]
    );

    const handleFormat = useCallback(() => {
      try {
        const parsed = text.trim() === "" ? null : JSON.parse(text);
        const pretty = parsed === null ? "" : JSON.stringify(parsed, null, 2);
        handleDraftChange(pretty, true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Invalid JSON");
      }
    }, [handleDraftChange, text]);

    const handleSave = useCallback(() => {
      try {
        const parsed = text.trim() === "" ? null : JSON.parse(text);
        setError(null);
        setPreview(parsed === null ? "" : JSON.stringify(parsed, null, 2));
        lastValidRef.current = parsed;
        onChange(parsed);
        onSubmit(parsed);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Invalid JSON");
      }
    }, [text, onChange, onSubmit]);

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        event.stopPropagation();
        if (event.key === "Escape") {
          event.preventDefault();
          onCancel();
          return;
        }
        if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
          event.preventDefault();
          handleSave();
        }
      },
      [handleSave, onCancel]
    );

    const handleDialogKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          onCancel();
          return;
        }
        if (event.key !== "Tab") return;
        const root = dialogRef.current;
        if (!root) return;
        const focusable = Array.from(
          root.querySelectorAll<HTMLElement>(
            'button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
          ),
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (event.shiftKey) {
          if (active === first || !root.contains(active)) {
            event.preventDefault();
            last.focus({ preventScroll: true });
          }
          return;
        }
        if (active === last) {
          event.preventDefault();
          first.focus({ preventScroll: true });
        }
      },
      [onCancel],
    );
    const hasJsonError = Boolean(error);

    const overlay = (
      <div
        className="ace-grid__json-editor-overlay"
        data-ace-grid-theme={slug}
        role="presentation"
        onMouseDown={onCancel}
      >
        <div
          ref={dialogRef}
          className="ace-grid__json-editor"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          onKeyDown={handleDialogKeyDown}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <header
            className="ace-grid__json-editor-header"
          >
            <span className="ace-grid__json-editor-title" id={titleId}>JSON Editor</span>
            <button
              type="button"
              className="ace-grid__chart-action ace-grid__chart-action--close ace-grid__chart-close ace-grid__json-editor-close"
              onClick={(event) => {
                event.stopPropagation();
                onCancel();
              }}
              aria-label="Close JSON editor"
            >
              {icons.chartClose({
                className: "ace-grid__chart-action-icon ace-grid__chart-close-icon",
              })}
            </button>
          </header>
          <div className="ace-grid__json-editor-body">
            <div className="ace-grid__json-editor-pane ace-grid__json-editor-pane--input">
              <div className="ace-grid__json-editor-pane-head">
                <div className="ace-grid__json-editor-pane-label">Editor</div>
                <button
                  type="button"
                  className="ace-grid__json-editor-button ace-grid__json-editor-button--primary ace-grid__json-editor-button--format"
                  onClick={handleFormat}
                  title="Format JSON"
                >
                  Format
                </button>
              </div>
              <textarea
                ref={textareaRef}
                className="ace-grid__json-editor-textarea"
                value={text}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                aria-label="JSON editor input"
              />
            </div>
            <div className="ace-grid__json-editor-pane ace-grid__json-editor-pane--preview">
              <div className="ace-grid__json-editor-pane-head">
                <div className="ace-grid__json-editor-pane-label">Preview</div>
              </div>
              <div className="ace-grid__json-editor-preview">
                {preview.trim() === "" ? "/* JSON preview */" : preview}
              </div>
            </div>
          </div>
          <footer className="ace-grid__json-editor-footer">
            <span
              id={descriptionId}
              className={cx(
                "ace-grid__json-editor-meta",
                error && "ace-grid__json-editor-meta--error"
              )}
            >
              {error ? `Error: ${error}` : "Ctrl/Cmd + Enter to save"}
            </span>
            <div className="ace-grid__json-editor-actions">
              <button
                type="button"
                className="ace-grid__json-editor-button ace-grid__json-editor-button--ghost"
                onClick={onCancel}
              >
                Cancel
              </button>
              <button
                type="button"
                className="ace-grid__json-editor-button ace-grid__json-editor-button--primary ace-grid__json-editor-button--save"
                onClick={handleSave}
                disabled={hasJsonError}
                title={hasJsonError ? "Fix JSON errors to save" : "Save JSON"}
              >
                Save
              </button>
            </div>
          </footer>
        </div>
      </div>
    );

    if (typeof document === "undefined") return overlay;
    return createPortal(overlay, document.body);
  }
);

JsonEditorOverlay.displayName = "JsonEditorOverlay";

const resolveEditorKind = (column: GridColumn): EditorKind => {
  if (column.editorType) {
    const normalized = column.editorType
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/-/g, "");
    if (normalized === "input" || normalized === "text") return "input";
    if (normalized === "checkbox") return "checkbox";
    if (normalized === "select") return "select";
    if (normalized === "radio") return "radio";
    if (normalized === "datetime") return "datetime";
    if (normalized === "time") return "time";
    if (normalized === "textarea") return "textarea";
    if (normalized === "json") return "json";
    if (normalized === "custom") return "custom";
  }

  switch (column.type) {
    case "number":
      return "number";
    case "boolean":
      return "checkbox";
    case "date":
      return "date";
    case "datetime":
      return "datetime";
    case "time":
      return "time";
    case "select":
      return "select";
    case "radio":
      return "radio";
    case "textarea":
      return "textarea";
    case "json":
      return "json";
    case "custom":
      return "custom";
    default:
      return "input";
  }
};

const normalizeValueForKind = (value: any, kind: EditorKind): any => {
  if (value === undefined || value === null) {
    if (kind === "checkbox") return false;
    return "";
  }

  switch (kind) {
    case "checkbox":
      if (typeof value === "string") {
        const lower = value.trim().toLowerCase();
        if (lower === "true" || lower === "1") return true;
        if (lower === "false" || lower === "0") return false;
      }
      return Boolean(value);
    case "number":
      return value === "" ? "" : String(value);
    case "date":
      if (value instanceof Date)
        return value.toISOString().slice(0, DATE_ONLY_LENGTH);
      return String(value).slice(0, DATE_ONLY_LENGTH);
    case "datetime":
      if (value instanceof Date)
        return value.toISOString().slice(0, DATETIME_LENGTH);
      {
        const candidate = new Date(value);
        if (!Number.isNaN(candidate.getTime())) {
          return candidate.toISOString().slice(0, DATETIME_LENGTH);
        }
      }
      return String(value).slice(0, DATETIME_LENGTH);
    case "time":
      if (value instanceof Date)
        return value.toISOString().slice(11, 11 + TIME_LENGTH);
      return String(value).slice(0, TIME_LENGTH);
    case "json":
      return stringifyJsonValue(value);
    default:
      return String(value);
  }
};

const parseValueFromInput = (
  raw: string | boolean,
  kind: EditorKind,
  column?: GridColumn,
): any => {
  switch (kind) {
    case "checkbox":
      return Boolean(raw);
    case "number": {
      if (raw === "" || raw === null) return "";
      return coerceInputValue(String(raw), "number", column);
    }
    case "date":
      if (!raw) return null;
      {
        const parsed = new Date(`${raw}T00:00:00`);
        return Number.isNaN(parsed.getTime()) ? raw : parsed;
      }
    case "datetime":
      if (!raw) return null;
      {
        const parsed = new Date(raw as string);
        return Number.isNaN(parsed.getTime()) ? raw : parsed;
      }
    case "time":
      return raw;
    case "json":
      if (typeof raw !== "string") return raw;
      try {
        return JSON.parse(raw);
      } catch {
        return raw;
      }
    default:
      return raw;
  }
};

export const CellEditor: React.FC<CellEditorProps> = memo(
  ({
    column,
    row,
    value,
    version,
    style,
    onChange,
    onSubmit,
    onCancel,
    registerValueListener,
    validationMessage,
    validationSeverity,
    validationClassName,
  }) => {
    const baseEditorKind = resolveEditorKind(column);
    const [internalValue, setInternalValue] = useState<any>(() =>
      baseEditorKind === "json"
        ? value
        : normalizeValueForKind(value, baseEditorKind)
    );
    const isFormulaInput =
      typeof internalValue === "string" && internalValue.trim().startsWith("=");
    const editorKind: EditorKind = isFormulaInput ? "input" : baseEditorKind;
    const inputRef = useRef<
      HTMLButtonElement | HTMLInputElement | HTMLTextAreaElement
    >(null);
    const skipBlurCommitRef = useRef(false);
    const radioGroupName = useMemo(
      () => `grid-radio-${column.key}-${row?.id ?? "row"}`,
      [column.key, row?.id]
    );

    const validationClasses = useMemo(
      () =>
        cx(
          validationSeverity && "ace-grid__cell-editor--validation",
          validationSeverity &&
            `ace-grid__cell-editor--validation-${validationSeverity}`
        ),
      [validationSeverity]
    );
    const combinedValidationClassName = useMemo(
      () => cx(validationClasses, validationClassName),
      [validationClasses, validationClassName]
    );
    const validationAttributes = useMemo(
      () => ({
        "data-validation-message": validationMessage,
        "data-validation-severity": validationSeverity,
        onMouseEnter: (event: React.MouseEvent<HTMLElement>) =>
          updateValidationTooltipPlacement(
            event.currentTarget,
            validationMessage,
          ),
        onFocusCapture: (event: React.FocusEvent<HTMLElement>) =>
          updateValidationTooltipPlacement(
            event.currentTarget,
            validationMessage,
          ),
        title: validationMessage,
        "aria-invalid": validationSeverity ? true : undefined,
      }),
      [validationMessage, validationSeverity]
    );
    const inputAriaLabel = useMemo(() => `Edit ${column.title}`, [column.title]);

    const setInternalIfChanged = useCallback((next: any) => {
      setInternalValue((prev: any) => (Object.is(prev, next) ? prev : next));
    }, []);

    useEffect(() => {
      if (baseEditorKind === "json") return;
      const normalized = normalizeValueForKind(value, baseEditorKind);
      setInternalIfChanged(normalized);
    }, [value, baseEditorKind, version, setInternalIfChanged]);

    useEffect(() => {
      if (baseEditorKind === "json") return;
      if (baseEditorKind === "custom" && column.renderEditor) {
        registerValueListener(null);
        return () => registerValueListener(null);
      }
      const listener = (next: any) =>
        setInternalIfChanged(normalizeValueForKind(next, editorKind));
      registerValueListener(listener);
      return () => registerValueListener(null);
    }, [
      column.renderEditor,
      baseEditorKind,
      editorKind,
      registerValueListener,
      setInternalIfChanged,
    ]);

    useEffect(() => {
      if (editorKind === "json") return;
      const el = inputRef.current;
      if (el && typeof el.focus === "function") {
        const active =
          typeof document !== "undefined"
            ? (document.activeElement as HTMLElement | null)
            : null;
        if (
          active?.classList?.contains("ace-grid__formula-bar-input") ||
          active?.closest?.(".ace-grid__formula-bar")
        ) {
          return;
        }
        el.focus({ preventScroll: true });
        if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
          el.select();
        }
      }
    }, [editorKind, version]);

    const commitAndClose = useCallback(
      (next: any) => {
        skipBlurCommitRef.current = true;
        onSubmit(next);
      },
      [onSubmit]
    );

    const handleInternalChange = useCallback(
      (nextRaw: any) => {
        if (editorKind === "json") return;
        const nextValue = parseValueFromInput(nextRaw, editorKind, column);
        setInternalIfChanged(nextRaw);
        onChange(nextValue);
      },
      [column, editorKind, onChange, setInternalIfChanged]
    );

    const handleBlur = useCallback((event?: React.FocusEvent<HTMLElement>) => {
      if (editorKind === "json") return;
      if (skipBlurCommitRef.current) {
        skipBlurCommitRef.current = false;
        return;
      }
      const related = event?.relatedTarget as HTMLElement | null;
      const active =
        related ??
        (typeof document !== "undefined" ? (document.activeElement as HTMLElement | null) : null);
      if (
        active?.classList?.contains("ace-grid__formula-bar-input") ||
        active?.closest?.(".ace-grid__formula-bar")
      ) {
        return;
      }
      const nextValue = parseValueFromInput(internalValue, editorKind, column);
      onSubmit(nextValue);
    }, [column, internalValue, editorKind, onSubmit]);

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent) => {
        event.stopPropagation();
        if (event.key === "Escape") {
          event.preventDefault();
          onCancel();
          return;
        }

        if (event.key === "=" && editorKind !== "input") {
          event.preventDefault();
          setInternalIfChanged("=");
          onChange("=");
          return;
        }

        if (event.key === "Tab") {
          event.preventDefault();
          const nextValue = parseValueFromInput(internalValue, editorKind, column);
          commitAndClose(nextValue);
          return;
        }

        if (editorKind === "textarea") {
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            const nextValue = parseValueFromInput(internalValue, editorKind, column);
            commitAndClose(nextValue);
          }
          return;
        }

        if (event.key === "Enter" && editorKind !== "json") {
          event.preventDefault();
          const nextValue = parseValueFromInput(internalValue, editorKind, column);
          commitAndClose(nextValue);
        }
      },
      [
        column,
        editorKind,
        onCancel,
        setInternalIfChanged,
        onChange,
        internalValue,
        commitAndClose,
      ]
    );

    const containerStyle = useMemo<React.CSSProperties>(
      () => ({
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        border: "var(--ace-grid-editor-border, 1px solid var(--ace-grid-selection-border))",
        outline: "none",
        backgroundColor: "var(--ace-grid-editor-bg, var(--ace-grid-cell-bg))",
        boxShadow: "var(--ace-grid-editor-shadow, none)",
        backdropFilter: "var(--ace-grid-editor-backdrop, none)",
        borderRadius: "var(--ace-grid-cell-radius, 8px)",
        ...style,
      }),
      [style]
    );
    const columnOptions = useMemo(
      () =>
        normalizeOptions(
          (column.editorProps?.options as SelectOption[] | undefined) ??
            (column.options as SelectOption[] | undefined)
        ),
      [column.editorProps?.options, column.options]
    );

    if (editorKind === "custom" && column.renderEditor) {
      const dispose = (listener: (value: any) => void) => {
        registerValueListener((next) => listener(next));
        return () => registerValueListener(null);
      };

      return (
        <div
          className={cx(
            "ace-grid__cell-editor",
            "ace-grid__cell-editor--custom",
            combinedValidationClassName
          )}
          style={containerStyle}
          onMouseDown={(event) => event.stopPropagation()}
          {...validationAttributes}
        >
          {column.renderEditor({
            value,
            row: row!,
            column,
            onChange,
            onCommit: (next) => commitAndClose(next),
            onCancel,
            registerValueListener: dispose,
          })}
        </div>
      );
    }

    if (editorKind === "checkbox") {
      return (
        <div
          className={cx(
            "ace-grid__cell-editor",
            "ace-grid__cell-editor--checkbox",
            combinedValidationClassName
          )}
          style={containerStyle}
          onMouseDown={(event) => event.stopPropagation()}
          {...validationAttributes}
        >
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="checkbox"
            className="ace-grid__cell-editor-checkbox"
            checked={Boolean(internalValue)}
            aria-label={inputAriaLabel}
            onChange={(event) => {
              const next = event.target.checked;
              setInternalIfChanged(next);
              onChange(next);
              commitAndClose(next);
            }}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
          />
        </div>
      );
    }

    if (editorKind === "select") {
      const fallback = columnOptions.length
        ? columnOptions
        : normalizeOptions(["Option A", "Option B"]);
      return (
        <div
          className={cx(
            "ace-grid__cell-editor",
            "ace-grid__cell-editor--select",
            combinedValidationClassName
          )}
          style={containerStyle}
          onMouseDown={(event) => event.stopPropagation()}
          {...validationAttributes}
        >
          <ThemedSelect
            className="ace-grid__cell-editor-select"
            ref={inputRef as React.RefObject<HTMLButtonElement>}
            value={internalValue as string}
            ariaLabel={inputAriaLabel}
            onChange={(nextValue) => {
              const match = fallback.find((option) => option.value === nextValue);
              setInternalIfChanged(nextValue);
              const raw = match ? match.raw : nextValue;
              onChange(raw);
              commitAndClose(raw);
            }}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            options={fallback.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
          />
        </div>
      );
    }

    if (editorKind === "radio") {
      const radioOptions = columnOptions.length
        ? columnOptions
        : normalizeOptions(["Yes", "No"]);
      const current = internalValue == null ? "" : String(internalValue);

      return (
        <div
          className={cx(
            "ace-grid__cell-editor",
            "ace-grid__cell-editor--radio",
            combinedValidationClassName
          )}
          style={containerStyle}
          onMouseDown={(event) => event.stopPropagation()}
          role="radiogroup"
          aria-label={inputAriaLabel}
          {...validationAttributes}
        >
          {radioOptions.map((option, idx) => (
            <label
              key={option.value}
              className="ace-grid__cell-editor-radio-label"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <input
                ref={idx === 0 ? (inputRef as React.RefObject<HTMLInputElement>) : undefined}
                type="radio"
                name={radioGroupName}
                value={option.value}
                className="ace-grid__cell-editor-radio-input"
                checked={current === option.value}
                aria-label={option.label}
                onChange={() => {
                  setInternalIfChanged(option.value);
                  onChange(option.raw);
                  commitAndClose(option.raw);
                }}
                onKeyDown={handleKeyDown}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      );
    }

    if (editorKind === "textarea") {
      return (
        <div
          className={cx(
            "ace-grid__cell-editor",
            "ace-grid__cell-editor--textarea",
            combinedValidationClassName
          )}
          style={containerStyle}
          onMouseDown={(event) => event.stopPropagation()}
          {...validationAttributes}
        >
          <textarea
            className="ace-grid__cell-editor-textarea"
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={internalValue}
            rows={column.editorProps?.rows ?? 4}
            aria-label={inputAriaLabel}
            onChange={(event) => handleInternalChange(event.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
          />
        </div>
      );
    }

    if (editorKind === "json") {
      return (
        <>
          <div
            className={cx(
              "ace-grid__cell-editor",
              "ace-grid__cell-editor--preview",
              combinedValidationClassName
            )}
            style={containerStyle}
            onMouseDown={(event) => event.stopPropagation()}
            aria-label={`JSON editor preview for ${column.title}`}
            {...validationAttributes}
          >
            {summarizeJson(value) || "<empty>"}
          </div>
          <JsonEditorOverlay
            value={value}
            onChange={onChange}
            onSubmit={onSubmit}
            onCancel={onCancel}
            registerValueListener={registerValueListener}
          />
        </>
      );
    }

    const inputType =
      editorKind === "number"
        ? "number"
        : editorKind === "date"
        ? "date"
        : editorKind === "datetime"
        ? "datetime-local"
        : editorKind === "time"
        ? "time"
        : (column.editorProps?.inputType as string) || "text";

    return (
      <div
        className={cx(
          "ace-grid__cell-editor",
          "ace-grid__cell-editor--input",
          combinedValidationClassName
        )}
        style={containerStyle}
        onMouseDown={(event) => event.stopPropagation()}
        {...validationAttributes}
      >
        <input
          className="ace-grid__cell-editor-input"
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type={inputType}
          value={internalValue}
          aria-label={inputAriaLabel}
          onChange={(event) => handleInternalChange(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={column.title}
        />
      </div>
    );
  }
);

CellEditor.displayName = "CellEditor";
