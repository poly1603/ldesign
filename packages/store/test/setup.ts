import 'reflect-metadata'
import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// 全局测试设置
beforeEach(() => {
  // 清理所有模拟
  vi.clearAllMocks()
})

// Vue Test Utils 全局配置
config.global.plugins = []
