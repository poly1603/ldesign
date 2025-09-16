/**
 * DOM工具类
 * 提供DOM操作、事件绑定、样式操作、元素查询等功能
 */

import type {
  ContainerElement,
  DOMSelector,
  Position,
  Size,
  Bounds,
  CSSStyleObject,
  CSSClassName,
  CSSVariables,
  DOMEventName,
  DOMEventHandler,
  EventListenerOptions
} from '../types/dom';

/**
 * DOM工具类
 */
export class DOMUtils {
  // ==================== 元素查询方法 ====================
  
  /**
   * 查询单个元素
   * @param selector 选择器
   * @param context 上下文元素
   * @returns 元素或null
   */
  static query(selector: string, context: Element | Document = document): HTMLElement | null {
    try {
      return context.querySelector(selector) as HTMLElement | null;
    } catch (error) {
      console.warn('DOMUtils.query error:', error);
      return null;
    }
  }
  
  /**
   * 查询所有匹配的元素
   * @param selector 选择器
   * @param context 上下文元素
   * @returns 元素列表
   */
  static queryAll(selector: string, context: Element | Document = document): HTMLElement[] {
    try {
      return Array.from(context.querySelectorAll(selector)) as HTMLElement[];
    } catch (error) {
      console.warn('DOMUtils.queryAll error:', error);
      return [];
    }
  }
  
  /**
   * 根据ID查询元素
   * @param id 元素ID
   * @returns 元素或null
   */
  static getElementById(id: string): HTMLElement | null {
    return document.getElementById(id);
  }
  
  /**
   * 获取元素
   * @param selector 选择器或元素
   * @returns 元素或null
   */
  static getElement(selector: DOMSelector): HTMLElement | null {
    if (typeof selector === 'string') {
      return this.query(selector);
    }
    
    if (selector instanceof HTMLElement) {
      return selector;
    }
    
    if (selector instanceof NodeList && selector.length > 0) {
      return selector[0] as HTMLElement;
    }
    
    if (Array.isArray(selector) && selector.length > 0) {
      return selector[0];
    }
    
    return null;
  }
  
  // ==================== 元素创建和操作方法 ====================
  
  /**
   * 创建元素
   * @param tagName 标签名
   * @param attributes 属性
   * @param children 子元素
   * @returns 创建的元素
   */
  static createElement<K extends keyof HTMLElementTagNameMap>(
    tagName: K,
    attributes?: Record<string, any>,
    children?: (HTMLElement | string)[]
  ): HTMLElementTagNameMap[K] {
    const element = document.createElement(tagName);
    
    // 设置属性
    if (attributes) {
      Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className' || key === 'class') {
          this.setClassName(element, value);
        } else if (key === 'style') {
          this.setStyle(element, value);
        } else if (key.startsWith('data-')) {
          element.setAttribute(key, String(value));
        } else if (key in element) {
          (element as any)[key] = value;
        } else {
          element.setAttribute(key, String(value));
        }
      });
    }
    
    // 添加子元素
    if (children) {
      children.forEach(child => {
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
   * 移除元素
   * @param element 元素
   */
  static remove(element: HTMLElement): void {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
  }
  
  /**
   * 清空元素内容
   * @param element 元素
   */
  static empty(element: HTMLElement): void {
    if (element) {
      element.innerHTML = '';
    }
  }
  
  /**
   * 克隆元素
   * @param element 元素
   * @param deep 是否深度克隆
   * @returns 克隆的元素
   */
  static clone(element: HTMLElement, deep: boolean = true): HTMLElement {
    return element.cloneNode(deep) as HTMLElement;
  }
  
  // ==================== 样式操作方法 ====================
  
  /**
   * 设置样式
   * @param element 元素
   * @param styles 样式对象
   */
  static setStyle(element: HTMLElement, styles: CSSStyleObject): void {
    if (!element || !styles) return;
    
    Object.entries(styles).forEach(([property, value]) => {
      if (value !== null && value !== undefined) {
        const cssProperty = this.camelToKebab(property);
        element.style.setProperty(cssProperty, String(value));
      }
    });
  }
  
  /**
   * 获取样式
   * @param element 元素
   * @param property 样式属性
   * @returns 样式值
   */
  static getStyle(element: HTMLElement, property: string): string {
    if (!element) return '';
    
    const computedStyle = window.getComputedStyle(element);
    return computedStyle.getPropertyValue(this.camelToKebab(property));
  }
  
  /**
   * 设置CSS类名
   * @param element 元素
   * @param className 类名
   */
  static setClassName(element: HTMLElement, className: CSSClassName): void {
    if (!element) return;
    
    if (typeof className === 'string') {
      element.className = className;
    } else if (Array.isArray(className)) {
      element.className = className.filter(Boolean).join(' ');
    } else if (className && typeof className === 'object') {
      const classes = Object.entries(className)
        .filter(([, value]) => value)
        .map(([key]) => key);
      element.className = classes.join(' ');
    }
  }
  
  /**
   * 添加CSS类
   * @param element 元素
   * @param className 类名
   */
  static addClass(element: HTMLElement, className: string): void {
    if (element && className) {
      element.classList.add(className);
    }
  }
  
  /**
   * 移除CSS类
   * @param element 元素
   * @param className 类名
   */
  static removeClass(element: HTMLElement, className: string): void {
    if (element && className) {
      element.classList.remove(className);
    }
  }
  
  /**
   * 切换CSS类
   * @param element 元素
   * @param className 类名
   * @param force 强制添加或移除
   * @returns 是否包含该类
   */
  static toggleClass(element: HTMLElement, className: string, force?: boolean): boolean {
    if (!element || !className) return false;
    
    return element.classList.toggle(className, force);
  }
  
  /**
   * 检查是否包含CSS类
   * @param element 元素
   * @param className 类名
   * @returns 是否包含
   */
  static hasClass(element: HTMLElement, className: string): boolean {
    if (!element || !className) return false;
    
    return element.classList.contains(className);
  }
  
  /**
   * 设置CSS变量
   * @param element 元素
   * @param variables CSS变量对象
   */
  static setCSSVariables(element: HTMLElement, variables: CSSVariables): void {
    if (!element || !variables) return;
    
    Object.entries(variables).forEach(([name, value]) => {
      const varName = name.startsWith('--') ? name : `--${name}`;
      element.style.setProperty(varName, String(value));
    });
  }
  
  /**
   * 获取CSS变量值
   * @param element 元素
   * @param name 变量名
   * @returns 变量值
   */
  static getCSSVariable(element: HTMLElement, name: string): string {
    if (!element || !name) return '';
    
    const varName = name.startsWith('--') ? name : `--${name}`;
    const computedStyle = window.getComputedStyle(element);
    return computedStyle.getPropertyValue(varName).trim();
  }
  
  // ==================== 位置和尺寸方法 ====================
  
  /**
   * 获取元素位置
   * @param element 元素
   * @returns 位置信息
   */
  static getPosition(element: HTMLElement): Position {
    if (!element) {
      return { x: 0, y: 0, left: 0, top: 0, right: 0, bottom: 0 };
    }
    
    const rect = element.getBoundingClientRect();
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    return {
      x: rect.left + scrollLeft,
      y: rect.top + scrollTop,
      left: rect.left + scrollLeft,
      top: rect.top + scrollTop,
      right: rect.right + scrollLeft,
      bottom: rect.bottom + scrollTop
    };
  }
  
  /**
   * 获取元素尺寸
   * @param element 元素
   * @returns 尺寸信息
   */
  static getSize(element: HTMLElement): Size {
    if (!element) {
      return { width: 0, height: 0 };
    }
    
    const rect = element.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height
    };
  }
  
  /**
   * 获取元素边界
   * @param element 元素
   * @returns 边界信息
   */
  static getBounds(element: HTMLElement): Bounds {
    const position = this.getPosition(element);
    const size = this.getSize(element);
    
    return {
      ...position,
      ...size
    };
  }
  
  // ==================== 事件处理方法 ====================

  /**
   * 添加事件监听器
   * @param element 元素
   * @param eventName 事件名称
   * @param handler 事件处理器
   * @param options 选项
   */
  static addEventListener<T extends DOMEventName>(
    element: HTMLElement | Document | Window,
    eventName: T,
    handler: DOMEventHandler<T>,
    options?: EventListenerOptions
  ): void {
    if (element && eventName && handler) {
      element.addEventListener(eventName, handler as EventListener, options);
    }
  }

  /**
   * 移除事件监听器
   * @param element 元素
   * @param eventName 事件名称
   * @param handler 事件处理器
   * @param options 选项
   */
  static removeEventListener<T extends DOMEventName>(
    element: HTMLElement | Document | Window,
    eventName: T,
    handler: DOMEventHandler<T>,
    options?: EventListenerOptions
  ): void {
    if (element && eventName && handler) {
      element.removeEventListener(eventName, handler as EventListener, options);
    }
  }

  /**
   * 触发事件
   * @param element 元素
   * @param eventName 事件名称
   * @param detail 事件详情
   */
  static dispatchEvent(
    element: HTMLElement,
    eventName: string,
    detail?: any
  ): boolean {
    if (!element || !eventName) return false;

    const event = new CustomEvent(eventName, {
      detail,
      bubbles: true,
      cancelable: true
    });

    return element.dispatchEvent(event);
  }

  /**
   * 阻止事件默认行为
   * @param event 事件对象
   */
  static preventDefault(event: Event): void {
    if (event && event.preventDefault) {
      event.preventDefault();
    }
  }

  /**
   * 阻止事件冒泡
   * @param event 事件对象
   */
  static stopPropagation(event: Event): void {
    if (event && event.stopPropagation) {
      event.stopPropagation();
    }
  }

  /**
   * 阻止事件默认行为和冒泡
   * @param event 事件对象
   */
  static stopEvent(event: Event): void {
    this.preventDefault(event);
    this.stopPropagation(event);
  }

  // ==================== 设备检测方法 ====================

  /**
   * 检查是否为移动设备
   * @returns 是否为移动设备
   */
  static isMobile(): boolean {
    if (typeof window === 'undefined') return false;

    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  /**
   * 检查是否为触摸设备
   * @returns 是否为触摸设备
   */
  static isTouchDevice(): boolean {
    if (typeof window === 'undefined') return false;

    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  /**
   * 获取视口尺寸
   * @returns 视口尺寸
   */
  static getViewportSize(): Size {
    if (typeof window === 'undefined') {
      return { width: 0, height: 0 };
    }

    return {
      width: window.innerWidth || document.documentElement.clientWidth,
      height: window.innerHeight || document.documentElement.clientHeight
    };
  }

  /**
   * 获取滚动位置
   * @returns 滚动位置
   */
  static getScrollPosition(): Position {
    if (typeof window === 'undefined') {
      return { x: 0, y: 0, left: 0, top: 0, right: 0, bottom: 0 };
    }

    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    return {
      x: scrollLeft,
      y: scrollTop,
      left: scrollLeft,
      top: scrollTop,
      right: scrollLeft,
      bottom: scrollTop
    };
  }

  // ==================== 动画方法 ====================

  /**
   * 平滑滚动到元素
   * @param element 目标元素
   * @param options 滚动选项
   */
  static scrollToElement(
    element: HTMLElement,
    options: ScrollIntoViewOptions = { behavior: 'smooth', block: 'center' }
  ): void {
    if (element && element.scrollIntoView) {
      element.scrollIntoView(options);
    }
  }

  /**
   * 平滑滚动到顶部
   * @param duration 动画持续时间
   */
  static scrollToTop(duration: number = 300): void {
    if (typeof window === 'undefined') return;

    const start = window.pageYOffset;
    const startTime = performance.now();

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // 缓动函数
      const easeInOutQuad = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      const scrollY = start * (1 - easeInOutQuad(progress));

      window.scrollTo(0, scrollY);

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  }

  // ==================== 辅助方法 ====================

  /**
   * 驼峰转短横线
   * @param str 驼峰字符串
   * @returns 短横线字符串
   */
  private static camelToKebab(str: string): string {
    return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
  }

  /**
   * 短横线转驼峰
   * @param str 短横线字符串
   * @returns 驼峰字符串
   */
  private static kebabToCamel(str: string): string {
    return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  /**
   * 检查元素是否在视口内
   * @param element 元素
   * @returns 是否在视口内
   */
  static isInViewport(element: HTMLElement): boolean {
    if (!element) return false;

    const rect = element.getBoundingClientRect();
    const viewport = this.getViewportSize();

    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= viewport.height &&
      rect.right <= viewport.width
    );
  }

  /**
   * 等待DOM准备就绪
   * @param callback 回调函数
   */
  static ready(callback: () => void): void {
    if (typeof document === 'undefined') return;

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }
}
