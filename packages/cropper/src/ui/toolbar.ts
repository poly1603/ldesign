/**
 * @file 工具栏组件
 * @description 内置的工具栏控制面板，使用Lucide图标
 */

// 不再需要导入Lucide图标，使用内置SVG路径
import type { CropperInstance, CropShape, CropperEventType } from '@/types'
import { CropShape as Shape, CropperEventType as EventType } from '@/types'

/**
 * 工具栏位置枚举
 */
export enum ToolbarPosition {
  TOP = 'top',
  BOTTOM = 'bottom',
  LEFT = 'left',
  RIGHT = 'right'
}

/**
 * 工具栏配置
 */
export interface ToolbarConfig {
  /** 是否显示工具栏 */
  show?: boolean
  /** 工具栏位置 */
  position?: 'top' | 'bottom' | 'left' | 'right'
  /** 显示的工具 */
  tools?: ToolbarTool[]
  /** 自定义样式类名 */
  className?: string
  /** 主题色 */
  theme?: 'light' | 'dark'
}

/**
 * 工具栏工具类型
 */
export type ToolbarTool =
  | 'zoom-in'
  | 'zoom-out'
  | 'rotate-left'
  | 'rotate-right'
  | 'flip-horizontal'
  | 'flip-vertical'
  | 'reset'
  | 'crop'
  | 'shape-rectangle'
  | 'shape-circle'
  | 'shape-ellipse'
  | 'aspect-ratio'
  | 'mask-opacity'
  | 'export-format'
  | 'download'

/**
 * 宽高比选项
 */
export interface AspectRatioOption {
  label: string
  value: number | null
}

/**
 * 导出格式选项
 */
export interface ExportFormatOption {
  label: string
  value: string
  mimeType: string
}

/**
 * 遮罩透明度选项
 */
export interface MaskOpacityOption {
  label: string
  value: number
}

/**
 * 工具栏类
 */
export class Toolbar {
  /** 工具栏容器元素 */
  private container: HTMLElement

  /** 裁剪器实例 */
  private cropper: CropperInstance

  /** 配置 */
  private config: Required<ToolbarConfig>

  /** 当前形状 */
  private currentShape: CropShape = Shape.RECTANGLE

  /** 当前宽高比 */
  private currentAspectRatio: number | null = null

  /** 当前遮罩透明度 */
  private currentMaskOpacity: number = 0.5

  /** 当前导出格式 */
  private currentExportFormat: string = 'png'

  /** 当前裁剪框样式 */
  private currentCropStyle: string = 'default'

  /** 当前背景样式 */
  private currentBackground: string = 'transparent'

  /** 当前滤镜 */
  private currentFilter: string = 'none'

  /** 默认配置 */
  private static readonly DEFAULT_CONFIG: Required<ToolbarConfig> = {
    show: true,
    position: 'bottom',
    tools: [
      'zoom-in',
      'zoom-out',
      'rotate-left',
      'rotate-right',
      'flip-horizontal',
      'flip-vertical',
      'reset',
      'shape-selector',
      'aspect-ratio',
      'crop-style-selector',
      'background-selector',
      'move-up',
      'move-down',
      'move-left',
      'move-right',
      'filter-selector',
      'mask-opacity',
      'export-format',
      'crop',
      'download'
    ],
    className: '',
    theme: 'light'
  }

  /** 宽高比选项 */
  private aspectRatioOptions: AspectRatioOption[] = [
    { label: '自由', value: null },
    { label: '1:1', value: 1 },
    { label: '4:3', value: 4 / 3 },
    { label: '16:9', value: 16 / 9 },
    { label: '3:4', value: 3 / 4 },
    { label: '9:16', value: 9 / 16 }
  ]

  /** 导出格式选项 */
  private exportFormatOptions: ExportFormatOption[] = [
    { label: 'PNG', value: 'png', mimeType: 'image/png' },
    { label: 'JPEG', value: 'jpeg', mimeType: 'image/jpeg' },
    { label: 'WEBP', value: 'webp', mimeType: 'image/webp' }
  ]

  /** 遮罩透明度选项 */
  private maskOpacityOptions: MaskOpacityOption[] = [
    { label: '0%', value: 0 },
    { label: '25%', value: 0.25 },
    { label: '50%', value: 0.5 },
    { label: '75%', value: 0.75 },
    { label: '100%', value: 1 }
  ]

  /** 形状选项 */
  private shapeOptions = [
    { label: '矩形', value: 'rectangle', icon: 'square' },
    { label: '圆形', value: 'circle', icon: 'circle' },
    { label: '椭圆', value: 'ellipse', icon: 'ellipsis' },
    { label: '圆角矩形', value: 'rounded-rectangle', icon: 'rounded-square' },
    { label: '三角形', value: 'triangle', icon: 'triangle' },
    { label: '菱形', value: 'diamond', icon: 'diamond' },
    { label: '六边形', value: 'hexagon', icon: 'hexagon' },
    { label: '星形', value: 'star', icon: 'star' }
  ]

  /** 裁剪框样式选项 */
  private cropStyleOptions = [
    { label: '默认', value: 'default' },
    { label: '简约', value: 'minimal' },
    { label: '经典', value: 'classic' },
    { label: '现代', value: 'modern' },
    { label: '霓虹', value: 'neon' }
  ]

  /** 背景样式选项 */
  private backgroundOptions = [
    { label: '透明', value: 'transparent' },
    { label: '白色', value: 'white' },
    { label: '黑色', value: 'black' },
    { label: '棋盘格', value: 'checkerboard' },
    { label: '模糊', value: 'blur' }
  ]

  /** 滤镜选项 */
  private filterOptions = [
    { label: '无', value: 'none' },
    { label: '黑白', value: 'grayscale' },
    { label: '复古', value: 'sepia' },
    { label: '反色', value: 'invert' },
    { label: '模糊', value: 'blur' },
    { label: '锐化', value: 'sharpen' },
    { label: '高对比度', value: 'contrast' },
    { label: '饱和度', value: 'saturate' }
  ]

  /**
   * 构造函数
   * @param container 容器元素
   * @param cropper 裁剪器实例
   * @param config 配置
   */
  constructor(
    container: HTMLElement,
    cropper: CropperInstance,
    config: Partial<ToolbarConfig> = {}
  ) {
    this.container = container
    this.cropper = cropper
    this.config = { ...Toolbar.DEFAULT_CONFIG, ...config }

    this.render()
    this.bindEvents()
  }

  /**
   * 更新配置
   * @param config 新配置
   */
  updateConfig(config: Partial<ToolbarConfig>): void {
    this.config = { ...this.config, ...config }
    this.render()
  }

  /**
   * 设置当前形状
   * @param shape 形状
   */
  setCurrentShape(shape: CropShape): void {
    this.currentShape = shape
    this.updateShapeButtons()
  }

  /**
   * 设置当前宽高比
   * @param aspectRatio 宽高比
   */
  setCurrentAspectRatio(aspectRatio: number | null): void {
    this.currentAspectRatio = aspectRatio
    this.updateAspectRatioSelect()
  }

  /**
   * 设置当前遮罩透明度
   * @param opacity 透明度
   */
  setCurrentMaskOpacity(opacity: number): void {
    this.currentMaskOpacity = opacity
    this.updateMaskOpacitySelect()
  }

  /**
   * 设置当前导出格式
   * @param format 导出格式
   */
  setCurrentExportFormat(format: string): void {
    this.currentExportFormat = format
    this.updateExportFormatSelect()
  }

  /**
   * 渲染工具栏
   */
  private render(): void {
    // 移除现有的工具栏
    const existingToolbar = this.container.querySelector('.ldesign-cropper__toolbar')
    if (existingToolbar) {
      existingToolbar.remove()
    }

    if (!this.config.show) {
      return
    }

    const toolbar = document.createElement('div')
    toolbar.className = `ldesign-cropper__toolbar ldesign-cropper__toolbar--${this.config.position} ${this.config.className}`
    toolbar.setAttribute('data-theme', this.config.theme)

    // 添加工具按钮
    this.config.tools.forEach(tool => {
      const element = this.createToolElement(tool)
      if (element) {
        toolbar.appendChild(element)
      }
    })

    // 根据位置添加工具栏
    if (this.config.position === 'top') {
      this.container.insertBefore(toolbar, this.container.firstChild)
    } else {
      this.container.appendChild(toolbar)
    }
  }

  /**
   * 创建工具元素
   * @param tool 工具类型
   * @returns 工具元素
   */
  private createToolElement(tool: ToolbarTool): HTMLElement | null {
    switch (tool) {
      case 'zoom-in':
        return this.createButton('zoom-in', 'zoom-in', '放大', () => this.cropper.zoom(1.1))

      case 'zoom-out':
        return this.createButton('zoom-out', 'zoom-out', '缩小', () => this.cropper.zoom(0.9))

      case 'rotate-left':
        return this.createButton('rotate-left', 'rotate-ccw', '左转', () => this.cropper.rotate(-90))

      case 'rotate-right':
        return this.createButton('rotate-right', 'rotate-cw', '右转', () => this.cropper.rotate(90))

      case 'flip-horizontal':
        return this.createButton('flip-horizontal', 'flip-horizontal', '水平翻转', () => this.cropper.scaleX(-1))

      case 'flip-vertical':
        return this.createButton('flip-vertical', 'flip-vertical', '垂直翻转', () => this.cropper.scaleY(-1))

      case 'reset':
        return this.createButton('reset', 'refresh-cw', '重置', () => this.cropper.reset())

      case 'crop':
        return this.createButton('crop', 'scissors', '裁剪', () => this.handleCrop())

      case 'shape-selector':
        return this.createShapeSelector()

      case 'aspect-ratio':
        return this.createAspectRatioSelect()

      case 'crop-style-selector':
        return this.createCropStyleSelector()

      case 'background-selector':
        return this.createBackgroundSelector()

      case 'move-up':
        return this.createButton('move-up', 'arrow-up', '向上移动', () => this.moveImage(0, -10))

      case 'move-down':
        return this.createButton('move-down', 'arrow-down', '向下移动', () => this.moveImage(0, 10))

      case 'move-left':
        return this.createButton('move-left', 'arrow-left', '向左移动', () => this.moveImage(-10, 0))

      case 'move-right':
        return this.createButton('move-right', 'arrow-right', '向右移动', () => this.moveImage(10, 0))

      case 'move-up-left':
        return this.createButton('move-up-left', 'arrow-up-left', '向左上移动', () => this.moveImage(-10, -10))

      case 'move-up-right':
        return this.createButton('move-up-right', 'arrow-up-right', '向右上移动', () => this.moveImage(10, -10))

      case 'move-down-left':
        return this.createButton('move-down-left', 'arrow-down-left', '向左下移动', () => this.moveImage(-10, 10))

      case 'move-down-right':
        return this.createButton('move-down-right', 'arrow-down-right', '向右下移动', () => this.moveImage(10, 10))

      case 'filter-selector':
        return this.createFilterSelector()

      case 'mask-opacity':
        return this.createMaskOpacitySelect()

      case 'export-format':
        return this.createExportFormatSelect()

      case 'download':
        return this.createButton('download', 'download', '下载', () => this.handleDownload())

      default:
        return null
    }
  }

  /**
   * 创建按钮
   * @param id 按钮ID
   * @param Icon 图标组件
   * @param title 标题
   * @param onClick 点击回调
   * @returns 按钮元素
   */
  private createButton(
    id: string,
    iconName: string,
    title: string,
    onClick: () => void
  ): HTMLButtonElement {
    const button = document.createElement('button')
    button.className = 'ldesign-cropper__toolbar-button'
    button.setAttribute('data-tool', id)
    button.title = title

    // 创建SVG图标
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('width', '16')
    svg.setAttribute('height', '16')
    svg.setAttribute('viewBox', '0 0 24 24')
    svg.setAttribute('fill', 'none')
    svg.setAttribute('stroke', 'currentColor')
    svg.setAttribute('stroke-width', '2')
    svg.setAttribute('stroke-linecap', 'round')
    svg.setAttribute('stroke-linejoin', 'round')

    // 根据图标名称添加路径
    svg.innerHTML = this.getIconPath(iconName)
    button.appendChild(svg)

    button.addEventListener('click', onClick)
    return button
  }

  /**
   * 创建形状按钮
   * @param id 按钮ID
   * @param Icon 图标组件
   * @param title 标题
   * @param shape 形状
   * @returns 按钮元素
   */
  private createShapeButton(
    id: string,
    iconName: string,
    title: string,
    shape: CropShape
  ): HTMLButtonElement {
    const button = this.createButton(id, iconName, title, () => {
      this.currentShape = shape
      this.cropper.setShape(shape)
      this.updateShapeButtons()
    })

    if (this.currentShape === shape) {
      button.classList.add('ldesign-cropper__toolbar-button--active')
    }

    return button
  }

  /**
   * 创建宽高比选择器
   * @returns 选择器元素
   */
  private createAspectRatioSelect(): HTMLSelectElement {
    const select = document.createElement('select')
    select.className = 'ldesign-cropper__toolbar-select'
    select.setAttribute('data-tool', 'aspect-ratio')
    select.title = '宽高比'

    this.aspectRatioOptions.forEach(option => {
      const optionElement = document.createElement('option')
      optionElement.value = option.value?.toString() || ''
      optionElement.textContent = option.label

      if (option.value === this.currentAspectRatio) {
        optionElement.selected = true
      }

      select.appendChild(optionElement)
    })

    select.addEventListener('change', () => {
      const value = select.value
      const aspectRatio = value ? parseFloat(value) : null
      this.currentAspectRatio = aspectRatio
      this.cropper.setAspectRatio(aspectRatio)
    })

    return select
  }

  /**
   * 创建遮罩透明度选择器
   * @returns 选择器元素
   */
  private createMaskOpacitySelect(): HTMLSelectElement {
    const select = document.createElement('select')
    select.className = 'ldesign-cropper__toolbar-select'
    select.setAttribute('data-tool', 'mask-opacity')
    select.title = '遮罩透明度'

    this.maskOpacityOptions.forEach(option => {
      const optionElement = document.createElement('option')
      optionElement.value = option.value.toString()
      optionElement.textContent = option.label

      if (option.value === this.currentMaskOpacity) {
        optionElement.selected = true
      }

      select.appendChild(optionElement)
    })

    select.addEventListener('change', () => {
      const value = parseFloat(select.value)
      this.currentMaskOpacity = value
      // 更新裁剪器的遮罩透明度
      this.cropper.updateConfig({ maskOpacity: value })
    })

    return select
  }

  /**
   * 创建导出格式选择器
   * @returns 选择器元素
   */
  private createExportFormatSelect(): HTMLSelectElement {
    const select = document.createElement('select')
    select.className = 'ldesign-cropper__toolbar-select'
    select.setAttribute('data-tool', 'export-format')
    select.title = '导出格式'

    this.exportFormatOptions.forEach(option => {
      const optionElement = document.createElement('option')
      optionElement.value = option.value
      optionElement.textContent = option.label

      if (option.value === this.currentExportFormat) {
        optionElement.selected = true
      }

      select.appendChild(optionElement)
    })

    select.addEventListener('change', () => {
      this.currentExportFormat = select.value
    })

    return select
  }

  /**
   * 创建形状选择器
   * @returns 选择器元素
   */
  private createShapeSelector(): HTMLSelectElement {
    const select = document.createElement('select')
    select.className = 'ldesign-cropper__toolbar-select'
    select.setAttribute('data-tool', 'shape-selector')
    select.title = '裁剪形状'

    this.shapeOptions.forEach(option => {
      const optionElement = document.createElement('option')
      optionElement.value = option.value
      optionElement.textContent = option.label

      if (option.value === this.currentShape) {
        optionElement.selected = true
      }

      select.appendChild(optionElement)
    })

    select.addEventListener('change', () => {
      const shape = select.value as CropShape
      this.currentShape = shape
      this.cropper.setShape(shape)
    })

    return select
  }

  /**
   * 创建裁剪框样式选择器
   * @returns 选择器元素
   */
  private createCropStyleSelector(): HTMLSelectElement {
    const select = document.createElement('select')
    select.className = 'ldesign-cropper__toolbar-select'
    select.setAttribute('data-tool', 'crop-style-selector')
    select.title = '裁剪框样式'

    this.cropStyleOptions.forEach(option => {
      const optionElement = document.createElement('option')
      optionElement.value = option.value
      optionElement.textContent = option.label

      if (option.value === this.currentCropStyle) {
        optionElement.selected = true
      }

      select.appendChild(optionElement)
    })

    select.addEventListener('change', () => {
      this.currentCropStyle = select.value
      this.applyCropStyle(select.value)
    })

    return select
  }

  /**
   * 创建背景选择器
   * @returns 选择器元素
   */
  private createBackgroundSelector(): HTMLSelectElement {
    const select = document.createElement('select')
    select.className = 'ldesign-cropper__toolbar-select'
    select.setAttribute('data-tool', 'background-selector')
    select.title = '背景样式'

    this.backgroundOptions.forEach(option => {
      const optionElement = document.createElement('option')
      optionElement.value = option.value
      optionElement.textContent = option.label

      if (option.value === this.currentBackground) {
        optionElement.selected = true
      }

      select.appendChild(optionElement)
    })

    select.addEventListener('change', () => {
      this.currentBackground = select.value
      this.applyBackground(select.value)
    })

    return select
  }

  /**
   * 创建滤镜选择器
   * @returns 选择器元素
   */
  private createFilterSelector(): HTMLSelectElement {
    const select = document.createElement('select')
    select.className = 'ldesign-cropper__toolbar-select'
    select.setAttribute('data-tool', 'filter-selector')
    select.title = '图片滤镜'

    this.filterOptions.forEach(option => {
      const optionElement = document.createElement('option')
      optionElement.value = option.value
      optionElement.textContent = option.label

      if (option.value === this.currentFilter) {
        optionElement.selected = true
      }

      select.appendChild(optionElement)
    })

    select.addEventListener('change', () => {
      this.currentFilter = select.value
      this.applyFilter(select.value)
    })

    return select
  }

  /**
   * 更新形状按钮状态
   */
  private updateShapeButtons(): void {
    const buttons = this.container.querySelectorAll('[data-tool^="shape-"]')
    buttons.forEach(button => {
      const tool = button.getAttribute('data-tool')
      const isActive =
        (tool === 'shape-rectangle' && this.currentShape === Shape.RECTANGLE) ||
        (tool === 'shape-circle' && this.currentShape === Shape.CIRCLE) ||
        (tool === 'shape-ellipse' && this.currentShape === Shape.ELLIPSE)

      button.classList.toggle('ldesign-cropper__toolbar-button--active', isActive)
    })
  }

  /**
   * 更新宽高比选择器
   */
  private updateAspectRatioSelect(): void {
    const select = this.container.querySelector('[data-tool="aspect-ratio"]') as HTMLSelectElement
    if (select) {
      select.value = this.currentAspectRatio?.toString() || ''
    }
  }

  /**
   * 更新遮罩透明度选择器
   */
  private updateMaskOpacitySelect(): void {
    const select = this.container.querySelector('[data-tool="mask-opacity"]') as HTMLSelectElement
    if (select) {
      select.value = this.currentMaskOpacity.toString()
    }
  }

  /**
   * 更新导出格式选择器
   */
  private updateExportFormatSelect(): void {
    const select = this.container.querySelector('[data-tool="export-format"]') as HTMLSelectElement
    if (select) {
      select.value = this.currentExportFormat
    }
  }

  /**
   * 处理裁剪
   */
  private handleCrop(): void {
    const canvas = this.cropper.getCroppedCanvas()
    if (canvas) {
      // 触发裁剪完成事件
      const event = new CustomEvent('crop', { detail: { canvas } })
      this.container.dispatchEvent(event)
    }
  }

  /**
   * 处理下载
   */
  private handleDownload(): void {
    const canvas = this.cropper.getCroppedCanvas()
    if (canvas) {
      const formatOption = this.exportFormatOptions.find(opt => opt.value === this.currentExportFormat)
      const mimeType = formatOption?.mimeType || 'image/png'
      const extension = this.currentExportFormat || 'png'

      const link = document.createElement('a')
      link.download = `cropped-image-${Date.now()}.${extension}`

      // 对于JPEG格式，设置质量参数
      if (mimeType === 'image/jpeg') {
        link.href = canvas.toDataURL(mimeType, 0.9)
      } else {
        link.href = canvas.toDataURL(mimeType)
      }

      link.click()
    }
  }

  /**
   * 移动图片
   */
  private moveImage(deltaX: number, deltaY: number): void {
    // 这里需要调用裁剪器的移动方法
    if (this.cropper && typeof this.cropper.moveImage === 'function') {
      this.cropper.moveImage(deltaX, deltaY)
    }
  }

  /**
   * 应用裁剪框样式
   */
  private applyCropStyle(style: string): void {
    const container = this.container

    // 移除现有样式类
    container.classList.remove(
      'crop-style-default',
      'crop-style-minimal',
      'crop-style-classic',
      'crop-style-modern',
      'crop-style-neon'
    )

    // 添加新样式类
    container.classList.add(`crop-style-${style}`)
  }

  /**
   * 应用背景样式
   */
  private applyBackground(background: string): void {
    const container = this.container

    // 移除现有背景类
    container.classList.remove(
      'bg-transparent',
      'bg-white',
      'bg-black',
      'bg-checkerboard',
      'bg-blur'
    )

    // 添加新背景类
    container.classList.add(`bg-${background}`)
  }

  /**
   * 应用滤镜
   */
  private applyFilter(filter: string): void {
    // 这里需要调用裁剪器的滤镜方法
    if (this.cropper && typeof this.cropper.applyFilter === 'function') {
      this.cropper.applyFilter(filter)
    }
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    // 监听裁剪器事件
    this.cropper.on(EventType.READY, () => {
      this.render()
    })
  }

  /**
   * 销毁工具栏
   */
  destroy(): void {
    this.container.innerHTML = ''
  }

  /**
   * 获取图标路径
   * @param iconName 图标名称
   * @returns SVG路径
   */
  private getIconPath(iconName: string): string {
    const iconPaths: Record<string, string> = {
      'zoom-in': '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>',
      'zoom-out': '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><line x1="8" y1="11" x2="14" y2="11"/>',
      'rotate-ccw': '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
      'rotate-cw': '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>',
      'flip-horizontal': '<path d="M8 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h3"/><path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3"/><path d="M12 20v2"/><path d="M12 14v2"/><path d="M12 8v2"/><path d="M12 2v2"/>',
      'flip-vertical': '<path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3"/><path d="M21 16v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3"/><path d="M4 12H2"/><path d="M10 12H8"/><path d="M16 12h-2"/><path d="M22 12h-2"/>',
      'refresh-cw': '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/>',
      'scissors': '<circle cx="6" cy="6" r="3"/><path d="M8.12 8.12 12 12"/><path d="M20 4 8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8 20 20"/>',
      'square': '<rect width="18" height="18" x="3" y="3" rx="2"/>',
      'circle': '<circle cx="12" cy="12" r="10"/>',
      'ellipsis': '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
      'download': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/>',
      'arrow-up': '<line x1="12" y1="19" x2="12" y2="5"/><polyline points="5,12 12,5 19,12"/>',
      'arrow-down': '<line x1="12" y1="5" x2="12" y2="19"/><polyline points="19,12 12,19 5,12"/>',
      'arrow-left': '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/>',
      'arrow-right': '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>',
      'arrow-up-left': '<line x1="17" y1="17" x2="7" y2="7"/><polyline points="7,17 7,7 17,7"/>',
      'arrow-up-right': '<line x1="7" y1="17" x2="17" y2="7"/><polyline points="7,7 17,7 17,17"/>',
      'arrow-down-left': '<line x1="17" y1="7" x2="7" y2="17"/><polyline points="17,17 7,17 7,7"/>',
      'arrow-down-right': '<line x1="7" y1="7" x2="17" y2="17"/><polyline points="17,7 17,17 7,17"/>',
      'rounded-square': '<rect width="18" height="18" x="3" y="3" rx="6"/>',
      'triangle': '<path d="M12 2 L22 20 L2 20 Z"/>',
      'diamond': '<path d="M12 2 L22 12 L12 22 L2 12 Z"/>',
      'hexagon': '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>',
      'star': '<polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>'
    }

    return iconPaths[iconName] || ''
  }
}