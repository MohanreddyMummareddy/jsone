# jsone-cli

Command-line tool to convert and analyze JSON/jsone files with interactive table formatting.

**Status:** ✅ Published to npm  
**Package:** `@mummareddy_mohanreddy/jsone-cli@0.4.3`  
**npm Link:** https://www.npmjs.com/package/@mummareddy_mohanreddy/jsone-cli

## Installation

```bash
npm install -g @mummareddy_mohanreddy/jsone-cli
```

## Quick Start

```bash
# View JSON as ASCII table
jsone convert data.json

# Export to CSV
jsone convert data.json --format csv --output table.csv

# Show data statistics
jsone analyze data.json
```

## Usage

### Convert JSON to Table

```bash
# Display as ASCII table (default)
jsone convert data.json

# Export as CSV
jsone convert data.json --format csv --output table.csv

# Export as JSON
jsone convert data.json --format json
```

### Analyze Data

```bash
# Show statistics about the data
jsone analyze data.json
```

## Commands

- `convert <file>` - Convert JSON/jsone file to table format
- `analyze <file>` - Show data statistics  
- `help` - Display help message
- `version` - Show version

## Options

- `--format, -f` - Output format: `table`, `csv`, `json` (default: `table`)
- `--output, -o` - Output file path (default: stdout)
- `--help, -h` - Show help
- `--version, -v` - Show version

## Examples

```bash
# View data as table
jsone convert users.json

# Export metadata
jsone convert data.json --format json > output.json

# Pipe to other tools
jsone convert data.json --format csv | head -10
```

## Development

From the `packages/cli` directory:

```bash
# Build TypeScript to JavaScript
npm run build

# Watch for changes
npm run watch

# Link locally for testing
npm install -g .

# Test the CLI
jsone convert ../core/__tests__/data/sample.json
```

## Features

- ✅ Convert any JSON to table format
- ✅ Export to CSV and JSON
- ✅ Data analysis and statistics
- ✅ Handles nested objects (dot notation)
- ✅ Smart type detection
- ✅ Zero dependencies (except jsone-core)
jsone convert users.json

# Export to CSV
jsone convert orders.jsone --format csv -o orders.csv

# Analyze data
jsone analyze data.json

# Show version
jsone --version
```

## Features

- ✅ Convert JSON/jsone to ASCII tables
- ✅ Export to CSV format
- ✅ JSON output support
- ✅ Data analysis and statistics
- ✅ Zero dependencies (uses @mummareddy_mohanreddy/jsone-core)

## License

MIT
