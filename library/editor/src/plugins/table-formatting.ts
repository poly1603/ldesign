/**
 * Table Formatting Plugin
 * 
 * Provides table creation and editing functionality.
 */

import type { Editor, Command, Format } from '@/types';
import { BasePlugin } from './base-plugin';
import { logger } from '@/utils/logger';

/**
 * Table configuration interface
 */
export interface TableConfig {
  rows: number;
  cols: number;
  headers?: boolean;
  width?: string;
  className?: string;
}

/**
 * Cell data interface
 */
export interface CellData {
  content: string;
  rowspan?: number;
  colspan?: number;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

/**
 * Table data interface
 */
export interface TableData {
  rows: CellData[][];
  headers?: boolean;
  width?: string;
  className?: string;
}

/**
 * Table formatting plugin
 */
export class TableFormattingPlugin extends BasePlugin {
  readonly name = 'table-formatting';
  readonly version = '1.0.0';

  constructor() {
    super();
    this.logger = logger.child(this.name);
  }

  override readonly commands: Record<string, Command> = {
    'insert-table': {
      name: 'insert-table',
      execute: (editor: Editor, config?: TableConfig) => {
        const selection = editor.getSelection();
        if (!selection?.range) return { success: false };

        if (!config) {
          config = this.promptForTableConfig() || undefined;
          if (!config) return { success: false };
        }

        const tableData = this.createTableData(config);
        const tableEmbed = {
          table: tableData,
          width: config.width,
          className: config.className
        };

        const delta = editor.getContents();
        const newDelta = delta
          .retain(selection.range.index)
          .insert('\n')
          .insert(tableEmbed)
          .insert('\n');
        
        editor.setContents(newDelta);
        editor.setSelection({ index: selection.range.index + 2, length: 0 });

        return { success: true, config };
      },
      canExecute: (editor: Editor) => {
        return Boolean(editor.isEnabled() && editor.getSelection());
      },
    },

    'insert-table-row': {
      name: 'insert-table-row',
      execute: (editor: Editor, position: 'above' | 'below' = 'below') => {
        const tableInfo = this.findTableAtCursor(editor);
        if (!tableInfo) return { success: false };

        const newRow = this.createEmptyRow(tableInfo.data.rows[0].length);
        const insertIndex = position === 'above' ? tableInfo.rowIndex : tableInfo.rowIndex + 1;
        
        tableInfo.data.rows.splice(insertIndex, 0, newRow);
        this.updateTable(editor, tableInfo.embedIndex, tableInfo.data);

        return { success: true, position };
      },
      canExecute: (editor: Editor) => {
        return Boolean(this.findTableAtCursor(editor));
      },
    },

    'insert-table-column': {
      name: 'insert-table-column',
      execute: (editor: Editor, position: 'left' | 'right' = 'right') => {
        const tableInfo = this.findTableAtCursor(editor);
        if (!tableInfo) return { success: false };

        const insertIndex = position === 'left' ? tableInfo.colIndex : tableInfo.colIndex + 1;
        
        tableInfo.data.rows.forEach(row => {
          row.splice(insertIndex, 0, { content: '' });
        });
        
        this.updateTable(editor, tableInfo.embedIndex, tableInfo.data);

        return { success: true, position };
      },
      canExecute: (editor: Editor) => {
        return Boolean(this.findTableAtCursor(editor));
      },
    },

    'delete-table-row': {
      name: 'delete-table-row',
      execute: (editor: Editor) => {
        const tableInfo = this.findTableAtCursor(editor);
        if (!tableInfo || tableInfo.data.rows.length <= 1) return { success: false };

        tableInfo.data.rows.splice(tableInfo.rowIndex, 1);
        this.updateTable(editor, tableInfo.embedIndex, tableInfo.data);

        return { success: true };
      },
      canExecute: (editor: Editor) => {
        const tableInfo = this.findTableAtCursor(editor);
        return Boolean(tableInfo && tableInfo.data.rows.length > 1);
      },
    },

    'delete-table-column': {
      name: 'delete-table-column',
      execute: (editor: Editor) => {
        const tableInfo = this.findTableAtCursor(editor);
        if (!tableInfo || tableInfo.data.rows[0].length <= 1) return { success: false };

        tableInfo.data.rows.forEach(row => {
          row.splice(tableInfo.colIndex, 1);
        });
        
        this.updateTable(editor, tableInfo.embedIndex, tableInfo.data);

        return { success: true };
      },
      canExecute: (editor: Editor) => {
        const tableInfo = this.findTableAtCursor(editor);
        return Boolean(tableInfo && tableInfo.data.rows[0].length > 1);
      },
    },

    'delete-table': {
      name: 'delete-table',
      execute: (editor: Editor) => {
        const tableInfo = this.findTableAtCursor(editor);
        if (!tableInfo) return { success: false };

        const delta = editor.getContents();
        const newDelta = delta
          .retain(tableInfo.embedIndex)
          .delete(1);
        
        editor.setContents(newDelta);
        editor.setSelection({ index: tableInfo.embedIndex, length: 0 });

        return { success: true };
      },
      canExecute: (editor: Editor) => {
        return Boolean(this.findTableAtCursor(editor));
      },
    },

    'merge-table-cells': {
      name: 'merge-table-cells',
      execute: (_editor: Editor) => {
        // TODO: Implement cell merging
        return { success: false, message: 'Cell merging not yet implemented' };
      },
      canExecute: (_editor: Editor) => {
        return false; // Not implemented yet
      },
    },

    'split-table-cell': {
      name: 'split-table-cell',
      execute: (_editor: Editor) => {
        // TODO: Implement cell splitting
        return { success: false, message: 'Cell splitting not yet implemented' };
      },
      canExecute: (_editor: Editor) => {
        return false; // Not implemented yet
      },
    },
  };

  override readonly formats: Record<string, Format> = {
    table: {
      name: 'table',
      type: 'block',
      apply: (_editor: Editor, _range, _value) => {
        // Tables are inserted as embeds, not applied as formatting
      },
      remove: (_editor: Editor, _range) => {
        // Remove table embed
      },
      getValue: (_editor: Editor, _range) => {
        return false; // Tables are embeds, not text formatting
      },
    },
  };

  protected async onInstall(editor: Editor): Promise<void> {
    this.logger.info('Installing table formatting plugin');
    
    // Add keyboard shortcuts
    this.setupKeyboardShortcuts(editor);
    
    // Add CSS styles
    this.addStyles();
  }

  protected async onUninstall(_editor: Editor): Promise<void> {
    this.logger.info('Uninstalling table formatting plugin');
    
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
          case 't':
            if (event.shiftKey) {
              event.preventDefault();
              this.commands['insert-table'].execute(editor);
            }
            break;
        }
      }
      
      // Handle table navigation
      if (this.findTableAtCursor(editor)) {
        switch (event.key) {
          case 'Tab':
            event.preventDefault();
            this.navigateTable(editor, event.shiftKey ? 'prev' : 'next');
            break;
          case 'Enter':
            if (event.ctrlKey) {
              event.preventDefault();
              this.commands['insert-table-row'].execute(editor, 'below');
            }
            break;
        }
      }
    });
  }

  /**
   * Navigate within table
   */
  private navigateTable(_editor: Editor, _direction: 'next' | 'prev'): void {
    // TODO: Implement table navigation
    this.logger.debug('Table navigation:', _direction);
  }

  /**
   * Prompt user for table configuration
   */
  private promptForTableConfig(): TableConfig | null {
    const rows = parseInt(prompt('请输入行数:', '3') || '0');
    const cols = parseInt(prompt('请输入列数:', '3') || '0');
    
    if (rows <= 0 || cols <= 0) return null;
    
    const headers = confirm('是否包含表头?');
    
    return { rows, cols, headers };
  }

  /**
   * Create table data from configuration
   */
  private createTableData(config: TableConfig): TableData {
    const rows: CellData[][] = [];
    
    for (let i = 0; i < config.rows; i++) {
      const row: CellData[] = [];
      for (let j = 0; j < config.cols; j++) {
        row.push({
          content: i === 0 && config.headers ? `标题 ${j + 1}` : ''
        });
      }
      rows.push(row);
    }
    
    return {
      rows,
      headers: config.headers || false,
      width: config.width || '',
      className: config.className || ''
    };
  }

  /**
   * Create empty row
   */
  private createEmptyRow(colCount: number): CellData[] {
    const row: CellData[] = [];
    for (let i = 0; i < colCount; i++) {
      row.push({ content: '' });
    }
    return row;
  }

  /**
   * Find table at cursor position
   */
  private findTableAtCursor(_editor: Editor): {
    embedIndex: number;
    data: TableData;
    rowIndex: number;
    colIndex: number;
  } | null {
    // TODO: Implement table detection at cursor
    // This is a simplified implementation
    return null;
  }

  /**
   * Update table in editor
   */
  private updateTable(editor: Editor, embedIndex: number, tableData: TableData): void {
    const delta = editor.getContents();
    const newDelta = delta
      .retain(embedIndex)
      .delete(1)
      .insert({ table: tableData });
    
    editor.setContents(newDelta);
  }

  /**
   * Add CSS styles for tables
   */
  private addStyles(): void {
    const styleId = `${this.name}-styles`;
    
    if (document.getElementById(styleId)) {
      return; // Styles already added
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .enhanced-rich-editor__content table {
        border-collapse: collapse;
        width: 100%;
        margin: 1em 0;
        border: 1px solid var(--ere-color-border, #e5e7eb);
        border-radius: var(--ere-border-radius, 4px);
        overflow: hidden;
      }
      
      .enhanced-rich-editor__content th,
      .enhanced-rich-editor__content td {
        border: 1px solid var(--ere-color-border, #e5e7eb);
        padding: 0.75em;
        text-align: left;
        vertical-align: top;
      }
      
      .enhanced-rich-editor__content th {
        background: var(--ere-color-bg-secondary, #f8fafc);
        font-weight: 600;
        color: var(--ere-color-text, #1f2937);
      }
      
      .enhanced-rich-editor__content td {
        background: var(--ere-color-bg, #ffffff);
      }
      
      .enhanced-rich-editor__content tr:nth-child(even) td {
        background: var(--ere-color-bg-alt, #f9fafb);
      }
      
      .enhanced-rich-editor__content tr:hover td {
        background: var(--ere-color-bg-hover, #f3f4f6);
      }
      
      .enhanced-rich-editor__content td[align="center"] {
        text-align: center;
      }
      
      .enhanced-rich-editor__content td[align="right"] {
        text-align: right;
      }
      
      /* Table controls */
      .table-controls {
        position: absolute;
        background: var(--ere-color-bg, #ffffff);
        border: 1px solid var(--ere-color-border, #e5e7eb);
        border-radius: var(--ere-border-radius, 4px);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        padding: 0.5em;
        z-index: 1000;
      }
      
      .table-controls button {
        display: block;
        width: 100%;
        padding: 0.5em;
        border: none;
        background: transparent;
        text-align: left;
        cursor: pointer;
        border-radius: var(--ere-border-radius-sm, 2px);
        transition: background var(--ere-transition-fast, 0.2s);
      }
      
      .table-controls button:hover {
        background: var(--ere-color-bg-hover, #f3f4f6);
      }
      
      /* Dark theme support */
      .enhanced-rich-editor--dark .enhanced-rich-editor__content table {
        border-color: var(--ere-color-border-dark, #374151);
      }
      
      .enhanced-rich-editor--dark .enhanced-rich-editor__content th,
      .enhanced-rich-editor--dark .enhanced-rich-editor__content td {
        border-color: var(--ere-color-border-dark, #374151);
      }
      
      .enhanced-rich-editor--dark .enhanced-rich-editor__content th {
        background: var(--ere-color-bg-secondary-dark, #374151);
        color: var(--ere-color-text-dark, #f9fafb);
      }
      
      .enhanced-rich-editor--dark .enhanced-rich-editor__content td {
        background: var(--ere-color-bg-dark, #1f2937);
        color: var(--ere-color-text-dark, #f9fafb);
      }
      
      .enhanced-rich-editor--dark .enhanced-rich-editor__content tr:nth-child(even) td {
        background: var(--ere-color-bg-alt-dark, #111827);
      }
      
      .enhanced-rich-editor--dark .enhanced-rich-editor__content tr:hover td {
        background: var(--ere-color-bg-hover-dark, #374151);
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
