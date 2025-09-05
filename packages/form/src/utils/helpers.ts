/**
 * 辅助工具函数
 * 
 * @description
 * 提供各种辅助工具函数，用于表单处理
 */

import { get, set, has, unset, isEqual, cloneDeep } from 'lodash-es';

/**
 * 生成唯一ID
 * @param prefix 前缀
 * @returns 唯一ID
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 深度获取对象属性值
 * @param obj 对象
 * @param path 路径
 * @param defaultValue 默认值
 * @returns 属性值
 */
export function getValue(obj: any, path: string, defaultValue?: any): any {
  return get(obj, path, defaultValue);
}

/**
 * 深度设置对象属性值
 * @param obj 对象
 * @param path 路径
 * @param value 值
 * @returns 修改后的对象
 */
export function setValue(obj: any, path: string, value: any): any {
  return set(obj, path, value);
}

/**
 * 检查对象是否包含指定路径
 * @param obj 对象
 * @param path 路径
 * @returns 是否包含
 */
export function hasValue(obj: any, path: string): boolean {
  return has(obj, path);
}

/**
 * 删除对象指定路径的属性
 * @param obj 对象
 * @param path 路径
 * @returns 是否删除成功
 */
export function deleteValue(obj: any, path: string): boolean {
  return unset(obj, path);
}

/**
 * 深度比较两个值是否相等
 * @param value1 值1
 * @param value2 值2
 * @returns 是否相等
 */
export function isDeepEqual(value1: any, value2: any): boolean {
  return isEqual(value1, value2);
}

/**
 * 深度克隆对象
 * @param obj 对象
 * @returns 克隆后的对象
 */
export function deepClone<T>(obj: T): T {
  return cloneDeep(obj);
}

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param wait 等待时间（毫秒）
 * @param immediate 是否立即执行
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

/**
 * 节流函数
 * @param func 要节流的函数
 * @param limit 限制时间（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * 异步延迟函数
 * @param ms 延迟时间（毫秒）
 * @returns Promise
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 重试函数
 * @param fn 要重试的函数
 * @param retries 重试次数
 * @param delayMs 重试间隔（毫秒）
 * @returns Promise
 */
export async function retry<T>(
  fn: () => Promise<T>,
  retries: number,
  delayMs = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await delay(delayMs);
      return retry(fn, retries - 1, delayMs);
    }
    throw error;
  }
}

/**
 * 类型守卫：检查是否为字符串
 * @param value 值
 * @returns 是否为字符串
 */
export function isString(value: any): value is string {
  return typeof value === 'string';
}

/**
 * 类型守卫：检查是否为数字
 * @param value 值
 * @returns 是否为数字
 */
export function isNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * 类型守卫：检查是否为布尔值
 * @param value 值
 * @returns 是否为布尔值
 */
export function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean';
}

/**
 * 类型守卫：检查是否为对象
 * @param value 值
 * @returns 是否为对象
 */
export function isObject(value: any): value is object {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * 类型守卫：检查是否为数组
 * @param value 值
 * @returns 是否为数组
 */
export function isArray(value: any): value is any[] {
  return Array.isArray(value);
}

/**
 * 类型守卫：检查是否为函数
 * @param value 值
 * @returns 是否为函数
 */
export function isFunction(value: any): value is Function {
  return typeof value === 'function';
}

/**
 * 类型守卫：检查是否为Promise
 * @param value 值
 * @returns 是否为Promise
 */
export function isPromise(value: any): value is Promise<any> {
  return value instanceof Promise || (value && typeof value.then === 'function');
}

/**
 * 安全的JSON解析
 * @param str JSON字符串
 * @param defaultValue 默认值
 * @returns 解析结果
 */
export function safeJsonParse<T = any>(str: string, defaultValue: T): T {
  try {
    return JSON.parse(str);
  } catch {
    return defaultValue;
  }
}

/**
 * 安全的JSON字符串化
 * @param obj 对象
 * @param defaultValue 默认值
 * @returns JSON字符串
 */
export function safeJsonStringify(obj: any, defaultValue = '{}'): string {
  try {
    return JSON.stringify(obj);
  } catch {
    return defaultValue;
  }
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @param decimals 小数位数
 * @returns 格式化后的大小
 */
export function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * 首字母大写
 * @param str 字符串
 * @returns 首字母大写的字符串
 */
export function capitalize(str: string): string {
  if (!str) return str;
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
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * 下划线命名转换
 * @param str 字符串
 * @returns 下划线命名的字符串
 */
export function snakeCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
}
