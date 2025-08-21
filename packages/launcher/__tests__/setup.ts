import { vi } from 'vitest'

// 全局测试设置
beforeAll(() => {
  // 设置测试环境变量
  process.env.NODE_ENV = 'test'

  // 模拟控制台方法以避免测试输出
  vi.spyOn(console, 'log').mockImplementation(() => { })
  vi.spyOn(console, 'warn').mockImplementation(() => { })
  vi.spyOn(console, 'error').mockImplementation(() => { })
})

afterAll(() => {
  // 清理模拟
  vi.restoreAllMocks()
})

// 全局测试超时设置
vi.setConfig({
  testTimeout: 10000,
})
