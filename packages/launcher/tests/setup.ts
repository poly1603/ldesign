/**
 * Vitest 测试设置文件
 * 
 * 在所有测试运行前执行的设置代码
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { vi } from 'vitest'

// 设置测试环境变量
process.env.NODE_ENV = 'test'
process.env.LAUNCHER_TEST = 'true'

// 模拟全局对象
global.__TEST__ = true
global.__VERSION__ = '1.0.0'

// 设置默认超时时间
vi.setConfig({
  testTimeout: 30000,
  hookTimeout: 30000
})

// 模拟 console 方法（可选）
const originalConsole = global.console

beforeEach(() => {
  // 在每个测试前重置 console mock
  global.console = {
    ...originalConsole,
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn()
  }
})

afterEach(() => {
  // 在每个测试后恢复 console
  global.console = originalConsole
  
  // 清理所有 mock
  vi.clearAllMocks()
})

// 全局测试钩子
beforeAll(async () => {
  // 在所有测试开始前执行
  console.log('🧪 开始运行测试套件')
})

afterAll(async () => {
  // 在所有测试结束后执行
  console.log('✅ 测试套件运行完成')
})

// 处理未捕获的异常
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise 拒绝:', reason)
  console.error('Promise:', promise)
})

process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error)
})

// 扩展 expect 匹配器（如果需要）
expect.extend({
  // 自定义匹配器可以在这里添加
})
