
# jsone — JSON Enhanced

**JSON files that automatically render as tables.**

`jsone` is a backward‑compatible extension of JSON designed to make structured data easy for humans to read and understand — without writing code, running servers, or building dashboards.

Think of jsone as **the Markdown of structured data**.

---

## Table of Contents

- # problem
- # solution
- # key-features
- # design-principles
- # how-it-works
- # optional-metadata
- # file-format-overview
- # use-cases
- # compatibility
- # project-status
- # roadmap
- # repository-structure
- # specification
- # versioning
- # contributing
- # security-considerations
- # faq
- # license

---

## Problem

JSON is the most widely used data interchange format, but it is difficult for humans to inspect and understand at scale.

Today, working with JSON usually involves:
- Expanding and collapsing deeply nested trees
- Searching keys and values using `Ctrl + F`
- Writing ad‑hoc scripts to flatten data
- Copy‑pasting data into spreadsheets or BI tools

Arrays of objects — which naturally represent tabular data — are still displayed as hierarchical trees in most editors and viewers.

JSON is optimized for machines, not for human readability.

---

## Solution

**jsone (JSON Enhanced)** improves JSON readability by rendering structured data as tables by default.

- Arrays of objects automatically appear as tables
- No runtime, backend, or framework required
- Works as a static file across editors, CLIs, and browsers
- Optional metadata allows explicit control when needed

jsone preserves pure JSON data while allowing the data itself to describe how it should be viewed.

---

## Key Features

- ✅ Automatic table rendering
- ✅ Zero configuration for common cases
- ✅ Optional metadata for advanced control
- ✅ Backward compatible with JSON
- ✅ Language and framework agnostic
- ✅ Static, execution‑free design
- ✅ Designed for editors, CLIs, and documentation

---

## Design Principles

1. **Inference First**  
   Tables render automatically without configuration.

2. **Explicit Overrides Are Optional**  
   Metadata refines rendering but is never mandatory.

3. **Backward Compatible**  
   Removing `$meta` results in valid JSON.

4. **Static by Default**  
   No execution, no servers, no scripts.

5. **Tool Agnostic**  
   Works across ecosystems, not tied to a framework.

---

## How It Works

### Automatic Table Inference

Any array of objects is rendered as a table by default.

```json
[
  { "id": 1, "name": "Alice", "city": "Chennai" },
  { "id": 2, "name": "Bob", "city": "Bangalore" }
]
```

➡ Automatically displayed as a table.

---

### Nested Objects

Nested objects are flattened using dot notation so that deeply structured data remains readable in a tabular format.

```json
{
  "id": 1,
  "profile": {
    "role": "Admin",
    "city": "Chennai"
  }
}
```

➡ Columns become:
- `id`
- `profile.role`
- `profile.city`

Flattening is applied only for presentation. The underlying data remains unchanged.

---

### Arrays Inside Rows

When arrays appear inside objects:

- Arrays of primitive values are displayed inline (comma‑separated)
- Arrays of objects are shown as truncated JSON
- Full values are expandable on demand

Default array handling can be refined using metadata.

---

## Optional Metadata

When automatic inference is insufficient, an optional `$meta` block can be provided to refine rendering behavior.

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
