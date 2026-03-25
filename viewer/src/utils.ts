/**
 * Utility functions for jsone viewer
 */

/**
 * Format a file size in bytes to a human-readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format a date object to a human-readable string
 */
export function formatDate(date: Date, includeTime = false): string {
  const dateStr = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  if (includeTime) {
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    return `${dateStr} ${timeStr}`;
  }
  return dateStr;
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/**
 * Check if filename has a valid JSON-like extension
 */
export function isValidJsonFile(filename: string): boolean {
  const ext = getFileExtension(filename);
  return ['json', 'jsone', 'jsonl', 'ndjson'].includes(ext);
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;
  if (obj instanceof Object) {
    const clonedObj: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone((obj as any)[key]);
      }
    }
    return clonedObj;
  }
  return obj;
}

/**
 * Flatten a nested object into a single level
 */
export function flattenObject(obj: any, prefix = ''): Record<string, any> {
  const flattened: Record<string, any> = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(flattened, flattenObject(value, newKey));
      } else {
        flattened[newKey] = value;
      }
    }
  }

  return flattened;
}

/**
 * Truncate a string to a maximum length with ellipsis
 */
export function truncateString(str: string, maxLength: number, suffix = '...'): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Get a timestamp string for logging
 */
export function getFormattedTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Count object properties
 */
export function countProperties(obj: any): number {
  if (typeof obj !== 'object' || obj === null) return 0;
  return Object.keys(obj).length;
}

/**
 * Count array elements recursively
 */
export function countElements(data: any): number {
  if (Array.isArray(data)) {
    return data.length;
  }
  if (typeof data === 'object' && data !== null) {
    let count = 0;
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        count += countElements(data[key]);
      }
    }
    return count;
  }
  return 1;
}

/**
 * Get data type name
 */
export function getTypeName(value: any): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (value instanceof Date) return 'date';
  return typeof value;
}

/**
 * Convert object to array of key-value pairs
 */
export function objectToArray(obj: Record<string, any>): Array<{ key: string; value: any }> {
  return Object.entries(obj).map(([key, value]) => ({ key, value }));
}

/**
 * Convert array of key-value pairs back to object
 */
export function arrayToObject(arr: Array<{ key: string; value: any }>): Record<string, any> {
  return arr.reduce((obj, item) => {
    obj[item.key] = item.value;
    return obj;
  }, {} as Record<string, any>);
}

/**
 * Group array items by a property
 */
export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce((grouped, item) => {
    const groupKey = String(item[key]);
    if (!grouped[groupKey]) {
      grouped[groupKey] = [];
    }
    grouped[groupKey].push(item);
    return grouped;
  }, {} as Record<string, T[]>);
}

/**
 * Sort array by property
 */
export function sortBy<T>(arr: T[], key: keyof T, ascending = true): T[] {
  return [...arr].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return ascending ? comparison : -comparison;
  });
}

/**
 * Unique array values
 */
export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

/**
 * Check if value is empty
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}
