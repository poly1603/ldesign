/**
 * 工具函数库
 * 
 * 这个文件包含了组件库中使用的各种工具函数
 * 包括 DOM 操作、事件处理、数据处理等通用功能
 */

// ==================== DOM 工具函数 ====================

/**
 * 获取元素的边界矩形信息
 * @param element 目标元素
 * @returns 边界矩形信息
 */
export function getBoundingClientRect(element: Element): DOMRect {
  return element.getBoundingClientRect();
}

/**
 * 检查元素是否在视口内
 * @param element 目标元素
 * @returns 是否在视口内
 */
export function isElementInViewport(element: Element): boolean {
  const rect = getBoundingClientRect(element);
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * 获取元素的滚动父级
 * @param element 目标元素
 * @returns 滚动父级元素
 */
export function getScrollParent(element: Element): Element {
  if (!element) {
    return document.documentElement;
  }

  const style = getComputedStyle(element);
  const excludeStaticParent = style.position === 'absolute';
  const overflowRegex = /(auto|scroll)/;

  if (style.position === 'fixed') {
    return document.documentElement;
  }

  let parent = element.parentElement;
  while (parent) {
    const parentStyle = getComputedStyle(parent);
    if (excludeStaticParent && parentStyle.position === 'static') {
      parent = parent.parentElement;
      continue;
    }
    if (overflowRegex.test(parentStyle.overflow + parentStyle.overflowY + parentStyle.overflowX)) {
      return parent;
    }
    parent = parent.parentElement;
  }

  return document.documentElement;
}

/**
 * 平滑滚动到指定元素
 * @param element 目标元素
 * @param options 滚动选项
 */
export function scrollToElement(element: Element, options: ScrollIntoViewOptions = {}): void {
  element.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
    inline: 'nearest',
    ...options
  });
}

/**
 * 获取元素的计算样式值
 * @param element 目标元素
 * @param property CSS 属性名
 * @returns 计算样式值
 */
export function getComputedStyleValue(element: Element, property: string): string {
  return getComputedStyle(element).getPropertyValue(property);
}

// ==================== 事件工具函数 ====================

/**
 * 添加事件监听器（支持选项）
 * @param element 目标元素
 * @param event 事件名称
 * @param handler 事件处理器
 * @param options 事件选项
 * @returns 移除事件监听器的函数
 */
export function addEventListener<K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  event: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  options?: AddEventListenerOptions
): () => void {
  element.addEventListener(event, handler, options);
  return () => element.removeEventListener(event, handler, options);
}

/**
 * 创建自定义事件
 * @param name 事件名称
 * @param detail 事件详情
 * @param options 事件选项
 * @returns 自定义事件对象
 */
export function createCustomEvent<T = any>(
  name: string,
  detail?: T,
  options: CustomEventInit = {}
): CustomEvent<T> {
  return new CustomEvent(name, {
    bubbles: true,
    cancelable: true,
    detail,
    ...options
  });
}

/**
 * 阻止事件冒泡和默认行为
 * @param event 事件对象
 */
export function stopEvent(event: Event): void {
  event.preventDefault();
  event.stopPropagation();
}

/**
 * 检查是否为键盘事件的特定按键
 * @param event 键盘事件
 * @param key 按键名称
 * @returns 是否为指定按键
 */
export function isKeyPressed(event: KeyboardEvent, key: string): boolean {
  return event.key === key || event.code === key;
}

// ==================== 数据处理工具函数 ====================

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
    return new Date(obj.getTime()) as unknown as T;
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }

  if (typeof obj === 'object') {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }

  return obj;
}

/**
 * 检查两个值是否深度相等
 * @param a 第一个值
 * @param b 第二个值
 * @returns 是否相等
 */
export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  if (!a || !b || (typeof a !== 'object' && typeof b !== 'object')) {
    return a === b;
  }

  if (a === null || a === undefined || b === null || b === undefined) {
    return false;
  }

  if (a.prototype !== b.prototype) return false;

  const keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) {
    return false;
  }

  return keys.every(k => deepEqual(a[k], b[k]));
}

/**
 * 获取对象的嵌套属性值
 * @param obj 目标对象
 * @param path 属性路径（如 'a.b.c'）
 * @param defaultValue 默认值
 * @returns 属性值
 */
export function get(obj: any, path: string, defaultValue?: any): any {
  const keys = path.split('.');
  let result = obj;

  for (const key of keys) {
    if (result == null || typeof result !== 'object') {
      return defaultValue;
    }
    result = result[key];
  }

  return result !== undefined ? result : defaultValue;
}

/**
 * 设置对象的嵌套属性值
 * @param obj 目标对象
 * @param path 属性路径（如 'a.b.c'）
 * @param value 要设置的值
 */
export function set(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  let current = obj;

  for (const key of keys) {
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }

  current[lastKey] = value;
}

// ==================== 字符串工具函数 ====================

/**
 * 将字符串转换为 kebab-case
 * @param str 输入字符串
 * @returns kebab-case 字符串
 */
export function kebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * 将字符串转换为 camelCase
 * @param str 输入字符串
 * @returns camelCase 字符串
 */
export function camelCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^[A-Z]/, c => c.toLowerCase());
}

/**
 * 将字符串转换为 PascalCase
 * @param str 输入字符串
 * @returns PascalCase 字符串
 */
export function pascalCase(str: string): string {
  const camel = camelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

/**
 * 截断字符串并添加省略号
 * @param str 输入字符串
 * @param length 最大长度
 * @param suffix 后缀（默认为 '...'）
 * @returns 截断后的字符串
 */
export function truncate(str: string, length: number, suffix: string = '...'): string {
  if (str.length <= length) {
    return str;
  }
  return str.slice(0, length - suffix.length) + suffix;
}

// ==================== 数字工具函数 ====================

/**
 * 将数字限制在指定范围内
 * @param value 输入值
 * @param min 最小值
 * @param max 最大值
 * @returns 限制后的值
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * 生成指定范围内的随机整数
 * @param min 最小值
 * @param max 最大值
 * @returns 随机整数
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 格式化数字（添加千分位分隔符）
 * @param num 输入数字
 * @param separator 分隔符（默认为 ','）
 * @returns 格式化后的字符串
 */
export function formatNumber(num: number, separator: string = ','): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

// ==================== 异步工具函数 ====================

/**
 * 延迟执行
 * @param ms 延迟时间（毫秒）
 * @returns Promise
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 超时 Promise
 * @param promise 原始 Promise
 * @param timeout 超时时间（毫秒）
 * @returns 带超时的 Promise
 */
export function withTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeout)
    )
  ]);
}

/**
 * 重试函数
 * @param fn 要重试的函数
 * @param retries 重试次数
 * @param delay 重试间隔（毫秒）
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
    if (retries > 0) {
      await delay(delayMs);
      return retry(fn, retries - 1, delayMs);
    }
    throw error;
  }
}

// ==================== CSS 类名工具函数 ====================

/**
 * 合并 CSS 类名
 * @param classes 类名数组
 * @returns 合并后的类名字符串
 */
export function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ==================== ID 生成工具函数 ====================

/**
 * 生成唯一 ID
 * @param prefix ID 前缀
 * @returns 唯一 ID 字符串
 */
export function generateId(prefix: string = 'ld'): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 11)}`;
}

// ==================== 防抖节流工具函数 ====================

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param wait 等待时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * 节流函数
 * @param func 要节流的函数
 * @param limit 时间限制（毫秒）
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

// ==================== 类型检查工具函数 ====================

/**
 * 检查是否为函数
 * @param value 待检查的值
 * @returns 是否为函数
 */
export function isFunction(value: any): value is Function {
  return typeof value === 'function';
}

/**
 * 检查是否为字符串
 * @param value 待检查的值
 * @returns 是否为字符串
 */
export function isString(value: any): value is string {
  return typeof value === 'string';
}

/**
 * 检查是否为数字
 * @param value 待检查的值
 * @returns 是否为数字
 */
export function isNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * 检查是否为布尔值
 * @param value 待检查的值
 * @returns 是否为布尔值
 */
export function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean';
}

/**
 * 检查是否为对象
 * @param value 待检查的值
 * @returns 是否为对象
 */
export function isObject(value: any): value is object {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * 检查是否为数组
 * @param value 待检查的值
 * @returns 是否为数组
 */
export function isArray(value: any): value is any[] {
  return Array.isArray(value);
}

/**
 * 检查是否为空值（null、undefined、空字符串、空数组、空对象）
 * @param value 待检查的值
 * @returns 是否为空值
 */
export function isEmpty(value: any): boolean {
  if (value == null) return true;
  if (isString(value) || isArray(value)) return value.length === 0;
  if (isObject(value)) return Object.keys(value).length === 0;
  return false;
}
