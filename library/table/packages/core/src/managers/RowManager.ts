/**
 * 行管理器 - 处理选择、展开等
 */

import type {
  RowData,
  RowKey,
  SelectionState,
  SelectionMode,
  ExpandState,
} from '../types';

export class RowManager<TData extends RowData = RowData> {
  private selection: SelectionState;
  private expand: ExpandState;
  private rowKeyGetter: (row: TData, index: number) => RowKey;

  constructor(
    selectionMode: SelectionMode = false,
    rowKeyGetter: (row: TData, index: number) => RowKey
  ) {
    this.selection = {
      selectedRowKeys: new Set(),
      mode: selectionMode,
    };
    this.expand = {
      expandedRowKeys: new Set(),
    };
    this.rowKeyGetter = rowKeyGetter;
  }

  /**
   * 切换行选择
   */
  toggleRowSelection(rowKey: RowKey): void {
    if (this.selection.mode === false) return;

    if (this.selection.mode === 'single') {
      // 单选模式：清除其他选择
      this.selection.selectedRowKeys.clear();
      this.selection.selectedRowKeys.add(rowKey);
    } else {
      // 多选模式：切换当前行
      if (this.selection.selectedRowKeys.has(rowKey)) {
        this.selection.selectedRowKeys.delete(rowKey);
      } else {
        this.selection.selectedRowKeys.add(rowKey);
      }
    }
  }

  /**
   * 选择行
   */
  selectRow(rowKey: RowKey): void {
    if (this.selection.mode === false) return;

    if (this.selection.mode === 'single') {
      this.selection.selectedRowKeys.clear();
    }
    this.selection.selectedRowKeys.add(rowKey);
  }

  /**
   * 取消选择行
   */
  deselectRow(rowKey: RowKey): void {
    this.selection.selectedRowKeys.delete(rowKey);
  }

  /**
   * 全选
   */
  selectAll(rows: TData[]): void {
    if (this.selection.mode !== 'multiple') return;

    this.selection.selectedRowKeys.clear();
    rows.forEach((row, index) => {
      const key = this.rowKeyGetter(row, index);
      this.selection.selectedRowKeys.add(key);
    });
  }

  /**
   * 清除所有选择
   */
  clearSelection(): void {
    this.selection.selectedRowKeys.clear();
  }

  /**
   * 检查行是否被选中
   */
  isRowSelected(rowKey: RowKey): boolean {
    return this.selection.selectedRowKeys.has(rowKey);
  }

  /**
   * 获取选中的行键
   */
  getSelectedRowKeys(): RowKey[] {
    return Array.from(this.selection.selectedRowKeys);
  }

  /**
   * 获取选中的行数据
   */
  getSelectedRows(rows: TData[]): TData[] {
    const selectedKeys = this.selection.selectedRowKeys;
    return rows.filter((row, index) => {
      const key = this.rowKeyGetter(row, index);
      return selectedKeys.has(key);
    });
  }

  /**
   * 检查是否全选
   */
  isAllSelected(rows: TData[]): boolean {
    if (rows.length === 0) return false;
    return rows.every((row, index) => {
      const key = this.rowKeyGetter(row, index);
      return this.selection.selectedRowKeys.has(key);
    });
  }

  /**
   * 检查是否部分选中
   */
  isIndeterminate(rows: TData[]): boolean {
    const selectedCount = rows.filter((row, index) => {
      const key = this.rowKeyGetter(row, index);
      return this.selection.selectedRowKeys.has(key);
    }).length;
    return selectedCount > 0 && selectedCount < rows.length;
  }

  /**
   * 切换行展开
   */
  toggleRowExpand(rowKey: RowKey): void {
    if (this.expand.expandedRowKeys.has(rowKey)) {
      this.expand.expandedRowKeys.delete(rowKey);
    } else {
      this.expand.expandedRowKeys.add(rowKey);
    }
  }

  /**
   * 展开行
   */
  expandRow(rowKey: RowKey): void {
    this.expand.expandedRowKeys.add(rowKey);
  }

  /**
   * 折叠行
   */
  collapseRow(rowKey: RowKey): void {
    this.expand.expandedRowKeys.delete(rowKey);
  }

  /**
   * 展开所有行
   */
  expandAll(rows: TData[]): void {
    rows.forEach((row, index) => {
      const key = this.rowKeyGetter(row, index);
      this.expand.expandedRowKeys.add(key);
    });
  }

  /**
   * 折叠所有行
   */
  collapseAll(): void {
    this.expand.expandedRowKeys.clear();
  }

  /**
   * 检查行是否展开
   */
  isRowExpanded(rowKey: RowKey): boolean {
    return this.expand.expandedRowKeys.has(rowKey);
  }

  /**
   * 获取展开的行键
   */
  getExpandedRowKeys(): RowKey[] {
    return Array.from(this.expand.expandedRowKeys);
  }

  /**
   * 获取选择状态
   */
  getSelectionState(): SelectionState {
    return this.selection;
  }

  /**
   * 获取展开状态
   */
  getExpandState(): ExpandState {
    return this.expand;
  }

  /**
   * 设置选择模式
   */
  setSelectionMode(mode: SelectionMode): void {
    this.selection.mode = mode;
    if (mode === 'single' && this.selection.selectedRowKeys.size > 1) {
      // 切换到单选时，只保留第一个选中项
      const first = Array.from(this.selection.selectedRowKeys)[0];
      this.selection.selectedRowKeys.clear();
      if (first !== undefined) {
        this.selection.selectedRowKeys.add(first);
      }
    }
  }
}



