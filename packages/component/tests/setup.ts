/**
 * Vitest 测试环境设置
 * 
 * 配置全局测试环境，包括 Vue 测试工具、模拟对象等
 */

import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// 配置 Vue Test Utils 全局选项
config.global.stubs = {
  // 存根化一些可能导致测试问题的组件
  transition: true,
  'transition-group': true
}

// 模拟 window 对象的一些方法
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

// 模拟 ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// 模拟 IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// 模拟 getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => '',
  }),
})

// 模拟 scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
})

// 模拟 requestAnimationFrame
Object.defineProperty(window, 'requestAnimationFrame', {
  value: (callback: FrameRequestCallback) => {
    return setTimeout(callback, 16)
  },
})

// 模拟 cancelAnimationFrame
Object.defineProperty(window, 'cancelAnimationFrame', {
  value: (id: number) => {
    clearTimeout(id)
  },
})

// 模拟 localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// 模拟 sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
})

// 模拟 URL.createObjectURL
Object.defineProperty(URL, 'createObjectURL', {
  value: vi.fn(() => 'mocked-url'),
})

// 模拟 URL.revokeObjectURL
Object.defineProperty(URL, 'revokeObjectURL', {
  value: vi.fn(),
})

// 模拟 navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(''),
  },
})

// 设置全局错误处理
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason)
})

// 在每个测试前重置所有模拟
beforeEach(() => {
  vi.clearAllMocks()
})

// 在每个测试后清理
afterEach(() => {
  vi.clearAllTimers()
})

// 全局测试工具函数
declare global {
  /**
   * 等待下一个 tick
   */
  function nextTick(): Promise<void>
  
  /**
   * 等待指定时间
   */
  function sleep(ms: number): Promise<void>
  
  /**
   * 触发元素事件
   */
  function triggerEvent(element: Element, eventType: string, eventData?: any): void
}

// 实现全局工具函数
global.nextTick = async () => {
  await new Promise(resolve => setTimeout(resolve, 0))
}

global.sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

global.triggerEvent = (element: Element, eventType: string, eventData = {}) => {
  const event = new Event(eventType, { bubbles: true, cancelable: true, ...eventData })
  element.dispatchEvent(event)
}
