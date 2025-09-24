/**
 * 虚拟渲染器
 * 实现虚拟滚动和分层渲染，优化大型流程图的渲染性能
 */

import type { ApprovalNodeConfig, ApprovalEdgeConfig } from '../types'

export interface ViewportInfo {
  /** 可视区域左上角X坐标 */
  x: number
  /** 可视区域左上角Y坐标 */
  y: number
  /** 可视区域宽度 */
  width: number
  /** 可视区域高度 */
  height: number
  /** 缩放比例 */
  scale: number
}

export interface RenderLevel {
  /** 渲染级别名称 */
  name: string
  /** 最小缩放比例 */
  minScale: number
  /** 最大缩放比例 */
  maxScale: number
  /** 是否显示节点文本 */
  showText: boolean
  /** 是否显示节点详细信息 */
  showDetails: boolean
  /** 是否显示边标签 */
  showEdgeLabels: boolean
  /** 节点简化程度 (0-1, 0为不简化，1为最简化) */
  simplificationLevel: number
}

export interface VirtualRenderConfig {
  /** 是否启用虚拟渲染 */
  enabled: boolean
  /** 可视区域缓冲区大小（像素） */
  bufferSize: number
  /** 最大同时渲染的节点数量 */
  maxVisibleNodes: number
  /** 最大同时渲染的边数量 */
  maxVisibleEdges: number
  /** 渲染级别配置 */
  renderLevels: RenderLevel[]
  /** 是否启用节点懒加载 */
  enableLazyLoading: boolean
  /** 懒加载延迟时间（毫秒） */
  lazyLoadDelay: number
}

/**
 * 虚拟渲染器类
 */
export class VirtualRenderer {
  private config: VirtualRenderConfig
  private viewport: ViewportInfo
  private visibleNodes: Set<string> = new Set()
  private visibleEdges: Set<string> = new Set()
  private renderLevel: RenderLevel
  private lazyLoadTimer?: number
  private renderQueue: Array<() => void> = []
  private isRendering = false

  constructor(config: Partial<VirtualRenderConfig> = {}) {
    this.config = {
      enabled: true,
      bufferSize: 200,
      maxVisibleNodes: 500,
      maxVisibleEdges: 1000,
      enableLazyLoading: true,
      lazyLoadDelay: 100,
      renderLevels: this.getDefaultRenderLevels(),
      ...config
    }

    this.viewport = {
      x: 0,
      y: 0,
      width: 1000,
      height: 600,
      scale: 1
    }

    this.renderLevel = this.config.renderLevels[0]
  }

  /**
   * 更新视口信息
   */
  updateViewport(viewport: Partial<ViewportInfo>): void {
    this.viewport = { ...this.viewport, ...viewport }
    this.updateRenderLevel()
    this.scheduleRender()
  }

  /**
   * 计算可见的节点
   */
  getVisibleNodes(nodes: ApprovalNodeConfig[]): ApprovalNodeConfig[] {
    if (!this.config.enabled) {
      return nodes
    }

    const visibleNodes: ApprovalNodeConfig[] = []
    const viewBounds = this.getViewBounds()

    for (const node of nodes) {
      if (this.isNodeVisible(node, viewBounds)) {
        visibleNodes.push(node)
        this.visibleNodes.add(node.id)
      } else {
        this.visibleNodes.delete(node.id)
      }

      // 限制最大可见节点数量
      if (visibleNodes.length >= this.config.maxVisibleNodes) {
        break
      }
    }

    return visibleNodes
  }

  /**
   * 计算可见的边
   */
  getVisibleEdges(edges: ApprovalEdgeConfig[], nodes: ApprovalNodeConfig[]): ApprovalEdgeConfig[] {
    if (!this.config.enabled) {
      return edges
    }

    const visibleEdges: ApprovalEdgeConfig[] = []
    const nodeMap = new Map(nodes.map(node => [node.id, node]))

    for (const edge of edges) {
      const sourceNode = nodeMap.get(edge.sourceNodeId)
      const targetNode = nodeMap.get(edge.targetNodeId)

      // 只有当源节点或目标节点可见时，边才可见
      if (sourceNode && targetNode &&
        (this.visibleNodes.has(sourceNode.id) || this.visibleNodes.has(targetNode.id))) {
        visibleEdges.push(edge)
        this.visibleEdges.add(edge.id)
      } else {
        this.visibleEdges.delete(edge.id)
      }

      // 限制最大可见边数量
      if (visibleEdges.length >= this.config.maxVisibleEdges) {
        break
      }
    }

    return visibleEdges
  }

  /**
   * 获取当前渲染级别
   */
  getCurrentRenderLevel(): RenderLevel {
    return this.renderLevel
  }

  /**
   * 获取简化的节点配置
   */
  getSimplifiedNode(node: ApprovalNodeConfig): ApprovalNodeConfig {
    if (!this.config.enabled || this.renderLevel.simplificationLevel === 0) {
      return node
    }

    const simplified = { ...node }

    // 根据简化级别调整节点
    if (this.renderLevel.simplificationLevel > 0.5) {
      // 高度简化：只保留基本信息
      simplified.text = this.renderLevel.showText ? node.text : ''
      simplified.properties = {
        ...node.properties,
        simplified: true,
        originalText: node.text
      }
    }

    return simplified
  }

  /**
   * 获取简化的边配置
   */
  getSimplifiedEdge(edge: ApprovalEdgeConfig): ApprovalEdgeConfig {
    if (!this.config.enabled || this.renderLevel.simplificationLevel === 0) {
      return edge
    }

    const simplified = { ...edge }

    // 根据渲染级别调整边
    if (!this.renderLevel.showEdgeLabels) {
      simplified.text = ''
    }

    return simplified
  }

  /**
   * 启用懒加载
   */
  enableLazyLoading(): void {
    if (!this.config.enableLazyLoading) {
      return
    }

    if (this.lazyLoadTimer) {
      clearTimeout(this.lazyLoadTimer)
    }

    this.lazyLoadTimer = window.setTimeout(() => {
      this.processRenderQueue()
    }, this.config.lazyLoadDelay)
  }

  /**
   * 添加渲染任务到队列
   */
  addRenderTask(task: () => void): void {
    this.renderQueue.push(task)

    if (!this.isRendering) {
      this.enableLazyLoading()
    }
  }

  /**
   * 清空渲染队列
   */
  clearRenderQueue(): void {
    this.renderQueue = []

    if (this.lazyLoadTimer) {
      clearTimeout(this.lazyLoadTimer)
      this.lazyLoadTimer = undefined
    }
  }

  /**
   * 获取性能统计信息
   */
  getPerformanceStats(): {
    visibleNodeCount: number
    visibleEdgeCount: number
    renderLevel: string
    bufferSize: number
    queueSize: number
  } {
    return {
      visibleNodeCount: this.visibleNodes.size,
      visibleEdgeCount: this.visibleEdges.size,
      renderLevel: this.renderLevel.name,
      bufferSize: this.config.bufferSize,
      queueSize: this.renderQueue.length
    }
  }

  /**
   * 重置虚拟渲染器
   */
  reset(): void {
    this.visibleNodes.clear()
    this.visibleEdges.clear()
    this.clearRenderQueue()
    this.isRendering = false
  }

  /**
   * 获取默认渲染级别配置
   */
  private getDefaultRenderLevels(): RenderLevel[] {
    return [
      {
        name: 'detailed',
        minScale: 0.8,
        maxScale: Infinity,
        showText: true,
        showDetails: true,
        showEdgeLabels: true,
        simplificationLevel: 0
      },
      {
        name: 'normal',
        minScale: 0.4,
        maxScale: 0.8,
        showText: true,
        showDetails: false,
        showEdgeLabels: true,
        simplificationLevel: 0.2
      },
      {
        name: 'simplified',
        minScale: 0.2,
        maxScale: 0.4,
        showText: true,
        showDetails: false,
        showEdgeLabels: false,
        simplificationLevel: 0.5
      },
      {
        name: 'minimal',
        minScale: 0,
        maxScale: 0.2,
        showText: false,
        showDetails: false,
        showEdgeLabels: false,
        simplificationLevel: 0.8
      }
    ]
  }

  /**
   * 更新渲染级别
   */
  private updateRenderLevel(): void {
    const scale = this.viewport.scale

    for (const level of this.config.renderLevels) {
      if (scale >= level.minScale && scale < level.maxScale) {
        this.renderLevel = level
        break
      }
    }
  }

  /**
   * 获取视图边界
   */
  private getViewBounds(): {
    left: number
    top: number
    right: number
    bottom: number
  } {
    const buffer = this.config.bufferSize

    return {
      left: this.viewport.x - buffer,
      top: this.viewport.y - buffer,
      right: this.viewport.x + this.viewport.width + buffer,
      bottom: this.viewport.y + this.viewport.height + buffer
    }
  }

  /**
   * 判断节点是否可见
   */
  private isNodeVisible(node: ApprovalNodeConfig, viewBounds: ReturnType<typeof this.getViewBounds>): boolean {
    // 假设节点大小为 120x60
    const nodeWidth = 120
    const nodeHeight = 60

    const nodeLeft = node.x - nodeWidth / 2
    const nodeTop = node.y - nodeHeight / 2
    const nodeRight = node.x + nodeWidth / 2
    const nodeBottom = node.y + nodeHeight / 2

    return !(nodeRight < viewBounds.left ||
      nodeLeft > viewBounds.right ||
      nodeBottom < viewBounds.top ||
      nodeTop > viewBounds.bottom)
  }

  /**
   * 调度渲染
   */
  private scheduleRender(): void {
    if (this.isRendering) {
      return
    }

    requestAnimationFrame(() => {
      this.processRenderQueue()
    })
  }

  /**
   * 处理渲染队列
   */
  private processRenderQueue(): void {
    if (this.renderQueue.length === 0) {
      this.isRendering = false
      return
    }

    this.isRendering = true

    // 批量处理渲染任务
    const batchSize = Math.min(10, this.renderQueue.length)
    const batch = this.renderQueue.splice(0, batchSize)

    batch.forEach(task => {
      try {
        task()
      } catch (error) {
        console.error('渲染任务执行失败:', error)
      }
    })

    // 如果还有任务，继续处理
    if (this.renderQueue.length > 0) {
      requestAnimationFrame(() => {
        this.processRenderQueue()
      })
    } else {
      this.isRendering = false
    }
  }
}

/**
 * 批量DOM操作优化器
 */
export class BatchDOMUpdater {
  private updates: Array<() => void> = []
  private isScheduled = false

  /**
   * 添加DOM更新操作
   */
  addUpdate(update: () => void): void {
    this.updates.push(update)
    this.scheduleFlush()
  }

  /**
   * 立即执行所有更新
   */
  flush(): void {
    if (this.updates.length === 0) {
      return
    }

    // 批量执行DOM更新
    const updates = this.updates.splice(0)

    // 使用 requestAnimationFrame 确保在下一帧执行
    requestAnimationFrame(() => {
      updates.forEach(update => {
        try {
          update()
        } catch (error) {
          console.error('DOM更新失败:', error)
        }
      })
    })

    this.isScheduled = false
  }

  /**
   * 清空所有待执行的更新
   */
  clear(): void {
    this.updates = []
    this.isScheduled = false
  }

  /**
   * 调度刷新
   */
  private scheduleFlush(): void {
    if (this.isScheduled) {
      return
    }

    this.isScheduled = true

    // 使用 MessageChannel 实现微任务调度
    if (typeof MessageChannel !== 'undefined') {
      const channel = new MessageChannel()
      channel.port2.onmessage = () => this.flush()
      channel.port1.postMessage(null)
    } else {
      // 降级到 setTimeout
      setTimeout(() => this.flush(), 0)
    }
  }
}
