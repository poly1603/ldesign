/**
 * @ldesign/cropper - 核心裁剪器类
 * 
 * 整合所有功能模块的主要裁剪器类
 */

import type { 
  ImageSource, 
  CropData, 
  CropperConfig, 
  CropperAPI, 
  ExportOptions, 
  ExportResult,
  CropperEventMap,
  ImageMetadata,
  Size,
  Rect
} from '../types';

import { EventEmitter } from './EventEmitter';
import { ImageLoader } from './ImageLoader';
import { CanvasRenderer } from './CanvasRenderer';
import { CropAreaManager } from './CropAreaManager';
import { InteractionController } from '../interaction/InteractionController';
import { DEFAULT_CONFIG, EVENTS, ERROR_MESSAGES } from '../constants';
import { createCanvas, canvasToBlob, getImageDataURL } from '../utils';

/**
 * 核心裁剪器类
 * 
 * 提供完整的图片裁剪功能
 */
export class Cropper extends EventEmitter implements CropperAPI {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private renderer: CanvasRenderer;
  private cropAreaManager: CropAreaManager;
  private interactionController: InteractionController;
  private config: CropperConfig;
  private imageMetadata: ImageMetadata | null = null;
  private isReady: boolean = false;
  private isDestroyed: boolean = false;

  constructor(container: HTMLElement | string, config: Partial<CropperConfig> = {}) {
    super();

    // 获取容器元素
    if (typeof container === 'string') {
      const element = document.querySelector(container);
      if (!element) {
        throw new Error(`Container element not found: ${container}`);
      }
      this.container = element as HTMLElement;
    } else {
      this.container = container;
    }

    // 合并配置
    this.config = { ...DEFAULT_CONFIG, ...config };

    // 初始化组件
    this.initializeComponents();
    this.setupEventListeners();
    this.setupContainer();
  }

  /**
   * 初始化组件
   */
  private initializeComponents(): void {
    // 创建 Canvas
    this.canvas = createCanvas(0, 0);
    this.canvas.className = 'ldesign-cropper__canvas';

    // 初始化渲染器
    this.renderer = new CanvasRenderer(this.canvas);

    // 初始化裁剪区域管理器
    this.cropAreaManager = new CropAreaManager(this.config.cropOptions);

    // 初始化交互控制器
    this.interactionController = new InteractionController(this.container, this.cropAreaManager);
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 监听窗口大小变化
    window.addEventListener('resize', this.handleResize.bind(this));

    // 监听交互控制器事件
    this.interactionController.on('cropStart', (data) => {
      this.emit('cropStart', data);
    });

    this.interactionController.on('cropMove', (data) => {
      this.render();
      this.emit('cropMove', data);
    });

    this.interactionController.on('cropEnd', (data) => {
      this.emit('cropEnd', data);
    });

    this.interactionController.on('cropChange', (data) => {
      this.render();
      this.emit('cropChange', data);
    });
  }

  /**
   * 设置容器
   */
  private setupContainer(): void {
    // 设置容器样式
    this.container.className = `ldesign-cropper ${this.container.className}`.trim();
    this.container.setAttribute('data-theme', this.config.theme);

    // 添加 Canvas 到容器
    this.container.appendChild(this.canvas);

    // 设置初始尺寸
    this.updateSize();
  }

  /**
   * 更新尺寸
   */
  private updateSize(): void {
    const rect = this.container.getBoundingClientRect();
    const size: Size = {
      width: rect.width,
      height: rect.height
    };

    // 更新 Canvas 尺寸
    this.renderer.resize(size.width, size.height);

    // 更新裁剪区域管理器
    this.cropAreaManager.setContainerSize(size);

    // 重新渲染
    this.render();
  }

  /**
   * 处理窗口大小变化
   */
  private handleResize(): void {
    if (this.isDestroyed) return;
    this.updateSize();
  }

  /**
   * 设置图像源
   */
  async setImageSource(source: ImageSource): Promise<void> {
    try {
      this.emit('imageLoad', { type: 'imageLoad' });

      // 加载图像
      const image = await ImageLoader.loadImage(source);
      
      // 获取图像元数据
      this.imageMetadata = ImageLoader.getImageMetadata(
        image,
        source instanceof File ? source : undefined
      );

      // 设置图像到渲染器
      this.renderer.setImageData(image);

      // 设置图像尺寸到裁剪区域管理器
      this.cropAreaManager.setImageSize(this.imageMetadata.originalSize);

      // 初始化裁剪区域
      this.cropAreaManager.initializeCropArea(this.config.cropOptions.initialCrop);

      // 标记为就绪
      this.isReady = true;

      // 渲染
      this.render();

      // 触发就绪事件
      this.emit('ready', { 
        type: 'ready',
        imageMetadata: this.imageMetadata,
        cropData: this.cropAreaManager.getCropData()
      });

    } catch (error) {
      this.emit('imageError', { 
        type: 'imageError', 
        error: error as Error 
      });
      throw error;
    }
  }

  /**
   * 获取裁剪数据
   */
  getCropData(): CropData {
    return this.cropAreaManager.getCropData();
  }

  /**
   * 设置裁剪区域
   */
  setCropArea(area: Rect): void {
    this.cropAreaManager.setCropArea(area);
    this.render();
    this.emitCropChange();
  }

  /**
   * 设置宽高比
   */
  setAspectRatio(ratio: any): void {
    this.cropAreaManager.setAspectRatio(ratio);
    this.render();
    this.emitCropChange();
  }

  /**
   * 旋转
   */
  rotate(angle: number): void {
    const currentRotation = this.cropAreaManager.getCropData().rotation;
    this.cropAreaManager.setRotation(currentRotation + angle);
    this.render();
    this.emitCropChange();
  }

  /**
   * 缩放
   */
  scale(factor: number): void {
    const currentScale = this.cropAreaManager.getCropData().scale;
    this.cropAreaManager.setScale(currentScale * factor);
    this.render();
    this.emitCropChange();
  }

  /**
   * 翻转
   */
  flip(horizontal: boolean = false, vertical: boolean = false): void {
    const currentFlip = this.cropAreaManager.getCropData().flip;
    this.cropAreaManager.setFlip(
      horizontal ? !currentFlip.horizontal : currentFlip.horizontal,
      vertical ? !currentFlip.vertical : currentFlip.vertical
    );
    this.render();
    this.emitCropChange();
  }

  /**
   * 重置
   */
  reset(): void {
    this.cropAreaManager.reset();
    this.renderer.resetTransform();
    this.render();
    this.emitCropChange();
  }

  /**
   * 导出图像
   */
  async export(options: ExportOptions = {}): Promise<ExportResult> {
    if (!this.isReady || !this.imageMetadata) {
      throw new Error(ERROR_MESSAGES.EXPORT_FAILED);
    }

    try {
      const cropArea = this.cropAreaManager.getCropArea();
      const exportCanvas = this.renderer.exportImage(
        cropArea,
        options.size,
        options.quality?.format || 'png',
        options.quality?.quality || 1
      );

      // 转换为 Blob
      const blob = await canvasToBlob(
        exportCanvas,
        `image/${options.quality?.format || 'png'}`,
        options.quality?.quality || 1
      );

      // 获取数据 URL
      const dataURL = getImageDataURL(
        exportCanvas,
        `image/${options.quality?.format || 'png'}`,
        options.quality?.quality || 1
      );

      // 创建导出结果
      const result: ExportResult = {
        blob,
        dataURL,
        metadata: {
          ...this.imageMetadata,
          originalSize: {
            width: exportCanvas.width,
            height: exportCanvas.height
          },
          fileSize: blob.size
        }
      };

      return result;

    } catch (error) {
      throw new Error(`${ERROR_MESSAGES.EXPORT_FAILED}: ${error}`);
    }
  }

  /**
   * 渲染
   */
  private render(): void {
    if (!this.isReady) return;

    const cropArea = this.cropAreaManager.getCropArea();

    // 渲染图像
    this.renderer.renderImage(cropArea);

    // 绘制遮罩
    if (this.config.mask.show) {
      this.renderer.drawMask(cropArea);
    }

    // 绘制网格
    if (this.config.grid.show) {
      this.renderer.drawGrid(cropArea, this.config.grid.type);
    }

    // 绘制裁剪区域边框
    this.renderer.drawCropArea(cropArea);

    // 绘制控制点
    this.renderer.drawControlPoints(cropArea);
  }

  /**
   * 触发裁剪变化事件
   */
  private emitCropChange(): void {
    this.emit('cropChange', {
      type: 'cropChange',
      cropData: this.getCropData()
    });
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<CropperConfig>): void {
    this.config = { ...this.config, ...config };
    
    // 更新主题
    this.container.setAttribute('data-theme', this.config.theme);
    
    // 更新裁剪选项
    this.cropAreaManager.updateOptions(this.config.cropOptions);
    
    // 重新渲染
    this.render();
  }

  /**
   * 获取配置
   */
  getConfig(): CropperConfig {
    return { ...this.config };
  }

  /**
   * 获取图像元数据
   */
  getImageMetadata(): ImageMetadata | null {
    return this.imageMetadata ? { ...this.imageMetadata } : null;
  }

  /**
   * 检查是否就绪
   */
  getIsReady(): boolean {
    return this.isReady;
  }

  /**
   * 销毁裁剪器
   */
  destroy(): void {
    if (this.isDestroyed) return;

    // 移除事件监听器
    window.removeEventListener('resize', this.handleResize.bind(this));

    // 销毁组件
    this.renderer.destroy();
    this.interactionController.destroy();
    
    // 清理 DOM
    if (this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }

    // 清理事件监听器
    this.removeAllListeners();

    // 触发销毁事件
    this.emit('destroy', { type: 'destroy' });

    // 标记为已销毁
    this.isDestroyed = true;
  }
}
