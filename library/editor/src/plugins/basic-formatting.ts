/**
 * Basic Formatting Plugin
 * 
 * Provides basic text formatting functionality (bold, italic, underline, etc.).
 */

import type { Editor, Command, Format } from '@/types';
import { BasePlugin } from './base-plugin';
import { logger } from '@/utils/logger';

/**
 * Basic formatting plugin
 */
export class BasicFormattingPlugin extends BasePlugin {
  readonly name = 'basic-formatting';
  readonly version = '1.0.0';

  constructor() {
    super();
    this.logger = logger.child(this.name);
  }

  override readonly commands: Record<string, Command> = {
    bold: {
      name: 'bold',
      execute: (editor: Editor, value = true) => {
        const selection = editor.getSelection();
        if (selection?.range) {
          editor.formatText(selection.range.index, selection.range.length, 'bold', value);
        }
        return { format: 'bold', value };
      },
      canExecute: (editor: Editor) => {
        const selection = editor.getSelection();
        return Boolean(selection?.range && selection.range.length > 0);
      },
    },

    italic: {
      name: 'italic',
      execute: (editor: Editor, value = true) => {
        const selection = editor.getSelection();
        if (selection?.range) {
          editor.formatText(selection.range.index, selection.range.length, 'italic', value);
        }
        return { format: 'italic', value };
      },
      canExecute: (editor: Editor) => {
        const selection = editor.getSelection();
        return Boolean(selection?.range && selection.range.length > 0);
      },
    },

    underline: {
      name: 'underline',
      execute: (editor: Editor, value = true) => {
        const selection = editor.getSelection();
        if (selection?.range) {
          editor.formatText(selection.range.index, selection.range.length, 'underline', value);
        }
        return { format: 'underline', value };
      },
      canExecute: (editor: Editor) => {
        const selection = editor.getSelection();
        return Boolean(selection?.range && selection.range.length > 0);
      },
    },

    strike: {
      name: 'strike',
      execute: (editor: Editor, value = true) => {
        const selection = editor.getSelection();
        if (selection?.range) {
          editor.formatText(selection.range.index, selection.range.length, 'strike', value);
        }
        return { format: 'strike', value };
      },
      canExecute: (editor: Editor) => {
        const selection = editor.getSelection();
        return Boolean(selection?.range && selection.range.length > 0);
      },
    },

    color: {
      name: 'color',
      execute: (editor: Editor, value: string) => {
        const selection = editor.getSelection();
        if (selection?.range) {
          editor.formatText(selection.range.index, selection.range.length, 'color', value);
        }
        return { format: 'color', value };
      },
      canExecute: (editor: Editor, value: string) => {
        const selection = editor.getSelection();
        return Boolean(selection?.range && selection.range.length > 0 && typeof value === 'string');
      },
    },

    background: {
      name: 'background',
      execute: (editor: Editor, value: string) => {
        const selection = editor.getSelection();
        if (selection?.range) {
          editor.formatText(selection.range.index, selection.range.length, 'background', value);
        }
        return { format: 'background', value };
      },
      canExecute: (editor: Editor, value: string) => {
        const selection = editor.getSelection();
        return Boolean(selection?.range && selection.range.length > 0 && typeof value === 'string');
      },
    },

    font: {
      name: 'font',
      execute: (editor: Editor, value: string) => {
        const selection = editor.getSelection();
        if (selection?.range) {
          editor.formatText(selection.range.index, selection.range.length, 'font', value);
        }
        return { format: 'font', value };
      },
      canExecute: (editor: Editor, value: string) => {
        const selection = editor.getSelection();
        return Boolean(selection?.range && selection.range.length > 0 && typeof value === 'string');
      },
    },

    size: {
      name: 'size',
      execute: (editor: Editor, value: string) => {
        const selection = editor.getSelection();
        if (selection?.range) {
          editor.formatText(selection.range.index, selection.range.length, 'size', value);
        }
        return { format: 'size', value };
      },
      canExecute: (editor: Editor, value: string) => {
        const selection = editor.getSelection();
        return Boolean(selection?.range && selection.range.length > 0 && typeof value === 'string');
      },
    },
  };

  override readonly formats: Record<string, Format> = {
    bold: {
      name: 'bold',
      type: 'inline',
      apply: (editor: Editor, range, value) => {
        editor.formatText(range.index, range.length, 'bold', value);
      },
      remove: (editor: Editor, range) => {
        editor.formatText(range.index, range.length, 'bold', false);
      },
      getValue: (editor: Editor, range) => {
        const format = editor.getFormat(range);
        return format.bold || false;
      },
    },

    italic: {
      name: 'italic',
      type: 'inline',
      apply: (editor: Editor, range, value) => {
        editor.formatText(range.index, range.length, 'italic', value);
      },
      remove: (editor: Editor, range) => {
        editor.formatText(range.index, range.length, 'italic', false);
      },
      getValue: (editor: Editor, range) => {
        const format = editor.getFormat(range);
        return format.italic || false;
      },
    },

    underline: {
      name: 'underline',
      type: 'inline',
      apply: (editor: Editor, range, value) => {
        editor.formatText(range.index, range.length, 'underline', value);
      },
      remove: (editor: Editor, range) => {
        editor.formatText(range.index, range.length, 'underline', false);
      },
      getValue: (editor: Editor, range) => {
        const format = editor.getFormat(range);
        return format.underline || false;
      },
    },

    strike: {
      name: 'strike',
      type: 'inline',
      apply: (editor: Editor, range, value) => {
        editor.formatText(range.index, range.length, 'strike', value);
      },
      remove: (editor: Editor, range) => {
        editor.formatText(range.index, range.length, 'strike', false);
      },
      getValue: (editor: Editor, range) => {
        const format = editor.getFormat(range);
        return format.strike || false;
      },
    },

    color: {
      name: 'color',
      type: 'inline',
      apply: (editor: Editor, range, value) => {
        editor.formatText(range.index, range.length, 'color', value);
      },
      remove: (editor: Editor, range) => {
        editor.formatText(range.index, range.length, 'color', null);
      },
      getValue: (editor: Editor, range) => {
        const format = editor.getFormat(range);
        return format.color || null;
      },
    },

    background: {
      name: 'background',
      type: 'inline',
      apply: (editor: Editor, range, value) => {
        editor.formatText(range.index, range.length, 'background', value);
      },
      remove: (editor: Editor, range) => {
        editor.formatText(range.index, range.length, 'background', null);
      },
      getValue: (editor: Editor, range) => {
        const format = editor.getFormat(range);
        return format.background || null;
      },
    },

    font: {
      name: 'font',
      type: 'inline',
      apply: (editor: Editor, range, value) => {
        editor.formatText(range.index, range.length, 'font', value);
      },
      remove: (editor: Editor, range) => {
        editor.formatText(range.index, range.length, 'font', null);
      },
      getValue: (editor: Editor, range) => {
        const format = editor.getFormat(range);
        return format.font || null;
      },
    },

    size: {
      name: 'size',
      type: 'inline',
      apply: (editor: Editor, range, value) => {
        editor.formatText(range.index, range.length, 'size', value);
      },
      remove: (editor: Editor, range) => {
        editor.formatText(range.index, range.length, 'size', null);
      },
      getValue: (editor: Editor, range) => {
        const format = editor.getFormat(range);
        return format.size || null;
      },
    },
  };

  protected async onInstall(editor: Editor): Promise<void> {
    this.logger.info('Installing basic formatting plugin');
    
    // Add keyboard shortcuts
    this.setupKeyboardShortcuts(editor);
    
    // Add CSS styles
    this.addStyles();
  }

  protected async onUninstall(_editor: Editor): Promise<void> {
    this.logger.info('Uninstalling basic formatting plugin');
    
    // Clean up event listeners
    this.cleanupEventListeners();
    
    // Remove CSS styles
    this.removeStyles();
  }

  /**
   * Setup keyboard shortcuts
   */
  private setupKeyboardShortcuts(editor: Editor): void {
    const root = editor.getRoot();
    
    this.addEventListener(root, 'keydown', (event) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case 'b':
            event.preventDefault();
            this.commands.bold.execute(editor);
            break;
          case 'i':
            event.preventDefault();
            this.commands.italic.execute(editor);
            break;
          case 'u':
            event.preventDefault();
            this.commands.underline.execute(editor);
            break;
        }
      }
    });
  }

  /**
   * Add CSS styles for formatting
   */
  private addStyles(): void {
    const styleId = `${this.name}-styles`;
    
    if (document.getElementById(styleId)) {
      return; // Styles already added
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .enhanced-rich-editor__content strong,
      .enhanced-rich-editor__content [data-format="bold"] {
        font-weight: bold;
      }
      
      .enhanced-rich-editor__content em,
      .enhanced-rich-editor__content [data-format="italic"] {
        font-style: italic;
      }
      
      .enhanced-rich-editor__content u,
      .enhanced-rich-editor__content [data-format="underline"] {
        text-decoration: underline;
      }
      
      .enhanced-rich-editor__content s,
      .enhanced-rich-editor__content [data-format="strike"] {
        text-decoration: line-through;
      }
    `;
    
    document.head.appendChild(style);
  }

  /**
   * Remove CSS styles
   */
  private removeStyles(): void {
    const styleId = `${this.name}-styles`;
    const style = document.getElementById(styleId);
    if (style) {
      style.remove();
    }
  }
}
