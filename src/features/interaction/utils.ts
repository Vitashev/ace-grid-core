const INTERACTIVE_TARGET_SELECTOR = [
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'a[href]',
  '[role="button"]:not([aria-disabled="true"])',
].join(", ");

const FOCUSABLE_SELECTOR = [
  INTERACTIVE_TARGET_SELECTOR,
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

const sanitizeIdFragment = (value: string) =>
  value.replace(/[^A-Za-z0-9_-]/g, "");

export const buildGridBodyCellId = (
  gridIdBase?: string,
  ariaRowIndex?: number,
  ariaColIndex?: number,
) => {
  if (!gridIdBase || ariaRowIndex == null || ariaColIndex == null) {
    return undefined;
  }
  return `${sanitizeIdFragment(gridIdBase)}-cell-r${ariaRowIndex}-c${ariaColIndex}`;
};

export const isGridTextEntryTarget = (target: HTMLElement | null) => {
  if (!target) return false;
  if (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  ) {
    return true;
  }
  if (target.isContentEditable || target.closest('[contenteditable="true"]')) {
    return true;
  }
  return false;
};

export const isGridInteractiveTarget = (target: HTMLElement | null) => {
  if (!target) return false;
  if (isGridTextEntryTarget(target)) return true;
  return Boolean(target.closest(INTERACTIVE_TARGET_SELECTOR));
};

export const findFirstFocusableDescendant = (root: ParentNode | null) => {
  if (!root) return null;
  return root.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
};
