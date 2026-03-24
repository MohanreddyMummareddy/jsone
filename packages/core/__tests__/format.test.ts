import { describe, it, expect } from 'vitest';
import { minifyJSON, prettyJSON, compactJSON, formatJSON, getFormattingStats } from '../src/format';

describe('JSON Format Module', () => {
  const sampleJSON = {
    name: 'Alice',
    age: 30,
    email: 'alice@example.com',
    address: {
      street: '123 Main St',
      city: 'New York',
      zip: '10001',
    },
    hobbies: ['reading', 'coding', 'gaming'],
  };

  const sampleString = JSON.stringify(sampleJSON);
  const prettyString = JSON.stringify(sampleJSON, null, 2);

  describe('minifyJSON', () => {
    it('should minify JSON successfully', () => {
      const result = minifyJSON(prettyString);
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should remove all whitespace', () => {
      const result = minifyJSON(prettyString);
      expect(result.result).not.toContain('\n');
      expect(result.result).not.toContain('  ');
    });

    it('should preserve data integrity', () => {
      const result = minifyJSON(prettyString);
      const original = JSON.parse(prettyString);
      const minified = JSON.parse(result.result);
      expect(minified).toEqual(original);
    });

    it('should handle invalid JSON', () => {
      const result = minifyJSON('{invalid}');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should be idempotent', () => {
      const first = minifyJSON(prettyString);
      const second = minifyJSON(first.result);
      expect(second.result).toBe(first.result);
    });

    it('should handle arrays', () => {
      const input = JSON.stringify([1, 2, 3, 4, 5], null, 2);
      const result = minifyJSON(input);
      expect(result.success).toBe(true);
      expect(result.result).toBe('[1,2,3,4,5]');
    });

    it('should handle primitives', () => {
      expect(minifyJSON('"hello"').result).toBe('"hello"');
      expect(minifyJSON('123').result).toBe('123');
      expect(minifyJSON('true').result).toBe('true');
      expect(minifyJSON('null').result).toBe('null');
    });
  });

  describe('prettyJSON', () => {
    it('should pretty-print JSON with default indent', () => {
      const result = prettyJSON(sampleString);
      expect(result.success).toBe(true);
      expect(result.result).toContain('\n');
    });

    it('should use specified indentation', () => {
      const result2 = prettyJSON(sampleString, 2);
      const result4 = prettyJSON(sampleString, 4);
      expect(result4.result.length).toBeGreaterThan(result2.result.length);
    });

    it('should preserve data integrity', () => {
      const result = prettyJSON(sampleString);
      const original = JSON.parse(sampleString);
      const pretty = JSON.parse(result.result);
      expect(pretty).toEqual(original);
    });

    it('should handle invalid JSON', () => {
      const result = prettyJSON('{invalid}');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle edge cases with indent 0', () => {
      const result = prettyJSON(sampleString, 0);
      expect(result.success).toBe(true);
      const parsed = JSON.parse(result.result);
      expect(parsed).toEqual(sampleJSON);
    });

    it('should handle large indent sizes', () => {
      const result = prettyJSON(sampleString, 8);
      expect(result.success).toBe(true);
      expect(result.result).toContain('        ');
    });
  });

  describe('compactJSON', () => {
    it('should compact JSON with minimal whitespace', () => {
      const result = compactJSON(prettyString);
      expect(result.success).toBe(true);
      expect(result.result).toContain('\n');
    });

    it('should preserve data integrity', () => {
      const result = compactJSON(prettyString);
      const original = JSON.parse(prettyString);
      const compact = JSON.parse(result.result);
      expect(compact).toEqual(original);
    });

    it('should be smaller than pretty but larger than minified', () => {
      const minified = minifyJSON(prettyString).result;
      const compact = compactJSON(prettyString).result;
      const pretty = prettyJSON(prettyString).result;

      expect(compact.length).toBeLessThan(pretty.length);
      expect(compact.length).toBeGreaterThanOrEqual(minified.length);
    });

    it('should handle invalid JSON', () => {
      const result = compactJSON('{invalid}');
      expect(result.success).toBe(false);
    });
  });

  describe('formatJSON', () => {
    it('should format as minify', () => {
      const result = formatJSON(prettyString, 'minify');
      expect(result.success).toBe(true);
      expect(result.result).not.toContain('\n');
    });

    it('should format as pretty', () => {
      const result = formatJSON(sampleString, 'pretty');
      expect(result.success).toBe(true);
      expect(result.result).toContain('\n');
    });

    it('should format as compact', () => {
      const result = formatJSON(prettyString, 'compact');
      expect(result.success).toBe(true);
      expect(result.result).toContain('\n');
    });

    it('should use custom indent for pretty', () => {
      const result = formatJSON(sampleString, 'pretty', 4);
      expect(result.success).toBe(true);
      expect(result.result).toContain('    ');
    });

    it('should handle invalid format option', () => {
      const result = formatJSON(sampleString, 'invalid' as any);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should default to pretty format', () => {
      const result = formatJSON(sampleString);
      expect(result.success).toBe(true);
      expect(result.result).toContain('\n');
    });
  });

  describe('getFormattingStats', () => {
    it('should calculate formatting statistics', () => {
      const stats = getFormattingStats(prettyString);
      expect(stats.original).toBeGreaterThan(0);
      expect(stats.minified).toBeGreaterThan(0);
      expect(stats.savings).toBeGreaterThan(0);
      expect(stats.savingsPercentage).toBeGreaterThan(0);
    });

    it('should show minified is smaller than original', () => {
      const stats = getFormattingStats(prettyString);
      expect(stats.minified).toBeLessThan(stats.original);
    });

    it('should calculate savings percentage correctly', () => {
      const stats = getFormattingStats(prettyString);
      const expectedPercentage = Math.round(((stats.original - stats.minified) / stats.original) * 100 * 100) / 100;
      expect(stats.savingsPercentage).toBe(expectedPercentage);
    });

    it('should handle already minified JSON', () => {
      const minified = minifyJSON(prettyString).result;
      const stats = getFormattingStats(minified);
      expect(stats.savingsPercentage).toBeLessThanOrEqual(5); // Minimal savings for already minified
    });

    it('should show correct savings calculation', () => {
      const stats = getFormattingStats(prettyString);
      expect(stats.original - stats.minified).toBe(stats.savings);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty objects', () => {
      expect(minifyJSON('{}').result).toBe('{}');
      expect(prettyJSON('{}').result).toContain('{');
    });

    it('should handle empty arrays', () => {
      expect(minifyJSON('[]').result).toBe('[]');
      expect(prettyJSON('[]').result).toContain('[');
    });

    it('should handle primitives', () => {
      const primitives = ['123', '"string"', 'true', 'false', 'null'];
      primitives.forEach((prim) => {
        expect(minifyJSON(prim).success).toBe(true);
        expect(prettyJSON(prim).success).toBe(true);
      });
    });

    it('should handle deeply nested objects', () => {
      const deep = { a: { b: { c: { d: { e: { f: 'value' } } } } } };
      const str = JSON.stringify(deep);
      const result = prettyJSON(str, 2);
      expect(result.success).toBe(true);
      expect(JSON.parse(result.result)).toEqual(deep);
    });

    it('should preserve special characters', () => {
      const withSpecial = { message: 'Hello\nWorld\t"quoted"' };
      const str = JSON.stringify(withSpecial);
      const result = minifyJSON(str);
      expect(JSON.parse(result.result)).toEqual(withSpecial);
    });
  });

  describe('Performance', () => {
    it('should handle large JSON structures', () => {
      const large = {
        items: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          name: `Item ${i}`,
          price: Math.random() * 1000,
          active: i % 2 === 0,
        })),
      };
      const str = JSON.stringify(large);
      const minified = minifyJSON(str);
      const pretty = prettyJSON(str);
      expect(minified.success).toBe(true);
      expect(pretty.success).toBe(true);
    });
  });
});
