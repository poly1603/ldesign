/**
 * @ldesign/size - Utility Functions
 */

import type { SizeInput, SizeValue, SizeUnit } from '../types';

/**
 * Parse size input to SizeValue
 */
export function parseSizeInput(input: SizeInput): SizeValue {
  if (typeof input === 'number') {
    return { value: input, unit: 'px' };
  }

  if (typeof input === 'object' && 'value' in input && 'unit' in input) {
    return input;
  }

  if (typeof input === 'string') {
    const match = input.match(/^(-?\d*\.?\d+)(px|rem|em|vw|vh|%|pt|vmin|vmax)?$/);
    if (match) {
      const value = parseFloat(match[1]);
      const unit = (match[2] || 'px') as SizeUnit;
      return { value, unit };
    }
  }

  // Default fallback
  return { value: 0, unit: 'px' };
}

/**
 * Format SizeValue to string
 */
export function formatSize(size: SizeValue): string {
  if (size.value === 0) return '0';
  return `${size.value}${size.unit}`;
}

/**
 * Convert size between units
 */
export function convertSize(
  size: SizeValue,
  targetUnit: SizeUnit,
  rootFontSize = 16
): SizeValue {
  if (size.unit === targetUnit) {
    return size;
  }

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
      pxValue = size.value * (96 / 72); // 1pt = 1/72 inch, assuming 96 DPI
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
      targetValue = pxValue * (72 / 96);
      break;
    case 'px':
      targetValue = pxValue;
      break;
    default:
      // For viewport units and percentages, keep original value
      return { value: size.value, unit: targetUnit };
  }

  return { value: targetValue, unit: targetUnit };
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

/**
 * Round size value to specified precision
 */
export function roundSize(size: SizeValue, precision = 2): SizeValue {
  const factor = Math.pow(10, precision);
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
    const value = base / Math.pow(ratio, i);
    sizes.push({ value: Math.round(value * 100) / 100, unit });
  }
  
  // Add base
  sizes.push({ value: base, unit });
  
  // Generate sizes above base
  for (let i = 1; i <= steps; i++) {
    const value = base * Math.pow(ratio, i);
    sizes.push({ value: Math.round(value * 100) / 100, unit });
  }
  
  return sizes;
}

/**
 * Check if a size is valid
 */
export function isValidSize(input: any): input is SizeInput {
  if (typeof input === 'number') {
    return !isNaN(input) && isFinite(input);
  }

  if (typeof input === 'string') {
    const match = input.match(/^(-?\d*\.?\d+)(px|rem|em|vw|vh|%|pt|vmin|vmax)?$/);
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
 * Check if value is a plain object
 */
function isObject(item: any): item is Record<string, any> {
  return item && typeof item === 'object' && !Array.isArray(item);
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