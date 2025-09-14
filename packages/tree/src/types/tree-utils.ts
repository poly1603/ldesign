/**
 * 树形组件工具函数相关类型定义
 */

import type { TreeNode, TreeNodeData, TreeNodeId } from './tree-node'

/**
 * 树形数据转换选项
 */
export interface TreeDataTransformOptions {
  /** 节点ID字段名 */
  idField?: string
  /** 节点标签字段名 */
  labelField?: string
  /** 子节点字段名 */
  childrenField?: string
  /** 父节点ID字段名 */
  parentIdField?: string
  /** 是否保留原始数据 */
  preserveOriginal?: boolean
  /** 自定义转换函数 */
  transform?: (item: any, index: number, parent?: any) => Partial<TreeNodeData>
}

/**
 * 树形数据扁平化选项
 */
export interface TreeFlattenOptions {
  /** 是否包含父节点信息 */
  includeParent?: boolean
  /** 是否包含层级信息 */
  includeLevel?: boolean
  /** 是否包含路径信息 */
  includePath?: boolean
  /** 过滤函数 */
  filter?: (node: TreeNode) => boolean
  /** 排序函数 */
  sort?: (a: TreeNode, b: TreeNode) => number
}

/**
 * 树形搜索选项
 */
export interface TreeSearchOptions {
  /** 搜索字段 */
  fields?: string[]
  /** 是否大小写敏感 */
  caseSensitive?: boolean
  /** 是否模糊搜索 */
  fuzzy?: boolean
  /** 是否搜索子节点 */
  searchChildren?: boolean
  /** 是否高亮匹配文本 */
  highlight?: boolean
  /** 高亮样式类名 */
  highlightClass?: string
  /** 自定义搜索函数 */
  matcher?: (node: TreeNode, keyword: string) => boolean
}

/**
 * 树形过滤选项
 */
export interface TreeFilterOptions {
  /** 过滤函数 */
  predicate: (node: TreeNode) => boolean
  /** 是否保留父节点 */
  keepParents?: boolean
  /** 是否保留子节点 */
  keepChildren?: boolean
  /** 是否严格模式（所有条件都必须满足） */
  strict?: boolean
}

/**
 * 树形排序选项
 */
export interface TreeSortOptions {
  /** 排序字段 */
  field?: string
  /** 排序方向 */
  order?: 'asc' | 'desc'
  /** 是否递归排序子节点 */
  recursive?: boolean
  /** 自定义比较函数 */
  compareFn?: (a: TreeNode, b: TreeNode) => number
}

/**
 * 树形遍历选项
 */
export interface TreeTraverseOptions {
  /** 遍历模式 */
  mode?: 'depth-first' | 'breadth-first'
  /** 是否包含根节点 */
  includeRoot?: boolean
  /** 是否只遍历叶子节点 */
  leavesOnly?: boolean
  /** 过滤函数 */
  filter?: (node: TreeNode) => boolean
  /** 是否提前终止 */
  earlyExit?: (node: TreeNode) => boolean
}

/**
 * 树形验证选项
 */
export interface TreeValidationOptions {
  /** 是否检查循环引用 */
  checkCircular?: boolean
  /** 是否检查重复ID */
  checkDuplicateIds?: boolean
  /** 是否检查孤儿节点 */
  checkOrphans?: boolean
  /** 自定义验证规则 */
  customRules?: Array<(node: TreeNode) => string | null>
}

/**
 * 树形验证结果
 */
export interface TreeValidationResult {
  /** 是否有效 */
  valid: boolean
  /** 错误信息列表 */
  errors: Array<{
    /** 错误类型 */
    type: 'circular' | 'duplicate' | 'orphan' | 'custom'
    /** 错误消息 */
    message: string
    /** 相关节点ID */
    nodeId?: TreeNodeId
    /** 错误详情 */
    details?: any
  }>
  /** 警告信息列表 */
  warnings: Array<{
    /** 警告类型 */
    type: string
    /** 警告消息 */
    message: string
    /** 相关节点ID */
    nodeId?: TreeNodeId
  }>
}

/**
 * 树形统计信息
 */
export interface TreeStatistics {
  /** 总节点数 */
  totalNodes: number
  /** 根节点数 */
  rootNodes: number
  /** 叶子节点数 */
  leafNodes: number
  /** 最大深度 */
  maxDepth: number
  /** 平均深度 */
  averageDepth: number
  /** 选中节点数 */
  selectedNodes: number
  /** 展开节点数 */
  expandedNodes: number
  /** 禁用节点数 */
  disabledNodes: number
  /** 各层级节点数分布 */
  levelDistribution: Record<number, number>
}

/**
 * 树形差异比较结果
 */
export interface TreeDiffResult {
  /** 新增的节点 */
  added: TreeNode[]
  /** 删除的节点 */
  removed: TreeNode[]
  /** 修改的节点 */
  modified: Array<{
    /** 节点ID */
    id: TreeNodeId
    /** 旧数据 */
    oldData: TreeNode
    /** 新数据 */
    newData: TreeNode
    /** 变更字段 */
    changes: string[]
  }>
  /** 移动的节点 */
  moved: Array<{
    /** 节点ID */
    id: TreeNodeId
    /** 旧父节点ID */
    oldParentId?: TreeNodeId
    /** 新父节点ID */
    newParentId?: TreeNodeId
    /** 旧索引 */
    oldIndex: number
    /** 新索引 */
    newIndex: number
  }>
}

/**
 * 树形路径信息
 */
export interface TreePath {
  /** 路径节点ID数组 */
  ids: TreeNodeId[]
  /** 路径节点数组 */
  nodes: TreeNode[]
  /** 路径标签数组 */
  labels: string[]
  /** 路径字符串 */
  toString(separator?: string): string
}

/**
 * 树形工具函数接口
 */
export interface TreeUtils {
  /** 将扁平数据转换为树形数据 */
  arrayToTree(data: any[], options?: TreeDataTransformOptions): TreeNode[]
  /** 将树形数据转换为扁平数据 */
  treeToArray(tree: TreeNode[], options?: TreeFlattenOptions): TreeNode[]
  /** 查找节点 */
  findNode(tree: TreeNode[], predicate: (node: TreeNode) => boolean): TreeNode | null
  /** 查找多个节点 */
  findNodes(tree: TreeNode[], predicate: (node: TreeNode) => boolean): TreeNode[]
  /** 搜索节点 */
  searchNodes(tree: TreeNode[], keyword: string, options?: TreeSearchOptions): TreeNode[]
  /** 过滤节点 */
  filterNodes(tree: TreeNode[], options: TreeFilterOptions): TreeNode[]
  /** 排序节点 */
  sortNodes(tree: TreeNode[], options?: TreeSortOptions): TreeNode[]
  /** 遍历节点 */
  traverseNodes(tree: TreeNode[], callback: (node: TreeNode) => void, options?: TreeTraverseOptions): void
  /** 验证树形数据 */
  validateTree(tree: TreeNode[], options?: TreeValidationOptions): TreeValidationResult
  /** 获取树形统计信息 */
  getStatistics(tree: TreeNode[]): TreeStatistics
  /** 比较两个树形数据的差异 */
  diffTrees(oldTree: TreeNode[], newTree: TreeNode[]): TreeDiffResult
  /** 获取节点路径 */
  getNodePath(tree: TreeNode[], nodeId: TreeNodeId): TreePath | null
  /** 克隆树形数据 */
  cloneTree(tree: TreeNode[], deep?: boolean): TreeNode[]
  /** 合并树形数据 */
  mergeTrees(tree1: TreeNode[], tree2: TreeNode[]): TreeNode[]
}
