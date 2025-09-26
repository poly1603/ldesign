/**
 * @ldesign/cropper 控制点管理器
 * 
 * 负责管理裁剪区域的控制点，包括调整大小的控制点和旋转控制点
 */

import type { 
  Point, 
  Size, 
  Rect, 
  CropArea,
  ControlPoint,
  ControlPointType,
  ControlPointStyle
} from '../types';
import { 
  distance,
  isPointInRect,
  getRectCenter,
  transformPoint,
  createIdentityMatrix
} from '../utils/math';
import { isValidPoint, isValidRect } from '../utils/validation';
import { globalPerformanceMonitor } from '../utils/performance';

// ============================================================================
// 控制点管理器配置
// ============================================================================

/**
 * 控制点管理器配置接口
 */
export interface ControlPointManagerConfig {
  /** 控制点大小 */
  pointSize: number;
  /** 控制点边框宽度 */
  borderWidth: number;
  /** 控制点颜色 */
  pointColor: string;
  /** 控制点边框颜色 */
  borderColor: string;
  /** 悬停时的颜色 */
  hoverColor: string;
  /** 激活时的颜色 */
  activeColor: string;
  /** 旋转控制点距离 */
  rotationDistance: number;
  /** 是否显示旋转控制点 */
  showRotationPoint: boolean;
  /** 是否显示中心点 */
  showCenterPoint: boolean;
  /** 最小触摸区域 */
  minTouchArea: number;
  /** 是否启用响应式大小 */
  responsive: boolean;
  /** 移动端控制点大小倍数 */
  mobileScale: number;
}

/**
 * 默认控制点管理器配置
 */
export const DEFAULT_CONTROL_POINT_CONFIG: ControlPointManagerConfig = {
  pointSize: 8,
  borderWidth: 2,
  pointColor: 'var(--ldesign-brand-color)',
  borderColor: 'var(--ldesign-font-white-1)',
  hoverColor: 'var(--ldesign-brand-color-hover)',
  activeColor: 'var(--ldesign-brand-color-active)',
  rotationDistance: 30,
  showRotationPoint: true,
  showCenterPoint: false,
  minTouchArea: 44,
  responsive: true,
  mobileScale: 1.5
};

// ============================================================================
// 控制点交互状态
// ============================================================================

/**
 * 控制点交互状态接口
 */
export interface ControlPointInteraction {
  /** 是否正在交互 */
  active: boolean;
  /** 当前交互的控制点 */
  activePoint: ControlPoint | null;
  /** 交互开始位置 */
  startPosition: Point | null;
  /** 交互开始时的裁剪区域 */
  startCropArea: CropArea | null;
  /** 交互类型 */
  interactionType: 'resize' | 'rotate' | 'move' | null;
  /** 鼠标悬停的控制点 */
  hoverPoint: ControlPoint | null;
}

// ============================================================================
// 控制点管理器类
// ============================================================================

/**
 * 控制点管理器类
 * 负责管理裁剪区域的控制点系统
 */
export class ControlPointManager {
  private config: ControlPointManagerConfig;
  private controlPoints: ControlPoint[] = [];
  private interaction: ControlPointInteraction;
  private cropArea: CropArea | null = null;
  private containerSize: Size | null = null;
  private devicePixelRatio: number = 1;

  constructor(config: Partial<ControlPointManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONTROL_POINT_CONFIG, ...config };
    this.interaction = this.createInitialInteraction();
    this.devicePixelRatio = window.devicePixelRatio || 1;
  }

  /**
   * 设置裁剪区域
   * @param cropArea 裁剪区域
   */
  setCropArea(cropArea: CropArea | null): void {
    this.cropArea = cropArea;
    this.updateControlPoints();
  }

  /**
   * 设置容器尺寸
   * @param size 容器尺寸
   */
  setContainerSize(size: Size): void {
    this.containerSize = size;
    this.updateControlPoints();
  }

  /**
   * 获取所有控制点
   * @returns 控制点数组
   */
  getControlPoints(): ControlPoint[] {
    return [...this.controlPoints];
  }

  /**
   * 获取交互状态
   * @returns 交互状态
   */
  getInteractionState(): ControlPointInteraction {
    return { ...this.interaction };
  }

  /**
   * 检测点击的控制点
   * @param point 点击位置
   * @returns 被点击的控制点或null
   */
  hitTest(point: Point): ControlPoint | null {
    if (!isValidPoint(point)) {
      return null;
    }

    const startTime = performance.now();

    try {
      // 按优先级检测控制点（旋转点 > 调整点 > 中心点）
      const sortedPoints = [...this.controlPoints].sort((a, b) => {
        const priorityOrder = { rotation: 3, resize: 2, center: 1 };
        return priorityOrder[b.type] - priorityOrder[a.type];
      });

      for (const controlPoint of sortedPoints) {
        if (this.isPointInControlPoint(point, controlPoint)) {
          globalPerformanceMonitor.record('control-point-hit-test', performance.now() - startTime);
          return controlPoint;
        }
      }

      globalPerformanceMonitor.record('control-point-hit-test-miss', performance.now() - startTime);
      return null;
    } catch (error) {
      globalPerformanceMonitor.record('control-point-hit-test-error', performance.now() - startTime);
      throw error;
    }
  }

  /**
   * 开始交互
   * @param point 交互位置
   * @param controlPoint 控制点
   * @returns 是否成功开始交互
   */
  startInteraction(point: Point, controlPoint: ControlPoint): boolean {
    if (!isValidPoint(point) || !controlPoint || !this.cropArea) {
      return false;
    }

    this.interaction.active = true;
    this.interaction.activePoint = controlPoint;
    this.interaction.startPosition = point;
    this.interaction.startCropArea = { ...this.cropArea };
    this.interaction.interactionType = this.getInteractionType(controlPoint);

    return true;
  }

  /**
   * 更新交互
   * @param point 当前位置
   * @returns 更新后的裁剪区域
   */
  updateInteraction(point: Point): CropArea | null {
    if (!this.interaction.active || 
        !this.interaction.activePoint || 
        !this.interaction.startPosition || 
        !this.interaction.startCropArea ||
        !isValidPoint(point)) {
      return null;
    }

    const startTime = performance.now();

    try {
      const delta = {
        x: point.x - this.interaction.startPosition.x,
        y: point.y - this.interaction.startPosition.y
      };

      let updatedCropArea: CropArea | null = null;

      switch (this.interaction.interactionType) {
        case 'resize':
          updatedCropArea = this.handleResize(delta);
          break;
        case 'rotate':
          updatedCropArea = this.handleRotation(point);
          break;
        case 'move':
          updatedCropArea = this.handleMove(delta);
          break;
      }

      globalPerformanceMonitor.record('control-point-update-interaction', performance.now() - startTime);
      return updatedCropArea;
    } catch (error) {
      globalPerformanceMonitor.record('control-point-update-interaction-error', performance.now() - startTime);
      throw error;
    }
  }

  /**
   * 结束交互
   */
  endInteraction(): void {
    this.interaction.active = false;
    this.interaction.activePoint = null;
    this.interaction.startPosition = null;
    this.interaction.startCropArea = null;
    this.interaction.interactionType = null;
  }

  /**
   * 设置悬停控制点
   * @param point 鼠标位置
   */
  setHoverPoint(point: Point | null): void {
    if (!point) {
      this.interaction.hoverPoint = null;
      return;
    }

    this.interaction.hoverPoint = this.hitTest(point);
  }

  /**
   * 获取控制点样式
   * @param controlPoint 控制点
   * @returns 控制点样式
   */
  getControlPointStyle(controlPoint: ControlPoint): ControlPointStyle {
    const isHover = this.interaction.hoverPoint === controlPoint;
    const isActive = this.interaction.activePoint === controlPoint;
    
    let color = this.config.pointColor;
    if (isActive) {
      color = this.config.activeColor;
    } else if (isHover) {
      color = this.config.hoverColor;
    }

    const size = this.getResponsiveSize();

    return {
      size,
      color,
      borderColor: this.config.borderColor,
      borderWidth: this.config.borderWidth,
      cursor: this.getCursor(controlPoint),
      zIndex: this.getZIndex(controlPoint)
    };
  }

  /**
   * 更新配置
   * @param config 新配置
   */
  updateConfig(config: Partial<ControlPointManagerConfig>): void {
    this.config = { ...this.config, ...config };
    this.updateControlPoints();
  }

  /**
   * 更新控制点
   */
  private updateControlPoints(): void {
    if (!this.cropArea) {
      this.controlPoints = [];
      return;
    }

    const points: ControlPoint[] = [];
    const rect = this.cropArea.rect;
    const center = getRectCenter(rect);

    // 创建8个调整控制点
    const resizePoints = this.createResizePoints(rect);
    points.push(...resizePoints);

    // 创建旋转控制点
    if (this.config.showRotationPoint) {
      const rotationPoint = this.createRotationPoint(rect);
      if (rotationPoint) {
        points.push(rotationPoint);
      }
    }

    // 创建中心点
    if (this.config.showCenterPoint) {
      const centerPoint = this.createCenterPoint(center);
      if (centerPoint) {
        points.push(centerPoint);
      }
    }

    this.controlPoints = points;
  }

  /**
   * 创建调整控制点
   * @param rect 矩形区域
   * @returns 调整控制点数组
   */
  private createResizePoints(rect: Rect): ControlPoint[] {
    const points: ControlPoint[] = [];
    const { x, y, width, height } = rect;

    // 8个方向的控制点
    const positions = [
      { x: x, y: y, direction: 'nw' },                    // 左上
      { x: x + width / 2, y: y, direction: 'n' },        // 上中
      { x: x + width, y: y, direction: 'ne' },           // 右上
      { x: x + width, y: y + height / 2, direction: 'e' }, // 右中
      { x: x + width, y: y + height, direction: 'se' },   // 右下
      { x: x + width / 2, y: y + height, direction: 's' }, // 下中
      { x: x, y: y + height, direction: 'sw' },           // 左下
      { x: x, y: y + height / 2, direction: 'w' }         // 左中
    ];

    positions.forEach((pos, index) => {
      points.push({
        id: `resize-${pos.direction}`,
        type: 'resize',
        position: { x: pos.x, y: pos.y },
        direction: pos.direction as any,
        index,
        visible: true,
        interactive: true
      });
    });

    return points;
  }

  /**
   * 创建旋转控制点
   * @param rect 矩形区域
   * @returns 旋转控制点
   */
  private createRotationPoint(rect: Rect): ControlPoint | null {
    const center = getRectCenter(rect);
    const rotationY = rect.y - this.config.rotationDistance;

    return {
      id: 'rotation',
      type: 'rotation',
      position: { x: center.x, y: rotationY },
      direction: 'rotation',
      index: -1,
      visible: true,
      interactive: true
    };
  }

  /**
   * 创建中心点
   * @param center 中心位置
   * @returns 中心点
   */
  private createCenterPoint(center: Point): ControlPoint | null {
    return {
      id: 'center',
      type: 'center',
      position: center,
      direction: 'center',
      index: -2,
      visible: true,
      interactive: true
    };
  }

  /**
   * 检查点是否在控制点内
   * @param point 检测点
   * @param controlPoint 控制点
   * @returns 是否在控制点内
   */
  private isPointInControlPoint(point: Point, controlPoint: ControlPoint): boolean {
    const size = this.getResponsiveSize();
    const touchArea = Math.max(size, this.config.minTouchArea);
    const halfSize = touchArea / 2;

    const controlRect = {
      x: controlPoint.position.x - halfSize,
      y: controlPoint.position.y - halfSize,
      width: touchArea,
      height: touchArea
    };

    return isPointInRect(point, controlRect);
  }

  /**
   * 获取交互类型
   * @param controlPoint 控制点
   * @returns 交互类型
   */
  private getInteractionType(controlPoint: ControlPoint): 'resize' | 'rotate' | 'move' {
    switch (controlPoint.type) {
      case 'resize':
        return 'resize';
      case 'rotation':
        return 'rotate';
      case 'center':
        return 'move';
      default:
        return 'resize';
    }
  }

  /**
   * 处理调整大小
   * @param delta 移动增量
   * @returns 更新后的裁剪区域
   */
  private handleResize(delta: Point): CropArea | null {
    if (!this.interaction.activePoint || !this.interaction.startCropArea) {
      return null;
    }

    const direction = this.interaction.activePoint.direction;
    const startRect = this.interaction.startCropArea.rect;
    let newRect = { ...startRect };

    // 根据方向调整矩形
    switch (direction) {
      case 'nw': // 左上
        newRect.x = startRect.x + delta.x;
        newRect.y = startRect.y + delta.y;
        newRect.width = startRect.width - delta.x;
        newRect.height = startRect.height - delta.y;
        break;
      case 'n': // 上中
        newRect.y = startRect.y + delta.y;
        newRect.height = startRect.height - delta.y;
        break;
      case 'ne': // 右上
        newRect.y = startRect.y + delta.y;
        newRect.width = startRect.width + delta.x;
        newRect.height = startRect.height - delta.y;
        break;
      case 'e': // 右中
        newRect.width = startRect.width + delta.x;
        break;
      case 'se': // 右下
        newRect.width = startRect.width + delta.x;
        newRect.height = startRect.height + delta.y;
        break;
      case 's': // 下中
        newRect.height = startRect.height + delta.y;
        break;
      case 'sw': // 左下
        newRect.x = startRect.x + delta.x;
        newRect.width = startRect.width - delta.x;
        newRect.height = startRect.height + delta.y;
        break;
      case 'w': // 左中
        newRect.x = startRect.x + delta.x;
        newRect.width = startRect.width - delta.x;
        break;
    }

    // 确保最小尺寸
    const minSize = 10;
    if (newRect.width < minSize || newRect.height < minSize) {
      return null;
    }

    return {
      ...this.interaction.startCropArea,
      rect: newRect
    };
  }

  /**
   * 处理旋转
   * @param currentPoint 当前位置
   * @returns 更新后的裁剪区域
   */
  private handleRotation(currentPoint: Point): CropArea | null {
    if (!this.interaction.startCropArea) {
      return null;
    }

    const center = getRectCenter(this.interaction.startCropArea.rect);
    const startAngle = Math.atan2(
      this.interaction.startPosition!.y - center.y,
      this.interaction.startPosition!.x - center.x
    );
    const currentAngle = Math.atan2(
      currentPoint.y - center.y,
      currentPoint.x - center.x
    );

    const deltaAngle = currentAngle - startAngle;
    const newRotation = this.interaction.startCropArea.rotation + deltaAngle;

    return {
      ...this.interaction.startCropArea,
      rotation: newRotation
    };
  }

  /**
   * 处理移动
   * @param delta 移动增量
   * @returns 更新后的裁剪区域
   */
  private handleMove(delta: Point): CropArea | null {
    if (!this.interaction.startCropArea) {
      return null;
    }

    const newRect = {
      ...this.interaction.startCropArea.rect,
      x: this.interaction.startCropArea.rect.x + delta.x,
      y: this.interaction.startCropArea.rect.y + delta.y
    };

    return {
      ...this.interaction.startCropArea,
      rect: newRect
    };
  }

  /**
   * 获取响应式大小
   * @returns 控制点大小
   */
  private getResponsiveSize(): number {
    if (!this.config.responsive) {
      return this.config.pointSize;
    }

    // 检测移动设备
    const isMobile = 'ontouchstart' in window;
    const scale = isMobile ? this.config.mobileScale : 1;
    
    return this.config.pointSize * scale * this.devicePixelRatio;
  }

  /**
   * 获取鼠标样式
   * @param controlPoint 控制点
   * @returns 鼠标样式
   */
  private getCursor(controlPoint: ControlPoint): string {
    switch (controlPoint.direction) {
      case 'nw':
      case 'se':
        return 'nw-resize';
      case 'ne':
      case 'sw':
        return 'ne-resize';
      case 'n':
      case 's':
        return 'ns-resize';
      case 'e':
      case 'w':
        return 'ew-resize';
      case 'rotation':
        return 'crosshair';
      case 'center':
        return 'move';
      default:
        return 'default';
    }
  }

  /**
   * 获取层级
   * @param controlPoint 控制点
   * @returns 层级值
   */
  private getZIndex(controlPoint: ControlPoint): number {
    switch (controlPoint.type) {
      case 'rotation':
        return 1000;
      case 'resize':
        return 999;
      case 'center':
        return 998;
      default:
        return 997;
    }
  }

  /**
   * 创建初始交互状态
   * @returns 初始交互状态
   */
  private createInitialInteraction(): ControlPointInteraction {
    return {
      active: false,
      activePoint: null,
      startPosition: null,
      startCropArea: null,
      interactionType: null,
      hoverPoint: null
    };
  }
}
