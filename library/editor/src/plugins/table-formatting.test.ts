/**
 * Table Formatting Plugin Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EnhancedEditor } from '@/core/editor';
import { TableFormattingPlugin, TableConfig, TableData, CellData } from './table-formatting';
import { Delta } from '@/core/delta';

describe('TableFormattingPlugin', () => {
  let editor: EnhancedEditor;
  let plugin: TableFormattingPlugin;
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    
    editor = new EnhancedEditor(container);
    plugin = new TableFormattingPlugin();
  });

  afterEach(() => {
    editor.destroy();
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('plugin lifecycle', () => {
    it('should install successfully', async () => {
      await plugin.install(editor);
      expect(editor.hasPlugin(plugin.name)).toBe(true);
    });

    it('should uninstall successfully', async () => {
      await plugin.install(editor);
      await plugin.uninstall(editor);
      expect(editor.hasPlugin(plugin.name)).toBe(false);
    });

    it('should add CSS styles on install', async () => {
      await plugin.install(editor);
      const styles = document.getElementById(`${plugin.name}-styles`);
      expect(styles).toBeTruthy();
    });

    it('should remove CSS styles on uninstall', async () => {
      await plugin.install(editor);
      await plugin.uninstall(editor);
      const styles = document.getElementById(`${plugin.name}-styles`);
      expect(styles).toBeFalsy();
    });
  });

  describe('table creation', () => {
    beforeEach(async () => {
      await plugin.install(editor);
    });

    it('should create basic table', () => {
      const config: TableConfig = { rows: 2, cols: 3, headers: false };
      const command = plugin.commands['insert-table'];
      
      editor.setText('Hello World');
      editor.setSelection({ index: 5, length: 0 });
      
      const result = command.execute(editor, config);
      expect(result.success).toBe(true);
    });

    it('should create table with headers', () => {
      const config: TableConfig = { rows: 3, cols: 2, headers: true };
      const command = plugin.commands['insert-table'];
      
      editor.setText('Test');
      editor.setSelection({ index: 4, length: 0 });
      
      const result = command.execute(editor, config);
      expect(result.success).toBe(true);
      expect(result.config?.headers).toBe(true);
    });

    it('should not create table without selection', () => {
      const config: TableConfig = { rows: 2, cols: 2 };
      const command = plugin.commands['insert-table'];
      
      editor.setText('Test');
      editor.setSelection(null);
      
      const result = command.execute(editor, config);
      expect(result.success).toBe(false);
    });
  });

  describe('table manipulation', () => {
    let mockTableInfo: any;

    beforeEach(async () => {
      await plugin.install(editor);
      
      // Mock table detection
      mockTableInfo = {
        embedIndex: 5,
        data: {
          rows: [
            [{ content: 'A1' }, { content: 'B1' }],
            [{ content: 'A2' }, { content: 'B2' }]
          ],
          headers: false
        } as TableData,
        rowIndex: 0,
        colIndex: 0
      };
      
      vi.spyOn(plugin as any, 'findTableAtCursor').mockReturnValue(mockTableInfo);
      vi.spyOn(plugin as any, 'updateTable').mockImplementation(() => {});
    });

    it('should insert row above', () => {
      const command = plugin.commands['insert-table-row'];
      const result = command.execute(editor, 'above');
      
      expect(result.success).toBe(true);
      expect(result.position).toBe('above');
    });

    it('should insert row below', () => {
      const command = plugin.commands['insert-table-row'];
      const result = command.execute(editor, 'below');
      
      expect(result.success).toBe(true);
      expect(result.position).toBe('below');
    });

    it('should insert column left', () => {
      const command = plugin.commands['insert-table-column'];
      const result = command.execute(editor, 'left');
      
      expect(result.success).toBe(true);
      expect(result.position).toBe('left');
    });

    it('should insert column right', () => {
      const command = plugin.commands['insert-table-column'];
      const result = command.execute(editor, 'right');
      
      expect(result.success).toBe(true);
      expect(result.position).toBe('right');
    });

    it('should delete row', () => {
      // Add more rows to allow deletion
      mockTableInfo.data.rows.push([{ content: 'A3' }, { content: 'B3' }]);
      
      const command = plugin.commands['delete-table-row'];
      const result = command.execute(editor);
      
      expect(result.success).toBe(true);
    });

    it('should not delete last row', () => {
      // Only one row left
      mockTableInfo.data.rows = [[{ content: 'A1' }, { content: 'B1' }]];
      
      const command = plugin.commands['delete-table-row'];
      const result = command.execute(editor);
      
      expect(result.success).toBe(false);
    });

    it('should delete column', () => {
      // Add more columns to allow deletion
      mockTableInfo.data.rows.forEach(row => row.push({ content: 'C' }));
      
      const command = plugin.commands['delete-table-column'];
      const result = command.execute(editor);
      
      expect(result.success).toBe(true);
    });

    it('should not delete last column', () => {
      // Only one column left
      mockTableInfo.data.rows = [[{ content: 'A1' }], [{ content: 'A2' }]];
      
      const command = plugin.commands['delete-table-column'];
      const result = command.execute(editor);
      
      expect(result.success).toBe(false);
    });

    it('should delete entire table', () => {
      const command = plugin.commands['delete-table'];
      const result = command.execute(editor);
      
      expect(result.success).toBe(true);
    });
  });

  describe('cell operations', () => {
    let mockTableInfo: any;

    beforeEach(async () => {
      await plugin.install(editor);
      
      mockTableInfo = {
        embedIndex: 5,
        data: {
          rows: [
            [{ content: 'A1' }, { content: 'B1' }, { content: 'C1' }],
            [{ content: 'A2' }, { content: 'B2' }, { content: 'C2' }],
            [{ content: 'A3' }, { content: 'B3' }, { content: 'C3' }]
          ],
          headers: false
        } as TableData,
        rowIndex: 0,
        colIndex: 0
      };
      
      vi.spyOn(plugin as any, 'findTableAtCursor').mockReturnValue(mockTableInfo);
      vi.spyOn(plugin as any, 'updateTable').mockImplementation(() => {});
    });

    it('should merge cells', () => {
      const command = plugin.commands['merge-table-cells'];
      const selection = { startRow: 0, startCol: 0, endRow: 1, endCol: 1 };
      
      const result = command.execute(editor, selection);
      
      expect(result.success).toBe(true);
      expect(result.selection).toEqual(selection);
    });

    it('should not merge single cell', () => {
      const command = plugin.commands['merge-table-cells'];
      const selection = { startRow: 0, startCol: 0, endRow: 0, endCol: 0 };
      
      const result = command.execute(editor, selection);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Cannot merge single cell');
    });

    it('should split merged cell', () => {
      // Set up a merged cell
      const cell = mockTableInfo.data.rows[0][0];
      cell.rowspan = 2;
      cell.colspan = 2;
      
      const command = plugin.commands['split-table-cell'];
      const result = command.execute(editor);
      
      expect(result.success).toBe(true);
    });

    it('should not split unmerged cell', () => {
      const command = plugin.commands['split-table-cell'];
      const result = command.execute(editor);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Cell is not merged');
    });

    it('should set cell alignment', () => {
      const command = plugin.commands['set-cell-alignment'];
      const result = command.execute(editor, 'center');
      
      expect(result.success).toBe(true);
      expect(result.alignment).toBe('center');
    });

    it('should set cell style', () => {
      const command = plugin.commands['set-cell-style'];
      const styles = { backgroundColor: '#ff0000', bold: true };
      
      const result = command.execute(editor, styles);
      
      expect(result.success).toBe(true);
      expect(result.styles).toEqual(styles);
    });

    it('should set column width', () => {
      const command = plugin.commands['set-column-width'];
      const result = command.execute(editor, '100px');
      
      expect(result.success).toBe(true);
      expect(result.width).toBe('100px');
      expect(result.column).toBe(0);
    });

    it('should set table style', () => {
      const command = plugin.commands['set-table-style'];
      const styles = { borderStyle: 'dashed' as const, borderColor: '#000000' };
      
      const result = command.execute(editor, styles);
      
      expect(result.success).toBe(true);
      expect(result.styles).toEqual(styles);
    });
  });

  describe('command availability', () => {
    beforeEach(async () => {
      await plugin.install(editor);
    });

    it('should check insert-table availability', () => {
      const command = plugin.commands['insert-table'];
      
      editor.setText('Test');
      editor.setSelection({ index: 2, length: 0 });
      expect(command.canExecute(editor)).toBe(true);
      
      editor.setSelection(null);
      expect(command.canExecute(editor)).toBe(false);
    });

    it('should check table manipulation availability', () => {
      const commands = [
        'insert-table-row',
        'insert-table-column',
        'delete-table-row',
        'delete-table-column',
        'delete-table',
        'merge-table-cells',
        'set-cell-alignment',
        'set-cell-style',
        'set-column-width',
        'set-table-style'
      ];

      // Mock no table at cursor
      vi.spyOn(plugin as any, 'findTableAtCursor').mockReturnValue(null);
      
      commands.forEach(commandName => {
        const command = plugin.commands[commandName];
        expect(command.canExecute(editor)).toBe(false);
      });
    });

    it('should check split-cell availability for merged cells', () => {
      const mockTableInfo = {
        embedIndex: 5,
        data: { rows: [[{ content: 'A1', rowspan: 2 }]] } as TableData,
        rowIndex: 0,
        colIndex: 0
      };
      
      vi.spyOn(plugin as any, 'findTableAtCursor').mockReturnValue(mockTableInfo);
      
      const command = plugin.commands['split-table-cell'];
      expect(command.canExecute(editor)).toBe(true);
    });
  });

  describe('keyboard shortcuts', () => {
    beforeEach(async () => {
      await plugin.install(editor);
    });

    it('should handle Ctrl+Shift+T for table insertion', () => {
      const insertCommand = vi.spyOn(plugin.commands['insert-table'], 'execute');
      
      const event = new KeyboardEvent('keydown', {
        key: 't',
        ctrlKey: true,
        shiftKey: true,
        bubbles: true
      });
      
      editor.getRoot().dispatchEvent(event);
      expect(insertCommand).toHaveBeenCalled();
    });

    it('should handle F2 for table controls', () => {
      const showControlsSpy = vi.spyOn(plugin as any, 'showTableControls');
      vi.spyOn(plugin as any, 'findTableAtCursor').mockReturnValue({});
      
      const event = new KeyboardEvent('keydown', {
        key: 'F2',
        bubbles: true
      });
      
      editor.getRoot().dispatchEvent(event);
      expect(showControlsSpy).toHaveBeenCalled();
    });
  });
});
