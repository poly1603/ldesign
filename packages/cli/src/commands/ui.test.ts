/**
 * UI 命令测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { uiCommand } from './ui.js'

// Mock 依赖
vi.mock('../utils/logger.js', () => ({
  logger: {
    setLevel: vi.fn(),
    withPrefix: vi.fn(() => ({
      info: vi.fn(),
      success: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    }))
  }
}))

vi.mock('../utils/port.js', () => ({
  getAvailablePort: vi.fn().mockResolvedValue(3000),
  formatPortInfo: vi.fn().mockReturnValue({
    port: 3000,
    host: 'localhost',
    url: 'http://localhost:3000',
    localUrl: 'http://localhost:3000'
  })
}))

vi.mock('../server/app.js', () => ({
  createServer: vi.fn().mockResolvedValue({
    listen: vi.fn((port, host, callback) => {
      if (callback) callback()
    }),
    on: vi.fn(),
    close: vi.fn((callback) => {
      if (callback) callback()
    })
  })
}))

vi.mock('open', () => ({
  default: vi.fn().mockResolvedValue(undefined)
}))

describe('UI 命令', () => {
  let originalConsoleLog: typeof console.log
  let originalProcessOn: typeof process.on
  let originalProcessExit: typeof process.exit

  beforeEach(() => {
    originalConsoleLog = console.log
    originalProcessOn = process.on
    originalProcessExit = process.exit
    
    console.log = vi.fn()
    process.on = vi.fn()
    process.exit = vi.fn() as any
  })

  afterEach(() => {
    console.log = originalConsoleLog
    process.on = originalProcessOn
    process.exit = originalProcessExit
    vi.clearAllMocks()
  })

  it('应该能够启动 UI 服务器', async () => {
    const options = {
      port: 3000,
      host: 'localhost',
      open: false
    }

    await expect(uiCommand(options)).resolves.toBeUndefined()
  })

  it('应该能够处理端口被占用的情况', async () => {
    const { getAvailablePort } = await import('../utils/port.js')
    const mockGetAvailablePort = getAvailablePort as any
    mockGetAvailablePort.mockResolvedValueOnce(3001) // 返回不同的端口

    const options = {
      port: 3000,
      host: 'localhost',
      open: false
    }

    await expect(uiCommand(options)).resolves.toBeUndefined()
  })

  it('应该能够处理服务器启动错误', async () => {
    const { createServer } = await import('../server/app.js')
    const mockCreateServer = createServer as any
    mockCreateServer.mockResolvedValueOnce({
      listen: vi.fn((port, host, callback) => {
        // 模拟服务器启动失败
      }),
      on: vi.fn((event, callback) => {
        if (event === 'error') {
          callback(new Error('服务器启动失败'))
        }
      }),
      close: vi.fn()
    })

    const options = {
      port: 3000,
      host: 'localhost',
      open: false
    }

    await expect(uiCommand(options)).rejects.toThrow()
  })

  it('应该能够设置调试模式', async () => {
    const { logger } = await import('../utils/logger.js')
    const mockLogger = logger as any

    const options = {
      port: 3000,
      host: 'localhost',
      open: false,
      debug: true
    }

    await uiCommand(options)

    expect(mockLogger.setLevel).toHaveBeenCalledWith('debug')
  })

  it('应该能够设置静默模式', async () => {
    const { logger } = await import('../utils/logger.js')
    const mockLogger = logger as any

    const options = {
      port: 3000,
      host: 'localhost',
      open: false,
      silent: true
    }

    await uiCommand(options)

    expect(mockLogger.setLevel).toHaveBeenCalledWith('silent')
  })

  it('应该能够自动打开浏览器', async () => {
    const open = await import('open')
    const mockOpen = open.default as any

    const options = {
      port: 3000,
      host: 'localhost',
      open: true
    }

    await uiCommand(options)

    expect(mockOpen).toHaveBeenCalledWith('http://localhost:3000')
  })

  it('应该能够处理浏览器打开失败', async () => {
    const open = await import('open')
    const mockOpen = open.default as any
    mockOpen.mockRejectedValueOnce(new Error('无法打开浏览器'))

    const options = {
      port: 3000,
      host: 'localhost',
      open: true
    }

    // 应该不会抛出错误，只是警告
    await expect(uiCommand(options)).resolves.toBeUndefined()
  })
})
