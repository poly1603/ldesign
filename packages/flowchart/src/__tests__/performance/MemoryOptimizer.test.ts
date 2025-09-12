/**
 * 内存优化器测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  MemoryOptimizer,
  ObjectPool,
  EventDelegationManager,
  DataCompressor
} from '../../performance/MemoryOptimizer'
import type { ApprovalNodeConfig, ApprovalEdgeConfig } from '../../types'

// Mock performance.memory
Object.defineProperty(performance, 'memory', {
  value: {
    usedJSHeapSize: 50 * 1024 * 1024, // 50MB
    totalJSHeapSize: 100 * 1024 * 1024, // 100MB
    jsHeapSizeLimit: 2 * 1024 * 1024 * 1024 // 2GB
  },
  writable: true
})

describe('ObjectPool', () => {
  let pool: ObjectPool<{ id: string; value: number }>

  beforeEach(() => {
    pool = new ObjectPool(
      () => ({ id: '', value: 0 }),
      (obj) => { obj.id = ''; obj.value = 0 },
      5 // 小的池大小便于测试
    )
  })

  describe('基础功能', () => {
    it('应该能够创建对象池', () => {
      expect(pool).toBeDefined()
      expect(pool.size()).toBe(0)
    })

    it('应该能够获取新对象', () => {
      const obj = pool.acquire()
      expect(obj).toBeDefined()
      expect(obj.id).toBe('')
      expect(obj.value).toBe(0)
    })

    it('应该能够释放对象到池中', () => {
      const obj = pool.acquire()
      obj.id = 'test'
      obj.value = 123

      pool.release(obj)
      expect(pool.size()).toBe(1)

      // 再次获取应该得到重置后的对象
      const reusedObj = pool.acquire()
      expect(reusedObj).toBe(obj) // 同一个对象
      expect(reusedObj.id).toBe('') // 已重置
      expect(reusedObj.value).toBe(0) // 已重置
    })

    it('应该限制池的最大大小', () => {
      // 创建多个对象并释放到池中
      const objects = []
      for (let i = 0; i < 10; i++) {
        objects.push(pool.acquire())
      }

      // 释放所有对象
      objects.forEach(obj => pool.release(obj))

      expect(pool.size()).toBe(5) // 不超过最大大小
    })

    it('应该能够清空对象池', () => {
      const obj1 = pool.acquire()
      const obj2 = pool.acquire()
      pool.release(obj1)
      pool.release(obj2)
      expect(pool.size()).toBe(2)

      pool.clear()
      expect(pool.size()).toBe(0)
    })
  })
})

describe('EventDelegationManager', () => {
  let manager: EventDelegationManager
  let container: HTMLElement

  beforeEach(() => {
    manager = new EventDelegationManager()
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    manager.clear()
    document.body.removeChild(container)
  })

  describe('基础功能', () => {
    it('应该能够创建事件委托管理器', () => {
      expect(manager).toBeDefined()
      expect(manager.size()).toBe(0)
    })

    it('应该能够添加委托事件', () => {
      const handler = vi.fn()

      manager.addDelegatedEvent('click', container, '.test', handler)
      expect(manager.size()).toBe(1)
    })

    it('应该能够触发委托事件', () => {
      const handler = vi.fn()

      manager.addDelegatedEvent('click', container, '.test', handler)

      // 创建匹配的元素
      const testElement = document.createElement('div')
      testElement.className = 'test'
      container.appendChild(testElement)

      // 触发事件
      testElement.click()

      expect(handler).toHaveBeenCalled()
    })

    it('应该能够移除委托事件', () => {
      const handler = vi.fn()

      manager.addDelegatedEvent('click', container, '.test', handler)
      expect(manager.size()).toBe(1)

      manager.removeDelegatedEvent('click', '.test')
      expect(manager.size()).toBe(0)
    })

    it('应该能够清空所有委托事件', () => {
      manager.addDelegatedEvent('click', container, '.test1', vi.fn())
      manager.addDelegatedEvent('mouseover', container, '.test2', vi.fn())
      expect(manager.size()).toBe(2)

      manager.clear()
      expect(manager.size()).toBe(0)
    })

    it('不应该重复添加相同的委托事件', () => {
      const handler = vi.fn()

      manager.addDelegatedEvent('click', container, '.test', handler)
      manager.addDelegatedEvent('click', container, '.test', handler)

      expect(manager.size()).toBe(1)
    })
  })
})

describe('DataCompressor', () => {
  let compressor: DataCompressor
  let mockNode: ApprovalNodeConfig
  let mockEdge: ApprovalEdgeConfig

  beforeEach(() => {
    compressor = new DataCompressor()

    mockNode = {
      id: 'node1',
      type: 'approval',
      x: 100.5,
      y: 200.7,
      text: '审批节点',
      properties: {
        name: '测试节点',
        description: '这是一个测试节点',
        level: 1,
        emptyValue: '',
        nullValue: null,
        undefinedValue: undefined
      }
    }

    mockEdge = {
      id: 'edge1',
      type: 'approval-edge',
      sourceNodeId: 'node1',
      targetNodeId: 'node2',
      text: '连接',
      properties: {
        weight: 1,
        color: 'blue'
      }
    }
  })

  describe('节点压缩', () => {
    it('应该能够压缩节点数据', () => {
      const compressed = compressor.compressNode(mockNode)

      expect(compressed.i).toBe('node1')
      expect(compressed.t).toBe('approval')
      expect(compressed.x).toBe(101) // 四舍五入
      expect(compressed.y).toBe(201) // 四舍五入
      expect(compressed.tx).toBe('审批节点')
      expect(compressed.p).toBeDefined()
    })

    it('应该能够解压节点数据', () => {
      const compressed = compressor.compressNode(mockNode)
      const decompressed = compressor.decompressNode(compressed)

      expect(decompressed.id).toBe(mockNode.id)
      expect(decompressed.type).toBe(mockNode.type)
      expect(decompressed.text).toBe(mockNode.text)
      expect(decompressed.properties.name).toBe(mockNode.properties.name)
    })

    it('压缩时应该移除空值', () => {
      const compressed = compressor.compressNode(mockNode)

      expect(compressed.p.emptyValue).toBeUndefined()
      expect(compressed.p.nullValue).toBeUndefined()
      expect(compressed.p.undefinedValue).toBeUndefined()
      expect(compressed.p.name).toBe('测试节点')
      expect(compressed.p.level).toBe(1)
    })
  })

  describe('边压缩', () => {
    it('应该能够压缩边数据', () => {
      const compressed = compressor.compressEdge(mockEdge)

      expect(compressed.i).toBe('edge1')
      expect(compressed.t).toBe('approval-edge')
      expect(compressed.s).toBe('node1')
      expect(compressed.tg).toBe('node2')
      expect(compressed.tx).toBe('连接')
    })

    it('应该能够解压边数据', () => {
      const compressed = compressor.compressEdge(mockEdge)
      const decompressed = compressor.decompressEdge(compressed)

      expect(decompressed.id).toBe(mockEdge.id)
      expect(decompressed.type).toBe(mockEdge.type)
      expect(decompressed.sourceNodeId).toBe(mockEdge.sourceNodeId)
      expect(decompressed.targetNodeId).toBe(mockEdge.targetNodeId)
      expect(decompressed.text).toBe(mockEdge.text)
    })
  })
})

describe('MemoryOptimizer', () => {
  let optimizer: MemoryOptimizer

  beforeEach(() => {
    optimizer = new MemoryOptimizer({
      enabled: true,
      maxPoolSize: 10,
      gcInterval: 100 // 短间隔便于测试
    })
  })

  afterEach(() => {
    optimizer.dispose()
  })

  describe('基础功能', () => {
    it('应该能够创建内存优化器', () => {
      expect(optimizer).toBeDefined()
    })

    it('应该能够获取和释放节点对象', () => {
      const node = optimizer.acquireNode()
      expect(node).toBeDefined()
      expect(node.id).toBe('')

      node.id = 'test'
      optimizer.releaseNode(node)

      const reusedNode = optimizer.acquireNode()
      expect(reusedNode.id).toBe('') // 应该被重置
    })

    it('应该能够获取和释放边对象', () => {
      const edge = optimizer.acquireEdge()
      expect(edge).toBeDefined()
      expect(edge.id).toBe('')

      edge.id = 'test'
      optimizer.releaseEdge(edge)

      const reusedEdge = optimizer.acquireEdge()
      expect(reusedEdge.id).toBe('') // 应该被重置
    })
  })

  describe('事件委托', () => {
    it('应该能够添加委托事件', () => {
      const container = document.createElement('div')
      const handler = vi.fn()

      optimizer.addDelegatedEvent('click', container, '.test', handler)

      // 这里无法直接测试内部状态，但不应该抛出错误
      expect(() => {
        optimizer.addDelegatedEvent('click', container, '.test', handler)
      }).not.toThrow()
    })
  })

  describe('数据压缩', () => {
    it('应该能够压缩和解压数据', () => {
      const nodes: ApprovalNodeConfig[] = [{
        id: 'node1',
        type: 'approval',
        x: 100,
        y: 200,
        text: '测试',
        properties: { test: true }
      }]

      const edges: ApprovalEdgeConfig[] = [{
        id: 'edge1',
        type: 'approval-edge',
        sourceNodeId: 'node1',
        targetNodeId: 'node2',
        text: '连接',
        properties: {}
      }]

      const compressed = optimizer.compressData(nodes, edges)
      expect(compressed).toBeDefined()

      const decompressed = optimizer.decompressData(compressed)
      expect(decompressed.nodes).toHaveLength(1)
      expect(decompressed.edges).toHaveLength(1)
      expect(decompressed.nodes[0].id).toBe('node1')
    })
  })

  describe('内存监控', () => {
    it('应该能够获取内存使用情况', () => {
      const memUsage = optimizer.getMemoryUsage()

      expect(memUsage).toBeDefined()
      expect(typeof memUsage.used).toBe('number')
      expect(typeof memUsage.total).toBe('number')
      expect(typeof memUsage.limit).toBe('number')
      expect(typeof memUsage.nodePoolSize).toBe('number')
      expect(typeof memUsage.edgePoolSize).toBe('number')
    })

    it('应该能够获取优化统计', () => {
      const stats = optimizer.getOptimizationStats()

      expect(stats).toBeDefined()
      expect(stats.memoryUsage).toBeDefined()
      expect(stats.poolEfficiency).toBeDefined()
      expect(typeof stats.compressionRatio).toBe('number')
      expect(typeof stats.eventDelegationSavings).toBe('number')
    })

    it('应该能够强制垃圾回收', () => {
      // 获取一些对象
      const node = optimizer.acquireNode()
      const edge = optimizer.acquireEdge()

      optimizer.releaseNode(node)
      optimizer.releaseEdge(edge)

      const beforeGC = optimizer.getMemoryUsage()
      expect(beforeGC.nodePoolSize).toBeGreaterThan(0)

      optimizer.forceGarbageCollection()

      const afterGC = optimizer.getMemoryUsage()
      expect(afterGC.nodePoolSize).toBe(0)
      expect(afterGC.edgePoolSize).toBe(0)
    })
  })

  describe('资源清理', () => {
    it('应该能够正确清理资源', () => {
      // 这个测试主要确保dispose不会抛出错误
      expect(() => optimizer.dispose()).not.toThrow()
    })
  })

  describe('禁用状态', () => {
    it('禁用时应该直接返回新对象', () => {
      const disabledOptimizer = new MemoryOptimizer({ enabled: false })

      const node1 = disabledOptimizer.acquireNode()
      const node2 = disabledOptimizer.acquireNode()

      expect(node1).not.toBe(node2) // 应该是不同的对象

      disabledOptimizer.dispose()
    })
  })
})
