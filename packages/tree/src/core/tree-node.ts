/**
 * 树形节点实现类
 * 
 * 实现TreeNode接口，提供完整的节点操作功能
 */

import type { 
  TreeNode, 
  TreeNodeData, 
  TreeNodeId, 
  TreeNodeState 
} from '../types/tree-node'

/**
 * 树形节点实现类
 */
export class TreeNodeImpl implements TreeNode {
  // 基础数据属性
  public id: TreeNodeId
  public label: string
  public icon?: string
  public disabled: boolean
  public selectable: boolean
  public draggable: boolean
  public droppable: boolean
  public data?: Record<string, any>
  public hasChildren: boolean
  public loading: boolean
  public error?: string
  public className?: string
  public style?: Record<string, any>

  // 状态属性
  public expanded: boolean
  public selected: boolean
  public indeterminate: boolean
  public visible: boolean
  public matched: boolean
  public highlighted: boolean
  public level: number
  public index: number
  public parentId?: TreeNodeId
  public path: TreeNodeId[]
  public dragging: boolean
  public dropTarget: boolean
  public dropPosition?: 'before' | 'after' | 'inside'

  // 关系属性
  public children: TreeNode[]
  public parent?: TreeNode

  /**
   * 构造函数
   * @param data 节点数据
   * @param parent 父节点
   * @param index 在父节点中的索引
   */
  constructor(data: TreeNodeData, parent?: TreeNode, index: number = 0) {
    // 初始化基础数据
    this.id = data.id
    this.label = data.label
    this.icon = data.icon
    this.disabled = data.disabled ?? false
    this.selectable = data.selectable ?? true
    this.draggable = data.draggable ?? true
    this.droppable = data.droppable ?? true
    this.data = data.data
    this.hasChildren = data.hasChildren ?? (data.children && data.children.length > 0) ?? false
    this.loading = data.loading ?? false
    this.error = data.error
    this.className = data.className
    this.style = data.style

    // 初始化状态
    this.expanded = false
    this.selected = false
    this.indeterminate = false
    this.visible = true
    this.matched = true
    this.highlighted = false
    this.level = parent ? parent.level + 1 : 0
    this.index = index
    this.parentId = parent?.id
    this.path = parent ? [...parent.path, this.id] : [this.id]
    this.dragging = false
    this.dropTarget = false

    // 初始化关系
    this.parent = parent
    this.children = []

    // 处理子节点
    if (data.children) {
      this.children = data.children.map((childData, childIndex) => 
        new TreeNodeImpl(childData, this, childIndex)
      )
    }
  }

  /**
   * 获取所有祖先节点
   */
  getAncestors(): TreeNode[] {
    const ancestors: TreeNode[] = []
    let current = this.parent
    while (current) {
      ancestors.unshift(current)
      current = current.parent
    }
    return ancestors
  }

  /**
   * 获取所有后代节点
   */
  getDescendants(): TreeNode[] {
    const descendants: TreeNode[] = []
    
    const traverse = (node: TreeNode) => {
      for (const child of node.children) {
        descendants.push(child)
        traverse(child)
      }
    }
    
    traverse(this)
    return descendants
  }

  /**
   * 获取所有兄弟节点
   */
  getSiblings(): TreeNode[] {
    if (!this.parent) {
      return []
    }
    return this.parent.children.filter(child => child.id !== this.id)
  }

  /**
   * 检查是否为叶子节点
   */
  isLeaf(): boolean {
    return this.children.length === 0 && !this.hasChildren
  }

  /**
   * 检查是否为根节点
   */
  isRoot(): boolean {
    return !this.parent
  }

  /**
   * 检查是否为指定节点的祖先
   */
  isAncestorOf(node: TreeNode): boolean {
    return node.path.includes(this.id) && node.id !== this.id
  }

  /**
   * 检查是否为指定节点的后代
   */
  isDescendantOf(node: TreeNode): boolean {
    return this.path.includes(node.id) && this.id !== node.id
  }

  /**
   * 切换展开状态
   */
  toggleExpanded(): void {
    this.expanded = !this.expanded
  }

  /**
   * 切换选中状态
   */
  toggleSelected(): void {
    if (!this.disabled && this.selectable) {
      this.selected = !this.selected
    }
  }

  /**
   * 添加子节点
   */
  addChild(childData: TreeNodeData, index?: number): TreeNode {
    const child = new TreeNodeImpl(childData, this, this.children.length)
    
    if (index !== undefined && index >= 0 && index <= this.children.length) {
      this.children.splice(index, 0, child)
      // 更新后续节点的索引
      for (let i = index + 1; i < this.children.length; i++) {
        this.children[i].index = i
      }
    } else {
      this.children.push(child)
    }
    
    this.hasChildren = true
    return child
  }

  /**
   * 移除子节点
   */
  removeChild(child: TreeNode | TreeNodeId): boolean {
    const childId = typeof child === 'object' ? child.id : child
    const index = this.children.findIndex(c => c.id === childId)
    
    if (index === -1) {
      return false
    }
    
    this.children.splice(index, 1)
    
    // 更新后续节点的索引
    for (let i = index; i < this.children.length; i++) {
      this.children[i].index = i
    }
    
    this.hasChildren = this.children.length > 0
    return true
  }

  /**
   * 移动到指定父节点
   */
  moveTo(newParent: TreeNode | null, index?: number): void {
    // 从原父节点移除
    if (this.parent) {
      this.parent.removeChild(this)
    }
    
    // 添加到新父节点
    if (newParent) {
      this.parent = newParent
      this.parentId = newParent.id
      this.level = newParent.level + 1
      this.path = [...newParent.path, this.id]
      
      if (index !== undefined && index >= 0 && index <= newParent.children.length) {
        newParent.children.splice(index, 0, this)
        this.index = index
        // 更新后续节点的索引
        for (let i = index + 1; i < newParent.children.length; i++) {
          newParent.children[i].index = i
        }
      } else {
        newParent.children.push(this)
        this.index = newParent.children.length - 1
      }
      
      newParent.hasChildren = true
    } else {
      // 移动到根级别
      this.parent = undefined
      this.parentId = undefined
      this.level = 0
      this.path = [this.id]
      this.index = index ?? 0
    }
    
    // 递归更新所有后代节点的层级和路径
    this.updateDescendantsLevelAndPath()
  }

  /**
   * 更新所有后代节点的层级和路径
   */
  private updateDescendantsLevelAndPath(): void {
    const updateNode = (node: TreeNode) => {
      for (const child of node.children) {
        child.level = node.level + 1
        child.path = [...node.path, child.id]
        updateNode(child)
      }
    }
    updateNode(this)
  }

  /**
   * 克隆节点
   */
  clone(deep: boolean = false): TreeNode {
    const clonedData: TreeNodeData = {
      id: this.id,
      label: this.label,
      icon: this.icon,
      disabled: this.disabled,
      selectable: this.selectable,
      draggable: this.draggable,
      droppable: this.droppable,
      data: this.data ? { ...this.data } : undefined,
      hasChildren: this.hasChildren,
      loading: this.loading,
      error: this.error,
      className: this.className,
      style: this.style ? { ...this.style } : undefined,
    }
    
    if (deep && this.children.length > 0) {
      clonedData.children = this.children.map(child => {
        const clonedChild = child.clone(true)
        return {
          id: clonedChild.id,
          label: clonedChild.label,
          icon: clonedChild.icon,
          disabled: clonedChild.disabled,
          selectable: clonedChild.selectable,
          draggable: clonedChild.draggable,
          droppable: clonedChild.droppable,
          data: clonedChild.data,
          hasChildren: clonedChild.hasChildren,
          loading: clonedChild.loading,
          error: clonedChild.error,
          className: clonedChild.className,
          style: clonedChild.style,
          children: clonedChild.children.length > 0 ? [] : undefined, // 避免循环引用
        }
      })
    }
    
    return new TreeNodeImpl(clonedData, undefined, this.index)
  }
}
