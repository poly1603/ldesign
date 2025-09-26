/**
 * @ldesign/cropper 通用工具函数
 * 
 * 提供通用的工具函数和辅助方法
 */

// ============================================================================
// ID生成工具
// ============================================================================

/**
 * 生成唯一ID
 * @param prefix ID前缀
 * @returns 唯一ID
 */
export function generateId(prefix: string = 'id'): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * 生成UUID v4
 * @returns UUID字符串
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 生成短ID
 * @param length ID长度
 * @returns 短ID字符串
 */
export function generateShortId(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ============================================================================
// 对象工具
// ============================================================================

/**
 * 深度克隆对象
 * @param obj 要克隆的对象
 * @returns 克隆后的对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T;
  }

  if (typeof obj === 'object') {
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }

  return obj;
}

/**
 * 深度合并对象
 * @param target 目标对象
 * @param sources 源对象数组
 * @returns 合并后的对象
 */
export function deepMerge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return deepMerge(target, ...sources);
}

/**
 * 检查是否为对象
 * @param item 要检查的项目
 * @returns 是否为对象
 */
function isObject(item: any): item is Record<string, any> {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * 获取对象的嵌套属性值
 * @param obj 对象
 * @param path 属性路径（如 'a.b.c'）
 * @param defaultValue 默认值
 * @returns 属性值
 */
export function getNestedValue<T = any>(
  obj: Record<string, any>,
  path: string,
  defaultValue?: T
): T {
  const keys = path.split('.');
  let result = obj;

  for (const key of keys) {
    if (result === null || result === undefined || !(key in result)) {
      return defaultValue as T;
    }
    result = result[key];
  }

  return result as T;
}

/**
 * 设置对象的嵌套属性值
 * @param obj 对象
 * @param path 属性路径（如 'a.b.c'）
 * @param value 要设置的值
 */
export function setNestedValue(
  obj: Record<string, any>,
  path: string,
  value: any
): void {
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

// ============================================================================
// 数组工具
// ============================================================================

/**
 * 数组去重
 * @param array 数组
 * @param keyFn 键函数（可选）
 * @returns 去重后的数组
 */
export function unique<T>(array: T[], keyFn?: (item: T) => any): T[] {
  if (!keyFn) {
    return [...new Set(array)];
  }

  const seen = new Set();
  return array.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * 数组分块
 * @param array 数组
 * @param size 块大小
 * @returns 分块后的数组
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * 数组扁平化
 * @param array 嵌套数组
 * @param depth 扁平化深度
 * @returns 扁平化后的数组
 */
export function flatten<T>(array: any[], depth: number = 1): T[] {
  if (depth <= 0) return array;
  
  return array.reduce((acc, val) => {
    if (Array.isArray(val)) {
      acc.push(...flatten(val, depth - 1));
    } else {
      acc.push(val);
    }
    return acc;
  }, []);
}

// ============================================================================
// 字符串工具
// ============================================================================

/**
 * 首字母大写
 * @param str 字符串
 * @returns 首字母大写的字符串
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * 驼峰命名转换
 * @param str 字符串
 * @returns 驼峰命名的字符串
 */
export function camelCase(str: string): string {
  return str.replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '');
}

/**
 * 短横线命名转换
 * @param str 字符串
 * @returns 短横线命名的字符串
 */
export function kebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * 下划线命名转换
 * @param str 字符串
 * @returns 下划线命名的字符串
 */
export function snakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

/**
 * 截断字符串
 * @param str 字符串
 * @param length 最大长度
 * @param suffix 后缀
 * @returns 截断后的字符串
 */
export function truncate(str: string, length: number, suffix: string = '...'): string {
  if (str.length <= length) return str;
  return str.substring(0, length - suffix.length) + suffix;
}

// ============================================================================
// 数字工具
// ============================================================================

/**
 * 格式化数字
 * @param num 数字
 * @param decimals 小数位数
 * @param thousandsSep 千位分隔符
 * @param decimalSep 小数分隔符
 * @returns 格式化后的字符串
 */
export function formatNumber(
  num: number,
  decimals: number = 2,
  thousandsSep: string = ',',
  decimalSep: string = '.'
): string {
  const fixed = num.toFixed(decimals);
  const parts = fixed.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep);
  return parts.join(decimalSep);
}

/**
 * 随机整数
 * @param min 最小值
 * @param max 最大值
 * @returns 随机整数
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 随机浮点数
 * @param min 最小值
 * @param max 最大值
 * @returns 随机浮点数
 */
export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// ============================================================================
// 时间工具
// ============================================================================

/**
 * 格式化时间
 * @param date 日期对象或时间戳
 * @param format 格式字符串
 * @returns 格式化后的时间字符串
 */
export function formatDate(date: Date | number, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 获取相对时间
 * @param date 日期对象或时间戳
 * @returns 相对时间字符串
 */
export function getRelativeTime(date: Date | number): string {
  const now = Date.now();
  const time = typeof date === 'number' ? date : date.getTime();
  const diff = now - time;
  
  const minute = 60 * 1000;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30;
  const year = day * 365;
  
  if (diff < minute) return '刚刚';
  if (diff < hour) return `${Math.floor(diff / minute)}分钟前`;
  if (diff < day) return `${Math.floor(diff / hour)}小时前`;
  if (diff < week) return `${Math.floor(diff / day)}天前`;
  if (diff < month) return `${Math.floor(diff / week)}周前`;
  if (diff < year) return `${Math.floor(diff / month)}个月前`;
  return `${Math.floor(diff / year)}年前`;
}

// ============================================================================
// 异步工具
// ============================================================================

/**
 * 延迟执行
 * @param ms 延迟毫秒数
 * @returns Promise
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 超时Promise
 * @param promise 原Promise
 * @param timeout 超时时间（毫秒）
 * @param timeoutMessage 超时错误消息
 * @returns 带超时的Promise
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeout: number,
  timeoutMessage: string = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(timeoutMessage)), timeout);
    })
  ]);
}

/**
 * 重试执行
 * @param fn 要执行的函数
 * @param retries 重试次数
 * @param delay 重试延迟
 * @returns Promise
 */
export async function retry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    await delay(delayMs);
    return retry(fn, retries - 1, delayMs);
  }
}
