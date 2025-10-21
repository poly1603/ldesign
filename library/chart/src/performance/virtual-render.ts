/**
 * 虚拟渲染 - 处理大数据集，自适应窗口，预加载
 */

/**
 * 虚拟渲染配置
 */
interface VirtualRenderConfig {
  chunkSize?: number;
  preloadCount?: number; // 预加载的分片数量
  adaptiveChunkSize?: boolean; // 是否自适应分片大小
  minChunkSize?: number;
  maxChunkSize?: number;
}

/**
 * 虚拟渲染器（优化版）
 */
export class VirtualRenderer {
  private chunkSize: number;
  private visibleRange: { start: number; end: number };
  private totalData: any[] = [];
  private preloadCount: number;
  private adaptiveChunkSize: boolean;
  private minChunkSize: number;
  private maxChunkSize: number;

  // 性能统计
  private renderTimes: number[] = [];
  private avgRenderTime = 0;

  constructor(config: VirtualRenderConfig = {}) {
    this.chunkSize = config.chunkSize ?? 1000;
    this.preloadCount = config.preloadCount ?? 2;
    this.adaptiveChunkSize = config.adaptiveChunkSize ?? true;
    this.minChunkSize = config.minChunkSize ?? 100;
    this.maxChunkSize = config.maxChunkSize ?? 5000;
    this.visibleRange = { start: 0, end: this.chunkSize };
  }

  /**
   * 设置数据（自适应分片大小）
   */
  setData(data: any[]): void {
    this.totalData = data;

    // 自适应调整分片大小
    if (this.adaptiveChunkSize) {
      this.chunkSize = this.calculateOptimalChunkSize(data.length);
    }

    this.visibleRange = { start: 0, end: Math.min(this.chunkSize, data.length) };
  }

  /**
   * 计算最优分片大小
   */
  private calculateOptimalChunkSize(dataLength: number): number {
    // 基于数据量和平均渲染时间动态调整
    if (this.avgRenderTime === 0) {
      // 首次渲染，使用默认值
      return Math.max(
        this.minChunkSize,
        Math.min(this.maxChunkSize, Math.floor(dataLength / 10))
      );
    }

    // 目标渲染时间：16ms（60 FPS）
    const targetTime = 16;
    const ratio = targetTime / this.avgRenderTime;
    const newSize = Math.floor(this.chunkSize * ratio);

    return Math.max(this.minChunkSize, Math.min(this.maxChunkSize, newSize));
  }

  /**
   * 记录渲染时间
   */
  recordRenderTime(time: number): void {
    this.renderTimes.push(time);

    // 只保留最近 10 次的数据
    if (this.renderTimes.length > 10) {
      this.renderTimes.shift();
    }

    // 更新平均渲染时间
    this.avgRenderTime = this.renderTimes.reduce((a, b) => a + b, 0) / this.renderTimes.length;

    // 动态调整分片大小
    if (this.adaptiveChunkSize && this.renderTimes.length >= 3) {
      this.chunkSize = this.calculateOptimalChunkSize(this.totalData.length);
    }
  }

  /**
   * 对大数据集进行分片
   */
  chunk(data?: any[], chunkSize?: number): any[][] {
    const source = data || this.totalData;
    const size = chunkSize || this.chunkSize;
    const chunks: any[][] = [];

    for (let i = 0; i < source.length; i += size) {
      chunks.push(source.slice(i, i + size));
    }

    return chunks;
  }

  /**
   * 获取可见范围的数据（带预加载）
   */
  getVisibleData(start?: number, end?: number): any[] {
    const startIndex = start ?? this.visibleRange.start;
    const endIndex = end ?? this.visibleRange.end;

    return this.totalData.slice(startIndex, endIndex);
  }

  /**
   * 获取带预加载的数据
   */
  getVisibleDataWithPreload(): any[] {
    const preloadStart = Math.max(
      0,
      this.visibleRange.start - this.chunkSize * this.preloadCount
    );
    const preloadEnd = Math.min(
      this.totalData.length,
      this.visibleRange.end + this.chunkSize * this.preloadCount
    );

    return this.totalData.slice(preloadStart, preloadEnd);
  }

  /**
   * 更新可见范围（配合 dataZoom）
   */
  updateVisibleRange(event: { start: number; end: number } | { startValue: number; endValue: number }): void {
    if ('start' in event && 'end' in event) {
      // 百分比模式
      const start = Math.floor((event.start / 100) * this.totalData.length);
      const end = Math.ceil((event.end / 100) * this.totalData.length);
      this.visibleRange = { start, end };
    } else if ('startValue' in event && 'endValue' in event) {
      // 值模式
      this.visibleRange = {
        start: event.startValue,
        end: event.endValue,
      };
    }
  }

  /**
   * 获取当前范围
   */
  getRange(): { start: number; end: number } {
    return { ...this.visibleRange };
  }

  /**
   * 设置分片大小
   */
  setChunkSize(size: number): void {
    this.chunkSize = size;
    this.visibleRange.end = Math.min(
      this.visibleRange.start + size,
      this.totalData.length
    );
  }

  /**
   * 向前翻页
   */
  pageForward(): any[] {
    const start = this.visibleRange.end;
    const end = Math.min(start + this.chunkSize, this.totalData.length);

    if (start < this.totalData.length) {
      this.visibleRange = { start, end };
      return this.getVisibleData();
    }

    return [];
  }

  /**
   * 向后翻页
   */
  pageBackward(): any[] {
    const end = this.visibleRange.start;
    const start = Math.max(end - this.chunkSize, 0);

    if (end > 0) {
      this.visibleRange = { start, end };
      return this.getVisibleData();
    }

    return [];
  }

  /**
   * 跳转到指定页
   */
  gotoPage(page: number): any[] {
    const start = page * this.chunkSize;
    const end = Math.min(start + this.chunkSize, this.totalData.length);

    if (start < this.totalData.length) {
      this.visibleRange = { start, end };
      return this.getVisibleData();
    }

    return [];
  }

  /**
   * 获取总页数
   */
  getTotalPages(): number {
    return Math.ceil(this.totalData.length / this.chunkSize);
  }

  /**
   * 获取当前页
   */
  getCurrentPage(): number {
    return Math.floor(this.visibleRange.start / this.chunkSize);
  }

  /**
   * 是否需要虚拟渲染
   */
  static shouldUseVirtualRender(dataLength: number, threshold = 10000): boolean {
    return dataLength > threshold;
  }

  /**
   * 计算最佳分片大小
   */
  static calculateOptimalChunkSize(
    dataLength: number,
    options: {
      minChunkSize?: number;
      maxChunkSize?: number;
      targetChunks?: number;
    } = {}
  ): number {
    const {
      minChunkSize = 100,
      maxChunkSize = 5000,
      targetChunks = 10,
    } = options;

    const idealChunkSize = Math.ceil(dataLength / targetChunks);
    return Math.max(minChunkSize, Math.min(maxChunkSize, idealChunkSize));
  }
}

