/**
 * List Formatting Plugin
 * 
 * Provides list formatting functionality (ordered and unordered lists).
 */

import type { Editor, Command, Format } from '@/types';
import { BasePlugin } from './base-plugin';
import { logger } from '@/utils/logger';

/**
 * List formatting plugin
 */
export class ListFormattingPlugin extends BasePlugin {
  readonly name = 'list-formatting';
  readonly version = '1.0.0';

  constructor() {
    super();
    this.logger = logger.child(this.name);
  }

  override readonly commands: Record<string, Command> = {
    'list-ordered': {
      name: 'list-ordered',
      execute: (editor: Editor) => {
        const selection = editor.getSelection();
        if (selection?.range) {
          editor.formatLine(selection.range.index, selection.range.length, 'list', 'ordered');
        }
        return { format: 'list', value: 'ordered' };
      },
      canExecute: (editor: Editor) => {
        const selection = editor.getSelection();
        return Boolean(selection?.range && selection.range.length >= 0);
      },
    },

    'list-bullet': {
      name: 'list-bullet',
      execute: (editor: Editor) => {
        const selection = editor.getSelection();
        if (selection?.range) {
          editor.formatLine(selection.range.index, selection.range.length, 'list', 'bullet');
        }
        return { format: 'list', value: 'bullet' };
      },
      canExecute: (editor: Editor) => {
        const selection = editor.getSelection();
        return Boolean(selection?.range && selection.range.length >= 0);
      },
    },

    'list-clear': {
      name: 'list-clear',
      execute: (editor: Editor) => {
        const selection = editor.getSelection();
        if (selection?.range) {
          editor.formatLine(selection.range.index, selection.range.length, 'list', false);
        }
        return { format: 'list', value: false };
      },
      canExecute: (editor: Editor) => {
        const selection = editor.getSelection();
        return Boolean(selection?.range && selection.range.length >= 0);
      },
    },

    'indent': {
      name: 'indent',
      execute: (editor: Editor) => {
        const selection = editor.getSelection();
        if (selection?.range) {
          const currentFormat = editor.getLineFormat(selection.range.index);
          const currentIndent = currentFormat.indent || 0;
          editor.formatLine(selection.range.index, selection.range.length, 'indent', currentIndent + 1);
        }
        return { format: 'indent', value: '+1' };
      },
      canExecute: (editor: Editor) => {
        const selection = editor.getSelection();
        return Boolean(selection?.range && selection.range.length >= 0);
      },
    },

    'outdent': {
      name: 'outdent',
      execute: (editor: Editor) => {
        const selection = editor.getSelection();
        if (selection?.range) {
          const currentFormat = editor.getLineFormat(selection.range.index);
          const currentIndent = currentFormat.indent || 0;
          if (currentIndent > 0) {
            editor.formatLine(selection.range.index, selection.range.length, 'indent', currentIndent - 1);
          }
        }
        return { format: 'indent', value: '-1' };
      },
      canExecute: (editor: Editor) => {
        const selection = editor.getSelection();
        if (!selection?.range) return false;
        const currentFormat = editor.getLineFormat(selection.range.index);
        return Boolean((currentFormat.indent || 0) > 0);
      },
    },
  };

  override readonly formats: Record<string, Format> = {
    list: {
      name: 'list',
      type: 'block',
      apply: (editor: Editor, range, value) => {
        editor.formatLine(range.index, range.length, 'list', value);
      },
      remove: (editor: Editor, range) => {
        editor.formatLine(range.index, range.length, 'list', false);
      },
      getValue: (editor: Editor, range) => {
        const format = editor.getLineFormat(range.index);
        return format.list || false;
      },
    },

    indent: {
      name: 'indent',
      type: 'block',
      apply: (editor: Editor, range, value) => {
        editor.formatLine(range.index, range.length, 'indent', value);
      },
      remove: (editor: Editor, range) => {
        editor.formatLine(range.index, range.length, 'indent', 0);
      },
      getValue: (editor: Editor, range) => {
        const format = editor.getLineFormat(range.index);
        return format.indent || 0;
      },
    },
  };

  protected async onInstall(editor: Editor): Promise<void> {
    this.logger.info('Installing list formatting plugin');
    
    // Add keyboard shortcuts
    this.setupKeyboardShortcuts(editor);
    
    // Add CSS styles
    this.addStyles();
  }

  protected async onUninstall(_editor: Editor): Promise<void> {
    this.logger.info('Uninstalling list formatting plugin');
    
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
          case 'l':
            event.preventDefault();
            this.commands['list-bullet'].execute(editor);
            break;
        }
      } else {
        switch (event.key) {
          case 'Tab':
            event.preventDefault();
            if (event.shiftKey) {
              this.commands['outdent'].execute(editor);
            } else {
              this.commands['indent'].execute(editor);
            }
            break;
          case 'Enter':
            this.handleEnterKey(editor, event);
            break;
        }
      }
    });
  }

  /**
   * Handle Enter key in lists
   */
  private handleEnterKey(editor: Editor, event: KeyboardEvent): void {
    const selection = editor.getSelection();
    if (!selection?.range || selection.range.length > 0) return;

    const lineFormat = editor.getLineFormat(selection.range.index);
    if (!lineFormat.list) return;

    // Check if current line is empty
    const lineText = this.getLineText(editor, selection.range.index);
    if (lineText.trim() === '') {
      // Empty list item - remove list formatting
      event.preventDefault();
      this.commands['list-clear'].execute(editor);
    } else {
      // Continue list on next line
      // Let default behavior handle the line break
      // The list formatting will be inherited
    }
  }

  /**
   * Get text content of current line
   */
  private getLineText(editor: Editor, index: number): string {
    // This is a simplified implementation
    // In a real implementation, you would extract the line text from the Delta
    const text = editor.getText();
    const lines = text.split('\n');
    let currentIndex = 0;
    
    for (const line of lines) {
      if (currentIndex <= index && index < currentIndex + line.length + 1) {
        return line;
      }
      currentIndex += line.length + 1;
    }
    
    return '';
  }

  /**
   * Add CSS styles for lists
   */
  private addStyles(): void {
    const styleId = `${this.name}-styles`;
    
    if (document.getElementById(styleId)) {
      return; // Styles already added
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .enhanced-rich-editor__content ul,
      .enhanced-rich-editor__content ol {
        margin: 0.5em 0;
        padding-left: 1.5em;
      }
      
      .enhanced-rich-editor__content ul {
        list-style-type: disc;
      }
      
      .enhanced-rich-editor__content ol {
        list-style-type: decimal;
      }
      
      .enhanced-rich-editor__content li {
        margin: 0.25em 0;
        padding-left: 0.25em;
      }
      
      .enhanced-rich-editor__content ul ul,
      .enhanced-rich-editor__content ol ol,
      .enhanced-rich-editor__content ul ol,
      .enhanced-rich-editor__content ol ul {
        margin: 0.25em 0;
      }
      
      .enhanced-rich-editor__content ul ul {
        list-style-type: circle;
      }
      
      .enhanced-rich-editor__content ul ul ul {
        list-style-type: square;
      }
      
      /* Indentation support */
      .enhanced-rich-editor__content [data-indent="1"] {
        margin-left: 2em;
      }
      
      .enhanced-rich-editor__content [data-indent="2"] {
        margin-left: 4em;
      }
      
      .enhanced-rich-editor__content [data-indent="3"] {
        margin-left: 6em;
      }
      
      .enhanced-rich-editor__content [data-indent="4"] {
        margin-left: 8em;
      }
      
      .enhanced-rich-editor__content [data-indent="5"] {
        margin-left: 10em;
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
