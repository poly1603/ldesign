/**
 * Delta Tests
 * 
 * Unit tests for the Delta class.
 */

import { describe, it, expect } from 'vitest';
import { Delta } from './delta';

describe('Delta', () => {
  describe('constructor', () => {
    it('should create empty delta', () => {
      const delta = new Delta();
      expect(delta.ops).toEqual([]);
    });

    it('should create delta from ops array', () => {
      const ops = [{ insert: 'Hello' }];
      const delta = new Delta(ops);
      expect(delta.ops).toEqual(ops);
    });

    it('should create delta from another delta', () => {
      const original = new Delta([{ insert: 'Hello' }]);
      const delta = new Delta(original);
      expect(delta.ops).toEqual(original.ops);
    });
  });

  describe('insert', () => {
    it('should insert text', () => {
      const delta = new Delta().insert('Hello');
      expect(delta.ops).toEqual([{ insert: 'Hello' }]);
    });

    it('should insert text with attributes', () => {
      const delta = new Delta().insert('Hello', { bold: true });
      expect(delta.ops).toEqual([{ insert: 'Hello', attributes: { bold: true } }]);
    });

    it('should insert embed', () => {
      const delta = new Delta().insert({ image: 'url' });
      expect(delta.ops).toEqual([{ insert: { image: 'url' } }]);
    });

    it('should merge consecutive text inserts', () => {
      const delta = new Delta()
        .insert('Hello')
        .insert(' World');
      expect(delta.ops).toEqual([{ insert: 'Hello World' }]);
    });

    it('should not merge text inserts with different attributes', () => {
      const delta = new Delta()
        .insert('Hello', { bold: true })
        .insert(' World', { italic: true });
      expect(delta.ops).toEqual([
        { insert: 'Hello', attributes: { bold: true } },
        { insert: ' World', attributes: { italic: true } }
      ]);
    });
  });

  describe('delete', () => {
    it('should delete characters', () => {
      const delta = new Delta().delete(5);
      expect(delta.ops).toEqual([{ delete: 5 }]);
    });

    it('should merge consecutive deletes', () => {
      const delta = new Delta()
        .delete(3)
        .delete(2);
      expect(delta.ops).toEqual([{ delete: 5 }]);
    });

    it('should ignore zero or negative deletes', () => {
      const delta = new Delta().delete(0);
      expect(delta.ops).toEqual([]);
    });
  });

  describe('retain', () => {
    it('should retain characters', () => {
      const delta = new Delta().retain(5);
      expect(delta.ops).toEqual([{ retain: 5 }]);
    });

    it('should retain with attributes', () => {
      const delta = new Delta().retain(5, { bold: true });
      expect(delta.ops).toEqual([{ retain: 5, attributes: { bold: true } }]);
    });

    it('should merge consecutive retains with same attributes', () => {
      const delta = new Delta()
        .retain(3, { bold: true })
        .retain(2, { bold: true });
      expect(delta.ops).toEqual([{ retain: 5, attributes: { bold: true } }]);
    });

    it('should ignore zero or negative retains', () => {
      const delta = new Delta().retain(0);
      expect(delta.ops).toEqual([]);
    });
  });

  describe('length', () => {
    it('should calculate length of empty delta', () => {
      const delta = new Delta();
      expect(delta.length()).toBe(0);
    });

    it('should calculate length with text inserts', () => {
      const delta = new Delta()
        .insert('Hello')
        .insert(' World');
      expect(delta.length()).toBe(11);
    });

    it('should calculate length with embeds', () => {
      const delta = new Delta()
        .insert('Hello')
        .insert({ image: 'url' })
        .insert(' World');
      expect(delta.length()).toBe(12); // 5 + 1 + 6
    });

    it('should calculate length with retains and deletes', () => {
      const delta = new Delta()
        .retain(5)
        .delete(3)
        .insert('Hello');
      expect(delta.length()).toBe(13); // 5 + 3 + 5
    });
  });

  describe('compose', () => {
    it('should compose simple inserts', () => {
      const a = new Delta().insert('A');
      const b = new Delta().insert('B');
      const result = a.compose(b);
      expect(result.ops).toEqual([{ insert: 'AB' }]);
    });

    it('should compose insert and retain', () => {
      const a = new Delta().insert('A');
      const b = new Delta().retain(1).insert('B');
      const result = a.compose(b);
      expect(result.ops).toEqual([{ insert: 'AB' }]);
    });

    it('should compose with delete', () => {
      const a = new Delta().insert('ABC');
      const b = new Delta().retain(1).delete(1).insert('Z');
      const result = a.compose(b);
      expect(result.ops).toEqual([{ insert: 'AZC' }]);
    });
  });

  describe('transform', () => {
    it('should transform against insert', () => {
      const a = new Delta().insert('A');
      const b = new Delta().insert('B');
      const result = a.transform(b);
      expect(result.ops).toEqual([{ insert: 'B' }, { retain: 1 }]);
    });

    it('should transform against delete', () => {
      const a = new Delta().insert('A');
      const b = new Delta().delete(1);
      const result = a.transform(b);
      expect(result.ops).toEqual([{ delete: 1 }]);
    });

    it('should transform with priority', () => {
      const a = new Delta().insert('A');
      const b = new Delta().insert('B');
      const result = a.transform(b, true);
      expect(result.ops).toEqual([{ retain: 1 }, { insert: 'B' }]);
    });
  });

  describe('chop', () => {
    it('should remove trailing retain without attributes', () => {
      const delta = new Delta()
        .insert('Hello')
        .retain(5);
      const result = delta.chop();
      expect(result.ops).toEqual([{ insert: 'Hello' }]);
    });

    it('should not remove trailing retain with attributes', () => {
      const delta = new Delta()
        .insert('Hello')
        .retain(5, { bold: true });
      const result = delta.chop();
      expect(result.ops).toEqual([
        { insert: 'Hello' },
        { retain: 5, attributes: { bold: true } }
      ]);
    });
  });
});
