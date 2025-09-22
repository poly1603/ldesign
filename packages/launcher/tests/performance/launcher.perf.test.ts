/**
 * ViteLauncher 性能测试
 * 
 * 测试 ViteLauncher 的性能表现
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ViteLauncher } from '../../src/core/ViteLauncher'
import { PerformanceMonitor } from '../../src/utils/performance'
import { checkPerformanceWarnings } from '../../src/utils/performance'

// Mock Vite 模块
vi.mock('vite', () => ({
  createServer: vi.fn().mockResolvedValue({
    listen: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
    resolvedUrls: {
      local: ['http://localhost:3000']
    }
  }),
  build: vi.fn().mockResolvedValue({
    output: []
  }),
  preview: vi.fn().mockResolvedValue({
    close: vi.fn().mockResolvedValue(undefined)
  })
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
    writeFile: vi.fn()
  },
  PathUtils: {
    resolve: vi.fn((path) => path),
    join: vi.fn((...paths) => paths.join('/'))
  }
}))

describe('ViteLauncher 性能测试', () => {
  let launcher: ViteLauncher
  let performanceMonitor: PerformanceMonitor
  
  beforeEach(() => {
    vi.clearAllMocks()
    
    launcher = new ViteLauncher({
      cwd: '/test/project'
    })
    
    performanceMonitor = new PerformanceMonitor()
    performanceMonitor.start(100) // 100ms 监控间隔
  })
  
  afterEach(async () => {
    if (launcher) {
      await launcher.destroy()
    }
    
    if (performanceMonitor) {
      performanceMonitor.stop()
    }
  })
  
  describe('启动性能', () => {
    it('应该在合理时间内启动开发服务器', async () => {
      const startTime = Date.now()
      
      await launcher.startDev()
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      // 启动时间应该在 5 秒内
      expect(duration).toBeLessThan(5000)
      
      // 记录性能指标
      performanceMonitor.recordStartupTime()
      const metrics = performanceMonitor.getMetrics()
      
      expect(metrics.startupTime).toBeLessThan(5000)
    })
    
    it('应该在合理时间内完成构建', async () => {
      const startTime = Date.now()
      
      await launcher.build()
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      // 构建时间应该在 30 秒内
      expect(duration).toBeLessThan(30000)
      
      // 记录性能指标
      performanceMonitor.recordBuildTime(duration)
      const metrics = performanceMonitor.getMetrics()
      
      expect(metrics.buildTime).toBeLessThan(30000)
    })
    
    it('应该快速响应配置变更', async () => {
      const startTime = Date.now()
      
      // 模拟配置变更 - 使用现有的配置合并方法
      const newConfig = launcher.mergeConfig(launcher.getConfig(), {
        server: {
          port: 8080
        }
      })
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      // 配置变更响应时间应该在 100ms 内
      expect(duration).toBeLessThan(100)
    })
  })
  
  describe('内存使用', () => {
    it('应该保持合理的内存使用', async () => {
      const initialMemory = process.memoryUsage()
      
      // 执行多次操作
      for (let i = 0; i < 10; i++) {
        await launcher.startDev()
        await launcher.stopDev()
      }
      
      const finalMemory = process.memoryUsage()
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed
      
      // 内存增长应该在合理范围内（50MB）
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024)
      
      // 检查性能监控器的内存指标
      const metrics = performanceMonitor.getMetrics()
      expect(metrics.memory.percentage).toBeLessThan(90) // 内存使用率不应超过 90%
    })
    
    it('应该正确清理内存', async () => {
      const initialMemory = process.memoryUsage()
      
      // 创建多个 launcher 实例
      const launchers: ViteLauncher[] = []
      
      for (let i = 0; i < 5; i++) {
        const launcher = new ViteLauncher({
          cwd: `/test/project${i}`
        })
        launchers.push(launcher)
        await launcher.startDev()
      }
      
      // 销毁所有实例
      for (const launcher of launchers) {
        await launcher.destroy()
      }
      
      // 强制垃圾回收（如果可用）
      if (global.gc) {
        global.gc()
      }
      
      const finalMemory = process.memoryUsage()
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed
      
      // 内存增长应该很小
      expect(memoryIncrease).toBeLessThan(20 * 1024 * 1024)
    })
  })
  
  describe('并发性能', () => {
    it('应该支持并发操作', async () => {
      const startTime = Date.now()
      
      // 并发执行多个操作
      const promises = [
        launcher.loadConfig(),
        launcher.validateConfig({}),
        launcher.mergeConfig({}, {}),
        launcher.getStats(),
        launcher.getPerformanceMetrics()
      ]
      
      await Promise.all(promises)
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      // 并发操作应该快速完成
      expect(duration).toBeLessThan(1000)
    })
    
    it('应该处理多个插件而不影响性能', () => {
      const startTime = Date.now()
      
      // 添加多个插件
      for (let i = 0; i < 100; i++) {
        launcher.addPlugin({
          name: `plugin-${i}`,
          apply: 'build'
        })
      }
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      // 插件添加应该很快
      expect(duration).toBeLessThan(100)
      
      // 验证插件数量
      expect(launcher.getPlugins()).toHaveLength(100)
    })
  })
  
  describe('事件系统性能', () => {
    it('应该高效处理大量事件监听器', () => {
      const startTime = Date.now()
      
      // 添加大量事件监听器
      for (let i = 0; i < 1000; i++) {
        launcher.on('test-event', () => {})
      }
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      // 事件监听器添加应该很快
      expect(duration).toBeLessThan(100)
      
      // 验证监听器数量
      expect(launcher.listenerCount('test-event')).toBe(1000)
    })
    
    it('应该高效触发事件', () => {
      // 添加事件监听器
      let callCount = 0
      for (let i = 0; i < 100; i++) {
        launcher.on('test-event', () => {
          callCount++
        })
      }
      
      const startTime = Date.now()
      
      // 触发事件
      launcher.emit('test-event')
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      // 事件触发应该很快
      expect(duration).toBeLessThan(10)
      expect(callCount).toBe(100)
    })
  })
  
  describe('配置处理性能', () => {
    it('应该快速处理大型配置对象', () => {
      // 创建大型配置对象
      const largeConfig = {
        server: { port: 3000 },
        build: { outDir: 'dist' },
        plugins: Array.from({ length: 1000 }, (_, i) => ({
          name: `plugin-${i}`,
          options: { value: i }
        }))
      }
      
      const startTime = Date.now()
      
      // 验证配置
      const validation = launcher.validateConfig(largeConfig as any)
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      // 配置验证应该很快
      expect(duration).toBeLessThan(100)
      expect(validation).toBeDefined()
    })
    
    it('应该快速合并复杂配置', () => {
      const baseConfig = {
        server: { port: 3000, host: 'localhost' },
        build: { outDir: 'dist', minify: true },
        plugins: Array.from({ length: 100 }, (_, i) => ({ name: `base-plugin-${i}` }))
      }
      
      const overrideConfig = {
        server: { port: 8080 },
        build: { sourcemap: true },
        plugins: Array.from({ length: 100 }, (_, i) => ({ name: `override-plugin-${i}` }))
      }
      
      const startTime = Date.now()
      
      const merged = launcher.mergeConfig(baseConfig as any, overrideConfig as any)
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      // 配置合并应该很快
      expect(duration).toBeLessThan(50)
      expect(merged).toBeDefined()
    })
  })
  
  describe('资源使用监控', () => {
    it('应该监控 CPU 使用率', async () => {
      // 执行一些 CPU 密集型操作
      await launcher.startDev()
      await launcher.build()
      
      const metrics = performanceMonitor.getMetrics()
      
      // CPU 指标应该被记录
      expect(metrics.cpu).toBeDefined()
      expect(typeof metrics.cpu.usage).toBe('number')
      expect(Array.isArray(metrics.cpu.loadAverage)).toBe(true)
    })
    
    it('应该监控事件循环延迟', async () => {
      // 执行一些异步操作
      await Promise.all([
        launcher.loadConfig(),
        launcher.getStats(),
        launcher.getPerformanceMetrics()
      ])
      
      const metrics = performanceMonitor.getMetrics()
      
      // 事件循环延迟应该在合理范围内
      expect(metrics.eventLoopDelay).toBeLessThan(100) // 100ms
    })
  })
  
  describe('性能警告检测', () => {
    it('应该检测性能问题', () => {
      // 模拟高内存使用
      const mockMetrics = {
        memory: { percentage: 95 },
        cpu: { loadAverage: [3, 2, 1] },
        eventLoopDelay: 150,
        gc: { averageTime: 60 }
      }
      
      const warnings = checkPerformanceWarnings(mockMetrics as any)
      
      expect(warnings.length).toBeGreaterThan(0)
      expect(warnings.some(w => w.type === 'memory')).toBe(true)
      expect(warnings.some(w => w.type === 'cpu')).toBe(true)
      expect(warnings.some(w => w.type === 'eventLoop')).toBe(true)
    })
  })
})
