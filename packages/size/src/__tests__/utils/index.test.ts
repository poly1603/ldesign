/**
 * 工具函数测试
 */

import { describe, it, expect, vi } from 'vitest'
import {
  isValidSizeMode,
  getNextSizeMode,
  getPreviousSizeMode,
  compareSizeModes,
  getSizeModeDisplayName,
  parseSizeMode,
  calculateSizeScale,
  formatCSSValue,
  parseCSSValue,
  deepMergeConfig,
  debounce,
  throttle,
  isValidInput,
} from '../../utils'

describe('utils', () => {
  describe('isValidSizeMode', () => {
    it('应该验证有效的尺寸模式', () => {
      expect(isValidSizeMode('small')).toBe(true)
      expect(isValidSizeMode('medium')).toBe(true)
      expect(isValidSizeMode('large')).toBe(true)
      expect(isValidSizeMode('extra-large')).toBe(true)
    })

    it('应该拒绝无效的尺寸模式', () => {
      expect(isValidSizeMode('invalid')).toBe(false)
      expect(isValidSizeMode('xl')).toBe(false)
      expect(isValidSizeMode('')).toBe(false)
      expect(isValidSizeMode('SMALL')).toBe(false)
    })
  })

  describe('getNextSizeMode', () => {
    it('应该返回下一个尺寸模式', () => {
      expect(getNextSizeMode('small')).toBe('medium')
      expect(getNextSizeMode('medium')).toBe('large')
      expect(getNextSizeMode('large')).toBe('extra-large')
      expect(getNextSizeMode('extra-large')).toBe('small') // 循环
    })
  })

  describe('getPreviousSizeMode', () => {
    it('应该返回上一个尺寸模式', () => {
      expect(getPreviousSizeMode('medium')).toBe('small')
      expect(getPreviousSizeMode('large')).toBe('medium')
      expect(getPreviousSizeMode('extra-large')).toBe('large')
      expect(getPreviousSizeMode('small')).toBe('extra-large') // 循环
    })
  })

  describe('compareSizeModes', () => {
    it('应该比较尺寸模式大小', () => {
      expect(compareSizeModes('small', 'medium')).toBeLessThan(0)
      expect(compareSizeModes('medium', 'small')).toBeGreaterThan(0)
      expect(compareSizeModes('large', 'large')).toBe(0)
      expect(compareSizeModes('small', 'extra-large')).toBeLessThan(0)
      expect(compareSizeModes('extra-large', 'small')).toBeGreaterThan(0)
    })
  })

  describe('getSizeModeDisplayName', () => {
    it('应该返回正确的显示名称', () => {
      expect(getSizeModeDisplayName('small')).toBe('小')
      expect(getSizeModeDisplayName('medium')).toBe('中')
      expect(getSizeModeDisplayName('large')).toBe('大')
      expect(getSizeModeDisplayName('extra-large')).toBe('超大')
    })
  })

  describe('parseSizeMode', () => {
    it('应该解析有效的尺寸模式', () => {
      expect(parseSizeMode('small')).toBe('small')
      expect(parseSizeMode('medium')).toBe('medium')
      expect(parseSizeMode('large')).toBe('large')
      expect(parseSizeMode('extra-large')).toBe('extra-large')
    })

    it('应该解析别名', () => {
      expect(parseSizeMode('s')).toBe('small')
      expect(parseSizeMode('m')).toBe('medium')
      expect(parseSizeMode('l')).toBe('large')
      expect(parseSizeMode('xl')).toBe('extra-large')
      expect(parseSizeMode('小')).toBe('small')
      expect(parseSizeMode('中')).toBe('medium')
      expect(parseSizeMode('大')).toBe('large')
      expect(parseSizeMode('超大')).toBe('extra-large')
    })

    it('应该处理大小写和空格', () => {
      expect(parseSizeMode('SMALL')).toBe('small')
      expect(parseSizeMode(' medium ')).toBe('medium')
      expect(parseSizeMode('  LARGE  ')).toBe('large')
    })

    it('应该返回null对于无效输入', () => {
      expect(parseSizeMode('invalid')).toBe(null)
      expect(parseSizeMode('')).toBe(null)
      expect(parseSizeMode('xxx')).toBe(null)
    })
  })

  describe('calculateSizeScale', () => {
    it('应该计算正确的缩放比例', () => {
      const scale = calculateSizeScale('small', 'medium')
      expect(scale).toBeGreaterThan(1) // medium应该比small大

      const reverseScale = calculateSizeScale('medium', 'small')
      expect(reverseScale).toBeLessThan(1) // small应该比medium小

      const sameScale = calculateSizeScale('medium', 'medium')
      expect(sameScale).toBe(1) // 相同模式比例为1
    })
  })

  describe('formatCSSValue', () => {
    it('应该格式化数字值', () => {
      expect(formatCSSValue(16)).toBe('16px')
      expect(formatCSSValue(16, 'rem')).toBe('16rem')
      expect(formatCSSValue(1.5, 'em')).toBe('1.5em')
    })

    it('应该保持字符串值不变', () => {
      expect(formatCSSValue('16px')).toBe('16px')
      expect(formatCSSValue('1rem')).toBe('1rem')
      expect(formatCSSValue('auto')).toBe('auto')
    })
  })

  describe('parseCSSValue', () => {
    it('应该解析CSS值', () => {
      expect(parseCSSValue('16px')).toEqual({ number: 16, unit: 'px' })
      expect(parseCSSValue('1.5rem')).toEqual({ number: 1.5, unit: 'rem' })
      expect(parseCSSValue('100%')).toEqual({ number: 100, unit: '%' })
      expect(parseCSSValue('0')).toEqual({ number: 0, unit: 'px' })
    })

    it('应该处理负值', () => {
      expect(parseCSSValue('-10px')).toEqual({ number: -10, unit: 'px' })
    })

    it('应该处理无效值', () => {
      expect(parseCSSValue('invalid')).toEqual({ number: 0, unit: 'px' })
      expect(parseCSSValue('')).toEqual({ number: 0, unit: 'px' })
    })
  })

  describe('deepMergeConfig', () => {
    it('应该深度合并对象', () => {
      const target = {
        a: 1,
        b: {
          c: 2,
          d: 3,
        },
        e: [1, 2, 3],
      }

      const source = {
        b: {
          c: 4,
          d: 3, // 保持原有属性
          f: 5,
        },
        g: 6,
      }

      const result = deepMergeConfig(target, source)

      expect(result).toEqual({
        a: 1,
        b: {
          c: 4,
          d: 3,
          f: 5,
        },
        e: [1, 2, 3],
        g: 6,
      })
    })

    it('应该处理数组覆盖', () => {
      const target = { arr: [1, 2, 3] }
      const source = { arr: [4, 5] }

      const result = deepMergeConfig(target, source)
      expect(result.arr).toEqual([4, 5])
    })

    it('应该处理null和undefined', () => {
      const target = { a: 1, b: null as any }
      const source = { b: 2, c: undefined }

      const result = deepMergeConfig(target, source)
      expect(result).toEqual({ a: 1, b: 2 })
    })
  })

  describe('debounce', () => {
    it('应该延迟执行函数', async () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100)

      debouncedFn()
      debouncedFn()
      debouncedFn()

      expect(fn).not.toHaveBeenCalled()

      await new Promise(resolve => setTimeout(resolve, 150))
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('应该传递参数', async () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 50)

      debouncedFn('arg1', 'arg2')

      await new Promise(resolve => setTimeout(resolve, 100))
      expect(fn).toHaveBeenCalledWith('arg1', 'arg2')
    })
  })

  describe('throttle', () => {
    it('应该限制函数执行频率', async () => {
      const fn = vi.fn()
      const throttledFn = throttle(fn, 100)

      throttledFn()
      throttledFn()
      throttledFn()

      expect(fn).toHaveBeenCalledTimes(1)

      await new Promise(resolve => setTimeout(resolve, 150))
      throttledFn()
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('应该传递参数', () => {
      const fn = vi.fn()
      const throttledFn = throttle(fn, 100)

      throttledFn('arg1', 'arg2')
      expect(fn).toHaveBeenCalledWith('arg1', 'arg2')
    })
  })

  describe('isValidInput', () => {
    it('应该验证有效输入', () => {
      expect(isValidInput('string')).toBe(true)
      expect(isValidInput(123)).toBe(true)
      expect(isValidInput(true)).toBe(true)
      expect(isValidInput(false)).toBe(true)
      expect(isValidInput({})).toBe(true)
      expect(isValidInput([])).toBe(true)
      expect(isValidInput(0)).toBe(true)
      expect(isValidInput('')).toBe(true)
    })

    it('应该拒绝无效输入', () => {
      expect(isValidInput(null)).toBe(false)
      expect(isValidInput(undefined)).toBe(false)
    })
  })
})
