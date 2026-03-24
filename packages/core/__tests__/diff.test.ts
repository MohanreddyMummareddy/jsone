import { describe, it, expect } from 'vitest';
import { diffJSON, generateDiffReport } from '../src/diff';

describe('JSON Diff Module', () => {
  describe('diffJSON', () => {
    it('should detect added keys', () => {
      const old = '{"a": 1}';
      const updated = '{"a": 1, "b": 2}';
      const result = diffJSON(old, updated);

      expect(result.success).toBe(true);
      expect(result.diff?.added).toHaveLength(1);
      expect(result.diff?.added[0].path).toBe('b');
      expect(result.diff?.added[0].newValue).toBe(2);
    });

    it('should detect removed keys', () => {
      const old = '{"a": 1, "b": 2}';
      const updated = '{"a": 1}';
      const result = diffJSON(old, updated);

      expect(result.success).toBe(true);
      expect(result.diff?.removed).toHaveLength(1);
      expect(result.diff?.removed[0].path).toBe('b');
      expect(result.diff?.removed[0].oldValue).toBe(2);
    });

    it('should detect modified values', () => {
      const old = '{"name": "Alice"}';
      const updated = '{"name": "Bob"}';
      const result = diffJSON(old, updated);

      expect(result.success).toBe(true);
      expect(result.diff?.modified).toHaveLength(1);
      expect(result.diff?.modified[0].path).toBe('name');
      expect(result.diff?.modified[0].oldValue).toBe('Alice');
      expect(result.diff?.modified[0].newValue).toBe('Bob');
    });

    it('should detect changes in nested objects', () => {
      const old = '{"user": {"name": "Alice", "age": 30}}';
      const updated = '{"user": {"name": "Alice", "age": 31}}';
      const result = diffJSON(old, updated);

      expect(result.success).toBe(true);
      expect(result.diff?.modified).toHaveLength(1);
      expect(result.diff?.modified[0].path).toBe('user.age');
    });

    it('should detect changes in arrays', () => {
      const old = '[1, 2, 3]';
      const updated = '[1, 2, 4]';
      const result = diffJSON(old, updated);

      expect(result.success).toBe(true);
      expect(result.diff?.modified).toHaveLength(1);
      expect(result.diff?.modified[0].path).toBe('[2]');
    });

    it('should detect array additions', () => {
      const old = '[1, 2]';
      const updated = '[1, 2, 3]';
      const result = diffJSON(old, updated);

      expect(result.success).toBe(true);
      expect(result.diff?.added).toHaveLength(1);
      expect(result.diff?.added[0].path).toBe('[2]');
    });

    it('should detect array removals', () => {
      const old = '[1, 2, 3]';
      const updated = '[1, 2]';
      const result = diffJSON(old, updated);

      expect(result.success).toBe(true);
      expect(result.diff?.removed).toHaveLength(1);
      expect(result.diff?.removed[0].path).toBe('[2]');
    });

    it('should handle complex nested changes', () => {
      const old = JSON.stringify({
        users: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }],
        meta: { count: 2 },
      });
      const updated = JSON.stringify({
        users: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }, { id: 3, name: 'Charlie' }],
        meta: { count: 3 },
      });

      const result = diffJSON(old, updated);
      expect(result.success).toBe(true);
      expect(result.diff?.added.length).toBeGreaterThan(0);
      expect(result.diff?.modified.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty object to object transitions', () => {
      const old = '{}';
      const updated = '{"key": "value"}';
      const result = diffJSON(old, updated);

      expect(result.success).toBe(true);
      expect(result.diff?.added).toHaveLength(1);
    });

    it('should provide summary statistics', () => {
      const old = '{"a": 1, "b": 2}';
      const updated = '{"a": 10, "c": 3}';
      const result = diffJSON(old, updated);

      expect(result.diff?.summary).toBeDefined();
      expect(result.diff?.summary.total).toBeGreaterThan(0);
      expect(result.diff?.summary.added + result.diff?.summary.removed + result.diff?.summary.modified).toBe(
        result.diff?.summary.total
      );
    });

    it('should handle invalid JSON in first argument', () => {
      const old = '{invalid}';
      const updated = '{"valid": true}';
      const result = diffJSON(old, updated);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle invalid JSON in second argument', () => {
      const old = '{"valid": true}';
      const updated = '{invalid}';
      const result = diffJSON(old, updated);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should detect no changes for identical objects', () => {
      const json = '{"name": "Alice", "age": 30}';
      const result = diffJSON(json, json);

      expect(result.success).toBe(true);
      expect(result.diff?.added).toHaveLength(0);
      expect(result.diff?.removed).toHaveLength(0);
      expect(result.diff?.modified).toHaveLength(0);
    });
  });

  describe('generateDiffReport', () => {
    it('should generate readable diff report', () => {
      const old = '{"a": 1}';
      const updated = '{"a": 10, "b": 2}';
      const diffResult = diffJSON(old, updated);
      const report = generateDiffReport(diffResult.diff!);

      expect(report).toContain('JSON Diff Report');
      expect(report).toContain('Total Changes');
      expect(report).toContain('Added');
      expect(report).toContain('Modified');
    });

    it('should include affected keys in report', () => {
      const old = '{"x": 1}';
      const updated = '{"x": 2, "y": 3}';
      const diffResult = diffJSON(old, updated);
      const report = generateDiffReport(diffResult.diff!);

      expect(report).toContain('y');
      expect(report).toContain('x');
    });

    it('should show old and new values for modified items', () => {
      const old = '{"status": "active"}';
      const updated = '{"status": "inactive"}';
      const diffResult = diffJSON(old, updated);
      const report = generateDiffReport(diffResult.diff!);

      expect(report).toContain('active');
      expect(report).toContain('inactive');
    });
  });

  describe('Edge cases', () => {
    it('should handle null values', () => {
      const old = '{"value": null}';
      const updated = '{"value": "something"}';
      const result = diffJSON(old, updated);

      expect(result.success).toBe(true);
      expect(result.diff?.modified).toHaveLength(1);
    });

    it('should handle boolean changes', () => {
      const old = '{"active": true}';
      const updated = '{"active": false}';
      const result = diffJSON(old, updated);

      expect(result.success).toBe(true);
      expect(result.diff?.modified).toHaveLength(1);
    });

    it('should handle type changes', () => {
      const old = '{"value": "123"}';
      const updated = '{"value": 123}';
      const result = diffJSON(old, updated);

      expect(result.success).toBe(true);
      expect(result.diff?.modified).toHaveLength(1);
    });

    it('should handle deeply nested structures', () => {
      const old = JSON.stringify({ a: { b: { c: { d: 1 } } } });
      const updated = JSON.stringify({ a: { b: { c: { d: 2 } } } });
      const result = diffJSON(old, updated);

      expect(result.success).toBe(true);
      expect(result.diff?.modified[0].path).toContain('d');
    });
  });
});
