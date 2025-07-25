import { vi } from 'vitest'

// Mock window.matchMedia
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

// Mock requestAnimationFrame
globalThis.requestAnimationFrame = vi.fn(cb => setTimeout(cb, 0))
globalThis.cancelAnimationFrame = vi.fn(id => clearTimeout(id))

// Mock console methods in test environment
const nodeEnv = typeof process !== 'undefined' ? process.env.NODE_ENV : 'test'
if (nodeEnv === 'test') {
  globalThis.console = {
    ...console,
    warn: vi.fn(),
    error: vi.fn(),
  }
}
