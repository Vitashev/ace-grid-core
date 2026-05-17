// import React, { memo } from "react";

// type RowGroupProps = {
//   id: string;
//   /** Sticky positions; pass only one if needed */
//   sticky?: { top?: number | null; bottom?: number | null };
//   /** Visuals */
//   background?: string;
//   shadow?: string;
//   zIndex?: number;
//   style?: React.CSSProperties;

//   /** States */
//   canDrag?: boolean;
//   isDragged?: boolean;
//   hasSpans?: boolean;
//   dragOverPosition?: "top" | "bottom" | null;
//   dragCount?: number;

//   /** DnD handlers (called with id for convenience) */
//   onDragStart: (e: React.DragEvent, id: string) => void;
//   onDragOver: (e: React.DragEvent, id: string) => void;
//   onDragLeave: (e: React.DragEvent) => void;
//   onDrop: (e: React.DragEvent, id: string) => void;
//   onDragEnd: (e: React.DragEvent) => void;

//   children: React.ReactNode;
// };

// export const RowGroup: React.FC<RowGroupProps> = memo(
//   ({
//     id,
//     sticky,
//     background = "transparent",
//     shadow = "none",
//     zIndex = 50,
//     style,

//     canDrag = false,
//     isDragged = false,
//     hasSpans = false,
//     dragOverPosition = null,
//     dragCount,

//     onDragStart,
//     onDragOver,
//     onDragLeave,
//     onDrop,
//     onDragEnd,
//     children,
//   }) => {
//     let cls = "row-group";
//     if (isDragged) cls += " dragging";
//     if (hasSpans) cls += " has-spans";
//     if (dragOverPosition === "top") cls += " drag-over-top";
//     if (dragOverPosition === "bottom") cls += " drag-over-bottom";

//     const stickyPos =
//       sticky && (sticky.top != null || sticky.bottom != null)
//         ? "sticky"
//         : "relative";

//     return (
//       <div
//         className={cls}
//         data-group-id={id}
//         data-drag-count={dragCount}
//         draggable={canDrag}
//         onDragStart={(e) => onDragStart(e, id)}
//         onDragOver={(e) => onDragOver(e, id)}
//         onDragLeave={onDragLeave}
//         onDrop={(e) => onDrop(e, id)}
//         onDragEnd={onDragEnd}
//         style={{
//           position: stickyPos as React.CSSProperties["position"],
//           top: sticky?.top ?? undefined,
//           bottom: sticky?.bottom ?? undefined,
//           zIndex,
//           backgroundColor: background,
//           boxShadow: shadow,
//           cursor: canDrag ? "grab" : "default",
//           opacity: isDragged ? 0.5 : 1,
//           ...style,
//         }}
//       >
//         {children}
//       </div>
//     );
//   }
// );
import React, { memo } from "react";

type RowGroupProps = {
  id: string;
  sticky?: { top?: number | null; bottom?: number | null };
  background?: string;
  shadow?: string;
  zIndex?: number;
  style?: React.CSSProperties;

  canDrag?: boolean;
  isDragged?: boolean;
  hasSpans?: boolean;
  pinnedPosition?: "top" | "bottom";
  dragOverPosition?: "top" | "bottom" | null;
  dragCount?: number;

  // ✅ keep existing
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent, id: string) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, id: string) => void;
  onDragEnd: (e: React.DragEvent) => void;

  // ✅ optional but helps Safari & consistency
  onDragEnter?: (e: React.DragEvent, id: string) => void;

  children: React.ReactNode;
};

export const RowGroup: React.FC<RowGroupProps> = memo(
  ({
    id,
    sticky,
    background,
    shadow,
    zIndex = 50,
    style,

    canDrag = false,
    isDragged = false,
    hasSpans = false,
    pinnedPosition,
    dragOverPosition = null,
    dragCount,

    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
    onDragEnd,
    onDragEnter, // optional
    children,
  }) => {
    let cls = "ace-grid__row-group";
    if (isDragged) cls += " ace-grid__row-group--dragging";
    if (hasSpans) cls += " ace-grid__row-group--has-spans";
    if (pinnedPosition) cls += ` ace-grid__row-group--pinned-${pinnedPosition}`;
    if (dragOverPosition === "top")
      cls += " ace-grid__row-group--drag-over-top";
    if (dragOverPosition === "bottom")
      cls += " ace-grid__row-group--drag-over-bottom";

    const stickyPos =
      sticky && (sticky.top != null || sticky.bottom != null)
        ? "sticky"
        : "relative";

    return (
      <div
        className={cls}
        data-group-id={id}
        data-drag-count={dragCount}
        draggable={canDrag}
        // 🔹 Ensure we provide data & effectAllowed so Firefox/Safari behave
        onDragStart={(e) => {
          try {
            e.dataTransfer?.setData("text/plain", id);
            if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
          } catch (error) {
            void error;
          }
          onDragStart(e, id);
        }}
        // 🔹 Some browsers (Safari) need preventDefault on dragenter too
        onDragEnter={(e) => {
          e.preventDefault();
          onDragEnter?.(e, id);
        }}
        // 🔹 MUST preventDefault on dragover or drop will never fire
        onDragOver={(e) => {
          e.preventDefault();
          if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
          onDragOver(e, id);
        }}
        onDragLeave={onDragLeave}
        // 🔹 Prevent default + stop propagation before delegating
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDrop(e, id);
        }}
        onDragEnd={(e) => {
          // (optional) normalize; some UAs need a preventDefault here too
          // e.preventDefault();
          onDragEnd(e);
        }}
        style={{
          position: stickyPos as React.CSSProperties["position"],
          top: sticky?.top ?? undefined,
          bottom: sticky?.bottom ?? undefined,
          zIndex,
          backgroundColor: background ?? undefined,
          boxShadow: shadow ?? undefined,
          cursor: hasSpans ? "cell" : canDrag ? "grab" : "default",
          ...style,
        }}
      >
        {children}
      </div>
    );
  }
);
