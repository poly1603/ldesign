/**
 * 搜索功能测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { SearchManager, SearchMode } from '../src/features/search'
import { TreeNodeImpl } from '../src/core/tree-node'
import { DEFAULT_TREE_OPTIONS } from '../src/types/tree-options'
import type { TreeNode } from '../src/types/tree-node'

describe('SearchManager', () => {
  let searchManager: SearchManager
  let nodes: TreeNode[]
  let nodeMap: Map<string, TreeNode>

  beforeEach(() => {
    // 创建测试节点
    const node1 = new TreeNodeImpl({ 
      id: '1', 
      label: 'JavaScript 编程',
      data: { category: 'programming', level: 'advanced' }
    })
    const node2 = new TreeNodeImpl({ 
      id: '2', 
      label: 'Python 开发',
      data: { category: 'programming', level: 'beginner' }
    })
    const node3 = new TreeNodeImpl({ 
      id: '3', 
      label: '数据库设计',
      data: { category: 'database', level: 'intermediate' }
    })

    // 添加子节点
    node1.addChild({ 
      id: '1-1', 
      label: 'React 框架',
      data: { category: 'frontend', level: 'advanced' }
    })
    node1.addChild({ 
      id: '1-2', 
      label: 'Node.js 后端',
      data: { category: 'backend', level: 'intermediate' }
    })

    const node11 = node1.children[0]
    const node12 = node1.children[1]

    nodes = [node1, node2, node3, node11, node12]
    nodeMap = new Map()
    nodes.forEach(node => nodeMap.set(node.id, node))

    searchManager = new SearchManager({
      ...DEFAULT_TREE_OPTIONS,
      search: {
        enabled: true,
        mode: SearchMode.CONTAINS,
        caseSensitive: false,
        fields: ['label'],
        expandMatched: true,
      },
    })
    searchManager.updateNodeMap(nodeMap)
  })

  describe('基础搜索功能', () => {
    it('应该能够设置和获取搜索关键词', () => {
      searchManager.setSearchKeyword('JavaScript')
      expect(searchManager.getSearchKeyword()).toBe('JavaScript')
    })

    it('应该能够搜索节点标签', () => {
      const results = searchManager.setSearchKeyword('JavaScript')
      
      expect(results).toHaveLength(1)
      expect(results[0].node.id).toBe('1')
      expect(results[0].matchedFields).toContain('label')
    })

    it('应该能够进行大小写不敏感搜索', () => {
      const results = searchManager.setSearchKeyword('javascript')
      
      expect(results).toHaveLength(1)
      expect(results[0].node.id).toBe('1')
    })

    it('应该能够进行大小写敏感搜索', () => {
      searchManager.setCaseSensitive(true)
      
      const results1 = searchManager.setSearchKeyword('JavaScript')
      expect(results1).toHaveLength(1)
      
      const results2 = searchManager.setSearchKeyword('javascript')
      expect(results2).toHaveLength(0)
    })

    it('应该能够搜索多个匹配项', () => {
      const results = searchManager.setSearchKeyword('编程')
      
      expect(results).toHaveLength(1)
      expect(results[0].node.id).toBe('1')
    })

    it('空搜索关键词应该返回空结果', () => {
      const results = searchManager.setSearchKeyword('')
      
      expect(results).toHaveLength(0)
      expect(searchManager.getMatchedCount()).toBe(0)
    })
  })

  describe('搜索模式', () => {
    it('包含模式应该匹配包含关键词的节点', () => {
      searchManager.setSearchMode(SearchMode.CONTAINS)
      const results = searchManager.setSearchKeyword('Script')
      
      expect(results).toHaveLength(1)
      expect(results[0].node.label).toContain('Script')
    })

    it('开头匹配模式应该匹配以关键词开头的节点', () => {
      searchManager.setSearchMode(SearchMode.STARTS_WITH)
      
      const results1 = searchManager.setSearchKeyword('JavaScript')
      expect(results1).toHaveLength(1)
      
      const results2 = searchManager.setSearchKeyword('Script')
      expect(results2).toHaveLength(0)
    })

    it('结尾匹配模式应该匹配以关键词结尾的节点', () => {
      searchManager.setSearchMode(SearchMode.ENDS_WITH)
      
      const results1 = searchManager.setSearchKeyword('编程')
      expect(results1).toHaveLength(1)
      
      const results2 = searchManager.setSearchKeyword('Java')
      expect(results2).toHaveLength(0)
    })

    it('精确匹配模式应该只匹配完全相同的节点', () => {
      searchManager.setSearchMode(SearchMode.EXACT)
      
      const results1 = searchManager.setSearchKeyword('JavaScript 编程')
      expect(results1).toHaveLength(1)
      
      const results2 = searchManager.setSearchKeyword('JavaScript')
      expect(results2).toHaveLength(0)
    })

    it('正则表达式模式应该支持正则匹配', () => {
      searchManager.setSearchMode(SearchMode.REGEX)
      
      const results = searchManager.setSearchKeyword('(JavaScript|Python)')
      expect(results).toHaveLength(2)
    })

    it('无效的正则表达式应该返回空结果', () => {
      searchManager.setSearchMode(SearchMode.REGEX)
      
      const results = searchManager.setSearchKeyword('[invalid')
      expect(results).toHaveLength(0)
    })
  })

  describe('搜索字段', () => {
    it('应该能够在多个字段中搜索', () => {
      searchManager.setSearchFields(['label', 'data'])
      
      const results = searchManager.setSearchKeyword('programming')
      expect(results.length).toBeGreaterThan(0)
    })

    it('应该能够搜索节点ID', () => {
      searchManager.setSearchFields(['id'])
      
      const results = searchManager.setSearchKeyword('1-1')
      expect(results).toHaveLength(1)
      expect(results[0].node.id).toBe('1-1')
    })

    it('应该能够搜索节点数据', () => {
      searchManager.setSearchFields(['data'])
      
      const results = searchManager.setSearchKeyword('frontend')
      expect(results).toHaveLength(1)
      expect(results[0].node.id).toBe('1-1')
    })
  })

  describe('自定义过滤器', () => {
    it('应该能够添加自定义过滤器', () => {
      const filter = (node: TreeNode) => node.data?.level === 'advanced'
      
      const results = searchManager.addFilter(filter)
      expect(results).toHaveLength(2) // node1 和 node11
    })

    it('应该能够移除自定义过滤器', () => {
      const filter = (node: TreeNode) => node.data?.level === 'advanced'
      
      searchManager.addFilter(filter)
      expect(searchManager.getMatchedCount()).toBe(2)
      
      searchManager.removeFilter(filter)
      expect(searchManager.getMatchedCount()).toBe(0)
    })

    it('应该能够清除所有过滤器', () => {
      const filter1 = (node: TreeNode) => node.data?.level === 'advanced'
      const filter2 = (node: TreeNode) => node.data?.category === 'programming'
      
      searchManager.addFilter(filter1)
      searchManager.addFilter(filter2)
      
      searchManager.clearFilters()
      expect(searchManager.getMatchedCount()).toBe(0)
    })

    it('自定义过滤器应该与搜索关键词结合使用', () => {
      const filter = (node: TreeNode) => node.data?.category === 'programming'
      
      searchManager.addFilter(filter)
      const results = searchManager.setSearchKeyword('Python')
      
      expect(results).toHaveLength(1)
      expect(results[0].node.id).toBe('2')
    })
  })

  describe('搜索结果', () => {
    beforeEach(() => {
      searchManager.setSearchKeyword('JavaScript')
    })

    it('应该能够获取搜索结果', () => {
      const results = searchManager.getSearchResults()
      
      expect(results).toHaveLength(1)
      expect(results[0].node.id).toBe('1')
      expect(results[0].matchedFields).toContain('label')
      expect(results[0].highlightRanges).toHaveLength(1)
    })

    it('应该能够获取匹配的节点ID集合', () => {
      const matchedIds = searchManager.getMatchedNodeIds()
      
      expect(matchedIds.size).toBe(1)
      expect(matchedIds.has('1')).toBe(true)
    })

    it('应该能够检查节点是否匹配', () => {
      expect(searchManager.isNodeMatched('1')).toBe(true)
      expect(searchManager.isNodeMatched('2')).toBe(false)
    })

    it('应该能够获取匹配的节点数量', () => {
      expect(searchManager.getMatchedCount()).toBe(1)
    })
  })

  describe('文本高亮', () => {
    beforeEach(() => {
      searchManager.setSearchKeyword('JavaScript')
    })

    it('应该能够高亮匹配的文本', () => {
      const highlightedText = searchManager.highlightText('JavaScript 编程', '1', 'label')
      
      expect(highlightedText).toContain('<mark class="tree-search-highlight">JavaScript</mark>')
    })

    it('不匹配的文本应该保持原样', () => {
      const originalText = 'Python 开发'
      const highlightedText = searchManager.highlightText(originalText, '2', 'label')
      
      expect(highlightedText).toBe(originalText)
    })
  })

  describe('导航功能', () => {
    beforeEach(() => {
      searchManager.setSearchKeyword('编程') // 匹配多个节点
    })

    it('应该能够跳转到下一个匹配项', () => {
      const firstNode = searchManager.goToNext()
      expect(firstNode).toBeTruthy()
      
      const secondNode = searchManager.goToNext(firstNode!.id)
      expect(secondNode).toBeTruthy()
      
      // 应该循环回到第一个
      const thirdNode = searchManager.goToNext(secondNode!.id)
      expect(thirdNode?.id).toBe(firstNode?.id)
    })

    it('应该能够跳转到上一个匹配项', () => {
      const lastNode = searchManager.goToPrevious()
      expect(lastNode).toBeTruthy()
      
      const prevNode = searchManager.goToPrevious(lastNode!.id)
      expect(prevNode).toBeTruthy()
    })

    it('没有搜索结果时导航应该返回null', () => {
      searchManager.clearSearch()
      
      expect(searchManager.goToNext()).toBeNull()
      expect(searchManager.goToPrevious()).toBeNull()
    })
  })

  describe('清除搜索', () => {
    beforeEach(() => {
      searchManager.setSearchKeyword('JavaScript')
    })

    it('应该能够清除搜索', () => {
      expect(searchManager.getMatchedCount()).toBe(1)
      
      searchManager.clearSearch()
      
      expect(searchManager.getSearchKeyword()).toBe('')
      expect(searchManager.getMatchedCount()).toBe(0)
      expect(searchManager.getSearchResults()).toHaveLength(0)
    })

    it('清除搜索后节点状态应该重置', () => {
      const node = nodeMap.get('1')!
      expect(node.matched).toBe(true)
      expect(node.highlighted).toBe(true)
      
      searchManager.clearSearch()
      
      expect(node.matched).toBe(false)
      expect(node.highlighted).toBe(false)
    })
  })

  describe('高亮范围', () => {
    it('应该能够正确计算高亮范围', () => {
      const results = searchManager.setSearchKeyword('Script')
      
      expect(results).toHaveLength(1)
      expect(results[0].highlightRanges).toHaveLength(1)
      expect(results[0].highlightRanges[0].start).toBe(4) // "JavaScript"中"Script"的位置
      expect(results[0].highlightRanges[0].end).toBe(10)
    })

    it('应该能够处理多个匹配范围', () => {
      // 创建一个包含重复关键词的节点
      const testNode = new TreeNodeImpl({ 
        id: 'test', 
        label: 'test test test'
      })
      nodeMap.set('test', testNode)
      searchManager.updateNodeMap(nodeMap)
      
      const results = searchManager.setSearchKeyword('test')
      const testResult = results.find(r => r.node.id === 'test')
      
      expect(testResult?.highlightRanges).toHaveLength(3)
    })
  })
})
