/**
 * JSON to YAML and YAML to JSON Conversion Module
 * Basic bidirectional conversion without external dependencies
 */

export interface ConversionResult {
  success: boolean;
  result: string;
  error?: string;
}

/**
 * Convert JSON string to YAML format
 * Note: This is a basic implementation without full YAML specification support
 */
export function jsonToYAML(jsonStr: string): ConversionResult {
  try {
    const obj = JSON.parse(jsonStr);
    const yaml = objToYAML(obj, 0);
    return { success: true, result: yaml };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    return { success: false, result: '', error };
  }
}

/**
 * Convert YAML string to JSON
 * Note: This is a basic implementation for common YAML patterns
 */
export function yamlToJSON(yamlStr: string): ConversionResult {
  try {
    const obj = parseYAML(yamlStr);
    const json = JSON.stringify(obj, null, 2);
    return { success: true, result: json };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    return { success: false, result: '', error };
  }
}

/**
 * Convert object to YAML format recursively
 */
function objToYAML(obj: any, indent: number = 0): string {
  const spaces = ' '.repeat(indent);

  if (obj === null) {
    return 'null';
  }

  if (typeof obj !== 'object') {
    if (typeof obj === 'string') {
      // Quote strings that need it
      if (obj.includes(':') || obj.includes('"') || obj.includes("'") || obj.includes('\n')) {
        return `"${obj.replace(/"/g, '\\"')}"`;
      }
      return obj;
    }
    return String(obj);
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';

    const items = obj.map((item) => {
      const itemStr = objToYAML(item, indent + 2);
      if (typeof item === 'object' && item !== null) {
        return `${spaces}- ${itemStr.trimLeft()}`;
      }
      return `${spaces}- ${itemStr}`;
    });
    return items.join('\n');
  }

  // Handle objects
  const keys = Object.keys(obj);
  if (keys.length === 0) return '{}';

  const pairs = keys.map((key) => {
    const value = obj[key];
    const valueStr = objToYAML(value, indent + 2);

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return `${spaces}${key}:\n${valueStr}`;
    } else if (Array.isArray(value)) {
      return `${spaces}${key}:\n${valueStr}`;
    } else {
      return `${spaces}${key}: ${valueStr}`;
    }
  });

  return pairs.join('\n');
}

/**
 * Parse YAML-like format to object
 * Supports basic YAML patterns (keys with values, nested structures, arrays)
 */
function parseYAML(yamlStr: string): any {
  const lines = yamlStr.split('\n').filter((line) => line.trim() !== '' && !line.trim().startsWith('#'));

  if (lines.length === 0) {
    return {};
  }

  // Check if it's an array (starts with -)
  if (lines[0].trim().startsWith('- ')) {
    const result = parseYAMLArray(lines, 0, 0);
    return result.items;
  }

  return parseYAMLLines(lines, 0).obj;
}

/**
 * Recursively parse YAML lines
 */
function parseYAMLLines(lines: string[], startIndex: number): { obj: any; index: number } {
  const obj: any = {};
  let i = startIndex;

  while (i < lines.length) {
    const line = lines[i];
    const indent = getIndentation(line);
    const trimmed = line.trim();

    // Check if array item
    if (trimmed.startsWith('- ')) {
      // This line shouldn't be here - it's an array context
      break;
    }

    // Parse key-value pair
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) {
      i++;
      continue;
    }

    const key = trimmed.substring(0, colonIndex).trim();
    let valueStr = trimmed.substring(colonIndex + 1).trim();

    // Check if value is on next line(s)
    if (valueStr === '' || valueStr === '>') {
      i++;
      // Look ahead for nested structure or array
      if (i < lines.length) {
        const nextIndent = getIndentation(lines[i]);
        const nextTrimmed = lines[i].trim();

        if (nextTrimmed.startsWith('- ')) {
          // Array follows
          const arrayResult = parseYAMLArray(lines, i, nextIndent);
          obj[key] = arrayResult.items;
          i = arrayResult.index;
          continue;
        } else if (nextIndent > indent) {
          // Nested object follows
          const nestedResult = parseYAMLLines(lines, i);
          obj[key] = nestedResult.obj;
          i = nestedResult.index;
          continue;
        }
      }
      obj[key] = null;
    } else {
      // Parse inline value
      obj[key] = parseYAMLValue(valueStr);
      i++;
    }
  }

  return { obj, index: i };
}

/**
 * Parse YAML array
 */
function parseYAMLArray(lines: string[], startIndex: number, arrayIndent: number): { items: any[]; index: number } {
  const items: any[] = [];
  let i = startIndex;

  while (i < lines.length) {
    const line = lines[i];
    const indent = getIndentation(line);
    const trimmed = line.trim();

    if (indent < arrayIndent && trimmed !== '') {
      break;
    }

    if (trimmed.startsWith('- ')) {
      const valueStr = trimmed.substring(2).trim();
      
      // Check if this is a complex item (object with properties)
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        const nextIndent = getIndentation(nextLine);
        const nextTrimmed = nextLine.trim();
        
        // If next line is indented more and has a colon, it's an object
        if (nextIndent > indent && nextTrimmed.includes(':')) {
          const objLines: string[] = [];
          let j = i + 1;
          
          // Collect all lines that belong to this object
          while (j < lines.length) {
            const objLine = lines[j];
            const objIndent = getIndentation(objLine);
            const objTrimmed = objLine.trim();
            
            if (objTrimmed.startsWith('- ') && objIndent <= indent) {
              // Next array item
              break;
            }
            
            if (objIndent > indent && objTrimmed !== '') {
              // Belongs to current object
              objLines.push(objLine);
              j++;
            } else if (objTrimmed === '' || objIndent <= indent) {
              break;
            } else {
              j++;
            }
          }
          
          // Parse the object from collected lines
          if (objLines.length > 0) {
            const objResult = parseYAMLLines(objLines, 0);
            items.push(objResult.obj);
            i = j;
            continue;
          }
        }
      }
      
      // Simple value
      items.push(parseYAMLValue(valueStr));
      i++;
    } else if (indent > arrayIndent) {
      i++;
    } else {
      break;
    }
  }

  return { items, index: i };
}

/**
 * Get indentation level of a line
 */
function getIndentation(line: string): number {
  return line.search(/\S/);
}

/**
 * Parse YAML value (handles strings, numbers, booleans, nulls)
 */
function parseYAMLValue(valueStr: string): any {
  const trimmed = valueStr.trim();

  if (trimmed === '' || trimmed.toLowerCase() === 'null') {
    return null;
  }

  if (trimmed.toLowerCase() === 'true') {
    return true;
  }

  if (trimmed.toLowerCase() === 'false') {
    return false;
  }

  // Try to parse as number
  const num = Number(trimmed);
  if (!isNaN(num) && trimmed !== '') {
    return num;
  }

  // Remove quotes if present
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }

  // Return as string
  return trimmed;
}

/**
 * Validate YAML format (basic check)
 */
export function validateYAML(yamlStr: string): { valid: boolean; error?: string } {
  try {
    parseYAML(yamlStr);
    return { valid: true };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    return { valid: false, error };
  }
}
