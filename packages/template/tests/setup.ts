/**
 * 测试环境设置
 */

import { vi } from 'vitest'

// Restore console after each test
import { afterEach } from 'vitest'

// Setup fake timers for testing
import { beforeEach } from 'vitest'

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
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn(cb => setTimeout(cb, 16)) as any
global.cancelAnimationFrame = vi.fn(id => clearTimeout(id))

// Mock console methods to reduce noise in tests
const originalConsole = { ...console }
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
}

afterEach(() => {
  vi.clearAllMocks()
})

// Mock import.meta.glob for template scanning
vi.mock('import.meta', () => ({
  glob: vi.fn(() => ({})),
}))

// Mock @ldesign/device
vi.mock('@ldesign/device', () => ({
  DeviceDetector: vi.fn().mockImplementation(() => ({
    detect: vi.fn().mockReturnValue('desktop'),
    getCurrentDevice: vi.fn().mockReturnValue('desktop'),
    isMobile: vi.fn().mockReturnValue(false),
    isTablet: vi.fn().mockReturnValue(false),
    isDesktop: vi.fn().mockReturnValue(true),
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  })),
  createDeviceDetector: vi.fn().mockImplementation(() => ({
    detect: vi.fn().mockReturnValue('desktop'),
    getCurrentDevice: vi.fn().mockReturnValue('desktop'),
    isMobile: vi.fn().mockReturnValue(false),
    isTablet: vi.fn().mockReturnValue(false),
    isDesktop: vi.fn().mockReturnValue(true),
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  })),
}))

// Mock Vue components for testing
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue')
  return {
    ...actual,
    defineComponent: vi.fn(options => options),
    ref: vi.fn(value => ({ value })),
    reactive: vi.fn(value => value),
    computed: vi.fn(fn => ({ value: fn() })),
    watch: vi.fn(),
    onMounted: vi.fn(),
    onUnmounted: vi.fn(),
    nextTick: vi.fn().mockResolvedValue(undefined),
  }
})

// Global test utilities
; (global as any).createMockTemplate = (overrides = {}) => ({
  category: 'login',
  device: 'desktop',
  template: 'classic',
  name: 'Classic Login',
  description: 'A classic login template',
  path: '../templates/login/desktop/classic/index.vue',
  componentPath: '../templates/login/desktop/classic/index.vue',
  tags: ['login', 'desktop'],
  recommended: true,
  ...overrides,
})

; (global as any).createMockComponent = () => ({
  name: 'MockComponent',
  setup: () => () => ({ tag: 'div', props: {}, children: 'Mock Component' }),
})

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})
