/**
 * 流程图预览器主类
 * 提供只读的流程图显示功能，支持流程执行状态展示
 */

import type {
  FlowchartData,
  NodeData,
  EdgeData,
  Point,
  Viewport,
  EventEmitter,
  NodeStatus,
  EdgeStatus
} from '@/types/index.js';
import { EventType } from '@/types/index.js';
import { SimpleEventEmitter, createHighDPICanvas } from '@/utils/index.js';
import { CanvasRenderer, DataManager } from '@/core/index.js';
import { NodeFactory } from '@/nodes/index.js';
import { EdgeFactory } from '@/edges/index.js';

/**
 * 预览器配置
 */
export interface FlowchartViewerConfig {
  /** 容器元素 */
  container: HTMLElement;
  /** 画布宽度 */
  width?: number;
  /** 画布高度 */
  height?: number;
  /** 初始数据 */
  data?: FlowchartData;
  /** 是否启用网格 */
  showGrid?: boolean;
  /** 是否启用缩放 */
  enableZoom?: boolean;
  /** 是否启用平移 */
  enablePan?: boolean;
  /** 是否自动适应内容 */
  autoFit?: boolean;
  /** 最小缩放比例 */
  minZoom?: number;
  /** 最大缩放比例 */
  maxZoom?: number;
}

/**
 * 流程执行状态
 */
export interface ProcessExecutionState {
  /** 当前执行的节点ID */
  currentNodeId?: string;
  /** 已完成的节点ID列表 */
  completedNodeIds: string[];
  /** 已执行的连接线ID列表 */
  executedEdgeIds: string[];
  /** 失败的节点ID列表 */
  failedNodeIds: string[];
  /** 等待中的节点ID列表 */
  pendingNodeIds: string[];
}

/**
 * 流程图预览器类
 */
export class FlowchartViewer extends SimpleEventEmitter implements EventEmitter {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private config: FlowchartViewerConfig;

  // 核心组件
  private renderer: CanvasRenderer;
  private dataManager: DataManager;
  private nodeFactory: NodeFactory;
  private edgeFactory: EdgeFactory;

  // 状态
  private viewport: Viewport = {
    offset: { x: 0, y: 0 },
    scale: 1
  };
  private executionState: ProcessExecutionState = {
    completedNodeIds: [],
    executedEdgeIds: [],
    failedNodeIds: [],
    pendingNodeIds: []
  };
  private isInitialized = false;
  private isDragging = false;
  private lastMousePosition: Point = { x: 0, y: 0 };

  constructor(config: FlowchartViewerConfig) {
    super();

    this.config = config;
    this.container = config.container;

    this.initialize();
  }

  /**
   * 初始化预览器
   */
  private initialize(): void {
    this.createCanvas();
    this.createCoreComponents();
    this.setupEventListeners();
    this.loadInitialData();

    this.isInitialized = true;
    this.emit(EventType.VIEWER_READY);
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
    this.canvas.style.cursor = this.config.enablePan ? 'grab' : 'default';

    this.container.appendChild(this.canvas);
  }

  /**
   * 创建核心组件
   */
  private createCoreComponents(): void {
    this.renderer = new CanvasRenderer(this.canvas, {
      showGrid: this.config.showGrid !== false,
      showRuler: false
    });

    this.dataManager = new DataManager();
    this.nodeFactory = new NodeFactory();
    this.edgeFactory = new EdgeFactory();
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 数据管理器事件
    this.dataManager.on(EventType.DATA_CHANGE, () => {
      this.updateRendering();
    });

    // 鼠标事件（用于缩放和平移）
    if (this.config.enableZoom !== false) {
      this.canvas.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });
    }

    if (this.config.enablePan !== false) {
      this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
      this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
      this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
      this.canvas.addEventListener('mouseleave', this.handleMouseUp.bind(this));
    }

    // 窗口大小变化
    window.addEventListener('resize', () => {
      this.handleResize();
    });
  }

  /**
   * 处理滚轮事件
   */
  private handleWheel(event: WheelEvent): void {
    event.preventDefault();

    const rect = this.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // 计算缩放
    const scaleFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(
      this.config.minZoom || 0.1,
      Math.min(this.config.maxZoom || 5, this.viewport.scale * scaleFactor)
    );

    // 以鼠标位置为中心缩放
    const scaleRatio = newScale / this.viewport.scale;
    const newOffset = {
      x: this.viewport.offset.x + (mouseX / this.viewport.scale - mouseX / newScale),
      y: this.viewport.offset.y + (mouseY / this.viewport.scale - mouseY / newScale)
    };

    this.viewport.scale = newScale;
    this.viewport.offset = newOffset;

    this.updateRendering();
    this.emit(EventType.VIEWER_ZOOM, { scale: newScale });
  }

  /**
   * 处理鼠标按下事件
   */
  private handleMouseDown(event: MouseEvent): void {
    if (event.button === 0) { // 左键
      this.isDragging = true;
      this.lastMousePosition = { x: event.clientX, y: event.clientY };
      this.canvas.style.cursor = 'grabbing';
    }
  }

  /**
   * 处理鼠标移动事件
   */
  private handleMouseMove(event: MouseEvent): void {
    if (this.isDragging) {
      const dx = event.clientX - this.lastMousePosition.x;
      const dy = event.clientY - this.lastMousePosition.y;

      this.viewport.offset.x += dx / this.viewport.scale;
      this.viewport.offset.y += dy / this.viewport.scale;

      this.lastMousePosition = { x: event.clientX, y: event.clientY };

      this.updateRendering();
      this.emit(EventType.VIEWER_PAN, { offset: this.viewport.offset });
    }
  }

  /**
   * 处理鼠标抬起事件
   */
  private handleMouseUp(event: MouseEvent): void {
    this.isDragging = false;
    this.canvas.style.cursor = this.config.enablePan ? 'grab' : 'default';
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

    if (this.config.autoFit) {
      setTimeout(() => this.zoomToFit(), 100);
    }
  }

  /**
   * 更新渲染
   */
  private updateRendering(): void {
    if (!this.isInitialized) {
      return;
    }

    // 创建节点和连接线实例
    const nodes = this.dataManager.getNodes().map(nodeData => {
      const node = this.nodeFactory.createNode(nodeData.type as any, nodeData);

      // 设置节点状态
      if (this.executionState.currentNodeId === nodeData.id) {
        node.status = 'running' as NodeStatus;
      } else if (this.executionState.completedNodeIds.includes(nodeData.id)) {
        node.status = 'completed' as NodeStatus;
      } else if (this.executionState.failedNodeIds.includes(nodeData.id)) {
        node.status = 'failed' as NodeStatus;
      } else if (this.executionState.pendingNodeIds.includes(nodeData.id)) {
        node.status = 'pending' as NodeStatus;
      } else {
        node.status = 'normal' as NodeStatus;
      }

      return node;
    });

    const edges = this.dataManager.getEdges().map(edgeData => {
      const edge = this.edgeFactory.createEdge(edgeData.type as any, edgeData);

      // 设置连接线状态
      if (this.executionState.executedEdgeIds.includes(edgeData.id)) {
        edge.status = 'executed' as EdgeStatus;
      } else {
        edge.status = 'normal' as EdgeStatus;
      }

      return edge;
    });

    // 渲染画布
    this.renderer.render(this.viewport, {
      nodes,
      edges
    });
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
   * 设置流程执行状态
   */
  setExecutionState(state: Partial<ProcessExecutionState>): void {
    this.executionState = {
      ...this.executionState,
      ...state
    };
    this.updateRendering();
    this.emit(EventType.EXECUTION_STATE_CHANGE, this.executionState);
  }

  /**
   * 获取流程执行状态
   */
  getExecutionState(): ProcessExecutionState {
    return { ...this.executionState };
  }

  /**
   * 高亮节点
   */
  highlightNode(nodeId: string): void {
    this.setExecutionState({ currentNodeId: nodeId });
  }

  /**
   * 标记节点为已完成
   */
  markNodeCompleted(nodeId: string): void {
    const completedNodeIds = [...this.executionState.completedNodeIds];
    if (!completedNodeIds.includes(nodeId)) {
      completedNodeIds.push(nodeId);
    }

    // 从其他状态列表中移除
    const pendingNodeIds = this.executionState.pendingNodeIds.filter(id => id !== nodeId);
    const failedNodeIds = this.executionState.failedNodeIds.filter(id => id !== nodeId);

    const newState: Partial<ProcessExecutionState> = {
      completedNodeIds,
      pendingNodeIds,
      failedNodeIds
    };

    if (this.executionState.currentNodeId !== nodeId) {
      newState.currentNodeId = this.executionState.currentNodeId;
    }

    this.setExecutionState(newState);
  }

  /**
   * 标记节点为失败
   */
  markNodeFailed(nodeId: string): void {
    const failedNodeIds = [...this.executionState.failedNodeIds];
    if (!failedNodeIds.includes(nodeId)) {
      failedNodeIds.push(nodeId);
    }

    // 从其他状态列表中移除
    const pendingNodeIds = this.executionState.pendingNodeIds.filter(id => id !== nodeId);
    const completedNodeIds = this.executionState.completedNodeIds.filter(id => id !== nodeId);

    const newState: Partial<ProcessExecutionState> = {
      failedNodeIds,
      pendingNodeIds,
      completedNodeIds
    };

    if (this.executionState.currentNodeId !== nodeId) {
      newState.currentNodeId = this.executionState.currentNodeId;
    }

    this.setExecutionState(newState);
  }

  /**
   * 标记连接线为已执行
   */
  markEdgeExecuted(edgeId: string): void {
    const executedEdgeIds = [...this.executionState.executedEdgeIds];
    if (!executedEdgeIds.includes(edgeId)) {
      executedEdgeIds.push(edgeId);
    }

    this.setExecutionState({ executedEdgeIds });
  }

  /**
   * 重置执行状态
   */
  resetExecutionState(): void {
    this.setExecutionState({
      completedNodeIds: [],
      executedEdgeIds: [],
      failedNodeIds: [],
      pendingNodeIds: []
    });
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
    const scale = Math.min(scaleX, scaleY) * 0.9;

    this.viewport.scale = scale;
    this.viewport.offset = {
      x: (canvasWidth / scale - contentWidth) / 2 - minX,
      y: (canvasHeight / scale - contentHeight) / 2 - minY
    };

    this.updateRendering();
    this.emit(EventType.VIEWER_ZOOM_FIT);
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
    this.updateRendering();
    this.emit(EventType.VIEWER_ZOOM, { scale: this.viewport.scale });
  }

  /**
   * 获取缩放
   */
  getZoom(): number {
    return this.viewport.scale;
  }

  /**
   * 导出为图片
   */
  exportAsImage(format: 'png' | 'jpeg' = 'png', quality = 1): string {
    return this.canvas.toDataURL(`image/${format}`, quality);
  }

  /**
   * 销毁预览器
   */
  destroy(): void {
    this.renderer.destroy();
    this.dataManager.destroy();

    this.canvas.remove();
    this.removeAllListeners();
  }
}
