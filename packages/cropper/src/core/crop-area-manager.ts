/**
 * @file 裁剪区域管理器
 * @description 管理裁剪区域的创建、更新、验证和约束
 */

import type { CropArea, Size, Point, Rectangle } from '@/types'
import { CropShape } from '@/types'
import { MathUtils } from '@/utils'

/**
 * 裁剪约束配置
 */
export interface CropConstraints {
  /** 最小尺寸 */
  minSize?: Size
  /** 最大尺寸 */
  maxSize?: Size
  /** 宽高比 */
  aspectRatio?: number
  /** 是否保持宽高比 */
  keepAspectRatio?: boolean
  /** 边界矩形 */
  bounds?: Rectangle
}

/**
 * 裁剪区域管理器类
 * 提供裁剪区域的创建、更新、验证等功能
 */
export class CropAreaManager {
  /** 当前裁剪区域 */
  private cropArea: CropArea

  /** 裁剪约束 */
  private constraints: Required<CropConstraints>

  /** 默认约束 */
  private defaultConstraints: Required<CropConstraints> = {
    minSize: { width: 10, height: 10 },
    maxSize: { width: Infinity, height: Infinity },
    aspectRatio: 0, // 0 表示不限制宽高比
    keepAspectRatio: false,
    bounds: { x: 0, y: 0, width: Infinity, height: Infinity },
  }

  /**
   * 构造函数
   * @param initialCrop 初始裁剪区域
   * @param constraints 约束配置
   */
  constructor(
    initialCrop: Partial<CropArea> = {},
    constraints: Partial<CropConstraints> = {},
  ) {
    this.constraints = { ...this.defaultConstraints, ...constraints }

    // 创建默认裁剪区域
    this.cropArea = {
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      shape: CropShape.RECTANGLE,
      rotation: 0,
      flipX: false,
      flipY: false,
      ...initialCrop,
    }

    // 应用约束
    this.applyCropConstraints()
  }

  /**
   * 获取当前裁剪区域
   * @returns 裁剪区域
   */
  getCropArea(): CropArea {
    return { ...this.cropArea }
  }

  /**
   * 设置裁剪区域
   * @param cropArea 新的裁剪区域
   * @returns 是否设置成功
   */
  setCropArea(cropArea: Partial<CropArea>): boolean {
    const newCropArea = { ...this.cropArea, ...cropArea }

    if (this.validateCropArea(newCropArea)) {
      this.cropArea = newCropArea
      this.applyCropConstraints()
      return true
    }

    return false
  }

  /**
   * 移动裁剪区域
   * @param deltaX X 轴偏移
   * @param deltaY Y 轴偏移
   * @returns 是否移动成功
   */
  moveCropArea(deltaX: number, deltaY: number): boolean {
    const newX = this.cropArea.x + deltaX
    const newY = this.cropArea.y + deltaY

    // 检查边界约束
    const bounds = this.constraints.bounds
    const maxX = bounds.x + bounds.width - this.cropArea.width
    const maxY = bounds.y + bounds.height - this.cropArea.height

    const constrainedX = MathUtils.clamp(newX, bounds.x, maxX)
    const constrainedY = MathUtils.clamp(newY, bounds.y, maxY)

    if (constrainedX !== this.cropArea.x || constrainedY !== this.cropArea.y) {
      this.cropArea.x = constrainedX
      this.cropArea.y = constrainedY
      return true
    }

    return false
  }

  /**
   * 调整裁剪区域大小
   * @param deltaWidth 宽度变化
   * @param deltaHeight 高度变化
   * @param anchor 锚点位置
   * @returns 是否调整成功
   */
  resizeCropArea(
    deltaWidth: number,
    deltaHeight: number,
    anchor: 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' = 'se',
  ): boolean {
    let newWidth = this.cropArea.width + deltaWidth
    let newHeight = this.cropArea.height + deltaHeight
    let newX = this.cropArea.x
    let newY = this.cropArea.y

    // 应用宽高比约束
    if (this.constraints.keepAspectRatio && this.constraints.aspectRatio > 0) {
      const ratio = this.constraints.aspectRatio

      // 根据变化较大的维度来调整
      if (Math.abs(deltaWidth) > Math.abs(deltaHeight)) {
        newHeight = newWidth / ratio
      } else {
        newWidth = newHeight * ratio
      }
    }

    // 应用尺寸约束
    newWidth = MathUtils.clamp(newWidth, this.constraints.minSize.width, this.constraints.maxSize.width)
    newHeight = MathUtils.clamp(newHeight, this.constraints.minSize.height, this.constraints.maxSize.height)

    // 根据锚点调整位置
    switch (anchor) {
      case 'nw':
        newX = this.cropArea.x + this.cropArea.width - newWidth
        newY = this.cropArea.y + this.cropArea.height - newHeight
        break
      case 'n':
        newX = this.cropArea.x + (this.cropArea.width - newWidth) / 2
        newY = this.cropArea.y + this.cropArea.height - newHeight
        break
      case 'ne':
        newY = this.cropArea.y + this.cropArea.height - newHeight
        break
      case 'e':
        newY = this.cropArea.y + (this.cropArea.height - newHeight) / 2
        break
      case 'se':
        // 默认情况，不需要调整位置
        break
      case 's':
        newX = this.cropArea.x + (this.cropArea.width - newWidth) / 2
        break
      case 'sw':
        newX = this.cropArea.x + this.cropArea.width - newWidth
        break
      case 'w':
        newX = this.cropArea.x + this.cropArea.width - newWidth
        newY = this.cropArea.y + (this.cropArea.height - newHeight) / 2
        break
    }

    // 检查边界约束
    const bounds = this.constraints.bounds
    const maxX = bounds.x + bounds.width - newWidth
    const maxY = bounds.y + bounds.height - newHeight

    newX = MathUtils.clamp(newX, bounds.x, maxX)
    newY = MathUtils.clamp(newY, bounds.y, maxY)

    // 如果位置或尺寸发生变化，则更新
    if (
      newX !== this.cropArea.x ||
      newY !== this.cropArea.y ||
      newWidth !== this.cropArea.width ||
      newHeight !== this.cropArea.height
    ) {
      this.cropArea.x = newX
      this.cropArea.y = newY
      this.cropArea.width = newWidth
      this.cropArea.height = newHeight
      return true
    }

    return false
  }

  /**
   * 旋转裁剪区域
   * @param angle 旋转角度（度）
   * @returns 是否旋转成功
   */
  rotateCropArea(angle: number): boolean {
    const newRotation = (this.cropArea.rotation || 0) + angle

    // 标准化角度到 0-360 度
    const normalizedRotation = ((newRotation % 360) + 360) % 360

    if (normalizedRotation !== this.cropArea.rotation) {
      this.cropArea.rotation = normalizedRotation
      return true
    }

    return false
  }

  /**
   * 翻转裁剪区域
   * @param horizontal 是否水平翻转
   * @param vertical 是否垂直翻转
   * @returns 是否翻转成功
   */
  flipCropArea(horizontal?: boolean, vertical?: boolean): boolean {
    let changed = false

    if (horizontal !== undefined && horizontal !== this.cropArea.flipX) {
      this.cropArea.flipX = horizontal
      changed = true
    }

    if (vertical !== undefined && vertical !== this.cropArea.flipY) {
      this.cropArea.flipY = vertical
      changed = true
    }

    return changed
  }

  /**
   * 设置裁剪形状
   * @param shape 新形状
   * @returns 是否设置成功
   */
  setCropShape(shape: CropShape): boolean {
    if (shape !== this.cropArea.shape) {
      this.cropArea.shape = shape

      // 对于圆形，确保宽高相等
      if (shape === CropShape.CIRCLE) {
        const size = Math.min(this.cropArea.width, this.cropArea.height)
        this.cropArea.width = size
        this.cropArea.height = size
      }

      return true
    }

    return false
  }

  /**
   * 重置裁剪区域到中心位置
   * @param containerSize 容器尺寸
   * @param defaultSize 默认尺寸
   */
  resetToCenter(containerSize: Size, defaultSize?: Size): void {
    const size = defaultSize || {
      width: Math.min(containerSize.width * 0.8, 200),
      height: Math.min(containerSize.height * 0.8, 200),
    }

    this.cropArea = {
      x: (containerSize.width - size.width) / 2,
      y: (containerSize.height - size.height) / 2,
      width: size.width,
      height: size.height,
      shape: this.cropArea.shape,
      rotation: 0,
      flipX: false,
      flipY: false,
    }

    this.applyCropConstraints()
  }

  /**
   * 更新约束
   * @param constraints 新约束
   */
  updateConstraints(constraints: Partial<CropConstraints>): void {
    this.constraints = { ...this.constraints, ...constraints }
    this.applyCropConstraints()
  }

  /**
   * 获取当前约束
   * @returns 约束配置
   */
  getConstraints(): CropConstraints {
    return { ...this.constraints }
  }

  /**
   * 检查点是否在裁剪区域内
   * @param point 点坐标
   * @returns 是否在区域内
   */
  isPointInCropArea(point: Point): boolean {
    switch (this.cropArea.shape) {
      case CropShape.RECTANGLE:
        return MathUtils.isPointInRect(point, this.cropArea)

      case CropShape.CIRCLE: {
        const center = {
          x: this.cropArea.x + this.cropArea.width / 2,
          y: this.cropArea.y + this.cropArea.height / 2,
        }
        const radius = Math.min(this.cropArea.width, this.cropArea.height) / 2
        return MathUtils.isPointInCircle(point, center, radius)
      }

      case CropShape.ELLIPSE: {
        const center = {
          x: this.cropArea.x + this.cropArea.width / 2,
          y: this.cropArea.y + this.cropArea.height / 2,
        }
        const a = this.cropArea.width / 2
        const b = this.cropArea.height / 2
        const dx = point.x - center.x
        const dy = point.y - center.y
        return (dx * dx) / (a * a) + (dy * dy) / (b * b) <= 1
      }

      default:
        return MathUtils.isPointInRect(point, this.cropArea)
    }
  }

  /**
   * 验证裁剪区域
   * @param cropArea 要验证的裁剪区域
   * @returns 是否有效
   */
  private validateCropArea(cropArea: CropArea): boolean {
    // 检查尺寸
    if (cropArea.width <= 0 || cropArea.height <= 0) {
      return false
    }

    // 检查边界
    const bounds = this.constraints.bounds
    if (
      cropArea.x < bounds.x ||
      cropArea.y < bounds.y ||
      cropArea.x + cropArea.width > bounds.x + bounds.width ||
      cropArea.y + cropArea.height > bounds.y + bounds.height
    ) {
      return false
    }

    return true
  }

  /**
   * 应用裁剪约束
   */
  private applyCropConstraints(): void {
    // 应用尺寸约束
    this.cropArea.width = MathUtils.clamp(
      this.cropArea.width,
      this.constraints.minSize.width,
      this.constraints.maxSize.width,
    )
    this.cropArea.height = MathUtils.clamp(
      this.cropArea.height,
      this.constraints.minSize.height,
      this.constraints.maxSize.height,
    )

    // 应用宽高比约束
    if (this.constraints.keepAspectRatio && this.constraints.aspectRatio > 0) {
      const ratio = this.constraints.aspectRatio
      const currentRatio = this.cropArea.width / this.cropArea.height

      if (Math.abs(currentRatio - ratio) > 0.01) {
        if (currentRatio > ratio) {
          this.cropArea.width = this.cropArea.height * ratio
        } else {
          this.cropArea.height = this.cropArea.width / ratio
        }
      }
    }

    // 应用边界约束
    const bounds = this.constraints.bounds
    const maxX = bounds.x + bounds.width - this.cropArea.width
    const maxY = bounds.y + bounds.height - this.cropArea.height

    this.cropArea.x = MathUtils.clamp(this.cropArea.x, bounds.x, maxX)
    this.cropArea.y = MathUtils.clamp(this.cropArea.y, bounds.y, maxY)
  }

  /**
   * 设置裁剪形状
   * @param shape 新的裁剪形状
   */
  setShape(shape: CropShape): void {
    if (this.cropArea.shape !== shape) {
      this.cropArea.shape = shape
      // 形状改变时，可能需要调整裁剪区域以适应新形状
      this.applyCropConstraints()
    }
  }

  /**
   * 设置宽高比
   * @param aspectRatio 新的宽高比，null表示自由比例
   */
  setAspectRatio(aspectRatio: number | null): void {
    const newRatio = aspectRatio || 0
    if (this.constraints.aspectRatio !== newRatio) {
      this.constraints.aspectRatio = newRatio
      this.constraints.keepAspectRatio = aspectRatio !== null

      // 如果设置了宽高比，调整当前裁剪区域
      if (aspectRatio !== null) {
        const currentRatio = this.cropArea.width / this.cropArea.height
        if (Math.abs(currentRatio - aspectRatio) > 0.01) {
          // 保持中心点不变，调整尺寸
          const centerX = this.cropArea.x + this.cropArea.width / 2
          const centerY = this.cropArea.y + this.cropArea.height / 2

          if (currentRatio > aspectRatio) {
            // 当前比例太宽，调整宽度
            this.cropArea.width = this.cropArea.height * aspectRatio
          } else {
            // 当前比例太高，调整高度
            this.cropArea.height = this.cropArea.width / aspectRatio
          }

          // 重新定位到中心
          this.cropArea.x = centerX - this.cropArea.width / 2
          this.cropArea.y = centerY - this.cropArea.height / 2

          // 验证和调整边界
          this.applyCropConstraints()
        }
      }
    }
  }
}
