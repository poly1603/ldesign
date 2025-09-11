/**
 * 流程图核心类型定义
 * 定义流程图编辑器的基础数据结构和接口
 */

/**
 * 二维坐标点
 */
export interface Point {
  /** X坐标 */
  x: number;
  /** Y坐标 */
  y: number;
}

/**
 * 矩形区域
 */
export interface Rectangle {
  /** X坐标 */
  x: number;
  /** Y坐标 */
  y: number;
  /** 宽度 */
  width: number;
  /** 高度 */
  height: number;
}

/**
 * 尺寸
 */
export interface Size {
  /** 宽度 */
  width: number;
  /** 高度 */
  height: number;
}

/**
 * 视口信息
 */
export interface Viewport {
  /** 缩放比例 */
  scale: number;
  /** 平移偏移 */
  offset: Point;
  /** 视口尺寸 */
  size?: Size;
}

/**
 * 样式配置
 */
export interface Style {
  /** 填充颜色 */
  fillColor?: string;
  /** 边框颜色 */
  strokeColor?: string;
  /** 边框宽度 */
  strokeWidth?: number;
  /** 字体大小 */
  fontSize?: number;
  /** 字体颜色 */
  fontColor?: string;
  /** 字体族 */
  fontFamily?: string;
  /** 字体粗细 */
  fontWeight?: string | number;
  /** 透明度 */
  opacity?: number;
  /** 阴影 */
  shadow?: {
    offsetX: number;
    offsetY: number;
    blur: number;
    color: string;
  };
  /** 虚线样式 */
  dashArray?: number[];
}

/**
 * 事件类型枚举
 */
export enum EventType {
  /** 节点相关事件 */
  NODE_CLICK = 'node:click',
  NODE_DOUBLE_CLICK = 'node:dblclick',
  NODE_MOUSE_ENTER = 'node:mouseenter',
  NODE_MOUSE_LEAVE = 'node:mouseleave',
  NODE_DRAG_START = 'node:dragstart',
  NODE_DRAG = 'node:drag',
  NODE_DRAG_END = 'node:dragend',
  NODE_SELECT = 'node:select',
  NODE_DESELECT = 'node:deselect',
  NODE_ADD = 'node:add',
  NODE_REMOVE = 'node:remove',
  NODE_UPDATE = 'node:update',

  /** 连接线相关事件 */
  EDGE_CLICK = 'edge:click',
  EDGE_DOUBLE_CLICK = 'edge:dblclick',
  EDGE_MOUSE_ENTER = 'edge:mouseenter',
  EDGE_MOUSE_LEAVE = 'edge:mouseleave',
  EDGE_SELECT = 'edge:select',
  EDGE_DESELECT = 'edge:deselect',
  EDGE_ADD = 'edge:add',
  EDGE_REMOVE = 'edge:remove',
  EDGE_UPDATE = 'edge:update',

  /** 画布相关事件 */
  CANVAS_CLICK = 'canvas:click',
  CANVAS_DOUBLE_CLICK = 'canvas:dblclick',
  CANVAS_MOUSE_MOVE = 'canvas:mousemove',
  CANVAS_MOUSE_DOWN = 'canvas:mousedown',
  CANVAS_MOUSE_UP = 'canvas:mouseup',
  CANVAS_WHEEL = 'canvas:wheel',
  CANVAS_ZOOM = 'canvas:zoom',
  CANVAS_PAN = 'canvas:pan',

  /** 选择相关事件 */
  SELECTION_CHANGE = 'selection:change',
  SELECTION_CLEAR = 'selection:clear',

  /** 数据相关事件 */
  DATA_CHANGE = 'data:change',
  DATA_LOAD = 'data:load',
  DATA_SAVE = 'data:save',

  /** 编辑器相关事件 */
  EDITOR_READY = 'editor:ready',
  EDITOR_DESTROY = 'editor:destroy',

  /** 查看器相关事件 */
  VIEWER_READY = 'viewer:ready',
  VIEWER_ZOOM = 'viewer:zoom',
  VIEWER_PAN = 'viewer:pan',
  VIEWER_ZOOM_FIT = 'viewer:zoomfit',
  EXECUTION_STATE_CHANGE = 'execution:statechange',

  /** 历史相关事件 */
  HISTORY_UNDO = 'history:undo',
  HISTORY_REDO = 'history:redo',
  HISTORY_CHANGE = 'history:change',
  HISTORY_EXECUTE = 'history:execute'
}

/**
 * 事件监听器函数类型
 */
export type EventListener<T = any> = (event: T) => void;

/**
 * 事件发射器接口
 */
export interface EventEmitter {
  /** 添加事件监听器 */
  on<T = any>(event: EventType | string, listener: EventListener<T>): void;
  /** 移除事件监听器 */
  off<T = any>(event: EventType | string, listener: EventListener<T>): void;
  /** 触发事件 */
  emit<T = any>(event: EventType | string, data?: T): void;
  /** 添加一次性事件监听器 */
  once<T = any>(event: EventType | string, listener: EventListener<T>): void;
  /** 移除所有监听器 */
  removeAllListeners(event?: EventType | string): void;
}

/**
 * 可渲染对象接口
 */
export interface Renderable {
  /** 渲染对象 */
  render(ctx: CanvasRenderingContext2D, viewport: Viewport): void;
  /** 获取边界框 */
  getBounds(): Rectangle;
  /** 检测点是否在对象内 */
  hitTest(point: Point): boolean;
}

/**
 * 可选择对象接口
 */
export interface Selectable {
  /** 是否被选中 */
  selected: boolean;
  /** 选中对象 */
  select(): void;
  /** 取消选中 */
  deselect(): void;
}

/**
 * 可拖拽对象接口
 */
export interface Draggable {
  /** 是否可拖拽 */
  draggable: boolean;
  /** 开始拖拽 */
  startDrag(point: Point): void;
  /** 拖拽中 */
  drag(point: Point): void;
  /** 结束拖拽 */
  endDrag(point: Point): void;
}

/**
 * 命令接口（用于撤销重做）
 */
export interface Command {
  /** 命令名称 */
  name: string;
  /** 执行命令 */
  execute(): void;
  /** 撤销命令 */
  undo(): void;
  /** 重做命令 */
  redo(): void;
}

/**
 * 配置选项接口
 */
export interface FlowchartOptions {
  /** 容器元素 */
  container: HTMLElement;
  /** 画布尺寸 */
  size?: Size;
  /** 是否只读模式 */
  readonly?: boolean;
  /** 是否显示网格 */
  showGrid?: boolean;
  /** 网格大小 */
  gridSize?: number;
  /** 是否启用对齐 */
  enableSnap?: boolean;
  /** 对齐距离 */
  snapDistance?: number;
  /** 最小缩放比例 */
  minScale?: number;
  /** 最大缩放比例 */
  maxScale?: number;
  /** 默认样式 */
  defaultStyle?: Style;
  /** 是否启用键盘快捷键 */
  enableKeyboard?: boolean;
  /** 是否启用触摸支持 */
  enableTouch?: boolean;
}

/**
 * 流程图数据接口
 */
export interface FlowchartData {
  /** 节点列表 */
  nodes: NodeData[];
  /** 连接线列表 */
  edges: EdgeData[];
  /** 视口信息 */
  viewport?: Viewport;
  /** 元数据 */
  metadata?: Record<string, any>;
}

/**
 * 基础节点数据接口（将在nodes.ts中扩展）
 */
export interface NodeData {
  /** 唯一标识 */
  id: string;
  /** 节点类型 */
  type: string;
  /** 位置 */
  position: Point;
  /** 尺寸 */
  size?: Size;
  /** 标签 */
  label: string;
  /** 样式 */
  style?: Style;
  /** 自定义属性 */
  properties?: Record<string, any>;
}

/**
 * 基础连接线数据接口（将在edges.ts中扩展）
 */
export interface EdgeData {
  /** 唯一标识 */
  id: string;
  /** 连接线类型 */
  type: string;
  /** 源节点ID */
  source: string;
  /** 目标节点ID */
  target: string;
  /** 源端口 */
  sourcePort?: string;
  /** 目标端口 */
  targetPort?: string;
  /** 标签 */
  label?: string;
  /** 样式 */
  style?: Style;
  /** 自定义属性 */
  properties?: Record<string, any>;
}
