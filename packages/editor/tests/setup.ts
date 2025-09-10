/**
 * 测试环境设置
 * 配置全局测试环境和模拟对象
 */

import { vi } from 'vitest'

// 模拟 DOM API
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => '',
    setProperty: () => {},
    removeProperty: () => {}
  })
})

// 模拟 Selection API
Object.defineProperty(window, 'getSelection', {
  value: () => ({
    rangeCount: 0,
    getRangeAt: () => null,
    removeAllRanges: () => {},
    addRange: () => {},
    toString: () => '',
    collapsed: true,
    anchorNode: null,
    focusNode: null
  })
})

// 模拟 Range API
Object.defineProperty(document, 'createRange', {
  value: () => ({
    setStart: () => {},
    setEnd: () => {},
    selectNodeContents: () => {},
    deleteContents: () => {},
    insertNode: () => {},
    cloneContents: () => document.createDocumentFragment(),
    extractContents: () => document.createDocumentFragment(),
    collapsed: true,
    startContainer: null,
    endContainer: null,
    startOffset: 0,
    endOffset: 0
  })
})

// 模拟 execCommand
Object.defineProperty(document, 'execCommand', {
  value: vi.fn(() => true)
})

// 模拟 ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// 模拟 MutationObserver
global.MutationObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  takeRecords: vi.fn(() => [])
}))

// 模拟 requestAnimationFrame
global.requestAnimationFrame = vi.fn((callback) => {
  return setTimeout(callback, 16)
})

global.cancelAnimationFrame = vi.fn((id) => {
  clearTimeout(id)
})

// 模拟 localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// 模拟 sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock
})

// 模拟 console 方法（可选，用于测试时减少日志输出）
if (process.env.NODE_ENV === 'test') {
  global.console = {
    ...console,
    log: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}

// 设置默认的测试环境变量
process.env.NODE_ENV = 'test'

// 全局测试工具函数
export const createMockElement = (tagName: string = 'div'): HTMLElement => {
  const element = document.createElement(tagName)
  
  // 模拟一些常用的 DOM 方法
  element.getBoundingClientRect = vi.fn(() => ({
    top: 0,
    left: 0,
    bottom: 100,
    right: 100,
    width: 100,
    height: 100,
    x: 0,
    y: 0,
    toJSON: () => {}
  }))
  
  return element
}

export const createMockSelection = () => ({
  rangeCount: 1,
  getRangeAt: vi.fn(() => createMockRange()),
  removeAllRanges: vi.fn(),
  addRange: vi.fn(),
  toString: vi.fn(() => 'mock selection'),
  collapsed: false,
  anchorNode: createMockElement(),
  focusNode: createMockElement(),
  text: 'mock selection'
})

export const createMockRange = () => ({
  setStart: vi.fn(),
  setEnd: vi.fn(),
  selectNodeContents: vi.fn(),
  deleteContents: vi.fn(),
  insertNode: vi.fn(),
  cloneContents: vi.fn(() => document.createDocumentFragment()),
  extractContents: vi.fn(() => document.createDocumentFragment()),
  collapsed: false,
  startContainer: createMockElement(),
  endContainer: createMockElement(),
  startOffset: 0,
  endOffset: 10
})

// 测试辅助函数
export const waitFor = (ms: number = 0): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const nextTick = (): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, 0))
}

// 清理函数
export const cleanup = (): void => {
  document.body.innerHTML = ''
  vi.clearAllMocks()
}

// 在每个测试后自动清理
afterEach(() => {
  cleanup()
})
