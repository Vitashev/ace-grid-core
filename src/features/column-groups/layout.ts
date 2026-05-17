import type { GridColumn } from "../../types";
import type {
  ColumnGroupNode,
  ColumnLeafNode,
  HeaderCellDescriptor,
  HeaderMatrix,
} from "./types";

const buildPathForColumn = (
  leaf: ColumnLeafNode | undefined
): ColumnGroupNode[] => {
  if (!leaf) return [];
  const path: ColumnGroupNode[] = [];
  let parent = leaf.parent;
  while (parent) {
    path.push(parent);
    parent = parent.parent;
  }
  path.reverse();
  return path;
};

export const buildHeaderMatrix = (
  columns: GridColumn[],
  leafByKey: Map<string, ColumnLeafNode>,
  maxDepthOverride?: number
): HeaderMatrix => {
  if (columns.length === 0) {
    return {
      rowCount: 1,
      rows: [[]],
    };
  }

  const paths = columns.map((col) =>
    buildPathForColumn(leafByKey.get(col.key))
  );
  const computedMaxDepth = paths.reduce(
    (acc, path) => Math.max(acc, path.length),
    0
  );
  const maxDepth =
    typeof maxDepthOverride === "number"
      ? Math.max(computedMaxDepth, maxDepthOverride)
      : computedMaxDepth;
  const rowCount = maxDepth + 1;
  const rows: HeaderCellDescriptor[][] = Array.from(
    { length: rowCount },
    () => []
  );

  // Track which columns have already been rendered as leaf cells
  const renderedLeafColumns = new Set<number>();

  for (let level = 0; level < maxDepth; level += 1) {
    let idx = 0;
    while (idx < columns.length) {
      const path = paths[idx];
      const group = path[level];

      if (!group) {
        // This column has no group at this level
        // Check if it should be rendered as a leaf cell here
        const columnDepth = path.length;

        if (columnDepth === level) {
          // This is where the leaf cell should appear
          const rowSpan = rowCount - level;
          const column = columns[idx];
          const leaf = leafByKey.get(column.key);

          rows[level].push({
            type: "leaf",
            row: level + 1,
            startCol: idx + 1,
            endCol: idx + 2,
            columnKeys: [column.key],
            leaf,
            rowSpan,
          });
          renderedLeafColumns.add(idx);
        }
        idx += 1;
        continue;
      }

      let end = idx + 1;
      while (end < columns.length) {
        const nextPath = paths[end];
        if (nextPath[level] !== group) break;
        end += 1;
      }

      // Render the group header
      rows[level].push({
        type: "group",
        row: level + 1,
        startCol: idx + 1,
        endCol: end + 1,
        columnKeys: columns.slice(idx, end).map((c) => c.key),
        group,
        rowSpan: 1,
      });

      idx = end;
    }
  }

  // Render leaf cells for columns that weren't already rendered
  // (i.e., columns whose depth equals maxDepth)
  for (let idx = 0; idx < columns.length; idx += 1) {
    if (renderedLeafColumns.has(idx)) continue;

    const column = columns[idx];
    const leaf = leafByKey.get(column.key);
    const leafRowIndex = rowCount - 1;

    rows[leafRowIndex].push({
      type: "leaf",
      row: leafRowIndex + 1,
      startCol: idx + 1,
      endCol: idx + 2,
      columnKeys: [column.key],
      leaf,
      rowSpan: 1,
    });
  }

  return { rowCount, rows };
};
