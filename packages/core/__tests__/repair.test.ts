import { describe, it, expect } from 'vitest';
import { repairJSON, validateJSON } from '../src/repair';

describe('JSON Repair Module', () => {
  describe('repairJSON', () => {
    it('should return valid JSON unchanged', () => {
      const valid = '{"name": "Alice", "age": 30}';
      const result = repairJSON(valid);
      expect(result.success).toBe(true);
      expect(result.result).toBe(valid);
      expect(result.errors.length).toBe(0);
    });

    it('should fix single quotes to double quotes', () => {
      const input = "{'name': 'Alice', 'age': 30}";
      const result = repairJSON(input);
      expect(result.success).toBe(true);
      // Should be valid JSON after repair
      expect(() => JSON.parse(result.result)).not.toThrow();
    });

    it('should fix unquoted keys', () => {
      const input = '{name: "Alice", age: 30}';
      const result = repairJSON(input);
      expect(result.success).toBe(true);
      expect(() => JSON.parse(result.result)).not.toThrow();
    });

    it('should remove trailing commas in objects', () => {
      const input = '{"name": "Alice", "age": 30,}';
      const result = repairJSON(input);
      expect(result.success).toBe(true);
      expect(() => JSON.parse(result.result)).not.toThrow();
    });

    it('should remove trailing commas in arrays', () => {
      const input = '[1, 2, 3,]';
      const result = repairJSON(input);
      expect(result.success).toBe(true);
      expect(() => JSON.parse(result.result)).not.toThrow();
    });

    it('should auto-complete missing closing braces', () => {
      const input = '{"name": "Alice", "data": {"age": 30}';
      const result = repairJSON(input);
      expect(result.success).toBe(true);
      expect(() => JSON.parse(result.result)).not.toThrow();
    });

    it('should auto-complete missing closing brackets', () => {
      const input = '[{"name": "Alice"}, {"name": "Bob"}';
      const result = repairJSON(input);
      expect(result.success).toBe(true);
      expect(() => JSON.parse(result.result)).not.toThrow();
    });

    it('should fix mixed issues', () => {
      const input = "{name: 'Alice', age: 30,}";
      const result = repairJSON(input);
      expect(result.success).toBe(true);
      expect(() => JSON.parse(result.result)).not.toThrow();
    });

    it('should handle complex nested structures', () => {
      const input = `{
        users: [
          {name: 'Alice', email: 'alice@example.com',},
          {name: 'Bob', email: 'bob@example.com',}
        ],
      }`;
      const result = repairJSON(input);
      expect(result.success).toBe(true);
      expect(() => JSON.parse(result.result)).not.toThrow();
    });

    it('should return original if repair fails', () => {
      const invalid = '{{{[[[';
      const result = repairJSON(invalid);
      expect(result.result).toBe(invalid);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle empty objects', () => {
      const input = '{}';
      const result = repairJSON(input);
      expect(result.success).toBe(true);
      expect(result.result).toBe('{}');
    });

    it('should handle empty arrays', () => {
      const input = '[]';
      const result = repairJSON(input);
      expect(result.success).toBe(true);
      expect(result.result).toBe('[]');
    });
  });

  describe('validateJSON', () => {
    it('should validate correct JSON', () => {
      const valid = '{"name": "Alice"}';
      const result = validateJSON(valid);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject invalid JSON', () => {
      const invalid = '{name: "Alice"}';
      const result = validateJSON(invalid);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should validate arrays', () => {
      const valid = '[1, 2, 3]';
      const result = validateJSON(valid);
      expect(result.valid).toBe(true);
    });

    it('should validate primitives', () => {
      expect(validateJSON('123').valid).toBe(true);
      expect(validateJSON('"string"').valid).toBe(true);
      expect(validateJSON('true').valid).toBe(true);
      expect(validateJSON('null').valid).toBe(true);
    });

    it('should provide error message for invalid JSON', () => {
      const invalid = '{invalid}';
      const result = validateJSON(invalid);
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/Unexpected token|Expected|JSON\.parse/i);
    });
  });

  describe('Edge cases', () => {
    it('should handle JSON with special characters', () => {
      const input = '{"message": "Hello\\nWorld\\t!"}';
      const result = repairJSON(input);
      expect(result.success).toBe(true);
      expect(() => JSON.parse(result.result)).not.toThrow();
    });

    it('should handle JSON with unicode', () => {
      const input = '{"name": "José", "city": "São Paulo"}';
      const result = repairJSON(input);
      expect(result.success).toBe(true);
      const parsed = JSON.parse(result.result);
      expect(parsed.name).toBe('José');
    });

    it('should handle deeply nested structures', () => {
      const input = '{"a": {"b": {"c": {"d": {"e": "value"}';
      const result = repairJSON(input);
      expect(result.success).toBe(true);
      expect(() => JSON.parse(result.result)).not.toThrow();
    });

    it('should handle numbers correctly', () => {
      const input = '{age: 30, price: 19.99, count: -5}';
      const result = repairJSON(input);
      expect(result.success).toBe(true);
      const parsed = JSON.parse(result.result);
      expect(parsed.age).toBe(30);
      expect(parsed.price).toBe(19.99);
      expect(parsed.count).toBe(-5);
    });
  });
});
