/**
 * 模板管理器测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TemplateManager } from '../../templates/TemplateManager'
import type { FlowchartTemplate, FlowchartData } from '../../types'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('TemplateManager', () => {
  let templateManager: TemplateManager

  beforeEach(() => {
    vi.clearAllMocks()
    templateManager = new TemplateManager({
      storage: {
        type: 'localStorage',
        key: 'test-templates'
      },
      builtInTemplates: {
        enabled: true,
        categories: ['approval', 'workflow']
      }
    })
  })

  describe('初始化', () => {
    it('应该能够创建模板管理器实例', () => {
      expect(templateManager).toBeInstanceOf(TemplateManager)
    })

    it('应该能够初始化模板管理器', async () => {
      localStorageMock.getItem.mockReturnValue(null)
      await templateManager.initialize()
      
      // 应该尝试从存储加载模板
      expect(localStorageMock.getItem).toHaveBeenCalledWith('test-templates')
    })
  })

  describe('模板管理', () => {
    const mockFlowchartData: FlowchartData = {
      nodes: [
        {
          id: 'start_1',
          type: 'start',
          x: 100,
          y: 100,
          text: '开始',
          properties: {}
        }
      ],
      edges: []
    }

    const mockTemplateInfo = {
      name: 'test-template',
      displayName: '测试模板',
      description: '这是一个测试模板',
      category: 'approval' as const,
      version: '1.0.0',
      isBuiltIn: false,
      data: mockFlowchartData
    }

    it('应该能够添加模板', async () => {
      const templateId = await templateManager.addTemplate(mockTemplateInfo)
      
      expect(templateId).toBeTruthy()
      expect(typeof templateId).toBe('string')
      
      const template = templateManager.getTemplate(templateId)
      expect(template).toBeDefined()
      expect(template?.name).toBe(mockTemplateInfo.name)
      expect(template?.displayName).toBe(mockTemplateInfo.displayName)
    })

    it('应该能够更新模板', async () => {
      const templateId = await templateManager.addTemplate(mockTemplateInfo)
      
      await templateManager.updateTemplate(templateId, {
        displayName: '更新后的模板名称',
        description: '更新后的描述'
      })
      
      const updatedTemplate = templateManager.getTemplate(templateId)
      expect(updatedTemplate?.displayName).toBe('更新后的模板名称')
      expect(updatedTemplate?.description).toBe('更新后的描述')
      expect(updatedTemplate?.name).toBe(mockTemplateInfo.name) // 名称不应该改变
    })

    it('应该能够删除模板', async () => {
      const templateId = await templateManager.addTemplate(mockTemplateInfo)
      
      await templateManager.deleteTemplate(templateId)
      
      const deletedTemplate = templateManager.getTemplate(templateId)
      expect(deletedTemplate).toBeUndefined()
    })

    it('不应该能够删除内置模板', async () => {
      const builtInTemplateInfo = {
        ...mockTemplateInfo,
        isBuiltIn: true
      }
      
      const templateId = await templateManager.addTemplate(builtInTemplateInfo)
      
      await expect(templateManager.deleteTemplate(templateId))
        .rejects.toThrow('Cannot delete built-in template')
    })
  })

  describe('模板查询', () => {
    beforeEach(async () => {
      // 添加一些测试模板
      await templateManager.addTemplate({
        name: 'leave-approval',
        displayName: '请假审批',
        description: '请假审批流程',
        category: 'approval',
        version: '1.0.0',
        isBuiltIn: false,
        tags: ['请假', '审批'],
        data: { nodes: [], edges: [] }
      })

      await templateManager.addTemplate({
        name: 'expense-approval',
        displayName: '报销审批',
        description: '报销审批流程',
        category: 'approval',
        version: '1.0.0',
        isBuiltIn: false,
        tags: ['报销', '财务'],
        data: { nodes: [], edges: [] }
      })

      await templateManager.addTemplate({
        name: 'custom-workflow',
        displayName: '自定义工作流',
        description: '自定义工作流程',
        category: 'workflow',
        version: '1.0.0',
        isBuiltIn: false,
        tags: ['工作流', '自定义'],
        data: { nodes: [], edges: [] }
      })
    })

    it('应该能够获取所有模板', () => {
      const templates = templateManager.getAllTemplates()
      expect(templates.length).toBeGreaterThanOrEqual(3)
    })

    it('应该能够获取模板元数据', () => {
      const metadata = templateManager.getTemplateMetadata()
      expect(metadata.length).toBeGreaterThanOrEqual(3)
      
      const leaveTemplate = metadata.find(t => t.name === 'leave-approval')
      expect(leaveTemplate).toBeDefined()
      expect(leaveTemplate?.nodeCount).toBe(0)
      expect(leaveTemplate?.edgeCount).toBe(0)
    })

    it('应该能够按分类过滤模板', () => {
      const approvalTemplates = templateManager.filterTemplates({
        category: 'approval'
      })
      
      expect(approvalTemplates.length).toBe(2)
      expect(approvalTemplates.every(t => t.category === 'approval')).toBe(true)
    })

    it('应该能够按标签过滤模板', () => {
      const approvalTagTemplates = templateManager.filterTemplates({
        tags: ['审批']
      })
      
      expect(approvalTagTemplates.length).toBeGreaterThanOrEqual(1)
      expect(approvalTagTemplates.some(t => t.tags?.includes('审批'))).toBe(true)
    })

    it('应该能够按搜索关键词过滤模板', () => {
      const searchResults = templateManager.filterTemplates({
        search: '请假'
      })
      
      expect(searchResults.length).toBeGreaterThanOrEqual(1)
      expect(searchResults.some(t => 
        t.displayName.includes('请假') || 
        t.description.includes('请假')
      )).toBe(true)
    })

    it('应该能够排序模板', () => {
      const metadata = templateManager.getTemplateMetadata()
      
      const sortedByName = templateManager.sortTemplates(metadata, {
        field: 'displayName',
        order: 'asc'
      })
      
      expect(sortedByName[0].displayName <= sortedByName[1].displayName).toBe(true)
    })
  })

  describe('模板导入导出', () => {
    const mockTemplate: FlowchartTemplate = {
      id: 'export-test',
      name: 'export-template',
      displayName: '导出测试模板',
      description: '用于测试导出功能的模板',
      category: 'approval',
      version: '1.0.0',
      isBuiltIn: false,
      createdAt: '2025-09-12T00:00:00.000Z',
      updatedAt: '2025-09-12T00:00:00.000Z',
      data: {
        nodes: [
          {
            id: 'start_1',
            type: 'start',
            x: 100,
            y: 100,
            text: '开始',
            properties: {}
          }
        ],
        edges: []
      }
    }

    it('应该能够导出模板', async () => {
      const templateId = await templateManager.addTemplate(mockTemplate)
      
      const exportData = templateManager.exportTemplates([templateId], {
        format: 'json',
        pretty: true,
        includeMetadata: true
      })
      
      expect(exportData).toBeTruthy()
      
      const parsed = JSON.parse(exportData)
      expect(parsed.templates).toHaveLength(1)
      expect(parsed.templates[0].name).toBe(mockTemplate.name)
    })

    it('应该能够导入模板', async () => {
      const exportData = JSON.stringify({
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        templates: [mockTemplate]
      })
      
      const importedIds = await templateManager.importTemplates(exportData, {
        overwrite: true,
        validateData: true,
        generateId: true
      })
      
      expect(importedIds).toHaveLength(1)
      
      const importedTemplate = templateManager.getTemplate(importedIds[0])
      expect(importedTemplate).toBeDefined()
      expect(importedTemplate?.name).toBe(mockTemplate.name)
    })

    it('应该能够处理无效的导入数据', async () => {
      const invalidData = 'invalid json'
      
      await expect(templateManager.importTemplates(invalidData))
        .rejects.toThrow('Invalid import data format')
    })
  })

  describe('事件系统', () => {
    it('应该能够监听模板添加事件', async () => {
      const addListener = vi.fn()
      templateManager.on('template:add', addListener)
      
      await templateManager.addTemplate({
        name: 'event-test',
        displayName: '事件测试',
        description: '测试事件系统',
        category: 'approval',
        version: '1.0.0',
        isBuiltIn: false,
        data: { nodes: [], edges: [] }
      })
      
      expect(addListener).toHaveBeenCalledTimes(1)
    })

    it('应该能够监听模板删除事件', async () => {
      const deleteListener = vi.fn()
      templateManager.on('template:delete', deleteListener)
      
      const templateId = await templateManager.addTemplate({
        name: 'delete-test',
        displayName: '删除测试',
        description: '测试删除事件',
        category: 'approval',
        version: '1.0.0',
        isBuiltIn: false,
        data: { nodes: [], edges: [] }
      })
      
      await templateManager.deleteTemplate(templateId)
      
      expect(deleteListener).toHaveBeenCalledTimes(1)
      expect(deleteListener).toHaveBeenCalledWith(templateId)
    })
  })
})
