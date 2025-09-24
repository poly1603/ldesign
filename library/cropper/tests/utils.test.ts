/**
 * 工具函数单元测试
 */

import { describe, it, expect, vi } from 'vitest'
import {
  clamp,
  getBoundingBox,
  getElementRect,
  getRelativeMousePosition,
  getRelativeTouchPosition,
  isPointInRect,
  debounce,
  throttle,
  nextFrame,
  isValidNumber,
  isValidRect,
  isSupportedImageType,
  getImageInfo,
  createCanvas,
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  adjustBrightness,
  adjustContrast,
  adjustSaturation
} from '../src/utils'

describe('数学工具函数', () => {
  describe('clamp', () => {
    it('应该限制数值在指定范围内', () => {
      expect(clamp(5, 0, 10)).toBe(5)
      expect(clamp(-5, 0, 10)).toBe(0)
      expect(clamp(15, 0, 10)).toBe(10)
    })

    it('应该处理边界值', () => {
      expect(clamp(0, 0, 10)).toBe(0)
      expect(clamp(10, 0, 10)).toBe(10)
    })
  })

  describe('getBoundingBox', () => {
    it('应该计算点集的边界框', () => {
      const points = [
        { x: 10, y: 20 },
        { x: 30, y: 40 },
        { x: 5, y: 15 },
        { x: 25, y: 35 }
      ]

      const bbox = getBoundingBox(points)

      expect(bbox.x).toBe(5)
      expect(bbox.y).toBe(15)
      expect(bbox.width).toBe(25)
      expect(bbox.height).toBe(25)
    })

    it('应该处理单个点', () => {
      const points = [{ x: 10, y: 20 }]
      const bbox = getBoundingBox(points)

      expect(bbox.x).toBe(10)
      expect(bbox.y).toBe(20)
      expect(bbox.width).toBe(0)
      expect(bbox.height).toBe(0)
    })

    it('应该处理空数组', () => {
      const bbox = getBoundingBox([])

      expect(bbox.x).toBe(0)
      expect(bbox.y).toBe(0)
      expect(bbox.width).toBe(0)
      expect(bbox.height).toBe(0)
    })
  })
})

describe('DOM工具函数', () => {
  describe('getElementRect', () => {
    it('应该获取元素的矩形信息', () => {
      const element = document.createElement('div')
      element.style.width = '100px'
      element.style.height = '80px'
      document.body.appendChild(element)

      // Mock getBoundingClientRect
      element.getBoundingClientRect = vi.fn(() => ({
        x: 10,
        y: 20,
        width: 100,
        height: 80,
        top: 20,
        right: 110,
        bottom: 100,
        left: 10,
        toJSON: () => ({})
      }))

      const rect = getElementRect(element)

      expect(rect.x).toBe(10)
      expect(rect.y).toBe(20)
      expect(rect.width).toBe(100)
      expect(rect.height).toBe(80)

      document.body.removeChild(element)
    })
  })

  describe('getRelativeMousePosition', () => {
    it('应该计算相对于元素的鼠标位置', () => {
      const element = document.createElement('div')
      element.getBoundingClientRect = vi.fn(() => ({
        x: 10,
        y: 20,
        width: 100,
        height: 80,
        top: 20,
        right: 110,
        bottom: 100,
        left: 10,
        toJSON: () => ({})
      }))

      const event = {
        clientX: 50,
        clientY: 60
      } as MouseEvent

      const position = getRelativeMousePosition(event, element)

      expect(position.x).toBe(40) // 50 - 10
      expect(position.y).toBe(40) // 60 - 20
    })
  })

  describe('getRelativeTouchPosition', () => {
    it('应该计算相对于元素的触摸位置', () => {
      const element = document.createElement('div')
      element.getBoundingClientRect = vi.fn(() => ({
        x: 10,
        y: 20,
        width: 100,
        height: 80,
        top: 20,
        right: 110,
        bottom: 100,
        left: 10,
        toJSON: () => ({})
      }))

      const event = {
        touches: [{
          clientX: 30,
          clientY: 40
        }]
      } as TouchEvent

      const position = getRelativeTouchPosition(event, element)

      expect(position.x).toBe(20) // 30 - 10
      expect(position.y).toBe(20) // 40 - 20
    })

    it('应该处理没有触摸点的情况', () => {
      const element = document.createElement('div')
      const event = { touches: [] } as TouchEvent

      const position = getRelativeTouchPosition(event, element)

      expect(position.x).toBe(0)
      expect(position.y).toBe(0)
    })
  })

  describe('isPointInRect', () => {
    it('应该检查点是否在矩形内', () => {
      const rect = { x: 10, y: 20, width: 100, height: 80 }

      expect(isPointInRect({ x: 50, y: 60 }, rect)).toBe(true)
      expect(isPointInRect({ x: 5, y: 60 }, rect)).toBe(false)
      expect(isPointInRect({ x: 50, y: 15 }, rect)).toBe(false)
      expect(isPointInRect({ x: 115, y: 60 }, rect)).toBe(false)
      expect(isPointInRect({ x: 50, y: 105 }, rect)).toBe(false)
    })

    it('应该处理边界情况', () => {
      const rect = { x: 10, y: 20, width: 100, height: 80 }

      expect(isPointInRect({ x: 10, y: 20 }, rect)).toBe(true) // 左上角
      expect(isPointInRect({ x: 110, y: 100 }, rect)).toBe(true) // 右下角
    })
  })
})

describe('性能优化工具函数', () => {
  describe('debounce', () => {
    it('应该延迟执行函数', (done) => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100)

      debouncedFn()
      debouncedFn()
      debouncedFn()

      expect(fn).not.toHaveBeenCalled()

      setTimeout(() => {
        expect(fn).toHaveBeenCalledTimes(1)
        done()
      }, 150)
    })

    it('应该传递参数', (done) => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 50)

      debouncedFn('arg1', 'arg2')

      setTimeout(() => {
        expect(fn).toHaveBeenCalledWith('arg1', 'arg2')
        done()
      }, 100)
    })
  })

  describe('throttle', () => {
    it('应该限制函数执行频率', (done) => {
      const fn = vi.fn()
      const throttledFn = throttle(fn, 100)

      throttledFn()
      throttledFn()
      throttledFn()

      expect(fn).toHaveBeenCalledTimes(1)

      setTimeout(() => {
        throttledFn()
        expect(fn).toHaveBeenCalledTimes(2)
        done()
      }, 150)
    })
  })

  describe('nextFrame', () => {
    it('应该在下一帧执行回调', (done) => {
      const callback = vi.fn(() => {
        expect(callback).toHaveBeenCalled()
        done()
      })

      nextFrame(callback)
      expect(callback).not.toHaveBeenCalled()
    })
  })
})

describe('验证工具函数', () => {
  describe('isValidNumber', () => {
    it('应该验证有效数字', () => {
      expect(isValidNumber(0)).toBe(true)
      expect(isValidNumber(42)).toBe(true)
      expect(isValidNumber(-10)).toBe(true)
      expect(isValidNumber(3.14)).toBe(true)
    })

    it('应该拒绝无效数字', () => {
      expect(isValidNumber(NaN)).toBe(false)
      expect(isValidNumber(Infinity)).toBe(false)
      expect(isValidNumber(-Infinity)).toBe(false)
      expect(isValidNumber('42' as any)).toBe(false)
      expect(isValidNumber(null as any)).toBe(false)
      expect(isValidNumber(undefined as any)).toBe(false)
    })
  })

  describe('isValidRect', () => {
    it('应该验证有效矩形', () => {
      expect(isValidRect({ x: 0, y: 0, width: 100, height: 80 })).toBe(true)
      expect(isValidRect({ x: 10, y: 20, width: 50, height: 60 })).toBe(true)
    })

    it('应该拒绝无效矩形', () => {
      expect(isValidRect({ x: NaN, y: 0, width: 100, height: 80 })).toBe(false)
      expect(isValidRect({ x: 0, y: 0, width: -10, height: 80 })).toBe(false)
      expect(isValidRect({ x: 0, y: 0, width: 100, height: 0 })).toBe(false)
      expect(isValidRect(null as any)).toBe(false)
    })
  })

  describe('isSupportedImageType', () => {
    it('应该识别支持的图片类型', () => {
      expect(isSupportedImageType('image/jpeg')).toBe(true)
      expect(isSupportedImageType('image/png')).toBe(true)
      expect(isSupportedImageType('image/gif')).toBe(true)
      expect(isSupportedImageType('image/webp')).toBe(true)
      expect(isSupportedImageType('image/bmp')).toBe(true)
    })

    it('应该拒绝不支持的类型', () => {
      expect(isSupportedImageType('text/plain')).toBe(false)
      expect(isSupportedImageType('application/pdf')).toBe(false)
      expect(isSupportedImageType('video/mp4')).toBe(false)
      expect(isSupportedImageType('')).toBe(false)
    })
  })
})

describe('图片处理工具函数', () => {
  describe('getImageInfo', () => {
    it('应该获取HTMLImageElement信息', () => {
      const img = new Image()
      img.width = 200
      img.height = 150
      img.src = 'data:image/png;base64,test'

      const info = getImageInfo(img)

      expect(info.width).toBe(200)
      expect(info.height).toBe(150)
      expect(info.type).toBe('image/png')
    })

    it('应该获取File信息', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const info = getImageInfo(file)

      expect(info.type).toBe('image/jpeg')
      expect(info.size).toBe(4) // 'test' 的字节长度
    })

    it('应该获取Canvas信息', () => {
      const canvas = document.createElement('canvas')
      canvas.width = 300
      canvas.height = 200

      const info = getImageInfo(canvas)

      expect(info.width).toBe(300)
      expect(info.height).toBe(200)
      expect(info.type).toBe('image/png')
    })
  })

  describe('createCanvas', () => {
    it('应该创建指定尺寸的Canvas', () => {
      const canvas = createCanvas(400, 300)

      expect(canvas).toBeInstanceOf(HTMLCanvasElement)
      expect(canvas.width).toBe(400)
      expect(canvas.height).toBe(300)
    })

    it('应该使用默认尺寸', () => {
      const canvas = createCanvas()

      expect(canvas.width).toBe(300)
      expect(canvas.height).toBe(150)
    })
  })
})

describe('颜色处理工具函数', () => {
  describe('hexToRgb', () => {
    it('应该转换十六进制颜色到RGB', () => {
      expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 })
      expect(hexToRgb('#00ff00')).toEqual({ r: 0, g: 255, b: 0 })
      expect(hexToRgb('#0000ff')).toEqual({ r: 0, g: 0, b: 255 })
      expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 })
    })

    it('应该处理短格式十六进制', () => {
      expect(hexToRgb('#f00')).toEqual({ r: 255, g: 0, b: 0 })
      expect(hexToRgb('#0f0')).toEqual({ r: 0, g: 255, b: 0 })
      expect(hexToRgb('#00f')).toEqual({ r: 0, g: 0, b: 255 })
    })

    it('应该处理无效输入', () => {
      expect(hexToRgb('invalid')).toBeNull()
      expect(hexToRgb('')).toBeNull()
      expect(hexToRgb('#gg0000')).toBeNull()
    })
  })

  describe('rgbToHex', () => {
    it('应该转换RGB到十六进制', () => {
      expect(rgbToHex(255, 0, 0)).toBe('#ff0000')
      expect(rgbToHex(0, 255, 0)).toBe('#00ff00')
      expect(rgbToHex(0, 0, 255)).toBe('#0000ff')
      expect(rgbToHex(255, 255, 255)).toBe('#ffffff')
    })

    it('应该处理边界值', () => {
      expect(rgbToHex(0, 0, 0)).toBe('#000000')
      expect(rgbToHex(128, 128, 128)).toBe('#808080')
    })
  })

  describe('rgbToHsl', () => {
    it('应该转换RGB到HSL', () => {
      const hsl = rgbToHsl(255, 0, 0)
      expect(hsl.h).toBe(0)
      expect(hsl.s).toBe(100)
      expect(hsl.l).toBe(50)
    })

    it('应该处理灰色', () => {
      const hsl = rgbToHsl(128, 128, 128)
      expect(hsl.h).toBe(0)
      expect(hsl.s).toBe(0)
      expect(Math.round(hsl.l)).toBe(50)
    })
  })

  describe('hslToRgb', () => {
    it('应该转换HSL到RGB', () => {
      const rgb = hslToRgb(0, 100, 50)
      expect(rgb.r).toBe(255)
      expect(rgb.g).toBe(0)
      expect(rgb.b).toBe(0)
    })

    it('应该处理灰色', () => {
      const rgb = hslToRgb(0, 0, 50)
      expect(rgb.r).toBe(128)
      expect(rgb.g).toBe(128)
      expect(rgb.b).toBe(128)
    })
  })

  describe('adjustBrightness', () => {
    it('应该调整颜色亮度', () => {
      const brighter = adjustBrightness('#808080', 20)
      const darker = adjustBrightness('#808080', -20)
      
      expect(brighter).not.toBe('#808080')
      expect(darker).not.toBe('#808080')
    })
  })

  describe('adjustContrast', () => {
    it('应该调整颜色对比度', () => {
      const result = adjustContrast('#808080', 1.5)
      expect(result).not.toBe('#808080')
    })
  })

  describe('adjustSaturation', () => {
    it('应该调整颜色饱和度', () => {
      const result = adjustSaturation('#ff0000', 0.5)
      expect(result).not.toBe('#ff0000')
    })
  })
})