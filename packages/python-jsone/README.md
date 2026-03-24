# jsone - JSON Enhanced for Python

Convert and analyze JSON data as interactive tables in Python.

**Status:** ✅ Published to PyPI  
**Package:** `mohanreddy-jsone@0.4.0`  
**PyPI Link:** https://pypi.org/project/mohanreddy-jsone/0.4.0/

## Installation

```bash
pip install mohanreddy-jsone
```

## Quick Start

```python
from jsone import table_from_json

# Convert JSON to table
data = [
    {"name": "Alice", "age": 30},
    {"name": "Bob", "age": 25}
]

result = table_from_json(data)

# Access the data
print(result.rows)      # List of dicts
print(result.columns)   # Column metadata

# Export
print(result.to_csv())   # CSV format
print(result.to_json())  # JSON format
```

## API

### `table_from_json(data)`

Convert JSON data to a table format.

**Parameters:**
- `data` (dict, list, or JSON-serializable): The data to convert

**Returns:**
- `TableResult` object with:
  - `.rows` — List of row dictionaries
  - `.columns` — List of column metadata dicts
  - `.to_csv()` — Export as CSV string
  - `.to_json()` — Export as JSON string  
  - `.to_list()` — Export as list of values

**Example:**
```python
from jsone import table_from_json

users = [
    {"id": 1, "name": "Alice", "email": "alice@example.com"},
    {"id": 2, "name": "Bob", "email": "bob@example.com"},
]

result = table_from_json(users)

print(result.rows)     # [{'id': 1, 'name': 'Alice', ...}, ...]
print(result.columns)  # [{'key': 'id', 'label': 'id', 'type': 'number'}, ...]
```

### `load_json_file(filepath)`

Load and convert a JSON file to table.

```python
from jsone import load_json_file

result = load_json_file('data.json')
print(result.to_csv())
```

### `save_csv_file(result, filepath)`

Save table result as CSV file.

```python
from jsone import table_from_json, save_csv_file

result = table_from_json(data)
save_csv_file(result, 'output.csv')
```

### `save_json_file(result, filepath)`

Save table result as JSON file.

```python
from jsone import table_from_json, save_json_file

result = table_from_json(data)
save_json_file(result, 'output.json')
```

## Features

- ✅ Convert any JSON structure to tables
- ✅ Automatic type detection (number, date, boolean)
- ✅ Nested object flattening (dot notation)
- ✅ Multiple export formats (CSV, JSON)
- ✅ Works with Node.js fallback or pure Python
- ✅ Zero external dependencies (except subprocess for Node)

## Examples

### Arrays of Objects

```python
from jsone import table_from_json

users = [
    {"id": 1, "name": "Alice", "city": "NYC"},
    {"id": 2, "name": "Bob", "city": "LA"}
]

result = table_from_json(users)
print(result.to_csv())
# id,name,city
# 1,Alice,NYC
# 2,Bob,LA
```

### Single Object

```python
from jsone import table_from_json

user = {"name": "Alice", "age": 30, "city": "NYC"}
result = table_from_json(user)

print(result.rows)
# [{'name': 'Alice', 'age': 30, 'city': 'NYC'}]
```

### Nested Data

```python
from jsone import table_from_json

data = {
    "id": 1,
    "user": {
        "name": "Alice",
        "profile": {
            "city": "NYC",
            "role": "Admin"
        }
    }
}

result = table_from_json(data)
print(result.columns)
# [
#   {'key': 'id', ...},
#   {'key': 'user.name', ...},
#   {'key': 'user.profile.city', ...},
#   {'key': 'user.profile.role', ...}
# ]
```

## Development

```bash
# Install in development mode
pip install -e .

# Run tests
python -m pytest tests/

# Build distributions
python -m build

# Publish to PyPI
python -m twine upload dist/*
```

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
