/**
 * Inference logic: detect arrays of objects, columns, and types
 */

import { ColumnDef, ColumnType } from './types.js';
import { isPlainObject } from './index.js';

/**
 * Result of finding arrays of objects
 */
export interface TableSource {
  path: string; // Path to the array (e.g., "data.users", "items")
  array: any[]; // The array itself
  rowCount: number;
  columnCount: number;
  quality: number; // Score for ranking (0-100)
}

/**
 * Convert ANY JSON structure into an array of objects for table display
 * Handles: arrays, objects, primitives, arrays of primitives
 */
export function coerceToTableArray(data: any): any[] {
  // Already an array of objects
  if (Array.isArray(data)) {
    if (data.length === 0) return [];
    
    if (data.every((el) => isPlainObject(el))) {
      return data; // Array of objects - use as-is
    }
    
    // Array of primitives - convert each to object
    if (data.every((el) => typeof el !== 'object' || el === null)) {
      return data.map((val, idx) => ({ 
        '#index': idx, 
        'value': val 
      }));
    }

    // Mixed array - convert each to object
    return data.map((val, idx) => {
      if (isPlainObject(val)) return val;
      return { '#index': idx, 'value': val };
    });
  }

  // Single object - return empty (not a table)
  if (isPlainObject(data)) {
    return [];
  }

  // Primitive value - wrap in object
  return [{ 'value': data }];
}

/**
 * Find the first array where every element is a plain object.
 * Searches recursively through the data structure.
 * @param root The root object/array to search
 * @returns First array of objects found, or null
 */
export function inferArrayOfObjects(root: any): any[] | null {
  if (Array.isArray(root)) {
    // Check if this array contains all plain objects
    if (root.length > 0 && root.every((el) => isPlainObject(el))) {
      return root;
    }
  }

  if (isPlainObject(root)) {
    // Search properties for arrays
    for (const value of Object.values(root)) {
      const found = inferArrayOfObjects(value);
      if (found) {
        return found;
      }
    }
  }

  return null;
}

/**
 * Find ALL arrays of objects in the data structure.
 * Returns them sorted by quality (best candidates first).
 * @param root The root object/array to search
 * @param path Current path (used internally for recursion)
 * @returns Array of table sources sorted by quality score
 */
export function findAllTableSources(
  root: any,
  path = ''
): TableSource[] {
  const tables: TableSource[] = [];

  function traverse(obj: any, currentPath: string): void {
    if (Array.isArray(obj)) {
      // Check if array of objects
      if (
        obj.length > 0 &&
        obj.every((el) => isPlainObject(el))
      ) {
        // Calculate quality score
        const columnCount = new Set(
          obj.flatMap((row) => Object.keys(row))
        ).size;
        const quality = Math.min(100, obj.length * 2 + columnCount * 5);

        tables.push({
          path: currentPath || '[root]',
          array: obj,
          rowCount: obj.length,
          columnCount,
          quality,
        });
      }
    } else if (isPlainObject(obj)) {
      // Recurse into object properties
      for (const [key, value] of Object.entries(obj)) {
        const newPath = currentPath ? `${currentPath}.${key}` : key;
        traverse(value, newPath);
      }
    }
  }

  traverse(root, path);

  // Sort by quality descending
  return tables.sort((a, b) => b.quality - a.quality);
}

/**
 * Infer column types by analyzing sample values.
 * Heuristics:
 *   - All numeric → 'number'
 *   - All boolean → 'boolean'
 *   - >80% ISO 8601 dates → 'date'
 *   - Otherwise → 'auto' or 'json' for complex objects
 */
function inferColumnType(values: any[]): ColumnType {
  if (values.length === 0) {
    return 'auto';
  }

  // Remove null/undefined
  const nonNull = values.filter((v) => v !== null && v !== undefined);
  if (nonNull.length === 0) {
    return 'auto';
  }

  // Check if all numbers
  if (nonNull.every((v) => typeof v === 'number' && !isNaN(v))) {
    return 'number';
  }

  // Check if all booleans
  if (nonNull.every((v) => typeof v === 'boolean')) {
    return 'boolean';
  }

  // Check if all ISO 8601 dates (>80% threshold)
  const isoPattern =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})$/;
  const isoMatches = nonNull.filter(
    (v) => typeof v === 'string' && isoPattern.test(v)
  ).length;
  if (nonNull.length > 0 && isoMatches / nonNull.length >= 0.8) {
    return 'date';
  }

  // Check if all objects
  if (nonNull.every((v) => typeof v === 'object')) {
    return 'json';
  }

  return 'auto';
}

/**
 * Infer columns from flattened rows.
 * @param rows Array of flattened row objects
 * @param max Maximum number of rows to sample (default 50)
 * @returns Array of column definitions
 */
export function inferColumns(
  rows: Record<string, any>[],
  max = 50
): ColumnDef[] {
  if (rows.length === 0) {
    return [];
  }

  // Collect all keys
  const keySet = new Set<string>();
  rows.slice(0, max).forEach((row) => {
    Object.keys(row).forEach((key) => keySet.add(key));
  });

  // Infer type for each key
  const columns: ColumnDef[] = [];
  for (const key of keySet) {
    const sampleValues = rows
      .slice(0, max)
      .map((row) => row[key])
      .filter((v) => v !== undefined);

    const type = inferColumnType(sampleValues);
    const label = key.split('.').pop() || key; // Use last part of dot-notation as label

    columns.push({ key, label, type });
  }

  return columns;
}
