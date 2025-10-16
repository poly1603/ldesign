/**
 * 树形数据操作工具
 * 
 * @description
 * 提供树形数据的扁平化、构建、遍历、搜索等功能。
 * 支持自定义字段名、过滤条件、转换函数等。
 */

/**
 * 树节点接口
 */
export interface TreeNode<T = any> {
  /** 节点 ID */
  id: string | number
  /** 父节点 ID */
  parentId?: string | number | null
  /** 子节点 */
  children?: TreeNode<T>[]
  /** 节点数据 */
  [key: string]: any
}

/**
 * 树形数据配置
 */
export interface TreeConfig {
  /** ID 字段名 */
  idField?: string
  /** 父 ID 字段名 */
  parentIdField?: string
  /** 子节点字段名 */
  childrenField?: string
  /** 根节点的父 ID 值 */
  rootParentId?: string | number | null
}

/**
 * 遍历回调函数
 */
export type TreeTraverseCallback<T> = (
  node: TreeNode<T>,
  index: number,
  level: number,
  parent?: TreeNode<T>
) => boolean | void

/**
 * 将扁平数组转换为树形结构
 * 
 * @param data - 扁平数组
 * @param config - 配置选项
 * @returns 树形结构数组
 * 
 * @example
 * ```typescript
 * const flatData = [
 *   { id: 1, name: '根节点', parentId: null },
 *   { id: 2, name: '子节点1', parentId: 1 },
 *   { id: 3, name: '子节点2', parentId: 1 },
 *   { id: 4, name: '孙节点1', parentId: 2 }
 * ]
 * 
 * const tree = arrayToTree(flatData)
 *  * // [
 * //   {
 * //     id: 1,
 * //     name: '根节点',
 * //     parentId: null,
 * //     children: [
 * //       {
 * //         id: 2,
 * //         name: '子节点1',
 * //         parentId: 1,
 * //         children: [
 * //           { id: 4, name: '孙节点1', parentId: 2, children: [] }
 * //         ]
 * //       },
 * //       { id: 3, name: '子节点2', parentId: 1, children: [] }
 * //     ]
 * //   }
 * // ]
 * ```
 */
export function arrayToTree<T extends Record<string, any>>(
  data: T[],
  config: TreeConfig = {}
): TreeNode<T>[] {
  const {
    idField = 'id',
    parentIdField = 'parentId',
    childrenField = 'children',
    rootParentId = null,
  } = config

  // 创建 ID 到节点的映射
  const nodeMap = new Map<string | number, TreeNode<T>>()
  const result: TreeNode<T>[] = []

  // 初始化所有节点
  data.forEach(item => {
    const node: TreeNode<T> = {
      ...item,
      id: item[idField],
      [childrenField]: [],
    }
    nodeMap.set(item[idField], node)
  })

  // 构建树形结构
  data.forEach(item => {
    const node = nodeMap.get(item[idField])!
    const parentId = item[parentIdField]

    if (parentId === rootParentId || parentId === undefined) {
      // 根节点
      result.push(node)
    } else {
      // 子节点
      const parent = nodeMap.get(parentId)
      if (parent) {
        parent[childrenField].push(node)
      } else {
        // 父节点不存在，作为根节点处理
        result.push(node)
      }
    }
  })

  return result
}

/**
 * 将树形结构转换为扁平数组
 * 
 * @param tree - 树形结构数组
 * @param config - 配置选项
 * @returns 扁平数组
 * 
 * @example
 * ```typescript
 * const tree = [
 *   {
 *     id: 1,
 *     name: '根节点',
 *     children: [
 *       { id: 2, name: '子节点1', children: [] },
 *       { id: 3, name: '子节点2', children: [] }
 *     ]
 *   }
 * ]
 * 
 * const flatData = treeToArray(tree)
 *  * // [
 * //   { id: 1, name: '根节点' },
 * //   { id: 2, name: '子节点1' },
 * //   { id: 3, name: '子节点2' }
 * // ]
 * ```
 */
export function treeToArray<T>(
  tree: TreeNode<T>[],
  config: TreeConfig = {}
): T[] {
  const { childrenField = 'children' } = config
  const result: T[] = []

  const traverse = (nodes: TreeNode<T>[]) => {
    nodes.forEach(node => {
      const { [childrenField]: children, ...nodeData } = node
      result.push(nodeData as T)

      if (children && children.length > 0) {
        traverse(children)
      }
    })
  }

  traverse(tree)
  return result
}

/**
 * 深度优先遍历树
 * 
 * @param tree - 树形结构数组
 * @param callback - 遍历回调函数，返回 false 可停止遍历
 * @param config - 配置选项
 * 
 * @example
 * ```typescript
 * traverseTree(tree, (node, index, level, parent) => {
 *    *   
 *   // 返回 false 可停止遍历
 *   if (node.id === 'stop') {
 *     return false
 *   }
 * })
 * ```
 */
export function traverseTree<T>(
  tree: TreeNode<T>[],
  callback: TreeTraverseCallback<T>,
  config: TreeConfig = {}
): void {
  const { childrenField = 'children' } = config

  const traverse = (
    nodes: TreeNode<T>[],
    level = 0,
    parent?: TreeNode<T>
  ): boolean => {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      const result = callback(node, i, level, parent)

      // 如果回调返回 false，停止遍历
      if (result === false) {
        return false
      }

      // 遍历子节点
      const children = node[childrenField] as TreeNode<T>[] | undefined
      if (children && children.length > 0) {
        const shouldContinue = traverse(children, level + 1, node)
        if (!shouldContinue) {
          return false
        }
      }
    }
    return true
  }

  traverse(tree)
}

/**
 * 在树中查找节点
 * 
 * @param tree - 树形结构数组
 * @param predicate - 查找条件函数
 * @param config - 配置选项
 * @returns 找到的节点或 null
 * 
 * @example
 * ```typescript
 * const node = findInTree(tree, node => node.id === 2)
 *  // { id: 2, name: '子节点1', ... }
 * 
 * const nodeByName = findInTree(tree, node => node.name === '特定节点')
 * ```
 */
export function findInTree<T>(
  tree: TreeNode<T>[],
  predicate: (node: TreeNode<T>) => boolean,
  config: TreeConfig = {}
): TreeNode<T> | null {
  let found: TreeNode<T> | null = null

  traverseTree(tree, (node) => {
    if (predicate(node)) {
      found = node
      return false // 停止遍历
    }
    return true // 继续遍历
  }, config)

  return found
}

/**
 * 在树中查找多个节点
 * 
 * @param tree - 树形结构数组
 * @param predicate - 查找条件函数
 * @param config - 配置选项
 * @returns 找到的节点数组
 * 
 * @example
 * ```typescript
 * const nodes = findAllInTree(tree, node => node.type === 'folder')
 *  // 所有类型为 'folder' 的节点
 * ```
 */
export function findAllInTree<T>(
  tree: TreeNode<T>[],
  predicate: (node: TreeNode<T>) => boolean,
  config: TreeConfig = {}
): TreeNode<T>[] {
  const result: TreeNode<T>[] = []

  traverseTree(tree, (node) => {
    if (predicate(node)) {
      result.push(node)
    }
  }, config)

  return result
}

/**
 * 获取节点的路径
 * 
 * @param tree - 树形结构数组
 * @param targetId - 目标节点 ID
 * @param config - 配置选项
 * @returns 从根节点到目标节点的路径
 * 
 * @example
 * ```typescript
 * const path = getNodePath(tree, 4)
 *  // [根节点, 子节点1, 孙节点1]
 * ```
 */
export function getNodePath<T>(
  tree: TreeNode<T>[],
  targetId: string | number,
  config: TreeConfig = {}
): TreeNode<T>[] {
  const { idField = 'id' } = config
  const path: TreeNode<T>[] = []

  const findPath = (nodes: TreeNode<T>[], currentPath: TreeNode<T>[]): boolean => {
    for (const node of nodes) {
      const newPath = [...currentPath, node]

      if (node[idField] === targetId) {
        path.push(...newPath)
        return true
      }

      const children = node.children
      if (children && children.length > 0) {
        if (findPath(children, newPath)) {
          return true
        }
      }
    }
    return false
  }

  findPath(tree, [])
  return path
}

/**
 * 过滤树节点
 * 
 * @param tree - 树形结构数组
 * @param predicate - 过滤条件函数
 * @param config - 配置选项
 * @returns 过滤后的树
 * 
 * @example
 * ```typescript
 * const filteredTree = filterTree(tree, node => node.visible !== false)
 * ```
 */
export function filterTree<T>(
  tree: TreeNode<T>[],
  predicate: (node: TreeNode<T>) => boolean,
  config: TreeConfig = {}
): TreeNode<T>[] {
  const { childrenField = 'children' } = config

  const filter = (nodes: TreeNode<T>[]): TreeNode<T>[] => {
    return nodes.reduce((result, node) => {
      const children = node[childrenField] as TreeNode<T>[] | undefined
      const filteredChildren = children ? filter(children) : []

      // 如果节点本身满足条件，或者有满足条件的子节点，则保留
      if (predicate(node) || filteredChildren.length > 0) {
        result.push({
          ...node,
          [childrenField]: filteredChildren,
        })
      }

      return result
    }, [] as TreeNode<T>[])
  }

  return filter(tree)
}

/**
 * 转换树节点
 * 
 * @param tree - 树形结构数组
 * @param transform - 转换函数
 * @param config - 配置选项
 * @returns 转换后的树
 * 
 * @example
 * ```typescript
 * const transformedTree = mapTree(tree, node => ({
 *   ...node,
 *   label: node.name,
 *   value: node.id
 * }))
 * ```
 */
export function mapTree<T, R>(
  tree: TreeNode<T>[],
  transform: (node: TreeNode<T>) => R,
  config: TreeConfig = {}
): R[] {
  const { childrenField = 'children' } = config

  const map = (nodes: TreeNode<T>[]): R[] => {
    return nodes.map(node => {
      const children = node[childrenField] as TreeNode<T>[] | undefined
      const transformedNode = transform(node)

      if (children && children.length > 0) {
        return {
          ...transformedNode,
          [childrenField]: map(children),
        } as R
      }

      return transformedNode
    })
  }

  return map(tree)
}

/**
 * 获取树的最大深度
 * 
 * @param tree - 树形结构数组
 * @param config - 配置选项
 * @returns 最大深度
 * 
 * @example
 * ```typescript
 * const depth = getTreeDepth(tree)
 *  // 3
 * ```
 */
export function getTreeDepth<T>(
  tree: TreeNode<T>[],
  config: TreeConfig = {}
): number {
  const { childrenField = 'children' } = config
  let maxDepth = 0

  const getDepth = (nodes: TreeNode<T>[], currentDepth = 1): void => {
    maxDepth = Math.max(maxDepth, currentDepth)

    nodes.forEach(node => {
      const children = node[childrenField] as TreeNode<T>[] | undefined
      if (children && children.length > 0) {
        getDepth(children, currentDepth + 1)
      }
    })
  }

  if (tree.length > 0) {
    getDepth(tree)
  }

  return maxDepth
}

/**
 * 获取树的节点总数
 * 
 * @param tree - 树形结构数组
 * @param config - 配置选项
 * @returns 节点总数
 * 
 * @example
 * ```typescript
 * const count = getTreeNodeCount(tree)
 *  // 10
 * ```
 */
export function getTreeNodeCount<T>(
  tree: TreeNode<T>[],
  config: TreeConfig = {}
): number {
  let count = 0

  traverseTree(tree, () => {
    count++
  }, config)

  return count
}
