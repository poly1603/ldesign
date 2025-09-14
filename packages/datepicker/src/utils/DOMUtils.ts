/**
 * DOMUtils DOM 工具类
 * 提供 DOM 操作相关的工具方法
 */

/**
 * DOM 工具类
 * 提供各种 DOM 操作的静态方法
 */
export class DOMUtils {
  /**
   * 检查元素是否在视口中
   * @param element 要检查的元素
   * @returns 是否在视口中
   */
  static isInViewport(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  /**
   * 获取元素的绝对位置
   * @param element 元素
   * @returns 位置信息
   */
  static getElementPosition(element: HTMLElement): { top: number; left: number; width: number; height: number } {
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    return {
      top: rect.top + scrollTop,
      left: rect.left + scrollLeft,
      width: rect.width,
      height: rect.height
    };
  }

  /**
   * 添加 CSS 类
   * @param element 元素
   * @param className 类名
   */
  static addClass(element: HTMLElement, className: string): void {
    if (!element.classList.contains(className)) {
      element.classList.add(className);
    }
  }

  /**
   * 移除 CSS 类
   * @param element 元素
   * @param className 类名
   */
  static removeClass(element: HTMLElement, className: string): void {
    element.classList.remove(className);
  }

  /**
   * 切换 CSS 类
   * @param element 元素
   * @param className 类名
   * @returns 是否添加了类
   */
  static toggleClass(element: HTMLElement, className: string): boolean {
    return element.classList.toggle(className);
  }

  /**
   * 检查是否有指定的 CSS 类
   * @param element 元素
   * @param className 类名
   * @returns 是否有该类
   */
  static hasClass(element: HTMLElement, className: string): boolean {
    return element.classList.contains(className);
  }

  /**
   * 设置元素样式
   * @param element 元素
   * @param styles 样式对象
   */
  static setStyles(element: HTMLElement, styles: Partial<CSSStyleDeclaration>): void {
    Object.assign(element.style, styles);
  }

  /**
   * 获取元素的计算样式
   * @param element 元素
   * @param property 样式属性
   * @returns 样式值
   */
  static getComputedStyle(element: HTMLElement, property: string): string {
    return window.getComputedStyle(element).getPropertyValue(property);
  }

  /**
   * 创建元素
   * @param tagName 标签名
   * @param options 选项
   * @returns 创建的元素
   */
  static createElement<K extends keyof HTMLElementTagNameMap>(
    tagName: K,
    options: {
      className?: string;
      id?: string;
      innerHTML?: string;
      textContent?: string;
      attributes?: Record<string, string>;
      styles?: Partial<CSSStyleDeclaration>;
    } = {}
  ): HTMLElementTagNameMap[K] {
    const element = document.createElement(tagName);

    if (options.className) element.className = options.className;
    if (options.id) element.id = options.id;
    if (options.innerHTML) element.innerHTML = options.innerHTML;
    if (options.textContent) element.textContent = options.textContent;

    if (options.attributes) {
      for (const [key, value] of Object.entries(options.attributes)) {
        element.setAttribute(key, value);
      }
    }

    if (options.styles) {
      Object.assign(element.style, options.styles);
    }

    return element;
  }

  /**
   * 查找最近的匹配选择器的祖先元素
   * @param element 起始元素
   * @param selector 选择器
   * @returns 匹配的元素或 null
   */
  static closest(element: HTMLElement, selector: string): HTMLElement | null {
    return element.closest(selector) as HTMLElement | null;
  }

  /**
   * 检查元素是否匹配选择器
   * @param element 元素
   * @param selector 选择器
   * @returns 是否匹配
   */
  static matches(element: HTMLElement, selector: string): boolean {
    return element.matches(selector);
  }

  /**
   * 获取元素的所有子元素
   * @param element 父元素
   * @param selector 可选的选择器
   * @returns 子元素数组
   */
  static getChildren(element: HTMLElement, selector?: string): HTMLElement[] {
    const children = Array.from(element.children) as HTMLElement[];
    return selector ? children.filter(child => child.matches(selector)) : children;
  }

  /**
   * 在指定元素之后插入新元素
   * @param newElement 新元素
   * @param referenceElement 参考元素
   */
  static insertAfter(newElement: HTMLElement, referenceElement: HTMLElement): void {
    const parent = referenceElement.parentNode;
    if (parent) {
      parent.insertBefore(newElement, referenceElement.nextSibling);
    }
  }

  /**
   * 在指定元素之前插入新元素
   * @param newElement 新元素
   * @param referenceElement 参考元素
   */
  static insertBefore(newElement: HTMLElement, referenceElement: HTMLElement): void {
    const parent = referenceElement.parentNode;
    if (parent) {
      parent.insertBefore(newElement, referenceElement);
    }
  }

  /**
   * 移除元素
   * @param element 要移除的元素
   */
  static remove(element: HTMLElement): void {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  }

  /**
   * 清空元素的所有子元素
   * @param element 要清空的元素
   */
  static empty(element: HTMLElement): void {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }

  /**
   * 检查元素是否可见
   * @param element 元素
   * @returns 是否可见
   */
  static isVisible(element: HTMLElement): boolean {
    return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
  }

  /**
   * 获取滚动条宽度
   * @returns 滚动条宽度
   */
  static getScrollbarWidth(): number {
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll';
    (outer.style as any).msOverflowStyle = 'scrollbar';
    document.body.appendChild(outer);

    const inner = document.createElement('div');
    outer.appendChild(inner);

    const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;

    document.body.removeChild(outer);

    return scrollbarWidth;
  }

  /**
   * 平滑滚动到指定元素
   * @param element 目标元素
   * @param options 滚动选项
   */
  static scrollToElement(
    element: HTMLElement,
    options: {
      behavior?: ScrollBehavior;
      block?: ScrollLogicalPosition;
      inline?: ScrollLogicalPosition;
    } = {}
  ): void {
    element.scrollIntoView({
      behavior: options.behavior || 'smooth',
      block: options.block || 'center',
      inline: options.inline || 'nearest'
    });
  }

  /**
   * 防抖函数
   * @param func 要防抖的函数
   * @param wait 等待时间
   * @returns 防抖后的函数
   */
  static debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  /**
   * 节流函数
   * @param func 要节流的函数
   * @param limit 限制时间
   * @returns 节流后的函数
   */
  static throttle<T extends (...args: unknown[]) => unknown>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * 添加事件监听器
   * @param element 元素
   * @param event 事件名
   * @param handler 处理函数
   * @param options 选项
   */
  static addEventListener<K extends keyof HTMLElementEventMap>(
    element: HTMLElement,
    event: K,
    handler: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void {
    element.addEventListener(event, handler, options);
  }

  /**
   * 移除事件监听器
   * @param element 元素
   * @param event 事件名
   * @param handler 处理函数
   * @param options 选项
   */
  static removeEventListener<K extends keyof HTMLElementEventMap>(
    element: HTMLElement,
    event: K,
    handler: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void {
    element.removeEventListener(event, handler, options);
  }

  /**
   * 触发自定义事件
   * @param element 元素
   * @param eventName 事件名
   * @param detail 事件详情
   */
  static dispatchEvent(
    element: HTMLElement,
    eventName: string,
    detail?: unknown
  ): boolean {
    const event = new CustomEvent(eventName, {
      detail,
      bubbles: true,
      cancelable: true
    });

    return element.dispatchEvent(event);
  }
}
