/**
 * 测试工具设置文件
 */

import { vi } from 'vitest'

// Mock Vue
vi.mock('vue', () => ({
  ref: vi.fn((value) => ({ value })),
  reactive: vi.fn((obj) => obj),
  computed: vi.fn((fn) => ({ value: fn() })),
  watch: vi.fn(),
  watchEffect: vi.fn(),
  onMounted: vi.fn(),
  onUnmounted: vi.fn(),
  nextTick: vi.fn(() => Promise.resolve()),
  defineComponent: vi.fn((options) => options),
  createApp: vi.fn(() => ({
    mount: vi.fn(),
    unmount: vi.fn(),
    use: vi.fn()
  })),
  h: vi.fn(),
  Fragment: 'Fragment',
  Teleport: 'Teleport',
  Suspense: 'Suspense'
}))

// Mock DOM APIs
Object.defineProperty(global, 'window', {
  value: {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
    location: {
      href: 'http://localhost:3000',
      origin: 'http://localhost:3000',
      pathname: '/',
      search: '',
      hash: ''
    },
    history: {
      pushState: vi.fn(),
      replaceState: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      go: vi.fn()
    },
    performance: {
      now: vi.fn(() => Date.now()),
      memory: {
        usedJSHeapSize: 50 * 1024 * 1024,
        totalJSHeapSize: 100 * 1024 * 1024,
        jsHeapSizeLimit: 200 * 1024 * 1024
      }
    },
    requestIdleCallback: vi.fn((callback) => setTimeout(callback, 0)),
    cancelIdleCallback: vi.fn(),
    IntersectionObserver: vi.fn(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn()
    })),
    ResizeObserver: vi.fn(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn()
    })),
    MutationObserver: vi.fn(() => ({
      observe: vi.fn(),
      disconnect: vi.fn()
    }))
  },
  writable: true
})

Object.defineProperty(global, 'document', {
  value: {
    createElement: vi.fn(() => ({
      setAttribute: vi.fn(),
      getAttribute: vi.fn(),
      appendChild: vi.fn(),
      removeChild: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      style: {},
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
        contains: vi.fn(),
        toggle: vi.fn()
      }
    })),
    getElementById: vi.fn(),
    querySelector: vi.fn(),
    querySelectorAll: vi.fn(() => []),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    body: {
      appendChild: vi.fn(),
      removeChild: vi.fn()
    },
    head: {
      appendChild: vi.fn(),
      removeChild: vi.fn()
    }
  },
  writable: true
})

// Mock console methods
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  debug: vi.fn()
}

// Mock import.meta
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      env: {
        DEV: true,
        PROD: false,
        MODE: 'test'
      }
    }
  },
  writable: true
})

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob())
  } as Response)
)

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
}

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
})

// Mock sessionStorage
Object.defineProperty(global, 'sessionStorage', {
  value: localStorageMock,
  writable: true
})

// Mock URL
global.URL = class URL {
  constructor(public href: string, base?: string) {
    this.href = base ? new URL(href, base).href : href
  }
  
  toString() {
    return this.href
  }
} as any

// Mock URLSearchParams
global.URLSearchParams = class URLSearchParams {
  private params = new Map<string, string>()
  
  constructor(init?: string | URLSearchParams | Record<string, string>) {
    if (typeof init === 'string') {
      // Parse query string
      const pairs = init.replace(/^\?/, '').split('&')
      for (const pair of pairs) {
        const [key, value] = pair.split('=')
        if (key) {
          this.params.set(decodeURIComponent(key), decodeURIComponent(value || ''))
        }
      }
    }
  }
  
  get(name: string) {
    return this.params.get(name)
  }
  
  set(name: string, value: string) {
    this.params.set(name, value)
  }
  
  has(name: string) {
    return this.params.has(name)
  }
  
  delete(name: string) {
    this.params.delete(name)
  }
  
  toString() {
    const pairs: string[] = []
    for (const [key, value] of this.params) {
      pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    }
    return pairs.join('&')
  }
} as any

export {}
