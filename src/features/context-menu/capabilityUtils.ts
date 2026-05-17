import type { GridContextMenuBuilderOptions } from "../../runtime/modules";
import type { GridContextMenuConfig } from "./types";

type ContextMenuSanitizeOptions = {
  allowCustomization?: boolean;
};

export const sanitizeContextMenuConfig = (
  config?: GridContextMenuConfig,
  options?: ContextMenuSanitizeOptions,
): GridContextMenuConfig => {
  if (!config) return {};
  if (options?.allowCustomization ?? true) return config;

  const { enabled, closeOnSelect } = config;
  return {
    enabled,
    closeOnSelect,
  };
};

export const sanitizeContextMenuBuilderOptions = (
  options?: GridContextMenuBuilderOptions,
  sanitizeOptions?: ContextMenuSanitizeOptions,
): GridContextMenuBuilderOptions | undefined => {
  if (!options) return undefined;
  if (sanitizeOptions?.allowCustomization ?? true) return options;

  return {
    includeCopy: options.includeCopy,
    includeHighlight: options.includeHighlight,
  };
};
