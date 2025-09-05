/**
 * Vitest 测试设置文件
 */

import { vi } from 'vitest'

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
  writable: true,
})

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
}

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
})

// Mock console methods for cleaner test output
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}

// Mock fetch
global.fetch = vi.fn()

// Mock XMLHttpRequest
global.XMLHttpRequest = vi.fn(() => ({
  open: vi.fn(),
  send: vi.fn(),
  setRequestHeader: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  abort: vi.fn(),
  readyState: 4,
  status: 200,
  statusText: 'OK',
  responseText: '{}',
  response: {},
})) as any

// Mock setTimeout and clearTimeout for testing debounce
const originalSetTimeout = global.setTimeout
const originalClearTimeout = global.clearTimeout
const originalSetInterval = global.setInterval
const originalClearInterval = global.clearInterval

global.setTimeout = vi.fn((fn, delay) => {
  if (typeof fn === 'function') {
    return originalSetTimeout(fn, delay)
  }
  return 0
}) as any

global.clearTimeout = vi.fn(id => {
  originalClearTimeout(id)
})

// Mock setInterval and clearInterval
global.setInterval = vi.fn((fn, delay) => {
  if (typeof fn === 'function') {
    return originalSetInterval(fn, delay)
  }
  return 0
}) as any

global.clearInterval = vi.fn(id => {
  originalClearInterval(id)
})

// 设置全局测试环境变量
process.env.NODE_ENV = 'test'

// 清理函数，在每个测试后重置 mocks
afterEach(() => {
  vi.clearAllMocks()
  localStorageMock.getItem.mockClear()
  localStorageMock.setItem.mockClear()
  localStorageMock.removeItem.mockClear()
  localStorageMock.clear.mockClear()

  sessionStorageMock.getItem.mockClear()
  sessionStorageMock.setItem.mockClear()
  sessionStorageMock.removeItem.mockClear()
  sessionStorageMock.clear.mockClear()
})
