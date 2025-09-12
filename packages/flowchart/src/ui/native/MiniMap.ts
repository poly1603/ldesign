/**
 * 缩略图组件
 * 显示流程图的缩略图，支持导航和缩放控制
 */

import { createLucideIcon } from '../../utils/icons'

export interface MiniMapConfig {
  width?: number
  height?: number
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  showZoomControls?: boolean
  showViewport?: boolean
  backgroundColor?: string
  borderColor?: string
}

export interface ViewportInfo {
  x: number
  y: number
  width: number
  height: number
  scale: number
}

/**
 * 缩略图组件
 */
export class MiniMap {
  private container: HTMLElement
  private config: Required<MiniMapConfig>
  private miniMapElement: HTMLElement | null = null
  private canvasElement: HTMLCanvasElement | null = null
  private viewportElement: HTMLElement | null = null
  private zoomControlsElement: HTMLElement | null = null
  private ctx: CanvasRenderingContext2D | null = null

  private currentViewport: ViewportInfo = {
    x: 0,
    y: 0,
    width: 800,
    height: 600,
    scale: 1
  }

  private graphBounds = {
    x: 0,
    y: 0,
    width: 800,
    height: 600
  }

  private miniMapScale = 1
  private canvasSize = { width: 4000, height: 3000 } // 画布的实际大小，使用更大的范围

  private isDragging = false
  private onViewportChange?: (viewport: ViewportInfo) => void
  private onZoomChange?: (scale: number) => void

  constructor(container: HTMLElement, config: MiniMapConfig = {}) {
    this.container = container
    this.config = {
      width: config.width || 200,
      height: config.height || 150,
      position: config.position || 'bottom-right',
      showZoomControls: config.showZoomControls !== false,
      showViewport: config.showViewport !== false,
      backgroundColor: config.backgroundColor || 'var(--ldesign-bg-color-container, #ffffff)',
      borderColor: config.borderColor || 'var(--ldesign-border-color, #e5e5e5)'
    }

    this.init()
  }

  /**
   * 初始化缩略图
   */
  private init(): void {
    this.createMiniMap()
    this.createCanvas()
    if (this.config.showViewport) {
      this.createViewport()
    }
    if (this.config.showZoomControls) {
      this.createZoomControls()
    }
    this.bindEvents()
  }

  /**
   * 创建缩略图容器
   */
  private createMiniMap(): void {
    this.miniMapElement = document.createElement('div')
    this.miniMapElement.className = 'ldesign-minimap'
    this.miniMapElement.style.cssText = `
      position: absolute;
      ${this.getPositionStyles()}
      width: ${this.config.width}px;
      height: ${this.config.height + (this.config.showZoomControls ? 40 : 0)}px;
      background: ${this.config.backgroundColor};
      border: 1px solid ${this.config.borderColor};
      border-radius: var(--ls-border-radius-base, 6px);
      box-shadow: var(--ldesign-shadow-2, 0 4px 20px rgba(0, 0, 0, 0.08));
      z-index: 1000;
      overflow: hidden;
    `

    this.container.appendChild(this.miniMapElement)
  }

  /**
   * 获取位置样式
   */
  private getPositionStyles(): string {
    switch (this.config.position) {
      case 'bottom-right':
        return 'bottom: 20px; right: 20px;'
      case 'bottom-left':
        return 'bottom: 20px; left: 20px;'
      case 'top-right':
        return 'top: 20px; right: 20px;'
      case 'top-left':
        return 'top: 20px; left: 20px;'
      default:
        return 'bottom: 20px; right: 20px;'
    }
  }

  /**
   * 创建画布
   */
  private createCanvas(): void {
    if (!this.miniMapElement) return

    this.canvasElement = document.createElement('canvas')
    this.canvasElement.width = this.config.width
    this.canvasElement.height = this.config.height
    this.canvasElement.style.cssText = `
      display: block;
      cursor: pointer;
    `

    this.ctx = this.canvasElement.getContext('2d')
    this.miniMapElement.appendChild(this.canvasElement)
  }

  /**
   * 创建视口指示器
   */
  private createViewport(): void {
    if (!this.miniMapElement) return

    this.viewportElement = document.createElement('div')
    this.viewportElement.className = 'ldesign-minimap-viewport'
    this.viewportElement.style.cssText = `
      position: absolute;
      border: 2px solid var(--ldesign-brand-color, #722ED1);
      background: rgba(114, 46, 209, 0.1);
      cursor: move;
      pointer-events: auto;
    `

    this.miniMapElement.appendChild(this.viewportElement)
  }

  /**
   * 创建缩放控制
   */
  private createZoomControls(): void {
    if (!this.miniMapElement) return

    this.zoomControlsElement = document.createElement('div')
    this.zoomControlsElement.className = 'ldesign-minimap-zoom-controls'
    this.zoomControlsElement.style.cssText = `
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: var(--ldesign-bg-color-component, #fafafa);
      border-top: 1px solid ${this.config.borderColor};
    `

    // 缩小按钮
    const zoomOutBtn = this.createZoomButton('zoom-out', () => {
      this.zoom(0.8)
    })

    // 缩放显示
    const zoomDisplay = document.createElement('span')
    zoomDisplay.className = 'ldesign-minimap-zoom-display'
    zoomDisplay.textContent = '100%'
    zoomDisplay.style.cssText = `
      font-size: 12px;
      color: var(--ldesign-text-color-secondary, rgba(0, 0, 0, 0.7));
      min-width: 40px;
      text-align: center;
    `

    // 放大按钮
    const zoomInBtn = this.createZoomButton('zoom-in', () => {
      this.zoom(1.2)
    })

    this.zoomControlsElement.appendChild(zoomOutBtn)
    this.zoomControlsElement.appendChild(zoomDisplay)
    this.zoomControlsElement.appendChild(zoomInBtn)
    this.miniMapElement.appendChild(this.zoomControlsElement)
  }

  /**
   * 创建缩放按钮
   */
  private createZoomButton(iconName: string, onClick: () => void): HTMLElement {
    const button = document.createElement('button')
    button.innerHTML = createLucideIcon(iconName, { size: 14 })
    button.style.cssText = `
      width: 24px;
      height: 24px;
      border: 1px solid var(--ldesign-border-color, #e5e5e5);
      border-radius: var(--ls-border-radius-sm, 3px);
      background: var(--ldesign-bg-color-container, #ffffff);
      color: var(--ldesign-text-color-secondary, rgba(0, 0, 0, 0.7));
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    `

    button.addEventListener('click', onClick)
    button.addEventListener('mouseenter', () => {
      button.style.borderColor = 'var(--ldesign-brand-color, #722ED1)'
      button.style.color = 'var(--ldesign-brand-color, #722ED1)'
    })
    button.addEventListener('mouseleave', () => {
      button.style.borderColor = 'var(--ldesign-border-color, #e5e5e5)'
      button.style.color = 'var(--ldesign-text-color-secondary, rgba(0, 0, 0, 0.7))'
    })

    return button
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    if (!this.canvasElement || !this.viewportElement) return

    // 画布点击事件
    this.canvasElement.addEventListener('click', (e) => {
      const rect = this.canvasElement!.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // 转换为图形坐标
      const graphCoord = this.convertToGraphCoordinate(x, y)



      // 更新视口位置，让点击的位置成为视口中心
      this.updateViewport({
        ...this.currentViewport,
        x: graphCoord.x - this.currentViewport.width / 2,
        y: graphCoord.y - this.currentViewport.height / 2
      })
    })

    // 视口拖拽事件
    this.viewportElement.addEventListener('mousedown', (e) => {
      this.isDragging = true
      e.preventDefault()
    })

    document.addEventListener('mousemove', (e) => {
      if (!this.isDragging || !this.viewportElement) return

      const rect = this.miniMapElement!.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // 转换为图形坐标
      const graphCoord = this.convertToGraphCoordinate(x, y)



      // 更新视口位置，让拖拽的位置成为视口中心
      this.updateViewport({
        ...this.currentViewport,
        x: graphCoord.x - this.currentViewport.width / 2,
        y: graphCoord.y - this.currentViewport.height / 2
      })
    })

    document.addEventListener('mouseup', () => {
      this.isDragging = false
    })
  }

  /**
   * 转换缩略图坐标为图形坐标
   */
  private convertToGraphCoordinate(x: number, y: number): { x: number; y: number } {
    // 转换坐标
    const graphX = x / this.miniMapScale + this.graphBounds.x
    const graphY = y / this.miniMapScale + this.graphBounds.y

    return { x: graphX, y: graphY }
  }

  /**
   * 更新视口
   */
  updateViewport(viewport: ViewportInfo): void {
    this.currentViewport = { ...viewport }
    this.renderViewport()

    if (this.onViewportChange) {
      this.onViewportChange(this.currentViewport)
    }
  }

  /**
   * 渲染视口指示器
   */
  private renderViewport(): void {
    if (!this.viewportElement) return

    // 计算视口在缩略图中的位置和大小
    const viewportX = (this.currentViewport.x - this.graphBounds.x) * this.miniMapScale
    const viewportY = (this.currentViewport.y - this.graphBounds.y) * this.miniMapScale
    const viewportWidth = this.currentViewport.width * this.miniMapScale
    const viewportHeight = this.currentViewport.height * this.miniMapScale



    // 限制视口在缩略图范围内
    const left = Math.max(0, Math.min(viewportX, this.config.width - viewportWidth))
    const top = Math.max(0, Math.min(viewportY, this.config.height - viewportHeight))
    const width = Math.min(viewportWidth, this.config.width - left)
    const height = Math.min(viewportHeight, this.config.height - top)

    this.viewportElement.style.left = `${left}px`
    this.viewportElement.style.top = `${top}px`
    this.viewportElement.style.width = `${width}px`
    this.viewportElement.style.height = `${height}px`
  }

  /**
   * 缩放
   */
  zoom(factor: number): void {
    const newScale = Math.max(0.1, Math.min(5, this.currentViewport.scale * factor))

    this.updateViewport({
      ...this.currentViewport,
      scale: newScale
    })

    // 更新缩放显示
    if (this.zoomControlsElement) {
      const display = this.zoomControlsElement.querySelector('.ldesign-minimap-zoom-display')
      if (display) {
        display.textContent = `${Math.round(newScale * 100)}%`
      }
    }

    if (this.onZoomChange) {
      this.onZoomChange(newScale)
    }
  }

  /**
   * 渲染图形内容
   */
  renderGraph(nodes: any[], edges: any[]): void {
    if (!this.ctx) return

    // 清空画布
    this.ctx.clearRect(0, 0, this.config.width, this.config.height)

    // 绘制背景
    this.drawBackground()

    // 如果没有节点，只渲染视口
    if (nodes.length === 0) {
      this.renderViewport()
      return
    }

    // 计算整个画布的范围（不只是节点范围）
    this.calculateCanvasBounds(nodes)

    // 计算缩放比例，让整个画布区域适配到缩略图中
    const scaleX = this.config.width / this.graphBounds.width
    const scaleY = this.config.height / this.graphBounds.height
    this.miniMapScale = Math.min(scaleX, scaleY)

    // 绘制边
    this.ctx.strokeStyle = '#d9d9d9'
    this.ctx.lineWidth = 1
    edges.forEach(edge => {
      if (edge.startPoint && edge.endPoint) {
        this.ctx!.beginPath()
        this.ctx!.moveTo(
          (edge.startPoint.x - this.graphBounds.x) * this.miniMapScale,
          (edge.startPoint.y - this.graphBounds.y) * this.miniMapScale
        )
        this.ctx!.lineTo(
          (edge.endPoint.x - this.graphBounds.x) * this.miniMapScale,
          (edge.endPoint.y - this.graphBounds.y) * this.miniMapScale
        )
        this.ctx!.stroke()
      }
    })

    // 绘制节点
    nodes.forEach(node => {
      const x = (node.x - this.graphBounds.x) * this.miniMapScale
      const y = (node.y - this.graphBounds.y) * this.miniMapScale
      const width = Math.max(4, (node.width || 80) * this.miniMapScale)
      const height = Math.max(4, (node.height || 40) * this.miniMapScale)

      this.renderNode(node, x, y, width, height)
    })

    this.renderViewport()
  }

  /**
   * 渲染单个节点
   */
  private renderNode(node: any, x: number, y: number, width: number, height: number): void {
    if (!this.ctx) return

    const nodeType = node.type || 'process'

    // 保存当前状态
    this.ctx.save()

    // 根据节点类型设置样式和形状
    switch (nodeType) {
      case 'start':
        // 开始节点 - 绿色圆形
        this.ctx.fillStyle = '#52c41a'
        this.ctx.beginPath()
        this.ctx.arc(x, y, Math.min(width, height) / 2, 0, 2 * Math.PI)
        this.ctx.fill()
        break

      case 'end':
        // 结束节点 - 红色圆形
        this.ctx.fillStyle = '#ff4d4f'
        this.ctx.beginPath()
        this.ctx.arc(x, y, Math.min(width, height) / 2, 0, 2 * Math.PI)
        this.ctx.fill()
        break

      case 'approval':
        // 审批节点 - 蓝色矩形
        this.ctx.fillStyle = '#1890ff'
        this.ctx.fillRect(x - width / 2, y - height / 2, width, height)
        break

      case 'condition':
        // 条件节点 - 橙色菱形
        this.ctx.fillStyle = '#fa8c16'
        this.ctx.beginPath()
        this.ctx.moveTo(x, y - height / 2)
        this.ctx.lineTo(x + width / 2, y)
        this.ctx.lineTo(x, y + height / 2)
        this.ctx.lineTo(x - width / 2, y)
        this.ctx.closePath()
        this.ctx.fill()
        break

      case 'user-task':
      case 'service-task':
      case 'script-task':
      case 'manual-task':
        // 任务节点 - 紫色圆角矩形
        this.ctx.fillStyle = '#722ed1'
        const radius = Math.min(width, height) * 0.1
        this.drawRoundedRect(x - width / 2, y - height / 2, width, height, radius)
        this.ctx.fill()
        break

      case 'parallel-gateway':
      case 'exclusive-gateway':
      case 'inclusive-gateway':
      case 'event-gateway':
        // 网关节点 - 黄色菱形
        this.ctx.fillStyle = '#fadb14'
        this.ctx.beginPath()
        this.ctx.moveTo(x, y - height / 2)
        this.ctx.lineTo(x + width / 2, y)
        this.ctx.lineTo(x, y + height / 2)
        this.ctx.lineTo(x - width / 2, y)
        this.ctx.closePath()
        this.ctx.fill()
        break

      default:
        // 默认节点 - 灰色矩形
        this.ctx.fillStyle = '#8c8c8c'
        this.ctx.fillRect(x - width / 2, y - height / 2, width, height)
        break
    }

    // 添加边框
    this.ctx.strokeStyle = '#ffffff'
    this.ctx.lineWidth = 1
    this.ctx.stroke()

    // 恢复状态
    this.ctx.restore()
  }

  /**
   * 绘制背景
   */
  private drawBackground(): void {
    if (!this.ctx) return

    // 绘制背景色
    this.ctx.fillStyle = '#fafafa'
    this.ctx.fillRect(0, 0, this.config.width, this.config.height)

    // 绘制网格
    this.ctx.strokeStyle = '#f0f0f0'
    this.ctx.lineWidth = 0.5

    const gridSize = 20 * this.miniMapScale
    if (gridSize > 2) { // 只有当网格足够大时才绘制
      // 绘制垂直线
      for (let x = 0; x <= this.config.width; x += gridSize) {
        this.ctx.beginPath()
        this.ctx.moveTo(x, 0)
        this.ctx.lineTo(x, this.config.height)
        this.ctx.stroke()
      }

      // 绘制水平线
      for (let y = 0; y <= this.config.height; y += gridSize) {
        this.ctx.beginPath()
        this.ctx.moveTo(0, y)
        this.ctx.lineTo(this.config.width, y)
        this.ctx.stroke()
      }
    }
  }

  /**
   * 计算画布边界
   */
  private calculateCanvasBounds(nodes: any[]): void {
    // 使用固定的画布大小，确保小地图显示完整的可操作区域
    const canvasWidth = this.canvasSize.width
    const canvasHeight = this.canvasSize.height

    // 画布中心在(0,0)，所以边界是从负一半到正一半
    this.graphBounds = {
      x: -canvasWidth / 2,
      y: -canvasHeight / 2,
      width: canvasWidth,
      height: canvasHeight
    }


  }

  /**
   * 绘制圆角矩形
   */
  private drawRoundedRect(x: number, y: number, width: number, height: number, radius: number): void {
    if (!this.ctx) return

    this.ctx.beginPath()
    this.ctx.moveTo(x + radius, y)
    this.ctx.lineTo(x + width - radius, y)
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    this.ctx.lineTo(x + width, y + height - radius)
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    this.ctx.lineTo(x + radius, y + height)
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    this.ctx.lineTo(x, y + radius)
    this.ctx.quadraticCurveTo(x, y, x + radius, y)
    this.ctx.closePath()
  }

  /**
   * 计算图形边界
   */
  private calculateGraphBounds(nodes: any[]): void {
    if (nodes.length === 0) return

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

    nodes.forEach(node => {
      const nodeWidth = node.width || 80
      const nodeHeight = node.height || 40

      minX = Math.min(minX, node.x - nodeWidth / 2)
      minY = Math.min(minY, node.y - nodeHeight / 2)
      maxX = Math.max(maxX, node.x + nodeWidth / 2)
      maxY = Math.max(maxY, node.y + nodeHeight / 2)
    })

    // 添加边距
    const padding = 50
    this.graphBounds = {
      minX: minX - padding,
      minY: minY - padding,
      maxX: maxX + padding,
      maxY: maxY + padding
    }
  }

  /**
   * 设置视口变化回调
   */
  onViewportChanged(callback: (viewport: ViewportInfo) => void): void {
    this.onViewportChange = callback
  }

  /**
   * 设置缩放变化回调
   */
  onZoomChanged(callback: (scale: number) => void): void {
    this.onZoomChange = callback
  }

  /**
   * 显示/隐藏缩略图
   */
  setVisible(visible: boolean): void {
    if (this.miniMapElement) {
      this.miniMapElement.style.display = visible ? 'block' : 'none'
    }
  }

  /**
   * 销毁缩略图
   */
  destroy(): void {
    if (this.miniMapElement && this.container.contains(this.miniMapElement)) {
      this.container.removeChild(this.miniMapElement)
    }
    this.miniMapElement = null
    this.canvasElement = null
    this.viewportElement = null
    this.zoomControlsElement = null
    this.ctx = null
  }
}
