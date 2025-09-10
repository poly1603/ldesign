/**
 * DOM操作工具函数
 * 提供DOM元素创建、操作和查询功能
 */

/**
 * 创建DOM元素
 * @param tagName 标签名
 * @param attributes 属性对象
 * @param children 子元素或文本内容
 * @returns 创建的DOM元素
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  attributes?: Record<string, string | number | boolean>,
  ...children: (HTMLElement | string)[]
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName);
  
  // 设置属性
  if (attributes) {
    for (const [key, value] of Object.entries(attributes)) {
      if (key === 'className') {
        element.className = String(value);
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign(element.style, value);
      } else if (key.startsWith('data-')) {
        element.setAttribute(key, String(value));
      } else if (key in element) {
        (element as any)[key] = value;
      } else {
        element.setAttribute(key, String(value));
      }
    }
  }
  
  // 添加子元素
  for (const child of children) {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else {
      element.appendChild(child);
    }
  }
  
  return element;
}

/**
 * 查找元素
 * @param selector CSS选择器
 * @param parent 父元素，默认为document
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
 * @param selector CSS选择器
 * @param parent 父元素，默认为document
 * @returns 元素数组
 */
export function querySelectorAll<T extends Element = Element>(
  selector: string,
  parent: Element | Document = document
): T[] {
  return Array.from(parent.querySelectorAll<T>(selector));
}

/**
 * 添加CSS类
 * @param element 目标元素
 * @param className 类名
 */
export function addClass(element: Element, className: string): void {
  element.classList.add(className);
}

/**
 * 移除CSS类
 * @param element 目标元素
 * @param className 类名
 */
export function removeClass(element: Element, className: string): void {
  element.classList.remove(className);
}

/**
 * 切换CSS类
 * @param element 目标元素
 * @param className 类名
 * @returns 是否添加了类
 */
export function toggleClass(element: Element, className: string): boolean {
  return element.classList.toggle(className);
}

/**
 * 检查是否包含CSS类
 * @param element 目标元素
 * @param className 类名
 * @returns 是否包含类
 */
export function hasClass(element: Element, className: string): boolean {
  return element.classList.contains(className);
}

/**
 * 设置元素样式
 * @param element 目标元素
 * @param styles 样式对象
 */
export function setStyle(element: HTMLElement, styles: Partial<CSSStyleDeclaration>): void {
  Object.assign(element.style, styles);
}

/**
 * 获取元素的计算样式
 * @param element 目标元素
 * @param property 样式属性名
 * @returns 样式值
 */
export function getComputedStyle(element: Element, property?: string): string | CSSStyleDeclaration {
  const computed = window.getComputedStyle(element);
  return property ? computed.getPropertyValue(property) : computed;
}

/**
 * 获取元素的边界矩形
 * @param element 目标元素
 * @returns 边界矩形
 */
export function getBoundingRect(element: Element): DOMRect {
  return element.getBoundingClientRect();
}

/**
 * 检查元素是否在视口中
 * @param element 目标元素
 * @returns 是否在视口中
 */
export function isInViewport(element: Element): boolean {
  const rect = getBoundingRect(element);
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * 滚动到元素
 * @param element 目标元素
 * @param options 滚动选项
 */
export function scrollToElement(element: Element, options?: ScrollIntoViewOptions): void {
  element.scrollIntoView(options);
}

/**
 * 移除元素
 * @param element 要移除的元素
 */
export function removeElement(element: Element): void {
  element.parentNode?.removeChild(element);
}

/**
 * 清空元素内容
 * @param element 目标元素
 */
export function clearElement(element: Element): void {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

/**
 * 插入HTML内容
 * @param element 目标元素
 * @param html HTML字符串
 * @param position 插入位置
 */
export function insertHTML(
  element: Element,
  html: string,
  position: InsertPosition = 'beforeend'
): void {
  element.insertAdjacentHTML(position, html);
}

/**
 * 创建文档片段
 * @param children 子元素
 * @returns 文档片段
 */
export function createFragment(...children: (HTMLElement | string)[]): DocumentFragment {
  const fragment = document.createDocumentFragment();
  
  for (const child of children) {
    if (typeof child === 'string') {
      fragment.appendChild(document.createTextNode(child));
    } else {
      fragment.appendChild(child);
    }
  }
  
  return fragment;
}

/**
 * 等待DOM加载完成
 * @returns Promise
 */
export function waitForDOMReady(): Promise<void> {
  return new Promise((resolve) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => resolve(), { once: true });
    } else {
      resolve();
    }
  });
}

/**
 * 获取元素的数据属性
 * @param element 目标元素
 * @param key 数据键名
 * @returns 数据值
 */
export function getData(element: Element, key: string): string | null {
  return element.getAttribute(`data-${key}`);
}

/**
 * 设置元素的数据属性
 * @param element 目标元素
 * @param key 数据键名
 * @param value 数据值
 */
export function setData(element: Element, key: string, value: string): void {
  element.setAttribute(`data-${key}`, value);
}

/**
 * 移除元素的数据属性
 * @param element 目标元素
 * @param key 数据键名
 */
export function removeData(element: Element, key: string): void {
  element.removeAttribute(`data-${key}`);
}
