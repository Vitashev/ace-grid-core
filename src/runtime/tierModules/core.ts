import { gridContextMenuBaseModule } from "../../features/context-menu/baseModule";
import { gridContextMenuCustomizationModule } from "../../features/context-menu/module";
import { gridFloatingFilterModule } from "../../features/filtering/floatingModule";
import { gridKeyedHeadersModule } from "../../features/keyed-headers/module";
import { gridPinningModule } from "../../features/pinning/module";
import { gridColumnReorderModule } from "../../features/reorder/columnModule";
import { gridRowReorderModule } from "../../features/reorder/rowModule";
import { gridMultiSortModule } from "../../features/sorting/module";
import { assertGridRuntimeModuleKeysMatchEdition } from "../featureCatalog";

export const gridCoreRuntimeModuleLayer = assertGridRuntimeModuleKeysMatchEdition(
  "core",
  {
    columnReorderBasic: gridColumnReorderModule,
    contextMenuBase: gridContextMenuBaseModule,
    contextMenuCustomization: gridContextMenuCustomizationModule,
    floatingFilter: gridFloatingFilterModule,
    keyedHeaders: gridKeyedHeadersModule,
    multiSort: gridMultiSortModule,
    pinning: gridPinningModule,
    rowReorderBasic: gridRowReorderModule,
  },
);
