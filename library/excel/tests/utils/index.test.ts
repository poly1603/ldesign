/**
 * 工具函数测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DataUtils, DOMUtils, PositionUtils, StyleUtils, EventUtils } from '../../src/utils/index.js'
import type { CellPosition, CellRange } from '../../src/types/index.js'

describe('DataUtils', () => {
  describe('deepClone', () => {
    it('应该能够深度克隆基本类型', () => {
      expect(DataUtils.deepClone(null)).toBe(null)
      expect(DataUtils.deepClone(undefined)).toBe(undefined)
      expect(DataUtils.deepClone(123)).toBe(123)
      expect(DataUtils.deepClone('hello')).toBe('hello')
      expect(DataUtils.deepClone(true)).toBe(true)
    })

    it('应该能够深度克隆日期对象', () => {
      const date = new Date('2023-01-01')
      const cloned = DataUtils.deepClone(date)
      
      expect(cloned).toEqual(date)
      expect(cloned).not.toBe(date)
    })

    it('应该能够深度克隆数组', () => {
      const arr = [1, 2, { a: 3 }]
      const cloned = DataUtils.deepClone(arr)
      
      expect(cloned).toEqual(arr)
      expect(cloned).not.toBe(arr)
      expect(cloned[2]).not.toBe(arr[2])
    })

    it('应该能够深度克隆对象', () => {
      const obj = {
        a: 1,
        b: {
          c: 2,
          d: [3, 4]
        }
      }
      const cloned = DataUtils.deepClone(obj)
      
      expect(cloned).toEqual(obj)
      expect(cloned).not.toBe(obj)
      expect(cloned.b).not.toBe(obj.b)
      expect(cloned.b.d).not.toBe(obj.b.d)
    })
  })

  describe('isEmpty', () => {
    it('应该正确判断空值', () => {
      expect(DataUtils.isEmpty(null)).toBe(true)
      expect(DataUtils.isEmpty(undefined)).toBe(true)
      expect(DataUtils.isEmpty('')).toBe(true)
      expect(DataUtils.isEmpty(0)).toBe(false)
      expect(DataUtils.isEmpty(false)).toBe(false)
      expect(DataUtils.isEmpty('hello')).toBe(false)
    })
  })

  describe('formatCellValue', () => {
    it('应该正确格式化不同类型的值', () => {
      expect(DataUtils.formatCellValue(null)).toBe('')
      expect(DataUtils.formatCellValue(undefined)).toBe('')
      expect(DataUtils.formatCellValue('')).toBe('')
      expect(DataUtils.formatCellValue(123)).toBe('123')
      expect(DataUtils.formatCellValue(true)).toBe('TRUE')
      expect(DataUtils.formatCellValue(false)).toBe('FALSE')
      expect(DataUtils.formatCellValue('hello')).toBe('hello')
      
      const date = new Date('2023-01-01')
      expect(DataUtils.formatCellValue(date)).toBe(date.toLocaleDateString())
    })
  })

  describe('parseUserInput', () => {
    it('应该正确解析用户输入', () => {
      expect(DataUtils.parseUserInput('')).toBe(null)
      expect(DataUtils.parseUserInput('123')).toBe(123)
      expect(DataUtils.parseUserInput('123.45')).toBe(123.45)
      expect(DataUtils.parseUserInput('true')).toBe(true)
      expect(DataUtils.parseUserInput('false')).toBe(false)
      expect(DataUtils.parseUserInput('hello')).toBe('hello')
    })
  })
})

describe('PositionUtils', () => {
  describe('isValidPosition', () => {
    it('应该正确验证位置', () => {
      expect(PositionUtils.isValidPosition({ row: 0, column: 0 })).toBe(true)
      expect(PositionUtils.isValidPosition({ row: 10, column: 5 })).toBe(true)
      expect(PositionUtils.isValidPosition({ row: -1, column: 0 })).toBe(false)
      expect(PositionUtils.isValidPosition({ row: 0, column: -1 })).toBe(false)
    })
  })

  describe('isPositionInRange', () => {
    it('应该正确判断位置是否在范围内', () => {
      const range: CellRange = {
        start: { row: 1, column: 1 },
        end: { row: 3, column: 3 }
      }
      
      expect(PositionUtils.isPositionInRange({ row: 2, column: 2 }, range)).toBe(true)
      expect(PositionUtils.isPositionInRange({ row: 1, column: 1 }, range)).toBe(true)
      expect(PositionUtils.isPositionInRange({ row: 3, column: 3 }, range)).toBe(true)
      expect(PositionUtils.isPositionInRange({ row: 0, column: 0 }, range)).toBe(false)
      expect(PositionUtils.isPositionInRange({ row: 4, column: 4 }, range)).toBe(false)
    })
  })

  describe('getPositionsInRange', () => {
    it('应该返回范围内的所有位置', () => {
      const range: CellRange = {
        start: { row: 0, column: 0 },
        end: { row: 1, column: 1 }
      }
      
      const positions = PositionUtils.getPositionsInRange(range)
      
      expect(positions).toHaveLength(4)
      expect(positions).toContainEqual({ row: 0, column: 0 })
      expect(positions).toContainEqual({ row: 0, column: 1 })
      expect(positions).toContainEqual({ row: 1, column: 0 })
      expect(positions).toContainEqual({ row: 1, column: 1 })
    })
  })

  describe('getDistance', () => {
    it('应该正确计算两点间距离', () => {
      const pos1: CellPosition = { row: 0, column: 0 }
      const pos2: CellPosition = { row: 3, column: 4 }
      
      const distance = PositionUtils.getDistance(pos1, pos2)
      
      expect(distance).toBe(5) // 3-4-5直角三角形
    })
  })

  describe('createRange', () => {
    it('应该正确创建范围', () => {
      const start: CellPosition = { row: 1, column: 1 }
      const end: CellPosition = { row: 3, column: 3 }
      
      const range = PositionUtils.createRange(start, end)
      
      expect(range).toEqual({ start, end })
    })
  })

  describe('expandRange', () => {
    it('应该正确扩展范围', () => {
      const range: CellRange = {
        start: { row: 1, column: 1 },
        end: { row: 2, column: 2 }
      }
      const position: CellPosition = { row: 0, column: 3 }
      
      const expanded = PositionUtils.expandRange(range, position)
      
      expect(expanded).toEqual({
        start: { row: 0, column: 1 },
        end: { row: 2, column: 3 }
      })
    })
  })
})

describe('EventUtils', () => {
  describe('debounce', () => {
    it('应该正确防抖函数调用', async () => {
      const mockFn = vi.fn()
      const debouncedFn = EventUtils.debounce(mockFn, 100)
      
      debouncedFn('arg1')
      debouncedFn('arg2')
      debouncedFn('arg3')
      
      expect(mockFn).not.toHaveBeenCalled()
      
      await new Promise(resolve => setTimeout(resolve, 150))
      
      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('arg3')
    })
  })

  describe('throttle', () => {
    it('应该正确节流函数调用', async () => {
      const mockFn = vi.fn()
      const throttledFn = EventUtils.throttle(mockFn, 100)
      
      throttledFn('arg1')
      throttledFn('arg2')
      throttledFn('arg3')
      
      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('arg1')
      
      await new Promise(resolve => setTimeout(resolve, 150))
      
      throttledFn('arg4')
      
      expect(mockFn).toHaveBeenCalledTimes(2)
      expect(mockFn).toHaveBeenCalledWith('arg4')
    })
  })

  describe('preventDefault', () => {
    it('应该阻止事件默认行为和冒泡', () => {
      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn()
      } as any
      
      EventUtils.preventDefault(mockEvent)
      
      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(mockEvent.stopPropagation).toHaveBeenCalled()
    })
  })
})
