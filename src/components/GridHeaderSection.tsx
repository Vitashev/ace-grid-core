import React from "react";
import type { HeaderRowProps } from "./HeaderRow";
import { HeaderRow } from "./HeaderRow";
import { cx } from "../utils/cx";

type GridHeaderSectionProps = HeaderRowProps & {
  stickyHeader: boolean;
  headerBackground: string;
};

export const GridHeaderSection: React.FC<GridHeaderSectionProps> = ({
  stickyHeader,
  headerBackground,
  ...headerRowProps
}) => {
  return (
    <div
      className={cx(
        "ace-grid__header-section",
        stickyHeader && "ace-grid__header-section--sticky"
      )}
      style={{
        display: "flex",
        position: stickyHeader ? "sticky" : "relative",
        top: 0,
        zIndex: 100,
        backgroundColor: headerBackground,
      }}
    >
      <HeaderRow {...headerRowProps} />
    </div>
  );
};
