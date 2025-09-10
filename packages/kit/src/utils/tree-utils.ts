/**
 * 树形数据处理工具类
 * 提供树形数据转换、操作、查找等功能
 * 
 * @example
 * ```typescript
 * import { TreeUtils } from '@ldesign/kit'
 * 
 * // 数组转树形结构
 * const array = [
 *   { id: 1, name: 'Root', parentId: null },
 *   { id: 2, name: 'Child 1', parentId: 1 },
 *   { id: 3, name: 'Child 2', parentId: 1 }
 * ]
 * const tree = TreeUtils.arrayToTree(array, { idKey: 'id', parentKey: 'parentId' })
 * 
 * // 查找节点
 * const node = TreeUtils.findNode(tree, node => node.id === 2)
 * 
 * // 获取树的深度
 * const depth = TreeUtils.getDepth(tree)
 * ```
 */

/**
 * 树形数据转换选项
 */
export interface TreeOptions {
  /** 节点ID字段名，默认为 'id' */
  idKey?: string
  /** 父节点ID字段名，默认为 'parentId' */
  parentKey?: string
  /** 子节点数组字段名，默认为 'children' */
  childrenKey?: string
  /** 根节点的父ID值，默认为 null */
  rootValue?: unknown
}

/**
 * 树形节点接口
 */
export interface TreeNode {
  /** 节点ID */
  id: unknown
  /** 父节点ID */
  parentId?: unknown
  /** 子节点数组 */
  children?: TreeNode[]
  /** 其他属性 */
  [key: string]: unknown
}

/**
 * 树形数据处理工具类
 * 提供各种树形数据操作功能
 */
export class TreeUtils {
  /**
   * 将扁平数组转换为树形结构
   * 
   * @param array - 扁平数组
   * @param options - 转换选项
   * @returns 树形结构数组
   * 
   * @example
   * ```typescript
   * const array = [
   *   { id: 1, name: 'Root', parentId: null },
   *   { id: 2, name: 'Child 1', parentId: 1 },
   *   { id: 3, name: 'Child 2', parentId: 1 },
   *   { id: 4, name: 'Grandchild', parentId: 2 }
   * ]
   * 
   * const tree = TreeUtils.arrayToTree(array, {
   *   idKey: 'id',
   *   parentKey: 'parentId',
   *   childrenKey: 'children'
   * })
   * ```
   */
  static arrayToTree<T extends Record<string, unknown>>(
    array: T[],
    options: TreeOptions = {}
  ): T[] {
    const {
      idKey = 'id',
      parentKey = 'parentId',
      childrenKey = 'children',
      rootValue = null
    } = options

    // 创建节点映射
    const nodeMap = new Map<unknown, T>()
    const result: T[] = []

    // 首先创建所有节点的映射
    for (const item of array) {
      const node = { ...item }
      nodeMap.set(node[idKey], node)
    }

    // 构建树形结构
    for (const item of array) {
      const node = nodeMap.get(item[idKey])!
      const parentId = item[parentKey]

      if (parentId === rootValue || parentId === undefined) {
        // 根节点
        result.push(node)
      } else {
        // 子节点
        const parent = nodeMap.get(parentId)
        if (parent) {
          if (!parent[childrenKey]) {
            (parent as Record<string, unknown>)[childrenKey] = []
          }
          ((parent as Record<string, unknown>)[childrenKey] as T[]).push(node)
        }
      }
    }

    return result
  }

  /**
   * 将树形结构转换为扁平数组
   * 
   * @param tree - 树形结构数组
   * @param options - 转换选项
   * @returns 扁平数组
   * 
   * @example
   * ```typescript
   * const tree = [
   *   {
   *     id: 1,
   *     name: 'Root',
   *     children: [
   *       { id: 2, name: 'Child 1' },
   *       { id: 3, name: 'Child 2' }
   *     ]
   *   }
   * ]
   * 
   * const array = TreeUtils.treeToArray(tree)
   * ```
   */
  static treeToArray<T extends Record<string, unknown>>(
    tree: T[],
    options: TreeOptions = {}
  ): T[] {
    const { childrenKey = 'children' } = options
    const result: T[] = []

    const traverse = (nodes: T[]) => {
      for (const node of nodes) {
        const { [childrenKey]: children, ...nodeWithoutChildren } = node
        result.push(nodeWithoutChildren as T)

        if (children && Array.isArray(children)) {
          traverse(children as T[])
        }
      }
    }

    traverse(tree)
    return result
  }

  /**
   * 在树中查找节点
   * 
   * @param tree - 树形结构数组
   * @param predicate - 查找条件函数
   * @param options - 选项
   * @returns 找到的节点或 null
   * 
   * @example
   * ```typescript
   * const node = TreeUtils.findNode(tree, node => node.id === 2)
   * const nodeByName = TreeUtils.findNode(tree, node => node.name === 'Child 1')
   * ```
   */
  static findNode<T extends Record<string, unknown>>(
    tree: T[],
    predicate: (node: T) => boolean,
    options: TreeOptions = {}
  ): T | null {
    const { childrenKey = 'children' } = options

    for (const node of tree) {
      if (predicate(node)) {
        return node
      }

      const children = node[childrenKey] as T[]
      if (children && Array.isArray(children)) {
        const found = this.findNode(children, predicate, options)
        if (found) {
          return found
        }
      }
    }

    return null
  }

  /**
   * 过滤树形数据
   * 
   * @param tree - 树形结构数组
   * @param predicate - 过滤条件函数
   * @param options - 选项
   * @returns 过滤后的树形结构
   * 
   * @example
   * ```typescript
   * const filteredTree = TreeUtils.filterTree(tree, node => node.visible === true)
   * ```
   */
  static filterTree<T extends Record<string, unknown>>(
    tree: T[],
    predicate: (node: T) => boolean,
    options: TreeOptions = {}
  ): T[] {
    const { childrenKey = 'children' } = options
    const result: T[] = []

    for (const node of tree) {
      const children = node[childrenKey] as T[]
      let filteredChildren: T[] = []

      if (children && Array.isArray(children)) {
        filteredChildren = this.filterTree(children, predicate, options)
      }

      if (predicate(node) || filteredChildren.length > 0) {
        const newNode = { ...node } as Record<string, unknown>
        if (filteredChildren.length > 0) {
          newNode[childrenKey] = filteredChildren
        } else {
          delete newNode[childrenKey]
        }
        result.push(newNode as T)
      }
    }

    return result
  }

  /**
   * 映射树形数据
   * 
   * @param tree - 树形结构数组
   * @param mapper - 映射函数
   * @param options - 选项
   * @returns 映射后的树形结构
   * 
   * @example
   * ```typescript
   * const mappedTree = TreeUtils.mapTree(tree, node => ({
   *   ...node,
   *   label: node.name,
   *   value: node.id
   * }))
   * ```
   */
  static mapTree<T extends Record<string, unknown>, R extends Record<string, unknown>>(
    tree: T[],
    mapper: (node: T) => R,
    options: TreeOptions = {}
  ): R[] {
    const { childrenKey = 'children' } = options

    return tree.map(node => {
      const mappedNode = mapper(node)
      const children = node[childrenKey] as T[]

      if (children && Array.isArray(children)) {
        (mappedNode as Record<string, unknown>)[childrenKey] = this.mapTree(children, mapper, options)
      }

      return mappedNode
    })
  }

  /**
   * 获取树的最大深度
   * 
   * @param tree - 树形结构数组
   * @param options - 选项
   * @returns 树的深度
   * 
   * @example
   * ```typescript
   * const depth = TreeUtils.getDepth(tree) // 返回树的最大深度
   * ```
   */
  static getDepth<T extends Record<string, unknown>>(
    tree: T[],
    options: TreeOptions = {}
  ): number {
    const { childrenKey = 'children' } = options

    if (!tree || tree.length === 0) {
      return 0
    }

    let maxDepth = 1

    for (const node of tree) {
      const children = node[childrenKey] as T[]
      if (children && Array.isArray(children)) {
        const childDepth = this.getDepth(children, options) + 1
        maxDepth = Math.max(maxDepth, childDepth)
      }
    }

    return maxDepth
  }

  /**
   * 获取节点的路径
   * 
   * @param tree - 树形结构数组
   * @param targetId - 目标节点ID
   * @param options - 选项
   * @returns 从根节点到目标节点的路径数组
   * 
   * @example
   * ```typescript
   * const path = TreeUtils.getNodePath(tree, 4) // 返回到ID为4的节点的路径
   * ```
   */
  static getNodePath<T extends Record<string, unknown>>(
    tree: T[],
    targetId: unknown,
    options: TreeOptions = {}
  ): T[] {
    const { idKey = 'id', childrenKey = 'children' } = options

    const findPath = (nodes: T[], path: T[] = []): T[] | null => {
      for (const node of nodes) {
        const currentPath = [...path, node]

        if (node[idKey] === targetId) {
          return currentPath
        }

        const children = node[childrenKey] as T[]
        if (children && Array.isArray(children)) {
          const found = findPath(children, currentPath)
          if (found) {
            return found
          }
        }
      }

      return null
    }

    return findPath(tree) || []
  }
}
