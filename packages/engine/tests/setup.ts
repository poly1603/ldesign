/**
 * Vitest 测试环境设置文件
 */

import { afterEach, vi } from 'vitest'

// 模拟浏览器环境的全局对象
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
globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// 模拟 IntersectionObserver
globalThis.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// 模拟 requestAnimationFrame
globalThis.requestAnimationFrame = vi.fn(cb => setTimeout(cb, 16)) as any
globalThis.cancelAnimationFrame = vi.fn(id => clearTimeout(id))

// 模拟 Canvas API
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: vi.fn().mockImplementation((contextType: string) => {
    if (contextType === 'webgl' || contextType === 'experimental-webgl') {
      return {
        getExtension: vi.fn(),
        getParameter: vi.fn(),
        createShader: vi.fn(),
        createProgram: vi.fn(),
      }
    }
    if (contextType === 'webgl2') {
      return {
        getExtension: vi.fn(),
        getParameter: vi.fn(),
        createShader: vi.fn(),
        createProgram: vi.fn(),
      }
    }
    if (contextType === '2d') {
      return {
        fillRect: vi.fn(),
        clearRect: vi.fn(),
        getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
        putImageData: vi.fn(),
        createImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
        setTransform: vi.fn(),
        drawImage: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        scale: vi.fn(),
        rotate: vi.fn(),
        translate: vi.fn(),
        transform: vi.fn(),
      }
    }
    return null
  }),
})

// 模拟 localStorage
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

// 模拟 sessionStorage
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
})

// 模拟 console 方法以避免测试输出污染（在非基准测试中）
const originalConsole = { ...console }
if (process.env.VITEST_BENCHMARK !== 'true') {
  globalThis.console = {
    ...originalConsole,
    log: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }
}

// 模拟 Performance API
if (typeof globalThis.performance === 'undefined') {
  globalThis.performance = {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    clearMarks: vi.fn(),
    clearMeasures: vi.fn(),
    getEntriesByName: vi.fn(() => []),
    getEntriesByType: vi.fn(() => []),
  } as any
}

// 模拟 fetch API
if (typeof globalThis.fetch === 'undefined') {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: vi.fn().mockResolvedValue({}),
    text: vi.fn().mockResolvedValue(''),
    status: 200,
    statusText: 'OK'
  })
}

// 模拟 URL API
if (typeof globalThis.URL === 'undefined') {
  globalThis.URL = class MockURL {
    constructor(public href: string, base?: string) {}
    toString() { return this.href }
  } as any
}

// 模拟 WebSocket（用于配置管理器的远程加载测试）
if (typeof globalThis.WebSocket === 'undefined') {
  globalThis.WebSocket = vi.fn().mockImplementation(() => ({
    close: vi.fn(),
    send: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    readyState: 1, // OPEN
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3
  }))
}

// 在每个测试后重置所有模拟和清理资源
afterEach(() => {
  vi.clearAllMocks()
  
  // 清理可能的内存泄漏
  if (typeof window !== 'undefined') {
    // 清理事件监听器
    const events = ['error', 'unhandledrejection', 'beforeunload']
    events.forEach(event => {
      const listeners = (window as any)._listeners?.[event] || []
      listeners.forEach((listener: any) => {
        window.removeEventListener(event, listener)
      })
    })
  }
})
