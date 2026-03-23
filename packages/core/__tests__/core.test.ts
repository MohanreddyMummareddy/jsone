import { describe, it, expect } from 'vitest';
import {
  isPlainObject,
  parseJsone,
  resolveSource,
  flattenRow,
  inferArrayOfObjects,
  inferColumns,
  tableFromJsone,
} from '../src/index';

describe('@jsone/core', () => {
  describe('isPlainObject', () => {
    it('should return true for plain objects', () => {
      expect(isPlainObject({})).toBe(true);
      expect(isPlainObject({ a: 1 })).toBe(true);
    });

    it('should return false for arrays', () => {
      expect(isPlainObject([])).toBe(false);
      expect(isPlainObject([1, 2, 3])).toBe(false);
    });

    it('should return false for null', () => {
      expect(isPlainObject(null)).toBe(false);
    });

    it('should return false for primitives', () => {
      expect(isPlainObject('string')).toBe(false);
      expect(isPlainObject(123)).toBe(false);
      expect(isPlainObject(true)).toBe(false);
    });
  });

  describe('parseJsone', () => {
    it('should parse JSON string', () => {
      const result = parseJsone('[1, 2, 3]');
      expect(result.data).toEqual([1, 2, 3]);
    });

    it('should extract $meta from object', () => {
      const result = parseJsone({
        $meta: { title: 'Test' },
        items: [1, 2],
      });
      expect(result.meta?.title).toBe('Test');
      expect(result.data.items).toEqual([1, 2]);
    });

    it('should handle plain data without meta', () => {
      const result = parseJsone({ a: 1, b: 2 });
      expect(result.meta).toBeUndefined();
      expect(result.data).toEqual({ a: 1, b: 2 });
    });

    it('should throw on invalid JSON', () => {
      expect(() => parseJsone('invalid json')).toThrow();
    });
  });

  describe('resolveSource', () => {
    it('should return root when no source provided', () => {
      const data = { a: 1 };
      expect(resolveSource(data)).toBe(data);
    });

    it('should resolve nested path', () => {
      const data = { a: { b: { c: 42 } } };
      expect(resolveSource(data, 'a/b/c')).toBe(42);
    });

    it('should handle leading slash', () => {
      const data = { a: { b: 10 } };
      expect(resolveSource(data, '/a/b')).toBe(10);
    });

    it('should return undefined for invalid path', () => {
      const data = { a: { b: 1 } };
      expect(resolveSource(data, 'a/x/y')).toBeUndefined();
    });
  });

  describe('flattenRow', () => {
    it('should flatten nested objects to dot notation', () => {
      const row = {
        id: 1,
        user: {
          name: 'Alice',
          profile: { city: 'NYC' },
        },
      };
      const result = flattenRow(row);
      expect(result['id']).toBe(1);
      expect(result['user.name']).toBe('Alice');
      expect(result['user.profile.city']).toBe('NYC');
    });

    it('should not descend into arrays', () => {
      const row = {
        id: 1,
        tags: ['a', 'b'],
      };
      const result = flattenRow(row);
      expect(result['id']).toBe(1);
      expect(result['tags']).toEqual(['a', 'b']);
    });

    it('should handle prefix parameter', () => {
      const row = { name: 'Bob' };
      const result = flattenRow(row, 'root');
      expect(result['root.name']).toBe('Bob');
    });
  });

  describe('inferArrayOfObjects', () => {
    it('should find array of plain objects', () => {
      const root = [{ id: 1 }, { id: 2 }];
      const result = inferArrayOfObjects(root);
      expect(result).toEqual(root);
    });

    it('should search nested structures', () => {
      const root = {
        data: {
          items: [{ id: 1 }, { id: 2 }],
        },
      };
      const result = inferArrayOfObjects(root);
      expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it('should return null if no array of objects found', () => {
      const root = [1, 2, 3];
      expect(inferArrayOfObjects(root)).toBeNull();
    });

    it('should return first array of objects', () => {
      const root = {
        first: [{ id: 1 }],
        second: [{ id: 999 }],
      };
      const result = inferArrayOfObjects(root);
      expect(result?.[0].id).toBe(1);
    });
  });

  describe('inferColumns', () => {
    it('should infer number type', () => {
      const rows = [{ count: 10 }, { count: 20 }];
      const columns = inferColumns(rows);
      expect(columns[0]?.type).toBe('number');
    });

    it('should infer boolean type', () => {
      const rows = [{ active: true }, { active: false }];
      const columns = inferColumns(rows);
      expect(columns[0]?.type).toBe('boolean');
    });

    it('should infer date type for ISO 8601 strings', () => {
      const rows = [
        { createdAt: '2026-03-01T10:15:00Z' },
        { createdAt: '2026-03-02T10:15:00Z' },
      ];
      const columns = inferColumns(rows);
      expect(columns[0]?.type).toBe('date');
    });

    it('should use auto type as fallback', () => {
      const rows = [{ mixed: 'a' }, { mixed: 1 }];
      const columns = inferColumns(rows);
      expect(columns[0]?.type).toBe('auto');
    });

    it('should extract label from dot notation key', () => {
      const rows = [{ 'user.name': 'Alice' }];
      const columns = inferColumns(rows);
      expect(columns[0]?.label).toBe('name');
    });
  });

  describe('tableFromJsone', () => {
    it('should generate table from simple array', () => {
      const data = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
      const result = tableFromJsone(data);
      expect(result.rows).toHaveLength(2);
      expect(result.columns).toHaveLength(2);
      expect(result.columns[0]?.key).toBe('id');
      expect(result.columns[0]?.type).toBe('number');
    });

    it('should handle jsone with $meta wrapper', () => {
      const data = {
        $meta: { title: 'Users' },
        data: [{ id: 1 }],
      };
      const result = tableFromJsone(data);
      expect(result.rows).toHaveLength(1);
    });

    it('should flatten nested objects in rows', () => {
      const data = [{ id: 1, user: { name: 'Alice' } }];
      const result = tableFromJsone(data);
      expect(result.rows[0]?.['user.name']).toBe('Alice');
    });

    it('should return empty table for non-array data', () => {
      const data = { id: 1 };
      const result = tableFromJsone(data);
      expect(result.rows).toHaveLength(0);
      expect(result.columns).toHaveLength(0);
    });

    it('should use view source if viewId provided', () => {
      const data = {
        $meta: {
          views: [
            {
              id: 'orders',
              source: 'order-list',
            },
          ],
        },
        'order-list': [{ orderId: '001', amount: 100 }],
      };
      const result = tableFromJsone(data, 'orders');
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0]?.orderId).toBe('001');
    });

    it('should handle deeply nested data in objects', () => {
      const data = {
        items: [{ id: 1, details: { name: 'Item1' } }],
      };
      const result = tableFromJsone(data);
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0]?.['details.name']).toBe('Item1');
    });
  });

  describe('Integration: users.jsone example', () => {
    it('should handle users example', () => {
      const data = {
        $meta: { title: 'Users' },
        data: [
          {
            id: 1,
            name: 'Ravi',
            email: 'ravi@example.com',
            profile: { role: 'Admin', city: 'Chennai' },
            skills: ['Python', 'FastAPI', 'GenAI'],
            createdAt: '2026-03-01T10:15:00Z',
          },
          {
            id: 2,
            name: 'Anita',
            email: 'anita@example.com',
            profile: { role: 'User', city: 'Bangalore' },
            skills: ['React', 'TypeScript'],
            createdAt: '2026-03-05T14:40:00Z',
          },
        ],
      };

      const parsed = parseJsone(data);
      expect(parsed.meta?.title).toBe('Users');

      const table = tableFromJsone(data);
      expect(table.rows).toHaveLength(2);
      expect(table.rows[0]?.id).toBe(1);
      expect(table.rows[0]?.['profile.role']).toBe('Admin');
      expect(table.rows[0]?.skills).toEqual(['Python', 'FastAPI', 'GenAI']);

      // Check date column type inference
      const createdAtCol = table.columns.find((c) => c.key === 'createdAt');
      expect(createdAtCol?.type).toBe('date');
    });

    it('should handle orders example', () => {
      const data = {
        $meta: { title: 'Orders' },
        data: {
          orders: [
            {
              orderId: 'ORD-1001',
              customer: { id: 1, name: 'Ravi' },
              items: [
                { sku: 'SKU-1', qty: 2, price: 3000 },
                { sku: 'SKU-2', qty: 1, price: 6500 },
              ],
              total: { amount: 12500, currency: 'INR' },
              status: 'PAID',
              createdAt: '2026-03-10T09:00:00Z',
            },
          ],
        },
      };

      const table = tableFromJsone(data);
      expect(table.rows).toHaveLength(1);
      expect(table.rows[0]?.orderId).toBe('ORD-1001');
      expect(table.rows[0]?.['customer.name']).toBe('Ravi');
      expect(table.rows[0]?.['total.amount']).toBe(12500);
      // Items is an array, should remain as array
      expect(Array.isArray(table.rows[0]?.items)).toBe(true);
    });
  });
});
