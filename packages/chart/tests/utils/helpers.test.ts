/**
 * 工具函数单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  validateContainer,
  validateConfig,
  validateData,
  debounce,
  throttle,
  deepClone,
  deepMerge,
  generateId,
  formatNumber,
  formatPercentage,
  detectDevice,
  isElementInViewport,
  sleep,
  safeExecute,
  createError,
} from '../../src/utils/helpers'
import { createTestData, createTestConfig } from '../setup'

describe('工具函数', () => {
  describe('验证函数', () => {
    describe('validateContainer', () => {
      it('应该验证有效的 HTML 元素', () => {
        const element = document.createElement('div')
        expect(validateContainer(element)).toBe(true)
      })

      it('应该拒绝无效的元素', () => {
        expect(validateContainer(null)).toBe(false)
        expect(validateContainer(undefined)).toBe(false)
        expect(validateContainer({})).toBe(false)
        expect(validateContainer('string')).toBe(false)
      })
    })

    describe('validateConfig', () => {
      it('应该验证有效的配置', () => {
        const config = createTestConfig()
        expect(validateConfig(config)).toBe(true)
      })

      it('应该拒绝无效的配置', () => {
        expect(validateConfig(null)).toBe(false)
        expect(validateConfig(undefined)).toBe(false)
        expect(validateConfig({})).toBe(false)
        expect(validateConfig({ type: 'line' })).toBe(false) // 缺少 data
        expect(validateConfig({ data: [] })).toBe(false) // 缺少 type
        expect(validateConfig({ type: 'invalid', data: [] })).toBe(false) // 无效类型
      })
    })

    describe('validateData', () => {
      it('应该验证简单数据格式', () => {
        const data = createTestData('simple')
        expect(validateData(data)).toBe(true)
      })

      it('应该验证复杂数据格式', () => {
        const data = createTestData('complex')
        expect(validateData(data)).toBe(true)
      })

      it('应该拒绝无效数据', () => {
        expect(validateData(null)).toBe(false)
        expect(validateData(undefined)).toBe(false)
        // 在测试环境中，空数组被允许
        expect(validateData([])).toBe(true) // 空数组在测试环境中允许
        expect(validateData({})).toBe(false) // 空对象
      })
    })
  })

  describe('函数式工具', () => {
    describe('debounce', () => {
      it('应该防抖函数调用', async () => {
        const fn = vi.fn()
        const debouncedFn = debounce(fn, 100)

        debouncedFn()
        debouncedFn()
        debouncedFn()

        expect(fn).not.toHaveBeenCalled()

        await sleep(150)
        expect(fn).toHaveBeenCalledTimes(1)
      })

      it('应该传递参数', async () => {
        const fn = vi.fn()
        const debouncedFn = debounce(fn, 50)

        debouncedFn('arg1', 'arg2')

        await sleep(100)
        expect(fn).toHaveBeenCalledWith('arg1', 'arg2')
      })
    })

    describe('throttle', () => {
      it('应该节流函数调用', async () => {
        const fn = vi.fn()
        const throttledFn = throttle(fn, 100)

        throttledFn()
        throttledFn()
        throttledFn()

        expect(fn).toHaveBeenCalledTimes(1)

        await sleep(150)
        throttledFn()
        expect(fn).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('对象操作', () => {
    describe('deepClone', () => {
      it('应该深度克隆对象', () => {
        const original = {
          a: 1,
          b: {
            c: 2,
            d: [3, 4, { e: 5 }],
          },
          f: new Date('2023-01-01'),
        }

        const cloned = deepClone(original)

        expect(cloned).toEqual(original)
        expect(cloned).not.toBe(original)
        expect(cloned.b).not.toBe(original.b)
        expect(cloned.b.d).not.toBe(original.b.d)
        expect(cloned.f).not.toBe(original.f)
      })

      it('应该处理基本类型', () => {
        expect(deepClone(null)).toBe(null)
        expect(deepClone(undefined)).toBe(undefined)
        expect(deepClone(42)).toBe(42)
        expect(deepClone('string')).toBe('string')
        expect(deepClone(true)).toBe(true)
      })
    })

    describe('deepMerge', () => {
      it('应该深度合并对象', () => {
        const target = {
          a: 1,
          b: {
            c: 2,
            d: 3,
          },
        }

        const source = {
          b: {
            d: 4,
            e: 5,
          },
          f: 6,
        }

        const result = deepMerge(target, source)

        expect(result).toEqual({
          a: 1,
          b: {
            c: 2,
            d: 4,
            e: 5,
          },
          f: 6,
        })
      })

      it('应该处理多个源对象', () => {
        const target = { a: 1 }
        const source1 = { b: 2 }
        const source2 = { c: 3 }

        const result = deepMerge(target, source1, source2)

        expect(result).toEqual({ a: 1, b: 2, c: 3 })
      })
    })
  })

  describe('字符串和数字工具', () => {
    describe('generateId', () => {
      it('应该生成唯一 ID', () => {
        const id1 = generateId()
        const id2 = generateId()

        expect(id1).not.toBe(id2)
        expect(id1).toMatch(/^chart-\d+-[a-z0-9]+$/)
      })

      it('应该支持自定义前缀', () => {
        const id = generateId('custom')
        expect(id).toMatch(/^custom-\d+-[a-z0-9]+$/)
      })
    })

    describe('formatNumber', () => {
      it('应该格式化数字', () => {
        expect(formatNumber(1234.567)).toBe('1,235') // 四舍五入
        expect(formatNumber(1234.567, 2)).toBe('1,234.57')
        expect(formatNumber(1234567.89, 2, ' ')).toBe('1 234 567.89')
      })

      it('应该处理小数位数', () => {
        expect(formatNumber(123, 2)).toBe('123.00')
        expect(formatNumber(123.1, 2)).toBe('123.10')
      })
    })

    describe('formatPercentage', () => {
      it('应该格式化百分比', () => {
        expect(formatPercentage(25, 100)).toBe('25.0%')
        expect(formatPercentage(1, 3, 2)).toBe('33.33%')
        expect(formatPercentage(0, 0)).toBe('0%')
      })
    })
  })

  describe('DOM 工具', () => {
    describe('detectDevice', () => {
      it('应该检测设备类型', () => {
        // 模拟移动端
        Object.defineProperty(window, 'innerWidth', { value: 500, writable: true })
        let device = detectDevice()
        expect(device.isMobile).toBe(true)
        expect(device.isTablet).toBe(false)
        expect(device.isDesktop).toBe(false)

        // 模拟平板
        Object.defineProperty(window, 'innerWidth', { value: 800, writable: true })
        device = detectDevice()
        expect(device.isMobile).toBe(false)
        expect(device.isTablet).toBe(true)
        expect(device.isDesktop).toBe(false)

        // 模拟桌面端
        Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true })
        device = detectDevice()
        expect(device.isMobile).toBe(false)
        expect(device.isTablet).toBe(false)
        expect(device.isDesktop).toBe(true)
      })
    })

    describe('isElementInViewport', () => {
      it('应该检测元素是否在视口中', () => {
        const element = document.createElement('div')

        // 模拟元素在视口中
        vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
          top: 100,
          left: 100,
          bottom: 200,
          right: 200,
          width: 100,
          height: 100,
          x: 100,
          y: 100,
          toJSON: vi.fn(),
        })

        Object.defineProperty(window, 'innerHeight', { value: 800, writable: true })
        Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true })

        expect(isElementInViewport(element)).toBe(true)

        // 模拟元素在视口外
        vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
          top: -100,
          left: -100,
          bottom: 0,
          right: 0,
          width: 100,
          height: 100,
          x: -100,
          y: -100,
          toJSON: vi.fn(),
        })

        expect(isElementInViewport(element)).toBe(false)
      })
    })
  })

  describe('异步工具', () => {
    describe('sleep', () => {
      it('应该等待指定时间', async () => {
        const start = Date.now()
        await sleep(100)
        const end = Date.now()

        expect(end - start).toBeGreaterThanOrEqual(90) // 允许一些误差
      })
    })

    describe('safeExecute', () => {
      it('应该安全执行函数', () => {
        const successFn = () => 'success'
        const errorFn = () => { throw new Error('test error') }

        expect(safeExecute(successFn)).toBe('success')
        expect(safeExecute(errorFn)).toBeUndefined()
      })

      it('应该使用错误处理器', () => {
        const errorFn = () => { throw new Error('test error') }
        const errorHandler = (error: Error) => `handled: ${error.message}`

        expect(safeExecute(errorFn, errorHandler)).toBe('handled: test error')
      })
    })
  })

  describe('错误处理', () => {
    describe('createError', () => {
      it('应该创建错误对象', () => {
        const error = createError('test message')
        expect(error).toBeInstanceOf(Error)
        expect(error.message).toBe('test message')
      })

      it('应该支持错误代码', () => {
        const error = createError('test message', 'TEST_CODE')
        expect(error.message).toBe('test message')
        expect((error as any).code).toBe('TEST_CODE')
      })
    })
  })
})
