import { config } from '@vue/test-utils'
import { vi } from 'vitest'
import 'reflect-metadata'

// 全局测试设置
beforeEach(() => {
  // 清理所有模拟
  vi.clearAllMocks()
})

// Vue Test Utils 全局配置
config.global.plugins = []
