import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { useGridTheme } from "../../theming";
import { cx } from "../../../utils/cx";
import type {
  GridContextMenuActionContext,
  GridContextMenuConfig,
  GridContextMenuContext,
  GridContextMenuResolvedItem,
  GridContextMenuResolvedSubmenuItem,
} from "../types";

export interface CellContextMenuProps {
  open: boolean;
  context: GridContextMenuContext;
  items: GridContextMenuResolvedItem[];
  config: GridContextMenuConfig;
  onClose: () => void;
  onSelect: (ctx: GridContextMenuActionContext) => void;
}

const MENU_PADDING = 4;
const MENU_MIN_EDGE_GAP = 8;
const MENU_DEFAULT_MAX_HEIGHT = 360;
const SUBMENU_OFFSET = 6;
const SUBMENU_MIN_WIDTH = 220;

type MenuBounds = {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

type SubmenuState = {
  index: number;
  item: GridContextMenuResolvedSubmenuItem;
  anchorRect: MenuBounds;
  preferredSide: "left" | "right";
  position: {
    x: number;
    y: number;
  };
  highlightedIndex: number | null;
  panelId: string;
};

const isRootSelectableItem = (item: GridContextMenuResolvedItem) =>
  item.type === "action" || item.type === "submenu";

const isLeafSelectableItem = (item: GridContextMenuResolvedItem) =>
  item.type === "action";

export const CellContextMenu: React.FC<CellContextMenuProps> = ({
  open,
  context,
  items,
  config,
  onClose,
  onSelect,
}) => {
  const { tokens, components, slug } = useGridTheme();
  const portalContainer =
    config.portalContainer ??
    (typeof document !== "undefined" ? document.body : null);
  const isBodyPortal =
    !portalContainer || portalContainer === document.body;

  const overlayRef = useRef<HTMLDivElement>(null);
  const rootMenuRef = useRef<HTMLDivElement>(null);
  const submenuMenuRef = useRef<HTMLDivElement>(null);
  const rootItemRefs = useRef(new Map<string, HTMLDivElement>());
  const submenuItemRefs = useRef(new Map<string, HTMLDivElement>());
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const [position, setPosition] = useState({
    x: context.anchorX,
    y: context.anchorY,
  });
  const [submenuState, setSubmenuState] = useState<SubmenuState | null>(null);

  const visibleItems = useMemo(
    () => items.filter((item) => !item.hidden),
    [items]
  );

  const panelMaxHeight = useMemo(() => {
    if (typeof window === "undefined") {
      return config.maxHeight ?? MENU_DEFAULT_MAX_HEIGHT;
    }
    const containerBounds =
      !isBodyPortal && portalContainer
        ? portalContainer.getBoundingClientRect()
        : null;
    const containerHeight = containerBounds
      ? containerBounds.height
      : window.innerHeight;
    const requested = config.maxHeight ?? MENU_DEFAULT_MAX_HEIGHT;
    return Math.max(
      0,
      Math.min(requested, containerHeight - MENU_MIN_EDGE_GAP * 2)
    );
  }, [config.maxHeight, isBodyPortal, portalContainer]);

  const firstEnabledIndex = useMemo(() => {
    return visibleItems.findIndex(
      (item) => isRootSelectableItem(item) && !item.disabled
    );
  }, [visibleItems]);

  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(
    firstEnabledIndex >= 0 ? firstEnabledIndex : null
  );

  useEffect(() => {
    if (firstEnabledIndex >= 0) {
      setHighlightedIndex(firstEnabledIndex);
    } else {
      setHighlightedIndex(null);
    }
  }, [firstEnabledIndex, visibleItems.length]);

  const getContainerMetrics = useCallback(() => {
    if (typeof window === "undefined") {
      return null;
    }
    const bounds =
      !isBodyPortal && portalContainer
        ? portalContainer.getBoundingClientRect()
        : null;
    return {
      bounds,
      width: bounds ? bounds.width : window.innerWidth,
      height: bounds ? bounds.height : window.innerHeight,
    };
  }, [isBodyPortal, portalContainer]);

  const closeSubmenu = useCallback(() => {
    setSubmenuState(null);
  }, []);

  const triggerActionItem = useCallback(
    (item: GridContextMenuResolvedItem) => {
      if (item.disabled || item.type !== "action") return;
      const actionCtx = { ...context, item };
      item.onSelect?.(actionCtx);
      onSelect(actionCtx);
      if (config.closeOnSelect !== false) {
        onClose();
      }
    },
    [config.closeOnSelect, context, onClose, onSelect]
  );

  const openSubmenu = useCallback(
    (index: number) => {
      const item = visibleItems[index];
      if (!item || item.type !== "submenu" || item.disabled) return;
      const triggerElement = rootItemRefs.current.get(item.id);
      if (!triggerElement || typeof window === "undefined") return;

      const metrics = getContainerMetrics();
      const rect = triggerElement.getBoundingClientRect();
      const anchorLeft = metrics?.bounds
        ? rect.left - metrics.bounds.left
        : rect.left;
      const anchorRight = metrics?.bounds
        ? rect.right - metrics.bounds.left
        : rect.right;
      const anchorTop = metrics?.bounds ? rect.top - metrics.bounds.top : rect.top;
      const preferredSide =
        metrics && metrics.width - anchorRight < SUBMENU_MIN_WIDTH + MENU_MIN_EDGE_GAP
          ? "left"
          : "right";
      const x =
        preferredSide === "right"
          ? anchorRight + SUBMENU_OFFSET
          : Math.max(
              MENU_MIN_EDGE_GAP,
              anchorLeft - SUBMENU_OFFSET - SUBMENU_MIN_WIDTH
            );
      const y = anchorTop;
      const firstEnabledChild = item.items.findIndex(
        (child) => child.type === "action" && !child.disabled
      );

      setSubmenuState({
        index,
        item,
        anchorRect: {
          top: rect.top,
          left: rect.left,
          right: rect.right,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height,
        },
        preferredSide,
        position: { x, y },
        highlightedIndex: firstEnabledChild >= 0 ? firstEnabledChild : null,
        panelId: `ace-grid-context-menu-submenu-${item.id}`,
      });
    },
    [getContainerMetrics, visibleItems]
  );

  const setSubmenuHighlight = useCallback((nextIndex: number | null) => {
    setSubmenuState((prev) =>
      prev ? { ...prev, highlightedIndex: nextIndex } : prev
    );
  }, []);

  const getNextSelectableIndex = useCallback(
    (
      menuItems: GridContextMenuResolvedItem[],
      startIndex: number,
      delta: number,
      predicate: (item: GridContextMenuResolvedItem) => boolean
    ) => {
      if (!menuItems.length) return null;
      let next = startIndex;
      for (let i = 0; i < menuItems.length; i += 1) {
        next = (next + delta + menuItems.length) % menuItems.length;
        const candidate = menuItems[next];
        if (predicate(candidate) && !candidate.disabled) {
          return next;
        }
      }
      return null;
    },
    []
  );

  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    restoreFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    return () => {
      const previous = restoreFocusRef.current;
      restoreFocusRef.current = null;
      if (!previous || typeof previous.focus !== "function") return;
      if (!document.contains(previous)) return;
      previous.focus({ preventScroll: true });
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const isInsideMenuStack = (target: EventTarget | null) => {
      if (!(target instanceof Node)) return false;
      if (rootMenuRef.current?.contains(target)) return true;
      if (submenuMenuRef.current?.contains(target)) return true;
      return false;
    };

    const handleGlobalClick = (event: MouseEvent) => {
      if (isInsideMenuStack(event.target)) return;
      onClose();
    };

    const handleBlur = () => {
      const activeElement = document.activeElement;
      if (isInsideMenuStack(activeElement)) return;
      onClose();
    };

    const handleContextMenu = (event: MouseEvent) => {
      if (isInsideMenuStack(event.target)) return;
      onClose();
    };

    const moveHighlight = (
      menuItems: GridContextMenuResolvedItem[],
      currentIndex: number | null,
      delta: number,
      predicate: (item: GridContextMenuResolvedItem) => boolean,
      setter: (next: number | null) => void
    ) => {
      if (!menuItems.length) return;
      const startIndex = currentIndex ?? -1;
      const next = getNextSelectableIndex(menuItems, startIndex, delta, predicate);
      if (next != null) setter(next);
    };

    const activeMenuItems = submenuState?.item.items ?? visibleItems;
    const activeHighlight = submenuState
      ? submenuState.highlightedIndex
      : highlightedIndex;
    const activeSetter = submenuState ? setSubmenuHighlight : setHighlightedIndex;
    const activePredicate = submenuState
      ? isLeafSelectableItem
      : isRootSelectableItem;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "Tab") {
        event.preventDefault();
        onClose();
        return;
      }

      if (!activeMenuItems.length) return;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          moveHighlight(
            activeMenuItems,
            activeHighlight,
            1,
            activePredicate,
            activeSetter
          );
          break;
        case "ArrowUp":
          event.preventDefault();
          moveHighlight(
            activeMenuItems,
            activeHighlight,
            -1,
            activePredicate,
            activeSetter
          );
          break;
        case "ArrowRight": {
          event.preventDefault();
          if (!submenuState && highlightedIndex != null) {
            const item = visibleItems[highlightedIndex];
            if (item?.type === "submenu" && !item.disabled) {
              openSubmenu(highlightedIndex);
            }
          }
          break;
        }
        case "ArrowLeft":
          if (submenuState) {
            event.preventDefault();
            closeSubmenu();
          }
          break;
        case "Enter":
        case " ": {
          event.preventDefault();
          if (submenuState) {
            if (submenuState.highlightedIndex == null) return;
            const item =
              submenuState.item.items[submenuState.highlightedIndex];
            if (item?.type === "action" && !item.disabled) {
              triggerActionItem(item);
            }
            return;
          }

          if (highlightedIndex == null) return;
          const item = visibleItems[highlightedIndex];
          if (!item || item.disabled) return;
          if (item.type === "submenu") {
            openSubmenu(highlightedIndex);
            return;
          }
          triggerActionItem(item);
          break;
        }
        case "Home":
          event.preventDefault();
          {
            const firstIndex = activeMenuItems.findIndex(
              (item) => activePredicate(item) && !item.disabled
            );
            activeSetter(firstIndex >= 0 ? firstIndex : null);
          }
          break;
        case "End":
          event.preventDefault();
          {
            let next: number | null = null;
            for (let i = activeMenuItems.length - 1; i >= 0; i -= 1) {
              const candidate = activeMenuItems[i];
              if (activePredicate(candidate) && !candidate.disabled) {
                next = i;
                break;
              }
            }
            activeSetter(next);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("mousedown", handleGlobalClick);
    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      window.removeEventListener("mousedown", handleGlobalClick);
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [
    closeSubmenu,
    getNextSelectableIndex,
    highlightedIndex,
    onClose,
    openSubmenu,
    submenuState,
    triggerActionItem,
    setHighlightedIndex,
    setSubmenuHighlight,
    visibleItems,
  ]);

  useEffect(() => {
    if (!open) return;
    if (!rootMenuRef.current) return;
    rootMenuRef.current.focus({ preventScroll: true });
  }, [open, context.anchorX, context.anchorY, visibleItems.length]);

  useLayoutEffect(() => {
    if (!open) return;
    if (!rootMenuRef.current) return;
    if (typeof window === "undefined") return;

    const rect = rootMenuRef.current.getBoundingClientRect();
    const metrics = getContainerMetrics();
    const containerWidth = metrics?.width ?? window.innerWidth;
    const containerHeight = metrics?.height ?? window.innerHeight;
    const minX = MENU_MIN_EDGE_GAP;
    const maxX = containerWidth - rect.width - MENU_MIN_EDGE_GAP;
    const minY = MENU_MIN_EDGE_GAP;
    const maxY = containerHeight - rect.height - MENU_MIN_EDGE_GAP;
    const anchorX = metrics?.bounds
      ? context.anchorX - metrics.bounds.left
      : context.anchorX;
    const anchorY = metrics?.bounds
      ? context.anchorY - metrics.bounds.top
      : context.anchorY;

    let nextX = anchorX;
    let nextY = anchorY;

    if (nextX + rect.width + MENU_PADDING > containerWidth) {
      nextX = Math.max(minX, maxX);
    }
    if (nextY + rect.height + MENU_PADDING > containerHeight) {
      nextY = Math.max(minY, maxY);
    }
    nextX = Math.max(minX, Math.min(nextX, maxX));
    nextY = Math.max(minY, Math.min(nextY, maxY));

    setPosition((prev) => {
      if (prev.x === nextX && prev.y === nextY) return prev;
      return { x: nextX, y: nextY };
    });
  }, [open, context.anchorX, context.anchorY, getContainerMetrics, visibleItems, panelMaxHeight]);

  useLayoutEffect(() => {
    if (!open) return;
    if (!submenuState) return;
    if (!submenuMenuRef.current) return;
    if (typeof window === "undefined") return;

    const rect = submenuMenuRef.current.getBoundingClientRect();
    const metrics = getContainerMetrics();
    const containerWidth = metrics?.width ?? window.innerWidth;
    const containerHeight = metrics?.height ?? window.innerHeight;
    const anchorRect = submenuState.anchorRect;
    const anchorLeft = metrics?.bounds
      ? anchorRect.left - metrics.bounds.left
      : anchorRect.left;
    const anchorRight = metrics?.bounds
      ? anchorRect.right - metrics.bounds.left
      : anchorRect.right;
    const anchorTop = metrics?.bounds
      ? anchorRect.top - metrics.bounds.top
      : anchorRect.top;

    let nextX =
      submenuState.preferredSide === "left"
        ? anchorLeft - rect.width - SUBMENU_OFFSET
        : anchorRight + SUBMENU_OFFSET;

    if (
      submenuState.preferredSide === "right" &&
      nextX + rect.width + MENU_MIN_EDGE_GAP > containerWidth
    ) {
      const alternative = anchorLeft - rect.width - SUBMENU_OFFSET;
      if (alternative >= MENU_MIN_EDGE_GAP) {
        nextX = alternative;
      }
    }

    if (
      submenuState.preferredSide === "left" &&
      nextX < MENU_MIN_EDGE_GAP
    ) {
      const alternative = anchorRight + SUBMENU_OFFSET;
      if (alternative + rect.width <= containerWidth - MENU_MIN_EDGE_GAP) {
        nextX = alternative;
      }
    }

    nextX = Math.max(
      MENU_MIN_EDGE_GAP,
      Math.min(nextX, containerWidth - rect.width - MENU_MIN_EDGE_GAP)
    );

    let nextY = anchorTop;
    if (nextY + rect.height + MENU_MIN_EDGE_GAP > containerHeight) {
      nextY = Math.max(MENU_MIN_EDGE_GAP, containerHeight - rect.height - MENU_MIN_EDGE_GAP);
    }
    nextY = Math.max(
      MENU_MIN_EDGE_GAP,
      Math.min(nextY, containerHeight - rect.height - MENU_MIN_EDGE_GAP)
    );

    setSubmenuState((prev) => {
      if (!prev || prev.panelId !== submenuState.panelId) return prev;
      if (prev.position.x === nextX && prev.position.y === nextY) return prev;
      return { ...prev, position: { x: nextX, y: nextY } };
    });
  }, [getContainerMetrics, open, panelMaxHeight, submenuState]);

  useEffect(() => {
    if (!open || highlightedIndex == null) return;
    const item = visibleItems[highlightedIndex];
    if (!item) return;
    const element = rootItemRefs.current.get(item.id);
    if (element && typeof element.scrollIntoView === "function") {
      element.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex, open, visibleItems]);

  useEffect(() => {
    if (!open || !submenuState || submenuState.highlightedIndex == null) return;
    const item = submenuState.item.items[submenuState.highlightedIndex];
    if (!item) return;
    const element = submenuItemRefs.current.get(item.id);
    if (element && typeof element.scrollIntoView === "function") {
      element.scrollIntoView({ block: "nearest" });
    }
  }, [open, submenuState]);

  const handleRootItemClick = useCallback(
    (item: GridContextMenuResolvedItem, index: number) => {
      if (item.disabled) return;
      if (item.type === "submenu") {
        openSubmenu(index);
        return;
      }
      triggerActionItem(item);
    },
    [openSubmenu, triggerActionItem]
  );

  const handleRootItemMouseEnter = useCallback(
    (item: GridContextMenuResolvedItem, index: number) => {
      if (item.disabled) {
        closeSubmenu();
        return;
      }
      if (isRootSelectableItem(item)) {
        setHighlightedIndex(index);
      }
      if (item.type === "submenu") {
        openSubmenu(index);
      } else {
        closeSubmenu();
      }
    },
    [closeSubmenu, openSubmenu]
  );

  const handleSubmenuItemClick = useCallback(
    (item: GridContextMenuResolvedItem) => {
      if (item.disabled || item.type !== "action") return;
      triggerActionItem(item);
    },
    [triggerActionItem]
  );

  const handleSubmenuItemMouseEnter = useCallback(
    (item: GridContextMenuResolvedItem, index: number) => {
      if (item.disabled || item.type !== "action") return;
      setSubmenuHighlight(index);
    },
    [setSubmenuHighlight]
  );

  const rootPanelBaseStyle: React.CSSProperties = {
    position: isBodyPortal ? "fixed" : "absolute",
    top: position.y,
    left: position.x,
    minWidth: 200,
    maxHeight: panelMaxHeight,
    overflowY: "auto",
    overflowX: "hidden",
    overscrollBehavior: "contain",
    padding: `${MENU_PADDING * 1.5}px 0`,
    background:
      tokens.contextMenuBackground ?? "var(--ace-grid-context-menu-bg, #fff)",
    border:
      tokens.contextMenuBorder ??
      "var(--ace-grid-context-menu-border, 1px solid rgba(0,0,0,0.12))",
    boxShadow:
      tokens.contextMenuShadow ??
      "var(--ace-grid-context-menu-shadow, 0 10px 32px rgba(0,0,0,0.18))",
    borderRadius: tokens.borderRadiusSmall,
    color: tokens.contextMenuText ?? tokens.textPrimary,
    fontFamily: tokens.fontFamily,
    fontSize: tokens.fontSize,
    outline: "none",
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    gap: 0,
  };

  const submenuPanelBaseStyle: React.CSSProperties = {
    position: isBodyPortal ? "fixed" : "absolute",
    top: submenuState?.position.y ?? 0,
    left: submenuState?.position.x ?? 0,
    minWidth: SUBMENU_MIN_WIDTH,
    maxHeight: panelMaxHeight,
    overflowY: "auto",
    overflowX: "hidden",
    overscrollBehavior: "contain",
    padding: `${MENU_PADDING * 1.5}px 0`,
    background:
      tokens.contextMenuBackground ?? "var(--ace-grid-context-menu-bg, #fff)",
    border:
      tokens.contextMenuBorder ??
      "var(--ace-grid-context-menu-border, 1px solid rgba(0,0,0,0.12))",
    boxShadow:
      tokens.contextMenuShadow ??
      "var(--ace-grid-context-menu-shadow, 0 10px 32px rgba(0,0,0,0.18))",
    borderRadius: tokens.borderRadiusSmall,
    color: tokens.contextMenuText ?? tokens.textPrimary,
    fontFamily: tokens.fontFamily,
    fontSize: tokens.fontSize,
    outline: "none",
    zIndex: 1001,
    display: "flex",
    flexDirection: "column",
    gap: 0,
  };

  const themedRootMenuStyle = components.contextMenu
    ? components.contextMenu({
        base: rootPanelBaseStyle,
        state: {
          anchorX: position.x,
          anchorY: position.y,
          itemCount: visibleItems.length,
        },
        tokens,
      })
    : rootPanelBaseStyle;

  const themedSubmenuStyle = components.contextMenu
    ? components.contextMenu({
        base: submenuPanelBaseStyle,
        state: {
          anchorX: submenuState?.position.x ?? 0,
          anchorY: submenuState?.position.y ?? 0,
          itemCount: submenuState?.item.items.length ?? 0,
          isSubmenu: true,
        },
        tokens,
      })
    : submenuPanelBaseStyle;

  const className = cx("ace-grid__context-menu", config.className);

  const overlayClassName = cx(
    "ace-grid__context-menu-overlay",
    config.overlayClassName
  );

  const overlayStyle: React.CSSProperties = {
    position: isBodyPortal ? "fixed" : "absolute",
    inset: 0,
    pointerEvents: "auto",
    zIndex: 999,
    ...(config.overlayStyle ?? {}),
  };

  const renderMenuItem = useCallback(
    (
      item: GridContextMenuResolvedItem,
      index: number,
      menuType: "root" | "submenu"
    ) => {
      const isRootMenu = menuType === "root";
      const isHighlighted = isRootMenu
        ? highlightedIndex === index
        : submenuState?.highlightedIndex === index;
      const itemRefs = isRootMenu ? rootItemRefs : submenuItemRefs;

      if (item.type === "divider") {
        return (
          <div
            key={item.id}
            className="ace-grid__context-menu-divider"
            role="separator"
            style={{
              margin: "6px 0",
              height: 1,
              background:
                tokens.contextMenuDivider ??
                "var(--ace-grid-context-menu-divider, rgba(0,0,0,0.1))",
            }}
          />
        );
      }

      if (item.type === "custom" && item.render) {
        return (
          <div
            key={item.id}
            className="ace-grid__context-menu-custom"
            role="none"
          >
            {item.render({
              ...context,
              item,
              close: onClose,
            })}
          </div>
        );
      }

      const itemBaseStyle: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "6px 16px",
        cursor: item.disabled ? "not-allowed" : "pointer",
        color: item.disabled
          ? tokens.contextMenuTextDisabled ??
            "var(--ace-grid-context-menu-text-disabled, rgba(0,0,0,0.35))"
          : tokens.contextMenuText ?? "inherit",
        backgroundColor: isHighlighted
          ? tokens.contextMenuItemHoverBackground ??
            "var(--ace-grid-context-menu-hover, rgba(0,0,0,0.05))"
          : "transparent",
        transition: "background 0.12s ease, color 0.12s ease",
        fontWeight: 500,
      };

      const themedItemStyle = components.contextMenuItem
        ? components.contextMenuItem({
            base: itemBaseStyle,
            state: {
              id: item.id,
              actionId:
                item.type === "action" || item.type === "custom"
                  ? item.actionId
                  : undefined,
              isDisabled: Boolean(item.disabled),
              isHighlighted,
            },
            tokens,
          })
        : itemBaseStyle;

      const ariaHasPopup =
        isRootMenu && item.type === "submenu" ? ("menu" as const) : undefined;
      const ariaExpanded =
        isRootMenu && item.type === "submenu"
          ? submenuState?.index === index
          : undefined;
      const ariaControls =
        isRootMenu && item.type === "submenu" && submenuState?.index === index
          ? submenuState.panelId
          : undefined;

      return (
        <div
          key={item.id}
          ref={(node) => {
            if (node) {
              itemRefs.current.set(item.id, node);
            } else {
              itemRefs.current.delete(item.id);
            }
          }}
          id={item.id}
          className={cx(
            "ace-grid__context-menu-item",
            item.type === "submenu" && "ace-grid__context-menu-item--submenu"
          )}
          role="menuitem"
          aria-haspopup={ariaHasPopup}
          aria-expanded={ariaExpanded}
          aria-controls={ariaControls}
          aria-disabled={item.disabled}
          style={{
            ...themedItemStyle,
            ...(item.type === "submenu"
              ? { paddingRight: 12 }
              : undefined),
          }}
          onMouseEnter={() => {
            if (isRootMenu) {
              handleRootItemMouseEnter(item, index);
              return;
            }
            handleSubmenuItemMouseEnter(item, index);
          }}
          onClick={() => {
            if (isRootMenu) {
              handleRootItemClick(item, index);
              return;
            }
            handleSubmenuItemClick(item);
          }}
        >
          <div
            className="ace-grid__context-menu-item-main"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flex: 1,
            }}
          >
            {item.icon && (
              <span className="ace-grid__context-menu-item-icon">
                {item.icon}
              </span>
            )}
            <span className="ace-grid__context-menu-item-label">
              {item.label}
            </span>
          </div>
          <div
            className="ace-grid__context-menu-item-meta"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            {item.shortcut && (
              <span
                className="ace-grid__context-menu-item-shortcut"
                style={{
                  color:
                    tokens.contextMenuShortcut ??
                    "var(--ace-grid-context-menu-shortcut, rgba(0,0,0,0.45))",
                  fontSize: tokens.fontSize - 2,
                }}
              >
                {item.shortcut}
              </span>
            )}
            {isRootMenu && item.type === "submenu" && (
              <span
                aria-hidden="true"
                className="ace-grid__context-menu-item-submenu-indicator"
                style={{
                  color:
                    tokens.contextMenuShortcut ??
                    "var(--ace-grid-context-menu-shortcut, rgba(0,0,0,0.45))",
                  fontSize: tokens.fontSize + 2,
                  lineHeight: 1,
                }}
              >
                ›
              </span>
            )}
          </div>
        </div>
      );
    },
    [
      context,
      handleRootItemClick,
      handleRootItemMouseEnter,
      handleSubmenuItemClick,
      handleSubmenuItemMouseEnter,
      highlightedIndex,
      onClose,
      submenuState?.highlightedIndex,
      submenuState?.index,
      submenuState?.item.items.length,
      tokens,
    ]
  );

  const renderMenuList = useCallback(
    (
      menuItems: GridContextMenuResolvedItem[],
      menuType: "root" | "submenu"
    ) => {
      const isRootMenu = menuType === "root";
      const activeHighlight = isRootMenu
        ? highlightedIndex
        : submenuState?.highlightedIndex;

      return (
        <div
          ref={isRootMenu ? rootMenuRef : submenuMenuRef}
          className={cx(
            className,
            !isRootMenu && "ace-grid__context-menu--submenu"
          )}
          style={{
            ...(isRootMenu ? themedRootMenuStyle : themedSubmenuStyle),
            ...(config.style ?? {}),
          }}
          tabIndex={-1}
          role="menu"
          aria-label={isRootMenu ? "Cell context menu" : "Context submenu"}
          aria-orientation="vertical"
          aria-activedescendant={
            activeHighlight != null && menuItems[activeHighlight]
              ? menuItems[activeHighlight].id
              : undefined
          }
          data-grid-context-menu
          data-grid-context-menu-submenu={!isRootMenu ? true : undefined}
          onScroll={() => {
            if (isRootMenu && submenuState) {
              closeSubmenu();
            }
          }}
        >
          {menuItems.length === 0 ? (
            <div
              className="ace-grid__context-menu-empty"
              role="status"
              style={{
                padding: "6px 16px",
                color:
                  tokens.contextMenuTextMuted ??
                  "var(--ace-grid-context-menu-text-muted)",
              }}
            >
              No actions available
            </div>
          ) : (
            menuItems.map((item, index) =>
              renderMenuItem(item, index, menuType)
            )
          )}
        </div>
      );
    },
    [
      className,
      closeSubmenu,
      config.style,
      highlightedIndex,
      renderMenuItem,
      submenuState,
      themedRootMenuStyle,
      themedSubmenuStyle,
      tokens.contextMenuTextMuted,
    ]
  );

  const overlayNode = (
    <div
      ref={overlayRef}
      className={overlayClassName}
      style={overlayStyle}
      role="presentation"
      data-grid-context-menu-overlay
      data-ace-grid-theme={slug}
    >
      {renderMenuList(visibleItems, "root")}
      {submenuState && renderMenuList(submenuState.item.items, "submenu")}
    </div>
  );

  if (!open || !portalContainer) return null;

  if (config.renderMenu) {
    const props = {
      context,
      items: visibleItems,
      close: onClose,
      getMenuProps: () => ({
        className,
        style: { ...themedRootMenuStyle, ...(config.style ?? {}) },
      }),
      renderDefault: () => overlayNode,
    };
    const customNode = config.renderMenu(props);
    if (customNode) {
      return createPortal(
        <div data-ace-grid-theme={slug}>{customNode}</div>,
        portalContainer
      );
    }
  }

  return createPortal(overlayNode, portalContainer);
};
