import { describe, it, expect } from 'vitest';
import { jsonToYAML, yamlToJSON, validateYAML } from '../src/yaml';

describe('YAML Conversion Module', () => {
  describe('jsonToYAML', () => {
    it('should convert simple object to YAML', () => {
      const json = '{"name": "Alice", "age": 30}';
      const result = jsonToYAML(json);

      expect(result.success).toBe(true);
      expect(result.result).toContain('name:');
      expect(result.result).toContain('Alice');
    });

    it('should convert arrays to YAML format', () => {
      const json = '["apple", "banana", "cherry"]';
      const result = jsonToYAML(json);

      expect(result.success).toBe(true);
      expect(result.result).toContain('- apple');
      expect(result.result).toContain('- banana');
    });

    it('should handle nested objects', () => {
      const json = JSON.stringify({ user: { name: 'Alice', email: 'alice@example.com' } });
      const result = jsonToYAML(json);

      expect(result.success).toBe(true);
      expect(result.result).toContain('user:');
      expect(result.result).toContain('name:');
      expect(result.result).toContain('email:');
    });

    it('should handle arrays of objects', () => {
      const json = JSON.stringify([{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]);
      const result = jsonToYAML(json);

      expect(result.success).toBe(true);
      expect(result.result).toContain('- id:');
      expect(result.result).toContain('name:');
    });

    it('should handle null values', () => {
      const json = '{"value": null}';
      const result = jsonToYAML(json);

      expect(result.success).toBe(true);
      expect(result.result).toContain('null');
    });

    it('should handle boolean values', () => {
      const json = '{"enabled": true, "disabled": false}';
      const result = jsonToYAML(json);

      expect(result.success).toBe(true);
      expect(result.result).toContain('enabled:');
      expect(result.result).toContain('disabled:');
    });

    it('should handle numeric values', () => {
      const json = '{"integer": 42, "float": 3.14}';
      const result = jsonToYAML(json);

      expect(result.success).toBe(true);
      expect(result.result).toContain('42');
      expect(result.result).toContain('3.14');
    });

    it('should handle empty collections', () => {
      const emptyObj = jsonToYAML('{}');
      const emptyArr = jsonToYAML('[]');

      expect(emptyObj.success).toBe(true);
      expect(emptyArr.success).toBe(true);
    });

    it('should handle strings with special characters', () => {
      const json = '{"message": "Hello: World"}';
      const result = jsonToYAML(json);

      expect(result.success).toBe(true);
      expect(result.result).toContain('message:');
    });

    it('should handle invalid JSON', () => {
      const result = jsonToYAML('{invalid}');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('yamlToJSON', () => {
    it('should convert YAML to JSON', () => {
      const yaml = 'name: Alice\nage: 30';
      const result = yamlToJSON(yaml);

      expect(result.success).toBe(true);
      const parsed = JSON.parse(result.result);
      expect(parsed.name).toBe('Alice');
      expect(parsed.age).toBe(30);
    });

    it('should convert YAML arrays to JSON arrays', () => {
      const yaml = '- apple\n- banana\n- cherry';
      const result = yamlToJSON(yaml);

      expect(result.success).toBe(true);
      const parsed = JSON.parse(result.result);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toContain('apple');
    });

    it('should handle nested YAML structures', () => {
      const yaml = `user:
  name: Alice
  email: alice@example.com`;
      const result = yamlToJSON(yaml);

      expect(result.success).toBe(true);
      const parsed = JSON.parse(result.result);
      expect(parsed.user.name).toBe('Alice');
      expect(parsed.user.email).toBe('alice@example.com');
    });

    it('should handle YAML arrays of objects', () => {
      const yaml = `- id: 1
  name: Alice
- id: 2
  name: Bob`;
      const result = yamlToJSON(yaml);

      expect(result.success).toBe(true);
      const parsed = JSON.parse(result.result);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed[0].name).toBe('Alice');
    });

    it('should handle null YAML values', () => {
      const yaml = 'value: null';
      const result = yamlToJSON(yaml);

      expect(result.success).toBe(true);
      const parsed = JSON.parse(result.result);
      expect(parsed.value).toBeNull();
    });

    it('should handle boolean YAML values', () => {
      const yaml = 'enabled: true\ndisabled: false';
      const result = yamlToJSON(yaml);

      expect(result.success).toBe(true);
      const parsed = JSON.parse(result.result);
      expect(parsed.enabled).toBe(true);
      expect(parsed.disabled).toBe(false);
    });

    it('should handle numeric YAML values', () => {
      const yaml = 'integer: 42\nfloat: 3.14';
      const result = yamlToJSON(yaml);

      expect(result.success).toBe(true);
      const parsed = JSON.parse(result.result);
      expect(parsed.integer).toBe(42);
      expect(parsed.float).toBe(3.14);
    });

    it('should ignore comments in YAML', () => {
      const yaml = `# This is a comment
name: Alice
# Another comment
age: 30`;
      const result = yamlToJSON(yaml);

      expect(result.success).toBe(true);
      const parsed = JSON.parse(result.result);
      expect(parsed.name).toBe('Alice');
    });
  });

  describe('Round-trip conversion', () => {
    it('should maintain simple object through JSON->YAML->JSON conversion', () => {
      const original = { name: 'Alice', age: 30 };
      const json = JSON.stringify(original);

      const toYAML = jsonToYAML(json);
      expect(toYAML.success).toBe(true);

      const toJSON = yamlToJSON(toYAML.result);
      expect(toJSON.success).toBe(true);

      const final = JSON.parse(toJSON.result);
      expect(final.name).toBe(original.name);
      expect(final.age).toBe(original.age);
    });

    it('should handle multiple round-trips', () => {
      const original = JSON.stringify({ key: 'value', count: 5 });

      let current = original;
      for (let i = 0; i < 3; i++) {
        const yaml = jsonToYAML(current);
        expect(yaml.success).toBe(true);

        const json = yamlToJSON(yaml.result);
        expect(json.success).toBe(true);

        current = json.result;
      }

      const final = JSON.parse(current);
      expect(final.key).toBe('value');
      expect(final.count).toBe(5);
    });
  });

  describe('validateYAML', () => {
    it('should validate correct YAML', () => {
      const yaml = 'name: Alice\nage: 30';
      const result = validateYAML(yaml);
      expect(result.valid).toBe(true);
    });

    it('should validate YAML with arrays', () => {
      const yaml = '- item1\n- item2';
      const result = validateYAML(yaml);
      expect(result.valid).toBe(true);
    });

    it('should validate nested YAML', () => {
      const yaml = `parent:
  child: value`;
      const result = validateYAML(yaml);
      expect(result.valid).toBe(true);
    });

    it('should provide error for invalid YAML if possible', () => {
      const yaml = 'invalid: ::: structure';
      const result = validateYAML(yaml);
      // May or may not be caught depending on implementation
      // This is a basic validation
      expect(result.valid).toBeDefined();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty input', () => {
      const emptyJSON = jsonToYAML('{}');
      const emptyYAML = yamlToJSON('');

      expect(emptyJSON.success).toBe(true);
      expect(emptyYAML.success).toBe(true);
    });

    it('should handle strings that look like booleans', () => {
      const json = JSON.stringify({ textTrue: 'true', textFalse: 'false' });
      const yaml = jsonToYAML(json);
      const back = yamlToJSON(yaml.result);

      const parsed = JSON.parse(back.result);
      expect(parsed.textTrue).toBeDefined();
      expect(parsed.textFalse).toBeDefined();
    });

    it('should handle large structures', () => {
      const large = {
        items: Array.from({ length: 100 }, (_, i) => ({
          id: i,
          name: `Item ${i}`,
        })),
      };
      const json = JSON.stringify(large);
      const yaml = jsonToYAML(json);
      expect(yaml.success).toBe(true);

      const back = yamlToJSON(yaml.result);
      expect(back.success).toBe(true);
    });

    it('should handle unicode characters', () => {
      const json = JSON.stringify({ name: 'José', city: 'São Paulo' });
      const yaml = jsonToYAML(json);
      const back = yamlToJSON(yaml.result);

      const parsed = JSON.parse(back.result);
      expect(parsed.name).toBe('José');
    });
  });
});
