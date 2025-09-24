/**
 * 图片裁剪器工具函数
 * 包含类型检查、字符串转换、事件处理、数学计算等工具函数
 */

import { WINDOW } from './constants';

/**
 * 检查给定值是否为字符串
 * @param value 要检查的值
 * @returns 如果是字符串返回 true，否则返回 false
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * 检查给定值是否为 NaN
 */
export const isNaN = Number.isNaN || WINDOW.isNaN;

/**
 * 检查给定值是否为数字
 * @param value 要检查的值
 * @returns 如果是数字返回 true，否则返回 false
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * 检查给定值是否为正数
 * @param value 要检查的值
 * @returns 如果是正数返回 true，否则返回 false
 */
export function isPositiveNumber(value: unknown): value is number {
  return isNumber(value) && value > 0 && value < Infinity;
}

/**
 * 检查给定值是否为 undefined
 * @param value 要检查的值
 * @returns 如果是 undefined 返回 true，否则返回 false
 */
export function isUndefined(value: unknown): value is undefined {
  return typeof value === 'undefined';
}

/**
 * 检查给定值是否为对象
 * @param value 要检查的值
 * @returns 如果是对象返回 true，否则返回 false
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

const { hasOwnProperty } = Object.prototype;

/**
 * 检查给定值是否为纯对象
 * @param value 要检查的值
 * @returns 如果是纯对象返回 true，否则返回 false
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!isObject(value)) {
    return false;
  }

  try {
    const { constructor } = value;
    const { prototype } = constructor;

    return constructor && prototype && hasOwnProperty.call(prototype, 'isPrototypeOf');
  } catch (error) {
    return false;
  }
}

/**
 * 检查给定值是否为函数
 * @param value 要检查的值
 * @returns 如果是函数返回 true，否则返回 false
 */
export function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === 'function';
}

/**
 * 检查给定节点是否为元素
 * @param node 要检查的节点
 * @returns 如果是元素返回 true，否则返回 false
 */
export function isElement(node: unknown): node is Element {
  return typeof node === 'object' && node !== null && (node as Node).nodeType === 1;
}

const REGEXP_CAMEL_CASE = /([a-z\d])([A-Z])/g;

/**
 * 将驼峰命名转换为短横线命名
 * @param value 要转换的字符串
 * @returns 转换后的字符串
 */
export function toKebabCase(value: string): string {
  return String(value).replace(REGEXP_CAMEL_CASE, '$1-$2').toLowerCase();
}

const REGEXP_KEBAB_CASE = /-[A-z\d]/g;

/**
 * 将短横线命名转换为驼峰命名
 * @param value 要转换的字符串
 * @returns 转换后的字符串
 */
export function toCamelCase(value: string): string {
  return value.replace(REGEXP_KEBAB_CASE, (substring: string) => substring.slice(1).toUpperCase());
}

const REGEXP_SPACES = /\s\s*/;

/**
 * 从事件目标移除事件监听器
 * @param target 事件目标
 * @param types 事件类型
 * @param listener 事件监听器
 * @param options 事件选项
 */
export function off(
  target: EventTarget,
  types: string,
  listener: EventListenerOrEventListenerObject,
  options?: EventListenerOptions,
): void {
  types.trim().split(REGEXP_SPACES).forEach((type) => {
    target.removeEventListener(type, listener, options);
  });
}

/**
 * 向事件目标添加事件监听器
 * @param target 事件目标
 * @param types 事件类型
 * @param listener 事件监听器
 * @param options 事件选项
 */
export function on(
  target: EventTarget,
  types: string,
  listener: EventListenerOrEventListenerObject,
  options?: AddEventListenerOptions,
): void {
  types.trim().split(REGEXP_SPACES).forEach((type) => {
    target.addEventListener(type, listener, options);
  });
}

/**
 * 向事件目标添加一次性事件监听器
 * @param target 事件目标
 * @param types 事件类型
 * @param listener 事件监听器
 * @param options 事件选项
 */
export function once(
  target: EventTarget,
  types: string,
  listener: EventListenerOrEventListenerObject,
  options?: AddEventListenerOptions,
): void {
  on(target, types, listener, {
    ...options,
    once: true,
  });
}

const defaultEventOptions: CustomEventInit = {
  bubbles: true,
  cancelable: true,
  composed: true,
};

/**
 * 在事件目标上派发事件
 * @param target 事件目标
 * @param type 事件名称
 * @param detail 事件数据
 * @param options 其他事件选项
 * @returns 返回结果值
 */
export function emit(
  target: EventTarget,
  type: string,
  detail?: unknown,
  options?: CustomEventInit,
): boolean {
  return target.dispatchEvent(new CustomEvent(type, {
    ...defaultEventOptions,
    detail,
    ...options,
  }));
}

const resolvedPromise: Promise<any> = Promise.resolve();

/**
 * 延迟回调到下一个 DOM 更新周期后执行
 * @param context this 上下文
 * @param callback 要执行的回调函数
 * @returns 返回 Promise
 */
export function nextTick(context?: unknown, callback?: () => void): Promise<void> {
  return callback
    ? resolvedPromise.then(context ? callback.bind(context) : callback)
    : resolvedPromise;
}

/**
 * 获取根文档节点
 * @param element 目标元素
 * @returns 文档节点
 */
export function getRootDocument(element: Element): Document | DocumentFragment | null {
  const rootNode = element.getRootNode();

  switch (rootNode.nodeType) {
    case 1:
      return rootNode.ownerDocument;

    case 9:
      return rootNode as Document;

    case 11:
      return rootNode as DocumentFragment;

    default:
  }

  return null;
}

/**
 * 获取基于文档的偏移量
 * @param element 目标元素
 * @returns 偏移量数据
 */
export function getOffset(element: Element): {
  left: number;
  top: number;
} {
  const { documentElement } = element.ownerDocument;
  const box = element.getBoundingClientRect();

  return {
    left: box.left + (WINDOW.pageXOffset - documentElement.clientLeft),
    top: box.top + (WINDOW.pageYOffset - documentElement.clientTop),
  };
}

const REGEXP_ANGLE_UNIT = /deg|g?rad|turn$/i;

/**
 * 将角度转换为弧度数
 * @param angle 要转换的角度
 * @returns 返回弧度数
 */
export function toAngleInRadian(angle: number | string): number {
  const value = parseFloat(angle as string) || 0;

  if (value !== 0) {
    const [unit = 'rad'] = String(angle).match(REGEXP_ANGLE_UNIT) || [];

    switch (unit.toLowerCase()) {
      case 'deg':
        return (value / 360) * (Math.PI * 2);

      case 'grad':
        return (value / 400) * (Math.PI * 2);

      case 'turn':
        return value * (Math.PI * 2);

      // case 'rad':
      default:
    }
  }

  return value;
}

// 尺寸调整相关接口和类型
interface SizeAdjustmentData {
  aspectRatio: number;
  height: number;
  width: number;
}

interface SizeAdjustmentDataWithoutWidth {
  aspectRatio: number;
  height: number;
}

interface SizeAdjustmentDataWithoutHeight {
  aspectRatio: number;
  width: number;
}

type SizeAdjustmentType = 'contain' | 'cover';
const SIZE_ADJUSTMENT_TYPE_CONTAIN: SizeAdjustmentType = 'contain';
const SIZE_ADJUSTMENT_TYPE_COVER: SizeAdjustmentType = 'cover';

/**
 * 在给定宽高比下获取矩形中的最大尺寸
 * @param data 原始尺寸数据
 * @param type 调整类型
 * @returns 返回结果尺寸
 */
export function getAdjustedSizes(
  data: SizeAdjustmentData | SizeAdjustmentDataWithoutWidth | SizeAdjustmentDataWithoutHeight,
  type: SizeAdjustmentType = SIZE_ADJUSTMENT_TYPE_CONTAIN,
): {
  width: number;
  height: number;
} {
  const { aspectRatio } = data;
  let { width, height } = data as SizeAdjustmentData;
  const isValidWidth = isPositiveNumber(width);
  const isValidHeight = isPositiveNumber(height);

  if (isValidWidth && isValidHeight) {
    const adjustedWidth = height * aspectRatio;

    if ((type === SIZE_ADJUSTMENT_TYPE_CONTAIN && adjustedWidth > width)
      || (type === SIZE_ADJUSTMENT_TYPE_COVER && adjustedWidth < width)) {
      height = width / aspectRatio;
    } else {
      width = height * aspectRatio;
    }
  } else if (isValidWidth) {
    height = width / aspectRatio;
  } else if (isValidHeight) {
    width = height * aspectRatio;
  }

  return {
    width,
    height,
  };
}

/**
 * 矩阵相乘
 * @param matrix 第一个矩阵
 * @param args 其余矩阵
 * @returns 返回结果矩阵
 */
export function multiplyMatrices(matrix: number[], ...args: number[][]): number[] {
  if (args.length === 0) {
    return matrix;
  }

  const [a1, b1, c1, d1, e1, f1] = matrix;
  const [a2, b2, c2, d2, e2, f2] = args[0];

  // ┌ a1 c1 e1 ┐   ┌ a2 c2 e2 ┐
  // │ b1 d1 f1 │ × │ b2 d2 f2 │
  // └ 0  0  1  ┘   └ 0  0  1  ┘
  matrix = [
    a1 * a2 + c1 * b2/* + e1 * 0 */,
    b1 * a2 + d1 * b2/* + f1 * 0 */,
    a1 * c2 + c1 * d2/* + e1 * 0 */,
    b1 * c2 + d1 * d2/* + f1 * 0 */,
    a1 * e2 + c1 * f2 + e1/* * 1 */,
    b1 * e2 + d1 * f2 + f1/* * 1 */,
  ];

  return multiplyMatrices(matrix, ...args.slice(1));
}
