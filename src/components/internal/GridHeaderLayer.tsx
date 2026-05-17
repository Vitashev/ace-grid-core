import React from "react";

import { RowSelectCell } from "../../features/selection/components/RowSelectCell";
import { HeaderRow } from "../HeaderRow";

type GridHeaderLayerProps = {
  headerRef: React.Ref<HTMLDivElement>;
  stickyHeader: boolean;
  headerBackground: string;
  headerRowProps: Omit<React.ComponentProps<typeof HeaderRow>, "RowSelectHeader">;
  rowSelectHeaderProps: React.ComponentProps<typeof RowSelectCell>;
  FloatingFilterRowComponent?: React.ComponentType<any>;
  floatingFiltersEnabled: boolean;
  floatingFilterRowProps?: Record<string, unknown>;
};

export const GridHeaderLayer: React.FC<GridHeaderLayerProps> = ({
  headerRef,
  stickyHeader,
  headerBackground,
  headerRowProps,
  rowSelectHeaderProps,
  FloatingFilterRowComponent,
  floatingFiltersEnabled,
  floatingFilterRowProps,
}) => {
  return (
    <div
      ref={headerRef}
      className="ace-grid__header"
      style={{
        display: "flex",
        flexDirection: "column",
        position: stickyHeader ? "sticky" : "relative",
        top: 0,
        zIndex: 650,
        backgroundColor: headerBackground,
      }}
    >
      <HeaderRow
        {...headerRowProps}
        RowSelectHeader={<RowSelectCell {...rowSelectHeaderProps} />}
      />
      {floatingFiltersEnabled && FloatingFilterRowComponent ? (
        <FloatingFilterRowComponent {...floatingFilterRowProps} />
      ) : null}
    </div>
  );
};
