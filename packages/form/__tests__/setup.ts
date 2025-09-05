/**
 * 测试环境设置
 * 
 * @description
 * 配置测试环境，包括全局变量、模拟对象、测试工具等
 */

import { vi } from 'vitest';
import { config } from '@vue/test-utils';

// 配置 Vue Test Utils
config.global.stubs = {
  // 存根组件，避免在测试中渲染复杂的子组件
  transition: true,
  'transition-group': true,
};

// 模拟浏览器 API
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// 模拟 ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// 模拟 IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// 模拟 requestAnimationFrame
global.requestAnimationFrame = vi.fn(cb => setTimeout(cb, 16));
global.cancelAnimationFrame = vi.fn(id => clearTimeout(id));

// 模拟 localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// 模拟 sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.sessionStorage = sessionStorageMock;

// 模拟 console 方法（在测试中静默）
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  warn: vi.fn(),
  error: vi.fn(),
  log: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
};

// 测试工具函数
export const createMockForm = () => ({
  id: 'test-form',
  data: {},
  state: new Set(),
  fields: new Map(),
  validation: {},
  events: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    once: vi.fn(),
  },
  setFieldValue: vi.fn(),
  getFieldValue: vi.fn(),
  setValues: vi.fn(),
  getValues: vi.fn(),
  reset: vi.fn(),
  registerField: vi.fn(),
  unregisterField: vi.fn(),
  getField: vi.fn(),
  hasField: vi.fn(),
  validate: vi.fn(),
  validateField: vi.fn(),
  clearValidation: vi.fn(),
  hasState: vi.fn(),
  addState: vi.fn(),
  removeState: vi.fn(),
  getSnapshot: vi.fn(),
  restoreSnapshot: vi.fn(),
  submit: vi.fn(),
  onChange: vi.fn(),
  onSubmit: vi.fn(),
  onReset: vi.fn(),
  off: vi.fn(),
  destroy: vi.fn(),
  destroyed: false,
  config: {},
});

export const createMockField = () => ({
  id: 'test-field',
  value: null,
  initialValue: null,
  state: new Set(),
  validation: null,
  form: createMockForm(),
  destroyed: false,
  config: {
    name: 'test-field',
  },
  setValue: vi.fn(),
  getValue: vi.fn(),
  reset: vi.fn(),
  hasState: vi.fn(),
  addState: vi.fn(),
  removeState: vi.fn(),
  touch: vi.fn(),
  untouch: vi.fn(),
  isDirty: vi.fn(),
  isTouched: vi.fn(),
  isValid: vi.fn(),
  isPending: vi.fn(),
  validate: vi.fn(),
  clearValidation: vi.fn(),
  onChange: vi.fn(),
  onValidate: vi.fn(),
  off: vi.fn(),
  destroy: vi.fn(),
});

// 测试断言辅助函数
export const expectFormState = (form: any, expectedStates: string[]) => {
  expectedStates.forEach(state => {
    expect(form.hasState(state)).toBe(true);
  });
};

export const expectFieldState = (field: any, expectedStates: string[]) => {
  expectedStates.forEach(state => {
    expect(field.hasState(state)).toBe(true);
  });
};

export const expectValidationResult = (result: any, expected: {
  valid: boolean;
  message?: string;
  code?: string;
}) => {
  expect(result.valid).toBe(expected.valid);
  if (expected.message) {
    expect(result.message).toBe(expected.message);
  }
  if (expected.code) {
    expect(result.code).toBe(expected.code);
  }
};

// 异步测试辅助函数
export const waitForValidation = async (fn: () => Promise<any>, timeout = 1000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const result = await fn();
      return result;
    } catch (error) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
  throw new Error('Validation timeout');
};

// 清理函数
export const cleanup = () => {
  vi.clearAllMocks();
  vi.clearAllTimers();
  
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
};

// 在每个测试后清理
afterEach(() => {
  cleanup();
});
