/**
 * @ldesign/size - Utility Functions
 */

import type { SizeInput, SizeUnit, SizeValue } from '../types';

// 缓存字符串解析结果
const parseCache = new Map<string, SizeValue>();
const MAX_PARSE_CACHE = 200;

/**
 * Parse size input to SizeValue
 */
export function parseSizeInput(input: SizeInput): SizeValue {
  // 快速路径：数字
  if (typeof input === 'number') {
    return { value: input, unit: 'px' };
  }

  // 快速路径：已经是 SizeValue 对象
  if (typeof input === 'object' && 'value' in input && 'unit' in input) {
    return input;
  }

  // 字符串解析路径
  if (typeof input === 'string') {
    // 检查缓存
    const cached = parseCache.get(input);
    if (cached) return cached;
    
    const match = input.match(/^(-?(?:\d+(?:\.\d+)?|\.\d+))(px|rem|em|vw|vh|%|pt|vmin|vmax)?$/);
    if (match) {
      const value = Number.parseFloat(match[1]);
      const unit = (match[2] || 'px') as SizeUnit;
      const result = { value, unit };
      
      // LRU 缓存
      if (parseCache.size >= MAX_PARSE_CACHE) {
        const firstKey = parseCache.keys().next().value;
        if (firstKey !== undefined) {
          parseCache.delete(firstKey);
        }
      }
      parseCache.set(input, result);
      
      return result;
    }
  }

  // Default fallback
  return { value: 0, unit: 'px' };
}

// 格式化结果缓存
const formatCache = new Map<string, string>();
const MAX_FORMAT_CACHE = 200;

/**
 * Format SizeValue to string
 */
export function formatSize(size: SizeValue): string {
  // 快速路径：0
  if (size.value === 0) return '0';
  
  // 检查缓存
  const cacheKey = `${size.value}:${size.unit}`;
  const cached = formatCache.get(cacheKey);
  if (cached) return cached;
  
  const result = `${size.value}${size.unit}`;
  
  // LRU 缓存
  if (formatCache.size >= MAX_FORMAT_CACHE) {
    const firstKey = formatCache.keys().next().value;
    if (firstKey !== undefined) {
      formatCache.delete(firstKey);
    }
  }
  formatCache.set(cacheKey, result);
  
  return result;
}

// 转换结果缓存
const conversionCache = new Map<string, SizeValue>();
const MAX_CONVERSION_CACHE = 500;

// 预计算常用转换因子
const PT_TO_PX = 96 / 72;
const PX_TO_PT = 72 / 96;

/**
 * Convert size between units
 */
export function convertSize(
  size: SizeValue,
  targetUnit: SizeUnit,
  rootFontSize = 16
): SizeValue {
  // 快速路径：相同单位
  if (size.unit === targetUnit) {
    return size;
  }

  // 检查缓存
  const cacheKey = `${size.value}:${size.unit}:${targetUnit}:${rootFontSize}`;
  const cached = conversionCache.get(cacheKey);
  if (cached) return cached;

  // Convert to pixels first
  let pxValue = size.value;
  
  switch (size.unit) {
    case 'rem':
      pxValue = size.value * rootFontSize;
      break;
    case 'em':
      // Assuming 1em = rootFontSize for simplicity
      pxValue = size.value * rootFontSize;
      break;
    case 'pt':
      pxValue = size.value * PT_TO_PX;
      break;
    case '%':
    case 'vw':
    case 'vh':
    case 'vmin':
    case 'vmax':
      // These require context, return as-is for now
      return { value: size.value, unit: targetUnit };
  }

  // Convert from pixels to target unit
  let targetValue = pxValue;
  
  switch (targetUnit) {
    case 'rem':
      targetValue = pxValue / rootFontSize;
      break;
    case 'em':
      targetValue = pxValue / rootFontSize;
      break;
    case 'pt':
      targetValue = pxValue * PX_TO_PT;
      break;
    case 'px':
      targetValue = pxValue;
      break;
    default:
      // For viewport units and percentages, keep original value
      return { value: size.value, unit: targetUnit };
  }

  const result = { value: targetValue, unit: targetUnit };
  
  // LRU 缓存
  if (conversionCache.size >= MAX_CONVERSION_CACHE) {
    const firstKey = conversionCache.keys().next().value;
    if (firstKey !== undefined) {
      conversionCache.delete(firstKey);
    }
  }
  conversionCache.set(cacheKey, result);

  return result;
}

/**
 * Scale a size by a factor
 */
export function scaleSize(size: SizeValue, factor: number): SizeValue {
  return {
    value: size.value * factor,
    unit: size.unit
  };
}

/**
 * Add two sizes (must be same unit or convertible)
 */
export function addSizes(a: SizeValue, b: SizeValue, rootFontSize = 16): SizeValue {
  if (a.unit === b.unit) {
    return { value: a.value + b.value, unit: a.unit };
  }

  // Convert b to a's unit
  const convertedB = convertSize(b, a.unit, rootFontSize);
  return { value: a.value + convertedB.value, unit: a.unit };
}

/**
 * Subtract two sizes
 */
export function subtractSizes(a: SizeValue, b: SizeValue, rootFontSize = 16): SizeValue {
  if (a.unit === b.unit) {
    return { value: a.value - b.value, unit: a.unit };
  }

  const convertedB = convertSize(b, a.unit, rootFontSize);
  return { value: a.value - convertedB.value, unit: a.unit };
}

/**
 * Clamp a size value between min and max
 */
export function clampSize(
  size: SizeValue,
  min?: SizeInput,
  max?: SizeInput,
  rootFontSize = 16
): SizeValue {
  let value = size.value;

  if (min !== undefined) {
    const minSize = parseSizeInput(min);
    const convertedMin = convertSize(minSize, size.unit, rootFontSize);
    value = Math.max(value, convertedMin.value);
  }

  if (max !== undefined) {
    const maxSize = parseSizeInput(max);
    const convertedMax = convertSize(maxSize, size.unit, rootFontSize);
    value = Math.min(value, convertedMax.value);
  }

  return { value, unit: size.unit };
}

// 预计算常用的精度因子
const precisionFactors = new Map<number, number>();
for (let i = 0; i <= 10; i++) {
  precisionFactors.set(i, 10 ** i);
}

/**
 * Round size value to specified precision
 */
export function roundSize(size: SizeValue, precision = 2): SizeValue {
  const factor = precisionFactors.get(precision) ?? (10 ** precision);
  return {
    value: Math.round(size.value * factor) / factor,
    unit: size.unit
  };
}

/**
 * Generate a size scale
 */
export function generateSizeScale(
  base: number,
  ratio: number,
  steps: number,
  unit: SizeUnit = 'px'
): SizeValue[] {
  const sizes: SizeValue[] = [];
  
  // Generate sizes below base
  for (let i = steps; i > 0; i--) {
    const value = base / ratio**i;
    sizes.push({ value: Math.round(value * 100) / 100, unit });
  }
  
  // Add base
  sizes.push({ value: base, unit });
  
  // Generate sizes above base
  for (let i = 1; i <= steps; i++) {
    const value = base * ratio**i;
    sizes.push({ value: Math.round(value * 100) / 100, unit });
  }
  
  return sizes;
}

/**
 * Check if a size is valid
 */
export function isValidSize(input: any): input is SizeInput {
  if (typeof input === 'number') {
    return !Number.isNaN(input) && Number.isFinite(input);
  }

  if (typeof input === 'string') {
    const match = input.match(/^(-?(?:\d+(?:\.\d+)?|\.\d+))(px|rem|em|vw|vh|%|pt|vmin|vmax)?$/);
    return !!match;
  }

  if (typeof input === 'object' && input !== null) {
    return (
      'value' in input &&
      'unit' in input &&
      typeof input.value === 'number' &&
      typeof input.unit === 'string'
    );
  }

  return false;
}

/**
 * Get CSS custom property name
 */
export function getCSSVarName(name: string, prefix = 'size'): string {
  // Convert camelCase to kebab-case
  const kebab = name.replace(/([A-Z])/g, '-$1').toLowerCase();
  return `--${prefix}-${kebab}`;
}

/**
 * Generate CSS value with fallback
 */
export function cssVar(name: string, fallback?: string): string {
  return fallback ? `var(${name}, ${fallback})` : `var(${name})`;
}

/**
 * Deep merge objects
 */
export function deepMerge<T extends Record<string, any>>(
  target: T,
  ...sources: Partial<T>[]
): T {
  if (!sources.length) return target;
  
  // 使用迭代替代递归，减少调用栈开销
  for (const source of sources) {
    if (!isObject(source)) continue;
    
    const stack: Array<{ target: any; source: any }> = [{ target, source }];
    
    while (stack.length > 0) {
      const { target: currentTarget, source: currentSource } = stack.pop()!;
      
      for (const key in currentSource) {
        if (Object.prototype.hasOwnProperty.call(currentSource, key)) {
          const sourceValue = currentSource[key];
          
          if (isObject(sourceValue)) {
            if (!currentTarget[key] || !isObject(currentTarget[key])) {
              currentTarget[key] = {};
            }
            stack.push({ target: currentTarget[key], source: sourceValue });
          } else {
            currentTarget[key] = sourceValue;
          }
        }
      }
    }
  }
  
  return target;
}

/**
 * Check if value is a plain object
 */
function isObject(item: any): item is Record<string, any> {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Memoize function for performance optimization
 */
// 使用 LRU 缓存策略优化内存
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // 移动到末尾表示最近使用
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    // 删除旧值
    this.cache.delete(key);
    
    // 如果达到最大大小，删除最旧的项
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }
}

export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  getKey?: (...args: Parameters<T>) => string,
  maxCacheSize = 100
): T {
  const cache = new LRUCache<string, ReturnType<T>>(maxCacheSize);
  
  return function (this: any, ...args: Parameters<T>): ReturnType<T> {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    const cached = cache.get(key);
    if (cached !== undefined) {
      return cached;
    }
    
    const result = fn.apply(this, args);
    cache.set(key, result);
    
    return result;
  } as T;
}

/**
 * Batch process size values for performance
 */
export function batchProcessSizes<T>(
  items: T[],
  processor: (item: T) => void,
  _batchSize = 10
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!items || items.length === 0) {
      resolve();
      return;
    }
    
    let index = 0;
    let rafId: number | null = null;
    
    function processBatch() {
      try {
        const startTime = performance.now();
        const maxTime = 16; // 每帧最多处琇16ms
        
        while (index < items.length) {
          processor(items[index]);
          index++;
          
          // 如果超过时间限制，让出执行权
          if (performance.now() - startTime > maxTime && index < items.length) {
            rafId = requestAnimationFrame(processBatch);
            return;
          }
        }
        
        resolve();
      } catch (error) {
        // 清理
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
        }
        reject(error);
      }
    }
    
    rafId = requestAnimationFrame(processBatch);
  });
}

/**
 * Request idle callback polyfill
 */
export const requestIdleCallback = 
  typeof window !== 'undefined' && 'requestIdleCallback' in window
    ? window.requestIdleCallback
    : (callback: IdleRequestCallback) => setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 50 } as IdleDeadline), 1);

// 导出性能基准测试
export * from './benchmark';

// 导出懒加载工具
export * from './lazyLoader';

// 导出内存优化工具
export * from './memoryOptimizer';

// 导出性能诊断工具
export * from './performanceDiagnostics';

/**
 * Optimize CSS variable generation with deduplication
 */
export function optimizeCSSVariables(variables: Record<string, string>): Record<string, string> {
  // 快速返回空对象
  if (!variables || Object.keys(variables).length === 0) {
    return {};
  }
  
  const optimized: Record<string, string> = {};
  const valueMap = new Map<string, string[]>();
  
  // 使用 for...in 替代 Object.entries 减少中间数组创建
  for (const key in variables) {
    if (Object.prototype.hasOwnProperty.call(variables, key)) {
      const value = variables[key];
      if (!valueMap.has(value)) {
        valueMap.set(value, []);
      }
      valueMap.get(value)!.push(key);
    }
  }
  
  // 创建引用以减少重复值
  for (const [value, keys] of valueMap) {
    if (keys.length > 1) {
      // 使用第一个键作为基础
      const baseKey = keys[0];
      optimized[baseKey] = value;
      
      // 其他键引用基础键
      for (let i = 1; i < keys.length; i++) {
        optimized[keys[i]] = `var(${baseKey})`;
      }
    } else {
      optimized[keys[0]] = value;
    }
  }
  
  return optimized;
}

/**
 * Throttle function execution
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T {
  let inThrottle: boolean;
  let lastFunc: ReturnType<typeof setTimeout>;
  let lastTime: number;

  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      lastTime = Date.now();
      inThrottle = true;
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastTime >= limit) {
          func.apply(this, args);
          lastTime = Date.now();
        }
      }, Math.max(limit - (Date.now() - lastTime), 0));
    }
  } as T;
}

/**
 * Debounce function execution
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T {
  let timeout: ReturnType<typeof setTimeout> | null;

  return function (this: any, ...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func.apply(this, args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  } as T;
}