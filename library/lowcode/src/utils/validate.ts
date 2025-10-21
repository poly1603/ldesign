/**
 * 验证工具
 */

/**
 * 验证是否为空
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * 验证是否为 URL
 */
export function isURL(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * 验证是否为邮箱
 */
export function isEmail(value: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

/**
 * 验证是否为数字
 */
export function isNumber(value: any): boolean {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * 验证是否为整数
 */
export function isInteger(value: any): boolean {
  return isNumber(value) && Number.isInteger(value);
}

/**
 * 验证是否为正数
 */
export function isPositive(value: number): boolean {
  return isNumber(value) && value > 0;
}

/**
 * 验证是否在范围内
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return isNumber(value) && value >= min && value <= max;
}

/**
 * 验证是否为有效的颜色值
 */
export function isColor(value: string): boolean {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  const rgbRegex = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/;
  const rgbaRegex = /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/;

  return hexRegex.test(value) || rgbRegex.test(value) || rgbaRegex.test(value);
}

/**
 * 验证是否为有效的 JSON
 */
export function isJSON(value: string): boolean {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * 验证是否为函数
 */
export function isFunction(value: any): boolean {
  return typeof value === 'function';
}

/**
 * 验证是否为对象
 */
export function isObject(value: any): boolean {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * 验证是否为数组
 */
export function isArray(value: any): boolean {
  return Array.isArray(value);
}

/**
 * 验证是否为字符串
 */
export function isString(value: any): boolean {
  return typeof value === 'string';
}

/**
 * 验证是否为布尔值
 */
export function isBoolean(value: any): boolean {
  return typeof value === 'boolean';
}

/**
 * 验证是否为 Promise
 */
export function isPromise(value: any): boolean {
  return value instanceof Promise || (value && typeof value.then === 'function');
}

/**
 * 验证对象是否有指定属性
 */
export function hasProperty(obj: any, prop: string): boolean {
  return obj && Object.prototype.hasOwnProperty.call(obj, prop);
}

/**
 * 验证是否为空对象
 */
export function isEmptyObject(obj: any): boolean {
  return isObject(obj) && Object.keys(obj).length === 0;
}

/**
 * 验证是否为纯对象（Plain Object）
 */
export function isPlainObject(obj: any): boolean {
  if (!isObject(obj)) return false;

  const proto = Object.getPrototypeOf(obj);
  return proto === null || proto === Object.prototype;
}



