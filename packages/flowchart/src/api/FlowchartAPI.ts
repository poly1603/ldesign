/**
 * Flowchart API
 * 
 * 提供简洁易用的 API 接口，方便在各种前端框架中使用
 */

import { FlowchartEditor } from '../core/FlowchartEditor'
import { FlowchartViewer } from '../core/FlowchartViewer'
import { HistoryPlugin, ExportPlugin } from '../plugins/builtin'
import type {
  FlowchartEditorConfig,
  FlowchartViewerConfig,
  ApprovalNodeConfig,
  ApprovalEdgeConfig,
  FlowchartData,
  ApprovalNodeType
} from '../types'

/**
 * 创建编辑器配置
 */
export interface CreateEditorOptions extends Partial<Omit<FlowchartEditorConfig, 'plugins'>> {
  /** 容器元素或选择器 */
  container: string | HTMLElement
  /** 是否启用插件 */
  plugins?: {
    /** 历史记录插件 */
    history?: boolean | object
    /** 导出插件 */
    export?: boolean | object
  }
}

/**
 * 创建查看器配置
 */
export interface CreateViewerOptions extends Partial<FlowchartViewerConfig> {
  /** 容器元素或选择器 */
  container: string | HTMLElement
}

/**
 * 节点创建配置
 */
export interface CreateNodeOptions {
  /** 节点类型 */
  type: ApprovalNodeType
  /** X 坐标 */
  x: number
  /** Y 坐标 */
  y: number
  /** 节点文本 */
  text?: string
  /** 节点属性 */
  properties?: Record<string, any>
}

/**
 * 边创建配置
 */
export interface CreateEdgeOptions {
  /** 源节点 ID */
  source: string
  /** 目标节点 ID */
  target: string
  /** 边文本 */
  text?: string
  /** 边属性 */
  properties?: Record<string, any>
}

/**
 * Flowchart API 类
 * 
 * 提供简洁的 API 接口，封装复杂的内部实现
 */
export class FlowchartAPI {
  /**
   * 创建流程图编辑器
   * 
   * @example
   * ```typescript
   * const editor = FlowchartAPI.createEditor({
   *   container: '#editor',
   *   width: 800,
   *   height: 600,
   *   plugins: {
   *     history: { maxSize: 50 },
   *     export: true
   *   }
   * })
   * ```
   */
  static createEditor(options: CreateEditorOptions): FlowchartEditor {
    const { container, plugins, ...config } = options

    // 解析容器
    const containerElement = typeof container === 'string'
      ? document.querySelector(container) as HTMLElement
      : container

    if (!containerElement) {
      throw new Error(`容器元素未找到: ${container}`)
    }

    // 创建编辑器
    const editor = new FlowchartEditor({
      container: containerElement,
      ...config
    })

    // 安装插件
    if (plugins) {
      const pluginManager = editor.getPluginManager()

      if (plugins.history) {
        const config = typeof plugins.history === 'object' ? plugins.history : {}
        pluginManager.install(new HistoryPlugin(config))
      }

      if (plugins.export) {
        const config = typeof plugins.export === 'object' ? plugins.export : {}
        pluginManager.install(new ExportPlugin(config))
      }
    }

    return editor
  }

  /**
   * 创建流程图查看器
   * 
   * @example
   * ```typescript
   * const viewer = FlowchartAPI.createViewer({
   *   container: '#viewer',
   *   data: flowchartData
   * })
   * ```
   */
  static createViewer(options: CreateViewerOptions): FlowchartViewer {
    const { container, ...config } = options

    // 解析容器
    const containerElement = typeof container === 'string'
      ? document.querySelector(container) as HTMLElement
      : container

    if (!containerElement) {
      throw new Error(`容器元素未找到: ${container}`)
    }

    return new FlowchartViewer({
      container: containerElement,
      ...config
    })
  }

  /**
   * 快速创建节点
   * 
   * @example
   * ```typescript
   * const startNode = FlowchartAPI.createNode({
   *   type: 'start',
   *   x: 100,
   *   y: 100,
   *   text: '开始'
   * })
   * ```
   */
  static createNode(options: CreateNodeOptions): ApprovalNodeConfig {
    return {
      type: options.type,
      x: options.x,
      y: options.y,
      text: options.text || '',
      properties: options.properties || {}
    }
  }

  /**
   * 快速创建边
   * 
   * @example
   * ```typescript
   * const edge = FlowchartAPI.createEdge({
   *   source: 'node1',
   *   target: 'node2',
   *   text: '同意'
   * })
   * ```
   */
  static createEdge(options: CreateEdgeOptions): ApprovalEdgeConfig {
    return {
      sourceNodeId: options.source,
      targetNodeId: options.target,
      text: options.text || '',
      properties: options.properties || {}
    }
  }

  /**
   * 创建审批流程模板
   * 
   * @example
   * ```typescript
   * const template = FlowchartAPI.createApprovalTemplate({
   *   title: '请假审批流程',
   *   steps: ['申请', '部门审批', 'HR审批', '完成']
   * })
   * ```
   */
  static createApprovalTemplate(options: {
    title?: string
    steps: string[]
    layout?: 'horizontal' | 'vertical'
  }): FlowchartData {
    const { steps, layout = 'horizontal' } = options
    const nodes: ApprovalNodeConfig[] = []
    const edges: ApprovalEdgeConfig[] = []

    // 创建开始节点
    const startNodeId = 'start'
    nodes.push({
      id: startNodeId,
      type: 'start',
      x: 100,
      y: layout === 'horizontal' ? 150 : 100,
      text: '开始'
    })

    // 创建步骤节点
    steps.forEach((step, index) => {
      const nodeId = `step-${index}`
      nodes.push({
        id: nodeId,
        type: 'approval',
        x: layout === 'horizontal' ? 250 + index * 200 : 100,
        y: layout === 'horizontal' ? 150 : 200 + index * 150,
        text: step
      })

      // 连接到前一个节点
      const sourceId = index === 0 ? startNodeId : `step-${index - 1}`
      edges.push({
        id: `edge-${index}`,
        sourceNodeId: sourceId!,
        targetNodeId: nodeId,
        text: '下一步'
      })
    })

    // 创建结束节点
    const endNodeId = 'end'
    nodes.push({
      id: endNodeId,
      type: 'end',
      x: layout === 'horizontal' ? 250 + steps.length * 200 : 100,
      y: layout === 'horizontal' ? 150 : 200 + steps.length * 150,
      text: '结束'
    })

    // 连接到结束节点
    edges.push({
      id: `edge-${steps.length}`,
      sourceNodeId: `step-${steps.length - 1}`,
      targetNodeId: endNodeId,
      text: '完成'
    })

    return { nodes, edges }
  }

  /**
   * 验证流程图数据
   * 
   * @example
   * ```typescript
   * const isValid = FlowchartAPI.validateData(flowchartData)
   * if (!isValid.valid) {
   *   console.error('验证失败:', isValid.errors)
   * }
   * ```
   */
  static validateData(data: FlowchartData): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // 检查基本结构
    if (!data || typeof data !== 'object') {
      errors.push('数据格式无效')
      return { valid: false, errors }
    }

    if (!Array.isArray(data.nodes)) {
      errors.push('节点数据必须是数组')
    }

    if (!Array.isArray(data.edges)) {
      errors.push('边数据必须是数组')
    }

    // 检查节点
    const nodeIds = new Set<string>()
    data.nodes?.forEach((node, index) => {
      if (!node.id) {
        errors.push(`节点 ${index} 缺少 ID`)
      } else if (nodeIds.has(node.id)) {
        errors.push(`节点 ID "${node.id}" 重复`)
      } else {
        nodeIds.add(node.id)
      }

      if (!node.type) {
        errors.push(`节点 ${index} 缺少类型`)
      }

      if (typeof node.x !== 'number' || typeof node.y !== 'number') {
        errors.push(`节点 ${index} 坐标无效`)
      }
    })

    // 检查边
    data.edges?.forEach((edge, index) => {
      if (!edge.sourceNodeId) {
        errors.push(`边 ${index} 缺少源节点 ID`)
      } else if (!nodeIds.has(edge.sourceNodeId)) {
        errors.push(`边 ${index} 源节点 "${edge.sourceNodeId}" 不存在`)
      }

      if (!edge.targetNodeId) {
        errors.push(`边 ${index} 缺少目标节点 ID`)
      } else if (!nodeIds.has(edge.targetNodeId)) {
        errors.push(`边 ${index} 目标节点 "${edge.targetNodeId}" 不存在`)
      }
    })

    return { valid: errors.length === 0, errors }
  }

  /**
   * 转换数据格式
   * 
   * @example
   * ```typescript
   * const bpmnData = FlowchartAPI.convertToBPMN(flowchartData)
   * ```
   */
  static convertToBPMN(data: FlowchartData): string {
    // 简化的 BPMN 转换实现
    let bpmn = '<?xml version="1.0" encoding="UTF-8"?>\n'
    bpmn += '<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL">\n'
    bpmn += '  <process id="process1">\n'

    // 转换节点
    data.nodes.forEach(node => {
      const elementType = this.getBPMNElementType(node.type)
      bpmn += `    <${elementType} id="${node.id}" name="${node.text || ''}" />\n`
    })

    // 转换边
    data.edges.forEach((edge, index) => {
      bpmn += `    <sequenceFlow id="flow${index}" sourceRef="${edge.sourceNodeId}" targetRef="${edge.targetNodeId}" />\n`
    })

    bpmn += '  </process>\n'
    bpmn += '</definitions>'

    return bpmn
  }

  /**
   * 获取 BPMN 元素类型
   */
  private static getBPMNElementType(nodeType: ApprovalNodeType): string {
    const typeMap: Record<ApprovalNodeType, string> = {
      start: 'startEvent',
      end: 'endEvent',
      approval: 'userTask',
      condition: 'exclusiveGateway',
      process: 'serviceTask',
      'parallel-gateway': 'parallelGateway',
      'exclusive-gateway': 'exclusiveGateway'
    }
    return typeMap[nodeType] || 'task'
  }

  /**
   * 获取版本信息
   */
  static getVersion(): string {
    return '1.0.0'
  }

  /**
   * 获取支持的节点类型
   */
  static getSupportedNodeTypes(): ApprovalNodeType[] {
    return ['start', 'approval', 'condition', 'end', 'process', 'parallel-gateway', 'exclusive-gateway']
  }
}
