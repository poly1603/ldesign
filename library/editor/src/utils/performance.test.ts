/**
 * Performance Utilities Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  PerformanceMonitor, 
  debounce, 
  throttle, 
  VirtualScroller,
  LazyLoader,
  performanceMonitor 
} from './performance';

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    monitor = new PerformanceMonitor();
  });

  afterEach(() => {
    monitor.destroy();
  });

  describe('measurement', () => {
    it('should measure function execution time', () => {
      const result = monitor.measure('test-function', () => {
        // Simulate some work
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
          sum += i;
        }
        return sum;
      });

      expect(result).toBe(499500); // Sum of 0 to 999
    });

    it('should measure async function execution time', async () => {
      const result = await monitor.measureAsync('test-async', async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'done';
      });

      expect(result).toBe('done');
    });

    it('should start and end measurement manually', () => {
      const endMeasurement = monitor.startMeasurement('manual-test');
      
      // Simulate some work
      let sum = 0;
      for (let i = 0; i < 100; i++) {
        sum += i;
      }
      
      const duration = endMeasurement();
      expect(duration).toBeGreaterThan(0);
    });
  });

  describe('metrics recording', () => {
    it('should record performance metrics', () => {
      monitor.recordMetrics({
        renderTime: 16.5,
        updateTime: 8.2,
        operationCount: 5
      });

      const metrics = monitor.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].renderTime).toBe(16.5);
      expect(metrics[0].updateTime).toBe(8.2);
      expect(metrics[0].operationCount).toBe(5);
    });

    it('should calculate average metrics', () => {
      monitor.recordMetrics({ renderTime: 10, updateTime: 5 });
      monitor.recordMetrics({ renderTime: 20, updateTime: 15 });
      monitor.recordMetrics({ renderTime: 30, updateTime: 25 });

      const average = monitor.getAverageMetrics();
      expect(average.renderTime).toBe(20);
      expect(average.updateTime).toBe(15);
    });

    it('should limit metrics history', () => {
      // Record more than max metrics
      for (let i = 0; i < 150; i++) {
        monitor.recordMetrics({ renderTime: i });
      }

      const metrics = monitor.getMetrics();
      expect(metrics.length).toBeLessThanOrEqual(100);
    });

    it('should clear metrics', () => {
      monitor.recordMetrics({ renderTime: 10 });
      expect(monitor.getMetrics()).toHaveLength(1);

      monitor.clearMetrics();
      expect(monitor.getMetrics()).toHaveLength(0);
    });
  });
});

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should debounce function calls', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn();
    debouncedFn();
    debouncedFn();

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should call immediately when immediate is true', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 100, true);

    debouncedFn();
    expect(fn).toHaveBeenCalledTimes(1);

    debouncedFn();
    debouncedFn();
    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should pass arguments correctly', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn('arg1', 'arg2');
    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
  });
});

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should throttle function calls', () => {
    const fn = vi.fn();
    const throttledFn = throttle(fn, 100);

    throttledFn();
    throttledFn();
    throttledFn();

    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(100);
    throttledFn();
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should pass arguments correctly', () => {
    const fn = vi.fn();
    const throttledFn = throttle(fn, 100);

    throttledFn('arg1', 'arg2');
    expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
  });
});

describe('VirtualScroller', () => {
  let container: HTMLElement;
  let scroller: VirtualScroller;
  let renderCallback: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    container = document.createElement('div');
    container.style.height = '300px';
    container.style.overflow = 'auto';
    document.body.appendChild(container);

    renderCallback = vi.fn();
    scroller = new VirtualScroller(container, 30, renderCallback);
  });

  afterEach(() => {
    scroller.destroy();
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  it('should create virtual scroller', () => {
    expect(scroller).toBeDefined();
  });

  it('should set total count and update height', () => {
    scroller.setTotalCount(100);
    expect(container.style.height).toBe('3000px'); // 100 * 30px
  });

  it('should call render callback with visible range', () => {
    scroller.setTotalCount(100);
    expect(renderCallback).toHaveBeenCalledWith(0, expect.any(Number));
  });

  it('should scroll to specific item', () => {
    scroller.setTotalCount(100);
    scroller.scrollToItem(10);
    expect(container.scrollTop).toBe(300); // 10 * 30px
  });
});

describe('LazyLoader', () => {
  let loader: LazyLoader;
  let loadCallback: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Mock IntersectionObserver
    global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
      callback
    }));

    loadCallback = vi.fn();
    loader = new LazyLoader(loadCallback);
  });

  afterEach(() => {
    loader.destroy();
  });

  it('should create lazy loader', () => {
    expect(loader).toBeDefined();
  });

  it('should observe elements', () => {
    const element = document.createElement('div');
    loader.observe(element);
    
    expect(IntersectionObserver).toHaveBeenCalled();
  });

  it('should unobserve elements', () => {
    const element = document.createElement('div');
    loader.observe(element);
    loader.unobserve(element);
    
    // Should not throw
    expect(() => loader.unobserve(element)).not.toThrow();
  });
});

describe('global performance monitor', () => {
  it('should provide global instance', () => {
    expect(performanceMonitor).toBeDefined();
    expect(performanceMonitor).toBeInstanceOf(PerformanceMonitor);
  });

  it('should be reusable across tests', () => {
    performanceMonitor.recordMetrics({ renderTime: 10 });
    expect(performanceMonitor.getMetrics().length).toBeGreaterThan(0);
  });
});
