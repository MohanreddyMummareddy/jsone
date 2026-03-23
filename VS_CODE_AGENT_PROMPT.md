
# VS Code Agent Prompt — jsone (JSON Enhanced) v0.4 Plan

You are my engineering copilot for the **jsone** open-source project (JSON Enhanced). Your job is to implement the plan to reach **v0.4** using a **shared core library** consumed by a **web viewer**, a **CLI**, and a **VS Code extension**. Follow the instructions precisely, propose concise diffs, and generate complete files. Do not change the spec—implement it. Ask for clarification only if a requirement is unclear.

## Project Context (do not modify)
- Purpose: *Make JSON easier for humans to read by auto-rendering arrays-of-objects as tables; optional `$meta` refines rendering.*
- Current repo structure:
  ```
  .
  ├─ README.md (has roadmap)
  ├─ SPEC.md (to be finalized later; treat rules here as the single source of truth)
  ├─ LICENSE, .gitignore
  ├─ examples/
  │  ├─ users.jsone
  │  └─ orders.jsone
  ├─ viewer/        (empty; to become web viewer)
  └─ cli/           (empty; to become Node CLI)
  ```
- Non-goals (until after v0.4): server-side pagination, pivot/aggregation UI, theming system, telemetry, auth, complex bundlers.

## Functional Requirements (must implement)
### Core (shared library)
- Language: **TypeScript**
- Expose functions:
  - `parseJsone(input: unknown): { meta?: Meta; data: any }`
  - `resolveSource(root: any, source?: string): any` (supports `/a/b/c` style path)
  - `isPlainObject(v: any): boolean`
  - `flattenRow(row: object, prefix?: string): Record<string, any>` (deep dot-notation flatten but do not descend arrays)
  - `inferArrayOfObjects(root: any): any[] | null` (first array where every element is a plain object)
  - `inferColumns(rows: Record<string, any>[], max=50): { key: string; label: string; type: 'auto'|'string'|'number'|'boolean'|'date'|'json' }[]`
  - `tableFromJsone(root: any, viewId?: string): { rows: Record<string, any>[]; columns: ColumnDef[] }`
    - Behavior:
      1) If `$meta.views` and a matching `id` exists, use its `source` and `columns` hints.
      2) Else infer first array-of-objects.
      3) Else return `{ rows: [], columns: [] }` (viewer must fall back to tree).
- Column typing heuristic (simple): numbers if all parsed numeric; booleans if all boolean; ISO date if >80% match ISO 8601; else `auto`.
- Arrays as cell values: primitives → comma-joined; objects → JSON string (truncated at 120 chars, but return full value separately for UI expansion).

### Viewer (v0.2)
- Pure web (no framework required; vanilla TS + minimal DOM helpers).
- Build target: a single `viewer/index.html` that can load `examples/*.jsone` via `fetch` and render:
  - Search box (client-side filter across visible cell strings)
  - Clickable column headers for sort (asc/desc)
  - Truncate long cells with “Expand” popover
  - Fallback “Tree View” if no table inferred
- Provide a tiny `npm`/`pnpm` script to serve locally (`vite` or `http-server` allowed; keep it light).

### CLI (v0.3)
- Node ESM CLI in `cli/` with commands:
  - `jsone table <file>` → pretty-prints a table to stdout (auto column width; min 8, max 40; respect truncation)
  - `jsone csv <file> -o <out.csv>` → export CSV
  - `jsone validate <file>` → validate shape: JSON parseable; if `$meta.views` exists: each view has `id`, `type`, optional `source` string; no execution fields.
- Reuse the **core** library; do not re-implement logic.

### VS Code Extension (v0.4)
- Create folder `extensions/vscode-jsone/`.
- Provide a **Custom Editor** for `*.jsone`:
  - Webview loads a bundled viewer (reuse `viewer` bundle or a distilled version).
  - Commands: “Copy CSV”, “Toggle Columns” (simple checkbox menu), “Open Tree View”.
  - Live refresh on save (listen to document change).
- Include `package.json`, `extension.ts` (activation), `webview/main.ts`, basic icons.

## Architecture & Files to Create
Set up a minimal monorepo layout using pnpm workspaces (or npm workspaces if you prefer simplicity):

```
.
├─ package.json (workspaces)
├─ pnpm-workspace.yaml            (if pnpm)
├─ packages/
│  └─ core/
│     ├─ src/index.ts
│     ├─ src/flatten.ts
│     ├─ src/infer.ts
│     ├─ src/types.ts
│     ├─ tsconfig.json
│     └─ package.json (name: @jsone/core)
├─ viewer/
│  ├─ index.html
│  ├─ src/main.ts
│  ├─ src/dom.ts
│  ├─ src/table.ts
│  ├─ tsconfig.json
│  └─ package.json (name: @jsone/viewer)
├─ cli/
│  ├─ bin/jsone.mjs   (#!/usr/bin/env node)
│  ├─ package.json    (name: @jsone/cli, bin: { "jsone": "./bin/jsone.mjs" })
│  └─ tsconfig.json (if you prefer TS + build, else keep ESM-only)
└─ extensions/
   └─ vscode-jsone/
      ├─ package.json
      ├─ src/extension.ts
      ├─ media/webview.js (bundled viewer)
      └─ README.md
```

## Coding Standards
- TypeScript strict mode; no `any` unless justified.
- Small pure functions in `@jsone/core`.
- No DOM code in core.
- Unit tests (Jest or Vitest) for `flattenRow`, `inferArrayOfObjects`, `tableFromJsone`.

## Acceptance Criteria (Definition of Done)
### Core
- Given `examples/users.jsone` or `orders.jsone`, `tableFromJsone` returns non-empty rows and sensible columns; arrays handled per rules; dates inferred for ISO strings in `createdAt`.

### Viewer
- Loads a local `.jsone` via file picker or path; renders table; search filters rows; sorting works; long cells show ellipsis with expand.
- If no array-of-objects is found, shows a JSON tree.
- A single `npm run dev` (or `pnpm dev`) serves the viewer at `http://localhost:5173` (or similar).

### CLI
- `jsone table examples/users.jsone` prints a readable table with headers.
- `jsone csv examples/orders.jsone -o orders.csv` writes a valid CSV.
- `jsone validate examples/users.jsone` exits 0; corrupt files exit non-zero with clear message.

### VS Code Extension
- Opening `*.jsone` triggers a Table view custom editor tab.
- “Copy CSV” copies visible table to clipboard; “Toggle Columns” shows a checkbox menu; “Open Tree View” switches mode.
- Webview refreshes on document save without reloading the window.

## Testing Instructions
- Add `pnpm test` (or `npm test`) in root running core unit tests.
- Add `pnpm -r build` to build all packages (core, viewer, cli).
- Provide demo instructions in `viewer/README.md` and `extensions/vscode-jsone/README.md`.

## Tasks (execute in order; propose diffs/complete files)
1) Initialize workspaces: root `package.json` + `pnpm-workspace.yaml` (or npm workspaces).
2) Create `@jsone/core` with `types.ts`, `flatten.ts`, `infer.ts`, `index.ts` and unit tests.
3) Viewer MVP in `viewer/`: `index.html`, `src/main.ts`, `src/table.ts`, `src/dom.ts`; add `dev` script (vite is OK).
4) CLI in `cli/` with `bin/jsone.mjs` using `@jsone/core`.
5) VS Code extension skeleton in `extensions/vscode-jsone/` with a simple webview that imports the built viewer bundle.
6) Wire scripts in root: `dev:viewer`, `build`, `test`.
7) Create a short CONTRIBUTING.md and tasks in GitHub Issues if time permits.

When you are ready, begin by proposing the root `package.json` and workspace files, then the `@jsone/core` package with TypeScript configs and the initial implementation. After my approval, continue step-by-step. Keep changesets small and runnable at each step.
