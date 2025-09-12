/**
 * 事件相关类型定义
 * 定义地图事件系统的所有类型和接口
 */

import type { Coordinate } from 'ol/coordinate';
import type { Feature } from 'ol';
import type { Geometry } from 'ol/geom';

/**
 * 地图事件类型枚举
 */
export enum MapEventType {
  // 地图基础事件
  /** 地图点击事件 */
  CLICK = 'click',
  /** 地图双击事件 */
  DOUBLE_CLICK = 'dblclick',
  /** 地图右键点击事件 */
  CONTEXT_MENU = 'contextmenu',
  /** 鼠标移动事件 */
  MOUSE_MOVE = 'mousemove',
  /** 鼠标进入事件 */
  MOUSE_ENTER = 'mouseenter',
  /** 鼠标离开事件 */
  MOUSE_LEAVE = 'mouseleave',
  /** 鼠标按下事件 */
  MOUSE_DOWN = 'mousedown',
  /** 鼠标抬起事件 */
  MOUSE_UP = 'mouseup',
  
  // 地图视图事件
  /** 地图移动开始事件 */
  MOVE_START = 'movestart',
  /** 地图移动中事件 */
  MOVE = 'move',
  /** 地图移动结束事件 */
  MOVE_END = 'moveend',
  /** 地图缩放开始事件 */
  ZOOM_START = 'zoomstart',
  /** 地图缩放中事件 */
  ZOOM = 'zoom',
  /** 地图缩放结束事件 */
  ZOOM_END = 'zoomend',
  /** 地图旋转开始事件 */
  ROTATE_START = 'rotatestart',
  /** 地图旋转中事件 */
  ROTATE = 'rotate',
  /** 地图旋转结束事件 */
  ROTATE_END = 'rotateend',
  
  // 地图状态事件
  /** 地图加载完成事件 */
  LOAD = 'load',
  /** 地图准备就绪事件 */
  READY = 'ready',
  /** 地图尺寸变化事件 */
  RESIZE = 'resize',
  /** 地图销毁事件 */
  DESTROY = 'destroy',
  
  // 图层事件
  /** 图层添加事件 */
  LAYER_ADD = 'layer:add',
  /** 图层移除事件 */
  LAYER_REMOVE = 'layer:remove',
  /** 图层显示事件 */
  LAYER_SHOW = 'layer:show',
  /** 图层隐藏事件 */
  LAYER_HIDE = 'layer:hide',
  /** 图层加载开始事件 */
  LAYER_LOAD_START = 'layer:loadstart',
  /** 图层加载结束事件 */
  LAYER_LOAD_END = 'layer:loadend',
  /** 图层加载错误事件 */
  LAYER_ERROR = 'layer:error',
  
  // 标记事件
  /** 标记点击事件 */
  MARKER_CLICK = 'marker:click',
  /** 标记双击事件 */
  MARKER_DOUBLE_CLICK = 'marker:dblclick',
  /** 标记右键点击事件 */
  MARKER_CONTEXT_MENU = 'marker:contextmenu',
  /** 标记鼠标悬停事件 */
  MARKER_MOUSE_OVER = 'marker:mouseover',
  /** 标记鼠标离开事件 */
  MARKER_MOUSE_OUT = 'marker:mouseout',
  /** 标记拖拽开始事件 */
  MARKER_DRAG_START = 'marker:dragstart',
  /** 标记拖拽中事件 */
  MARKER_DRAG = 'marker:drag',
  /** 标记拖拽结束事件 */
  MARKER_DRAG_END = 'marker:dragend',
  /** 标记添加事件 */
  MARKER_ADD = 'marker:add',
  /** 标记移除事件 */
  MARKER_REMOVE = 'marker:remove',
  
  // 弹窗事件
  /** 弹窗打开事件 */
  POPUP_OPEN = 'popup:open',
  /** 弹窗关闭事件 */
  POPUP_CLOSE = 'popup:close',
  
  // 绘制事件
  /** 绘制开始事件 */
  DRAW_START = 'draw:start',
  /** 绘制中事件 */
  DRAW = 'draw:draw',
  /** 绘制结束事件 */
  DRAW_END = 'draw:end',
  /** 绘制取消事件 */
  DRAW_CANCEL = 'draw:cancel',
  
  // 编辑事件
  /** 编辑开始事件 */
  EDIT_START = 'edit:start',
  /** 编辑中事件 */
  EDIT = 'edit:edit',
  /** 编辑结束事件 */
  EDIT_END = 'edit:end',
  /** 编辑取消事件 */
  EDIT_CANCEL = 'edit:cancel',
  
  // 选择事件
  /** 要素选择事件 */
  SELECT = 'select',
  /** 要素取消选择事件 */
  DESELECT = 'deselect'
}

/**
 * 基础事件数据接口
 */
export interface BaseEventData {
  /** 事件类型 */
  type: MapEventType;
  
  /** 事件时间戳 */
  timestamp: number;
  
  /** 原始事件对象 */
  originalEvent?: Event;
  
  /** 是否阻止默认行为 */
  preventDefault?: boolean;
  
  /** 是否停止事件传播 */
  stopPropagation?: boolean;
}

/**
 * 地图点击事件数据
 */
export interface MapClickEventData extends BaseEventData {
  type: MapEventType.CLICK | MapEventType.DOUBLE_CLICK | MapEventType.CONTEXT_MENU;
  
  /** 点击坐标 */
  coordinate: Coordinate;
  
  /** 像素坐标 */
  pixel: [number, number];
  
  /** 点击的要素 */
  features?: Feature<Geometry>[];
}

/**
 * 地图鼠标事件数据
 */
export interface MapMouseEventData extends BaseEventData {
  type: MapEventType.MOUSE_MOVE | MapEventType.MOUSE_ENTER | MapEventType.MOUSE_LEAVE;
  
  /** 鼠标坐标 */
  coordinate: Coordinate;
  
  /** 像素坐标 */
  pixel: [number, number];
  
  /** 鼠标下的要素 */
  features?: Feature<Geometry>[];
}

/**
 * 地图视图变化事件数据
 */
export interface MapViewEventData extends BaseEventData {
  type: MapEventType.MOVE | MapEventType.ZOOM | MapEventType.ROTATE |
        MapEventType.MOVE_START | MapEventType.MOVE_END |
        MapEventType.ZOOM_START | MapEventType.ZOOM_END |
        MapEventType.ROTATE_START | MapEventType.ROTATE_END;
  
  /** 当前中心点 */
  center: Coordinate;
  
  /** 当前缩放级别 */
  zoom: number;
  
  /** 当前旋转角度 */
  rotation: number;
  
  /** 变化前的值（仅在结束事件中提供） */
  oldValue?: {
    center: Coordinate;
    zoom: number;
    rotation: number;
  };
}

/**
 * 图层事件数据
 */
export interface LayerEventData extends BaseEventData {
  type: MapEventType.LAYER_ADD | MapEventType.LAYER_REMOVE | 
        MapEventType.LAYER_SHOW | MapEventType.LAYER_HIDE |
        MapEventType.LAYER_LOAD_START | MapEventType.LAYER_LOAD_END |
        MapEventType.LAYER_ERROR;
  
  /** 图层 ID */
  layerId: string;
  
  /** 图层名称 */
  layerName: string;
  
  /** 错误信息（仅在错误事件中提供） */
  error?: string;
  
  /** 加载进度（仅在加载事件中提供） */
  progress?: number;
}

/**
 * 标记事件数据
 */
export interface MarkerEventData extends BaseEventData {
  type: MapEventType.MARKER_CLICK | MapEventType.MARKER_DOUBLE_CLICK |
        MapEventType.MARKER_CONTEXT_MENU | MapEventType.MARKER_MOUSE_OVER |
        MapEventType.MARKER_MOUSE_OUT | MapEventType.MARKER_DRAG_START |
        MapEventType.MARKER_DRAG | MapEventType.MARKER_DRAG_END |
        MapEventType.MARKER_ADD | MapEventType.MARKER_REMOVE;
  
  /** 标记 ID */
  markerId: string;
  
  /** 标记坐标 */
  coordinate: Coordinate;
  
  /** 像素坐标 */
  pixel: [number, number];
  
  /** 拖拽前坐标（仅在拖拽事件中提供） */
  oldCoordinate?: Coordinate;
}

/**
 * 绘制事件数据
 */
export interface DrawEventData extends BaseEventData {
  type: MapEventType.DRAW_START | MapEventType.DRAW | 
        MapEventType.DRAW_END | MapEventType.DRAW_CANCEL;
  
  /** 绘制的要素 */
  feature: Feature<Geometry>;
  
  /** 绘制类型 */
  drawType: 'Point' | 'LineString' | 'Polygon' | 'Circle' | 'Rectangle';
  
  /** 当前坐标 */
  coordinate?: Coordinate;
}

/**
 * 编辑事件数据
 */
export interface EditEventData extends BaseEventData {
  type: MapEventType.EDIT_START | MapEventType.EDIT | 
        MapEventType.EDIT_END | MapEventType.EDIT_CANCEL;
  
  /** 编辑的要素 */
  features: Feature<Geometry>[];
  
  /** 编辑前的几何图形 */
  oldGeometries?: Geometry[];
}

/**
 * 选择事件数据
 */
export interface SelectEventData extends BaseEventData {
  type: MapEventType.SELECT | MapEventType.DESELECT;
  
  /** 选中的要素 */
  selected: Feature<Geometry>[];
  
  /** 取消选中的要素 */
  deselected: Feature<Geometry>[];
}

/**
 * 事件数据联合类型
 */
export type EventData = 
  | BaseEventData
  | MapClickEventData
  | MapMouseEventData
  | MapViewEventData
  | LayerEventData
  | MarkerEventData
  | DrawEventData
  | EditEventData
  | SelectEventData;

/**
 * 事件监听器函数类型
 */
export type EventListener<T extends EventData = EventData> = (event: T) => void;

/**
 * 事件监听器选项
 */
export interface EventListenerOptions {
  /** 是否只执行一次 */
  once?: boolean;
  
  /** 事件优先级 */
  priority?: number;
  
  /** 是否在捕获阶段执行 */
  capture?: boolean;
}

/**
 * 事件管理器接口
 */
export interface IEventManager {
  /** 添加事件监听器 */
  on<T extends EventData>(
    type: MapEventType | string,
    listener: EventListener<T>,
    options?: EventListenerOptions
  ): void;
  
  /** 移除事件监听器 */
  off<T extends EventData>(
    type: MapEventType | string,
    listener: EventListener<T>
  ): void;
  
  /** 添加一次性事件监听器 */
  once<T extends EventData>(
    type: MapEventType | string,
    listener: EventListener<T>
  ): void;
  
  /** 触发事件 */
  emit<T extends EventData>(type: MapEventType | string, data: T): void;
  
  /** 获取事件监听器数量 */
  listenerCount(type: MapEventType | string): number;
  
  /** 获取所有事件类型 */
  eventNames(): string[];
  
  /** 移除所有事件监听器 */
  removeAllListeners(type?: MapEventType | string): void;
}
