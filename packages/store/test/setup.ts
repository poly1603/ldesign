import { config } from '@vue/test-utils'
import { createPinia, getActivePinia, setActivePinia } from 'pinia'
import { vi } from 'vitest'
import 'reflect-metadata'

// 创建全局 Pinia 实例
const pinia = createPinia()
setActivePinia(pinia)

// 全局测试设置
beforeEach(() => {
  // 清理所有模拟
  vi.clearAllMocks()

  // 确保 Pinia 实例存在
  if (!getActivePinia()) {
    setActivePinia(pinia)
  }
})

// Vue Test Utils 全局配置
config.global.plugins = [pinia]

// 模拟浏览器环境
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
})

Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
})

// 模拟 URL.createObjectURL
Object.defineProperty(URL, 'createObjectURL', {
  value: vi.fn(() => 'blob:mock-url'),
  writable: true,
})

// 模拟 FileReader
globalThis.FileReader = class {
  readAsText = vi.fn()
  result = ''
  onload = null
  onerror = null
} as any
