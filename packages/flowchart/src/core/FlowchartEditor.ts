/**
 * 审批流程图编辑器核心类
 * 
 * 基于 @logicflow/core 实现的审批流程图编辑器，
 * 提供完整的流程图编辑功能。
 */

import LogicFlow from '@logicflow/core'
import { SelectionSelect } from '@logicflow/extension'
// CSS 导入在构建时会被处理，这里先注释掉
// import '@logicflow/extension/lib/style/index.css'
import type {
  FlowchartEditorConfig,
  FlowchartData,
  ApprovalNodeConfig,
  ApprovalEdgeConfig,
  FlowchartEvents,
  ThemeConfig,
  ApprovalNodeType,
  ApprovalEdgeType,
  Point
} from '../types'
import { ThemeManager } from '../themes/ThemeManager'
import { PluginManager } from '../plugins/PluginManager'
import { HistoryPlugin } from '../plugins/builtin/HistoryPlugin'
import { registerApprovalNodes } from '../nodes'
import { registerApprovalEdges } from '../edges'
import { defaultConfig } from '../config/defaultConfig'
import { UIManager } from '../ui/UIManager'
import { MaterialRepositoryManager } from '../materials/MaterialRepositoryManager'
import { MaterialRepositoryPanel } from '../ui/native/MaterialRepositoryPanel'
import { validateFlowchart, type ValidationResult } from '../utils/validation'
import { exportFlowchart, downloadExportedFile, type ExportFormat, type ExportOptions } from '../utils/export'
import { getClipboardManager, type PasteOptions } from '../utils/clipboard'
import { TemplateManager, type FlowchartTemplate, type TemplateMetadata, type TemplateFilter, type TemplateSortOptions } from '../templates'
import { PerformanceMonitor, type PerformanceReport } from '../performance/PerformanceMonitor'
import { VirtualRenderer, BatchDOMUpdater } from '../performance/VirtualRenderer'
import { MemoryOptimizer, type MemoryUsageInfo, type MemoryOptimizationStats } from '../performance/MemoryOptimizer'
import { InteractionOptimizer, type InteractionStats, type DragStats, type ZoomStats } from '../performance/InteractionOptimizer'
import { ToastManager } from '../ui/native/Toast'
import { UpdateScheduler, UpdatePriority, defaultUpdateScheduler } from './UpdateScheduler'
import { ViewportService, type ViewportServiceConfig, type ViewportTransform, type ViewportBounds } from './ViewportService'

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
  private clipboardManager = getClipboardManager()
  private templateManager!: TemplateManager
  private performanceMonitor!: PerformanceMonitor
  private virtualRenderer!: VirtualRenderer
  private batchDOMUpdater!: BatchDOMUpdater
  private memoryOptimizer!: MemoryOptimizer
  private interactionOptimizer!: InteractionOptimizer
  private toastManager!: ToastManager
  private updateScheduler: UpdateScheduler
  private viewportService!: ViewportService

  /**
   * 构造函数
   * @param config 编辑器配置
   */
  constructor(config: FlowchartEditorConfig) {
    this.config = { ...defaultConfig, ...config }

    // 初始化更新调度器
    this.updateScheduler = config.updateScheduler || defaultUpdateScheduler

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

    // 初始化模板管理器
    this.templateManager = new TemplateManager()
    this.initializeTemplateManager()

    // 初始化性能监控器
    this.performanceMonitor = new PerformanceMonitor({
      enabled: this.config.performance?.enabled ?? true,
      sampleInterval: this.config.performance?.sampleInterval ?? 1000,
      maxHistorySize: this.config.performance?.maxHistorySize ?? 100,
      monitorMemory: this.config.performance?.monitorMemory ?? true,
      monitorFPS: this.config.performance?.monitorFPS ?? true
    })
    this.initializePerformanceMonitor()

    // 初始化虚拟渲染器
    this.virtualRenderer = new VirtualRenderer({
      enabled: this.config.performance?.enabled ?? true,
      bufferSize: 200,
      maxVisibleNodes: 500,
      maxVisibleEdges: 1000
    })

    // 初始化批量DOM更新器
    this.batchDOMUpdater = new BatchDOMUpdater()

    // 初始化内存优化器
    this.memoryOptimizer = new MemoryOptimizer({
      enabled: this.config.performance?.enabled ?? true,
      maxPoolSize: 1000,
      enableEventDelegation: true,
      enableDataCompression: true,
      gcInterval: 30000, // 30秒
      memoryThreshold: 100 // 100MB
    })

    // 初始化交互优化器
    this.interactionOptimizer = new InteractionOptimizer({
      enabled: this.config.performance?.enabled ?? true,
      debounceDelay: 100,
      throttleInterval: 16, // 60fps
      enableAsyncRender: true,
      asyncRenderBatchSize: 10,
      enableSmartUpdate: true,
      updateThreshold: 100
    })

    // 初始化Toast通知系统
    this.toastManager = new ToastManager({
      position: 'top-right',
      maxToasts: 5
    })

    // 初始化视口服务
    this.viewportService = new ViewportService(this.lf, this.config.viewport)

    // 更新UI管理器的物料面板配置
    this.updateMaterialPanelConfig()

    // 注册审批流程节点和边
    this.registerElements()

    // 设置主题
    if (this.config.theme) {
      this.setTheme(this.config.theme)
    }

    // 安装默认插件
    this.installDefaultPlugins()

    // 安装用户自定义插件
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
      // 启动背景监控
      this.startBackgroundMonitor()
    }, 100)
  }

  /**
   * 初始化 LogicFlow
   */
  private initLogicFlow(): void {
    let container: HTMLElement

    if (this.uiManager) {
      // 设置UI管理器的编辑器引用
      this.uiManager.setEditor(this)
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
      // 禁用双击编辑
      nodeTextEdit: false,
      edgeTextEdit: false,
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
        background-image:
          radial-gradient(circle, #d9d9d9 1px, transparent 1px);
        background-size: 20px 20px;
      }

      .lf-canvas-overlay.grid-background .lf-grid {
        opacity: 0.6;
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
        background-image:
          radial-gradient(circle, #404040 1px, transparent 1px);
        background-size: 20px 20px;
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
          if (isCtrlOrCmd) {
            event.preventDefault()
            this.copySelectedElements()
          }
          break

        case 'v':
          if (isCtrlOrCmd) {
            event.preventDefault()
            this.pasteElements()
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
   * 安装默认插件
   */
  private installDefaultPlugins(): void {
    // 安装历史记录插件
    const historyPlugin = new HistoryPlugin({
      maxSize: 50 // 最多保存50条历史记录
    })
    this.pluginManager.install(historyPlugin)
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

      // 使用调度器优化UI更新
      this.updateScheduler.schedule(
        `node-select-${nodeConfig.id}`,
        () => this.uiManager?.setSelectedNode(nodeConfig),
        UpdatePriority.HIGH
      )

      this.emit('node:click', { node: nodeConfig, event: data.e })
    })

    // 禁用双击节点功能，避免意外进入编辑模式
    // this.lf.on('node:dblclick', (data) => {
    //   this.emit('node:dblclick', { node: data.data, event: data.e })
    // })

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

        // 使用调度器更新UI，避免频繁重绘
        this.updateScheduler.schedule(
          `node-drag-${data.data.id}`,
          () => this.uiManager?.setSelectedNode(updatedNode),
          UpdatePriority.HIGH
        )
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

        // 使用调度器批量更新UI和数据
        this.updateScheduler.schedule(
          `node-drop-ui-${data.data.id}`,
          () => this.uiManager?.setSelectedNode(updatedNode),
          UpdatePriority.NORMAL
        )

        this.updateScheduler.schedule(
          `node-drop-data-${data.data.id}`,
          () => this.emit('data:change', this.getData()),
          UpdatePriority.NORMAL
        )
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

      // 使用调度器优化边选择UI更新
      this.updateScheduler.schedule(
        `edge-select-${this.selectedEdge?.id}`,
        () => this.uiManager?.setSelectedEdge(this.selectedEdge),
        UpdatePriority.HIGH
      )

      this.emit('edge:click', { edge: data.data, event: data.e })
      this.emit('edge:select', { edge: data.data, event: data.e })
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

      // 使用调度器批量清除选择状态
      this.updateScheduler.schedule(
        'canvas-click-clear-selection',
        () => {
          this.uiManager?.setSelectedNode(null)
          this.uiManager?.setSelectedEdge(null)
        },
        UpdatePriority.HIGH
      )

      this.emit('canvas:click', { event: data.e, position: data.position })
    })

    // 画布右键菜单
    this.lf.on('blank:contextmenu', (data) => {
      this.showCanvasContextMenu(data.e, data.position)
    })

    // 选择变化事件
    this.lf.on('selection:selected', (data) => {
      const selected = this.lf.getSelectElements()
      if (selected.nodes.length > 0 || selected.edges.length > 0) {
        this.showInfo(`已选中 ${selected.nodes.length} 个节点和 ${selected.edges.length} 条连线`, 2000)
      }
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

      // 使用调度器延迟数据变化事件
      this.updateScheduler.schedule(
        'selection-drop-data-change',
        () => this.emit('data:change', this.getData()),
        UpdatePriority.NORMAL
      )
    })

    // 数据变化事件
    this.lf.on('history:change', () => {
      this.emit('data:change', this.getData())
    })

    // 画布变换事件 - 在拖动时维护背景
    this.lf.on('graph:transform', () => {
      // 使用调度器优化背景更新
      this.updateScheduler.schedule(
        'graph-transform-background',
        () => this.forceApplyBackground(),
        UpdatePriority.LOW
      )

      // 延迟再次确保
      setTimeout(() => {
        this.updateScheduler.schedule(
          'graph-transform-background-delayed',
          () => this.forceApplyBackground(),
          UpdatePriority.LOW
        )
      }, 10)
    })

    // 画布渲染完成事件
    this.lf.on('graph:rendered', () => {
      // 使用调度器确保背景在渲染后保持
      this.updateScheduler.schedule(
        'graph-rendered-background',
        () => this.forceApplyBackground(),
        UpdatePriority.LOW
      )

      // 延迟再次确保
      setTimeout(() => {
        this.updateScheduler.schedule(
          'graph-rendered-background-delayed',
          () => this.forceApplyBackground(),
          UpdatePriority.LOW
        )
      }, 50)
    })



    // 监听鼠标事件来在拖动时维护背景
    if (this.lf.container) {
      let isDragging = false
      let lastApplyTime = 0

      this.lf.container.addEventListener('mousedown', () => {
        isDragging = true
        // 拖动开始时应用背景
        this.forceApplyBackground()
      })

      this.lf.container.addEventListener('mousemove', () => {
        if (isDragging) {
          // 限制频率，每50ms最多应用一次
          const now = Date.now()
          if (now - lastApplyTime > 50) {
            this.forceApplyBackground()
            lastApplyTime = now
          }
        }
      })

      this.lf.container.addEventListener('mouseup', () => {
        if (isDragging) {
          isDragging = false
          // 拖动结束时使用温和的方式应用背景，避免闪动
          this.smoothApplyBackground()
        }
      })

      // 监听鼠标离开，确保状态重置
      this.lf.container.addEventListener('mouseleave', () => {
        if (isDragging) {
          isDragging = false
          setTimeout(() => this.forceApplyBackground(), 10)
        }
      })
    }
  }

  /**
   * 渲染编辑器
   */
  render(data?: FlowchartData): void {
    this.markRenderStart()

    if (data && this.config.performance?.enabled) {
      // 使用虚拟渲染优化大型数据
      const optimizedData = this.optimizeRenderData(data)
      this.lf.render(optimizedData)
    } else {
      this.lf.render(data)
    }


    this.markRenderEnd()
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
    this.viewportService.fitView({ animated: true })
  }

  /**
   * 适配到选中元素
   */
  fitToSelection(): void {
    this.viewportService.fitToSelection({ animated: true })
  }

  /**
   * 获取视口变换信息
   */
  getViewportTransform(): ViewportTransform {
    return this.viewportService.getTransform()
  }

  /**
   * 获取视口边界
   */
  getViewportBounds(): ViewportBounds {
    return this.viewportService.getBounds()
  }

  /**
   * 屏幕坐标转画布坐标
   */
  screenToCanvas(point: Point): Point {
    return this.viewportService.screenToCanvas(point)
  }

  /**
   * 画布坐标转屏幕坐标
   */
  canvasToScreen(point: Point): Point {
    return this.viewportService.canvasToScreen(point)
  }

  /**
   * 缩放到指定比例
   */
  zoomTo(scale: number, animated = true): void {
    this.viewportService.zoomTo(scale, { animated })
  }

  /**
   * 放大
   */
  zoomIn(animated = true): void {
    this.viewportService.zoomIn({ animated })
  }

  /**
   * 缩小
   */
  zoomOut(animated = true): void {
    this.viewportService.zoomOut({ animated })
  }

  /**
   * 重置缩放
   */
  zoomReset(animated = true): void {
    this.viewportService.zoomReset({ animated })
  }

  /**
   * 平移到指定位置
   */
  panTo(x: number, y: number, animated = true): void {
    this.viewportService.panTo(x, y, { animated })
  }

  /**
   * 居中到指定点
   */
  centerTo(point: Point, animated = true): void {
    this.viewportService.centerTo(point, { animated })
  }

  /**
   * 旧版本兼容方法 - 缩放到适应内容（已废弃，请使用 fitView）
   * @deprecated 请使用 fitView() 方法
   */
  _legacyFitView(): void {
    try {
      // 获取所有节点的边界
      const graphData = this.lf.getGraphData()
      if (!graphData.nodes || graphData.nodes.length === 0) {
        console.warn('没有节点可以适应')
        return
      }

      // 使用新的 ViewportService 实现
      this.fitView()
    } catch (error) {
      console.error('旧版适应视图失败:', error)
    }
  }

  /**
   * 设置缩放比例（兼容旧版本）
   * @deprecated 请使用 zoomTo() 方法
   */
  zoom(scale: number): void {
    this.zoomTo(scale, false)
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
   * 获取插件实例
   */
  getPlugin(name: string): any {
    return this.pluginManager.getPlugin(name)
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
      onCustomMaterialDrop: (materialId: string, position: { x: number; y: number }) => {
        this.addCustomMaterialNode(materialId, position)
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
      'user-task': '用户任务',
      'service-task': '服务任务',
      'script-task': '脚本任务',
      'manual-task': '手工任务',
      'parallel-gateway': '并行网关',
      'exclusive-gateway': '排他网关',
      'inclusive-gateway': '包容网关',
      'event-gateway': '事件网关',
      'timer-event': '定时事件',
      'message-event': '消息事件',
      'signal-event': '信号事件'
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
      case 'history':
        this.toggleHistoryPanel()
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
      case 'clear':
        this.clearCanvas()
        break
      case 'validate':
        this.showValidationDialog()
        break
      case 'export':
        this.showExportDialog()
        break
      case 'download':
        this.exportAndDownload('json')
        break
      case 'copy':
        this.copySelectedElements()
        break
      case 'paste':
        this.pasteElements()
        break
      case 'template-library':
        this.showTemplateSelector()
        break
      case 'template-save':
        this.showSaveTemplateDialog()
        break
      case 'template-load':
        this.showTemplateSelector()
        break
      case 'template-new':
        this.showSaveTemplateDialog()
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
        if ('checked' in item && item.checked) {
          menuItem.innerHTML = `<span style="margin-right: 8px;">✓</span>${item.label}`
        } else if ('label' in item) {
          menuItem.textContent = item.label
        }

        // 根据主题设置菜单项样式
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
        const checkedBg = isDark ? '#404040' : '#f0f8ff'
        const disabledColor = isDark ? '#666666' : '#ccc'
        const normalColor = isDark ? '#ffffff' : '#333'

        const isDisabled = 'disabled' in item && item.disabled
        const isChecked = 'checked' in item && item.checked

        menuItem.style.cssText = `
          padding: 6px 12px;
          cursor: ${isDisabled ? 'not-allowed' : 'pointer'};
          color: ${isDisabled ? disabledColor : normalColor};
          font-size: 12px;
          background-color: ${isChecked ? checkedBg : 'transparent'};
        `

        if (!isDisabled) {
          const hoverBg = isDark ? '#404040' : '#f0f0f0'
          const originalBg = isChecked ? checkedBg : 'transparent'

          menuItem.addEventListener('mouseenter', () => {
            menuItem.style.backgroundColor = hoverBg
          })
          menuItem.addEventListener('mouseleave', () => {
            menuItem.style.backgroundColor = originalBg
          })
          menuItem.addEventListener('click', () => {
            if ('action' in item) {
              item.action()
            }
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
      this.showSuccess(`节点已复制: ${this.copiedNodeData.text}`, 2000)
    }
  }

  /**
   * 在指定位置粘贴节点（右键菜单）
   */
  private pasteNodeAtPosition(x: number, y: number): string | undefined {
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
  private pasteNodeWithOffset(): string | undefined {
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
      this.showSuccess('画布已清空', 2000)
    }
  }

  /**
   * 删除节点（私有方法）
   */
  private deleteNodeInternal(nodeId: string): void {
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
    const selected = this.lf.getSelectElements()
    return Array.isArray(selected) ? selected : []
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
   * 切换历史记录面板
   */
  private toggleHistoryPanel(): void {
    if (this.uiManager) {
      this.uiManager.toggleHistoryPanel()
    }
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
   * 通过拖拽添加自定义物料节点
   */
  private addCustomMaterialNode(materialId: string, position: { x: number; y: number }): void {
    // 从物料仓库获取物料数据
    const material = this.materialRepositoryManager.getMaterial(materialId)
    if (!material) {
      console.error(`找不到物料: ${materialId}`)
      return
    }

    // UIManager已经进行了坐标转换，直接使用传入的position
    const nodeConfig = {
      type: 'custom-material',
      x: position.x,
      y: position.y,
      text: material.name,
      properties: {
        material: material // 将完整的物料数据传递给节点
      }
    }

    // 使用LogicFlow的addNode方法
    const nodeId = this.lf.addNode(nodeConfig)
    console.log(`自定义物料"${material.name}"已拖拽添加到画布，节点ID: ${nodeId}，位置: (${position.x}, ${position.y})`)

    // 触发数据变化事件
    this.emit('data:change', this.getData())
  }

  /**
   * 启动背景监控，确保背景在DOM变化后能够保持
   */
  private startBackgroundMonitor(): void {
    // 使用更温和的监控策略，减少闪动
    if (this.lf.container) {
      let isApplying = false // 防止递归调用
      let lastCheckTime = 0 // 防止频繁检查

      const observer = new MutationObserver((mutations) => {
        if (isApplying) return

        const now = Date.now()
        // 限制检查频率，至少间隔500ms
        if (now - lastCheckTime < 500) return

        // 只在canvas-overlay的class属性变化时检查
        const hasRelevantChange = mutations.some(mutation => {
          if (mutation.type !== 'attributes' || mutation.attributeName !== 'class') return false
          const target = mutation.target as HTMLElement
          return target.classList.contains('lf-canvas-overlay')
        })

        if (hasRelevantChange) {
          lastCheckTime = now
          // 延迟检查，避免在拖动过程中触发
          setTimeout(() => {
            if (!isApplying) {
              this.ensureBackgroundApplied()
            }
          }, 200)
        }
      })

      observer.observe(this.lf.container, {
        attributes: true,
        attributeFilter: ['class'],
        subtree: true
      })

      // 进一步减少定期检查频率
      setInterval(() => {
        if (!isApplying) {
          this.ensureBackgroundApplied()
        }
      }, 10000) // 改为10秒检查一次
    }
  }

  /**
   * 强制应用背景（更激进的方法）
   */
  private forceApplyBackground(): void {
    const canvasOverlay = this.lf.container?.querySelector('.lf-canvas-overlay') as HTMLElement
    if (canvasOverlay) {
      // 获取目标类和样式
      const targetClass = this.currentBackgroundType === 'ps' ? 'ps-background' :
        this.currentBackgroundType === 'solid' ? 'solid-background' : 'grid-background'
      const targetStyle = this.getBackgroundStyle()
      const targetSize = this.getBackgroundSize()

      // 检查是否已经有正确的类和样式
      const hasCorrectClass = canvasOverlay.classList.contains(targetClass)
      const currentStyle = canvasOverlay.style.backgroundImage

      if (!hasCorrectClass || currentStyle !== targetStyle) {
        // 平滑地应用背景，避免闪动
        canvasOverlay.classList.remove('ps-background', 'solid-background', 'grid-background')
        canvasOverlay.classList.add(targetClass)

        // 直接设置样式属性，确保立即生效
        canvasOverlay.style.backgroundImage = targetStyle
        canvasOverlay.style.backgroundSize = targetSize
        canvasOverlay.style.backgroundRepeat = 'repeat'
        canvasOverlay.style.backgroundPosition = '0 0'
      }
    }
  }

  /**
   * 获取背景样式
   */
  private getBackgroundStyle(): string {
    switch (this.currentBackgroundType) {
      case 'grid':
        return 'radial-gradient(circle, #d9d9d9 1px, transparent 1px)'
      case 'ps':
        return 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)'
      case 'solid':
        return 'none'
      default:
        return 'radial-gradient(circle, #d9d9d9 1px, transparent 1px)'
    }
  }

  /**
   * 获取背景尺寸
   */
  private getBackgroundSize(): string {
    switch (this.currentBackgroundType) {
      case 'grid':
        return '20px 20px'
      case 'ps':
        return '20px 20px, 20px 20px, 20px 20px, 20px 20px'
      case 'solid':
        return 'auto'
      default:
        return '20px 20px'
    }
  }

  /**
   * 平滑应用背景（专门用于松手时，避免闪动）
   */
  private smoothApplyBackground(): void {
    const canvasOverlay = this.lf.container?.querySelector('.lf-canvas-overlay') as HTMLElement
    if (canvasOverlay) {
      const targetClass = this.currentBackgroundType === 'ps' ? 'ps-background' :
        this.currentBackgroundType === 'solid' ? 'solid-background' : 'grid-background'

      // 使用requestAnimationFrame确保在下一帧应用，避免闪动
      requestAnimationFrame(() => {
        if (!canvasOverlay.classList.contains(targetClass)) {
          canvasOverlay.classList.remove('ps-background', 'solid-background', 'grid-background')
          canvasOverlay.classList.add(targetClass)

          // 设置样式，但不强制重绘
          canvasOverlay.style.backgroundImage = this.getBackgroundStyle()
          canvasOverlay.style.backgroundSize = this.getBackgroundSize()
        }

        // 延迟再次确保，但使用更长的延迟避免闪动
        setTimeout(() => {
          if (!canvasOverlay.classList.contains(targetClass)) {
            this.forceApplyBackground()
          }
        }, 200)
      })
    }
  }

  /**
   * 确保背景已应用（温和的方法）
   */
  private ensureBackgroundApplied(): void {
    const canvasOverlay = this.lf.container?.querySelector('.lf-canvas-overlay') as HTMLElement
    if (canvasOverlay) {
      const hasBackgroundClass = canvasOverlay.classList.contains('grid-background') ||
        canvasOverlay.classList.contains('ps-background') ||
        canvasOverlay.classList.contains('solid-background')

      if (!hasBackgroundClass) {
        this.forceApplyBackground()
      }
    }
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
   * 进入节点编辑模式
   */
  private enterNodeEditMode(nodeData: any): void {
    // 转换为标准节点配置
    const nodeConfig: ApprovalNodeConfig = {
      id: nodeData.id,
      type: nodeData.type as ApprovalNodeType,
      x: nodeData.x,
      y: nodeData.y,
      text: nodeData.text?.value || nodeData.text || '',
      properties: nodeData.properties || {}
    }

    // 选中节点并显示属性面板
    this.selectedNode = nodeConfig
    this.uiManager?.setSelectedNode(nodeConfig)

    // 如果有属性面板，聚焦到文本输入框
    setTimeout(() => {
      const textInput = document.querySelector('.property-item input[type="text"]') as HTMLInputElement
      if (textInput) {
        textInput.focus()
        textInput.select()
      }
    }, 100)

    console.log(`进入节点编辑模式: ${nodeConfig.type} - ${nodeConfig.text}`)
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


    // 销毁Toast管理器
    if (this.toastManager) {
      this.toastManager.destroy()
    }

    // 销毁视口服务
    if (this.viewportService) {
      this.viewportService.destroy()
    }

    // 销毁更新调度器
    if (this.updateScheduler) {
      this.updateScheduler.destroy()
    }

    // 销毁 LogicFlow 实例
    if (this.lf && typeof this.lf.destroy === 'function') {
      this.lf.destroy()
    }
  }

  /**
   * 验证流程图
   * @returns 验证结果
   */
  validateFlowchart(): ValidationResult {
    const data = this.getData()
    return validateFlowchart(data)
  }

  /**
   * 检查流程图是否有效
   * @returns 是否有效
   */
  isValid(): boolean {
    return this.validateFlowchart().valid
  }

  /**
   * 导出流程图数据
   * @param format 导出格式
   * @param options 导出选项
   * @returns 导出结果
   */
  async exportData(format: ExportFormat, options?: Partial<ExportOptions>): Promise<any> {
    const data = this.getData()
    const exportOptions: ExportOptions = {
      format,
      filename: options?.filename || `flowchart_${Date.now()}`,
      includeValidation: options?.includeValidation ?? true,
      prettify: options?.prettify ?? true,
      ...options
    }

    return exportFlowchart(data, format, exportOptions.filename)
  }

  /**
   * 导出并下载流程图文件
   * @param format 导出格式
   * @param filename 文件名（可选）
   */
  async exportAndDownload(format: ExportFormat, filename?: string): Promise<void> {
    try {
      const result = await this.exportData(format, { filename })
      if (result.success) {
        downloadExportedFile(result)
        this.emit('export:success', { format, filename: result.filename })
      } else {
        console.error('导出失败:', result.error)
        this.emit('export:error', { format, error: result.error })
      }
    } catch (error) {
      console.error('导出过程中发生错误:', error)
      this.emit('export:error', { format, error: error instanceof Error ? error.message : String(error) })
    }
  }

  /**
   * 获取流程图验证报告
   * @returns 验证报告的HTML字符串
   */
  getValidationReport(): string {
    const validation = this.validateFlowchart()

    let html = '<div class="validation-report">'
    html += `<h3>流程图验证报告</h3>`
    html += `<p class="status ${validation.valid ? 'valid' : 'invalid'}">`
    html += validation.valid ? '✅ 流程图验证通过' : '❌ 流程图验证失败'
    html += '</p>'

    if (validation.errors.length > 0) {
      html += '<div class="errors">'
      html += '<h4>错误信息：</h4>'
      html += '<ul>'
      validation.errors.forEach(error => {
        html += `<li class="error">${error.message}</li>`
      })
      html += '</ul>'
      html += '</div>'
    }

    if (validation.warnings.length > 0) {
      html += '<div class="warnings">'
      html += '<h4>警告信息：</h4>'
      html += '<ul>'
      validation.warnings.forEach(warning => {
        html += `<li class="warning">${warning.message}</li>`
      })
      html += '</ul>'
      html += '</div>'
    }

    html += '</div>'
    return html
  }

  /**
   * 显示验证结果对话框
   */
  showValidationDialog(): void {
    const validation = this.validateFlowchart()
    const reportHtml = this.getValidationReport()

    // 创建对话框
    const dialog = document.createElement('div')
    dialog.className = 'validation-dialog-overlay'
    dialog.innerHTML = `
      <div class="validation-dialog">
        <div class="validation-dialog-header">
          <h3>流程图验证</h3>
          <button class="close-btn" onclick="this.closest('.validation-dialog-overlay').remove()">×</button>
        </div>
        <div class="validation-dialog-content">
          ${reportHtml}
        </div>
        <div class="validation-dialog-footer">
          <button class="btn btn-primary" onclick="this.closest('.validation-dialog-overlay').remove()">确定</button>
        </div>
      </div>
    `

    // 添加样式
    const style = document.createElement('style')
    style.textContent = `
      .validation-dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(4px);
        animation: fadeIn 0.3s ease-out;
      }
      .validation-dialog {
        background: var(--ldesign-bg-color-container, #ffffff);
        border-radius: var(--ls-border-radius-lg, 12px);
        box-shadow: var(--ldesign-shadow-3, 0 8px 30px rgba(0, 0, 0, 0.12));
        max-width: 600px;
        width: 90vw;
        max-height: 80vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        border: 1px solid var(--ldesign-border-color, #e5e5e5);
        animation: slideIn 0.3s ease-out;
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideIn {
        from { transform: translateY(-20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      .validation-dialog-header {
        padding: var(--ls-padding-base, 20px);
        border-bottom: 1px solid var(--ldesign-border-color, #e5e5e5);
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: var(--ldesign-bg-color-component, #fafafa);
      }
      .validation-dialog-header h3 {
        margin: 0;
        color: var(--ldesign-text-color-primary, rgba(0, 0, 0, 0.9));
        font-size: var(--ls-font-size-lg, 20px);
        font-weight: 600;
      }
      .validation-dialog-content {
        padding: var(--ls-padding-base, 20px);
        overflow-y: auto;
        flex: 1;
        background: var(--ldesign-bg-color-container, #ffffff);
      }
      .validation-dialog-footer {
        padding: var(--ls-padding-base, 20px);
        border-top: 1px solid var(--ldesign-border-color, #e5e5e5);
        text-align: right;
        background: var(--ldesign-bg-color-component, #fafafa);
      }
      .validation-report .status.valid {
        color: #52c41a;
      }
      .validation-report .status.invalid {
        color: #ff4d4f;
      }
      .validation-report .errors {
        margin-top: 16px;
      }
      .validation-report .warnings {
        margin-top: 16px;
      }
      .validation-report .error {
        color: #ff4d4f;
        margin: 4px 0;
      }
      .validation-report .warning {
        color: #faad14;
        margin: 4px 0;
      }
      .close-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #999;
      }
      .close-btn:hover {
        color: #333;
      }
      .btn {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      }
      .btn-primary {
        background: #722ED1;
        color: white;
      }
      .btn-primary:hover {
        background: #5e2aa7;
      }
    `
    document.head.appendChild(style)
    document.body.appendChild(dialog)

    // 触发验证事件
    this.emit('validation:show', validation)
  }

  /**
   * 显示导出对话框
   */
  showExportDialog(): void {
    // 创建导出对话框
    const dialog = document.createElement('div')
    dialog.className = 'export-dialog-overlay'
    dialog.innerHTML = `
      <div class="export-dialog">
        <div class="export-dialog-header">
          <h3>导出流程图</h3>
          <button class="close-btn" onclick="this.closest('.export-dialog-overlay').remove()">×</button>
        </div>
        <div class="export-dialog-content">
          <div class="export-options">
            <div class="export-format">
              <label>导出格式：</label>
              <select id="exportFormat" class="format-select">
                <option value="json">JSON 格式</option>
                <option value="xml">XML 格式</option>
                <option value="svg">SVG 图片</option>
                <option value="bpmn">BPMN 格式</option>
              </select>
            </div>
            <div class="export-filename">
              <label>文件名：</label>
              <input type="text" id="exportFilename" class="filename-input" value="flowchart_${Date.now()}" />
            </div>
            <div class="export-options-checkboxes">
              <label class="checkbox-label">
                <input type="checkbox" id="includeValidation" checked />
                包含验证信息
              </label>
              <label class="checkbox-label">
                <input type="checkbox" id="prettifyOutput" checked />
                美化输出格式
              </label>
            </div>
          </div>
        </div>
        <div class="export-dialog-footer">
          <button class="btn btn-secondary" onclick="this.closest('.export-dialog-overlay').remove()">取消</button>
          <button class="btn btn-primary" id="confirmExport">导出</button>
        </div>
      </div>
    `

    // 添加样式
    const style = document.createElement('style')
    style.textContent = `
      .export-dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      }
      .export-dialog {
        background: white;
        border-radius: 8px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        width: 480px;
        max-height: 80vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      .export-dialog-header {
        padding: 20px;
        border-bottom: 1px solid #e5e5e5;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .export-dialog-content {
        padding: 20px;
        flex: 1;
      }
      .export-dialog-footer {
        padding: 20px;
        border-top: 1px solid #e5e5e5;
        text-align: right;
        display: flex;
        gap: 12px;
        justify-content: flex-end;
      }
      .export-options {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .export-format, .export-filename {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .export-format label, .export-filename label {
        min-width: 80px;
        font-weight: 500;
      }
      .format-select, .filename-input {
        flex: 1;
        padding: 8px 12px;
        border: 1px solid #d9d9d9;
        border-radius: 4px;
        font-size: 14px;
      }
      .export-options-checkboxes {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .checkbox-label {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        font-size: 14px;
      }
      .checkbox-label input[type="checkbox"] {
        margin: 0;
      }
      .close-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #999;
      }
      .close-btn:hover {
        color: #333;
      }
      .btn {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      }
      .btn-secondary {
        background: #f5f5f5;
        color: #666;
      }
      .btn-secondary:hover {
        background: #e5e5e5;
      }
      .btn-primary {
        background: #722ED1;
        color: white;
      }
      .btn-primary:hover {
        background: #5e2aa7;
      }
    `
    document.head.appendChild(style)

    // 绑定导出按钮事件
    const confirmBtn = dialog.querySelector('#confirmExport') as HTMLButtonElement
    confirmBtn.addEventListener('click', async () => {
      const format = (dialog.querySelector('#exportFormat') as HTMLSelectElement).value as ExportFormat
      const filename = (dialog.querySelector('#exportFilename') as HTMLInputElement).value
      const includeValidation = (dialog.querySelector('#includeValidation') as HTMLInputElement).checked
      const prettify = (dialog.querySelector('#prettifyOutput') as HTMLInputElement).checked

      try {
        const result = await this.exportData(format, {
          filename,
          includeValidation,
          prettify
        })

        if (result.success) {
          downloadExportedFile(result)
          dialog.remove()
          this.emit('export:success', { format, filename: result.filename })
        } else {
          alert(`导出失败: ${result.error}`)
        }
      } catch (error) {
        alert(`导出过程中发生错误: ${error instanceof Error ? error.message : String(error)}`)
      }
    })

    document.body.appendChild(dialog)

    // 触发导出对话框显示事件
    this.emit('export:dialog:show', {})
  }

  /**
   * 复制选中的元素
   */
  copySelectedElements(): boolean {
    const selected = this.lf.getSelectElements()

    if (selected.nodes.length === 0 && selected.edges.length === 0) {
      console.info('请先选中要复制的元素')
      // 可以考虑显示用户友好的提示
      this.emit('copy:warning', { message: '请先选中要复制的元素' })
      return false
    }

    // 获取选中节点的完整数据
    const nodes = selected.nodes.map(node => {
      const nodeData = this.lf.getNodeModelById(node.id)
      return {
        id: node.id,
        type: node.type as any,
        x: node.x,
        y: node.y,
        text: typeof node.text === 'string' ? node.text : (node.text?.value || ''),
        width: nodeData?.width,
        height: nodeData?.height,
        properties: nodeData?.properties || {}
      }
    })

    // 获取选中边的完整数据
    const edges = selected.edges.map(edge => {
      const edgeData = this.lf.getEdgeModelById(edge.id)
      return {
        id: edge.id,
        type: edge.type as any,
        sourceNodeId: edge.sourceNodeId,
        targetNodeId: edge.targetNodeId,
        text: typeof edge.text === 'string' ? edge.text : (edge.text?.value || ''),
        properties: edgeData?.properties || {}
      }
    })

    const success = this.clipboardManager.copy(nodes, edges)

    if (success) {
      const info = this.clipboardManager.getDataInfo()
      this.showSuccess(`已复制 ${info?.nodeCount || 0} 个节点和 ${info?.edgeCount || 0} 条边`, 2000)
      this.emit('copy:success', { nodeCount: info?.nodeCount || 0, edgeCount: info?.edgeCount || 0 })
    } else {
      this.showError('复制失败')
      this.emit('copy:error', { message: '复制失败' })
    }

    return success
  }

  /**
   * 粘贴元素
   */
  async pasteElements(options?: PasteOptions): Promise<boolean> {
    try {
      const result = await this.clipboardManager.paste(options)

      if (!result) {
        console.info('剪贴板中没有可粘贴的数据，请先复制一些元素')
        this.emit('paste:warning', { message: '剪贴板中没有可粘贴的数据，请先复制一些元素' })
        return false
      }

      const { nodes, edges } = result

      // 添加节点
      const addedNodes: string[] = []
      for (const nodeData of nodes) {
        try {
          const nodeModel = this.lf.addNode({
            id: nodeData.id,
            type: nodeData.type,
            x: nodeData.x,
            y: nodeData.y,
            text: nodeData.text,
            properties: nodeData.properties
          })
          if (nodeModel) {
            addedNodes.push(nodeModel.id)
          }
        } catch (error) {
          console.error('添加节点失败:', error)
        }
      }

      // 添加边
      const addedEdges: string[] = []
      for (const edgeData of edges) {
        try {
          const edgeModel = this.lf.addEdge({
            id: edgeData.id,
            type: edgeData.type,
            sourceNodeId: edgeData.sourceNodeId,
            targetNodeId: edgeData.targetNodeId,
            text: edgeData.text,
            properties: edgeData.properties
          })
          if (edgeModel) {
            addedEdges.push(edgeModel.id)
          }
        } catch (error) {
          console.error('添加边失败:', error)
        }
      }

      // 选中粘贴的元素
      if (addedNodes.length > 0 || addedEdges.length > 0) {
        this.lf.clearSelectElements()
        addedNodes.forEach(nodeId => this.lf.selectElementById(nodeId, true))
        addedEdges.forEach(edgeId => this.lf.selectElementById(edgeId, true))
      }

      this.showSuccess(`已粘贴 ${addedNodes.length} 个节点和 ${addedEdges.length} 条边`, 2000)
      this.emit('paste:success', {
        nodeCount: addedNodes.length,
        edgeCount: addedEdges.length,
        nodeIds: addedNodes,
        edgeIds: addedEdges
      })

      return true
    } catch (error) {
      this.showError(`粘贴失败: ${error instanceof Error ? error.message : String(error)}`)
      this.emit('paste:error', { message: error instanceof Error ? error.message : String(error) })
      return false
    }
  }

  /**
   * 检查是否可以粘贴
   */
  canPaste(): boolean {
    return this.clipboardManager.hasData()
  }

  /**
   * 获取剪贴板信息
   */
  getClipboardInfo(): { nodeCount: number; edgeCount: number; timestamp: number } | null {
    return this.clipboardManager.getDataInfo()
  }

  /**
   * 清空剪贴板
   */
  clearClipboard(): void {
    this.clipboardManager.clear()
    this.emit('clipboard:clear', {})
  }

  // ==================== 模板管理方法 ====================

  /**
   * 初始化模板管理器
   */
  private async initializeTemplateManager(): Promise<void> {
    try {
      await this.templateManager.initialize()
      console.log('模板管理器初始化完成')
    } catch (error) {
      console.error('模板管理器初始化失败:', error)
    }
  }

  /**
   * 初始化性能监控器
   */
  private initializePerformanceMonitor(): void {
    try {
      // 设置流程图节点和边数量的获取方法
      const originalGetCurrentMetrics = this.performanceMonitor.getCurrentMetrics.bind(this.performanceMonitor)
      this.performanceMonitor.getCurrentMetrics = () => {
        const metrics = originalGetCurrentMetrics()
        const data = this.getData()
        return {
          ...metrics,
          flowchartNodeCount: data.nodes.length,
          flowchartEdgeCount: data.edges.length
        }
      }

      // 启动性能监控
      this.performanceMonitor.start()
      console.log('性能监控器初始化完成')
    } catch (error) {
      console.error('性能监控器初始化失败:', error)
    }
  }

  /**
   * 获取模板管理器
   */
  getTemplateManager(): TemplateManager {
    return this.templateManager
  }

  /**
   * 获取所有模板元数据
   */
  getTemplateMetadata(): TemplateMetadata[] {
    return this.templateManager.getTemplateMetadata()
  }

  /**
   * 过滤模板
   */
  filterTemplates(filter: TemplateFilter): TemplateMetadata[] {
    return this.templateManager.filterTemplates(filter)
  }

  /**
   * 排序模板
   */
  sortTemplates(templates: TemplateMetadata[], options: TemplateSortOptions): TemplateMetadata[] {
    return this.templateManager.sortTemplates(templates, options)
  }

  /**
   * 加载模板
   */
  loadTemplate(templateId: string): void {
    const template = this.templateManager.getTemplate(templateId)
    if (!template) {
      throw new Error(`Template not found: ${templateId}`)
    }

    this.setData(template.data)
    this.emit('template:load', template)
    this.showSuccess(`已加载模板: ${template.displayName}`, 3000)
  }

  /**
   * 保存当前流程图为模板
   */
  async saveAsTemplate(templateInfo: {
    name: string
    displayName: string
    description: string
    category: string
    tags?: string[]
  }): Promise<string> {
    const data = this.getData()

    const templateId = await this.templateManager.addTemplate({
      ...templateInfo,
      category: templateInfo.category as any, // 临时类型转换
      version: '1.0.0',
      isBuiltIn: false,
      data
    })

    this.emit('template:save', { templateId, ...templateInfo })
    this.showSuccess(`已保存模板: ${templateInfo.displayName}`, 3000)

    return templateId
  }

  /**
   * 删除模板
   */
  async deleteTemplate(templateId: string): Promise<void> {
    await this.templateManager.deleteTemplate(templateId)
    this.emit('template:delete', { templateId })
    console.log(`已删除模板: ${templateId}`)
  }

  /**
   * 导出模板
   */
  exportTemplates(templateIds: string[], options?: { format?: 'json' | 'xml'; pretty?: boolean }): string {
    return this.templateManager.exportTemplates(templateIds, {
      includeMetadata: true,
      format: options?.format || 'json',
      pretty: options?.pretty !== false
    })
  }

  /**
   * 导入模板
   */
  async importTemplates(data: string, options?: { overwrite?: boolean }): Promise<string[]> {
    return await this.templateManager.importTemplates(data, {
      overwrite: options?.overwrite || false,
      validateData: true,
      generateId: true
    })
  }

  /**
   * 显示模板选择对话框
   */
  showTemplateSelector(): void {
    const templates = this.getTemplateMetadata()

    // 创建模板选择对话框
    const dialog = document.createElement('div')
    dialog.className = 'template-selector-overlay'
    dialog.innerHTML = `
      <div class="template-selector-dialog">
        <div class="template-selector-header">
          <h3>选择模板</h3>
          <button class="close-btn" type="button">×</button>
        </div>
        <div class="template-selector-content">
          <div class="template-search">
            <input type="text" placeholder="搜索模板..." class="search-input">
            <select class="category-filter">
              <option value="">所有分类</option>
              <option value="approval">审批流程</option>
              <option value="workflow">工作流程</option>
              <option value="business">业务流程</option>
              <option value="custom">自定义</option>
            </select>
          </div>
          <div class="template-list">
            ${templates.map(template => `
              <div class="template-item" data-template-id="${template.id}">
                <div class="template-info">
                  <h4>${template.displayName}</h4>
                  <p>${template.description}</p>
                  <div class="template-meta">
                    <span class="category">${template.category}</span>
                    <span class="node-count">${template.nodeCount} 节点</span>
                    ${template.isBuiltIn ? '<span class="builtin">内置</span>' : ''}
                  </div>
                </div>
                <div class="template-actions">
                  <button class="load-btn" data-template-id="${template.id}">加载</button>
                  ${!template.isBuiltIn ? `<button class="delete-btn" data-template-id="${template.id}">删除</button>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="template-selector-footer">
          <button class="cancel-btn" type="button">取消</button>
        </div>
      </div>
    `

    // 添加样式
    const style = document.createElement('style')
    style.textContent = `
      .template-selector-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      }
      .template-selector-dialog {
        background: white;
        border-radius: 8px;
        width: 600px;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      }
      .template-selector-header {
        padding: 20px;
        border-bottom: 1px solid #e5e5e5;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .template-selector-header h3 {
        margin: 0;
        color: var(--ldesign-text-color-primary);
      }
      .close-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: var(--ldesign-text-color-secondary);
      }
      .template-selector-content {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      .template-search {
        padding: 20px;
        border-bottom: 1px solid #e5e5e5;
        display: flex;
        gap: 12px;
      }
      .search-input, .category-filter {
        padding: 8px 12px;
        border: 1px solid var(--ldesign-border-color);
        border-radius: 4px;
        font-size: 14px;
      }
      .search-input {
        flex: 1;
      }
      .template-list {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
      }
      .template-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        border: 1px solid #e5e5e5;
        border-radius: 6px;
        margin-bottom: 12px;
        transition: all 0.2s;
      }
      .template-item:hover {
        border-color: var(--ldesign-brand-color);
        box-shadow: 0 2px 8px rgba(114, 46, 209, 0.1);
      }
      .template-info h4 {
        margin: 0 0 8px 0;
        color: var(--ldesign-text-color-primary);
      }
      .template-info p {
        margin: 0 0 8px 0;
        color: var(--ldesign-text-color-secondary);
        font-size: 14px;
      }
      .template-meta {
        display: flex;
        gap: 8px;
        font-size: 12px;
      }
      .template-meta span {
        padding: 2px 6px;
        border-radius: 3px;
        background: #f5f5f5;
        color: var(--ldesign-text-color-secondary);
      }
      .template-meta .builtin {
        background: var(--ldesign-brand-color-2);
        color: var(--ldesign-brand-color);
      }
      .template-actions {
        display: flex;
        gap: 8px;
      }
      .load-btn, .delete-btn {
        padding: 6px 12px;
        border: 1px solid var(--ldesign-border-color);
        border-radius: 4px;
        background: white;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
      }
      .load-btn {
        background: var(--ldesign-brand-color);
        color: white;
        border-color: var(--ldesign-brand-color);
      }
      .load-btn:hover {
        background: var(--ldesign-brand-color-hover);
      }
      .delete-btn:hover {
        border-color: var(--ldesign-error-color);
        color: var(--ldesign-error-color);
      }
      .template-selector-footer {
        padding: 20px;
        border-top: 1px solid #e5e5e5;
        text-align: right;
      }
      .cancel-btn {
        padding: 8px 16px;
        border: 1px solid var(--ldesign-border-color);
        border-radius: 4px;
        background: white;
        cursor: pointer;
      }
    `
    document.head.appendChild(style)

    // 绑定事件
    const closeDialog = () => {
      document.body.removeChild(dialog)
      document.head.removeChild(style)
    }

    dialog.querySelector('.close-btn')?.addEventListener('click', closeDialog)
    dialog.querySelector('.cancel-btn')?.addEventListener('click', closeDialog)
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) closeDialog()
    })

    // 加载模板事件
    dialog.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      if (target.classList.contains('load-btn')) {
        const templateId = target.dataset.templateId
        if (templateId) {
          this.loadTemplate(templateId)
          closeDialog()
        }
      } else if (target.classList.contains('delete-btn')) {
        const templateId = target.dataset.templateId
        if (templateId && confirm('确定要删除这个模板吗？')) {
          this.deleteTemplate(templateId).then(() => {
            // 重新显示对话框
            closeDialog()
            setTimeout(() => this.showTemplateSelector(), 100)
          })
        }
      }
    })

    // 搜索和过滤功能
    const searchInput = dialog.querySelector('.search-input') as HTMLInputElement
    const categoryFilter = dialog.querySelector('.category-filter') as HTMLSelectElement

    const filterTemplates = () => {
      const searchTerm = searchInput.value.toLowerCase()
      const category = categoryFilter.value

      const filteredTemplates = templates.filter(template => {
        const matchesSearch = !searchTerm ||
          template.displayName.toLowerCase().includes(searchTerm) ||
          template.description.toLowerCase().includes(searchTerm) ||
          (template.tags && template.tags.some(tag => tag.toLowerCase().includes(searchTerm)))

        const matchesCategory = !category || template.category === category

        return matchesSearch && matchesCategory
      })

      const templateList = dialog.querySelector('.template-list')!
      templateList.innerHTML = filteredTemplates.map(template => `
        <div class="template-item" data-template-id="${template.id}">
          <div class="template-info">
            <h4>${template.displayName}</h4>
            <p>${template.description}</p>
            <div class="template-meta">
              <span class="category">${template.category}</span>
              <span class="node-count">${template.nodeCount} 节点</span>
              ${template.isBuiltIn ? '<span class="builtin">内置</span>' : ''}
            </div>
          </div>
          <div class="template-actions">
            <button class="load-btn" data-template-id="${template.id}">加载</button>
            ${!template.isBuiltIn ? `<button class="delete-btn" data-template-id="${template.id}">删除</button>` : ''}
          </div>
        </div>
      `).join('')
    }

    searchInput.addEventListener('input', filterTemplates)
    categoryFilter.addEventListener('change', filterTemplates)

    document.body.appendChild(dialog)
  }

  /**
   * 显示保存模板对话框
   */
  showSaveTemplateDialog(): void {
    // 创建保存模板对话框
    const dialog = document.createElement('div')
    dialog.className = 'save-template-overlay'
    dialog.innerHTML = `
      <div class="save-template-dialog">
        <div class="save-template-header">
          <h3>保存为模板</h3>
          <button class="close-btn" type="button">×</button>
        </div>
        <div class="save-template-content">
          <form class="template-form">
            <div class="form-group">
              <label for="template-name">模板名称 *</label>
              <input type="text" id="template-name" name="name" required placeholder="请输入模板名称">
            </div>
            <div class="form-group">
              <label for="template-display-name">显示名称 *</label>
              <input type="text" id="template-display-name" name="displayName" required placeholder="请输入显示名称">
            </div>
            <div class="form-group">
              <label for="template-description">模板描述 *</label>
              <textarea id="template-description" name="description" required placeholder="请输入模板描述" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label for="template-category">模板分类 *</label>
              <select id="template-category" name="category" required>
                <option value="">请选择分类</option>
                <option value="approval">审批流程</option>
                <option value="workflow">工作流程</option>
                <option value="business">业务流程</option>
                <option value="custom">自定义</option>
              </select>
            </div>
            <div class="form-group">
              <label for="template-tags">标签</label>
              <input type="text" id="template-tags" name="tags" placeholder="请输入标签，用逗号分隔">
              <small>例如：审批,人事,请假</small>
            </div>
          </form>
        </div>
        <div class="save-template-footer">
          <button class="cancel-btn" type="button">取消</button>
          <button class="save-btn" type="button">保存模板</button>
        </div>
      </div>
    `

    // 添加样式
    const style = document.createElement('style')
    style.textContent = `
      .save-template-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      }
      .save-template-dialog {
        background: white;
        border-radius: 8px;
        width: 500px;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      }
      .save-template-header {
        padding: 20px;
        border-bottom: 1px solid #e5e5e5;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .save-template-header h3 {
        margin: 0;
        color: var(--ldesign-text-color-primary);
      }
      .close-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: var(--ldesign-text-color-secondary);
      }
      .save-template-content {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
      }
      .template-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .form-group label {
        font-weight: 500;
        color: var(--ldesign-text-color-primary);
        font-size: 14px;
      }
      .form-group input,
      .form-group textarea,
      .form-group select {
        padding: 8px 12px;
        border: 1px solid var(--ldesign-border-color);
        border-radius: 4px;
        font-size: 14px;
        transition: border-color 0.2s;
      }
      .form-group input:focus,
      .form-group textarea:focus,
      .form-group select:focus {
        outline: none;
        border-color: var(--ldesign-brand-color);
        box-shadow: 0 0 0 2px rgba(114, 46, 209, 0.1);
      }
      .form-group small {
        color: var(--ldesign-text-color-secondary);
        font-size: 12px;
      }
      .save-template-footer {
        padding: 20px;
        border-top: 1px solid #e5e5e5;
        display: flex;
        justify-content: flex-end;
        gap: 12px;
      }
      .cancel-btn,
      .save-btn {
        padding: 8px 16px;
        border: 1px solid var(--ldesign-border-color);
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
      }
      .cancel-btn {
        background: white;
        color: var(--ldesign-text-color-primary);
      }
      .cancel-btn:hover {
        background: #f5f5f5;
      }
      .save-btn {
        background: var(--ldesign-brand-color);
        color: white;
        border-color: var(--ldesign-brand-color);
      }
      .save-btn:hover {
        background: var(--ldesign-brand-color-hover);
      }
      .save-btn:disabled {
        background: var(--ldesign-brand-color-disabled);
        cursor: not-allowed;
      }
    `
    document.head.appendChild(style)

    // 绑定事件
    const closeDialog = () => {
      document.body.removeChild(dialog)
      document.head.removeChild(style)
    }

    dialog.querySelector('.close-btn')?.addEventListener('click', closeDialog)
    dialog.querySelector('.cancel-btn')?.addEventListener('click', closeDialog)
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) closeDialog()
    })

    // 保存模板事件
    dialog.querySelector('.save-btn')?.addEventListener('click', async () => {
      const form = dialog.querySelector('.template-form') as HTMLFormElement
      const formData = new FormData(form)

      const templateInfo = {
        name: formData.get('name') as string,
        displayName: formData.get('displayName') as string,
        description: formData.get('description') as string,
        category: formData.get('category') as string,
        tags: (formData.get('tags') as string)?.split(',').map(tag => tag.trim()).filter(Boolean)
      }

      // 验证必填字段
      if (!templateInfo.name || !templateInfo.displayName || !templateInfo.description || !templateInfo.category) {
        alert('请填写所有必填字段')
        return
      }

      try {
        const saveBtn = dialog.querySelector('.save-btn') as HTMLButtonElement
        saveBtn.disabled = true
        saveBtn.textContent = '保存中...'

        await this.saveAsTemplate(templateInfo)
        alert('模板保存成功！')
        closeDialog()
      } catch (error) {
        console.error('保存模板失败:', error)
        alert('保存模板失败: ' + (error as Error).message)

        const saveBtn = dialog.querySelector('.save-btn') as HTMLButtonElement
        saveBtn.disabled = false
        saveBtn.textContent = '保存模板'
      }
    })

    document.body.appendChild(dialog)
  }

  // ==================== 性能监控方法 ====================

  /**
   * 获取性能监控器
   */
  getPerformanceMonitor(): PerformanceMonitor {
    return this.performanceMonitor
  }

  /**
   * 获取性能报告
   */
  getPerformanceReport(): PerformanceReport {
    return this.performanceMonitor.getReport()
  }

  /**
   * 开始性能监控
   */
  startPerformanceMonitoring(): void {
    this.performanceMonitor.start()
  }

  /**
   * 停止性能监控
   */
  stopPerformanceMonitoring(): void {
    this.performanceMonitor.stop()
  }

  /**
   * 清空性能数据
   */
  clearPerformanceData(): void {
    this.performanceMonitor.clear()
  }

  /**
   * 导出性能数据
   */
  exportPerformanceData(): string {
    return this.performanceMonitor.exportData()
  }

  /**
   * 标记渲染开始（用于性能监控）
   */
  private markRenderStart(): void {
    this.performanceMonitor.markRenderStart()
  }

  /**
   * 标记渲染结束（用于性能监控）
   */
  private markRenderEnd(): void {
    this.performanceMonitor.markRenderEnd()
  }

  /**
   * 优化渲染数据（使用虚拟渲染）
   */
  private optimizeRenderData(data: FlowchartData): FlowchartData {
    if (!this.config.performance?.enabled) {
      return data
    }

    // 获取当前视口信息
    const viewport = this.getCurrentViewport()
    this.virtualRenderer.updateViewport(viewport)

    // 计算可见的节点和边
    const visibleNodes = this.virtualRenderer.getVisibleNodes(data.nodes)
    const visibleEdges = this.virtualRenderer.getVisibleEdges(data.edges, visibleNodes)

    // 简化节点和边
    const optimizedNodes = visibleNodes.map(node =>
      this.virtualRenderer.getSimplifiedNode(node)
    )
    const optimizedEdges = visibleEdges.map(edge =>
      this.virtualRenderer.getSimplifiedEdge(edge)
    )

    return {
      nodes: optimizedNodes,
      edges: optimizedEdges
    }
  }

  /**
   * 获取当前视口信息
   */
  private getCurrentViewport() {
    const container = this.lf.getGraphModel().getContainer()
    const transform = this.lf.getTransform()

    return {
      x: -transform.TRANSLATE_X / transform.SCALE_X,
      y: -transform.TRANSLATE_Y / transform.SCALE_Y,
      width: container.clientWidth / transform.SCALE_X,
      height: container.clientHeight / transform.SCALE_Y,
      scale: transform.SCALE_X
    }
  }

  /**
   * 更新虚拟渲染器视口
   */
  updateVirtualViewport(): void {
    if (!this.config.performance?.enabled) {
      return
    }

    const viewport = this.getCurrentViewport()
    this.virtualRenderer.updateViewport(viewport)
  }

  /**
   * 获取虚拟渲染器性能统计
   */
  getVirtualRenderStats() {
    return this.virtualRenderer.getPerformanceStats()
  }

  /**
   * 重置虚拟渲染器
   */
  resetVirtualRenderer(): void {
    this.virtualRenderer.reset()
  }

  /**
   * 批量更新DOM
   */
  batchUpdateDOM(updates: Array<() => void>): void {
    updates.forEach(update => {
      this.batchDOMUpdater.addUpdate(update)
    })
  }

  /**
   * 立即执行所有DOM更新
   */
  flushDOMUpdates(): void {
    this.batchDOMUpdater.flush()
  }

  /**
   * 获取内存使用情况
   */
  getMemoryUsage(): MemoryUsageInfo {
    return this.memoryOptimizer.getMemoryUsage()
  }

  /**
   * 获取内存优化统计
   */
  getMemoryOptimizationStats(): MemoryOptimizationStats {
    return this.memoryOptimizer.getOptimizationStats()
  }

  /**
   * 强制垃圾回收
   */
  forceGarbageCollection(): void {
    this.memoryOptimizer.forceGarbageCollection()
  }

  /**
   * 压缩流程图数据
   */
  compressFlowchartData(data: FlowchartData): any {
    return this.memoryOptimizer.compressData(data.nodes, data.edges)
  }

  /**
   * 解压流程图数据
   */
  decompressFlowchartData(compressed: any): FlowchartData {
    return this.memoryOptimizer.decompressData(compressed)
  }

  /**
   * 添加委托事件（用于内存优化）
   */
  addDelegatedEvent(
    eventType: string,
    selector: string,
    handler: (event: Event, target: Element) => void
  ): void {
    const container = this.lf.getGraphModel().getContainer()
    this.memoryOptimizer.addDelegatedEvent(eventType, container, selector, handler)
  }

  /**
   * 获取交互统计信息
   */
  getInteractionStats(): InteractionStats {
    return this.interactionOptimizer.getInteractionStats()
  }

  /**
   * 优化拖拽处理器
   */
  optimizeDragHandler(handler: (event: MouseEvent) => void): (event: MouseEvent) => void {
    return this.interactionOptimizer.optimizeDragHandler(handler)
  }

  /**
   * 优化缩放处理器
   */
  optimizeZoomHandler(handler: (event: WheelEvent) => void): (event: WheelEvent) => void {
    return this.interactionOptimizer.optimizeZoomHandler(handler)
  }

  /**
   * 添加异步渲染任务
   */
  addAsyncRenderTask(task: () => void): void {
    this.interactionOptimizer.addAsyncRenderTask(task)
  }

  /**
   * 标记更新区域
   */
  markUpdateRegion(x: number, y: number, width: number, height: number): void {
    this.interactionOptimizer.markUpdateRegion(x, y, width, height)
  }

  /**
   * 检查是否需要更新
   */
  shouldUpdate(x: number, y: number): boolean {
    return this.interactionOptimizer.shouldUpdate(x, y)
  }

  /**
   * 开始拖拽
   */
  startDrag(x: number, y: number): void {
    this.interactionOptimizer.startDrag(x, y)
  }

  /**
   * 结束拖拽
   */
  endDrag(): DragStats {
    return this.interactionOptimizer.endDrag()
  }

  /**
   * 设置缩放级别
   */
  setZoomLevel(level: number): void {
    this.interactionOptimizer.setZoomLevel(level)
    this.lf.zoom(level)
  }

  /**
   * 创建防抖函数
   */
  createDebounced<T extends (...args: any[]) => any>(func: T): (...args: Parameters<T>) => void {
    return this.interactionOptimizer.createDebounced(func)
  }

  /**
   * 创建节流函数
   */
  createThrottled<T extends (...args: any[]) => any>(func: T): (...args: Parameters<T>) => void {
    return this.interactionOptimizer.createThrottled(func)
  }

  /**
   * 清空交互优化器状态
   */
  clearInteractionOptimizer(): void {
    this.interactionOptimizer.clear()
  }



  /**
   * 显示Toast通知
   */
  showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration?: number): void {
    this.toastManager.show(message, { type, duration })
  }

  /**
   * 显示成功Toast
   */
  showSuccess(message: string, duration?: number): void {
    this.toastManager.success(message, { duration })
  }

  /**
   * 显示错误Toast
   */
  showError(message: string, duration?: number): void {
    this.toastManager.error(message, { duration })
  }

  /**
   * 显示警告Toast
   */
  showWarning(message: string, duration?: number): void {
    this.toastManager.warning(message, { duration })
  }

  /**
   * 显示信息Toast
   */
  showInfo(message: string, duration?: number): void {
    this.toastManager.info(message, { duration })
  }

  /**
   * 清空所有Toast
   */
  clearToasts(): void {
    this.toastManager.clear()
  }

  /**
   * 获取更新调度器实例
   */
  getUpdateScheduler(): UpdateScheduler {
    return this.updateScheduler
  }

  /**
   * 调度更新任务
   * @param id 任务ID
   * @param task 更新任务
   * @param priority 优先级
   */
  scheduleUpdate(id: string, task: () => void, priority: UpdatePriority = UpdatePriority.NORMAL): void {
    this.updateScheduler.schedule(id, task, priority)
  }

  /**
   * 立即执行更新任务
   * @param task 更新任务
   */
  immediateUpdate(task: () => void): void {
    this.updateScheduler.immediate(task)
  }

  /**
   * 强制执行所有待处理的更新
   */
  flushUpdates(): void {
    this.updateScheduler.flush()
  }


}
