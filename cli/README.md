# jsone CLI

Command-line tool for viewing and converting jsone files.

## Installation

```bash
npm install -g @jsone/cli
```

## Commands

### `jsone table <file>`

Pretty-print jsone data as a formatted table to stdout.

```bash
jsone table examples/users.jsone
```

Output:
```
id | name  | email
---|-------|-------------------
1  | Ravi  | ravi@example.com
2  | Anita | anita@example.com
```

### `jsone csv <file> -o <output.csv>`

Export jsone table data to CSV format.

```bash
jsone csv examples/users.jsone -o users.csv
```

### `jsone validate <file>`

Validate jsone file structure and metadata.

```bash
jsone validate examples/users.jsone
```

Checks:
- Valid JSON syntax
- `$meta.views` structure (if present)
- No execution fields (command, script, eval, etc.)
- Column definitions are valid

## Options

- `--help, -h` — Show help
- `--version, -v` — Show version

## Examples

```bash
# View a jsone file as a table
jsone table data.jsone

# Export to CSV
jsone csv data.jsone -o data.csv

# Validate a file
jsone validate data.jsone
```

## Reuses @jsone/core

The CLI reuses all core logic from `@jsone/core`:
- Parsing and flattening
- Table inference
- Type detection
- CSV field escaping
