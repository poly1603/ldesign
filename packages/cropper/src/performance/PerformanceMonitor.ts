/**
 * @ldesign/cropper - 性能监控器
 * 
 * 监控和优化图片裁剪器的性能
 */

import { PERFORMANCE_THRESHOLDS } from '../constants';

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  /** 内存使用量 (MB) */
  memoryUsage: number;
  /** 渲染帧率 (FPS) */
  frameRate: number;
  /** 操作延迟 (ms) */
  operationLatency: number;
  /** 图像处理时间 (ms) */
  imageProcessingTime: number;
  /** Canvas 绘制时间 (ms) */
  canvasRenderTime: number;
}

/**
 * 性能警告类型
 */
export type PerformanceWarningType = 
  | 'high-memory-usage'
  | 'low-frame-rate'
  | 'high-latency'
  | 'large-image-size'
  | 'slow-processing';

/**
 * 性能警告
 */
export interface PerformanceWarning {
  type: PerformanceWarningType;
  message: string;
  value: number;
  threshold: number;
  timestamp: number;
}

/**
 * 性能监控器类
 * 
 * 提供性能监控、分析和优化建议
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    memoryUsage: 0,
    frameRate: 60,
    operationLatency: 0,
    imageProcessingTime: 0,
    canvasRenderTime: 0
  };

  private warnings: PerformanceWarning[] = [];
  private frameCount = 0;
  private lastFrameTime = 0;
  private frameRateHistory: number[] = [];
  private operationStartTime = 0;
  private isMonitoring = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  /**
   * 开始监控
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.lastFrameTime = performance.now();
    
    // 定期更新指标
    this.monitoringInterval = setInterval(() => {
      this.updateMetrics();
      this.checkWarnings();
    }, 1000);

    // 监听帧率
    this.monitorFrameRate();
  }

  /**
   * 停止监控
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * 监控帧率
   */
  private monitorFrameRate(): void {
    if (!this.isMonitoring) return;

    const now = performance.now();
    const deltaTime = now - this.lastFrameTime;
    
    if (deltaTime > 0) {
      const currentFPS = 1000 / deltaTime;
      this.frameRateHistory.push(currentFPS);
      
      // 保持最近60帧的记录
      if (this.frameRateHistory.length > 60) {
        this.frameRateHistory.shift();
      }
      
      // 计算平均帧率
      this.metrics.frameRate = this.frameRateHistory.reduce((a, b) => a + b, 0) / this.frameRateHistory.length;
    }
    
    this.lastFrameTime = now;
    this.frameCount++;
    
    requestAnimationFrame(() => this.monitorFrameRate());
  }

  /**
   * 更新性能指标
   */
  private updateMetrics(): void {
    // 更新内存使用量
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      this.metrics.memoryUsage = memInfo.usedJSHeapSize / (1024 * 1024); // 转换为 MB
    }
  }

  /**
   * 检查性能警告
   */
  private checkWarnings(): void {
    const now = Date.now();

    // 检查内存使用
    if (this.metrics.memoryUsage > PERFORMANCE_THRESHOLDS.MEMORY_WARNING_THRESHOLD / (1024 * 1024)) {
      this.addWarning({
        type: 'high-memory-usage',
        message: `内存使用过高: ${this.metrics.memoryUsage.toFixed(1)}MB`,
        value: this.metrics.memoryUsage,
        threshold: PERFORMANCE_THRESHOLDS.MEMORY_WARNING_THRESHOLD / (1024 * 1024),
        timestamp: now
      });
    }

    // 检查帧率
    if (this.metrics.frameRate < 30) {
      this.addWarning({
        type: 'low-frame-rate',
        message: `帧率过低: ${this.metrics.frameRate.toFixed(1)}FPS`,
        value: this.metrics.frameRate,
        threshold: 30,
        timestamp: now
      });
    }

    // 检查操作延迟
    if (this.metrics.operationLatency > 100) {
      this.addWarning({
        type: 'high-latency',
        message: `操作延迟过高: ${this.metrics.operationLatency}ms`,
        value: this.metrics.operationLatency,
        threshold: 100,
        timestamp: now
      });
    }
  }

  /**
   * 添加警告
   */
  private addWarning(warning: PerformanceWarning): void {
    // 避免重复警告
    const existingWarning = this.warnings.find(w => 
      w.type === warning.type && 
      warning.timestamp - w.timestamp < 5000 // 5秒内不重复
    );

    if (!existingWarning) {
      this.warnings.push(warning);
      
      // 保持最近50个警告
      if (this.warnings.length > 50) {
        this.warnings.shift();
      }
    }
  }

  /**
   * 开始操作计时
   */
  startOperation(): void {
    this.operationStartTime = performance.now();
  }

  /**
   * 结束操作计时
   */
  endOperation(): void {
    if (this.operationStartTime > 0) {
      this.metrics.operationLatency = performance.now() - this.operationStartTime;
      this.operationStartTime = 0;
    }
  }

  /**
   * 记录图像处理时间
   */
  recordImageProcessingTime(time: number): void {
    this.metrics.imageProcessingTime = time;
  }

  /**
   * 记录Canvas渲染时间
   */
  recordCanvasRenderTime(time: number): void {
    this.metrics.canvasRenderTime = time;
  }

  /**
   * 检查图像大小
   */
  checkImageSize(width: number, height: number, fileSize?: number): void {
    const pixelCount = width * height;
    const estimatedMemory = pixelCount * 4; // RGBA

    if (estimatedMemory > PERFORMANCE_THRESHOLDS.LARGE_IMAGE_SIZE) {
      this.addWarning({
        type: 'large-image-size',
        message: `图像尺寸过大: ${width}x${height} (${(estimatedMemory / (1024 * 1024)).toFixed(1)}MB)`,
        value: estimatedMemory,
        threshold: PERFORMANCE_THRESHOLDS.LARGE_IMAGE_SIZE,
        timestamp: Date.now()
      });
    }

    if (fileSize && fileSize > PERFORMANCE_THRESHOLDS.LARGE_IMAGE_SIZE) {
      this.addWarning({
        type: 'large-image-size',
        message: `图像文件过大: ${(fileSize / (1024 * 1024)).toFixed(1)}MB`,
        value: fileSize,
        threshold: PERFORMANCE_THRESHOLDS.LARGE_IMAGE_SIZE,
        timestamp: Date.now()
      });
    }
  }

  /**
   * 获取性能指标
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * 获取性能警告
   */
  getWarnings(): PerformanceWarning[] {
    return [...this.warnings];
  }

  /**
   * 清除警告
   */
  clearWarnings(): void {
    this.warnings = [];
  }

  /**
   * 获取性能报告
   */
  getPerformanceReport(): {
    metrics: PerformanceMetrics;
    warnings: PerformanceWarning[];
    recommendations: string[];
  } {
    const recommendations: string[] = [];

    // 基于指标生成建议
    if (this.metrics.memoryUsage > 50) {
      recommendations.push('考虑减小图像尺寸或启用图像压缩');
    }

    if (this.metrics.frameRate < 30) {
      recommendations.push('降低渲染质量或减少同时处理的图像数量');
    }

    if (this.metrics.operationLatency > 100) {
      recommendations.push('考虑使用 Web Workers 进行后台处理');
    }

    if (this.metrics.imageProcessingTime > 500) {
      recommendations.push('优化图像处理算法或分批处理');
    }

    return {
      metrics: this.getMetrics(),
      warnings: this.getWarnings(),
      recommendations
    };
  }

  /**
   * 性能优化建议
   */
  getOptimizationSuggestions(): string[] {
    const suggestions: string[] = [];
    const metrics = this.metrics;

    if (metrics.memoryUsage > 100) {
      suggestions.push('启用内存管理：定期清理未使用的图像数据');
      suggestions.push('使用图像分块加载：对大图像进行分块处理');
    }

    if (metrics.frameRate < 45) {
      suggestions.push('降低渲染频率：使用节流函数限制渲染次数');
      suggestions.push('启用硬件加速：使用 CSS transform 和 will-change');
    }

    if (metrics.operationLatency > 50) {
      suggestions.push('使用防抖函数：减少频繁的操作触发');
      suggestions.push('异步处理：将耗时操作移到 Web Worker');
    }

    if (metrics.imageProcessingTime > 200) {
      suggestions.push('优化算法：使用更高效的图像处理算法');
      suggestions.push('缓存结果：缓存处理过的图像数据');
    }

    return suggestions;
  }

  /**
   * 内存使用分析
   */
  analyzeMemoryUsage(): {
    current: number;
    peak: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    recommendation: string;
  } {
    const current = this.metrics.memoryUsage;
    
    // 简化实现，实际应该跟踪历史数据
    const peak = current * 1.2; // 模拟峰值
    const trend = current > 50 ? 'increasing' : 'stable';
    
    let recommendation = '';
    if (current > 100) {
      recommendation = '内存使用过高，建议清理缓存或减小图像尺寸';
    } else if (current > 50) {
      recommendation = '内存使用较高，注意监控';
    } else {
      recommendation = '内存使用正常';
    }

    return {
      current,
      peak,
      trend,
      recommendation
    };
  }

  /**
   * 销毁监控器
   */
  destroy(): void {
    this.stopMonitoring();
    this.warnings = [];
    this.frameRateHistory = [];
  }
}
