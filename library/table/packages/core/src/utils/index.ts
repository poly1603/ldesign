/**
 * 工具函数
 */

import type { RowData, RowKey } from '../types';

/**
 * 生成唯一ID
 */
let idCounter = 0;
export function generateId(prefix = 'id'): string {
  return `${prefix}-${++idCounter}-${Date.now()}`;
}

/**
 * 获取行的唯一键
 */
export function getRowKey<TData extends RowData>(
  row: TData,
  rowKey: keyof TData | ((row: TData) => RowKey),
  index: number
): RowKey {
  if (typeof rowKey === 'function') {
    return rowKey(row);
  }
  return row[rowKey] ?? index;
}

/**
 * 防抖
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
 * 节流
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastTime = 0;
  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      fn.apply(this, args);
      lastTime = now;
    }
  };
}

/**
 * 深度克隆
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map((item) => deepClone(item)) as any;
  if (obj instanceof Set) return new Set(Array.from(obj).map(deepClone)) as any;
  if (obj instanceof Map) {
    return new Map(
      Array.from(obj.entries()).map(([k, v]) => [deepClone(k), deepClone(v)])
    ) as any;
  }
  const cloned: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

/**
 * 获取嵌套属性值
 */
export function getNestedValue(obj: any, path: string): any {
  const keys = path.split('.');
  let result = obj;
  for (const key of keys) {
    result = result?.[key];
    if (result === undefined) break;
  }
  return result;
}

/**
 * 设置嵌套属性值
 */
export function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  let current = obj;
  for (const key of keys) {
    if (!(key in current)) {
      current[key] = {};
    }
    current = current[key];
  }
  current[lastKey] = value;
}

/**
 * 比较两个值是否相等（浅比较）
 */
export function shallowEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  if (a === null || b === null) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (a[key] !== b[key]) return false;
  }

  return true;
}



