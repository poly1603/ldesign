/**
 * @ldesign/cropper 主裁剪器类
 * 
 * 整合所有模块，提供统一的API接口
 */

import type {
  Point,
  Size,
  Rect,
  CropArea,
  CropShape,
  ImageInfo,
  CropperConfig,
  CropperEvent,
  ExportOptions,
  ExportResult
} from '../types';

import { ImageLoader } from './ImageLoader';
import { CanvasRenderer } from './CanvasRenderer';
import { CropAreaManager } from './CropAreaManager';
import { TransformManager } from './TransformManager';
import { EventManager } from './EventManager';
import { ControlPointManager } from './ControlPointManager';
import { ConfigManager } from './ConfigManager';
import { ThemeManager } from './ThemeManager';

import { isValidRect, isValidPoint, isString, isHTMLElement } from '../utils/validation';
import { globalPerformanceMonitor } from '../utils/performance';

// ============================================================================
// 默认配置
// ============================================================================

/**
 * 默认裁剪器配置
 */
export const DEFAULT_CROPPER_CONFIG: CropperConfig = {
  // 基础配置
  theme: 'light',
  language: 'zh-CN',
  responsive: true,

  // 裁剪配置
  shape: 'rectangle',
  aspectRatio: undefined,
  minCropSize: { width: 10, height: 10 },
  maxCropSize: undefined,

  // 变换配置
  minZoom: 0.1,
  maxZoom: 10,
  zoomStep: 0.1,
  enableRotation: true,
  rotationStep: 1,

  // 交互配置
  enableMouse: true,
  enableTouch: true,
  enableKeyboard: true,
  enableGestures: true,

  // UI配置
  showGrid: true,
  showCenterLines: true,
  showRuleOfThirds: false,
  showToolbar: true,
  showControlPoints: true,

  // 导出配置
  exportFormat: 'png',
  exportQuality: 0.9,
  exportBackground: 'transparent'
};

// ============================================================================
// 裁剪器状态
// ============================================================================

/**
 * 裁剪器状态接口
 */
export interface CropperState {
  /** 是否已初始化 */
  initialized: boolean;
  /** 是否有图片 */
  hasImage: boolean;
  /** 是否有裁剪区域 */
  hasCropArea: boolean;
  /** 是否正在加载 */
  loading: boolean;
  /** 是否正在交互 */
  interacting: boolean;
  /** 错误信息 */
  error: string | null;
}

// ============================================================================
// 主裁剪器类
// ============================================================================

/**
 * 主裁剪器类
 * 整合所有功能模块，提供统一的API接口
 */
export class Cropper {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private config: CropperConfig;
  private state: CropperState;

  // 核心模块
  private imageLoader: ImageLoader;
  private canvasRenderer: CanvasRenderer;
  private cropAreaManager: CropAreaManager;
  private transformManager: TransformManager;
  private eventManager: EventManager;
  private controlPointManager: ControlPointManager;
  private configManager: ConfigManager;
  private themeManager: ThemeManager;

  // 事件监听器
  private eventListeners: Map<string, Set<(event: CropperEvent) => void>> = new Map();

  // 当前数据
  private currentImage: ImageInfo | null = null;
  private currentCropArea: CropArea | null = null;

  constructor(container: string | HTMLElement, config: Partial<CropperConfig> = {}) {
    // 验证和设置容器
    this.container = this.resolveContainer(container);
    this.config = { ...DEFAULT_CROPPER_CONFIG, ...config };
    this.state = this.createInitialState();

    // 创建Canvas
    this.canvas = this.createCanvas();

    // 初始化模块
    this.initializeModules();

    // 设置事件监听
    this.setupEventListeners();

    // 标记为已初始化
    this.state.initialized = true;
    this.emitEvent('ready', { type: 'ready', timestamp: Date.now() });
  }

  // ============================================================================
  // 公共API - 图片操作
  // ============================================================================

  /**
   * 设置图片源
   * @param source 图片源
   * @returns Promise
   */
  async setImageSource(source: string | File | HTMLImageElement): Promise<void> {
    const startTime = performance.now();

    try {
      this.state.loading = true;
      this.state.error = null;
      this.emitEvent('image-load-start', { type: 'image-load-start', timestamp: Date.now() });

      // 加载图片
      const imageInfo = await this.imageLoader.loadImage(source);
      this.currentImage = imageInfo;
      this.state.hasImage = true;

      // 更新模块
      this.transformManager.setImageInfo(imageInfo);
      this.cropAreaManager.setImageInfo(imageInfo);

      // 适应容器
      this.transformManager.fitToContainer();

      // 创建默认裁剪区域
      this.createDefaultCropArea();

      // 渲染
      this.render();

      this.state.loading = false;
      this.emitEvent('image-loaded', {
        type: 'image-loaded',
        imageInfo,
        timestamp: Date.now()
      });

      globalPerformanceMonitor.record('cropper-set-image', performance.now() - startTime);
    } catch (error) {
      this.state.loading = false;
      this.state.error = error instanceof Error ? error.message : 'Unknown error';
      this.emitEvent('image-load-error', {
        type: 'image-load-error',
        error: this.state.error,
        timestamp: Date.now()
      });
      globalPerformanceMonitor.record('cropper-set-image-error', performance.now() - startTime);
      throw error;
    }
  }

  /**
   * 获取当前图片信息
   * @returns 图片信息
   */
  getImageInfo(): ImageInfo | null {
    return this.currentImage;
  }

  // ============================================================================
  // 公共API - 裁剪区域操作
  // ============================================================================

  /**
   * 设置裁剪区域
   * @param rect 矩形区域
   * @param shape 裁剪形状
   */
  setCropArea(rect: Rect, shape: CropShape = this.config.shape): void {
    if (!isValidRect(rect)) {
      throw new Error('Invalid crop area rectangle');
    }

    const cropArea = this.cropAreaManager.createCropArea(rect, shape);
    this.currentCropArea = cropArea;
    this.state.hasCropArea = true;

    // 更新控制点
    this.controlPointManager.setCropArea(cropArea);

    // 渲染
    this.render();

    this.emitEvent('crop-change', {
      type: 'crop-change',
      cropArea,
      timestamp: Date.now()
    });
  }

  /**
   * 获取当前裁剪区域
   * @returns 裁剪区域
   */
  getCropArea(): CropArea | null {
    return this.currentCropArea;
  }

  /**
   * 清除裁剪区域
   */
  clearCropArea(): void {
    this.currentCropArea = null;
    this.state.hasCropArea = false;
    this.cropAreaManager.clearCropArea();
    this.controlPointManager.setCropArea(null);
    this.render();

    this.emitEvent('crop-clear', {
      type: 'crop-clear',
      timestamp: Date.now()
    });
  }

  // ============================================================================
  // 公共API - 变换操作
  // ============================================================================

  /**
   * 设置缩放
   * @param scale 缩放比例
   * @param center 缩放中心点
   */
  setZoom(scale: number, center?: Point): void {
    this.transformManager.setZoom(scale, center);
    this.render();
  }

  /**
   * 缩放
   * @param delta 缩放增量
   * @param center 缩放中心点
   */
  zoom(delta: number, center?: Point): void {
    this.transformManager.zoom(delta, center);
    this.render();
  }

  /**
   * 设置旋转
   * @param rotation 旋转角度（度）
   * @param center 旋转中心点
   */
  setRotation(rotation: number, center?: Point): void {
    if (!this.config.enableRotation) {
      return;
    }
    this.transformManager.setRotation(rotation, center);
    this.render();
  }

  /**
   * 旋转
   * @param delta 旋转增量（度）
   * @param center 旋转中心点
   */
  rotate(delta: number, center?: Point): void {
    if (!this.config.enableRotation) {
      return;
    }
    this.transformManager.rotate(delta, center);
    this.render();
  }

  /**
   * 适应容器
   */
  fitToContainer(): void {
    this.transformManager.fitToContainer();
    this.render();
  }

  /**
   * 填充容器
   */
  fillContainer(): void {
    this.transformManager.fillContainer();
    this.render();
  }

  /**
   * 重置变换
   */
  resetTransform(): void {
    this.transformManager.resetTransform();
    this.render();
  }

  // ============================================================================
  // 公共API - 导出功能
  // ============================================================================

  /**
   * 导出裁剪结果
   * @param options 导出选项
   * @returns 导出结果
   */
  async export(options: Partial<ExportOptions> = {}): Promise<ExportResult> {
    if (!this.currentImage || !this.currentCropArea) {
      throw new Error('No image or crop area to export');
    }

    const exportOptions: ExportOptions = {
      format: options.format || this.config.exportFormat,
      quality: options.quality || this.config.exportQuality,
      width: options.width,
      height: options.height,
      background: options.background || this.config.exportBackground
    };

    const startTime = performance.now();

    try {
      // 获取实际裁剪矩形
      const actualCropRect = this.cropAreaManager.getActualCropRect(this.currentCropArea);
      if (!actualCropRect) {
        throw new Error('Failed to calculate crop rectangle');
      }

      // 导出
      const result = await this.canvasRenderer.exportCroppedImage(
        this.currentImage,
        actualCropRect,
        exportOptions
      );

      globalPerformanceMonitor.record('cropper-export', performance.now() - startTime);

      this.emitEvent('export', {
        type: 'export',
        result,
        options: exportOptions,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      globalPerformanceMonitor.record('cropper-export-error', performance.now() - startTime);
      throw error;
    }
  }

  // ============================================================================
  // 公共API - 状态和配置
  // ============================================================================

  /**
   * 获取当前状态
   * @returns 裁剪器状态
   */
  getState(): CropperState {
    return { ...this.state };
  }

  /**
   * 更新配置
   * @param config 新配置
   */
  updateConfig(config: Partial<CropperConfig>): void {
    this.config = { ...this.config, ...config };

    // 更新模块配置
    this.updateModuleConfigs();

    // 重新渲染
    this.render();

    this.emitEvent('config-change', {
      type: 'config-change',
      config: this.config,
      timestamp: Date.now()
    });
  }

  /**
   * 获取当前配置
   * @returns 当前配置
   */
  getConfig(): CropperConfig {
    return { ...this.config };
  }

  // ============================================================================
  // 公共API - 事件系统
  // ============================================================================

  /**
   * 添加事件监听器
   * @param type 事件类型
   * @param listener 监听器函数
   */
  on(type: string, listener: (event: CropperEvent) => void): void {
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
  off(type: string, listener: (event: CropperEvent) => void): void {
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  // ============================================================================
  // 配置和主题API
  // ============================================================================

  /**
   * 获取配置管理器
   * @returns 配置管理器实例
   */
  getConfigManager(): ConfigManager {
    return this.configManager;
  }

  /**
   * 获取主题管理器
   * @returns 主题管理器实例
   */
  getThemeManager(): ThemeManager {
    return this.themeManager;
  }

  /**
   * 设置主题
   * @param theme 主题名称
   */
  setTheme(theme: string): void {
    this.themeManager.setTheme(theme);
    this.render(); // 重新渲染以应用新主题
  }

  /**
   * 获取当前主题
   * @returns 当前主题名称
   */
  getCurrentTheme(): string {
    return this.themeManager.getCurrentTheme();
  }

  /**
   * 导出配置
   * @returns 配置JSON字符串
   */
  exportConfig(): string {
    return this.configManager.export();
  }

  /**
   * 导入配置
   * @param configJson 配置JSON字符串
   */
  importConfig(configJson: string): void {
    this.configManager.import(configJson);
    this.config = this.configManager.getConfig();
    this.render(); // 重新渲染以应用新配置
  }

  /**
   * 销毁裁剪器
   */
  destroy(): void {
    // 清理事件监听器
    this.eventListeners.clear();

    // 销毁模块
    this.eventManager.destroy();
    this.transformManager.destroy();
    this.configManager.destroy();
    this.themeManager.destroy();

    // 清理DOM
    if (this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }

    this.emitEvent('destroy', {
      type: 'destroy',
      timestamp: Date.now()
    });
  }

  // ============================================================================
  // 私有方法
  // ============================================================================

  /**
   * 解析容器
   * @param container 容器
   * @returns HTML元素
   */
  private resolveContainer(container: string | HTMLElement): HTMLElement {
    if (isString(container)) {
      const element = document.querySelector(container);
      if (!element || !isHTMLElement(element)) {
        throw new Error(`Container not found: ${container}`);
      }
      return element;
    }

    if (!isHTMLElement(container)) {
      throw new Error('Invalid container element');
    }

    return container;
  }

  /**
   * 创建Canvas
   * @returns Canvas元素
   */
  private createCanvas(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.style.display = 'block';
    canvas.style.maxWidth = '100%';
    canvas.style.maxHeight = '100%';
    this.container.appendChild(canvas);
    return canvas;
  }

  /**
   * 初始化模块
   */
  private initializeModules(): void {
    // 获取容器尺寸
    const containerRect = this.container.getBoundingClientRect();
    const containerSize = { width: containerRect.width, height: containerRect.height };

    // 初始化配置和主题管理器
    this.configManager = new ConfigManager(this.config);
    this.themeManager = new ThemeManager();

    // 初始化模块
    this.imageLoader = new ImageLoader();
    this.canvasRenderer = new CanvasRenderer(this.canvas);
    this.cropAreaManager = new CropAreaManager();
    this.transformManager = new TransformManager();
    this.eventManager = new EventManager(this.container);
    this.controlPointManager = new ControlPointManager();

    // 设置容器尺寸
    this.transformManager.setContainerSize(containerSize);
    this.cropAreaManager.setContainerSize(containerSize);
    this.controlPointManager.setContainerSize(containerSize);
  }

  /**
   * 设置事件监听
   */
  private setupEventListeners(): void {
    // 变换事件
    this.transformManager.addEventListener('transform-update', () => {
      this.render();
    });

    // 交互事件
    this.eventManager.addEventListener('mouse-down', (event: any) => {
      this.handleInteractionStart(event.point);
    });

    this.eventManager.addEventListener('mouse-move', (event: any) => {
      this.handleInteractionUpdate(event.point);
    });

    this.eventManager.addEventListener('mouse-up', () => {
      this.handleInteractionEnd();
    });

    // 触摸事件
    this.eventManager.addEventListener('touch-start', (event: any) => {
      this.handleInteractionStart(event.point);
    });

    this.eventManager.addEventListener('touch-move', (event: any) => {
      this.handleInteractionUpdate(event.point);
    });

    this.eventManager.addEventListener('touch-end', () => {
      this.handleInteractionEnd();
    });

    // 手势事件
    this.eventManager.addEventListener('gesture', (event: any) => {
      this.handleGesture(event);
    });

    // 窗口大小改变
    this.eventManager.addEventListener('resize', () => {
      this.handleResize();
    });
  }

  /**
   * 处理交互开始
   * @param point 交互位置
   */
  private handleInteractionStart(point: Point): void {
    // 检测控制点
    const controlPoint = this.controlPointManager.hitTest(point);
    if (controlPoint) {
      this.controlPointManager.startInteraction(point, controlPoint);
      this.state.interacting = true;
      return;
    }

    // TODO: 处理其他交互（如拖拽图片）
  }

  /**
   * 处理交互更新
   * @param point 当前位置
   */
  private handleInteractionUpdate(point: Point): void {
    if (this.state.interacting) {
      const updatedCropArea = this.controlPointManager.updateInteraction(point);
      if (updatedCropArea) {
        this.currentCropArea = updatedCropArea;
        this.render();
      }
    } else {
      // 更新悬停状态
      this.controlPointManager.setHoverPoint(point);
      this.render();
    }
  }

  /**
   * 处理交互结束
   */
  private handleInteractionEnd(): void {
    if (this.state.interacting) {
      this.controlPointManager.endInteraction();
      this.state.interacting = false;
    }
  }

  /**
   * 处理手势
   * @param event 手势事件
   */
  private handleGesture(event: any): void {
    if (event.type === 'pinch') {
      this.setZoom(event.scale, event.center);
    }
  }

  /**
   * 处理窗口大小改变
   */
  private handleResize(): void {
    const containerRect = this.container.getBoundingClientRect();
    const containerSize = { width: containerRect.width, height: containerRect.height };

    this.transformManager.setContainerSize(containerSize);
    this.cropAreaManager.setContainerSize(containerSize);
    this.controlPointManager.setContainerSize(containerSize);

    this.render();
  }

  /**
   * 创建默认裁剪区域
   */
  private createDefaultCropArea(): void {
    if (!this.currentImage) {
      return;
    }

    // 创建居中的默认裁剪区域
    const imageWidth = this.currentImage.naturalWidth;
    const imageHeight = this.currentImage.naturalHeight;

    let cropWidth = imageWidth * 0.8;
    let cropHeight = imageHeight * 0.8;

    // 应用宽高比
    if (this.config.aspectRatio) {
      const targetRatio = this.config.aspectRatio;
      const currentRatio = cropWidth / cropHeight;

      if (currentRatio > targetRatio) {
        cropWidth = cropHeight * targetRatio;
      } else {
        cropHeight = cropWidth / targetRatio;
      }
    }

    const cropRect = {
      x: (imageWidth - cropWidth) / 2,
      y: (imageHeight - cropHeight) / 2,
      width: cropWidth,
      height: cropHeight
    };

    this.setCropArea(cropRect, this.config.shape);
  }

  /**
   * 渲染
   */
  private render(): void {
    if (!this.currentImage) {
      this.canvasRenderer.clear();
      return;
    }

    // 渲染图片
    const transform = this.transformManager.getMatrix();
    this.canvasRenderer.renderImage(this.currentImage, transform);

    // 渲染裁剪区域
    if (this.currentCropArea && this.config.showGrid) {
      this.canvasRenderer.renderCropArea(this.currentCropArea);
    }

    // 渲染控制点
    if (this.currentCropArea && this.config.showControlPoints) {
      const controlPoints = this.controlPointManager.getControlPoints();
      controlPoints.forEach(point => {
        const style = this.controlPointManager.getControlPointStyle(point);
        this.canvasRenderer.renderControlPoint(point, style);
      });
    }
  }

  /**
   * 更新模块配置
   */
  private updateModuleConfigs(): void {
    // 更新变换管理器配置
    this.transformManager.updateConfig({
      minZoom: this.config.minZoom,
      maxZoom: this.config.maxZoom,
      smoothTransform: true
    });

    // 更新裁剪区域管理器配置
    this.cropAreaManager.updateConfig({
      defaultShape: this.config.shape,
      minCropSize: this.config.minCropSize,
      maxCropSize: this.config.maxCropSize
    });

    // 更新事件管理器配置
    this.eventManager.updateConfig({
      enableMouse: this.config.enableMouse,
      enableTouch: this.config.enableTouch,
      enableKeyboard: this.config.enableKeyboard,
      enableGestures: this.config.enableGestures
    });
  }

  /**
   * 创建初始状态
   * @returns 初始状态
   */
  private createInitialState(): CropperState {
    return {
      initialized: false,
      hasImage: false,
      hasCropArea: false,
      loading: false,
      interacting: false,
      error: null
    };
  }

  /**
   * 发射事件
   * @param type 事件类型
   * @param event 事件数据
   */
  private emitEvent(type: string, event: CropperEvent): void {
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error(`Error in event listener for ${type}:`, error);
        }
      });
    }
  }
}
