# @mummareddy_mohanreddy/jsone-core

Universal JSON table inference and generation engine.

Convert **ANY** JSON (objects, arrays, primitives) into structured tables automatically. Zero dependencies, fully typed TypeScript.

## Features

- 🎯 **Universal JSON Support** — Objects, arrays, primitives, nested structures — all become valid tables
- ⚡ **Zero Dependencies** — Ultra-lightweight (9.1 kB), no external packages
- 📊 **Automatic Inference** — Detects table structures and generates columns without configuration
- 🔍 **Smart Type Detection** — Automatically identifies dates, numbers, booleans, and strings
- 🪶 **Fully Typed** — Complete TypeScript support with full type definitions included
- 📈 **Nested Object Flattening** — Converts nested objects to dot-notation columns
- 🏆 **Quality-Based Ranking** — Multiple tables? Ranks by row count and column quality

## Installation

```bash
npm install @mummareddy_mohanreddy/jsone-core
```

## Quick Start

```typescript
import { tableFromJsone } from "@mummareddy_mohanreddy/jsone-core";

// Single object
const json1 = { name: "Alice", age: 30, joined: "2024-01-15" };
const table1 = tableFromJsone(json1);
// Result: 1 row, 3 columns (name, age, joined)

// Array of objects
const json2 = [
  { id: 1, name: "Alice", role: "Admin" },
  { id: 2, name: "Bob", role: "User" }
];
const table2 = tableFromJsone(json2);
// Result: 2 rows, 3 columns

// Array of primitives
const json3 = ["apple", "banana", "cherry"];
const table3 = tableFromJsone(json3);
// Result: 3 rows, 2 columns (#index, value)

// Nested objects
const json4 = {
  users: [
    { name: "Alice", profile: { city: "NYC", zip: "10001" } },
    { name: "Bob", profile: { city: "LA", zip: "90001" } }
  ]
};
const table4 = tableFromJsone(json4);
// Result: 2 rows with flattened columns (name, profile.city, profile.zip)
```

## API Reference

### `tableFromJsone(data: any, viewId?: string): TableResult`

Converts any JSON structure into a table representation.

**Parameters:**
- `data` — Any JSON value (object, array, primitive, nested structure)
- `viewId` — Optional string for table identification

**Returns:** `TableResult` object containing:
- `rows: any[][]` — 2D array of cell values
- `columns: Column[]` — Column definitions with names and inferred types
- `messages: string[]` — Any warnings or metadata messages

**Example:**
```typescript
const result = tableFromJsone(jsonData);
console.log(result.rows);      // [[cell1, cell2, ...], ...]
console.log(result.columns);   // [{ name: "col1", type: "string" }, ...]
```

### `inferColumns(rows: any[][], maxSamples?: number): Column[]`

Detects column types from row data using statistical analysis.

**Returns:** Array of `Column` objects with inferred types.

### `flattenRow(row: any, prefix?: string): Record<string, any>`

Recursively flattens nested objects into dot-notation keys.

**Example:**
```typescript
flattenRow({ user: { name: "Alice", profile: { city: "NYC" } } });
// Returns: { "user.name": "Alice", "user.profile.city": "NYC" }
```

## Type Detection

The library automatically detects:
- **Dates** — ISO 8601 format (80% heuristic threshold)
- **Numbers** — Integers and floats
- **Booleans** — `true`/`false` values
- **Strings** — Default fallback
- **Null/Undefined** — Preserved as-is

## Optional Metadata

Wrap JSON in `$meta` to provide explicit table hints:

```typescript
const json = {
  $meta: {
    title: "Sales Report",
    description: "Q1 2024 sales data"
  },
  data: [
    { product: "Widget", revenue: 10000 },
    { product: "Gadget", revenue: 15000 }
  ]
};

const table = tableFromJsone(json);
// Uses data array as table source, applies metadata hints
```

## TypeScript Support

Full TypeScript support with exported types:

```typescript
import type { 
  TableResult, 
  Column, 
  ColumnType 
} from "@mummareddy_mohanreddy/jsone-core";

const result: TableResult = tableFromJsone(data);
```

## Performance

- **Parsing:** O(n) time complexity where n = JSON depth
- **Inference:** O(r × c) where r = rows, c = columns
- **Memory:** No external dependencies, minimal overhead

## Use Cases

- 📄 Convert JSON API responses to viewable tables
- 📊 Transform database exports into structured data
- 🔍 Explore complex nested JSON structures
- 📈 Generate reports from JSON data
- 🎨 Display semi-structured data in tables

## License

MIT

## Links

- 📦 [npm Package](https://www.npmjs.com/package/@mummareddy_mohanreddy/jsone-core)
- 🐙 [GitHub Repository](https://github.com/MohanreddyMummareddy/jsone)
- 📖 [Full Format Specification](https://github.com/MohanreddyMummareddy/jsone/blob/main/SPEC.md)
- 🚀 [Viewer Web App](https://github.com/MohanreddyMummareddy/jsone)
