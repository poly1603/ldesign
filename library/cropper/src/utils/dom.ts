/**
 * @ldesign/cropper DOM操作工具函数
 * 
 * 提供DOM元素创建、样式操作、事件处理等工具函数
 */

import type { Point, Size } from '../types';

// ============================================================================
// DOM元素创建和操作
// ============================================================================

/**
 * 创建DOM元素
 * @param tagName 标签名
 * @param attributes 属性对象
 * @param styles 样式对象
 * @returns 创建的元素
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  attributes?: Record<string, string | number | boolean>,
  styles?: Record<string, string>
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName);
  
  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      if (typeof value === 'boolean') {
        if (value) {
          element.setAttribute(key, '');
        }
      } else {
        element.setAttribute(key, String(value));
      }
    });
  }
  
  if (styles) {
    Object.entries(styles).forEach(([key, value]) => {
      (element.style as any)[key] = value;
    });
  }
  
  return element;
}

/**
 * 查找元素
 * @param selector 选择器
 * @param parent 父元素（可选）
 * @returns 找到的元素或null
 */
export function querySelector<T extends Element = Element>(
  selector: string,
  parent: Element | Document = document
): T | null {
  return parent.querySelector<T>(selector);
}

/**
 * 查找所有匹配的元素
 * @param selector 选择器
 * @param parent 父元素（可选）
 * @returns 元素数组
 */
export function querySelectorAll<T extends Element = Element>(
  selector: string,
  parent: Element | Document = document
): T[] {
  return Array.from(parent.querySelectorAll<T>(selector));
}

/**
 * 检查元素是否匹配选择器
 * @param element 元素
 * @param selector 选择器
 * @returns 是否匹配
 */
export function matches(element: Element, selector: string): boolean {
  return element.matches(selector);
}

/**
 * 查找最近的匹配祖先元素
 * @param element 起始元素
 * @param selector 选择器
 * @returns 匹配的祖先元素或null
 */
export function closest<T extends Element = Element>(
  element: Element,
  selector: string
): T | null {
  return element.closest<T>(selector);
}

// ============================================================================
// CSS类操作
// ============================================================================

/**
 * 添加CSS类
 * @param element 元素
 * @param className 类名
 */
export function addClass(element: Element, className: string): void {
  element.classList.add(className);
}

/**
 * 移除CSS类
 * @param element 元素
 * @param className 类名
 */
export function removeClass(element: Element, className: string): void {
  element.classList.remove(className);
}

/**
 * 切换CSS类
 * @param element 元素
 * @param className 类名
 * @param force 强制添加或移除
 * @returns 是否包含该类
 */
export function toggleClass(element: Element, className: string, force?: boolean): boolean {
  return element.classList.toggle(className, force);
}

/**
 * 检查是否包含CSS类
 * @param element 元素
 * @param className 类名
 * @returns 是否包含
 */
export function hasClass(element: Element, className: string): boolean {
  return element.classList.contains(className);
}

/**
 * 替换CSS类
 * @param element 元素
 * @param oldClassName 旧类名
 * @param newClassName 新类名
 */
export function replaceClass(element: Element, oldClassName: string, newClassName: string): void {
  element.classList.replace(oldClassName, newClassName);
}

// ============================================================================
// 样式操作
// ============================================================================

/**
 * 设置元素样式
 * @param element 元素
 * @param styles 样式对象
 */
export function setStyle(element: HTMLElement, styles: Record<string, string | number>): void {
  Object.entries(styles).forEach(([property, value]) => {
    (element.style as any)[property] = typeof value === 'number' ? `${value}px` : value;
  });
}

/**
 * 获取元素样式
 * @param element 元素
 * @param property 样式属性
 * @returns 样式值
 */
export function getStyle(element: Element, property: string): string {
  return getComputedStyle(element).getPropertyValue(property);
}

/**
 * 获取元素的所有计算样式
 * @param element 元素
 * @returns 计算样式对象
 */
export function getComputedStyles(element: Element): CSSStyleDeclaration {
  return getComputedStyle(element);
}

/**
 * 设置CSS变量
 * @param element 元素
 * @param name 变量名
 * @param value 变量值
 */
export function setCSSVariable(element: HTMLElement, name: string, value: string): void {
  element.style.setProperty(`--${name}`, value);
}

/**
 * 获取CSS变量
 * @param element 元素
 * @param name 变量名
 * @returns 变量值
 */
export function getCSSVariable(element: Element, name: string): string {
  return getComputedStyle(element).getPropertyValue(`--${name}`).trim();
}

// ============================================================================
// 元素尺寸和位置
// ============================================================================

/**
 * 获取元素的边界矩形
 * @param element 元素
 * @returns 边界矩形
 */
export function getBoundingRect(element: Element): DOMRect {
  return element.getBoundingClientRect();
}

/**
 * 获取元素的尺寸
 * @param element 元素
 * @returns 尺寸对象
 */
export function getElementSize(element: Element): Size {
  const rect = getBoundingRect(element);
  return {
    width: rect.width,
    height: rect.height
  };
}

/**
 * 获取元素的位置
 * @param element 元素
 * @returns 位置对象
 */
export function getElementPosition(element: Element): Point {
  const rect = getBoundingRect(element);
  return {
    x: rect.left,
    y: rect.top
  };
}

/**
 * 获取元素相对于父元素的位置
 * @param element 元素
 * @param parent 父元素
 * @returns 相对位置
 */
export function getRelativePosition(element: Element, parent: Element): Point {
  const elementRect = getBoundingRect(element);
  const parentRect = getBoundingRect(parent);
  
  return {
    x: elementRect.left - parentRect.left,
    y: elementRect.top - parentRect.top
  };
}

/**
 * 获取元素的滚动尺寸
 * @param element 元素
 * @returns 滚动尺寸
 */
export function getScrollSize(element: Element): Size {
  return {
    width: element.scrollWidth,
    height: element.scrollHeight
  };
}

/**
 * 获取元素的客户端尺寸
 * @param element 元素
 * @returns 客户端尺寸
 */
export function getClientSize(element: Element): Size {
  return {
    width: element.clientWidth,
    height: element.clientHeight
  };
}

/**
 * 获取元素的偏移尺寸
 * @param element HTML元素
 * @returns 偏移尺寸
 */
export function getOffsetSize(element: HTMLElement): Size {
  return {
    width: element.offsetWidth,
    height: element.offsetHeight
  };
}

// ============================================================================
// 事件处理
// ============================================================================

/**
 * 添加事件监听器
 * @param element 元素
 * @param event 事件名
 * @param handler 事件处理函数
 * @param options 选项
 */
export function addEventListener<K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  event: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions
): void {
  element.addEventListener(event, handler, options);
}

/**
 * 移除事件监听器
 * @param element 元素
 * @param event 事件名
 * @param handler 事件处理函数
 * @param options 选项
 */
export function removeEventListener<K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  event: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  options?: boolean | EventListenerOptions
): void {
  element.removeEventListener(event, handler, options);
}

/**
 * 触发自定义事件
 * @param element 元素
 * @param eventName 事件名
 * @param detail 事件详情
 * @param options 选项
 */
export function dispatchEvent(
  element: Element,
  eventName: string,
  detail?: any,
  options?: CustomEventInit
): boolean {
  const event = new CustomEvent(eventName, {
    detail,
    bubbles: true,
    cancelable: true,
    ...options
  });
  return element.dispatchEvent(event);
}

// ============================================================================
// 元素可见性和焦点
// ============================================================================

/**
 * 检查元素是否可见
 * @param element 元素
 * @returns 是否可见
 */
export function isVisible(element: Element): boolean {
  const style = getComputedStyles(element);
  return style.display !== 'none' && 
         style.visibility !== 'hidden' && 
         parseFloat(style.opacity) > 0;
}

/**
 * 检查元素是否在视口中
 * @param element 元素
 * @param threshold 阈值（0-1）
 * @returns 是否在视口中
 */
export function isInViewport(element: Element, threshold: number = 0): boolean {
  const rect = getBoundingRect(element);
  const windowHeight = window.innerHeight;
  const windowWidth = window.innerWidth;
  
  const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
  const visibleWidth = Math.min(rect.right, windowWidth) - Math.max(rect.left, 0);
  
  const visibleArea = Math.max(0, visibleHeight) * Math.max(0, visibleWidth);
  const totalArea = rect.width * rect.height;
  
  return totalArea > 0 && (visibleArea / totalArea) >= threshold;
}

/**
 * 滚动元素到视口中
 * @param element 元素
 * @param options 滚动选项
 */
export function scrollIntoView(element: Element, options?: ScrollIntoViewOptions): void {
  element.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
    inline: 'nearest',
    ...options
  });
}

/**
 * 设置元素焦点
 * @param element 元素
 * @param options 焦点选项
 */
export function focus(element: HTMLElement, options?: FocusOptions): void {
  element.focus(options);
}

/**
 * 移除元素焦点
 * @param element 元素
 */
export function blur(element: HTMLElement): void {
  element.blur();
}

// ============================================================================
// 元素内容操作
// ============================================================================

/**
 * 设置元素文本内容
 * @param element 元素
 * @param text 文本内容
 */
export function setText(element: Element, text: string): void {
  element.textContent = text;
}

/**
 * 获取元素文本内容
 * @param element 元素
 * @returns 文本内容
 */
export function getText(element: Element): string {
  return element.textContent || '';
}

/**
 * 设置元素HTML内容
 * @param element 元素
 * @param html HTML内容
 */
export function setHTML(element: Element, html: string): void {
  element.innerHTML = html;
}

/**
 * 获取元素HTML内容
 * @param element 元素
 * @returns HTML内容
 */
export function getHTML(element: Element): string {
  return element.innerHTML;
}

/**
 * 清空元素内容
 * @param element 元素
 */
export function empty(element: Element): void {
  element.innerHTML = '';
}

/**
 * 在元素前插入内容
 * @param element 目标元素
 * @param content 要插入的内容
 */
export function insertBefore(element: Element, content: Element | string): void {
  if (typeof content === 'string') {
    element.insertAdjacentHTML('beforebegin', content);
  } else {
    element.parentNode?.insertBefore(content, element);
  }
}

/**
 * 在元素后插入内容
 * @param element 目标元素
 * @param content 要插入的内容
 */
export function insertAfter(element: Element, content: Element | string): void {
  if (typeof content === 'string') {
    element.insertAdjacentHTML('afterend', content);
  } else {
    element.parentNode?.insertBefore(content, element.nextSibling);
  }
}

/**
 * 在元素内部开头插入内容
 * @param element 目标元素
 * @param content 要插入的内容
 */
export function prepend(element: Element, content: Element | string): void {
  if (typeof content === 'string') {
    element.insertAdjacentHTML('afterbegin', content);
  } else {
    element.insertBefore(content, element.firstChild);
  }
}

/**
 * 在元素内部末尾插入内容
 * @param element 目标元素
 * @param content 要插入的内容
 */
export function append(element: Element, content: Element | string): void {
  if (typeof content === 'string') {
    element.insertAdjacentHTML('beforeend', content);
  } else {
    element.appendChild(content);
  }
}

/**
 * 移除元素
 * @param element 要移除的元素
 */
export function remove(element: Element): void {
  element.remove();
}
