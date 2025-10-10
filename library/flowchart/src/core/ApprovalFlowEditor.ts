import LogicFlow, { Definition } from '@logicflow/core';
import '@logicflow/core/dist/style/index.css';
import {
  EditorConfig,
  EditorEvents,
  FlowChartData,
  NodeData,
  EdgeData,
  ValidationResult,
  ExportConfig,
  ApprovalNodeType,
} from '../types';
import { registerNodes } from '../nodes';

/**
 * 审批流程图编辑器核心类
 */
export class ApprovalFlowEditor {
  private lf: LogicFlow | null = null;
  private container: HTMLElement | null = null;
  private config: Required<EditorConfig>;
  private events: EditorEvents = {};

  constructor(config: EditorConfig) {
    this.config = this.normalizeConfig(config);
    this.init();
  }

  /**
   * 初始化编辑器
   */
  private init(): void {
    // 获取容器元素
    if (typeof this.config.container === 'string') {
      const element = document.querySelector(this.config.container);
      if (!element) {
        throw new Error(`Container element not found: ${this.config.container}`);
      }
      this.container = element as HTMLElement;
    } else {
      this.container = this.config.container;
    }

    // 设置容器样式
    this.container.style.width = typeof this.config.width === 'number'
      ? `${this.config.width}px`
      : this.config.width;
    this.container.style.height = typeof this.config.height === 'number'
      ? `${this.config.height}px`
      : this.config.height;

    // 初始化 LogicFlow
    const lfConfig: Definition = {
      container: this.container,
      grid: this.config.grid.visible ? {
        size: this.config.grid.size,
        type: this.config.grid.type,
        visible: true,
      } : false,
      keyboard: {
        enabled: this.config.keyboard.enabled,
      },
      stopScrollGraph: this.config.readonly,
      stopZoomGraph: this.config.readonly,
      stopMoveGraph: this.config.readonly,
      adjustEdge: !this.config.readonly,
      adjustEdgeStartAndEnd: !this.config.readonly,
      adjustNodePosition: !this.config.readonly,
      hideAnchors: this.config.readonly,
      hoverOutline: !this.config.readonly,
      nodeSelectedOutline: !this.config.readonly,
      edgeSelectedOutline: !this.config.readonly,
      ...(this.config.zoom.minZoom && { minZoom: this.config.zoom.minZoom }),
      ...(this.config.zoom.maxZoom && { maxZoom: this.config.zoom.maxZoom }),
    };

    this.lf = new LogicFlow(lfConfig);

    // 注册自定义节点
    registerNodes(this.lf);

    // 设置默认缩放
    if (this.config.zoom.defaultZoom) {
      this.lf.zoom(this.config.zoom.defaultZoom);
    }

    // 绑定事件
    this.bindEvents();

    // 如果是只读模式，禁用所有交互
    if (this.config.readonly) {
      this.setReadonly(true);
    }
  }

  /**
   * 规范化配置
   */
  private normalizeConfig(config: EditorConfig): Required<EditorConfig> {
    return {
      container: config.container,
      readonly: config.readonly ?? false,
      width: config.width ?? '100%',
      height: config.height ?? '100%',
      grid: {
        visible: config.grid?.visible ?? true,
        size: config.grid?.size ?? 20,
        type: config.grid?.type ?? 'dot',
      },
      zoom: {
        minZoom: config.zoom?.minZoom ?? 0.2,
        maxZoom: config.zoom?.maxZoom ?? 4,
        defaultZoom: config.zoom?.defaultZoom ?? 1,
      },
      toolbar: {
        visible: config.toolbar?.visible ?? true,
        position: config.toolbar?.position ?? 'top',
        tools: config.toolbar?.tools ?? ['undo', 'redo', 'zoom-in', 'zoom-out', 'fit', 'download'],
      },
      miniMap: {
        visible: config.miniMap?.visible ?? false,
        position: config.miniMap?.position ?? 'right-bottom',
      },
      theme: {
        name: config.theme?.name ?? 'default',
        colors: config.theme?.colors ?? {},
      },
      keyboard: {
        enabled: config.keyboard?.enabled ?? true,
      },
      snapline: {
        enabled: config.snapline?.enabled ?? true,
      },
    };
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    if (!this.lf) return;

    // 节点事件
    this.lf.on('node:click', ({ data }) => {
      this.events['node:click']?.(this.transformNodeData(data));
    });

    this.lf.on('node:dblclick', ({ data }) => {
      this.events['node:dblclick']?.(this.transformNodeData(data));
    });

    this.lf.on('node:add', ({ data }) => {
      this.events['node:add']?.(this.transformNodeData(data));
      this.emitDataChange();
    });

    this.lf.on('node:delete', ({ data }) => {
      this.events['node:delete']?.(this.transformNodeData(data));
      this.emitDataChange();
    });

    // 边事件
    this.lf.on('edge:click', ({ data }) => {
      this.events['edge:click']?.(this.transformEdgeData(data));
    });

    this.lf.on('edge:add', ({ data }) => {
      this.events['edge:add']?.(this.transformEdgeData(data));
      this.emitDataChange();
    });

    this.lf.on('edge:delete', ({ data }) => {
      this.events['edge:delete']?.(this.transformEdgeData(data));
      this.emitDataChange();
    });

    // 选中事件
    this.lf.on('selection:selected', () => {
      const selection = this.lf!.getSelectElements(true);
      this.events['selection:change']?.({
        nodes: selection.nodes.map(n => this.transformNodeData(n)),
        edges: selection.edges.map(e => this.transformEdgeData(e)),
      });
    });
  }

  /**
   * 转换节点数据
   */
  private transformNodeData(data: any): NodeData {
    return {
      id: data.id,
      type: data.type as ApprovalNodeType,
      name: data.text?.value || data.properties?.name || '',
      description: data.properties?.description,
      approvalMode: data.properties?.approvalMode,
      approvers: data.properties?.approvers,
      conditions: data.properties?.conditions,
      ccUsers: data.properties?.ccUsers,
      properties: data.properties,
    };
  }

  /**
   * 转换边数据
   */
  private transformEdgeData(data: any): EdgeData {
    return {
      id: data.id,
      sourceNodeId: data.sourceNodeId,
      targetNodeId: data.targetNodeId,
      name: data.text?.value || data.properties?.name,
      condition: data.properties?.condition,
      properties: data.properties,
    };
  }

  /**
   * 触发数据变化事件
   */
  private emitDataChange(): void {
    const data = this.getData();
    this.events['data:change']?.(data);
  }

  /**
   * 注册事件监听
   */
  on<K extends keyof EditorEvents>(event: K, handler: EditorEvents[K]): void {
    this.events[event] = handler;
  }

  /**
   * 移除事件监听
   */
  off<K extends keyof EditorEvents>(event: K): void {
    delete this.events[event];
  }

  /**
   * 设置数据
   */
  setData(data: FlowChartData): void {
    if (!this.lf) return;

    const graphData = {
      nodes: data.nodes.map(node => ({
        id: node.id,
        type: node.type,
        x: 100,
        y: 100,
        text: node.name,
        properties: {
          name: node.name,
          description: node.description,
          approvalMode: node.approvalMode,
          approvers: node.approvers,
          conditions: node.conditions,
          ccUsers: node.ccUsers,
          ...node.properties,
        },
      })),
      edges: data.edges.map(edge => ({
        id: edge.id,
        type: 'polyline',
        sourceNodeId: edge.sourceNodeId,
        targetNodeId: edge.targetNodeId,
        text: edge.name,
        properties: {
          name: edge.name,
          condition: edge.condition,
          ...edge.properties,
        },
      })),
    };

    this.lf.render(graphData);
  }

  /**
   * 获取数据
   */
  getData(): FlowChartData {
    if (!this.lf) {
      return { nodes: [], edges: [] };
    }

    const graphData = this.lf.getGraphData();
    return {
      nodes: graphData.nodes.map(node => this.transformNodeData(node)),
      edges: graphData.edges.map(edge => this.transformEdgeData(edge)),
    };
  }

  /**
   * 添加节点
   */
  addNode(node: Partial<NodeData> & { type: ApprovalNodeType }): string {
    if (!this.lf) throw new Error('Editor not initialized');

    const nodeConfig = {
      type: node.type,
      x: 100,
      y: 100,
      text: node.name || '',
      properties: {
        name: node.name,
        description: node.description,
        approvalMode: node.approvalMode,
        approvers: node.approvers,
        conditions: node.conditions,
        ccUsers: node.ccUsers,
        ...node.properties,
      },
    };

    const result = this.lf.addNode(nodeConfig);
    return result.id;
  }

  /**
   * 更新节点
   */
  updateNode(nodeId: string, data: Partial<NodeData>): void {
    if (!this.lf) return;

    const nodeData = this.lf.getNodeDataById(nodeId);
    if (!nodeData) return;

    this.lf.setProperties(nodeId, {
      ...nodeData.properties,
      name: data.name,
      description: data.description,
      approvalMode: data.approvalMode,
      approvers: data.approvers,
      conditions: data.conditions,
      ccUsers: data.ccUsers,
      ...data.properties,
    });

    if (data.name) {
      this.lf.updateText(nodeId, data.name);
    }
  }

  /**
   * 删除节点
   */
  deleteNode(nodeId: string): void {
    if (!this.lf) return;
    this.lf.deleteNode(nodeId);
  }

  /**
   * 删除边
   */
  deleteEdge(edgeId: string): void {
    if (!this.lf) return;
    this.lf.deleteEdge(edgeId);
  }

  /**
   * 验证流程图
   */
  validate(): ValidationResult {
    const data = this.getData();
    const errors: ValidationResult['errors'] = [];

    // 检查是否有开始节点
    const startNodes = data.nodes.filter(n => n.type === ApprovalNodeType.START);
    if (startNodes.length === 0) {
      errors.push({
        type: 'missing-start',
        message: '流程图必须有一个开始节点',
      });
    } else if (startNodes.length > 1) {
      errors.push({
        type: 'multiple-start',
        message: '流程图只能有一个开始节点',
      });
    }

    // 检查是否有结束节点
    const endNodes = data.nodes.filter(n => n.type === ApprovalNodeType.END);
    if (endNodes.length === 0) {
      errors.push({
        type: 'missing-end',
        message: '流程图必须至少有一个结束节点',
      });
    }

    // 检查审批节点是否配置了审批人
    data.nodes.forEach(node => {
      if (node.type === ApprovalNodeType.APPROVAL) {
        if (!node.approvers || node.approvers.length === 0) {
          errors.push({
            type: 'missing-approvers',
            message: `审批节点"${node.name}"未配置审批人`,
            nodeId: node.id,
          });
        }
      }
    });

    // 检查条件节点是否配置了条件
    data.nodes.forEach(node => {
      if (node.type === ApprovalNodeType.CONDITION) {
        if (!node.conditions || node.conditions.length === 0) {
          errors.push({
            type: 'missing-conditions',
            message: `条件节点"${node.name}"未配置条件`,
            nodeId: node.id,
          });
        }
      }
    });

    // 检查节点连接
    data.nodes.forEach(node => {
      const incomingEdges = data.edges.filter(e => e.targetNodeId === node.id);
      const outgoingEdges = data.edges.filter(e => e.sourceNodeId === node.id);

      if (node.type === ApprovalNodeType.START && incomingEdges.length > 0) {
        errors.push({
          type: 'invalid-connection',
          message: `开始节点"${node.name}"不能有输入连线`,
          nodeId: node.id,
        });
      }

      if (node.type === ApprovalNodeType.END && outgoingEdges.length > 0) {
        errors.push({
          type: 'invalid-connection',
          message: `结束节点"${node.name}"不能有输出连线`,
          nodeId: node.id,
        });
      }

      if (node.type !== ApprovalNodeType.START && incomingEdges.length === 0) {
        errors.push({
          type: 'disconnected-node',
          message: `节点"${node.name}"没有输入连线`,
          nodeId: node.id,
        });
      }

      if (node.type !== ApprovalNodeType.END && outgoingEdges.length === 0) {
        errors.push({
          type: 'disconnected-node',
          message: `节点"${node.name}"没有输出连线`,
          nodeId: node.id,
        });
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 设置只读模式
   */
  setReadonly(readonly: boolean): void {
    if (!this.lf) return;

    this.config.readonly = readonly;

    if (readonly) {
      this.lf.updateEditConfig({
        stopScrollGraph: true,
        stopZoomGraph: true,
        stopMoveGraph: true,
        adjustEdge: false,
        adjustEdgeStartAndEnd: false,
        adjustNodePosition: false,
        hideAnchors: true,
      });
    } else {
      this.lf.updateEditConfig({
        stopScrollGraph: false,
        stopZoomGraph: false,
        stopMoveGraph: false,
        adjustEdge: true,
        adjustEdgeStartAndEnd: true,
        adjustNodePosition: true,
        hideAnchors: false,
      });
    }
  }

  /**
   * 缩放
   */
  zoom(scale?: number): void {
    if (!this.lf) return;

    if (scale !== undefined) {
      this.lf.zoom(scale);
    }
  }

  /**
   * 放大
   */
  zoomIn(): void {
    if (!this.lf) return;
    const currentZoom = this.lf.getTransform().SCALE_X;
    this.lf.zoom(currentZoom + 0.1);
  }

  /**
   * 缩小
   */
  zoomOut(): void {
    if (!this.lf) return;
    const currentZoom = this.lf.getTransform().SCALE_X;
    this.lf.zoom(currentZoom - 0.1);
  }

  /**
   * 适应画布
   */
  fit(): void {
    if (!this.lf) return;
    this.lf.fitView();
  }

  /**
   * 重置缩放
   */
  resetZoom(): void {
    if (!this.lf) return;
    this.lf.resetZoom();
  }

  /**
   * 撤销
   */
  undo(): void {
    if (!this.lf) return;
    this.lf.undo();
  }

  /**
   * 重做
   */
  redo(): void {
    if (!this.lf) return;
    this.lf.redo();
  }

  /**
   * 导出
   */
  async export(config: ExportConfig): Promise<string | Blob> {
    if (!this.lf) throw new Error('Editor not initialized');

    switch (config.type) {
      case 'json':
        return JSON.stringify(this.getData(), null, 2);

      case 'png':
      case 'jpg':
        const imageData = await this.lf.getSnapshot(
          config.filename || 'flowchart',
          config.backgroundColor || '#ffffff',
          config.type
        );
        return imageData;

      default:
        throw new Error(`Unsupported export type: ${config.type}`);
    }
  }

  /**
   * 清空画布
   */
  clear(): void {
    if (!this.lf) return;
    this.lf.clearData();
  }

  /**
   * 销毁编辑器
   */
  destroy(): void {
    if (this.lf) {
      this.lf.destroy();
      this.lf = null;
    }
    this.events = {};
  }

  /**
   * 获取 LogicFlow 实例
   */
  getLogicFlow(): LogicFlow | null {
    return this.lf;
  }
}
