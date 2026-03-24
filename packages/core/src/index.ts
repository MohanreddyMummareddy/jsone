/**
 * jsone core library — JSON parsing, inference, and table generation
 */

import { flattenRow as flattenRowImpl, formatCellValue } from './flatten.js';
import {
  inferArrayOfObjects as inferArrayOfObjectsImpl,
  inferColumns as inferColumnsImpl,
  findAllTableSources as findAllTableSourcesImpl,
  coerceToTableArray as coerceToTableArrayImpl,
  type TableSource,
} from './infer.js';
import {
  ColumnDef,
  ColumnType,
  JsoneResult,
  Meta,
  TableResult,
  ViewDef,
  ColumnHint,
} from './types.js';

/**
 * Check if value is a plain object (not array, null, or class instance)
 */
export function isPlainObject(v: any): boolean {
  return (
    v !== null &&
    typeof v === 'object' &&
    !Array.isArray(v) &&
    Object.prototype.toString.call(v) === '[object Object]'
  );
}

/**
 * Parse jsone input: JSON with optional $meta at root level
 * @param input JSON string or object
 * @returns Parsed jsone with meta and data
 */
export function parseJsone(input: unknown): JsoneResult {
  let parsed: any;

  if (typeof input === 'string') {
    try {
      parsed = JSON.parse(input);
    } catch (err) {
      throw new Error(`Invalid JSON: ${err instanceof Error ? err.message : String(err)}`);
    }
  } else {
    parsed = input;
  }

  if (!isPlainObject(parsed)) {
    return { data: parsed };
  }

  const { $meta, ...rest } = parsed;

  // If $meta exists and data is not present, treat the whole object as a wrapper
  if ($meta !== undefined) {
    return {
      meta: $meta as Meta,
      data: Object.keys(rest).length > 0 ? rest : parsed,
    };
  }

  return { data: parsed };
}

/**
 * Resolve a value at a path within root using slash-separated notation
 * E.g., "/a/b/c" accesses root.a.b.c
 * @param root The root object
 * @param source Path string (e.g., "a/b/c" or "/a/b/c")
 * @returns The value at the path, or undefined
 */
export function resolveSource(root: any, source?: string): any {
  if (!source) {
    return root;
  }

  const parts = source.split('/').filter((p) => p.length > 0);
  let current = root;

  for (const part of parts) {
    if (current === null || typeof current !== 'object') {
      return undefined;
    }
    current = current[part];
  }

  return current;
}

/**
 * Re-export flatten functions
 */
export function flattenRow(
  row: Record<string, any>,
  prefix?: string
): Record<string, any> {
  return flattenRowImpl(row, prefix);
}

export function inferArrayOfObjects(root: any): any[] | null {
  return inferArrayOfObjectsImpl(root);
}

export function inferColumns(
  rows: Record<string, any>[],
  max?: number
): ColumnDef[] {
  return inferColumnsImpl(rows, max);
}

export function findAllTableSources(root: any): TableSource[] {
  return findAllTableSourcesImpl(root);
}

export function coerceToTableArray(data: any): any[] {
  return coerceToTableArrayImpl(data);
}

/**
 * Generate a table from jsone data.
 * Algorithm:
 *   1. If $meta.views with matching viewId exists, use its source and column hints
 *   2. Else find first array of objects
 *   3. Else coerce any JSON structure into array format
 *   4. Always return a table (never empty)
 * @param root The parsed jsone object or raw data
 * @param viewId Optional view ID to match in $meta.views
 * @returns Table with rows and columns
 */
export function tableFromJsone(
  root: any,
  viewId?: string
): TableResult {
  let data = root;
  let meta: Meta | undefined;

  // Parse jsone wrapper if present
  if (isPlainObject(root) && '$meta' in root) {
    const parsed = parseJsone(root);
    meta = parsed.meta;
    data = parsed.data;
  }

  // Step 1: Check for matching view in meta
  if (meta?.views && viewId) {
    const view = meta.views.find((v) => v.id === viewId);
    if (view) {
      let rows = inferArrayOfObjects(resolveSource(data, view.source));

      if (rows) {
        // Flatten rows
        rows = rows.map((r) => flattenRow(r));

        // Apply column hints if provided
        let columns = inferColumns(rows);
        if (view.columns && view.columns.length > 0) {
          columns = applyColumnHints(columns, view.columns);
        }

        return { rows, columns };
      }
    }
  }

  // Step 2: Try to infer first array of objects
  let rows = inferArrayOfObjects(data);

  // Step 3: If no array found, coerce ANY structure into table array
  if (!rows || rows.length === 0) {
    rows = coerceToTableArray(data);
  }

  if (!rows || rows.length === 0) {
    return { rows: [], columns: [] };
  }

  // Flatten rows
  const flatRows = rows.map((r) => flattenRow(r));

  // Infer columns
  const columns = inferColumns(flatRows);

  return { rows: flatRows, columns };
}

/**
 * Apply user-provided column hints to inferred columns
 */
function applyColumnHints(
  columns: ColumnDef[],
  hints: ColumnHint[]
): ColumnDef[] {
  const hintMap = new Map(hints.map((h) => [h.key, h]));

  return columns.map((col) => {
    const hint = hintMap.get(col.key);
    if (hint) {
      return {
        key: col.key,
        label: hint.label || col.label,
        type: (hint.type as ColumnType) || col.type,
      };
    }
    return col;
  });
}

// Export utility modules
export { repairJSON, validateJSON } from './repair.js';
export { minifyJSON, prettyJSON, compactJSON, formatJSON, getFormattingStats, type FormattingOption } from './format.js';

// Export types
export type {
  ColumnDef,
  ColumnType,
  JsoneResult,
  Meta,
  TableResult,
  ViewDef,
  ColumnHint,
  TableSource,
};

// Utility export
export { formatCellValue };
