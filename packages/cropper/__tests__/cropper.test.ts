/**
 * @file 裁剪器核心功能测试
 * @description 测试裁剪器的基本功能
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Cropper } from '../src/cropper'
import { CropShape, ImageFormat, CropperEventType } from '../src/types'
import { createMockFile, createMockImage, createMockCanvas } from './setup'

describe('Cropper', () => {
  let container: HTMLElement
  let cropper: Cropper

  beforeEach(() => {
    // 创建测试容器
    container = document.createElement('div')
    container.style.width = '400px'
    container.style.height = '300px'
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

  describe('构造函数', () => {
    it('应该能够创建裁剪器实例', () => {
      cropper = new Cropper({
        container,
        shape: CropShape.RECTANGLE,
      })

      expect(cropper).toBeInstanceOf(Cropper)
    })

    it('应该能够使用选择器创建裁剪器', () => {
      container.id = 'test-container'

      cropper = new Cropper({
        container: '#test-container',
        shape: CropShape.RECTANGLE,
      })

      expect(cropper).toBeInstanceOf(Cropper)
    })

    it('应该在容器不存在时抛出错误', () => {
      expect(() => {
        new Cropper({
          container: '#non-existent',
          shape: CropShape.RECTANGLE,
        })
      }).toThrow('Container element not found')
    })
  })

  describe('图片加载', () => {
    beforeEach(() => {
      cropper = new Cropper({
        container,
        shape: CropShape.RECTANGLE,
      })
    })

    it('应该能够加载图片 URL', async () => {
      const imageUrl = 'test-image.jpg'

      await expect(cropper.setImage(imageUrl)).resolves.toBeUndefined()
    })

    it('应该能够加载 File 对象', async () => {
      const file = createMockFile('test.jpg', 'image/jpeg')

      await expect(cropper.setImage(file)).resolves.toBeUndefined()
    })

    it('应该能够加载 HTMLImageElement', async () => {
      const image = createMockImage(200, 150)

      await expect(cropper.setImage(image)).resolves.toBeUndefined()
    })

    it('应该在图片加载时触发事件', async () => {
      const onImageLoaded = vi.fn()
      cropper.on(CropperEventType.IMAGE_LOADED, onImageLoaded)

      await cropper.setImage('test-image.jpg')

      expect(onImageLoaded).toHaveBeenCalled()
    })
  })

  describe('裁剪操作', () => {
    beforeEach(async () => {
      cropper = new Cropper({
        container,
        shape: CropShape.RECTANGLE,
      })

      // 加载测试图片
      await cropper.setImage(createMockImage(400, 300))
    })

    it('应该能够获取裁剪数据', () => {
      const cropData = cropper.getCropData()

      expect(cropData).toHaveProperty('x')
      expect(cropData).toHaveProperty('y')
      expect(cropData).toHaveProperty('width')
      expect(cropData).toHaveProperty('height')
      expect(cropData).toHaveProperty('shape')
    })

    it('应该能够设置裁剪数据', () => {
      // 测试 setCropData 方法不会抛出错误
      expect(() => {
        cropper.setCropData({
          x: 10,
          y: 10,
          width: 100,
          height: 80,
        })
      }).not.toThrow()

      // 验证基本属性存在
      const cropData = cropper.getCropData()
      expect(cropData).toHaveProperty('x')
      expect(cropData).toHaveProperty('y')
      expect(cropData).toHaveProperty('width')
      expect(cropData).toHaveProperty('height')
    })

    it('应该能够获取裁剪后的 Canvas', () => {
      const canvas = cropper.getCroppedCanvas()

      expect(canvas).toBeInstanceOf(HTMLCanvasElement)
      expect(canvas.width).toBeGreaterThan(0)
      expect(canvas.height).toBeGreaterThan(0)
    })

    it('应该能够获取裁剪后的 Data URL', () => {
      const dataURL = cropper.getCroppedDataURL()

      expect(typeof dataURL).toBe('string')
      expect(dataURL).toMatch(/^data:image/)
    })

    it('应该能够获取裁剪后的 Blob', async () => {
      const blob = await cropper.getCroppedBlob()

      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toMatch(/^image/)
    })
  })

  describe('变换操作', () => {
    beforeEach(async () => {
      cropper = new Cropper({
        container,
        shape: CropShape.RECTANGLE,
      })

      await cropper.setImage(createMockImage(400, 300))
    })

    it('应该能够缩放', () => {
      const onZoomChange = vi.fn()
      cropper.on(CropperEventType.ZOOM_CHANGE, onZoomChange)

      cropper.zoom(1.5)

      expect(onZoomChange).toHaveBeenCalled()
    })

    it('应该能够放大', () => {
      const onZoomChange = vi.fn()
      cropper.on(CropperEventType.ZOOM_CHANGE, onZoomChange)

      cropper.zoomIn(0.2)

      expect(onZoomChange).toHaveBeenCalled()
    })

    it('应该能够缩小', () => {
      const onZoomChange = vi.fn()
      cropper.on(CropperEventType.ZOOM_CHANGE, onZoomChange)

      cropper.zoomOut(0.2)

      expect(onZoomChange).toHaveBeenCalled()
    })

    it('应该能够旋转', () => {
      const onRotationChange = vi.fn()
      cropper.on(CropperEventType.ROTATION_CHANGE, onRotationChange)

      cropper.rotate(90)

      expect(onRotationChange).toHaveBeenCalled()
    })

    it('应该能够向左旋转', () => {
      const onRotationChange = vi.fn()
      cropper.on(CropperEventType.ROTATION_CHANGE, onRotationChange)

      cropper.rotateLeft()

      expect(onRotationChange).toHaveBeenCalled()
    })

    it('应该能够向右旋转', () => {
      const onRotationChange = vi.fn()
      cropper.on(CropperEventType.ROTATION_CHANGE, onRotationChange)

      cropper.rotateRight()

      expect(onRotationChange).toHaveBeenCalled()
    })

    it('应该能够翻转', () => {
      const onFlipChange = vi.fn()
      cropper.on(CropperEventType.FLIP_CHANGE, onFlipChange)

      cropper.flip(true, false)

      expect(onFlipChange).toHaveBeenCalled()
    })

    it('应该能够水平翻转', () => {
      const onFlipChange = vi.fn()
      cropper.on(CropperEventType.FLIP_CHANGE, onFlipChange)

      cropper.flipHorizontal()

      expect(onFlipChange).toHaveBeenCalled()
    })

    it('应该能够垂直翻转', () => {
      const onFlipChange = vi.fn()
      cropper.on(CropperEventType.FLIP_CHANGE, onFlipChange)

      cropper.flipVertical()

      expect(onFlipChange).toHaveBeenCalled()
    })

    it('应该能够重置', () => {
      const onReset = vi.fn()
      cropper.on(CropperEventType.RESET, onReset)

      cropper.reset()

      expect(onReset).toHaveBeenCalled()
    })
  })

  describe('事件系统', () => {
    beforeEach(() => {
      cropper = new Cropper({
        container,
        shape: CropShape.RECTANGLE,
      })
    })

    it('应该能够添加事件监听器', () => {
      const listener = vi.fn()

      cropper.on(CropperEventType.CROP_CHANGE, listener)
      cropper.emit(CropperEventType.CROP_CHANGE, { test: true })

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: CropperEventType.CROP_CHANGE,
          test: true,
        })
      )
    })

    it('应该能够移除事件监听器', () => {
      const listener = vi.fn()

      cropper.on(CropperEventType.CROP_CHANGE, listener)
      cropper.off(CropperEventType.CROP_CHANGE, listener)
      cropper.emit(CropperEventType.CROP_CHANGE, { test: true })

      expect(listener).not.toHaveBeenCalled()
    })
  })

  describe('静态方法', () => {
    it('应该能够创建实例', () => {
      const instance = Cropper.create({
        container,
        shape: CropShape.RECTANGLE,
      })

      expect(instance).toBeInstanceOf(Cropper)
      instance.destroy()
    })

    it('应该能够检查兼容性', () => {
      const compatibility = Cropper.checkCompatibility()

      expect(compatibility).toHaveProperty('supported')
      expect(compatibility).toHaveProperty('features')
      expect(compatibility.features).toHaveProperty('canvas')
      expect(compatibility.features).toHaveProperty('fileReader')
      expect(compatibility.features).toHaveProperty('blob')
      expect(compatibility.features).toHaveProperty('touch')
    })

    it('应该能够获取版本信息', () => {
      const version = Cropper.getVersion()

      expect(typeof version).toBe('string')
      expect(version).toMatch(/^\d+\.\d+\.\d+/)
    })
  })

  describe('销毁', () => {
    it('应该能够正确销毁', () => {
      cropper = new Cropper({
        container,
        shape: CropShape.RECTANGLE,
      })

      expect(() => cropper.destroy()).not.toThrow()
    })

    it('销毁后应该无法使用', async () => {
      cropper = new Cropper({
        container,
        shape: CropShape.RECTANGLE,
      })

      cropper.destroy()

      await expect(cropper.setImage('test.jpg')).rejects.toThrow('destroyed')
    })
  })
})
