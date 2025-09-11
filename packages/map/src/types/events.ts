/**
 * 地图事件类型定义
 * 提供统一的事件接口，支持多种地图引擎
 */

import type { LngLat } from './index'

// 基础事件接口
export interface BaseMapEvent {
  /** 事件类型 */
  type: string
  /** 事件目标 */
  target: any
  /** 原始事件对象 */
  originalEvent?: Event
  /** 事件时间戳 */
  timeStamp: number
}

// 鼠标事件
export interface MouseEvent extends BaseMapEvent {
  /** 地理坐标 */
  lngLat: LngLat
  /** 屏幕坐标 */
  point: [number, number]
  /** 鼠标按键 */
  button?: number
  /** 是否按下Ctrl键 */
  ctrlKey: boolean
  /** 是否按下Shift键 */
  shiftKey: boolean
  /** 是否按下Alt键 */
  altKey: boolean
}

// 触摸事件
export interface TouchEvent extends BaseMapEvent {
  /** 地理坐标 */
  lngLat: LngLat
  /** 屏幕坐标 */
  point: [number, number]
  /** 触摸点数量 */
  touches: number
}

// 缩放事件
export interface ZoomEvent extends BaseMapEvent {
  /** 当前缩放级别 */
  zoom: number
  /** 之前的缩放级别 */
  previousZoom: number
}

// 移动事件
export interface MoveEvent extends BaseMapEvent {
  /** 当前中心点 */
  center: LngLat
  /** 之前的中心点 */
  previousCenter: LngLat
}

// 旋转事件
export interface RotateEvent extends BaseMapEvent {
  /** 当前方位角 */
  bearing: number
  /** 之前的方位角 */
  previousBearing: number
}

// 倾斜事件
export interface PitchEvent extends BaseMapEvent {
  /** 当前倾斜角 */
  pitch: number
  /** 之前的倾斜角 */
  previousPitch: number
}

// 加载事件
export interface LoadEvent extends BaseMapEvent {
  /** 是否加载成功 */
  success: boolean
  /** 错误信息 */
  error?: Error
}

// 样式事件
export interface StyleEvent extends BaseMapEvent {
  /** 样式URL或对象 */
  style: string | object
}

// 数据事件
export interface DataEvent extends BaseMapEvent {
  /** 数据类型 */
  dataType: 'source' | 'style'
  /** 数据源ID */
  sourceId?: string
  /** 是否为瓦片数据 */
  tile?: boolean
}

// 错误事件
export interface ErrorEvent extends BaseMapEvent {
  /** 错误对象 */
  error: Error
  /** 错误代码 */
  code?: string
}

// 事件类型映射
export interface MapEventMap {
  // 生命周期事件
  'load': LoadEvent
  'idle': BaseMapEvent
  'remove': BaseMapEvent
  'render': BaseMapEvent
  'resize': BaseMapEvent
  
  // 鼠标事件
  'click': MouseEvent
  'dblclick': MouseEvent
  'mousedown': MouseEvent
  'mouseup': MouseEvent
  'mousemove': MouseEvent
  'mouseover': MouseEvent
  'mouseout': MouseEvent
  'mouseenter': MouseEvent
  'mouseleave': MouseEvent
  'contextmenu': MouseEvent
  
  // 触摸事件
  'touchstart': TouchEvent
  'touchend': TouchEvent
  'touchmove': TouchEvent
  'touchcancel': TouchEvent
  
  // 缩放事件
  'zoom': ZoomEvent
  'zoomstart': ZoomEvent
  'zoomend': ZoomEvent
  
  // 移动事件
  'move': MoveEvent
  'movestart': MoveEvent
  'moveend': MoveEvent
  
  // 拖拽事件
  'drag': MoveEvent
  'dragstart': MoveEvent
  'dragend': MoveEvent
  
  // 旋转事件
  'rotate': RotateEvent
  'rotatestart': RotateEvent
  'rotateend': RotateEvent
  
  // 倾斜事件
  'pitch': PitchEvent
  'pitchstart': PitchEvent
  'pitchend': PitchEvent
  
  // 样式事件
  'style.load': StyleEvent
  'styledata': DataEvent
  'styledataloading': DataEvent
  
  // 数据事件
  'sourcedata': DataEvent
  'sourcedataloading': DataEvent
  'data': DataEvent
  'dataloading': DataEvent
  
  // 错误事件
  'error': ErrorEvent
  'webglcontextlost': ErrorEvent
  'webglcontextrestored': BaseMapEvent
}

// 事件监听器类型
export type MapEventListener<T extends keyof MapEventMap> = (event: MapEventMap[T]) => void

// 通用事件监听器
export type GenericEventListener = (event: BaseMapEvent) => void

// 事件管理器接口
export interface IEventManager {
  /** 添加事件监听器 */
  on<T extends keyof MapEventMap>(type: T, listener: MapEventListener<T>): void
  on(type: string, listener: GenericEventListener): void
  
  /** 添加一次性事件监听器 */
  once<T extends keyof MapEventMap>(type: T, listener: MapEventListener<T>): void
  once(type: string, listener: GenericEventListener): void
  
  /** 移除事件监听器 */
  off<T extends keyof MapEventMap>(type: T, listener: MapEventListener<T>): void
  off(type: string, listener: GenericEventListener): void
  
  /** 移除所有事件监听器 */
  removeAllListeners(type?: string): void
  
  /** 触发事件 */
  emit<T extends keyof MapEventMap>(type: T, event: MapEventMap[T]): void
  emit(type: string, event: BaseMapEvent): void
  
  /** 获取事件监听器数量 */
  listenerCount(type: string): number
  
  /** 获取所有事件类型 */
  eventNames(): string[]
}
