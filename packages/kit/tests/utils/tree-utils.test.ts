/**
 * TreeUtils 测试用例
 */

import { describe, expect, it } from 'vitest'
import { TreeUtils } from '../../src/utils/tree-utils'

describe('TreeUtils', () => {
  // 测试数据
  const flatArray = [
    { id: 1, name: 'Root', parentId: null },
    { id: 2, name: 'Child 1', parentId: 1 },
    { id: 3, name: 'Child 2', parentId: 1 },
    { id: 4, name: 'Grandchild 1', parentId: 2 },
    { id: 5, name: 'Grandchild 2', parentId: 2 },
    { id: 6, name: 'Grandchild 3', parentId: 3 }
  ]

  const treeData = [
    {
      id: 1,
      name: 'Root',
      children: [
        {
          id: 2,
          name: 'Child 1',
          children: [
            { id: 4, name: 'Grandchild 1' },
            { id: 5, name: 'Grandchild 2' }
          ]
        },
        {
          id: 3,
          name: 'Child 2',
          children: [
            { id: 6, name: 'Grandchild 3' }
          ]
        }
      ]
    }
  ]

  describe('arrayToTree', () => {
    it('应该将扁平数组转换为树形结构', () => {
      const result = TreeUtils.arrayToTree(flatArray, {
        idKey: 'id',
        parentKey: 'parentId',
        childrenKey: 'children'
      })

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(1)
      expect(result[0].name).toBe('Root')
      expect(result[0].children).toHaveLength(2)
      
      const child1 = (result[0].children as any[])[0]
      expect(child1.id).toBe(2)
      expect(child1.children).toHaveLength(2)
    })

    it('应该处理空数组', () => {
      const result = TreeUtils.arrayToTree([])
      expect(result).toEqual([])
    })

    it('应该使用默认选项', () => {
      const simpleArray = [
        { id: 1, name: 'Root', parentId: null },
        { id: 2, name: 'Child', parentId: 1 }
      ]
      
      const result = TreeUtils.arrayToTree(simpleArray)
      expect(result).toHaveLength(1)
      expect(result[0].children).toHaveLength(1)
    })

    it('应该处理多个根节点', () => {
      const multiRootArray = [
        { id: 1, name: 'Root 1', parentId: null },
        { id: 2, name: 'Root 2', parentId: null },
        { id: 3, name: 'Child', parentId: 1 }
      ]
      
      const result = TreeUtils.arrayToTree(multiRootArray)
      expect(result).toHaveLength(2)
    })
  })

  describe('treeToArray', () => {
    it('应该将树形结构转换为扁平数组', () => {
      const result = TreeUtils.treeToArray(treeData)
      
      expect(result).toHaveLength(6)
      expect(result.map(item => item.id)).toEqual([1, 2, 4, 5, 3, 6])
      
      // 确保没有 children 属性
      result.forEach(item => {
        expect(item.children).toBeUndefined()
      })
    })

    it('应该处理空树', () => {
      const result = TreeUtils.treeToArray([])
      expect(result).toEqual([])
    })

    it('应该处理没有子节点的树', () => {
      const simpleTree = [{ id: 1, name: 'Root' }]
      const result = TreeUtils.treeToArray(simpleTree)
      
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({ id: 1, name: 'Root' })
    })
  })

  describe('findNode', () => {
    it('应该找到指定的节点', () => {
      const result = TreeUtils.findNode(treeData, node => node.id === 4)
      
      expect(result).toBeTruthy()
      expect(result?.id).toBe(4)
      expect(result?.name).toBe('Grandchild 1')
    })

    it('应该找到根节点', () => {
      const result = TreeUtils.findNode(treeData, node => node.id === 1)
      
      expect(result).toBeTruthy()
      expect(result?.id).toBe(1)
      expect(result?.name).toBe('Root')
    })

    it('应该返回null如果找不到节点', () => {
      const result = TreeUtils.findNode(treeData, node => node.id === 999)
      expect(result).toBeNull()
    })

    it('应该支持复杂的查找条件', () => {
      const result = TreeUtils.findNode(treeData, node => 
        typeof node.name === 'string' && node.name.includes('Grandchild')
      )
      
      expect(result).toBeTruthy()
      expect(result?.id).toBe(4) // 第一个匹配的
    })
  })

  describe('filterTree', () => {
    it('应该过滤树形数据', () => {
      const result = TreeUtils.filterTree(treeData, node => 
        typeof node.name === 'string' && node.name.includes('Child')
      )
      
      expect(result).toHaveLength(1)
      expect(result[0].children).toHaveLength(2)
    })

    it('应该保留有匹配子节点的父节点', () => {
      const result = TreeUtils.filterTree(treeData, node => node.id === 4)
      
      expect(result).toHaveLength(1) // Root
      expect(result[0].children).toHaveLength(1) // Child 1
      expect((result[0].children as any[])[0].children).toHaveLength(1) // Grandchild 1
    })

    it('应该返回空数组如果没有匹配项', () => {
      const result = TreeUtils.filterTree(treeData, node => node.id === 999)
      expect(result).toEqual([])
    })
  })

  describe('mapTree', () => {
    it('应该映射树形数据', () => {
      const result = TreeUtils.mapTree(treeData, node => ({
        ...node,
        label: node.name,
        value: node.id
      }))
      
      expect(result[0].label).toBe('Root')
      expect(result[0].value).toBe(1)
      expect((result[0].children as any[])[0].label).toBe('Child 1')
    })

    it('应该保持树形结构', () => {
      const result = TreeUtils.mapTree(treeData, node => ({ id: node.id }))
      
      expect(result).toHaveLength(1)
      expect(result[0].children).toHaveLength(2)
      expect((result[0].children as any[])[0].children).toHaveLength(2)
    })
  })

  describe('getDepth', () => {
    it('应该返回正确的树深度', () => {
      const depth = TreeUtils.getDepth(treeData)
      expect(depth).toBe(3) // Root -> Child -> Grandchild
    })

    it('应该处理空树', () => {
      const depth = TreeUtils.getDepth([])
      expect(depth).toBe(0)
    })

    it('应该处理单层树', () => {
      const singleLevel = [{ id: 1, name: 'Root' }]
      const depth = TreeUtils.getDepth(singleLevel)
      expect(depth).toBe(1)
    })

    it('应该处理不平衡的树', () => {
      const unbalancedTree = [
        {
          id: 1,
          name: 'Root',
          children: [
            { id: 2, name: 'Child 1' },
            {
              id: 3,
              name: 'Child 2',
              children: [
                {
                  id: 4,
                  name: 'Grandchild',
                  children: [
                    { id: 5, name: 'Great Grandchild' }
                  ]
                }
              ]
            }
          ]
        }
      ]
      
      const depth = TreeUtils.getDepth(unbalancedTree)
      expect(depth).toBe(4)
    })
  })

  describe('getNodePath', () => {
    it('应该返回到指定节点的路径', () => {
      const path = TreeUtils.getNodePath(treeData, 4)
      
      expect(path).toHaveLength(3)
      expect(path.map(node => node.id)).toEqual([1, 2, 4])
      expect(path.map(node => node.name)).toEqual(['Root', 'Child 1', 'Grandchild 1'])
    })

    it('应该返回到根节点的路径', () => {
      const path = TreeUtils.getNodePath(treeData, 1)
      
      expect(path).toHaveLength(1)
      expect(path[0].id).toBe(1)
    })

    it('应该返回空数组如果找不到节点', () => {
      const path = TreeUtils.getNodePath(treeData, 999)
      expect(path).toEqual([])
    })

    it('应该返回到叶子节点的完整路径', () => {
      const path = TreeUtils.getNodePath(treeData, 6)
      
      expect(path).toHaveLength(3)
      expect(path.map(node => node.id)).toEqual([1, 3, 6])
    })
  })
})

