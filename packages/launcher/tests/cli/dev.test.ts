/**
 * Dev 命令测试
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { DevCommand } from '../../src/cli/commands/dev'
import type { CliContext } from '../../src/types'

// Mock ViteLauncher
vi.mock('../../src/core/ViteLauncher', () => ({
  ViteLauncher: vi.fn().mockImplementation(() => ({
    startDev: vi.fn().mockResolvedValue({
      resolvedUrls: {
        local: ['http://localhost:3000']
      }
    }),
    stopDev: vi.fn().mockResolvedValue(undefined),
    destroy: vi.fn().mockResolvedValue(undefined),
    getServerInfo: vi.fn().mockReturnValue({
      type: 'dev',
      url: 'http://localhost:3000',
      host: 'localhost',
      port: 3000,
      https: false,
      startTime: Date.now()
    }),
    onReady: vi.fn(),
    onError: vi.fn(),
    emit: vi.fn()
  }))
}))

// Mock @ldesign/kit
vi.mock('@ldesign/kit', () => ({
  Logger: vi.fn().mockImplementation(() => ({
    info: vi.fn(),
    success: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  }))
}))

// Mock process 事件
const originalProcess = process
const mockProcess = {
  ...originalProcess,
  on: vi.fn(),
  exit: vi.fn()
}

beforeEach(() => {
  global.process = mockProcess as any
})

afterEach(() => {
  global.process = originalProcess
})

describe('DevCommand', () => {
  let devCommand: DevCommand
  let mockContext: CliContext
  
  beforeEach(() => {
    vi.clearAllMocks()
    
    devCommand = new DevCommand()
    
    mockContext = {
      command: 'dev',
      options: {},
      args: [],
      cwd: '/test/project',
      configFile: undefined,
      interactive: true,
      terminal: {
        width: 80,
        height: 24,
        supportsColor: true,
        isTTY: true,
        type: 'xterm',
        supportsUnicode: true
      },
      environment: {
        nodeVersion: 'v18.0.0',
        npmVersion: '8.0.0',
        os: 'linux',
        arch: 'x64',
        memory: 8192,
        env: {}
      }
    }
  })
  
  describe('命令定义', () => {
    it('应该有正确的命令名称和别名', () => {
      expect(devCommand.name).toBe('dev')
      expect(devCommand.aliases).toContain('serve')
      expect(devCommand.aliases).toContain('start')
    })
    
    it('应该有正确的描述和用法', () => {
      expect(devCommand.description).toBe('启动开发服务器')
      expect(devCommand.usage).toBe('launcher dev [options]')
    })
    
    it('应该定义正确的选项', () => {
      expect(devCommand.options).toBeDefined()
      expect(devCommand.options.length).toBeGreaterThan(0)
      
      const portOption = devCommand.options.find(opt => opt.name === 'port')
      expect(portOption).toBeDefined()
      expect(portOption?.type).toBe('number')
      
      const hostOption = devCommand.options.find(opt => opt.name === 'host')
      expect(hostOption).toBeDefined()
      expect(hostOption?.type).toBe('string')
    })
    
    it('应该有使用示例', () => {
      expect(devCommand.examples).toBeDefined()
      expect(devCommand.examples.length).toBeGreaterThan(0)
    })
  })
  
  describe('参数验证', () => {
    it('应该验证有效的端口号', () => {
      const context = {
        ...mockContext,
        options: { port: 3000 }
      }
      
      const result = devCommand.validate(context)
      expect(result).toBe(true)
    })
    
    it('应该拒绝无效的端口号', () => {
      const context = {
        ...mockContext,
        options: { port: 99999 }
      }
      
      const result = devCommand.validate(context)
      expect(typeof result).toBe('string')
      expect(result).toContain('端口号必须是 1-65535 之间的数字')
    })
    
    it('应该验证主机地址类型', () => {
      const context = {
        ...mockContext,
        options: { host: 123 }
      }
      
      const result = devCommand.validate(context)
      expect(typeof result).toBe('string')
      expect(result).toContain('主机地址必须是字符串')
    })
    
    it('应该接受有效的主机地址', () => {
      const validHosts = ['localhost', '0.0.0.0', '127.0.0.1']
      
      for (const host of validHosts) {
        const context = {
          ...mockContext,
          options: { host }
        }
        
        const result = devCommand.validate(context)
        expect(result).toBe(true)
      }
    })
  })
  
  describe('命令执行', () => {
    it('应该成功启动开发服务器', async () => {
      const context = {
        ...mockContext,
        options: {
          port: 3000,
          host: 'localhost'
        }
      }
      
      // Mock ViteLauncher 实例
      const { ViteLauncher } = await import('../../src/core/ViteLauncher')
      const mockLauncher = new ViteLauncher()
      
      // 执行命令（注意：这个测试可能需要调整，因为实际的 handler 会启动一个持续运行的进程）
      const handlerPromise = devCommand.handler(context)
      
      // 验证 ViteLauncher 被正确创建
      expect(ViteLauncher).toHaveBeenCalledWith(
        expect.objectContaining({
          cwd: context.cwd,
          config: expect.objectContaining({
            server: expect.objectContaining({
              host: 'localhost',
              port: 3000
            })
          })
        })
      )
      
      // 验证启动方法被调用
      expect(mockLauncher.startDev).toHaveBeenCalled()
      
      // 由于 dev 命令会持续运行，我们需要手动停止测试
      // 在实际测试中，可能需要使用超时或其他机制
    })
    
    it('应该正确处理配置选项', async () => {
      const context = {
        ...mockContext,
        options: {
          port: 8080,
          host: '0.0.0.0',
          open: true,
          https: true,
          force: true,
          cors: false
        }
      }
      
      const { ViteLauncher } = await import('../../src/core/ViteLauncher')
      
      await devCommand.handler(context)
      
      expect(ViteLauncher).toHaveBeenCalledWith(
        expect.objectContaining({
          config: expect.objectContaining({
            server: expect.objectContaining({
              host: '0.0.0.0',
              port: 8080,
              open: true,
              https: true,
              cors: false
            }),
            optimizeDeps: expect.objectContaining({
              force: true
            })
          })
        })
      )
    })
    
    it('应该注册进程退出处理器', async () => {
      const context = {
        ...mockContext,
        options: {}
      }
      
      await devCommand.handler(context)
      
      // 验证进程事件监听器被注册
      expect(mockProcess.on).toHaveBeenCalledWith('SIGINT', expect.any(Function))
      expect(mockProcess.on).toHaveBeenCalledWith('SIGTERM', expect.any(Function))
    })
    
    it('应该正确设置事件监听器', async () => {
      const context = {
        ...mockContext,
        options: {}
      }
      
      const { ViteLauncher } = await import('../../src/core/ViteLauncher')
      const mockLauncher = new ViteLauncher()
      
      await devCommand.handler(context)
      
      // 验证事件监听器被设置
      expect(mockLauncher.onReady).toHaveBeenCalled()
      expect(mockLauncher.onError).toHaveBeenCalled()
    })
  })
  
  describe('错误处理', () => {
    it('应该处理启动失败的情况', async () => {
      const context = {
        ...mockContext,
        options: {}
      }
      
      // Mock 启动失败
      const { ViteLauncher } = await import('../../src/core/ViteLauncher')
      const mockLauncher = new ViteLauncher()
      vi.mocked(mockLauncher.startDev).mockRejectedValue(new Error('启动失败'))
      
      await expect(devCommand.handler(context)).rejects.toThrow('启动失败')
      
      // 验证进程退出
      expect(mockProcess.exit).toHaveBeenCalledWith(1)
    })
    
    it('应该提供端口占用的解决建议', async () => {
      const context = {
        ...mockContext,
        options: { debug: true }
      }
      
      const { ViteLauncher } = await import('../../src/core/ViteLauncher')
      const mockLauncher = new ViteLauncher()
      vi.mocked(mockLauncher.startDev).mockRejectedValue(new Error('EADDRINUSE: port 3000'))
      
      const { Logger } = await import('@ldesign/kit')
      const mockLogger = new Logger()
      
      await expect(devCommand.handler(context)).rejects.toThrow()
      
      // 验证提供了解决建议
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('端口可能被占用')
      )
    })
    
    it('应该提供配置文件问题的解决建议', async () => {
      const context = {
        ...mockContext,
        options: { debug: true }
      }
      
      const { ViteLauncher } = await import('../../src/core/ViteLauncher')
      const mockLauncher = new ViteLauncher()
      vi.mocked(mockLauncher.startDev).mockRejectedValue(new Error('config file not found'))
      
      const { Logger } = await import('@ldesign/kit')
      const mockLogger = new Logger()
      
      await expect(devCommand.handler(context)).rejects.toThrow()
      
      // 验证提供了解决建议
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('配置文件问题')
      )
    })
  })
  
  describe('调试模式', () => {
    it('应该在调试模式下显示详细错误信息', async () => {
      const context = {
        ...mockContext,
        options: { debug: true }
      }
      
      const testError = new Error('测试错误')
      testError.stack = 'Error stack trace'
      
      const { ViteLauncher } = await import('../../src/core/ViteLauncher')
      const mockLauncher = new ViteLauncher()
      vi.mocked(mockLauncher.startDev).mockRejectedValue(testError)
      
      // Mock console.error
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      await expect(devCommand.handler(context)).rejects.toThrow()
      
      // 验证显示了堆栈跟踪
      expect(consoleSpy).toHaveBeenCalledWith(testError.stack)
      
      consoleSpy.mockRestore()
    })
  })
})
