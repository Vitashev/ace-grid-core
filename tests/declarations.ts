import { Grid, createGridRowsFromRecords, type GridProps } from "../dist/core";
import type { ComponentProps } from "react";

const rows = createGridRowsFromRecords([{ id: "a", name: "Ada" }]);
const props: ComponentProps<typeof Grid> = {
  data: { rows, columns: [{ key: "name", title: "Name" }] },
  layout: { height: 300, width: 600 },
  columns: { columnWidths: { name: 200 } },
};
const gridProps: GridProps = props;
void gridProps;
// The generated declaration must still reject invalid column definitions.
// @ts-expect-error a column requires a key
const invalid: GridProps["data"]["columns"] = [{ title: "Missing key" }];
void invalid;
