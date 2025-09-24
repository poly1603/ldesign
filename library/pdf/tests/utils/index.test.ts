/**
 * 工具函数单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getElement,
  createElement,
  debounce,
  throttle,
  formatFileSize,
  isValidPageNumber,
  clamp,
  generateId,
  isBrowserSupported,
  getDevicePixelRatio,
  calculateFitScale,
  deepMerge
} from '../../src/utils'

describe('工具函数', () => {
  describe('getElement', () => {
    let testElement: HTMLElement

    beforeEach(() => {
      testElement = document.createElement('div')
      testElement.id = 'test-element'
      document.body.appendChild(testElement)
    })

    afterEach(() => {
      document.body.removeChild(testElement)
    })

    it('应该能够通过选择器获取元素', () => {
      const element = getElement('#test-element')
      expect(element).toBe(testElement)
    })

    it('应该能够直接返回HTMLElement', () => {
      const element = getElement(testElement)
      expect(element).toBe(testElement)
    })

    it('应该在元素不存在时抛出错误', () => {
      expect(() => getElement('#non-existent')).toThrow('Element not found: #non-existent')
    })
  })

  describe('createElement', () => {
    it('应该创建指定标签的元素', () => {
      const element = createElement('div')
      expect(element.tagName).toBe('DIV')
    })

    it('应该设置类名', () => {
      const element = createElement('div', 'test-class')
      expect(element.className).toBe('test-class')
    })

    it('应该设置属性', () => {
      const element = createElement('div', 'test-class', {
        'data-test': 'value',
        'id': 'test-id'
      })
      
      expect(element.getAttribute('data-test')).toBe('value')
      expect(element.id).toBe('test-id')
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

    it('应该传递正确的参数', async () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100)
      
      debouncedFn('arg1', 'arg2')
      
      await new Promise(resolve => setTimeout(resolve, 150))
      
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
  })

  describe('formatFileSize', () => {
    it('应该正确格式化文件大小', () => {
      expect(formatFileSize(0)).toBe('0 Bytes')
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1024 * 1024)).toBe('1 MB')
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB')
      expect(formatFileSize(1536)).toBe('1.5 KB')
    })
  })

  describe('isValidPageNumber', () => {
    it('应该验证有效的页码', () => {
      expect(isValidPageNumber(1, 10)).toBe(true)
      expect(isValidPageNumber(5, 10)).toBe(true)
      expect(isValidPageNumber(10, 10)).toBe(true)
    })

    it('应该拒绝无效的页码', () => {
      expect(isValidPageNumber(0, 10)).toBe(false)
      expect(isValidPageNumber(11, 10)).toBe(false)
      expect(isValidPageNumber(-1, 10)).toBe(false)
      expect(isValidPageNumber(1.5, 10)).toBe(false)
    })
  })

  describe('clamp', () => {
    it('应该限制数值在指定范围内', () => {
      expect(clamp(5, 1, 10)).toBe(5)
      expect(clamp(0, 1, 10)).toBe(1)
      expect(clamp(15, 1, 10)).toBe(10)
    })
  })

  describe('generateId', () => {
    it('应该生成唯一ID', () => {
      const id1 = generateId()
      const id2 = generateId()
      
      expect(id1).not.toBe(id2)
      expect(id1).toMatch(/^pdf-\d+-[a-z0-9]+$/)
    })

    it('应该使用自定义前缀', () => {
      const id = generateId('custom')
      expect(id).toMatch(/^custom-\d+-[a-z0-9]+$/)
    })
  })

  describe('isBrowserSupported', () => {
    it('应该检查浏览器支持', () => {
      const supported = isBrowserSupported()
      expect(typeof supported).toBe('boolean')
    })
  })

  describe('getDevicePixelRatio', () => {
    it('应该返回设备像素比', () => {
      const ratio = getDevicePixelRatio()
      expect(typeof ratio).toBe('number')
      expect(ratio).toBeGreaterThan(0)
    })
  })

  describe('calculateFitScale', () => {
    it('应该计算适合的缩放比例', () => {
      const scale = calculateFitScale(800, 600, 400, 300, 20)
      expect(typeof scale).toBe('number')
      expect(scale).toBeGreaterThan(0)
    })

    it('应该考虑内边距', () => {
      const scale1 = calculateFitScale(800, 600, 400, 300, 0)
      const scale2 = calculateFitScale(800, 600, 400, 300, 50)
      
      expect(scale2).toBeLessThan(scale1)
    })
  })

  describe('deepMerge', () => {
    it('应该深度合并对象', () => {
      const target = {
        a: 1,
        b: {
          c: 2,
          d: 3
        }
      }
      
      const source = {
        b: {
          d: 4,
          e: 5
        },
        f: 6
      }
      
      const result = deepMerge(target, source)
      
      expect(result).toEqual({
        a: 1,
        b: {
          c: 2,
          d: 4,
          e: 5
        },
        f: 6
      })
    })

    it('应该处理多个源对象', () => {
      const target = { a: 1 }
      const source1 = { b: 2 }
      const source2 = { c: 3 }
      
      const result = deepMerge(target, source1, source2)
      
      expect(result).toEqual({
        a: 1,
        b: 2,
        c: 3
      })
    })

    it('应该处理空源对象', () => {
      const target = { a: 1 }
      const result = deepMerge(target)
      
      expect(result).toEqual({ a: 1 })
    })
  })
})
