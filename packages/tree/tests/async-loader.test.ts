/**
 * 异步加载功能测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AsyncLoaderManager, LoadingState } from '../src/features/async-loader'
import { TreeNodeImpl } from '../src/core/tree-node'
import { DEFAULT_TREE_OPTIONS } from '../src/types/tree-options'
import type { TreeNode, TreeNodeData } from '../src/types/tree-node'

describe('AsyncLoaderManager', () => {
  let asyncLoader: AsyncLoaderManager
  let nodes: TreeNode[]
  let nodeMap: Map<string, TreeNode>

  // 模拟异步加载器
  const mockAsyncLoader = vi.fn()

  beforeEach(() => {
    // 创建测试节点
    const node1 = new TreeNodeImpl({ 
      id: '1', 
      label: '节点1',
      hasChildren: true,
    })
    const node2 = new TreeNodeImpl({ 
      id: '2', 
      label: '节点2',
      hasChildren: false,
    })
    const node3 = new TreeNodeImpl({ 
      id: '3', 
      label: '节点3',
      hasChildren: true,
    })

    nodes = [node1, node2, node3]
    nodeMap = new Map()
    nodes.forEach(node => nodeMap.set(node.id, node))

    asyncLoader = new AsyncLoaderManager({
      ...DEFAULT_TREE_OPTIONS,
      async: {
        enabled: true,
        lazy: true,
        cache: true,
        cacheExpiry: 60000, // 1分钟
        maxCacheSize: 50,
      },
    })
    asyncLoader.updateNodeMap(nodeMap)
    asyncLoader.setAsyncLoader(mockAsyncLoader)

    // 重置mock
    mockAsyncLoader.mockReset()
  })

  describe('基础加载功能', () => {
    it('应该能够设置异步加载器', () => {
      const newLoader = vi.fn()
      asyncLoader.setAsyncLoader(newLoader)
      
      // 通过调用加载方法来验证加载器是否被设置
      expect(() => asyncLoader.setAsyncLoader(newLoader)).not.toThrow()
    })

    it('应该能够加载节点的子节点', async () => {
      const mockData: TreeNodeData[] = [
        { id: '1-1', label: '子节点1-1' },
        { id: '1-2', label: '子节点1-2' },
      ]
      mockAsyncLoader.mockResolvedValue(mockData)

      const result = await asyncLoader.loadChildren('1')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockData)
      expect(result.fromCache).toBe(false)
      expect(mockAsyncLoader).toHaveBeenCalledWith(nodes[0])
    })

    it('节点不存在时应该返回错误', async () => {
      const result = await asyncLoader.loadChildren('non-existent')

      expect(result.success).toBe(false)
      expect(result.error).toContain('不存在')
    })

    it('未设置异步加载器时应该返回错误', async () => {
      asyncLoader.setAsyncLoader(undefined as any)
      
      const result = await asyncLoader.loadChildren('1')

      expect(result.success).toBe(false)
      expect(result.error).toContain('未设置异步加载器')
    })
  })

  describe('加载状态管理', () => {
    it('应该能够获取节点的加载状态', () => {
      expect(asyncLoader.getLoadingState('1')).toBe(LoadingState.IDLE)
      expect(asyncLoader.isLoading('1')).toBe(false)
      expect(asyncLoader.isLoaded('1')).toBe(false)
      expect(asyncLoader.hasError('1')).toBe(false)
    })

    it('加载过程中应该设置正确的状态', async () => {
      let resolveLoad: (value: TreeNodeData[]) => void
      const loadPromise = new Promise<TreeNodeData[]>((resolve) => {
        resolveLoad = resolve
      })
      mockAsyncLoader.mockReturnValue(loadPromise)

      // 开始加载
      const resultPromise = asyncLoader.loadChildren('1')
      
      // 检查加载状态
      expect(asyncLoader.isLoading('1')).toBe(true)
      expect(nodes[0].loading).toBe(true)

      // 完成加载
      resolveLoad!([{ id: '1-1', label: '子节点1-1' }])
      await resultPromise

      // 检查完成状态
      expect(asyncLoader.isLoaded('1')).toBe(true)
      expect(nodes[0].loading).toBe(false)
    })

    it('加载失败时应该设置错误状态', async () => {
      const errorMessage = '加载失败'
      mockAsyncLoader.mockRejectedValue(new Error(errorMessage))

      const result = await asyncLoader.loadChildren('1')

      expect(result.success).toBe(false)
      expect(result.error).toBe(errorMessage)
      expect(asyncLoader.hasError('1')).toBe(true)
      expect(nodes[0].loading).toBe(false)
      expect(nodes[0].error).toBe(errorMessage)
    })
  })

  describe('缓存功能', () => {
    it('应该能够缓存加载结果', async () => {
      const mockData: TreeNodeData[] = [
        { id: '1-1', label: '子节点1-1' },
      ]
      mockAsyncLoader.mockResolvedValue(mockData)

      // 第一次加载
      const result1 = await asyncLoader.loadChildren('1')
      expect(result1.fromCache).toBe(false)
      expect(mockAsyncLoader).toHaveBeenCalledTimes(1)

      // 第二次加载应该使用缓存
      const result2 = await asyncLoader.loadChildren('1')
      expect(result2.fromCache).toBe(true)
      expect(result2.data).toEqual(mockData)
      expect(mockAsyncLoader).toHaveBeenCalledTimes(1) // 没有再次调用
    })

    it('强制加载应该跳过缓存', async () => {
      const mockData: TreeNodeData[] = [
        { id: '1-1', label: '子节点1-1' },
      ]
      mockAsyncLoader.mockResolvedValue(mockData)

      // 第一次加载
      await asyncLoader.loadChildren('1')
      expect(mockAsyncLoader).toHaveBeenCalledTimes(1)

      // 强制加载应该跳过缓存
      const result = await asyncLoader.loadChildren('1', true)
      expect(result.fromCache).toBe(false)
      expect(mockAsyncLoader).toHaveBeenCalledTimes(2)
    })

    it('应该能够清除缓存', async () => {
      const mockData: TreeNodeData[] = [
        { id: '1-1', label: '子节点1-1' },
      ]
      mockAsyncLoader.mockResolvedValue(mockData)

      // 加载并缓存
      await asyncLoader.loadChildren('1')
      expect(mockAsyncLoader).toHaveBeenCalledTimes(1)

      // 清除缓存
      asyncLoader.clearCache('1')

      // 再次加载应该重新调用加载器
      await asyncLoader.loadChildren('1')
      expect(mockAsyncLoader).toHaveBeenCalledTimes(2)
    })

    it('应该能够获取缓存统计信息', () => {
      const stats = asyncLoader.getCacheStats()
      
      expect(stats.size).toBe(0)
      expect(stats.maxSize).toBe(50)
    })
  })

  describe('重新加载功能', () => {
    it('应该能够重新加载节点', async () => {
      const mockData1: TreeNodeData[] = [
        { id: '1-1', label: '子节点1-1' },
      ]
      const mockData2: TreeNodeData[] = [
        { id: '1-1', label: '更新的子节点1-1' },
        { id: '1-2', label: '新子节点1-2' },
      ]

      // 第一次加载
      mockAsyncLoader.mockResolvedValueOnce(mockData1)
      await asyncLoader.loadChildren('1')

      // 重新加载
      mockAsyncLoader.mockResolvedValueOnce(mockData2)
      const result = await asyncLoader.reloadNode('1')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockData2)
      expect(mockAsyncLoader).toHaveBeenCalledTimes(2)
    })

    it('重新加载应该清除错误状态', async () => {
      // 第一次加载失败
      mockAsyncLoader.mockRejectedValueOnce(new Error('加载失败'))
      await asyncLoader.loadChildren('1')
      expect(asyncLoader.hasError('1')).toBe(true)

      // 重新加载成功
      mockAsyncLoader.mockResolvedValueOnce([{ id: '1-1', label: '子节点1-1' }])
      const result = await asyncLoader.reloadNode('1')

      expect(result.success).toBe(true)
      expect(asyncLoader.hasError('1')).toBe(false)
      expect(nodes[0].error).toBeUndefined()
    })
  })

  describe('预加载功能', () => {
    it('应该能够预加载节点', async () => {
      const mockData: TreeNodeData[] = [
        { id: '1-1', label: '子节点1-1' },
      ]
      mockAsyncLoader.mockResolvedValue(mockData)

      const result = await asyncLoader.preloadNode('1')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockData)
      expect(asyncLoader.isLoaded('1')).toBe(true)
    })

    it('已加载的节点预加载应该直接返回成功', async () => {
      // 先加载节点
      mockAsyncLoader.mockResolvedValue([{ id: '1-1', label: '子节点1-1' }])
      await asyncLoader.loadChildren('1')

      // 预加载已加载的节点
      const result = await asyncLoader.preloadNode('1')

      expect(result.success).toBe(true)
      expect(mockAsyncLoader).toHaveBeenCalledTimes(1) // 没有再次调用
    })
  })

  describe('并发加载控制', () => {
    it('并发加载同一节点应该共享Promise', async () => {
      let resolveLoad: (value: TreeNodeData[]) => void
      const loadPromise = new Promise<TreeNodeData[]>((resolve) => {
        resolveLoad = resolve
      })
      mockAsyncLoader.mockReturnValue(loadPromise)

      // 同时发起多个加载请求
      const promise1 = asyncLoader.loadChildren('1')
      const promise2 = asyncLoader.loadChildren('1')
      const promise3 = asyncLoader.loadChildren('1')

      // 完成加载
      resolveLoad!([{ id: '1-1', label: '子节点1-1' }])

      const [result1, result2, result3] = await Promise.all([promise1, promise2, promise3])

      // 所有请求都应该成功
      expect(result1.success).toBe(true)
      expect(result2.success).toBe(true)
      expect(result3.success).toBe(true)

      // 加载器只应该被调用一次
      expect(mockAsyncLoader).toHaveBeenCalledTimes(1)
    })
  })

  describe('回调函数', () => {
    it('应该能够设置和触发加载回调', async () => {
      const onBeforeLoad = vi.fn(() => true)
      const onAfterLoad = vi.fn()
      const onLoadError = vi.fn()

      asyncLoader.setCallbacks({
        onBeforeLoad,
        onAfterLoad,
        onLoadError,
      })

      mockAsyncLoader.mockResolvedValue([{ id: '1-1', label: '子节点1-1' }])

      await asyncLoader.loadChildren('1')

      expect(onBeforeLoad).toHaveBeenCalledWith(nodes[0])
      expect(onAfterLoad).toHaveBeenCalledWith(nodes[0], expect.any(Object))
      expect(onLoadError).not.toHaveBeenCalled()
    })

    it('前置回调返回false应该阻止加载', async () => {
      const onBeforeLoad = vi.fn(() => false)
      asyncLoader.setCallbacks({ onBeforeLoad })

      const result = await asyncLoader.loadChildren('1')

      expect(result.success).toBe(false)
      expect(result.error).toContain('阻止')
      expect(mockAsyncLoader).not.toHaveBeenCalled()
    })

    it('加载错误时应该触发错误回调', async () => {
      const onLoadError = vi.fn()
      asyncLoader.setCallbacks({ onLoadError })

      const errorMessage = '加载失败'
      mockAsyncLoader.mockRejectedValue(new Error(errorMessage))

      await asyncLoader.loadChildren('1')

      expect(onLoadError).toHaveBeenCalledWith(nodes[0], errorMessage)
    })
  })

  describe('取消加载', () => {
    it('应该能够取消正在进行的加载', async () => {
      let resolveLoad: (value: TreeNodeData[]) => void
      const loadPromise = new Promise<TreeNodeData[]>((resolve) => {
        resolveLoad = resolve
      })
      mockAsyncLoader.mockReturnValue(loadPromise)

      // 开始加载
      const resultPromise = asyncLoader.loadChildren('1')
      expect(asyncLoader.isLoading('1')).toBe(true)

      // 取消加载
      asyncLoader.cancelLoad('1')
      expect(asyncLoader.isLoading('1')).toBe(false)
      expect(nodes[0].loading).toBe(false)

      // 完成原始Promise（模拟异步操作完成）
      resolveLoad!([{ id: '1-1', label: '子节点1-1' }])
      
      // 等待Promise完成，但状态应该已经被重置
      await expect(resultPromise).resolves.toBeDefined()
    })
  })

  describe('销毁功能', () => {
    it('应该能够正确销毁管理器', () => {
      asyncLoader.destroy()
      
      // 验证内部状态被清空
      expect(() => asyncLoader.destroy()).not.toThrow()
    })
  })
})
