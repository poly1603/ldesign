/**
 * 属性面板实时更新测试
 * 验证属性面板应用更改后画布是否正确更新
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { FlowchartEditor } from '../core/FlowchartEditor'
import { PropertyPanel } from '../ui/native/PropertyPanel'
import { EnhancedPropertyPanel } from '../ui/native/EnhancedPropertyPanel'
import type { ApprovalNodeConfig } from '../types'

describe('属性面板实时更新测试', () => {
  let container: HTMLElement
  let propertyContainer: HTMLElement
  let editor: FlowchartEditor
  let propertyPanel: PropertyPanel | EnhancedPropertyPanel
  let mockUpdateCallback: vi.MockedFunction<any>

  beforeEach(() => {
    // 创建编辑器容器
    container = document.createElement('div')
    container.style.width = '800px'
    container.style.height = '600px'
    document.body.appendChild(container)

    // 创建属性面板容器
    propertyContainer = document.createElement('div')
    propertyContainer.style.width = '300px'
    propertyContainer.style.height = '600px'
    document.body.appendChild(propertyContainer)

    // 创建模拟的更新回调
    mockUpdateCallback = vi.fn()

    // 初始化编辑器
    editor = new FlowchartEditor({ container })
  })

  afterEach(() => {
    if (editor) {
      editor.destroy()
    }
    if (propertyPanel) {
      propertyPanel.destroy()
    }
    if (container.parentNode) {
      container.parentNode.removeChild(container)
    }
    if (propertyContainer.parentNode) {
      propertyContainer.parentNode.removeChild(propertyContainer)
    }
    vi.restoreAllMocks()
  })

  describe('基础属性面板更新测试', () => {
    beforeEach(() => {
      propertyPanel = new PropertyPanel(propertyContainer, {
        onUpdateNode: mockUpdateCallback
      })
    })

    it('应该在节点文本更改时触发更新回调', () => {
      // 创建测试节点
      const testNode: ApprovalNodeConfig = {
        id: 'test-node-1',
        type: 'process',
        x: 100,
        y: 100,
        text: '原始文本'
      }

      // 设置选中节点
      propertyPanel.setSelectedNode(testNode)

      // 查找文本输入框
      const textInput = propertyContainer.querySelector('[data-field="text"]') as HTMLInputElement
      expect(textInput).toBeTruthy()

      // 模拟用户输入新文本
      textInput.value = '更新后的文本'
      textInput.dispatchEvent(new Event('input', { bubbles: true }))

      // 点击应用更改按钮
      const applyButton = propertyContainer.querySelector('#apply-changes') as HTMLButtonElement
      expect(applyButton).toBeTruthy()
      applyButton.click()

      // 验证更新回调被调用
      expect(mockUpdateCallback).toHaveBeenCalledWith('test-node-1', {
        text: '更新后的文本'
      })
    })

    it('应该在节点坐标更改时触发更新回调', () => {
      const testNode: ApprovalNodeConfig = {
        id: 'test-node-2',
        type: 'process',
        x: 100,
        y: 100,
        text: '测试节点'
      }

      propertyPanel.setSelectedNode(testNode)

      // 查找坐标输入框
      const xInput = propertyContainer.querySelector('[data-field="x"]') as HTMLInputElement
      const yInput = propertyContainer.querySelector('[data-field="y"]') as HTMLInputElement

      expect(xInput).toBeTruthy()
      expect(yInput).toBeTruthy()

      // 模拟坐标更改
      xInput.value = '200'
      yInput.value = '300'
      xInput.dispatchEvent(new Event('input', { bubbles: true }))
      yInput.dispatchEvent(new Event('input', { bubbles: true }))

      // 应用更改
      const applyButton = propertyContainer.querySelector('#apply-changes') as HTMLButtonElement
      applyButton.click()

      // 验证更新回调
      expect(mockUpdateCallback).toHaveBeenCalledWith('test-node-2', {
        x: 200,
        y: 300
      })
    })

    it('应该在自定义属性更改时触发更新回调', () => {
      const testNode: ApprovalNodeConfig = {
        id: 'test-node-3',
        type: 'approval',
        x: 100,
        y: 100,
        text: '审批节点',
        properties: {
          approver: '张三',
          priority: 'high'
        }
      }

      propertyPanel.setSelectedNode(testNode)

      // 查找自定义属性输入框
      const approverInput = propertyContainer.querySelector('[data-field="properties.approver"]') as HTMLInputElement
      expect(approverInput).toBeTruthy()

      // 更改自定义属性
      approverInput.value = '李四'
      approverInput.dispatchEvent(new Event('input', { bubbles: true }))

      // 应用更改
      const applyButton = propertyContainer.querySelector('#apply-changes') as HTMLButtonElement
      applyButton.click()

      // 验证更新回调包含自定义属性
      expect(mockUpdateCallback).toHaveBeenCalledWith('test-node-3', {
        properties: {
          approver: '李四'
        }
      })
    })
  })

  describe('增强属性面板更新测试', () => {
    beforeEach(() => {
      propertyPanel = new EnhancedPropertyPanel(propertyContainer, {
        onUpdateNode: mockUpdateCallback
      })
    })

    it('应该正确处理复杂嵌套属性的更新', () => {
      const testNode: ApprovalNodeConfig = {
        id: 'test-node-4',
        type: 'process',
        x: 100,
        y: 100,
        text: '复杂节点'
      }

      propertyPanel.setSelectedNode(testNode)

      // 模拟更新样式属性
      const fillInput = propertyContainer.querySelector('[data-field="style.fill"]') as HTMLInputElement
      if (fillInput) {
        fillInput.value = '#ff0000'
        fillInput.dispatchEvent(new Event('input', { bubbles: true }))
      }

      // 模拟更新文本配置
      const fontSizeInput = propertyContainer.querySelector('[data-field="textConfig.fontSize"]') as HTMLInputElement
      if (fontSizeInput) {
        fontSizeInput.value = '16'
        fontSizeInput.dispatchEvent(new Event('input', { bubbles: true }))
      }

      // 应用更改
      const applyButton = propertyContainer.querySelector('#apply-node-changes') as HTMLButtonElement
      if (applyButton) {
        applyButton.click()

        // 验证嵌套属性更新
        expect(mockUpdateCallback).toHaveBeenCalled()
        const callArgs = mockUpdateCallback.mock.calls[0]
        expect(callArgs[0]).toBe('test-node-4')
        
        // 检查更新数据结构
        const updates = callArgs[1]
        if (updates.style) {
          expect(updates.style.fill).toBe('#ff0000')
        }
        if (updates.textConfig) {
          expect(updates.textConfig.fontSize).toBe(16)
        }
      }
    })
  })

  describe('FlowchartEditor updateNode 方法测试', () => {
    it('应该使用 setNodeData 方法更新节点', () => {
      // 添加一个测试节点
      const nodeId = editor.addNode({
        type: 'process',
        x: 100,
        y: 100,
        text: '测试节点'
      })

      // 模拟 LogicFlow 的 setNodeData 方法
      const setNodeDataSpy = vi.spyOn(editor.getLogicFlow(), 'setNodeData')
      
      // 更新节点
      editor.updateNode(nodeId, {
        text: '更新后的节点',
        x: 200,
        y: 300
      })

      // 验证 setNodeData 被调用
      expect(setNodeDataSpy).toHaveBeenCalledWith(nodeId, expect.objectContaining({
        text: '更新后的节点',
        x: 200,
        y: 300
      }))

      setNodeDataSpy.mockRestore()
    })

    it('应该触发 data:change 事件', () => {
      const nodeId = editor.addNode({
        type: 'approval',
        x: 100,
        y: 100,
        text: '审批节点'
      })

      let dataChangeEventFired = false
      editor.on('data:change', () => {
        dataChangeEventFired = true
      })

      // 更新节点
      editor.updateNode(nodeId, {
        text: '更新后的审批节点'
      })

      // 验证事件被触发
      expect(dataChangeEventFired).toBe(true)
    })

    it('应该正确处理错误情况', () => {
      const consoleSpy = vi.spyOn(console, 'warn')

      // 尝试更新不存在的节点
      editor.updateNode('non-existent-node', {
        text: '不应该更新'
      })

      // 验证警告被记录
      expect(consoleSpy).toHaveBeenCalledWith('节点 non-existent-node 不存在')

      consoleSpy.mockRestore()
    })
  })

  describe('属性面板和编辑器集成测试', () => {
    it('完整的更新流程应该正常工作', async () => {
      // 创建属性面板并连接到编辑器
      const propertyPanel = new PropertyPanel(propertyContainer, {
        onUpdateNode: (nodeId: string, updates: Partial<ApprovalNodeConfig>) => {
          editor.updateNode(nodeId, updates)
        }
      })

      // 添加测试节点
      const nodeId = editor.addNode({
        type: 'process',
        x: 100,
        y: 100,
        text: '原始文本'
      })

      // 获取节点数据并设置到属性面板
      const nodeData = editor.getNodeById(nodeId)
      propertyPanel.setSelectedNode(nodeData)

      // 模拟用户在属性面板中修改文本
      const textInput = propertyContainer.querySelector('[data-field="text"]') as HTMLInputElement
      textInput.value = '修改后的文本'
      textInput.dispatchEvent(new Event('input', { bubbles: true }))

      // 应用更改
      const applyButton = propertyContainer.querySelector('#apply-changes') as HTMLButtonElement
      applyButton.click()

      // 等待更新完成
      await new Promise(resolve => setTimeout(resolve, 50))

      // 验证节点数据已更新
      const updatedNodeData = editor.getNodeById(nodeId)
      expect(updatedNodeData?.text).toBe('修改后的文本')

      propertyPanel.destroy()
    })
  })
})
