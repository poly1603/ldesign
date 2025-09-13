/**
 * @file 图层系统
 * @description 支持多图层编辑，包括文字、贴纸、边框等装饰元素
 */

import type { Point, Size, Rectangle } from '@/types'

/**
 * 图层类型
 */
export enum LayerType {
  /** 背景图层 */
  BACKGROUND = 'background',
  /** 图片图层 */
  IMAGE = 'image',
  /** 文字图层 */
  TEXT = 'text',
  /** 形状图层 */
  SHAPE = 'shape',
  /** 贴纸图层 */
  STICKER = 'sticker',
  /** 边框图层 */
  BORDER = 'border',
  /** 蒙版图层 */
  MASK = 'mask',
  /** 调整图层 */
  ADJUSTMENT = 'adjustment'
}

/**
 * 混合模式
 */
export enum BlendMode {
  NORMAL = 'normal',
  MULTIPLY = 'multiply',
  SCREEN = 'screen',
  OVERLAY = 'overlay',
  SOFT_LIGHT = 'soft-light',
  HARD_LIGHT = 'hard-light',
  COLOR_DODGE = 'color-dodge',
  COLOR_BURN = 'color-burn',
  DARKEN = 'darken',
  LIGHTEN = 'lighten',
  DIFFERENCE = 'difference',
  EXCLUSION = 'exclusion'
}

/**
 * 变换信息
 */
export interface LayerTransform {
  /** 位置 */
  position: Point
  /** 缩放 */
  scale: Point
  /** 旋转角度（弧度） */
  rotation: number
  /** 是否水平翻转 */
  flipX: boolean
  /** 是否垂直翻转 */
  flipY: boolean
  /** 倾斜 */
  skew: Point
}

/**
 * 文字样式
 */
export interface TextStyle {
  /** 字体家族 */
  fontFamily: string
  /** 字体大小 */
  fontSize: number
  /** 字体粗细 */
  fontWeight: string | number
  /** 字体样式 */
  fontStyle: string
  /** 文字颜色 */
  color: string
  /** 描边颜色 */
  strokeColor?: string
  /** 描边宽度 */
  strokeWidth?: number
  /** 文字对齐 */
  textAlign: 'left' | 'center' | 'right'
  /** 行高 */
  lineHeight: number
  /** 字符间距 */
  letterSpacing: number
  /** 文字阴影 */
  textShadow?: {
    offsetX: number
    offsetY: number
    blur: number
    color: string
  }
  /** 背景颜色 */
  backgroundColor?: string
  /** 背景圆角 */
  borderRadius?: number
  /** 内边距 */
  padding?: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

/**
 * 形状属性
 */
export interface ShapeProperties {
  /** 形状类型 */
  type: 'rectangle' | 'circle' | 'triangle' | 'star' | 'polygon' | 'path'
  /** 填充颜色 */
  fillColor?: string
  /** 描边颜色 */
  strokeColor?: string
  /** 描边宽度 */
  strokeWidth?: number
  /** 描边样式 */
  strokeStyle?: 'solid' | 'dashed' | 'dotted'
  /** 圆角（矩形） */
  borderRadius?: number
  /** 边数（多边形） */
  sides?: number
  /** 自定义路径 */
  path?: string
}

/**
 * 边框样式
 */
export interface BorderStyle {
  /** 边框类型 */
  type: 'simple' | 'frame' | 'vintage' | 'modern' | 'decorative'
  /** 边框宽度 */
  width: number
  /** 边框颜色 */
  color: string
  /** 边框图案 */
  pattern?: string
  /** 圆角 */
  borderRadius?: number
  /** 阴影 */
  shadow?: {
    offsetX: number
    offsetY: number
    blur: number
    color: string
  }
  /** 装饰元素 */
  decorations?: Array<{
    type: 'corner' | 'edge' | 'center'
    position: Point
    size: Size
    element: string
  }>
}

/**
 * 贴纸属性
 */
export interface StickerProperties {
  /** 贴纸ID */
  stickerId: string
  /** 贴纸类别 */
  category: string
  /** 贴纸图片URL */
  imageUrl: string
  /** 贴纸名称 */
  name: string
  /** 是否可以改变颜色 */
  colorizable: boolean
  /** 主色调 */
  primaryColor?: string
  /** 动画类型 */
  animation?: 'none' | 'bounce' | 'rotate' | 'pulse' | 'shake'
}

/**
 * 基础图层接口
 */
export interface BaseLayer {
  /** 图层ID */
  id: string
  /** 图层名称 */
  name: string
  /** 图层类型 */
  type: LayerType
  /** 是否可见 */
  visible: boolean
  /** 不透明度 */
  opacity: number
  /** 混合模式 */
  blendMode: BlendMode
  /** 是否锁定 */
  locked: boolean
  /** 变换信息 */
  transform: LayerTransform
  /** 边界框 */
  bounds: Rectangle
  /** 创建时间 */
  createdAt: number
  /** 修改时间 */
  updatedAt: number
  /** 图层数据 */
  data: any
}

/**
 * 文字图层
 */
export interface TextLayer extends BaseLayer {
  type: LayerType.TEXT
  data: {
    text: string
    style: TextStyle
  }
}

/**
 * 形状图层
 */
export interface ShapeLayer extends BaseLayer {
  type: LayerType.SHAPE
  data: {
    properties: ShapeProperties
  }
}

/**
 * 贴纸图层
 */
export interface StickerLayer extends BaseLayer {
  type: LayerType.STICKER
  data: {
    properties: StickerProperties
  }
}

/**
 * 边框图层
 */
export interface BorderLayer extends BaseLayer {
  type: LayerType.BORDER
  data: {
    style: BorderStyle
  }
}

/**
 * 图片图层
 */
export interface ImageLayer extends BaseLayer {
  type: LayerType.IMAGE
  data: {
    imageUrl: string
    imageElement?: HTMLImageElement
  }
}

/**
 * 图层联合类型
 */
export type Layer = TextLayer | ShapeLayer | StickerLayer | BorderLayer | ImageLayer

/**
 * 图层事件数据
 */
export interface LayerEventData {
  layer: Layer
  layerId: string
  eventType: string
  oldValue?: any
  newValue?: any
}

/**
 * 图层系统配置
 */
export interface LayerSystemConfig {
  /** 最大图层数量 */
  maxLayers: number
  /** 默认图层不透明度 */
  defaultOpacity: number
  /** 默认混合模式 */
  defaultBlendMode: BlendMode
  /** 是否启用图层缓存 */
  enableLayerCache: boolean
  /** 缓存质量 */
  cacheQuality: number
}

/**
 * 图层系统类
 */
export class LayerSystem {
  /** 图层列表（从下到上） */
  private layers: Layer[] = []
  
  /** 当前选中的图层 */
  private selectedLayers: Set<string> = new Set()
  
  /** 图层缓存 */
  private layerCache = new Map<string, HTMLCanvasElement>()
  
  /** 主画布 */
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  
  /** 配置选项 */
  private config: LayerSystemConfig
  
  /** 事件监听器 */
  private eventListeners = new Map<string, Set<Function>>()
  
  /** 图层ID计数器 */
  private layerIdCounter = 0

  /** 默认配置 */
  private static readonly DEFAULT_CONFIG: LayerSystemConfig = {
    maxLayers: 50,
    defaultOpacity: 1,
    defaultBlendMode: BlendMode.NORMAL,
    enableLayerCache: true,
    cacheQuality: 1
  }

  /**
   * 构造函数
   */
  constructor(canvas: HTMLCanvasElement, config: Partial<LayerSystemConfig> = {}) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.config = { ...LayerSystem.DEFAULT_CONFIG, ...config }
  }

  /**
   * 创建文字图层
   */
  createTextLayer(text: string, style: Partial<TextStyle> = {}, position?: Point): TextLayer {
    const layer: TextLayer = {
      id: this.generateLayerId(),
      name: `文字图层 ${this.layers.length + 1}`,
      type: LayerType.TEXT,
      visible: true,
      opacity: this.config.defaultOpacity,
      blendMode: this.config.defaultBlendMode,
      locked: false,
      transform: {
        position: position || { x: 100, y: 100 },
        scale: { x: 1, y: 1 },
        rotation: 0,
        flipX: false,
        flipY: false,
        skew: { x: 0, y: 0 }
      },
      bounds: { x: 0, y: 0, width: 0, height: 0 },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      data: {
        text,
        style: {
          fontFamily: 'Arial',
          fontSize: 24,
          fontWeight: 'normal',
          fontStyle: 'normal',
          color: '#000000',
          textAlign: 'left',
          lineHeight: 1.2,
          letterSpacing: 0,
          ...style
        }
      }
    }

    this.updateTextLayerBounds(layer)
    this.addLayer(layer)
    return layer
  }

  /**
   * 创建形状图层
   */
  createShapeLayer(properties: Partial<ShapeProperties> = {}, position?: Point, size?: Size): ShapeLayer {
    const layer: ShapeLayer = {
      id: this.generateLayerId(),
      name: `形状图层 ${this.layers.length + 1}`,
      type: LayerType.SHAPE,
      visible: true,
      opacity: this.config.defaultOpacity,
      blendMode: this.config.defaultBlendMode,
      locked: false,
      transform: {
        position: position || { x: 100, y: 100 },
        scale: { x: 1, y: 1 },
        rotation: 0,
        flipX: false,
        flipY: false,
        skew: { x: 0, y: 0 }
      },
      bounds: {
        x: position?.x || 100,
        y: position?.y || 100,
        width: size?.width || 100,
        height: size?.height || 100
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      data: {
        properties: {
          type: 'rectangle',
          fillColor: '#ff0000',
          strokeColor: '#000000',
          strokeWidth: 2,
          ...properties
        }
      }
    }

    this.addLayer(layer)
    return layer
  }

  /**
   * 创建贴纸图层
   */
  createStickerLayer(properties: StickerProperties, position?: Point, size?: Size): StickerLayer {
    const layer: StickerLayer = {
      id: this.generateLayerId(),
      name: properties.name || `贴纸图层 ${this.layers.length + 1}`,
      type: LayerType.STICKER,
      visible: true,
      opacity: this.config.defaultOpacity,
      blendMode: this.config.defaultBlendMode,
      locked: false,
      transform: {
        position: position || { x: 100, y: 100 },
        scale: { x: 1, y: 1 },
        rotation: 0,
        flipX: false,
        flipY: false,
        skew: { x: 0, y: 0 }
      },
      bounds: {
        x: position?.x || 100,
        y: position?.y || 100,
        width: size?.width || 100,
        height: size?.height || 100
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      data: {
        properties
      }
    }

    this.addLayer(layer)
    return layer
  }

  /**
   * 创建边框图层
   */
  createBorderLayer(style: Partial<BorderStyle> = {}): BorderLayer {
    const layer: BorderLayer = {
      id: this.generateLayerId(),
      name: `边框图层 ${this.layers.length + 1}`,
      type: LayerType.BORDER,
      visible: true,
      opacity: this.config.defaultOpacity,
      blendMode: this.config.defaultBlendMode,
      locked: false,
      transform: {
        position: { x: 0, y: 0 },
        scale: { x: 1, y: 1 },
        rotation: 0,
        flipX: false,
        flipY: false,
        skew: { x: 0, y: 0 }
      },
      bounds: { x: 0, y: 0, width: this.canvas.width, height: this.canvas.height },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      data: {
        style: {
          type: 'simple',
          width: 10,
          color: '#000000',
          ...style
        }
      }
    }

    this.addLayer(layer)
    return layer
  }

  /**
   * 添加图层
   */
  addLayer(layer: Layer, index?: number): void {
    if (this.layers.length >= this.config.maxLayers) {
      console.warn('Maximum layer limit reached')
      return
    }

    if (index !== undefined && index >= 0 && index <= this.layers.length) {
      this.layers.splice(index, 0, layer)
    } else {
      this.layers.push(layer)
    }

    this.emit('layerAdded', { layer, layerId: layer.id, eventType: 'added' })
    this.render()
  }

  /**
   * 删除图层
   */
  removeLayer(layerId: string): boolean {
    const index = this.layers.findIndex(l => l.id === layerId)
    if (index === -1) return false

    const layer = this.layers[index]
    this.layers.splice(index, 1)
    
    // 清理缓存
    this.layerCache.delete(layerId)
    
    // 从选中列表中移除
    this.selectedLayers.delete(layerId)

    this.emit('layerRemoved', { layer, layerId, eventType: 'removed' })
    this.render()
    return true
  }

  /**
   * 获取图层
   */
  getLayer(layerId: string): Layer | null {
    return this.layers.find(l => l.id === layerId) || null
  }

  /**
   * 获取所有图层
   */
  getLayers(): Layer[] {
    return [...this.layers]
  }

  /**
   * 更新图层
   */
  updateLayer(layerId: string, updates: Partial<Layer>): boolean {
    const layer = this.getLayer(layerId)
    if (!layer || layer.locked) return false

    const oldValue = { ...layer }
    Object.assign(layer, updates, { updatedAt: Date.now() })

    // 如果是文字图层且文本或样式改变了，重新计算边界
    if (layer.type === LayerType.TEXT && (updates.data || (updates as any).text || (updates as any).style)) {
      this.updateTextLayerBounds(layer as TextLayer)
    }

    // 清理缓存
    this.layerCache.delete(layerId)

    this.emit('layerUpdated', { layer, layerId, eventType: 'updated', oldValue, newValue: layer })
    this.render()
    return true
  }

  /**
   * 移动图层
   */
  moveLayer(layerId: string, newIndex: number): boolean {
    const currentIndex = this.layers.findIndex(l => l.id === layerId)
    if (currentIndex === -1 || newIndex < 0 || newIndex >= this.layers.length) {
      return false
    }

    const layer = this.layers.splice(currentIndex, 1)[0]
    this.layers.splice(newIndex, 0, layer)

    this.emit('layerMoved', { layer, layerId, eventType: 'moved', oldValue: currentIndex, newValue: newIndex })
    this.render()
    return true
  }

  /**
   * 复制图层
   */
  duplicateLayer(layerId: string): Layer | null {
    const layer = this.getLayer(layerId)
    if (!layer) return null

    const newLayer = {
      ...JSON.parse(JSON.stringify(layer)),
      id: this.generateLayerId(),
      name: `${layer.name} 副本`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    // 稍微偏移位置
    newLayer.transform.position.x += 20
    newLayer.transform.position.y += 20

    this.addLayer(newLayer)
    return newLayer
  }

  /**
   * 选择图层
   */
  selectLayer(layerId: string, multiSelect = false): boolean {
    if (!multiSelect) {
      this.selectedLayers.clear()
    }

    const layer = this.getLayer(layerId)
    if (!layer) return false

    this.selectedLayers.add(layerId)
    this.emit('layerSelected', { layer, layerId, eventType: 'selected' })
    return true
  }

  /**
   * 取消选择图层
   */
  deselectLayer(layerId: string): boolean {
    const layer = this.getLayer(layerId)
    if (!layer || !this.selectedLayers.has(layerId)) return false

    this.selectedLayers.delete(layerId)
    this.emit('layerDeselected', { layer, layerId, eventType: 'deselected' })
    return true
  }

  /**
   * 获取选中的图层
   */
  getSelectedLayers(): Layer[] {
    return this.layers.filter(l => this.selectedLayers.has(l.id))
  }

  /**
   * 变换图层
   */
  transformLayer(layerId: string, transform: Partial<LayerTransform>): boolean {
    const layer = this.getLayer(layerId)
    if (!layer || layer.locked) return false

    const oldTransform = { ...layer.transform }
    Object.assign(layer.transform, transform)
    layer.updatedAt = Date.now()

    // 更新边界框
    this.updateLayerBounds(layer)

    // 清理缓存
    this.layerCache.delete(layerId)

    this.emit('layerTransformed', { 
      layer, 
      layerId, 
      eventType: 'transformed', 
      oldValue: oldTransform, 
      newValue: layer.transform 
    })
    this.render()
    return true
  }

  /**
   * 渲染所有图层
   */
  render(): void {
    // 清空画布
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // 按顺序渲染每个图层
    for (const layer of this.layers) {
      if (!layer.visible || layer.opacity <= 0) continue

      this.renderLayer(layer)
    }

    this.emit('rendered', { eventType: 'rendered' })
  }

  /**
   * 渲染单个图层
   */
  private renderLayer(layer: Layer): void {
    this.ctx.save()

    // 设置全局不透明度和混合模式
    this.ctx.globalAlpha = layer.opacity
    this.ctx.globalCompositeOperation = layer.blendMode

    // 应用变换
    this.applyTransform(layer.transform)

    try {
      // 根据图层类型渲染
      switch (layer.type) {
        case LayerType.TEXT:
          this.renderTextLayer(layer as TextLayer)
          break
        case LayerType.SHAPE:
          this.renderShapeLayer(layer as ShapeLayer)
          break
        case LayerType.STICKER:
          this.renderStickerLayer(layer as StickerLayer)
          break
        case LayerType.BORDER:
          this.renderBorderLayer(layer as BorderLayer)
          break
        case LayerType.IMAGE:
          this.renderImageLayer(layer as ImageLayer)
          break
      }
    } catch (error) {
      console.error('Error rendering layer:', layer.id, error)
    }

    this.ctx.restore()
  }

  /**
   * 应用变换
   */
  private applyTransform(transform: LayerTransform): void {
    const { position, scale, rotation, flipX, flipY, skew } = transform

    // 平移到变换中心
    this.ctx.translate(position.x, position.y)

    // 旋转
    if (rotation !== 0) {
      this.ctx.rotate(rotation)
    }

    // 缩放和翻转
    this.ctx.scale(
      scale.x * (flipX ? -1 : 1),
      scale.y * (flipY ? -1 : 1)
    )

    // 倾斜
    if (skew.x !== 0 || skew.y !== 0) {
      this.ctx.transform(1, skew.y, skew.x, 1, 0, 0)
    }
  }

  /**
   * 渲染文字图层
   */
  private renderTextLayer(layer: TextLayer): void {
    const { text, style } = layer.data
    
    // 设置字体样式
    this.ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize}px ${style.fontFamily}`
    this.ctx.textAlign = style.textAlign as CanvasTextAlign
    this.ctx.fillStyle = style.color
    
    // 设置字符间距
    if (style.letterSpacing !== 0) {
      this.ctx.letterSpacing = `${style.letterSpacing}px`
    }

    // 绘制背景
    if (style.backgroundColor && style.padding) {
      const metrics = this.ctx.measureText(text)
      const bgWidth = metrics.width + style.padding.left + style.padding.right
      const bgHeight = style.fontSize * style.lineHeight + style.padding.top + style.padding.bottom
      
      this.ctx.fillStyle = style.backgroundColor
      if (style.borderRadius) {
        this.drawRoundedRect(-style.padding.left, -style.padding.top, bgWidth, bgHeight, style.borderRadius)
        this.ctx.fill()
      } else {
        this.ctx.fillRect(-style.padding.left, -style.padding.top, bgWidth, bgHeight)
      }
      this.ctx.fillStyle = style.color
    }

    // 绘制阴影
    if (style.textShadow) {
      this.ctx.save()
      this.ctx.shadowOffsetX = style.textShadow.offsetX
      this.ctx.shadowOffsetY = style.textShadow.offsetY
      this.ctx.shadowBlur = style.textShadow.blur
      this.ctx.shadowColor = style.textShadow.color
      this.ctx.fillText(text, 0, 0)
      this.ctx.restore()
    }

    // 绘制描边
    if (style.strokeColor && style.strokeWidth) {
      this.ctx.strokeStyle = style.strokeColor
      this.ctx.lineWidth = style.strokeWidth
      this.ctx.strokeText(text, 0, 0)
    }

    // 绘制文字
    this.ctx.fillText(text, 0, 0)
  }

  /**
   * 渲染形状图层
   */
  private renderShapeLayer(layer: ShapeLayer): void {
    const { properties } = layer.data
    const { bounds } = layer

    this.ctx.beginPath()

    switch (properties.type) {
      case 'rectangle':
        if (properties.borderRadius) {
          this.drawRoundedRect(0, 0, bounds.width, bounds.height, properties.borderRadius)
        } else {
          this.ctx.rect(0, 0, bounds.width, bounds.height)
        }
        break

      case 'circle':
        const radius = Math.min(bounds.width, bounds.height) / 2
        this.ctx.arc(bounds.width / 2, bounds.height / 2, radius, 0, Math.PI * 2)
        break

      case 'triangle':
        this.ctx.moveTo(bounds.width / 2, 0)
        this.ctx.lineTo(0, bounds.height)
        this.ctx.lineTo(bounds.width, bounds.height)
        this.ctx.closePath()
        break

      case 'star':
        this.drawStar(bounds.width / 2, bounds.height / 2, Math.min(bounds.width, bounds.height) / 2, 5)
        break

      case 'polygon':
        if (properties.sides) {
          this.drawPolygon(bounds.width / 2, bounds.height / 2, Math.min(bounds.width, bounds.height) / 2, properties.sides)
        }
        break
    }

    // 填充
    if (properties.fillColor) {
      this.ctx.fillStyle = properties.fillColor
      this.ctx.fill()
    }

    // 描边
    if (properties.strokeColor && properties.strokeWidth) {
      this.ctx.strokeStyle = properties.strokeColor
      this.ctx.lineWidth = properties.strokeWidth
      
      if (properties.strokeStyle === 'dashed') {
        this.ctx.setLineDash([5, 5])
      } else if (properties.strokeStyle === 'dotted') {
        this.ctx.setLineDash([2, 2])
      }
      
      this.ctx.stroke()
      this.ctx.setLineDash([])
    }
  }

  /**
   * 渲染贴纸图层
   */
  private renderStickerLayer(layer: StickerLayer): void {
    const { properties } = layer.data
    const { bounds } = layer

    // 这里应该加载并绘制贴纸图片
    // 简化实现：绘制一个占位矩形
    this.ctx.fillStyle = properties.primaryColor || '#ff6b6b'
    this.ctx.fillRect(0, 0, bounds.width, bounds.height)
    
    // 添加贴纸名称
    this.ctx.fillStyle = '#ffffff'
    this.ctx.font = '14px Arial'
    this.ctx.textAlign = 'center'
    this.ctx.fillText(properties.name, bounds.width / 2, bounds.height / 2)
  }

  /**
   * 渲染边框图层
   */
  private renderBorderLayer(layer: BorderLayer): void {
    const { style } = layer.data
    const { bounds } = layer

    this.ctx.lineWidth = style.width
    this.ctx.strokeStyle = style.color

    // 绘制边框
    if (style.borderRadius) {
      this.drawRoundedRect(style.width / 2, style.width / 2, 
        bounds.width - style.width, bounds.height - style.width, style.borderRadius)
    } else {
      this.ctx.rect(style.width / 2, style.width / 2, 
        bounds.width - style.width, bounds.height - style.width)
    }

    this.ctx.stroke()

    // 绘制阴影
    if (style.shadow) {
      this.ctx.save()
      this.ctx.shadowOffsetX = style.shadow.offsetX
      this.ctx.shadowOffsetY = style.shadow.offsetY
      this.ctx.shadowBlur = style.shadow.blur
      this.ctx.shadowColor = style.shadow.color
      this.ctx.stroke()
      this.ctx.restore()
    }
  }

  /**
   * 渲染图片图层
   */
  private renderImageLayer(layer: ImageLayer): void {
    const { imageElement } = layer.data
    const { bounds } = layer

    if (imageElement) {
      this.ctx.drawImage(imageElement, 0, 0, bounds.width, bounds.height)
    }
  }

  /**
   * 绘制圆角矩形
   */
  private drawRoundedRect(x: number, y: number, width: number, height: number, radius: number): void {
    this.ctx.moveTo(x + radius, y)
    this.ctx.lineTo(x + width - radius, y)
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    this.ctx.lineTo(x + width, y + height - radius)
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    this.ctx.lineTo(x + radius, y + height)
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    this.ctx.lineTo(x, y + radius)
    this.ctx.quadraticCurveTo(x, y, x + radius, y)
  }

  /**
   * 绘制星形
   */
  private drawStar(cx: number, cy: number, radius: number, points: number): void {
    const angle = Math.PI / points
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? radius : radius * 0.5
      const x = cx + r * Math.cos(i * angle - Math.PI / 2)
      const y = cy + r * Math.sin(i * angle - Math.PI / 2)
      if (i === 0) {
        this.ctx.moveTo(x, y)
      } else {
        this.ctx.lineTo(x, y)
      }
    }
    this.ctx.closePath()
  }

  /**
   * 绘制多边形
   */
  private drawPolygon(cx: number, cy: number, radius: number, sides: number): void {
    const angle = (2 * Math.PI) / sides
    for (let i = 0; i < sides; i++) {
      const x = cx + radius * Math.cos(i * angle - Math.PI / 2)
      const y = cy + radius * Math.sin(i * angle - Math.PI / 2)
      if (i === 0) {
        this.ctx.moveTo(x, y)
      } else {
        this.ctx.lineTo(x, y)
      }
    }
    this.ctx.closePath()
  }

  /**
   * 更新文字图层边界
   */
  private updateTextLayerBounds(layer: TextLayer): void {
    const { text, style } = layer.data
    
    // 临时设置字体以测量文本
    this.ctx.save()
    this.ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize}px ${style.fontFamily}`
    
    const metrics = this.ctx.measureText(text)
    const width = metrics.width
    const height = style.fontSize * style.lineHeight
    
    layer.bounds = {
      x: layer.transform.position.x,
      y: layer.transform.position.y - height / 2,
      width,
      height
    }
    
    this.ctx.restore()
  }

  /**
   * 更新图层边界
   */
  private updateLayerBounds(layer: Layer): void {
    // 根据变换更新边界框
    const { position, scale } = layer.transform
    
    layer.bounds = {
      x: position.x - (layer.bounds.width * scale.x) / 2,
      y: position.y - (layer.bounds.height * scale.y) / 2,
      width: layer.bounds.width * Math.abs(scale.x),
      height: layer.bounds.height * Math.abs(scale.y)
    }
  }

  /**
   * 生成图层ID
   */
  private generateLayerId(): string {
    return `layer_${Date.now()}_${++this.layerIdCounter}`
  }

  /**
   * 添加事件监听器
   */
  on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set())
    }
    this.eventListeners.get(event)!.add(listener)
  }

  /**
   * 移除事件监听器
   */
  off(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.delete(listener)
      if (listeners.size === 0) {
        this.eventListeners.delete(event)
      }
    }
  }

  /**
   * 触发事件
   */
  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data)
        } catch (error) {
          console.error('Error in layer event listener:', error)
        }
      })
    }
  }

  /**
   * 导出图层数据
   */
  exportLayers(): any {
    return {
      version: '1.0',
      canvasSize: {
        width: this.canvas.width,
        height: this.canvas.height
      },
      layers: this.layers.map(layer => ({
        ...layer,
        data: layer.type === LayerType.IMAGE ? 
          { ...layer.data, imageElement: undefined } : 
          layer.data
      }))
    }
  }

  /**
   * 导入图层数据
   */
  importLayers(data: any): boolean {
    try {
      if (!data.layers || !Array.isArray(data.layers)) {
        return false
      }

      // 清空现有图层
      this.layers = []
      this.selectedLayers.clear()
      this.layerCache.clear()

      // 导入图层
      for (const layerData of data.layers) {
        this.layers.push(layerData)
      }

      this.render()
      return true
    } catch (error) {
      console.error('Error importing layers:', error)
      return false
    }
  }

  /**
   * 销毁图层系统
   */
  destroy(): void {
    this.layers = []
    this.selectedLayers.clear()
    this.layerCache.clear()
    this.eventListeners.clear()
  }
}
