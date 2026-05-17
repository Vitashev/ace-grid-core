import type { GridContextMenuCustomizationModule } from "../../runtime/modules";
import {
  sanitizeContextMenuBuilderOptions,
  sanitizeContextMenuConfig,
} from "./capabilityUtils";

export const gridContextMenuCustomizationModule: GridContextMenuCustomizationModule =
  {
    available: true,
    implementationMarker: "__ACE_GRID_CORE_CONTEXT_MENU_CUSTOMIZATION__",
    sanitizeConfig: sanitizeContextMenuConfig,
    sanitizeBuilderOptions: sanitizeContextMenuBuilderOptions,
  };
