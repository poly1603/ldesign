import type { FlowchartData, FlowchartNode, Position, Bounds } from '../core/types'

/**
 * 拖拽指示线类型
 */
export interface GuideLine {
  id: string
  type: 'horizontal' | 'vertical'
  position: number // x坐标(垂直线)或y坐标(水平线)
  start: number // 线条起始点
  end: number // 线条结束点
  strength: number // 吸附强度(0-1)
  source: 'node' | 'grid' | 'canvas' | 'selection'
  sourceId?: string
  style: {
    color: string
    width: number
    dashArray?: string
    opacity: number
  }
}

/**
 * 对齐参考点
 */
export interface AlignmentReference {
  id: string
  type: 'left' | 'right' | 'top' | 'bottom' | 'centerX' | 'centerY'
  position: number
  bounds: Bounds
  nodeId: string
  distance: number // 到拖拽节点的距离
}

/**
 * 吸附结果
 */
export interface SnapResult {
  snapped: boolean
  position: Position
  snapLines: GuideLine[]
  alignments: AlignmentReference[]
  distance?: number
  angle?: number
}

/**
 * 测量信息
 */
export interface MeasurementInfo {
  distance: number
  angle: number
  deltaX: number
  deltaY: number
  fromNode: string
  toNode: string
  displayText: string
}

/**
 * 多节点对齐选项
 */
export interface MultiAlignOptions {
  type: 'left' | 'right' | 'top' | 'bottom' | 'centerX' | 'centerY' | 'distributeX' | 'distributeY'
  spacing?: number // 分布对齐时的间距
  reference?: 'first' | 'last' | 'center' | 'bounds' // 对齐参考
}

/**
 * 拖拽配置
 */
export interface DragGuideConfig {
  // 基础配置
  enabled: boolean
  snapThreshold: number // 吸附阈值(像素)
  gridSize: number // 网格大小
  showGrid: boolean
  
  // 指示线配置
  guideLines: {
    enabled: boolean
    color: string
    width: number
    opacity: number
    dashPattern: string
  }
  
  // 距离测量
  measurement: {
    enabled: boolean
    showDistance: boolean
    showAngle: boolean
    fontFamily: string
    fontSize: number
    color: string
    background: string
    precision: number // 小数点位数
  }
  
  // 吸附配置
  snap: {
    toGrid: boolean
    toNodes: boolean
    toCanvas: boolean
    toSelection: boolean
    strength: number // 吸附强度
  }
  
  // 对齐配置
  alignment: {
    showPreview: boolean
    previewColor: string
    previewOpacity: number
  }
}

/**
 * 智能拖拽与对齐服务
 */
export class DragGuideService {
  private config: DragGuideConfig
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private activeGuideLines: GuideLine[] = []
  private measurements: MeasurementInfo[] = []
  
  constructor(config?: Partial<DragGuideConfig>) {
    this.config = {
      enabled: true,
      snapThreshold: 8,
      gridSize: 20,
      showGrid: true,
      
      guideLines: {
        enabled: true,
        color: '#1890ff',
        width: 1,
        opacity: 0.8,
        dashPattern: '5,5'
      },
      
      measurement: {
        enabled: true,
        showDistance: true,
        showAngle: true,
        fontFamily: 'Arial, sans-serif',
        fontSize: 12,
        color: '#333333',
        background: 'rgba(255, 255, 255, 0.9)',
        precision: 0
      },
      
      snap: {
        toGrid: true,
        toNodes: true,
        toCanvas: true,
        toSelection: false,
        strength: 0.8
      },
      
      alignment: {
        showPreview: true,
        previewColor: '#52c41a',
        previewOpacity: 0.6
      },
      
      ...config
    }
  }

  /**
   * 设置画布
   */
  setCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<DragGuideConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * 开始拖拽
   */
  startDrag(dragNode: FlowchartNode, flowchartData: FlowchartData): void {
    if (!this.config.enabled) return
    
    // 清除之前的指示线
    this.activeGuideLines = []
    this.measurements = []
    
    // 生成参考线
    this.generateGuideLines(dragNode, flowchartData)
  }

  /**
   * 拖拽过程中更新
   */
  updateDrag(
    dragNode: FlowchartNode, 
    newPosition: Position,
    flowchartData: FlowchartData,
    selectedNodes?: FlowchartNode[]
  ): SnapResult {
    if (!this.config.enabled) {
      return {
        snapped: false,
        position: newPosition,
        snapLines: [],
        alignments: []
      }
    }

    // 计算吸附结果
    const snapResult = this.calculateSnap(dragNode, newPosition, flowchartData, selectedNodes)
    
    // 更新测量信息
    this.updateMeasurements(dragNode, snapResult.position, flowchartData)
    
    return snapResult
  }

  /**
   * 结束拖拽
   */
  endDrag(): void {
    this.activeGuideLines = []
    this.measurements = []
    this.clearCanvas()
  }

  /**
   * 多节点对齐
   */
  alignMultipleNodes(
    nodes: FlowchartNode[], 
    options: MultiAlignOptions
  ): FlowchartNode[] {
    if (nodes.length < 2) return nodes

    const alignedNodes = [...nodes]
    
    switch (options.type) {
      case 'left':
        return this.alignNodesLeft(alignedNodes, options.reference)
      case 'right':
        return this.alignNodesRight(alignedNodes, options.reference)
      case 'top':
        return this.alignNodesTop(alignedNodes, options.reference)
      case 'bottom':
        return this.alignNodesBottom(alignedNodes, options.reference)
      case 'centerX':
        return this.alignNodesCenterX(alignedNodes, options.reference)
      case 'centerY':
        return this.alignNodesCenterY(alignedNodes, options.reference)
      case 'distributeX':
        return this.distributeNodesX(alignedNodes, options.spacing)
      case 'distributeY':
        return this.distributeNodesY(alignedNodes, options.spacing)
      default:
        return alignedNodes
    }
  }

  /**
   * 渲染指示线和测量信息
   */
  render(): void {
    if (!this.ctx || !this.config.enabled) return

    this.clearCanvas()
    
    // 渲染网格
    if (this.config.showGrid) {
      this.renderGrid()
    }
    
    // 渲染指示线
    if (this.config.guideLines.enabled) {
      this.renderGuideLines()
    }
    
    // 渲染测量信息
    if (this.config.measurement.enabled) {
      this.renderMeasurements()
    }
  }

  /**
   * 生成指示线
   */
  private generateGuideLines(dragNode: FlowchartNode, flowchartData: FlowchartData): void {
    const guideLines: GuideLine[] = []

    // 从其他节点生成指示线
    if (this.config.snap.toNodes) {
      flowchartData.nodes.forEach(node => {
        if (node.id === dragNode.id) return

        const nodeBounds = this.getNodeBounds(node)
        
        // 垂直对齐线
        guideLines.push(
          // 左对齐
          {
            id: `node-${node.id}-left`,
            type: 'vertical',
            position: nodeBounds.left,
            start: Math.min(nodeBounds.top, dragNode.position.y) - 50,
            end: Math.max(nodeBounds.bottom, dragNode.position.y) + 50,
            strength: 1,
            source: 'node',
            sourceId: node.id,
            style: {
              color: this.config.guideLines.color,
              width: this.config.guideLines.width,
              dashArray: this.config.guideLines.dashPattern,
              opacity: this.config.guideLines.opacity
            }
          },
          // 右对齐
          {
            id: `node-${node.id}-right`,
            type: 'vertical',
            position: nodeBounds.right,
            start: Math.min(nodeBounds.top, dragNode.position.y) - 50,
            end: Math.max(nodeBounds.bottom, dragNode.position.y) + 50,
            strength: 1,
            source: 'node',
            sourceId: node.id,
            style: {
              color: this.config.guideLines.color,
              width: this.config.guideLines.width,
              dashArray: this.config.guideLines.dashPattern,
              opacity: this.config.guideLines.opacity
            }
          },
          // 中心对齐
          {
            id: `node-${node.id}-centerX`,
            type: 'vertical',
            position: nodeBounds.left + nodeBounds.width / 2,
            start: Math.min(nodeBounds.top, dragNode.position.y) - 50,
            end: Math.max(nodeBounds.bottom, dragNode.position.y) + 50,
            strength: 1,
            source: 'node',
            sourceId: node.id,
            style: {
              color: this.config.guideLines.color,
              width: this.config.guideLines.width,
              dashArray: this.config.guideLines.dashPattern,
              opacity: this.config.guideLines.opacity
            }
          }
        )

        // 水平对齐线
        guideLines.push(
          // 顶部对齐
          {
            id: `node-${node.id}-top`,
            type: 'horizontal',
            position: nodeBounds.top,
            start: Math.min(nodeBounds.left, dragNode.position.x) - 50,
            end: Math.max(nodeBounds.right, dragNode.position.x) + 50,
            strength: 1,
            source: 'node',
            sourceId: node.id,
            style: {
              color: this.config.guideLines.color,
              width: this.config.guideLines.width,
              dashArray: this.config.guideLines.dashPattern,
              opacity: this.config.guideLines.opacity
            }
          },
          // 底部对齐
          {
            id: `node-${node.id}-bottom`,
            type: 'horizontal',
            position: nodeBounds.bottom,
            start: Math.min(nodeBounds.left, dragNode.position.x) - 50,
            end: Math.max(nodeBounds.right, dragNode.position.x) + 50,
            strength: 1,
            source: 'node',
            sourceId: node.id,
            style: {
              color: this.config.guideLines.color,
              width: this.config.guideLines.width,
              dashArray: this.config.guideLines.dashPattern,
              opacity: this.config.guideLines.opacity
            }
          },
          // 中心对齐
          {
            id: `node-${node.id}-centerY`,
            type: 'horizontal',
            position: nodeBounds.top + nodeBounds.height / 2,
            start: Math.min(nodeBounds.left, dragNode.position.x) - 50,
            end: Math.max(nodeBounds.right, dragNode.position.x) + 50,
            strength: 1,
            source: 'node',
            sourceId: node.id,
            style: {
              color: this.config.guideLines.color,
              width: this.config.guideLines.width,
              dashArray: this.config.guideLines.dashPattern,
              opacity: this.config.guideLines.opacity
            }
          }
        )
      })
    }

    // 网格对齐线
    if (this.config.snap.toGrid && this.canvas) {
      const gridSize = this.config.gridSize
      const canvasWidth = this.canvas.width
      const canvasHeight = this.canvas.height
      
      // 垂直网格线
      for (let x = 0; x <= canvasWidth; x += gridSize) {
        guideLines.push({
          id: `grid-v-${x}`,
          type: 'vertical',
          position: x,
          start: 0,
          end: canvasHeight,
          strength: 0.5,
          source: 'grid',
          style: {
            color: '#d9d9d9',
            width: 1,
            opacity: 0.3
          }
        })
      }
      
      // 水平网格线
      for (let y = 0; y <= canvasHeight; y += gridSize) {
        guideLines.push({
          id: `grid-h-${y}`,
          type: 'horizontal',
          position: y,
          start: 0,
          end: canvasWidth,
          strength: 0.5,
          source: 'grid',
          style: {
            color: '#d9d9d9',
            width: 1,
            opacity: 0.3
          }
        })
      }
    }

    this.activeGuideLines = guideLines
  }

  /**
   * 计算吸附结果
   */
  private calculateSnap(
    dragNode: FlowchartNode,
    position: Position,
    flowchartData: FlowchartData,
    selectedNodes?: FlowchartNode[]
  ): SnapResult {
    const snapThreshold = this.config.snapThreshold
    const dragBounds = this.getNodeBounds({...dragNode, position})
    const snapLines: GuideLine[] = []
    const alignments: AlignmentReference[] = []
    
    let snappedX = position.x
    let snappedY = position.y
    let snapped = false

    // 检查每条指示线的吸附
    for (const guideLine of this.activeGuideLines) {
      if (guideLine.type === 'vertical') {
        const distance = Math.abs(dragBounds.left - guideLine.position)
        const centerDistance = Math.abs(dragBounds.left + dragBounds.width / 2 - guideLine.position)
        const rightDistance = Math.abs(dragBounds.right - guideLine.position)
        
        const minDistance = Math.min(distance, centerDistance, rightDistance)
        
        if (minDistance <= snapThreshold) {
          if (distance === minDistance) {
            // 左对齐
            snappedX = guideLine.position
          } else if (centerDistance === minDistance) {
            // 中心对齐
            snappedX = guideLine.position - dragBounds.width / 2
          } else {
            // 右对齐
            snappedX = guideLine.position - dragBounds.width
          }
          
          snapLines.push(guideLine)
          snapped = true
        }
      } else {
        const distance = Math.abs(dragBounds.top - guideLine.position)
        const centerDistance = Math.abs(dragBounds.top + dragBounds.height / 2 - guideLine.position)
        const bottomDistance = Math.abs(dragBounds.bottom - guideLine.position)
        
        const minDistance = Math.min(distance, centerDistance, bottomDistance)
        
        if (minDistance <= snapThreshold) {
          if (distance === minDistance) {
            // 顶部对齐
            snappedY = guideLine.position
          } else if (centerDistance === minDistance) {
            // 中心对齐
            snappedY = guideLine.position - dragBounds.height / 2
          } else {
            // 底部对齐
            snappedY = guideLine.position - dragBounds.height
          }
          
          snapLines.push(guideLine)
          snapped = true
        }
      }
    }

    const finalPosition: Position = { x: snappedX, y: snappedY }
    
    // 计算距离和角度
    const distance = Math.sqrt(
      Math.pow(finalPosition.x - dragNode.position.x, 2) + 
      Math.pow(finalPosition.y - dragNode.position.y, 2)
    )
    
    const angle = Math.atan2(
      finalPosition.y - dragNode.position.y,
      finalPosition.x - dragNode.position.x
    ) * 180 / Math.PI

    return {
      snapped,
      position: finalPosition,
      snapLines,
      alignments,
      distance: Math.round(distance),
      angle: Math.round(angle)
    }
  }

  /**
   * 更新测量信息
   */
  private updateMeasurements(
    dragNode: FlowchartNode,
    position: Position,
    flowchartData: FlowchartData
  ): void {
    if (!this.config.measurement.enabled) return

    this.measurements = []

    // 计算到其他节点的距离
    flowchartData.nodes.forEach(node => {
      if (node.id === dragNode.id) return

      const distance = Math.sqrt(
        Math.pow(position.x - node.position.x, 2) + 
        Math.pow(position.y - node.position.y, 2)
      )

      const angle = Math.atan2(
        position.y - node.position.y,
        position.x - node.position.x
      ) * 180 / Math.PI

      const deltaX = position.x - node.position.x
      const deltaY = position.y - node.position.y

      this.measurements.push({
        distance: Math.round(distance * Math.pow(10, this.config.measurement.precision)) / Math.pow(10, this.config.measurement.precision),
        angle: Math.round(angle * Math.pow(10, this.config.measurement.precision)) / Math.pow(10, this.config.measurement.precision),
        deltaX: Math.round(deltaX * Math.pow(10, this.config.measurement.precision)) / Math.pow(10, this.config.measurement.precision),
        deltaY: Math.round(deltaY * Math.pow(10, this.config.measurement.precision)) / Math.pow(10, this.config.measurement.precision),
        fromNode: node.id,
        toNode: dragNode.id,
        displayText: `${Math.round(distance)}px, ${Math.round(angle)}°`
      })
    })
  }

  /**
   * 左对齐节点
   */
  private alignNodesLeft(nodes: FlowchartNode[], reference = 'first'): FlowchartNode[] {
    const targetX = this.getAlignmentReference(nodes, 'left', reference)
    
    return nodes.map(node => {
      const bounds = this.getNodeBounds(node)
      return {
        ...node,
        position: {
          ...node.position,
          x: targetX
        }
      }
    })
  }

  /**
   * 右对齐节点
   */
  private alignNodesRight(nodes: FlowchartNode[], reference = 'first'): FlowchartNode[] {
    const targetX = this.getAlignmentReference(nodes, 'right', reference)
    
    return nodes.map(node => {
      const bounds = this.getNodeBounds(node)
      return {
        ...node,
        position: {
          ...node.position,
          x: targetX - bounds.width
        }
      }
    })
  }

  /**
   * 顶部对齐节点
   */
  private alignNodesTop(nodes: FlowchartNode[], reference = 'first'): FlowchartNode[] {
    const targetY = this.getAlignmentReference(nodes, 'top', reference)
    
    return nodes.map(node => ({
      ...node,
      position: {
        ...node.position,
        y: targetY
      }
    }))
  }

  /**
   * 底部对齐节点
   */
  private alignNodesBottom(nodes: FlowchartNode[], reference = 'first'): FlowchartNode[] {
    const targetY = this.getAlignmentReference(nodes, 'bottom', reference)
    
    return nodes.map(node => {
      const bounds = this.getNodeBounds(node)
      return {
        ...node,
        position: {
          ...node.position,
          y: targetY - bounds.height
        }
      }
    })
  }

  /**
   * 水平居中对齐节点
   */
  private alignNodesCenterX(nodes: FlowchartNode[], reference = 'center'): FlowchartNode[] {
    const targetX = this.getAlignmentReference(nodes, 'centerX', reference)
    
    return nodes.map(node => {
      const bounds = this.getNodeBounds(node)
      return {
        ...node,
        position: {
          ...node.position,
          x: targetX - bounds.width / 2
        }
      }
    })
  }

  /**
   * 垂直居中对齐节点
   */
  private alignNodesCenterY(nodes: FlowchartNode[], reference = 'center'): FlowchartNode[] {
    const targetY = this.getAlignmentReference(nodes, 'centerY', reference)
    
    return nodes.map(node => {
      const bounds = this.getNodeBounds(node)
      return {
        ...node,
        position: {
          ...node.position,
          y: targetY - bounds.height / 2
        }
      }
    })
  }

  /**
   * 水平分布节点
   */
  private distributeNodesX(nodes: FlowchartNode[], spacing = 20): FlowchartNode[] {
    const sortedNodes = [...nodes].sort((a, b) => a.position.x - b.position.x)
    const totalWidth = sortedNodes.reduce((sum, node) => sum + this.getNodeBounds(node).width, 0)
    const totalSpacing = (sortedNodes.length - 1) * spacing
    
    let currentX = sortedNodes[0].position.x
    
    return sortedNodes.map((node, index) => {
      if (index === 0) return node
      
      const prevBounds = this.getNodeBounds(sortedNodes[index - 1])
      currentX += prevBounds.width + spacing
      
      return {
        ...node,
        position: {
          ...node.position,
          x: currentX
        }
      }
    })
  }

  /**
   * 垂直分布节点
   */
  private distributeNodesY(nodes: FlowchartNode[], spacing = 20): FlowchartNode[] {
    const sortedNodes = [...nodes].sort((a, b) => a.position.y - b.position.y)
    
    let currentY = sortedNodes[0].position.y
    
    return sortedNodes.map((node, index) => {
      if (index === 0) return node
      
      const prevBounds = this.getNodeBounds(sortedNodes[index - 1])
      currentY += prevBounds.height + spacing
      
      return {
        ...node,
        position: {
          ...node.position,
          y: currentY
        }
      }
    })
  }

  /**
   * 获取对齐参考位置
   */
  private getAlignmentReference(
    nodes: FlowchartNode[], 
    type: 'left' | 'right' | 'top' | 'bottom' | 'centerX' | 'centerY',
    reference: string
  ): number {
    if (reference === 'first') {
      const firstNode = nodes[0]
      const bounds = this.getNodeBounds(firstNode)
      
      switch (type) {
        case 'left': return bounds.left
        case 'right': return bounds.right
        case 'top': return bounds.top
        case 'bottom': return bounds.bottom
        case 'centerX': return bounds.left + bounds.width / 2
        case 'centerY': return bounds.top + bounds.height / 2
        default: return 0
      }
    }
    
    if (reference === 'last') {
      const lastNode = nodes[nodes.length - 1]
      const bounds = this.getNodeBounds(lastNode)
      
      switch (type) {
        case 'left': return bounds.left
        case 'right': return bounds.right
        case 'top': return bounds.top
        case 'bottom': return bounds.bottom
        case 'centerX': return bounds.left + bounds.width / 2
        case 'centerY': return bounds.top + bounds.height / 2
        default: return 0
      }
    }
    
    // center 或 bounds 参考
    const allBounds = nodes.map(node => this.getNodeBounds(node))
    
    switch (type) {
      case 'left':
        return Math.min(...allBounds.map(b => b.left))
      case 'right':
        return Math.max(...allBounds.map(b => b.right))
      case 'top':
        return Math.min(...allBounds.map(b => b.top))
      case 'bottom':
        return Math.max(...allBounds.map(b => b.bottom))
      case 'centerX': {
        const minLeft = Math.min(...allBounds.map(b => b.left))
        const maxRight = Math.max(...allBounds.map(b => b.right))
        return (minLeft + maxRight) / 2
      }
      case 'centerY': {
        const minTop = Math.min(...allBounds.map(b => b.top))
        const maxBottom = Math.max(...allBounds.map(b => b.bottom))
        return (minTop + maxBottom) / 2
      }
      default:
        return 0
    }
  }

  /**
   * 获取节点边界
   */
  private getNodeBounds(node: FlowchartNode): Bounds {
    // 这里简化处理，实际应该根据节点类型和样式计算
    const width = node.size?.width || 100
    const height = node.size?.height || 60
    
    return {
      left: node.position.x,
      top: node.position.y,
      right: node.position.x + width,
      bottom: node.position.y + height,
      width,
      height
    }
  }

  /**
   * 渲染网格
   */
  private renderGrid(): void {
    if (!this.ctx || !this.canvas) return
    
    const { width, height } = this.canvas
    const gridSize = this.config.gridSize
    
    this.ctx.save()
    this.ctx.strokeStyle = '#f0f0f0'
    this.ctx.lineWidth = 1
    this.ctx.globalAlpha = 0.5
    
    // 垂直线
    for (let x = 0; x <= width; x += gridSize) {
      this.ctx.beginPath()
      this.ctx.moveTo(x, 0)
      this.ctx.lineTo(x, height)
      this.ctx.stroke()
    }
    
    // 水平线
    for (let y = 0; y <= height; y += gridSize) {
      this.ctx.beginPath()
      this.ctx.moveTo(0, y)
      this.ctx.lineTo(width, y)
      this.ctx.stroke()
    }
    
    this.ctx.restore()
  }

  /**
   * 渲染指示线
   */
  private renderGuideLines(): void {
    if (!this.ctx) return
    
    this.ctx.save()
    
    for (const guideLine of this.activeGuideLines) {
      if (guideLine.source === 'grid' && !this.config.showGrid) continue
      
      this.ctx.strokeStyle = guideLine.style.color
      this.ctx.lineWidth = guideLine.style.width
      this.ctx.globalAlpha = guideLine.style.opacity
      
      if (guideLine.style.dashArray) {
        const dashArray = guideLine.style.dashArray.split(',').map(Number)
        this.ctx.setLineDash(dashArray)
      } else {
        this.ctx.setLineDash([])
      }
      
      this.ctx.beginPath()
      if (guideLine.type === 'vertical') {
        this.ctx.moveTo(guideLine.position, guideLine.start)
        this.ctx.lineTo(guideLine.position, guideLine.end)
      } else {
        this.ctx.moveTo(guideLine.start, guideLine.position)
        this.ctx.lineTo(guideLine.end, guideLine.position)
      }
      this.ctx.stroke()
    }
    
    this.ctx.restore()
  }

  /**
   * 渲染测量信息
   */
  private renderMeasurements(): void {
    if (!this.ctx || !this.config.measurement.showDistance) return
    
    this.ctx.save()
    this.ctx.font = `${this.config.measurement.fontSize}px ${this.config.measurement.fontFamily}`
    this.ctx.fillStyle = this.config.measurement.color
    
    for (const measurement of this.measurements) {
      // 只显示最近的几个测量信息，避免画面太乱
      if (measurement.distance > 200) continue
      
      const text = this.config.measurement.showAngle 
        ? measurement.displayText
        : `${measurement.distance}px`
      
      const textMetrics = this.ctx.measureText(text)
      const textWidth = textMetrics.width
      const textHeight = this.config.measurement.fontSize
      
      // 计算显示位置
      const centerX = measurement.deltaX / 2
      const centerY = measurement.deltaY / 2
      
      // 绘制背景
      this.ctx.fillStyle = this.config.measurement.background
      this.ctx.fillRect(
        centerX - textWidth / 2 - 4,
        centerY - textHeight / 2 - 2,
        textWidth + 8,
        textHeight + 4
      )
      
      // 绘制文字
      this.ctx.fillStyle = this.config.measurement.color
      this.ctx.fillText(text, centerX - textWidth / 2, centerY + textHeight / 4)
    }
    
    this.ctx.restore()
  }

  /**
   * 清除画布
   */
  private clearCanvas(): void {
    if (!this.ctx || !this.canvas) return
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }
}

// 导出服务实例
export const dragGuideService = new DragGuideService()

// 导出类型
export type {
  GuideLine,
  AlignmentReference, 
  SnapResult,
  MeasurementInfo,
  MultiAlignOptions,
  DragGuideConfig
}
