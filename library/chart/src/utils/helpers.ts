/**
 * 通用辅助函数
 */

/**
 * 深度合并对象
 */
export function deepMerge<T extends Record<string, any>>(
  target: T,
  source: Partial<T>
): T {
  const result = { ...target };

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (isObject(sourceValue) && isObject(targetValue)) {
        result[key] = deepMerge(targetValue, sourceValue) as any;
      } else if (sourceValue !== undefined) {
        result[key] = sourceValue as any;
      }
    }
  }

  return result;
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

