import {
  GRID_SYSTEM_COLUMN_KEYS,
  type GridSystemCellTypeKey,
} from "../../types";

const SYSTEM_COLUMN_KEY_SET = new Set<string>(Object.values(GRID_SYSTEM_COLUMN_KEYS));

export const isSystemCol = (key: string): key is GridSystemCellTypeKey =>
  SYSTEM_COLUMN_KEY_SET.has(key);
