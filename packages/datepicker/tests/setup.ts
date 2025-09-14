/**
 * Vitest 测试环境设置文件
 * 配置全局测试环境和工具函数
 */

import { vi } from 'vitest';

// 模拟浏览器 API
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
});

// 模拟 ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// 模拟 IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// 模拟 requestAnimationFrame
global.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
  return setTimeout(callback, 16);
});

global.cancelAnimationFrame = vi.fn((id: number) => {
  clearTimeout(id);
});

// 模拟 getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  value: vi.fn().mockImplementation(() => ({
    getPropertyValue: vi.fn().mockReturnValue(''),
    setProperty: vi.fn(),
    removeProperty: vi.fn()
  }))
});

// 模拟 localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// 模拟 sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock
});

// 设置默认时区（避免测试在不同时区出现问题）
process.env.TZ = 'UTC';

// 全局测试工具函数
declare global {
  var createMockElement: (tagName: string) => HTMLElement;
  var createMockEvent: (type: string, options?: EventInit) => Event;
  var waitForNextTick: () => Promise<void>;
}

// 创建模拟 DOM 元素的工具函数
global.createMockElement = (tagName: string): HTMLElement => {
  const element = document.createElement(tagName);

  // 模拟一些常用的方法和属性
  Object.defineProperty(element, 'offsetWidth', {
    get: vi.fn().mockReturnValue(100)
  });

  Object.defineProperty(element, 'offsetHeight', {
    get: vi.fn().mockReturnValue(100)
  });

  Object.defineProperty(element, 'clientWidth', {
    get: vi.fn().mockReturnValue(100)
  });

  Object.defineProperty(element, 'clientHeight', {
    get: vi.fn().mockReturnValue(100)
  });

  return element;
};

// 创建模拟事件的工具函数
global.createMockEvent = (type: string, options: EventInit = {}): Event => {
  return new Event(type, {
    bubbles: true,
    cancelable: true,
    ...options
  });
};

// 等待下一个事件循环的工具函数
global.waitForNextTick = (): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, 0));
};

// 在每个测试前重置所有模拟
import { beforeEach } from 'vitest';

beforeEach(() => {
  vi.clearAllMocks();
  document.body.innerHTML = '';
});
