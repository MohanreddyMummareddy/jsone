import { describe, it, expect } from 'vitest';
import { validate, inferSchema, generateValidationReport, type JsonSchema } from '../src/schema';

describe('JSON Schema Validation Module', () => {
  describe('validate', () => {
    it('should validate against simple type schema', () => {
      const json = '"hello"';
      const schema = '{"type": "string"}';
      const result = validate(json, schema);

      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should fail type validation', () => {
      const json = '123';
      const schema = '{"type": "string"}';
      const result = validate(json, schema);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].keyword).toBe('type');
    });

    it('should validate object with properties', () => {
      const json = '{"name": "John", "age": 30}';
      const schema = `{
        "type": "object",
        "properties": {
          "name": {"type": "string"},
          "age": {"type": "number"}
        }
      }`;
      const result = validate(json, schema);

      expect(result.valid).toBe(true);
    });

    it('should validate required properties', () => {
      const json = '{"name": "John"}';
      const schema = `{
        "type": "object",
        "properties": {
          "name": {"type": "string"},
          "email": {"type": "string"}
        },
        "required": ["name", "email"]
      }`;
      const result = validate(json, schema);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.keyword === 'required')).toBe(true);
    });

    it('should validate arrays', () => {
      const json = '[1, 2, 3, 4, 5]';
      const schema = `{
        "type": "array",
        "items": {"type": "number"}
      }`;
      const result = validate(json, schema);

      expect(result.valid).toBe(true);
    });

    it('should validate array minItems', () => {
      const json = '[1]';
      const schema = `{
        "type": "array",
        "items": {"type": "number"},
        "minItems": 3
      }`;
      const result = validate(json, schema);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.keyword === 'minItems')).toBe(true);
    });

    it('should validate array maxItems', () => {
      const json = '[1, 2, 3, 4, 5]';
      const schema = `{
        "type": "array",
        "items": {"type": "number"},
        "maxItems": 3
      }`;
      const result = validate(json, schema);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.keyword === 'maxItems')).toBe(true);
    });

    it('should validate string minLength', () => {
      const json = '"hi"';
      const schema = `{"type": "string", "minLength": 5}`;
      const result = validate(json, schema);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.keyword === 'minLength')).toBe(true);
    });

    it('should validate string maxLength', () => {
      const json = '"hello world"';
      const schema = `{"type": "string", "maxLength": 5}`;
      const result = validate(json, schema);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.keyword === 'maxLength')).toBe(true);
    });

    it('should validate string pattern', () => {
      const json = '"abc123"';
      const schema = `{"type": "string", "pattern": "^[0-9]+$"}`;
      const result = validate(json, schema);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.keyword === 'pattern')).toBe(true);
    });

    it('should validate matching pattern', () => {
      const json = '"12345"';
      const schema = `{"type": "string", "pattern": "^[0-9]+$"}`;
      const result = validate(json, schema);

      expect(result.valid).toBe(true);
    });

    it('should validate number minimum', () => {
      const json = '5';
      const schema = `{"type": "number", "minimum": 10}`;
      const result = validate(json, schema);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.keyword === 'minimum')).toBe(true);
    });

    it('should validate number maximum', () => {
      const json = '15';
      const schema = `{"type": "number", "maximum": 10}`;
      const result = validate(json, schema);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.keyword === 'maximum')).toBe(true);
    });

    it('should validate enum', () => {
      const json = '"red"';
      const schema = `{"type": "string", "enum": ["red", "green", "blue"]}`;
      const result = validate(json, schema);

      expect(result.valid).toBe(true);
    });

    it('should fail enum validation', () => {
      const json = '"yellow"';
      const schema = `{"type": "string", "enum": ["red", "green", "blue"]}`;
      const result = validate(json, schema);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.keyword === 'enum')).toBe(true);
    });

    it('should validate const', () => {
      const json = '"fixed"';
      const schema = `{"type": "string", "const": "fixed"}`;
      const result = validate(json, schema);

      expect(result.valid).toBe(true);
    });

    it('should validate nested objects', () => {
      const json = '{"user": {"name": "John", "profile": {"age": 30}}}';
      const schema = `{
        "type": "object",
        "properties": {
          "user": {
            "type": "object",
            "properties": {
              "name": {"type": "string"},
              "profile": {
                "type": "object",
                "properties": {
                  "age": {"type": "number"}
                }
              }
            }
          }
        }
      }`;
      const result = validate(json, schema);

      expect(result.valid).toBe(true);
    });

    it('should validate additionalProperties false', () => {
      const json = '{"name": "John", "age": 30, "city": "NYC"}';
      const schema = `{
        "type": "object",
        "properties": {
          "name": {"type": "string"},
          "age": {"type": "number"}
        },
        "additionalProperties": false
      }`;
      const result = validate(json, schema);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.keyword === 'additionalProperties')).toBe(true);
    });

    it('should validate uniqueItems', () => {
      const json = '[1, 2, 3, 2, 4]';
      const schema = `{
        "type": "array",
        "items": {"type": "number"},
        "uniqueItems": true
      }`;
      const result = validate(json, schema);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.keyword === 'uniqueItems')).toBe(true);
    });

    it('should validate multiple types', () => {
      const json = '123';
      const schema = `{"type": ["string", "number"]}`;
      const result = validate(json, schema);

      expect(result.valid).toBe(true);
    });

    it('should handle invalid JSON', () => {
      const json = 'invalid';
      const schema = '{"type": "string"}';
      const result = validate(json, schema);

      expect(result.valid).toBe(false);
      expect(result.errors[0].keyword).toBe('parse');
    });

    it('should handle invalid schema JSON', () => {
      const json = '"test"';
      const schema = 'invalid schema';
      const result = validate(json, schema);

      expect(result.valid).toBe(false);
      expect(result.errors[0].keyword).toBe('parse');
    });
  });

  describe('inferSchema', () => {
    it('should infer string schema', () => {
      const json = '"hello"';
      const result = inferSchema(json);

      expect(result.success).toBe(true);
      expect(result.schema.type).toBe('string');
    });

    it('should infer number schema', () => {
      const json = '42.5';
      const result = inferSchema(json);

      expect(result.success).toBe(true);
      expect(result.schema.type).toBe('number');
    });

    it('should infer integer schema', () => {
      const json = '42';
      const result = inferSchema(json);

      expect(result.success).toBe(true);
      expect(result.schema.type).toBe('integer');
    });

    it('should infer boolean schema', () => {
      const json = 'true';
      const result = inferSchema(json);

      expect(result.success).toBe(true);
      expect(result.schema.type).toBe('boolean');
    });

    it('should infer array schema', () => {
      const json = '[1, 2, 3]';
      const result = inferSchema(json);

      expect(result.success).toBe(true);
      expect(result.schema.type).toBe('array');
      expect(result.schema.items?.type).toBe('integer');
    });

    it('should infer object schema', () => {
      const json = '{"name": "John", "age": 30}';
      const result = inferSchema(json);

      expect(result.success).toBe(true);
      expect(result.schema.type).toBe('object');
      expect(result.schema.properties?.name.type).toBe('string');
      expect(result.schema.properties?.age.type).toBe('integer');
    });

    it('should infer required properties', () => {
      const json = '{"name": "John", "age": 30}';
      const result = inferSchema(json);

      expect(result.success).toBe(true);
      expect(result.schema.required).toContain('name');
      expect(result.schema.required).toContain('age');
    });

    it('should infer nested object schema', () => {
      const json = '{"user": {"name": "John", "email": "john@example.com"}}';
      const result = inferSchema(json);

      expect(result.success).toBe(true);
      expect(result.schema.properties?.user.type).toBe('object');
      expect(result.schema.properties?.user.properties?.name.type).toBe('string');
    });

    it('should infer array of objects schema', () => {
      const json = '[{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}]';
      const result = inferSchema(json);

      expect(result.success).toBe(true);
      expect(result.schema.type).toBe('array');
      expect(result.schema.items?.type).toBe('object');
    });

    it('should handle null values', () => {
      const json = 'null';
      const result = inferSchema(json);

      expect(result.success).toBe(true);
      expect(result.schema.type).toBe('null');
    });

    it('should handle invalid JSON gracefully', () => {
      const json = 'invalid';
      const result = inferSchema(json);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('generateValidationReport', () => {
    it('should generate report for valid data', () => {
      const json = '{"name": "John"}';
      const schema = '{"type": "object", "properties": {"name": {"type": "string"}}}';
      const result = validate(json, schema);
      const report = generateValidationReport(result);

      expect(report).toContain('Valid');
      expect(report).toContain('0');
    });

    it('should generate report for invalid data', () => {
      const json = '123';
      const schema = '{"type": "string"}';
      const result = validate(json, schema);
      const report = generateValidationReport(result);

      expect(report).toContain('Invalid');
      expect(report).toContain('type');
    });

    it('should include error details', () => {
      const json = '{"name": 123}';
      const schema = '{"type": "object", "properties": {"name": {"type": "string"}}}';
      const result = validate(json, schema);
      const report = generateValidationReport(result);

      expect(report).toContain('name');
      expect(report).toContain('Expected');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty object validation', () => {
      const json = '{}';
      const schema = '{"type": "object"}';
      const result = validate(json, schema);

      expect(result.valid).toBe(true);
    });

    it('should handle empty array validation', () => {
      const json = '[]';
      const schema = '{"type": "array"}';
      const result = validate(json, schema);

      expect(result.valid).toBe(true);
    });

    it('should handle mixed type arrays', () => {
      const json = '[1, "two", true]';
      const schema = `{
        "type": "array",
        "items": {"type": ["number", "string", "boolean"]}
      }`;
      const result = validate(json, schema);

      expect(result.valid).toBe(true);
    });

    it('should handle deeply nested structures', () => {
      const json = '{"a": {"b": {"c": {"d": "value"}}}}';
      const schema = `{
        "type": "object",
        "properties": {
          "a": {
            "type": "object",
            "properties": {
              "b": {
                "type": "object",
                "properties": {
                  "c": {
                    "type": "object",
                    "properties": {
                      "d": {"type": "string"}
                    }
                  }
                }
              }
            }
          }
        }
      }`;
      const result = validate(json, schema);

      expect(result.valid).toBe(true);
    });

    it('should handle unicode in validation', () => {
      const json = '{"name": "你好"}';
      const schema = '{"type": "object", "properties": {"name": {"type": "string"}}}';
      const result = validate(json, schema);

      expect(result.valid).toBe(true);
    });

    it('should handle large data validation', () => {
      const items = Array.from({ length: 1000 }, (_, i) => ({ id: i }));
      const json = JSON.stringify(items);
      const schema = `{
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "id": {"type": "number"}
          }
        }
      }`;
      const result = validate(json, schema);

      expect(result.valid).toBe(true);
    });

    it('should validate multiple errors', () => {
      const json = '{"name": 123, "age": "old"}';
      const schema = `{
        "type": "object",
        "properties": {
          "name": {"type": "string"},
          "age": {"type": "number"}
        }
      }`;
      const result = validate(json, schema);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBe(2);
    });
  });
});
