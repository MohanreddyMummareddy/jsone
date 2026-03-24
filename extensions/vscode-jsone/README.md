# jsone — VS Code Extension

View and interact with jsone files directly in VS Code with a custom editor.

**Status:** ✅ Built and packaged  
**Version:** 0.4.0  
**File:** `vscode-jsone-0.4.0.vsix`

## Features

- 📊 **Table View** — Automatically renders arrays of objects as interactive tables
- 🔍 **Search** — Client-side filtering across all visible data
- 🔄 **Sortable Columns** — Click column headers to sort ascending/descending
- 📋 **Export to CSV** — Copy table data as CSV with a single click
- 🌳 **Tree View** — Fallback JSON tree view for non-tabular data
- ⚡ **Zero Configuration** — Works out of the box
- 🎨 **Nested Object Flattening** — Shows complex data as readable columns
- 📱 **Responsive Design** — Works on any screen size

## Installation

### From VS Code Marketplace

1. Open VS Code
2. Press `Ctrl+Shift+X` (or `Cmd+Shift+X` on Mac)
3. Search: "jsone"
4. Click Install

**Status:** ⏳ Ready for Marketplace upload

### Manual Installation (Development)

1. Clone the repository:
   ```bash
   git clone https://github.com/MohanreddyMummareddy/jsone.git
   cd jsone/extensions/vscode-jsone
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Open VS Code and run the extension:
   ```bash
   code .
   # Press F5 to launch in debug mode
   ```

## Usage

1. Open any `.jsone` or `.json` file in VS Code
2. The **jsone Table** editor will open automatically
3. Use features:
   - 🔍 **Search box** to filter rows
   - Click **column headers** to sort
   - Click **"Copy CSV"** to export visible data
   - Switch to **Tree view** for complex data structures

## Commands

- `jsone: Copy CSV` — Copy table as CSV to clipboard
- `jsone: Toggle Tree View` — Switch between table and tree view

## Supported File Types

- `.jsone` — jsone format files
- `.json` — Standard JSON files

## Requirements

- VS Code >= 1.85.0
- Node.js (for development only)

## Development

From the `extensions/vscode-jsone` directory:

```bash
# Build TypeScript to JavaScript
npm run build

# Watch mode for development
npm run watch

# Package as VSIX for manual installation
npm run package
```

## Architecture

- **Language:** TypeScript
- **UI Framework:** Vanilla JavaScript + CSS
- **Core Logic:** Uses @mummareddy_mohanreddy/jsone-core for table inference
- **Extension API:** VS Code Custom Editor API

## Project Structure

```
extensions/vscode-jsone/
├── src/
│   ├── extension.ts       # Extension entry point
│   ├── tableEditor.ts     # Custom editor implementation
│   └── ui/
│        ├── index.html    # UI template
│        ├── style.css     # Styling
│        └── script.js     # Client-side logic
├── media/
│   ├── icon.png          # Extension icon
│   └── screenshot.png    # Marketplace screenshot
├── dist/                 # Compiled JavaScript
├── package.json          # Extension manifest
└── tsconfig.json         # TypeScript configuration
```

## Publishing to Marketplace

To publish this extension to VS Code Marketplace:

1. Create publisher account: https://marketplace.visualstudio.com/manage
2. Install vsce:
   ```bash
   npm install -g vsce
   ```

3. Package the extension:
   ```bash
   vsce package
   ```

4. Publish:
   ```bash
   vsce publish
   ```

## Troubleshooting

**Table not showing:**
- Ensure your JSON is valid (use VS Code's JSON validator)
- Try switching to Tree view to see the raw structure

**Extension not loading:**
- Reload VS Code window: `Ctrl+R`
- Check output: View → Output → jsone

**Performance issues:**
- Large files (>10MB) may cause slowdowns
- Try exporting a subset of data as CSV first
npm run watch

# Prepare for publishing
npm run vscode:prepublish
```

## Architecture

The extension uses a **custom editor provider** that:
1. Loads `.jsone` files
2. Parses the content
3. Renders tables using the jsone viewer library (`@jsone/core`)
4. Handles user interactions (search, sort, export)
5. Listens for file changes and updates the view live

The viewer is embedded as a webview within VS Code, allowing it to use VS Code's theming and UI patterns.

## Reuses @jsone/core

All table inference, flattening, and type detection is powered by the shared `@jsone/core` library.
