/**
 * Graph - 图管理器（核心类）
 * 
 * 职责：
 * 1. 管理节点和边的数据模型
 * 2. 协调视图渲染
 * 3. 事件管理和分发
 * 4. 插件管理
 */

import { NodeModel } from './model/Node';
import { EdgeModel } from './model/Edge';
import { Renderer } from './view/Renderer';
import { EventController } from './controller/EventController';
import { SelectController } from './controller/SelectController';
import { EventBus } from '../utils/EventBus';
import { IdGenerator } from '../utils/IdGenerator';
import { Validator } from '../utils/Validator';
import { GraphConfig, GraphEvent, GraphData, EventHandler } from '../types/graph';
import { NodeConfig, EdgeConfig } from '../types/model';
import { Plugin } from '../types/plugin';

export class Graph {
  // 配置
  private config: GraphConfig;

  // 容器
  private container: HTMLElement;

  // 数据层
  private nodes: Map<string, NodeModel> = new Map();
  private edges: Map<string, EdgeModel> = new Map();

  // 视图层
  private renderer: Renderer;

  // 控制器
  private eventController: EventController;
  private selectController: SelectController;

  // 事件系统
  private eventBus: EventBus;

  // 插件系统
  private plugins: Map<string, Plugin> = new Map();

  // 状态
  private destroyed = false;
  private ready = false;

  constructor(config: GraphConfig) {
    this.config = this.normalizeConfig(config);
    this.container = this.getContainer(config.container);
    this.eventBus = new EventBus();

    // 初始化渲染器
    this.renderer = new Renderer(this.container, {
      zoom: 1,
      minZoom: 0.1,
      maxZoom: 3,
      enableZoom: true,
      enablePan: true,
    });

    // 初始化控制器
    const svg = this.renderer.getSVG();
    this.eventController = new EventController(svg, this.eventBus);

    // SelectController 需要访问视图，暂时传入空的Map，后续会更新
    this.selectController = new SelectController(
      new Map(),
      new Map(),
      this.eventBus
    );

    // 绑定内部事件
    this.bindInternalEvents();

    // 标记为就绪
    this.ready = true;
    this.eventBus.emit(GraphEvent.GRAPH_READY);
  }

  /**
   * 规范化配置
   */
  private normalizeConfig(config: GraphConfig): GraphConfig {
    return {
      ...config,
      autoLayout: config.autoLayout !== false,
      nodeGap: config.nodeGap || 80,
      levelGap: config.levelGap || 120,
    };
  }

  /**
   * 获取容器元素
   */
  private getContainer(container: HTMLElement | string): HTMLElement {
    if (typeof container === 'string') {
      const element = document.querySelector(container);
      if (!element) {
        throw new Error(`Container not found: ${container}`);
      }
      return element as HTMLElement;
    }
    return container;
  }

  /**
   * 绑定内部事件
   */
  private bindInternalEvents(): void {
    // 节点点击事件
    this.eventBus.on(GraphEvent.NODE_CLICK, ({ id }) => {
      this.selectController.selectNode(id);
    });

    // 边点击事件
    this.eventBus.on(GraphEvent.EDGE_CLICK, ({ id }) => {
      this.selectController.selectEdge(id);
    });

    // 画布点击事件
    this.eventBus.on(GraphEvent.CANVAS_CLICK, () => {
      this.selectController.clearSelection();
    });
  }

  /**
   * 添加节点
   */
  addNode(config: NodeConfig): NodeModel {
    if (this.destroyed) {
      throw new Error('Graph has been destroyed');
    }

    // 生成ID（如果没有提供）
    if (!config.id) {
      config.id = IdGenerator.genNodeId();
    }

    // 验证配置
    const validation = Validator.validateNode(config);
    if (!validation.valid) {
      throw new Error(`Invalid node config: ${validation.errors.join(', ')}`);
    }

    // 检查ID冲突
    if (this.nodes.has(config.id)) {
      throw new Error(`Node with id "${config.id}" already exists`);
    }

    // 创建模型
    const model = new NodeModel(config);
    this.nodes.set(model.id, model);

    // 渲染视图
    this.renderer.renderNode(model);

    // 触发事件
    this.eventBus.emit(GraphEvent.NODE_ADDED, { model });

    return model;
  }

  /**
   * 添加边
   */
  addEdge(config: EdgeConfig): EdgeModel {
    if (this.destroyed) {
      throw new Error('Graph has been destroyed');
    }

    // 生成ID（如果没有提供）
    if (!config.id) {
      config.id = IdGenerator.genEdgeId();
    }

    // 验证配置
    const validation = Validator.validateEdge(config);
    if (!validation.valid) {
      throw new Error(`Invalid edge config: ${validation.errors.join(', ')}`);
    }

    // 检查ID冲突
    if (this.edges.has(config.id)) {
      throw new Error(`Edge with id "${config.id}" already exists`);
    }

    // 检查源节点和目标节点是否存在
    const sourceNode = this.nodes.get(config.source);
    const targetNode = this.nodes.get(config.target);

    if (!sourceNode) {
      throw new Error(`Source node "${config.source}" not found`);
    }

    if (!targetNode) {
      throw new Error(`Target node "${config.target}" not found`);
    }

    // 创建模型
    const model = new EdgeModel(config);
    this.edges.set(model.id, model);

    // 更新节点的边关系
    sourceNode.addOutgoingEdge(model.id);
    targetNode.addIncomingEdge(model.id);

    // 渲染视图
    this.renderer.renderEdge(model);

    // 触发事件
    this.eventBus.emit(GraphEvent.EDGE_ADDED, { model });

    return model;
  }

  /**
   * 移除节点
   */
  removeNode(id: string): boolean {
    const model = this.nodes.get(id);
    if (!model) return false;

    // 移除相关的边
    const incomingEdges = model.getIncomingEdges();
    const outgoingEdges = model.getOutgoingEdges();
    [...incomingEdges, ...outgoingEdges].forEach(edgeId => {
      this.removeEdge(edgeId);
    });

    // 移除视图
    this.renderer.removeNode(id);

    // 移除模型
    model.destroy();
    this.nodes.delete(id);

    // 触发事件
    this.eventBus.emit(GraphEvent.NODE_REMOVED, { id });

    return true;
  }

  /**
   * 移除边
   */
  removeEdge(id: string): boolean {
    const model = this.edges.get(id);
    if (!model) return false;

    // 更新节点的边关系
    const sourceNode = this.nodes.get(model.source);
    const targetNode = this.nodes.get(model.target);

    if (sourceNode) {
      sourceNode.removeOutgoingEdge(id);
    }

    if (targetNode) {
      targetNode.removeIncomingEdge(id);
    }

    // 移除视图
    this.renderer.removeEdge(id);

    // 移除模型
    model.destroy();
    this.edges.delete(id);

    // 触发事件
    this.eventBus.emit(GraphEvent.EDGE_REMOVED, { id });

    return true;
  }

  /**
   * 获取节点
   */
  getNode(id: string): NodeModel | undefined {
    return this.nodes.get(id);
  }

  /**
   * 获取边
   */
  getEdge(id: string): EdgeModel | undefined {
    return this.edges.get(id);
  }

  /**
   * 获取所有节点
   */
  getNodes(): NodeModel[] {
    return Array.from(this.nodes.values());
  }

  /**
   * 获取所有边
   */
  getEdges(): EdgeModel[] {
    return Array.from(this.edges.values());
  }

  /**
   * 清空图
   */
  clear(): void {
    // 移除所有边
    Array.from(this.edges.keys()).forEach(id => this.removeEdge(id));

    // 移除所有节点
    Array.from(this.nodes.keys()).forEach(id => this.removeNode(id));

    // 清空渲染器
    this.renderer.clear();
  }

  /**
   * 加载数据
   */
  load(data: GraphData): void {
    // 验证数据
    const validation = Validator.validateGraphData(data);
    if (!validation.valid) {
      throw new Error(`Invalid graph data: ${validation.errors.join(', ')}`);
    }

    // 清空现有数据
    this.clear();

    // 添加节点
    data.nodes.forEach(nodeConfig => {
      this.addNode(nodeConfig);
    });

    // 添加边
    data.edges.forEach(edgeConfig => {
      this.addEdge(edgeConfig);
    });

    // 如果启用自动布局，执行布局
    if (this.config.autoLayout) {
      // TODO: 执行自动布局
      // this.layout();
    }

    // 居中内容
    this.centerContent();
  }

  /**
   * 导出数据
   */
  toJSON(): GraphData {
    return {
      nodes: this.getNodes().map(node => node.toJSON()) as any,
      edges: this.getEdges().map(edge => edge.toJSON()) as any,
    };
  }

  /**
   * 注册插件
   */
  use(plugin: Plugin): void {
    if (this.plugins.has(plugin.name)) {
      console.warn(`Plugin "${plugin.name}" already registered`);
      return;
    }

    plugin.install(this);
    this.plugins.set(plugin.name, plugin);
  }

  /**
   * 卸载插件
   */
  unuse(pluginName: string): void {
    const plugin = this.plugins.get(pluginName);
    if (plugin?.uninstall) {
      plugin.uninstall(this);
    }
    this.plugins.delete(pluginName);
  }

  /**
   * 监听事件
   */
  on(event: GraphEvent | string, handler: EventHandler): void {
    this.eventBus.on(event, handler);
  }

  /**
   * 监听一次事件
   */
  once(event: GraphEvent | string, handler: EventHandler): void {
    this.eventBus.once(event, handler);
  }

  /**
   * 移除事件监听
   */
  off(event: GraphEvent | string, handler?: EventHandler): void {
    this.eventBus.off(event, handler);
  }

  /**
   * 触发事件
   */
  emit(event: GraphEvent | string, ...args: any[]): void {
    this.eventBus.emit(event, ...args);
  }

  /**
   * 获取渲染器
   */
  getRenderer(): Renderer {
    return this.renderer;
  }

  /**
   * 获取选择控制器
   */
  getSelectController(): SelectController {
    return this.selectController;
  }

  /**
   * 居中内容
   */
  centerContent(): void {
    this.renderer.centerContent();
  }

  /**
   * 适应内容
   */
  fitContent(padding?: number): void {
    this.renderer.fitContent(padding);
  }

  /**
   * 放大
   */
  zoomIn(): void {
    this.renderer.getViewport().zoomIn();
  }

  /**
   * 缩小
   */
  zoomOut(): void {
    this.renderer.getViewport().zoomOut();
  }

  /**
   * 设置缩放
   */
  setZoom(zoom: number): void {
    this.renderer.getViewport().setZoom(zoom);
  }

  /**
   * 获取缩放
   */
  getZoom(): number {
    return this.renderer.getViewport().getZoom();
  }

  /**
   * 是否已就绪
   */
  isReady(): boolean {
    return this.ready;
  }

  /**
   * 销毁图
   */
  destroy(): void {
    if (this.destroyed) return;

    // 卸载所有插件
    this.plugins.forEach((plugin, name) => {
      this.unuse(name);
    });

    // 清空数据
    this.clear();

    // 销毁控制器
    this.eventController.destroy();

    // 销毁渲染器
    this.renderer.destroy();

    // 清空事件
    this.eventBus.emit(GraphEvent.GRAPH_DESTROY);
    this.eventBus.clear();

    this.destroyed = true;
  }

  /**
   * 是否已销毁
   */
  isDestroyed(): boolean {
    return this.destroyed;
  }
}

