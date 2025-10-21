/**
 * 编辑管理器
 */

import type { RowKey, EditCell, EditState } from '../types';

export interface EditHistory {
  undo: EditCell[];
  redo: EditCell[];
}

export class EditManager {
  private state: EditState;
  private history: EditHistory;
  private maxHistorySize: number = 50;

  constructor() {
    this.state = {
      editingCells: new Map(),
    };
    this.history = {
      undo: [],
      redo: [],
    };
  }

  /**
   * 开始编辑单元格
   */
  startEdit(rowKey: RowKey, columnId: string, currentValue: any): void {
    const cellKey = this.getCellKey(rowKey, columnId);
    this.state.editingCells.set(cellKey, {
      rowKey,
      columnId,
      value: currentValue,
    });
  }

  /**
   * 更新单元格值
   */
  updateCell(rowKey: RowKey, columnId: string, value: any): void {
    const cellKey = this.getCellKey(rowKey, columnId);
    const cell = this.state.editingCells.get(cellKey);
    
    if (cell) {
      // 保存到历史记录
      this.addToHistory({ ...cell });
      cell.value = value;
    } else {
      this.state.editingCells.set(cellKey, {
        rowKey,
        columnId,
        value,
      });
    }
  }

  /**
   * 结束编辑
   */
  endEdit(rowKey: RowKey, columnId: string): EditCell | undefined {
    const cellKey = this.getCellKey(rowKey, columnId);
    const cell = this.state.editingCells.get(cellKey);
    this.state.editingCells.delete(cellKey);
    return cell;
  }

  /**
   * 取消编辑
   */
  cancelEdit(rowKey: RowKey, columnId: string): void {
    const cellKey = this.getCellKey(rowKey, columnId);
    this.state.editingCells.delete(cellKey);
  }

  /**
   * 检查单元格是否在编辑中
   */
  isEditing(rowKey: RowKey, columnId: string): boolean {
    const cellKey = this.getCellKey(rowKey, columnId);
    return this.state.editingCells.has(cellKey);
  }

  /**
   * 获取编辑中的单元格
   */
  getEditingCell(rowKey: RowKey, columnId: string): EditCell | undefined {
    const cellKey = this.getCellKey(rowKey, columnId);
    return this.state.editingCells.get(cellKey);
  }

  /**
   * 获取所有编辑中的单元格
   */
  getAllEditingCells(): EditCell[] {
    return Array.from(this.state.editingCells.values());
  }

  /**
   * 清除所有编辑
   */
  clearAll(): void {
    this.state.editingCells.clear();
  }

  /**
   * 添加到历史记录
   */
  private addToHistory(cell: EditCell): void {
    this.history.undo.push(cell);
    if (this.history.undo.length > this.maxHistorySize) {
      this.history.undo.shift();
    }
    // 清除重做栈
    this.history.redo = [];
  }

  /**
   * 撤销
   */
  undo(): EditCell | undefined {
    const cell = this.history.undo.pop();
    if (cell) {
      this.history.redo.push(cell);
      const cellKey = this.getCellKey(cell.rowKey, cell.columnId);
      this.state.editingCells.set(cellKey, cell);
    }
    return cell;
  }

  /**
   * 重做
   */
  redo(): EditCell | undefined {
    const cell = this.history.redo.pop();
    if (cell) {
      this.history.undo.push(cell);
      const cellKey = this.getCellKey(cell.rowKey, cell.columnId);
      this.state.editingCells.set(cellKey, cell);
    }
    return cell;
  }

  /**
   * 检查是否可以撤销
   */
  canUndo(): boolean {
    return this.history.undo.length > 0;
  }

  /**
   * 检查是否可以重做
   */
  canRedo(): boolean {
    return this.history.redo.length > 0;
  }

  /**
   * 获取单元格键
   */
  private getCellKey(rowKey: RowKey, columnId: string): string {
    return `${rowKey}:${columnId}`;
  }

  /**
   * 获取编辑状态
   */
  getState(): EditState {
    return this.state;
  }
}



