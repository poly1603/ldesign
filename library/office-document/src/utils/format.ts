/**
 * Formatting utility functions
 */

/**
 * Format date
 */
export function formatDate(date: Date, format: string = 'YYYY-MM-DD'): string {
 const year = date.getFullYear();
 const month = String(date.getMonth() + 1).padStart(2, '0');
 const day = String(date.getDate()).padStart(2, '0');
 const hours = String(date.getHours()).padStart(2, '0');
 const minutes = String(date.getMinutes()).padStart(2, '0');
 const seconds = String(date.getSeconds()).padStart(2, '0');

 return format
  .replace('YYYY', String(year))
  .replace('MM', month)
  .replace('DD', day)
  .replace('HH', hours)
  .replace('mm', minutes)
  .replace('ss', seconds);
}

/**
 * Format number
 */
export function formatNumber(num: number, decimals: number = 2): string {
 return num.toFixed(decimals);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 0): string {
 return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Truncate text
 */
export function truncate(text: string, length: number, suffix: string = '...'): string {
 if (text.length <= length) return text;
 return text.substring(0, length - suffix.length) + suffix;
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
 return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Convert to title case
 */
export function toTitleCase(text: string): string {
 return text
  .toLowerCase()
  .split(' ')
  .map(word => capitalize(word))
  .join(' ');
}

/**
 * Parse CSS value
 */
export function parseCSSValue(value: string | number): string {
 if (typeof value === 'number') {
  return `${value}px`;
 }
 return value;
}

/**
 * Generate unique ID
 */
export function generateId(prefix: string = 'id'): string {
 return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
 return JSON.parse(JSON.stringify(obj));
}

/**
 * Merge objects deeply
 */
export function deepMerge<T extends object>(target: T, ...sources: Partial<T>[]): T {
 if (!sources.length) return target;

 const source = sources.shift();
 if (!source) return target;

 for (const key in source) {
  const sourceValue = source[key];
  const targetValue = target[key];

  if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
   if (!targetValue || typeof targetValue !== 'object') {
    (target as any)[key] = {};
   }
   deepMerge((target as any)[key], sourceValue as any);
  } else {
   (target as any)[key] = sourceValue;
  }
 }

 return deepMerge(target, ...sources);
}
