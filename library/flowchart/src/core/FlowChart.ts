import { FlowNode } from './Node';
import { FlowEdge } from './Edge';
import { LayoutEngine } from '../layout/LayoutEngine';
import { Renderer } from '../renderer/Renderer';
import {
  FlowChartConfig,
  NodeData,
  EdgeData,
  NodeType,
  NodeStatus,
  LayoutConfig,
  RenderConfig
} from '../types';
import { DEFAULT_NODE_STYLES } from '../styles/defaultStyles';
import { DEFAULT_CONFIG } from '../utils/constants';

/**
 * 流程图主类
 */
export class FlowChart {
  private container: HTMLElement;
  private config: FlowChartConfig;
  private nodes: Map<string, FlowNode>;
  private edges: Map<string, FlowEdge>;
  private renderer: Renderer;
  private layoutEngine: LayoutEngine;

  constructor(config: FlowChartConfig) {
    this.config = {
      nodeGap: DEFAULT_CONFIG.NODE_GAP,
      levelGap: DEFAULT_CONFIG.LEVEL_GAP,
      enableDrag: false,
      enableZoom: DEFAULT_CONFIG.ENABLE_ZOOM,
      enablePan: DEFAULT_CONFIG.ENABLE_PAN,
      enableNodeDrag: DEFAULT_CONFIG.ENABLE_NODE_DRAG,
      autoLayout: DEFAULT_CONFIG.AUTO_LAYOUT,
      ...config
    };

    // 获取容器
    if (typeof config.container === 'string') {
      const element = document.querySelector(config.container);
      if (!element) {
        throw new Error(`Container not found: ${config.container}`);
      }
      this.container = element as HTMLElement;
    } else {
      this.container = config.container;
    }

    // 设置容器样式
    this.container.style.position = 'relative';
    this.container.style.overflow = 'hidden';
    if (this.config.width) {
      this.container.style.width = `${this.config.width}px`;
    }
    if (this.config.height) {
      this.container.style.height = `${this.config.height}px`;
    }

    this.nodes = new Map();
    this.edges = new Map();

    // 初始化布局引擎
    const layoutConfig: LayoutConfig = {
      direction: 'TB',
      nodeGap: this.config.nodeGap!,
      levelGap: this.config.levelGap!
    };
    this.layoutEngine = new LayoutEngine(layoutConfig);

    // 初始化渲染器
    const renderConfig: RenderConfig = {
      nodeDefaultSize: { width: DEFAULT_CONFIG.NODE_WIDTH, height: DEFAULT_CONFIG.NODE_HEIGHT },
      nodeStyles: DEFAULT_NODE_STYLES,
      edgeDefaultStyle: {
        strokeColor: '#666',
        strokeWidth: DEFAULT_CONFIG.EDGE_STROKE_WIDTH,
        arrowSize: DEFAULT_CONFIG.ARROW_SIZE
      }
    };
    this.renderer = new Renderer(this.container, renderConfig, {
      enableZoom: this.config.enableZoom,
      enablePan: this.config.enablePan ?? this.config.enableDrag, // 兼容旧参数
      enableNodeDrag: this.config.enableNodeDrag
    });
    this.renderer.init();
  }

  /**
   * 添加节点
   */
  public addNode(data: NodeData): FlowNode {
    if (this.nodes.has(data.id)) {
      throw new Error(`Node with id ${data.id} already exists`);
    }

    const node = new FlowNode(data);
    this.nodes.set(data.id, node);
    return node;
  }

  /**
   * 添加边
   */
  public addEdge(data: EdgeData): FlowEdge {
    if (this.edges.has(data.id)) {
      throw new Error(`Edge with id ${data.id} already exists`);
    }

    const source = this.nodes.get(data.source);
    const target = this.nodes.get(data.target);

    if (!source) {
      throw new Error(`Source node not found: ${data.source}`);
    }
    if (!target) {
      throw new Error(`Target node not found: ${data.target}`);
    }

    const edge = new FlowEdge(data, source, target);
    this.edges.set(data.id, edge);

    // 更新节点连接关系
    source.addOutput(target);
    target.addInput(source);

    return edge;
  }

  /**
   * 删除节点
   */
  public removeNode(id: string): boolean {
    const node = this.nodes.get(id);
    if (!node) {
      return false;
    }

    // 删除相关的边
    const edgesToRemove: string[] = [];
    this.edges.forEach((edge, edgeId) => {
      if (edge.source.id === id || edge.target.id === id) {
        edgesToRemove.push(edgeId);
      }
    });

    edgesToRemove.forEach(edgeId => this.removeEdge(edgeId));

    this.nodes.delete(id);
    return true;
  }

  /**
   * 删除边
   */
  public removeEdge(id: string): boolean {
    const edge = this.edges.get(id);
    if (!edge) {
      return false;
    }

    // 更新节点连接关系
    edge.source.removeOutput(edge.target);
    edge.target.removeInput(edge.source);

    this.edges.delete(id);
    return true;
  }

  /**
   * 获取节点
   */
  public getNode(id: string): FlowNode | undefined {
    return this.nodes.get(id);
  }

  /**
   * 获取边
   */
  public getEdge(id: string): FlowEdge | undefined {
    return this.edges.get(id);
  }

  /**
   * 获取所有节点
   */
  public getAllNodes(): FlowNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * 获取所有边
   */
  public getAllEdges(): FlowEdge[] {
    return Array.from(this.edges.values());
  }

  /**
   * 更新节点状态
   */
  public updateNodeStatus(id: string, status: NodeStatus): void {
    const node = this.nodes.get(id);
    if (node) {
      node.updateStatus(status);
      this.render();
    }
  }

  /**
   * 执行自动布局
   */
  public layout(): void {
    this.layoutEngine.layout(this.nodes);
  }

  /**
   * 渲染流程图
   */
  public render(): void {
    this.renderer.clear();

    // 如果启用自动布局
    if (this.config.autoLayout) {
      this.layout();
    }

    // 先设置所有节点（用于智能路由）
    this.renderer.setNodesForEdgeRouting(this.nodes);

    // 渲染所有边
    const edgeClickHandler = this.config.onEdgeClick 
      ? (edge: FlowEdge) => this.config.onEdgeClick?.(edge.toJSON())
      : undefined;
    
    this.edges.forEach(edge => {
      this.renderer.renderEdge(edge, edgeClickHandler);
    });

    // 渲染所有节点
    this.nodes.forEach(node => {
      this.renderer.renderNode(node, this.config.onNodeClick);
    });

    // 只在第一次渲染时自动适应视图
    if (this.nodes.size > 0 && !this.hasRendered) {
      setTimeout(() => {
        this.renderer.fitView();
        this.hasRendered = true;
      }, 0);
    }
  }

  private hasRendered = false;

  /**
   * 清空流程图
   */
  public clear(): void {
    this.nodes.clear();
    this.edges.clear();
    this.renderer.clear();
  }

  /**
   * 导出JSON数据
   */
  public toJSON(): { nodes: NodeData[]; edges: EdgeData[] } {
    return {
      nodes: Array.from(this.nodes.values()).map(node => node.toJSON()),
      edges: Array.from(this.edges.values()).map(edge => edge.toJSON())
    };
  }

  /**
   * 从JSON数据加载
   */
  public fromJSON(data: { nodes: NodeData[]; edges: EdgeData[] }): void {
    this.clear();

    // 添加所有节点
    data.nodes.forEach(nodeData => {
      this.addNode(nodeData);
    });

    // 添加所有边
    data.edges.forEach(edgeData => {
      this.addEdge(edgeData);
    });

    this.render();
  }

  /**
   * 批量添加节点和边
   */
  public load(nodes: NodeData[], edges: EdgeData[]): void {
    this.fromJSON({ nodes, edges });
  }

  /**
   * 获取指定节点的所有后继节点
   */
  public getSuccessors(nodeId: string): FlowNode[] {
    const node = this.nodes.get(nodeId);
    if (!node) {
      return [];
    }
    return node.getOutputs();
  }

  /**
   * 获取指定节点的所有前驱节点
   */
  public getPredecessors(nodeId: string): FlowNode[] {
    const node = this.nodes.get(nodeId);
    if (!node) {
      return [];
    }
    return node.getInputs();
  }

  /**
   * 查找起始节点
   */
  public findStartNodes(): FlowNode[] {
    return Array.from(this.nodes.values()).filter(
      node => node.type === NodeType.START || node.getInputs().length === 0
    );
  }

  /**
   * 查找结束节点
   */
  public findEndNodes(): FlowNode[] {
    return Array.from(this.nodes.values()).filter(
      node => node.type === NodeType.END || node.getOutputs().length === 0
    );
  }

  /**
   * 验证流程图
   */
  public validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 检查是否有起始节点
    const startNodes = this.findStartNodes();
    if (startNodes.length === 0) {
      errors.push('No start node found');
    }

    // 检查是否有结束节点
    const endNodes = this.findEndNodes();
    if (endNodes.length === 0) {
      errors.push('No end node found');
    }

    // 检查是否有孤立节点
    this.nodes.forEach(node => {
      if (node.getInputs().length === 0 && node.getOutputs().length === 0) {
        errors.push(`Isolated node found: ${node.id}`);
      }
    });

    // 检查条件节点是否有多个输出
    this.nodes.forEach(node => {
      if (node.type === NodeType.CONDITION && node.getOutputs().length < 2) {
        errors.push(`Condition node ${node.id} should have at least 2 outputs`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 获取渲染器（供编辑器使用）
   */
  public getRenderer(): any {
    return this.renderer;
  }

  /**
   * 销毁实例
   */
  public destroy(): void {
    this.clear();
    this.container.innerHTML = '';
  }
}

