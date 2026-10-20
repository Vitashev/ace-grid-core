import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { test } from "node:test";
import { JSDOM } from "jsdom";
import React from "react";
import { act as legacyAct } from "react-dom/test-utils";
const act = React.act ?? legacyAct;
import { createRoot } from "react-dom/client";
import { Grid, createGridRowsFromRecords, useGrid } from "../dist/core.js";

test("built Core ESM and CommonJS exports load", () => {
  const cjs = createRequire(import.meta.url)("../dist/core.cjs");
  assert.equal(typeof cjs.Grid, "function");
  assert.equal(typeof Grid, "function");
  assert.deepEqual(createGridRowsFromRecords([{ id: "a", name: "Ada" }])[0].data.name.value, "Ada");
});

for (const strict of [false, true]) {
  test(`built Core restores edit history${strict ? " in StrictMode" : ""}`, async () => {
    const dom = new JSDOM('<div id="root"></div>', { pretendToBeVisual: true, url: "http://localhost" });
    const originals = new Map();
    const globals = {
      window: dom.window, document: dom.window.document, navigator: dom.window.navigator,
      HTMLElement: dom.window.HTMLElement, Element: dom.window.Element,
      getComputedStyle: dom.window.getComputedStyle.bind(dom.window),
      requestAnimationFrame: dom.window.requestAnimationFrame.bind(dom.window),
      cancelAnimationFrame: dom.window.cancelAnimationFrame.bind(dom.window),
      ResizeObserver: class { observe() {} unobserve() {} disconnect() {} },
      IS_REACT_ACT_ENVIRONMENT: true,
    };
    for (const [key, value] of Object.entries(globals)) {
      originals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
      Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
    }
    const root = createRoot(document.getElementById("root"));
    const initialRows = createGridRowsFromRecords([{ id: "account-1", owner: "Maya", status: "Live" }]);
    const columns = [{ key: "owner", title: "Owner" }, { key: "status", title: "Status" }];
    let current;
    function Harness() {
      current = useGrid({ initialRows, columns, enableUndo: true });
      return null;
    }
    const read = () => [current[0][0].data.owner.value, current[0][0].data.status.value, current[1].canUndo, current[1].canRedo];
    try {
      const harness = React.createElement(Harness);
      await act(async () => root.render(strict ? React.createElement(React.StrictMode, null, harness) : harness));
      await act(async () => current[1].updateCell("account-1", "owner", { value: "Alex" }));
      await act(async () => current[1].updateCell("account-1", "status", { value: "Review" }));
      assert.deepEqual(read(), ["Alex", "Review", true, false]);
      await act(async () => current[1].undo());
      assert.deepEqual(read(), ["Alex", "Live", true, true]);
      await act(async () => current[1].redo());
      assert.deepEqual(read(), ["Alex", "Review", true, false]);
      await act(async () => current[1].undo());
      await act(async () => current[1].undo());
      assert.deepEqual(read(), ["Maya", "Live", false, true]);
      await act(async () => current[1].redo());
      assert.deepEqual(read(), ["Alex", "Live", true, true]);
      await act(async () => current[1].redo());
      assert.deepEqual(read(), ["Alex", "Review", true, false]);
      await act(async () => current[1].undo());
      await act(async () => current[1].updateCell("account-1", "owner", { value: "June" }));
      await act(async () => current[1].redo());
      assert.deepEqual(read(), ["June", "Live", true, false]);
    } finally {
      await act(async () => root.unmount());
      dom.window.close();
      for (const [key, descriptor] of originals) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor);
        else delete globalThis[key];
      }
    }
  });
}

test("built Core mounts, sorts rows, and updates data", async () => {
  const dom = new JSDOM('<div id="root"></div>', { pretendToBeVisual: true, url: "http://localhost" });
  const originals = new Map();
  const globals = {
    window: dom.window, document: dom.window.document, navigator: dom.window.navigator,
    HTMLElement: dom.window.HTMLElement, Element: dom.window.Element,
    getComputedStyle: dom.window.getComputedStyle.bind(dom.window),
    requestAnimationFrame: dom.window.requestAnimationFrame.bind(dom.window),
    cancelAnimationFrame: dom.window.cancelAnimationFrame.bind(dom.window),
    ResizeObserver: class { observe() {} unobserve() {} disconnect() {} },
    IS_REACT_ACT_ENVIRONMENT: true,
  };
  for (const [key, value] of Object.entries(globals)) {
    originals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  const container = document.getElementById("root");
  const root = createRoot(container);
  const columns = [{ key: "name", title: "Name", sortable: true }];
  function Harness({ records }) {
    const [sortModel, setSortModel] = React.useState([]);
    return React.createElement(Grid, {
    data: { rows: createGridRowsFromRecords(records), columns },
    layout: { height: 300, width: 600 },
    columns: { columnWidths: { name: 200 } },
    sorting: { sortMode: "client", sortModel, onSortModelChange: setSortModel },
  });
  }
  const render = (records) => root.render(React.createElement(Harness, { records }));
  try {
    await act(async () => render([{ id: "b", name: "Zoe" }, { id: "a", name: "Ada" }]));
    assert.match(container.textContent, /Zoe/);
    assert.match(container.textContent, /Ada/);
    const header = [...container.querySelectorAll('[role="columnheader"]')].find((cell) => cell.textContent.includes("Name"));
    assert.ok(header);
    await act(async () => header.querySelector(".ace-grid__sort-button").dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })));
    assert.ok(container.textContent.indexOf("Ada") < container.textContent.indexOf("Zoe"), "sort changes row order");
    await act(async () => render([{ id: "c", name: "Grace" }]));
    assert.match(container.textContent, /Grace/);
    assert.doesNotMatch(container.textContent, /Zoe/);
  } finally {
    await act(async () => root.unmount());
    dom.window.close();
    for (const [key, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
});
