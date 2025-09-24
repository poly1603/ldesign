/**
 * 树形数据操作工具测试
 */

import { describe, it, expect } from 'vitest'
import {
  arrayToTree,
  treeToArray,
  traverseTree,
  findInTree,
  findAllInTree,
  getNodePath,
  filterTree,
  mapTree,
  getTreeDepth,
  getTreeNodeCount,
} from '../tree'

describe('tree utils', () => {
  const flatData = [
    { id: 1, name: '根节点1', parentId: null },
    { id: 2, name: '子节点1', parentId: 1 },
    { id: 3, name: '子节点2', parentId: 1 },
    { id: 4, name: '孙节点1', parentId: 2 },
    { id: 5, name: '孙节点2', parentId: 2 },
    { id: 6, name: '根节点2', parentId: null },
    { id: 7, name: '子节点3', parentId: 6 },
  ]

  const treeData = [
    {
      id: 1,
      name: '根节点1',
      parentId: null,
      children: [
        {
          id: 2,
          name: '子节点1',
          parentId: 1,
          children: [
            { id: 4, name: '孙节点1', parentId: 2, children: [] },
            { id: 5, name: '孙节点2', parentId: 2, children: [] },
          ],
        },
        {
          id: 3,
          name: '子节点2',
          parentId: 1,
          children: [],
        },
      ],
    },
    {
      id: 6,
      name: '根节点2',
      parentId: null,
      children: [
        {
          id: 7,
          name: '子节点3',
          parentId: 6,
          children: [],
        },
      ],
    },
  ]

  describe('arrayToTree', () => {
    it('应该正确将扁平数组转换为树形结构', () => {
      const result = arrayToTree(flatData)
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe(1)
      expect(result[0].children).toHaveLength(2)
      expect(result[0].children?.[0].children).toHaveLength(2)
    })

    it('应该支持自定义字段名', () => {
      const customData = [
        { key: 1, title: '根节点', parent: null },
        { key: 2, title: '子节点', parent: 1 },
      ]

      const result = arrayToTree(customData, {
        idField: 'key',
        parentIdField: 'parent',
        childrenField: 'items',
      })

      expect(result[0].key).toBe(1)
      expect(result[0].items).toHaveLength(1)
      expect(result[0].items[0].key).toBe(2)
    })

    it('应该处理孤儿节点', () => {
      const dataWithOrphans = [
        { id: 1, name: '根节点', parentId: null },
        { id: 2, name: '孤儿节点', parentId: 999 },
      ]

      const result = arrayToTree(dataWithOrphans)
      expect(result).toHaveLength(2)
    })
  })

  describe('treeToArray', () => {
    it('应该正确将树形结构转换为扁平数组', () => {
      const result = treeToArray(treeData)
      expect(result).toHaveLength(7)
      expect(result.map((item: any) => item.id)).toEqual([1, 2, 4, 5, 3, 6, 7])
    })

    it('应该支持自定义字段名', () => {
      const customTree = [
        {
          key: 1,
          title: '根节点',
          items: [
            { key: 2, title: '子节点', items: [] },
          ],
        },
      ]

      const result = treeToArray(customTree as any, { childrenField: 'items' })
      expect(result).toHaveLength(2)
      expect((result[0] as any).key).toBe(1)
      expect((result[1] as any).key).toBe(2)
    })
  })

  describe('traverseTree', () => {
    it('应该正确遍历树形结构', () => {
      const visited: number[] = []

      traverseTree(treeData, (node) => {
        visited.push(node.id as number)
      })

      expect(visited).toEqual([1, 2, 4, 5, 3, 6, 7])
    })

    it('应该支持停止遍历', () => {
      const visited: number[] = []

      traverseTree(treeData, (node) => {
        visited.push(node.id as number)
        if (node.id === 2) {
          return false // 停止遍历
        }
        return true // 继续遍历
      })

      expect(visited).toEqual([1, 2])
    })

    it('应该正确传递层级和父节点信息', () => {
      const nodeInfo: Array<{ id: number; level: number; parentId?: number }> = []

      traverseTree(treeData, (node, index, level, parent) => {
        nodeInfo.push({
          id: node.id as number,
          level,
          parentId: parent?.id as number | undefined,
        })
      })

      expect(nodeInfo[0]).toEqual({ id: 1, level: 0, parentId: undefined })
      expect(nodeInfo[1]).toEqual({ id: 2, level: 1, parentId: 1 })
      expect(nodeInfo[2]).toEqual({ id: 4, level: 2, parentId: 2 })
    })
  })

  describe('findInTree', () => {
    it('应该正确查找节点', () => {
      const result = findInTree(treeData, node => node.id === 4)
      expect(result?.id).toBe(4)
      expect(result?.name).toBe('孙节点1')
    })

    it('应该在找不到节点时返回null', () => {
      const result = findInTree(treeData, node => node.id === 999)
      expect(result).toBeNull()
    })

    it('应该支持复杂查找条件', () => {
      const result = findInTree(treeData, node => node.name.includes('孙节点'))
      expect(result?.id).toBe(4) // 找到第一个匹配的
    })
  })

  describe('findAllInTree', () => {
    it('应该正确查找所有匹配的节点', () => {
      const results = findAllInTree(treeData, node => node.name.includes('子节点'))
      expect(results).toHaveLength(3)
      expect(results.map(node => node.id)).toEqual([2, 3, 7])
    })

    it('应该在没有匹配时返回空数组', () => {
      const results = findAllInTree(treeData, node => node.id === 999)
      expect(results).toEqual([])
    })
  })

  describe('getNodePath', () => {
    it('应该正确获取节点路径', () => {
      const path = getNodePath(treeData, 4)
      expect(path).toHaveLength(3)
      expect(path.map(node => node.id)).toEqual([1, 2, 4])
      expect(path.map(node => node.name)).toEqual(['根节点1', '子节点1', '孙节点1'])
    })

    it('应该正确获取根节点路径', () => {
      const path = getNodePath(treeData, 1)
      expect(path).toHaveLength(1)
      expect(path[0].id).toBe(1)
    })

    it('应该在找不到节点时返回空数组', () => {
      const path = getNodePath(treeData, 999)
      expect(path).toEqual([])
    })
  })

  describe('filterTree', () => {
    it('应该正确过滤树节点', () => {
      const result = filterTree(treeData, node => node.id !== 3)
      expect(result).toHaveLength(2)
      expect(result[0].children).toHaveLength(1) // 子节点2被过滤掉
      expect(result[0].children?.[0].id).toBe(2)
    })

    it('应该保留有匹配子节点的父节点', () => {
      const result = filterTree(treeData, node => node.id === 4)
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(1) // 根节点被保留
      expect(result[0].children).toHaveLength(1)
      expect(result[0].children?.[0].id).toBe(2) // 父节点被保留
      expect(result[0].children?.[0].children).toHaveLength(1)
      expect(result[0].children?.[0].children?.[0].id).toBe(4) // 目标节点
    })
  })

  describe('mapTree', () => {
    it('应该正确转换树节点', () => {
      const result = mapTree(treeData, node => ({
        ...node,
        label: node.name,
        value: node.id,
      }))

      expect(result[0].label).toBe('根节点1')
      expect(result[0].value).toBe(1)
      expect(result[0].children?.[0].label).toBe('子节点1')
      expect(result[0].children?.[0].value).toBe(2)
    })

    it('应该保持树形结构', () => {
      const result = mapTree(treeData, node => ({ id: node.id, name: node.name.toUpperCase() }))
      expect(result).toHaveLength(2)
      expect((result[0] as any).children).toHaveLength(2)
      expect((result[0] as any).children[0].children).toHaveLength(2)
    })
  })

  describe('getTreeDepth', () => {
    it('应该正确计算树的深度', () => {
      const depth = getTreeDepth(treeData)
      expect(depth).toBe(3) // 根节点 -> 子节点 -> 孙节点
    })

    it('应该处理空树', () => {
      const depth = getTreeDepth([])
      expect(depth).toBe(0)
    })

    it('应该处理单层树', () => {
      const singleLevel = [{ id: 1, name: '节点', children: [] }]
      const depth = getTreeDepth(singleLevel)
      expect(depth).toBe(1)
    })
  })

  describe('getTreeNodeCount', () => {
    it('应该正确计算节点总数', () => {
      const count = getTreeNodeCount(treeData)
      expect(count).toBe(7)
    })

    it('应该处理空树', () => {
      const count = getTreeNodeCount([])
      expect(count).toBe(0)
    })
  })
})
