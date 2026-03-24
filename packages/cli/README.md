# jsone-cli

Command-line tool to convert and analyze JSON/jsone files with interactive table formatting.

## Installation

```bash
npm install -g jsone-cli
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
# Convert and display
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
