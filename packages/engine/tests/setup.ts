import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// 全局测试配置
config.global.plugins = []

// Mock console methods for testing
global.console = {
  ...console,
  // 在测试中静默某些日志
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
}

// Mock performance API
Object.defineProperty(global, 'performance', {
  value: {
    now: vi.fn(() => Date.now())
  }
})

// Mock requestAnimationFrame
Object.defineProperty(global, 'requestAnimationFrame', {
  value: vi.fn((cb: FrameRequestCallback) => {
    return setTimeout(cb, 16)
  })
})

Object.defineProperty(global, 'cancelAnimationFrame', {
  value: vi.fn((id: number) => {
    clearTimeout(id)
  })
})