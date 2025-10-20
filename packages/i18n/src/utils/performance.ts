/**
 * @ldesign/i18n - Performance Utilities
 * Lightweight performance monitoring and optimization tools
 */

/**
 * Simple performance mark wrapper
 */
export class PerformanceMark {
  private marks = new Map<string, number>();
  private measures = new Map<string, number[]>();
  private enabled: boolean;

  constructor(enabled = typeof performance !== 'undefined') {
    this.enabled = enabled;
  }

  /**
   * Mark a performance point
   */
  mark(name: string): void {
    if (!this.enabled) return;
    this.marks.set(name, performance.now());
  }

  /**
   * Measure time between marks
   */
  measure(name: string, startMark: string, endMark?: string): number | undefined {
    if (!this.enabled) return undefined;

    const start = this.marks.get(startMark);
    if (start === undefined) return undefined;

    const end = endMark ? this.marks.get(endMark) : performance.now();
    if (end === undefined) return undefined;

    const duration = end - start;
    
    if (!this.measures.has(name)) {
      this.measures.set(name, []);
    }
    this.measures.get(name)!.push(duration);

    return duration;
  }

  /**
   * Get average duration for a measure
   */
  getAverage(name: string): number | undefined {
    const measures = this.measures.get(name);
    if (!measures || measures.length === 0) return undefined;

    const sum = measures.reduce((a, b) => a + b, 0);
    return sum / measures.length;
  }

  /**
   * Get all measures for a name
   */
  getMeasures(name: string): number[] {
    return this.measures.get(name) || [];
  }

  /**
   * Clear all marks and measures
   */
  clear(): void {
    this.marks.clear();
    this.measures.clear();
  }

  /**
   * Get summary
   */
  getSummary(): Record<string, { count: number; avg: number; min: number; max: number }> {
    const summary: Record<string, { count: number; avg: number; min: number; max: number }> = {};

    for (const [name, measures] of this.measures) {
      if (measures.length > 0) {
        const sum = measures.reduce((a, b) => a + b, 0);
        summary[name] = {
          count: measures.length,
          avg: sum / measures.length,
          min: Math.min(...measures),
          max: Math.max(...measures)
        };
      }
    }

    return summary;
  }
}

/**
 * Debounce function - Optimized with leading/trailing options
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options: { leading?: boolean; trailing?: boolean; maxWait?: number } = {}
): T & { cancel: () => void; flush: () => void } {
  const { leading = false, trailing = true, maxWait } = options;
  
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let maxTimeoutId: ReturnType<typeof setTimeout> | undefined;
  let lastCallTime = 0;
  let lastInvokeTime = 0;
  let lastArgs: any[] | undefined;
  let lastThis: any;
  let result: any;

  function invokeFunc(time: number) {
    const args = lastArgs!;
    const thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function startTimer(pendingFunc: () => void, wait: number) {
    return setTimeout(pendingFunc, wait);
  }

  function cancelTimer(id: ReturnType<typeof setTimeout> | undefined) {
    if (id !== undefined) {
      clearTimeout(id);
    }
  }

  function leadingEdge(time: number) {
    lastInvokeTime = time;
    timeoutId = startTimer(timerExpired, wait);
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time: number) {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = wait - timeSinceLastCall;

    return maxWait !== undefined
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  }

  function shouldInvoke(time: number) {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;

    return (
      lastCallTime === 0 ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    );
  }

  function timerExpired() {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timeoutId = startTimer(timerExpired, remainingWait(time));
  }

  function trailingEdge(time: number) {
    timeoutId = undefined;

    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    cancelTimer(timeoutId);
    cancelTimer(maxTimeoutId);
    lastInvokeTime = 0;
    lastCallTime = 0;
    lastArgs = lastThis = timeoutId = maxTimeoutId = undefined;
  }

  function flush() {
    return timeoutId === undefined ? result : trailingEdge(Date.now());
  }

  function debounced(this: any, ...args: any[]) {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastArgs = args;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timeoutId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxWait !== undefined) {
        timeoutId = startTimer(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timeoutId === undefined) {
      timeoutId = startTimer(timerExpired, wait);
    }
    return result;
  }

  debounced.cancel = cancel;
  debounced.flush = flush;

  return debounced as any;
}

/**
 * Throttle function - Optimized implementation
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options: { leading?: boolean; trailing?: boolean } = {}
): T & { cancel: () => void; flush: () => void } {
  return debounce(func, wait, {
    leading: options.leading !== false,
    trailing: options.trailing !== false,
    maxWait: wait
  });
}

/**
 * Memoize function results with LRU cache
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  options: {
    maxSize?: number;
    resolver?: (...args: any[]) => string;
    ttl?: number;
  } = {}
): T & { cache: Map<string, { value: any; expires?: number }>; clear: () => void } {
  const { maxSize = 100, resolver = JSON.stringify, ttl } = options;
  
  const cache = new Map<string, { value: any; expires?: number }>();
  const lruKeys: string[] = [];

  function memoized(this: any, ...args: any[]) {
    const key = resolver(...args);
    
    const cached = cache.get(key);
    if (cached) {
      // Check expiration
      if (cached.expires && Date.now() > cached.expires) {
        cache.delete(key);
        const index = lruKeys.indexOf(key);
        if (index > -1) lruKeys.splice(index, 1);
      } else {
        // Move to end (most recently used)
        const index = lruKeys.indexOf(key);
        if (index > -1) {
          lruKeys.splice(index, 1);
          lruKeys.push(key);
        }
        return cached.value;
      }
    }

    const result = func.apply(this, args);
    
    // Add to cache
    const entry: { value: any; expires?: number } = { value: result };
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    
    cache.set(key, entry);
    lruKeys.push(key);

    // Evict oldest if over max size
    if (lruKeys.length > maxSize) {
      const oldestKey = lruKeys.shift()!;
      cache.delete(oldestKey);
    }

    return result;
  }

  memoized.cache = cache;
  memoized.clear = () => {
    cache.clear();
    lruKeys.length = 0;
  };

  return memoized as any;
}

/**
 * RAF-based scheduler for batching updates
 */
export class RAFScheduler {
  private rafId: number | null = null;
  private callbacks: Array<() => void> = [];

  /**
   * Schedule a callback
   */
  schedule(callback: () => void): void {
    this.callbacks.push(callback);
    
    if (this.rafId === null && typeof requestAnimationFrame !== 'undefined') {
      this.rafId = requestAnimationFrame(() => this.flush());
    }
  }

  /**
   * Flush all pending callbacks
   */
  flush(): void {
    const callbacks = this.callbacks;
    this.callbacks = [];
    this.rafId = null;

    for (let i = 0; i < callbacks.length; i++) {
      try {
        callbacks[i]();
      } catch (err) {
        console.error('RAF callback error:', err);
      }
    }
  }

  /**
   * Cancel all pending callbacks
   */
  cancel(): void {
    if (this.rafId !== null && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this.rafId);
    }
    this.rafId = null;
    this.callbacks = [];
  }
}

