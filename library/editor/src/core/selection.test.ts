/**
 * Selection System Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Range, Selection, SelectionManager } from './selection';

describe('Range', () => {
  describe('constructor', () => {
    it('should create range with valid values', () => {
      const range = new Range(5, 10);
      expect(range.index).toBe(5);
      expect(range.length).toBe(10);
    });

    it('should handle negative index', () => {
      const range = new Range(-5, 10);
      expect(range.index).toBe(0);
      expect(range.length).toBe(10);
    });

    it('should handle negative length', () => {
      const range = new Range(5, -10);
      expect(range.index).toBe(5);
      expect(range.length).toBe(0);
    });

    it('should default length to 0', () => {
      const range = new Range(5);
      expect(range.index).toBe(5);
      expect(range.length).toBe(0);
    });
  });

  describe('isCollapsed', () => {
    it('should return true for zero length', () => {
      const range = new Range(5, 0);
      expect(range.isCollapsed()).toBe(true);
    });

    it('should return false for non-zero length', () => {
      const range = new Range(5, 10);
      expect(range.isCollapsed()).toBe(false);
    });
  });

  describe('getEnd', () => {
    it('should return correct end index', () => {
      const range = new Range(5, 10);
      expect(range.getEnd()).toBe(15);
    });

    it('should handle zero length', () => {
      const range = new Range(5, 0);
      expect(range.getEnd()).toBe(5);
    });
  });

  describe('contains', () => {
    it('should return true for index within range', () => {
      const range = new Range(5, 10);
      expect(range.contains(7)).toBe(true);
      expect(range.contains(5)).toBe(true);
      expect(range.contains(14)).toBe(true);
    });

    it('should return false for index outside range', () => {
      const range = new Range(5, 10);
      expect(range.contains(4)).toBe(false);
      expect(range.contains(15)).toBe(false);
    });

    it('should handle collapsed range', () => {
      const range = new Range(5, 0);
      expect(range.contains(5)).toBe(false);
      expect(range.contains(4)).toBe(false);
    });
  });

  describe('intersects', () => {
    it('should return true for overlapping ranges', () => {
      const range1 = new Range(5, 10);
      const range2 = new Range(10, 5);
      expect(range1.intersects(range2)).toBe(true);
    });

    it('should return false for non-overlapping ranges', () => {
      const range1 = new Range(5, 5);
      const range2 = new Range(15, 5);
      expect(range1.intersects(range2)).toBe(false);
    });

    it('should handle adjacent ranges', () => {
      const range1 = new Range(5, 5);
      const range2 = new Range(10, 5);
      expect(range1.intersects(range2)).toBe(false);
    });
  });

  describe('equals', () => {
    it('should return true for equal ranges', () => {
      const range1 = new Range(5, 10);
      const range2 = new Range(5, 10);
      expect(range1.equals(range2)).toBe(true);
    });

    it('should return false for different ranges', () => {
      const range1 = new Range(5, 10);
      const range2 = new Range(5, 5);
      expect(range1.equals(range2)).toBe(false);
    });

    it('should handle null range', () => {
      const range = new Range(5, 10);
      expect(range.equals(null)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return string representation', () => {
      const range = new Range(5, 10);
      expect(range.toString()).toBe('Range(5, 10)');
    });
  });
});

describe('Selection', () => {
  describe('constructor', () => {
    it('should create selection with range', () => {
      const range = new Range(5, 10);
      const selection = new Selection(range, 'user');
      expect(selection.range).toBe(range);
      expect(selection.source).toBe('user');
    });

    it('should create selection without range', () => {
      const selection = new Selection();
      expect(selection.range).toBeNull();
      expect(selection.source).toBe('api');
    });
  });

  describe('setRange', () => {
    it('should set range and emit event', (done) => {
      const selection = new Selection();
      const range = new Range(5, 10);

      selection.on('selection-change', ({ selection: sel, source }) => {
        expect(sel.range).toBe(range);
        expect(source).toBe('user');
        done();
      });

      selection.setRange(range, 'user');
    });

    it('should handle null range', (done) => {
      const range = new Range(5, 10);
      const selection = new Selection(range);

      selection.on('selection-change', ({ selection: sel }) => {
        expect(sel.range).toBeNull();
        done();
      });

      selection.setRange(null);
    });
  });

  describe('getRange', () => {
    it('should return current range', () => {
      const range = new Range(5, 10);
      const selection = new Selection(range);
      expect(selection.getRange()).toBe(range);
    });
  });

  describe('isCollapsed', () => {
    it('should return true for collapsed selection', () => {
      const range = new Range(5, 0);
      const selection = new Selection(range);
      expect(selection.isCollapsed()).toBe(true);
    });

    it('should return false for non-collapsed selection', () => {
      const range = new Range(5, 10);
      const selection = new Selection(range);
      expect(selection.isCollapsed()).toBe(false);
    });

    it('should return true for null range', () => {
      const selection = new Selection();
      expect(selection.isCollapsed()).toBe(true);
    });
  });

  describe('clone', () => {
    it('should create deep copy', () => {
      const range = new Range(5, 10);
      const selection = new Selection(range, 'user');
      const clone = selection.clone();

      expect(clone).not.toBe(selection);
      expect(clone.range).not.toBe(range);
      expect(clone.range?.index).toBe(5);
      expect(clone.range?.length).toBe(10);
      expect(clone.source).toBe('user');
    });

    it('should handle null range', () => {
      const selection = new Selection();
      const clone = selection.clone();

      expect(clone.range).toBeNull();
    });
  });
});

describe('SelectionManager', () => {
  let container: HTMLElement;
  let manager: SelectionManager;

  beforeEach(() => {
    container = document.createElement('div');
    container.contentEditable = 'true';
    document.body.appendChild(container);

    manager = new SelectionManager(container);
  });

  afterEach(() => {
    manager.destroy();
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('initialization', () => {
    it('should create manager with container', () => {
      expect(manager).toBeDefined();
      expect(manager.getContainer()).toBe(container);
    });
  });

  describe('selection management', () => {
    it('should set and get selection', () => {
      const range = new Range(5, 10);
      manager.setSelection(range, 'api');

      const selection = manager.getSelection();
      expect(selection?.range?.index).toBe(5);
      expect(selection?.range?.length).toBe(10);
    });

    it('should handle null selection', () => {
      manager.setSelection(null, 'api');
      const selection = manager.getSelection();
      expect(selection?.range).toBeNull();
    });

    it('should emit selection-change events', (done) => {
      manager.on('selection-change', ({ selection, source }) => {
        expect(selection.range?.index).toBe(5);
        expect(source).toBe('user');
        done();
      });

      const range = new Range(5, 10);
      manager.setSelection(range, 'user');
    });
  });

  describe('DOM integration', () => {
    it('should update DOM selection', () => {
      // Mock window.getSelection
      const mockSelection = {
        rangeCount: 0,
        removeAllRanges: vi.fn(),
        addRange: vi.fn(),
        getRangeAt: vi.fn()
      };
      
      Object.defineProperty(window, 'getSelection', {
        writable: true,
        value: () => mockSelection
      });

      const range = new Range(0, 5);
      manager.setSelection(range, 'api');

      expect(mockSelection.removeAllRanges).toHaveBeenCalled();
    });

    it('should handle selection from DOM', () => {
      // Create text content
      container.textContent = 'Hello World';
      
      // Mock DOM selection
      const mockRange = {
        startOffset: 0,
        endOffset: 5,
        startContainer: container.firstChild,
        endContainer: container.firstChild
      };

      const mockSelection = {
        rangeCount: 1,
        getRangeAt: () => mockRange
      };

      Object.defineProperty(window, 'getSelection', {
        writable: true,
        value: () => mockSelection
      });

      // Simulate selection change
      container.dispatchEvent(new Event('selectionchange'));
    });
  });

  describe('focus management', () => {
    it('should handle focus events', () => {
      const focusSpy = vi.spyOn(container, 'focus');
      manager.focus();
      expect(focusSpy).toHaveBeenCalled();
    });

    it('should handle blur events', () => {
      const blurSpy = vi.spyOn(container, 'blur');
      manager.blur();
      expect(blurSpy).toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    it('should destroy manager properly', () => {
      const removeEventListenerSpy = vi.spyOn(container, 'removeEventListener');
      
      manager.destroy();
      expect(removeEventListenerSpy).toHaveBeenCalled();
    });
  });
});
