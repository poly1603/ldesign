/**
 * DOM 操作工具
 */

import type { Point, Rect } from '../types';

/**
 * 获取元素的边界矩形
 */
export function getElementRect(element: HTMLElement): Rect {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height
  };
}

/**
 * 获取鼠标相对于元素的位置
 */
export function getRelativePosition(event: MouseEvent, element: HTMLElement): Point {
  const rect = element.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}

/**
 * 判断点是否在矩形内
 */
export function isPointInRect(point: Point, rect: Rect): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

/**
 * 添加类名
 */
export function addClass(element: HTMLElement, className: string): void {
  element.classList.add(className);
}

/**
 * 移除类名
 */
export function removeClass(element: HTMLElement, className: string): void {
  element.classList.remove(className);
}

/**
 * 切换类名
 */
export function toggleClass(element: HTMLElement, className: string, force?: boolean): void {
  if (force !== undefined) {
    element.classList.toggle(className, force);
  } else {
    element.classList.toggle(className);
  }
}

/**
 * 设置样式
 */
export function setStyle(element: HTMLElement, styles: Partial<CSSStyleDeclaration>): void {
  Object.assign(element.style, styles);
}

/**
 * 获取样式
 */
export function getStyle(element: HTMLElement, property: string): string {
  return window.getComputedStyle(element).getPropertyValue(property);
}

/**
 * 查找最近的父元素
 */
export function closest(element: HTMLElement, selector: string): HTMLElement | null {
  return element.closest(selector) as HTMLElement | null;
}

/**
 * 查询元素
 */
export function querySelector<T extends HTMLElement = HTMLElement>(
  selector: string,
  parent: HTMLElement | Document = document
): T | null {
  return parent.querySelector(selector) as T | null;
}

/**
 * 查询所有元素
 */
export function querySelectorAll<T extends HTMLElement = HTMLElement>(
  selector: string,
  parent: HTMLElement | Document = document
): T[] {
  return Array.from(parent.querySelectorAll(selector)) as T[];
}

/**
 * 创建元素
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  options?: {
    className?: string;
    id?: string;
    attributes?: Record<string, string>;
    styles?: Partial<CSSStyleDeclaration>;
    children?: (HTMLElement | string)[];
  }
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName);

  if (options) {
    if (options.className) {
      element.className = options.className;
    }
    if (options.id) {
      element.id = options.id;
    }
    if (options.attributes) {
      Object.entries(options.attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
    }
    if (options.styles) {
      setStyle(element, options.styles);
    }
    if (options.children) {
      options.children.forEach(child => {
        if (typeof child === 'string') {
          element.appendChild(document.createTextNode(child));
        } else {
          element.appendChild(child);
        }
      });
    }
  }

  return element;
}

/**
 * 移除元素
 */
export function removeElement(element: HTMLElement): void {
  element.parentNode?.removeChild(element);
}

/**
 * 滚动到元素
 */
export function scrollIntoView(element: HTMLElement, options?: ScrollIntoViewOptions): void {
  element.scrollIntoView(options);
}

/**
 * 获取滚动位置
 */
export function getScrollPosition(element: HTMLElement = document.documentElement): Point {
  return {
    x: element.scrollLeft,
    y: element.scrollTop
  };
}

/**
 * 设置滚动位置
 */
export function setScrollPosition(
  position: Partial<Point>,
  element: HTMLElement = document.documentElement
): void {
  if (position.x !== undefined) {
    element.scrollLeft = position.x;
  }
  if (position.y !== undefined) {
    element.scrollTop = position.y;
  }
}



