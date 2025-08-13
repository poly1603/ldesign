/**
 * @ldesign/router 测试环境配置
 */

import { vi } from 'vitest'

// Mock DOM APIs
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
    replace: vi.fn(),
  },
  writable: true,
})

Object.defineProperty(window, 'history', {
  value: {
    length: 1,
    scrollRestoration: 'auto',
    state: null,
    back: vi.fn(),
    forward: vi.fn(),
    go: vi.fn(),
    pushState: vi.fn(),
    replaceState: vi.fn(),
  },
  writable: true,
})

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
    getEntriesByType: vi.fn(() => []),
    getEntriesByName: vi.fn(() => []),
  },
  writable: true,
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(callback => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock requestIdleCallback
global.requestIdleCallback = vi.fn(callback => {
  return setTimeout(callback, 0)
})

global.cancelIdleCallback = vi.fn(id => {
  clearTimeout(id)
})

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
  writable: true,
})

// Mock console methods to reduce noise in tests
const originalConsole = { ...console }
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
  log: vi.fn(),
}

// Restore console for specific tests if needed
export function restoreConsole() {
  global.console = originalConsole
}

// Mock localStorage and sessionStorage
function createStorageMock() {
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
  value: createStorageMock(),
  writable: true,
})

Object.defineProperty(window, 'sessionStorage', {
  value: createStorageMock(),
  writable: true,
})

// Mock document methods
Object.defineProperty(document, 'createElement', {
  value: vi.fn((tagName: string) => {
    const element = {
      tagName: tagName.toUpperCase(),
      style: {},
      appendChild: vi.fn(),
      removeChild: vi.fn(),
      remove: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      setAttribute: vi.fn(),
      getAttribute: vi.fn(),
      hasAttribute: vi.fn(),
      removeAttribute: vi.fn(),
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
        contains: vi.fn(),
        toggle: vi.fn(),
      },
      textContent: '',
      innerHTML: '',
      id: '',
      className: '',
    }
    return element
  }),
  writable: true,
})

Object.defineProperty(document, 'getElementById', {
  value: vi.fn(() => null),
  writable: true,
})

Object.defineProperty(document, 'head', {
  value: {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
  },
  writable: true,
})

Object.defineProperty(document, 'body', {
  value: {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
  },
  writable: true,
})

// Mock window scroll methods
Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true,
})

Object.defineProperty(window, 'scrollX', {
  value: 0,
  writable: true,
})

Object.defineProperty(window, 'scrollY', {
  value: 0,
  writable: true,
})

// Mock URL constructor
global.URL = class URL {
  href: string
  origin: string
  protocol: string
  host: string
  hostname: string
  port: string
  pathname: string
  search: string
  hash: string

  constructor(url: string, base?: string) {
    // Simple URL parsing for tests
    const [pathAndQuery, hash = ''] = url.split('#')
    const [pathname, search = ''] = pathAndQuery.split('?')

    this.href = url
    this.origin = 'http://localhost:3000'
    this.protocol = 'http:'
    this.host = 'localhost:3000'
    this.hostname = 'localhost'
    this.port = '3000'
    this.pathname = pathname
    this.search = search ? `?${search}` : ''
    this.hash = hash ? `#${hash}` : ''
  }
}

// Mock URLSearchParams
global.URLSearchParams = class URLSearchParams {
  private params: Map<string, string[]> = new Map()

  constructor(init?: string | URLSearchParams | Record<string, string>) {
    if (typeof init === 'string') {
      this.parseString(init)
    } else if (init instanceof URLSearchParams) {
      this.params = new Map(init.params)
    } else if (init && typeof init === 'object') {
      for (const [key, value] of Object.entries(init)) {
        this.params.set(key, [value])
      }
    }
  }

  private parseString(str: string) {
    if (str.startsWith('?')) {
      str = str.slice(1)
    }

    if (!str) return

    const pairs = str.split('&')
    for (const pair of pairs) {
      const [key, value = ''] = pair.split('=').map(decodeURIComponent)
      if (key) {
        if (!this.params.has(key)) {
          this.params.set(key, [])
        }
        this.params.get(key)!.push(value)
      }
    }
  }

  append(name: string, value: string) {
    if (!this.params.has(name)) {
      this.params.set(name, [])
    }
    this.params.get(name)!.push(value)
  }

  delete(name: string) {
    this.params.delete(name)
  }

  get(name: string): string | null {
    const values = this.params.get(name)
    return values && values.length > 0 ? values[0] : null
  }

  getAll(name: string): string[] {
    return this.params.get(name) || []
  }

  has(name: string): boolean {
    return this.params.has(name)
  }

  set(name: string, value: string) {
    this.params.set(name, [value])
  }

  toString(): string {
    const pairs: string[] = []
    for (const [key, values] of this.params) {
      for (const value of values) {
        pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      }
    }
    return pairs.join('&')
  }

  *[Symbol.iterator]() {
    for (const [key, values] of this.params) {
      for (const value of values) {
        yield [key, value]
      }
    }
  }
}

// Export test utilities
export const testUtils = {
  createStorageMock,
  restoreConsole,
}
