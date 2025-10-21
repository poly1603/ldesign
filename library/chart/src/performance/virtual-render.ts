/**
 * 虚拟渲染 - 处理大数据集
 */

/**
 * 虚拟渲染器
 */
export class VirtualRenderer {
  private chunkSize: number;
  private visibleRange: { start: number; end: number };
  private totalData: any[] = [];

  constructor(chunkSize = 1000) {
    this.chunkSize = chunkSize;
    this.visibleRange = { start: 0, end: chunkSize };
  }

  /**
   * 设置数据
   */
  setData(data: any[]): void {
    this.totalData = data;
    this.visibleRange = { start: 0, end: Math.min(this.chunkSize, data.length) };
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
   * 获取可见范围的数据
   */
  getVisibleData(start?: number, end?: number): any[] {
    const startIndex = start ?? this.visibleRange.start;
    const endIndex = end ?? this.visibleRange.end;

    return this.totalData.slice(startIndex, endIndex);
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

