export type ValidationTooltipPlacement = "top" | "bottom";

const estimateTooltipHeight = (message: string, anchorWidth: number) => {
  const tooltipWidth = Math.min(260, Math.max(160, anchorWidth));
  const charactersPerLine = Math.max(18, Math.floor((tooltipWidth - 20) / 7));
  const lines = Math.max(1, Math.ceil(message.length / charactersPerLine));
  return lines * 16 + 12;
};

export const resolveValidationTooltipPlacement = (
  element: HTMLElement,
  message: string,
): ValidationTooltipPlacement => {
  const anchorRect = element.getBoundingClientRect();
  const grid = element.closest<HTMLElement>(".ace-grid");
  const gridRect = grid?.getBoundingClientRect();
  const upperBoundary = Math.max(0, gridRect?.top ?? 0);
  let lowerBoundary = Math.min(
    window.innerHeight,
    gridRect?.bottom ?? window.innerHeight,
  );

  const pinnedBottom = grid?.querySelector<HTMLElement>(
    ".ace-grid__row-group--pinned-bottom",
  );
  const pinnedBottomRect = pinnedBottom?.getBoundingClientRect();
  if (pinnedBottomRect && pinnedBottomRect.top >= anchorRect.bottom - 1) {
    lowerBoundary = Math.min(lowerBoundary, pinnedBottomRect.top);
  }

  const gap = 8;
  const spaceBelow = lowerBoundary - anchorRect.bottom - gap;
  const spaceAbove = anchorRect.top - upperBoundary - gap;
  const tooltipHeight = estimateTooltipHeight(message, anchorRect.width);

  return spaceBelow < tooltipHeight && spaceAbove > spaceBelow
    ? "top"
    : "bottom";
};

export const updateValidationTooltipPlacement = (
  element: HTMLElement,
  message?: string,
) => {
  if (!message) {
    delete element.dataset.validationTooltipPlacement;
    return;
  }

  element.dataset.validationTooltipPlacement =
    resolveValidationTooltipPlacement(element, message);
};
