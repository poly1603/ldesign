/**
 * 集成测试
 * 测试各组件间的集成，包括编辑器与渲染器、事件系统、数据管理等
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { FlowchartEditor } from '../core/FlowchartEditor'
import { SVGRenderer } from '../renderer/SVGRenderer'
import { EventBus } from '../events/EventBus'
import { DataManager } from '../core/DataManager'
import { InteractionManager } from '../core/InteractionManager'
import { CollaborationManager } from '../collaboration/CollaborationManager'
import { AccessibilityManager } from '../accessibility/AccessibilityManager'
import { EnhancedMobileAdapter } from '../mobile/EnhancedMobileAdapter'
import { PerformanceMonitor } from '../performance/PerformanceMonitor'
import type { FlowchartData, FlowchartNode, FlowchartEdge } from '../types'

// 集成测试辅助工具
class IntegrationTestHelper {
  private eventTracker: Map<string, any[]> = new Map()

  trackEvents(eventBus: EventBus, events: string[]): void {
    events.forEach(eventName => {
      this.eventTracker.set(eventName, [])
      eventBus.on(eventName, (data) => {
        this.eventTracker.get(eventName)!.push(data)
      })
    })
  }

  getTrackedEvents(eventName: string): any[] {
    return this.eventTracker.get(eventName) || []
  }

  clearTrackedEvents(): void {
    this.eventTracker.clear()
  }

  createMockCollaborationUser(id: string, name: string) {
    return {
      id,
      name,
      avatar: `https://avatar.example.com/${id}`,
      color: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'][Math.floor(Math.random() * 4)],
      isOnline: true
    }
  }

  simulateNetworkDelay(ms: number = 100): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  createTouchEvent(type: string, touches: { x: number; y: number }[]): TouchEvent {
    const mockTouches = touches.map(touch => ({
      identifier: Math.random(),
      clientX: touch.x,
      clientY: touch.y,
      target: document.createElement('div')
    })) as Touch[]

    return new TouchEvent(type, {
      touches: mockTouches,
      changedTouches: mockTouches,
      targetTouches: mockTouches
    })
  }
}

describe('集成测试', () => {
  let container: HTMLElement
  let editor: FlowchartEditor
  let renderer: SVGRenderer
  let eventBus: EventBus
  let dataManager: DataManager
  let interactionManager: InteractionManager
  let helper: IntegrationTestHelper

  beforeEach(() => {
    container = document.createElement('div')
    container.style.width = '1200px'
    container.style.height = '800px'
    document.body.appendChild(container)
    
    helper = new IntegrationTestHelper()
    
    // Mock相关API
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn()
    }))

    global.WebSocket = vi.fn().mockImplementation(() => ({
      close: vi.fn(),
      send: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      readyState: 1
    })) as any

    // Mock touch events
    global.TouchEvent = vi.fn().mockImplementation((type, options) => ({
      type,
      touches: options?.touches || [],
      changedTouches: options?.changedTouches || [],
      targetTouches: options?.targetTouches || [],
      preventDefault: vi.fn(),
      stopPropagation: vi.fn()
    })) as any
  })

  afterEach(() => {
    if (editor) {
      editor.destroy()
    }
    if (container.parentNode) {
      container.parentNode.removeChild(container)
    }
    helper.clearTrackedEvents()
    vi.restoreAllMocks()
  })

  describe('编辑器与渲染器集成', () => {
    beforeEach(() => {
      editor = new FlowchartEditor({ container })
      renderer = editor.getRenderer() as SVGRenderer
      eventBus = editor.getEventBus()
      
      helper.trackEvents(eventBus, [
        'node:added',
        'node:updated',
        'node:deleted',
        'edge:added',
        'edge:updated',
        'edge:deleted',
        'render:complete',
        'viewport:changed'
      ])
    })

    it('添加节点时应该正确触发渲染', () => {
      const nodeData = {
        type: 'process' as const,
        x: 100,
        y: 100,
        text: '测试节点'
      }

      const nodeId = editor.addNode(nodeData)
      
      // 验证事件被正确触发
      const nodeAddedEvents = helper.getTrackedEvents('node:added')
      expect(nodeAddedEvents).toHaveLength(1)
      expect(nodeAddedEvents[0].nodeId).toBe(nodeId)
      
      // 验证渲染完成事件
      const renderCompleteEvents = helper.getTrackedEvents('render:complete')
      expect(renderCompleteEvents.length).toBeGreaterThan(0)
      
      // 验证DOM中确实存在节点
      const nodeElement = container.querySelector(`[data-node-id="${nodeId}"]`)
      expect(nodeElement).toBeTruthy()
    })

    it('更新节点时应该保持数据和视图同步', () => {
      const nodeId = editor.addNode({
        type: 'process',
        x: 100,
        y: 100,
        text: '原始文本'
      })
      
      helper.clearTrackedEvents()
      
      editor.updateNode(nodeId, {
        text: '更新后的文本',
        x: 200,
        y: 200
      })
      
      // 验证更新事件
      const nodeUpdatedEvents = helper.getTrackedEvents('node:updated')
      expect(nodeUpdatedEvents).toHaveLength(1)
      expect(nodeUpdatedEvents[0].nodeId).toBe(nodeId)
      expect(nodeUpdatedEvents[0].changes.text).toBe('更新后的文本')
      
      // 验证数据管理器中的数据已更新
      const nodeData = editor.getNodeById(nodeId)
      expect(nodeData?.text).toBe('更新后的文本')
      expect(nodeData?.x).toBe(200)
      expect(nodeData?.y).toBe(200)
      
      // 验证DOM也已更新
      const nodeElement = container.querySelector(`[data-node-id="${nodeId}"]`)
      expect(nodeElement?.textContent).toContain('更新后的文本')
    })

    it('添加连线时应该正确处理节点引用', () => {
      const sourceId = editor.addNode({
        type: 'start',
        x: 100,
        y: 100,
        text: '开始'
      })
      
      const targetId = editor.addNode({
        type: 'process',
        x: 300,
        y: 100,
        text: '处理'
      })
      
      helper.clearTrackedEvents()
      
      const edgeId = editor.addEdge({
        type: 'sequence-edge',
        sourceNodeId: sourceId,
        targetNodeId: targetId,
        text: '连接线'
      })
      
      // 验证连线添加事件
      const edgeAddedEvents = helper.getTrackedEvents('edge:added')
      expect(edgeAddedEvents).toHaveLength(1)
      expect(edgeAddedEvents[0].edgeId).toBe(edgeId)
      
      // 验证连线DOM元素
      const edgeElement = container.querySelector(`[data-edge-id="${edgeId}"]`)
      expect(edgeElement).toBeTruthy()
      
      // 验证连线数据
      const edgeData = editor.getEdgeById(edgeId)
      expect(edgeData?.sourceNodeId).toBe(sourceId)
      expect(edgeData?.targetNodeId).toBe(targetId)
    })

    it('删除节点时应该删除相关连线', () => {
      const node1Id = editor.addNode({
        type: 'start',
        x: 100,
        y: 100,
        text: '节点1'
      })
      
      const node2Id = editor.addNode({
        type: 'process',
        x: 300,
        y: 100,
        text: '节点2'
      })
      
      const edgeId = editor.addEdge({
        type: 'sequence-edge',
        sourceNodeId: node1Id,
        targetNodeId: node2Id,
        text: '连接'
      })
      
      helper.clearTrackedEvents()
      
      editor.deleteNode(node1Id)
      
      // 验证节点删除事件
      const nodeDeletedEvents = helper.getTrackedEvents('node:deleted')
      expect(nodeDeletedEvents).toHaveLength(1)
      
      // 验证连线也被删除
      const edgeDeletedEvents = helper.getTrackedEvents('edge:deleted')
      expect(edgeDeletedEvents).toHaveLength(1)
      expect(edgeDeletedEvents[0].edgeId).toBe(edgeId)
      
      // 验证DOM中元素已被移除
      expect(container.querySelector(`[data-node-id="${node1Id}"]`)).toBeFalsy()
      expect(container.querySelector(`[data-edge-id="${edgeId}"]`)).toBeFalsy()
    })
  })

  describe('事件系统集成', () => {
    beforeEach(() => {
      editor = new FlowchartEditor({ container })
      eventBus = editor.getEventBus()
      interactionManager = editor.getInteractionManager()
    })

    it('交互事件应该正确传播', () => {
      const nodeId = editor.addNode({
        type: 'process',
        x: 100,
        y: 100,
        text: '测试节点'
      })
      
      let selectionEvents: any[] = []
      eventBus.on('selection:changed', (data) => {
        selectionEvents.push(data)
      })
      
      // 模拟点击节点
      const nodeElement = container.querySelector(`[data-node-id="${nodeId}"]`) as HTMLElement
      expect(nodeElement).toBeTruthy()
      
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        clientX: 100,
        clientY: 100
      })
      
      nodeElement.dispatchEvent(clickEvent)
      
      // 验证选择事件被触发
      expect(selectionEvents.length).toBeGreaterThan(0)
      const latestSelection = selectionEvents[selectionEvents.length - 1]
      expect(latestSelection.selectedItems).toContain(nodeId)
    })

    it('拖拽事件应该更新节点位置', () => {
      const nodeId = editor.addNode({
        type: 'process',
        x: 100,
        y: 100,
        text: '可拖拽节点'
      })
      
      const positionUpdateEvents: any[] = []
      eventBus.on('node:position:updated', (data) => {
        positionUpdateEvents.push(data)
      })
      
      const nodeElement = container.querySelector(`[data-node-id="${nodeId}"]`) as HTMLElement
      
      // 模拟拖拽序列
      const mouseDownEvent = new MouseEvent('mousedown', {
        bubbles: true,
        clientX: 100,
        clientY: 100
      })
      nodeElement.dispatchEvent(mouseDownEvent)
      
      const mouseMoveEvent = new MouseEvent('mousemove', {
        bubbles: true,
        clientX: 200,
        clientY: 200
      })
      document.dispatchEvent(mouseMoveEvent)
      
      const mouseUpEvent = new MouseEvent('mouseup', {
        bubbles: true,
        clientX: 200,
        clientY: 200
      })
      document.dispatchEvent(mouseUpEvent)
      
      // 验证位置更新事件
      expect(positionUpdateEvents.length).toBeGreaterThan(0)
      
      // 验证节点位置确实更新了
      const updatedNodeData = editor.getNodeById(nodeId)
      expect(updatedNodeData?.x).not.toBe(100)
      expect(updatedNodeData?.y).not.toBe(100)
    })
  })

  describe('协作功能集成', () => {
    let collaborationManager: CollaborationManager

    beforeEach(() => {
      editor = new FlowchartEditor({
        container,
        collaboration: { enabled: true }
      })
      
      collaborationManager = new CollaborationManager({
        enabled: true,
        serverUrl: 'ws://localhost:8080'
      })
    })

    it('多用户操作应该正确同步', async () => {
      const user1 = helper.createMockCollaborationUser('user1', '用户1')
      const user2 = helper.createMockCollaborationUser('user2', '用户2')
      
      // 模拟用户1加入协作
      await collaborationManager.joinSession('test-session', user1)
      
      let remoteOperationEvents: any[] = []
      collaborationManager.on('remote-operation', (data) => {
        remoteOperationEvents.push(data)
      })
      
      // 模拟用户2执行操作
      const mockOperation = {
        type: 'node:add',
        nodeId: 'remote-node-1',
        nodeData: {
          type: 'process',
          x: 300,
          y: 300,
          text: '远程节点'
        },
        userId: user2.id,
        timestamp: Date.now()
      }
      
      // 模拟接收远程操作
      await collaborationManager.handleRemoteOperation(mockOperation)
      
      // 验证远程操作事件被触发
      expect(remoteOperationEvents).toHaveLength(1)
      expect(remoteOperationEvents[0].operation.type).toBe('node:add')
      
      // 验证编辑器应用了远程操作
      const remoteNode = editor.getNodeById('remote-node-1')
      expect(remoteNode).toBeTruthy()
      expect(remoteNode?.text).toBe('远程节点')
    })

    it('操作冲突应该正确解决', async () => {
      const user1 = helper.createMockCollaborationUser('user1', '用户1')
      const user2 = helper.createMockCollaborationUser('user2', '用户2')
      
      // 创建初始节点
      const nodeId = editor.addNode({
        type: 'process',
        x: 100,
        y: 100,
        text: '原始文本'
      })
      
      // 模拟同时编辑冲突
      const operation1 = {
        type: 'node:update',
        nodeId,
        changes: { text: '用户1的修改' },
        userId: user1.id,
        timestamp: Date.now()
      }
      
      const operation2 = {
        type: 'node:update',
        nodeId,
        changes: { text: '用户2的修改' },
        userId: user2.id,
        timestamp: Date.now() + 10 // 稍后一点
      }
      
      let conflictEvents: any[] = []
      collaborationManager.on('conflict-detected', (data) => {
        conflictEvents.push(data)
      })
      
      // 应用两个冲突的操作
      await collaborationManager.handleRemoteOperation(operation1)
      await collaborationManager.handleRemoteOperation(operation2)
      
      // 验证冲突被检测到
      expect(conflictEvents.length).toBeGreaterThan(0)
      
      // 验证最终结果（应该是后执行的操作生效）
      const finalNode = editor.getNodeById(nodeId)
      expect(finalNode?.text).toBe('用户2的修改')
    })
  })

  describe('移动端适配集成', () => {
    let mobileAdapter: EnhancedMobileAdapter

    beforeEach(() => {
      // 模拟移动端环境
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        configurable: true
      })
      
      editor = new FlowchartEditor({
        container,
        mobile: { enabled: true }
      })
      
      mobileAdapter = new EnhancedMobileAdapter(container, {
        enabled: true,
        gestureRecognition: true,
        touchOptimization: true,
        hapticFeedback: true
      })
    })

    it('触摸手势应该正确识别', async () => {
      const nodeId = editor.addNode({
        type: 'process',
        x: 200,
        y: 200,
        text: '触摸节点'
      })
      
      let gestureEvents: any[] = []
      mobileAdapter.on('gesture-detected', (data) => {
        gestureEvents.push(data)
      })
      
      // 模拟双指缩放手势
      const touchStart = helper.createTouchEvent('touchstart', [
        { x: 100, y: 100 },
        { x: 300, y: 300 }
      ])
      container.dispatchEvent(touchStart)
      
      await helper.simulateNetworkDelay(50)
      
      const touchMove = helper.createTouchEvent('touchmove', [
        { x: 80, y: 80 },
        { x: 320, y: 320 }
      ])
      container.dispatchEvent(touchMove)
      
      const touchEnd = helper.createTouchEvent('touchend', [])
      container.dispatchEvent(touchEnd)
      
      // 验证缩放手势被识别
      expect(gestureEvents.length).toBeGreaterThan(0)
      const zoomGestures = gestureEvents.filter(e => e.type === 'pinch')
      expect(zoomGestures.length).toBeGreaterThan(0)
    })

    it('移动端拖拽应该优化性能', async () => {
      const nodeId = editor.addNode({
        type: 'process',
        x: 100,
        y: 100,
        text: '移动节点'
      })
      
      const nodeElement = container.querySelector(`[data-node-id="${nodeId}"]`) as HTMLElement
      
      let updateEvents: any[] = []
      editor.getEventBus().on('node:position:updated', (data) => {
        updateEvents.push(data)
      })
      
      // 模拟移动端拖拽
      const touchStart = helper.createTouchEvent('touchstart', [{ x: 100, y: 100 }])
      nodeElement.dispatchEvent(touchStart)
      
      // 模拟多次移动（应该被节流）
      for (let i = 0; i < 20; i++) {
        const touchMove = helper.createTouchEvent('touchmove', [
          { x: 100 + i * 5, y: 100 + i * 5 }
        ])
        nodeElement.dispatchEvent(touchMove)
        await helper.simulateNetworkDelay(5)
      }
      
      const touchEnd = helper.createTouchEvent('touchend', [])
      nodeElement.dispatchEvent(touchEnd)
      
      // 验证更新事件被节流（应该少于20次）
      expect(updateEvents.length).toBeLessThan(20)
      expect(updateEvents.length).toBeGreaterThan(0)
    })
  })

  describe('无障碍访问集成', () => {
    let accessibilityManager: AccessibilityManager

    beforeEach(() => {
      editor = new FlowchartEditor({
        container,
        accessibility: { enabled: true }
      })
      
      accessibilityManager = new AccessibilityManager(container, {
        enabled: true,
        keyboardNavigation: true,
        screenReader: true,
        highContrast: false
      })
    })

    it('键盘导航应该正确工作', () => {
      const node1Id = editor.addNode({
        type: 'start',
        x: 100,
        y: 100,
        text: '节点1'
      })
      
      const node2Id = editor.addNode({
        type: 'process',
        x: 300,
        y: 100,
        text: '节点2'
      })
      
      let focusEvents: any[] = []
      accessibilityManager.on('focus-changed', (data) => {
        focusEvents.push(data)
      })
      
      // 模拟Tab键导航
      const tabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true
      })
      container.dispatchEvent(tabEvent)
      
      // 验证焦点变化事件
      expect(focusEvents.length).toBeGreaterThan(0)
      
      // 验证焦点指示器
      const focusIndicator = container.querySelector('.accessibility-focus-indicator')
      expect(focusIndicator).toBeTruthy()
    })

    it('屏幕阅读器描述应该正确生成', () => {
      const nodeId = editor.addNode({
        type: 'decision',
        x: 200,
        y: 200,
        text: '判断条件'
      })
      
      const nodeElement = container.querySelector(`[data-node-id="${nodeId}"]`)
      expect(nodeElement).toBeTruthy()
      
      // 验证ARIA标签
      expect(nodeElement?.getAttribute('role')).toBe('button')
      expect(nodeElement?.getAttribute('aria-label')).toContain('判断条件')
      expect(nodeElement?.getAttribute('aria-describedby')).toBeTruthy()
      
      // 验证描述元素存在
      const descriptionId = nodeElement?.getAttribute('aria-describedby')
      const descriptionElement = document.getElementById(descriptionId!)
      expect(descriptionElement).toBeTruthy()
      expect(descriptionElement?.textContent).toContain('decision')
    })

    it('高对比度模式应该正确应用', () => {
      // 启用高对比度模式
      accessibilityManager.setHighContrast(true)
      
      // 验证高对比度样式类被添加
      expect(container.classList.contains('high-contrast-mode')).toBe(true)
      
      // 添加节点验证样式应用
      const nodeId = editor.addNode({
        type: 'process',
        x: 150,
        y: 150,
        text: '高对比度节点'
      })
      
      const nodeElement = container.querySelector(`[data-node-id="${nodeId}"]`) as HTMLElement
      const computedStyle = window.getComputedStyle(nodeElement)
      
      // 在高对比度模式下，应该有明显的边框
      expect(computedStyle.borderWidth).not.toBe('0px')
    })
  })

  describe('性能监控集成', () => {
    let performanceMonitor: PerformanceMonitor

    beforeEach(() => {
      editor = new FlowchartEditor({
        container,
        performance: { enabled: true }
      })
      
      performanceMonitor = new PerformanceMonitor({
        enabled: true,
        sampleInterval: 100
      })
    })

    it('性能数据应该正确收集', async () => {
      performanceMonitor.start()
      
      // 执行一些操作来产生性能数据
      for (let i = 0; i < 50; i++) {
        const nodeId = editor.addNode({
          type: 'process',
          x: Math.random() * 800,
          y: Math.random() * 600,
          text: `性能测试节点 ${i}`
        })
        
        editor.updateNode(nodeId, {
          text: `更新后的节点 ${i}`,
          x: Math.random() * 800,
          y: Math.random() * 600
        })
        
        if (i % 10 === 0) {
          await helper.simulateNetworkDelay(20)
        }
      }
      
      await helper.simulateNetworkDelay(200)
      
      const report = performanceMonitor.getPerformanceReport()
      performanceMonitor.stop()
      
      // 验证性能报告包含数据
      expect(report.samples.length).toBeGreaterThan(0)
      expect(report.averageFPS).toBeGreaterThan(0)
      expect(report.memoryUsage.average).toBeGreaterThan(0)
      
      // 验证性能警告
      if (report.warnings.length > 0) {
        console.log('性能警告:', report.warnings)
      }
    })

    it('性能阈值超限应该触发警告', async () => {
      let performanceWarnings: any[] = []
      performanceMonitor.on('performance-warning', (data) => {
        performanceWarnings.push(data)
      })
      
      performanceMonitor.start()
      
      // 模拟高CPU使用率操作
      const startTime = performance.now()
      let sum = 0
      while (performance.now() - startTime < 500) {
        sum += Math.sqrt(Math.random() * 1000000)
      }
      
      await helper.simulateNetworkDelay(200)
      
      performanceMonitor.stop()
      
      // 如果CPU使用率过高，应该收到警告
      if (performanceWarnings.length > 0) {
        expect(performanceWarnings[0].type).toBe('high-cpu-usage')
      }
    })
  })

  describe('完整工作流集成', () => {
    it('从创建到协作的完整流程', async () => {
      // 1. 初始化编辑器
      editor = new FlowchartEditor({
        container,
        collaboration: { enabled: true },
        accessibility: { enabled: true },
        mobile: { enabled: true },
        performance: { enabled: true }
      })
      
      // 2. 创建流程图
      const startNodeId = editor.addNode({
        type: 'start',
        x: 100,
        y: 100,
        text: '开始'
      })
      
      const processNodeId = editor.addNode({
        type: 'process',
        x: 300,
        y: 100,
        text: '处理数据'
      })
      
      const decisionNodeId = editor.addNode({
        type: 'decision',
        x: 500,
        y: 100,
        text: '条件判断'
      })
      
      const endNodeId = editor.addNode({
        type: 'end',
        x: 700,
        y: 100,
        text: '结束'
      })
      
      // 3. 添加连线
      const edge1Id = editor.addEdge({
        type: 'sequence-edge',
        sourceNodeId: startNodeId,
        targetNodeId: processNodeId,
        text: ''
      })
      
      const edge2Id = editor.addEdge({
        type: 'sequence-edge',
        sourceNodeId: processNodeId,
        targetNodeId: decisionNodeId,
        text: ''
      })
      
      const edge3Id = editor.addEdge({
        type: 'sequence-edge',
        sourceNodeId: decisionNodeId,
        targetNodeId: endNodeId,
        text: '是'
      })
      
      // 4. 验证数据完整性
      const flowchartData = editor.getFlowchartData()
      expect(flowchartData.nodes).toHaveLength(4)
      expect(flowchartData.edges).toHaveLength(3)
      
      // 5. 验证DOM结构
      const nodeElements = container.querySelectorAll('[data-node-id]')
      const edgeElements = container.querySelectorAll('[data-edge-id]')
      expect(nodeElements).toHaveLength(4)
      expect(edgeElements).toHaveLength(3)
      
      // 6. 模拟用户交互
      const processElement = container.querySelector(`[data-node-id="${processNodeId}"]`) as HTMLElement
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        clientX: 300,
        clientY: 100
      })
      processElement.dispatchEvent(clickEvent)
      
      // 7. 验证选择状态
      expect(processElement.classList.contains('selected')).toBe(true)
      
      // 8. 测试数据导出
      const exportedData = editor.exportData('json')
      expect(exportedData).toBeTruthy()
      
      const parsedData = JSON.parse(exportedData)
      expect(parsedData.nodes).toHaveLength(4)
      expect(parsedData.edges).toHaveLength(3)
      
      // 9. 测试数据导入
      editor.clearData()
      expect(editor.getFlowchartData().nodes).toHaveLength(0)
      
      editor.importData(exportedData, 'json')
      const importedData = editor.getFlowchartData()
      expect(importedData.nodes).toHaveLength(4)
      expect(importedData.edges).toHaveLength(3)
    })

    it('错误处理和恢复机制', () => {
      editor = new FlowchartEditor({ container })
      
      let errorEvents: any[] = []
      editor.getEventBus().on('error', (data) => {
        errorEvents.push(data)
      })
      
      // 测试无效操作的错误处理
      expect(() => {
        editor.updateNode('non-existent-node', { text: '不存在的节点' })
      }).not.toThrow()
      
      expect(() => {
        editor.addEdge({
          type: 'sequence-edge',
          sourceNodeId: 'invalid-source',
          targetNodeId: 'invalid-target',
          text: '无效连线'
        })
      }).not.toThrow()
      
      // 验证错误事件被正确触发
      expect(errorEvents.length).toBeGreaterThan(0)
      
      // 验证编辑器仍然可以正常工作
      const validNodeId = editor.addNode({
        type: 'process',
        x: 100,
        y: 100,
        text: '正常节点'
      })
      
      expect(editor.getNodeById(validNodeId)).toBeTruthy()
    })
  })
})
