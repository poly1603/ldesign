/**
 * 通用辅助函数 - 记忆化、性能优化
 */

/**
 * 深度合并对象（优化版 - 减少对象创建）
 */
export function deepMerge<T extends Record<string, any>>(
  target: T,
  source: Partial<T>
): T {
  // 快速路径：如果 source 为空，直接返回 target
  if (!source || Object.keys(source).length === 0) {
    return target;
  }

  const result = { ...target };

  for (const key in source) {
    if (!Object.prototype.hasOwnProperty.call(source, key)) continue;

    const sourceValue = source[key];
    const targetValue = result[key];

    if (isObject(sourceValue) && isObject(targetValue)) {
      // 检查是否真的需要合并
      if (JSON.stringify(sourceValue) !== JSON.stringify(targetValue)) {
        result[key] = deepMerge(targetValue, sourceValue) as any;
      }
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue as any;
    }
  }

  return result;
}

/**
 * 记忆化装饰器
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  options: {
    maxSize?: number;
    ttl?: number; // Time to live (ms)
    keyGenerator?: (...args: Parameters<T>) => string;
  } = {}
): T {
  const { maxSize = 100, ttl, keyGenerator } = options;
  const cache = new Map<string, { value: ReturnType<T>; timestamp: number }>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    const cached = cache.get(key);

    // 检查缓存
    if (cached) {
      // 检查是否过期
      if (!ttl || Date.now() - cached.timestamp < ttl) {
        return cached.value;
      }
      cache.delete(key);
    }

    // 计算新值
    const value = fn(...args);

    // 缓存大小限制
    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    cache.set(key, { value, timestamp: Date.now() });
    return value;
  }) as T;
}

/**
 * 批处理函数
 */
export function batch<T, R>(
  fn: (items: T[]) => R,
  options: {
    delay?: number;
    maxSize?: number;
  } = {}
): (item: T) => Promise<R> {
  const { delay = 10, maxSize = 10 } = options;
  let queue: T[] = [];
  let timer: ReturnType<typeof setTimeout> | null = null;
  let resolvers: Array<(value: R) => void> = [];

  const flush = () => {
    if (queue.length === 0) return;

    const items = queue;
    const currentResolvers = resolvers;
    queue = [];
    resolvers = [];

    const result = fn(items);
    currentResolvers.forEach(resolve => resolve(result));
  };

  return (item: T): Promise<R> => {
    return new Promise((resolve) => {
      queue.push(item);
      resolvers.push(resolve);

      if (queue.length >= maxSize) {
        if (timer) clearTimeout(timer);
        flush();
      } else {
        if (timer) clearTimeout(timer);
        timer = setTimeout(flush, delay);
      }
    });
  };
}

/**
 * 判断是否是对象
 */
export function isObject(value: any): value is Record<string, any> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * 判断是否是数组
 */
export function isArray(value: any): value is any[] {
  return Array.isArray(value);
}

/**
 * 判断是否是函数
 */
export function isFunction(value: any): value is Function {
  return typeof value === 'function';
}

/**
 * 判断是否是字符串
 */
export function isString(value: any): value is string {
  return typeof value === 'string';
}

/**
 * 判断是否是数字
 */
export function isNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * 判断是否是布尔值
 */
export function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean';
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return function (this: any, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now();

    if (now - lastCall >= delay) {
      lastCall = now;
      fn.apply(this, args);
    } else {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        lastCall = Date.now();
        fn.apply(this, args);
        timer = null;
      }, delay - (now - lastCall));
    }
  };
}

/**
 * 生成唯一 ID
 */
export function generateId(prefix = 'chart'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 克隆对象
 */
export function clone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map((item) => clone(item)) as any;
  if (obj instanceof Object) {
    const clonedObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clonedObj[key] = clone((obj as any)[key]);
      }
    }
    return clonedObj;
  }
  return obj;
}

/**
 * 延迟执行
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 格式化数字
 */
export function formatNumber(
  num: number,
  options: {
    decimals?: number;
    separator?: string;
    prefix?: string;
    suffix?: string;
  } = {}
): string {
  const {
    decimals = 2,
    separator = ',',
    prefix = '',
    suffix = '',
  } = options;

  const parts = num.toFixed(decimals).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);

  return prefix + parts.join('.') + suffix;
}

/**
 * 获取对象路径值
 */
export function getPath(obj: any, path: string, defaultValue?: any): any {
  const keys = path.split('.');
  let result = obj;

  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue;
    }
    result = result[key];
  }

  return result !== undefined ? result : defaultValue;
}

/**
 * 设置对象路径值
 */
export function setPath(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  let current = obj;

  for (const key of keys) {
    if (!(key in current) || !isObject(current[key])) {
      current[key] = {};
    }
    current = current[key];
  }

  current[lastKey] = value;
}

/**
 * 安全的 JSON 解析
 */
export function safeJsonParse<T = any>(json: string, defaultValue?: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return defaultValue as T;
  }
}

/**
 * 安全的 JSON 字符串化
 */
export function safeJsonStringify(
  obj: any,
  space?: string | number
): string {
  try {
    return JSON.stringify(obj, null, space);
  } catch {
    return '';
  }
}

/**
 * 深度克隆（优化版 - 使用结构化克隆）
 */
export function deepClone<T>(obj: T): T {
  // 使用浏览器原生 structuredClone（如果可用）
  if (typeof structuredClone !== 'undefined') {
    try {
      return structuredClone(obj);
    } catch {
      // 回退到手动克隆
    }
  }

  return clone(obj);
}

/**
 * 对象比较（浅比较）
 */
export function shallowEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;

  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
    return false;
  }

  if (obj1 === null || obj2 === null) {
    return obj1 === obj2;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
}

/**
 * 数组去重（优化版）
 */
export function unique<T>(arr: T[], keyFn?: (item: T) => any): T[] {
  if (keyFn) {
    const seen = new Set();
    return arr.filter(item => {
      const key = keyFn(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  return Array.from(new Set(arr));
}

/**
 * 数组分组
 */
export function groupBy<T>(
  arr: T[],
  keyFn: (item: T) => string | number
): Record<string | number, T[]> {
  const result: Record<string | number, T[]> = {};

  for (const item of arr) {
    const key = keyFn(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
  }

  return result;
}

/**
 * 数组扁平化（指定深度）
 */
export function flattenDeep<T>(arr: any[], depth = Infinity): T[] {
  if (depth <= 0) return arr;

  return arr.reduce((acc, val) => {
    return Array.isArray(val)
      ? acc.concat(flattenDeep(val, depth - 1))
      : acc.concat(val);
  }, []);
}

/**
 * 范围生成器
 */
export function range(start: number, end?: number, step = 1): number[] {
  if (end === undefined) {
    end = start;
    start = 0;
  }

  const result: number[] = [];
  for (let i = start; i < end; i += step) {
    result.push(i);
  }

  return result;
}

/**
 * 随机数生成（指定范围）
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 随机字符串
 */
export function randomString(length = 8): string {
  return Math.random().toString(36).substring(2, 2 + length);
}

/**
 * 睡眠函数
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 重试函数
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    retries?: number;
    delay?: number;
    backoff?: number;
  } = {}
): Promise<T> {
  const { retries = 3, delay = 1000, backoff = 2 } = options;

  let lastError: Error | unknown;

  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < retries) {
        await sleep(delay * Math.pow(backoff, i));
      }
    }
  }

  throw lastError;
}

/**
 * 限流函数（同时执行数量限制）
 */
export async function pLimit<T>(
  tasks: Array<() => Promise<T>>,
  limit: number
): Promise<T[]> {
  const results: T[] = [];
  const executing: Promise<void>[] = [];

  for (const task of tasks) {
    const p = task().then(result => {
      results.push(result);
      executing.splice(executing.indexOf(p), 1);
    });

    executing.push(p);

    if (executing.length >= limit) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);
  return results;
}

/**
 * 对象属性选择器
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * 对象属性排除器
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

