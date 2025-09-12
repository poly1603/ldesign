/**
 * 剪贴板工具
 * 
 * 提供流程图元素的复制粘贴功能
 */

import type { ApprovalNodeConfig, ApprovalEdgeConfig, FlowchartData } from '../types'

/**
 * 生成唯一ID
 * @param prefix 前缀
 * @returns 唯一ID
 */
function generateId(prefix: string = 'node'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 剪贴板数据类型
 */
export interface ClipboardData {
  /** 数据类型 */
  type: 'flowchart-elements'
  /** 版本号 */
  version: string
  /** 复制时间戳 */
  timestamp: number
  /** 节点数据 */
  nodes: ApprovalNodeConfig[]
  /** 边数据 */
  edges: ApprovalEdgeConfig[]
  /** 边界信息 */
  bounds: {
    minX: number
    minY: number
    maxX: number
    maxY: number
    width: number
    height: number
  }
}

/**
 * 粘贴选项
 */
export interface PasteOptions {
  /** 粘贴位置 */
  position?: { x: number; y: number }
  /** 是否保持相对位置 */
  keepRelativePosition?: boolean
  /** 位置偏移量 */
  offset?: { x: number; y: number }
  /** 是否生成新ID */
  generateNewIds?: boolean
}

/**
 * 剪贴板管理器
 */
export class ClipboardManager {
  private static instance: ClipboardManager
  private clipboardData: ClipboardData | null = null

  private constructor() { }

  /**
   * 获取单例实例
   */
  static getInstance(): ClipboardManager {
    if (!ClipboardManager.instance) {
      ClipboardManager.instance = new ClipboardManager()
    }
    return ClipboardManager.instance
  }

  /**
   * 复制元素到剪贴板
   */
  copy(nodes: ApprovalNodeConfig[], edges: ApprovalEdgeConfig[]): boolean {
    try {
      if (nodes.length === 0 && edges.length === 0) {
        return false
      }

      // 计算边界
      const bounds = this.calculateBounds(nodes)

      // 过滤相关的边（只包含选中节点之间的边）
      const nodeIds = new Set(nodes.map(node => node.id))
      const filteredEdges = edges.filter(edge =>
        nodeIds.has(edge.sourceNodeId) && nodeIds.has(edge.targetNodeId)
      )

      // 创建剪贴板数据
      this.clipboardData = {
        type: 'flowchart-elements',
        version: '1.0.0',
        timestamp: Date.now(),
        nodes: JSON.parse(JSON.stringify(nodes)), // 深拷贝
        edges: JSON.parse(JSON.stringify(filteredEdges)), // 深拷贝
        bounds
      }

      // 尝试写入系统剪贴板
      this.writeToSystemClipboard(this.clipboardData)

      return true
    } catch (error) {
      console.error('复制失败:', error)
      return false
    }
  }

  /**
   * 从剪贴板粘贴元素
   */
  async paste(options: PasteOptions = {}): Promise<{ nodes: ApprovalNodeConfig[]; edges: ApprovalEdgeConfig[] } | null> {
    try {
      // 首先尝试从系统剪贴板读取
      const systemData = await this.readFromSystemClipboard()
      const data = systemData || this.clipboardData

      if (!data || data.type !== 'flowchart-elements') {
        return null
      }

      const {
        position,
        keepRelativePosition = true,
        offset = { x: 20, y: 20 },
        generateNewIds = true
      } = options

      // 深拷贝数据
      const nodes = JSON.parse(JSON.stringify(data.nodes)) as ApprovalNodeConfig[]
      const edges = JSON.parse(JSON.stringify(data.edges)) as ApprovalEdgeConfig[]

      // 生成新ID映射
      const idMap = new Map<string, string>()
      if (generateNewIds) {
        nodes.forEach(node => {
          const newId = generateId('node')
          idMap.set(node.id, newId)
          node.id = newId
        })

        edges.forEach(edge => {
          const newId = generateId('edge')
          const newSourceId = idMap.get(edge.sourceNodeId)
          const newTargetId = idMap.get(edge.targetNodeId)

          edge.id = newId
          if (newSourceId) edge.sourceNodeId = newSourceId
          if (newTargetId) edge.targetNodeId = newTargetId
        })
      }

      // 计算位置偏移
      let deltaX = offset.x
      let deltaY = offset.y

      if (position && !keepRelativePosition) {
        // 粘贴到指定位置
        const centerX = data.bounds.minX + data.bounds.width / 2
        const centerY = data.bounds.minY + data.bounds.height / 2
        deltaX = position.x - centerX
        deltaY = position.y - centerY
      }

      // 应用位置偏移
      nodes.forEach(node => {
        node.x += deltaX
        node.y += deltaY
      })

      return { nodes, edges }
    } catch (error) {
      console.error('粘贴失败:', error)
      return null
    }
  }

  /**
   * 检查剪贴板是否有数据
   */
  hasData(): boolean {
    return this.clipboardData !== null
  }

  /**
   * 清空剪贴板
   */
  clear(): void {
    this.clipboardData = null
  }

  /**
   * 获取剪贴板数据信息
   */
  getDataInfo(): { nodeCount: number; edgeCount: number; timestamp: number } | null {
    if (!this.clipboardData) {
      return null
    }

    return {
      nodeCount: this.clipboardData.nodes.length,
      edgeCount: this.clipboardData.edges.length,
      timestamp: this.clipboardData.timestamp
    }
  }

  /**
   * 计算节点边界
   */
  private calculateBounds(nodes: ApprovalNodeConfig[]) {
    if (nodes.length === 0) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 }
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

    nodes.forEach(node => {
      const width = node.width || 120
      const height = node.height || 60
      const left = node.x - width / 2
      const right = node.x + width / 2
      const top = node.y - height / 2
      const bottom = node.y + height / 2

      minX = Math.min(minX, left)
      minY = Math.min(minY, top)
      maxX = Math.max(maxX, right)
      maxY = Math.max(maxY, bottom)
    })

    return {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY
    }
  }

  /**
   * 写入系统剪贴板
   */
  private async writeToSystemClipboard(data: ClipboardData): Promise<void> {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        const jsonString = JSON.stringify(data)
        await navigator.clipboard.writeText(jsonString)
      }
    } catch (error) {
      // 系统剪贴板写入失败，使用内存存储
      console.warn('无法写入系统剪贴板，使用内存存储:', error)
    }
  }

  /**
   * 从系统剪贴板读取
   */
  private async readFromSystemClipboard(): Promise<ClipboardData | null> {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText()
        if (text && text.trim()) {
          try {
            const data = JSON.parse(text)

            if (data && data.type === 'flowchart-elements') {
              return data as ClipboardData
            }
          } catch (parseError) {
            // JSON解析失败，可能是其他应用的数据，静默忽略
            console.debug('剪贴板数据不是有效的JSON格式，可能来自其他应用')
          }
        }
      }
    } catch (error) {
      // 系统剪贴板读取失败
      console.debug('无法从系统剪贴板读取:', error)
    }

    return null
  }
}

/**
 * 获取剪贴板管理器实例
 */
export function getClipboardManager(): ClipboardManager {
  return ClipboardManager.getInstance()
}

/**
 * 快速复制元素
 */
export function copyElements(nodes: ApprovalNodeConfig[], edges: ApprovalEdgeConfig[]): boolean {
  return getClipboardManager().copy(nodes, edges)
}

/**
 * 快速粘贴元素
 */
export async function pasteElements(options?: PasteOptions): Promise<{ nodes: ApprovalNodeConfig[]; edges: ApprovalEdgeConfig[] } | null> {
  return getClipboardManager().paste(options)
}

/**
 * 检查是否可以粘贴
 */
export function canPaste(): boolean {
  return getClipboardManager().hasData()
}
