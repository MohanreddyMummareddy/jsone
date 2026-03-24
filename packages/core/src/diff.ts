/**
 * JSON Diff Module
 * Compare two JSON objects and generate detailed diffs
 */

export interface DiffItem {
  type: 'added' | 'removed' | 'modified' | 'unchanged';
  path: string;
  oldValue?: any;
  newValue?: any;
}

export interface DiffResult {
  added: DiffItem[];
  removed: DiffItem[];
  modified: DiffItem[];
  summary: {
    added: number;
    removed: number;
    modified: number;
    total: number;
  };
}

/**
 * Compare two JSON objects and return detailed diff
 */
export function diffJSON(oldJSON: string, newJSON: string): { success: boolean; diff?: DiffResult; error?: string } {
  try {
    const oldObj = JSON.parse(oldJSON);
    const newObj = JSON.parse(newJSON);

    const added: DiffItem[] = [];
    const removed: DiffItem[] = [];
    const modified: DiffItem[] = [];

    // Compare objects recursively
    diffObjects(oldObj, newObj, '', added, removed, modified);

    const summary = {
      added: added.length,
      removed: removed.length,
      modified: modified.length,
      total: added.length + removed.length + modified.length,
    };

    return {
      success: true,
      diff: {
        added,
        removed,
        modified,
        summary,
      },
    };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    return { success: false, error };
  }
}

/**
 * Recursively compare two objects
 */
function diffObjects(
  oldObj: any,
  newObj: any,
  path: string,
  added: DiffItem[],
  removed: DiffItem[],
  modified: DiffItem[]
): void {
  const allKeys = new Set<string>();

  // Collect all keys from both objects
  if (typeof oldObj === 'object' && oldObj !== null && !Array.isArray(oldObj)) {
    Object.keys(oldObj).forEach((key) => allKeys.add(key));
  }
  if (typeof newObj === 'object' && newObj !== null && !Array.isArray(newObj)) {
    Object.keys(newObj).forEach((key) => allKeys.add(key));
  }

  // Handle arrays specially
  if (Array.isArray(oldObj) && Array.isArray(newObj)) {
    compareArrays(oldObj, newObj, path, added, removed, modified);
    return;
  }

  // Compare each key
  for (const key of allKeys) {
    const newPath = path ? `${path}.${key}` : key;
    const oldValue = oldObj?.[key];
    const newValue = newObj?.[key];

    if (!(key in (oldObj || {}))) {
      // Key only in new object
      added.push({ type: 'added', path: newPath, newValue });
    } else if (!(key in (newObj || {}))) {
      // Key only in old object
      removed.push({ type: 'removed', path: newPath, oldValue });
    } else if (Array.isArray(oldValue) && Array.isArray(newValue)) {
      // Both are arrays - compare them element by element
      compareArrays(oldValue, newValue, newPath, added, removed, modified);
    } else if (isObject(oldValue) && isObject(newValue)) {
      // Recursively compare nested objects
      diffObjects(oldValue, newValue, newPath, added, removed, modified);
    } else if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      // Value changed
      modified.push({ type: 'modified', path: newPath, oldValue, newValue });
    }
  }
}

/**
 * Compare arrays
 */
function compareArrays(
  oldArr: any[],
  newArr: any[],
  path: string,
  added: DiffItem[],
  removed: DiffItem[],
  modified: DiffItem[]
): void {
  const maxLength = Math.max(oldArr.length, newArr.length);

  for (let i = 0; i < maxLength; i++) {
    const newPath = `${path}[${i}]`;
    const oldValue = oldArr[i];
    const newValue = newArr[i];

    if (i >= oldArr.length) {
      added.push({ type: 'added', path: newPath, newValue });
    } else if (i >= newArr.length) {
      removed.push({ type: 'removed', path: newPath, oldValue });
    } else if (isObject(oldValue) && isObject(newValue)) {
      diffObjects(oldValue, newValue, newPath, added, removed, modified);
    } else if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      modified.push({ type: 'modified', path: newPath, oldValue, newValue });
    }
  }
}

/**
 * Check if value is an object (not null, array, or primitive)
 */
function isObject(value: any): boolean {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Generate human-readable diff report
 */
export function generateDiffReport(diff: DiffResult): string {
  const lines: string[] = [];

  lines.push('=== JSON Diff Report ===\n');
  lines.push(`Total Changes: ${diff.summary.total}`);
  lines.push(`  Added: ${diff.summary.added}`);
  lines.push(`  Removed: ${diff.summary.removed}`);
  lines.push(`  Modified: ${diff.summary.modified}\n`);

  if (diff.added.length > 0) {
    lines.push('--- Added Keys ---');
    diff.added.forEach((item) => {
      lines.push(`+ ${item.path}: ${JSON.stringify(item.newValue)}`);
    });
    lines.push('');
  }

  if (diff.removed.length > 0) {
    lines.push('--- Removed Keys ---');
    diff.removed.forEach((item) => {
      lines.push(`- ${item.path}: ${JSON.stringify(item.oldValue)}`);
    });
    lines.push('');
  }

  if (diff.modified.length > 0) {
    lines.push('--- Modified Values ---');
    diff.modified.forEach((item) => {
      lines.push(`~ ${item.path}`);
      lines.push(`  Old: ${JSON.stringify(item.oldValue)}`);
      lines.push(`  New: ${JSON.stringify(item.newValue)}`);
    });
    lines.push('');
  }

  return lines.join('\n');
}
