import type { CellValueType } from "../../types";

export type EditingCellState = {
  rowIndex: number;
  colIndex: number;
  columnKey: string;
  rowId?: string | number;
  initialValue: any;
  valueType: CellValueType;
  version: number;
};
