/**
 * 原生JavaScript适配器
 * 
 * 提供原生JavaScript接口，使树形组件能够在任何环境中使用
 */

import { Tree } from '../core/tree'
import type { TreeOptions, TreeNodeData } from '../types'

/**
 * 原生JavaScript树形组件配置接口
 */
export interface VanillaTreeConfig extends Partial<TreeOptions> {
  // 容器元素
  container: HTMLElement | string

  // 数据
  data?: TreeNodeData[]

  // 选中的节点
  selectedKeys?: string[]

  // 展开的节点
  expandedKeys?: string[]

  // 事件回调
  onSelect?: (selectedKeys: string[]) => void
  onExpand?: (nodeId: string) => void
  onCollapse?: (nodeId: string) => void
  onCheck?: (checkedKeys: string[]) => void
  onUncheck?: (uncheckedKeys: string[]) => void
  onDragStart?: (nodeId: string) => void
  onDragEnd?: (nodeId: string) => void
  onDrop?: (data: any) => void
  onSearch?: (keyword: string, results: any[]) => void
  onLoad?: (nodeId: string, data: TreeNodeData[]) => void
  onError?: (error: Error) => void
}

/**
 * 原生JavaScript树形组件类
 */
export class VanillaTree {
  private tree: Tree
  private config: VanillaTreeConfig

  constructor(config: VanillaTreeConfig) {
    this.config = config

    // 获取容器元素
    const container = typeof config.container === 'string' 
      ? document.querySelector(config.container) as HTMLElement
      : config.container

    if (!container) {
      throw new Error('Container element not found')
    }

    // 创建树实例
    this.tree = new Tree(container, config)

    // 绑定事件
    this.bindEvents()

    // 设置初始数据
    if (config.data) {
      this.tree.setData(config.data)
    }

    // 设置初始选中状态
    if (config.selectedKeys) {
      this.tree.setSelectedNodes(config.selectedKeys)
    }

    // 设置初始展开状态
    if (config.expandedKeys) {
      this.tree.setExpandedNodes(config.expandedKeys)
    }
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    if (this.config.onSelect) {
      this.tree.on('select', this.config.onSelect)
    }

    if (this.config.onExpand) {
      this.tree.on('expand', this.config.onExpand)
    }

    if (this.config.onCollapse) {
      this.tree.on('collapse', this.config.onCollapse)
    }

    if (this.config.onCheck) {
      this.tree.on('check', this.config.onCheck)
    }

    if (this.config.onUncheck) {
      this.tree.on('uncheck', this.config.onUncheck)
    }

    if (this.config.onDragStart) {
      this.tree.on('dragStart', this.config.onDragStart)
    }

    if (this.config.onDragEnd) {
      this.tree.on('dragEnd', this.config.onDragEnd)
    }

    if (this.config.onDrop) {
      this.tree.on('drop', this.config.onDrop)
    }

    if (this.config.onSearch) {
      this.tree.on('search', this.config.onSearch)
    }

    if (this.config.onLoad) {
      this.tree.on('load', this.config.onLoad)
    }

    if (this.config.onError) {
      this.tree.on('error', this.config.onError)
    }
  }

  /**
   * 获取树实例
   */
  getTreeInstance(): Tree {
    return this.tree
  }

  /**
   * 设置数据
   */
  setData(data: TreeNodeData[]): void {
    this.tree.setData(data)
  }

  /**
   * 获取数据
   */
  getData(): TreeNodeData[] {
    return this.tree.getData()
  }

  /**
   * 添加节点
   */
  addNode(nodeData: TreeNodeData, parentId?: string): void {
    this.tree.addNode(nodeData, parentId)
  }

  /**
   * 删除节点
   */
  removeNode(nodeId: string): void {
    this.tree.removeNode(nodeId)
  }

  /**
   * 更新节点
   */
  updateNode(nodeId: string, nodeData: Partial<TreeNodeData>): void {
    this.tree.updateNode(nodeId, nodeData)
  }

  /**
   * 选中节点
   */
  selectNode(nodeId: string): void {
    this.tree.selectNode(nodeId)
  }

  /**
   * 取消选中节点
   */
  unselectNode(nodeId: string): void {
    this.tree.unselectNode(nodeId)
  }

  /**
   * 选中所有节点
   */
  selectAll(): void {
    this.tree.selectAll()
  }

  /**
   * 取消选中所有节点
   */
  unselectAll(): void {
    this.tree.unselectAll()
  }

  /**
   * 获取选中的节点
   */
  getSelectedNodes(): string[] {
    return this.tree.getSelectedNodes()
  }

  /**
   * 展开节点
   */
  expandNode(nodeId: string): void {
    this.tree.expandNode(nodeId)
  }

  /**
   * 收起节点
   */
  collapseNode(nodeId: string): void {
    this.tree.collapseNode(nodeId)
  }

  /**
   * 展开所有节点
   */
  expandAll(): void {
    this.tree.expandAll()
  }

  /**
   * 收起所有节点
   */
  collapseAll(): void {
    this.tree.collapseAll()
  }

  /**
   * 搜索节点
   */
  search(keyword: string): void {
    this.tree.search(keyword)
  }

  /**
   * 清除搜索
   */
  clearSearch(): void {
    this.tree.clearSearch()
  }

  /**
   * 滚动到节点
   */
  scrollToNode(nodeId: string): void {
    this.tree.scrollToNode(nodeId)
  }

  /**
   * 刷新树
   */
  refresh(): void {
    this.tree.refresh()
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<VanillaTreeConfig>): void {
    this.config = { ...this.config, ...config }
    this.tree.updateOptions(config)
  }

  /**
   * 销毁树
   */
  destroy(): void {
    this.tree.destroy()
  }

  /**
   * 监听事件
   */
  on(event: string, callback: (...args: any[]) => void): void {
    this.tree.on(event, callback)
  }

  /**
   * 取消监听事件
   */
  off(event: string, callback?: (...args: any[]) => void): void {
    this.tree.off(event, callback)
  }

  /**
   * 触发事件
   */
  emit(event: string, ...args: any[]): void {
    this.tree.emit(event, ...args)
  }
}

/**
 * 工厂函数：创建树形组件
 */
export function createTree(config: VanillaTreeConfig): VanillaTree {
  return new VanillaTree(config)
}

/**
 * 全局注册函数
 */
export function registerGlobal(globalName: string = 'LDesignTree'): void {
  if (typeof window !== 'undefined') {
    (window as any)[globalName] = {
      Tree: VanillaTree,
      createTree,
    }
  }
}

/**
 * 自动注册到全局
 */
if (typeof window !== 'undefined' && !(window as any).LDesignTree) {
  registerGlobal()
}

// 默认导出
export default VanillaTree
