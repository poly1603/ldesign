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
interface TreeNode<T = any> {
    /** 节点 ID */
    id: string | number;
    /** 父节点 ID */
    parentId?: string | number | null;
    /** 子节点 */
    children?: TreeNode<T>[];
    /** 节点数据 */
    [key: string]: any;
}
/**
 * 树形数据配置
 */
interface TreeConfig {
    /** ID 字段名 */
    idField?: string;
    /** 父 ID 字段名 */
    parentIdField?: string;
    /** 子节点字段名 */
    childrenField?: string;
    /** 根节点的父 ID 值 */
    rootParentId?: string | number | null;
}
/**
 * 遍历回调函数
 */
type TreeTraverseCallback<T> = (node: TreeNode<T>, index: number, level: number, parent?: TreeNode<T>) => boolean | void;
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
 * console.log(tree)
 * // [
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
declare function arrayToTree<T extends Record<string, any>>(data: T[], config?: TreeConfig): TreeNode<T>[];
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
 * console.log(flatData)
 * // [
 * //   { id: 1, name: '根节点' },
 * //   { id: 2, name: '子节点1' },
 * //   { id: 3, name: '子节点2' }
 * // ]
 * ```
 */
declare function treeToArray<T>(tree: TreeNode<T>[], config?: TreeConfig): T[];
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
 *   console.log(`Level ${level}: ${node.name}`)
 *
 *   // 返回 false 可停止遍历
 *   if (node.id === 'stop') {
 *     return false
 *   }
 * })
 * ```
 */
declare function traverseTree<T>(tree: TreeNode<T>[], callback: TreeTraverseCallback<T>, config?: TreeConfig): void;
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
 * console.log(node) // { id: 2, name: '子节点1', ... }
 *
 * const nodeByName = findInTree(tree, node => node.name === '特定节点')
 * ```
 */
declare function findInTree<T>(tree: TreeNode<T>[], predicate: (node: TreeNode<T>) => boolean, config?: TreeConfig): TreeNode<T> | null;
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
 * console.log(nodes) // 所有类型为 'folder' 的节点
 * ```
 */
declare function findAllInTree<T>(tree: TreeNode<T>[], predicate: (node: TreeNode<T>) => boolean, config?: TreeConfig): TreeNode<T>[];
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
 * console.log(path) // [根节点, 子节点1, 孙节点1]
 * ```
 */
declare function getNodePath<T>(tree: TreeNode<T>[], targetId: string | number, config?: TreeConfig): TreeNode<T>[];
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
declare function filterTree<T>(tree: TreeNode<T>[], predicate: (node: TreeNode<T>) => boolean, config?: TreeConfig): TreeNode<T>[];
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
declare function mapTree<T, R>(tree: TreeNode<T>[], transform: (node: TreeNode<T>) => R, config?: TreeConfig): R[];
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
 * console.log(depth) // 3
 * ```
 */
declare function getTreeDepth<T>(tree: TreeNode<T>[], config?: TreeConfig): number;
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
 * console.log(count) // 10
 * ```
 */
declare function getTreeNodeCount<T>(tree: TreeNode<T>[], config?: TreeConfig): number;

export { arrayToTree, filterTree, findAllInTree, findInTree, getNodePath, getTreeDepth, getTreeNodeCount, mapTree, traverseTree, treeToArray };
export type { TreeConfig, TreeNode, TreeTraverseCallback };
