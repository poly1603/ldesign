import { beforeEach, describe, expect, it } from 'vitest'
import { ManagerRegistry } from '../src/core/manager-registry'
import { createLogger } from '../src/logger/logger'

describe('managerRegistry', () => {
  let registry: ManagerRegistry

  beforeEach(() => {
    const logger = createLogger('debug')
    registry = new ManagerRegistry(logger)
  })

  describe('管理器注册', () => {
    it('应该能够注册管理器', () => {
      registry.register('test-manager', ['dependency1'], false)

      const status = registry.getStatus('test-manager')
      expect(status).toBeDefined()
      expect(status!.name).toBe('test-manager')
      expect(status!.dependencies).toEqual(['dependency1'])
      expect(status!.lazy).toBe(false)
      expect(status!.initialized).toBe(false)
    })

    it('应该能够注册懒加载管理器', () => {
      registry.register('lazy-manager', [], true)

      const status = registry.getStatus('lazy-manager')
      expect(status!.lazy).toBe(true)
    })

    it('应该防止重复注册', () => {
      registry.register('duplicate-manager')
      registry.register('duplicate-manager') // 应该被忽略

      const allStatus = registry.getAllStatus()
      const duplicates = allStatus.filter(s => s.name === 'duplicate-manager')
      expect(duplicates).toHaveLength(1)
    })
  })

  describe('依赖关系管理', () => {
    beforeEach(() => {
      registry.register('manager-a', [])
      registry.register('manager-b', ['manager-a'])
      registry.register('manager-c', ['manager-b'])
    })

    it('应该正确建立依赖关系', () => {
      const statusA = registry.getStatus('manager-a')
      const statusB = registry.getStatus('manager-b')
      const statusC = registry.getStatus('manager-c')

      expect(statusA!.dependents).toContain('manager-b')
      expect(statusB!.dependencies).toContain('manager-a')
      expect(statusB!.dependents).toContain('manager-c')
      expect(statusC!.dependencies).toContain('manager-b')
    })

    it('应该检查依赖是否满足', () => {
      // 未初始化时依赖不满足
      const check1 = registry.checkDependencies('manager-c')
      expect(check1.satisfied).toBe(false)
      expect(check1.missing).toContain('manager-b')

      // 初始化依赖后应该满足
      registry.markInitialized('manager-a')
      registry.markInitialized('manager-b')

      const check2 = registry.checkDependencies('manager-c')
      expect(check2.satisfied).toBe(true)
      expect(check2.missing).toHaveLength(0)
    })

    it('应该生成正确的初始化顺序', () => {
      const order = registry.getInitializationOrder()

      expect(order.indexOf('manager-a')).toBeLessThan(order.indexOf('manager-b'))
      expect(order.indexOf('manager-b')).toBeLessThan(order.indexOf('manager-c'))
    })

    it('应该检测循环依赖', () => {
      registry.register('manager-d', ['manager-e'])
      registry.register('manager-e', ['manager-d'])

      expect(() => {
        registry.getInitializationOrder()
      }).toThrow('Circular dependency detected')
    })
  })

  describe('初始化状态跟踪', () => {
    beforeEach(() => {
      registry.register('test-manager')
    })

    it('应该标记管理器为已初始化', () => {
      registry.markInitialized('test-manager')

      const status = registry.getStatus('test-manager')
      expect(status!.initialized).toBe(true)
      expect(status!.initTime).toBeDefined()
      expect(status!.error).toBeUndefined()
    })

    it('应该记录初始化错误', () => {
      const error = new Error('Initialization failed')
      registry.markInitialized('test-manager', error)

      const status = registry.getStatus('test-manager')
      expect(status!.initialized).toBe(false)
      expect(status!.error).toBe(error)
    })

    it('应该提供初始化统计', () => {
      registry.register('manager-1')
      registry.register('manager-2', [], true) // lazy

      registry.markInitialized('test-manager')
      registry.markInitialized('manager-1')
      registry.markInitialized('manager-2', new Error('Failed'))

      const stats = registry.getInitializationStats()
      expect(stats.total).toBe(3)
      expect(stats.initialized).toBe(2)
      expect(stats.failed).toBe(1)
      expect(stats.lazy).toBe(1)
      expect(stats.initOrder).toEqual(['test-manager', 'manager-1'])
    })
  })

  describe('依赖图验证', () => {
    it('应该验证有效的依赖图', () => {
      registry.register('manager-a')
      registry.register('manager-b', ['manager-a'])

      const validation = registry.validateDependencyGraph()
      expect(validation.valid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })

    it('应该检测缺失的依赖', () => {
      registry.register('manager-with-missing-dep', ['non-existent'])

      const validation = registry.validateDependencyGraph()
      expect(validation.valid).toBe(false)
      expect(validation.errors).toContain(
        'Manager "manager-with-missing-dep" depends on missing manager "non-existent"',
      )
    })

    it('应该警告孤立的管理器', () => {
      registry.register('isolated-manager')

      const validation = registry.validateDependencyGraph()
      expect(validation.warnings).toContain(
        'Manager "isolated-manager" has no dependencies or dependents',
      )
    })
  })

  describe('懒加载管理器', () => {
    it('应该排除懒加载管理器在初始化顺序中', () => {
      registry.register('eager-manager')
      registry.register('lazy-manager', [], true)

      const order = registry.getInitializationOrder()
      expect(order).toContain('eager-manager')
      expect(order).not.toContain('lazy-manager')
    })

    it('应该在统计中正确计算懒加载管理器', () => {
      registry.register('eager-manager')
      registry.register('lazy-manager', [], true)

      const stats = registry.getInitializationStats()
      expect(stats.total).toBe(2)
      expect(stats.lazy).toBe(1)
    })
  })

  describe('依赖图可视化', () => {
    it('应该生成DOT格式的依赖图', () => {
      registry.register('manager-a')
      registry.register('manager-b', ['manager-a'])
      registry.markInitialized('manager-a')

      const graph = registry.generateDependencyGraph()

      expect(graph).toContain('digraph ManagerDependencies')
      expect(graph).toContain('"manager-a"')
      expect(graph).toContain('"manager-b"')
      expect(graph).toContain('"manager-a" -> "manager-b"')
    })
  })

  describe('注册表清理', () => {
    it('应该能够清理注册表', () => {
      registry.register('test-manager')
      registry.markInitialized('test-manager')

      registry.clear()

      expect(registry.getAllStatus()).toHaveLength(0)
      expect(registry.getInitializationStats().total).toBe(0)
    })
  })
})
