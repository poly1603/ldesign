/**
 * 表格核心类 - Headless架构
 */

import type {
  RowData,
  RowKey,
  TableOptions,
  TableState,
  TableEvents,
  StateListener,
  Unsubscribe,
  SortingState,
  FilterState,
  PaginationState,
} from './types';
import { ColumnManager } from './managers/ColumnManager';
import { DataManager } from './managers/DataManager';
import { RowManager } from './managers/RowManager';
import { VirtualScroller } from './managers/VirtualScroller';
import { EditManager } from './managers/EditManager';
import { ExportManager, ExportOptions } from './managers/ExportManager';
import { getRowKey } from './utils';

export class TableCore<TData extends RowData = RowData> {
  private options: Required<TableOptions<TData>>;
  private state: TableState<TData>;
  private listeners: Set<StateListener<TData>> = new Set();
  private events: TableEvents<TData> = {};

  // 管理器
  private columnManager: ColumnManager<TData>;
  private dataManager: DataManager<TData>;
  private rowManager: RowManager<TData>;
  private virtualScroller: VirtualScroller<TData> | null = null;
  private editManager: EditManager;
  private exportManager: ExportManager<TData>;

  constructor(options: TableOptions<TData>) {
    // 合并默认配置
    this.options = {
      rowKey: 'id' as keyof TData,
      rowHeight: 48,
      headerHeight: 48,
      virtual: false,
      overscan: 3,
      stripe: false,
      border: false,
      selectionMode: false,
      defaultSelectedRowKeys: [],
      defaultExpandedRowKeys: [],
      defaultSorting: [],
      defaultFilters: [],
      ...options,
    } as Required<TableOptions<TData>>;

    // 初始化管理器
    this.columnManager = new ColumnManager(this.options.columns);
    this.dataManager = new DataManager(this.options.data);
    this.rowManager = new RowManager(
      this.options.selectionMode,
      (row, index) => this.getRowKeyValue(row, index)
    );
    this.editManager = new EditManager();
    this.exportManager = new ExportManager();

    // 初始化虚拟滚动
    if (this.options.virtual) {
      this.virtualScroller = new VirtualScroller(
        600, // 默认容器高度
        800, // 默认容器宽度
        this.options.rowHeight,
        this.options.headerHeight,
        this.options.overscan
      );
      this.virtualScroller.setTotalRows(this.options.data.length);
      this.virtualScroller.setColumns(this.columnManager.getFlatColumns());
    }

    // 初始化状态
    this.state = this.buildState();

    // 应用默认状态
    if (this.options.defaultSorting.length > 0) {
      this.setSorting(this.options.defaultSorting);
    }
    if (this.options.defaultFilters.length > 0) {
      this.setFilters(this.options.defaultFilters);
    }
    if (this.options.defaultPagination) {
      this.setPagination(this.options.defaultPagination);
    }
    if (this.options.defaultSelectedRowKeys.length > 0) {
      this.options.defaultSelectedRowKeys.forEach((key) => {
        this.rowManager.selectRow(key);
      });
    }
    if (this.options.defaultExpandedRowKeys.length > 0) {
      this.options.defaultExpandedRowKeys.forEach((key) => {
        this.rowManager.expandRow(key);
      });
    }
  }

  /**
   * 构建状态
   */
  private buildState(): TableState<TData> {
    return {
      rawData: this.dataManager.getRawData(),
      processedData: this.dataManager.getProcessedData(),
      columns: this.columnManager.getFlatColumns(),
      sorting: this.dataManager.getSorting(),
      filters: this.dataManager.getFilters(),
      pagination: this.dataManager.getPagination(),
      selection: this.rowManager.getSelectionState(),
      expand: this.rowManager.getExpandState(),
      edit: this.editManager.getState(),
      virtualScroll: this.virtualScroller?.getState() ?? null,
    };
  }

  /**
   * 通知状态更新
   */
  private notifyUpdate(): void {
    this.state = this.buildState();
    this.listeners.forEach((listener) => listener(this.state));
  }

  /**
   * 获取行键值
   */
  private getRowKeyValue(row: TData, index: number): RowKey {
    return getRowKey(row, this.options.rowKey, index);
  }

  // ============== 公共API ==============

  /**
   * 设置数据
   */
  setData(data: TData[]): void {
    this.dataManager.setData(data);
    if (this.virtualScroller) {
      this.virtualScroller.setTotalRows(data.length);
    }
    this.notifyUpdate();
    this.events.onDataChange?.(data);
  }

  /**
   * 获取数据
   */
  getData(): TData[] {
    return this.dataManager.getProcessedData();
  }

  /**
   * 获取原始数据
   */
  getRawData(): TData[] {
    return this.dataManager.getRawData();
  }

  /**
   * 设置排序
   */
  setSorting(sorting: SortingState): void {
    this.dataManager.setSorting(sorting, this.columnManager.getFlatColumns());
    this.notifyUpdate();
    this.events.onSortChange?.(sorting);
  }

  /**
   * 设置筛选
   */
  setFilters(filters: FilterState): void {
    this.dataManager.setFilters(filters);
    this.notifyUpdate();
    this.events.onFilterChange?.(filters);
  }

  /**
   * 设置分页
   */
  setPagination(pagination: PaginationState | null): void {
    this.dataManager.setPagination(pagination);
    this.notifyUpdate();
    this.events.onPaginationChange?.(pagination!);
  }

  /**
   * 切换行选择
   */
  toggleRowSelection(rowKey: RowKey): void {
    this.rowManager.toggleRowSelection(rowKey);
    this.notifyUpdate();
    const selectedRows = this.rowManager.getSelectedRows(this.getData());
    this.events.onSelectionChange?.(
      this.rowManager.getSelectedRowKeys(),
      selectedRows
    );
  }

  /**
   * 全选/取消全选
   */
  toggleSelectAll(): void {
    const data = this.getData();
    if (this.rowManager.isAllSelected(data)) {
      this.rowManager.clearSelection();
    } else {
      this.rowManager.selectAll(data);
    }
    this.notifyUpdate();
    const selectedRows = this.rowManager.getSelectedRows(data);
    this.events.onSelectionChange?.(
      this.rowManager.getSelectedRowKeys(),
      selectedRows
    );
  }

  /**
   * 获取选中行
   */
  getSelectedRows(): TData[] {
    return this.rowManager.getSelectedRows(this.getData());
  }

  /**
   * 切换行展开
   */
  toggleRowExpand(rowKey: RowKey): void {
    this.rowManager.toggleRowExpand(rowKey);
    this.notifyUpdate();
    this.events.onExpandChange?.(this.rowManager.getExpandedRowKeys());
  }

  /**
   * 调整列宽
   */
  resizeColumn(columnId: string, width: number): void {
    this.columnManager.resizeColumn(columnId, width);
    if (this.virtualScroller) {
      this.virtualScroller.setColumns(this.columnManager.getFlatColumns());
    }
    this.notifyUpdate();
  }

  /**
   * 设置虚拟滚动位置
   */
  setScrollTop(scrollTop: number): void {
    if (!this.virtualScroller) return;
    this.virtualScroller.setScrollTop(scrollTop);
    this.notifyUpdate();
  }

  /**
   * 设置水平滚动位置
   */
  setScrollLeft(scrollLeft: number): void {
    if (!this.virtualScroller) return;
    this.virtualScroller.setScrollLeft(scrollLeft);
    this.notifyUpdate();
  }

  /**
   * 设置容器尺寸
   */
  setContainerSize(width: number, height: number): void {
    if (!this.virtualScroller) return;
    this.virtualScroller.setContainerSize(width, height);
    this.notifyUpdate();
  }

  /**
   * 获取可见行范围
   */
  getVisibleRange(): { start: number; end: number } | null {
    if (!this.virtualScroller) return null;
    const range = this.virtualScroller.getVisibleRowRange();
    return { start: range.start, end: range.end };
  }

  /**
   * 开始编辑单元格
   */
  startEdit(rowKey: RowKey, columnId: string, currentValue: any): void {
    this.editManager.startEdit(rowKey, columnId, currentValue);
    this.notifyUpdate();
  }

  /**
   * 更新单元格
   */
  updateCell(rowKey: RowKey, columnId: string, value: any): void {
    this.editManager.updateCell(rowKey, columnId, value);
    this.notifyUpdate();
    this.events.onCellEdit?.({ rowKey, columnId, value });
  }

  /**
   * 结束编辑
   */
  endEdit(rowKey: RowKey, columnId: string): void {
    const cell = this.editManager.endEdit(rowKey, columnId);
    this.notifyUpdate();
    if (cell) {
      this.events.onCellEdit?.(cell);
    }
  }

  /**
   * 导出数据
   */
  exportData(options: ExportOptions): void {
    const data = this.getData();
    const columns = this.columnManager.getFlatColumns();
    this.exportManager.export(data, columns, options);
  }

  /**
   * 订阅状态变化
   */
  subscribe(listener: StateListener<TData>): Unsubscribe {
    this.listeners.add(listener);
    // 立即调用一次
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * 设置事件监听器
   */
  on<K extends keyof TableEvents<TData>>(
    event: K,
    handler: TableEvents<TData>[K]
  ): void {
    this.events[event] = handler;
  }

  /**
   * 移除事件监听器
   */
  off<K extends keyof TableEvents<TData>>(event: K): void {
    delete this.events[event];
  }

  /**
   * 获取当前状态
   */
  getState(): TableState<TData> {
    return this.state;
  }

  /**
   * 获取列管理器
   */
  getColumnManager(): ColumnManager<TData> {
    return this.columnManager;
  }

  /**
   * 销毁实例
   */
  destroy(): void {
    this.listeners.clear();
    this.events = {};
  }
}


