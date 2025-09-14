/**
 * 树形组件异步加载功能模块
 * 
 * 提供异步加载子节点的功能，支持懒加载和动态数据
 */

import type { TreeNode, TreeNodeId, TreeNodeData } from '../types/tree-node'
import type { TreeOptions } from '../types/tree-options'

/**
 * 异步加载器函数类型
 */
export type AsyncLoader = (node: TreeNode) => Promise<TreeNodeData[]>

/**
 * 加载状态枚举
 */
export enum LoadingState {
  IDLE = 'idle',           // 空闲状态
  LOADING = 'loading',     // 加载中
  LOADED = 'loaded',       // 已加载
  ERROR = 'error',         // 加载错误
}

/**
 * 加载结果接口
 */
export interface LoadResult {
  success: boolean
  data?: TreeNodeData[]
  error?: string
  fromCache?: boolean
}

/**
 * 缓存项接口
 */
export interface CacheItem {
  data: TreeNodeData[]
  timestamp: number
  expiry?: number
}

/**
 * 异步加载管理器类
 */
export class AsyncLoaderManager {
  private options: TreeOptions
  private nodeMap: Map<TreeNodeId, TreeNode> = new Map()
  private loadingStates: Map<TreeNodeId, LoadingState> = new Map()
  private cache: Map<TreeNodeId, CacheItem> = new Map()
  private loadingPromises: Map<TreeNodeId, Promise<LoadResult>> = new Map()
  private asyncLoader?: AsyncLoader

  // 加载回调函数
  private onBeforeLoad?: (node: TreeNode) => boolean
  private onAfterLoad?: (node: TreeNode, result: LoadResult) => void
  private onLoadError?: (node: TreeNode, error: string) => void

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
   * 设置异步加载器
   */
  setAsyncLoader(loader: AsyncLoader): void {
    this.asyncLoader = loader
  }

  /**
   * 设置加载回调
   */
  setCallbacks(callbacks: {
    onBeforeLoad?: (node: TreeNode) => boolean
    onAfterLoad?: (node: TreeNode, result: LoadResult) => void
    onLoadError?: (node: TreeNode, error: string) => void
  }): void {
    this.onBeforeLoad = callbacks.onBeforeLoad
    this.onAfterLoad = callbacks.onAfterLoad
    this.onLoadError = callbacks.onLoadError
  }

  /**
   * 加载节点的子节点
   */
  async loadChildren(nodeId: TreeNodeId, force: boolean = false): Promise<LoadResult> {
    const node = this.nodeMap.get(nodeId)
    if (!node) {
      return { success: false, error: '节点不存在' }
    }

    // 检查是否正在加载
    const existingPromise = this.loadingPromises.get(nodeId)
    if (existingPromise) {
      return existingPromise
    }

    // 检查缓存
    if (!force) {
      const cachedResult = this.getCachedData(nodeId)
      if (cachedResult) {
        return cachedResult
      }
    }

    // 检查是否需要加载
    if (!this.shouldLoad(node, force)) {
      return { success: true, data: [], fromCache: false }
    }

    // 开始加载
    const loadPromise = this.performLoad(node)
    this.loadingPromises.set(nodeId, loadPromise)

    try {
      const result = await loadPromise
      return result
    } finally {
      this.loadingPromises.delete(nodeId)
    }
  }

  /**
   * 执行实际的加载操作
   */
  private async performLoad(node: TreeNode): Promise<LoadResult> {
    try {
      // 检查是否有异步加载器
      if (!this.asyncLoader) {
        return { success: false, error: '未设置异步加载器' }
      }

      // 触发前置回调
      if (this.onBeforeLoad && !this.onBeforeLoad(node)) {
        return { success: false, error: '加载被前置回调阻止' }
      }

      // 设置加载状态
      this.setLoadingState(node.id, LoadingState.LOADING)
      node.loading = true

      // 执行异步加载
      const data = await this.asyncLoader(node)

      // 验证数据
      if (!Array.isArray(data)) {
        throw new Error('异步加载器必须返回数组')
      }

      // 更新节点状态
      this.setLoadingState(node.id, LoadingState.LOADED)
      node.loading = false
      node.hasChildren = data.length > 0

      // 添加子节点
      this.addChildrenToNode(node, data)

      // 缓存数据
      this.cacheData(node.id, data)

      const result: LoadResult = {
        success: true,
        data,
        fromCache: false,
      }

      // 触发后置回调
      if (this.onAfterLoad) {
        this.onAfterLoad(node, result)
      }

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'

      // 设置错误状态
      this.setLoadingState(node.id, LoadingState.ERROR)
      node.loading = false
      node.error = errorMessage

      const result: LoadResult = {
        success: false,
        error: errorMessage,
      }

      // 触发错误回调
      if (this.onLoadError) {
        this.onLoadError(node, errorMessage)
      }

      // 触发后置回调
      if (this.onAfterLoad) {
        this.onAfterLoad(node, result)
      }

      return result
    }
  }

  /**
   * 检查是否应该加载
   */
  private shouldLoad(node: TreeNode, force: boolean): boolean {
    // 强制加载
    if (force) {
      return true
    }

    // 检查加载状态
    const loadingState = this.getLoadingState(node.id)
    if (loadingState === LoadingState.LOADING) {
      return false
    }

    // 已经加载过且不强制刷新
    if (loadingState === LoadingState.LOADED && !force) {
      return false
    }

    // 节点标记为有子节点或启用了懒加载
    return node.hasChildren || this.options.async?.lazy
  }

  /**
   * 添加子节点到父节点
   */
  private addChildrenToNode(parentNode: TreeNode, childrenData: TreeNodeData[]): void {
    // 清空现有子节点
    parentNode.children = []

    // 添加新的子节点
    for (const childData of childrenData) {
      parentNode.addChild(childData)
    }

    // 更新节点映射
    this.updateNodeMapRecursively(parentNode)
  }

  /**
   * 递归更新节点映射
   */
  private updateNodeMapRecursively(node: TreeNode): void {
    this.nodeMap.set(node.id, node)

    for (const child of node.children) {
      this.updateNodeMapRecursively(child)
    }
  }

  /**
   * 获取缓存数据
   */
  private getCachedData(nodeId: TreeNodeId): LoadResult | null {
    if (!this.options.async?.cache) {
      return null
    }

    const cacheItem = this.cache.get(nodeId)
    if (!cacheItem) {
      return null
    }

    // 检查缓存是否过期
    if (cacheItem.expiry && Date.now() > cacheItem.expiry) {
      this.cache.delete(nodeId)
      return null
    }

    return {
      success: true,
      data: cacheItem.data,
      fromCache: true,
    }
  }

  /**
   * 缓存数据
   */
  private cacheData(nodeId: TreeNodeId, data: TreeNodeData[]): void {
    if (!this.options.async?.cache) {
      return
    }

    const cacheItem: CacheItem = {
      data: [...data], // 深拷贝数据
      timestamp: Date.now(),
    }

    // 设置过期时间
    if (this.options.async.cacheExpiry) {
      cacheItem.expiry = Date.now() + this.options.async.cacheExpiry
    }

    this.cache.set(nodeId, cacheItem)

    // 限制缓存大小
    this.limitCacheSize()
  }

  /**
   * 限制缓存大小
   */
  private limitCacheSize(): void {
    const maxCacheSize = this.options.async?.maxCacheSize || 100

    if (this.cache.size <= maxCacheSize) {
      return
    }

    // 按时间戳排序，删除最旧的缓存项
    const entries = Array.from(this.cache.entries())
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp)

    const deleteCount = this.cache.size - maxCacheSize
    for (let i = 0; i < deleteCount; i++) {
      this.cache.delete(entries[i][0])
    }
  }

  /**
   * 获取加载状态
   */
  getLoadingState(nodeId: TreeNodeId): LoadingState {
    return this.loadingStates.get(nodeId) || LoadingState.IDLE
  }

  /**
   * 设置加载状态
   */
  private setLoadingState(nodeId: TreeNodeId, state: LoadingState): void {
    this.loadingStates.set(nodeId, state)
  }

  /**
   * 检查节点是否正在加载
   */
  isLoading(nodeId: TreeNodeId): boolean {
    return this.getLoadingState(nodeId) === LoadingState.LOADING
  }

  /**
   * 检查节点是否已加载
   */
  isLoaded(nodeId: TreeNodeId): boolean {
    return this.getLoadingState(nodeId) === LoadingState.LOADED
  }

  /**
   * 检查节点是否加载出错
   */
  hasError(nodeId: TreeNodeId): boolean {
    return this.getLoadingState(nodeId) === LoadingState.ERROR
  }

  /**
   * 重新加载节点
   */
  async reloadNode(nodeId: TreeNodeId): Promise<LoadResult> {
    // 清除缓存
    this.cache.delete(nodeId)

    // 重置加载状态
    this.setLoadingState(nodeId, LoadingState.IDLE)

    // 清除错误状态
    const node = this.nodeMap.get(nodeId)
    if (node) {
      node.error = undefined
    }

    // 重新加载
    return this.loadChildren(nodeId, true)
  }

  /**
   * 预加载节点
   */
  async preloadNode(nodeId: TreeNodeId): Promise<LoadResult> {
    const node = this.nodeMap.get(nodeId)
    if (!node) {
      return { success: false, error: '节点不存在' }
    }

    // 只有在节点未加载时才预加载
    if (this.getLoadingState(nodeId) === LoadingState.IDLE) {
      return this.loadChildren(nodeId)
    }

    return { success: true, data: [] }
  }

  /**
   * 清除缓存
   */
  clearCache(nodeId?: TreeNodeId): void {
    if (nodeId) {
      this.cache.delete(nodeId)
      // 重置加载状态，允许重新加载
      this.setLoadingState(nodeId, LoadingState.IDLE)
    } else {
      this.cache.clear()
      // 重置所有加载状态
      this.loadingStates.clear()
    }
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): { size: number; maxSize: number; hitRate?: number } {
    return {
      size: this.cache.size,
      maxSize: this.options.async?.maxCacheSize || 100,
    }
  }

  /**
   * 取消加载
   */
  cancelLoad(nodeId: TreeNodeId): void {
    this.loadingPromises.delete(nodeId)
    this.setLoadingState(nodeId, LoadingState.IDLE)

    const node = this.nodeMap.get(nodeId)
    if (node) {
      node.loading = false
    }
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.loadingPromises.clear()
    this.cache.clear()
    this.loadingStates.clear()
    this.nodeMap.clear()
  }
}
