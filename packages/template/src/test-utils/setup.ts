import { beforeEach, vi } from 'vitest'
import { config } from '@vue/test-utils'
import '@testing-library/jest-dom'
import { h, Fragment } from 'vue'

// 全局 JSX 支持
global.h = h
global.Fragment = Fragment

// 全局测试配置
beforeEach(() => {
  // 清理所有 mock
  vi.clearAllMocks()

  // 重置 DOM
  document.body.innerHTML = ''

  // 清理定时器
  vi.clearAllTimers()
})

// Vue Test Utils 全局配置
config.global.stubs = {
  // 默认存根组件
  transition: false,
  'transition-group': false,
}

config.global.mocks = {
  // 全局 mock 方法
  $t: (key: string) => key, // i18n mock
}

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
global.requestAnimationFrame = vi.fn(cb => setTimeout(cb, 16))
global.cancelAnimationFrame = vi.fn(id => clearTimeout(id))

// 模拟 getComputedStyle
global.getComputedStyle = vi.fn(() => ({
  getPropertyValue: vi.fn(() => ''),
  setProperty: vi.fn(),
  removeProperty: vi.fn(),
}))

// 模拟 CSS 动画事件
const mockAnimationEvent = (type: string) => {
  return class MockAnimationEvent extends Event {
    animationName: string
    elapsedTime: number
    pseudoElement: string

    constructor(eventType: string, eventInitDict?: any) {
      super(eventType, eventInitDict)
      this.animationName = eventInitDict?.animationName || ''
      this.elapsedTime = eventInitDict?.elapsedTime || 0
      this.pseudoElement = eventInitDict?.pseudoElement || ''
    }
  }
}

global.AnimationEvent = mockAnimationEvent('animationend')

// 模拟 CSS 过渡事件
const mockTransitionEvent = (type: string) => {
  return class MockTransitionEvent extends Event {
    propertyName: string
    elapsedTime: number
    pseudoElement: string

    constructor(eventType: string, eventInitDict?: any) {
      super(eventType, eventInitDict)
      this.propertyName = eventInitDict?.propertyName || ''
      this.elapsedTime = eventInitDict?.elapsedTime || 0
      this.pseudoElement = eventInitDict?.pseudoElement || ''
    }
  }
}

global.TransitionEvent = mockTransitionEvent('transitionend')

// 模拟 console 方法（避免测试时输出过多日志）
const originalConsole = { ...console }
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
}

// 在需要时恢复原始 console
export const restoreConsole = () => {
  global.console = originalConsole
}

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
  writable: true,
})

// 模拟 sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
  writable: true,
})

// 设置测试环境变量
process.env.NODE_ENV = 'test'
process.env.VITEST = 'true'
