/**
 * @ldesign/theme - 测试环境设置
 */

import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// 设置 Vue Test Utils 全局配置
config.global.stubs = {
  // 存根化一些复杂的组件
  transition: false,
  'transition-group': false,
}

// Mock DOM APIs
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
})

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn().mockImplementation(cb => {
  return setTimeout(cb, 16)
})

global.cancelAnimationFrame = vi.fn().mockImplementation(id => {
  clearTimeout(id)
})

// Mock performance API
Object.defineProperty(window, 'performance', {
  writable: true,
  value: {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByName: vi.fn(() => []),
    getEntriesByType: vi.fn(() => []),
  },
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
})

// Mock CSS.supports
Object.defineProperty(window, 'CSS', {
  value: {
    supports: vi.fn(() => true),
  },
})

// Mock getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  value: vi.fn(() => ({
    getPropertyValue: vi.fn(() => ''),
    setProperty: vi.fn(),
    removeProperty: vi.fn(),
  })),
})

// Mock document.createElement for SVG elements
const originalCreateElement = document.createElement
document.createElement = vi.fn().mockImplementation((tagName: string) => {
  if (tagName === 'svg') {
    const svg = originalCreateElement.call(document, 'div')
    svg.setAttribute = vi.fn()
    svg.innerHTML = ''
    return svg
  }
  return originalCreateElement.call(document, tagName)
})

// Mock MutationObserver
global.MutationObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  takeRecords: vi.fn(() => []),
}))

// Mock console methods for cleaner test output
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

console.error = vi.fn().mockImplementation((...args) => {
  // 只在非测试相关的错误时输出
  if (!args.some(arg => typeof arg === 'string' && arg.includes('test'))) {
    originalConsoleError(...args)
  }
})

console.warn = vi.fn().mockImplementation((...args) => {
  // 只在非测试相关的警告时输出
  if (!args.some(arg => typeof arg === 'string' && arg.includes('test'))) {
    originalConsoleWarn(...args)
  }
})

// 设置测试环境变量
process.env.NODE_ENV = 'test'
process.env.VITEST = 'true'

// 全局测试工具函数
global.flushPromises = () => new Promise(resolve => setTimeout(resolve, 0))

// 清理函数
afterEach(() => {
  vi.clearAllMocks()
  vi.clearAllTimers()

  // 清理 DOM
  document.body.innerHTML = ''
  document.head.innerHTML = ''

  // 重置 localStorage mock
  localStorageMock.getItem.mockClear()
  localStorageMock.setItem.mockClear()
  localStorageMock.removeItem.mockClear()
  localStorageMock.clear.mockClear()
})

// 全局错误处理
window.addEventListener('error', event => {
  console.error('Global error in test:', event.error)
})

window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled promise rejection in test:', event.reason)
})

// 导出测试工具
export const testUtils = {
  flushPromises: global.flushPromises,
  mockLocalStorage: localStorageMock,

  // 创建模拟的 DOM 元素
  createMockElement: (tagName = 'div') => {
    const element = document.createElement(tagName)
    element.classList = {
      add: vi.fn(),
      remove: vi.fn(),
      contains: vi.fn(),
      toggle: vi.fn(),
    } as any
    element.setAttribute = vi.fn()
    element.removeAttribute = vi.fn()
    element.getAttribute = vi.fn()
    element.style = {
      setProperty: vi.fn(),
      removeProperty: vi.fn(),
      getPropertyValue: vi.fn(),
    } as any
    return element
  },

  // 等待下一个 tick
  nextTick: () => new Promise(resolve => setTimeout(resolve, 0)),

  // 模拟用户交互
  mockUserInteraction: {
    click: (element: HTMLElement) => {
      const event = new MouseEvent('click', { bubbles: true })
      element.dispatchEvent(event)
    },

    input: (element: HTMLInputElement, value: string) => {
      element.value = value
      const event = new Event('input', { bubbles: true })
      element.dispatchEvent(event)
    },
  },
}
