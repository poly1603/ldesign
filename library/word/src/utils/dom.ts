/**
 * DOM 工具函数
 */

import { CLASS_PREFIX } from '../core/constants';

/**
 * 创建带前缀的类名
 */
export function prefixClass(className: string): string {
  return `${CLASS_PREFIX}-${className}`;
}

/**
 * 添加多个类名
 */
export function addClasses(element: HTMLElement, ...classNames: string[]): void {
  classNames.forEach((className) => {
    element.classList.add(prefixClass(className));
  });
}

/**
 * 移除多个类名
 */
export function removeClasses(element: HTMLElement, ...classNames: string[]): void {
  classNames.forEach((className) => {
    element.classList.remove(prefixClass(className));
  });
}

/**
 * 创建元素
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  options?: {
    className?: string | string[];
    attributes?: Record<string, string>;
    styles?: Partial<CSSStyleDeclaration>;
    children?: (HTMLElement | string)[];
  }
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName);

  if (options?.className) {
    const classNames = Array.isArray(options.className)
      ? options.className
      : [options.className];
    classNames.forEach((name) => element.classList.add(prefixClass(name)));
  }

  if (options?.attributes) {
    Object.entries(options.attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }

  if (options?.styles) {
    Object.assign(element.style, options.styles);
  }

  if (options?.children) {
    options.children.forEach((child) => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    });
  }

  return element;
}

/**
 * 清空元素内容
 */
export function clearElement(element: HTMLElement): void {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

/**
 * 显示/隐藏元素
 */
export function toggleElement(element: HTMLElement, show: boolean): void {
  element.style.display = show ? '' : 'none';
}

/**
 * 获取元素位置
 */
export function getElementPosition(element: HTMLElement): { x: number; y: number } {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left + window.scrollX,
    y: rect.top + window.scrollY,
  };
}

/**
 * 检查元素是否在视口内
 */
export function isInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * 滚动到元素
 */
export function scrollToElement(
  element: HTMLElement,
  options?: ScrollIntoViewOptions
): void {
  element.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
    ...options,
  });
}



