import React from "react";

import type { GridChartsModule } from "../../runtime/modules";
import {
  GridContextMenuOverlay,
  GridPaginationArea,
} from "../GridOverlays";

type ChartPanelComponent = NonNullable<GridChartsModule["IntegratedChartPanel"]>;
type ChartPanelProps = React.ComponentProps<ChartPanelComponent>;

type GridSupplementaryOverlaysProps = {
  chartsEnabled: boolean;
  ChartPanelComponent?: ChartPanelComponent;
  chartModel: ChartPanelProps["model"] | null;
  chartPanelProps: Omit<ChartPanelProps, "model">;
  paginationProps: React.ComponentProps<typeof GridPaginationArea>;
  contextMenuProps: React.ComponentProps<typeof GridContextMenuOverlay>;
};

export const GridSupplementaryOverlays: React.FC<
  GridSupplementaryOverlaysProps
> = ({
  chartsEnabled,
  ChartPanelComponent,
  chartModel,
  chartPanelProps,
  paginationProps,
  contextMenuProps,
}) => {
  return (
    <>
      {chartsEnabled && chartModel && ChartPanelComponent ? (
        <ChartPanelComponent model={chartModel} {...chartPanelProps} />
      ) : null}
      <GridPaginationArea {...paginationProps} />
      <GridContextMenuOverlay {...contextMenuProps} />
    </>
  );
};
