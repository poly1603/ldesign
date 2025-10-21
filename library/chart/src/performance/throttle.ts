/**
 * 节流和防抖工具
 */

/**
 * 高级防抖函数
 */
export function advancedDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
  options: {
    leading?: boolean; // 是否在延迟开始前调用
    trailing?: boolean; // 是否在延迟结束后调用
    maxWait?: number; // 最大等待时间
  } = {}
): (...args: Parameters<T>) => void {
  const { leading = false, trailing = true, maxWait } = options;

  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastCallTime = 0;
  let lastInvokeTime = 0;

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;
    const timeSinceLastInvoke = now - lastInvokeTime;

    lastCallTime = now;

    // 是否应该立即调用
    const shouldInvoke =
      (leading && timeSinceLastCall >= delay) ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait);

    if (shouldInvoke) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      lastInvokeTime = now;
      fn.apply(this, args);
      return;
    }

    // 清除之前的定时器
    if (timer) clearTimeout(timer);

    // 设置新的定时器
    if (trailing) {
      timer = setTimeout(() => {
        lastInvokeTime = Date.now();
        fn.apply(this, args);
        timer = null;
      }, delay);
    }
  };
}

/**
 * 高级节流函数
 */
export function advancedThrottle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
  options: {
    leading?: boolean;
    trailing?: boolean;
  } = {}
): (...args: Parameters<T>) => void {
  const { leading = true, trailing = false } = options;

  let lastCallTime = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;

    lastArgs = args;

    // 立即执行
    if (leading && timeSinceLastCall >= delay) {
      lastCallTime = now;
      fn.apply(this, args);
      return;
    }

    // 设置延迟执行
    if (trailing && !timer) {
      timer = setTimeout(() => {
        if (lastArgs) {
          lastCallTime = Date.now();
          fn.apply(this, lastArgs);
        }
        timer = null;
        lastArgs = null;
      }, delay - timeSinceLastCall);
    }
  };
}

/**
 * 请求动画帧节流
 */
export function rafThrottle<T extends (...args: any[]) => any>(
  fn: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null;
  let lastArgs: Parameters<T> | null = null;

  return function (this: any, ...args: Parameters<T>) {
    lastArgs = args;

    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        if (lastArgs) {
          fn.apply(this, lastArgs);
        }
        rafId = null;
        lastArgs = null;
      });
    }
  };
}

/**
 * 空闲时执行
 */
export function idleCallback<T extends (...args: any[]) => any>(
  fn: T,
  options?: IdleRequestOptions
): (...args: Parameters<T>) => void {
  let idleId: number | null = null;

  return function (this: any, ...args: Parameters<T>) {
    if (idleId !== null) {
      cancelIdleCallback(idleId);
    }

    if (typeof requestIdleCallback !== 'undefined') {
      idleId = requestIdleCallback(() => {
        fn.apply(this, args);
        idleId = null;
      }, options);
    } else {
      // Fallback
      setTimeout(() => {
        fn.apply(this, args);
        idleId = null;
      }, 16);
    }
  };
}

/**
 * 批量处理
 */
export function batchProcess<T>(
  items: T[],
  processor: (item: T, index: number) => void,
  batchSize = 100,
  delay = 0
): Promise<void> {
  return new Promise((resolve) => {
    let index = 0;

    function processBatch() {
      const end = Math.min(index + batchSize, items.length);

      for (let i = index; i < end; i++) {
        processor(items[i], i);
      }

      index = end;

      if (index < items.length) {
        if (delay > 0) {
          setTimeout(processBatch, delay);
        } else {
          requestAnimationFrame(processBatch);
        }
      } else {
        resolve();
      }
    }

    processBatch();
  });
}

