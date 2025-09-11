/**
 * 审批流程图编辑器核心类
 * 
 * 基于 @logicflow/core 实现的审批流程图编辑器，
 * 提供完整的流程图编辑功能。
 */

import LogicFlow from '@logicflow/core'
import { SelectionSelect } from '@logicflow/extension'
import '@logicflow/extension/lib/style/index.css'
import type {
  FlowchartEditorConfig,
  FlowchartData,
  ApprovalNodeConfig,
  ApprovalEdgeConfig,
  FlowchartEvents,
  ThemeConfig,
  ApprovalNodeType
} from '../types'
import { ThemeManager } from '../themes/ThemeManager'
import { PluginManager } from '../plugins/PluginManager'
import { registerApprovalNodes } from '../nodes'
import { registerApprovalEdges } from '../edges'
import { defaultConfig } from '../config/defaultConfig'
import { UIManager } from '../ui/UIManager'
import { MaterialRepositoryManager } from '../materials/MaterialRepositoryManager'
import { MaterialRepositoryPanel } from '../ui/native/MaterialRepositoryPanel'

/**
 * 审批流程图编辑器类
 */
export class FlowchartEditor {
  private lf!: LogicFlow
  private config: FlowchartEditorConfig
  private themeManager!: ThemeManager
  private pluginManager!: PluginManager
  private uiManager?: UIManager
  private eventListeners: Map<keyof FlowchartEvents, Function[]> = new Map()
  private selectedNode: ApprovalNodeConfig | null = null
  private selectedEdge: ApprovalEdgeConfig | null = null
  private keyboardEventListener?: (event: KeyboardEvent) => void
  private currentBackgroundType: 'grid' | 'ps' | 'solid' = 'grid'
  private copiedNodeData: any = null
  private isSelectionMode: boolean = false
  private materialRepositoryManager!: MaterialRepositoryManager
  private materialRepositoryPanel: MaterialRepositoryPanel | null = null

  /**
   * 构造函数
   * @param config 编辑器配置
   */
  constructor(config: FlowchartEditorConfig) {
    this.config = { ...defaultConfig, ...config }

    // 初始化UI管理器（如果需要UI）
    if (this.shouldInitUI()) {
      this.uiManager = new UIManager(this.config)
      this.setupUICallbacks()
    }

    // 注册LogicFlow插件（必须在创建实例之前）
    this.registerLogicFlowPlugins()

    // 初始化 LogicFlow
    this.initLogicFlow()

    // 初始化主题管理器
    this.themeManager = new ThemeManager(this.lf)

    // 初始化插件管理器
    this.pluginManager = new PluginManager(this)

    // 初始化物料仓库管理器
    this.materialRepositoryManager = new MaterialRepositoryManager()
    this.loadMaterialRepository()

    // 更新UI管理器的物料面板配置
    this.updateMaterialPanelConfig()

    // 注册审批流程节点和边
    this.registerElements()

    // 设置主题
    if (this.config.theme) {
      this.setTheme(this.config.theme)
    }

    // 安装插件
    if (this.config.plugins) {
      this.config.plugins.forEach(plugin => {
        this.pluginManager.install(plugin)
      })
    }

    // 绑定事件
    this.bindEvents()

    // 绑定键盘快捷键
    this.bindKeyboardShortcuts()

    // 设置默认背景
    setTimeout(() => {
      this.setCanvasBackground('grid')
    }, 100)
  }

  /**
   * 初始化 LogicFlow
   */
  private initLogicFlow(): void {
    let container: HTMLElement

    if (this.uiManager) {
      // 使用UI管理器提供的画布容器
      container = this.uiManager.init()
    } else {
      // 直接使用配置的容器
      container = typeof this.config.container === 'string'
        ? document.querySelector(this.config.container) as HTMLElement
        : this.config.container
    }

    if (!container) {
      throw new Error('容器元素不存在')
    }

    // LogicFlow 配置
    const lfConfig = {
      container,
      width: this.config.width || container.clientWidth,
      height: this.config.height || container.clientHeight,
      grid: {
        size: this.config.grid?.size || 20,
        visible: this.config.grid?.visible !== false,
        type: this.config.grid?.type || 'dot',
        config: {
          color: '#e1e1e1',
          thickness: 1
        }
      },
      // 启用对齐线
      snapline: true,
      // 禁用默认的右键菜单
      disabledMenus: [],
      // 启用键盘快捷键
      keyboard: {
        enabled: true
      },
      // 启用历史记录（撤销重做）
      history: true,
      // 启用多选模式
      multipleSelectKey: 'ctrl',
      // 自定义样式配置
      style: {
        // 节点选中样式
        nodeSelected: {
          stroke: '#722ED1',
          strokeWidth: 2,
          strokeDasharray: '4,4'
        },
        // 节点悬停样式
        nodeHovered: {
          stroke: '#722ED1',
          strokeWidth: 1,
          strokeOpacity: 0.8
        },
        // 对齐线样式
        snapline: {
          stroke: '#722ED1',
          strokeWidth: 1,
          strokeDasharray: '5,5'
        }
      },
      // 自定义配置
      ...this.config.logicflowConfig
    }

    this.lf = new LogicFlow(lfConfig)

    // 添加自定义样式
    this.addCustomStyles()
  }

  /**
   * 注册LogicFlow插件
   */
  private registerLogicFlowPlugins(): void {
    // 注册多选插件
    LogicFlow.use(SelectionSelect)
  }

  /**
   * 注册审批流程元素
   */
  private registerElements(): void {
    // 注册审批流程节点
    registerApprovalNodes(this.lf)

    // 注册审批流程边
    registerApprovalEdges(this.lf)
  }

  /**
   * 添加自定义样式
   */
  private addCustomStyles(): void {
    const style = document.createElement('style')
    style.textContent = `
      /* LogicFlow 画布样式优化 */
      .lf-canvas-overlay {
        cursor: default;
      }

      /* 节点拖拽时的鼠标样式 */
      .lf-node.lf-node-dragging {
        cursor: grabbing !important;
      }

      /* 节点悬停时的鼠标样式 */
      .lf-node:hover {
        cursor: grab;
      }

      /* 节点选中效果增强 */
      .lf-node.lf-node-selected .lf-node-shape {
        stroke: var(--ldesign-brand-color) !important;
        stroke-width: 2px !important;
        stroke-dasharray: 4,4 !important;
        filter: drop-shadow(0 0 8px rgba(114, 46, 209, 0.3));
      }

      /* 连线悬停效果 */
      .lf-edge:hover .lf-edge-path {
        stroke: var(--ldesign-brand-color) !important;
        stroke-width: 2px !important;
      }

      /* 默认网格背景 */
      .lf-canvas-overlay.grid-background {
        background-color: #fafafa;
      }

      .lf-canvas-overlay.grid-background .lf-grid {
        opacity: 0.4;
      }

      .lf-canvas-overlay.grid-background .lf-grid circle {
        fill: #d9d9d9;
      }

      .lf-canvas-overlay.grid-background .lf-grid line {
        stroke: #d9d9d9;
        stroke-width: 0.5;
      }

      /* PS风格透明背景 */
      .lf-canvas-overlay.ps-background {
        background-image:
          linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
          linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
          linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
        background-size: 20px 20px;
        background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        background-color: #ffffff;
      }

      .lf-canvas-overlay.ps-background .lf-grid {
        opacity: 0.3;
      }

      /* 纯色背景 */
      .lf-canvas-overlay.solid-background {
        background-color: #ffffff;
      }

      .lf-canvas-overlay.solid-background .lf-grid {
        opacity: 0.2;
      }



      /* 暗色主题下的网格背景 */
      [data-theme="dark"] .lf-canvas-overlay.grid-background {
        background-color: #1f1f1f;
      }

      /* 暗色主题下的PS风格背景 */
      [data-theme="dark"] .lf-canvas-overlay.ps-background {
        background-image:
          linear-gradient(45deg, #2a2a2a 25%, transparent 25%),
          linear-gradient(-45deg, #2a2a2a 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, #2a2a2a 75%),
          linear-gradient(-45deg, transparent 75%, #2a2a2a 75%);
        background-size: 20px 20px;
        background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        background-color: #1f1f1f;
      }

      /* 暗色主题下的纯色背景 */
      [data-theme="dark"] .lf-canvas-overlay.solid-background {
        background-color: #1f1f1f;
      }

      [data-theme="dark"] .lf-canvas-overlay .lf-grid {
        opacity: 0.2;
      }

      [data-theme="dark"] .lf-canvas-overlay .lf-grid circle {
        fill: #404040;
      }

      [data-theme="dark"] .lf-canvas-overlay .lf-grid line {
        stroke: #404040;
        stroke-width: 0.5;
      }

      /* 蓝色主题下的网格背景 */
      [data-theme="blue"] .lf-canvas-overlay.grid-background {
        background-color: #f0f8ff;
      }

      /* 蓝色主题下的PS风格背景 */
      [data-theme="blue"] .lf-canvas-overlay.ps-background {
        background-image:
          linear-gradient(45deg, #e6f4ff 25%, transparent 25%),
          linear-gradient(-45deg, #e6f4ff 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, #e6f4ff 75%),
          linear-gradient(-45deg, transparent 75%, #e6f4ff 75%);
        background-size: 20px 20px;
        background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        background-color: #f0f8ff;
      }

      /* 蓝色主题下的纯色背景 */
      [data-theme="blue"] .lf-canvas-overlay.solid-background {
        background-color: #f0f8ff;
      }

      [data-theme="blue"] .lf-canvas-overlay .lf-grid circle {
        fill: #b3d9ff;
      }

      [data-theme="blue"] .lf-canvas-overlay .lf-grid line {
        stroke: #b3d9ff;
        stroke-width: 0.5;
      }

      [data-theme="dark"] .lf-node.lf-node-selected .lf-node-shape {
        filter: drop-shadow(0 0 8px rgba(114, 46, 209, 0.5));
      }

      /* 主题切换动画 */
      .lf-canvas-overlay,
      .lf-canvas-overlay .lf-grid,
      .lf-canvas-overlay .lf-grid circle,
      .lf-canvas-overlay .lf-grid line {
        transition: all 0.3s ease;
      }

      /* 滚动条美化 - 默认主题 */
      .ldesign-material-panel::-webkit-scrollbar,
      .ldesign-property-panel::-webkit-scrollbar,
      .panel-content::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }

      .ldesign-material-panel::-webkit-scrollbar-track,
      .ldesign-property-panel::-webkit-scrollbar-track,
      .panel-content::-webkit-scrollbar-track {
        background: var(--ldesign-bg-color-component, #f8f9fa);
        border-radius: 3px;
      }

      .ldesign-material-panel::-webkit-scrollbar-thumb,
      .ldesign-property-panel::-webkit-scrollbar-thumb,
      .panel-content::-webkit-scrollbar-thumb {
        background: var(--ldesign-gray-color-4, #adadad);
        border-radius: 3px;
        transition: background 0.2s ease;
      }

      .ldesign-material-panel::-webkit-scrollbar-thumb:hover,
      .ldesign-property-panel::-webkit-scrollbar-thumb:hover,
      .panel-content::-webkit-scrollbar-thumb:hover {
        background: var(--ldesign-gray-color-6, #808080);
      }

      /* 暗色主题下的滚动条 */
      [data-theme="dark"] .ldesign-material-panel::-webkit-scrollbar-track,
      [data-theme="dark"] .ldesign-property-panel::-webkit-scrollbar-track,
      [data-theme="dark"] .panel-content::-webkit-scrollbar-track {
        background: #2a2a2a;
      }

      [data-theme="dark"] .ldesign-material-panel::-webkit-scrollbar-thumb,
      [data-theme="dark"] .ldesign-property-panel::-webkit-scrollbar-thumb,
      [data-theme="dark"] .panel-content::-webkit-scrollbar-thumb {
        background: #555555;
      }

      [data-theme="dark"] .ldesign-material-panel::-webkit-scrollbar-thumb:hover,
      [data-theme="dark"] .ldesign-property-panel::-webkit-scrollbar-thumb:hover,
      [data-theme="dark"] .panel-content::-webkit-scrollbar-thumb:hover {
        background: #777777;
      }

      /* 蓝色主题下的滚动条 */
      [data-theme="blue"] .ldesign-material-panel::-webkit-scrollbar-thumb,
      [data-theme="blue"] .ldesign-property-panel::-webkit-scrollbar-thumb,
      [data-theme="blue"] .panel-content::-webkit-scrollbar-thumb {
        background: var(--ldesign-brand-color-4, #a67fdb);
      }

      [data-theme="blue"] .ldesign-material-panel::-webkit-scrollbar-thumb:hover,
      [data-theme="blue"] .ldesign-property-panel::-webkit-scrollbar-thumb:hover,
      [data-theme="blue"] .panel-content::-webkit-scrollbar-thumb:hover {
        background: var(--ldesign-brand-color-6, #7334cb);
      }

      /* 节点文本在不同主题下的可读性优化 */
      [data-theme="dark"] .lf-node-text {
        fill: #ffffff !important;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
      }

      [data-theme="blue"] .lf-node-text {
        fill: #1a1a1a !important;
      }

      /* 连线在不同主题下的样式 */
      [data-theme="dark"] .lf-edge-path {
        stroke: #666666 !important;
      }

      [data-theme="dark"] .lf-edge-text {
        fill: #ffffff !important;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
      }

      [data-theme="blue"] .lf-edge-path {
        stroke: #4a90e2 !important;
      }

      [data-theme="blue"] .lf-edge-text {
        fill: #1a1a1a !important;
      }
    `
    document.head.appendChild(style)
  }

  /**
   * 绑定键盘快捷键
   */
  private bindKeyboardShortcuts(): void {
    // 确保画布容器可以接收键盘事件
    if (this.lf.container) {
      this.lf.container.setAttribute('tabindex', '0')
      this.lf.container.style.outline = 'none'
    }

    // 绑定键盘事件
    this.keyboardEventListener = (event) => {
      // 阻止在输入框中触发快捷键
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        return
      }

      // 只有在画布容器或其子元素获得焦点时才处理快捷键
      // 或者当前没有其他输入元素获得焦点时也处理
      const activeElement = document.activeElement
      const isInCanvas = this.lf.container?.contains(activeElement) || activeElement === this.lf.container
      const isBodyOrDocument = activeElement === document.body || activeElement === document.documentElement

      if (!isInCanvas && !isBodyOrDocument) {
        return
      }

      const { ctrlKey, metaKey, key } = event
      const isCtrlOrCmd = ctrlKey || metaKey

      switch (key.toLowerCase()) {
        case 'delete':
        case 'backspace':
          if (this.selectedNode) {
            event.preventDefault()
            this.deleteNode(this.selectedNode.id)
          } else if (this.selectedEdge) {
            event.preventDefault()
            this.lf.deleteEdge(this.selectedEdge.id)
          }
          break

        case 'c':
          if (isCtrlOrCmd && this.selectedNode) {
            event.preventDefault()
            this.copyNode(this.selectedNode.id)
          }
          break

        case 'v':
          if (isCtrlOrCmd && this.copiedNodeData) {
            event.preventDefault()
            this.pasteNodeWithOffset()
          }
          break

        case 'a':
          if (isCtrlOrCmd) {
            event.preventDefault()
            // 全选功能可以后续添加
            console.log('全选功能待实现')
          }
          break

        case 'z':
          if (isCtrlOrCmd) {
            event.preventDefault()
            this.lf.undo()
          }
          break

        case 'y':
          if (isCtrlOrCmd) {
            event.preventDefault()
            this.lf.redo()
          }
          break
      }
    }

    document.addEventListener('keydown', this.keyboardEventListener)

    // 点击画布时获取焦点，以便接收键盘事件
    this.lf.on('blank:click', () => {
      this.lf.container?.focus()
    })

    this.lf.on('node:click', () => {
      this.lf.container?.focus()
    })
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    // 节点事件
    this.lf.on('node:click', (data) => {
      // 转换LogicFlow节点数据为我们的格式
      const nodeConfig: ApprovalNodeConfig = {
        id: data.data.id,
        type: data.data.type as ApprovalNodeType,
        x: data.data.x,
        y: data.data.y,
        text: data.data.text?.value || data.data.text || '',
        properties: data.data.properties || {}
      }

      this.selectedNode = nodeConfig
      this.uiManager?.setSelectedNode(nodeConfig)
      this.emit('node:click', { node: nodeConfig, event: data.e })
    })

    this.lf.on('node:dblclick', (data) => {
      this.emit('node:dblclick', { node: data.data, event: data.e })
    })

    // 节点右键菜单
    this.lf.on('node:contextmenu', (data) => {
      this.showNodeContextMenu(data.e, data.data)
    })

    // 节点移动事件 - 实时更新属性面板
    this.lf.on('node:drag', (data) => {
      if (this.selectedNode && this.selectedNode.id === data.data.id) {
        const updatedNode: ApprovalNodeConfig = {
          ...this.selectedNode,
          x: data.data.x,
          y: data.data.y
        }
        this.selectedNode = updatedNode
        this.uiManager?.setSelectedNode(updatedNode)
      }
    })

    // 节点移动结束事件
    this.lf.on('node:drop', (data) => {
      if (this.selectedNode && this.selectedNode.id === data.data.id) {
        const updatedNode: ApprovalNodeConfig = {
          ...this.selectedNode,
          x: data.data.x,
          y: data.data.y
        }
        this.selectedNode = updatedNode
        this.uiManager?.setSelectedNode(updatedNode)
        this.emit('data:change', this.getData())
      }
    })

    this.lf.on('node:add', (data) => {
      this.emit('node:add', { node: data.data })
    })

    this.lf.on('node:delete', (data) => {
      this.emit('node:delete', { node: data.data })
    })

    // 边事件
    this.lf.on('edge:click', (data) => {
      // 设置选中的边
      this.selectedEdge = {
        id: data.data.id,
        type: data.data.type as ApprovalEdgeType,
        sourceNodeId: data.data.sourceNodeId,
        targetNodeId: data.data.targetNodeId,
        text: data.data.text?.value || '',
        properties: data.data.properties || {}
      }
      this.selectedNode = null // 清除节点选中
      this.uiManager?.setSelectedEdge(this.selectedEdge)
      this.emit('edge:click', { edge: data.data, event: data.e })
      this.emit('edge:select', this.selectedEdge)
    })

    this.lf.on('edge:add', (data) => {
      this.emit('edge:add', { edge: data.data })
    })

    this.lf.on('edge:delete', (data) => {
      this.emit('edge:delete', { edge: data.data })
    })

    // 画布事件
    this.lf.on('blank:click', (data) => {
      this.selectedNode = null
      this.selectedEdge = null
      this.uiManager?.setSelectedNode(null)
      this.uiManager?.setSelectedEdge(null)
      this.emit('canvas:click', { event: data.e, position: data.position })
    })

    // 画布右键菜单
    this.lf.on('blank:contextmenu', (data) => {
      this.showCanvasContextMenu(data.e, data.position)
    })

    // 选择变化事件
    this.lf.on('selection:selected', (data) => {
      const selected = this.lf.getSelectElements()
      console.log(`已选中 ${selected.nodes.length} 个节点和 ${selected.edges.length} 条连线`)
      this.emit('selection:change', { selected: selected as any })
    })

    // 多选框选事件
    this.lf.on('selection:selected-area', (data) => {
      console.log('框选区域:', data)
    })

    // 多选拖拽事件
    this.lf.on('selection:dragstart', (data) => {
      console.log('开始拖拽选中元素')
    })

    this.lf.on('selection:drag', (data) => {
      // 拖拽过程中可以显示对齐线
    })

    this.lf.on('selection:drop', (data) => {
      console.log('选中元素拖拽结束')
      this.emit('data:change', this.getData())
    })

    // 数据变化事件
    this.lf.on('history:change', () => {
      this.emit('data:change', { flowchartData: this.getData() })
    })
  }

  /**
   * 渲染编辑器
   */
  render(data?: FlowchartData): void {
    this.lf.render(data)
  }

  /**
   * 添加节点
   */
  addNode(nodeConfig: ApprovalNodeConfig): string {
    // 创建节点数据，确保文本位置正确
    const nodeData = {
      ...nodeConfig,
      text: {
        value: nodeConfig.text || this.getDefaultNodeText(nodeConfig.type),
        x: nodeConfig.x,
        y: nodeConfig.y,
        draggable: false,
        editable: true
      }
    }

    const node = this.lf.addNode(nodeData)

    // 添加节点后，强制更新文本位置
    setTimeout(() => {
      const nodeModel = this.lf.getNodeModelById(node.id)
      if (nodeModel) {
        nodeModel.setAttributes()
      }
    }, 0)

    return node.id
  }

  /**
   * 更新节点
   */
  updateNode(id: string, nodeConfig: Partial<ApprovalNodeConfig>): void {
    const nodeModel = this.lf.getNodeModelById(id)
    if (nodeModel) {
      // 构建更新数据
      const updateData: any = {}

      if (nodeConfig.text !== undefined) {
        updateData.text = nodeConfig.text
      }
      if (nodeConfig.x !== undefined) {
        updateData.x = nodeConfig.x
      }
      if (nodeConfig.y !== undefined) {
        updateData.y = nodeConfig.y
      }
      if (nodeConfig.properties !== undefined) {
        updateData.properties = { ...nodeModel.properties, ...nodeConfig.properties }
      }

      // 使用LogicFlow的updateText方法更新节点文本
      if (nodeConfig.text !== undefined) {
        this.lf.updateText(id, nodeConfig.text)
      }

      // 更新其他属性
      if (nodeConfig.x !== undefined || nodeConfig.y !== undefined) {
        nodeModel.moveTo(nodeConfig.x || nodeModel.x, nodeConfig.y || nodeModel.y)
      }

      if (nodeConfig.properties !== undefined) {
        nodeModel.properties = { ...nodeModel.properties, ...nodeConfig.properties }
      }

      // 触发数据变化事件
      this.emit('data:change', this.getData())
    }
  }

  /**
   * 删除节点
   */
  deleteNode(id: string): void {
    this.lf.deleteNode(id)
  }

  /**
   * 添加边
   */
  addEdge(edgeConfig: ApprovalEdgeConfig): string {
    const edge = this.lf.addEdge(edgeConfig)
    return edge.id
  }

  /**
   * 更新边
   */
  updateEdge(id: string, edgeConfig: Partial<ApprovalEdgeConfig>): void {
    const edgeModel = this.lf.getEdgeModelById(id)
    if (edgeModel) {
      Object.assign(edgeModel, edgeConfig)
    }
  }

  /**
   * 删除边
   */
  deleteEdge(id: string): void {
    this.lf.deleteEdge(id)
  }

  /**
   * 获取流程图数据
   */
  getData(): FlowchartData {
    const data = this.lf.getGraphData()
    return {
      nodes: data.nodes,
      edges: data.edges
    }
  }

  /**
   * 设置流程图数据
   */
  setData(data: FlowchartData): void {
    this.lf.renderRawData(data)
  }

  /**
   * 设置主题
   */
  setTheme(theme: string | ThemeConfig): void {
    this.themeManager.setTheme(theme)

    // 设置画布容器的data-theme属性
    if (typeof theme === 'string') {
      const container = this.lf.container
      if (container) {
        container.setAttribute('data-theme', theme)
        // 同时设置父容器的主题属性
        const parentContainer = container.closest('.ldesign-flowchart-editor')
        if (parentContainer) {
          parentContainer.setAttribute('data-theme', theme)
        }
      }

      // 同时更新UI主题
      if (this.uiManager) {
        this.uiManager.setTheme(theme)
      }
    }
  }

  /**
   * 设置画布背景类型
   */
  setCanvasBackground(type: 'grid' | 'ps' | 'solid'): void {
    // 更新当前背景类型
    this.currentBackgroundType = type

    // 尝试找到画布覆盖层
    let canvasOverlay = this.lf.container?.querySelector('.lf-canvas-overlay') as HTMLElement

    // 如果没有找到，尝试创建或使用画布容器
    if (!canvasOverlay) {
      canvasOverlay = this.lf.container as HTMLElement
      if (canvasOverlay) {
        canvasOverlay.classList.add('lf-canvas-overlay')
      }
    }

    if (canvasOverlay) {
      // 移除所有背景类
      canvasOverlay.classList.remove('ps-background', 'solid-background', 'grid-background')

      // 添加对应的背景类
      if (type === 'ps') {
        canvasOverlay.classList.add('ps-background')
      } else if (type === 'solid') {
        canvasOverlay.classList.add('solid-background')
      } else {
        canvasOverlay.classList.add('grid-background')
      }

      console.log(`画布背景已切换为: ${type}`)
    } else {
      console.warn('未找到画布容器，无法设置背景')
    }
  }

  /**
   * 缩放到适应内容
   */
  fitView(): void {
    try {
      // 获取所有节点的边界
      const graphData = this.lf.getGraphData()
      if (!graphData.nodes || graphData.nodes.length === 0) {
        console.warn('没有节点可以适应')
        return
      }

      // 计算所有节点的边界框
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

      graphData.nodes.forEach(node => {
        const x = node.x || 0
        const y = node.y || 0
        const width = 120 // 节点默认宽度
        const height = 60 // 节点默认高度

        minX = Math.min(minX, x - width / 2)
        minY = Math.min(minY, y - height / 2)
        maxX = Math.max(maxX, x + width / 2)
        maxY = Math.max(maxY, y + height / 2)
      })

      // 添加边距
      const padding = 50
      minX -= padding
      minY -= padding
      maxX += padding
      maxY += padding

      // 计算内容区域
      const contentWidth = maxX - minX
      const contentHeight = maxY - minY
      const contentCenterX = (minX + maxX) / 2
      const contentCenterY = (minY + maxY) / 2

      // 获取画布尺寸
      const canvasWidth = this.config.width || 800
      const canvasHeight = this.config.height || 600

      // 计算缩放比例
      const scaleX = canvasWidth / contentWidth
      const scaleY = canvasHeight / contentHeight
      const scale = Math.min(scaleX, scaleY, 1) // 不超过100%

      // 应用缩放和居中
      this.lf.zoom(scale)
      this.lf.translateCenter(contentCenterX, contentCenterY)

      console.log(`适应视图: 缩放=${scale.toFixed(2)}, 中心=(${contentCenterX.toFixed(0)}, ${contentCenterY.toFixed(0)})`)
    } catch (error) {
      console.error('适应视图失败:', error)
      // 降级到默认的fitView
      this.lf.fitView()
    }
  }

  /**
   * 设置缩放比例
   */
  zoom(scale: number): void {
    this.lf.zoom(scale)
  }

  /**
   * 撤销
   */
  undo(): void {
    this.lf.undo()
  }

  /**
   * 重做
   */
  redo(): void {
    this.lf.redo()
  }

  /**
   * 获取流程图数据
   */
  getFlowchartData(): FlowchartData {
    return this.lf.getGraphData()
  }

  /**
   * 获取 LogicFlow 实例
   */
  getLogicFlow(): LogicFlow {
    return this.lf
  }

  /**
   * 事件监听
   */
  on<K extends keyof FlowchartEvents>(event: K, listener: FlowchartEvents[K]): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(listener)
  }

  /**
   * 移除事件监听
   */
  off<K extends keyof FlowchartEvents>(event: K, listener?: FlowchartEvents[K]): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      if (listener) {
        const index = listeners.indexOf(listener)
        if (index > -1) {
          listeners.splice(index, 1)
        }
      } else {
        listeners.length = 0
      }
    }
  }

  /**
   * 触发事件
   */
  private emit<K extends keyof FlowchartEvents>(event: K, data: Parameters<FlowchartEvents[K]>[0]): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data)
        } catch (error) {
          console.error(`事件处理器执行错误 [${event}]:`, error)
        }
      })
    }
  }

  /**
   * 清空画布数据
   */
  clearData(): void {
    this.lf.clearData()
  }

  /**
   * 获取主题管理器
   */
  getThemeManager(): ThemeManager {
    return this.themeManager
  }

  /**
   * 获取插件管理器
   */
  getPluginManager(): PluginManager {
    return this.pluginManager
  }

  /**
   * 获取容器元素
   */
  getContainer(): HTMLElement {
    return this.lf.container
  }

  /**
   * 判断是否需要初始化UI
   */
  private shouldInitUI(): boolean {
    return this.config.toolbar?.visible !== false ||
      this.config.nodePanel?.visible !== false ||
      this.config.propertyPanel?.visible !== false
  }

  /**
   * 设置UI回调函数
   */
  private setupUICallbacks(): void {
    if (!this.uiManager) return

    this.uiManager.setEventCallbacks({
      onNodeUpdate: (nodeId: string, updates: Partial<ApprovalNodeConfig>) => {
        this.updateNode(nodeId, updates)
      },
      onNodeDelete: (nodeId: string) => {
        this.deleteNode(nodeId)
      },
      onNodeDrop: (nodeType: ApprovalNodeType, position: { x: number; y: number }) => {
        this.addNode({
          type: nodeType,
          x: position.x,
          y: position.y,
          text: this.getDefaultNodeText(nodeType)
        })
      },
      onToolClick: (toolName: string) => {
        this.handleToolClick(toolName)
      },
      onThemeChange: (theme: string) => {
        this.setTheme(theme)
      }
    })
  }

  /**
   * 获取默认节点文本
   */
  private getDefaultNodeText(nodeType: ApprovalNodeType): string {
    const textMap: Record<ApprovalNodeType, string> = {
      'start': '开始',
      'approval': '审批节点',
      'condition': '条件判断',
      'process': '处理节点',
      'end': '结束',
      'parallel-gateway': '并行网关',
      'exclusive-gateway': '排他网关'
    }
    return textMap[nodeType] || '节点'
  }

  /**
   * 处理工具栏点击
   */
  private handleToolClick(toolName: string): void {
    switch (toolName) {
      case 'zoom-fit':
        this.fitView()
        break
      case 'multi-select':
        this.toggleSelectionMode()
        break
      case 'material-repository':
        this.showMaterialRepository()
        break
      case 'undo':
        this.lf.undo()
        break
      case 'redo':
        this.lf.redo()
        break
      case 'delete':
        const selected = this.lf.getSelectElements()
        selected.nodes.forEach(node => this.deleteNode(node.id))
        selected.edges.forEach(edge => this.lf.deleteEdge(edge.id))
        break
      case 'copy':
        // TODO: 实现复制功能
        break
      case 'paste':
        // TODO: 实现粘贴功能
        break
    }
  }

  /**
   * 设置只读模式
   */
  setReadonly(readonly: boolean): void {
    this.config.readonly = readonly
    this.uiManager?.setReadonly(readonly)

    if (readonly) {
      this.lf.updateEditConfig({
        nodeTextEdit: false,
        edgeTextEdit: false,
        nodeSelectedOutline: false,
        edgeSelectedOutline: false
      })
    } else {
      this.lf.updateEditConfig({
        nodeTextEdit: true,
        edgeTextEdit: true,
        nodeSelectedOutline: true,
        edgeSelectedOutline: true
      })
    }
  }

  /**
   * 显示节点右键菜单
   */
  private showNodeContextMenu(event: MouseEvent, nodeData: any): void {
    event.preventDefault()

    const menu = this.createContextMenu([
      {
        label: '复制节点',
        action: () => this.copyNode(nodeData.id)
      },
      {
        label: '删除节点',
        action: () => this.deleteNode(nodeData.id)
      },
      { type: 'separator' },
      {
        label: '编辑属性',
        action: () => this.editNodeProperties(nodeData.id)
      }
    ])

    this.showContextMenu(menu, event.clientX, event.clientY)
  }

  /**
   * 显示画布右键菜单
   */
  private showCanvasContextMenu(event: MouseEvent, position: { x: number, y: number }): void {
    event.preventDefault()

    // 如果position为空，从鼠标事件计算位置
    let pasteX = position?.x
    let pasteY = position?.y

    if (pasteX === undefined || pasteY === undefined) {
      // 从鼠标事件计算画布坐标
      const rect = this.lf.container?.getBoundingClientRect()
      if (rect) {
        pasteX = event.clientX - rect.left
        pasteY = event.clientY - rect.top
      } else {
        pasteX = event.clientX
        pasteY = event.clientY
      }
    }

    const menu = this.createContextMenu([
      {
        label: '粘贴节点',
        action: () => this.pasteNodeAtPosition(pasteX, pasteY),
        disabled: !this.copiedNodeData
      },
      { type: 'separator' },
      {
        label: '清空画布',
        action: () => this.clearCanvas()
      },
      { type: 'separator' },
      {
        label: '网格背景',
        action: () => this.setCanvasBackground('grid'),
        checked: this.currentBackgroundType === 'grid'
      },
      {
        label: 'PS透明背景',
        action: () => this.setCanvasBackground('ps'),
        checked: this.currentBackgroundType === 'ps'
      },
      {
        label: '纯色背景',
        action: () => this.setCanvasBackground('solid'),
        checked: this.currentBackgroundType === 'solid'
      },
      { type: 'separator' },
      {
        label: '适应画布',
        action: () => this.fitView()
      },
      {
        label: '重置缩放',
        action: () => this.lf.resetZoom()
      }
    ])

    this.showContextMenu(menu, event.clientX, event.clientY)
  }

  /**
   * 创建右键菜单
   */
  private createContextMenu(items: Array<{ label: string, action: () => void, disabled?: boolean, checked?: boolean } | { type: 'separator' }>): HTMLElement {
    const menu = document.createElement('div')
    menu.className = 'flowchart-context-menu'
    // 根据主题设置样式
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
    const isBlue = document.documentElement.getAttribute('data-theme') === 'blue'

    menu.style.cssText = `
      position: fixed;
      background: ${isDark ? '#2a2a2a' : 'white'};
      border: 1px solid ${isDark ? '#404040' : '#ddd'};
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,${isDark ? '0.3' : '0.15'});
      padding: 4px 0;
      z-index: 10000;
      min-width: 120px;
      color: ${isDark ? '#ffffff' : '#333333'};
    `

    items.forEach(item => {
      if ('type' in item && item.type === 'separator') {
        const separator = document.createElement('div')
        separator.style.cssText = 'height: 1px; background: #eee; margin: 4px 0;'
        menu.appendChild(separator)
      } else {
        const menuItem = document.createElement('div')

        // 添加选中标记
        if (item.checked) {
          menuItem.innerHTML = `<span style="margin-right: 8px;">✓</span>${item.label}`
        } else {
          menuItem.textContent = item.label
        }

        // 根据主题设置菜单项样式
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
        const checkedBg = isDark ? '#404040' : '#f0f8ff'
        const disabledColor = isDark ? '#666666' : '#ccc'
        const normalColor = isDark ? '#ffffff' : '#333'

        menuItem.style.cssText = `
          padding: 6px 12px;
          cursor: ${item.disabled ? 'not-allowed' : 'pointer'};
          color: ${item.disabled ? disabledColor : normalColor};
          font-size: 12px;
          background-color: ${item.checked ? checkedBg : 'transparent'};
        `

        if (!item.disabled) {
          const hoverBg = isDark ? '#404040' : '#f0f0f0'
          const originalBg = item.checked ? checkedBg : 'transparent'

          menuItem.addEventListener('mouseenter', () => {
            menuItem.style.backgroundColor = hoverBg
          })
          menuItem.addEventListener('mouseleave', () => {
            menuItem.style.backgroundColor = originalBg
          })
          menuItem.addEventListener('click', () => {
            item.action()
            this.hideContextMenu()
          })
        }

        menu.appendChild(menuItem)
      }
    })

    return menu
  }

  /**
   * 显示右键菜单
   */
  private showContextMenu(menu: HTMLElement, x: number, y: number): void {
    // 隐藏之前的菜单
    this.hideContextMenu()

    // 添加到页面
    document.body.appendChild(menu)

    // 调整位置避免超出屏幕
    const rect = menu.getBoundingClientRect()
    const maxX = window.innerWidth - rect.width
    const maxY = window.innerHeight - rect.height

    menu.style.left = Math.min(x, maxX) + 'px'
    menu.style.top = Math.min(y, maxY) + 'px'

    // 点击其他地方隐藏菜单
    setTimeout(() => {
      document.addEventListener('click', this.hideContextMenu.bind(this), { once: true })
    }, 0)
  }

  /**
   * 隐藏右键菜单
   */
  private hideContextMenu(): void {
    const existingMenu = document.querySelector('.flowchart-context-menu')
    if (existingMenu) {
      existingMenu.remove()
    }
  }



  /**
   * 复制节点
   */
  private copyNode(nodeId: string): void {
    const nodeModel = this.lf.getNodeModelById(nodeId)
    if (nodeModel) {
      this.copiedNodeData = {
        id: nodeModel.id,
        type: nodeModel.type,
        x: nodeModel.x,
        y: nodeModel.y,
        text: nodeModel.text?.value || '',
        properties: nodeModel.properties || {}
      }
      console.log('节点已复制:', this.copiedNodeData.text)
    }
  }

  /**
   * 在指定位置粘贴节点（右键菜单）
   */
  private pasteNodeAtPosition(x: number, y: number): void {
    if (this.copiedNodeData) {
      const nodeId = this.addNode({
        type: this.copiedNodeData.type as ApprovalNodeType,
        x,
        y,
        text: this.copiedNodeData.text,
        properties: this.copiedNodeData.properties
      })
      console.log('节点已粘贴到位置:', x, y)
      return nodeId
    }
  }

  /**
   * 粘贴节点（快捷键，在原位置右下方偏移）
   */
  private pasteNodeWithOffset(): void {
    if (this.copiedNodeData) {
      const offsetX = this.copiedNodeData.x + 50
      const offsetY = this.copiedNodeData.y + 50

      const nodeId = this.addNode({
        type: this.copiedNodeData.type as ApprovalNodeType,
        x: offsetX,
        y: offsetY,
        text: this.copiedNodeData.text,
        properties: this.copiedNodeData.properties
      })
      console.log('节点已粘贴到偏移位置:', offsetX, offsetY)
      return nodeId
    }
  }

  /**
   * 清空画布
   */
  private clearCanvas(): void {
    if (confirm('确定要清空画布吗？此操作不可撤销。')) {
      this.lf.clearData()
      this.selectedNode = null
      this.selectedEdge = null
      this.uiManager?.setSelectedNode(null)
      this.uiManager?.setSelectedEdge(null)
      console.log('画布已清空')
    }
  }

  /**
   * 删除节点
   */
  private deleteNode(nodeId: string): void {
    this.lf.deleteNode(nodeId)
    console.log('节点已删除')
  }

  /**
   * 编辑节点属性
   */
  private editNodeProperties(nodeId: string): void {
    const nodeModel = this.lf.getNodeModelById(nodeId)
    if (nodeModel) {
      // 选中节点以显示属性面板
      this.selectedNode = {
        id: nodeModel.id,
        type: nodeModel.type as ApprovalNodeType,
        x: nodeModel.x,
        y: nodeModel.y,
        text: nodeModel.text?.value || '',
        properties: nodeModel.properties || {}
      }
      this.uiManager?.setSelectedNode(this.selectedNode)
    }
  }

  /**
   * 启用多选模式
   */
  enableSelectionMode(): void {
    this.isSelectionMode = true
    this.lf.extension.selectionSelect.openSelectionSelect()
    console.log('多选模式已启用')
  }

  /**
   * 禁用多选模式
   */
  disableSelectionMode(): void {
    this.isSelectionMode = false
    this.lf.extension.selectionSelect.closeSelectionSelect()
    console.log('多选模式已禁用')
  }

  /**
   * 切换多选模式
   */
  toggleSelectionMode(): void {
    if (this.isSelectionMode) {
      this.disableSelectionMode()
    } else {
      this.enableSelectionMode()
    }
  }

  /**
   * 设置选择敏感度
   * @param isWholeEdge 是否需要整条边都在选择框内
   * @param isWholeNode 是否需要整个节点都在选择框内
   */
  setSelectionSensitivity(isWholeEdge: boolean = true, isWholeNode: boolean = true): void {
    this.lf.extension.selectionSelect.setSelectionSense(isWholeEdge, isWholeNode)
    console.log(`选择敏感度已设置: 整条边=${isWholeEdge}, 整个节点=${isWholeNode}`)
  }

  /**
   * 设置排他选择模式
   * @param exclusive 是否启用排他模式
   */
  setExclusiveSelectionMode(exclusive: boolean): void {
    this.lf.extension.selectionSelect.setExclusiveMode(exclusive)
    console.log(`排他选择模式: ${exclusive ? '已启用' : '已禁用'}`)
  }

  /**
   * 获取当前选中的所有元素
   */
  getSelectedElements(): any[] {
    return this.lf.getSelectElements()
  }

  /**
   * 清空所有选中的元素
   */
  clearSelection(): void {
    this.lf.clearSelectElements()
    console.log('已清空所有选中元素')
  }

  /**
   * 多选节点（按ID）
   * @param nodeIds 节点ID数组
   */
  selectMultipleNodes(nodeIds: string[]): void {
    // 先清空选择
    this.clearSelection()

    // 逐个选择节点
    nodeIds.forEach((nodeId, index) => {
      this.lf.selectElementById(nodeId, index > 0) // 第一个不是多选，后续都是多选
    })

    console.log(`已选中 ${nodeIds.length} 个节点`)
  }

  /**
   * 加载物料仓库
   */
  private loadMaterialRepository(): void {
    // 尝试从本地存储加载
    this.materialRepositoryManager.loadFromLocalStorage()
  }

  /**
   * 保存物料仓库
   */
  private saveMaterialRepository(): void {
    this.materialRepositoryManager.saveToLocalStorage()
  }

  /**
   * 显示物料仓库面板
   */
  showMaterialRepository(): void {
    if (this.materialRepositoryPanel) {
      return // 已经显示
    }

    this.materialRepositoryPanel = new MaterialRepositoryPanel({
      container: document.body,
      repositoryManager: this.materialRepositoryManager,
      onMaterialSelect: (material) => {
        // 将自定义物料添加到画布
        this.addCustomMaterialToCanvas(material)
      },
      onClose: () => {
        this.materialRepositoryPanel = null
        this.saveMaterialRepository()
      }
    })
  }

  /**
   * 添加自定义物料到画布
   */
  private addCustomMaterialToCanvas(material: any): void {
    // 在画布中心添加物料
    const canvasCenter = this.getCanvasCenter()

    const nodeConfig = {
      type: 'custom-material',
      x: canvasCenter.x,
      y: canvasCenter.y,
      text: material.name,
      properties: {
        material: material // 将完整的物料数据传递给节点
      }
    }

    // 使用LogicFlow的addNode方法
    const nodeId = this.lf.addNode(nodeConfig)
    console.log(`自定义物料"${material.name}"已添加到画布，节点ID: ${nodeId}`)
  }

  /**
   * 获取画布中心点
   */
  private getCanvasCenter(): { x: number, y: number } {
    const container = this.lf.container
    if (!container) {
      return { x: 200, y: 200 }
    }

    const rect = container.getBoundingClientRect()
    const transform = this.lf.getTransform()

    return {
      x: (rect.width / 2 - transform.TRANSLATE_X) / transform.SCALE_X,
      y: (rect.height / 2 - transform.TRANSLATE_Y) / transform.SCALE_Y
    }
  }

  /**
   * 更新物料面板配置
   */
  private updateMaterialPanelConfig(): void {
    if (!this.uiManager) return

    // 获取物料面板组件
    const materialPanel = this.uiManager.getComponent('material')
    if (materialPanel && typeof materialPanel.updateConfig === 'function') {
      materialPanel.updateConfig({
        materialRepositoryManager: this.materialRepositoryManager,
        onCustomMaterialAdd: (material: any, position: { x: number, y: number }) => {
          this.addCustomMaterialToCanvas(material)
        }
      })
    }
  }

  /**
   * 销毁编辑器
   */
  destroy(): void {
    // 销毁物料仓库面板
    this.materialRepositoryPanel?.destroy()
    this.materialRepositoryPanel = null

    // 保存物料仓库
    this.saveMaterialRepository()

    // 销毁物料仓库管理器
    this.materialRepositoryManager?.destroy()

    // 销毁UI管理器
    if (this.uiManager) {
      this.uiManager.destroy()
    }

    // 卸载所有插件
    if (this.pluginManager) {
      this.pluginManager.uninstallAll()
    }

    // 清除所有事件监听
    if (this.eventListeners) {
      this.eventListeners.clear()
    }

    // 清除键盘事件监听器
    if (this.keyboardEventListener) {
      document.removeEventListener('keydown', this.keyboardEventListener)
      this.keyboardEventListener = undefined
    }

    // 销毁 LogicFlow 实例
    if (this.lf && typeof this.lf.destroy === 'function') {
      this.lf.destroy()
    }
  }
}
