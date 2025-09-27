/**
 * Enhanced Editor Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EnhancedEditor } from './editor';
import { Delta } from './delta';

// Mock DOM environment
Object.defineProperty(window, 'getSelection', {
  writable: true,
  value: vi.fn(() => ({
    rangeCount: 0,
    getRangeAt: vi.fn(),
    removeAllRanges: vi.fn(),
    addRange: vi.fn()
  }))
});

describe('EnhancedEditor', () => {
  let container: HTMLDivElement;
  let editor: EnhancedEditor;

  beforeEach(() => {
    // Create a container element
    container = document.createElement('div');
    container.style.width = '500px';
    container.style.height = '300px';
    document.body.appendChild(container);

    // Create editor instance
    editor = new EnhancedEditor(container, {
      placeholder: 'Test placeholder',
      theme: 'default'
    });
  });

  afterEach(() => {
    if (editor) {
      editor.destroy();
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('initialization', () => {
    it('should create editor with default options', () => {
      expect(editor).toBeDefined();
      expect(editor.getContainer()).toBe(container);
    });

    it('should set placeholder text', () => {
      const root = editor.getRoot();
      expect(root.getAttribute('data-placeholder')).toBe('Test placeholder');
    });

    it('should apply theme class', () => {
      expect(container.classList.contains('enhanced-rich-editor--default')).toBe(true);
    });

    it('should create toolbar when enabled', () => {
      const editorWithToolbar = new EnhancedEditor(container, {
        modules: { toolbar: true }
      });
      
      const toolbar = container.querySelector('.enhanced-rich-editor__toolbar');
      expect(toolbar).toBeTruthy();
      
      editorWithToolbar.destroy();
    });
  });

  describe('content management', () => {
    it('should set and get contents', () => {
      const delta = new Delta().insert('Hello World');
      editor.setContents(delta);
      
      const contents = editor.getContents();
      expect(contents.ops).toEqual(delta.ops);
    });

    it('should get text content', () => {
      const delta = new Delta().insert('Hello World');
      editor.setContents(delta);
      
      expect(editor.getText()).toBe('Hello World');
    });

    it('should get content length', () => {
      const delta = new Delta().insert('Hello World');
      editor.setContents(delta);
      
      expect(editor.getLength()).toBe(11); // "Hello World" length
    });

    it('should insert text at position', () => {
      editor.setContents(new Delta().insert('Hello World'));
      editor.insertText(5, ' Beautiful');
      
      expect(editor.getText()).toBe('Hello Beautiful World');
    });

    it('should delete text at position', () => {
      editor.setContents(new Delta().insert('Hello World'));
      editor.deleteText(5, 6); // Delete " World"
      
      expect(editor.getText()).toBe('Hello');
    });

    it('should format text', () => {
      editor.setContents(new Delta().insert('Hello World'));
      editor.formatText(0, 5, 'bold', true);
      
      const contents = editor.getContents();
      expect(contents.ops[0].attributes?.bold).toBe(true);
    });
  });

  describe('selection management', () => {
    it('should set and get selection', () => {
      const selection = { index: 5, length: 3 };
      editor.setSelection(selection);
      
      const currentSelection = editor.getSelection();
      expect(currentSelection?.range?.index).toBe(5);
      expect(currentSelection?.range?.length).toBe(3);
    });

    it('should handle null selection', () => {
      editor.setSelection(null);
      
      const selection = editor.getSelection();
      expect(selection?.range).toBeNull();
    });
  });

  describe('event handling', () => {
    it('should emit text-change events', (done) => {
      editor.on('text-change', ({ delta, source }) => {
        expect(delta).toBeDefined();
        expect(source).toBe('api');
        done();
      });

      editor.setContents(new Delta().insert('Test'));
    });

    it('should emit selection-change events', (done) => {
      editor.on('selection-change', ({ selection, source }) => {
        expect(selection).toBeDefined();
        expect(source).toBe('api');
        done();
      });

      editor.setSelection({ index: 0, length: 0 });
    });

    it('should emit focus events', (done) => {
      editor.on('focus', () => {
        done();
      });

      // Simulate focus
      const root = editor.getRoot();
      root.dispatchEvent(new Event('focus'));
    });

    it('should emit blur events', (done) => {
      editor.on('blur', () => {
        done();
      });

      // Simulate blur
      const root = editor.getRoot();
      root.dispatchEvent(new Event('blur'));
    });
  });

  describe('plugin management', () => {
    it('should add plugins', () => {
      const mockPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        install: vi.fn(),
        uninstall: vi.fn()
      };

      editor.addPlugin(mockPlugin);
      expect(mockPlugin.install).toHaveBeenCalledWith(editor);
    });

    it('should remove plugins', () => {
      const mockPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        install: vi.fn(),
        uninstall: vi.fn()
      };

      editor.addPlugin(mockPlugin);
      editor.removePlugin('test-plugin');
      expect(mockPlugin.uninstall).toHaveBeenCalledWith(editor);
    });

    it('should check if plugin exists', () => {
      const mockPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        install: vi.fn(),
        uninstall: vi.fn()
      };

      expect(editor.hasPlugin('test-plugin')).toBe(false);
      editor.addPlugin(mockPlugin);
      expect(editor.hasPlugin('test-plugin')).toBe(true);
    });
  });

  describe('state management', () => {
    it('should track focus state', () => {
      expect(editor.hasFocus()).toBe(false);
      
      // Simulate focus
      const root = editor.getRoot();
      root.dispatchEvent(new Event('focus'));
      expect(editor.hasFocus()).toBe(true);
      
      // Simulate blur
      root.dispatchEvent(new Event('blur'));
      expect(editor.hasFocus()).toBe(false);
    });

    it('should enable/disable editor', () => {
      expect(editor.isEnabled()).toBe(true);
      
      editor.enable(false);
      expect(editor.isEnabled()).toBe(false);
      expect(editor.getRoot().getAttribute('contenteditable')).toBe('false');
      
      editor.enable(true);
      expect(editor.isEnabled()).toBe(true);
      expect(editor.getRoot().getAttribute('contenteditable')).toBe('true');
    });
  });

  describe('history management', () => {
    it('should support undo/redo', () => {
      // Set initial content
      editor.setContents(new Delta().insert('Hello'));
      
      // Make a change
      editor.insertText(5, ' World');
      expect(editor.getText()).toBe('Hello World');
      
      // Undo
      editor.undo();
      expect(editor.getText()).toBe('Hello');
      
      // Redo
      editor.redo();
      expect(editor.getText()).toBe('Hello World');
    });
  });

  describe('cleanup', () => {
    it('should destroy editor properly', () => {
      const destroySpy = vi.spyOn(editor, 'destroy');
      
      editor.destroy();
      expect(destroySpy).toHaveBeenCalled();
      
      // Should not throw when calling methods after destroy
      expect(() => editor.getText()).not.toThrow();
    });

    it('should remove event listeners on destroy', () => {
      const removeEventListenerSpy = vi.spyOn(editor.getRoot(), 'removeEventListener');
      
      editor.destroy();
      expect(removeEventListenerSpy).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle invalid selection ranges', () => {
      expect(() => {
        editor.setSelection({ index: -1, length: 5 });
      }).not.toThrow();
    });

    it('should handle invalid text operations', () => {
      expect(() => {
        editor.insertText(-1, 'test');
      }).not.toThrow();
      
      expect(() => {
        editor.deleteText(-1, 5);
      }).not.toThrow();
    });

    it('should handle invalid format operations', () => {
      expect(() => {
        editor.formatText(-1, 5, 'bold', true);
      }).not.toThrow();
    });
  });
});
