/**
 * 虚拟滚动工具
 */

export interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  totalItems: number;
  buffer?: number;
}

export interface VirtualScrollResult {
  startIndex: number;
  endIndex: number;
  offsetY: number;
  visibleItems: number;
}

/**
 * 计算虚拟滚动参数
 */
export function calculateVirtualScroll(
  scrollTop: number,
  options: VirtualScrollOptions
): VirtualScrollResult {
  const { itemHeight, containerHeight, totalItems, buffer = 3 } = options;
  
  // 可见区域可以容纳的项目数
  const visibleItems = Math.ceil(containerHeight / itemHeight);
  
  // 当前滚动位置的起始索引
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
  
  // 结束索引
  const endIndex = Math.min(totalItems - 1, startIndex + visibleItems + buffer * 2);
  
  // 偏移量
  const offsetY = startIndex * itemHeight;
  
  return {
    startIndex,
    endIndex,
    offsetY,
    visibleItems,
  };
}

/**
 * 虚拟滚动类
 */
export class VirtualScroller<T> {
  private items: T[];
  private options: VirtualScrollOptions;
  private scrollTop = 0;
  
  constructor(items: T[], options: VirtualScrollOptions) {
    this.items = items;
    this.options = { ...options, totalItems: items.length };
  }
  
  /**
   * 更新滚动位置
   */
  updateScrollTop(scrollTop: number): void {
    this.scrollTop = scrollTop;
  }
  
  /**
   * 获取可见项目
   */
  getVisibleItems(): T[] {
    const { startIndex, endIndex } = this.getScrollInfo();
    return this.items.slice(startIndex, endIndex + 1);
  }
  
  /**
   * 获取滚动信息
   */
  getScrollInfo(): VirtualScrollResult {
    return calculateVirtualScroll(this.scrollTop, this.options);
  }
  
  /**
   * 获取总高度
   */
  getTotalHeight(): number {
    return this.items.length * this.options.itemHeight;
  }
  
  /**
   * 滚动到指定项目
   */
  scrollToIndex(index: number): number {
    return index * this.options.itemHeight;
  }
  
  /**
   * 更新项目列表
   */
  updateItems(items: T[]): void {
    this.items = items;
    this.options.totalItems = items.length;
  }
}

/**
 * 创建虚拟滚动容器样式
 */
export function createVirtualScrollStyle(result: VirtualScrollResult, totalHeight: number): {
  container: Record<string, string>;
  content: Record<string, string>;
} {
  return {
    container: {
      position: 'relative',
      height: `${totalHeight}px`,
      overflow: 'auto',
    },
    content: {
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      transform: `translateY(${result.offsetY}px)`,
    },
  };
}




