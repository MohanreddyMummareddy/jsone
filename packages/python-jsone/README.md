# jsone - JSON Enhanced for Python

Convert and analyze JSON data as interactive tables in Python.

## Installation

```bash
pip install jsone
```

## Quick Start

```python
import json
from jsone import table_from_json

# Load JSON data
users = [
    {"name": "Alice", "age": 30, "city": "NYC"},
    {"name": "Bob", "age": 25, "city": "LA"},
    {"name": "Charlie", "age": 35, "city": "Chicago"},
]

# Convert to table
result = table_from_json(users)

# Access data
print(result.rows)       # List of dicts
print(result.columns)    # Column names

# Export formats
print(result.to_csv())   # CSV string
print(result.to_json())  # JSON string
```

## API

### `table_from_json(data)`

Convert JSON data to a table.

**Parameters:**
- `data` (dict, list, or JSON-serializable): The data to convert

**Returns:**
- `TableResult` object with `.rows` and `.columns`

**Example:**
```python
from jsone import table_from_json

data = [
    {"id": 1, "name": "Alice"},
    {"id": 2, "name": "Bob"},
]

result = table_from_json(data)
# result.rows = [{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}]
# result.columns = ["id", "name"]
```

### `TableResult` Methods

- `.to_csv()` - Export as CSV string
- `.to_json()` - Export as JSON string
- `.to_list()` - Get rows as list of dicts

**Example:**
```python
result.to_csv()   # "id,name\n1,Alice\n2,Bob"
result.to_json()  # '[{"id": 1, "name": "Alice"}, ...]'
result.to_list()  # [{"id": 1, "name": "Alice"}, ...]
```

### File Operations

```python
from jsone import load_json_file, save_csv_file, save_json_file

# Load from file
data = load_json_file("data.json")
result = table_from_json(data)

# Save as CSV
save_csv_file("output.csv", result)

# Save as JSON
save_json_file("output.json", result)
```

## Features

- ✅ Convert JSON arrays to table format
- ✅ Auto-detect table structure
- ✅ Export to CSV, JSON, or Python dicts
- ✅ Simple, zero-dependency API
- ✅ Pure Python implementation
- ✅ Compatible with pandas (convert to DataFrame)

## Pandas Integration

```python
import pandas as pd
from jsone import table_from_json

data = [{"x": 1, "y": 2}, {"x": 3, "y": 4}]
result = table_from_json(data)
df = pd.DataFrame(result.rows)
```

## Comparison with JSON

### Standard JSON Approach
```python
import json
data = json.load(open("users.json"))
# Manually iterate and analyze
for user in data:
    print(user["name"], user["age"])
```

### jsone Approach
```python
from jsone import table_from_json, load_json_file
result = table_from_json(load_json_file("users.json"))
# Instant tabular view with analysis
print(result.to_csv())  # Or .to_json() or .rows
```

## License

MIT

## See Also

- [jsone on npm](https://www.npmjs.com/package/@mummareddy_mohanreddy/jsone-core)
- [jsone CLI](https://www.npmjs.com/package/jsone-cli)
- [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=MUMMAREDDYMOHANREDDY.vscode-jsone)
- [GitHub Repository](https://github.com/MohanreddyMummareddy/jsone)
