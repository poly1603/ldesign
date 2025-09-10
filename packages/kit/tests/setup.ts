/**
 * Vitest 测试环境设置
 */

import { vi } from 'vitest'

// 设置测试超时时间（Vitest 通过配置文件设置）

// 模拟环境变量
process.env.NODE_ENV = 'test'
process.env.LOG_LEVEL = 'error'

// 全局测试工具
global.testUtils = {
  // 创建临时目录
  createTempDir: () => {
    const fs = require('node:fs')
    const os = require('node:os')
    const path = require('node:path')

    const tempDir = path.join(
      os.tmpdir(),
      `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    )
    fs.mkdirSync(tempDir, { recursive: true })

    return tempDir
  },

  // 清理临时目录
  cleanupTempDir: (dir: string) => {
    const fs = require('node:fs')
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true })
    }
  },

  // 等待指定时间
  sleep: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  // 创建模拟数据
  createMockData: (type: string, count: number = 1) => {
    const mockData: Record<string, any> = {
      user: {
        id: Math.floor(Math.random() * 1000),
        name: `User ${Math.floor(Math.random() * 100)}`,
        email: `user${Math.floor(Math.random() * 100)}@example.com`,
        createdAt: new Date().toISOString(),
      },
      product: {
        id: Math.floor(Math.random() * 1000),
        name: `Product ${Math.floor(Math.random() * 100)}`,
        price: Math.floor(Math.random() * 1000),
        category: 'electronics',
      },
      order: {
        id: Math.floor(Math.random() * 1000),
        userId: Math.floor(Math.random() * 100),
        total: Math.floor(Math.random() * 1000),
        status: 'pending',
      },
    }

    if (count === 1) {
      return mockData[type] || {}
    }

    return Array.from({ length: count }, () => ({
      ...mockData[type],
      id: Math.floor(Math.random() * 1000),
    }))
  },
}

// 声明全局类型
declare global {
  var testUtils: {
    createTempDir(): string
    cleanupTempDir(dir: string): void
    sleep(ms: number): Promise<void>
    createMockData(type: string, count?: number): any
  }
}

// 测试前后钩子
beforeEach(() => {
  // 清理控制台输出（避免测试时的日志干扰）
  vi.spyOn(console, 'log').mockImplementation(() => { })
  vi.spyOn(console, 'warn').mockImplementation(() => { })
  vi.spyOn(console, 'error').mockImplementation(() => { })
})

afterEach(() => {
  // 恢复控制台输出
  vi.restoreAllMocks()
})

// 全局错误处理
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
})
