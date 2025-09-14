/**
 * 树形组件选择功能模块
 * 
 * 提供单选、多选、级联选择等功能
 */

import type { TreeNode, TreeNodeId } from '../types/tree-node'
import type { TreeOptions } from '../types/tree-options'
import { SelectionMode } from '../types/tree-node'

/**
 * 选择管理器类
 */
export class SelectionManager {
  private options: TreeOptions
  private selectedIds: Set<TreeNodeId> = new Set()
  private nodeMap: Map<TreeNodeId, TreeNode> = new Map()

  constructor(options: TreeOptions) {
    this.options = options
  }

  /**
   * 更新节点映射
   */
  updateNodeMap(nodeMap: Map<TreeNodeId, TreeNode>): void {
    this.nodeMap = nodeMap
  }

  /**
   * 获取选中的节点ID集合
   */
  getSelectedIds(): Set<TreeNodeId> {
    return new Set(this.selectedIds)
  }

  /**
   * 获取选中的节点
   */
  getSelectedNodes(): TreeNode[] {
    return Array.from(this.selectedIds)
      .map(id => this.nodeMap.get(id))
      .filter(Boolean) as TreeNode[]
  }

  /**
   * 选择节点
   */
  selectNode(nodeId: TreeNodeId, selected: boolean = true): Set<TreeNodeId> {
    const node = this.nodeMap.get(nodeId)
    if (!node || !node.selectable) {
      return this.selectedIds
    }

    let newSelectedIds: Set<TreeNodeId>

    switch (this.options.selection?.mode) {
      case SelectionMode.SINGLE:
        newSelectedIds = this.handleSingleSelection(nodeId, selected, new Set(this.selectedIds))
        break

      case SelectionMode.MULTIPLE:
        newSelectedIds = this.handleMultipleSelection(nodeId, selected, new Set(this.selectedIds))
        break

      case SelectionMode.CASCADE:
        newSelectedIds = this.handleCascadeSelection(nodeId, selected, new Set(this.selectedIds))
        break

      default:
        newSelectedIds = new Set(this.selectedIds)
    }

    this.selectedIds = newSelectedIds
    return newSelectedIds
  }

  /**
   * 处理单选模式
   */
  private handleSingleSelection(nodeId: TreeNodeId, selected: boolean, selectedIds: Set<TreeNodeId>): Set<TreeNodeId> {
    if (selected) {
      // 单选模式下，清空其他选择
      selectedIds.clear()
      selectedIds.add(nodeId)

      // 更新节点状态
      this.nodeMap.forEach(node => {
        node.selected = node.id === nodeId
      })
    } else {
      selectedIds.delete(nodeId)
      const node = this.nodeMap.get(nodeId)
      if (node) {
        node.selected = false
      }
    }

    return selectedIds
  }

  /**
   * 处理多选模式
   */
  private handleMultipleSelection(nodeId: TreeNodeId, selected: boolean, selectedIds: Set<TreeNodeId>): Set<TreeNodeId> {
    const node = this.nodeMap.get(nodeId)
    if (!node) {
      return selectedIds
    }

    if (selected) {
      selectedIds.add(nodeId)
      node.selected = true
    } else {
      selectedIds.delete(nodeId)
      node.selected = false
    }

    return selectedIds
  }

  /**
   * 处理级联选择模式
   */
  private handleCascadeSelection(nodeId: TreeNodeId, selected: boolean, selectedIds: Set<TreeNodeId>): Set<TreeNodeId> {
    const node = this.nodeMap.get(nodeId)
    if (!node) {
      return selectedIds
    }

    // 更新当前节点
    if (selected) {
      selectedIds.add(nodeId)
      node.selected = true
    } else {
      selectedIds.delete(nodeId)
      node.selected = false
    }

    // 级联更新子节点
    this.cascadeSelectChildren(node, selected, selectedIds)

    // 级联更新父节点
    this.cascadeSelectParents(node, selectedIds)

    return selectedIds
  }

  /**
   * 级联选择子节点
   */
  private cascadeSelectChildren(node: TreeNode, selected: boolean, selectedIds: Set<TreeNodeId>): void {
    for (const child of node.children) {
      if (child.selectable) {
        if (selected) {
          selectedIds.add(child.id)
          child.selected = true
        } else {
          selectedIds.delete(child.id)
          child.selected = false
          child.indeterminate = false
        }

        // 递归处理子节点
        this.cascadeSelectChildren(child, selected, selectedIds)
      }
    }
  }

  /**
   * 级联选择父节点
   */
  private cascadeSelectParents(node: TreeNode, selectedIds: Set<TreeNodeId>): void {
    let parent = node.parent

    while (parent && parent.selectable) {
      const selectableChildren = parent.children.filter(child => child.selectable)
      const selectedChildren = selectableChildren.filter(child => selectedIds.has(child.id))
      const indeterminateChildren = selectableChildren.filter(child => child.indeterminate)

      if (selectedChildren.length === selectableChildren.length) {
        // 所有子节点都被选中
        selectedIds.add(parent.id)
        parent.selected = true
        parent.indeterminate = false
      } else if (selectedChildren.length > 0 || indeterminateChildren.length > 0) {
        // 部分子节点被选中
        selectedIds.delete(parent.id)
        parent.selected = false
        parent.indeterminate = true
      } else {
        // 没有子节点被选中
        selectedIds.delete(parent.id)
        parent.selected = false
        parent.indeterminate = false
      }

      parent = parent.parent
    }
  }

  /**
   * 全选
   */
  selectAll(): Set<TreeNodeId> {
    const newSelectedIds = new Set<TreeNodeId>()

    if (this.options.selection?.mode === SelectionMode.SINGLE) {
      // 单选模式不支持全选
      return this.selectedIds
    }

    this.nodeMap.forEach(node => {
      if (node.selectable) {
        newSelectedIds.add(node.id)
        node.selected = true
        node.indeterminate = false
      }
    })

    this.selectedIds = newSelectedIds
    return newSelectedIds
  }

  /**
   * 取消全选
   */
  deselectAll(): Set<TreeNodeId> {
    this.nodeMap.forEach(node => {
      node.selected = false
      node.indeterminate = false
    })

    this.selectedIds.clear()
    return new Set()
  }

  /**
   * 反选
   */
  invertSelection(): Set<TreeNodeId> {
    if (this.options.selection?.mode === SelectionMode.SINGLE) {
      // 单选模式不支持反选
      return this.selectedIds
    }

    const newSelectedIds = new Set<TreeNodeId>()

    this.nodeMap.forEach(node => {
      if (node.selectable) {
        if (node.selected) {
          node.selected = false
          node.indeterminate = false
        } else {
          newSelectedIds.add(node.id)
          node.selected = true
          node.indeterminate = false
        }
      }
    })

    this.selectedIds = newSelectedIds
    return newSelectedIds
  }

  /**
   * 检查节点是否被选中
   */
  isSelected(nodeId: TreeNodeId): boolean {
    return this.selectedIds.has(nodeId)
  }

  /**
   * 检查是否有选中的节点
   */
  hasSelection(): boolean {
    return this.selectedIds.size > 0
  }

  /**
   * 获取选中节点的数量
   */
  getSelectionCount(): number {
    return this.selectedIds.size
  }

  /**
   * 清空选择
   */
  clear(): void {
    this.deselectAll()
  }

  /**
   * 设置选中的节点ID集合
   */
  setSelectedIds(selectedIds: Set<TreeNodeId>): void {
    this.selectedIds = new Set(selectedIds)

    // 更新节点状态
    this.nodeMap.forEach(node => {
      node.selected = this.selectedIds.has(node.id)
      node.indeterminate = false
    })

    // 如果是级联模式，需要更新半选状态
    if (this.options.selection?.mode === SelectionMode.CASCADE) {
      this.updateIndeterminateState()
    }
  }

  /**
   * 更新半选状态
   */
  private updateIndeterminateState(): void {
    this.nodeMap.forEach(node => {
      if (node.children.length > 0) {
        const selectableChildren = node.children.filter(child => child.selectable)
        const selectedChildren = selectableChildren.filter(child => child.selected)
        const indeterminateChildren = selectableChildren.filter(child => child.indeterminate)

        if (selectedChildren.length > 0 && selectedChildren.length < selectableChildren.length) {
          node.indeterminate = true
        } else if (indeterminateChildren.length > 0) {
          node.indeterminate = true
        } else {
          node.indeterminate = false
        }
      }
    })
  }
}
