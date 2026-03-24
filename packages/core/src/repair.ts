/**
 * JSON Repair/Fixer Module
 * Auto-fixes broken JSON by handling common issues
 */

/**
 * Attempts to repair malformed JSON strings
 * Handles:
 * - Missing quotes around keys
 * - Trailing commas
 * - Single quotes instead of double quotes
 * - Missing closing brackets/braces
 * - Unescaped control characters
 */
export function repairJSON(input: string): { success: boolean; result: string; errors: string[] } {
  const errors: string[] = [];

  try {
    // Try parsing first - if it works, return as is
    JSON.parse(input);
    return { success: true, result: input, errors: [] };
  } catch (e) {
    // Continue with repair attempts
  }

  let repaired = input;

  // 1. Fix single quotes to double quotes around keys and values
  repaired = fixSingleQuotes(repaired);

  // 2. Fix missing quotes around keys
  repaired = fixUnquotedKeys(repaired);

  // 3. Remove trailing commas before closing braces/brackets
  repaired = fixTrailingCommas(repaired);

  // 4. Auto-complete missing closing brackets/braces
  repaired = autoCompleteBrackets(repaired);

  // Try parsing again
  try {
    JSON.parse(repaired);
    return { success: true, result: repaired, errors };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    errors.push(`Failed to repair JSON: ${error}`);
    return { success: false, result: input, errors };
  }
}

/**
 * Convert single quotes to double quotes (careful not to break escaped content)
 */
function fixSingleQuotes(input: string): string {
  // Replace single quotes with double quotes
  // This is a simple approach - doesn't handle all edge cases
  let result = '';
  let inDouble = false;
  let inSingle = false;
  let escaped = false;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (escaped) {
      result += char;
      escaped = false;
      continue;
    }

    if (char === '\\') {
      result += char;
      escaped = true;
      continue;
    }

    if (char === '"' && !inSingle) {
      inDouble = !inDouble;
      result += char;
    } else if (char === "'" && !inDouble) {
      inSingle = !inSingle;
      result += '"'; // Convert single to double
    } else {
      result += char;
    }
  }

  return result;
}

/**
 * Fix unquoted keys by adding double quotes around them
 */
function fixUnquotedKeys(input: string): string {
  // Match unquoted keys: {keyname: or ,keyname:
  const unquotedKeyPattern = /([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g;
  return input.replace(unquotedKeyPattern, '$1"$2":');
}

/**
 * Remove trailing commas before closing braces/brackets
 */
function fixTrailingCommas(input: string): string {
  // Remove comma before } or ]
  return input.replace(/,(\s*[}\]])/g, '$1');
}

/**
 * Auto-complete missing closing brackets and braces
 */
function autoCompleteBrackets(input: string): string {
  let braceCount = 0;
  let bracketCount = 0;

  for (const char of input) {
    if (char === '{') braceCount++;
    if (char === '}') braceCount--;
    if (char === '[') bracketCount++;
    if (char === ']') bracketCount--;
  }

  let result = input;

  // Add missing closing brackets
  while (bracketCount > 0) {
    result += ']';
    bracketCount--;
  }

  // Add missing closing braces
  while (braceCount > 0) {
    result += '}';
    braceCount--;
  }

  return result;
}

/**
 * Validate JSON without throwing, returns validation result
 */
export function validateJSON(input: string): { valid: boolean; error?: string } {
  try {
    JSON.parse(input);
    return { valid: true };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    return { valid: false, error };
  }
}
