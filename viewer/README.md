# jsone Viewer

Pure web viewer for `.jsone` and `.json` files with advanced JSON tools.

## Features

- 📊 Auto-renders arrays of objects as tables
- 🔍 Client-side search and filtering
- 🔄 Sortable columns
- 📋 Export to CSV
- 🌳 JSON tree view fallback
- 💾 Load files locally (no server required)

### 🧰 JSON Tools (Circular UI Panel)

Click the **🧰 Utilities** button to access the advanced tools panel with a beautiful circular icon menu:

- **🔧 Repair** - Fix malformed JSON + validate syntax
- **📐 Format** - Pretty print, minify, or compact JSON with adjustable indentation
- **📊 Diff** - Compare two JSON documents side-by-side
- **🔀 YAML** - Convert between JSON ↔ YAML formats
- **🗝️ JSONPath** - Query JSON using JSONPath expressions ($.property, $[*], etc.)
- **✅ Schema** - Validate JSON against schema or auto-infer schema from data

### Utility Functions Library

20+ built-in utility functions available via the tools:

- **File Handling** - formatFileSize(), getFileExtension(), isValidJsonFile()
- **Date/Time** - formatDate(), getFormattedTimestamp()
- **Object/Array** - deepClone(), flattenObject(), groupBy(), sortBy(), unique()
- **String** - truncateString(), escapeHtml()
- **Data Inspection** - countProperties(), countElements(), getTypeName(), isEmpty()
- **Performance** - debounce() for optimized event handling

## Usage

### Development

```bash
npm run dev
```

Opens the viewer at `http://localhost:5173`

### Production Build

```bash
npm run build
```

Outputs to `dist/`

### Using the Viewer

1. Open `index.html` in a browser
2. Click "📤 Upload JSON" or "📋 Paste JSON" to load data
3. View as a table, search, sort, and expand cells
4. Export to CSV with "Copy CSV" button
5. Click **🧰 Utilities** to access JSON tools:
   - Select a tool from the circular icon menu
   - Configure options if needed
   - Click action button to execute
   - Results appear with copy-to-clipboard functionality

## Keyboard Shortcuts

- Click column headers to sort (asc/desc)
- Click truncated cells to expand in a modal
- Use search to filter rows in real-time
- Ctrl+Enter to submit pasted JSON
