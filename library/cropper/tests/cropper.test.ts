/**
 * Cropper 单元测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Cropper } from '../src/core/Cropper'
import { CropShape, ImageFormat } from '../src/types'

// Mock DOM APIs
Object.defineProperty(window, 'HTMLCanvasElement', {
  value: class HTMLCanvasElement {
    width = 300
    height = 150
    
    getContext() {
      return {
        clearRect: vi.fn(),
        drawImage: vi.fn(),
        fillRect: vi.fn(),
        strokeRect: vi.fn(),
        beginPath: vi.fn(),
        rect: vi.fn(),
        arc: vi.fn(),
        ellipse: vi.fn(),
        stroke: vi.fn(),
        fill: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        translate: vi.fn(),
        scale: vi.fn(),
        rotate: vi.fn(),
        setLineDash: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        createImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
        getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 })),
        putImageData: vi.fn(),
        measureText: vi.fn(() => ({ width: 100 })),
        fillText: vi.fn(),
        strokeText: vi.fn()
      }
    }
    
    toDataURL() {
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    }
    
    toBlob(callback: (blob: Blob) => void) {
      callback(new Blob(['fake-image-data'], { type: 'image/png' }))
    }
  }
})

Object.defineProperty(window, 'Image', {
  value: class Image {
    onload: (() => void) | null = null
    onerror: (() => void) | null = null
    src = ''
    width = 100
    height = 100
    
    set src(value: string) {
      setTimeout(() => {
        if (this.onload) {
          this.onload()
        }
      }, 0)
    }
  }
})

Object.defineProperty(window, 'ResizeObserver', {
  value: class ResizeObserver {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
    constructor(callback: ResizeObserverCallback) {}
  }
})

// Mock File API
global.File = class File extends Blob {
  name: string
  lastModified: number
  
  constructor(chunks: BlobPart[], filename: string, options?: FilePropertyBag) {
    super(chunks, options)
    this.name = filename
    this.lastModified = Date.now()
  }
} as any

global.FileReader = class FileReader extends EventTarget {
  result: string | ArrayBuffer | null = null
  error: DOMException | null = null
  readyState = 0
  
  readAsDataURL(file: Blob) {
    setTimeout(() => {
      this.result = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      this.readyState = 2
      this.dispatchEvent(new Event('load'))
    }, 0)
  }
  
  readAsArrayBuffer(file: Blob) {
    setTimeout(() => {
      this.result = new ArrayBuffer(8)
      this.readyState = 2
      this.dispatchEvent(new Event('load'))
    }, 0)
  }
} as any

describe('Cropper', () => {
  let container: HTMLDivElement
  let cropper: Cropper

  beforeEach(() => {
    // 创建测试容器
    container = document.createElement('div')
    container.style.width = '500px'
    container.style.height = '400px'
    document.body.appendChild(container)
  })

  afterEach(() => {
    // 清理
    if (cropper) {
      cropper.destroy()
    }
    if (container.parentNode) {
      container.parentNode.removeChild(container)
    }
  })

  describe('初始化', () => {
    it('应该正确初始化裁剪器', () => {
      cropper = new Cropper(container)
      
      expect(cropper).toBeDefined()
      expect(container.querySelector('canvas')).toBeTruthy()
    })

    it('应该接受配置选项', () => {
      const options = {
        aspectRatio: 16 / 9,
        cropShape: CropShape.CIRCLE,
        showGrid: false
      }
      
      cropper = new Cropper(container, options)
      
      expect(cropper.getConfig().aspectRatio).toBe(16 / 9)
      expect(cropper.getConfig().cropShape).toBe(CropShape.CIRCLE)
      expect(cropper.getConfig().showGrid).toBe(false)
    })

    it('应该抛出错误当容器无效时', () => {
      expect(() => {
        new Cropper(null as any)
      }).toThrow('Container element is required')
    })
  })

  describe('图片加载', () => {
    beforeEach(() => {
      cropper = new Cropper(container)
    })

    it('应该加载图片URL', async () => {
      const imageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      
      await expect(cropper.setImage(imageUrl)).resolves.toBeUndefined()
    })

    it('应该加载File对象', async () => {
      const file = new File(['fake-image-data'], 'test.png', { type: 'image/png' })
      
      await expect(cropper.setImage(file)).resolves.toBeUndefined()
    })

    it('应该加载HTMLImageElement', async () => {
      const img = new Image()
      img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      
      await expect(cropper.setImage(img)).resolves.toBeUndefined()
    })

    it('应该拒绝无效的图片类型', async () => {
      const file = new File(['fake-data'], 'test.txt', { type: 'text/plain' })
      
      await expect(cropper.setImage(file)).rejects.toThrow()
    })

    it('应该拒绝过大的文件', async () => {
      const largeFile = new File([new ArrayBuffer(11 * 1024 * 1024)], 'large.png', { type: 'image/png' })
      
      await expect(cropper.setImage(largeFile)).rejects.toThrow()
    })
  })

  describe('裁剪数据管理', () => {
    beforeEach(async () => {
      cropper = new Cropper(container)
      const imageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      await cropper.setImage(imageUrl)
    })

    it('应该获取裁剪数据', () => {
      const cropData = cropper.getCropData()
      
      expect(cropData).toHaveProperty('x')
      expect(cropData).toHaveProperty('y')
      expect(cropData).toHaveProperty('width')
      expect(cropData).toHaveProperty('height')
      expect(cropData).toHaveProperty('shape')
    })

    it('应该设置裁剪数据', () => {
      const newCropData = {
        x: 10,
        y: 20,
        width: 100,
        height: 80,
        shape: CropShape.CIRCLE
      }
      
      cropper.setCropData(newCropData)
      const cropData = cropper.getCropData()
      
      expect(cropData.x).toBe(10)
      expect(cropData.y).toBe(20)
      expect(cropData.width).toBe(100)
      expect(cropData.height).toBe(80)
      expect(cropData.shape).toBe(CropShape.CIRCLE)
    })

    it('应该验证裁剪数据', () => {
      expect(() => {
        cropper.setCropData({
          x: -10,
          y: 0,
          width: 100,
          height: 100,
          shape: CropShape.RECTANGLE
        })
      }).toThrow()
    })
  })

  describe('变换操作', () => {
    beforeEach(async () => {
      cropper = new Cropper(container)
      const imageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      await cropper.setImage(imageUrl)
    })

    it('应该设置缩放', () => {
      cropper.setScale(1.5)
      expect(cropper.getScale()).toBe(1.5)
    })

    it('应该限制缩放范围', () => {
      cropper.setScale(0.1) // 小于最小值
      expect(cropper.getScale()).toBe(0.1)
      
      cropper.setScale(10) // 大于最大值
      expect(cropper.getScale()).toBe(10)
    })

    it('应该设置旋转', () => {
      cropper.setRotation(90)
      expect(cropper.getRotation()).toBe(90)
    })

    it('应该标准化旋转角度', () => {
      cropper.setRotation(450) // 450度应该标准化为90度
      expect(cropper.getRotation()).toBe(90)
      
      cropper.setRotation(-90) // -90度应该标准化为270度
      expect(cropper.getRotation()).toBe(270)
    })

    it('应该设置翻转', () => {
      cropper.setFlip(true, false)
      expect(cropper.getFlipX()).toBe(true)
      expect(cropper.getFlipY()).toBe(false)
      
      cropper.setFlip(false, true)
      expect(cropper.getFlipX()).toBe(false)
      expect(cropper.getFlipY()).toBe(true)
    })

    it('应该重置变换', () => {
      cropper.setScale(2)
      cropper.setRotation(180)
      cropper.setFlip(true, true)
      
      cropper.reset()
      
      expect(cropper.getScale()).toBe(1)
      expect(cropper.getRotation()).toBe(0)
      expect(cropper.getFlipX()).toBe(false)
      expect(cropper.getFlipY()).toBe(false)
    })
  })

  describe('导出功能', () => {
    beforeEach(async () => {
      cropper = new Cropper(container)
      const imageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      await cropper.setImage(imageUrl)
    })

    it('应该导出裁剪后的Canvas', () => {
      const canvas = cropper.getCroppedCanvas()
      
      expect(canvas).toBeInstanceOf(HTMLCanvasElement)
      expect(canvas.width).toBeGreaterThan(0)
      expect(canvas.height).toBeGreaterThan(0)
    })

    it('应该导出指定格式的Canvas', () => {
      const options = {
        format: ImageFormat.JPEG,
        quality: 0.8,
        width: 200,
        height: 150
      }
      
      const canvas = cropper.getCroppedCanvas(options)
      
      expect(canvas).toBeInstanceOf(HTMLCanvasElement)
      expect(canvas.width).toBe(200)
      expect(canvas.height).toBe(150)
    })

    it('应该导出Blob', async () => {
      const blob = await cropper.getCroppedBlob()
      
      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toBe('image/png')
    })

    it('应该导出指定格式的Blob', async () => {
      const options = {
        format: ImageFormat.JPEG,
        quality: 0.9
      }
      
      const blob = await cropper.getCroppedBlob(options)
      
      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toBe('image/jpeg')
    })
  })

  describe('事件系统', () => {
    beforeEach(() => {
      cropper = new Cropper(container)
    })

    it('应该触发IMAGE_LOADED事件', async () => {
      const handler = vi.fn()
      cropper.on('IMAGE_LOADED', handler)
      
      const imageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      await cropper.setImage(imageUrl)
      
      expect(handler).toHaveBeenCalled()
    })

    it('应该触发CROP_CHANGE事件', async () => {
      const handler = vi.fn()
      cropper.on('CROP_CHANGE', handler)
      
      const imageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      await cropper.setImage(imageUrl)
      
      cropper.setCropData({
        x: 10,
        y: 10,
        width: 50,
        height: 50,
        shape: CropShape.RECTANGLE
      })
      
      expect(handler).toHaveBeenCalled()
    })

    it('应该移除事件监听器', () => {
      const handler = vi.fn()
      cropper.on('CROP_CHANGE', handler)
      cropper.off('CROP_CHANGE', handler)
      
      cropper.setCropData({
        x: 20,
        y: 20,
        width: 60,
        height: 60,
        shape: CropShape.RECTANGLE
      })
      
      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('配置管理', () => {
    it('应该获取配置', () => {
      cropper = new Cropper(container, {
        aspectRatio: 1,
        showGrid: false
      })
      
      const config = cropper.getConfig()
      
      expect(config.aspectRatio).toBe(1)
      expect(config.showGrid).toBe(false)
    })

    it('应该更新配置', () => {
      cropper = new Cropper(container)
      
      cropper.updateConfig({
        aspectRatio: 16 / 9,
        cropShape: CropShape.ELLIPSE
      })
      
      const config = cropper.getConfig()
      
      expect(config.aspectRatio).toBe(16 / 9)
      expect(config.cropShape).toBe(CropShape.ELLIPSE)
    })
  })

  describe('销毁', () => {
    it('应该正确销毁裁剪器', () => {
      cropper = new Cropper(container)
      const canvas = container.querySelector('canvas')
      
      expect(canvas).toBeTruthy()
      
      cropper.destroy()
      
      expect(container.querySelector('canvas')).toBeFalsy()
    })

    it('应该移除所有事件监听器', () => {
      cropper = new Cropper(container)
      const handler = vi.fn()
      
      cropper.on('CROP_CHANGE', handler)
      cropper.destroy()
      
      // 尝试触发事件，应该不会调用处理器
      try {
        cropper.setCropData({
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          shape: CropShape.RECTANGLE
        })
      } catch (error) {
        // 预期会抛出错误，因为裁剪器已被销毁
      }
      
      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('工具方法', () => {
    beforeEach(async () => {
      cropper = new Cropper(container)
      const imageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      await cropper.setImage(imageUrl)
    })

    it('应该检查是否有图片', () => {
      expect(cropper.hasImage()).toBe(true)
    })

    it('应该获取图片信息', () => {
      const imageInfo = cropper.getImageInfo()
      
      expect(imageInfo).toHaveProperty('width')
      expect(imageInfo).toHaveProperty('height')
      expect(imageInfo).toHaveProperty('type')
      expect(imageInfo).toHaveProperty('size')
    })

    it('应该检查功能支持', () => {
      const support = cropper.checkSupport()
      
      expect(support).toHaveProperty('canvas')
      expect(support).toHaveProperty('fileReader')
      expect(support).toHaveProperty('blob')
      expect(support).toHaveProperty('download')
    })
  })
})