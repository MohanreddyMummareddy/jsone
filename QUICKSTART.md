# jsone v0.4.0 — Quick Reference

## Installation & Setup

```bash
# Clone and install
git clone https://github.com/yourusername/jsone.git
cd jsone
npm install

# Build all packages
npm run build

# Verify with tests
npm test
```

## Three Ways to Use jsone

### 1. CLI — Terminal Tables

```bash
# Pretty-print as table
npm run cli table data.jsone

# Export to CSV
npm run cli csv data.jsone -o output.csv

# Validate structure
npm run cli validate data.jsone
```

### 2. Viewer — Static Web App

```bash
# Serve locally with hot-reload
npm run dev:viewer
# Opens http://localhost:5173

# Or open built version
open viewer/dist/index.html
```

Load any `.jsone` or `.json` file → View as table → Search, sort, export CSV.

### 3. VS Code Extension

```bash
# From extensions/vscode-jsone/
code .

# Or open in existing VS Code:
code --install-extension ./extensions/vscode-jsone
```

Then open any `.jsone` file in VS Code → Custom table editor activates automatically.

## Development Workflow

```bash
# Build specific package
npm run build:core      # Core library
npm run build:viewer    # Web viewer
npm run build:cli       # CLI tool
npm run build:ext       # VS Code extension

# Watch & develop
npm run dev:viewer      # Viewer with hot-reload
npm run test:watch      # Tests in watch mode

# Run all tests
npm test

# Clean build artifacts
npm run clean
```

## File Structure

```
jsone/
├─ packages/core/        ← Shared library (all logic)
├─ viewer/              ← Web app (static HTML + TS)
├─ cli/                 ← Node.js CLI
├─ extensions/vscode-jsone/  ← VS Code extension
├─ examples/            ← Test data (users.jsone, orders.jsone)
└─ package.json         ← Root workspace config
```

## Core Library (@jsone/core)

Used by all three tools. Key exports:

- `parseJsone(input)` — Parse JSON with optional `$meta`
- `tableFromJsone(root)` — Infer table from data
- `flattenRow(row)` — Convert nested objects to dot-notation
- `inferColumns(rows)` — Auto-detect column types
- `formatCellValue(value)` — Format cells safely

## Data Format

### Basic Example

```json
{
  "data": [
    { "id": 1, "name": "Alice", "role": "Admin" },
    { "id": 2, "name": "Bob", "role": "User" }
  ]
}
```

### With Metadata

```json
{
  "$meta": {
    "title": "Users",
    "views": [
      {
        "id": "admins",
        "source": "/filtered/admins",
        "columns": [
          { "key": "id", "label": "ID", "type": "number" },
          { "key": "name", "label": "Full Name", "type": "string" }
        ]
      }
    ]
  },
  "data": { ... }
}
```

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Test output shows all 32 tests for @jsone/core
```

All tests pass ✅

## Known Limitations (v0.4)

- ✅ Supports arrays of objects
- ✅ Flat and nested object properties
- ✅ Auto type detection (number, date, boolean)
- ⏳ No server-side pagination (planned for later)
- ⏳ No custom theming system (VS Code theme only)
- ⏳ No aggregation/pivot tables (planned for later)

## Publishing

### NPM Packages

```bash
# (Future) Publish to npm
npm publish --workspace=packages/core
npm publish --workspace=@jsone/cli
npm publish --workspace=@jsone/viewer
```

### VS Code Extension

```bash
# (Future) Publish to VS Code Marketplace
cd extensions/vscode-jsone
npx vsce package
# Upload vscode-jsone-0.4.0.vsix to Marketplace
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Feature requests
- Bug reports
- Development guidelines
- Code standards
- PR process

## License

MIT — See [LICENSE](LICENSE)

## Links

- **GitHub**: https://github.com/yourusername/jsone
- **Issues**: https://github.com/yourusername/jsone/issues
- **Discussions**: https://github.com/yourusername/jsone/discussions

---

**jsone v0.4.0** — JSON Enhanced. Auto-render arrays as tables. No servers. No complexity.
