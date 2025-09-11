/**
 * LogicFlow 核心 API 兼容层（适配器）
 * 目的：提供与 @logicflow/core 相近/相同的使用体验与 API（常用子集），
 * 内部基于本项目的 FlowchartEditor 实现。
 */

import { FlowchartEditor } from '@/FlowchartEditor.js';
import type { FlowchartEditorConfig } from '@/FlowchartEditor.js';
import type { FlowchartData, NodeData, EdgeData, Viewport } from '@/types/index.js';
import { EdgeType } from '@/types/index.js';

// 与 LogicFlow 选项大致对齐的类型（只保留常用/关键项）
export interface LogicFlowOptions {
  container: HTMLElement | string;
  width?: number;
  height?: number;
  grid?: boolean | { size?: number; visible?: boolean };
  background?: { color?: string };
  keyboard?: { enabled?: boolean };
  snapline?: { enabled?: boolean; tolerance?: number };
  snap?: { enabled?: boolean; size?: number };
  minZoom?: number;
  maxZoom?: number;
  isSilentMode?: boolean; // 映射为只读
}

// LogicFlow 数据格式（常用子集）
export interface LFText { value?: string }
export interface LFNode {
  id: string;
  type: string;
  x: number;
  y: number;
  text?: LFText;
  properties?: Record<string, any>;
  size?: { width?: number; height?: number };
  // 其他字段忽略
}
export interface LFEdge {
  id: string;
  type: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceAnchorId?: string;
  targetAnchorId?: string;
  text?: LFText;
  properties?: Record<string, any>;
  // 其他字段忽略
}
export interface LFGraphData {
  nodes: LFNode[];
  edges: LFEdge[];
}

// 类型映射：LogicFlow 与本库 EdgeType 的互转
function mapLfEdgeTypeToInternal(type: string): string {
  const t = String(type).toLowerCase();
  if (t === 'polyline' || t === 'orthogonal' || t === 'poly') return EdgeType.ORTHOGONAL as unknown as string;
  if (t === 'bezier' || t === 'curve') return EdgeType.BEZIER as unknown as string;
  if (t === 'line' || t === 'straight') return EdgeType.STRAIGHT as unknown as string;
  return type; // 原样返回，交由内部处理/报错
}
function mapInternalEdgeTypeToLf(type: string): string {
  const t = String(type).toLowerCase();
  if (t === 'orthogonal') return 'polyline';
  if (t === 'bezier') return 'bezier';
  if (t === 'straight') return 'line';
  return type;
}

// 数据映射：LF -> 内部
function fromLFData(lf: LFGraphData): FlowchartData {
  const nodes: NodeData[] = (lf.nodes || []).map(n => ({
    id: n.id,
    type: n.type,
    position: { x: n.x, y: n.y },
    size: n.size ? { width: n.size.width ?? 100, height: n.size.height ?? 60 } : undefined,
    label: n.text?.value ?? '',
    style: {},
    properties: n.properties || {}
  }));
  const edges: EdgeData[] = (lf.edges || []).map(e => ({
    id: e.id,
    type: mapLfEdgeTypeToInternal(e.type),
    source: e.sourceNodeId,
    target: e.targetNodeId,
    sourcePort: e.sourceAnchorId,
    targetPort: e.targetAnchorId,
    label: e.text?.value,
    style: {},
    properties: e.properties || {}
  }));
  return { nodes, edges };
}

// 数据映射：内部 -> LF
function toLFData(data: FlowchartData): LFGraphData {
  const nodes: LFNode[] = (data.nodes || []).map(n => ({
    id: n.id,
    type: n.type,
    x: n.position.x,
    y: n.position.y,
    text: n.label ? { value: n.label } : undefined,
    properties: n.properties || {},
    size: n.size ? { width: n.size.width, height: n.size.height } : undefined
  }));
  const edges: LFEdge[] = (data.edges || []).map(e => ({
    id: e.id,
    type: mapInternalEdgeTypeToLf(e.type),
    sourceNodeId: e.source,
    targetNodeId: e.target,
    sourceAnchorId: e.sourcePort,
    targetAnchorId: e.targetPort,
    text: e.label ? { value: e.label } : undefined,
    properties: e.properties || {}
  }));
  return { nodes, edges };
}

function resolveContainer(el: HTMLElement | string): HTMLElement {
  if (typeof el !== 'string') return el;
  const found = document.querySelector(el);
  if (!found || !(found instanceof HTMLElement)) {
    throw new Error(`未找到容器元素: ${el}`);
  }
  return found as HTMLElement;
}

export class LogicFlow {
  private editor: FlowchartEditor;

  constructor(options: LogicFlowOptions) {
    const container = resolveContainer(options.container);
    const grid = options.grid;

    const cfg: FlowchartEditorConfig = {
      container,
      width: options.width,
      height: options.height,
      showGrid: typeof grid === 'boolean' ? grid : grid?.visible !== false,
      // 吸附（近似于 LogicFlow 的 snapline / snap）
      enableSnap: options.snap?.enabled ?? false,
      snapSize: options.snap?.size ?? 10,
      readonly: options.isSilentMode === true,
      minZoom: options.minZoom,
      maxZoom: options.maxZoom
    };

    this.editor = new FlowchartEditor(cfg);
  }

  // 生命周期
  destroy(): void {
    this.editor.destroy();
  }

  // 渲染/数据
  render(graphData: LFGraphData): void {
    this.editor.loadData(fromLFData(graphData));
  }

  setGraphData(graphData: LFGraphData): void {
    this.render(graphData);
  }

  getGraphData(): LFGraphData {
    return toLFData(this.editor.getData());
  }

  getData(): LFGraphData { // 兼容别名
    return this.getGraphData();
  }

  // 节点
  addNode(node: Partial<LFNode>): { id: string } {
    if (!node || !node.type) throw new Error('addNode: 缺少节点类型');
    const id = node.id || `node_${Date.now()}`;
    const n: NodeData = {
      id,
      type: node.type,
      position: { x: node.x ?? 0, y: node.y ?? 0 },
      size: node.size ? { width: node.size.width ?? 100, height: node.size.height ?? 60 } : undefined,
      label: node.text?.value ?? '',
      style: {},
      properties: node.properties || {}
    };
    this.editor.addNode(n);
    return { id };
  }

  deleteNode(id: string): void {
    this.editor.removeNode(id);
  }

  updateNodeAttributes(id: string, attrs: Partial<LFNode & { text?: LFText }>): void {
    const updates: Partial<NodeData> = {};
    if (attrs.text && 'value' in attrs.text) updates.label = attrs.text?.value;
    if (attrs.x !== undefined || attrs.y !== undefined) {
      const vp = this.editor.getViewport(); // 不使用 viewport，纯数据更新
      updates.position = { x: attrs.x ?? 0, y: attrs.y ?? 0 } as any;
    }
    if (attrs.size) {
      updates.size = { width: attrs.size.width ?? 100, height: attrs.size.height ?? 60 } as any;
    }
    if (attrs.properties) {
      updates.properties = attrs.properties as any;
    }
    this.editor.updateNode(id, updates);
  }

  // 边
  addEdge(edge: Partial<LFEdge>): { id: string } {
    if (!edge || !edge.type) throw new Error('addEdge: 缺少连接线类型');
    if (!edge.sourceNodeId || !edge.targetNodeId) throw new Error('addEdge: 需要 sourceNodeId 与 targetNodeId');
    const id = edge.id || `edge_${Date.now()}`;
    const e: EdgeData = {
      id,
      type: mapLfEdgeTypeToInternal(edge.type),
      source: edge.sourceNodeId,
      target: edge.targetNodeId,
      sourcePort: edge.sourceAnchorId,
      targetPort: edge.targetAnchorId,
      label: edge.text?.value,
      style: {},
      properties: edge.properties || {}
    };
    this.editor.addEdge(e);
    return { id };
  }

  deleteEdge(id: string): void {
    this.editor.removeEdge(id);
  }

  updateEdgeAttributes(id: string, attrs: Partial<LFEdge & { text?: LFText }>): void {
    const updates: Partial<EdgeData> = {};
    if (attrs.text && 'value' in attrs.text) updates.label = attrs.text?.value;
    if (attrs.properties) updates.properties = attrs.properties as any;
    if (attrs.type) (updates as any).type = mapLfEdgeTypeToInternal(attrs.type);
    if (attrs.sourceAnchorId !== undefined) (updates as any).sourcePort = attrs.sourceAnchorId;
    if (attrs.targetAnchorId !== undefined) (updates as any).targetPort = attrs.targetAnchorId;
    this.editor.updateEdge(id, updates);
  }

  // 视图控制
  zoom(value: number): void { this.editor.setZoom(value); }
  setZoom(value: number): void { this.zoom(value); }
  getZoom(): number { return this.editor.getZoom(); }
  fitView(): void { this.editor.zoomToFit(); }
  translate(dx: number, dy: number): void { this.editor.translate(dx, dy); }
  setOffset(x: number, y: number): void { this.editor.setOffset(x, y); }
  getViewport(): Viewport { return this.editor.getViewport(); }

  // 事件（直接透传）
  on(event: string, handler: (...args: any[]) => void): void { (this.editor as any).on(event, handler); }
  off(event: string, handler: (...args: any[]) => void): void { (this.editor as any).off(event, handler); }
  once(event: string, handler: (...args: any[]) => void): void { (this.editor as any).once(event, handler); }
  emit(event: string, payload?: any): void { (this.editor as any).emit(event, payload); }

  // 配置/扩展（保留空实现或最小实现，保证兼容调用不报错）
  setTheme(_: any): void { /* 暂未实现主题，预留 */ }
  setDefaultEdgeType(type: string): void { /* 可映射到内部当前连线类型，暂留 */ }

  // 插件机制占位：@logicflow/core 常用 use(plugin, options)
  use(_plugin: any, _options?: any): this {
    // 可在此实现与本库的扩展适配
    return this;
  }

  // 注册机制占位：register(自定义节点/边)
  register(_something: any): void {
    // 本库内部支持 NodeFactory/EdgeFactory 注册，但当前编辑器实例未暴露工厂；
    // 如需对接，可在 FlowchartEditor 增加公开的 register 方法并在此调用。
  }
}

