/**
 * Jest 测试环境设置文件
 * 
 * 配置测试环境，包括全局模拟、工具函数和测试辅助方法
 */

import { mockFetch } from '@stencil/core/testing';

// ==================== 全局模拟 ====================

// 模拟 fetch API
(global as any).fetch = mockFetch;

// 模拟 ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() { }
  unobserve() { }
  disconnect() { }
};

// 模拟 IntersectionObserver
(global as any).IntersectionObserver = class IntersectionObserver {
  root = null;
  rootMargin = '';
  thresholds = [];

  constructor() { }
  observe() { }
  unobserve() { }
  disconnect() { }
  takeRecords() { return []; }
};

// 模拟 MutationObserver
global.MutationObserver = class MutationObserver {
  constructor() { }
  observe() { }
  disconnect() { }
  takeRecords() {
    return [];
  }
};

// 模拟 matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// 模拟 getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => '',
    setProperty: () => { },
    removeProperty: () => '',
  }),
});

// 模拟 localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// 模拟 sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// ==================== 测试工具函数 ====================

/**
 * 等待指定时间
 * @param ms 等待时间（毫秒）
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * 等待下一个事件循环
 */
export const nextTick = (): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, 0));
};

/**
 * 模拟用户输入
 * @param element 输入元素
 * @param value 输入值
 */
export const mockUserInput = (element: HTMLInputElement | HTMLTextAreaElement, value: string): void => {
  element.value = value;
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
};

/**
 * 模拟键盘事件
 * @param element 目标元素
 * @param key 按键
 * @param options 事件选项
 */
export const mockKeyboardEvent = (
  element: Element,
  key: string,
  options: KeyboardEventInit = {}
): void => {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...options,
  });
  element.dispatchEvent(event);
};

/**
 * 模拟鼠标事件
 * @param element 目标元素
 * @param type 事件类型
 * @param options 事件选项
 */
export const mockMouseEvent = (
  element: Element,
  type: string,
  options: MouseEventInit = {}
): void => {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    ...options,
  });
  element.dispatchEvent(event);
};

/**
 * 模拟触摸事件
 * @param element 目标元素
 * @param type 事件类型
 * @param touches 触摸点
 */
export const mockTouchEvent = (
  element: Element,
  type: string,
  touches: Touch[] = []
): void => {
  const event = new TouchEvent(type, {
    bubbles: true,
    cancelable: true,
    touches,
    targetTouches: touches,
    changedTouches: touches,
  });
  element.dispatchEvent(event);
};

/**
 * 获取元素的计算样式
 * @param element 目标元素
 * @param property CSS 属性
 */
export const getComputedStyleValue = (element: Element, property: string): string => {
  return window.getComputedStyle(element).getPropertyValue(property);
};

/**
 * 检查元素是否可见
 * @param element 目标元素
 */
export const isElementVisible = (element: Element): boolean => {
  const style = window.getComputedStyle(element);
  return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
};

/**
 * 等待元素出现
 * @param selector 选择器
 * @param container 容器元素
 * @param timeout 超时时间
 */
export const waitForElement = async (
  selector: string,
  container: Element | Document = document,
  timeout: number = 5000
): Promise<Element> => {
  return new Promise((resolve, reject) => {
    const element = container.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = container.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element with selector "${selector}" not found within ${timeout}ms`));
    }, timeout);
  });
};

/**
 * 等待元素消失
 * @param selector 选择器
 * @param container 容器元素
 * @param timeout 超时时间
 */
export const waitForElementToDisappear = async (
  selector: string,
  container: Element | Document = document,
  timeout: number = 5000
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const element = container.querySelector(selector);
    if (!element) {
      resolve();
      return;
    }

    const observer = new MutationObserver(() => {
      const element = container.querySelector(selector);
      if (!element) {
        observer.disconnect();
        resolve();
      }
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element with selector "${selector}" still exists after ${timeout}ms`));
    }, timeout);
  });
};

// ==================== 自定义匹配器 ====================

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeVisible(): R;
      toHaveClass(className: string): R;
      toHaveAttribute(attribute: string, value?: string): R;
      toHaveStyle(style: Record<string, string>): R;
    }
  }
}

// 扩展 Jest 匹配器
expect.extend({
  toBeVisible(received: Element) {
    const pass = isElementVisible(received);
    return {
      message: () =>
        pass
          ? `Expected element not to be visible`
          : `Expected element to be visible`,
      pass,
    };
  },

  toHaveClass(received: Element, className: string) {
    const pass = received.classList.contains(className);
    return {
      message: () =>
        pass
          ? `Expected element not to have class "${className}"`
          : `Expected element to have class "${className}"`,
      pass,
    };
  },

  toHaveAttribute(received: Element, attribute: string, value?: string) {
    const hasAttribute = received.hasAttribute(attribute);
    if (value === undefined) {
      return {
        message: () =>
          hasAttribute
            ? `Expected element not to have attribute "${attribute}"`
            : `Expected element to have attribute "${attribute}"`,
        pass: hasAttribute,
      };
    }

    const actualValue = received.getAttribute(attribute);
    const pass = hasAttribute && actualValue === value;
    return {
      message: () =>
        pass
          ? `Expected element not to have attribute "${attribute}" with value "${value}"`
          : `Expected element to have attribute "${attribute}" with value "${value}", but got "${actualValue}"`,
      pass,
    };
  },

  toHaveStyle(received: Element, style: Record<string, string>) {
    const computedStyle = window.getComputedStyle(received);
    const pass = Object.entries(style).every(([property, value]) => {
      return computedStyle.getPropertyValue(property) === value;
    });

    return {
      message: () =>
        pass
          ? `Expected element not to have styles`
          : `Expected element to have styles`,
      pass,
    };
  },
});

// ==================== 测试环境清理 ====================

beforeEach(() => {
  // 清理 DOM
  document.body.innerHTML = '';

  // 重置模拟
  jest.clearAllMocks();

  // 重置 localStorage
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();

  // 重置 sessionStorage
  sessionStorageMock.getItem.mockClear();
  sessionStorageMock.setItem.mockClear();
  sessionStorageMock.removeItem.mockClear();
  sessionStorageMock.clear.mockClear();
});

afterEach(() => {
  // 清理定时器
  jest.clearAllTimers();
});

// ==================== 控制台警告过滤 ====================

// 过滤掉一些已知的无害警告
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args) => {
  const message = args[0];
  if (
    typeof message === 'string' &&
    (message.includes('Warning: ReactDOM.render is deprecated') ||
      message.includes('Warning: componentWillMount has been renamed'))
  ) {
    return;
  }
  originalError.call(console, ...args);
};

console.warn = (...args) => {
  const message = args[0];
  if (
    typeof message === 'string' &&
    message.includes('deprecated')
  ) {
    return;
  }
  originalWarn.call(console, ...args);
};
