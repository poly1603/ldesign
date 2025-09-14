/**
 * 树形节点相关类型定义
 */

/**
 * 树形节点的唯一标识符类型
 */
export type TreeNodeId = string | number

/**
 * 树形节点的基础数据接口
 */
export interface TreeNodeData {
  /** 节点唯一标识符 */
  id: TreeNodeId
  /** 节点显示文本 */
  label: string
  /** 节点图标 */
  icon?: string
  /** 节点是否禁用 */
  disabled?: boolean
  /** 节点是否可选择 */
  selectable?: boolean
  /** 节点是否可拖拽 */
  draggable?: boolean
  /** 节点是否可作为拖拽目标 */
  droppable?: boolean
  /** 节点自定义数据 */
  data?: Record<string, any>
  /** 子节点数据 */
  children?: TreeNodeData[]
  /** 是否有子节点（用于异步加载） */
  hasChildren?: boolean
  /** 节点是否正在加载 */
  loading?: boolean
  /** 节点加载错误信息 */
  error?: string
  /** 节点自定义样式类名 */
  className?: string
  /** 节点自定义样式 */
  style?: Record<string, any>
}

/**
 * 树形节点的运行时状态接口
 */
export interface TreeNodeState {
  /** 节点是否展开 */
  expanded: boolean
  /** 节点是否选中 */
  selected: boolean
  /** 节点是否半选中（部分子节点选中） */
  indeterminate: boolean
  /** 节点是否可见 */
  visible: boolean
  /** 节点是否匹配搜索条件 */
  matched: boolean
  /** 节点是否高亮显示 */
  highlighted: boolean
  /** 节点层级深度 */
  level: number
  /** 节点在同级中的索引 */
  index: number
  /** 节点的父节点ID */
  parentId?: TreeNodeId
  /** 节点的路径（从根节点到当前节点的ID数组） */
  path: TreeNodeId[]
  /** 节点是否正在拖拽 */
  dragging: boolean
  /** 节点是否为拖拽目标 */
  dropTarget: boolean
  /** 拖拽位置指示器 */
  dropPosition?: 'before' | 'after' | 'inside'
}

/**
 * 完整的树形节点接口
 */
export interface TreeNode extends TreeNodeData, TreeNodeState {
  /** 子节点列表 */
  children: TreeNode[]
  /** 父节点引用 */
  parent?: TreeNode
  /** 获取所有祖先节点 */
  getAncestors(): TreeNode[]
  /** 获取所有后代节点 */
  getDescendants(): TreeNode[]
  /** 获取所有兄弟节点 */
  getSiblings(): TreeNode[]
  /** 检查是否为叶子节点 */
  isLeaf(): boolean
  /** 检查是否为根节点 */
  isRoot(): boolean
  /** 检查是否为指定节点的祖先 */
  isAncestorOf(node: TreeNode): boolean
  /** 检查是否为指定节点的后代 */
  isDescendantOf(node: TreeNode): boolean
  /** 切换展开状态 */
  toggleExpanded(): void
  /** 切换选中状态 */
  toggleSelected(): void
  /** 添加子节点 */
  addChild(child: TreeNodeData, index?: number): TreeNode
  /** 移除子节点 */
  removeChild(child: TreeNode | TreeNodeId): boolean
  /** 移动到指定父节点 */
  moveTo(parent: TreeNode | null, index?: number): void
  /** 克隆节点 */
  clone(deep?: boolean): TreeNode
}

/**
 * 节点选择模式枚举
 */
export enum SelectionMode {
  /** 无选择 */
  NONE = 'none',
  /** 单选 */
  SINGLE = 'single',
  /** 多选 */
  MULTIPLE = 'multiple',
  /** 级联选择（父子联动） */
  CASCADE = 'cascade',
}

/**
 * 节点展开模式枚举
 */
export enum ExpandMode {
  /** 手动展开 */
  MANUAL = 'manual',
  /** 自动展开到选中节点 */
  AUTO_TO_SELECTED = 'auto-to-selected',
  /** 自动展开所有节点 */
  AUTO_ALL = 'auto-all',
}

/**
 * 拖拽模式枚举
 */
export enum DragMode {
  /** 禁用拖拽 */
  DISABLED = 'disabled',
  /** 仅排序（同级拖拽） */
  SORT = 'sort',
  /** 完全拖拽（可改变层级） */
  FULL = 'full',
}

/**
 * 节点加载状态枚举
 */
export enum LoadingState {
  /** 未加载 */
  IDLE = 'idle',
  /** 加载中 */
  LOADING = 'loading',
  /** 加载成功 */
  SUCCESS = 'success',
  /** 加载失败 */
  ERROR = 'error',
}
