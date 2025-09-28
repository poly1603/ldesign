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
  width?: string;
  backgroundColor?: string;
  textColor?: string;
  bold?: boolean;
  italic?: boolean;
}

/**
 * Table data interface
 */
export interface TableData {
  rows: CellData[][];
  headers?: boolean;
  width?: string;
  className?: string;
  columnWidths?: string[];
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  borderColor?: string;
  borderWidth?: string;
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
        return Boolean(tableInfo && tableInfo.data && tableInfo.data.rows && tableInfo.data.rows.length > 1);
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
        return Boolean(tableInfo && tableInfo.data && tableInfo.data.rows && tableInfo.data.rows[0] && tableInfo.data.rows[0].length > 1);
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
      execute: (editor: Editor, selection?: { startRow: number; startCol: number; endRow: number; endCol: number }) => {
        const tableInfo = this.findTableAtCursor(editor);
        if (!tableInfo) return { success: false };

        if (!selection) {
          // Use current selection or default to current cell
          selection = {
            startRow: tableInfo.rowIndex,
            startCol: tableInfo.colIndex,
            endRow: tableInfo.rowIndex,
            endCol: tableInfo.colIndex
          };
        }

        const { startRow, startCol, endRow, endCol } = selection;

        // Validate selection
        if (startRow === endRow && startCol === endCol) {
          return { success: false, message: 'Cannot merge single cell' };
        }

        // Calculate span values
        const rowspan = endRow - startRow + 1;
        const colspan = endCol - startCol + 1;

        // Merge content from all selected cells
        let mergedContent = '';
        for (let row = startRow; row <= endRow; row++) {
          for (let col = startCol; col <= endCol; col++) {
            const cell = tableInfo.data.rows[row]?.[col];
            if (cell && cell.content.trim()) {
              if (mergedContent) mergedContent += ' ';
              mergedContent += cell.content.trim();
            }
          }
        }

        // Update the top-left cell with merged properties
        const targetCell = tableInfo.data.rows[startRow][startCol];
        targetCell.content = mergedContent;
        if (rowspan > 1) {
          targetCell.rowspan = rowspan;
        } else {
          delete targetCell.rowspan;
        }
        if (colspan > 1) {
          targetCell.colspan = colspan;
        } else {
          delete targetCell.colspan;
        }

        // Mark other cells as merged (remove them)
        for (let row = startRow; row <= endRow; row++) {
          for (let col = startCol; col <= endCol; col++) {
            if (row !== startRow || col !== startCol) {
              // Mark cell as merged by setting a special flag
              const cell = tableInfo.data.rows[row][col];
              if (cell) {
                cell.content = '';
                delete cell.rowspan;
                delete cell.colspan;
                (cell as any).merged = true;
              }
            }
          }
        }

        this.updateTable(editor, tableInfo.embedIndex, tableInfo.data);
        return { success: true, selection };
      },
      canExecute: (editor: Editor) => {
        return Boolean(this.findTableAtCursor(editor));
      },
    },

    'split-table-cell': {
      name: 'split-table-cell',
      execute: (editor: Editor) => {
        const tableInfo = this.findTableAtCursor(editor);
        if (!tableInfo) return { success: false };

        const cell = tableInfo.data.rows[tableInfo.rowIndex][tableInfo.colIndex];
        if (!cell.rowspan && !cell.colspan) {
          return { success: false, message: 'Cell is not merged' };
        }

        const rowspan = cell.rowspan || 1;
        const colspan = cell.colspan || 1;

        // Reset the original cell
        delete cell.rowspan;
        delete cell.colspan;

        // Restore cells that were marked as merged
        for (let row = tableInfo.rowIndex; row < tableInfo.rowIndex + rowspan; row++) {
          for (let col = tableInfo.colIndex; col < tableInfo.colIndex + colspan; col++) {
            if (row !== tableInfo.rowIndex || col !== tableInfo.colIndex) {
              const targetCell = tableInfo.data.rows[row]?.[col];
              if (targetCell && (targetCell as any).merged) {
                targetCell.content = '';
                delete (targetCell as any).merged;
              }
            }
          }
        }

        this.updateTable(editor, tableInfo.embedIndex, tableInfo.data);
        return { success: true };
      },
      canExecute: (editor: Editor) => {
        const tableInfo = this.findTableAtCursor(editor);
        if (!tableInfo) return false;

        const cell = tableInfo.data.rows[tableInfo.rowIndex][tableInfo.colIndex];
        return Boolean(cell.rowspan || cell.colspan);
      },
    },

    'set-cell-alignment': {
      name: 'set-cell-alignment',
      execute: (editor: Editor, alignment: 'left' | 'center' | 'right') => {
        const tableInfo = this.findTableAtCursor(editor);
        if (!tableInfo) return { success: false };

        const cell = tableInfo.data.rows[tableInfo.rowIndex][tableInfo.colIndex];
        cell.align = alignment;

        this.updateTable(editor, tableInfo.embedIndex, tableInfo.data);
        return { success: true, alignment };
      },
      canExecute: (editor: Editor) => {
        return Boolean(this.findTableAtCursor(editor));
      },
    },

    'set-cell-style': {
      name: 'set-cell-style',
      execute: (editor: Editor, styles: Partial<Pick<CellData, 'backgroundColor' | 'textColor' | 'bold' | 'italic'>>) => {
        const tableInfo = this.findTableAtCursor(editor);
        if (!tableInfo) return { success: false };

        const cell = tableInfo.data.rows[tableInfo.rowIndex][tableInfo.colIndex];
        Object.assign(cell, styles);

        this.updateTable(editor, tableInfo.embedIndex, tableInfo.data);
        return { success: true, styles };
      },
      canExecute: (editor: Editor) => {
        return Boolean(this.findTableAtCursor(editor));
      },
    },

    'set-column-width': {
      name: 'set-column-width',
      execute: (editor: Editor, width: string) => {
        const tableInfo = this.findTableAtCursor(editor);
        if (!tableInfo) return { success: false };

        if (!tableInfo.data.columnWidths) {
          tableInfo.data.columnWidths = new Array(tableInfo.data.rows[0].length).fill('');
        }

        tableInfo.data.columnWidths[tableInfo.colIndex] = width;

        this.updateTable(editor, tableInfo.embedIndex, tableInfo.data);
        return { success: true, width, column: tableInfo.colIndex };
      },
      canExecute: (editor: Editor) => {
        return Boolean(this.findTableAtCursor(editor));
      },
    },

    'set-table-style': {
      name: 'set-table-style',
      execute: (editor: Editor, styles: Partial<Pick<TableData, 'borderStyle' | 'borderColor' | 'borderWidth' | 'className'>>) => {
        const tableInfo = this.findTableAtCursor(editor);
        if (!tableInfo) return { success: false };

        Object.assign(tableInfo.data, styles);

        this.updateTable(editor, tableInfo.embedIndex, tableInfo.data);
        return { success: true, styles };
      },
      canExecute: (editor: Editor) => {
        return Boolean(this.findTableAtCursor(editor));
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

    // Setup table interaction handlers
    this.setupTableInteractions(editor);
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
      
      // Handle table navigation and shortcuts
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
          case 'Delete':
          case 'Backspace':
            if (event.ctrlKey && event.shiftKey) {
              event.preventDefault();
              this.commands['delete-table'].execute(editor);
            }
            break;
          case 'ArrowUp':
          case 'ArrowDown':
          case 'ArrowLeft':
          case 'ArrowRight':
            if (event.ctrlKey) {
              event.preventDefault();
              this.handleArrowNavigation(editor, event.key.replace('Arrow', '').toLowerCase() as 'up' | 'down' | 'left' | 'right');
            }
            break;
          case 'F2':
            event.preventDefault();
            this.showTableControls(editor);
            break;
        }
      }
    });
  }

  /**
   * Navigate within table
   */
  private navigateTable(editor: Editor, direction: 'next' | 'prev'): void {
    const tableInfo = this.findTableAtCursor(editor);
    if (!tableInfo) return;

    let newRow = tableInfo.rowIndex;
    let newCol = tableInfo.colIndex;

    if (direction === 'next') {
      newCol++;
      if (newCol >= tableInfo.data.rows[newRow].length) {
        newCol = 0;
        newRow++;
        if (newRow >= tableInfo.data.rows.length) {
          // Add new row if at end of table
          const newRowData = this.createEmptyRow(tableInfo.data.rows[0].length);
          tableInfo.data.rows.push(newRowData);
          this.updateTable(editor, tableInfo.embedIndex, tableInfo.data);
        }
      }
    } else {
      newCol--;
      if (newCol < 0) {
        newRow--;
        if (newRow >= 0) {
          newCol = tableInfo.data.rows[newRow].length - 1;
        } else {
          newRow = 0;
          newCol = 0;
        }
      }
    }

    // Set cursor to new cell position
    this.setCursorToCell(editor, tableInfo.embedIndex, newRow, newCol);
    this.logger.debug('Table navigation:', direction, `${newRow},${newCol}`);
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
  private findTableAtCursor(editor: Editor): {
    embedIndex: number;
    data: TableData;
    rowIndex: number;
    colIndex: number;
  } | null {
    const selection = editor.getSelection();
    if (!selection?.range) return null;

    const delta = editor.getContents();
    let currentIndex = 0;

    for (let i = 0; i < delta.ops.length; i++) {
      const op = delta.ops[i];

      if (op.insert && typeof op.insert === 'object' && 'table' in op.insert) {
        // Found a table embed
        if (currentIndex <= selection.range.index && selection.range.index <= currentIndex + 1) {
          // Cursor is at or near this table
          const tableData = (op.insert as any).table as TableData;

          // For now, default to first cell - in a real implementation,
          // we would determine the exact cell based on cursor position
          return {
            embedIndex: currentIndex,
            data: tableData,
            rowIndex: 0,
            colIndex: 0
          };
        }
        currentIndex += 1;
      } else if (typeof op.insert === 'string') {
        currentIndex += op.insert.length;
      } else if (op.retain) {
        currentIndex += op.retain;
      }
    }

    return null;
  }

  /**
   * Set cursor to specific cell in table
   */
  private setCursorToCell(editor: Editor, embedIndex: number, rowIndex: number, colIndex: number): void {
    // In a real implementation, this would position the cursor within the specific cell
    // For now, we'll just position it after the table
    editor.setSelection({ index: embedIndex + 1, length: 0 });

    // Store the current cell position for future reference
    (this as any).currentTablePosition = { embedIndex, rowIndex, colIndex };
  }

  /**
   * Handle arrow key navigation in tables
   */
  private handleArrowNavigation(editor: Editor, direction: 'up' | 'down' | 'left' | 'right'): void {
    const tableInfo = this.findTableAtCursor(editor);
    if (!tableInfo) return;

    let newRow = tableInfo.rowIndex;
    let newCol = tableInfo.colIndex;

    switch (direction) {
      case 'up':
        newRow = Math.max(0, newRow - 1);
        break;
      case 'down':
        newRow = Math.min(tableInfo.data.rows.length - 1, newRow + 1);
        break;
      case 'left':
        newCol = Math.max(0, newCol - 1);
        break;
      case 'right':
        newCol = Math.min(tableInfo.data.rows[newRow].length - 1, newCol + 1);
        break;
    }

    this.setCursorToCell(editor, tableInfo.embedIndex, newRow, newCol);
  }

  /**
   * Setup table interaction handlers
   */
  private setupTableInteractions(editor: Editor): void {
    const root = editor.getRoot();

    // Right-click context menu for tables
    this.addEventListener(root, 'contextmenu', (event) => {
      const tableInfo = this.findTableAtCursor(editor);
      if (tableInfo) {
        event.preventDefault();
        this.showTableControls(editor);
      }
    });

    // Double-click to edit cell content
    this.addEventListener(root, 'dblclick', (event) => {
      const tableInfo = this.findTableAtCursor(editor);
      if (tableInfo) {
        event.preventDefault();
        this.editCellContent(editor, tableInfo);
      }
    });
  }

  /**
   * Edit cell content
   */
  private editCellContent(editor: Editor, tableInfo: { embedIndex: number; data: TableData; rowIndex: number; colIndex: number }): void {
    const cell = tableInfo.data.rows[tableInfo.rowIndex][tableInfo.colIndex];
    const newContent = prompt('编辑单元格内容:', cell.content);

    if (newContent !== null) {
      cell.content = newContent;
      this.updateTable(editor, tableInfo.embedIndex, tableInfo.data);
    }
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

      /* Cell styling */
      .enhanced-rich-editor__content td[data-background] {
        background-color: attr(data-background);
      }

      .enhanced-rich-editor__content td[data-color] {
        color: attr(data-color);
      }

      .enhanced-rich-editor__content td.bold {
        font-weight: bold;
      }

      .enhanced-rich-editor__content td.italic {
        font-style: italic;
      }

      /* Merged cells */
      .enhanced-rich-editor__content td[colspan] {
        text-align: center;
      }

      .enhanced-rich-editor__content td[rowspan] {
        vertical-align: middle;
      }

      /* Column width support */
      .enhanced-rich-editor__content table.has-column-widths {
        table-layout: fixed;
      }

      /* Table selection */
      .enhanced-rich-editor__content table.selected {
        outline: 2px solid var(--ere-color-primary, #3b82f6);
        outline-offset: 2px;
      }

      .enhanced-rich-editor__content td.selected {
        background: var(--ere-color-primary-light, #dbeafe) !important;
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
        min-width: 200px;
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
        font-size: 14px;
      }

      .table-controls button:hover {
        background: var(--ere-color-bg-hover, #f3f4f6);
      }

      .table-controls button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .table-controls .separator {
        height: 1px;
        background: var(--ere-color-border, #e5e7eb);
        margin: 0.5em 0;
      }

      /* Table resize handles */
      .table-resize-handle {
        position: absolute;
        background: var(--ere-color-primary, #3b82f6);
        opacity: 0;
        transition: opacity var(--ere-transition-fast, 0.2s);
      }

      .table-resize-handle.vertical {
        width: 3px;
        height: 100%;
        cursor: col-resize;
        right: -1px;
        top: 0;
      }

      .table-resize-handle.horizontal {
        height: 3px;
        width: 100%;
        cursor: row-resize;
        bottom: -1px;
        left: 0;
      }

      .enhanced-rich-editor__content th:hover .table-resize-handle,
      .enhanced-rich-editor__content td:hover .table-resize-handle {
        opacity: 1;
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

  /**
   * Create table controls UI
   */
  private createTableControls(editor: Editor, _tableInfo: { embedIndex: number; data: TableData; rowIndex: number; colIndex: number }): HTMLElement {
    const controls = document.createElement('div');
    controls.className = 'table-controls';

    const buttons = [
      { text: '插入行（上方）', command: 'insert-table-row', args: ['above'] },
      { text: '插入行（下方）', command: 'insert-table-row', args: ['below'] },
      { text: '删除行', command: 'delete-table-row', args: [] },
      { text: '插入列（左侧）', command: 'insert-table-column', args: ['left'] },
      { text: '插入列（右侧）', command: 'insert-table-column', args: ['right'] },
      { text: '删除列', command: 'delete-table-column', args: [] },
      null, // Separator
      { text: '合并单元格', command: 'merge-table-cells', args: [] },
      { text: '拆分单元格', command: 'split-table-cell', args: [] },
      null, // Separator
      { text: '左对齐', command: 'set-cell-alignment', args: ['left'] },
      { text: '居中对齐', command: 'set-cell-alignment', args: ['center'] },
      { text: '右对齐', command: 'set-cell-alignment', args: ['right'] },
      null, // Separator
      { text: '删除表格', command: 'delete-table', args: [] }
    ];

    buttons.forEach(button => {
      if (button === null) {
        const separator = document.createElement('div');
        separator.className = 'separator';
        controls.appendChild(separator);
      } else {
        const btn = document.createElement('button');
        btn.textContent = button.text;
        btn.type = 'button';

        const command = this.commands[button.command];
        if (command && command.canExecute && command.canExecute(editor)) {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            command.execute(editor, ...button.args);
            controls.remove();
          });
        } else {
          btn.disabled = true;
        }

        controls.appendChild(btn);
      }
    });

    return controls;
  }

  /**
   * Show table controls at cursor position
   */
  private showTableControls(editor: Editor): void {
    const tableInfo = this.findTableAtCursor(editor);
    if (!tableInfo) return;

    // Remove existing controls
    const existingControls = document.querySelector('.table-controls');
    if (existingControls) {
      existingControls.remove();
    }

    const controls = this.createTableControls(editor, tableInfo);

    // Position controls near cursor
    const selection = editor.getSelection();
    if (selection?.range) {
      // For now, position at a fixed location since getBounds is not implemented
      controls.style.left = '50px';
      controls.style.top = '100px';
    }

    document.body.appendChild(controls);

    // Auto-hide controls when clicking outside
    const hideControls = (event: Event) => {
      if (!controls.contains(event.target as Node)) {
        controls.remove();
        document.removeEventListener('click', hideControls);
      }
    };

    setTimeout(() => {
      document.addEventListener('click', hideControls);
    }, 100);
  }


}
