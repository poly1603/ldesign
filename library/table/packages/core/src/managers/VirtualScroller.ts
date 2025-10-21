/**
 * 虚拟滚动引擎
 */

import type { VirtualScrollState, Column, RowData } from '../types';

export interface VirtualRange {
  start: number;
  end: number;
  offset: number;
  size: number;
}

export class VirtualScroller<TData extends RowData = RowData> {
  private state: VirtualScrollState;
  private rowHeight: number;
  private headerHeight: number;
  private totalRows: number = 0;
  private columnWidths: number[] = [];

  constructor(
    containerHeight: number,
    containerWidth: number,
    rowHeight: number,
    headerHeight: number,
    overscan: number = 3
  ) {
    this.rowHeight = rowHeight;
    this.headerHeight = headerHeight;
    this.state = {
      containerHeight,
      containerWidth,
      scrollTop: 0,
      scrollLeft: 0,
      visibleRowRange: { start: 0, end: 0 },
      visibleColumnRange: { start: 0, end: 0 },
      overscan,
    };
  }

  /**
   * 设置总行数
   */
  setTotalRows(count: number): void {
    this.totalRows = count;
    this.calculateVisibleRowRange();
  }

  /**
   * 设置列信息
   */
  setColumns(columns: Column<TData>[]): void {
    this.columnWidths = columns.map((col) => col.computedWidth);
    this.calculateVisibleColumnRange();
  }

  /**
   * 设置容器尺寸
   */
  setContainerSize(width: number, height: number): void {
    this.state.containerWidth = width;
    this.state.containerHeight = height;
    this.calculateVisibleRowRange();
    this.calculateVisibleColumnRange();
  }

  /**
   * 设置垂直滚动位置
   */
  setScrollTop(scrollTop: number): void {
    this.state.scrollTop = Math.max(0, scrollTop);
    this.calculateVisibleRowRange();
  }

  /**
   * 设置水平滚动位置
   */
  setScrollLeft(scrollLeft: number): void {
    this.state.scrollLeft = Math.max(0, scrollLeft);
    this.calculateVisibleColumnRange();
  }

  /**
   * 计算可见行范围
   */
  private calculateVisibleRowRange(): void {
    const { containerHeight, scrollTop, overscan } = this.state;
    
    const startIndex = Math.floor(scrollTop / this.rowHeight);
    const visibleCount = Math.ceil(containerHeight / this.rowHeight);
    const endIndex = startIndex + visibleCount;

    // 添加缓冲区
    const bufferedStart = Math.max(0, startIndex - overscan);
    const bufferedEnd = Math.min(this.totalRows, endIndex + overscan);

    this.state.visibleRowRange = {
      start: bufferedStart,
      end: bufferedEnd,
    };
  }

  /**
   * 计算可见列范围
   */
  private calculateVisibleColumnRange(): void {
    const { containerWidth, scrollLeft, overscan } = this.state;

    let startIndex = 0;
    let endIndex = 0;
    let accumulatedWidth = 0;

    // 找到起始列
    for (let i = 0; i < this.columnWidths.length; i++) {
      if (accumulatedWidth + this.columnWidths[i] > scrollLeft) {
        startIndex = i;
        break;
      }
      accumulatedWidth += this.columnWidths[i];
    }

    // 找到结束列
    accumulatedWidth = 0;
    for (let i = startIndex; i < this.columnWidths.length; i++) {
      accumulatedWidth += this.columnWidths[i];
      if (accumulatedWidth >= containerWidth) {
        endIndex = i + 1;
        break;
      }
    }

    if (endIndex === 0) {
      endIndex = this.columnWidths.length;
    }

    // 添加缓冲区
    const bufferedStart = Math.max(0, startIndex - overscan);
    const bufferedEnd = Math.min(this.columnWidths.length, endIndex + overscan);

    this.state.visibleColumnRange = {
      start: bufferedStart,
      end: bufferedEnd,
    };
  }

  /**
   * 获取可见行范围（带偏移量和尺寸）
   */
  getVisibleRowRange(): VirtualRange {
    const { start, end } = this.state.visibleRowRange;
    return {
      start,
      end,
      offset: start * this.rowHeight,
      size: (end - start) * this.rowHeight,
    };
  }

  /**
   * 获取可见列范围（带偏移量和尺寸）
   */
  getVisibleColumnRange(): VirtualRange {
    const { start, end } = this.state.visibleColumnRange;
    let offset = 0;
    let size = 0;

    for (let i = 0; i < start; i++) {
      offset += this.columnWidths[i] || 0;
    }

    for (let i = start; i < end; i++) {
      size += this.columnWidths[i] || 0;
    }

    return {
      start,
      end,
      offset,
      size,
    };
  }

  /**
   * 获取总高度
   */
  getTotalHeight(): number {
    return this.totalRows * this.rowHeight + this.headerHeight;
  }

  /**
   * 获取总宽度
   */
  getTotalWidth(): number {
    return this.columnWidths.reduce((sum, width) => sum + width, 0);
  }

  /**
   * 获取当前状态
   */
  getState(): VirtualScrollState {
    return this.state;
  }

  /**
   * 滚动到指定行
   */
  scrollToRow(rowIndex: number): number {
    const scrollTop = Math.max(0, rowIndex * this.rowHeight);
    this.setScrollTop(scrollTop);
    return scrollTop;
  }

  /**
   * 滚动到指定列
   */
  scrollToColumn(columnIndex: number): number {
    let scrollLeft = 0;
    for (let i = 0; i < columnIndex && i < this.columnWidths.length; i++) {
      scrollLeft += this.columnWidths[i];
    }
    this.setScrollLeft(scrollLeft);
    return scrollLeft;
  }
}


