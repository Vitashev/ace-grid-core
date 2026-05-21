import type { GridColumn, GridColumnGroup } from "../../types";

export type ColumnGroupId = string;

export interface ColumnGroupNode {
  kind: "group";
  id: ColumnGroupId;
  depth: number;
  parent: ColumnGroupNode | null;
  def: GridColumnGroup;
  columnGroupShow?: "open" | "closed";
  children: ColumnTreeNode[];
  leafKeys: string[];
  initialOpen: boolean;
  isExpandable: boolean;
}

export interface ColumnLeafNode {
  kind: "leaf";
  column: GridColumn;
  depth: number;
  parent: ColumnGroupNode | null;
  columnGroupShow?: "open" | "closed";
  index: number;
}

export type ColumnTreeNode = ColumnGroupNode | ColumnLeafNode;

export interface NormalizedColumnTree {
  roots: ColumnTreeNode[];
  leafNodes: ColumnLeafNode[];
  leafByKey: Map<string, ColumnLeafNode>;
  groupsById: Map<ColumnGroupId, ColumnGroupNode>;
  maxDepth: number;
  initialExpandedState: Map<ColumnGroupId, boolean>;
}

export type HeaderCellType = "group" | "leaf" | "placeholder";

export interface HeaderCellDescriptor {
  type: HeaderCellType;
  row: number;
  rowSpan?: number;
  startCol: number;
  endCol: number;
  columnKeys: string[];
  group?: ColumnGroupNode;
  leaf?: ColumnLeafNode;
}

export interface HeaderMatrix {
  rowCount: number;
  rows: HeaderCellDescriptor[][];
}

export type MarriedGroupColumns = Map<string, string[]>;

export type ColumnGroupDropPlacement = "before" | "after" | "inside";
