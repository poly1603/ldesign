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
      'shape-rectangle',
      'shape-circle',
      'aspect-ratio',
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

      case 'shape-rectangle':
        return this.createShapeButton('rectangle', 'square', '矩形', Shape.RECTANGLE)

      case 'shape-circle':
        return this.createShapeButton('circle', 'circle', '圆形', Shape.CIRCLE)

      case 'shape-ellipse':
        return this.createShapeButton('ellipse', 'ellipsis', '椭圆', Shape.ELLIPSE)

      case 'aspect-ratio':
        return this.createAspectRatioSelect()

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
      'download': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/>'
    }

    return iconPaths[iconName] || ''
  }
}