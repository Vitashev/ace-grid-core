import { GridColumn, GridRow } from "../../types";

export interface PinnedLayout {
  leftColumns: GridColumn[];
  centerColumns: GridColumn[];
  rightColumns: GridColumn[];
  leftWidth: number;
  rightWidth: number;
  centerWidth: number;
}

export interface PinnedRowLayout {
  topRows: GridRow[];
  centerRows: GridRow[];
  bottomRows: GridRow[];
  topHeight: number;
  bottomHeight: number;
  centerHeight: number;
}

export class PinningEngine {
  static calculateColumnLayout(
    columns: GridColumn[],
    columnWidths: Record<string, number>,
    pinnedLeft: string[] = [],
    pinnedRight: string[] = []
  ): PinnedLayout {
    const leftColumns: GridColumn[] = [];
    const centerColumns: GridColumn[] = [];
    const rightColumns: GridColumn[] = [];

    // Separate columns by pinning
    columns.forEach((column) => {
      if (pinnedLeft.includes(column.key)) {
        leftColumns.push(column);
      } else if (pinnedRight.includes(column.key)) {
        rightColumns.push(column);
      } else {
        centerColumns.push(column);
      }
    });

    // Sort pinned columns by their order in the pinned arrays
    leftColumns.sort(
      (a, b) => pinnedLeft.indexOf(a.key) - pinnedLeft.indexOf(b.key)
    );
    rightColumns.sort(
      (a, b) => pinnedRight.indexOf(a.key) - pinnedRight.indexOf(b.key)
    );

    // Calculate widths
    const leftWidth = leftColumns.reduce(
      (sum, col) => sum + (columnWidths[col.key] || col.width || 120),
      0
    );
    const rightWidth = rightColumns.reduce(
      (sum, col) => sum + (columnWidths[col.key] || col.width || 120),
      0
    );
    const centerWidth = centerColumns.reduce(
      (sum, col) => sum + (columnWidths[col.key] || col.width || 120),
      0
    );

    return {
      leftColumns,
      centerColumns,
      rightColumns,
      leftWidth,
      rightWidth,
      centerWidth,
    };
  }

  static calculateRowLayout(
    rows: GridRow[],
    rowHeight: number,
    pinnedTop: (string | number)[] = [],
    pinnedBottom: (string | number)[] = []
  ): PinnedRowLayout {
    const topRows: GridRow[] = [];
    const centerRows: GridRow[] = [];
    const bottomRows: GridRow[] = [];

    // Separate rows by pinning
    rows.forEach((row) => {
      if (pinnedTop.includes(row.id)) {
        topRows.push(row);
      } else if (pinnedBottom.includes(row.id)) {
        bottomRows.push(row);
      } else {
        centerRows.push(row);
      }
    });

    // Sort pinned rows by their order in the pinned arrays
    topRows.sort((a, b) => pinnedTop.indexOf(a.id) - pinnedTop.indexOf(b.id));
    bottomRows.sort(
      (a, b) => pinnedBottom.indexOf(a.id) - pinnedBottom.indexOf(b.id)
    );

    // Calculate heights
    const topHeight = topRows.reduce(
      (sum, row) => sum + (row.height || rowHeight),
      0
    );
    const bottomHeight = bottomRows.reduce(
      (sum, row) => sum + (row.height || rowHeight),
      0
    );
    const centerHeight = centerRows.reduce(
      (sum, row) => sum + (row.height || rowHeight),
      0
    );

    return {
      topRows,
      centerRows,
      bottomRows,
      topHeight,
      bottomHeight,
      centerHeight,
    };
  }

  static getColumnIndex(columns: GridColumn[], columnKey: string): number {
    return columns.findIndex((col) => col.key === columnKey);
  }

  static getRowIndex(rows: GridRow[], rowId: string | number): number {
    return rows.findIndex((row) => row.id === rowId);
  }

  static canPinColumn(
    column: GridColumn,
    side: "left" | "right",
    currentPinnedLeft: string[],
    currentPinnedRight: string[]
  ): boolean {
    // Check if column is already pinned
    if (
      currentPinnedLeft.includes(column.key) ||
      currentPinnedRight.includes(column.key)
    ) {
      return false;
    }

    // Add any additional business logic here
    // For example, limit number of pinned columns
    const maxPinnedColumns = 5;
    if (side === "left" && currentPinnedLeft.length >= maxPinnedColumns) {
      return false;
    }
    if (side === "right" && currentPinnedRight.length >= maxPinnedColumns) {
      return false;
    }

    return true;
  }

  static canPinRow(
    row: GridRow,
    side: "top" | "bottom",
    currentPinnedTop: (string | number)[],
    currentPinnedBottom: (string | number)[]
  ): boolean {
    // Check if row is already pinned
    if (
      currentPinnedTop.includes(row.id) ||
      currentPinnedBottom.includes(row.id)
    ) {
      return false;
    }

    // Add any additional business logic here
    const maxPinnedRows = 10;
    if (side === "top" && currentPinnedTop.length >= maxPinnedRows) {
      return false;
    }
    if (side === "bottom" && currentPinnedBottom.length >= maxPinnedRows) {
      return false;
    }

    return true;
  }

  static unpinColumn(
    columnKey: string,
    pinnedLeft: string[],
    pinnedRight: string[]
  ): {
    newPinnedLeft: string[];
    newPinnedRight: string[];
  } {
    return {
      newPinnedLeft: pinnedLeft.filter((key) => key !== columnKey),
      newPinnedRight: pinnedRight.filter((key) => key !== columnKey),
    };
  }

  static unpinRow(
    rowId: string | number,
    pinnedTop: (string | number)[],
    pinnedBottom: (string | number)[]
  ): {
    newPinnedTop: (string | number)[];
    newPinnedBottom: (string | number)[];
  } {
    return {
      newPinnedTop: pinnedTop.filter((id) => id !== rowId),
      newPinnedBottom: pinnedBottom.filter((id) => id !== rowId),
    };
  }

  static reorderPinnedColumns(
    columnKey: string,
    newIndex: number,
    side: "left" | "right",
    pinnedLeft: string[],
    pinnedRight: string[]
  ): { newPinnedLeft: string[]; newPinnedRight: string[] } {
    const targetArray = side === "left" ? [...pinnedLeft] : [...pinnedRight];
    const currentIndex = targetArray.indexOf(columnKey);

    if (currentIndex === -1)
      return { newPinnedLeft: pinnedLeft, newPinnedRight: pinnedRight };

    // Remove from current position
    targetArray.splice(currentIndex, 1);

    // Insert at new position
    targetArray.splice(newIndex, 0, columnKey);

    return {
      newPinnedLeft: side === "left" ? targetArray : pinnedLeft,
      newPinnedRight: side === "right" ? targetArray : pinnedRight,
    };
  }

  static isEdgePinnedColumn(
    columnKey: string,
    pinnedLeft: string[],
    pinnedRight: string[]
  ): { isEdge: boolean; side: "left" | "right" | null } {
    // Check if column is in left pinned columns
    const leftIndex = pinnedLeft.indexOf(columnKey);
    if (leftIndex !== -1) {
      // It's the rightmost left-pinned column if it's the last in the array
      return {
        isEdge: leftIndex === pinnedLeft.length - 1,
        side: "left",
      };
    }

    // Check if column is in right pinned columns
    const rightIndex = pinnedRight.indexOf(columnKey);
    if (rightIndex !== -1) {
      // It's the leftmost right-pinned column if it's the first in the array
      return {
        isEdge: rightIndex === 0,
        side: "right",
      };
    }

    // Column is not pinned
    return {
      isEdge: false,
      side: null,
    };
  }
}
