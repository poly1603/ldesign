import { vi } from 'vitest'
import 'reflect-metadata'

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
globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver
globalThis.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock console methods to reduce noise in tests
globalThis.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}

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

// Mock requestAnimationFrame
globalThis.requestAnimationFrame = vi.fn(cb => setTimeout(cb, 16))
globalThis.cancelAnimationFrame = vi.fn(id => clearTimeout(id))

// Mock crypto API
Object.defineProperty(window, 'crypto', {
  writable: true,
  value: {
    randomUUID: vi.fn(() => `mock-uuid-${Math.random().toString(36).substr(2, 9)}`),
    getRandomValues: vi.fn(arr => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256)
      }
      return arr
    }),
  },
})

// Mock URL API
globalThis.URL.createObjectURL = vi.fn(() => 'mock-object-url')
globalThis.URL.revokeObjectURL = vi.fn()

// Setup global test utilities
beforeEach(() => {
  vi.clearAllMocks()
  vi.clearAllTimers()
})

afterEach(() => {
  vi.restoreAllMocks()
})
