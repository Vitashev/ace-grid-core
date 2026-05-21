# @ace-grid/core

Free Ace Grid Core React runtime with editing, selection, sorting, filtering, pagination, search, pinning, theming, resize, virtualization, keyed headers, and Core wrapper support.

This package is generated from the public Core export in:

https://github.com/Vitashev/ace-grid-core

It contains only free/Core Ace Grid capabilities. Pro and Enterprise source,
runtime modules, and paid feature artifacts are intentionally excluded.

## Install

```bash
npm install @ace-grid/core
```

## Usage

```ts
import { Grid } from "@ace-grid/core";

const rows = [{ id: "r1", data: { name: "Ada", status: "Active" } }];
const columns = [{ key: "name", title: "Name" }, { key: "status", title: "Status" }];

export function Example() {
  return <Grid data={{ rows, columns }} layout={{ height: 420 }} />;
}
```
