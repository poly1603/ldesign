/**
 * @ldesign/cropper 变换管理器
 * 
 * 负责管理图片和裁剪区域的各种变换操作，包括缩放、旋转、平移等
 */

import type {
  Point,
  Size,
  Rect,
  Matrix,
  ImageTransform,
  ImageInfo
} from '../types';
import {
  createIdentityMatrix,
  createTranslateMatrix,
  createScaleMatrix,
  createRotateMatrix,
  multiplyMatrix,
  transformPoint,
  invertMatrix,
  clamp,
  degreesToRadians,
  radiansToDegrees,
  isNearlyEqual
} from '../utils/math';
import { isValidPoint, isValidSize, isNumber } from '../utils/validation';
import { globalPerformanceMonitor } from '../utils/performance';

// ============================================================================
// 变换管理器配置
// ============================================================================

/**
 * 变换管理器配置接口
 */
export interface TransformManagerConfig {
  /** 最小缩放比例 */
  minZoom: number;
  /** 最大缩放比例 */
  maxZoom: number;
  /** 缩放步长 */
  zoomStep: number;
  /** 最小旋转角度（度） */
  minRotation: number;
  /** 最大旋转角度（度） */
  maxRotation: number;
  /** 旋转步长（度） */
  rotationStep: number;
  /** 是否启用平滑变换 */
  smoothTransform: boolean;
  /** 变换动画持续时间（毫秒） */
  animationDuration: number;
  /** 是否保持图片在视口内 */
  keepInBounds: boolean;
  /** 边界填充 */
  boundsPadding: number;
}

/**
 * 默认变换管理器配置
 */
export const DEFAULT_TRANSFORM_CONFIG: TransformManagerConfig = {
  minZoom: 0.1,
  maxZoom: 10,
  zoomStep: 0.1,
  minRotation: -360,
  maxRotation: 360,
  rotationStep: 1,
  smoothTransform: true,
  animationDuration: 300,
  keepInBounds: true,
  boundsPadding: 20
};

// ============================================================================
// 变换状态
// ============================================================================

/**
 * 变换状态接口
 */
export interface TransformState {
  /** 变换矩阵 */
  matrix: Matrix;
  /** 缩放比例 */
  scale: number;
  /** 旋转角度（弧度） */
  rotation: number;
  /** 平移偏移 */
  translation: Point;
  /** 是否正在动画中 */
  animating: boolean;
  /** 变换历史 */
  history: Matrix[];
  /** 历史索引 */
  historyIndex: number;
}

// ============================================================================
// 变换事件
// ============================================================================

/**
 * 变换事件类型
 */
export type TransformEventType =
  | 'transform-start'
  | 'transform-update'
  | 'transform-end'
  | 'zoom-change'
  | 'rotation-change'
  | 'translation-change';

/**
 * 变换事件接口
 */
export interface TransformEvent {
  type: TransformEventType;
  state: TransformState;
  delta?: Partial<TransformState>;
  timestamp: number;
}

// ============================================================================
// 变换管理器类
// ============================================================================

/**
 * 变换管理器类
 * 负责管理图片和裁剪区域的各种变换操作
 */
export class TransformManager {
  private config: TransformManagerConfig;
  private state: TransformState;
  private imageInfo: ImageInfo | null = null;
  private containerSize: Size | null = null;
  private eventListeners: Map<TransformEventType, Set<(event: TransformEvent) => void>> = new Map();
  private animationId?: number;

  constructor(config: Partial<TransformManagerConfig> = {}) {
    this.config = { ...DEFAULT_TRANSFORM_CONFIG, ...config };
    this.state = this.createInitialState();
  }

  /**
   * 设置图片信息
   * @param imageInfo 图片信息
   */
  setImageInfo(imageInfo: ImageInfo): void {
    this.imageInfo = imageInfo;
    this.resetTransform();
  }

  /**
   * 设置容器尺寸
   * @param size 容器尺寸
   */
  setContainerSize(size: Size): void {
    this.containerSize = size;
    this.fitToContainer();
  }

  /**
   * 获取当前变换状态
   * @returns 变换状态
   */
  getState(): TransformState {
    return { ...this.state };
  }

  /**
   * 获取当前变换矩阵
   * @returns 变换矩阵
   */
  getMatrix(): Matrix {
    return { ...this.state.matrix };
  }

  /**
   * 设置缩放比例
   * @param scale 缩放比例
   * @param center 缩放中心点
   * @param animate 是否使用动画
   */
  setZoom(scale: number, center?: Point, animate: boolean = false): void {
    const startTime = performance.now();

    try {
      // 限制缩放范围
      const clampedScale = clamp(scale, this.config.minZoom, this.config.maxZoom);

      if (isNearlyEqual(clampedScale, this.state.scale)) {
        return;
      }

      const scaleRatio = clampedScale / this.state.scale;
      const zoomCenter = center || this.getImageCenter();

      if (animate && this.config.smoothTransform) {
        this.animateZoom(clampedScale, zoomCenter);
      } else {
        this.applyZoom(scaleRatio, zoomCenter);
      }

      globalPerformanceMonitor.record('transform-zoom', performance.now() - startTime);
    } catch (error) {
      globalPerformanceMonitor.record('transform-zoom-error', performance.now() - startTime);
      throw error;
    }
  }

  /**
   * 缩放到指定比例
   * @param delta 缩放增量
   * @param center 缩放中心点
   */
  zoom(delta: number, center?: Point): void {
    const newScale = this.state.scale + delta;
    this.setZoom(newScale, center);
  }

  /**
   * 设置旋转角度
   * @param rotation 旋转角度（度）
   * @param center 旋转中心点
   * @param animate 是否使用动画
   */
  setRotation(rotation: number, center?: Point, animate: boolean = false): void {
    const startTime = performance.now();

    try {
      // 限制旋转范围
      const clampedRotation = clamp(rotation, this.config.minRotation, this.config.maxRotation);
      const rotationRad = degreesToRadians(clampedRotation);

      if (isNearlyEqual(rotationRad, this.state.rotation)) {
        return;
      }

      const rotationCenter = center || this.getImageCenter();

      if (animate && this.config.smoothTransform) {
        this.animateRotation(rotationRad, rotationCenter);
      } else {
        this.applyRotation(rotationRad - this.state.rotation, rotationCenter);
      }

      globalPerformanceMonitor.record('transform-rotation', performance.now() - startTime);
    } catch (error) {
      globalPerformanceMonitor.record('transform-rotation-error', performance.now() - startTime);
      throw error;
    }
  }

  /**
   * 旋转指定角度
   * @param delta 旋转增量（度）
   * @param center 旋转中心点
   */
  rotate(delta: number, center?: Point): void {
    const newRotation = radiansToDegrees(this.state.rotation) + delta;
    this.setRotation(newRotation, center);
  }

  /**
   * 设置平移偏移
   * @param translation 平移偏移
   * @param animate 是否使用动画
   */
  setTranslation(translation: Point, animate: boolean = false): void {
    const startTime = performance.now();

    try {
      if (!isValidPoint(translation)) {
        throw new Error('Invalid translation point');
      }

      if (animate && this.config.smoothTransform) {
        this.animateTranslation(translation);
      } else {
        this.applyTranslation(translation);
      }

      globalPerformanceMonitor.record('transform-translation', performance.now() - startTime);
    } catch (error) {
      globalPerformanceMonitor.record('transform-translation-error', performance.now() - startTime);
      throw error;
    }
  }

  /**
   * 平移指定距离
   * @param delta 平移增量
   */
  translate(delta: Point): void {
    const newTranslation = {
      x: this.state.translation.x + delta.x,
      y: this.state.translation.y + delta.y
    };
    this.setTranslation(newTranslation);
  }

  /**
   * 适应容器大小
   */
  fitToContainer(): void {
    if (!this.imageInfo || !this.containerSize) {
      return;
    }

    const imageAspect = this.imageInfo.naturalWidth / this.imageInfo.naturalHeight;
    const containerAspect = this.containerSize.width / this.containerSize.height;

    let scale: number;
    if (imageAspect > containerAspect) {
      // 图片更宽，以宽度为准
      scale = (this.containerSize.width - this.config.boundsPadding * 2) / this.imageInfo.naturalWidth;
    } else {
      // 图片更高，以高度为准
      scale = (this.containerSize.height - this.config.boundsPadding * 2) / this.imageInfo.naturalHeight;
    }

    // 居中显示
    const translation = {
      x: (this.containerSize.width - this.imageInfo.naturalWidth * scale) / 2,
      y: (this.containerSize.height - this.imageInfo.naturalHeight * scale) / 2
    };

    this.resetTransform();
    this.setZoom(scale);
    this.setTranslation(translation);
  }

  /**
   * 填充容器
   */
  fillContainer(): void {
    if (!this.imageInfo || !this.containerSize) {
      return;
    }

    const imageAspect = this.imageInfo.naturalWidth / this.imageInfo.naturalHeight;
    const containerAspect = this.containerSize.width / this.containerSize.height;

    let scale: number;
    if (imageAspect > containerAspect) {
      // 图片更宽，以高度为准
      scale = this.containerSize.height / this.imageInfo.naturalHeight;
    } else {
      // 图片更高，以宽度为准
      scale = this.containerSize.width / this.imageInfo.naturalWidth;
    }

    // 居中显示
    const translation = {
      x: (this.containerSize.width - this.imageInfo.naturalWidth * scale) / 2,
      y: (this.containerSize.height - this.imageInfo.naturalHeight * scale) / 2
    };

    this.resetTransform();
    this.setZoom(scale);
    this.setTranslation(translation);
  }

  /**
   * 重置变换
   */
  resetTransform(): void {
    this.state = this.createInitialState();
    this.emitEvent('transform-update', this.state);
  }

  /**
   * 撤销变换
   */
  undo(): boolean {
    if (this.state.historyIndex > 0) {
      this.state.historyIndex--;
      this.state.matrix = { ...this.state.history[this.state.historyIndex] };
      this.updateStateFromMatrix();
      this.emitEvent('transform-update', this.state);
      return true;
    }
    return false;
  }

  /**
   * 重做变换
   */
  redo(): boolean {
    if (this.state.historyIndex < this.state.history.length - 1) {
      this.state.historyIndex++;
      this.state.matrix = { ...this.state.history[this.state.historyIndex] };
      this.updateStateFromMatrix();
      this.emitEvent('transform-update', this.state);
      return true;
    }
    return false;
  }

  /**
   * 将屏幕坐标转换为图片坐标
   * @param screenPoint 屏幕坐标
   * @returns 图片坐标
   */
  screenToImage(screenPoint: Point): Point | null {
    const inverseMatrix = invertMatrix(this.state.matrix);
    if (!inverseMatrix) {
      return null;
    }
    return transformPoint(screenPoint, inverseMatrix);
  }

  /**
   * 将图片坐标转换为屏幕坐标
   * @param imagePoint 图片坐标
   * @returns 屏幕坐标
   */
  imageToScreen(imagePoint: Point): Point {
    return transformPoint(imagePoint, this.state.matrix);
  }

  /**
   * 添加事件监听器
   * @param type 事件类型
   * @param listener 监听器函数
   */
  addEventListener(type: TransformEventType, listener: (event: TransformEvent) => void): void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, new Set());
    }
    this.eventListeners.get(type)!.add(listener);
  }

  /**
   * 移除事件监听器
   * @param type 事件类型
   * @param listener 监听器函数
   */
  removeEventListener(type: TransformEventType, listener: (event: TransformEvent) => void): void {
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * 更新配置
   * @param config 新配置
   */
  updateConfig(config: Partial<TransformManagerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.eventListeners.clear();
  }

  /**
   * 创建初始状态
   * @returns 初始状态
   */
  private createInitialState(): TransformState {
    const matrix = createIdentityMatrix();
    return {
      matrix,
      scale: 1,
      rotation: 0,
      translation: { x: 0, y: 0 },
      animating: false,
      history: [matrix],
      historyIndex: 0
    };
  }

  /**
   * 应用缩放
   * @param scaleRatio 缩放比例
   * @param center 缩放中心点
   */
  private applyZoom(scaleRatio: number, center: Point): void {
    // 先平移到缩放中心
    const translateToCenter = createTranslateMatrix(-center.x, -center.y);
    // 应用缩放
    const scale = createScaleMatrix(scaleRatio, scaleRatio);
    // 平移回原位置
    const translateBack = createTranslateMatrix(center.x, center.y);

    // 组合变换
    let transform = multiplyMatrix(translateToCenter, scale);
    transform = multiplyMatrix(transform, translateBack);

    // 应用到当前矩阵
    this.state.matrix = multiplyMatrix(this.state.matrix, transform);
    this.state.scale *= scaleRatio;

    this.addToHistory();
    this.emitEvent('zoom-change', this.state);
  }

  /**
   * 应用旋转
   * @param angle 旋转角度（弧度）
   * @param center 旋转中心点
   */
  private applyRotation(angle: number, center: Point): void {
    // 先平移到旋转中心
    const translateToCenter = createTranslateMatrix(-center.x, -center.y);
    // 应用旋转
    const rotation = createRotateMatrix(angle);
    // 平移回原位置
    const translateBack = createTranslateMatrix(center.x, center.y);

    // 组合变换
    let transform = multiplyMatrix(translateToCenter, rotation);
    transform = multiplyMatrix(transform, translateBack);

    // 应用到当前矩阵
    this.state.matrix = multiplyMatrix(this.state.matrix, transform);
    this.state.rotation += angle;

    this.addToHistory();
    this.emitEvent('rotation-change', this.state);
  }

  /**
   * 应用平移
   * @param translation 平移偏移
   */
  private applyTranslation(translation: Point): void {
    const delta = {
      x: translation.x - this.state.translation.x,
      y: translation.y - this.state.translation.y
    };

    const translateMatrix = createTranslateMatrix(delta.x, delta.y);
    this.state.matrix = multiplyMatrix(this.state.matrix, translateMatrix);
    this.state.translation = translation;

    this.addToHistory();
    this.emitEvent('translation-change', this.state);
  }

  /**
   * 获取图片中心点
   * @returns 图片中心点
   */
  private getImageCenter(): Point {
    if (!this.imageInfo) {
      return { x: 0, y: 0 };
    }
    return {
      x: this.imageInfo.naturalWidth / 2,
      y: this.imageInfo.naturalHeight / 2
    };
  }

  /**
   * 从矩阵更新状态
   */
  private updateStateFromMatrix(): void {
    // 这里需要从矩阵中提取缩放、旋转和平移信息
    // 简化实现，实际应用中可能需要更复杂的矩阵分解
    this.state.scale = Math.sqrt(this.state.matrix.a * this.state.matrix.a + this.state.matrix.b * this.state.matrix.b);
    this.state.rotation = Math.atan2(this.state.matrix.b, this.state.matrix.a);
    this.state.translation = { x: this.state.matrix.e, y: this.state.matrix.f };
  }

  /**
   * 添加到历史记录
   */
  private addToHistory(): void {
    // 移除当前索引之后的历史记录
    this.state.history = this.state.history.slice(0, this.state.historyIndex + 1);
    // 添加新的变换矩阵
    this.state.history.push({ ...this.state.matrix });
    this.state.historyIndex = this.state.history.length - 1;

    // 限制历史记录数量
    const maxHistory = 50;
    if (this.state.history.length > maxHistory) {
      this.state.history = this.state.history.slice(-maxHistory);
      this.state.historyIndex = this.state.history.length - 1;
    }
  }

  /**
   * 动画缩放
   * @param targetScale 目标缩放比例
   * @param center 缩放中心点
   */
  private animateZoom(targetScale: number, center: Point): void {
    // 简化实现，实际应用中需要更复杂的动画系统
    const startScale = this.state.scale;
    const startTime = performance.now();
    const duration = this.config.animationDuration;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // 使用缓动函数
      const easeProgress = this.easeInOutCubic(progress);
      const currentScale = startScale + (targetScale - startScale) * easeProgress;

      const scaleRatio = currentScale / this.state.scale;
      this.applyZoom(scaleRatio, center);

      if (progress < 1) {
        this.animationId = requestAnimationFrame(animate);
      } else {
        this.state.animating = false;
        this.emitEvent('transform-end', this.state);
      }
    };

    this.state.animating = true;
    this.emitEvent('transform-start', this.state);
    this.animationId = requestAnimationFrame(animate);
  }

  /**
   * 动画旋转
   * @param targetRotation 目标旋转角度（弧度）
   * @param center 旋转中心点
   */
  private animateRotation(targetRotation: number, center: Point): void {
    // 类似于动画缩放的实现
    const startRotation = this.state.rotation;
    const startTime = performance.now();
    const duration = this.config.animationDuration;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeProgress = this.easeInOutCubic(progress);
      const currentRotation = startRotation + (targetRotation - startRotation) * easeProgress;

      const rotationDelta = currentRotation - this.state.rotation;
      this.applyRotation(rotationDelta, center);

      if (progress < 1) {
        this.animationId = requestAnimationFrame(animate);
      } else {
        this.state.animating = false;
        this.emitEvent('transform-end', this.state);
      }
    };

    this.state.animating = true;
    this.emitEvent('transform-start', this.state);
    this.animationId = requestAnimationFrame(animate);
  }

  /**
   * 动画平移
   * @param targetTranslation 目标平移偏移
   */
  private animateTranslation(targetTranslation: Point): void {
    // 类似于其他动画的实现
    const startTranslation = { ...this.state.translation };
    const startTime = performance.now();
    const duration = this.config.animationDuration;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeProgress = this.easeInOutCubic(progress);
      const currentTranslation = {
        x: startTranslation.x + (targetTranslation.x - startTranslation.x) * easeProgress,
        y: startTranslation.y + (targetTranslation.y - startTranslation.y) * easeProgress
      };

      this.applyTranslation(currentTranslation);

      if (progress < 1) {
        this.animationId = requestAnimationFrame(animate);
      } else {
        this.state.animating = false;
        this.emitEvent('transform-end', this.state);
      }
    };

    this.state.animating = true;
    this.emitEvent('transform-start', this.state);
    this.animationId = requestAnimationFrame(animate);
  }

  /**
   * 缓动函数
   * @param t 进度（0-1）
   * @returns 缓动后的进度
   */
  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /**
   * 发射事件
   * @param type 事件类型
   * @param state 状态
   * @param delta 变化量
   */
  private emitEvent(type: TransformEventType, state: TransformState, delta?: Partial<TransformState>): void {
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      const event: TransformEvent = {
        type,
        state: { ...state },
        delta,
        timestamp: Date.now()
      };
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error('Error in transform event listener:', error);
        }
      });
    }
  }

  /**
   * 更新变换矩阵
   */
  private updateMatrix(): void {
    const { scale, rotation, translation } = this.state;

    // 创建变换矩阵
    const scaleMatrix = createScaleMatrix(scale, scale);
    const rotationMatrix = createRotateMatrix(rotation);
    const translationMatrix = createTranslateMatrix(translation.x, translation.y);

    // 组合变换：先缩放，再旋转，最后平移
    let result = multiplyMatrix(scaleMatrix, rotationMatrix);
    result = multiplyMatrix(result, translationMatrix);

    this.matrix = result;
  }

  /**
   * 发射变换更新事件
   */
  private emitTransformUpdate(): void {
    this.emitEvent('transform-update', this.state);
  }

  /**
   * 停止动画
   */
  private stopAnimation(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = undefined;
    }
    this.state.animating = false;
  }

  /**
   * 清除历史记录
   */
  private clearHistory(): void {
    this.history = [];
    this.historyIndex = -1;
  }

  /**
   * 居中图片
   */
  private centerImage(): void {
    if (!this.containerSize || !this.imageInfo) {
      return;
    }

    const centerX = this.containerSize.width / 2;
    const centerY = this.containerSize.height / 2;

    this.setTranslation({ x: centerX, y: centerY });
  }

  // ============================================================================
  // 公共API方法
  // ============================================================================

  /**
   * 设置图片信息
   * @param imageInfo 图片信息
   */
  setImageInfo(imageInfo: any): void {
    this.imageInfo = imageInfo;
    this.resetTransform();
  }

  /**
   * 缩放
   * @param delta 缩放增量
   * @param center 缩放中心点
   */
  zoom(delta: number, center?: Point): void {
    const newScale = this.state.scale + delta;
    this.setZoom(newScale, center);
  }

  /**
   * 旋转
   * @param delta 旋转增量（度）
   * @param center 旋转中心点
   */
  rotate(delta: number, center?: Point): void {
    const newRotation = this.state.rotation + delta;
    this.setRotation(newRotation, center);
  }

  /**
   * 填充容器
   */
  fillContainer(): void {
    if (!this.imageInfo || !this.containerSize) {
      return;
    }

    const imageAspect = this.imageInfo.naturalWidth / this.imageInfo.naturalHeight;
    const containerAspect = this.containerSize.width / this.containerSize.height;

    let scale: number;
    if (imageAspect > containerAspect) {
      // 图片更宽，以高度为准
      scale = this.containerSize.height / this.imageInfo.naturalHeight;
    } else {
      // 图片更高，以宽度为准
      scale = this.containerSize.width / this.imageInfo.naturalWidth;
    }

    this.setZoom(scale);
    this.centerImage();
  }

  /**
   * 重置变换
   */
  resetTransform(): void {
    this.state = {
      scale: 1,
      rotation: 0,
      translation: { x: 0, y: 0 },
      animating: false
    };
    this.updateMatrix();
    this.emitTransformUpdate();
  }

  /**
   * 获取变换矩阵
   * @returns 变换矩阵
   */
  getMatrix(): Matrix {
    return { ...this.matrix };
  }

  /**
   * 添加事件监听器
   * @param type 事件类型
   * @param listener 监听器函数
   */
  addEventListener(type: string, listener: (event: any) => void): void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, new Set());
    }
    this.eventListeners.get(type)!.add(listener);
  }

  /**
   * 销毁变换管理器
   */
  destroy(): void {
    this.stopAnimation();
    this.clearHistory();
    this.eventListeners.clear();
  }
}
