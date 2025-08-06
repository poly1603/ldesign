import { config } from '@vue/test-utils'
import { vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import 'reflect-metadata'

// 全局测试设置
beforeEach(() => {
  // 清理所有模拟
  vi.clearAllMocks()

  // 为每个测试创建新的 Pinia 实例
  const pinia = createPinia()
  setActivePinia(pinia)
})

// Vue Test Utils 全局配置
config.global.plugins = []
