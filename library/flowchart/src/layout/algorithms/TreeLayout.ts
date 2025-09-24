/**
 * 树形布局算法
 * 
 * 将节点按树形结构排列，适用于层次分明的树状流程
 */

import { BaseLayoutAlgorithm } from './BaseLayoutAlgorithm'
import type {
  LayoutConfig,
  Position,
  LayoutDirection
} from '../types'
import type { FlowchartData, FlowchartNode, FlowchartEdge } from '../../types'

/**
 * 树节点
 */
interface TreeNode {
  id: string
  node: FlowchartNode
  children: TreeNode[]
  parent?: TreeNode
  depth: number
  x: number
  y: number
  subtreeWidth: number
}

/**
 * 树形布局算法类
 */
export class TreeLayout extends BaseLayoutAlgorithm {
  readonly name = 'tree' as const
  readonly description = '树形布局算法，按树形结构排列节点'

  /**
   * 是否支持约束
   */
  supportsConstraints(): boolean {
    return true
  }

  /**
   * 验证特定配置
   */
  protected validateSpecificConfig(config: LayoutConfig): boolean {
    // 验证方向
    if (config.direction && !['TB', 'BT', 'LR', 'RL'].includes(config.direction)) {
      return false
    }
    
    return true
  }

  /**
   * 获取默认配置
   */
  getDefaultConfig(): Partial<LayoutConfig> {
    return {
      ...super.getDefaultConfig(),
      direction: 'TB',
      nodeSpacing: {
        horizontal: 120,
        vertical: 100
      },
      algorithmConfig: {
        rootSelection: 'auto', // 'auto', 'manual', 'multiple'
        rootNodeId: null,
        siblingSpacing: 20,
        subtreeSpacing: 40,
        alignment: 'center', // 'left', 'center', 'right'
        compactMode: false
      }
    }
  }

  /**
   * 执行树形布局
   */
  protected async executeLayout(data: FlowchartData, config: LayoutConfig): Promise<Record<string, Position>> {
    const { nodes, edges } = data
    const direction = config.direction || 'TB'
    const nodeSpacing = config.nodeSpacing || { horizontal: 120, vertical: 100 }
    const algorithmConfig = { ...this.getDefaultConfig().algorithmConfig, ...config.algorithmConfig }
    
    // 构建树结构
    const trees = this.buildTrees(nodes, edges, algorithmConfig)
    
    // 计算每棵树的布局
    const positions: Record<string, Position> = {}
    let currentOffset = 0
    
    for (const tree of trees) {
      // 计算树的布局
      this.calculateTreeLayout(tree, nodeSpacing, algorithmConfig)
      
      // 转换为最终位置
      const treePositions = this.convertToFinalPositions(tree, direction, currentOffset)
      Object.assign(positions, treePositions)
      
      // 更新偏移量
      currentOffset += this.getTreeWidth(tree) + nodeSpacing.horizontal * 2
    }
    
    return positions
  }

  /**
   * 构建树结构
   */
  private buildTrees(
    nodes: FlowchartNode[],
    edges: FlowchartEdge[],
    config: any
  ): TreeNode[] {
    const nodeMap = new Map<string, TreeNode>()
    const childrenMap = new Map<string, string[]>()
    const parentMap = new Map<string, string>()
    
    // 初始化节点映射
    for (const node of nodes) {
      nodeMap.set(node.id, {
        id: node.id,
        node,
        children: [],
        depth: 0,
        x: 0,
        y: 0,
        subtreeWidth: 0
      })
      childrenMap.set(node.id, [])
    }
    
    // 构建父子关系
    for (const edge of edges) {
      const children = childrenMap.get(edge.sourceNodeId) || []
      children.push(edge.targetNodeId)
      childrenMap.set(edge.sourceNodeId, children)
      parentMap.set(edge.targetNodeId, edge.sourceNodeId)
    }
    
    // 找到根节点
    const rootNodes = this.findRootNodes(nodes, parentMap, config)
    
    // 构建树
    const trees: TreeNode[] = []
    for (const rootNode of rootNodes) {
      const tree = this.buildTree(rootNode, nodeMap, childrenMap, 0)
      if (tree) {
        trees.push(tree)
      }
    }
    
    return trees
  }

  /**
   * 找到根节点
   */
  private findRootNodes(
    nodes: FlowchartNode[],
    parentMap: Map<string, string>,
    config: any
  ): FlowchartNode[] {
    if (config.rootSelection === 'manual' && config.rootNodeId) {
      const rootNode = nodes.find(n => n.id === config.rootNodeId)
      return rootNode ? [rootNode] : []
    }
    
    // 自动查找根节点（没有父节点的节点）
    return nodes.filter(node => !parentMap.has(node.id))
  }

  /**
   * 构建单棵树
   */
  private buildTree(
    rootNode: FlowchartNode,
    nodeMap: Map<string, TreeNode>,
    childrenMap: Map<string, string[]>,
    depth: number
  ): TreeNode | null {
    const treeNode = nodeMap.get(rootNode.id)
    if (!treeNode) return null
    
    treeNode.depth = depth
    
    // 构建子树
    const childIds = childrenMap.get(rootNode.id) || []
    for (const childId of childIds) {
      const childNode = nodeMap.get(childId)?.node
      if (childNode) {
        const childTree = this.buildTree(childNode, nodeMap, childrenMap, depth + 1)
        if (childTree) {
          childTree.parent = treeNode
          treeNode.children.push(childTree)
        }
      }
    }
    
    return treeNode
  }

  /**
   * 计算树的布局
   */
  private calculateTreeLayout(
    tree: TreeNode,
    nodeSpacing: { horizontal: number; vertical: number },
    config: any
  ): void {
    // 后序遍历计算子树宽度
    this.calculateSubtreeWidths(tree, nodeSpacing, config)
    
    // 前序遍历计算位置
    this.calculatePositions(tree, 0, nodeSpacing, config)
  }

  /**
   * 计算子树宽度
   */
  private calculateSubtreeWidths(
    tree: TreeNode,
    nodeSpacing: { horizontal: number; vertical: number },
    config: any
  ): number {
    if (tree.children.length === 0) {
      // 叶子节点
      tree.subtreeWidth = nodeSpacing.horizontal
      return tree.subtreeWidth
    }
    
    // 计算所有子树的宽度
    let totalChildrenWidth = 0
    for (const child of tree.children) {
      totalChildrenWidth += this.calculateSubtreeWidths(child, nodeSpacing, config)
    }
    
    // 添加子树间的间距
    if (tree.children.length > 1) {
      totalChildrenWidth += (tree.children.length - 1) * config.subtreeSpacing
    }
    
    // 当前节点的子树宽度是子树宽度和节点宽度的最大值
    tree.subtreeWidth = Math.max(totalChildrenWidth, nodeSpacing.horizontal)
    
    return tree.subtreeWidth
  }

  /**
   * 计算位置
   */
  private calculatePositions(
    tree: TreeNode,
    parentX: number,
    nodeSpacing: { horizontal: number; vertical: number },
    config: any
  ): void {
    // 计算当前节点的Y位置
    tree.y = tree.depth * nodeSpacing.vertical
    
    if (tree.children.length === 0) {
      // 叶子节点，X位置由父节点决定
      tree.x = parentX
      return
    }
    
    // 计算子节点的起始X位置
    let childStartX = parentX - tree.subtreeWidth / 2
    
    // 为每个子节点分配位置
    for (const child of tree.children) {
      const childCenterX = childStartX + child.subtreeWidth / 2
      this.calculatePositions(child, childCenterX, nodeSpacing, config)
      childStartX += child.subtreeWidth + config.subtreeSpacing
    }
    
    // 计算当前节点的X位置
    if (config.alignment === 'center') {
      // 居中对齐：位于子节点的中心
      const firstChild = tree.children[0]
      const lastChild = tree.children[tree.children.length - 1]
      tree.x = (firstChild.x + lastChild.x) / 2
    } else {
      // 其他对齐方式
      tree.x = parentX
    }
  }

  /**
   * 转换为最终位置
   */
  private convertToFinalPositions(
    tree: TreeNode,
    direction: LayoutDirection,
    offsetX: number
  ): Record<string, Position> {
    const positions: Record<string, Position> = {}
    
    this.traverseTree(tree, (node) => {
      let x: number
      let y: number
      
      switch (direction) {
        case 'TB': // 从上到下
          x = node.x + offsetX
          y = node.y
          break
        case 'BT': // 从下到上
          x = node.x + offsetX
          y = -node.y
          break
        case 'LR': // 从左到右
          x = node.y
          y = node.x + offsetX
          break
        case 'RL': // 从右到左
          x = -node.y
          y = node.x + offsetX
          break
        default:
          x = node.x + offsetX
          y = node.y
      }
      
      positions[node.id] = { x, y }
    })
    
    return positions
  }

  /**
   * 获取树的宽度
   */
  private getTreeWidth(tree: TreeNode): number {
    return tree.subtreeWidth
  }

  /**
   * 遍历树
   */
  private traverseTree(tree: TreeNode, callback: (node: TreeNode) => void): void {
    callback(tree)
    for (const child of tree.children) {
      this.traverseTree(child, callback)
    }
  }
}
