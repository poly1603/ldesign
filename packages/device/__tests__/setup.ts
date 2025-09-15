/**
 * 测试环境配置文件
 *
 * 为 Vitest 测试环境提供必要的全局配置和模拟
 */

import { vi } from 'vitest'

// 模拟浏览器环境的全局对象
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

// 模拟 navigator 对象
Object.defineProperty(window, 'navigator', {
  writable: true,
  value: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    platform: 'Win32',
    language: 'zh-CN',
    languages: ['zh-CN', 'zh', 'en'],
    onLine: true,
    cookieEnabled: true,
    maxTouchPoints: 0, // 默认为非触摸设备
    geolocation: {
      getCurrentPosition: vi.fn(),
      watchPosition: vi.fn(),
      clearWatch: vi.fn(),
    },
    // 模拟电池 API
    getBattery: vi.fn().mockResolvedValue({
      level: 0.8,
      charging: false,
      chargingTime: Infinity,
      dischargingTime: 3600,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  },
})

// 模拟 screen 对象
Object.defineProperty(window, 'screen', {
  writable: true,
  value: {
    width: 1920,
    height: 1080,
    availWidth: 1920,
    availHeight: 1040,
    colorDepth: 24,
    pixelDepth: 24,
    orientation: {
      angle: 0,
      type: 'landscape-primary',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    },
  },
})

// 模拟 window 尺寸
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1920,
})

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 1080,
})

// 模拟 devicePixelRatio
Object.defineProperty(window, 'devicePixelRatio', {
  writable: true,
  configurable: true,
  value: 1,
})

// 模拟触摸事件支持 - 删除 ontouchstart 属性以确保非触摸设备
if ('ontouchstart' in window) {
  delete (window as any).ontouchstart
}

// 模拟网络连接 API
Object.defineProperty(navigator, 'connection', {
  writable: true,
  configurable: true,
  value: {
    effectiveType: '4g',
    downlink: 10,
    rtt: 100,
    saveData: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
})

// 模拟 localStorage 和 sessionStorage
function createStorage() {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    get length() {
      return Object.keys(store).length
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
  }
}

Object.defineProperty(window, 'localStorage', {
  value: createStorage(),
})

Object.defineProperty(window, 'sessionStorage', {
  value: createStorage(),
})

// 模拟 requestAnimationFrame 和 cancelAnimationFrame
globalThis.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
  return setTimeout(() => callback(Date.now()), 16) as unknown as number
})

globalThis.cancelAnimationFrame = vi.fn((id: number) => {
  clearTimeout(id)
})

// 模拟 performance API
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

// 设置测试超时时间
vi.setConfig({
  testTimeout: 30000, // 增加到30秒
  hookTimeout: 30000, // 增加钩子超时时间
})
