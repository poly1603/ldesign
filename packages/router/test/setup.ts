import { beforeEach, vi } from 'vitest'

// 模拟浏览器 API
globalThis.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

globalThis.requestIdleCallback = vi.fn(callback => {
  setTimeout(callback, 0)
  return 1
})

globalThis.cancelIdleCallback = vi.fn()

// 模拟 performance API
Object.defineProperty(globalThis, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByType: vi.fn(() => []),
    memory: {
      usedJSHeapSize: 1024 * 1024,
      totalJSHeapSize: 2 * 1024 * 1024,
      jsHeapSizeLimit: 4 * 1024 * 1024,
    },
  },
  writable: true,
})

// 模拟 navigator API
Object.defineProperty(globalThis, 'navigator', {
  value: {
    userAgent: 'Mozilla/5.0 (Test Environment)',
    connection: {
      effectiveType: '4g',
      saveData: false,
    },
    deviceMemory: 8,
  },
  writable: true,
})

// 模拟 gtag (Google Analytics)
globalThis.gtag = vi.fn()

// 全局测试设置
beforeEach(() => {
  // 清理DOM
  document.body.innerHTML = ''

  // 重置location
  if (typeof window !== 'undefined') {
    window.history.replaceState({}, '', '/')
  }

  // 清理所有 mock
  vi.clearAllMocks()
})

// Mock window.location for tests
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000/',
    origin: 'http://localhost:3000',
    protocol: 'http:',
    host: 'localhost:3000',
    hostname: 'localhost',
    port: '3000',
    pathname: '/',
    search: '',
    hash: '',
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
  },
  writable: true,
})

// Mock console methods for cleaner test output
globalThis.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
}
