/**
 * 流程图编辑器主类
 * 整合所有组件，提供完整的流程图编辑功能
 */

import type {
  FlowchartData,
  NodeData,
  EdgeData,
  Point,
  Viewport,
  EventEmitter
} from '@/types/index.js';
import { EventType, NodeType, EdgeType } from '@/types/index.js';
import { SimpleEventEmitter, createHighDPICanvas } from '@/utils/index.js';
import { CanvasRenderer, DataManager } from '@/core/index.js';
import { NodeFactory } from '@/nodes/index.js';
import { EdgeFactory } from '@/edges/index.js';
import { 
  SelectionManager, 
  InteractionManager, 
  CommandManager, 
  InteractionMode,
  AddNodeCommand,
  RemoveNodeCommand,
  MoveNodeCommand,
  AddEdgeCommand,
  RemoveEdgeCommand,
  UpdateNodeCommand,
  UpdateEdgeCommand 
} from '@/managers/index.js';
import { Toolbar, PropertyPanel, StatusBar } from '@/ui/index.js';
import { i18n } from '@/ui/i18n.js';
import type { ToolbarConfig, PropertyPanelConfig } from '@/ui/index.js';

/**
 * 编辑器配置
 */
export interface FlowchartEditorConfig {
  /** 容器元素 */
  container: HTMLElement;
  /** 画布宽度 */
  width?: number;
  /** 画布高度 */
  height?: number;
  /** 初始数据 */
  data?: FlowchartData;
  /** 工具栏配置 */
  toolbar?: ToolbarConfig | false;
  /** 属性面板配置 */
  propertyPanel?: PropertyPanelConfig | false;
  /** 是否启用网格 */
  showGrid?: boolean;
  /** 是否启用标尺 */
  showRuler?: boolean;
  /** 是否只读模式 */
  readonly?: boolean;
  /** 最小缩放比例 */
  minZoom?: number;
  /** 最大缩放比例 */
  maxZoom?: number;
  /** 是否启用网格吸附（拖拽时） */
  enableSnap?: boolean;
  /** 吸附网格大小（像素） */
  snapSize?: number;
}

/**
 * 流程图编辑器类
 */
export class FlowchartEditor extends SimpleEventEmitter implements EventEmitter {
  private container: HTMLElement;
  private canvas!: HTMLCanvasElement;
  private config: FlowchartEditorConfig;

  // 状态/辅助
  private currentGuides: { vertical: number[]; horizontal: number[] } = { vertical: [], horizontal: [] };
  private showGuides: boolean = true;
  private liveEdgeOverrides: Map<string, { waypoints?: { x: number; y: number }[]; controlPoints?: { x: number; y: number }[] }> = new Map();

  // 核心组件
  private renderer!: CanvasRenderer;
  private dataManager!: DataManager;
  private nodeFactory!: NodeFactory;
  private edgeFactory!: EdgeFactory;

  // 管理器
  private selectionManager!: SelectionManager;
  private interactionManager!: InteractionManager;
  private commandManager!: CommandManager;

  // UI组件
  private toolbar: Toolbar | null = null;
  private propertyPanel: PropertyPanel | null = null;
  private statusBar: StatusBar | null = null;

  // 状态
  private viewport: Viewport = {
    offset: { x: 0, y: 0 },
    scale: 1
  };
  private isInitialized = false;

  // 当前吸附状态（用于状态栏与坐标显示）
  private snapOn: boolean = false;

  constructor(config: FlowchartEditorConfig) {
    super();

    this.config = config;
    this.container = config.container;

    this.initialize();
  }

  /**
   * 初始化编辑器
   */
  private initialize(): void {
    this.createCanvas();
    this.createCoreComponents();
    this.createManagers();
    this.createUIComponents();
    this.setupEventListeners();
    this.loadInitialData();

    this.isInitialized = true;
    this.emit(EventType.EDITOR_READY);
  }

  /**
   * 创建画布
   */
  private createCanvas(): void {
    const width = this.config.width || this.container.clientWidth || 800;
    const height = this.config.height || this.container.clientHeight || 600;

    const canvasResult = createHighDPICanvas(width, height);
    this.canvas = canvasResult.canvas;
    this.canvas.style.display = 'block';
    this.canvas.style.cursor = 'default';
    this.canvas.tabIndex = 0; // 使画布可以获得焦点

    this.container.appendChild(this.canvas);
  }

  /**
   * 创建核心组件
   */
  private createCoreComponents(): void {
    this.renderer = new CanvasRenderer(this.canvas, {
      showGrid: this.config.showGrid !== false,
      showRuler: this.config.showRuler === true
    });

    this.dataManager = new DataManager();
    this.nodeFactory = new NodeFactory();
    this.edgeFactory = new EdgeFactory();
  }

  /**
   * 创建管理器
   */
  private createManagers(): void {
    this.selectionManager = new SelectionManager();
    this.interactionManager = new InteractionManager(this.canvas, this.viewport, this.selectionManager);
    // 设置吸附选项
    this.interactionManager.setSnapOptions({
      enableSnap: this.config.enableSnap === true,
      snapSize: this.config.snapSize ?? 10
    });
    // 记录初始吸附开关
    this.snapOn = this.config.enableSnap === true;
    this.commandManager = new CommandManager();
  }

  /**
   * 创建UI组件
   */
  private createUIComponents(): void {
    // 创建工具栏
    if (this.config.toolbar !== false) {
      const toolbarContainer = this.createToolbarContainer();
      const toolbarConfig = {
        container: toolbarContainer,
        ...this.config.toolbar
      };
      this.toolbar = new Toolbar(toolbarConfig);
    }

    // 创建属性面板
    if (this.config.propertyPanel !== false) {
      const panelContainer = this.createPropertyPanelContainer();
      const panelConfig = {
        container: panelContainer,
        title: '属性',
        collapsible: true,
        ...this.config.propertyPanel
      };
      this.propertyPanel = new PropertyPanel(panelConfig);
      // 只读时禁用属性编辑
      if (this.config.readonly) {
        this.propertyPanel.setDisabled(true);
      }
    }

    // 创建状态栏
    const statusContainer = this.createStatusBarContainer();
    this.statusBar = new StatusBar({ container: statusContainer });
    this.statusBar.setMode('选择');
    this.statusBar.setZoom(this.viewport.scale);
    this.statusBar.setSnap(this.config.enableSnap === true, this.config.snapSize ?? 10);

    // 绑定状态栏快捷事件
    this.statusBar.on('zoom-in', () => this.zoomIn());
    this.statusBar.on('zoom-out', () => this.zoomOut());
    this.statusBar.on('zoom-fit', () => this.zoomToFit());
    this.statusBar.on('zoom-reset', () => this.zoomReset());

    this.statusBar.on('toggle-snap', (on: any) => {
      const next = !!on;
      this.interactionManager.setSnapOptions({ enableSnap: next });
      this.snapOn = next;
      this.statusBar?.setSnap(next, (this as any).config.snapSize ?? 10);
      this.statusBar?.setMessage(`网格吸附：${next ? '开' : '关'}`);
    });
    this.statusBar.on('cycle-snap-size', () => {
      const before = (this as any).config.snapSize ?? 10;
      this.cycleSnapSize();
      const after = (this as any).config.snapSize ?? 10;
      this.statusBar?.setSnap(true, after);
      this.statusBar?.setMessage(`吸附步长: ${after}`);
    });
  }

  /**
   * 创建工具栏容器
   */
  private createToolbarContainer(): HTMLElement {
    const container = document.createElement('div');
    container.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      z-index: 10;
    `;
    this.container.style.position = 'relative';
    this.container.appendChild(container);

    // 调整画布位置
    this.canvas.style.marginTop = '48px';

    return container;
  }

  /**
   * 创建属性面板容器
   */
  private createPropertyPanelContainer(): HTMLElement {
    const container = document.createElement('div');
    container.style.cssText = `
      position: absolute;
      top: 48px;
      right: 0;
      width: 280px;
      max-height: calc(100% - 48px);
      z-index: 10;
      padding: var(--ls-padding-sm);
    `;
    this.container.appendChild(container);

    return container;
  }

  /**
   * 创建状态栏容器
   */
  private createStatusBarContainer(): HTMLElement {
    const container = document.createElement('div');
    container.style.cssText = `
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 9;
    `;
    this.container.appendChild(container);
    // 调整画布底部边距，避免被状态栏遮挡
    const prev = parseInt(this.canvas.style.marginBottom || '0', 10) || 0;
    this.canvas.style.marginBottom = `${prev + 28}px`;
    return container;
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 数据管理器事件
    this.dataManager.on(EventType.DATA_CHANGE, () => {
      this.updateRendering();
    });

    // 选择管理器事件
    this.selectionManager.on(EventType.SELECTION_CHANGE, (event) => {
      const selectedItems = event.selected;
      const currentItem = selectedItems.length === 1 ? selectedItems[0] : null;
      this.propertyPanel?.setCurrentItem(currentItem);
      // 状态栏：选中信息
      const nodesCount = this.selectionManager.getSelectedNodes().length;
      const edgesCount = this.selectionManager.getSelectedEdges().length;
      this.statusBar?.setSelectionInfo(nodesCount, edgesCount);
      this.updateRendering();
    });

    // 交互管理器事件
    this.interactionManager.on(EventType.CANVAS_ZOOM, () => {
      this.statusBar?.setZoom(this.viewport.scale);
      this.updateRendering();
    });

    // 鼠标移动：更新坐标（可选择显示吸附坐标）
    this.interactionManager.on(EventType.CANVAS_MOUSE_MOVE, (e: any) => {
      const p = e?.point;
      if (!p) return;
      const size = (this as any).config.snapSize ?? 10;
      if (this.snapOn && size > 0) {
        const sp = { x: Math.round(p.x / size) * size, y: Math.round(p.y / size) * size };
        this.statusBar?.setCursorPosition(sp, true);
      } else {
        this.statusBar?.setCursorPosition({ x: p.x, y: p.y }, false);
      }
    });

    this.interactionManager.on(EventType.CANVAS_PAN, () => {
      this.updateRendering();
    });

    // 对齐线变化（拖拽中显示辅助线）
    this.interactionManager.on('guides-change', (guides: { vertical: number[]; horizontal: number[] }) => {
      this.currentGuides = guides || { vertical: [], horizontal: [] };
      this.updateRendering();
    });

    // 连接预览
    this.interactionManager.on('connect-start', (e: any) => {
      this.statusBar?.setMessage(i18n.statusBar.tips.connecting);
      const srcNode = this.dataManager.getNode(e.sourceId);
      if (!srcNode) return;
      const pos = this.nodeFactory.createNode(srcNode.type as NodeType, srcNode).getPortPosition?.(e.sourcePort) || srcNode.position;
      this.tempConnection = { start: { ...pos }, end: { ...e.point } };
      this.updateRendering();
    });
    this.interactionManager.on('connect-preview', (e: any) => {
      if (!this.tempConnection) return;
      const targetNode = e.targetId ? this.dataManager.getNode(e.targetId) : null;
      if (targetNode && e.targetPort) {
        const pos = this.nodeFactory.createNode(targetNode.type as NodeType, targetNode).getPortPosition?.(e.targetPort) || targetNode.position;
        this.tempConnection.end = { ...pos };
      } else {
        this.tempConnection.end = { ...e.point };
      }
      this.updateRendering();
    });
    this.interactionManager.on('connect-end', (e: any) => {
      if (!e?.sourceId || !e?.targetId) {
        this.tempConnection = undefined;
        this.updateRendering();
        return;
      }
      // 端口连接约束校验
      if (!this.isValidConnection(e.sourceId, e.sourcePort, e.targetId, e.targetPort)) {
        this.tempConnection = undefined;
        this.updateRendering();
        return;
      }
      const type = this.currentEdgeType || (EdgeType.STRAIGHT as any);
      const edge: EdgeData = {
        id: `${type}_${Date.now()}`,
        type: type as any,
        source: e.sourceId,
        target: e.targetId,
        sourcePort: e.sourcePort,
        targetPort: e.targetPort,
        properties: {}
      } as any;
      this.addEdge(edge);
      this.tempConnection = undefined;
      this.updateRendering();
    });

    // 端点重连
    this.interactionManager.on('reconnect-start', (e: any) => {
      const edge = this.dataManager.getEdge(e.edgeId) as any;
      if (!edge) return;
      const srcNode = this.dataManager.getNode(edge.source);
      const tgtNode = this.dataManager.getNode(edge.target);
      if (!srcNode || !tgtNode) return;
      const startPos = this.nodeFactory.createNode(srcNode.type as NodeType, srcNode).getPortPosition?.(edge.sourcePort) || srcNode.position;
      const endPos = this.nodeFactory.createNode(tgtNode.type as NodeType, tgtNode).getPortPosition?.(edge.targetPort) || tgtNode.position;
      const fixed = e.endpoint === 'source' ? endPos : startPos;
      this.tempConnection = { start: e.endpoint === 'source' ? fixed : { ...startPos }, end: e.endpoint === 'source' ? { ...startPos } : fixed };
      this.updateRendering();
    });
    this.interactionManager.on('reconnect-preview', (e: any) => {
      if (!this.tempConnection) return;
      if (e.endpoint === 'source') {
        // 悬空的是起点
        this.tempConnection.start = e.targetId && e.targetPort
          ? (this.nodeFactory.createNode(this.dataManager.getNode(e.targetId)!.type as NodeType, this.dataManager.getNode(e.targetId)!).getPortPosition?.(e.targetPort) || e.point)
          : e.point;
      } else {
        this.tempConnection.end = e.targetId && e.targetPort
          ? (this.nodeFactory.createNode(this.dataManager.getNode(e.targetId)!.type as NodeType, this.dataManager.getNode(e.targetId)!).getPortPosition?.(e.targetPort) || e.point)
          : e.point;
      }
      this.updateRendering();
    });
    this.interactionManager.on('reconnect-end', (e: any) => {
      const edge = this.dataManager.getEdge(e.edgeId) as any;
      if (!edge) return;
      const srcId = e.endpoint === 'source' ? e.targetId : edge.source;
      const srcPort = e.endpoint === 'source' ? e.targetPort : edge.sourcePort;
      const tgtId = e.endpoint === 'target' ? e.targetId : edge.target;
      const tgtPort = e.endpoint === 'target' ? e.targetPort : edge.targetPort;
      // 约束校验
      if (!this.isValidConnection(srcId, srcPort, tgtId, tgtPort)) {
        this.tempConnection = undefined;
        this.updateRendering();
        return;
      }
      const updates: Partial<EdgeData> = e.endpoint === 'source'
        ? { source: srcId, sourcePort: srcPort }
        : { target: tgtId, targetPort: tgtPort };
      this.updateEdge(e.edgeId, updates);
      this.tempConnection = undefined;
      this.updateRendering();
    });
    this.interactionManager.on('reconnect-cancel', () => {
      this.tempConnection = undefined;
      this.updateRendering();
    });
    this.interactionManager.on('connect-cancel', () => {
      this.tempConnection = undefined;
      this.updateRendering();
    });

    // 连接线转折点插入
    this.interactionManager.on('edge-waypoint-insert', (e: any) => {
      const edgeId = e?.edgeId as string;
      const index = typeof e?.index === 'number' ? e.index : -1;
      const point = e?.point as Point;
      if (!edgeId || index < 0 || !point) return;

      const current = this.dataManager.getEdge(edgeId) as any;
      if (!current) return;
      const oldWaypoints = (current && current.waypoints) ? [...current.waypoints] : undefined;
      const newWaypoints = oldWaypoints ? [...oldWaypoints] : [];
      const insertIndex = Math.max(0, Math.min(index, newWaypoints.length));
      newWaypoints.splice(insertIndex, 0, { x: point.x, y: point.y });

      const cmd = new UpdateEdgeCommand(this.dataManager, edgeId, { waypoints: oldWaypoints } as any, { waypoints: newWaypoints } as any);
      this.commandManager.executeCommand(cmd);
      this.updateRendering();
    });

    // 连接线转折点删除
    this.interactionManager.on('edge-waypoint-remove', (e: any) => {
      const edgeId = e?.edgeId as string;
      const index = typeof e?.index === 'number' ? e.index : -1;
      if (!edgeId || index < 0) return;

      const current = this.dataManager.getEdge(edgeId) as any;
      if (!current) return;
      const oldWaypoints = (current && current.waypoints) ? [...current.waypoints] : undefined;
      if (!oldWaypoints || index >= oldWaypoints.length) return;
      const newWaypoints = [...oldWaypoints];
      newWaypoints.splice(index, 1);

      const cmd = new UpdateEdgeCommand(this.dataManager, edgeId, { waypoints: oldWaypoints } as any, { waypoints: newWaypoints } as any);
      this.commandManager.executeCommand(cmd);
      this.updateRendering();
    });

    // 连接线转折点拖拽（实时）
    this.interactionManager.on('edge-waypoint-drag', (e: any) => {
      if (!e?.edgeId) return;
      const prev = this.liveEdgeOverrides.get(e.edgeId) || {};
      this.liveEdgeOverrides.set(e.edgeId, { ...prev, waypoints: e.waypoints });
      this.updateRendering();
    });

    // 连接线转折点拖拽（结束，写回历史）
    this.interactionManager.on('edge-waypoint-drag-end', (e: any) => {
      const edgeId = e?.edgeId as string;
      const newWaypoints = e?.waypoints as { x: number; y: number }[];
      if (!edgeId || !newWaypoints) return;

      const current = this.dataManager.getEdge(edgeId) as any;
      const oldWaypoints = (current && current.waypoints) ? [...current.waypoints] : undefined;

      const cmd = new UpdateEdgeCommand(this.dataManager, edgeId, { waypoints: oldWaypoints } as any, { waypoints: newWaypoints } as any);
      this.commandManager.executeCommand(cmd);

      const prev = this.liveEdgeOverrides.get(edgeId) || {};
      delete (prev as any).waypoints;
      if (Object.keys(prev).length === 0) {
        this.liveEdgeOverrides.delete(edgeId);
      } else {
        this.liveEdgeOverrides.set(edgeId, prev);
      }
      this.updateRendering();
    });

    // 贝塞尔控制点拖拽（实时）
    this.interactionManager.on('edge-control-drag', (e: any) => {
      if (!e?.edgeId) return;
      const prev = this.liveEdgeOverrides.get(e.edgeId) || {};
      this.liveEdgeOverrides.set(e.edgeId, { ...prev, controlPoints: e.controlPoints });
      this.updateRendering();
    });

    // 贝塞尔控制点重置（双击控制点）
    this.interactionManager.on('edge-control-clear', (e: any) => {
      const edgeId = e?.edgeId as string;
      if (!edgeId) return;
      const current = this.dataManager.getEdge(edgeId) as any;
      const oldCps = (current && current.customControlPoints) ? [...current.customControlPoints] : undefined;
      const cmd = new UpdateEdgeCommand(this.dataManager, edgeId, { customControlPoints: oldCps } as any, { customControlPoints: undefined } as any);
      this.commandManager.executeCommand(cmd);
      const prev = this.liveEdgeOverrides.get(edgeId) || {};
      delete (prev as any).controlPoints;
      if (Object.keys(prev).length === 0) this.liveEdgeOverrides.delete(edgeId); else this.liveEdgeOverrides.set(edgeId, prev);
      this.updateRendering();
    });

    // 贝塞尔控制点拖拽（结束）
    this.interactionManager.on('edge-control-drag-end', (e: any) => {
      const edgeId = e?.edgeId as string;
      const cps = e?.controlPoints as { x: number; y: number }[];
      if (!edgeId || !cps || cps.length < 2) return;

      const cmd = new UpdateEdgeCommand(this.dataManager, edgeId, {} as any, { customControlPoints: cps } as any);
      this.commandManager.executeCommand(cmd);

      const prev = this.liveEdgeOverrides.get(edgeId) || {};
      delete (prev as any).controlPoints;
      if (Object.keys(prev).length === 0) {
        this.liveEdgeOverrides.delete(edgeId);
      } else {
        this.liveEdgeOverrides.set(edgeId, prev);
      }
      this.updateRendering();
    });

    // 工具栏事件
    if (this.toolbar) {
      this.toolbar.on('node-type-select', (nodeType: NodeType) => {
        this.interactionManager.setMode(InteractionMode.DRAW);
        // 设置当前要创建的节点类型
        this.setActiveNodeType(nodeType);
      });

      this.toolbar.on('edge-type-select', (edgeType: EdgeType) => {
        this.interactionManager.setMode(InteractionMode.CONNECT);
        // 设置当前要创建的连接线类型
        this.setActiveEdgeType(edgeType);
        this.statusBar?.setMessage(i18n.statusBar.tips.edgeType(edgeType));
      });
      this.toolbar.on('toggle-snap', (on: boolean) => {
        this.interactionManager.setSnapOptions({ enableSnap: on });
        this.snapOn = on;
        this.statusBar?.setSnap(on, (this as any).config.snapSize ?? 10);
        this.statusBar?.setMessage(on ? i18n.statusBar.tips.snapOn : i18n.statusBar.tips.snapOff);
      });
      this.toolbar.on('toggle-guides', (on: boolean) => {
        this.showGuides = on;
        this.updateRendering();
      });
      this.toolbar.on('cycle-snap-size', () => {
        const before = (this as any).config.snapSize ?? 10;
        this.cycleSnapSize();
        const after = (this as any).config.snapSize ?? 10;
        this.statusBar?.setSnap(true, after);
        this.statusBar?.setMessage(i18n.statusBar.tips.snapSize(after));
      });

      this.toolbar.on('tool-select', (toolId: string) => {
        switch (toolId) {
          case 'select':
            this.interactionManager.setMode(InteractionMode.SELECT);
            this.statusBar?.setMode('选择');
            this.statusBar?.setMessage(i18n.statusBar.tips.selectHint);
            break;
          case 'pan':
            this.interactionManager.setMode(InteractionMode.PAN);
            this.statusBar?.setMode('平移');
            this.statusBar?.setMessage(i18n.statusBar.tips.panHint);
            break;
        }
      });

      this.toolbar.on('undo', () => this.undo());
      this.toolbar.on('redo', () => this.redo());
      this.toolbar.on('delete', () => this.deleteSelected());
      this.toolbar.on('zoom-in', () => this.zoomIn());
      this.toolbar.on('zoom-out', () => this.zoomOut());
      this.toolbar.on('zoom-fit', () => this.zoomToFit());
      this.toolbar.on('zoom-reset', () => this.zoomReset());

      // Bezier 工具：重置控制点
      this.toolbar.on('bezier-reset-cp', () => {
        const selected = this.selectionManager.getSelectedEdges();
        if (selected.length === 0) return;
        const edge = selected[0] as any;
        if ((edge?.type as any) !== 'bezier') return;
        const edgeId = edge.id as string;
        const current = this.dataManager.getEdge(edgeId) as any;
        if (!current) return;
        const oldCps = (current.customControlPoints ? [...current.customControlPoints] : undefined);
        const cmd = new UpdateEdgeCommand(this.dataManager, edgeId, { customControlPoints: oldCps } as any, { customControlPoints: undefined } as any);
        this.commandManager.executeCommand(cmd);
        // 清除临时覆盖
        const prev = this.liveEdgeOverrides.get(edgeId) || {};
        delete (prev as any).controlPoints;
        if (Object.keys(prev).length === 0) this.liveEdgeOverrides.delete(edgeId); else this.liveEdgeOverrides.set(edgeId, prev);
        this.updateRendering();
      });

      // 吸附与对齐线开关
      this.toolbar.on('toggle-snap', (on: boolean) => {
        this.interactionManager.setSnapOptions({ enableSnap: on });
        this.snapOn = on;
      });
      this.toolbar.on('toggle-guides', (on: boolean) => {
        this.showGuides = on;
        this.updateRendering();
      });
    }

    // 选择变化：更新属性面板、Bezier附加工具状态
    this.selectionManager.on(EventType.SELECTION_CHANGE, (e: any) => {
      const first = (e?.selected && e.selected[0]) || null;
      this.propertyPanel?.setCurrentItem(first as any);
      const isBezier = !!first && !('position' in (first as any)) && ((first as any).type === 'bezier');
      this.toolbar?.setToolEnabled('bezier-reset-cp', isBezier);
      // 状态栏：选中信息（冗余更新，确保外部订阅也可触发）
      const nodesCount = this.selectionManager.getSelectedNodes().length;
      const edgesCount = this.selectionManager.getSelectedEdges().length;
      this.statusBar?.setSelectionInfo(nodesCount, edgesCount);
    });

    // 历史变更：更新工具栏撤销/重做可用状态
    this.commandManager.on(EventType.HISTORY_CHANGE, (e: any) => {
      const canUndo = !!e?.canUndo;
      const canRedo = !!e?.canRedo;
      this.toolbar?.setToolEnabled('undo', canUndo);
      this.toolbar?.setToolEnabled('redo', canRedo);
    });

    // 历史事件：执行/撤销/重做 提示
    this.commandManager.on(EventType.HISTORY_EXECUTE, (cmd: any) => {
      const name = (cmd && cmd.name) ? String(cmd.name) : '操作';
      this.statusBar?.setMessage(i18n.statusBar.tips.executed(name), 1200);
    });
    this.commandManager.on(EventType.HISTORY_UNDO, (cmd: any) => {
      const name = (cmd && cmd.name) ? String(cmd.name) : '操作';
      this.statusBar?.setMessage(i18n.statusBar.tips.undone(name), 1500);
    });
    this.commandManager.on(EventType.HISTORY_REDO, (cmd: any) => {
      const name = (cmd && cmd.name) ? String(cmd.name) : '操作';
      this.statusBar?.setMessage(i18n.statusBar.tips.redone(name), 1500);
    });

    // 属性面板事件（属性变更走命令模式，支持撤销/重做）
    if (this.propertyPanel) {
      this.propertyPanel.on('property:change', (e: any) => {
        const item = e.item;
        const updateData = e.updateData as Partial<NodeData & EdgeData>;
        if (!item || !updateData) return;

        // 通过ID从数据管理器获取旧数据
        if ('position' in item) {
          // 节点
          const nodeId = (item as any).id as string;
          const current = this.dataManager.getNode(nodeId);
          if (!current) return;

          const oldData: any = {};
          if (updateData.label !== undefined) oldData.label = current.label;
          if (updateData.position) {
            oldData.position = {
              x: updateData.position.x !== undefined ? current.position.x : undefined,
              y: updateData.position.y !== undefined ? current.position.y : undefined,
            };
          }
          if (updateData.size) {
            oldData.size = {
              width: updateData.size.width !== undefined ? (current.size?.width ?? 100) : undefined,
              height: updateData.size.height !== undefined ? (current.size?.height ?? 60) : undefined,
            };
          }
          if (updateData.style) {
            oldData.style = {
              fillColor: updateData.style.fillColor !== undefined ? current.style?.fillColor : undefined,
              strokeColor: updateData.style.strokeColor !== undefined ? current.style?.strokeColor : undefined,
              strokeWidth: updateData.style.strokeWidth !== undefined ? current.style?.strokeWidth : undefined,
            };
          }
          if (updateData.properties) {
            oldData.properties = {};
            for (const k of Object.keys(updateData.properties)) {
              (oldData.properties as any)[k] = (current.properties || {})[k];
            }
          }

          const cmd = new UpdateNodeCommand(this.dataManager, nodeId, oldData, updateData as any);
          this.commandManager.executeCommand(cmd);
        } else {
          // 连接线
          const edgeId = (item as any).id as string;
          const current = this.dataManager.getEdge(edgeId);
          if (!current) return;

          const oldData: any = {};
          if (updateData.label !== undefined) oldData.label = current.label;
          if (updateData.style) {
            oldData.style = {
              strokeColor: updateData.style.strokeColor !== undefined ? current.style?.strokeColor : undefined,
              strokeWidth: updateData.style.strokeWidth !== undefined ? current.style?.strokeWidth : undefined,
            };
          }
          if (updateData.properties) {
            oldData.properties = {};
            for (const k of Object.keys(updateData.properties)) {
              (oldData.properties as any)[k] = (current.properties || {})[k];
            }
          }

          const cmd = new UpdateEdgeCommand(this.dataManager, edgeId, oldData, updateData as any);
          this.commandManager.executeCommand(cmd);
        }
      });
    }

    // 画布点击事件（用于创建节点）
    this.interactionManager.on(EventType.CANVAS_CLICK, (event) => {
      if (this.interactionManager.getMode() === InteractionMode.DRAW) {
        this.createNodeAtPoint(event.point);
      }
    });

    // 窗口大小变化
    window.addEventListener('resize', () => {
      this.handleResize();
    });
  }

  /**
   * 加载初始数据
   */
  private loadInitialData(): void {
    if (this.config.data) {
      this.loadData(this.config.data);
    } else {
      this.updateRendering();
    }
  }

  /**
   * 更新渲染
   */
  private updateRendering(): void {
    if (!this.isInitialized) {
      return;
    }

    // 记录当前选中项ID，用于重建后保留选择
    const prevSelectedNodeIds = this.selectionManager.getSelectedNodes().map(n => n.id);
    const prevSelectedEdgeIds = this.selectionManager.getSelectedEdges().map(e => e.id);

    // 更新选择管理器的可选项（重建可渲染实例）
    const nodes = this.dataManager.getNodes().map(nodeData =>
      this.nodeFactory.createNode(nodeData.type as NodeType, nodeData)
    );
    const edges = this.dataManager.getEdges().map(edgeData =>
      this.edgeFactory.createEdge(edgeData.type as EdgeType, edgeData)
    );

    // 应用实时覆盖（例如拖拽中的转折点/控制点）
    for (const edge of edges) {
      const ov = this.liveEdgeOverrides.get(edge.id);
      if (!ov) continue;
      if ((edge.type as any) === 'orthogonal' && ov.waypoints && (edge as any).setWaypoints) {
        (edge as any).setWaypoints(ov.waypoints);
      }
      if ((edge.type as any) === 'bezier' && ov.controlPoints && (edge as any).setCustomControlPoints) {
        (edge as any).setCustomControlPoints(ov.controlPoints);
      }
    }

    // 只读模式禁用拖拽
    const isReadonly = this.config.readonly === true;
    if (isReadonly) {
      for (const n of nodes) {
        n.draggable = false;
      }
    }

    // 绑定拖拽事件：
    // - 拖拽中实时渲染（不写回数据）
    // - 拖拽结束写回DataManager并纳入历史（支持撤销/重做）
    for (const n of nodes) {
      n.on(EventType.NODE_DRAG, () => {
        this.renderer.render(this.viewport, {
          nodes,
          edges,
          selectionBox: this.selectionManager.getSelectionBox()
        });
      });

      n.on(EventType.NODE_DRAG_END, (e: { startPosition: Point; endPosition: Point }) => {
        const { startPosition, endPosition } = e;
        if (
          startPosition && endPosition &&
          (startPosition.x !== endPosition.x || startPosition.y !== endPosition.y)
        ) {
          const cmd = new MoveNodeCommand(this.dataManager, n.id, startPosition, endPosition);
          this.commandManager.executeCommand(cmd);
        }
      });
    }

    this.selectionManager.setSelectableNodes(nodes);
    this.selectionManager.setSelectableEdges(edges);

    // 保留并恢复选择状态
    if (prevSelectedNodeIds.length > 0 || prevSelectedEdgeIds.length > 0) {
      this.selectionManager.clearSelection();
      for (const n of nodes) {
        if (prevSelectedNodeIds.includes(n.id)) {
          this.selectionManager.select(n, true);
        }
      }
      for (const e of edges) {
        if (prevSelectedEdgeIds.includes(e.id)) {
          this.selectionManager.select(e, true);
        }
      }
    }

    // 渲染画布
    this.renderer.render(this.viewport, {
      nodes,
      edges,
      selectionBox: this.selectionManager.getSelectionBox(),
      guides: this.showGuides ? this.currentGuides : undefined,
      tempConnection: this.tempConnection
    });
  }

  /**
   * 在指定点创建节点
   */
  private tempConnection: { start: { x: number; y: number }; end: { x: number; y: number } } | undefined;

  private createNodeAtPoint(point: Point): void {
    const nodeType = this.toolbar?.getActiveNodeType();
    if (!nodeType) {
      return;
    }

    const nodeData: Partial<NodeData> = {
      position: point,
      label: `${nodeType}节点`
    };

    const node = this.nodeFactory.createNode(nodeType, nodeData);
    this.addNode(node.getData());

    // 切换回选择模式
    this.interactionManager.setMode(InteractionMode.SELECT);
    this.toolbar?.setToolActive('select', true);
  }

  /**
   * 设置当前节点类型
   */
  private setActiveNodeType(nodeType: NodeType): void {
    // 实现节点类型设置逻辑
  }

  /**
   * 连接约束校验
   */
  private isValidConnection(sourceId: string, sourcePort: string, targetId: string, targetPort: string): boolean {
    if (!sourceId || !targetId) return false;
    if (sourceId === targetId) return false;
    // 不重复
    const edges = this.dataManager.getEdges();
    if (edges.some(e => e.source === sourceId && e.target === targetId && e.sourcePort === sourcePort && e.targetPort === targetPort)) {
      return false;
    }
    // 端口角色规则
    const sourceRole = this.getPortRole(sourceId, sourcePort);
    const targetRole = this.getPortRole(targetId, targetPort);
    if (sourceRole === 'input') return false;
    if (targetRole === 'output') return false;
    return true;
  }

  private getPortRole(nodeId: string, portId: string): 'input' | 'output' | 'unknown' {
    const node = this.dataManager.getNode(nodeId);
    if (!node) return 'unknown';
    const pid = (portId || '').toLowerCase();
    if (pid === 'input') return 'input';
    if (['output','yes','no','approved','rejected'].includes(pid)) return 'output';
    // fallback by port position: LEFT/TOP -> input, RIGHT/BOTTOM -> output
    try {
      const inst = this.nodeFactory.createNode(node.type as any, node) as any;
      const port = (inst.ports || []).find((p: any) => p.id === portId);
      if (port && port.position) {
        const pos = String(port.position).toLowerCase();
        if (pos.includes('left') || pos.includes('top')) return 'input';
        if (pos.includes('right') || pos.includes('bottom')) return 'output';
      }
    } catch {}
    return 'unknown';
  }
  private currentEdgeType: EdgeType = EdgeType.STRAIGHT as any;
  private snapSizes: number[] = [8, 10, 16, 20];

  private setActiveEdgeType(edgeType: EdgeType): void {
    this.currentEdgeType = edgeType;
  }

  private cycleSnapSize(): void {
    const current = (this as any).config.snapSize ?? 10;
    const idx = this.snapSizes.indexOf(current);
    const next = this.snapSizes[(idx + 1) % this.snapSizes.length];
    (this as any).config.snapSize = next;
    this.interactionManager.setSnapOptions({ snapSize: next });
    this.toolbar?.updateTool('snap-size', { icon: `${next}`, tooltip: `吸附步长: ${next}` });
  }

  /**
   * 处理窗口大小变化
   */
  private handleResize(): void {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.canvas.width = width * window.devicePixelRatio;
    this.canvas.height = height * window.devicePixelRatio;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.updateRendering();
  }

  // 公共API方法

  /**
   * 加载数据
   */
  loadData(data: FlowchartData): void {
    this.dataManager.loadData(data);
    this.updateRendering();
    this.emit(EventType.DATA_LOAD, data);
  }

  /**
   * 获取数据
   */
  getData(): FlowchartData {
    return this.dataManager.getData();
  }

  /**
   * 添加节点
   */
  addNode(nodeData: NodeData): void {
    const node = this.nodeFactory.createNode(nodeData.type as NodeType, nodeData);
    const command = new AddNodeCommand(this.dataManager, node);
    this.commandManager.executeCommand(command);
    this.emit(EventType.NODE_ADD, nodeData);
  }

  /**
   * 移除节点
   */
  removeNode(nodeId: string): void {
    const nodeData = this.dataManager.getNode(nodeId);
    if (nodeData) {
      const node = this.nodeFactory.createNode(nodeData.type as NodeType, nodeData);
      const command = new RemoveNodeCommand(this.dataManager, node);
      this.commandManager.executeCommand(command);
      this.emit(EventType.NODE_REMOVE, nodeId);
    }
  }

  /**
   * 更新节点
   */
  updateNode(nodeId: string, updates: Partial<NodeData>): void {
    const current = this.dataManager.getNode(nodeId);
    if (!current) return;

    // 仅构造与 updates 对应的 oldData
    const oldData: any = {};
    if (updates.label !== undefined) oldData.label = current.label;
    if (updates.position) {
      oldData.position = {
        x: updates.position.x !== undefined ? current.position.x : undefined,
        y: updates.position.y !== undefined ? current.position.y : undefined,
      };
    }
    if (updates.size) {
      oldData.size = {
        width: updates.size.width !== undefined ? (current.size?.width ?? 100) : undefined,
        height: updates.size.height !== undefined ? (current.size?.height ?? 60) : undefined,
      };
    }
    if (updates.style) {
      oldData.style = {
        fillColor: updates.style.fillColor !== undefined ? current.style?.fillColor : undefined,
        strokeColor: updates.style.strokeColor !== undefined ? current.style?.strokeColor : undefined,
        strokeWidth: updates.style.strokeWidth !== undefined ? current.style?.strokeWidth : undefined,
      };
    }
    if (updates.properties) {
      oldData.properties = {};
      for (const k of Object.keys(updates.properties)) {
        (oldData.properties as any)[k] = (current.properties || {})[k];
      }
    }

    const cmd = new UpdateNodeCommand(this.dataManager, nodeId, oldData, updates as any);
    this.commandManager.executeCommand(cmd);
    this.emit(EventType.NODE_UPDATE, { nodeId, updates });
  }

  /**
   * 添加连接线
   */
  addEdge(edgeData: EdgeData): void {
    const edge = this.edgeFactory.createEdge(edgeData.type as EdgeType, edgeData);
    const command = new AddEdgeCommand(this.dataManager, edge);
    this.commandManager.executeCommand(command);
    this.emit(EventType.EDGE_ADD, edgeData);
  }

  /**
   * 移除连接线
   */
  removeEdge(edgeId: string): void {
    const edgeData = this.dataManager.getEdge(edgeId);
    if (edgeData) {
      const edge = this.edgeFactory.createEdge(edgeData.type as EdgeType, edgeData);
      const command = new RemoveEdgeCommand(this.dataManager, edge);
      this.commandManager.executeCommand(command);
      this.emit(EventType.EDGE_REMOVE, edgeId);
    }
  }

  /**
   * 更新连接线
   */
  updateEdge(edgeId: string, updates: Partial<EdgeData>): void {
    const current = this.dataManager.getEdge(edgeId);
    if (!current) return;

    const oldData: any = {};
    if (updates.label !== undefined) oldData.label = (current as any).label;
    if (updates.style) {
      oldData.style = {
        strokeColor: updates.style.strokeColor !== undefined ? current.style?.strokeColor : undefined,
        strokeWidth: updates.style.strokeWidth !== undefined ? current.style?.strokeWidth : undefined,
      };
    }
    if ((updates as any).controlPointOffset !== undefined) {
      (oldData as any).controlPointOffset = (current as any).controlPointOffset;
    }
    if ((updates as any).customControlPoints !== undefined) {
      (oldData as any).customControlPoints = (current as any).customControlPoints;
    }
    if ((updates as any).waypoints !== undefined) {
      (oldData as any).waypoints = (current as any).waypoints;
    }
    if (updates.properties) {
      oldData.properties = {};
      for (const k of Object.keys(updates.properties)) {
        (oldData.properties as any)[k] = (current.properties || {})[k];
      }
    }

    const cmd = new UpdateEdgeCommand(this.dataManager, edgeId, oldData, updates as any);
    this.commandManager.executeCommand(cmd);
    this.emit(EventType.EDGE_UPDATE, { edgeId, updates });
  }

  /**
   * 删除选中项
   */
  deleteSelected(): void {
    const selectedItems = this.selectionManager.getSelectedItems();
    if (selectedItems.length === 0) {
      return;
    }

    for (const item of selectedItems) {
      if ('position' in item) {
        // 节点
        this.removeNode(item.id);
      } else {
        // 连接线
        this.removeEdge(item.id);
      }
    }

    this.selectionManager.clearSelection();
  }

  /**
   * 撤销
   */
  undo(): boolean {
    return this.commandManager.undo();
  }

  /**
   * 重做
   */
  redo(): boolean {
    return this.commandManager.redo();
  }

  /**
   * 放大
   */
  zoomIn(): void {
    const newScale = Math.min(this.config.maxZoom || 5, this.viewport.scale * 1.2);
    this.setZoom(newScale);
  }

  /**
   * 缩小
   */
  zoomOut(): void {
    const newScale = Math.max(this.config.minZoom || 0.1, this.viewport.scale / 1.2);
    this.setZoom(newScale);
  }

  /**
   * 适应画布
   */
  zoomToFit(): void {
    // 计算所有节点的边界框
    const nodes = this.dataManager.getNodes();
    if (nodes.length === 0) {
      return;
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    for (const node of nodes) {
      const { x, y } = node.position;
      const { width = 100, height = 60 } = node.size || {};

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + width);
      maxY = Math.max(maxY, y + height);
    }

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const canvasWidth = this.canvas.clientWidth;
    const canvasHeight = this.canvas.clientHeight;

    const scaleX = canvasWidth / contentWidth;
    const scaleY = canvasHeight / contentHeight;
    const scale = Math.min(scaleX, scaleY) * 0.9; // 留一些边距

    this.viewport.scale = scale;
    this.viewport.offset = {
      x: (canvasWidth / scale - contentWidth) / 2 - minX,
      y: (canvasHeight / scale - contentHeight) / 2 - minY
    };

    this.statusBar?.setZoom(scale);
    this.updateRendering();
  }

  /**
   * 重置缩放
   */
  zoomReset(): void {
    this.setZoom(1);
    this.viewport.offset = { x: 0, y: 0 };
    this.updateRendering();
  }

  /**
   * 设置缩放
   */
  setZoom(scale: number): void {
    this.viewport.scale = Math.max(
      this.config.minZoom || 0.1,
      Math.min(this.config.maxZoom || 5, scale)
    );
    this.statusBar?.setZoom(this.viewport.scale);
    this.updateRendering();
  }

  /**
   * 获取缩放
   */
  getZoom(): number {
    return this.viewport.scale;
  }

  /**
   * 设置只读模式
   */
  setReadonly(readonly: boolean): void {
    this.config.readonly = readonly;

    if (readonly) {
      this.toolbar?.hide();
      this.propertyPanel?.show();
      this.propertyPanel?.setDisabled(true);
      this.interactionManager.setMode(InteractionMode.PAN);
    } else {
      this.toolbar?.show();
      this.propertyPanel?.show();
      this.propertyPanel?.setDisabled(false);
      this.interactionManager.setMode(InteractionMode.SELECT);
    }
  }

  /**
   * 是否只读模式
   */
  isReadonly(): boolean {
    return this.config.readonly === true;
  }

  /**
   * 导出为图片
   */
  exportAsImage(format: 'png' | 'jpeg' = 'png', quality = 1): string {
    return this.canvas.toDataURL(`image/${format}`, quality);
  }

  /**
   * 销毁编辑器
   */
  destroy(): void {
    this.toolbar?.destroy();
    this.propertyPanel?.destroy();
    this.interactionManager.destroy();
    this.selectionManager.destroy();
    this.commandManager.destroy();
    this.renderer.destroy();
    this.dataManager.destroy();

    this.canvas.remove();
    this.removeAllListeners();
  }
}
