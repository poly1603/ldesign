/**
 * Heading Formatting Plugin
 * 
 * Provides heading formatting functionality (H1-H6).
 */

import type { Editor, Command, Format } from '@/types';
import { BasePlugin } from './base-plugin';
import { logger } from '@/utils/logger';

/**
 * Heading levels
 */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6 | false;

/**
 * Heading formatting plugin
 */
export class HeadingFormattingPlugin extends BasePlugin {
  readonly name = 'heading-formatting';
  readonly version = '1.0.0';

  constructor() {
    super();
    this.logger = logger.child(this.name);
  }

  override readonly commands: Record<string, Command> = {
    'heading-1': {
      name: 'heading-1',
      execute: (editor: Editor) => {
        const selection = editor.getSelection();
        if (selection?.range) {
          editor.formatLine(selection.range.index, selection.range.length, 'header', 1);
        }
        return { format: 'header', value: 1 };
      },
      canExecute: (editor: Editor) => {
        const selection = editor.getSelection();
        return Boolean(selection?.range && selection.range.length >= 0);
      },
    },

    'heading-2': {
      name: 'heading-2',
      execute: (editor: Editor) => {
        const selection = editor.getSelection();
        if (selection?.range) {
          editor.formatLine(selection.range.index, selection.range.length, 'header', 2);
        }
        return { format: 'header', value: 2 };
      },
      canExecute: (editor: Editor) => {
        const selection = editor.getSelection();
        return Boolean(selection?.range && selection.range.length >= 0);
      },
    },

    'heading-3': {
      name: 'heading-3',
      execute: (editor: Editor) => {
        const selection = editor.getSelection();
        if (selection?.range) {
          editor.formatLine(selection.range.index, selection.range.length, 'header', 3);
        }
        return { format: 'header', value: 3 };
      },
      canExecute: (editor: Editor) => {
        const selection = editor.getSelection();
        return Boolean(selection?.range && selection.range.length >= 0);
      },
    },

    'heading-4': {
      name: 'heading-4',
      execute: (editor: Editor) => {
        const selection = editor.getSelection();
        if (selection?.range) {
          editor.formatLine(selection.range.index, selection.range.length, 'header', 4);
        }
        return { format: 'header', value: 4 };
      },
      canExecute: (editor: Editor) => {
        const selection = editor.getSelection();
        return Boolean(selection?.range && selection.range.length >= 0);
      },
    },

    'heading-5': {
      name: 'heading-5',
      execute: (editor: Editor) => {
        const selection = editor.getSelection();
        if (selection?.range) {
          editor.formatLine(selection.range.index, selection.range.length, 'header', 5);
        }
        return { format: 'header', value: 5 };
      },
      canExecute: (editor: Editor) => {
        const selection = editor.getSelection();
        return Boolean(selection?.range && selection.range.length >= 0);
      },
    },

    'heading-6': {
      name: 'heading-6',
      execute: (editor: Editor) => {
        const selection = editor.getSelection();
        if (selection?.range) {
          editor.formatLine(selection.range.index, selection.range.length, 'header', 6);
        }
        return { format: 'header', value: 6 };
      },
      canExecute: (editor: Editor) => {
        const selection = editor.getSelection();
        return Boolean(selection?.range && selection.range.length >= 0);
      },
    },

    'heading-clear': {
      name: 'heading-clear',
      execute: (editor: Editor) => {
        const selection = editor.getSelection();
        if (selection?.range) {
          editor.formatLine(selection.range.index, selection.range.length, 'header', false);
        }
        return { format: 'header', value: false };
      },
      canExecute: (editor: Editor) => {
        const selection = editor.getSelection();
        return Boolean(selection?.range && selection.range.length >= 0);
      },
    },

    'blockquote': {
      name: 'blockquote',
      execute: (editor: Editor) => {
        const selection = editor.getSelection();
        if (selection?.range) {
          const currentFormat = editor.getLineFormat(selection.range.index);
          const isBlockquote = currentFormat.blockquote;
          editor.formatLine(selection.range.index, selection.range.length, 'blockquote', !isBlockquote);
        }
        return { format: 'blockquote', value: 'toggle' };
      },
      canExecute: (editor: Editor) => {
        const selection = editor.getSelection();
        return Boolean(selection?.range && selection.range.length >= 0);
      },
    },

    'code-block': {
      name: 'code-block',
      execute: (editor: Editor) => {
        const selection = editor.getSelection();
        if (selection?.range) {
          const currentFormat = editor.getLineFormat(selection.range.index);
          const isCodeBlock = currentFormat['code-block'];
          editor.formatLine(selection.range.index, selection.range.length, 'code-block', !isCodeBlock);
        }
        return { format: 'code-block', value: 'toggle' };
      },
      canExecute: (editor: Editor) => {
        const selection = editor.getSelection();
        return Boolean(selection?.range && selection.range.length >= 0);
      },
    },
  };

  override readonly formats: Record<string, Format> = {
    header: {
      name: 'header',
      type: 'block',
      apply: (editor: Editor, range, value) => {
        editor.formatLine(range.index, range.length, 'header', value);
      },
      remove: (editor: Editor, range) => {
        editor.formatLine(range.index, range.length, 'header', false);
      },
      getValue: (editor: Editor, range) => {
        const format = editor.getLineFormat(range.index);
        return format.header || false;
      },
    },

    blockquote: {
      name: 'blockquote',
      type: 'block',
      apply: (editor: Editor, range, value) => {
        editor.formatLine(range.index, range.length, 'blockquote', value);
      },
      remove: (editor: Editor, range) => {
        editor.formatLine(range.index, range.length, 'blockquote', false);
      },
      getValue: (editor: Editor, range) => {
        const format = editor.getLineFormat(range.index);
        return format.blockquote || false;
      },
    },

    'code-block': {
      name: 'code-block',
      type: 'block',
      apply: (editor: Editor, range, value) => {
        editor.formatLine(range.index, range.length, 'code-block', value);
      },
      remove: (editor: Editor, range) => {
        editor.formatLine(range.index, range.length, 'code-block', false);
      },
      getValue: (editor: Editor, range) => {
        const format = editor.getLineFormat(range.index);
        return format['code-block'] || false;
      },
    },
  };

  protected async onInstall(editor: Editor): Promise<void> {
    this.logger.info('Installing heading formatting plugin');
    
    // Add keyboard shortcuts
    this.setupKeyboardShortcuts(editor);
    
    // Add CSS styles
    this.addStyles();
  }

  protected async onUninstall(_editor: Editor): Promise<void> {
    this.logger.info('Uninstalling heading formatting plugin');
    
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
        switch (event.key) {
          case '1':
            event.preventDefault();
            this.commands['heading-1'].execute(editor);
            break;
          case '2':
            event.preventDefault();
            this.commands['heading-2'].execute(editor);
            break;
          case '3':
            event.preventDefault();
            this.commands['heading-3'].execute(editor);
            break;
          case '4':
            event.preventDefault();
            this.commands['heading-4'].execute(editor);
            break;
          case '5':
            event.preventDefault();
            this.commands['heading-5'].execute(editor);
            break;
          case '6':
            event.preventDefault();
            this.commands['heading-6'].execute(editor);
            break;
          case '0':
            event.preventDefault();
            this.commands['heading-clear'].execute(editor);
            break;
          case 'q':
            event.preventDefault();
            this.commands['blockquote'].execute(editor);
            break;
          case 'e':
            event.preventDefault();
            this.commands['code-block'].execute(editor);
            break;
        }
      }
    });
  }

  /**
   * Add CSS styles for headings
   */
  private addStyles(): void {
    const styleId = `${this.name}-styles`;
    
    if (document.getElementById(styleId)) {
      return; // Styles already added
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .enhanced-rich-editor__content h1,
      .enhanced-rich-editor__content h2,
      .enhanced-rich-editor__content h3,
      .enhanced-rich-editor__content h4,
      .enhanced-rich-editor__content h5,
      .enhanced-rich-editor__content h6 {
        margin: 1em 0 0.5em 0;
        font-weight: 600;
        line-height: 1.25;
        color: var(--ere-color-text, #1f2937);
      }
      
      .enhanced-rich-editor__content h1 {
        font-size: 2.25em;
        border-bottom: 2px solid var(--ere-color-border, #e5e7eb);
        padding-bottom: 0.25em;
      }
      
      .enhanced-rich-editor__content h2 {
        font-size: 1.875em;
        border-bottom: 1px solid var(--ere-color-border, #e5e7eb);
        padding-bottom: 0.25em;
      }
      
      .enhanced-rich-editor__content h3 {
        font-size: 1.5em;
      }
      
      .enhanced-rich-editor__content h4 {
        font-size: 1.25em;
      }
      
      .enhanced-rich-editor__content h5 {
        font-size: 1.125em;
      }
      
      .enhanced-rich-editor__content h6 {
        font-size: 1em;
        color: var(--ere-color-text-secondary, #6b7280);
      }
      
      .enhanced-rich-editor__content blockquote {
        margin: 1em 0;
        padding: 0.5em 1em;
        border-left: 4px solid var(--ere-color-primary, #3b82f6);
        background: var(--ere-color-bg-secondary, #f8fafc);
        color: var(--ere-color-text-secondary, #6b7280);
        font-style: italic;
      }
      
      .enhanced-rich-editor__content blockquote p {
        margin: 0;
      }
      
      .enhanced-rich-editor__content pre {
        margin: 1em 0;
        padding: 1em;
        background: var(--ere-color-bg-code, #1f2937);
        color: var(--ere-color-text-code, #f9fafb);
        border-radius: 0.5em;
        overflow-x: auto;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 0.875em;
        line-height: 1.5;
      }
      
      .enhanced-rich-editor__content code {
        padding: 0.125em 0.25em;
        background: var(--ere-color-bg-code-inline, #f3f4f6);
        color: var(--ere-color-text-code-inline, #1f2937);
        border-radius: 0.25em;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 0.875em;
      }
      
      .enhanced-rich-editor__content pre code {
        padding: 0;
        background: transparent;
        color: inherit;
        border-radius: 0;
      }
      
      /* Dark theme support */
      .enhanced-rich-editor--dark .enhanced-rich-editor__content h1,
      .enhanced-rich-editor--dark .enhanced-rich-editor__content h2,
      .enhanced-rich-editor--dark .enhanced-rich-editor__content h3,
      .enhanced-rich-editor--dark .enhanced-rich-editor__content h4,
      .enhanced-rich-editor--dark .enhanced-rich-editor__content h5,
      .enhanced-rich-editor--dark .enhanced-rich-editor__content h6 {
        color: var(--ere-color-text-dark, #f9fafb);
      }
      
      .enhanced-rich-editor--dark .enhanced-rich-editor__content h1,
      .enhanced-rich-editor--dark .enhanced-rich-editor__content h2 {
        border-color: var(--ere-color-border-dark, #374151);
      }
      
      .enhanced-rich-editor--dark .enhanced-rich-editor__content h6 {
        color: var(--ere-color-text-secondary-dark, #9ca3af);
      }
      
      .enhanced-rich-editor--dark .enhanced-rich-editor__content blockquote {
        background: var(--ere-color-bg-secondary-dark, #374151);
        color: var(--ere-color-text-secondary-dark, #9ca3af);
        border-color: var(--ere-color-primary-dark, #60a5fa);
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
