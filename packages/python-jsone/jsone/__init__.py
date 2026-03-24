"""
jsone - JSON Enhanced for Python

Convert and analyze JSON data as interactive tables.
"""

__version__ = "0.4.0"
__author__ = "Mohan Reddy Mummareddy"
__license__ = "MIT"

import json
import subprocess
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional


class TableResult:
    """Result of converting JSON to table format."""
    
    def __init__(self, rows: List[Dict[str, Any]], columns: List[str]):
        self.rows = rows
        self.columns = columns
    
    def to_csv(self) -> str:
        """Export table as CSV string."""
        if not self.rows:
            return ""
        
        def escape_csv(val: Any) -> str:
            s = str(val if val is not None else "")
            if "," in s or '"' in s or "\n" in s:
                return f'"{s.replace('"', '""')}"'
            return s
        
        header = ",".join(escape_csv(col) for col in self.columns)
        rows = [
            ",".join(escape_csv(row.get(col, "")) for col in self.columns)
            for row in self.rows
        ]
        return f"{header}\n" + "\n".join(rows)
    
    def to_json(self) -> str:
        """Export table as JSON string."""
        return json.dumps(self.rows, indent=2)
    
    def to_list(self) -> List[Dict[str, Any]]:
        """Get rows as list of dicts."""
        return self.rows
    
    def __repr__(self) -> str:
        return f"TableResult(rows={len(self.rows)}, columns={self.columns})"


def _invoke_jsone_core(data: Any) -> Dict[str, Any]:
    """
    Call the jsone-core npm package via Node.js subprocess.
    
    Falls back to basic flattening if Node is not available.
    """
    try:
        # Try to use the npm package via node
        result = subprocess.run(
            [
                sys.executable,
                "-c",
                f"""
import json
import subprocess
data = json.loads({json.dumps(json.dumps(data))})
result = subprocess.run(
    ['node', '-e', 'import {{ tableFromJsone }} from "@mummareddy_mohanreddy/jsone-core"; console.log(JSON.stringify(tableFromJsone(JSON.parse(process.argv[1]))))', json.dumps(data)],
    capture_output=True,
    text=True,
    check=True
)
print(result.stdout)
"""
            ],
            capture_output=True,
            text=True,
            timeout=5
        )
        
        if result.returncode == 0:
            return json.loads(result.stdout.strip())
    except Exception:
        pass
    
    # Fallback: basic flattening logic
    return _flatten_to_table(data)


def _flatten_to_table(data: Any) -> Dict[str, Any]:
    """
    Fallback implementation: convert JSON to table format.
    
    For array of objects: rows are items, columns are keys
    For single object: extract as single row
    For arrays: tag with index
    """
    rows: List[Dict[str, Any]] = []
    columns: List[str] = []
    
    if isinstance(data, list) and len(data) > 0 and isinstance(data[0], dict):
        # Array of objects - natural table format
        rows = data
        columns = list(set().union(*[set(row.keys()) for row in rows]))
        columns.sort()
    elif isinstance(data, dict):
        # Single object -> single row
        rows = [data]
        columns = sorted(data.keys())
    elif isinstance(data, list):
        # Array of primitives -> with index
        rows = [{"index": i, "value": str(v)} for i, v in enumerate(data)]
        columns = ["index", "value"]
    else:
        # Primitive value
        rows = [{"value": str(data)}]
        columns = ["value"]
    
    return {"rows": rows, "columns": columns}


def table_from_json(data: Any) -> TableResult:
    """
    Convert JSON data to a table.
    
    Args:
        data: Python dict, list, or JSON-serializable object
    
    Returns:
        TableResult with rows and columns
    
    Examples:
        >>> import json
        >>> users = json.loads('[{"name": "Alice", "age": 30}, {"name": "Bob", "age": 25}]')
        >>> result = table_from_json(users)
        >>> print(result)
        TableResult(rows=2, columns=['age', 'name'])
    """
    try:
        result_dict = _invoke_jsone_core(data)
        return TableResult(
            rows=result_dict.get("rows", []),
            columns=result_dict.get("columns", [])
        )
    except Exception as e:
        # If Node.js invoke fails, use fallback
        result_dict = _flatten_to_table(data)
        return TableResult(
            rows=result_dict.get("rows", []),
            columns=result_dict.get("columns", [])
        )


def load_json_file(filepath: str) -> Any:
    """Load JSON from file."""
    with open(filepath, "r") as f:
        return json.load(f)


def save_csv_file(filepath: str, result: TableResult) -> None:
    """Save table as CSV file."""
    with open(filepath, "w") as f:
        f.write(result.to_csv())


def save_json_file(filepath: str, result: TableResult) -> None:
    """Save table as JSON file."""
    with open(filepath, "w") as f:
        f.write(result.to_json())


__all__ = [
    "TableResult",
    "table_from_json",
    "load_json_file",
    "save_csv_file",
    "save_json_file",
]
