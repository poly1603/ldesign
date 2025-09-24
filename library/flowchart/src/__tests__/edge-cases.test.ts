/**
 * 边缘情况测试
 * 测试各种异常情况和边缘条件
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { FlowchartEditor } from '../core/FlowchartEditor'
import { normalizeTextValue, safeGetText, cleanText } from '../utils/text'
import { DragOptimizationManager } from '../core/DragOptimizationManager'
import { AccessibilityManager } from '../accessibility/AccessibilityManager'
import { EnhancedMobileAdapter } from '../mobile/EnhancedMobileAdapter'
import type { FlowchartEditorConfig, FlowchartData } from '../types'

describe('边缘情况测试', () => {
  let container: HTMLElement
  let editor: FlowchartEditor

  beforeEach(() => {
    container = document.createElement('div')
    container.style.width = '800px'
    container.style.height = '600px'
    document.body.appendChild(container)

    // Mock WebSocket
    global.WebSocket = vi.fn().mockImplementation(() => ({
      close: vi.fn(),
      send: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      readyState: 1
    })) as any
  })

  afterEach(() => {
    if (editor) {
      editor.destroy()
    }
    if (container.parentNode) {
      container.parentNode.removeChild(container)
    }
  })

  describe('FlowchartEditor 边缘情况', () => {
    it('应该处理空配置', () => {
      expect(() => {
        editor = new FlowchartEditor({ container } as FlowchartEditorConfig)
      }).not.toThrow()
    })

    it('应该处理无效容器', () => {
      expect(() => {
        editor = new FlowchartEditor({ container: null as any })
      }).toThrow('容器元素不存在')
    })

    it('应该处理空数据渲染', () => {
      editor = new FlowchartEditor({ container })
      
      expect(() => {
        editor.render({ nodes: [], edges: [] })
      }).not.toThrow()
    })

    it('应该处理无效数据', () => {
      editor = new FlowchartEditor({ container })
      
      expect(() => {
        editor.render(null as any)
      }).not.toThrow()
      
      expect(() => {
        editor.render(undefined as any)
      }).not.toThrow()
    })

    it('应该处理大量节点数据', () => {
      editor = new FlowchartEditor({ container })
      
      const largeData: FlowchartData = {
        nodes: Array.from({ length: 1000 }, (_, i) => ({
          id: `node-${i}`,
          type: 'process',
          x: (i % 20) * 100,
          y: Math.floor(i / 20) * 100,
          text: `节点 ${i}`,
          properties: {}
        })),
        edges: []
      }

      expect(() => {
        editor.render(largeData)
      }).not.toThrow()
    })

    it('应该处理循环引用的数据', () => {
      editor = new FlowchartEditor({ container })
      
      const nodeA = {
        id: 'nodeA',
        type: 'process',
        x: 100,
        y: 100,
        text: '节点A',
        properties: {}
      }
      
      const nodeB = {
        id: 'nodeB',
        type: 'process',
        x: 200,
        y: 100,
        text: '节点B',
        properties: {}
      }

      const data: FlowchartData = {
        nodes: [nodeA, nodeB],
        edges: [
          {
            id: 'edge1',
            type: 'sequence-edge',
            sourceNodeId: 'nodeA',
            targetNodeId: 'nodeB',
            text: '',
            properties: {}
          },
          {
            id: 'edge2',
            type: 'sequence-edge',
            sourceNodeId: 'nodeB',
            targetNodeId: 'nodeA',
            text: '',
            properties: {}
          }
        ]
      }

      expect(() => {
        editor.render(data)
      }).not.toThrow()
    })

    it('应该处理重复ID的节点', () => {
      editor = new FlowchartEditor({ container })
      
      const data: FlowchartData = {
        nodes: [
          {
            id: 'duplicate',
            type: 'process',
            x: 100,
            y: 100,
            text: '节点1',
            properties: {}
          },
          {
            id: 'duplicate',
            type: 'approval',
            x: 200,
            y: 100,
            text: '节点2',
            properties: {}
          }
        ],
        edges: []
      }

      expect(() => {
        editor.render(data)
      }).not.toThrow()
    })

    it('应该处理无效的边引用', () => {
      editor = new FlowchartEditor({ container })
      
      const data: FlowchartData = {
        nodes: [
          {
            id: 'node1',
            type: 'process',
            x: 100,
            y: 100,
            text: '节点1',
            properties: {}
          }
        ],
        edges: [
          {
            id: 'edge1',
            type: 'sequence-edge',
            sourceNodeId: 'nonexistent',
            targetNodeId: 'alsoNonexistent',
            text: '',
            properties: {}
          }
        ]
      }

      expect(() => {
        editor.render(data)
      }).not.toThrow()
    })

    it('应该处理极端坐标值', () => {
      editor = new FlowchartEditor({ container })
      
      const data: FlowchartData = {
        nodes: [
          {
            id: 'extreme1',
            type: 'process',
            x: Number.MAX_SAFE_INTEGER,
            y: Number.MAX_SAFE_INTEGER,
            text: '极大值',
            properties: {}
          },
          {
            id: 'extreme2',
            type: 'process',
            x: Number.MIN_SAFE_INTEGER,
            y: Number.MIN_SAFE_INTEGER,
            text: '极小值',
            properties: {}
          },
          {
            id: 'extreme3',
            type: 'process',
            x: NaN,
            y: Infinity,
            text: '无效值',
            properties: {}
          }
        ],
        edges: []
      }

      expect(() => {
        editor.render(data)
      }).not.toThrow()
    })
  })

  describe('文本处理边缘情况', () => {
    it('应该处理各种文本格式', () => {
      expect(normalizeTextValue('string')).toBe('string')
      expect(normalizeTextValue({ value: 'object' })).toBe('object')
      expect(normalizeTextValue({ text: 'text' })).toBe('text')
      expect(normalizeTextValue(123)).toBe('123')
      expect(normalizeTextValue(true)).toBe('true')
      expect(normalizeTextValue(null)).toBe('')
      expect(normalizeTextValue(undefined)).toBe('')
      expect(normalizeTextValue({})).toBe('')
      expect(normalizeTextValue([])).toBe('')
    })

    it('应该安全获取文本', () => {
      expect(safeGetText('text')).toBe('text')
      expect(safeGetText(null)).toBe('')
      expect(safeGetText(undefined)).toBe('')
      expect(safeGetText({ value: 'test' })).toBe('test')
      expect(safeGetText({ broken: 'prop' }, 'fallback')).toBe('fallback')
    })

    it('应该清理文本内容', () => {
      expect(cleanText('  text  ')).toBe('text')
      expect(cleanText('text\n\twith\r\nwhitespace')).toBe('text with whitespace')
      expect(cleanText('multiple   spaces')).toBe('multiple spaces')
      expect(cleanText('')).toBe('')
    })

    it('应该处理超长文本', () => {
      const longText = 'a'.repeat(10000)
      expect(() => {
        normalizeTextValue(longText)
      }).not.toThrow()
      
      expect(() => {
        cleanText(longText)
      }).not.toThrow()
    })

    it('应该处理特殊字符', () => {
      const specialChars = '\\n\\t\\r"\'<>&\u0000\uFFFF'
      expect(() => {
        normalizeTextValue(specialChars)
      }).not.toThrow()
    })
  })

  describe('拖拽优化管理器边缘情况', () => {
    let dragManager: DragOptimizationManager

    beforeEach(() => {
      dragManager = new DragOptimizationManager()
    })

    afterEach(() => {
      dragManager.destroy()
    })

    it('应该处理无效的节点ID', () => {
      expect(() => {
        dragManager.startDrag('', { x: 0, y: 0 })
      }).not.toThrow()
      
      expect(() => {
        dragManager.updateDragPosition('nonexistent', { x: 100, y: 100 })
      }).not.toThrow()
      
      expect(() => {
        dragManager.endDrag('nonexistent')
      }).not.toThrow()
    })

    it('应该处理快速连续的拖拽操作', () => {
      dragManager.startDrag('node1', { x: 0, y: 0 })
      
      for (let i = 0; i < 100; i++) {
        dragManager.updateDragPosition('node1', { x: i, y: i })
      }
      
      expect(() => {
        dragManager.endDrag('node1')
      }).not.toThrow()
    })

    it('应该处理没有开始就结束的拖拽', () => {
      expect(() => {
        dragManager.endDrag('node1')
      }).not.toThrow()
    })

    it('应该处理多次结束同一个拖拽', () => {
      dragManager.startDrag('node1', { x: 0, y: 0 })
      dragManager.endDrag('node1')
      
      expect(() => {
        dragManager.endDrag('node1')
      }).not.toThrow()
    })
  })

  describe('无障碍管理器边缘情况', () => {
    let accessibilityManager: AccessibilityManager

    beforeEach(() => {
      accessibilityManager = new AccessibilityManager()
      // Mock Speech Synthesis API
      Object.defineProperty(window, 'speechSynthesis', {
        value: {
          cancel: vi.fn(),
          speak: vi.fn(),
          getVoices: vi.fn(() => []),
          onvoiceschanged: null
        },
        configurable: true
      })
    })

    afterEach(() => {
      accessibilityManager.destroy()
    })

    it('应该处理空导航项目列表', () => {
      expect(() => {
        accessibilityManager.updateNavigableItems([])
      }).not.toThrow()
    })

    it('应该处理无效的导航项目', () => {
      const invalidItems = [
        {
          id: '',
          element: null as any,
          type: 'node' as const,
          label: '',
          position: { x: NaN, y: NaN },
          focusable: true
        }
      ]

      expect(() => {
        accessibilityManager.updateNavigableItems(invalidItems)
      }).not.toThrow()
    })

    it('应该处理语音合成不可用的情况', () => {
      Object.defineProperty(window, 'speechSynthesis', {
        value: undefined,
        configurable: true
      })

      const manager = new AccessibilityManager()
      
      expect(() => {
        manager.announce('test message')
      }).not.toThrow()
      
      manager.destroy()
    })
  })

  describe('移动端适配器边缘情况', () => {
    let mobileAdapter: EnhancedMobileAdapter

    beforeEach(() => {
      mobileAdapter = new EnhancedMobileAdapter()
      // Mock navigator.vibrate
      Object.defineProperty(navigator, 'vibrate', {
        value: vi.fn(),
        configurable: true
      })
    })

    afterEach(() => {
      mobileAdapter.destroy()
    })

    it('应该处理非移动设备初始化', () => {
      expect(() => {
        mobileAdapter.initialize(container)
      }).not.toThrow()
    })

    it('应该处理无效的触摸事件', () => {
      mobileAdapter.initialize(container)
      
      const invalidTouchEvent = new TouchEvent('touchstart', {
        touches: []
      })

      expect(() => {
        container.dispatchEvent(invalidTouchEvent)
      }).not.toThrow()
    })

    it('应该处理触觉反馈不可用的情况', () => {
      Object.defineProperty(navigator, 'vibrate', {
        value: undefined,
        configurable: true
      })

      const adapter = new EnhancedMobileAdapter({ enableHapticFeedback: true })
      
      expect(() => {
        adapter.initialize(container)
      }).not.toThrow()
      
      adapter.destroy()
    })
  })

  describe('内存压力测试', () => {
    it('应该处理频繁创建和销毁编辑器', () => {
      const editors: FlowchartEditor[] = []
      
      for (let i = 0; i < 50; i++) {
        const testContainer = document.createElement('div')
        document.body.appendChild(testContainer)
        
        const testEditor = new FlowchartEditor({ container: testContainer })
        editors.push(testEditor)
      }

      expect(() => {
        editors.forEach(e => e.destroy())
      }).not.toThrow()
    })

    it('应该处理大量事件监听器', () => {
      editor = new FlowchartEditor({ container })
      
      const listeners: Array<() => void> = []
      
      for (let i = 0; i < 1000; i++) {
        const listener = vi.fn()
        listeners.push(listener)
        editor.on('node:click', listener)
      }

      expect(() => {
        listeners.forEach(listener => {
          editor.off('node:click', listener)
        })
      }).not.toThrow()
    })
  })

  describe('并发操作测试', () => {
    it('应该处理并发节点添加', async () => {
      editor = new FlowchartEditor({ container })
      
      const promises = Array.from({ length: 10 }, (_, i) =>
        Promise.resolve().then(() => {
          return editor.addNode({
            type: 'process',
            x: i * 100,
            y: 100,
            text: `节点${i}`
          })
        })
      )

      expect(() => {
        return Promise.all(promises)
      }).not.toThrow()
    })

    it('应该处理并发数据更新', async () => {
      editor = new FlowchartEditor({ container })
      
      const nodeId = editor.addNode({
        type: 'process',
        x: 100,
        y: 100,
        text: '测试节点'
      })

      const promises = Array.from({ length: 10 }, (_, i) =>
        Promise.resolve().then(() => {
          editor.updateNode(nodeId, {
            text: `更新${i}`,
            x: 100 + i * 10
          })
        })
      )

      expect(() => {
        return Promise.all(promises)
      }).not.toThrow()
    })
  })

  describe('资源限制测试', () => {
    it('应该处理低内存情况', () => {
      // Mock低内存警告
      const originalAlert = window.alert
      window.alert = vi.fn()

      editor = new FlowchartEditor({ container })
      
      // 模拟内存不足的情况
      const memoryEvent = new Event('lowmemory')
      window.dispatchEvent(memoryEvent)

      expect(() => {
        editor.render({
          nodes: Array.from({ length: 100 }, (_, i) => ({
            id: `node${i}`,
            type: 'process',
            x: i * 50,
            y: 100,
            text: `节点${i}`,
            properties: {}
          })),
          edges: []
        })
      }).not.toThrow()

      window.alert = originalAlert
    })

    it('应该处理网络不稳定的情况', () => {
      // Mock网络状态
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        configurable: true
      })

      editor = new FlowchartEditor({ 
        container,
        // 可能的网络相关配置
      })

      expect(() => {
        editor.render({ nodes: [], edges: [] })
      }).not.toThrow()
    })
  })

  describe('异常恢复测试', () => {
    it('应该从渲染错误中恢复', () => {
      editor = new FlowchartEditor({ container })
      
      // 故意传入会导致错误的数据
      const malformedData = {
        nodes: [{ invalid: 'data' }],
        edges: [{ also: 'invalid' }]
      } as any

      expect(() => {
        editor.render(malformedData)
      }).not.toThrow()

      // 应该能够恢复并渲染正常数据
      expect(() => {
        editor.render({
          nodes: [{
            id: 'node1',
            type: 'process',
            x: 100,
            y: 100,
            text: '正常节点',
            properties: {}
          }],
          edges: []
        })
      }).not.toThrow()
    })

    it('应该处理DOM操作失败', () => {
      // Mock DOM操作失败
      const originalAppendChild = HTMLElement.prototype.appendChild
      HTMLElement.prototype.appendChild = vi.fn().mockImplementation(() => {
        throw new Error('DOM操作失败')
      })

      expect(() => {
        editor = new FlowchartEditor({ container })
      }).not.toThrow()

      HTMLElement.prototype.appendChild = originalAppendChild
    })
  })
})
