/**
 * 审批流程图预览器核心类
 * 
 * 基于 @logicflow/core 实现的只读流程图预览器，
 * 用于展示审批流程的执行状态。
 */

import LogicFlow from '@logicflow/core'
import type {
  FlowchartViewerConfig,
  FlowchartData,
  Point
} from '../types'
import { ThemeManager } from '../themes/ThemeManager'
import { registerApprovalNodes } from '../nodes'
import { registerApprovalEdges } from '../edges'

/**
 * 审批流程图预览器类
 */
export class FlowchartViewer {
  private lf!: LogicFlow
  private config: FlowchartViewerConfig
  private themeManager: ThemeManager

  /**
   * 构造函数
   * @param config 预览器配置
   */
  constructor(config: FlowchartViewerConfig) {
    this.config = config

    // 初始化 LogicFlow
    this.initLogicFlow()

    // 初始化主题管理器
    this.themeManager = new ThemeManager(this.lf)

    // 注册审批流程节点和边
    this.registerElements()

    // 渲染数据
    this.render()

    // 设置执行状态
    if (this.config.executionState) {
      this.setExecutionState(this.config.executionState)
    }

    // 高亮节点
    if (this.config.highlightNodes) {
      this.highlightNodes(this.config.highlightNodes)
    }
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

    // LogicFlow 配置（只读模式）
    const lfConfig = {
      container,
      width: this.config.width || container.clientWidth,
      height: this.config.height || container.clientHeight,
      // 禁用编辑功能
      isSilentMode: true,
      // 禁用拖拽
      stopMoveGraph: true,
      // 禁用滚轮缩放
      stopZoomGraph: true,
      // 禁用右键菜单
      disabledMenus: [],
      // 禁用键盘快捷键
      keyboard: {
        enabled: false
      },
      // 禁用历史记录
      history: false,
      // 网格配置
      grid: {
        size: 20,
        visible: false
      }
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
   * 渲染预览器
   */
  render(): void {
    this.lf.render(this.config.data)

    // 自动适应内容
    setTimeout(() => {
      this.fitView()
    }, 100)
  }

  /**
   * 设置执行状态
   * @param state 执行状态
   */
  setExecutionState(state: {
    currentNode?: string
    completedNodes?: string[]
    failedNodes?: string[]
  }): void {
    // 重置所有节点状态
    this.resetNodeStates()

    // 设置已完成节点
    if (state.completedNodes) {
      state.completedNodes.forEach(nodeId => {
        this.setNodeState(nodeId, 'completed')
      })
    }

    // 设置失败节点
    if (state.failedNodes) {
      state.failedNodes.forEach(nodeId => {
        this.setNodeState(nodeId, 'failed')
      })
    }

    // 设置当前节点
    if (state.currentNode) {
      this.setNodeState(state.currentNode, 'current')
    }
  }

  /**
   * 高亮节点
   * @param nodeIds 节点ID数组
   */
  highlightNodes(nodeIds: string[]): void {
    // 清除之前的高亮
    this.clearHighlight()

    // 高亮指定节点
    nodeIds.forEach(nodeId => {
      const nodeModel = this.lf.getNodeModelById(nodeId)
      if (nodeModel) {
        // 设置高亮样式
        nodeModel.setProperties({
          ...nodeModel.properties,
          highlighted: true
        })

        // 更新节点样式
        this.updateNodeStyle(nodeId, {
          stroke: '#ff6b35',
          strokeWidth: 3
        })
      }
    })
  }

  /**
   * 清除高亮
   */
  clearHighlight(): void {
    const graphData = this.lf.getGraphData()
    graphData.nodes.forEach(node => {
      const nodeModel = this.lf.getNodeModelById(node.id!)
      if (nodeModel && nodeModel.properties.highlighted) {
        nodeModel.setProperties({
          ...nodeModel.properties,
          highlighted: false
        })

        // 恢复默认样式
        this.resetNodeStyle(node.id!)
      }
    })
  }

  /**
   * 设置节点状态
   * @param nodeId 节点ID
   * @param state 状态
   */
  private setNodeState(nodeId: string, state: 'current' | 'completed' | 'failed'): void {
    const nodeModel = this.lf.getNodeModelById(nodeId)
    if (!nodeModel) return

    // 设置状态属性
    nodeModel.setProperties({
      ...nodeModel.properties,
      executionState: state
    })

    // 根据状态设置样式
    let style: any = {}
    switch (state) {
      case 'current':
        style = {
          fill: '#e6f7ff',
          stroke: '#1890ff',
          strokeWidth: 2
        }
        break
      case 'completed':
        style = {
          fill: '#f6ffed',
          stroke: '#52c41a',
          strokeWidth: 2
        }
        break
      case 'failed':
        style = {
          fill: '#fff2f0',
          stroke: '#ff4d4f',
          strokeWidth: 2
        }
        break
    }

    this.updateNodeStyle(nodeId, style)
  }

  /**
   * 重置所有节点状态
   */
  private resetNodeStates(): void {
    const graphData = this.lf.getGraphData()
    graphData.nodes.forEach(node => {
      const nodeModel = this.lf.getNodeModelById(node.id!)
      if (nodeModel) {
        nodeModel.setProperties({
          ...nodeModel.properties,
          executionState: undefined
        })
        this.resetNodeStyle(node.id!)
      }
    })
  }

  /**
   * 更新节点样式
   * @param nodeId 节点ID
   * @param style 样式
   */
  private updateNodeStyle(nodeId: string, style: any): void {
    const nodeModel = this.lf.getNodeModelById(nodeId)
    if (nodeModel) {
      Object.assign(nodeModel.style, style)
    }
  }

  /**
   * 重置节点样式
   * @param nodeId 节点ID
   */
  private resetNodeStyle(nodeId: string): void {
    const nodeModel = this.lf.getNodeModelById(nodeId)
    if (nodeModel) {
      // 恢复默认样式
      nodeModel.style = { ...nodeModel.getNodeStyle() }
    }
  }

  /**
   * 缩放到适应内容
   */
  fitView(): void {
    this.lf.fitView()
  }

  /**
   * 设置缩放比例
   * @param scale 缩放比例
   */
  zoom(scale: number): void {
    this.lf.zoom(scale)
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
   * 更新数据
   * @param data 流程图数据
   */
  updateData(data: FlowchartData): void {
    this.config.data = data
    this.lf.renderRawData(data)

    // 重新设置执行状态
    if (this.config.executionState) {
      this.setExecutionState(this.config.executionState)
    }

    // 重新高亮节点
    if (this.config.highlightNodes) {
      this.highlightNodes(this.config.highlightNodes)
    }
  }

  /**
   * 获取 LogicFlow 实例
   */
  getLogicFlow(): LogicFlow {
    return this.lf
  }

  /**
   * 销毁预览器
   */
  destroy(): void {
    if (this.lf && typeof this.lf.destroy === 'function') {
      this.lf.destroy()
    }
  }
}
