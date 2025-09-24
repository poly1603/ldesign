import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Cropper } from '../../src/core/Cropper';
import type { CropperConfig } from '../../src/types';

// 性能测试配置
const PERFORMANCE_THRESHOLDS = {
  INITIALIZATION: 100, // ms
  IMAGE_LOADING: 500, // ms
  RENDERING: 16, // ms (60fps)
  CROP_OPERATION: 50, // ms
  EXPORT_OPERATION: 200, // ms
  MEMORY_LEAK_THRESHOLD: 10 * 1024 * 1024, // 10MB
};

// 性能测量工具
class PerformanceMeasurer {
  private measurements: Map<string, number[]> = new Map();

  start(name: string): () => number {
    const startTime = performance.now();
    return () => {
      const duration = performance.now() - startTime;
      if (!this.measurements.has(name)) {
        this.measurements.set(name, []);
      }
      this.measurements.get(name)!.push(duration);
      return duration;
    };
  }

  getStats(name: string) {
    const measurements = this.measurements.get(name) || [];
    if (measurements.length === 0) {
      return { min: 0, max: 0, avg: 0, count: 0 };
    }

    const min = Math.min(...measurements);
    const max = Math.max(...measurements);
    const avg = measurements.reduce((sum, val) => sum + val, 0) / measurements.length;
    
    return { min, max, avg, count: measurements.length };
  }

  clear() {
    this.measurements.clear();
  }
}

// 内存使用监控
class MemoryMonitor {
  private initialMemory: number = 0;

  start() {
    // 强制垃圾回收（如果可用）
    if (global.gc) {
      global.gc();
    }
    this.initialMemory = this.getMemoryUsage();
  }

  getMemoryUsage(): number {
    if (performance.memory) {
      return performance.memory.usedJSHeapSize;
    }
    return 0;
  }

  getMemoryDelta(): number {
    return this.getMemoryUsage() - this.initialMemory;
  }
}

// 创建测试图片
function createTestImage(width: number, height: number): HTMLImageElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d')!;
  
  // 创建复杂的测试图案
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#ff6b6b');
  gradient.addColorStop(0.5, '#4ecdc4');
  gradient.addColorStop(1, '#45b7d1');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // 添加一些细节
  for (let i = 0; i < 100; i++) {
    ctx.fillStyle = `hsl(${Math.random() * 360}, 50%, 50%)`;
    ctx.fillRect(
      Math.random() * width,
      Math.random() * height,
      Math.random() * 50,
      Math.random() * 50
    );
  }

  const img = new Image();
  img.src = canvas.toDataURL();
  return img;
}

describe('Cropper Performance Tests', () => {
  let container: HTMLDivElement;
  let cropper: Cropper;
  let measurer: PerformanceMeasurer;
  let memoryMonitor: MemoryMonitor;

  beforeEach(() => {
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);

    measurer = new PerformanceMeasurer();
    memoryMonitor = new MemoryMonitor();
    memoryMonitor.start();
  });

  afterEach(() => {
    if (cropper) {
      cropper.destroy();
    }
    document.body.removeChild(container);
    measurer.clear();
  });

  describe('Initialization Performance', () => {
    it('should initialize within performance threshold', () => {
      const endMeasure = measurer.start('initialization');
      
      cropper = new Cropper(container);
      
      const duration = endMeasure();
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.INITIALIZATION);
    });

    it('should handle multiple initializations efficiently', () => {
      const iterations = 10;
      
      for (let i = 0; i < iterations; i++) {
        const endMeasure = measurer.start('multiple-init');
        
        const tempCropper = new Cropper(container);
        tempCropper.destroy();
        
        endMeasure();
      }

      const stats = measurer.getStats('multiple-init');
      expect(stats.avg).toBeLessThan(PERFORMANCE_THRESHOLDS.INITIALIZATION);
      expect(stats.max).toBeLessThan(PERFORMANCE_THRESHOLDS.INITIALIZATION * 2);
    });
  });

  describe('Image Loading Performance', () => {
    beforeEach(() => {
      cropper = new Cropper(container);
    });

    it('should load small images quickly', async () => {
      const img = createTestImage(500, 500);
      const endMeasure = measurer.start('small-image-loading');
      
      await cropper.loadImage(img);
      
      const duration = endMeasure();
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.IMAGE_LOADING / 2);
    });

    it('should load large images within threshold', async () => {
      const img = createTestImage(4000, 3000);
      const endMeasure = measurer.start('large-image-loading');
      
      await cropper.loadImage(img);
      
      const duration = endMeasure();
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.IMAGE_LOADING);
    });

    it('should handle multiple image loads efficiently', async () => {
      const images = [
        createTestImage(800, 600),
        createTestImage(1200, 800),
        createTestImage(600, 900),
      ];

      for (const img of images) {
        const endMeasure = measurer.start('multiple-loads');
        await cropper.loadImage(img);
        endMeasure();
      }

      const stats = measurer.getStats('multiple-loads');
      expect(stats.avg).toBeLessThan(PERFORMANCE_THRESHOLDS.IMAGE_LOADING);
    });
  });

  describe('Rendering Performance', () => {
    beforeEach(async () => {
      cropper = new Cropper(container);
      const img = createTestImage(1000, 800);
      await cropper.loadImage(img);
    });

    it('should render frames within 60fps threshold', () => {
      const iterations = 60; // Simulate 1 second of 60fps
      
      for (let i = 0; i < iterations; i++) {
        const endMeasure = measurer.start('rendering');
        
        // 触发重新渲染
        cropper.setCropData({
          x: Math.random() * 100,
          y: Math.random() * 100,
          width: 200 + Math.random() * 100,
          height: 200 + Math.random() * 100,
          shape: 'rectangle'
        });
        
        endMeasure();
      }

      const stats = measurer.getStats('rendering');
      expect(stats.avg).toBeLessThan(PERFORMANCE_THRESHOLDS.RENDERING);
      expect(stats.max).toBeLessThan(PERFORMANCE_THRESHOLDS.RENDERING * 2);
    });

    it('should handle continuous transformations smoothly', () => {
      const iterations = 100;
      
      for (let i = 0; i < iterations; i++) {
        const endMeasure = measurer.start('transformations');
        
        cropper.setScale(1 + Math.random());
        cropper.setRotation(Math.random() * 360);
        
        endMeasure();
      }

      const stats = measurer.getStats('transformations');
      expect(stats.avg).toBeLessThan(PERFORMANCE_THRESHOLDS.RENDERING);
    });
  });

  describe('Crop Operations Performance', () => {
    beforeEach(async () => {
      cropper = new Cropper(container);
      const img = createTestImage(1000, 800);
      await cropper.loadImage(img);
    });

    it('should perform crop operations quickly', () => {
      const cropConfigs = [
        { x: 100, y: 100, width: 200, height: 200, shape: 'rectangle' as const },
        { x: 150, y: 150, width: 300, height: 300, shape: 'circle' as const },
        { x: 200, y: 100, width: 400, height: 200, shape: 'ellipse' as const },
      ];

      cropConfigs.forEach((config, index) => {
        const endMeasure = measurer.start('crop-operations');
        
        cropper.setCropData(config);
        
        endMeasure();
      });

      const stats = measurer.getStats('crop-operations');
      expect(stats.avg).toBeLessThan(PERFORMANCE_THRESHOLDS.CROP_OPERATION);
    });

    it('should handle rapid crop changes efficiently', () => {
      const iterations = 50;
      
      for (let i = 0; i < iterations; i++) {
        const endMeasure = measurer.start('rapid-crops');
        
        cropper.setCropData({
          x: Math.random() * 200,
          y: Math.random() * 200,
          width: 100 + Math.random() * 200,
          height: 100 + Math.random() * 200,
          shape: ['rectangle', 'circle', 'ellipse'][Math.floor(Math.random() * 3)] as any
        });
        
        endMeasure();
      }

      const stats = measurer.getStats('rapid-crops');
      expect(stats.avg).toBeLessThan(PERFORMANCE_THRESHOLDS.CROP_OPERATION);
    });
  });

  describe('Export Performance', () => {
    beforeEach(async () => {
      cropper = new Cropper(container);
      const img = createTestImage(1000, 800);
      await cropper.loadImage(img);
      cropper.setCropData({ x: 100, y: 100, width: 300, height: 300, shape: 'rectangle' });
    });

    it('should export canvas quickly', () => {
      const endMeasure = measurer.start('canvas-export');
      
      const canvas = cropper.getCroppedCanvas();
      
      const duration = endMeasure();
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.EXPORT_OPERATION);
      expect(canvas).toBeInstanceOf(HTMLCanvasElement);
    });

    it('should export blob efficiently', async () => {
      const formats = ['image/png', 'image/jpeg', 'image/webp'];
      
      for (const format of formats) {
        const endMeasure = measurer.start('blob-export');
        
        const blob = await cropper.getCroppedBlob({ type: format });
        
        const duration = endMeasure();
        expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.EXPORT_OPERATION);
        expect(blob).toBeInstanceOf(Blob);
      }

      const stats = measurer.getStats('blob-export');
      expect(stats.avg).toBeLessThan(PERFORMANCE_THRESHOLDS.EXPORT_OPERATION);
    });

    it('should handle multiple exports without degradation', async () => {
      const iterations = 10;
      
      for (let i = 0; i < iterations; i++) {
        const endMeasure = measurer.start('multiple-exports');
        
        await cropper.getCroppedBlob();
        
        endMeasure();
      }

      const stats = measurer.getStats('multiple-exports');
      expect(stats.avg).toBeLessThan(PERFORMANCE_THRESHOLDS.EXPORT_OPERATION);
      
      // 确保性能没有显著下降
      const measurements = measurer['measurements'].get('multiple-exports')!;
      const firstHalf = measurements.slice(0, Math.floor(measurements.length / 2));
      const secondHalf = measurements.slice(Math.floor(measurements.length / 2));
      
      const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
      
      // 第二半部分的平均时间不应该比第一半部分慢太多
      expect(secondAvg).toBeLessThan(firstAvg * 1.5);
    });
  });

  describe('Memory Usage', () => {
    it('should not leak memory during normal operations', async () => {
      const iterations = 20;
      
      for (let i = 0; i < iterations; i++) {
        const tempCropper = new Cropper(container);
        const img = createTestImage(800, 600);
        
        await tempCropper.loadImage(img);
        tempCropper.setCropData({ x: 50, y: 50, width: 200, height: 200, shape: 'rectangle' });
        await tempCropper.getCroppedBlob();
        
        tempCropper.destroy();
        
        // 每5次迭代检查一次内存
        if (i % 5 === 0 && global.gc) {
          global.gc();
        }
      }

      // 最终垃圾回收
      if (global.gc) {
        global.gc();
      }

      const memoryDelta = memoryMonitor.getMemoryDelta();
      expect(memoryDelta).toBeLessThan(PERFORMANCE_THRESHOLDS.MEMORY_LEAK_THRESHOLD);
    });

    it('should handle large images without excessive memory usage', async () => {
      cropper = new Cropper(container);
      const initialMemory = memoryMonitor.getMemoryUsage();
      
      // 加载大图片
      const largeImg = createTestImage(4000, 3000);
      await cropper.loadImage(largeImg);
      
      const afterLoadMemory = memoryMonitor.getMemoryUsage();
      const loadMemoryDelta = afterLoadMemory - initialMemory;
      
      // 执行一些操作
      cropper.setCropData({ x: 500, y: 500, width: 1000, height: 1000, shape: 'rectangle' });
      await cropper.getCroppedBlob();
      
      const finalMemory = memoryMonitor.getMemoryUsage();
      const totalMemoryDelta = finalMemory - initialMemory;
      
      // 内存使用应该在合理范围内
      expect(totalMemoryDelta).toBeLessThan(PERFORMANCE_THRESHOLDS.MEMORY_LEAK_THRESHOLD * 2);
    });
  });

  describe('Stress Testing', () => {
    it('should handle rapid user interactions', async () => {
      cropper = new Cropper(container);
      const img = createTestImage(1000, 800);
      await cropper.loadImage(img);

      const startTime = performance.now();
      const duration = 1000; // 1秒压力测试
      let operationCount = 0;

      while (performance.now() - startTime < duration) {
        // 模拟快速用户操作
        cropper.setCropData({
          x: Math.random() * 200,
          y: Math.random() * 200,
          width: 100 + Math.random() * 300,
          height: 100 + Math.random() * 300,
          shape: ['rectangle', 'circle', 'ellipse'][Math.floor(Math.random() * 3)] as any
        });
        
        cropper.setScale(0.5 + Math.random() * 2);
        cropper.setRotation(Math.random() * 360);
        
        operationCount++;
      }

      // 应该能够处理大量操作而不崩溃
      expect(operationCount).toBeGreaterThan(50);
      expect(cropper.hasImage()).toBe(true);
    });

    it('should maintain performance under concurrent operations', async () => {
      const croppers: Cropper[] = [];
      const containers: HTMLDivElement[] = [];
      
      // 创建多个裁剪器实例
      for (let i = 0; i < 5; i++) {
        const tempContainer = document.createElement('div');
        tempContainer.style.width = '400px';
        tempContainer.style.height = '300px';
        document.body.appendChild(tempContainer);
        containers.push(tempContainer);
        
        const tempCropper = new Cropper(tempContainer);
        croppers.push(tempCropper);
        
        const img = createTestImage(800, 600);
        await tempCropper.loadImage(img);
      }

      const startTime = performance.now();
      
      // 并发操作
      const promises = croppers.map(async (cropper, index) => {
        for (let i = 0; i < 10; i++) {
          cropper.setCropData({
            x: index * 50,
            y: i * 20,
            width: 200,
            height: 200,
            shape: 'rectangle'
          });
          
          await cropper.getCroppedBlob();
        }
      });

      await Promise.all(promises);
      
      const totalTime = performance.now() - startTime;
      
      // 清理
      croppers.forEach(cropper => cropper.destroy());
      containers.forEach(container => document.body.removeChild(container));
      
      // 并发操作应该在合理时间内完成
      expect(totalTime).toBeLessThan(5000); // 5秒内完成
    });
  });

  describe('Performance Regression Tests', () => {
    it('should maintain consistent performance across versions', async () => {
      // 这个测试可以用来检测性能回归
      const benchmarkResults = {
        initialization: PERFORMANCE_THRESHOLDS.INITIALIZATION * 0.8,
        imageLoading: PERFORMANCE_THRESHOLDS.IMAGE_LOADING * 0.8,
        rendering: PERFORMANCE_THRESHOLDS.RENDERING * 0.8,
        export: PERFORMANCE_THRESHOLDS.EXPORT_OPERATION * 0.8,
      };

      // 初始化测试
      const initEnd = measurer.start('regression-init');
      cropper = new Cropper(container);
      const initTime = initEnd();

      // 图片加载测试
      const loadEnd = measurer.start('regression-load');
      const img = createTestImage(1000, 800);
      await cropper.loadImage(img);
      const loadTime = loadEnd();

      // 渲染测试
      const renderEnd = measurer.start('regression-render');
      cropper.setCropData({ x: 100, y: 100, width: 300, height: 300, shape: 'rectangle' });
      const renderTime = renderEnd();

      // 导出测试
      const exportEnd = measurer.start('regression-export');
      await cropper.getCroppedBlob();
      const exportTime = exportEnd();

      // 检查是否在基准范围内
      expect(initTime).toBeLessThan(benchmarkResults.initialization);
      expect(loadTime).toBeLessThan(benchmarkResults.imageLoading);
      expect(renderTime).toBeLessThan(benchmarkResults.rendering);
      expect(exportTime).toBeLessThan(benchmarkResults.export);
    });
  });
});