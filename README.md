# Ace Grid Core

This repository contains the public Ace Grid Core source and framework Core
wrappers generated from the private source workspace.

## Packages

- `@ace-grid/core`
- `@ace-grid/wc`
- `@ace-grid/angular`
- `@ace-grid/vue`
- `@ace-grid/svelte`

## Development

```bash
npm install
npm run verify:public-core
```

Paid tier source, paid tier runtime modules, portal, billing, auth, infra, and
schema packages are intentionally not part of this public export.

The private source currently keeps some Core-facing type contracts beside paid
feature modules. Enable the generated `build:workspaces` lane in the public
repo after those public type contracts are moved out of paid feature folders.
