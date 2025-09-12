/**
 * @file 控制点管理器
 * @description 管理裁剪区域的控制点和调整手柄
 */

import type { Point, CropArea, Rectangle } from '@/types'
import { CropShape } from '@/types'
import { MathUtils } from '@/utils'

/**
 * 控制点类型
 */
export enum ControlPointType {
  // 角点
  TOP_LEFT = 'top-left',
  TOP_RIGHT = 'top-right',
  BOTTOM_LEFT = 'bottom-left',
  BOTTOM_RIGHT = 'bottom-right',
  // 边中点
  TOP = 'top',
  RIGHT = 'right',
  BOTTOM = 'bottom',
  LEFT = 'left',
  // 中心点
  CENTER = 'center',
  // 旋转点
  ROTATE = 'rotate',
}

/**
 * 控制点数据
 */
export interface ControlPoint {
  /** 控制点类型 */
  type: ControlPointType
  /** 位置 */
  position: Point
  /** 是否可见 */
  visible: boolean
  /** 是否激活 */
  active: boolean
  /** 光标样式 */
  cursor: string
  /** 大小 */
  size: number
}

/**
 * 控制点管理器配置
 */
export interface ControlPointsManagerOptions {
  /** 控制点大小 */
  pointSize: number
  /** 旋转点距离 */
  rotatePointDistance: number
  /** 是否显示角点 */
  showCorners: boolean
  /** 是否显示边中点 */
  showEdges: boolean
  /** 是否显示中心点 */
  showCenter: boolean
  /** 是否显示旋转点 */
  showRotate: boolean
  /** 最小检测距离 */
  hitTestDistance: number
}

/**
 * 控制点管理器类
 * 管理裁剪区域的控制点和调整手柄
 */
export class ControlPointsManager {
  /** 配置选项 */
  private options: ControlPointsManagerOptions

  /** 控制点列表 */
  private controlPoints: ControlPoint[] = []

  /** 当前激活的控制点 */
  private activePoint: ControlPoint | null = null

  /** 默认配置 */
  private static readonly DEFAULT_OPTIONS: ControlPointsManagerOptions = {
    pointSize: 8,
    rotatePointDistance: 30,
    showCorners: true,
    showEdges: true,
    showCenter: false,
    showRotate: true,
    hitTestDistance: 15,
  }

  /** 控制点光标映射 */
  private static readonly CURSOR_MAP: Record<ControlPointType, string> = {
    [ControlPointType.TOP_LEFT]: 'nw-resize',
    [ControlPointType.TOP_RIGHT]: 'ne-resize',
    [ControlPointType.BOTTOM_LEFT]: 'sw-resize',
    [ControlPointType.BOTTOM_RIGHT]: 'se-resize',
    [ControlPointType.TOP]: 'n-resize',
    [ControlPointType.RIGHT]: 'e-resize',
    [ControlPointType.BOTTOM]: 's-resize',
    [ControlPointType.LEFT]: 'w-resize',
    [ControlPointType.CENTER]: 'move',
    [ControlPointType.ROTATE]: 'crosshair',
  }

  /**
   * 构造函数
   * @param options 配置选项
   */
  constructor(options: Partial<ControlPointsManagerOptions> = {}) {
    this.options = { ...ControlPointsManager.DEFAULT_OPTIONS, ...options }
  }

  /**
   * 更新控制点位置
   * @param cropArea 裁剪区域
   */
  updateControlPoints(cropArea: CropArea): void {
    this.controlPoints = []

    // 根据裁剪形状生成不同的控制点
    switch (cropArea.shape) {
      case CropShape.RECTANGLE:
        this.generateRectangleControlPoints(cropArea)
        break
      case CropShape.CIRCLE:
        this.generateCircleControlPoints(cropArea)
        break
      case CropShape.ELLIPSE:
        this.generateEllipseControlPoints(cropArea)
        break
      default:
        this.generateRectangleControlPoints(cropArea)
    }
  }

  /**
   * 获取所有控制点
   */
  getControlPoints(): ControlPoint[] {
    return [...this.controlPoints]
  }

  /**
   * 获取可见的控制点
   */
  getVisibleControlPoints(): ControlPoint[] {
    return this.controlPoints.filter(point => point.visible)
  }

  /**
   * 点击测试 - 检查点是否在控制点上
   * @param point 测试点
   * @returns 命中的控制点或 null
   */
  hitTest(point: Point): ControlPoint | null {
    const distance = this.options.hitTestDistance

    for (const controlPoint of this.controlPoints) {
      if (!controlPoint.visible) continue

      const dist = MathUtils.distance(point, controlPoint.position)
      if (dist <= distance) {
        return controlPoint
      }
    }

    return null
  }

  /**
   * 设置激活的控制点
   * @param point 控制点
   */
  setActivePoint(point: ControlPoint | null): void {
    // 重置所有控制点的激活状态
    this.controlPoints.forEach(cp => {
      cp.active = false
    })

    // 设置新的激活控制点
    this.activePoint = point
    if (point) {
      point.active = true
    }
  }

  /**
   * 获取当前激活的控制点
   */
  getActivePoint(): ControlPoint | null {
    return this.activePoint
  }

  /**
   * 根据控制点类型获取光标样式
   * @param type 控制点类型
   * @returns 光标样式
   */
  getCursor(type: ControlPointType): string {
    return ControlPointsManager.CURSOR_MAP[type] || 'default'
  }

  /**
   * 更新配置
   * @param options 新配置
   */
  updateOptions(options: Partial<ControlPointsManagerOptions>): void {
    this.options = { ...this.options, ...options }
  }

  /**
   * 生成矩形控制点
   * @param cropArea 裁剪区域
   */
  private generateRectangleControlPoints(cropArea: CropArea): void {
    const { x, y, width, height } = cropArea
    const halfWidth = width / 2
    const halfHeight = height / 2

    // 角点
    if (this.options.showCorners) {
      this.addControlPoint(ControlPointType.TOP_LEFT, { x, y })
      this.addControlPoint(ControlPointType.TOP_RIGHT, { x: x + width, y })
      this.addControlPoint(ControlPointType.BOTTOM_LEFT, { x, y: y + height })
      this.addControlPoint(ControlPointType.BOTTOM_RIGHT, { x: x + width, y: y + height })
    }

    // 边中点
    if (this.options.showEdges) {
      this.addControlPoint(ControlPointType.TOP, { x: x + halfWidth, y })
      this.addControlPoint(ControlPointType.RIGHT, { x: x + width, y: y + halfHeight })
      this.addControlPoint(ControlPointType.BOTTOM, { x: x + halfWidth, y: y + height })
      this.addControlPoint(ControlPointType.LEFT, { x, y: y + halfHeight })
    }

    // 中心点
    if (this.options.showCenter) {
      this.addControlPoint(ControlPointType.CENTER, { x: x + halfWidth, y: y + halfHeight })
    }

    // 旋转点
    if (this.options.showRotate) {
      this.addControlPoint(ControlPointType.ROTATE, {
        x: x + halfWidth,
        y: y - this.options.rotatePointDistance,
      })
    }
  }

  /**
   * 生成圆形控制点
   * @param cropArea 裁剪区域
   */
  private generateCircleControlPoints(cropArea: CropArea): void {
    const { x, y, width, height } = cropArea
    const centerX = x + width / 2
    const centerY = y + height / 2
    const radius = Math.min(width, height) / 2

    // 圆形只显示四个方向的控制点
    if (this.options.showEdges) {
      this.addControlPoint(ControlPointType.TOP, { x: centerX, y: centerY - radius })
      this.addControlPoint(ControlPointType.RIGHT, { x: centerX + radius, y: centerY })
      this.addControlPoint(ControlPointType.BOTTOM, { x: centerX, y: centerY + radius })
      this.addControlPoint(ControlPointType.LEFT, { x: centerX - radius, y: centerY })
    }

    // 中心点
    if (this.options.showCenter) {
      this.addControlPoint(ControlPointType.CENTER, { x: centerX, y: centerY })
    }

    // 旋转点
    if (this.options.showRotate) {
      this.addControlPoint(ControlPointType.ROTATE, {
        x: centerX,
        y: centerY - radius - this.options.rotatePointDistance,
      })
    }
  }

  /**
   * 生成椭圆控制点
   * @param cropArea 裁剪区域
   */
  private generateEllipseControlPoints(cropArea: CropArea): void {
    const { x, y, width, height } = cropArea
    const centerX = x + width / 2
    const centerY = y + height / 2
    const radiusX = width / 2
    const radiusY = height / 2

    // 椭圆显示四个方向的控制点
    if (this.options.showEdges) {
      this.addControlPoint(ControlPointType.TOP, { x: centerX, y: centerY - radiusY })
      this.addControlPoint(ControlPointType.RIGHT, { x: centerX + radiusX, y: centerY })
      this.addControlPoint(ControlPointType.BOTTOM, { x: centerX, y: centerY + radiusY })
      this.addControlPoint(ControlPointType.LEFT, { x: centerX - radiusX, y: centerY })
    }

    // 角点（椭圆的外接矩形角点）
    if (this.options.showCorners) {
      this.addControlPoint(ControlPointType.TOP_LEFT, { x, y })
      this.addControlPoint(ControlPointType.TOP_RIGHT, { x: x + width, y })
      this.addControlPoint(ControlPointType.BOTTOM_LEFT, { x, y: y + height })
      this.addControlPoint(ControlPointType.BOTTOM_RIGHT, { x: x + width, y: y + height })
    }

    // 中心点
    if (this.options.showCenter) {
      this.addControlPoint(ControlPointType.CENTER, { x: centerX, y: centerY })
    }

    // 旋转点
    if (this.options.showRotate) {
      this.addControlPoint(ControlPointType.ROTATE, {
        x: centerX,
        y: centerY - radiusY - this.options.rotatePointDistance,
      })
    }
  }

  /**
   * 添加控制点
   * @param type 控制点类型
   * @param position 位置
   */
  private addControlPoint(type: ControlPointType, position: Point): void {
    const controlPoint: ControlPoint = {
      type,
      position,
      visible: true,
      active: false,
      cursor: this.getCursor(type),
      size: this.options.pointSize,
    }

    this.controlPoints.push(controlPoint)
  }

  /**
   * 计算调整后的裁剪区域
   * @param controlPoint 控制点
   * @param delta 移动偏移量
   * @param originalCropArea 原始裁剪区域
   * @param keepAspectRatio 是否保持宽高比
   * @returns 调整后的裁剪区域
   */
  calculateResizedCropArea(
    controlPoint: ControlPoint,
    delta: Point,
    originalCropArea: CropArea,
    keepAspectRatio = false,
  ): Partial<CropArea> {
    const { x, y, width, height } = originalCropArea
    let newX = x
    let newY = y
    let newWidth = width
    let newHeight = height

    switch (controlPoint.type) {
      case ControlPointType.TOP_LEFT:
        newX = x + delta.x
        newY = y + delta.y
        newWidth = width - delta.x
        newHeight = height - delta.y
        break

      case ControlPointType.TOP_RIGHT:
        newY = y + delta.y
        newWidth = width + delta.x
        newHeight = height - delta.y
        break

      case ControlPointType.BOTTOM_LEFT:
        newX = x + delta.x
        newWidth = width - delta.x
        newHeight = height + delta.y
        break

      case ControlPointType.BOTTOM_RIGHT:
        newWidth = width + delta.x
        newHeight = height + delta.y
        break

      case ControlPointType.TOP:
        newY = y + delta.y
        newHeight = height - delta.y
        break

      case ControlPointType.RIGHT:
        newWidth = width + delta.x
        break

      case ControlPointType.BOTTOM:
        newHeight = height + delta.y
        break

      case ControlPointType.LEFT:
        newX = x + delta.x
        newWidth = width - delta.x
        break

      case ControlPointType.CENTER:
        newX = x + delta.x
        newY = y + delta.y
        break
    }

    // 应用宽高比约束
    if (keepAspectRatio && originalCropArea.shape === CropShape.RECTANGLE) {
      const aspectRatio = originalCropArea.width / originalCropArea.height
      
      // 根据宽度调整高度
      if (Math.abs(delta.x) > Math.abs(delta.y)) {
        newHeight = newWidth / aspectRatio
      } else {
        newWidth = newHeight * aspectRatio
      }
    }

    // 确保尺寸为正数
    if (newWidth < 0) {
      newX += newWidth
      newWidth = -newWidth
    }
    if (newHeight < 0) {
      newY += newHeight
      newHeight = -newHeight
    }

    return {
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
    }
  }
}
