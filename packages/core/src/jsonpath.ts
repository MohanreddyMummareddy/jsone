/**
 * JSONPath Query Module
 * Query JSON objects using JSONPath expressions
 * Supports basic JSONPath syntax similar to XPath for JSON
 */

export interface QueryResult {
  success: boolean;
  matches: PathMatch[];
  error?: string;
}

export interface PathMatch {
  path: string;
  value: any;
}

/**
 * Query JSON object using JSONPath expression
 * Syntax examples:
 *   $.store.book[*].author  - Get all book authors
 *   $.store.book[0].title   - Get title of first book
 *   $..price                - Get all prices (recursive descent)
 *   $.store.*               - Get all direct children of store
 */
export function query(jsonStr: string, jsonPath: string): QueryResult {
  try {
    const obj = JSON.parse(jsonStr);
    const matches = queryObject(obj, jsonPath);
    
    return {
      success: true,
      matches,
    };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    return { success: false, matches: [], error };
  }
}

/**
 * Query object with JSONPath expression
 */
function queryObject(obj: any, jsonPath: string): PathMatch[] {
  const matches: PathMatch[] = [];
  
  // Normalize path
  const path = jsonPath.trim();
  if (!path.startsWith('$')) {
    throw new Error('JSONPath must start with $');
  }
  
  // Handle root reference
  if (path === '$') {
    return [{ path: '$', value: obj }];
  }
  
  // Parse the path and execute query
  const segments = parseJsonPath(path);
  findMatches(obj, segments, '', matches);
  
  return matches;
}

/**
 * Parse JSONPath into segments
 */
function parseJsonPath(path: string): PathSegment[] {
  const segments: PathSegment[] = [];
  
  // Remove leading $
  let remaining = path.substring(1);
  
  while (remaining.length > 0) {
    if (remaining.startsWith('..')) {
      // Recursive descent
      segments.push({ type: 'recursive', name: '' });
      remaining = remaining.substring(2);
    } else if (remaining.startsWith('.[')) {
      // Array/filter index
      const endBracket = remaining.indexOf(']');
      if (endBracket === -1) throw new Error('Unclosed bracket in JSONPath');
      
      const content = remaining.substring(2, endBracket);
      segments.push({ type: 'index', name: content });
      remaining = remaining.substring(endBracket + 1);
    } else if (remaining.startsWith('.')) {
      // Property access
      remaining = remaining.substring(1);
      
      // Check if next is array access
      if (remaining.startsWith('[')) {
        const endBracket = remaining.indexOf(']');
        if (endBracket === -1) throw new Error('Unclosed bracket in JSONPath');
        
        const propName = remaining.substring(0, endBracket).trim();
        segments.push({ type: 'property', name: propName });
        remaining = remaining.substring(endBracket + 1);
      } else {
        // Regular property
        const match = remaining.match(/^([a-zA-Z0-9_*]+)(\.|\[|$)?/);
        if (!match) throw new Error('Invalid JSONPath syntax');
        
        const propName = match[1];
        segments.push({ type: 'property', name: propName });
        remaining = remaining.substring(propName.length);
      }
    } else if (remaining.startsWith('[')) {
      // Direct array access (shouldn't happen after normalization)
      const endBracket = remaining.indexOf(']');
      if (endBracket === -1) throw new Error('Unclosed bracket in JSONPath');
      
      const content = remaining.substring(1, endBracket);
      segments.push({ type: 'index', name: content });
      remaining = remaining.substring(endBracket + 1);
    } else {
      throw new Error('Invalid JSONPath syntax');
    }
  }
  
  return segments;
}

interface PathSegment {
  type: 'property' | 'index' | 'recursive';
  name: string;
}

/**
 * Find all matches for given path segments
 */
function findMatches(obj: any, segments: PathSegment[], currentPath: string, matches: PathMatch[]): void {
  if (segments.length === 0) {
    matches.push({ path: currentPath || '$', value: obj });
    return;
  }
  
  const segment = segments[0];
  const remaining = segments.slice(1);
  
  if (segment.type === 'recursive') {
    // Recursive descent - search all descendants
    traverseAll(obj, segment, remaining, currentPath, matches);
  } else if (segment.type === 'property') {
    // Property access
    if (segment.name === '*') {
      // Wildcard - all properties
      if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            const newPath = currentPath ? `${currentPath}.${key}` : key;
            findMatches(obj[key], remaining, newPath, matches);
          }
        }
      }
    } else {
      // Specific property
      if (typeof obj === 'object' && obj !== null && segment.name in obj) {
        const newPath = currentPath ? `${currentPath}.${segment.name}` : segment.name;
        findMatches((obj as Record<string, any>)[segment.name], remaining, newPath, matches);
      }
    }
  } else if (segment.type === 'index') {
    // Array index or filter
    const indexStr = segment.name;
    
    if (indexStr === '*') {
      // Wildcard - all array items
      if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
          const newPath = `${currentPath}[${i}]`;
          findMatches(obj[i], remaining, newPath, matches);
        }
      }
    } else if (/^-?\d+$/.test(indexStr)) {
      // Numeric index (including negative)
      const index = parseInt(indexStr, 10);
      if (Array.isArray(obj) && index < obj.length && index >= -obj.length) {
        const actualIndex = index < 0 ? obj.length + index : index;
        const newPath = `${currentPath}[${actualIndex}]`;
        findMatches(obj[actualIndex], remaining, newPath, matches);
      }
    } else if (indexStr.includes(':')) {
      // Slice notation (start:end)
      const [startStr, endStr] = indexStr.split(':');
      if (Array.isArray(obj)) {
        const start = startStr ? parseInt(startStr, 10) : 0;
        const end = endStr ? parseInt(endStr, 10) : obj.length;
        
        for (let i = Math.max(0, start); i < Math.min(obj.length, end); i++) {
          const newPath = `${currentPath}[${i}]`;
          findMatches(obj[i], remaining, newPath, matches);
        }
      }
    } else if (indexStr.startsWith('?')) {
      // Filter expression
      if (Array.isArray(obj)) {
        const filterExpr = indexStr.substring(1).trim();
        for (let i = 0; i < obj.length; i++) {
          if (matchesFilter(obj[i], filterExpr)) {
            const newPath = `${currentPath}[${i}]`;
            findMatches(obj[i], remaining, newPath, matches);
          }
        }
      }
    }
  }
}

/**
 * Traverse all descendants for recursive descent
 */
function traverseAll(obj: any, segment: PathSegment, remaining: PathSegment[], currentPath: string, matches: PathMatch[]): void {
  // Check current level first
  if (remaining.length === 0) {
    // If no more segments, match everything
    matches.push({ path: currentPath || '$', value: obj });
  } else {
    findMatches(obj, remaining, currentPath, matches);
  }
  
  // Recursively traverse children
  if (typeof obj === 'object' && obj !== null) {
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        const newPath = currentPath ? `${currentPath}[${i}]` : `$[${i}]`;
        traverseAll(obj[i], segment, remaining, newPath, matches);
      }
    } else {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const newPath = currentPath ? `${currentPath}.${key}` : key;
          traverseAll((obj as Record<string, any>)[key], segment, remaining, newPath, matches);
        }
      }
    }
  }
}

/**
 * Check if object matches filter expression
 */
function matchesFilter(obj: any, filterExpr: string): boolean {
  // Simple filter support: @.property=value
  const match = filterExpr.match(/@\.(\w+)\s*==?\s*(.+)/);
  if (!match) return false;
  
  const property = match[1];
  const expectedValue = match[2].trim();
  
  if (typeof obj !== 'object' || obj === null) return false;
  
  const actualValue = (obj as Record<string, any>)[property];
  
  // Handle quoted strings
  if ((expectedValue.startsWith('"') && expectedValue.endsWith('"')) ||
      (expectedValue.startsWith("'") && expectedValue.endsWith("'"))) {
    return actualValue === expectedValue.slice(1, -1);
  }
  
  // Handle numbers
  if (!isNaN(Number(expectedValue))) {
    return actualValue === Number(expectedValue);
  }
  
  // Direct comparison
  return actualValue === expectedValue;
}

/**
 * Get value at JSONPath
 */
export function getValue(jsonStr: string, jsonPath: string): any {
  const result = query(jsonStr, jsonPath);
  if (!result.success || result.matches.length === 0) {
    return undefined;
  }
  return result.matches[0].value;
}

/**
 * Set value at JSONPath
 */
export function setValue(jsonStr: string, jsonPath: string, value: any): { success: boolean; result: string; error?: string } {
  try {
    const obj = JSON.parse(jsonStr);
    const segments = parseJsonPath(jsonPath);
    
    // Navigate to parent and set value
    setValueInObject(obj, segments, value);
    
    return { success: true, result: JSON.stringify(obj) };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    return { success: false, result: '', error };
  }
}

/**
 * Set value in object at path
 */
function setValueInObject(obj: any, segments: PathSegment[], value: any): void {
  let current = obj;
  
  // Navigate to parent
  for (let i = 0; i < segments.length - 1; i++) {
    const segment = segments[i];
    
    if (segment.type === 'property') {
      if (!(segment.name in current)) {
        current[segment.name] = {};
      }
      current = current[segment.name];
    } else if (segment.type === 'index') {
      const index = parseInt(segment.name, 10);
      if (!Array.isArray(current)) {
        throw new Error('Cannot index non-array');
      }
      current = current[index];
    }
  }
  
  // Set value
  const lastSegment = segments[segments.length - 1];
  if (lastSegment.type === 'property') {
    (current as Record<string, any>)[lastSegment.name] = value;
  } else if (lastSegment.type === 'index') {
    const index = parseInt(lastSegment.name, 10);
    if (!Array.isArray(current)) {
      throw new Error('Cannot index non-array');
    }
    current[index] = value;
  }
}
