/**
 * 工具函数单元测试
 */

import { describe, it, expect, vi } from 'vitest'
import {
  random,
  clamp,
  normalizeAngle,
  angleDifference,
  degreesToRadians,
  radiansToDegrees,
  isPointInRect,
  isPointInCircle,
  getDistance,
  createCanvas,
  loadImage,
  getRelativePosition,
  isTouchSupported,
  debounce,
  throttle,
  generateId,
  formatTime,
  isColliding
} from '@/utils'

describe('工具函数', () => {
  describe('数学函数', () => {
    it('random - 应该生成指定范围内的随机数', () => {
      const min = 10
      const max = 20
      
      for (let i = 0; i < 100; i++) {
        const result = random(min, max)
        expect(result).toBeGreaterThanOrEqual(min)
        expect(result).toBeLessThanOrEqual(max)
      }
    })

    it('clamp - 应该将数值限制在指定范围内', () => {
      expect(clamp(5, 0, 10)).toBe(5)
      expect(clamp(-5, 0, 10)).toBe(0)
      expect(clamp(15, 0, 10)).toBe(10)
      expect(clamp(0, 0, 10)).toBe(0)
      expect(clamp(10, 0, 10)).toBe(10)
    })

    it('normalizeAngle - 应该将角度标准化到0-360度', () => {
      expect(normalizeAngle(0)).toBe(0)
      expect(normalizeAngle(180)).toBe(180)
      expect(normalizeAngle(360)).toBe(0)
      expect(normalizeAngle(450)).toBe(90)
      expect(normalizeAngle(-90)).toBe(270)
      expect(normalizeAngle(-450)).toBe(270)
    })

    it('angleDifference - 应该计算两个角度之间的最小差值', () => {
      expect(angleDifference(0, 90)).toBe(90)
      expect(angleDifference(90, 0)).toBe(90)
      expect(angleDifference(10, 350)).toBe(20)
      expect(angleDifference(350, 10)).toBe(20)
      expect(angleDifference(0, 180)).toBe(180)
      expect(angleDifference(0, 270)).toBe(90)
    })

    it('degreesToRadians - 应该将度数转换为弧度', () => {
      expect(degreesToRadians(0)).toBe(0)
      expect(degreesToRadians(90)).toBeCloseTo(Math.PI / 2)
      expect(degreesToRadians(180)).toBeCloseTo(Math.PI)
      expect(degreesToRadians(360)).toBeCloseTo(Math.PI * 2)
    })

    it('radiansToDegrees - 应该将弧度转换为度数', () => {
      expect(radiansToDegrees(0)).toBe(0)
      expect(radiansToDegrees(Math.PI / 2)).toBeCloseTo(90)
      expect(radiansToDegrees(Math.PI)).toBeCloseTo(180)
      expect(radiansToDegrees(Math.PI * 2)).toBeCloseTo(360)
    })

    it('getDistance - 应该计算两点之间的距离', () => {
      const point1 = { x: 0, y: 0 }
      const point2 = { x: 3, y: 4 }
      
      expect(getDistance(point1, point2)).toBe(5)
      expect(getDistance(point1, point1)).toBe(0)
      
      const point3 = { x: -3, y: -4 }
      expect(getDistance(point1, point3)).toBe(5)
    })
  })

  describe('几何函数', () => {
    it('isPointInRect - 应该判断点是否在矩形内', () => {
      const rect = { x: 10, y: 10, width: 20, height: 20 }
      
      expect(isPointInRect({ x: 15, y: 15 }, rect)).toBe(true)
      expect(isPointInRect({ x: 10, y: 10 }, rect)).toBe(true)
      expect(isPointInRect({ x: 30, y: 30 }, rect)).toBe(true)
      expect(isPointInRect({ x: 5, y: 15 }, rect)).toBe(false)
      expect(isPointInRect({ x: 15, y: 5 }, rect)).toBe(false)
      expect(isPointInRect({ x: 35, y: 15 }, rect)).toBe(false)
      expect(isPointInRect({ x: 15, y: 35 }, rect)).toBe(false)
    })

    it('isPointInCircle - 应该判断点是否在圆形内', () => {
      const center = { x: 10, y: 10 }
      const radius = 5
      
      expect(isPointInCircle({ x: 10, y: 10 }, center, radius)).toBe(true)
      expect(isPointInCircle({ x: 13, y: 14 }, center, radius)).toBe(true)
      expect(isPointInCircle({ x: 15, y: 10 }, center, radius)).toBe(true)
      expect(isPointInCircle({ x: 16, y: 10 }, center, radius)).toBe(false)
      expect(isPointInCircle({ x: 5, y: 5 }, center, radius)).toBe(false)
    })

    it('isColliding - 应该判断两个矩形是否碰撞', () => {
      const rect1 = { x: 0, y: 0, width: 10, height: 10 }
      const rect2 = { x: 5, y: 5, width: 10, height: 10 }
      const rect3 = { x: 20, y: 20, width: 10, height: 10 }
      
      expect(isColliding(rect1, rect2)).toBe(true)
      expect(isColliding(rect1, rect3)).toBe(false)
      expect(isColliding(rect2, rect3)).toBe(false)
    })
  })

  describe('Canvas 函数', () => {
    it('createCanvas - 应该创建画布和上下文', () => {
      const { canvas, ctx } = createCanvas(100, 200)
      
      expect(canvas).toBeInstanceOf(HTMLCanvasElement)
      expect(canvas.width).toBe(100)
      expect(canvas.height).toBe(200)
      expect(ctx).toBeTruthy()
    })

    it('loadImage - 应该加载图片', async () => {
      const imageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      
      const image = await loadImage(imageUrl)
      
      expect(image).toBeInstanceOf(HTMLImageElement)
      expect(image.src).toBe(imageUrl)
    })

    it('loadImage - 应该处理加载错误', async () => {
      const invalidUrl = 'invalid-url'
      
      await expect(loadImage(invalidUrl)).rejects.toThrow()
    })
  })

  describe('DOM 函数', () => {
    it('getRelativePosition - 应该获取相对位置', () => {
      const mockElement = {
        getBoundingClientRect: () => ({
          left: 10,
          top: 20,
          width: 100,
          height: 100
        })
      } as HTMLElement

      const mockEvent = {
        clientX: 50,
        clientY: 70
      } as MouseEvent

      const position = getRelativePosition(mockEvent, mockElement)
      
      expect(position.x).toBe(40)
      expect(position.y).toBe(50)
    })

    it('getRelativePosition - 应该处理触摸事件', () => {
      const mockElement = {
        getBoundingClientRect: () => ({
          left: 10,
          top: 20,
          width: 100,
          height: 100
        })
      } as HTMLElement

      const mockTouchEvent = {
        touches: [{
          clientX: 50,
          clientY: 70
        }]
      } as TouchEvent

      const position = getRelativePosition(mockTouchEvent, mockElement)
      
      expect(position.x).toBe(40)
      expect(position.y).toBe(50)
    })

    it('isTouchSupported - 应该检测触摸支持', () => {
      const result = isTouchSupported()
      expect(typeof result).toBe('boolean')
    })
  })

  describe('函数式工具', () => {
    it('debounce - 应该防抖动', async () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100)
      
      debouncedFn()
      debouncedFn()
      debouncedFn()
      
      expect(fn).not.toHaveBeenCalled()
      
      await new Promise(resolve => setTimeout(resolve, 150))
      
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('throttle - 应该节流', async () => {
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

  describe('字符串工具', () => {
    it('generateId - 应该生成唯一ID', () => {
      const id1 = generateId()
      const id2 = generateId()
      
      expect(typeof id1).toBe('string')
      expect(typeof id2).toBe('string')
      expect(id1).not.toBe(id2)
      expect(id1.length).toBeGreaterThan(0)
    })

    it('generateId - 应该支持自定义前缀', () => {
      const id = generateId('test')
      
      expect(id.startsWith('test')).toBe(true)
    })

    it('formatTime - 应该格式化时间', () => {
      expect(formatTime(0)).toBe('0ms')
      expect(formatTime(500)).toBe('500ms')
      expect(formatTime(1000)).toBe('1.0s')
      expect(formatTime(1500)).toBe('1.5s')
      expect(formatTime(60000)).toBe('1.0m')
      expect(formatTime(90000)).toBe('1.5m')
    })
  })

  describe('边界情况', () => {
    it('应该处理无效输入', () => {
      expect(clamp(NaN, 0, 10)).toBe(0)
      expect(normalizeAngle(NaN)).toBe(0)
      expect(getDistance({ x: NaN, y: 0 }, { x: 0, y: 0 })).toBe(0)
    })

    it('应该处理极值', () => {
      expect(clamp(Infinity, 0, 10)).toBe(10)
      expect(clamp(-Infinity, 0, 10)).toBe(0)
      expect(normalizeAngle(Infinity)).toBe(0)
      expect(normalizeAngle(-Infinity)).toBe(0)
    })

    it('应该处理零值', () => {
      expect(random(0, 0)).toBe(0)
      expect(clamp(5, 0, 0)).toBe(0)
      expect(getDistance({ x: 0, y: 0 }, { x: 0, y: 0 })).toBe(0)
    })
  })
})
