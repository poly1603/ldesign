import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ModuleLoader } from '../../src/core/ModuleLoader'

// 模拟模块
const mockModule = {
  init: vi.fn(),
  destroy: vi.fn().mockResolvedValue(undefined),
  on: vi.fn(),
  off: vi.fn(),
  removeAllListeners: vi.fn(),
  getData: vi.fn().mockReturnValue({}),
}

// 模拟模块构造函数
vi.mock('../../src/modules/NetworkModule', () => ({
  NetworkModule: vi.fn(() => ({ ...mockModule })),
}))

vi.mock('../../src/modules/BatteryModule', () => ({
  BatteryModule: vi.fn(() => ({ ...mockModule })),
}))

vi.mock('../../src/modules/GeolocationModule', () => ({
  GeolocationModule: vi.fn(() => ({ ...mockModule })),
}))

describe('moduleLoader', () => {
  let moduleLoader: ModuleLoader

  beforeEach(() => {
    moduleLoader = new ModuleLoader()
    vi.clearAllMocks()
    // 重置mock的默认行为
    mockModule.init.mockResolvedValue(undefined)
    mockModule.destroy.mockResolvedValue(undefined)
    mockModule.getData.mockReturnValue({})
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('模块加载', () => {
    it('应该成功加载网络模块', async () => {
      const module = await moduleLoader.loadModuleInstance('network')

      expect(module).toBeDefined()
      expect(module.init).toHaveBeenCalled()
    })

    it('应该成功加载电池模块', async () => {
      const module = await moduleLoader.loadModuleInstance('battery')

      expect(module).toBeDefined()
      expect(module.init).toHaveBeenCalled()
    })

    it('应该成功加载地理位置模块', async () => {
      const module = await moduleLoader.loadModuleInstance('geolocation')

      expect(module).toBeDefined()
      expect(module.init).toHaveBeenCalled()
    })

    it('应该缓存已加载的模块', async () => {
      const module1 = await moduleLoader.loadModuleInstance('network')
      const module2 = await moduleLoader.loadModuleInstance('network')

      expect(module1).toBe(module2)
      expect(module1.init).toHaveBeenCalledTimes(1) // 只初始化一次
    })

    it('应该处理并发加载相同模块', async () => {
      const promises = [
        moduleLoader.loadModuleInstance('network'),
        moduleLoader.loadModuleInstance('network'),
        moduleLoader.loadModuleInstance('network'),
      ]

      const modules = await Promise.all(promises)

      // 所有实例应该是同一个
      expect(modules[0]).toBe(modules[1])
      expect(modules[1]).toBe(modules[2])
      expect(modules[0].init).toHaveBeenCalledTimes(1)
    })

    it('应该抛出未知模块错误', async () => {
      await expect(
        moduleLoader.loadModuleInstance('unknown' as any),
      ).rejects.toThrow('Unknown module: unknown')
    })
  })

  describe('模块卸载', () => {
    it('应该成功卸载模块', async () => {
      const module = await moduleLoader.loadModuleInstance('network')

      await moduleLoader.unloadModule('network')

      expect(module.destroy).toHaveBeenCalled()
    })

    it('应该在卸载后重新加载模块', async () => {
      const module1 = await moduleLoader.loadModuleInstance('network')
      await moduleLoader.unloadModule('network')

      const module2 = await moduleLoader.loadModuleInstance('network')

      expect(module1).not.toBe(module2)
      expect(module2.init).toHaveBeenCalled()
    })

    it('应该处理卸载不存在的模块', async () => {
      await expect(
        moduleLoader.unloadModule('nonexistent'),
      ).resolves.not.toThrow()
    })

    it('应该卸载所有模块', async () => {
      const networkModule = await moduleLoader.loadModuleInstance('network')
      const batteryModule = await moduleLoader.loadModuleInstance('battery')

      await moduleLoader.unloadAllModules()

      expect(networkModule.destroy).toHaveBeenCalled()
      expect(batteryModule.destroy).toHaveBeenCalled()
    })
  })

  describe('模块状态管理', () => {
    it('应该正确报告模块是否已加载', async () => {
      expect(moduleLoader.isModuleLoaded('network')).toBe(false)

      await moduleLoader.loadModuleInstance('network')

      expect(moduleLoader.isModuleLoaded('network')).toBe(true)
    })

    it('应该返回已加载的模块列表', async () => {
      expect(moduleLoader.getLoadedModules()).toEqual([])

      await moduleLoader.loadModuleInstance('network')
      await moduleLoader.loadModuleInstance('battery')

      const loadedModules = moduleLoader.getLoadedModules()
      expect(loadedModules).toContain('network')
      expect(loadedModules).toContain('battery')
      expect(loadedModules).toHaveLength(2)
    })

    it('应该获取已加载的模块实例', async () => {
      const module = await moduleLoader.loadModuleInstance('network')
      const retrievedModule = moduleLoader.getModule('network')

      expect(retrievedModule).toBe(module)
    })

    it('应该在模块未加载时返回 undefined', () => {
      const module = moduleLoader.getModule('network')
      expect(module).toBeUndefined()
    })
  })

  describe('错误处理', () => {
    it('应该处理模块初始化失败', async () => {
      // 模拟所有重试都失败
      mockModule.init.mockRejectedValue(new Error('Init failed'))

      await expect(
        moduleLoader.loadModuleInstance('network'),
      ).rejects.toThrow('Failed to load module "network" after 3 retries')
    })

    it('应该重试失败的模块加载', async () => {
      // 前两次失败，第三次成功
      mockModule.init
        .mockRejectedValueOnce(new Error('Init failed'))
        .mockRejectedValueOnce(new Error('Init failed'))
        .mockResolvedValueOnce(undefined)

      const module = await moduleLoader.loadModuleInstance('network')

      expect(module).toBeDefined()
      expect(mockModule.init).toHaveBeenCalledTimes(3)
    })

    it('应该处理模块销毁失败', async () => {
      const module = await moduleLoader.loadModuleInstance('network')

        // 模拟销毁失败
        ; (module.destroy as any).mockRejectedValueOnce(new Error('Destroy failed'))

      // 应该不抛出错误
      await expect(
        moduleLoader.unloadModule('network'),
      ).resolves.not.toThrow()
    })
  })

  describe('性能监控', () => {
    it('应该记录加载统计信息', async () => {
      await moduleLoader.loadModuleInstance('network')

      const stats = moduleLoader.getLoadingStats('network')

      expect(stats).toBeDefined()
      expect(stats!.loadCount).toBe(1)
      expect(stats!.totalLoadTime).toBeGreaterThan(0)
      expect(stats!.averageLoadTime).toBeGreaterThan(0)
      expect(stats!.errors).toBe(0)
    })

    it('应该记录错误统计信息', async () => {
      // 模拟加载失败
      mockModule.init.mockRejectedValue(new Error('Load failed'))

      try {
        await moduleLoader.loadModuleInstance('network')
      }
      catch {
        // 忽略错误
      }

      const stats = moduleLoader.getLoadingStats('network')

      expect(stats).toBeDefined()
      expect(stats!.errors).toBeGreaterThan(0)
    })

    it('应该返回所有模块的统计信息', async () => {
      await moduleLoader.loadModuleInstance('network')
      await moduleLoader.loadModuleInstance('battery')

      const allStats = moduleLoader.getLoadingStats()

      expect(allStats).toHaveProperty('network')
      expect(allStats).toHaveProperty('battery')
    })
  })

  describe('内存管理', () => {
    it('应该在卸载模块后清理引用', async () => {
      await moduleLoader.loadModuleInstance('network')

      expect(moduleLoader.isModuleLoaded('network')).toBe(true)

      await moduleLoader.unloadModule('network')

      expect(moduleLoader.isModuleLoaded('network')).toBe(false)
      expect(moduleLoader.getModule('network')).toBeUndefined()
    })

    it('应该在卸载所有模块后清理所有引用', async () => {
      await moduleLoader.loadModuleInstance('network')
      await moduleLoader.loadModuleInstance('battery')
      await moduleLoader.loadModuleInstance('geolocation')

      expect(moduleLoader.getLoadedModules()).toHaveLength(3)

      await moduleLoader.unloadAllModules()

      expect(moduleLoader.getLoadedModules()).toHaveLength(0)
    })
  })
})
