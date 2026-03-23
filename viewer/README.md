# jsone Viewer

Pure web viewer for `.jsone` and `.json` files.

## Features

- 📊 Auto-renders arrays of objects as tables
- 🔍 Client-side search and filtering
- 🔄 Sortable columns
- 📋 Export to CSV
- 🌳 JSON tree view fallback
- 💾 Load files locally (no server required)

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
2. Click "Choose file" and select a `.jsone` or `.json` file
3. View as a table, search, sort, and expand cells
4. Export to CSV with "Copy CSV" button

## Keyboard Shortcuts

- Click column headers to sort (asc/desc)
- Click truncated cells to expand in a modal
- Use search to filter rows in real-time
