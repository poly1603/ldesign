/**
 * API 模块测试
 */

import type { SizeMode } from '../../types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  autoDetectSize,
  compareSizes,
  createSizeState,
  createSizeToggler,
  getAvailableSizes,
  getGlobalSize,
  getLargerSize,
  getSizeDescription,
  getSizeDisplayName,
  getSizeRange,
  getSmallerSize,
  isLargestSize,
  isSmallestSize,
  isValidSize,
  nextGlobalSize,
  previousGlobalSize,
  resetToRecommendedSize,
  setGlobalSize,
  Size,
  toggleGlobalSize,
  watchGlobalSize,
} from '../../api'

// Mock utils
vi.mock('../../utils', () => ({
  getRecommendedSizeMode: vi.fn(() => 'medium' as SizeMode),
  detectPreferredSizeMode: vi.fn(() => 'large' as SizeMode),
}))

describe('aPI 基础函数', () => {
  beforeEach(() => {
    // 重置为默认状态
    setGlobalSize('medium')
  })

  describe('全局尺寸操作', () => {
    it('应该能够设置和获取全局尺寸', () => {
      setGlobalSize('large')
      expect(getGlobalSize()).toBe('large')

      setGlobalSize('small')
      expect(getGlobalSize()).toBe('small')
    })

    it('应该能够切换到下一个尺寸', () => {
      setGlobalSize('small')
      nextGlobalSize()
      expect(getGlobalSize()).toBe('medium')

      nextGlobalSize()
      expect(getGlobalSize()).toBe('large')

      nextGlobalSize()
      expect(getGlobalSize()).toBe('small') // 循环回到开始
    })

    it('应该能够切换到上一个尺寸', () => {
      setGlobalSize('large')
      previousGlobalSize()
      expect(getGlobalSize()).toBe('medium')

      previousGlobalSize()
      expect(getGlobalSize()).toBe('small')

      previousGlobalSize()
      expect(getGlobalSize()).toBe('large') // 循环回到结束
    })

    it('应该能够在指定模式间切换', () => {
      const modes: SizeMode[] = ['small', 'large']

      setGlobalSize('small')
      toggleGlobalSize(modes)
      expect(getGlobalSize()).toBe('large')

      toggleGlobalSize(modes)
      expect(getGlobalSize()).toBe('small')
    })
  })

  describe('智能尺寸操作', () => {
    it('应该能够重置为推荐尺寸', () => {
      setGlobalSize('small')
      resetToRecommendedSize()
      expect(getGlobalSize()).toBe('medium') // mocked value
    })

    it('应该能够自动检测尺寸', () => {
      setGlobalSize('small')
      autoDetectSize()
      expect(getGlobalSize()).toBe('large') // mocked value
    })
  })

  describe('监听功能', () => {
    it('应该能够监听全局尺寸变化', () => {
      const callback = vi.fn()
      const unwatch = watchGlobalSize(callback)

      setGlobalSize('large')
      expect(callback).toHaveBeenCalledWith('large')

      setGlobalSize('small')
      expect(callback).toHaveBeenCalledWith('small')

      unwatch()
      setGlobalSize('medium')
      expect(callback).toHaveBeenCalledTimes(2) // 不应该再被调用
    })
  })
})

describe('工具函数', () => {
  describe('验证和检查', () => {
    it('应该正确验证尺寸模式', () => {
      expect(isValidSize('small')).toBe(true)
      expect(isValidSize('medium')).toBe(true)
      expect(isValidSize('large')).toBe(true)
      expect(isValidSize('invalid')).toBe(false)
      expect(isValidSize('')).toBe(false)
    })

    it('应该正确检查最小和最大尺寸', () => {
      expect(isSmallestSize('small')).toBe(true)
      expect(isSmallestSize('medium')).toBe(false)
      expect(isSmallestSize('large')).toBe(false)

      expect(isLargestSize('large')).toBe(true)
      expect(isLargestSize('medium')).toBe(false)
      expect(isLargestSize('small')).toBe(false)
    })
  })

  describe('显示和描述', () => {
    it('应该返回正确的显示名称', () => {
      expect(getSizeDisplayName('small')).toBe('小')
      expect(getSizeDisplayName('medium')).toBe('中')
      expect(getSizeDisplayName('large')).toBe('大')
    })

    it('应该返回正确的描述', () => {
      expect(getSizeDescription('small')).toContain('移动设备')
      expect(getSizeDescription('medium')).toContain('桌面')
      expect(getSizeDescription('large')).toContain('大屏幕')
    })
  })

  describe('比较和导航', () => {
    it('应该正确比较尺寸', () => {
      expect(compareSizes('small', 'medium')).toBeLessThan(0)
      expect(compareSizes('medium', 'small')).toBeGreaterThan(0)
      expect(compareSizes('medium', 'medium')).toBe(0)
    })

    it('应该返回更大的尺寸', () => {
      expect(getLargerSize('small')).toBe('medium')
      expect(getLargerSize('medium')).toBe('large')
      expect(getLargerSize('large')).toBeNull()
    })

    it('应该返回更小的尺寸', () => {
      expect(getSmallerSize('large')).toBe('medium')
      expect(getSmallerSize('medium')).toBe('small')
      expect(getSmallerSize('small')).toBeNull()
    })

    it('应该返回尺寸范围', () => {
      expect(getSizeRange('small', 'large')).toEqual(['small', 'medium', 'large'])
      expect(getSizeRange('medium', 'large')).toEqual(['medium', 'large'])
      expect(getSizeRange('large', 'small')).toEqual(['small', 'medium', 'large'])
    })
  })

  describe('常量和列表', () => {
    it('应该返回所有可用尺寸', () => {
      const sizes = getAvailableSizes()
      expect(sizes).toEqual(['small', 'medium', 'large'])
    })
  })
})

describe('创建工具', () => {
  describe('尺寸切换器', () => {
    it('应该创建功能完整的切换器', () => {
      const toggler = createSizeToggler(['small', 'medium', 'large'])

      expect(toggler.current()).toBe('small')

      expect(toggler.next()).toBe('medium')
      expect(toggler.current()).toBe('medium')

      expect(toggler.next()).toBe('large')
      expect(toggler.current()).toBe('large')

      expect(toggler.next()).toBe('small') // 循环
      expect(toggler.current()).toBe('small')

      expect(toggler.previous()).toBe('large') // 反向循环
      expect(toggler.current()).toBe('large')

      toggler.set('medium')
      expect(toggler.current()).toBe('medium')

      toggler.reset()
      expect(toggler.current()).toBe('small')
    })

    it('应该支持自定义模式列表', () => {
      const toggler = createSizeToggler(['small', 'large'])

      expect(toggler.current()).toBe('small')
      expect(toggler.next()).toBe('large')
      expect(toggler.next()).toBe('small')
    })
  })

  describe('尺寸状态管理器', () => {
    it('应该创建功能完整的状态管理器', () => {
      const state = createSizeState('medium')

      expect(state.get()).toBe('medium')

      state.set('large')
      expect(state.get()).toBe('large')
    })

    it('应该支持订阅和取消订阅', () => {
      const state = createSizeState('small')
      const callback = vi.fn()

      const unsubscribe = state.subscribe(callback)

      state.set('medium')
      expect(callback).toHaveBeenCalledWith('medium')

      state.set('large')
      expect(callback).toHaveBeenCalledWith('large')

      unsubscribe()
      state.set('small')
      expect(callback).toHaveBeenCalledTimes(2) // 不应该再被调用
    })

    it('应该能够销毁状态管理器', () => {
      const state = createSizeState()
      const callback = vi.fn()

      state.subscribe(callback)
      state.destroy()

      state.set('large')
      expect(callback).not.toHaveBeenCalled()
    })
  })
})

describe('size 便捷对象', () => {
  beforeEach(() => {
    Size.set('medium')
  })

  it('应该提供所有基础操作', () => {
    expect(Size.get()).toBe('medium')

    Size.set('large')
    expect(Size.get()).toBe('large')

    Size.next()
    expect(Size.get()).toBe('small')

    Size.previous()
    expect(Size.get()).toBe('large')
  })

  it('应该提供智能操作', () => {
    expect(typeof Size.auto).toBe('function')
    expect(typeof Size.reset).toBe('function')
    expect(typeof Size.recommended).toBe('function')
  })

  it('应该提供工具函数', () => {
    expect(Size.isValid('small')).toBe(true)
    expect(Size.isValid('invalid')).toBe(false)

    expect(Size.displayName('small')).toBe('小')
    expect(Size.description('small')).toContain('移动设备')

    expect(Size.compare('small', 'large')).toBeLessThan(0)
    expect(Size.larger('small')).toBe('medium')
    expect(Size.smaller('large')).toBe('medium')
  })

  it('应该提供常量', () => {
    expect(Size.MODES).toEqual(['small', 'medium', 'large'])
    expect(Size.SMALL).toBe('small')
    expect(Size.MEDIUM).toBe('medium')
    expect(Size.LARGE).toBe('large')
  })

  it('应该提供创建工具', () => {
    const toggler = Size.createToggler()
    expect(typeof toggler.current).toBe('function')

    const state = Size.createState()
    expect(typeof state.get).toBe('function')

    const manager = Size.createManager()
    expect(typeof manager.setMode).toBe('function')
  })
})
