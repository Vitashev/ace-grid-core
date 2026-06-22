import type { CellValue, GridRow } from "../types";

export interface GridRecordRowsOptions<
  RecordType extends Record<string, unknown>,
> {
  getRowId?: (record: RecordType, index: number) => string | number;
}

/**
 * Adapts flat records to GridRow objects without eagerly allocating one
 * CellValue wrapper for every cell. Wrappers are created and cached on access.
 */
export function createGridRowsFromRecords<
  RecordType extends Record<string, unknown>,
>(
  records: readonly RecordType[],
  options: GridRecordRowsOptions<RecordType> = {},
): GridRow[] {
  return records.map((record, index) => ({
    id: resolveRecordRowId(record, index, options.getRowId),
    data: createLazyRowData(record),
  }));
}

function resolveRecordRowId<RecordType extends Record<string, unknown>>(
  record: RecordType,
  index: number,
  getRowId: GridRecordRowsOptions<RecordType>["getRowId"],
): string | number {
  const id = getRowId ? getRowId(record, index) : record.id;
  if (typeof id !== "string" && typeof id !== "number") {
    throw new TypeError(
      "createGridRowsFromRecords requires a string or number record.id, or a getRowId option.",
    );
  }
  return id;
}

function createLazyRowData(
  record: Record<string, unknown>,
): Record<string, CellValue> {
  const cache = new Map<string, CellValue>();
  const overrides = new Map<string, CellValue>();
  const target: Record<string, CellValue> = {};

  return new Proxy(target, {
    get(_target, property) {
      if (typeof property !== "string") {
        return Reflect.get(target, property);
      }
      const override = overrides.get(property);
      if (override) return override;
      if (!Object.prototype.hasOwnProperty.call(record, property)) return undefined;
      let cell = cache.get(property);
      if (!cell) {
        cell = { value: record[property] };
        cache.set(property, cell);
      }
      return cell;
    },
    set(_target, property, value) {
      if (typeof property !== "string") {
        return Reflect.set(target, property, value);
      }
      overrides.set(property, value);
      return true;
    },
    has(_target, property) {
      return typeof property === "string"
        ? overrides.has(property) ||
            Object.prototype.hasOwnProperty.call(record, property)
        : Reflect.has(target, property);
    },
    ownKeys() {
      return [...new Set([...Reflect.ownKeys(record), ...overrides.keys()])];
    },
    getOwnPropertyDescriptor(_target, property) {
      if (
        typeof property === "string" &&
        (overrides.has(property) ||
          Object.prototype.hasOwnProperty.call(record, property))
      ) {
        return {
          configurable: true,
          enumerable: true,
          writable: true,
          value: overrides.get(property) ?? cache.get(property),
        };
      }
      return Reflect.getOwnPropertyDescriptor(target, property);
    },
  });
}
