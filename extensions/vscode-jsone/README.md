# jsone — VS Code Extension

View and interact with jsone files directly in VS Code with a custom editor.

## Features

- 📊 **Table View** — Automatically renders arrays of objects as interactive tables
- 🔍 **Search** — Client-side filtering across all visible data
- 🔄 **Sortable Columns** — Click column headers to sort ascending/descending
- 📋 **Export to CSV** — Copy table data as CSV with a single click
- 🌳 **Tree View** — Fallback JSON tree view for non-tabular data
- ⚡ **Zero Configuration** — Works out of the box

## Installation

1. Clone the jsone repository
2. Install dependencies: `npm install`
3. Open the extension in VS Code development mode:
   ```bash
   code extensions/vscode-jsone
   ```
4. Press `F5` to run the extension

## Usage

1. Open any `.jsone` or `.json` file in VS Code
2. The **jsone Table** editor will open automatically
3. Use the search box to filter rows
4. Click column headers to sort
5. Click "Copy CSV" to export visible data

## Commands

- `jsone: Copy CSV` — Copy table as CSV to clipboard
- `jsone: Toggle Columns` — Show/hide columns
- `jsone: Toggle Tree View` — Switch between table and tree view

## Requirements

- VS Code >= 1.85.0

## Development

From the `extensions/vscode-jsone` directory:

```bash
# Build TypeScript
npm run build

# Watch mode
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
