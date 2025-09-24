/**
 * 测试环境设置
 */

import { vi } from 'vitest'

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((callback) => {
  return setTimeout(callback, 16)
})

global.cancelAnimationFrame = vi.fn((id) => {
  clearTimeout(id)
})

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
global.URL.revokeObjectURL = vi.fn()

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
  log: vi.fn()
}

// Setup DOM environment
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024
})

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 768
})

Object.defineProperty(window, 'devicePixelRatio', {
  writable: true,
  configurable: true,
  value: 1
})

// Mock CSS supports
Object.defineProperty(window, 'CSS', {
  value: {
    supports: vi.fn(() => true)
  }
})

// Mock getComputedStyle
window.getComputedStyle = vi.fn(() => ({
  getPropertyValue: vi.fn(() => ''),
  width: '100px',
  height: '100px'
})) as any

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock MutationObserver
global.MutationObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  takeRecords: vi.fn()
}))

// Mock performance
Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByName: vi.fn(() => []),
    getEntriesByType: vi.fn(() => [])
  }
})

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(() => null)
  }
})

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(() => null)
  }
})

// Mock navigator
Object.defineProperty(window, 'navigator', {
  value: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    platform: 'Win32',
    language: 'en-US',
    languages: ['en-US', 'en'],
    onLine: true,
    cookieEnabled: true,
    clipboard: {
      writeText: vi.fn(),
      readText: vi.fn()
    }
  }
})

// Mock document.elementFromPoint
document.elementFromPoint = vi.fn(() => null)

// Mock document.elementsFromPoint
document.elementsFromPoint = vi.fn(() => [])

// Mock document.createRange
document.createRange = vi.fn(() => ({
  setStart: vi.fn(),
  setEnd: vi.fn(),
  collapse: vi.fn(),
  selectNode: vi.fn(),
  selectNodeContents: vi.fn(),
  getBoundingClientRect: vi.fn(() => ({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  })),
  getClientRects: vi.fn(() => [])
}))

// Mock Selection API
Object.defineProperty(window, 'getSelection', {
  value: vi.fn(() => ({
    removeAllRanges: vi.fn(),
    addRange: vi.fn(),
    toString: vi.fn(() => ''),
    rangeCount: 0
  }))
})

// Mock focus and blur methods
HTMLElement.prototype.focus = vi.fn()
HTMLElement.prototype.blur = vi.fn()
HTMLElement.prototype.scrollIntoView = vi.fn()

// Mock dataset
Object.defineProperty(HTMLElement.prototype, 'dataset', {
  value: {},
  writable: true
})

// Mock offsetWidth and offsetHeight
Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
  get() {
    return parseInt(this.style.width) || 0
  }
})

Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
  get() {
    return parseInt(this.style.height) || 0
  }
})

// Mock clientWidth and clientHeight
Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
  get() {
    return parseInt(this.style.width) || 0
  }
})

Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
  get() {
    return parseInt(this.style.height) || 0
  }
})

// Mock scrollWidth and scrollHeight
Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
  get() {
    return parseInt(this.style.width) || 0
  }
})

Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
  get() {
    return parseInt(this.style.height) || 0
  }
})

// Mock getBoundingClientRect for all elements
HTMLElement.prototype.getBoundingClientRect = vi.fn(() => ({
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  top: 0,
  right: 100,
  bottom: 100,
  left: 0,
  toJSON: () => ({})
}))

// Mock addEventListener and removeEventListener
const originalAddEventListener = HTMLElement.prototype.addEventListener
const originalRemoveEventListener = HTMLElement.prototype.removeEventListener

HTMLElement.prototype.addEventListener = vi.fn(originalAddEventListener)
HTMLElement.prototype.removeEventListener = vi.fn(originalRemoveEventListener)

// Mock window events
window.addEventListener = vi.fn()
window.removeEventListener = vi.fn()
document.addEventListener = vi.fn()
document.removeEventListener = vi.fn()

// Setup cleanup after each test
afterEach(() => {
  vi.clearAllMocks()
  document.body.innerHTML = ''
})