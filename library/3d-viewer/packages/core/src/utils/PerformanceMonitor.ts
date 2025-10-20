/**
 * Performance monitoring system
 * Tracks FPS, frame time, memory usage, and provides adaptive quality recommendations
 */
export interface PerformanceStats {
  fps: number;
  frameTime: number; // milliseconds
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  renderCalls: number;
  triangles: number;
}

export interface PerformanceWarning {
  type: 'low_fps' | 'high_memory' | 'slow_frame';
  message: string;
  value: number;
  threshold: number;
}

export class PerformanceMonitor {
  private fps: number = 60;
  private frameTime: number = 0;
  private lastTime: number = performance.now();
  private frames: number = 0;
  private fpsUpdateInterval: number = 1000; // Update FPS every second
  private lastFpsUpdate: number = performance.now();
  
  // Frame time history for smoothing
  private frameTimeHistory: number[] = [];
  private historySize: number = 60;
  
  // Performance thresholds
  private fpsThreshold: number = 30;
  private frameTimeThreshold: number = 33; // ~30fps
  private memoryThreshold: number = 0.9; // 90% of heap limit
  
  // Callbacks
  private onWarning?: (warning: PerformanceWarning) => void;
  
  // Stats tracking
  private renderCalls: number = 0;
  private triangles: number = 0;

  constructor(options?: {
    fpsThreshold?: number;
    onWarning?: (warning: PerformanceWarning) => void;
  }) {
    if (options?.fpsThreshold) {
      this.fpsThreshold = options.fpsThreshold;
      this.frameTimeThreshold = 1000 / options.fpsThreshold;
    }
    this.onWarning = options?.onWarning;
  }

  /**
   * Update performance metrics
   * Should be called every frame
   */
  public update(): void {
    const now = performance.now();
    const delta = now - this.lastTime;
    this.lastTime = now;
    
    // Update frame time
    this.frameTime = delta;
    this.frameTimeHistory.push(delta);
    if (this.frameTimeHistory.length > this.historySize) {
      this.frameTimeHistory.shift();
    }
    
    // Update FPS
    this.frames++;
    const timeSinceLastUpdate = now - this.lastFpsUpdate;
    if (timeSinceLastUpdate >= this.fpsUpdateInterval) {
      this.fps = Math.round((this.frames * 1000) / timeSinceLastUpdate);
      this.frames = 0;
      this.lastFpsUpdate = now;
      
      // Check for performance warnings
      this.checkPerformance();
    }
  }

  /**
   * Get current performance statistics
   */
  public getStats(): PerformanceStats {
    const stats: PerformanceStats = {
      fps: this.fps,
      frameTime: this.getAverageFrameTime(),
      renderCalls: this.renderCalls,
      triangles: this.triangles,
    };

    // Add memory stats if available
    if ((performance as any).memory) {
      const memory = (performance as any).memory;
      stats.memory = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      };
    }

    return stats;
  }

  /**
   * Get average frame time from history
   */
  private getAverageFrameTime(): number {
    if (this.frameTimeHistory.length === 0) return 0;
    const sum = this.frameTimeHistory.reduce((a, b) => a + b, 0);
    return sum / this.frameTimeHistory.length;
  }

  /**
   * Check for performance issues and trigger warnings
   */
  private checkPerformance(): void {
    if (!this.onWarning) return;

    // Check FPS
    if (this.fps < this.fpsThreshold) {
      this.onWarning({
        type: 'low_fps',
        message: `FPS below threshold (${this.fps} < ${this.fpsThreshold})`,
        value: this.fps,
        threshold: this.fpsThreshold,
      });
    }

    // Check frame time
    const avgFrameTime = this.getAverageFrameTime();
    if (avgFrameTime > this.frameTimeThreshold) {
      this.onWarning({
        type: 'slow_frame',
        message: `Frame time too high (${avgFrameTime.toFixed(2)}ms > ${this.frameTimeThreshold}ms)`,
        value: avgFrameTime,
        threshold: this.frameTimeThreshold,
      });
    }

    // Check memory if available
    if ((performance as any).memory) {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      
      if (memoryUsage > this.memoryThreshold) {
        this.onWarning({
          type: 'high_memory',
          message: `Memory usage high (${(memoryUsage * 100).toFixed(1)}%)`,
          value: memoryUsage,
          threshold: this.memoryThreshold,
        });
      }
    }
  }

  /**
   * Update render statistics
   */
  public updateRenderStats(renderCalls: number, triangles: number): void {
    this.renderCalls = renderCalls;
    this.triangles = triangles;
  }

  /**
   * Get recommended quality level based on performance
   * Returns a value between 0 (lowest) and 1 (highest)
   */
  public getRecommendedQuality(): number {
    const targetFps = 60;
    const minFps = 30;
    
    // Quality based on FPS
    if (this.fps >= targetFps) {
      return 1.0;
    } else if (this.fps <= minFps) {
      return 0.5;
    } else {
      // Linear interpolation between min and target FPS
      return 0.5 + ((this.fps - minFps) / (targetFps - minFps)) * 0.5;
    }
  }

  /**
   * Check if performance is good
   */
  public isPerformanceGood(): boolean {
    return this.fps >= this.fpsThreshold && 
           this.getAverageFrameTime() <= this.frameTimeThreshold;
  }

  /**
   * Reset statistics
   */
  public reset(): void {
    this.fps = 60;
    this.frameTime = 0;
    this.frames = 0;
    this.frameTimeHistory = [];
    this.lastTime = performance.now();
    this.lastFpsUpdate = performance.now();
  }

  /**
   * Create a visual performance overlay
   */
  public createOverlay(container: HTMLElement): HTMLElement {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: #0f0;
      font-family: monospace;
      font-size: 12px;
      padding: 10px;
      border-radius: 4px;
      z-index: 10000;
      min-width: 200px;
      pointer-events: none;
    `;

    const update = () => {
      const stats = this.getStats();
      const fpsColor = stats.fps >= 50 ? '#0f0' : stats.fps >= 30 ? '#ff0' : '#f00';
      
      let html = `
        <div style="color: ${fpsColor}">FPS: ${stats.fps}</div>
        <div>Frame: ${stats.frameTime.toFixed(2)}ms</div>
        <div>Calls: ${stats.renderCalls}</div>
        <div>Triangles: ${stats.triangles}</div>
      `;

      if (stats.memory) {
        const usedMB = (stats.memory.usedJSHeapSize / 1048576).toFixed(1);
        const limitMB = (stats.memory.jsHeapSizeLimit / 1048576).toFixed(1);
        html += `<div>Memory: ${usedMB}MB / ${limitMB}MB</div>`;
      }

      overlay.innerHTML = html;
      requestAnimationFrame(update);
    };

    update();
    container.appendChild(overlay);
    return overlay;
  }
}

