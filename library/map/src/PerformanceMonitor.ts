/**
 * PerformanceMonitor - 性能监控器
 * 监控FPS、内存使用、渲染时间等性能指标
 */

export interface PerformanceStats {
  fps: number;
  frameTime: number;
  memory?: {
    used: number;
    total: number;
    limit: number;
  };
  renderTime: number;
  layerCount: number;
  markerCount: number;
}

export interface PerformanceMonitorOptions {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  updateInterval?: number;
  showFPS?: boolean;
  showMemory?: boolean;
  showRenderTime?: boolean;
  showLayerCount?: boolean;
  style?: Partial<CSSStyleDeclaration>;
}

export class PerformanceMonitor {
  private container: HTMLElement;
  private panelElement: HTMLDivElement | null = null;
  private options: PerformanceMonitorOptions;
  private stats: PerformanceStats = {
    fps: 0,
    frameTime: 0,
    renderTime: 0,
    layerCount: 0,
    markerCount: 0
  };

  private frameCount = 0;
  private lastTime = performance.now();
  private updateTimer: number | null = null;
  private fpsHistory: number[] = [];
  private maxHistoryLength = 60;

  constructor(container: HTMLElement, options: PerformanceMonitorOptions = {}) {
    this.container = container;
    this.options = {
      position: 'top-left',
      updateInterval: 1000,
      showFPS: true,
      showMemory: true,
      showRenderTime: true,
      showLayerCount: true,
      ...options
    };

    this.create();
    this.startMonitoring();
  }

  private create(): void {
    this.panelElement = document.createElement('div');
    this.panelElement.className = 'performance-monitor';

    this.applyStyles(this.panelElement, {
      position: 'absolute',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: '#0f0',
      padding: '12px',
      borderRadius: '4px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: '10000',
      minWidth: '180px',
      ...this.getPositionStyles(),
      ...this.options.style
    });

    this.updateDisplay();
    this.container.appendChild(this.panelElement);
  }

  private startMonitoring(): void {
    const update = () => {
      this.updateStats();
      this.updateDisplay();
      this.updateTimer = requestAnimationFrame(update);
    };

    this.updateTimer = requestAnimationFrame(update);
  }

  private updateStats(): void {
    const now = performance.now();
    const delta = now - this.lastTime;

    this.frameCount++;

    // 每秒更新一次FPS
    if (delta >= this.options.updateInterval!) {
      this.stats.fps = Math.round((this.frameCount * 1000) / delta);
      this.stats.frameTime = delta / this.frameCount;

      // 记录FPS历史
      this.fpsHistory.push(this.stats.fps);
      if (this.fpsHistory.length > this.maxHistoryLength) {
        this.fpsHistory.shift();
      }

      this.frameCount = 0;
      this.lastTime = now;

      // 获取内存信息（如果可用）
      if (this.options.showMemory && (performance as any).memory) {
        const memory = (performance as any).memory;
        this.stats.memory = {
          used: Math.round(memory.usedJSHeapSize / 1048576), // MB
          total: Math.round(memory.totalJSHeapSize / 1048576),
          limit: Math.round(memory.jsHeapSizeLimit / 1048576)
        };
      }
    }
  }

  private updateDisplay(): void {
    if (!this.panelElement) return;

    const lines: string[] = [];

    if (this.options.showFPS) {
      const fpsColor = this.getFPSColor(this.stats.fps);
      lines.push(`<div style="color: ${fpsColor}">FPS: ${this.stats.fps}</div>`);
      lines.push(`<div style="color: #888; font-size: 10px">Frame: ${this.stats.frameTime.toFixed(2)}ms</div>`);
    }

    if (this.options.showMemory && this.stats.memory) {
      const memPercent = (this.stats.memory.used / this.stats.memory.limit) * 100;
      const memColor = this.getMemoryColor(memPercent);
      lines.push(`<div style="color: ${memColor}">Memory: ${this.stats.memory.used}/${this.stats.memory.limit}MB</div>`);
      lines.push(`<div style="color: #888; font-size: 10px">${memPercent.toFixed(1)}% used</div>`);
    }

    if (this.options.showRenderTime && this.stats.renderTime > 0) {
      lines.push(`<div style="color: #0ff">Render: ${this.stats.renderTime.toFixed(2)}ms</div>`);
    }

    if (this.options.showLayerCount) {
      lines.push(`<div style="color: #ff0">Layers: ${this.stats.layerCount}</div>`);
      lines.push(`<div style="color: #f80">Markers: ${this.stats.markerCount}</div>`);
    }

    // FPS小图表
    if (this.options.showFPS && this.fpsHistory.length > 0) {
      lines.push(this.createMiniChart());
    }

    this.panelElement.innerHTML = lines.join('');
  }

  private createMiniChart(): string {
    const maxFPS = 60;
    const bars = this.fpsHistory.slice(-30).map(fps => {
      const height = Math.min((fps / maxFPS) * 20, 20);
      const color = this.getFPSColor(fps);
      return `<div style="display:inline-block;width:2px;height:${height}px;background:${color};margin-right:1px;vertical-align:bottom;"></div>`;
    });

    return `<div style="margin-top:8px;height:20px;display:flex;align-items:flex-end;">${bars.join('')}</div>`;
  }

  private getFPSColor(fps: number): string {
    if (fps >= 55) return '#0f0'; // 绿色：优秀
    if (fps >= 30) return '#ff0'; // 黄色：良好
    return '#f00'; // 红色：较差
  }

  private getMemoryColor(percent: number): string {
    if (percent < 50) return '#0f0'; // 绿色：良好
    if (percent < 75) return '#ff0'; // 黄色：注意
    return '#f00'; // 红色：警告
  }

  private getPositionStyles(): Partial<CSSStyleDeclaration> {
    const margin = '16px';
    switch (this.options.position) {
      case 'top-left':
        return { top: margin, left: margin };
      case 'top-right':
        return { top: margin, right: margin };
      case 'bottom-left':
        return { bottom: margin, left: margin };
      case 'bottom-right':
        return { bottom: margin, right: margin };
      default:
        return { top: margin, left: margin };
    }
  }

  private applyStyles(element: HTMLElement, styles: Partial<CSSStyleDeclaration>): void {
    Object.assign(element.style, styles);
  }

  /**
   * 手动更新统计数据
   */
  setStats(stats: Partial<PerformanceStats>): void {
    Object.assign(this.stats, stats);
  }

  /**
   * 获取当前统计数据
   */
  getStats(): PerformanceStats {
    return { ...this.stats };
  }

  /**
   * 获取平均FPS
   */
  getAverageFPS(): number {
    if (this.fpsHistory.length === 0) return 0;
    return Math.round(
      this.fpsHistory.reduce((sum, fps) => sum + fps, 0) / this.fpsHistory.length
    );
  }

  /**
   * 获取最小FPS
   */
  getMinFPS(): number {
    if (this.fpsHistory.length === 0) return 0;
    return Math.min(...this.fpsHistory);
  }

  /**
   * 获取最大FPS
   */
  getMaxFPS(): number {
    if (this.fpsHistory.length === 0) return 0;
    return Math.max(...this.fpsHistory);
  }

  /**
   * 显示监控面板
   */
  show(): void {
    if (this.panelElement) {
      this.panelElement.style.display = 'flex';
    }
  }

  /**
   * 隐藏监控面板
   */
  hide(): void {
    if (this.panelElement) {
      this.panelElement.style.display = 'none';
    }
  }

  /**
   * 切换显示状态
   */
  toggle(): void {
    if (this.panelElement) {
      const isHidden = this.panelElement.style.display === 'none';
      if (isHidden) this.show();
      else this.hide();
    }
  }

  /**
   * 重置统计
   */
  reset(): void {
    this.fpsHistory = [];
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.stats = {
      fps: 0,
      frameTime: 0,
      renderTime: 0,
      layerCount: 0,
      markerCount: 0
    };
  }

  /**
   * 销毁监控器
   */
  destroy(): void {
    if (this.updateTimer) {
      cancelAnimationFrame(this.updateTimer);
      this.updateTimer = null;
    }

    if (this.panelElement && this.panelElement.parentNode) {
      this.panelElement.parentNode.removeChild(this.panelElement);
      this.panelElement = null;
    }
  }
}




