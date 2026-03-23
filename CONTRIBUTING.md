# Contributing to jsone

Welcome! jsone is an open-source project to make JSON easier to read by auto-rendering arrays of objects as tables.

## Project Vision

**jsone (JSON Enhanced)** makes structured data human-readable without servers, dashboards, or complex configuration.

Think of it as **the Markdown of structured data** — simple, backward-compatible, and works everywhere.

## Quick Start

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/jsone.git
cd jsone

# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test
```

### Development

```bash
# Start the viewer dev server (hot reload)
npm run dev:viewer
# Opens http://localhost:5173

# Build a specific package
npm run build:core    # @jsone/core
npm run build:viewer  # @jsone/viewer
npm run build:cli     # @jsone/cli
npm run build:ext     # vscode-jsone extension

# Watch and test
npm run test:watch
```

### Using the CLI Locally

```bash
# View data as a table
npm run cli table examples/users.jsone

# Export to CSV
npm run cli csv examples/users.jsone -o users.csv

# Validate a file
npm run cli validate examples/users.jsone
```

## Project Structure

```
c:\Users\alway\Desktop\jsone/
├─ packages/
│  └─ core/               # Shared library (TypeScript)
│     ├─ src/
│     │  ├─ types.ts      # Type definitions
│     │  ├─ flatten.ts    # Flattening logic
│     │  ├─ infer.ts      # Type inference
│     │  └─ index.ts      # Main exports
│     └─ __tests__/       # 32+ unit tests
├─ viewer/               # Web viewer (vanilla TS)
│  ├─ src/
│  │  ├─ main.ts         # Entry point
│  │  ├─ dom.ts          # DOM utilities
│  │  └─ table.ts        # Table rendering
│  └─ index.html         # Static HTML
├─ cli/                  # Node CLI
│  └─ src/
│     ├─ cli.ts          # Command dispatcher
│     └─ commands/       # table, csv, validate
├─ extensions/
│  └─ vscode-jsone/      # VS Code extension
│     ├─ src/
│     │  ├─ extension.ts # Activation
│     │  └─ provider.ts  # Custom editor
│     └─ media/
│           └─ viewer.html
├─ examples/
│  ├─ users.jsone        # Test data (2 users)
│  └─ orders.jsone       # Test data (1 order)
└─ package.json          # Root workspace config
```

## Architecture

### @jsone/core (Shared Library)

All logic lives here — used by viewer, CLI, and extension:

- **`parseJsone()`** — Parse JSON with optional `$meta`
- **`tableFromJsone()`** — Infer table from data
- **`flattenRow()`** — Convert nested objects to dot-notation
- **`inferColumns()`** — Auto-detect column types (number, date, boolean, etc.)
- **`resolveSource()`** — Path resolution (e.g., `/a/b/c`)

### @jsone/viewer (Web UI)

Pure vanilla TypeScript + HTML. No frameworks.

- **Search** — Filter rows client-side
- **Sort** — Click column headers
- **Expand** — Click truncated cells
- **Export** — Copy as CSV
- **Static** — Works offline, no server needed

### @jsone/cli (Command-Line)

Node ESM CLI for developers:

```bash
jsone table <file>           # Pretty-print table
jsone csv <file> -o <out>    # Export CSV
jsone validate <file>        # Validate structure
```

### vscode-jsone (VS Code Extension)

Custom editor for `.jsone` files:

- Auto-activates for `*.jsone` files
- Embeds the viewer as a webview
- Live refresh on save
- Commands: Copy CSV, Toggle Columns, Tree View

## Making Changes

### 1. Pick an Issue

Check [GitHub Issues](https://github.com/yourusername/jsone/issues) for:
- `good first issue` — Great for new contributors
- `help wanted` — Actively seeking help
- Feature requests or bugs

### 2. Create a Branch

```bash
git checkout -b feat/add-export-json-command
# or
git checkout -b fix/column-type-detection
```

### 3. Make Your Changes

- **Core logic:** Edit `packages/core/src/`
- **Viewer UI:** Edit `viewer/src/`
- **CLI commands:** Add to `cli/src/commands/`
- **Tests:** Add to `packages/core/__tests__/`

### 4. Test Your Changes

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Build to verify no TS errors
npm run build

# Test CLI locally
npm run cli table examples/users.jsone
```

### 5. Commit & Push

```bash
git add .
git commit -m "feat: add export-json command"
git push origin feat/add-export-json-command
```

### 6. Open a Pull Request

- Reference the issue: `Closes #123`
- Describe what you changed and why
- Include test results
- Link to any related discussions

## Coding Standards

### TypeScript

- **Strict mode** — Strict type checking enabled
- **No `any`** — Type everything explicitly
- **ESM** — Use `import/export`, not `require`
- **Small functions** — Keep functions focused and testable

### Testing

- **Unit tests** in `__tests__` folder
- **Jest/Vitest syntax** (`describe`, `it`, `expect`)
- **80%+ coverage** for core logic
- Run with `npm test`

### Documentation

- **README per package** — `packages/*/README.md`
- **JSDoc comments** for exported functions
- **Examples in tests** — Tests serve as documentation
- **Clear commit messages** — Describe the "why", not just the "what"

## Reporting Bugs

Use [GitHub Issues](https://github.com/yourusername/jsone/issues):

1. **Title** — Brief, descriptive (e.g., "CSV export fails for null values")
2. **Reproduction** — Steps to reproduce + example file
3. **Expected** — What should happen
4. **Actual** — What actually happened
5. **Environment** — Node version, OS, etc.

## Feature Requests

Describe the use case:

```
Title: Add support for custom column widths in CLI

Currently, column widths auto-adjust (min 8, max 40).
Sometimes users want fixed widths via CLI flags.

Proposed syntax:
  jsone table data.jsone --column-widths=20,30,15
```

## Release Process

(This is for maintainers)

1. Update version in all `package.json` files
2. Write CHANGELOG entry
3. Run `npm run build && npm test`
4. Create git tag: `git tag v0.5.0`
5. Push to npm: `npm publish --workspace=packages/core`
6. Cut a GitHub Release

## Code Style

```typescript
// ✅ GOOD
function flattenRow(row: Record<string, any>, prefix = ''): Record<string, any> {
  const result: Record<string, any> = {};
  // ...
  return result;
}

// ❌ BAD
function flattenRow(row: any, prefix?: any) {
  const result: any = {};
  // ...
  return result;
}
```

## Resources

- **VS Code Dev Environment**: Press `F5` in `extensions/vscode-jsone/`
- **Viewer Dev Server**: `npm run dev:viewer` → http://localhost:5173
- **TypeScript Docs**: https://www.typescriptlang.org/
- **VS Code API Docs**: https://code.visualstudio.com/api

## Getting Help

- **Questions?** Open a [Discussion](https://github.com/yourusername/jsone/discussions)
- **Stuck?** Comment on the issue or PR — maintainers are here to help
- **Want to chat?** Join our community threads

## Recognition

Contributors will be recognized in:
- **CHANGELOG** — with each release
- **GitHub** — publicly credited in pull requests
- **README** — hall of fame section

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (see [LICENSE](LICENSE)).

---

**Thanks for contributing to jsone! 🚀**

Questions? Open an issue or discussion on GitHub.
