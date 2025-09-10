/**
 * 交互管理器
 * 负责处理鼠标、键盘、触摸等各种用户交互
 */

import type { Point, Viewport, EventEmitter } from '@/types/index.js';
import { EventType } from '@/types/index.js';
import { 
  SimpleEventEmitter, 
  getMousePosition, 
  getTouchPosition, 
  getCanvasCoordinates,
  screenToWorld,
  isKeyboardShortcut,
  preventDefault,
  debounce,
  throttle
} from '@/utils/index.js';
import type { SelectionManager } from './SelectionManager.js';

/**
 * 交互模式枚举
 */
export enum InteractionMode {
  /** 选择模式 */
  SELECT = 'select',
  /** 拖拽模式 */
  DRAG = 'drag',
  /** 平移模式 */
  PAN = 'pan',
  /** 连接模式 */
  CONNECT = 'connect',
  /** 绘制模式 */
  DRAW = 'draw'
}

/**
 * 拖拽状态
 */
interface DragState {
  /** 是否正在拖拽 */
  active: boolean;
  /** 拖拽起始点 */
  startPoint: Point;
  /** 当前点 */
  currentPoint: Point;
  /** 拖拽的项目 */
  item: any;
  /** 拖拽偏移 */
  offset: Point;
}

/**
 * 连接线转折点拖拽状态
 */
interface WaypointDragState {
  active: boolean;
  edge: any | null;
  index: number;
  startPoint: Point;
  currentPoint: Point;
}

/**
 * 平移状态
 */
interface PanState {
  /** 是否正在平移 */
  active: boolean;
  /** 平移起始点 */
  startPoint: Point;
  /** 起始视口偏移 */
  startOffset: Point;
}

/**
 * 交互管理器类
 */
export class InteractionManager extends SimpleEventEmitter implements EventEmitter {
  private canvas: HTMLCanvasElement;
  private viewport: Viewport;
  private selectionManager: SelectionManager;
  private currentMode: InteractionMode = InteractionMode.SELECT;
  
  // 吸附设置
  private enableSnap: boolean = false;
  private snapSize: number = 10;
  
  private dragState: DragState = {
    active: false,
    startPoint: { x: 0, y: 0 },
    currentPoint: { x: 0, y: 0 },
    item: null,
    offset: { x: 0, y: 0 }
  };
  
  private panState: PanState = {
    active: false,
    startPoint: { x: 0, y: 0 },
    startOffset: { x: 0, y: 0 }
  };

  private waypointDrag: WaypointDragState = {
    active: false,
    edge: null,
    index: -1,
    startPoint: { x: 0, y: 0 },
    currentPoint: { x: 0, y: 0 }
  };

  private isMouseDown = false;
  private lastClickTime = 0;
  private doubleClickDelay = 300;
  private enableKeyboard = true;
  private enableTouch = true;

  // 节流和防抖函数
  private throttledMouseMove: (event: MouseEvent) => void;
  private debouncedWheel: (event: WheelEvent) => void;

  constructor(canvas: HTMLCanvasElement, viewport: Viewport, selectionManager: SelectionManager) {
    super();
    
    this.canvas = canvas;
    this.viewport = viewport;
    this.selectionManager = selectionManager;
    
    // 创建节流和防抖函数
    this.throttledMouseMove = throttle(this.handleMouseMove.bind(this), 16); // 60fps
    this.debouncedWheel = debounce(this.handleWheel.bind(this), 10);
    
    this.setupEventListeners();
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 鼠标事件
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.throttledMouseMove);
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.addEventListener('click', this.handleClick.bind(this));
    this.canvas.addEventListener('dblclick', this.handleDoubleClick.bind(this));
    this.canvas.addEventListener('wheel', this.debouncedWheel, { passive: false });
    this.canvas.addEventListener('contextmenu', this.handleContextMenu.bind(this));

    // 键盘事件
    if (this.enableKeyboard) {
      this.canvas.addEventListener('keydown', this.handleKeyDown.bind(this));
      this.canvas.addEventListener('keyup', this.handleKeyUp.bind(this));
    }

    // 触摸事件
    if (this.enableTouch) {
      this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
      this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
      this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
    }

    // 窗口事件
    window.addEventListener('mouseup', this.handleWindowMouseUp.bind(this));
    window.addEventListener('mousemove', this.handleWindowMouseMove.bind(this));
  }

  /**
   * 移除事件监听器
   */
  private removeEventListeners(): void {
    this.canvas.removeEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.removeEventListener('mousemove', this.throttledMouseMove);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.removeEventListener('click', this.handleClick.bind(this));
    this.canvas.removeEventListener('dblclick', this.handleDoubleClick.bind(this));
    this.canvas.removeEventListener('wheel', this.debouncedWheel);
    this.canvas.removeEventListener('contextmenu', this.handleContextMenu.bind(this));

    if (this.enableKeyboard) {
      this.canvas.removeEventListener('keydown', this.handleKeyDown.bind(this));
      this.canvas.removeEventListener('keyup', this.handleKeyUp.bind(this));
    }

    if (this.enableTouch) {
      this.canvas.removeEventListener('touchstart', this.handleTouchStart.bind(this));
      this.canvas.removeEventListener('touchmove', this.handleTouchMove.bind(this));
      this.canvas.removeEventListener('touchend', this.handleTouchEnd.bind(this));
    }

    window.removeEventListener('mouseup', this.handleWindowMouseUp.bind(this));
    window.removeEventListener('mousemove', this.handleWindowMouseMove.bind(this));
  }

  /**
   * 处理鼠标按下事件
   */
  private handleMouseDown(event: MouseEvent): void {
    preventDefault(event);
    
    this.isMouseDown = true;
    this.canvas.focus();
    
    const canvasPoint = getCanvasCoordinates(this.canvas, event.clientX, event.clientY);
    const worldPoint = screenToWorld(canvasPoint, this.viewport);
    
    this.emit(EventType.CANVAS_MOUSE_DOWN, {
      point: worldPoint,
      canvasPoint,
      originalEvent: event,
      button: event.button,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey
    });

    // 根据当前模式处理
    switch (this.currentMode) {
      case InteractionMode.SELECT:
        // ALT+点击：优先删除/插入转折点
        if (event.altKey) {
          if (this.tryRemoveWaypoint(worldPoint)) break;
          if (this.tryInsertWaypoint(worldPoint)) break;
        }
        // 优先检查端点重连，再检查贝塞尔控制点与直角转折点
        if (this.tryStartEndpointReconnect(worldPoint)) {
          break;
        }
        if (this.tryStartControlDrag(worldPoint)) {
          break;
        }
        if (this.tryStartWaypointDrag(worldPoint)) {
          break;
        }
        this.handleSelectModeMouseDown(worldPoint, event);
        break;
      case InteractionMode.PAN:
        this.startPan(canvasPoint);
        break;
      case InteractionMode.CONNECT:
        this.handleConnectModeMouseDown(worldPoint, event);
        break;
    }
  }

  /**
   * 处理鼠标移动事件
   */
  private handleMouseMove(event: MouseEvent): void {
    const canvasPoint = getCanvasCoordinates(this.canvas, event.clientX, event.clientY);
    const worldPoint = screenToWorld(canvasPoint, this.viewport);
    
    this.emit(EventType.CANVAS_MOUSE_MOVE, {
      point: worldPoint,
      canvasPoint,
      originalEvent: event
    });

    if (this.isMouseDown) {
      const cd: any = (this as any).connectDrag;
      if (cd?.active) {
        // 连接预览
        cd.currentPoint = { ...worldPoint };
        const target = this.findNearestPort(worldPoint, 10, cd.sourceNode);
        this.emit('connect-preview', {
          sourceId: cd.sourceNode.id,
          sourcePort: cd.sourcePort,
          point: worldPoint,
          targetId: target?.node?.id,
          targetPort: target?.portId
        });
      } else if (this.endpointDrag?.active) {
        this.updateEndpointReconnect(worldPoint);
      } else if (this.controlDrag.active) {
        this.updateControlDrag(worldPoint, event);
      } else if (this.waypointDrag.active) {
        this.updateWaypointDrag(worldPoint, event);
      } else if (this.dragState.active) {
        this.updateDrag(worldPoint);
      } else if (this.panState.active) {
        this.updatePan(canvasPoint);
      } else if (this.selectionManager.getSelectionBox()?.active) {
        this.selectionManager.updateSelectionBox(worldPoint);
      }
    }
  }

  /**
   * 处理鼠标抬起事件
   */
  private handleMouseUp(event: MouseEvent): void {
    this.isMouseDown = false;
    
    const canvasPoint = getCanvasCoordinates(this.canvas, event.clientX, event.clientY);
    const worldPoint = screenToWorld(canvasPoint, this.viewport);
    
    this.emit(EventType.CANVAS_MOUSE_UP, {
      point: worldPoint,
      canvasPoint,
      originalEvent: event
    });

    const cd: any = (this as any).connectDrag;
    if (cd?.active) {
      const target = this.findNearestPort(worldPoint, 10, cd.sourceNode);
      if (target) {
        this.emit('connect-end', {
          sourceId: cd.sourceNode.id,
          sourcePort: cd.sourcePort,
          targetId: target.node.id,
          targetPort: target.portId
        });
      } else {
        this.emit('connect-cancel', {});
      }
      cd.active = false;
    }

    if (this.endpointDrag?.active) {
      this.endEndpointReconnect(worldPoint);
    }

    if (this.controlDrag.active) {
      this.endControlDrag(worldPoint);
    }

    if (this.waypointDrag.active) {
      this.endWaypointDrag(worldPoint);
    }
    
    if (this.dragState.active) {
      this.endDrag(worldPoint);
    }
    
    if (this.panState.active) {
      this.endPan();
    }
    
    if (this.selectionManager.getSelectionBox()?.active) {
      this.selectionManager.endSelectionBox(event.ctrlKey || event.shiftKey);
    }
  }

  /**
   * 处理点击事件
   */
  private handleClick(event: MouseEvent): void {
    const canvasPoint = getCanvasCoordinates(this.canvas, event.clientX, event.clientY);
    const worldPoint = screenToWorld(canvasPoint, this.viewport);
    
    this.emit(EventType.CANVAS_CLICK, {
      point: worldPoint,
      canvasPoint,
      originalEvent: event
    });

    // 检测双击
    const currentTime = Date.now();
    if (currentTime - this.lastClickTime < this.doubleClickDelay) {
      this.handleDoubleClick(event);
      return;
    }
    this.lastClickTime = currentTime;

    // 处理选择
    if (this.currentMode === InteractionMode.SELECT) {
      this.selectionManager.selectAtPoint(worldPoint, event.ctrlKey || event.shiftKey);
    }
  }

  /**
   * 处理双击事件
   */
  private handleDoubleClick(event: MouseEvent): void {
    const canvasPoint = getCanvasCoordinates(this.canvas, event.clientX, event.clientY);
    const worldPoint = screenToWorld(canvasPoint, this.viewport);
    
    this.emit(EventType.CANVAS_DOUBLE_CLICK, {
      point: worldPoint,
      canvasPoint,
      originalEvent: event
    });

    // 双击：在直角连接线的最近线段上插入转折点
    // 若命中多个，取最近的一个
    if (this.currentMode === InteractionMode.SELECT) {
      if (this.tryInsertWaypoint(worldPoint)) {
        return;
      }
      // 若双击命中贝塞尔控制点，则清除自定义控制点（恢复自动）
      if (this.tryResetBezierControl(worldPoint)) {
        return;
      }
    }
  }

  /**
   * 处理滚轮事件
   */
  private handleWheel(event: WheelEvent): void {
    preventDefault(event);
    
    const canvasPoint = getCanvasCoordinates(this.canvas, event.clientX, event.clientY);
    const worldPoint = screenToWorld(canvasPoint, this.viewport);
    
    // 计算缩放
    const scaleFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(10, this.viewport.scale * scaleFactor));
    
    // 以鼠标位置为中心缩放
    const scaleRatio = newScale / this.viewport.scale;
    const newOffset = {
      x: this.viewport.offset.x + (canvasPoint.x / this.viewport.scale - canvasPoint.x / newScale),
      y: this.viewport.offset.y + (canvasPoint.y / this.viewport.scale - canvasPoint.y / newScale)
    };
    
    this.viewport.scale = newScale;
    this.viewport.offset = newOffset;
    
    this.emit(EventType.CANVAS_ZOOM, {
      scale: newScale,
      point: worldPoint,
      canvasPoint,
      originalEvent: event
    });
  }

  /**
   * 处理右键菜单事件
   */
  private handleContextMenu(event: MouseEvent): void {
    preventDefault(event);
    
    const canvasPoint = getCanvasCoordinates(this.canvas, event.clientX, event.clientY);
    const worldPoint = screenToWorld(canvasPoint, this.viewport);
    
    this.emit('contextmenu', {
      point: worldPoint,
      canvasPoint,
      originalEvent: event
    });
  }

  /**
   * 处理键盘按下事件
   */
  private handleKeyDown(event: KeyboardEvent): void {
    // 快捷键处理
    if (isKeyboardShortcut(event, 'a', { ctrl: true })) {
      preventDefault(event);
      this.selectionManager.selectAll();
      return;
    }
    
    if (isKeyboardShortcut(event, 'Delete')) {
      preventDefault(event);
      this.emit('delete', { selectedItems: this.selectionManager.getSelectedItems() });
      return;
    }
    
    if (isKeyboardShortcut(event, 'Escape')) {
      preventDefault(event);
      this.selectionManager.clearSelection();
      this.cancelCurrentOperation();
      return;
    }

    this.emit('keydown', { originalEvent: event });
  }

  /**
   * 处理键盘抬起事件
   */
  private handleKeyUp(event: KeyboardEvent): void {
    this.emit('keyup', { originalEvent: event });
  }

  /**
   * 处理触摸开始事件
   */
  private handleTouchStart(event: TouchEvent): void {
    preventDefault(event);
    
    if (event.touches.length === 1) {
      // 单指触摸，模拟鼠标事件
      const touch = event.touches[0]!;
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY,
        button: 0
      });
      this.handleMouseDown(mouseEvent);
    }
  }

  /**
   * 处理触摸移动事件
   */
  private handleTouchMove(event: TouchEvent): void {
    preventDefault(event);
    
    if (event.touches.length === 1) {
      // 单指触摸，模拟鼠标事件
      const touch = event.touches[0]!;
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      this.handleMouseMove(mouseEvent);
    }
  }

  /**
   * 处理触摸结束事件
   */
  private handleTouchEnd(event: TouchEvent): void {
    preventDefault(event);
    
    if (event.changedTouches.length === 1) {
      // 单指触摸，模拟鼠标事件
      const touch = event.changedTouches[0]!;
      const mouseEvent = new MouseEvent('mouseup', {
        clientX: touch.clientX,
        clientY: touch.clientY,
        button: 0
      });
      this.handleMouseUp(mouseEvent);
    }
  }

  /**
   * 处理窗口鼠标抬起事件
   */
  private handleWindowMouseUp(event: MouseEvent): void {
    if (this.isMouseDown) {
      this.handleMouseUp(event);
    }
  }

  /**
   * 处理窗口鼠标移动事件
   */
  private handleWindowMouseMove(event: MouseEvent): void {
    if (this.isMouseDown) {
      this.handleMouseMove(event);
    }
  }

  /**
   * 处理选择模式的鼠标按下
   */
  private handleSelectModeMouseDown(point: Point, event: MouseEvent): void {
    // 检查是否点击到了可选择的项目
    const selectedItem = this.selectionManager.selectAtPoint(point, event.ctrlKey || event.shiftKey);
    
    if (selectedItem && selectedItem.draggable) {
      // 开始拖拽
      this.startDrag(point, selectedItem);
    } else if (!selectedItem) {
      // 开始选择框
      this.selectionManager.startSelectionBox(point);
    }
  }

  /** 插入/删除转折点 */
  private tryInsertWaypoint(point: Point): boolean {
    const edges = this.selectionManager.getSelectableEdges();
    for (const e of edges) {
      if (e.type !== 'orthogonal') continue;
      const info = (e as any).getClosestSegmentInfo?.(point, 8);
      if (info) {
        this.emit('edge-waypoint-insert', {
          edgeId: (e as any).id,
          index: info.segmentIndex,
          point: info.nearest
        });
        return true;
      }
    }
    return false;
  }

  private tryRemoveWaypoint(point: Point): boolean {
    const edges = this.selectionManager.getSelectableEdges();
    for (const e of edges) {
      if (e.type !== 'orthogonal') continue;
      const idx = (e as any).hitTestWaypoint?.(point, 8);
      if (typeof idx === 'number' && idx >= 0) {
        this.emit('edge-waypoint-remove', {
          edgeId: (e as any).id,
          index: idx
        });
        return true;
      }
    }
    return false;
  }

  /** 双击命中贝塞尔控制点则清除自定义控制点 */
  private tryResetBezierControl(point: Point): boolean {
    const edges = this.selectionManager.getSelectableEdges();
    for (const e of edges) {
      if ((e as any).type !== 'bezier') continue;
      const idx = (e as any).hitTestControlPoint?.(point, 8);
      if (typeof idx === 'number' && idx >= 0) {
        this.emit('edge-control-clear', { edgeId: (e as any).id });
        return true;
      }
    }
    return false;
  }

  /** 查找最近端口 */
  private findNearestPort(point: Point, tolerance: number = 10, excludeNode?: any): { node: any; portId: string } | null {
    const nodes = this.selectionManager.getSelectableNodes();
    let best: { node: any; portId: string; dist: number } | null = null;
    for (const n of nodes) {
      if (excludeNode && excludeNode === n) continue;
      if (!n.getPort) continue;
      const ports = (n.ports || []).filter((p: any) => p?.connectable !== false);
      for (const p of ports) {
        const pos = n.getPortPosition?.(p.id);
        if (!pos) continue;
        const d = Math.hypot(point.x - pos.x, point.y - pos.y);
        if (d <= tolerance && (!best || d < best.dist)) {
          best = { node: n, portId: p.id, dist: d };
        }
      }
    }
    return best ? { node: best.node, portId: best.portId } : null;
  }

  /** 端点重连状态与逻辑 */
  private endpointDrag: { active: boolean; edge: any | null; endpoint: 'source' | 'target'; startPoint: Point; currentPoint: Point } = {
    active: false,
    edge: null,
    endpoint: 'source',
    startPoint: { x: 0, y: 0 },
    currentPoint: { x: 0, y: 0 }
  };

  private tryStartEndpointReconnect(point: Point): boolean {
    const edges = this.selectionManager.getSelectableEdges();
    const tol = 8;
    for (const e of edges) {
      const path = (e as any).path;
      if (!path || !path.points || path.points.length < 2) continue;
      const start = path.points[0]!;
      const end = path.points[path.points.length - 1]!;
      if (Math.hypot(point.x - start.x, point.y - start.y) <= tol) {
        this.endpointDrag = { active: true, edge: e, endpoint: 'source', startPoint: { ...point }, currentPoint: { ...point } };
        this.emit('reconnect-start', { edgeId: (e as any).id, endpoint: 'source' });
        return true;
      }
      if (Math.hypot(point.x - end.x, point.y - end.y) <= tol) {
        this.endpointDrag = { active: true, edge: e, endpoint: 'target', startPoint: { ...point }, currentPoint: { ...point } };
        this.emit('reconnect-start', { edgeId: (e as any).id, endpoint: 'target' });
        return true;
      }
    }
    return false;
  }

  private updateEndpointReconnect(point: Point): void {
    if (!this.endpointDrag.active || !this.endpointDrag.edge) return;
    const p = { ...point };
    const target = this.findNearestPort(p, 10, null);
    const otherFixed = (() => {
      const e = this.endpointDrag.edge as any;
      const path = e.path;
      if (!path || !path.points || path.points.length < 2) return p;
      return this.endpointDrag.endpoint === 'source' ? path.points[path.points.length - 1]! : path.points[0]!;
    })();
    this.emit('reconnect-preview', {
      edgeId: (this.endpointDrag.edge as any).id,
      endpoint: this.endpointDrag.endpoint,
      point: p,
      targetId: target?.node?.id,
      targetPort: target?.portId,
      fixed: otherFixed
    });
  }

  private endEndpointReconnect(point: Point): void {
    if (!this.endpointDrag.active || !this.endpointDrag.edge) return;
    const p = { ...point };
    const target = this.findNearestPort(p, 10, null);
    if (target) {
      this.emit('reconnect-end', {
        edgeId: (this.endpointDrag.edge as any).id,
        endpoint: this.endpointDrag.endpoint,
        targetId: target.node.id,
        targetPort: target.portId
      });
    } else {
      this.emit('reconnect-cancel', { edgeId: (this.endpointDrag.edge as any).id, endpoint: this.endpointDrag.endpoint });
    }
    this.endpointDrag.active = false;
    this.endpointDrag.edge = null;
  }

  /**
   * 处理连接模式的鼠标按下
   */
  private handleConnectModeMouseDown(point: Point, event: MouseEvent): void {
    // 从最近的端口开始连接
    const src = this.findNearestPort(point, 10);
    if (src) {
      (this as any).connectDrag = {
        active: true,
        sourceNode: src.node,
        sourcePort: src.portId,
        currentPoint: { ...point }
      };
      this.emit('connect-start', { sourceId: src.node.id, sourcePort: src.portId, point });
    }
  }

  /**
   * 开始拖拽
   */
  private startDrag(point: Point, item: any): void {
    this.dragState = {
      active: true,
      startPoint: { ...point },
      currentPoint: { ...point },
      item,
      offset: {
        x: point.x - item.position.x,
        y: point.y - item.position.y
      }
    };
    
    if (item.startDrag) {
      item.startDrag(point);
    }
  }

  /**
   * 更新拖拽
   */
  private updateDrag(point: Point): void {
    if (!this.dragState.active) {
      return;
    }
    
    this.dragState.currentPoint = { ...point };
    
    if (this.dragState.item && this.dragState.item.drag) {
      // 计算目标位置（基于光标位置与初始偏移）
      const desiredPos = {
        x: point.x - this.dragState.offset.x,
        y: point.y - this.dragState.offset.y
      };

      // 先网格吸附
      let snappedPos = { ...desiredPos };
      if (this.enableSnap && this.snapSize > 0) {
        snappedPos = {
          x: Math.round(desiredPos.x / this.snapSize) * this.snapSize,
          y: Math.round(desiredPos.y / this.snapSize) * this.snapSize
        };
      }

      // 对齐线吸附（基于其他节点的边/中心）
      const guides = { vertical: [] as number[], horizontal: [] as number[] };
      const tolerance = 8; // 吸附容差
      const item = this.dragState.item as any;
      const width = item.size?.width || 100;
      const height = item.size?.height || 60;

      const draggedLeft = snappedPos.x;
      const draggedCenterX = snappedPos.x + width / 2;
      const draggedRight = snappedPos.x + width;
      const draggedTop = snappedPos.y;
      const draggedCenterY = snappedPos.y + height / 2;
      const draggedBottom = snappedPos.y + height;

      let bestV: { target: number; adjust: number } | null = null;
      let bestH: { target: number; adjust: number } | null = null;

      const nodes = this.selectionManager.getSelectableNodes();
      for (const n of nodes) {
        if (n === item) continue;
        const left = n.position.x;
        const centerX = n.position.x + (n.size?.width || 100) / 2;
        const right = n.position.x + (n.size?.width || 100);
        const top = n.position.y;
        const centerY = n.position.y + (n.size?.height || 60) / 2;
        const bottom = n.position.y + (n.size?.height || 60);

        // 垂直对齐（x）
        const candidatesV: Array<{ dragged: number; target: number; adjustBase: 'left' | 'center' | 'right' }>= [
          { dragged: draggedLeft, target: left, adjustBase: 'left' },
          { dragged: draggedLeft, target: centerX, adjustBase: 'left' },
          { dragged: draggedLeft, target: right, adjustBase: 'left' },
          { dragged: draggedCenterX, target: left, adjustBase: 'center' },
          { dragged: draggedCenterX, target: centerX, adjustBase: 'center' },
          { dragged: draggedCenterX, target: right, adjustBase: 'center' },
          { dragged: draggedRight, target: left, adjustBase: 'right' },
          { dragged: draggedRight, target: centerX, adjustBase: 'right' },
          { dragged: draggedRight, target: right, adjustBase: 'right' },
        ];

        for (const c of candidatesV) {
          const delta = c.target - c.dragged;
          if (Math.abs(delta) <= tolerance && (!bestV || Math.abs(delta) < Math.abs(bestV.adjust))) {
            const adjust = delta;
            bestV = { target: c.target, adjust };
          }
        }

        // 水平对齐（y）
        const candidatesH: Array<{ dragged: number; target: number; adjustBase: 'top' | 'center' | 'bottom' }>= [
          { dragged: draggedTop, target: top, adjustBase: 'top' },
          { dragged: draggedTop, target: centerY, adjustBase: 'top' },
          { dragged: draggedTop, target: bottom, adjustBase: 'top' },
          { dragged: draggedCenterY, target: top, adjustBase: 'center' },
          { dragged: draggedCenterY, target: centerY, adjustBase: 'center' },
          { dragged: draggedCenterY, target: bottom, adjustBase: 'center' },
          { dragged: draggedBottom, target: top, adjustBase: 'bottom' },
          { dragged: draggedBottom, target: centerY, adjustBase: 'bottom' },
          { dragged: draggedBottom, target: bottom, adjustBase: 'bottom' },
        ];

        for (const c of candidatesH) {
          const delta = c.target - c.dragged;
          if (Math.abs(delta) <= tolerance && (!bestH || Math.abs(delta) < Math.abs(bestH.adjust))) {
            const adjust = delta;
            bestH = { target: c.target, adjust };
          }
        }
      }

      if (bestV) {
        snappedPos.x += bestV.adjust;
        guides.vertical.push(bestV.target);
      }
      if (bestH) {
        snappedPos.y += bestH.adjust;
        guides.horizontal.push(bestH.target);
      }

      // 发布对齐线信息（供渲染器绘制）
      this.emit('guides-change', guides);

      // 将吸附后的位置还原为光标点（供节点drag计算）
      const snappedPoint = {
        x: snappedPos.x + this.dragState.offset.x,
        y: snappedPos.y + this.dragState.offset.y
      };

      this.dragState.item.drag(snappedPoint);
    }
  }

  /**
   * 结束拖拽
   */
  private endDrag(point: Point): void {
    if (!this.dragState.active) {
      return;
    }
    
    if (this.dragState.item && this.dragState.item.endDrag) {
      this.dragState.item.endDrag(point);
    }
    
    this.dragState.active = false;
    this.dragState.item = null;
  }

  /**
   * 开始平移
   */
  private startPan(point: Point): void {
    this.panState = {
      active: true,
      startPoint: { ...point },
      startOffset: { ...this.viewport.offset }
    };
  }

  /**
   * 更新平移
   */
  private updatePan(point: Point): void {
    if (!this.panState.active) {
      return;
    }
    
    const dx = point.x - this.panState.startPoint.x;
    const dy = point.y - this.panState.startPoint.y;
    
    this.viewport.offset = {
      x: this.panState.startOffset.x + dx / this.viewport.scale,
      y: this.panState.startOffset.y + dy / this.viewport.scale
    };
    
    this.emit(EventType.CANVAS_PAN, {
      offset: this.viewport.offset,
      delta: { x: dx, y: dy }
    });
  }

  /**
   * 结束平移
   */
  private endPan(): void {
    this.panState.active = false;
  }

  /**
   * 尝试开始拖拽连接线转折点
   */
  private tryStartWaypointDrag(point: Point): boolean {
    const edges = this.selectionManager.getSelectableEdges();
    for (const e of edges) {
      // 仅对直角连接线启用转折点编辑
      if (e.type !== 'orthogonal') continue;
      const idx = (e as any).hitTestWaypoint?.(point, 8);
      if (typeof idx === 'number' && idx >= 0) {
        this.waypointDrag = {
          active: true,
          edge: e,
          index: idx,
          startPoint: { ...point },
          currentPoint: { ...point }
        };
        return true;
      }
    }
    return false;
  }

  /**
   * 贝塞尔控制点拖拽状态
   */
  private controlDrag: {
    active: boolean;
    edge: any | null;
    index: number; // 0: cp1, 1: cp2
    startPoint: Point;
    currentPoint: Point;
  } = {
    active: false,
    edge: null,
    index: -1,
    startPoint: { x: 0, y: 0 },
    currentPoint: { x: 0, y: 0 }
  };

  private tryStartControlDrag(point: Point): boolean {
    const edges = this.selectionManager.getSelectableEdges();
    for (const e of edges) {
      if (e.type !== 'bezier') continue;
      const idx = (e as any).hitTestControlPoint?.(point, 8);
      if (typeof idx === 'number' && idx >= 0) {
        this.controlDrag = {
          active: true,
          edge: e,
          index: idx,
          startPoint: { ...point },
          currentPoint: { ...point }
        };
        return true;
      }
    }
    return false;
  }

  private updateControlDrag(point: Point, ev?: MouseEvent): void {
    if (!this.controlDrag.active || !this.controlDrag.edge) return;
    let p = { ...point };
    if (this.enableSnap && this.snapSize > 0) {
      p = {
        x: Math.round(point.x / this.snapSize) * this.snapSize,
        y: Math.round(point.y / this.snapSize) * this.snapSize
      };
    }
    // Shift 约束
    if (ev?.shiftKey) {
      const start = this.controlDrag.startPoint;
      const dx = Math.abs(p.x - start.x);
      const dy = Math.abs(p.y - start.y);
      if (dx > dy) {
        p.y = start.y;
      } else {
        p.x = start.x;
      }
    }
    this.controlDrag.currentPoint = p;

    const edge = this.controlDrag.edge as any;
    const cps = edge.getEffectiveControlPoints?.();
    if (!cps) return;
    const arr = [ { ...cps.cp1 }, { ...cps.cp2 } ];
    arr[this.controlDrag.index] = { ...p };

    this.emit('edge-control-drag', {
      edgeId: edge.id,
      index: this.controlDrag.index,
      controlPoints: arr
    });
  }

  private endControlDrag(point: Point): void {
    if (!this.controlDrag.active || !this.controlDrag.edge) return;
    const edge = this.controlDrag.edge as any;
    const p = this.controlDrag.currentPoint;

    const cps = edge.getEffectiveControlPoints?.();
    const arr = cps ? [ { ...cps.cp1 }, { ...cps.cp2 } ] : [];
    if (arr[this.controlDrag.index]) {
      arr[this.controlDrag.index] = { ...p };
    }

    this.emit('edge-control-drag-end', {
      edgeId: edge.id,
      index: this.controlDrag.index,
      controlPoints: arr
    });

    this.controlDrag.active = false;
    this.controlDrag.edge = null;
  }

  /**
   * 更新转折点拖拽
   */
  private updateWaypointDrag(point: Point, ev?: MouseEvent): void {
    if (!this.waypointDrag.active || !this.waypointDrag.edge) return;

    // 网格吸附
    let p = { ...point };
    if (this.enableSnap && this.snapSize > 0) {
      p = {
        x: Math.round(point.x / this.snapSize) * this.snapSize,
        y: Math.round(point.y / this.snapSize) * this.snapSize
      };
    }

    // Shift 约束：锁定水平或垂直
    if (ev?.shiftKey) {
      const start = this.waypointDrag.startPoint;
      const dx = Math.abs(p.x - start.x);
      const dy = Math.abs(p.y - start.y);
      if (dx > dy) {
        p.y = start.y;
      } else {
        p.x = start.x;
      }
    }

    this.waypointDrag.currentPoint = p;

    // 发射拖拽事件（由上层应用临时覆盖后重绘）
    const edge = this.waypointDrag.edge as any;
    const waypoints = (edge.getWaypoints?.() || []).map((w: Point) => ({ ...w }));
    if (waypoints[this.waypointDrag.index]) {
      waypoints[this.waypointDrag.index] = { ...p };
    }
    this.emit('edge-waypoint-drag', {
      edgeId: edge.id,
      index: this.waypointDrag.index,
      point: p,
      waypoints
    });
  }

  /**
   * 结束转折点拖拽
   */
  private endWaypointDrag(point: Point): void {
    if (!this.waypointDrag.active || !this.waypointDrag.edge) return;

    const start = this.waypointDrag.startPoint;
    const end = this.waypointDrag.currentPoint;
    const edge = this.waypointDrag.edge as any;

    const waypoints = (edge.getWaypoints?.() || []).map((w: Point) => ({ ...w }));
    if (waypoints[this.waypointDrag.index]) {
      waypoints[this.waypointDrag.index] = { ...end };
    }

    this.emit('edge-waypoint-drag-end', {
      edgeId: edge.id,
      index: this.waypointDrag.index,
      start,
      end,
      waypoints
    });

    this.waypointDrag.active = false;
    this.waypointDrag.edge = null;
  }

  /**
   * 取消当前操作
   */
  private cancelCurrentOperation(): void {
    if (this.dragState.active) {
      this.dragState.active = false;
      this.dragState.item = null;
    }
    
    if (this.panState.active) {
      this.panState.active = false;
    }
    
    this.selectionManager.cancelSelectionBox();
  }

  /**
   * 设置交互模式
   */
  setMode(mode: InteractionMode): void {
    this.currentMode = mode;
    this.cancelCurrentOperation();
  }

  /**
   * 获取当前交互模式
   */
  getMode(): InteractionMode {
    return this.currentMode;
  }

  /**
   * 更新视口
   */
  updateViewport(viewport: Viewport): void {
    this.viewport = viewport;
  }

  /**
   * 设置吸附参数
   */
  setSnapOptions(options: { enableSnap?: boolean; snapSize?: number }): void {
    if (options.enableSnap !== undefined) this.enableSnap = options.enableSnap;
    if (options.snapSize !== undefined && options.snapSize! > 0) this.snapSize = options.snapSize!;
  }

  /**
   * 销毁交互管理器
   */
  destroy(): void {
    this.removeEventListeners();
    this.removeAllListeners();
    this.cancelCurrentOperation();
  }
}
