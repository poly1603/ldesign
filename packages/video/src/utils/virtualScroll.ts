/**
 * 虚拟滚动优化工具
 * 用于优化大量数据的渲染性能
 */

export interface VirtualScrollItem {
  id: string | number;
  height?: number;
  data: any;
}

export interface VirtualScrollConfig {
  itemHeight: number; // 默认项目高度
  containerHeight: number; // 容器高度
  overscan: number; // 预渲染项目数量
  threshold: number; // 滚动阈值
  estimatedItemHeight?: number; // 估算项目高度
  dynamic: boolean; // 是否支持动态高度
}

export interface VirtualScrollState {
  scrollTop: number;
  startIndex: number;
  endIndex: number;
  visibleItems: VirtualScrollItem[];
  totalHeight: number;
  offsetY: number;
}

export class VirtualScroll {
  private config: VirtualScrollConfig;
  private items: VirtualScrollItem[] = [];
  private itemHeights: Map<string | number, number> = new Map();
  private state: VirtualScrollState;
  private container: HTMLElement | null = null;
  private scrollListener: ((event: Event) => void) | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private callbacks: Map<string, Function[]> = new Map();

  constructor(config: VirtualScrollConfig) {
    this.config = config;
    this.state = {
      scrollTop: 0,
      startIndex: 0,
      endIndex: 0,
      visibleItems: [],
      totalHeight: 0,
      offsetY: 0
    };

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(this.handleResize.bind(this));
    }
  }

  /**
   * 设置数据
   */
  public setItems(items: VirtualScrollItem[]): void {
    this.items = items;
    this.updateState();
    this.emit('items-changed', this.state);
  }

  /**
   * 添加项目
   */
  public addItem(item: VirtualScrollItem, index?: number): void {
    if (index !== undefined) {
      this.items.splice(index, 0, item);
    } else {
      this.items.push(item);
    }
    this.updateState();
    this.emit('item-added', { item, index });
  }

  /**
   * 移除项目
   */
  public removeItem(id: string | number): void {
    const index = this.items.findIndex(item => item.id === id);
    if (index > -1) {
      const item = this.items.splice(index, 1)[0];
      this.itemHeights.delete(id);
      this.updateState();
      this.emit('item-removed', { item, index });
    }
  }

  /**
   * 更新项目
   */
  public updateItem(id: string | number, data: any): void {
    const item = this.items.find(item => item.id === id);
    if (item) {
      item.data = data;
      this.emit('item-updated', item);
    }
  }

  /**
   * 绑定容器
   */
  public bindContainer(container: HTMLElement): void {
    this.unbindContainer();
    
    this.container = container;
    this.config.containerHeight = container.clientHeight;

    // 添加滚动监听
    this.scrollListener = this.handleScroll.bind(this);
    container.addEventListener('scroll', this.scrollListener, { passive: true });

    // 添加尺寸监听
    if (this.resizeObserver) {
      this.resizeObserver.observe(container);
    }

    this.updateState();
  }

  /**
   * 解绑容器
   */
  public unbindContainer(): void {
    if (this.container && this.scrollListener) {
      this.container.removeEventListener('scroll', this.scrollListener);
    }

    if (this.resizeObserver && this.container) {
      this.resizeObserver.unobserve(this.container);
    }

    this.container = null;
    this.scrollListener = null;
  }

  /**
   * 滚动到指定项目
   */
  public scrollToItem(id: string | number, align: 'start' | 'center' | 'end' = 'start'): void {
    const index = this.items.findIndex(item => item.id === id);
    if (index === -1 || !this.container) {
      return;
    }

    this.scrollToIndex(index, align);
  }

  /**
   * 滚动到指定索引
   */
  public scrollToIndex(index: number, align: 'start' | 'center' | 'end' = 'start'): void {
    if (!this.container || index < 0 || index >= this.items.length) {
      return;
    }

    const itemTop = this.getItemOffset(index);
    const itemHeight = this.getItemHeight(index);
    let scrollTop = itemTop;

    switch (align) {
      case 'center':
        scrollTop = itemTop - (this.config.containerHeight - itemHeight) / 2;
        break;
      case 'end':
        scrollTop = itemTop - this.config.containerHeight + itemHeight;
        break;
    }

    this.container.scrollTop = Math.max(0, scrollTop);
  }

  /**
   * 获取当前状态
   */
  public getState(): VirtualScrollState {
    return { ...this.state };
  }

  /**
   * 设置项目高度
   */
  public setItemHeight(id: string | number, height: number): void {
    this.itemHeights.set(id, height);
    this.updateState();
  }

  /**
   * 获取项目高度
   */
  public getItemHeight(index: number): number {
    const item = this.items[index];
    if (!item) return this.config.itemHeight;

    // 优先使用实际测量的高度
    const measuredHeight = this.itemHeights.get(item.id);
    if (measuredHeight !== undefined) {
      return measuredHeight;
    }

    // 其次使用项目自定义高度
    if (item.height !== undefined) {
      return item.height;
    }

    // 最后使用默认高度
    return this.config.estimatedItemHeight || this.config.itemHeight;
  }

  /**
   * 获取项目偏移量
   */
  public getItemOffset(index: number): number {
    let offset = 0;
    
    for (let i = 0; i < index; i++) {
      offset += this.getItemHeight(i);
    }
    
    return offset;
  }

  /**
   * 添加事件监听器
   */
  public on(event: string, callback: Function): void {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event)!.push(callback);
  }

  /**
   * 移除事件监听器
   */
  public off(event: string, callback: Function): void {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * 销毁
   */
  public destroy(): void {
    this.unbindContainer();
    this.callbacks.clear();
    this.itemHeights.clear();
    this.items = [];
  }

  /**
   * 处理滚动事件
   */
  private handleScroll(event: Event): void {
    const target = event.target as HTMLElement;
    this.state.scrollTop = target.scrollTop;
    this.updateVisibleRange();
    this.emit('scroll', this.state);
  }

  /**
   * 处理尺寸变化
   */
  private handleResize(entries: ResizeObserverEntry[]): void {
    for (const entry of entries) {
      this.config.containerHeight = entry.contentRect.height;
    }
    this.updateState();
    this.emit('resize', this.state);
  }

  /**
   * 更新状态
   */
  private updateState(): void {
    this.calculateTotalHeight();
    this.updateVisibleRange();
  }

  /**
   * 计算总高度
   */
  private calculateTotalHeight(): void {
    this.state.totalHeight = this.items.reduce((total, item, index) => {
      return total + this.getItemHeight(index);
    }, 0);
  }

  /**
   * 更新可见范围
   */
  private updateVisibleRange(): void {
    const { scrollTop } = this.state;
    const { containerHeight, overscan } = this.config;

    // 计算可见范围
    let startIndex = 0;
    let currentOffset = 0;

    // 找到第一个可见项目
    for (let i = 0; i < this.items.length; i++) {
      const itemHeight = this.getItemHeight(i);
      
      if (currentOffset + itemHeight > scrollTop) {
        startIndex = i;
        break;
      }
      
      currentOffset += itemHeight;
    }

    // 计算结束索引
    let endIndex = startIndex;
    let visibleHeight = 0;
    
    for (let i = startIndex; i < this.items.length; i++) {
      visibleHeight += this.getItemHeight(i);
      endIndex = i;
      
      if (visibleHeight >= containerHeight) {
        break;
      }
    }

    // 添加预渲染项目
    startIndex = Math.max(0, startIndex - overscan);
    endIndex = Math.min(this.items.length - 1, endIndex + overscan);

    // 计算偏移量
    const offsetY = this.getItemOffset(startIndex);

    // 获取可见项目
    const visibleItems = this.items.slice(startIndex, endIndex + 1);

    // 更新状态
    this.state.startIndex = startIndex;
    this.state.endIndex = endIndex;
    this.state.visibleItems = visibleItems;
    this.state.offsetY = offsetY;
  }

  /**
   * 触发事件
   */
  private emit(event: string, data?: any): void {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      for (const callback of callbacks) {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in virtual scroll callback for ${event}:`, error);
        }
      }
    }
  }
}

/**
 * 虚拟滚动组件工厂
 */
export function createVirtualScroll(config: VirtualScrollConfig): VirtualScroll {
  return new VirtualScroll(config);
}

/**
 * 自动高度虚拟滚动
 */
export class AutoHeightVirtualScroll extends VirtualScroll {
  private measureElement: HTMLElement | null = null;

  constructor(config: Omit<VirtualScrollConfig, 'dynamic'>) {
    super({ ...config, dynamic: true });
  }

  /**
   * 测量项目高度
   */
  public measureItem(id: string | number, element: HTMLElement): void {
    const height = element.offsetHeight;
    this.setItemHeight(id, height);
  }

  /**
   * 创建测量元素
   */
  public createMeasureElement(container: HTMLElement): HTMLElement {
    if (this.measureElement) {
      return this.measureElement;
    }

    this.measureElement = document.createElement('div');
    this.measureElement.style.position = 'absolute';
    this.measureElement.style.visibility = 'hidden';
    this.measureElement.style.height = 'auto';
    this.measureElement.style.width = '100%';
    this.measureElement.style.top = '-9999px';
    
    container.appendChild(this.measureElement);
    
    return this.measureElement;
  }

  /**
   * 销毁
   */
  public destroy(): void {
    super.destroy();
    
    if (this.measureElement && this.measureElement.parentNode) {
      this.measureElement.parentNode.removeChild(this.measureElement);
      this.measureElement = null;
    }
  }
}
