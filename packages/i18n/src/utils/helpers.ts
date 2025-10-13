/**
 * @ldesign/i18n - Utility Helpers
 * Common utility functions for the i18n system
 */

import type { Locale, Messages, InterpolationParams } from '../types';

/**
 * Check if a value is a plain object
 */
export function isPlainObject(obj: any): obj is Record<string, any> {
  return obj !== null && typeof obj === 'object' && obj.constructor === Object;
}

/**
 * Check if a value is a string
 */
export function isString(value: any): value is string {
  return typeof value === 'string';
}

/**
 * Check if a value is a function
 */
export function isFunction(value: any): value is Function {
  return typeof value === 'function';
}

/**
 * Check if a value is a promise
 */
export function isPromise<T = any>(value: any): value is Promise<T> {
  return value instanceof Promise || (
    value !== null &&
    typeof value === 'object' &&
    isFunction(value.then) &&
    isFunction(value.catch)
  );
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map((item) => deepClone(item)) as any;
  if (obj instanceof Set) return new Set(Array.from(obj).map(deepClone)) as any;
  if (obj instanceof Map) {
    return new Map(Array.from(obj.entries()).map(([k, v]) => [k, deepClone(v)])) as any;
  }
  
  const cloned = Object.create(Object.getPrototypeOf(obj));
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

/**
 * Deep merge objects
 */
export function deepMerge<T extends Record<string, any>>(
  target: T,
  ...sources: Partial<T>[]
): T {
  if (!sources.length) return target;
  
  const source = sources.shift();
  if (!source) return target;
  
  if (isPlainObject(target) && isPlainObject(source)) {
    for (const key in source) {
      if (isPlainObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key] as any, source[key] as any);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }
  
  return deepMerge(target, ...sources);
}

/**
 * Get nested value from object using dot notation
 */
export function getNestedValue(obj: any, path: string, separator = '.'): any {
  if (!path) return obj;
  
  const keys = path.split(separator);
  let current = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = current[key];
  }
  
  return current;
}

/**
 * Set nested value in object using dot notation
 */
export function setNestedValue(
  obj: any,
  path: string,
  value: any,
  separator = '.'
): void {
  if (!path) return;
  
  const keys = path.split(separator);
  const lastKey = keys.pop();
  
  if (!lastKey) return;
  
  let current = obj;
  for (const key of keys) {
    if (!isPlainObject(current[key])) {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[lastKey] = value;
}

/**
 * Flatten nested object to dot notation
 */
export function flattenObject(
  obj: any,
  prefix = '',
  separator = '.'
): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}${separator}${key}` : key;
      
      if (isPlainObject(obj[key]) && Object.keys(obj[key]).length > 0) {
        Object.assign(result, flattenObject(obj[key], newKey, separator));
      } else {
        result[newKey] = obj[key];
      }
    }
  }
  
  return result;
}

/**
 * Unflatten dot notation object to nested
 */
export function unflattenObject(
  obj: Record<string, any>,
  separator = '.'
): any {
  const result: any = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      setNestedValue(result, key, obj[key], separator);
    }
  }
  
  return result;
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(str: string): string {
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;'
  };
  
  return str.replace(/[&<>"'\/]/g, (char) => escapeMap[char] || char);
}

/**
 * Generate cache key
 */
export function generateCacheKey(
  locale: Locale,
  key: string,
  namespace?: string
): string {
  return namespace ? `${locale}:${namespace}:${key}` : `${locale}:${key}`;
}

/**
 * Parse locale string (e.g., "en-US" -> { language: "en", region: "US" })
 */
export function parseLocale(locale: Locale): {
  language: string;
  region?: string;
} {
  const parts = locale.split(/[-_]/);
  return {
    language: parts[0].toLowerCase(),
    region: parts[1]?.toUpperCase()
  };
}

/**
 * Format locale string consistently
 */
export function formatLocale(language: string, region?: string): Locale {
  return region ? `${language}-${region}` : language;
}

/**
 * Get browser language
 */
export function getBrowserLanguage(): Locale | null {
  if (typeof window === 'undefined') return null;
  
  const nav = window.navigator as any;
  const language = nav.language || nav.userLanguage || nav.browserLanguage;
  
  return language || null;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Create a simple event emitter
 */
export class EventEmitter {
  private events: Map<string, Set<Function>> = new Map();
  
  on(event: string, listener: Function): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(listener);
    
    // Return unsubscribe function
    return () => this.off(event, listener);
  }
  
  off(event: string, listener: Function): void {
    this.events.get(event)?.delete(listener);
  }
  
  once(event: string, listener: Function): void {
    const wrapper = (...args: any[]) => {
      listener(...args);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }
  
  emit(event: string, ...args: any[]): void {
    this.events.get(event)?.forEach(listener => {
      try {
        listener(...args);
      } catch (error) {
        console.error(`Error in event listener for "${event}":`, error);
      }
    });
  }
  
  removeAllListeners(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }
}

/**
 * Warn helper for development
 */
export function warn(message: string, ...args: any[]): void {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[@ldesign/i18n] ${message}`, ...args);
  }
}

/**
 * Error helper for development
 */
export function error(message: string, ...args: any[]): void {
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[@ldesign/i18n] ${message}`, ...args);
  }
}