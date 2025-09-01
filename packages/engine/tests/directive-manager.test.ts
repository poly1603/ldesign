import type { Directive } from '@vue/runtime-dom'
import type { DirectiveManager } from '../src/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  commonDirectives,
  createDirectiveManager,
} from '../src/directives/directive-manager'
import { createHybridDirectiveAdapter } from '../src/directives/utils/directive-compatibility'

// Mock DOM APIs
Object.defineProperty(globalThis, 'IntersectionObserver', {
  writable: true,
  value: vi.fn().mockImplementation(_callback => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
})

Object.defineProperty(globalThis, 'document', {
  writable: true,
  value: {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
})

Object.defineProperty(globalThis, 'window', {
  writable: true,
  value: {
    setTimeout: vi.fn(fn => fn()),
    clearTimeout: vi.fn(),
  },
})

describe('directiveManager', () => {
  let directiveManager: DirectiveManager

  beforeEach(() => {
    directiveManager = createDirectiveManager()
    vi.clearAllMocks()
  })

  describe('基础功能', () => {
    it('应该创建指令管理器实例', () => {
      expect(directiveManager).toBeDefined()
      expect((directiveManager as any).size()).toBe(0)
    })

    it('应该注册指令', () => {
      const testDirective: Directive = {
        mounted: vi.fn(),
        unmounted: vi.fn(),
      }

      directiveManager.register('test', createHybridDirectiveAdapter(testDirective))

      expect((directiveManager as any).has('test')).toBe(true)
      expect(directiveManager.get('test')).toBe(testDirective)
      expect((directiveManager as any).size()).toBe(1)
    })

    it('应该在重复注册时发出警告', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { })

      const directive1: Directive = { mounted: vi.fn() }
      const directive2: Directive = { mounted: vi.fn() }

      directiveManager.register('test', createHybridDirectiveAdapter(directive1))
      directiveManager.register('test', createHybridDirectiveAdapter(directive2))

      expect(consoleSpy).toHaveBeenCalledWith(
        'Directive "test" is already registered. It will be replaced.',
      )
      expect(directiveManager.get('test')).toBe(directive2)

      consoleSpy.mockRestore()
    })

    it('应该卸载指令', () => {
      const testDirective: Directive = { mounted: vi.fn() }

      directiveManager.register('test', createHybridDirectiveAdapter(testDirective))
      expect((directiveManager as any).has('test')).toBe(true)

      directiveManager.unregister('test')
      expect((directiveManager as any).has('test')).toBe(false)
      expect(directiveManager.get('test')).toBeUndefined()
    })

    it('应该获取所有指令', () => {
      const directive1: Directive = { mounted: vi.fn() }
      const directive2: Directive = { mounted: vi.fn() }

      directiveManager.register('test1', createHybridDirectiveAdapter(directive1))
      directiveManager.register('test2', createHybridDirectiveAdapter(directive2))

      const allDirectives = directiveManager.getAll()
      expect(allDirectives).toHaveLength(2)
      expect(allDirectives).toContain(directive1)
      expect(allDirectives).toContain(directive2)
    })

    it('应该获取所有指令名称', () => {
      directiveManager.register('test1', createHybridDirectiveAdapter({ mounted: vi.fn() }))
      directiveManager.register('test2', createHybridDirectiveAdapter({ mounted: vi.fn() }))

      const names = (directiveManager as any).getNames()
      expect(names).toEqual(['test1', 'test2'])
    })

    it('应该清空所有指令', () => {
      directiveManager.register('test1', { mounted: vi.fn() })
      directiveManager.register('test2', { mounted: vi.fn() })

      expect((directiveManager as any).size()).toBe(2)

      directiveManager.clear()
      expect((directiveManager as any).size()).toBe(0)
      expect((directiveManager as any).getNames()).toEqual([])
    })
  })

  describe('批量操作', () => {
    it('应该批量注册指令', () => {
      const directives = {
        test1: { mounted: vi.fn() } as Directive,
        test2: { mounted: vi.fn() } as Directive,
        test3: { mounted: vi.fn() } as Directive,
      }

      directiveManager.registerBatch(directives)

      expect((directiveManager as any).size()).toBe(3)
      expect((directiveManager as any).has('test1')).toBe(true)
      expect((directiveManager as any).has('test2')).toBe(true)
      expect((directiveManager as any).has('test3')).toBe(true)
    })

    it('应该批量卸载指令', () => {
      directiveManager.register('test1', createHybridDirectiveAdapter({ mounted: vi.fn() }))
      directiveManager.register('test2', createHybridDirectiveAdapter({ mounted: vi.fn() }))
      directiveManager.register('test3', createHybridDirectiveAdapter({ mounted: vi.fn() }))

      directiveManager.unregisterBatch(['test1', 'test3'])

      expect((directiveManager as any).size()).toBe(1)
      expect((directiveManager as any).has('test1')).toBe(false)
      expect((directiveManager as any).has('test2')).toBe(true)
      expect((directiveManager as any).has('test3')).toBe(false)
    })
  })

  describe('预定义指令', () => {
    it('应该包含所有预定义指令', () => {
      expect(commonDirectives).toHaveProperty('clickOutside')
      expect(commonDirectives).toHaveProperty('copy')
      expect(commonDirectives).toHaveProperty('lazy')
      expect(commonDirectives).toHaveProperty('debounce')
      expect(commonDirectives).toHaveProperty('throttle')
      expect(commonDirectives).toHaveProperty('permission')
      expect(commonDirectives).toHaveProperty('focus')
    })

    it('应该能够注册预定义指令', () => {
      directiveManager.registerBatch(commonDirectives)

      expect((directiveManager as any).size()).toBe(7)
      expect((directiveManager as any).has('clickOutside')).toBe(true)
      expect((directiveManager as any).has('copy')).toBe(true)
      expect((directiveManager as any).has('lazy')).toBe(true)
    })
  })
})

describe('预定义指令功能测试', () => {
  let mockElement: HTMLElement

  beforeEach(() => {
    mockElement = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      focus: vi.fn(),
      style: {},
      setAttribute: vi.fn(),
      remove: vi.fn(),
      contains: vi.fn(),
    } as any
  })

  describe('clickOutside 指令', () => {
    it('应该在点击外部时触发回调', () => {
      const callback = vi.fn()
      const binding = { value: callback }

        ; (commonDirectives.clickOutside as any).mounted!(
          mockElement,
          binding as any,
          {} as any,
          {} as any,
        )

      // 模拟点击外部
      const clickEvent = { target: document.body }
      mockElement.contains = vi.fn().mockReturnValue(false)

      // 获取注册的事件处理器并调用
      const addEventListenerCalls = (document.addEventListener as any).mock.calls
      const clickHandler = addEventListenerCalls.find(
        (call: any) => call[0] === 'click',
      )?.[1]

      if (clickHandler) {
        clickHandler(clickEvent)
        expect(callback).toHaveBeenCalledWith(clickEvent)
      }
    })

    it('应该在卸载时移除事件监听器', () => {
      const callback = vi.fn()
      const binding = { value: callback }

        ; (commonDirectives.clickOutside as any).mounted!(
          mockElement,
          binding as any,
          {} as any,
          {} as any,
        )
        ; (commonDirectives.clickOutside as any).unmounted!(
          mockElement,
          binding as any,
          {} as any,
          {} as any,
        )

      expect(document.removeEventListener).toHaveBeenCalledWith(
        'click',
        expect.any(Function),
      )
    })
  })

  describe('focus 指令', () => {
    it('应该在挂载时聚焦元素', () => {
      const binding = { value: true }

        ; (commonDirectives.focus as any).mounted!(
          mockElement,
          binding as any,
          {} as any,
          {} as any,
        )

      expect(mockElement.focus).toHaveBeenCalled()
    })

    it('应该在值为false时不聚焦', () => {
      const binding = { value: false }

        ; (commonDirectives.focus as any).mounted!(
          mockElement,
          binding as any,
          {} as any,
          {} as any,
        )

      expect(mockElement.focus).not.toHaveBeenCalled()
    })

    it('应该在更新时根据值变化聚焦', () => {
      const binding = { value: true, oldValue: false }

        ; (commonDirectives.focus as any).updated!(
          mockElement,
          binding as any,
          {} as any,
          {} as any,
        )

      expect(mockElement.focus).toHaveBeenCalled()
    })
  })

  describe('debounce 指令', () => {
    it('应该注册防抖事件处理器', () => {
      const callback = vi.fn()
      const binding = { value: callback, arg: 'click' }

        ; (commonDirectives.debounce as any).mounted!(
          mockElement,
          binding as any,
          {} as any,
          {} as any,
        )

      expect(mockElement.addEventListener).toHaveBeenCalledWith(
        'click',
        expect.any(Function),
      )
    })

    it('应该在卸载时移除事件监听器', () => {
      const callback = vi.fn()
      const binding = { value: callback, arg: 'click' }

        ; (commonDirectives.debounce as any).mounted!(
          mockElement,
          binding as any,
          {} as any,
          {} as any,
        )
        ; (commonDirectives.debounce as any).unmounted!(
          mockElement,
          binding as any,
          {} as any,
          {} as any,
        )

      expect(mockElement.removeEventListener).toHaveBeenCalledWith(
        'click',
        expect.any(Function),
      )
    })
  })

  describe('throttle 指令', () => {
    it('应该注册节流事件处理器', () => {
      const callback = vi.fn()
      const binding = { value: callback, arg: 'click' }

        ; (commonDirectives.throttle as any).mounted!(
          mockElement,
          binding as any,
          {} as any,
          {} as any,
        )

      expect(mockElement.addEventListener).toHaveBeenCalledWith(
        'click',
        expect.any(Function),
      )
    })

    it('应该在卸载时移除事件监听器', () => {
      const callback = vi.fn()
      const binding = { value: callback, arg: 'click' }

        ; (commonDirectives.throttle as any).mounted!(
          mockElement,
          binding as any,
          {} as any,
          {} as any,
        )
        ; (commonDirectives.throttle as any).unmounted!(
          mockElement,
          binding as any,
          {} as any,
          {} as any,
        )

      expect(mockElement.removeEventListener).toHaveBeenCalledWith(
        'click',
        expect.any(Function),
      )
    })
  })

  describe('lazy 指令', () => {
    it('应该创建 IntersectionObserver', () => {
      const callback = vi.fn()
      const binding = { value: callback }

        ; (commonDirectives.lazy as any).mounted!(
          mockElement,
          binding as any,
          {} as any,
          {} as any,
        )

      expect(IntersectionObserver).toHaveBeenCalled()
    })

    it('应该在卸载时断开观察器', () => {
      const callback = vi.fn()
      const binding = { value: callback }
      const mockObserver = {
        disconnect: vi.fn(),
        observe: vi.fn(),
        unobserve: vi.fn(),
      }

      // 模拟观察器
      mockElement._lazyObserver = mockObserver as any

        ; (commonDirectives.lazy as any).unmounted!(
          mockElement,
          binding as any,
          {} as any,
          {} as any,
        )

      expect(mockObserver.disconnect).toHaveBeenCalled()
    })
  })

  describe('permission 指令', () => {
    it('应该在有权限时不做任何操作', () => {
      const binding = { value: 'user', modifiers: { hide: true } }

        ; (commonDirectives.permission as any).mounted!(
          mockElement,
          binding as any,
          {} as any,
          {} as any,
        )

      // 由于 checkPermission 总是返回 true，元素不应该被隐藏
      expect(mockElement.style.display).toBeUndefined()
      expect(mockElement.setAttribute).not.toHaveBeenCalled()
      expect(mockElement.remove).not.toHaveBeenCalled()
    })

    it('应该支持数组形式的权限检查', () => {
      const binding = { value: ['admin', 'user'], modifiers: {} }

        ; (commonDirectives.permission as any).mounted!(
          mockElement,
          binding as any,
          {} as any,
          {} as any,
        )

      // 由于 checkPermission 总是返回 true，元素不应该被移除
      expect(mockElement.remove).not.toHaveBeenCalled()
    })

    it('应该正确处理权限指令的逻辑结构', () => {
      // 测试指令的基本结构
      expect(commonDirectives.permission).toHaveProperty('mounted')
      expect(typeof (commonDirectives.permission as any).mounted).toBe('function')

      // 测试不会抛出错误
      expect(() => {
        const binding = { value: 'test', modifiers: {} }
          ; (commonDirectives.permission as any).mounted!(
            mockElement,
            binding as any,
            {} as any,
            {} as any,
          )
      }).not.toThrow()
    })
  })
})
