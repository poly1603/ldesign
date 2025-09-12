/**
 * UI管理器
 * 
 * 负责管理流程图编辑器的UI组件
 */

import type { FlowchartEditorConfig, ApprovalNodeConfig, ApprovalEdgeConfig, ApprovalNodeType, FlowchartTheme } from '../types'
import { MaterialPanel } from './native/MaterialPanel'
import { PropertyPanel } from './native/PropertyPanel'
import { Toolbar } from './native/Toolbar'
import { HistoryPanel } from './native/HistoryPanel'

export interface UIState {
  selectedNode: ApprovalNodeConfig | null
  selectedEdge: ApprovalEdgeConfig | null
  readonly: boolean
  currentTheme: FlowchartTheme
}

/**
 * UI管理器类 - 原生DOM实现
 */
export class UIManager {
  private config: FlowchartEditorConfig
  private container: HTMLElement
  private uiContainer: HTMLElement | null = null
  private canvasContainer: HTMLElement | null = null
  private components: Map<string, any> = new Map()
  private state: UIState
  private editor: any = null // 编辑器实例引用

  // 事件回调
  private onNodeUpdate?: (nodeId: string, updates: Partial<ApprovalNodeConfig>) => void
  private onNodeDelete?: (nodeId: string) => void
  private onNodeDrop?: (nodeType: ApprovalNodeType, position: { x: number; y: number }) => void
  private onCustomMaterialDrop?: (materialId: string, position: { x: number; y: number }) => void
  private onToolClick?: (toolName: string) => void
  private onThemeChange?: (theme: FlowchartTheme) => void

  constructor(config: FlowchartEditorConfig) {
    this.config = config
    this.container = typeof config.container === 'string'
      ? document.querySelector(config.container) as HTMLElement
      : config.container

    if (!this.container) {
      throw new Error('容器元素不存在')
    }

    // 初始化状态
    this.state = {
      selectedNode: null,
      selectedEdge: null,
      readonly: config.readonly || false,
      currentTheme: typeof config.theme === 'string' ? config.theme as FlowchartTheme : 'default'
    }
  }

  /**
   * 初始化UI
   */
  init(): HTMLElement {
    this.createUILayout()
    this.mountComponents()
    return this.canvasContainer!
  }

  /**
   * 创建UI布局
   */
  private createUILayout(): void {
    // 清空原容器
    this.container.innerHTML = ''
    this.container.style.cssText = `
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    `

    // 创建主容器
    this.uiContainer = document.createElement('div')
    this.uiContainer.className = `ldesign-flowchart-ui theme-${this.state.currentTheme || 'default'}`
    this.uiContainer.style.cssText = `
      display: flex;
      flex: 1;
      overflow: hidden;
    `

    // 添加主题样式
    this.injectThemeStyles()

    // 创建工具栏容器
    const toolbarContainer = document.createElement('div')
    toolbarContainer.id = 'ldesign-toolbar-container'
    toolbarContainer.style.cssText = `
      height: 48px;
      border-bottom: 1px solid #e5e5e5;
    `

    // 创建物料面板容器
    const materialContainer = document.createElement('div')
    materialContainer.id = 'ldesign-material-container'
    materialContainer.style.cssText = `
      width: 240px;
      height: 100%;
      ${this.state.readonly || !this.config.nodePanel?.visible ? 'display: none;' : ''}
    `

    // 创建画布容器
    this.canvasContainer = document.createElement('div')
    this.canvasContainer.style.cssText = `
      flex: 1;
      height: 100%;
      position: relative;
      overflow: hidden;
      background-color: #f5f5f5;
      background-image:
        linear-gradient(rgba(0,0,0,.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,0,0,.1) 1px, transparent 1px);
      background-size: 20px 20px;
    `

    // 创建属性面板容器
    const propertyContainer = document.createElement('div')
    propertyContainer.id = 'ldesign-property-container'
    propertyContainer.style.cssText = `
      width: 280px;
      height: 100%;
      ${this.state.readonly || !this.config.propertyPanel?.visible ? 'display: none;' : ''}
    `

    // 创建历史记录面板容器
    const historyContainer = document.createElement('div')
    historyContainer.id = 'ldesign-history-container'
    historyContainer.style.cssText = `
      width: 280px;
      height: 100%;
      display: none;
      position: relative;
      overflow: hidden;
    `

    // 组装布局
    if (this.config.toolbar?.visible !== false) {
      this.container.appendChild(toolbarContainer)
    }

    this.uiContainer.appendChild(materialContainer)
    this.uiContainer.appendChild(this.canvasContainer)
    this.uiContainer.appendChild(propertyContainer)
    this.uiContainer.appendChild(historyContainer)
    this.container.appendChild(this.uiContainer)
  }

  /**
   * 挂载原生组件
   */
  private mountComponents(): void {
    // 挂载工具栏
    if (this.config.toolbar?.visible !== false) {
      this.mountToolbar()
    }

    // 挂载物料面板
    if (!this.state.readonly && this.config.nodePanel?.visible !== false) {
      this.mountMaterialPanel()
    }

    // 挂载属性面板
    if (!this.state.readonly && this.config.propertyPanel?.visible !== false) {
      this.mountPropertyPanel()
    }

    // 挂载历史记录面板
    this.mountHistoryPanel()
  }

  /**
   * 挂载工具栏
   */
  private mountToolbar(): void {
    const container = document.getElementById('ldesign-toolbar-container')
    if (!container) return

    const toolbar = new Toolbar(container, {
      tools: this.config.toolbar?.tools || ['select', 'zoom-fit', 'undo', 'redo'],
      readonly: this.state.readonly,
      theme: this.state.currentTheme,
      onToolAction: (toolName: string) => {
        this.onToolClick?.(toolName)
      },
      onThemeChange: (theme: FlowchartTheme) => {
        this.state.currentTheme = theme
        this.applyTheme(theme)
        this.onThemeChange?.(theme)
      }
    })

    this.components.set('toolbar', toolbar)
  }

  /**
   * 挂载物料面板
   */
  private mountMaterialPanel(): void {
    const container = document.getElementById('ldesign-material-container')
    if (!container) return

    const materialPanel = new MaterialPanel(container, {
      readonly: this.state.readonly,
      theme: this.state.currentTheme,
      onNodeAdd: (type: ApprovalNodeType, position: { x: number, y: number }) => {
        this.onNodeDrop?.(type, position)
      }
    })

    this.components.set('material', materialPanel)

    // 添加拖拽事件监听
    this.setupDragAndDrop()
  }

  /**
   * 挂载属性面板
   */
  private mountPropertyPanel(): void {
    const container = document.getElementById('ldesign-property-container')
    if (!container) return

    const propertyPanel = new PropertyPanel(container, {
      selectedNode: this.state.selectedNode,
      readonly: this.state.readonly,
      theme: this.state.currentTheme,
      onUpdateNode: (nodeId: string, updates: Partial<ApprovalNodeConfig>) => {
        this.onNodeUpdate?.(nodeId, updates)
      }
    })

    this.components.set('property', propertyPanel)
  }

  /**
   * 挂载历史记录面板
   */
  private mountHistoryPanel(): void {
    const container = document.getElementById('ldesign-history-container')
    if (!container) return

    const historyPanel = new HistoryPanel({
      visible: false, // 默认隐藏
      onHistorySelect: (index: number) => {
        // 跳转到指定历史记录
        const editor = this.getEditor()
        if (editor) {
          const historyPlugin = editor.getPlugin('history')
          if (historyPlugin && historyPlugin.goTo) {
            historyPlugin.goTo(index)
          }
        }
      },
      onHistoryUndo: () => {
        // 撤销操作
        const editor = this.getEditor()
        if (editor) {
          const historyPlugin = editor.getPlugin('history')
          if (historyPlugin && historyPlugin.undo) {
            historyPlugin.undo()
          }
        }
      },
      onHistoryRedo: () => {
        // 重做操作
        const editor = this.getEditor()
        if (editor) {
          const historyPlugin = editor.getPlugin('history')
          if (historyPlugin && historyPlugin.redo) {
            historyPlugin.redo()
          }
        }
      },
      onHistoryClear: () => {
        // 清空历史记录
        const editor = this.getEditor()
        if (editor) {
          const historyPlugin = editor.getPlugin('history')
          if (historyPlugin && historyPlugin.clear) {
            historyPlugin.clear()
          }
        }
      }
    })

    const panelElement = historyPanel.create()
    container.appendChild(panelElement)
    this.components.set('history', historyPanel)
  }

  /**
   * 设置拖拽功能
   */
  private setupDragAndDrop(): void {
    if (!this.canvasContainer) return

    this.canvasContainer.addEventListener('dragover', (event) => {
      event.preventDefault()
      event.dataTransfer!.dropEffect = 'copy'
    })

    this.canvasContainer.addEventListener('drop', (event) => {
      event.preventDefault()

      // 检查是否是自定义物料
      const customMaterialId = event.dataTransfer?.getData('application/custom-material-id')
      const nodeType = event.dataTransfer?.getData('application/node-type') as ApprovalNodeType

      if (!customMaterialId && !nodeType) return

      // 获取LogicFlow实例来进行坐标转换
      const editor = this.getEditor()
      if (!editor) {
        console.error('无法获取编辑器实例')
        return
      }

      const lf = editor.getLogicFlow()

      // 使用绝对屏幕坐标进行转换
      const clientX = event.clientX
      const clientY = event.clientY

      // 使用LogicFlow的坐标转换方法将屏幕坐标转换为画布坐标
      let position: { x: number; y: number }

      try {
        // 尝试使用LogicFlow的getPointByClient方法（这是正确的API）
        const point = lf.getPointByClient(clientX, clientY)
        if (point && typeof point.x === 'number' && typeof point.y === 'number') {
          position = { x: point.x, y: point.y }
          console.log(`屏幕坐标转换: (${clientX}, ${clientY}) -> 画布坐标: (${position.x.toFixed(0)}, ${position.y.toFixed(0)})`)
        } else {
          throw new Error('getPointByClient返回了无效的坐标')
        }
      } catch (error) {
        console.warn('LogicFlow坐标转换失败，使用手动计算:', error)

        // 手动计算相对坐标
        const rect = this.canvasContainer!.getBoundingClientRect()
        const relativeX = clientX - rect.left
        const relativeY = clientY - rect.top

        // 获取画布变换信息
        try {
          const transform = lf.getTransform()
          const scale = transform?.SCALE_X || 1
          const translateX = transform?.TRANSLATE_X || 0
          const translateY = transform?.TRANSLATE_Y || 0

          // 应用逆变换
          position = {
            x: (relativeX - translateX) / scale,
            y: (relativeY - translateY) / scale
          }

          console.log(`手动计算坐标: 相对(${relativeX}, ${relativeY}) -> 画布坐标: (${position.x.toFixed(0)}, ${position.y.toFixed(0)})`)
          console.log(`变换信息: scale=${scale}, translate=(${translateX}, ${translateY})`)
        } catch (transformError) {
          console.warn('获取变换信息失败，使用基础坐标:', transformError)
          // 如果获取变换信息也失败，就使用基础的相对坐标
          position = { x: relativeX, y: relativeY }
        }
      }

      if (customMaterialId) {
        // 处理自定义物料拖拽
        console.log(`拖拽创建自定义物料: ${customMaterialId} at (${position.x.toFixed(0)}, ${position.y.toFixed(0)})`)
        this.onCustomMaterialDrop?.(customMaterialId, position)
      } else if (nodeType) {
        // 处理标准节点拖拽
        console.log(`拖拽创建节点: ${nodeType} at (${position.x.toFixed(0)}, ${position.y.toFixed(0)})`)
        this.onNodeDrop?.(nodeType, position)
      }
    })
  }

  /**
   * 设置选中节点
   */
  setSelectedNode(node: ApprovalNodeConfig | null): void {
    this.state.selectedNode = node

    // 更新属性面板
    const propertyPanel = this.components.get('property')
    if (propertyPanel) {
      propertyPanel.setSelectedNode(node)
    }
  }

  /**
   * 设置选中边
   */
  setSelectedEdge(edge: ApprovalEdgeConfig | null): void {
    this.state.selectedEdge = edge

    // 更新属性面板
    const propertyPanel = this.components.get('property')
    if (propertyPanel) {
      propertyPanel.setSelectedEdge(edge)
    }
  }

  /**
   * 设置只读模式
   */
  setReadonly(readonly: boolean): void {
    this.state.readonly = readonly

    // 更新所有组件
    this.components.forEach(component => {
      if (component.setReadonly) {
        component.setReadonly(readonly)
      }
    })

    this.updateUIVisibility()
  }

  /**
   * 设置主题
   */
  setTheme(theme: FlowchartTheme): void {
    this.state.currentTheme = theme

    // 更新所有组件
    this.components.forEach(component => {
      if (component.setTheme) {
        component.setTheme(theme)
      }
    })

    this.applyTheme(theme)
  }

  /**
   * 应用主题
   */
  private applyTheme(theme: FlowchartTheme): void {
    if (!this.uiContainer) return

    // 移除旧主题类
    this.uiContainer.classList.remove('theme-default', 'theme-dark', 'theme-blue')

    // 添加新主题类
    this.uiContainer.classList.add(`theme-${theme}`)

    // 设置data-theme属性
    this.uiContainer.setAttribute('data-theme', theme)

    // 同时设置根容器的data-theme属性
    this.container.setAttribute('data-theme', theme)

    // 更新画布容器的主题样式
    this.updateThemeStyles(theme)
  }

  /**
   * 更新主题样式
   */
  private updateThemeStyles(theme: string): void {
    if (!this.canvasContainer) return

    // 根据主题更新画布背景
    switch (theme) {
      case 'dark':
        this.canvasContainer.style.backgroundColor = '#1f1f1f'
        this.canvasContainer.style.backgroundImage = `
          linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)
        `
        break
      case 'blue':
        this.canvasContainer.style.backgroundColor = '#e6f7ff'
        this.canvasContainer.style.backgroundImage = `
          linear-gradient(rgba(24,144,255,.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(24,144,255,.1) 1px, transparent 1px)
        `
        break
      default: // default theme
        this.canvasContainer.style.backgroundColor = '#f5f5f5'
        this.canvasContainer.style.backgroundImage = `
          linear-gradient(rgba(0,0,0,.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,0,0,.1) 1px, transparent 1px)
        `
        break
    }

    // 更新UI容器主题类
    if (this.uiContainer) {
      this.uiContainer.className = `ldesign-flowchart-ui theme-${theme}`
    }
  }

  /**
   * 注入主题样式
   */
  private injectThemeStyles(): void {
    const styleId = 'ldesign-flowchart-theme-styles'
    let styleElement = document.getElementById(styleId) as HTMLStyleElement

    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = styleId
      document.head.appendChild(styleElement)
    }

    styleElement.textContent = `
      /* 默认主题 */
      .ldesign-flowchart-ui.theme-default {
        --panel-bg: #ffffff;
        --panel-border: #e5e5e5;
        --panel-text: rgba(0, 0, 0, 0.9);
        --panel-text-secondary: rgba(0, 0, 0, 0.7);
        --panel-hover: #f8f8f8;
        --button-bg: #f0f0f0;
        --button-hover: #e0e0e0;
        --input-bg: #ffffff;
        --input-border: #d9d9d9;
      }

      /* 暗色主题 */
      .ldesign-flowchart-ui.theme-dark {
        --panel-bg: #1f1f1f;
        --panel-border: #404040;
        --panel-text: rgba(255, 255, 255, 0.9);
        --panel-text-secondary: rgba(255, 255, 255, 0.7);
        --panel-hover: #2a2a2a;
        --button-bg: #333333;
        --button-hover: #404040;
        --input-bg: #2a2a2a;
        --input-border: #404040;
      }

      /* 蓝色主题 */
      .ldesign-flowchart-ui.theme-blue {
        --panel-bg: #f0f8ff;
        --panel-border: #b3d9ff;
        --panel-text: rgba(0, 0, 0, 0.9);
        --panel-text-secondary: rgba(0, 0, 0, 0.7);
        --panel-hover: #e6f4ff;
        --button-bg: #e6f4ff;
        --button-hover: #d6ebff;
        --input-bg: #ffffff;
        --input-border: #91caff;
      }

      /* 应用主题变量到组件 */
      .ldesign-flowchart-ui .ldesign-material-panel,
      .ldesign-flowchart-ui .ldesign-property-panel,
      .ldesign-flowchart-ui .ldesign-toolbar {
        background: var(--panel-bg);
        border-color: var(--panel-border);
        color: var(--panel-text);
      }

      .ldesign-flowchart-ui .panel-header h3,
      .ldesign-flowchart-ui .material-category h4,
      .ldesign-flowchart-ui .property-section h4 {
        color: var(--panel-text);
      }

      .ldesign-flowchart-ui .panel-header p,
      .ldesign-flowchart-ui .property-item label {
        color: var(--panel-text-secondary);
      }

      .ldesign-flowchart-ui .material-item:hover,
      .ldesign-flowchart-ui .toolbar-tool:hover {
        background: var(--panel-hover);
      }

      .ldesign-flowchart-ui .toolbar-tool,
      .ldesign-flowchart-ui .property-item input,
      .ldesign-flowchart-ui .property-item select,
      .ldesign-flowchart-ui .property-item textarea {
        background: var(--input-bg);
        border-color: var(--input-border);
        color: var(--panel-text);
      }
    `
  }

  /**
   * 更新UI可见性
   */
  private updateUIVisibility(): void {
    const materialContainer = document.getElementById('ldesign-material-container')
    const propertyContainer = document.getElementById('ldesign-property-container')

    if (materialContainer) {
      materialContainer.style.display = this.state.readonly ? 'none' : 'block'
    }

    if (propertyContainer) {
      propertyContainer.style.display = this.state.readonly ? 'none' : 'block'
    }
  }

  /**
   * 显示/隐藏历史记录面板（带滑出动画）
   */
  toggleHistoryPanel(): void {
    const historyContainer = document.getElementById('ldesign-history-container')
    const propertyContainer = document.getElementById('ldesign-property-container')

    if (historyContainer && propertyContainer) {
      const isHistoryVisible = historyContainer.classList.contains('panel-visible')

      if (isHistoryVisible) {
        // 隐藏历史记录面板，显示属性面板
        this.hideHistoryPanel(historyContainer, propertyContainer)
      } else {
        // 显示历史记录面板，隐藏属性面板
        this.showHistoryPanel(historyContainer, propertyContainer)
      }
    }
  }

  /**
   * 显示历史记录面板
   */
  private showHistoryPanel(historyContainer: HTMLElement, propertyContainer: HTMLElement): void {
    // 更新历史记录数据
    this.updateHistoryPanelData()

    // 设置初始状态
    historyContainer.style.display = 'block'
    historyContainer.style.transform = 'translateX(100%)'
    historyContainer.style.transition = 'transform 0.3s ease-in-out'

    // 隐藏属性面板
    propertyContainer.style.display = 'none'

    // 触发滑入动画
    requestAnimationFrame(() => {
      historyContainer.style.transform = 'translateX(0)'
      historyContainer.classList.add('panel-visible')
    })
  }

  /**
   * 隐藏历史记录面板
   */
  private hideHistoryPanel(historyContainer: HTMLElement, propertyContainer: HTMLElement): void {
    // 触发滑出动画
    historyContainer.style.transform = 'translateX(100%)'

    // 动画结束后隐藏面板
    setTimeout(() => {
      historyContainer.style.display = 'none'
      historyContainer.classList.remove('panel-visible')

      // 显示属性面板
      propertyContainer.style.display = this.state.readonly ? 'none' : 'block'
    }, 300)
  }

  /**
   * 更新历史记录面板数据
   */
  private updateHistoryPanelData(): void {
    const historyPanel = this.components.get('history')
    if (!historyPanel) return

    const editor = this.getEditor()
    if (!editor) return

    const historyPlugin = editor.getPlugin('history')
    if (historyPlugin && historyPlugin.getHistory) {
      const historyData = historyPlugin.getHistory()
      const currentIndex = historyPlugin.getCurrentIndex()
      historyPanel.setHistoryData(historyData, currentIndex)
    }
  }

  /**
   * 设置事件回调
   */
  setEventCallbacks(callbacks: {
    onNodeUpdate?: (nodeId: string, updates: Partial<ApprovalNodeConfig>) => void
    onNodeDelete?: (nodeId: string) => void
    onNodeDrop?: (nodeType: ApprovalNodeType, position: { x: number; y: number }) => void
    onCustomMaterialDrop?: (materialId: string, position: { x: number; y: number }) => void
    onToolClick?: (toolName: string) => void
    onThemeChange?: (theme: FlowchartTheme) => void
  }): void {
    this.onNodeUpdate = callbacks.onNodeUpdate
    this.onNodeDelete = callbacks.onNodeDelete
    this.onNodeDrop = callbacks.onNodeDrop
    this.onCustomMaterialDrop = callbacks.onCustomMaterialDrop
    this.onToolClick = callbacks.onToolClick
    this.onThemeChange = callbacks.onThemeChange
  }

  /**
   * 获取组件
   */
  getComponent(name: string): any {
    return this.components.get(name)
  }

  /**
   * 设置编辑器实例
   */
  setEditor(editor: any): void {
    this.editor = editor
  }

  /**
   * 获取编辑器实例
   */
  getEditor(): any {
    return this.editor
  }

  /**
   * 销毁UI
   */
  destroy(): void {
    // 销毁所有组件
    this.components.forEach(component => {
      if (component.destroy) {
        component.destroy()
      }
    })
    this.components.clear()

    if (this.uiContainer) {
      this.uiContainer.remove()
      this.uiContainer = null
    }

    this.canvasContainer = null
    this.editor = null
  }
}
