# jsone — JSON Enhanced

**JSON files that automatically render as tables.**

`jsone` is a backward‑compatible extension of JSON designed to make structured data easy for humans to read and understand — without writing code, running servers, or building dashboards.

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
