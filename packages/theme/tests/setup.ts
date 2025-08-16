/**
 * @ldesign/theme - 测试设置
 *
 * 配置测试环境和全局设置
 */

import { config } from '@vue/test-utils'
import { vi } from 'vitest'

// 模拟浏览器 API
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
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// 模拟 IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// 模拟 requestAnimationFrame
global.requestAnimationFrame = vi.fn().mockImplementation((cb) => {
  return setTimeout(cb, 16)
})

global.cancelAnimationFrame = vi.fn().mockImplementation((id) => {
  clearTimeout(id)
})

// 模拟 performance
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

// 模拟 fetch
global.fetch = vi.fn()

// 模拟 CSS 动画 API
global.Animation = vi.fn().mockImplementation(() => ({
  play: vi.fn(),
  pause: vi.fn(),
  cancel: vi.fn(),
  finish: vi.fn(),
  reverse: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  currentTime: 0,
  playState: 'idle',
}))

// 模拟 Element.animate
Element.prototype.animate = vi.fn().mockImplementation(() => ({
  play: vi.fn(),
  pause: vi.fn(),
  cancel: vi.fn(),
  finish: vi.fn(),
  reverse: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  currentTime: 0,
  playState: 'idle',
}))

// 配置 Vue Test Utils
config.global.stubs = {
  'transition': false,
  'transition-group': false,
}

// 全局测试工具
export function createMockElement(tag = 'div', attributes = {}) {
  const element = document.createElement(tag)
  Object.assign(element, attributes)
  return element
}

export function createMockThemeConfig(overrides = {}) {
  return {
    name: 'test-theme',
    displayName: '测试主题',
    description: '用于测试的主题',
    category: 'custom' as const,
    version: '1.0.0',
    author: 'Test',
    colors: {
      name: 'test-colors',
      displayName: '测试配色',
      light: {
        primary: '#007bff',
        secondary: '#6c757d',
        accent: '#28a745',
        background: '#ffffff',
        surface: '#f8f9fa',
        text: '#212529',
        textSecondary: '#6c757d',
        border: '#dee2e6',
        success: '#28a745',
        warning: '#ffc107',
        error: '#dc3545',
        info: '#17a2b8',
      },
      dark: {
        primary: '#0d6efd',
        secondary: '#6c757d',
        accent: '#198754',
        background: '#212529',
        surface: '#343a40',
        text: '#ffffff',
        textSecondary: '#adb5bd',
        border: '#495057',
        success: '#198754',
        warning: '#ffc107',
        error: '#dc3545',
        info: '#0dcaf0',
      },
    },
    decorations: [],
    animations: [],
    resources: {
      images: {},
      icons: {},
    },
    tags: ['test'],
    ...overrides,
  }
}

export function createMockDecorationConfig(overrides = {}) {
  return {
    id: 'test-decoration',
    name: '测试装饰',
    type: 'icon' as const,
    src: '/test-icon.svg',
    position: {
      type: 'fixed' as const,
      position: { x: '10px', y: '10px' },
      anchor: 'top-left' as const,
    },
    style: {
      size: { width: '20px', height: '20px' },
      opacity: 1,
      zIndex: 1000,
    },
    interactive: false,
    responsive: true,
    ...overrides,
  }
}

export function createMockAnimationConfig(overrides = {}) {
  return {
    name: 'test-animation',
    type: 'css' as const,
    duration: 1000,
    iterations: 1,
    keyframes: [
      {
        offset: 0,
        properties: { opacity: 0 },
      },
      {
        offset: 1,
        properties: { opacity: 1 },
      },
    ],
    ...overrides,
  }
}

// 测试辅助函数
export function waitForNextTick() {
  return new Promise(resolve => setTimeout(resolve, 0))
}

export function waitForAnimation(duration = 100) {
  return new Promise(resolve => setTimeout(resolve, duration))
}

export function mockConsole() {
  const originalConsole = { ...console }

  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  return originalConsole
}

// 清理函数
export function cleanup() {
  // 清理 DOM
  document.body.innerHTML = ''

  // 清理定时器
  vi.clearAllTimers()

  // 清理模拟
  vi.clearAllMocks()
}
