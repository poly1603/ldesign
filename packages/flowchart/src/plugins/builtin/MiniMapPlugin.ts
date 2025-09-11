/**
 * 小地图插件
 * 
 * 为流程图编辑器添加小地图功能，方便用户导航大型流程图
 */

import { BasePlugin } from '../BasePlugin'
import type { FlowchartEditor } from '../../core/FlowchartEditor'

/**
 * 小地图插件配置
 */
export interface MiniMapConfig {
  /** 小地图容器选择器或元素 */
  container?: string | HTMLElement
  /** 小地图宽度 */
  width?: number
  /** 小地图高度 */
  height?: number
  /** 是否显示网格 */
  showGrid?: boolean
  /** 背景颜色 */
  backgroundColor?: string
  /** 视口框颜色 */
  viewportColor?: string
}

/**
 * 小地图插件类
 */
export class MiniMapPlugin extends BasePlugin {
  readonly name = 'minimap'
  readonly version = '1.0.0'
  readonly description = '小地图插件，提供流程图导航功能'

  private config: MiniMapConfig
  private miniMapContainer?: HTMLElement
  private miniMapCanvas?: HTMLCanvasElement
  private ctx?: CanvasRenderingContext2D
  private resizeObserver?: ResizeObserver

  /**
   * 构造函数
   * @param config 插件配置
   */
  constructor(config: MiniMapConfig = {}) {
    super()
    this.config = {
      width: 200,
      height: 150,
      showGrid: true,
      backgroundColor: '#f5f5f5',
      viewportColor: '#1890ff',
      ...config
    }
  }

  /**
   * 安装插件
   */
  protected onInstall(): void {
    this.createMiniMap()
    this.bindEvents()
    this.updateMiniMap()
  }

  /**
   * 卸载插件
   */
  protected onUninstall(): void {
    this.destroyMiniMap()
    this.unbindEvents()
  }

  /**
   * 创建小地图
   */
  private createMiniMap(): void {
    // 创建小地图容器
    if (this.config.container) {
      if (typeof this.config.container === 'string') {
        this.miniMapContainer = document.querySelector(this.config.container) as HTMLElement
      } else {
        this.miniMapContainer = this.config.container
      }
    } else {
      // 创建默认容器
      this.miniMapContainer = document.createElement('div')
      this.miniMapContainer.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        border: 1px solid #d9d9d9;
        border-radius: 4px;
        background: white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        z-index: 1000;
      `
      
      const editor = this.getEditor()
      const editorContainer = editor.getContainer()
      if (editorContainer.style.position !== 'relative' && editorContainer.style.position !== 'absolute') {
        editorContainer.style.position = 'relative'
      }
      editorContainer.appendChild(this.miniMapContainer)
    }

    // 创建画布
    this.miniMapCanvas = document.createElement('canvas')
    this.miniMapCanvas.width = this.config.width!
    this.miniMapCanvas.height = this.config.height!
    this.miniMapCanvas.style.cssText = `
      display: block;
      cursor: pointer;
    `

    this.ctx = this.miniMapCanvas.getContext('2d')!
    this.miniMapContainer.appendChild(this.miniMapCanvas)

    // 添加点击事件
    this.miniMapCanvas.addEventListener('click', this.onMiniMapClick.bind(this))
  }

  /**
   * 销毁小地图
   */
  private destroyMiniMap(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = undefined
    }

    if (this.miniMapCanvas) {
      this.miniMapCanvas.removeEventListener('click', this.onMiniMapClick.bind(this))
    }

    if (this.miniMapContainer && this.miniMapContainer.parentElement) {
      this.miniMapContainer.parentElement.removeChild(this.miniMapContainer)
    }

    this.miniMapContainer = undefined
    this.miniMapCanvas = undefined
    this.ctx = undefined
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    // 监听画布变化事件
    this.addEventListener('graph:updated', this.updateMiniMap.bind(this))
    this.addEventListener('graph:transform', this.updateMiniMap.bind(this))
    
    // 监听窗口大小变化
    this.resizeObserver = new ResizeObserver(() => {
      this.updateMiniMap()
    })
    
    const editor = this.getEditor()
    this.resizeObserver.observe(editor.getContainer())
  }

  /**
   * 解绑事件
   */
  private unbindEvents(): void {
    this.removeEventListener('graph:updated', this.updateMiniMap.bind(this))
    this.removeEventListener('graph:transform', this.updateMiniMap.bind(this))
    
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
    }
  }

  /**
   * 更新小地图
   */
  private updateMiniMap(): void {
    if (!this.ctx || !this.miniMapCanvas) return

    const editor = this.getEditor()
    const lf = this.getLogicFlow()
    
    // 清空画布
    this.ctx.clearRect(0, 0, this.miniMapCanvas.width, this.miniMapCanvas.height)
    
    // 绘制背景
    this.ctx.fillStyle = this.config.backgroundColor!
    this.ctx.fillRect(0, 0, this.miniMapCanvas.width, this.miniMapCanvas.height)

    // 获取图形数据
    const graphData = lf.getGraphData()
    if (!graphData.nodes.length) return

    // 计算缩放比例
    const bounds = this.calculateBounds(graphData)
    const scaleX = this.miniMapCanvas.width / bounds.width
    const scaleY = this.miniMapCanvas.height / bounds.height
    const scale = Math.min(scaleX, scaleY) * 0.8 // 留一些边距

    // 绘制节点
    this.ctx.save()
    this.ctx.translate(
      (this.miniMapCanvas.width - bounds.width * scale) / 2,
      (this.miniMapCanvas.height - bounds.height * scale) / 2
    )

    graphData.nodes.forEach(node => {
      this.drawNode(node, bounds, scale)
    })

    graphData.edges.forEach(edge => {
      this.drawEdge(edge, graphData.nodes, bounds, scale)
    })

    this.ctx.restore()

    // 绘制视口框
    this.drawViewport(bounds, scale)
  }

  /**
   * 计算图形边界
   */
  private calculateBounds(graphData: any): { x: number; y: number; width: number; height: number } {
    if (!graphData.nodes.length) {
      return { x: 0, y: 0, width: 100, height: 100 }
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

    graphData.nodes.forEach((node: any) => {
      minX = Math.min(minX, node.x - 50)
      minY = Math.min(minY, node.y - 25)
      maxX = Math.max(maxX, node.x + 50)
      maxY = Math.max(maxY, node.y + 25)
    })

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    }
  }

  /**
   * 绘制节点
   */
  private drawNode(node: any, bounds: any, scale: number): void {
    if (!this.ctx) return

    const x = (node.x - bounds.x) * scale
    const y = (node.y - bounds.y) * scale

    this.ctx.fillStyle = this.getNodeColor(node.type)
    this.ctx.strokeStyle = '#666'
    this.ctx.lineWidth = 1

    // 根据节点类型绘制不同形状
    if (node.type === 'start' || node.type === 'end') {
      // 圆形
      this.ctx.beginPath()
      this.ctx.arc(x, y, 8 * scale, 0, Math.PI * 2)
      this.ctx.fill()
      this.ctx.stroke()
    } else if (node.type === 'condition' || node.type.includes('gateway')) {
      // 菱形
      this.ctx.beginPath()
      this.ctx.moveTo(x, y - 8 * scale)
      this.ctx.lineTo(x + 8 * scale, y)
      this.ctx.lineTo(x, y + 8 * scale)
      this.ctx.lineTo(x - 8 * scale, y)
      this.ctx.closePath()
      this.ctx.fill()
      this.ctx.stroke()
    } else {
      // 矩形
      this.ctx.fillRect(x - 8 * scale, y - 6 * scale, 16 * scale, 12 * scale)
      this.ctx.strokeRect(x - 8 * scale, y - 6 * scale, 16 * scale, 12 * scale)
    }
  }

  /**
   * 绘制边
   */
  private drawEdge(edge: any, nodes: any[], bounds: any, scale: number): void {
    if (!this.ctx) return

    const sourceNode = nodes.find(n => n.id === edge.sourceNodeId)
    const targetNode = nodes.find(n => n.id === edge.targetNodeId)

    if (!sourceNode || !targetNode) return

    const x1 = (sourceNode.x - bounds.x) * scale
    const y1 = (sourceNode.y - bounds.y) * scale
    const x2 = (targetNode.x - bounds.x) * scale
    const y2 = (targetNode.y - bounds.y) * scale

    this.ctx.strokeStyle = '#999'
    this.ctx.lineWidth = 1
    this.ctx.beginPath()
    this.ctx.moveTo(x1, y1)
    this.ctx.lineTo(x2, y2)
    this.ctx.stroke()
  }

  /**
   * 绘制视口框
   */
  private drawViewport(bounds: any, scale: number): void {
    if (!this.ctx) return

    // 这里需要获取当前视口信息
    // 简化实现，绘制一个示例视口框
    this.ctx.strokeStyle = this.config.viewportColor!
    this.ctx.lineWidth = 2
    this.ctx.strokeRect(10, 10, 50, 30)
  }

  /**
   * 获取节点颜色
   */
  private getNodeColor(nodeType: string): string {
    const colorMap: Record<string, string> = {
      start: '#52c41a',
      approval: '#1890ff',
      condition: '#faad14',
      end: '#ff4d4f',
      process: '#666666',
      'parallel-gateway': '#722ed1',
      'exclusive-gateway': '#13c2c2'
    }
    return colorMap[nodeType] || '#666666'
  }

  /**
   * 小地图点击事件
   */
  private onMiniMapClick(event: MouseEvent): void {
    if (!this.miniMapCanvas) return

    const rect = this.miniMapCanvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // 这里需要将小地图坐标转换为实际画布坐标，并移动视口
    console.log('小地图点击:', { x, y })
    
    // 简化实现：显示通知
    this.showNotification('小地图导航功能', 'info')
  }

  /**
   * 设置小地图配置
   */
  public setConfig(config: Partial<MiniMapConfig>): void {
    this.config = { ...this.config, ...config }
    if (this.installed) {
      this.updateMiniMap()
    }
  }

  /**
   * 显示小地图
   */
  public show(): void {
    if (this.miniMapContainer) {
      this.miniMapContainer.style.display = 'block'
    }
  }

  /**
   * 隐藏小地图
   */
  public hide(): void {
    if (this.miniMapContainer) {
      this.miniMapContainer.style.display = 'none'
    }
  }

  /**
   * 切换小地图显示状态
   */
  public toggle(): void {
    if (this.miniMapContainer) {
      const isVisible = this.miniMapContainer.style.display !== 'none'
      this.miniMapContainer.style.display = isVisible ? 'none' : 'block'
    }
  }
}
