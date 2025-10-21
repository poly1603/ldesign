/**
 * 列管理器
 */

import type { ColumnDef, Column, RowData } from '../types';
import { generateId } from '../utils';

export class ColumnManager<TData extends RowData = RowData> {
  private columns: Column<TData>[] = [];
  private columnMap: Map<string, Column<TData>> = new Map();
  private leftFixedColumns: Column<TData>[] = [];
  private rightFixedColumns: Column<TData>[] = [];
  private normalColumns: Column<TData>[] = [];

  constructor(columnDefs: ColumnDef<TData>[]) {
    this.columns = this.normalizeColumns(columnDefs);
    this.buildColumnMap();
    this.categorizeColumns();
    this.calculateFixedOffsets();
  }

  /**
   * 规范化列定义
   */
  private normalizeColumns(
    defs: ColumnDef<TData>[],
    level = 0,
    parentId?: string
  ): Column<TData>[] {
    return defs.map((def) => {
      const id = def.id || (def.prop as string) || generateId('col');
      const column: Column<TData> = {
        id,
        prop: def.prop ?? ('' as any),
        label: def.label ?? '',
        width: def.width ?? 0,
        minWidth: def.minWidth ?? 80,
        maxWidth: def.maxWidth ?? Infinity,
        align: def.align ?? 'left',
        fixed: def.fixed ?? false,
        sortable: def.sortable ?? false,
        filterable: def.filterable ?? false,
        resizable: def.resizable ?? true,
        render: def.render ?? ((row: TData) => row[def.prop as keyof TData]),
        formatter: def.formatter ?? undefined,
        sortFn: def.sortFn ?? undefined,
        filterFn: def.filterFn ?? undefined,
        level,
        parentId,
        computedWidth: def.width ?? def.minWidth ?? 100,
      };

      if (def.children && def.children.length > 0) {
        column.children = this.normalizeColumns(def.children, level + 1, id);
      }

      return column;
    });
  }

  /**
   * 构建列映射
   */
  private buildColumnMap(): void {
    const traverse = (columns: Column<TData>[]) => {
      for (const col of columns) {
        this.columnMap.set(col.id, col);
        if (col.children) {
          traverse(col.children);
        }
      }
    };
    traverse(this.columns);
  }

  /**
   * 分类列（固定列和普通列）
   */
  private categorizeColumns(): void {
    const flatColumns = this.getFlatColumns();
    this.leftFixedColumns = flatColumns.filter((col) => col.fixed === 'left');
    this.rightFixedColumns = flatColumns.filter((col) => col.fixed === 'right');
    this.normalColumns = flatColumns.filter((col) => !col.fixed);
  }

  /**
   * 计算固定列偏移量
   */
  private calculateFixedOffsets(): void {
    let leftOffset = 0;
    for (const col of this.leftFixedColumns) {
      col.fixedOffset = leftOffset;
      leftOffset += col.computedWidth;
    }

    let rightOffset = 0;
    for (let i = this.rightFixedColumns.length - 1; i >= 0; i--) {
      const col = this.rightFixedColumns[i];
      col.fixedOffset = rightOffset;
      rightOffset += col.computedWidth;
    }
  }

  /**
   * 获取扁平化的列列表（叶子节点）
   */
  getFlatColumns(): Column<TData>[] {
    const result: Column<TData>[] = [];
    const traverse = (columns: Column<TData>[]) => {
      for (const col of columns) {
        if (col.children && col.children.length > 0) {
          traverse(col.children);
        } else {
          result.push(col);
        }
      }
    };
    traverse(this.columns);
    return result;
  }

  /**
   * 获取所有列（包括父节点）
   */
  getAllColumns(): Column<TData>[] {
    return this.columns;
  }

  /**
   * 根据ID获取列
   */
  getColumnById(id: string): Column<TData> | undefined {
    return this.columnMap.get(id);
  }

  /**
   * 获取左固定列
   */
  getLeftFixedColumns(): Column<TData>[] {
    return this.leftFixedColumns;
  }

  /**
   * 获取右固定列
   */
  getRightFixedColumns(): Column<TData>[] {
    return this.rightFixedColumns;
  }

  /**
   * 获取普通列
   */
  getNormalColumns(): Column<TData>[] {
    return this.normalColumns;
  }

  /**
   * 调整列宽
   */
  resizeColumn(columnId: string, width: number): void {
    const column = this.getColumnById(columnId);
    if (!column || !column.resizable) return;

    // 限制宽度范围
    const newWidth = Math.max(
      column.minWidth,
      Math.min(column.maxWidth, width)
    );
    column.computedWidth = newWidth;
    column.width = newWidth;

    // 重新计算固定列偏移
    this.calculateFixedOffsets();
  }

  /**
   * 获取总宽度
   */
  getTotalWidth(): number {
    return this.getFlatColumns().reduce(
      (sum, col) => sum + col.computedWidth,
      0
    );
  }

  /**
   * 更新列顺序（用于拖拽排序）
   */
  reorderColumns(fromIndex: number, toIndex: number): void {
    const flatColumns = this.getFlatColumns();
    const [removed] = flatColumns.splice(fromIndex, 1);
    flatColumns.splice(toIndex, 0, removed);
    
    // 重新分类和计算偏移
    this.categorizeColumns();
    this.calculateFixedOffsets();
  }
}


