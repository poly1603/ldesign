/**
 * @ldesign/i18n - Utility Helpers
 * Common utility functions for the i18n system
 */

import type { Locale } from '../types';

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
 * Deep clone an object - Optimized version with depth limit
 */
export function deepClone<T>(obj: T, maxDepth = 10, currentDepth = 0): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (currentDepth >= maxDepth) return obj; // Prevent stack overflow
  
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof RegExp) return new RegExp(obj.source, obj.flags) as any;
  if (Array.isArray(obj)) {
    const arr = Array.from({length: obj.length});
    for (let i = 0; i < obj.length; i++) {
      arr[i] = deepClone(obj[i], maxDepth, currentDepth + 1);
    }
    return arr as any;
  }
  if (obj instanceof Set) {
    const set = new Set();
    for (const item of obj) {
      set.add(deepClone(item, maxDepth, currentDepth + 1));
    }
    return set as any;
  }
  if (obj instanceof Map) {
    const map = new Map();
    for (const [k, v] of obj) {
      map.set(k, deepClone(v, maxDepth, currentDepth + 1));
    }
    return map as any;
  }
  
  // Use Object.create(null) for faster object creation
  const cloned = Object.create(Object.getPrototypeOf(obj));
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    cloned[key] = deepClone((obj as any)[key], maxDepth, currentDepth + 1);
  }
  return cloned;
}

/**
 * Deep merge objects - Optimized iterative version
 */
export function deepMerge<T extends Record<string, any>>(
  target: T,
  ...sources: Partial<T>[]
): T {
  if (!sources.length) return target;
  
  for (const source of sources) {
    if (!source) continue;
    
    if (isPlainObject(target) && isPlainObject(source)) {
      // Use Object.keys for better performance
      const keys = Object.keys(source);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const sourceValue = source[key];
        
        if (isPlainObject(sourceValue)) {
          if (!target[key]) {
            target[key] = {} as any;
          }
          deepMerge(target[key] as any, sourceValue as any);
        } else {
          target[key] = sourceValue as any;
        }
      }
    }
  }
  
  return target;
}

/**
 * Get nested value from object using dot notation - Optimized with cache
 */
const pathCache = new Map<string, string[]>();
const PATH_CACHE_MAX = 500;

export function getNestedValue(obj: any, path: string, separator = '.'): any {
  if (!path) return obj;
  
  // Cache path splits
  let keys = pathCache.get(path);
  if (!keys) {
    keys = path.split(separator);
    if (pathCache.size < PATH_CACHE_MAX) {
      pathCache.set(path, keys);
    }
  }
  
  let current = obj;
  for (let i = 0; i < keys.length; i++) {
    if (current == null) return undefined;
    current = current[keys[i]];
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
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
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
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      setNestedValue(result, key, obj[key], separator);
    }
  }
  
  return result;
}

/**
 * Escape HTML special characters - Optimized with static map
 */
const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;'
};

const HTML_ESCAPE_REGEX = /[&<>"'/]/g;

export function escapeHtml(str: string): string {
  return str.replace(HTML_ESCAPE_REGEX, char => HTML_ESCAPE_MAP[char]);
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
  let timeoutId: ReturnType<typeof setTimeout>;
  
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
 * Create a simple event emitter with memory leak protection
 */
export class EventEmitter {
  private readonly events = new Map<string, Set<(...args: any[]) => void>>();
  private readonly maxListeners = 100; // Prevent memory leaks
  private listenerCount = 0;
  
  on(event: string, listener: (...args: any[]) => void): () => void {
    let listeners = this.events.get(event);
    if (!listeners) {
      listeners = new Set();
      this.events.set(event, listeners);
    }
    
    // Prevent memory leaks
    if (this.listenerCount >= this.maxListeners) {
      console.warn(`[@ldesign/i18n] Max listeners (${this.maxListeners}) exceeded`);
      return () => {};
    }
    
    listeners.add(listener);
    this.listenerCount++;
    
    // Return unsubscribe function
    return () => {
      if (listeners.delete(listener)) {
        this.listenerCount--;
      }
    };
  }
  
  off(event: string, listener: (...args: any[]) => void): void {
    const listeners = this.events.get(event);
    if (listeners?.delete(listener)) {
      this.listenerCount--;
      if (listeners.size === 0) {
        this.events.delete(event);
      }
    }
  }
  
  once(event: string, listener: (...args: any[]) => void): void {
    const wrapper = (...args: any[]) => {
      listener(...args);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }
  
  emit(event: string, ...args: any[]): void {
    const listeners = this.events.get(event);
    if (!listeners || listeners.size === 0) return;
    
    // Use for...of for better performance
    for (const listener of listeners) {
      try {
        listener(...args);
      } catch (error) {
        console.error(`[@ldesign/i18n] Error in event listener for "${event}":`, error);
      }
    }
  }
  
  removeAllListeners(event?: string): void {
    if (event) {
      const listeners = this.events.get(event);
      if (listeners) {
        this.listenerCount -= listeners.size;
        this.events.delete(event);
      }
    } else {
      this.events.clear();
      this.listenerCount = 0;
    }
  }
}

/**
 * Warn helper for development
 */
export function warn(message: string, ...args: any[]): void {
  if (typeof window !== 'undefined' && (window as any).__DEV__ === true) {
    console.warn(`[@ldesign/i18n] ${message}`, ...args);
  }
}

/**
 * Error helper for development
 */
export function error(message: string, ...args: any[]): void {
  if (typeof window !== 'undefined' && (window as any).__DEV__ === true) {
    console.error(`[@ldesign/i18n] ${message}`, ...args);
  }
}
