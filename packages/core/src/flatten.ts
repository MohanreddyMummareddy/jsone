/**
 * Flattening logic: convert nested objects to dot-notation keys
 * Does NOT descend into arrays.
 */

import { isPlainObject } from './index.js';

/**
 * Deeply flatten an object using dot-notation, but stop at arrays.
 * @param row The object to flatten
 * @param prefix Optional prefix for keys (used recursively)
 * @returns Flattened object with dot-notation keys
 */
export function flattenRow(
  row: Record<string, any>,
  prefix = ''
): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(row)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (isPlainObject(value)) {
      // Recurse into plain objects
      Object.assign(result, flattenRow(value, fullKey));
    } else if (Array.isArray(value)) {
      // Stop at arrays; convert to string representation
      result[fullKey] = value;
    } else {
      // Primitive value
      result[fullKey] = value;
    }
  }

  return result;
}

/**
 * Convert array or object values to display strings for table cells.
 * Primitives joined by comma; objects as JSON (truncated at 120 chars).
 * @param value The value to format
 * @returns Formatted string; full value returned separately for expansion
 */
export function formatCellValue(value: any): { display: string; full: string } {
  if (value === null || value === undefined) {
    return { display: '', full: '' };
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return { display: '[]', full: '[]' };
    }

    // Check if all primitives
    if (value.every((v) => typeof v !== 'object' || v === null)) {
      const joined = value.map((v) => String(v)).join(', ');
      return { display: joined, full: joined };
    }

    // Array of objects: JSON representation
    const full = JSON.stringify(value);
    const display = full.length > 120 ? full.substring(0, 120) + '...' : full;
    return { display, full };
  }

  if (typeof value === 'object') {
    const full = JSON.stringify(value);
    const display = full.length > 120 ? full.substring(0, 120) + '...' : full;
    return { display, full };
  }

  // Primitive
  const str = String(value);
  return { display: str, full: str };
}
