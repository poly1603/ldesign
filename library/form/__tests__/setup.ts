/**
 * @ldesign/form 测试设置文件
 */

import { vi } from 'vitest'

// 设置全局测试环境
global.console = {
  ...console,
  // 在测试中静默一些日志
  warn: vi.fn(),
  error: vi.fn(),
}

// 模拟DOM环境
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => '',
  }),
})

// 模拟ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() { }
  unobserve() { }
  disconnect() { }
}

// 模拟Canvas
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    measureText: vi.fn(() => ({ width: 100 })),
    font: '',
  }))
}
