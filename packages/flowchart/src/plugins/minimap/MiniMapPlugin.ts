/**
 * 极简小地图插件
 * 核心功能：显示缩略图、视口指示、点击导航
 */

export interface MiniMapConfig {
  width?: number
  height?: number
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  backgroundColor?: string
  borderColor?: string
  viewportColor?: string
  showGrid?: boolean
  showViewport?: boolean
  zIndex?: number
}

export interface ViewportInfo {
  x: number
  y: number
  width: number
  height: number
  scale: number
}

export class MiniMapPlugin {
  private lf: any
  private container: HTMLElement
  private element: HTMLElement | null = null
  private canvas: HTMLCanvasElement | null = null
  private viewportRect: HTMLElement | null = null
  private ctx: CanvasRenderingContext2D | null = null

  private config: Required<MiniMapConfig>
  private isDragging = false

  // 状态
  private scale = 0.1
  private bounds = { x: -1000, y: -1000, width: 2000, height: 2000 }
  private currentViewport = { x: 0, y: 0, width: 800, height: 600 }

  constructor(lf: any, container: HTMLElement, config: MiniMapConfig = {}) {
    this.lf = lf
    this.container = container

    this.config = {
      width: config.width || 200,
      height: config.height || 150,
      position: config.position || 'bottom-right',
      backgroundColor: config.backgroundColor || '#fafafa',
      borderColor: config.borderColor || '#d9d9d9',
      viewportColor: config.viewportColor || '#722ed1',
      showGrid: config.showGrid !== false,
      showViewport: config.showViewport !== false,
      zIndex: config.zIndex || 1000
    }

    this.init()
  }

  private init(): void {
    this.createElements()
    this.bindEvents()
    this.refresh()
  }

  private refresh(): void {
    this.updateBounds()
    this.draw()
    this.updateViewportRect()
  }

  private updateBounds(): void {
    const data = this.lf.getGraphData()
    const nodes = data.nodes || []

    if (nodes.length === 0) {
      this.bounds = { x: -1000, y: -1000, width: 2000, height: 2000 }
      this.scale = this.config.width / 2000
      return
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

    nodes.forEach((node: any) => {
      minX = Math.min(minX, node.x - 50)
      maxX = Math.max(maxX, node.x + 50)
      minY = Math.min(minY, node.y - 30)
      maxY = Math.max(maxY, node.y + 30)
    })

    const padding = 100
    this.bounds = {
      x: minX - padding,
      y: minY - padding,
      width: maxX - minX + padding * 2,
      height: maxY - minY + padding * 2
    }

    const scaleX = this.config.width / this.bounds.width
    const scaleY = this.config.height / this.bounds.height
    this.scale = Math.min(scaleX, scaleY)
  }

  private createElements(): void {
    // 创建容器
    this.element = document.createElement('div')
    this.element.style.cssText = `
      position: absolute;
      width: ${this.config.width}px;
      height: ${this.config.height}px;
      background: ${this.config.backgroundColor};
      border: 1px solid ${this.config.borderColor};
      border-radius: 4px;
      z-index: ${this.config.zIndex};
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      ${this.getPosition()}
      overflow: hidden;
    `

    // 创建画布
    this.canvas = document.createElement('canvas')
    this.canvas.width = this.config.width
    this.canvas.height = this.config.height
    this.canvas.style.cssText = 'display: block; width: 100%; height: 100%; cursor: pointer;'
    this.ctx = this.canvas.getContext('2d')

    // 创建视口
    if (this.config.showViewport) {
      this.viewportRect = document.createElement('div')
      this.viewportRect.style.cssText = `
        position: absolute;
        border: 2px solid ${this.config.viewportColor};
        background: rgba(114, 46, 209, 0.1);
        cursor: move;
        pointer-events: auto;
        box-sizing: border-box;
      `
      this.element.appendChild(this.viewportRect)
    }

    this.element.appendChild(this.canvas)
    this.container.appendChild(this.element)
  }

  private getPosition(): string {
    const margin = '10px'
    switch (this.config.position) {
      case 'top-left': return `top: ${margin}; left: ${margin};`
      case 'top-right': return `top: ${margin}; right: ${margin};`
      case 'bottom-left': return `bottom: ${margin}; left: ${margin};`
      default: return `bottom: ${margin}; right: ${margin};`
    }
  }

  private bindEvents(): void {
    if (!this.canvas) return

    // 点击导航
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas!.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const worldX = this.bounds.x + (x / this.scale)
      const worldY = this.bounds.y + (y / this.scale)

      this.lf.translateCenter(worldX, worldY)
    })

    // 视口拖拽
    if (this.viewportRect) {
      this.viewportRect.addEventListener('mousedown', (e) => {
        e.preventDefault()
        this.isDragging = true
      })

      document.addEventListener('mousemove', (e) => {
        if (!this.isDragging) return

        const rect = this.element!.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        const worldX = this.bounds.x + (x / this.scale)
        const worldY = this.bounds.y + (y / this.scale)

        this.lf.translateCenter(worldX, worldY)
      })

      document.addEventListener('mouseup', () => {
        this.isDragging = false
      })
    }

    // 监听事件
    this.lf.on('graph:transform', () => this.refresh())
    this.lf.on('node:add', () => this.refresh())
    this.lf.on('node:delete', () => this.refresh())
    this.lf.on('node:drop', () => this.refresh())
    this.lf.on('edge:add', () => this.refresh())
    this.lf.on('edge:delete', () => this.refresh())
  }

  private draw(): void {
    if (!this.ctx) return

    // 清空画布
    this.ctx.clearRect(0, 0, this.config.width, this.config.height)

    // 绘制背景网格
    if (this.config.showGrid) {
      this.drawGrid()
    }

    // 绘制内容
    const data = this.lf.getGraphData()
    this.drawNodes(data.nodes || [])
    this.drawEdges(data.edges || [])
  }

  private drawGrid(): void {
    if (!this.ctx) return

    this.ctx.strokeStyle = '#f0f0f0'
    this.ctx.lineWidth = 0.5

    const gridSize = 20 * this.scale
    if (gridSize < 2) return

    for (let x = 0; x <= this.config.width; x += gridSize) {
      this.ctx.beginPath()
      this.ctx.moveTo(x, 0)
      this.ctx.lineTo(x, this.config.height)
      this.ctx.stroke()
    }

    for (let y = 0; y <= this.config.height; y += gridSize) {
      this.ctx.beginPath()
      this.ctx.moveTo(0, y)
      this.ctx.lineTo(this.config.width, y)
      this.ctx.stroke()
    }
  }

  private drawNodes(nodes: any[]): void {
    if (!this.ctx) return

    nodes.forEach(node => {
      const x = (node.x - this.bounds.x) * this.scale
      const y = (node.y - this.bounds.y) * this.scale

      // 节点大小
      const size = Math.max(3, 8 * this.scale)

      // 节点颜色
      let color = '#1890ff'
      switch (node.type) {
        case 'start': color = '#52c41a'; break
        case 'end': color = '#f5222d'; break
        case 'approval': color = '#722ed1'; break
        case 'condition': color = '#fa8c16'; break
        case 'gateway': color = '#13c2c2'; break
        default: color = '#1890ff'
      }

      this.ctx.fillStyle = color
      this.ctx.beginPath()
      this.ctx.arc(x, y, size / 2, 0, 2 * Math.PI)
      this.ctx.fill()
    })
  }

  private drawEdges(edges: any[]): void {
    if (!this.ctx) return

    this.ctx.strokeStyle = '#d9d9d9'
    this.ctx.lineWidth = Math.max(0.5, 1 * this.scale)

    edges.forEach(edge => {
      if (!edge.startPoint || !edge.endPoint) return

      const startX = (edge.startPoint.x - this.bounds.x) * this.scale
      const startY = (edge.startPoint.y - this.bounds.y) * this.scale
      const endX = (edge.endPoint.x - this.bounds.x) * this.scale
      const endY = (edge.endPoint.y - this.bounds.y) * this.scale

      this.ctx.beginPath()
      this.ctx.moveTo(startX, startY)
      this.ctx.lineTo(endX, endY)
      this.ctx.stroke()
    })
  }

  private updateViewportRect(): void {
    if (!this.viewportRect || !this.config.showViewport) return

    try {
      const transform = this.lf.getTransform()
      if (!transform) return

      const container = this.lf.container || this.container
      if (!container) return

      const rect = container.getBoundingClientRect()

      // 计算当前视口
      const centerX = -transform.TRANSLATE_X / transform.SCALE_X
      const centerY = -transform.TRANSLATE_Y / transform.SCALE_Y
      const width = rect.width / transform.SCALE_X
      const height = rect.height / transform.SCALE_Y

      this.currentViewport = {
        x: centerX - width / 2,
        y: centerY - height / 2,
        width,
        height
      }

      // 计算视口在小地图中的位置
      const x = (this.currentViewport.x - this.bounds.x) * this.scale
      const y = (this.currentViewport.y - this.bounds.y) * this.scale
      const w = this.currentViewport.width * this.scale
      const h = this.currentViewport.height * this.scale

      // 限制在小地图范围内
      const left = Math.max(0, Math.min(x, this.config.width - w))
      const top = Math.max(0, Math.min(y, this.config.height - h))
      const finalWidth = Math.min(w, this.config.width - left)
      const finalHeight = Math.min(h, this.config.height - top)

      this.viewportRect.style.left = `${left}px`
      this.viewportRect.style.top = `${top}px`
      this.viewportRect.style.width = `${finalWidth}px`
      this.viewportRect.style.height = `${finalHeight}px`
    } catch (error) {
      console.warn('更新视口失败:', error)
    }
  }

  // 公共方法
  public setVisible(visible: boolean): void {
    if (this.element) {
      this.element.style.display = visible ? 'block' : 'none'
    }
  }

  public forceUpdate(): void {
    this.refresh()
  }

  public getCurrentViewport(): ViewportInfo {
    return { ...this.currentViewport, scale: 1 }
  }

  public render(): void {
    this.refresh()
  }

  public onViewportChanged(callback: (viewport: ViewportInfo) => void): void {
    // 简化版本，不需要回调
  }

  public onZoomChanged(callback: (scale: number) => void): void {
    // 简化版本，不需要回调
  }

  public destroy(): void {
    if (this.lf) {
      this.lf.off('graph:transform')
      this.lf.off('node:add')
      this.lf.off('node:delete')
      this.lf.off('node:drop')
      this.lf.off('edge:add')
      this.lf.off('edge:delete')
    }

    if (this.element && this.container.contains(this.element)) {
      this.container.removeChild(this.element)
    }

    this.element = null
    this.canvas = null
    this.viewportRect = null
    this.ctx = null
  }
}
