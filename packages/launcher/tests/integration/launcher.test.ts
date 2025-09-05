/**
 * ViteLauncher 集成测试
 * 
 * 测试 ViteLauncher 的完整工作流程
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ViteLauncher } from '../../src/core/ViteLauncher'
import { LauncherStatus } from '../../src/types'
import type { ViteLauncherConfig } from '../../src/types'

// Mock Vite 模块
const mockViteServer = {
  listen: vi.fn().mockResolvedValue(undefined),
  close: vi.fn().mockResolvedValue(undefined),
  resolvedUrls: {
    local: ['http://localhost:3000'],
    network: ['http://192.168.1.100:3000']
  },
  config: {
    server: {
      host: 'localhost',
      port: 3000,
      https: false
    }
  }
}

const mockBuildResult = {
  output: [
    {
      fileName: 'index.js',
      code: 'console.log("Hello World")',
      isEntry: true
    },
    {
      fileName: 'style.css',
      source: 'body { margin: 0; }'
    }
  ]
}

const mockPreviewServer = {
  close: vi.fn().mockResolvedValue(undefined),
  resolvedUrls: {
    local: ['http://localhost:4173'],
    network: ['http://192.168.1.100:4173']
  }
}

vi.mock('vite', () => ({
  createServer: vi.fn().mockResolvedValue(mockViteServer),
  build: vi.fn().mockResolvedValue(mockBuildResult),
  preview: vi.fn().mockResolvedValue(mockPreviewServer)
}))

// Mock @ldesign/kit 模块
vi.mock('@ldesign/kit', () => ({
  Logger: vi.fn().mockImplementation(() => ({
    info: vi.fn(),
    success: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    setLevel: vi.fn(),
    getLevel: vi.fn().mockReturnValue('info')
  })),
  ErrorHandler: vi.fn().mockImplementation(() => ({
    handle: vi.fn()
  })),
  ConfigManager: vi.fn().mockImplementation(() => ({
    load: vi.fn().mockResolvedValue({}),
    getAll: vi.fn().mockReturnValue({}),
    removeAllListeners: vi.fn()
  })),
  FileSystem: {
    exists: vi.fn().mockResolvedValue(true),
    readFile: vi.fn(),
    writeFile: vi.fn(),
    remove: vi.fn()
  },
  PathUtils: {
    resolve: vi.fn((path) => path),
    join: vi.fn((...paths) => paths.join('/')),
    isAbsolute: vi.fn().mockReturnValue(false)
  }
}))

describe('ViteLauncher 集成测试', () => {
  let launcher: ViteLauncher
  
  beforeEach(() => {
    vi.clearAllMocks()
    
    launcher = new ViteLauncher({
      cwd: '/test/project',
      config: {
        server: {
          port: 3000,
          host: 'localhost'
        }
      }
    })
  })
  
  afterEach(async () => {
    if (launcher) {
      await launcher.destroy()
    }
  })
  
  describe('完整的开发流程', () => {
    it('应该成功启动开发服务器', async () => {
      // 监听状态变化
      const statusChanges: LauncherStatus[] = []
      launcher.on('statusChange', (data) => {
        statusChanges.push(data.to)
      })
      
      // 启动开发服务器
      const server = await launcher.startDev()
      
      // 验证状态变化
      expect(statusChanges).toContain(LauncherStatus.STARTING)
      expect(statusChanges).toContain(LauncherStatus.RUNNING)
      expect(launcher.getStatus()).toBe(LauncherStatus.RUNNING)
      
      // 验证服务器信息
      const serverInfo = launcher.getServerInfo()
      expect(serverInfo).toBeDefined()
      expect(serverInfo?.type).toBe('dev')
      expect(serverInfo?.url).toBe('http://localhost:3000')
      
      // 验证 Vite 服务器被创建和启动
      const { createServer } = await import('vite')
      expect(createServer).toHaveBeenCalled()
      expect(mockViteServer.listen).toHaveBeenCalled()
      
      // 停止服务器
      await launcher.stopDev()
      expect(launcher.getStatus()).toBe(LauncherStatus.IDLE)
      expect(mockViteServer.close).toHaveBeenCalled()
    })
    
    it('应该成功执行构建', async () => {
      // 监听构建事件
      const buildEvents: string[] = []
      launcher.on('buildStart', () => buildEvents.push('start'))
      launcher.on('buildEnd', () => buildEvents.push('end'))
      
      // 执行构建
      const result = await launcher.build({
        build: {
          outDir: 'dist',
          minify: true
        }
      })
      
      // 验证构建事件
      expect(buildEvents).toEqual(['start', 'end'])
      
      // 验证构建结果
      expect(result).toBeDefined()
      expect(result).toBe(mockBuildResult)
      
      // 验证 Vite 构建被调用
      const { build } = await import('vite')
      expect(build).toHaveBeenCalledWith(
        expect.objectContaining({
          build: expect.objectContaining({
            outDir: 'dist',
            minify: true
          })
        })
      )
      
      // 验证统计信息更新
      const stats = launcher.getStats()
      expect(stats.buildCount).toBe(1)
    })
    
    it('应该成功启动预览服务器', async () => {
      // 先执行构建
      await launcher.build()
      
      // 启动预览服务器
      const server = await launcher.preview({
        preview: {
          port: 4173,
          host: 'localhost'
        }
      })
      
      // 验证状态
      expect(launcher.getStatus()).toBe(LauncherStatus.PREVIEWING)
      
      // 验证服务器信息
      const serverInfo = launcher.getServerInfo()
      expect(serverInfo).toBeDefined()
      
      // 验证 Vite 预览被调用
      const { preview } = await import('vite')
      expect(preview).toHaveBeenCalled()
      
      // 停止预览
      await launcher.destroy()
      expect(mockPreviewServer.close).toHaveBeenCalled()
    })
  })
  
  describe('配置管理集成', () => {
    it('应该正确加载和应用配置', async () => {
      const customConfig: ViteLauncherConfig = {
        server: {
          port: 8080,
          host: '0.0.0.0',
          open: true
        },
        build: {
          outDir: 'build',
          sourcemap: true
        }
      }
      
      // 加载配置
      await launcher.loadConfig()
      
      // 应用配置启动服务器
      await launcher.startDev(customConfig)
      
      // 验证配置被正确应用
      const { createServer } = await import('vite')
      expect(createServer).toHaveBeenCalledWith(
        expect.objectContaining({
          server: expect.objectContaining({
            port: 8080,
            host: '0.0.0.0',
            open: true
          })
        })
      )
    })
    
    it('应该正确验证配置', async () => {
      const invalidConfig: ViteLauncherConfig = {
        server: {
          port: 99999 // 无效端口
        }
      }
      
      const validation = launcher.validateConfig(invalidConfig)
      
      expect(validation.valid).toBe(false)
      expect(validation.errors.length).toBeGreaterThan(0)
    })
    
    it('应该正确合并配置', () => {
      const baseConfig: ViteLauncherConfig = {
        server: { port: 3000, host: 'localhost' }
      }
      
      const overrideConfig: ViteLauncherConfig = {
        server: { port: 8080 },
        build: { outDir: 'dist' }
      }
      
      const merged = launcher.mergeConfig(baseConfig, overrideConfig)
      
      expect(merged.server?.port).toBe(8080)
      expect(merged.server?.host).toBe('localhost')
      expect(merged.build?.outDir).toBe('dist')
    })
  })
  
  describe('插件系统集成', () => {
    it('应该正确管理插件', () => {
      const testPlugin = {
        name: 'test-plugin',
        apply: 'build' as const
      }
      
      // 添加插件
      launcher.addPlugin(testPlugin)
      expect(launcher.getPlugins()).toHaveLength(1)
      expect(launcher.getPlugins()[0].name).toBe('test-plugin')
      
      // 移除插件
      launcher.removePlugin('test-plugin')
      expect(launcher.getPlugins()).toHaveLength(0)
    })
    
    it('应该在构建时应用插件', async () => {
      const buildPlugin = {
        name: 'build-plugin',
        apply: 'build' as const,
        config: vi.fn()
      }
      
      launcher.addPlugin(buildPlugin)
      
      await launcher.build()
      
      // 验证插件被应用到构建配置中
      const { build } = await import('vite')
      expect(build).toHaveBeenCalledWith(
        expect.objectContaining({
          plugins: expect.arrayContaining([
            expect.objectContaining({ name: 'build-plugin' })
          ])
        })
      )
    })
  })
  
  describe('事件系统集成', () => {
    it('应该正确触发和处理事件', async () => {
      const events: string[] = []
      
      // 注册事件监听器
      launcher.onReady(() => events.push('ready'))
      launcher.onError(() => events.push('error'))
      launcher.onClose(() => events.push('close'))
      
      launcher.on('buildStart', () => events.push('buildStart'))
      launcher.on('buildEnd', () => events.push('buildEnd'))
      
      // 执行操作触发事件
      await launcher.startDev()
      await launcher.build()
      await launcher.destroy()
      
      // 验证事件被正确触发
      expect(events).toContain('ready')
      expect(events).toContain('buildStart')
      expect(events).toContain('buildEnd')
      expect(events).toContain('close')
    })
  })
  
  describe('错误处理集成', () => {
    it('应该正确处理启动错误', async () => {
      // Mock 启动失败
      const { createServer } = await import('vite')
      vi.mocked(createServer).mockRejectedValueOnce(new Error('启动失败'))
      
      const errorEvents: Error[] = []
      launcher.onError((error) => errorEvents.push(error))
      
      await expect(launcher.startDev()).rejects.toThrow('启动失败')
      
      // 验证错误状态和事件
      expect(launcher.getStatus()).toBe(LauncherStatus.ERROR)
      expect(errorEvents).toHaveLength(1)
      expect(errorEvents[0].message).toBe('启动失败')
      
      // 验证错误统计
      const stats = launcher.getStats()
      expect(stats.errorCount).toBe(1)
    })
    
    it('应该正确处理构建错误', async () => {
      // Mock 构建失败
      const { build } = await import('vite')
      vi.mocked(build).mockRejectedValueOnce(new Error('构建失败'))
      
      const errorEvents: Error[] = []
      launcher.onError((error) => errorEvents.push(error))
      
      await expect(launcher.build()).rejects.toThrow('构建失败')
      
      // 验证错误处理
      expect(errorEvents).toHaveLength(1)
      expect(errorEvents[0].message).toBe('构建失败')
    })
  })
  
  describe('性能监控集成', () => {
    it('应该正确记录性能指标', async () => {
      const startTime = Date.now()
      
      // 执行操作
      await launcher.startDev()
      await launcher.build()
      
      const endTime = Date.now()
      
      // 获取性能指标
      const metrics = launcher.getPerformanceMetrics()
      const stats = launcher.getStats()
      
      // 验证指标记录
      expect(metrics.startupTime).toBeGreaterThan(0)
      expect(metrics.buildTime).toBeGreaterThan(0)
      expect(stats.startCount).toBe(1)
      expect(stats.buildCount).toBe(1)
      expect(stats.lastActivity).toBeGreaterThanOrEqual(startTime)
      expect(stats.lastActivity).toBeLessThanOrEqual(endTime)
    })
  })
  
  describe('资源清理', () => {
    it('应该正确清理所有资源', async () => {
      // 启动各种服务
      await launcher.startDev()
      await launcher.build()
      
      // 销毁实例
      await launcher.destroy()
      
      // 验证状态
      expect(launcher.getStatus()).toBe(LauncherStatus.STOPPED)
      
      // 验证服务器被关闭
      expect(mockViteServer.close).toHaveBeenCalled()
      
      // 验证事件监听器被清理
      expect(launcher.listenerCount('ready')).toBe(0)
      expect(launcher.listenerCount('error')).toBe(0)
      expect(launcher.listenerCount('close')).toBe(0)
    })
  })
})
