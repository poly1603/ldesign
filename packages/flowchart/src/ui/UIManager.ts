/**
 * UI管理器
 * 
 * 负责管理流程图编辑器的UI组件
 */

import type { FlowchartEditorConfig, ApprovalNodeConfig, ApprovalNodeType, FlowchartTheme } from '../types'
import { MaterialPanel } from './native/MaterialPanel'
import { PropertyPanel } from './native/PropertyPanel'
import { Toolbar } from './native/Toolbar'

export interface UIState {
  selectedNode: ApprovalNodeConfig | null
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

  // 事件回调
  private onNodeUpdate?: (nodeId: string, updates: Partial<ApprovalNodeConfig>) => void
  private onNodeDelete?: (nodeId: string) => void
  private onNodeDrop?: (nodeType: ApprovalNodeType, position: { x: number; y: number }) => void
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

    // 组装布局
    if (this.config.toolbar?.visible !== false) {
      this.container.appendChild(toolbarContainer)
    }

    this.uiContainer.appendChild(materialContainer)
    this.uiContainer.appendChild(this.canvasContainer)
    this.uiContainer.appendChild(propertyContainer)
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

      const nodeType = event.dataTransfer?.getData('application/node-type') as ApprovalNodeType
      if (!nodeType) return

      // 计算相对于画布的坐标
      const rect = this.canvasContainer!.getBoundingClientRect()
      const position = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      }

      this.onNodeDrop?.(nodeType, position)
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
   * 设置事件回调
   */
  setEventCallbacks(callbacks: {
    onNodeUpdate?: (nodeId: string, updates: Partial<ApprovalNodeConfig>) => void
    onNodeDelete?: (nodeId: string) => void
    onNodeDrop?: (nodeType: ApprovalNodeType, position: { x: number; y: number }) => void
    onToolClick?: (toolName: string) => void
    onThemeChange?: (theme: FlowchartTheme) => void
  }): void {
    this.onNodeUpdate = callbacks.onNodeUpdate
    this.onNodeDelete = callbacks.onNodeDelete
    this.onNodeDrop = callbacks.onNodeDrop
    this.onToolClick = callbacks.onToolClick
    this.onThemeChange = callbacks.onThemeChange
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
  }
}
