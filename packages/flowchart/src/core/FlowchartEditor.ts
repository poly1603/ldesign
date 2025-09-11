/**
 * 审批流程图编辑器核心类
 * 
 * 基于 @logicflow/core 实现的审批流程图编辑器，
 * 提供完整的流程图编辑功能。
 */

import LogicFlow from '@logicflow/core'
import type {
  FlowchartEditorConfig,
  FlowchartData,
  ApprovalNodeConfig,
  ApprovalEdgeConfig,
  FlowchartEvents,
  ThemeConfig
} from '../types'
import { ThemeManager } from '../themes/ThemeManager'
import { PluginManager } from '../plugins/PluginManager'
import { registerApprovalNodes } from '../nodes'
import { registerApprovalEdges } from '../edges'
import { defaultConfig } from '../config/defaultConfig'

/**
 * 审批流程图编辑器类
 */
export class FlowchartEditor {
  private lf!: LogicFlow
  private config: FlowchartEditorConfig
  private themeManager!: ThemeManager
  private pluginManager!: PluginManager
  private eventListeners: Map<keyof FlowchartEvents, Function[]> = new Map()

  /**
   * 构造函数
   * @param config 编辑器配置
   */
  constructor(config: FlowchartEditorConfig) {
    this.config = { ...defaultConfig, ...config }

    // 初始化 LogicFlow
    this.initLogicFlow()

    // 初始化主题管理器
    this.themeManager = new ThemeManager(this.lf)

    // 初始化插件管理器
    this.pluginManager = new PluginManager(this)

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
  }

  /**
   * 初始化 LogicFlow
   */
  private initLogicFlow(): void {
    const container = typeof this.config.container === 'string'
      ? document.querySelector(this.config.container) as HTMLElement
      : this.config.container

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
        type: this.config.grid?.type || 'dot'
      },
      // 禁用默认的右键菜单
      disabledMenus: [],
      // 启用键盘快捷键
      keyboard: {
        enabled: true
      },
      // 启用历史记录（撤销重做）
      history: true,
      // 自定义配置
      ...this.config.logicflowConfig
    }

    this.lf = new LogicFlow(lfConfig)
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
   * 绑定事件
   */
  private bindEvents(): void {
    // 节点事件
    this.lf.on('node:click', (data) => {
      this.emit('node:click', { node: data.data, event: data.e })
    })

    this.lf.on('node:dblclick', (data) => {
      this.emit('node:dblclick', { node: data.data, event: data.e })
    })

    this.lf.on('node:add', (data) => {
      this.emit('node:add', { node: data.data })
    })

    this.lf.on('node:delete', (data) => {
      this.emit('node:delete', { node: data.data })
    })

    // 边事件
    this.lf.on('edge:click', (data) => {
      this.emit('edge:click', { edge: data.data, event: data.e })
    })

    this.lf.on('edge:add', (data) => {
      this.emit('edge:add', { edge: data.data })
    })

    this.lf.on('edge:delete', (data) => {
      this.emit('edge:delete', { edge: data.data })
    })

    // 画布事件
    this.lf.on('blank:click', (data) => {
      this.emit('canvas:click', { event: data.e, position: data.position })
    })

    // 选择变化事件
    this.lf.on('selection:selected', () => {
      const selected = this.lf.getSelectElements()
      this.emit('selection:change', { selected: selected as any })
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
    const node = this.lf.addNode(nodeConfig)
    return node.id
  }

  /**
   * 更新节点
   */
  updateNode(id: string, nodeConfig: Partial<ApprovalNodeConfig>): void {
    const nodeModel = this.lf.getNodeModelById(id)
    if (nodeModel) {
      Object.assign(nodeModel, nodeConfig)
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
  }

  /**
   * 缩放到适应内容
   */
  fitView(): void {
    this.lf.fitView()
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
   * 销毁编辑器
   */
  destroy(): void {
    // 卸载所有插件
    if (this.pluginManager) {
      this.pluginManager.uninstallAll()
    }

    // 清除所有事件监听
    if (this.eventListeners) {
      this.eventListeners.clear()
    }

    // 销毁 LogicFlow 实例
    if (this.lf && typeof this.lf.destroy === 'function') {
      this.lf.destroy()
    }
  }
}
