
# jsone — JSON Enhanced

**JSON files that automatically render as tables.**

`jsone` is a backward-compatible extension of JSON designed to make structured data easy for humans to read and understand — without writing code, running servers, or building dashboards.

Think of jsone as **the Markdown of structured data**.

---

## Quick Links

- 🚀 **[Quick Start](./QUICKSTART.md)** — Get started in 5 minutes
- 📖 **[Full Specification](./SPEC.md)** — Format details and examples
- 🤝 **[Contributing Guide](./CONTRIBUTING.md)** — Help improve jsone
- ⚖️ **[MIT License](./LICENSE)** — Free to use and modify

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Design Principles](#design-principles)
4. [How It Works](#how-it-works)
5. [Installation](#installation)
6. [Usage](#usage)
7. [Examples](#examples)
8. [File Format](#file-format)
9. [Project Status](#project-status)
10. [License](#license)

---

## Overview

### The Problem

JSON is the most widely used data interchange format, but it is difficult for humans to inspect and understand at scale.

Today, working with JSON usually involves:
- Expanding and collapsing deeply nested trees
- Searching keys and values using `Ctrl + F`
- Writing ad-hoc scripts to flatten data
- Copy-pasting data into spreadsheets or BI tools

Arrays of objects — which naturally represent tabular data — are still displayed as hierarchical trees in most editors and viewers.

JSON is optimized for machines, not for human readability.

### The Solution

**jsone (JSON Enhanced)** improves JSON readability by rendering structured data as tables by default.

- **Any JSON structure becomes a table** — arrays, objects, primitives all work
- No runtime, backend, or framework required
- Works as a static file across editors, CLIs, and browsers
- Optional metadata (`$meta`) allows explicit control when needed
- Preserves pure JSON data — no modifications to source

---

## Features

✅ **Automatic Table Rendering** — Arrays of objects appear as tables instantly  
✅ **Universal JSON Support** — Any JSON structure works (objects, primitives, arrays)  
✅ **Zero Configuration** — Works out of the box for common cases  
✅ **Smart Type Detection** — Automatic detection of dates, numbers, booleans  
✅ **Nested Object Flattening** — Dot-notation columns for hierarchical data  
✅ **Optional Metadata** — `$meta` for explicit control and refinement  
✅ **Backward Compatible** — Valid JSON in, valid JSON out  
✅ **Language Agnostic** — Works across ecosystems  
✅ **Static by Default** — No execution, no servers, no runtime required  

---

## Design Principles

1. **Inference First**  
   Tables render automatically without any configuration.

2. **Explicit Overrides Are Optional**  
   Metadata refines rendering but is never mandatory.

3. **Backward Compatible**  
   Removing `$meta` results in valid JSON.

4. **Static by Default**  
   No execution, no servers, no scripts required.

5. **Universal Support**  
   Works across all ecosystems and platforms.

6. **Smart Defaults**  
   Type detection and formatting work intelligently for common cases.

---

## How It Works

### Basic Flow

```
Input JSON
    ↓
Parse & extract $meta (if present)
    ↓
Find ALL tabular representations
    ↓
Rank by quality & let user select
    ↓
Flatten nested objects (dot-notation)
    ↓
Detect column types (number, date, boolean, auto)
    ↓
Display as interactive table
```

### Automatic Table Inference

**Arrays of objects** are rendered as tables automatically:

```json
[
  { "id": 1, "name": "Alice", "city": "Chennai" },
  { "id": 2, "name": "Bob", "city": "Bangalore" }
]
```

➡ Displays as table:

| id | name | city |
|----|------|------|
| 1 | Alice | Chennai |
| 2 | Bob | Bangalore |

### Nested Objects

Nested objects are flattened using dot notation for tabular display:

```json
{
  "id": 1,
  "profile": {
    "role": "Admin",
    "city": "Chennai"
  }
}
```

➡ Columns: `id`, `profile.role`, `profile.city`

### Universal Support

ANY JSON structure works:

| Input | Output |
|-------|--------|
| `{"key": "value"}` | 1-row table |
| `["a", "b", "c"]` | 3-row table with "value" column |
| `{ "nested": { "data": [...] } }` | Auto-discovers nested arrays |
| `42` | 1-row table |

---

## Installation

Choose the installation method that suits your workflow:

### 📦 npm Core Library

Core library for JavaScript/TypeScript projects:

```bash
npm install @mummareddy_mohanreddy/jsone-core
```

### 🖥️ Command-Line Tool (npm)

CLI tool to convert JSON files from terminal:

```bash
npm install -g @mummareddy_mohanreddy/jsone-cli
```

### 🐍 Python Package

Python library via pip:

```bash
pip install mohanreddy-jsone
```

### 🌐 Web Viewer

No installation required! Open in your browser:

**https://jsone.vercel.app/**

Upload any JSON or jsone file to view as table instantly.

### 📝 VS Code Extension

Install from VS Code Marketplace (search: "jsone")

Or install from directory:

```bash
# Clone repository
git clone https://github.com/MohanreddyMummareddy/jsone.git
cd jsone/extensions/vscode-jsone

# Build and run in development mode
npm install && npm run build
code .
```

Press `F5` to launch the extension.

### 📦 From Source

```bash
# Clone repository
git clone https://github.com/MohanreddyMummareddy/jsone.git
cd jsone

# Install dependencies (monorepo with pnpm)
pnpm install

# Build all packages
pnpm run build

# Run tests
pnpm test
```

---

## Usage

### 1. Web Viewer

The easiest way to get started. Upload any `.json` or `.jsone` file:

1. Open https://jsone.vercel.app/
2. Click upload or drag-and-drop a JSON file
3. Click an example to see sample data
4. Interactive features:
   - 🔍 Search and filter rows
   - ↕️ Sort by column
   - 📋 Copy data as CSV
   - 💾 Download as `.jsone` file
   - 🌳 Tree view for detailed inspection

### 2. Command-Line Tool

Convert JSON files to tables from terminal:

```bash
# View as interactive table
jsone convert data.json

# Export to CSV file
jsone convert data.json --format csv --output table.csv

# Export as JSON
jsone convert data.json --format json

# Analyze data statistics
jsone analyze data.json
```

**Installation:**
```bash
npm install -g @mummareddy_mohanreddy/jsone-cli
```

### 3. Python Library

Use in Python scripts and notebooks:

```python
from jsone import table_from_json

# Load JSON data
users = [
    {"name": "Alice", "age": 30, "city": "NYC"},
    {"name": "Bob", "age": 25, "city": "LA"}
]

# Convert to table
result = table_from_json(users)

# Access data
print(result.rows)      # List of dicts
print(result.columns)   # Column metadata

# Export formats
csv_data = result.to_csv()   # CSV string
json_data = result.to_json() # JSON string
```

**Installation:**
```bash
pip install mohanreddy-jsone
```

### 4. VS Code Extension

Edit jsone files directly in VS Code with table view:

1. Install "jsone" extension from Marketplace
2. Open any `.jsone` or `.json` file
3. Table view opens automatically
4. Features:
   - 🔍 Search rows
   - ↔️ Sort columns
   - 📋 Export to CSV
   - 🌳 Tree view for complex data

### 5. Node.js Library

For JavaScript/TypeScript projects:

TypeScript/ESM:
```typescript
import { tableFromJsone, ColumnDef } from '@mummareddy_mohanreddy/jsone-core';

const data = {
  users: [
    { id: 1, name: "Alice", city: "Chennai" },
    { id: 2, name: "Bob", city: "Bangalore" }
  ]
};

const result = tableFromJsone(data.users);
console.log(result.rows);     // [{ id: 1, name: "Alice", city: "Chennai" }, ...]
console.log(result.columns);  // [{ key: "id", label: "id", type: "number" }, ...]
```

CommonJS:
```javascript
const { tableFromJsone } = require('@mummareddy_mohanreddy/jsone-core');

const result = tableFromJsone(data);
console.log(result.rows);
```

**Installation:**
```bash
npm install @mummareddy_mohanreddy/jsone-core
```

---

## Examples

### Simple Array

**Input:** `users.jsone`
```json
[
  { "id": 1, "name": "Ravi", "email": "ravi@example.com" },
  { "id": 2, "name": "Anita", "email": "anita@example.com" }
]
```

**Display:** Interactive table with search, sort, export

### With Metadata

**Input:** `orders.jsone`
```json
{
  "$meta": {
    "title": "Orders",
    "views": [
      {
        "id": "all",
        "source": "orders",
        "columns": [
          { "key": "orderId", "label": "Order ID" },
          { "key": "total.amount", "label": "Total", "type": "number" }
        ]
      }
    ]
  },
  "orders": [
    {
      "orderId": "ORD-001",
      "customer": { "name": "Alice" },
      "total": { "amount": 150.50 },
      "items": [{ "sku": "X", "qty": 2 }]
    }
  ]
}
```

**Display:** Table with custom title, formatted columns, optional views

### Primitive Values

**Input:** `config.jsone`
```json
{
  "api_key": "secret123",
  "timeout": 5000,
  "debug": true
}
```

**Display:** 1-row table showing all config values

---

## File Format

### Core Structure

Every `.jsone` file is valid JSON with optional `$meta` block:

```json
{
  "$meta": {
    "title": "Display Title",
    "views": [...]
  },
  "your": "data"
}
```

### Metadata (`$meta`)

| Field | Type | Required | Purpose |
|-------|------|----------|---------|
| `title` | string | No | Display name for the table |
| `views` | array | No | Multiple view configurations |
| `description` | string | No | Document description |
| Custom | any | No | Extend with application-specific data |

### View Definition

Use to explicitly configure table display:

```json
{
  "$meta": {
    "views": [
      {
        "id": "view-id",
        "source": "path/to/data",
        "columns": [
          { "key": "field", "label": "Display", "type": "number" }
        ]
      }
    ]
  }
}
```

---

## Project Status

**Version:** 0.4.0  
**Status:** Stable & Production Ready  
**Browsers:** Chrome, Firefox, Safari, Edge (all modern versions)  
**Node.js:** 18.0.0+  
**Package Managers:** npm 8+

### Roadmap

- ✅ Core inference engine
- ✅ Web viewer (with search, sort, export)
- ✅ Universal JSON support
- ✅ Smart type detection
- 🔄 VS Code extension
- 🔄 Advanced filtering
- 🔄 Custom rendering hooks
- 🔄 Schema validation

---

## License

MIT License © 2026 MUMMAREDDY MOHAN REDDY

Free to use, modify, and distribute. See [LICENSE](./LICENSE) for details.

---

## Support & Contributing

- 📖 **Documentation:** [Specification](./SPEC.md) | [Quick Start](./QUICKSTART.md)
- 🐛 **Issues:** [GitHub Issues](https://github.com/mummareddy/jsone/issues)
- 🤝 **Contributing:** [See CONTRIBUTING.md](./CONTRIBUTING.md)
- 💬 **Discussions:** [GitHub Discussions](https://github.com/mummareddy/jsone/discussions)

```json
{
  "$meta": {
    "views": [
      {
        "id": "users",
        "type": "table",
        "source": "/data"
      }
    ]
  },
  "data": [
    { "id": 1, "name": "Ravi", "city": "Chennai" },
    { "id": 2, "name": "Anita", "city": "Bangalore" }
  ]
}
```

Metadata is **never required** for tables to render. It exists only to provide explicit control when needed.

---

### Rendering Priority

1. Explicit views defined in `$meta.views`
2. Automatic table inference
3. Tree / JSON explorer fallback

---

## File Format Overview

- **Extension:** `.jsone`
- **Base format:** Valid JSON
- **Reserved key:** `$meta` (optional)
- **Recommended data key:** `data`

Removing `$meta` leaves a valid JSON document.

---

## Use Cases

- API response inspection
- Log and telemetry analysis
- Configuration review
- Dataset exploration
- Documentation examples
- CI artifacts and debugging outputs
- Open data publishing

---

## Compatibility

jsone works with:
- Any JSON parser
- Any programming language
- Git repositories and diffs
- Static hosting environments

---

## Project Status

This project is in **early development (v0.1)**.

---

## Roadmap

### v0.1 — Foundation ✅
- jsone format definition
- Table inference rules
- Optional `$meta` design
- Example `.jsone` files

### v0.2 — Viewers
- Minimal web viewer
- Sorting, filtering, and search
- Large cell handling

### v0.3 — Tooling
- CLI renderer (terminal table + CSV export)
- jsone validation
- Error reporting

### v0.4 — Editor Integration
- VS Code extension
- Table preview for `.jsone`
- Column visibility controls

---

## Repository Structure

```
jsone/
├── README.md
├── SPEC.md
├── LICENSE
├── .gitignore
├── examples/
│   ├── users.jsone
│   └── orders.jsone
├── viewer/
└── cli/
```

---

## Specification

The jsone specification is documented in `SPEC.md`.

---

## Versioning

jsone follows **Semantic Versioning**. Current version: **v0.1**

---

## Contributing

Contributions are welcome in the form of feedback, examples, and tooling prototypes.

---

## Security Considerations

jsone files contain data only. No executable content.

---

## FAQ

### Is jsone a replacement for JSON?
No. jsone is fully JSON‑compatible.

### Do I need `$meta` for tables to work?
No. Tables render automatically.

---

## License

MIT © 2026 Mummareddy Mohan Reddy
