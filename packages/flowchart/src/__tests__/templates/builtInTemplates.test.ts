/**
 * 内置模板测试
 */

import { describe, it, expect } from 'vitest'
import { 
  builtInTemplates, 
  getBuiltInTemplatesByCategory, 
  getBuiltInTemplate, 
  getDefaultTemplate 
} from '../../templates/builtInTemplates'

describe('内置模板', () => {
  describe('builtInTemplates', () => {
    it('应该包含预期的内置模板', () => {
      expect(builtInTemplates).toBeDefined()
      expect(Array.isArray(builtInTemplates)).toBe(true)
      expect(builtInTemplates.length).toBeGreaterThan(0)
    })

    it('所有内置模板都应该有必需的属性', () => {
      builtInTemplates.forEach(template => {
        expect(template.id).toBeTruthy()
        expect(template.name).toBeTruthy()
        expect(template.displayName).toBeTruthy()
        expect(template.description).toBeTruthy()
        expect(template.category).toBeTruthy()
        expect(template.version).toBeTruthy()
        expect(template.isBuiltIn).toBe(true)
        expect(template.data).toBeDefined()
        expect(template.data.nodes).toBeDefined()
        expect(template.data.edges).toBeDefined()
        expect(Array.isArray(template.data.nodes)).toBe(true)
        expect(Array.isArray(template.data.edges)).toBe(true)
      })
    })

    it('应该包含请假审批模板', () => {
      const leaveTemplate = builtInTemplates.find(t => t.name === 'leave-approval')
      expect(leaveTemplate).toBeDefined()
      expect(leaveTemplate?.displayName).toBe('请假审批流程')
      expect(leaveTemplate?.category).toBe('approval')
      expect(leaveTemplate?.isDefault).toBe(true)
    })

    it('应该包含报销审批模板', () => {
      const expenseTemplate = builtInTemplates.find(t => t.name === 'expense-approval')
      expect(expenseTemplate).toBeDefined()
      expect(expenseTemplate?.displayName).toBe('报销审批流程')
      expect(expenseTemplate?.category).toBe('approval')
    })

    it('应该包含采购审批模板', () => {
      const purchaseTemplate = builtInTemplates.find(t => t.name === 'purchase-approval')
      expect(purchaseTemplate).toBeDefined()
      expect(purchaseTemplate?.displayName).toBe('采购审批流程')
      expect(purchaseTemplate?.category).toBe('approval')
    })
  })

  describe('getBuiltInTemplatesByCategory', () => {
    it('应该能够按分类获取模板', () => {
      const approvalTemplates = getBuiltInTemplatesByCategory('approval')
      expect(Array.isArray(approvalTemplates)).toBe(true)
      expect(approvalTemplates.length).toBeGreaterThan(0)
      expect(approvalTemplates.every(t => t.category === 'approval')).toBe(true)
    })

    it('对于不存在的分类应该返回空数组', () => {
      const nonExistentTemplates = getBuiltInTemplatesByCategory('non-existent')
      expect(Array.isArray(nonExistentTemplates)).toBe(true)
      expect(nonExistentTemplates.length).toBe(0)
    })
  })

  describe('getBuiltInTemplate', () => {
    it('应该能够根据ID获取模板', () => {
      const template = getBuiltInTemplate('builtin_leave_approval')
      expect(template).toBeDefined()
      expect(template?.id).toBe('builtin_leave_approval')
      expect(template?.name).toBe('leave-approval')
    })

    it('对于不存在的ID应该返回undefined', () => {
      const template = getBuiltInTemplate('non-existent-id')
      expect(template).toBeUndefined()
    })
  })

  describe('getDefaultTemplate', () => {
    it('应该能够获取默认模板', () => {
      const defaultTemplate = getDefaultTemplate()
      expect(defaultTemplate).toBeDefined()
      expect(defaultTemplate?.isDefault).toBe(true)
    })

    it('默认模板应该是请假审批模板', () => {
      const defaultTemplate = getDefaultTemplate()
      expect(defaultTemplate?.name).toBe('leave-approval')
      expect(defaultTemplate?.displayName).toBe('请假审批流程')
    })
  })

  describe('模板数据验证', () => {
    it('请假审批模板应该有正确的节点结构', () => {
      const leaveTemplate = getBuiltInTemplate('builtin_leave_approval')
      expect(leaveTemplate).toBeDefined()
      
      const { nodes, edges } = leaveTemplate!.data
      
      // 应该有开始节点
      const startNode = nodes.find(n => n.type === 'start')
      expect(startNode).toBeDefined()
      
      // 应该有结束节点
      const endNode = nodes.find(n => n.type === 'end')
      expect(endNode).toBeDefined()
      
      // 应该有审批节点
      const approvalNodes = nodes.filter(n => n.type === 'approval')
      expect(approvalNodes.length).toBeGreaterThan(0)
      
      // 应该有条件节点
      const conditionNodes = nodes.filter(n => n.type === 'condition')
      expect(conditionNodes.length).toBeGreaterThan(0)
      
      // 边的数量应该合理
      expect(edges.length).toBeGreaterThan(0)
      expect(edges.length).toBeLessThanOrEqual(nodes.length * 2)
    })

    it('报销审批模板应该有正确的节点结构', () => {
      const expenseTemplate = getBuiltInTemplate('builtin_expense_approval')
      expect(expenseTemplate).toBeDefined()
      
      const { nodes, edges } = expenseTemplate!.data
      
      // 应该有开始和结束节点
      expect(nodes.some(n => n.type === 'start')).toBe(true)
      expect(nodes.some(n => n.type === 'end')).toBe(true)
      
      // 应该有审批节点
      const approvalNodes = nodes.filter(n => n.type === 'approval')
      expect(approvalNodes.length).toBeGreaterThan(1) // 多级审批
      
      // 应该有条件判断
      expect(nodes.some(n => n.type === 'condition')).toBe(true)
      
      // 边应该连接正确
      expect(edges.length).toBeGreaterThan(0)
    })

    it('采购审批模板应该有正确的节点结构', () => {
      const purchaseTemplate = getBuiltInTemplate('builtin_purchase_approval')
      expect(purchaseTemplate).toBeDefined()
      
      const { nodes, edges } = purchaseTemplate!.data
      
      // 应该有开始和结束节点
      expect(nodes.some(n => n.type === 'start')).toBe(true)
      expect(nodes.some(n => n.type === 'end')).toBe(true)
      
      // 应该有审批节点
      expect(nodes.some(n => n.type === 'approval')).toBe(true)
      
      // 应该有处理节点
      expect(nodes.some(n => n.type === 'process')).toBe(true)
      
      // 边应该连接正确
      expect(edges.length).toBeGreaterThan(0)
    })
  })

  describe('模板属性验证', () => {
    it('所有模板的节点都应该有有效的坐标', () => {
      builtInTemplates.forEach(template => {
        template.data.nodes.forEach(node => {
          expect(typeof node.x).toBe('number')
          expect(typeof node.y).toBe('number')
          expect(node.x).toBeGreaterThanOrEqual(0)
          expect(node.y).toBeGreaterThanOrEqual(0)
        })
      })
    })

    it('所有模板的边都应该有有效的连接', () => {
      builtInTemplates.forEach(template => {
        const nodeIds = template.data.nodes.map(n => n.id)
        
        template.data.edges.forEach(edge => {
          expect(nodeIds).toContain(edge.sourceNodeId)
          expect(nodeIds).toContain(edge.targetNodeId)
          expect(edge.sourceNodeId).not.toBe(edge.targetNodeId)
        })
      })
    })

    it('所有模板都应该有合理的标签', () => {
      builtInTemplates.forEach(template => {
        if (template.tags) {
          expect(Array.isArray(template.tags)).toBe(true)
          expect(template.tags.length).toBeGreaterThan(0)
          template.tags.forEach(tag => {
            expect(typeof tag).toBe('string')
            expect(tag.trim()).toBeTruthy()
          })
        }
      })
    })

    it('所有模板都应该有合理的版本号', () => {
      builtInTemplates.forEach(template => {
        expect(template.version).toMatch(/^\d+\.\d+\.\d+$/)
      })
    })

    it('所有模板都应该有创建和更新时间', () => {
      builtInTemplates.forEach(template => {
        expect(template.createdAt).toBeTruthy()
        expect(template.updatedAt).toBeTruthy()
        
        // 应该是有效的ISO日期字符串
        expect(new Date(template.createdAt).toISOString()).toBe(template.createdAt)
        expect(new Date(template.updatedAt).toISOString()).toBe(template.updatedAt)
      })
    })
  })
})
