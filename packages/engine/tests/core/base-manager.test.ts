import type { Engine } from '../../src/types/engine'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AbstractBaseManager, BaseManager, ManagerRegistry } from '../../src/core/base-manager'

// Mock Engine
const mockEngine: Engine = {
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  }
} as any

// 测试用的具体管理器实现
class TestManager extends AbstractBaseManager<{ testConfig: string }> {
  private initializeCalled = false
  private destroyCalled = false

  protected async onInitialize(): Promise<void> {
    this.initializeCalled = true
    this.log('info', 'Test manager initialized')
  }

  protected async onDestroy(): Promise<void> {
    this.destroyCalled = true
    this.log('info', 'Test manager destroyed')
  }

  public getInitializeCalled(): boolean {
    return this.initializeCalled
  }

  public getDestroyCalled(): boolean {
    return this.destroyCalled
  }
}

// 测试用的错误管理器
class ErrorManager extends AbstractBaseManager {
  protected async onInitialize(): Promise<void> {
    throw new Error('Initialization failed')
  }

  protected async onDestroy(): Promise<void> {
    throw new Error('Destroy failed')
  }
}

describe('abstractBaseManager', () => {
  let manager: TestManager

  beforeEach(() => {
    manager = new TestManager(mockEngine, 'test-manager', { testConfig: 'test-value' })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('构造函数', () => {
    it('应该正确初始化管理器', () => {
      expect(manager.name).toBe('test-manager')
      expect(manager.getStatus()).toBe('idle')
      expect(manager.isInitialized).toBe(false)
      expect(manager.isReady).toBe(false)
    })

    it('应该使用默认配置当没有提供配置时', () => {
      const defaultManager = new TestManager(mockEngine, 'default-manager')
      expect(defaultManager.name).toBe('default-manager')
    })
  })

  describe('初始化', () => {
    it('应该正确初始化管理器', async () => {
      expect(manager.getStatus()).toBe('idle')
      expect(manager.isInitialized).toBe(false)
      
      await manager.initialize()
      
      expect(manager.getStatus()).toBe('ready')
      expect(manager.isInitialized).toBe(true)
      expect(manager.isReady).toBe(true)
      expect(manager.getInitializeCalled()).toBe(true)
    })

    it('应该在初始化过程中设置正确的状态', async () => {
      const initPromise = manager.initialize()
      
      // 在初始化过程中状态应该是 'initializing'
      expect(manager.getStatus()).toBe('initializing')
      
      await initPromise
      
      expect(manager.getStatus()).toBe('ready')
    })

    it('应该防止重复初始化', async () => {
      await manager.initialize()
      expect(manager.getInitializeCalled()).toBe(true)
      
      // 重置标志以测试是否被再次调用
      const spy = vi.spyOn(manager as any, 'onInitialize')
      
      await manager.initialize()
      
      expect(spy).not.toHaveBeenCalled()
      expect(manager.getStatus()).toBe('ready')
    })

    it('应该处理初始化错误', async () => {
      const errorManager = new ErrorManager(mockEngine, 'error-manager')
      
      await expect(errorManager.initialize()).rejects.toThrow('Initialization failed')
      expect(errorManager.getStatus()).toBe('error')
      expect(errorManager.isInitialized).toBe(false)
    })
  })

  describe('销毁', () => {
    it('应该正确销毁管理器', async () => {
      await manager.initialize()
      expect(manager.getStatus()).toBe('ready')
      
      await manager.destroy()
      
      expect(manager.getStatus()).toBe('destroyed')
      expect(manager.isInitialized).toBe(false)
      expect(manager.getDestroyCalled()).toBe(true)
    })

    it('应该防止重复销毁', async () => {
      await manager.initialize()
      await manager.destroy()
      
      const spy = vi.spyOn(manager as any, 'onDestroy')
      
      await manager.destroy()
      
      expect(spy).not.toHaveBeenCalled()
      expect(manager.getStatus()).toBe('destroyed')
    })

    it('应该处理销毁错误', async () => {
      const errorManager = new ErrorManager(mockEngine, 'error-manager')
      
      await expect(errorManager.destroy()).rejects.toThrow('Destroy failed')
      expect(errorManager.getStatus()).toBe('error')
    })
  })

  describe('日志记录', () => {
    it('应该使用引擎的日志器记录日志', async () => {
      await manager.initialize()
      
      expect(mockEngine.logger.info).toHaveBeenCalledWith(
        '[test-manager] Test manager initialized'
      )
    })

    it('应该在没有引擎日志器时使用console', async () => {
      const managerWithoutLogger = new TestManager(
        { logger: null } as any,
        'no-logger-manager'
      )
      
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
      
      await managerWithoutLogger.initialize()
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[no-logger-manager] Test manager initialized'
      )
      
      consoleSpy.mockRestore()
    })
  })
})

describe('baseManager', () => {
  let baseManager: BaseManager

  beforeEach(() => {
    baseManager = new BaseManager('base-manager', { testSetting: true })
  })

  describe('基本功能', () => {
    it('应该正确创建基础管理器', () => {
      expect(baseManager.name).toBe('base-manager')
      expect(baseManager.getStatus()).toBe('idle')
    })

    it('应该能够更新配置', () => {
      baseManager.updateConfig({ newSetting: 'value' })
      
      // 配置应该被合并
      const stats = baseManager.getStats()
      expect(stats.name).toBe('base-manager')
    })

    it('应该返回统计信息', () => {
      const stats = baseManager.getStats()
      
      expect(stats).toEqual({
        name: 'base-manager',
        status: 'idle',
        initialized: false
      })
    })
  })

  describe('生命周期', () => {
    it('应该能够初始化', async () => {
      await baseManager.initialize()
      
      expect(baseManager.getStatus()).toBe('ready')
      expect(baseManager.isInitialized).toBe(true)
    })

    it('应该能够销毁', async () => {
      await baseManager.initialize()
      await baseManager.destroy()
      
      expect(baseManager.getStatus()).toBe('destroyed')
      expect(baseManager.isInitialized).toBe(false)
    })
  })
})

describe('managerRegistry', () => {
  let registry: ManagerRegistry
  let manager1: TestManager
  let manager2: TestManager

  beforeEach(() => {
    registry = new ManagerRegistry()
    manager1 = new TestManager(mockEngine, 'manager-1')
    manager2 = new TestManager(mockEngine, 'manager-2')
  })

  describe('管理器管理', () => {
    it('应该能够注册管理器', () => {
      registry.register('manager-1', manager1)

      expect(registry.has('manager-1')).toBe(true)
    })

    it('应该能够获取管理器', () => {
      registry.register('manager-1', manager1)

      expect(registry.get('manager-1')).toBe(manager1)
    })

    it('应该能够获取所有管理器', () => {
      registry.register('manager-1', manager1)
      registry.register('manager-2', manager2)

      const managers = registry.getAll()
      expect(managers).toHaveLength(2)
      expect(managers).toContain(manager1)
      expect(managers).toContain(manager2)
    })
  })
})
