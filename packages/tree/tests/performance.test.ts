/**
 * 性能测试
 */

import { describe, it, expect } from 'vitest'
import type { TreeNodeData } from '../src/types'

// 生成测试数据
function generateTestData(nodeCount: number, maxDepth: number = 3): TreeNodeData[] {
  const nodes: TreeNodeData[] = []
  let nodeId = 1

  function createNode(depth: number, parentId?: string): TreeNodeData {
    const id = `node-${nodeId++}`
    const node: TreeNodeData = {
      id,
      label: `节点 ${id}`,
      parentId,
    }

    // 随机添加子节点
    if (depth < maxDepth && Math.random() > 0.3) {
      const childCount = Math.floor(Math.random() * 5) + 1
      node.children = []
      for (let i = 0; i < childCount && nodeId <= nodeCount; i++) {
        node.children.push(createNode(depth + 1, id))
      }
    }

    return node
  }

  while (nodeId <= nodeCount) {
    nodes.push(createNode(0))
  }

  return nodes
}

// 扁平化树形数据
function flattenTreeData(nodes: TreeNodeData[]): TreeNodeData[] {
  const result: TreeNodeData[] = []

  function traverse(nodeList: TreeNodeData[]) {
    for (const node of nodeList) {
      result.push(node)
      if (node.children) {
        traverse(node.children)
      }
    }
  }

  traverse(nodes)
  return result
}

// 性能测试辅助函数
function measureTime<T>(fn: () => T): { result: T; time: number } {
  const start = performance.now()
  const result = fn()
  const end = performance.now()
  return { result, time: end - start }
}

describe('性能测试', () => {

  describe('数据生成性能', () => {
    it('应该能够快速生成100个节点', () => {
      const { time } = measureTime(() => {
        generateTestData(100)
      })

      expect(time).toBeLessThan(50) // 应该在50ms内完成
    })

    it('应该能够快速生成1000个节点', () => {
      const { time } = measureTime(() => {
        generateTestData(1000)
      })

      expect(time).toBeLessThan(200) // 应该在200ms内完成
    })

    it('应该能够快速生成5000个节点', () => {
      const { time } = measureTime(() => {
        generateTestData(5000)
      })

      expect(time).toBeLessThan(500) // 应该在500ms内完成
    })
  })

  describe('算法性能', () => {
    it('应该能够快速搜索数组', () => {
      const testData = generateTestData(1000)
      const flatData = flattenTreeData(testData)

      const { time } = measureTime(() => {
        flatData.filter(node => node.label.includes('节点'))
      })

      expect(time).toBeLessThan(50) // 应该在50ms内完成
    })

    it('应该能够快速进行正则表达式匹配', () => {
      const testData = generateTestData(1000)
      const flatData = flattenTreeData(testData)
      const regex = /节点.*1/

      const { time } = measureTime(() => {
        flatData.filter(node => regex.test(node.label))
      })

      expect(time).toBeLessThan(100) // 应该在100ms内完成
    })

    it('应该能够快速进行数据排序', () => {
      const testData = generateTestData(1000)
      const flatData = flattenTreeData(testData)

      const { time } = measureTime(() => {
        flatData.sort((a, b) => a.label.localeCompare(b.label))
      })

      expect(time).toBeLessThan(100) // 应该在100ms内完成
    })
  })

  describe('数据处理性能', () => {
    it('应该能够快速处理大量数据', () => {
      const testData = generateTestData(10000, 2)

      expect(testData.length).toBeGreaterThan(0)
      expect(testData.length).toBeLessThan(20000) // 合理的数据量
    })

    it('应该能够快速扁平化数据', () => {
      const testData = generateTestData(1000)

      const { time } = measureTime(() => {
        flattenTreeData(testData)
      })

      expect(time).toBeLessThan(100) // 应该在100ms内完成
    })

    it('应该能够快速过滤数据', () => {
      const testData = generateTestData(5000)
      const flatData = flattenTreeData(testData)

      const { time } = measureTime(() => {
        flatData.filter(node => node.label.includes('1'))
      })

      expect(time).toBeLessThan(50) // 应该在50ms内完成
    })

    it('应该能够快速映射数据', () => {
      const testData = generateTestData(5000)
      const flatData = flattenTreeData(testData)

      const { time } = measureTime(() => {
        flatData.map(node => ({ ...node, processed: true }))
      })

      expect(time).toBeLessThan(100) // 应该在100ms内完成
    })

    it('应该能够快速分组数据', () => {
      const testData = generateTestData(1000)
      const flatData = flattenTreeData(testData)

      const { time } = measureTime(() => {
        const groups: Record<string, TreeNodeData[]> = {}
        flatData.forEach(node => {
          const key = node.parentId || 'root'
          if (!groups[key]) groups[key] = []
          groups[key].push(node)
        })
        return groups
      })

      expect(time).toBeLessThan(50) // 应该在50ms内完成
    })
  })
})
