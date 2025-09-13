/**
 * 现代化裁剪器组件 - 整合完整样式系统
 * 包含背景层、图片滤镜、裁剪框、拖拽点、工具栏等完整功能
 */

import { CropperStyleManager, CropperThemes, FilterPresets } from './cropper-styles';

// 裁剪器配置接口
export interface ModernCropperOptions {
  container: HTMLElement | string;
  theme?: string;
  aspectRatio?: number | 'free';
  minSize?: { width: number; height: number };
  maxSize?: { width: number; height: number };
  showGrid?: boolean;
  showToolbar?: boolean;
  toolbarPosition?: 'top' | 'bottom' | 'left' | 'right' | 'floating';
  enableFilters?: boolean;
  quality?: number;
}

// 裁剪区域数据
export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
  rotate?: number;
  scaleX?: number;
  scaleY?: number;
}

// 事件类型
export type CropperEventType = 
  | 'ready' 
  | 'cropstart' 
  | 'cropmove' 
  | 'cropend' 
  | 'zoom' 
  | 'rotate' 
  | 'filter'
  | 'themechange';

// 现代化裁剪器主类
export class ModernCropper {
  private container: HTMLElement;
  private styleManager: CropperStyleManager;
  private options: ModernCropperOptions;
  private eventListeners: Map<CropperEventType, Function[]> = new Map();
  
  // DOM 元素
  private elements = {
    background: null as HTMLElement | null,
    imageContainer: null as HTMLElement | null,
    image: null as HTMLImageElement | null,
    overlay: null as HTMLElement | null,
    cropBox: null as HTMLElement | null,
    grid: null as HTMLElement | null,
    handles: [] as HTMLElement[],
    toolbar: null as HTMLElement | null,
  };
  
  // 状态数据
  private state = {
    ready: false,
    cropping: false,
    imageLoaded: false,
    originalImageSize: { width: 0, height: 0 },
    containerSize: { width: 0, height: 0 },
    imageDisplaySize: { width: 0, height: 0 },
    cropData: { x: 0, y: 0, width: 0, height: 0 } as CropData,
    currentFilter: 'none',
    isResizing: false,
    resizeHandle: '',
    startPoint: { x: 0, y: 0 },
    startCropData: { x: 0, y: 0, width: 0, height: 0 } as CropData,
  };
  
  constructor(options: ModernCropperOptions) {
    this.options = {
      theme: 'modern',
      aspectRatio: 'free',
      showGrid: true,
      showToolbar: true,
      toolbarPosition: 'top',
      enableFilters: true,
      quality: 0.9,
      ...options,
    };
    
    // 初始化容器
    if (typeof options.container === 'string') {
      this.container = document.querySelector(options.container)!;
    } else {
      this.container = options.container;
    }
    
    if (!this.container) {
      throw new Error('Container element not found');
    }
    
    // 确保容器有 ID
    if (!this.container.id) {
      this.container.id = `cropper-${Date.now()}`;
    }
    
    // 初始化样式管理器
    this.styleManager = new CropperStyleManager(this.container, this.options.theme);
    
    // 初始化组件
    this.initializeDOM();
    this.bindEvents();
    this.updateContainerSize();
    
    // 标记为准备就绪
    this.state.ready = true;
    this.emit('ready');
  }
  
  /**
   * 初始化 DOM 结构
   */
  private initializeDOM(): void {
    // 清空容器
    this.container.innerHTML = '';
    this.container.className = 'cropper-container';
    
    // 创建背景层
    this.elements.background = document.createElement('div');
    this.elements.background.className = 'cropper-background';
    this.container.appendChild(this.elements.background);
    
    // 创建图片容器
    this.elements.imageContainer = document.createElement('div');
    this.elements.imageContainer.className = 'cropper-image-container';
    this.elements.imageContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 2;
    `;
    this.container.appendChild(this.elements.imageContainer);
    
    // 创建遮罩层
    this.elements.overlay = document.createElement('div');
    this.elements.overlay.className = 'cropper-overlay';
    this.container.appendChild(this.elements.overlay);
    
    // 创建裁剪框
    this.createCropBox();
    
    // 创建工具栏
    if (this.options.showToolbar) {
      this.createToolbar();
    }
  }
  
  /**
   * 创建裁剪框及相关元素
   */
  private createCropBox(): void {
    // 裁剪框
    this.elements.cropBox = document.createElement('div');
    this.elements.cropBox.className = 'cropper-crop-box';
    this.elements.cropBox.style.cssText = `
      display: none;
      width: 200px;
      height: 200px;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    `;
    
    // 网格线
    if (this.options.showGrid) {
      this.elements.grid = document.createElement('div');
      this.elements.grid.className = 'cropper-grid thirds';
      this.elements.cropBox.appendChild(this.elements.grid);
    }
    
    // 创建8个拖拽点
    this.createHandles();
    
    this.container.appendChild(this.elements.cropBox);
  }
  
  /**
   * 创建拖拽点
   */
  private createHandles(): void {
    const handlePositions = [
      { name: 'nw', className: 'corner nw' },
      { name: 'n', className: 'edge horizontal n' },
      { name: 'ne', className: 'corner ne' },
      { name: 'w', className: 'edge vertical w' },
      { name: 'e', className: 'edge vertical e' },
      { name: 'sw', className: 'corner sw' },
      { name: 's', className: 'edge horizontal s' },
      { name: 'se', className: 'corner se' },
    ];
    
    this.elements.handles = [];
    
    handlePositions.forEach(({ name, className }) => {
      const handle = document.createElement('div');
      handle.className = `cropper-handle ${className}`;
      handle.dataset.handle = name;
      this.elements.handles.push(handle);
      this.elements.cropBox?.appendChild(handle);
    });
  }
  
  /**
   * 创建工具栏
   */
  private createToolbar(): void {
    this.elements.toolbar = document.createElement('div');
    this.elements.toolbar.className = `cropper-toolbar ${this.options.toolbarPosition}`;
    
    const tools = [
      { name: 'reset', icon: '↻', title: '重置', action: () => this.reset() },
      { name: 'zoomIn', icon: '🔍+', title: '放大', action: () => this.zoom(1.1) },
      { name: 'zoomOut', icon: '🔍-', title: '缩小', action: () => this.zoom(0.9) },
      { name: 'rotateLeft', icon: '↺', title: '向左旋转', action: () => this.rotate(-90) },
      { name: 'rotateRight', icon: '↻', title: '向右旋转', action: () => this.rotate(90) },
      { name: 'flipH', icon: '⇄', title: '水平翻转', action: () => this.flip('horizontal') },
      { name: 'flipV', icon: '⇅', title: '垂直翻转', action: () => this.flip('vertical') },
    ];\
    
    // 如果启用滤镜，添加滤镜按钮
    if (this.options.enableFilters) {
      tools.push(
        { name: 'filterNone', icon: '🎨', title: '原图', action: () => this.applyFilter('none') },
        { name: 'filterGray', icon: '⚫', title: '黑白', action: () => this.applyFilter('grayscale') },
        { name: 'filterSepia', icon: '🟤', title: '复古', action: () => this.applyFilter('sepia') },
        { name: 'filterVintage', icon: '📷', title: '怀旧', action: () => this.applyFilter('vintage') }
      );
    }
    
    tools.forEach(({ name, icon, title, action }) => {
      const button = document.createElement('button');
      button.className = `cropper-tool-${name}`;
      button.innerHTML = icon;
      button.title = title;
      button.addEventListener('click', action);
      this.elements.toolbar?.appendChild(button);
    });
    
    this.container.appendChild(this.elements.toolbar);
  }
  
  /**
   * 绑定事件
   */
  private bindEvents(): void {
    // 窗口大小变化
    window.addEventListener('resize', () => this.updateContainerSize());
    
    // 裁剪框拖拽
    this.elements.cropBox?.addEventListener('mousedown', this.handleCropBoxMouseDown.bind(this));
    
    // 拖拽点事件
    this.elements.handles.forEach(handle => {
      handle.addEventListener('mousedown', this.handleResizeStart.bind(this));
    });
    
    // 全局鼠标事件
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    
    // 键盘事件
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }
  
  /**
   * 加载图片
   */
  async loadImage(source: string | File | HTMLImageElement): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        // 移除旧图片
        if (this.elements.image) {
          this.elements.image.remove();
        }
        
        // 设置新图片
        this.elements.image = img;
        this.elements.image.className = 'cropper-image';
        this.elements.image.draggable = false;
        
        // 记录原始尺寸
        this.state.originalImageSize = {
          width: img.naturalWidth,
          height: img.naturalHeight,
        };
        
        // 添加到容器
        this.elements.imageContainer?.appendChild(img);
        
        // 调整图片显示尺寸
        this.fitImageToContainer();
        
        // 初始化裁剪框
        this.initializeCropBox();
        
        // 显示裁剪框
        if (this.elements.cropBox) {
          this.elements.cropBox.style.display = 'block';
        }
        
        this.state.imageLoaded = true;
        resolve();
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      // 设置图片源
      if (typeof source === 'string') {
        img.src = source;
      } else if (source instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => {
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(source);
      } else if (source instanceof HTMLImageElement) {
        img.src = source.src;
      }
    });
  }
  
  /**
   * 适配图片到容器
   */
  private fitImageToContainer(): void {
    if (!this.elements.image) return;
    
    const containerAspect = this.state.containerSize.width / this.state.containerSize.height;
    const imageAspect = this.state.originalImageSize.width / this.state.originalImageSize.height;
    
    let displayWidth, displayHeight;
    
    if (imageAspect > containerAspect) {
      // 图片更宽，以容器宽度为准
      displayWidth = this.state.containerSize.width * 0.9;
      displayHeight = displayWidth / imageAspect;
    } else {
      // 图片更高，以容器高度为准
      displayHeight = this.state.containerSize.height * 0.9;
      displayWidth = displayHeight * imageAspect;
    }
    
    this.state.imageDisplaySize = { width: displayWidth, height: displayHeight };
    
    // 设置图片样式
    this.elements.image.style.cssText = `
      width: ${displayWidth}px;
      height: ${displayHeight}px;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    `;
  }
  
  /**
   * 初始化裁剪框
   */
  private initializeCropBox(): void {
    if (!this.elements.cropBox) return;
    
    const { width, height } = this.state.imageDisplaySize;
    let cropWidth = width * 0.8;
    let cropHeight = height * 0.8;
    
    // 应用宽高比限制
    if (typeof this.options.aspectRatio === 'number') {
      const aspectRatio = this.options.aspectRatio;
      if (cropWidth / cropHeight > aspectRatio) {
        cropWidth = cropHeight * aspectRatio;
      } else {
        cropHeight = cropWidth / aspectRatio;
      }
    }
    
    // 应用尺寸限制
    if (this.options.minSize) {
      cropWidth = Math.max(cropWidth, this.options.minSize.width);
      cropHeight = Math.max(cropHeight, this.options.minSize.height);
    }
    
    if (this.options.maxSize) {
      cropWidth = Math.min(cropWidth, this.options.maxSize.width);
      cropHeight = Math.min(cropHeight, this.options.maxSize.height);
    }
    
    // 更新裁剪框
    this.elements.cropBox.style.cssText = `
      display: block;
      width: ${cropWidth}px;
      height: ${cropHeight}px;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    `;
    
    // 更新状态
    this.state.cropData = {
      x: (width - cropWidth) / 2,
      y: (height - cropHeight) / 2,
      width: cropWidth,
      height: cropHeight,
    };
    
    // 更新遮罩
    this.updateOverlay();
  }
  
  /**
   * 更新遮罩层
   */
  private updateOverlay(): void {
    if (!this.elements.overlay || !this.elements.cropBox) return;
    
    const cropBox = this.elements.cropBox.getBoundingClientRect();
    const container = this.container.getBoundingClientRect();
    
    // 使用 clip-path 创建遮罩效果
    const x1 = cropBox.left - container.left;
    const y1 = cropBox.top - container.top;
    const x2 = x1 + cropBox.width;
    const y2 = y1 + cropBox.height;
    
    this.elements.overlay.style.clipPath = `
      polygon(
        0% 0%, 
        0% 100%, 
        ${x1}px 100%, 
        ${x1}px ${y1}px, 
        ${x2}px ${y1}px, 
        ${x2}px ${y2}px, 
        ${x1}px ${y2}px, 
        ${x1}px 100%, 
        100% 100%, 
        100% 0%
      )
    `;
  }
  
  /**
   * 裁剪框拖拽开始
   */
  private handleCropBoxMouseDown(e: MouseEvent): void {
    e.preventDefault();
    
    if ((e.target as HTMLElement).classList.contains('cropper-handle')) {
      return; // 如果点击的是拖拽点，则不处理
    }
    
    this.state.cropping = true;
    this.state.startPoint = { x: e.clientX, y: e.clientY };
    this.state.startCropData = { ...this.state.cropData };
    
    this.emit('cropstart', { cropData: this.state.cropData });
  }
  
  /**
   * 拖拽点调整开始
   */
  private handleResizeStart(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
    
    const handle = e.target as HTMLElement;
    this.state.isResizing = true;
    this.state.resizeHandle = handle.dataset.handle || '';
    this.state.startPoint = { x: e.clientX, y: e.clientY };
    this.state.startCropData = { ...this.state.cropData };
    
    // 添加活动状态
    handle.classList.add('active');
    
    this.emit('cropstart', { cropData: this.state.cropData });
  }
  
  /**
   * 鼠标移动处理
   */
  private handleMouseMove(e: MouseEvent): void {
    if (!this.state.cropping && !this.state.isResizing) return;
    
    const deltaX = e.clientX - this.state.startPoint.x;
    const deltaY = e.clientY - this.state.startPoint.y;
    
    if (this.state.isResizing) {
      this.handleResize(deltaX, deltaY);
    } else if (this.state.cropping) {
      this.handleCropBoxMove(deltaX, deltaY);
    }
    
    this.emit('cropmove', { cropData: this.state.cropData });
  }
  
  /**
   * 处理裁剪框调整大小
   */
  private handleResize(deltaX: number, deltaY: number): void {
    const { startCropData, resizeHandle } = this.state;
    const { width: containerWidth, height: containerHeight } = this.state.imageDisplaySize;
    
    let newX = startCropData.x;
    let newY = startCropData.y;
    let newWidth = startCropData.width;
    let newHeight = startCropData.height;
    
    // 根据拖拽点类型调整尺寸
    switch (resizeHandle) {
      case 'nw':
        newX = startCropData.x + deltaX;
        newY = startCropData.y + deltaY;
        newWidth = startCropData.width - deltaX;
        newHeight = startCropData.height - deltaY;
        break;
      case 'n':
        newY = startCropData.y + deltaY;
        newHeight = startCropData.height - deltaY;
        break;
      case 'ne':
        newY = startCropData.y + deltaY;
        newWidth = startCropData.width + deltaX;
        newHeight = startCropData.height - deltaY;
        break;
      case 'w':
        newX = startCropData.x + deltaX;
        newWidth = startCropData.width - deltaX;
        break;
      case 'e':
        newWidth = startCropData.width + deltaX;
        break;
      case 'sw':
        newX = startCropData.x + deltaX;
        newWidth = startCropData.width - deltaX;
        newHeight = startCropData.height + deltaY;
        break;
      case 's':
        newHeight = startCropData.height + deltaY;
        break;
      case 'se':
        newWidth = startCropData.width + deltaX;
        newHeight = startCropData.height + deltaY;
        break;
    }
    
    // 应用宽高比约束
    if (typeof this.options.aspectRatio === 'number') {
      const aspectRatio = this.options.aspectRatio;
      if (newWidth / newHeight > aspectRatio) {
        newWidth = newHeight * aspectRatio;
      } else {
        newHeight = newWidth / aspectRatio;
      }
    }
    
    // 应用尺寸限制
    if (this.options.minSize) {
      newWidth = Math.max(newWidth, this.options.minSize.width);
      newHeight = Math.max(newHeight, this.options.minSize.height);
    }
    
    if (this.options.maxSize) {
      newWidth = Math.min(newWidth, this.options.maxSize.width);
      newHeight = Math.min(newHeight, this.options.maxSize.height);
    }
    
    // 边界检查
    newX = Math.max(0, Math.min(newX, containerWidth - newWidth));
    newY = Math.max(0, Math.min(newY, containerHeight - newHeight));
    
    // 更新状态和UI
    this.updateCropBox(newX, newY, newWidth, newHeight);
  }
  
  /**
   * 处理裁剪框移动
   */
  private handleCropBoxMove(deltaX: number, deltaY: number): void {
    const { startCropData } = this.state;
    const { width: containerWidth, height: containerHeight } = this.state.imageDisplaySize;
    
    let newX = startCropData.x + deltaX;
    let newY = startCropData.y + deltaY;
    
    // 边界检查
    newX = Math.max(0, Math.min(newX, containerWidth - startCropData.width));
    newY = Math.max(0, Math.min(newY, containerHeight - startCropData.height));
    
    // 更新状态和UI
    this.updateCropBox(newX, newY, startCropData.width, startCropData.height);
  }
  
  /**
   * 更新裁剪框位置和尺寸
   */
  private updateCropBox(x: number, y: number, width: number, height: number): void {
    if (!this.elements.cropBox) return;
    
    // 更新状态
    this.state.cropData = { x, y, width, height };
    
    // 更新UI
    const containerRect = this.container.getBoundingClientRect();
    const imageRect = this.elements.image?.getBoundingClientRect();
    
    if (imageRect) {
      const offsetX = imageRect.left - containerRect.left + x;
      const offsetY = imageRect.top - containerRect.top + y;
      
      this.elements.cropBox.style.cssText = `
        display: block;
        width: ${width}px;
        height: ${height}px;
        left: ${offsetX}px;
        top: ${offsetY}px;
        transform: none;
      `;
    }
    
    // 更新遮罩
    this.updateOverlay();
  }
  
  /**
   * 鼠标松开处理
   */
  private handleMouseUp(): void {
    if (this.state.cropping || this.state.isResizing) {
      this.state.cropping = false;
      this.state.isResizing = false;
      this.state.resizeHandle = '';
      
      // 移除活动状态
      this.elements.handles.forEach(handle => {
        handle.classList.remove('active');
      });
      
      this.emit('cropend', { cropData: this.state.cropData });
    }
  }
  
  /**
   * 键盘事件处理
   */
  private handleKeyDown(e: KeyboardEvent): void {
    if (!this.state.imageLoaded) return;
    
    const step = e.shiftKey ? 10 : 1;
    
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        this.moveCropBox(-step, 0);
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.moveCropBox(step, 0);
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.moveCropBox(0, -step);
        break;
      case 'ArrowDown':
        e.preventDefault();
        this.moveCropBox(0, step);
        break;
      case 'Escape':
        e.preventDefault();
        this.reset();
        break;
    }
  }
  
  /**
   * 移动裁剪框
   */
  private moveCropBox(deltaX: number, deltaY: number): void {
    const { cropData } = this.state;
    const { width: containerWidth, height: containerHeight } = this.state.imageDisplaySize;
    
    let newX = cropData.x + deltaX;
    let newY = cropData.y + deltaY;
    
    // 边界检查
    newX = Math.max(0, Math.min(newX, containerWidth - cropData.width));
    newY = Math.max(0, Math.min(newY, containerHeight - cropData.height));
    
    this.updateCropBox(newX, newY, cropData.width, cropData.height);
  }
  
  /**
   * 更新容器尺寸
   */
  private updateContainerSize(): void {
    const rect = this.container.getBoundingClientRect();
    this.state.containerSize = {
      width: rect.width,
      height: rect.height,
    };
    
    // 重新适配图片
    if (this.state.imageLoaded) {
      this.fitImageToContainer();
      this.initializeCropBox();
    }
  }
  
  /**
   * 应用滤镜
   */
  applyFilter(filterName: string): void {
    if (!this.elements.image || !this.options.enableFilters) return;
    
    // 移除旧滤镜类
    Object.values(FilterPresets).forEach(className => {
      if (className) {
        this.elements.image?.classList.remove(className);
      }
    });
    
    // 应用新滤镜
    const filterClass = FilterPresets[filterName as keyof typeof FilterPresets];
    if (filterClass) {
      this.elements.image.classList.add(filterClass);
    }
    
    this.state.currentFilter = filterName;
    this.emit('filter', { filter: filterName });
  }
  
  /**
   * 缩放
   */
  zoom(factor: number): void {
    if (!this.elements.image) return;
    
    const currentTransform = this.elements.image.style.transform;
    const scaleMatch = currentTransform.match(/scale\(([^)]+)\)/);
    const currentScale = scaleMatch ? parseFloat(scaleMatch[1]) : 1;
    const newScale = Math.max(0.1, Math.min(5, currentScale * factor));
    
    this.elements.image.style.transform = currentTransform.includes('scale')
      ? currentTransform.replace(/scale\([^)]+\)/, `scale(${newScale})`)
      : `${currentTransform} scale(${newScale})`;
    
    this.emit('zoom', { scale: newScale });
  }
  
  /**
   * 旋转
   */
  rotate(angle: number): void {
    if (!this.elements.image) return;
    
    const currentTransform = this.elements.image.style.transform;
    const rotateMatch = currentTransform.match(/rotate\(([^)]+)deg\)/);
    const currentAngle = rotateMatch ? parseFloat(rotateMatch[1]) : 0;
    const newAngle = currentAngle + angle;
    
    this.elements.image.style.transform = currentTransform.includes('rotate')
      ? currentTransform.replace(/rotate\([^)]+deg\)/, `rotate(${newAngle}deg)`)
      : `${currentTransform} rotate(${newAngle}deg)`;
    
    this.emit('rotate', { angle: newAngle });
  }
  
  /**
   * 翻转
   */
  flip(direction: 'horizontal' | 'vertical'): void {
    if (!this.elements.image) return;
    
    const currentTransform = this.elements.image.style.transform;
    
    if (direction === 'horizontal') {
      const scaleXMatch = currentTransform.match(/scaleX\(([^)]+)\)/);
      const currentScaleX = scaleXMatch ? parseFloat(scaleXMatch[1]) : 1;
      const newScaleX = -currentScaleX;
      
      this.elements.image.style.transform = currentTransform.includes('scaleX')
        ? currentTransform.replace(/scaleX\([^)]+\)/, `scaleX(${newScaleX})`)
        : `${currentTransform} scaleX(${newScaleX})`;
    } else {
      const scaleYMatch = currentTransform.match(/scaleY\(([^)]+)\)/);
      const currentScaleY = scaleYMatch ? parseFloat(scaleYMatch[1]) : 1;
      const newScaleY = -currentScaleY;
      
      this.elements.image.style.transform = currentTransform.includes('scaleY')
        ? currentTransform.replace(/scaleY\([^)]+\)/, `scaleY(${newScaleY})`)
        : `${currentTransform} scaleY(${newScaleY})`;
    }
  }
  
  /**
   * 重置
   */
  reset(): void {
    if (!this.state.imageLoaded) return;
    
    // 重置图片变换
    if (this.elements.image) {
      this.elements.image.style.transform = 'translate(-50%, -50%)';
    }
    
    // 重置滤镜
    this.applyFilter('none');
    
    // 重新初始化裁剪框
    this.fitImageToContainer();
    this.initializeCropBox();
  }
  
  /**
   * 设置主题
   */
  setTheme(themeName: string): void {
    this.styleManager.setTheme(themeName);
    this.emit('themechange', { theme: themeName });
  }
  
  /**
   * 获取可用主题列表
   */
  getAvailableThemes(): string[] {
    return this.styleManager.getAvailableThemes();
  }
  
  /**
   * 获取裁剪数据
   */
  getCropData(): CropData {
    return { ...this.state.cropData };
  }
  
  /**
   * 设置裁剪数据
   */
  setCropData(cropData: Partial<CropData>): void {
    const newCropData = { ...this.state.cropData, ...cropData };
    this.updateCropBox(newCropData.x, newCropData.y, newCropData.width, newCropData.height);
  }
  
  /**
   * 获取裁剪后的 Canvas
   */
  getCroppedCanvas(options: { width?: number; height?: number; quality?: number } = {}): HTMLCanvasElement {
    if (!this.elements.image || !this.state.imageLoaded) {
      throw new Error('No image loaded');
    }
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const { cropData, originalImageSize, imageDisplaySize } = this.state;
    
    // 计算实际裁剪区域（相对于原始图片）
    const scaleX = originalImageSize.width / imageDisplaySize.width;
    const scaleY = originalImageSize.height / imageDisplaySize.height;
    
    const sourceX = cropData.x * scaleX;
    const sourceY = cropData.y * scaleY;
    const sourceWidth = cropData.width * scaleX;
    const sourceHeight = cropData.height * scaleY;
    
    // 设置输出尺寸
    canvas.width = options.width || cropData.width;
    canvas.height = options.height || cropData.height;
    
    // 绘制裁剪后的图片
    ctx.drawImage(
      this.elements.image,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, canvas.width, canvas.height
    );
    
    return canvas;
  }
  
  /**
   * 获取裁剪后的 Blob
   */
  async getCroppedBlob(type: string = 'image/png', quality?: number): Promise<Blob> {
    const canvas = this.getCroppedCanvas();
    const actualQuality = quality || this.options.quality || 0.9;
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, type, actualQuality);
    });
  }
  
  /**
   * 事件监听
   */
  on(event: CropperEventType, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }
  
  /**
   * 移除事件监听
   */
  off(event: CropperEventType, listener: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
  
  /**
   * 触发事件
   */
  private emit(event: CropperEventType, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }
  
  /**
   * 销毁裁剪器
   */
  destroy(): void {
    // 清除事件监听
    this.eventListeners.clear();
    
    // 移除DOM事件
    window.removeEventListener('resize', () => this.updateContainerSize());
    document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    document.removeEventListener('mouseup', this.handleMouseUp.bind(this));
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    
    // 销毁样式管理器
    this.styleManager.destroy();
    
    // 清空容器
    this.container.innerHTML = '';
    
    // 重置状态
    this.state.ready = false;
  }
}

// 工厂函数
export function createModernCropper(options: ModernCropperOptions): ModernCropper {
  return new ModernCropper(options);
}

// 导出主题
export { CropperThemes, FilterPresets };
