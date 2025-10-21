/**
 * Grid 布局引擎
 * 实现12列网格布局系统
 */

import type { LayoutConfig, GridContainerConfig, LayoutPosition, LayoutEngine } from '../../types';
import type { ComponentNode } from '../../types/schema';

/**
 * Grid 布局引擎类
 */
export class GridLayoutEngine implements LayoutEngine {
  // 默认12列网格
  private columns = 12;
  private gap = 16;
  private defaultSpan = 12;

  constructor(config?: { columns?: number; gap?: number }) {
    if (config) {
      if (config.columns) this.columns = config.columns;
      if (config.gap) this.gap = config.gap;
    }
  }

  /**
   * 生成容器样式
   */
  generateContainerStyle(config?: Partial<GridContainerConfig>): Record<string, any> {
    return {
      display: 'grid',
      gridTemplateColumns: config?.gridTemplateColumns || `repeat(${this.columns}, 1fr)`,
      gridTemplateRows: config?.gridTemplateRows || 'auto',
      gap: config?.gap !== undefined ? `${config.gap}px` : `${this.gap}px`,
      columnGap: config?.columnGap !== undefined ? `${config.columnGap}px` : undefined,
      rowGap: config?.rowGap !== undefined ? `${config.rowGap}px` : undefined,
      justifyItems: config?.justifyItems,
      alignItems: config?.alignItems,
      justifyContent: config?.justifyContent,
      alignContent: config?.alignContent,
      gridAutoColumns: config?.gridAutoColumns,
      gridAutoRows: config?.gridAutoRows,
      gridAutoFlow: config?.gridAutoFlow
    };
  }

  /**
   * 生成组件样式
   */
  generateComponentStyle(layout: LayoutConfig): Record<string, any> {
    const style: Record<string, any> = {};

    // Grid 列位置
    if (layout.gridColumn) {
      style.gridColumn = layout.gridColumn;
    } else {
      style.gridColumn = `span ${this.defaultSpan}`;
    }

    // Grid 行位置
    if (layout.gridRow) {
      style.gridRow = layout.gridRow;
    }

    // Grid 区域
    if (layout.gridArea) {
      style.gridArea = layout.gridArea;
    }

    // 对齐
    if (layout.justifySelf) {
      style.justifySelf = layout.justifySelf;
    }
    if (layout.alignSelf) {
      style.alignSelf = layout.alignSelf;
    }

    // 尺寸
    if (layout.width) {
      style.width = typeof layout.width === 'number' ? `${layout.width}px` : layout.width;
    }
    if (layout.height) {
      style.height = typeof layout.height === 'number' ? `${layout.height}px` : layout.height;
    }
    if (layout.minWidth) {
      style.minWidth = typeof layout.minWidth === 'number' ? `${layout.minWidth}px` : layout.minWidth;
    }
    if (layout.maxWidth) {
      style.maxWidth = typeof layout.maxWidth === 'number' ? `${layout.maxWidth}px` : layout.maxWidth;
    }
    if (layout.minHeight) {
      style.minHeight = typeof layout.minHeight === 'number' ? `${layout.minHeight}px` : layout.minHeight;
    }
    if (layout.maxHeight) {
      style.maxHeight = typeof layout.maxHeight === 'number' ? `${layout.maxHeight}px` : layout.maxHeight;
    }

    // 边距
    if (layout.margin) {
      style.margin = typeof layout.margin === 'number' ? `${layout.margin}px` : layout.margin;
    }
    if (layout.padding) {
      style.padding = typeof layout.padding === 'number' ? `${layout.padding}px` : layout.padding;
    }

    return style;
  }

  /**
   * 计算组件位置
   */
  calculatePosition(component: ComponentNode, container: HTMLElement): LayoutPosition {
    const element = container.querySelector(`[data-component-id="${component.id}"]`) as HTMLElement;
    if (!element) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    const rect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    return {
      x: rect.left - containerRect.left,
      y: rect.top - containerRect.top,
      width: rect.width,
      height: rect.height
    };
  }

  /**
   * 计算拖放位置
   */
  calculateDropPosition(event: DragEvent, container: HTMLElement): Partial<LayoutConfig> {
    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // 计算列位置
    const columnWidth = rect.width / this.columns;
    const column = Math.floor(x / columnWidth);

    // 计算占用列数（默认占6列，半宽）
    const span = 6;
    const startColumn = Math.max(0, Math.min(column, this.columns - span));

    return {
      type: 'grid',
      gridColumn: `${startColumn + 1} / span ${span}`
    };
  }

  /**
   * 计算组件所在的列范围
   */
  getColumnRange(layout: LayoutConfig): { start: number; span: number } {
    const gridColumn = layout.gridColumn || `span ${this.defaultSpan}`;

    // 解析 gridColumn
    // 支持格式：
    // - "span 6"
    // - "1 / span 6"
    // - "1 / 7"
    // - "1 / -1"

    const spanMatch = gridColumn.match(/span\s+(\d+)/);
    if (spanMatch) {
      const span = parseInt(spanMatch[1], 10);
      const startMatch = gridColumn.match(/^(\d+)\s+\/\s+span/);
      const start = startMatch ? parseInt(startMatch[1], 10) : 1;
      return { start, span };
    }

    const rangeMatch = gridColumn.match(/^(\d+)\s+\/\s+(\d+)$/);
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1], 10);
      const end = parseInt(rangeMatch[2], 10);
      return { start, span: end - start };
    }

    // 默认
    return { start: 1, span: this.defaultSpan };
  }

  /**
   * 设置组件列位置
   */
  setColumnPosition(layout: LayoutConfig, start: number, span: number): LayoutConfig {
    return {
      ...layout,
      gridColumn: `${start} / span ${span}`
    };
  }

  /**
   * 调整组件大小
   */
  resizeComponent(layout: LayoutConfig, delta: { columns?: number; rows?: number }): LayoutConfig {
    const { start, span } = this.getColumnRange(layout);

    if (delta.columns !== undefined) {
      const newSpan = Math.max(1, Math.min(span + delta.columns, this.columns - start + 1));
      return this.setColumnPosition(layout, start, newSpan);
    }

    return layout;
  }

  /**
   * 获取网格单元格信息
   */
  getCellInfo(container: HTMLElement, position: { x: number; y: number }): { column: number; row: number } {
    const columnWidth = container.clientWidth / this.columns;
    const column = Math.floor(position.x / columnWidth);

    // 行计算需要知道每行的高度，这里简化处理
    const row = 0;

    return {
      column: Math.max(0, Math.min(column, this.columns - 1)),
      row
    };
  }

  /**
   * 验证布局配置
   */
  validateLayout(layout: LayoutConfig): boolean {
    if (layout.type !== 'grid') return false;

    const { start, span } = this.getColumnRange(layout);

    // 检查列范围是否有效
    if (start < 1 || start > this.columns) return false;
    if (span < 1 || start + span - 1 > this.columns) return false;

    return true;
  }

  /**
   * 获取列数
   */
  getColumns(): number {
    return this.columns;
  }

  /**
   * 设置列数
   */
  setColumns(columns: number): void {
    this.columns = Math.max(1, columns);
  }

  /**
   * 获取间距
   */
  getGap(): number {
    return this.gap;
  }

  /**
   * 设置间距
   */
  setGap(gap: number): void {
    this.gap = Math.max(0, gap);
  }
}

/**
 * 创建 Grid 布局引擎实例
 */
export function createGridLayout(config?: { columns?: number; gap?: number }): GridLayoutEngine {
  return new GridLayoutEngine(config);
}



