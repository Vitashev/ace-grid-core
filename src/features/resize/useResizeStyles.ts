import { useInjectStyles } from "../styling";

const RESIZE_STYLE_ID = "grid-resize-handles";

const RESIZE_CSS = `
.ace-grid__column-resize-handle {
  position: absolute;
  right: -3px;
  top: 0;
  bottom: 0;
  width: 6px;
  cursor: col-resize;
  background: transparent;
  z-index: 80;
}

.ace-grid__column-resize-handle--resizing {
  background: transparent;
  box-shadow: none;
}

.ace-grid__column-resize-guide {
  pointer-events: none;
}
`;

export function useResizeStyles() {
  useInjectStyles(RESIZE_STYLE_ID, RESIZE_CSS);
}
