import React, {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { cx } from "../utils/cx";

export type ThemedSelectOption = {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
};

export type ThemedSelectProps = {
  value: string;
  options: readonly ThemedSelectOption[];
  onChange: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  ariaLabel?: string;
  onBlur?: React.FocusEventHandler<HTMLButtonElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>;
  onPointerDown?: React.PointerEventHandler<HTMLButtonElement>;
  title?: string;
};

type PopupGeometry = {
  left: number;
  top: number;
  width: number;
  maxHeight: number;
};

const makeOpaqueColor = (value: string, colorScheme: string) => {
  const match = value.match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i,
  );
  if (!match) return value;

  const alpha = match[4] == null ? 1 : Number(match[4]);
  if (alpha >= 1) return value;

  const backdrop =
    colorScheme === "dark" ? [15, 20, 29] : [244, 248, 253];
  const channels = match.slice(1, 4).map(Number);
  const flattened = channels.map((channel, index) =>
    Math.round(channel * alpha + backdrop[index] * (1 - alpha)),
  );

  return `rgb(${flattened.join(", ")})`;
};

const readThemePopupStyle = (
  element: HTMLElement,
): React.CSSProperties & Record<string, string> => {
  const styles = window.getComputedStyle(element);
  const read = (name: string, fallback: string) =>
    styles.getPropertyValue(name).trim() || fallback;
  const popupBackground = read(
    "--ace-grid-popup-bg",
    read("--ace-grid-surface-raised", styles.backgroundColor),
  );

  return {
    "--ace-grid-select-popup-bg": makeOpaqueColor(
      popupBackground,
      styles.colorScheme,
    ),
    "--ace-grid-select-popup-border": read(
      "--ace-grid-popup-border",
      read("--ace-grid-border-color", styles.borderColor),
    ),
    "--ace-grid-select-popup-shadow": read(
      "--ace-grid-popup-shadow",
      "0 18px 36px rgba(15, 23, 42, 0.18)",
    ),
    "--ace-grid-select-popup-text": read(
      "--ace-grid-text-primary",
      styles.color,
    ),
    "--ace-grid-select-popup-muted": read(
      "--ace-grid-text-muted",
      styles.color,
    ),
    "--ace-grid-select-popup-hover": read(
      "--ace-grid-cell-bg-hover",
      "rgba(59, 130, 246, 0.1)",
    ),
    "--ace-grid-select-popup-selected": read(
      "--ace-grid-cell-bg-selected",
      "rgba(37, 99, 235, 0.16)",
    ),
    "--ace-grid-select-popup-accent": read(
      "--ace-grid-selection-border",
      read("--ace-grid-focus-outline", "#2563eb"),
    ),
    "--ace-grid-select-popup-radius": read(
      "--ace-grid-border-radius-sm",
      styles.borderRadius || "6px",
    ),
    "--ace-grid-select-popup-font": styles.fontFamily,
    "--ace-grid-select-popup-font-size": styles.fontSize,
    colorScheme: styles.colorScheme,
  };
};

export const ThemedSelect = forwardRef<HTMLButtonElement, ThemedSelectProps>(
  (
    {
      value,
      options,
      onChange,
      className,
      style,
      disabled,
      ariaLabel,
      onBlur,
      onKeyDown,
      onPointerDown,
      title,
    },
    forwardedRef,
  ) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);
    const listboxId = useId();
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [geometry, setGeometry] = useState<PopupGeometry | null>(null);
    const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});

    useImperativeHandle(forwardedRef, () => buttonRef.current!, []);

    const selectedIndex = useMemo(
      () => options.findIndex((option) => option.value === value),
      [options, value],
    );
    const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : options[0];

    const updatePopup = useCallback(() => {
      const button = buttonRef.current;
      if (!button) return;
      const rect = button.getBoundingClientRect();
      const viewportGap = 8;
      const availableBelow = window.innerHeight - rect.bottom - viewportGap;
      const availableAbove = rect.top - viewportGap;
      const openAbove = availableBelow < 180 && availableAbove > availableBelow;
      const maxHeight = Math.max(
        96,
        Math.min(320, openAbove ? availableAbove : availableBelow),
      );

      setGeometry({
        left: Math.max(viewportGap, Math.min(rect.left, window.innerWidth - rect.width - viewportGap)),
        top: openAbove
          ? Math.max(viewportGap, rect.top - Math.min(maxHeight, options.length * 36 + 8))
          : rect.bottom + 4,
        width: rect.width,
        maxHeight,
      });
      setPopupStyle(readThemePopupStyle(button));
    }, [options.length]);

    useLayoutEffect(() => {
      if (!open) return;
      updatePopup();
    }, [open, updatePopup]);

    useEffect(() => {
      if (!open) return;

      const handlePointerDown = (event: PointerEvent) => {
        const target = event.target as Node;
        if (
          buttonRef.current?.contains(target) ||
          popupRef.current?.contains(target)
        ) {
          return;
        }
        setOpen(false);
      };
      const handleViewportChange = () => updatePopup();

      document.addEventListener("pointerdown", handlePointerDown, true);
      window.addEventListener("resize", handleViewportChange);
      window.addEventListener("scroll", handleViewportChange, true);
      return () => {
        document.removeEventListener("pointerdown", handlePointerDown, true);
        window.removeEventListener("resize", handleViewportChange);
        window.removeEventListener("scroll", handleViewportChange, true);
      };
    }, [open, updatePopup]);

    const moveActive = (direction: 1 | -1) => {
      if (!options.length) return;
      let next = activeIndex >= 0 ? activeIndex : Math.max(0, selectedIndex);
      for (let attempts = 0; attempts < options.length; attempts += 1) {
        next = (next + direction + options.length) % options.length;
        if (!options[next]?.disabled) {
          setActiveIndex(next);
          return;
        }
      }
    };

    const openPopup = () => {
      if (disabled) return;
      const initial =
        selectedIndex >= 0 && !options[selectedIndex]?.disabled
          ? selectedIndex
          : options.findIndex((option) => !option.disabled);
      setActiveIndex(initial);
      setOpen(true);
    };

    const selectIndex = (index: number) => {
      const option = options[index];
      if (!option || option.disabled) return;
      onChange(option.value);
      setOpen(false);
      buttonRef.current?.focus();
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;

      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        if (!open) {
          openPopup();
        } else {
          moveActive(event.key === "ArrowDown" ? 1 : -1);
        }
        return;
      }
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (!open) openPopup();
        else if (activeIndex >= 0) selectIndex(activeIndex);
        return;
      }
      if (event.key === "Escape" && open) {
        event.preventDefault();
        setOpen(false);
      }
    };

    const popup =
      open && geometry && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={popupRef}
              id={listboxId}
              role="listbox"
              aria-label={ariaLabel}
              className="ace-grid__themed-select-popup"
              style={{
                ...popupStyle,
                left: geometry.left,
                top: geometry.top,
                width: geometry.width,
                maxHeight: geometry.maxHeight,
              }}
            >
              {options.map((option, index) => {
                const selected = option.value === value;
                const active = index === activeIndex;
                return (
                  <button
                    key={`${option.value}-${index}`}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    disabled={option.disabled}
                    className={cx(
                      "ace-grid__themed-select-option",
                      selected && "ace-grid__themed-select-option--selected",
                      active && "ace-grid__themed-select-option--active",
                    )}
                    onPointerDown={(event) => event.preventDefault()}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => selectIndex(index)}
                  >
                    <span className="ace-grid__themed-select-option-label">
                      {option.label}
                    </span>
                    {selected ? (
                      <svg
                        className="ace-grid__themed-select-check"
                        viewBox="0 0 16 16"
                        aria-hidden="true"
                      >
                        <path d="m3.5 8.25 2.75 2.75 6.25-6.25" />
                      </svg>
                    ) : null}
                  </button>
                );
              })}
            </div>,
            document.body,
          )
        : null;

    return (
      <>
        <button
          ref={buttonRef}
          type="button"
          role="combobox"
          aria-label={ariaLabel}
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          aria-haspopup="listbox"
          disabled={disabled}
          className={cx("ace-grid__themed-select", className)}
          style={style}
          title={title}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          onPointerDown={onPointerDown}
          onClick={() => (open ? setOpen(false) : openPopup())}
        >
          <span className="ace-grid__themed-select-value">
            {selectedOption?.label ?? ""}
          </span>
          <svg
            className="ace-grid__themed-select-caret"
            viewBox="0 0 16 16"
            aria-hidden="true"
          >
            <path d="m4.5 6.5 3.5 3.5 3.5-3.5" />
          </svg>
        </button>
        {popup}
      </>
    );
  },
);

ThemedSelect.displayName = "ThemedSelect";
