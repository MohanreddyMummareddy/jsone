/**
 * JSON Formatting Module
 * Handles minification and pretty-printing of JSON
 */

export type FormattingOption = 'minify' | 'pretty' | 'compact';

/**
 * Minify JSON by removing all unnecessary whitespace
 */
export function minifyJSON(input: string): { success: boolean; result: string; error?: string } {
  try {
    const parsed = JSON.parse(input);
    const minified = JSON.stringify(parsed);
    return { success: true, result: minified };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    return { success: false, result: input, error };
  }
}

/**
 * Pretty-print JSON with specified indentation
 */
export function prettyJSON(input: string, indent: number = 2): { success: boolean; result: string; error?: string } {
  try {
    const parsed = JSON.parse(input);
    const formatted = JSON.stringify(parsed, null, indent);
    return { success: true, result: formatted };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    return { success: false, result: input, error };
  }
}

/**
 * Compact JSON - keep structure but reduce unnecessary whitespace
 */
export function compactJSON(input: string): { success: boolean; result: string; error?: string } {
  try {
    const parsed = JSON.parse(input);
    // Compact: minimal whitespace for readability
    const formatted = JSON.stringify(parsed, null, 1);
    return { success: true, result: formatted };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    return { success: false, result: input, error };
  }
}

/**
 * Format JSON according to specified option
 */
export function formatJSON(
  input: string,
  format: FormattingOption = 'pretty',
  indent: number = 2
): { success: boolean; result: string; error?: string } {
  switch (format) {
    case 'minify':
      return minifyJSON(input);
    case 'compact':
      return compactJSON(input);
    case 'pretty':
      return prettyJSON(input, indent);
    default:
      return { success: false, result: input, error: `Unknown format: ${format}` };
  }
}

/**
 * Calculate statistics about JSON formatting
 */
export function getFormattingStats(input: string): {
  original: number;
  minified: number;
  savings: number;
  savingsPercentage: number;
} {
  const minified = minifyJSON(input);
  const original = input.length;
  const minifiedLen = minified.result.length;
  const savings = original - minifiedLen;
  const savingsPercentage = Math.round((savings / original) * 100 * 100) / 100;

  return {
    original,
    minified: minifiedLen,
    savings,
    savingsPercentage,
  };
}
