/**
 * 地理围栏相关类型定义
 * 支持多种几何形状的围栏创建和进出检测
 */

import type { Coordinate } from 'ol/coordinate';
import type { Geometry } from 'ol/geom';

/**
 * 地理围栏配置选项
 */
export interface GeofenceOptions {
  /** 围栏唯一标识 */
  id?: string;
  /** 围栏名称 */
  name: string;
  /** 围栏描述 */
  description?: string;
  /** 围栏几何形状 */
  geometry: GeofenceGeometry;
  /** 围栏样式 */
  style?: GeofenceStyle;
  /** 是否启用 */
  enabled?: boolean;
  /** 缓冲区距离（米） */
  bufferDistance?: number;
  /** 触发条件 */
  triggers?: GeofenceTrigger[];
  /** 自定义属性 */
  properties?: Record<string, any>;
}

/**
 * 地理围栏几何形状
 */
export interface GeofenceGeometry {
  /** 几何类型 */
  type: GeofenceGeometryType;
  /** 坐标数据 */
  coordinates: number[] | number[][] | number[][][];
  /** 半径（仅圆形围栏使用，单位：米） */
  radius?: number;
}

/**
 * 地理围栏几何类型
 */
export enum GeofenceGeometryType {
  /** 点 */
  POINT = 'Point',
  /** 圆形 */
  CIRCLE = 'Circle',
  /** 线段 */
  LINE_STRING = 'LineString',
  /** 多边形 */
  POLYGON = 'Polygon',
  /** 矩形 */
  RECTANGLE = 'Rectangle',
  /** 多点 */
  MULTI_POINT = 'MultiPoint',
  /** 多线段 */
  MULTI_LINE_STRING = 'MultiLineString',
  /** 多多边形 */
  MULTI_POLYGON = 'MultiPolygon'
}

/**
 * 地理围栏样式配置
 */
export interface GeofenceStyle {
  /** 填充颜色 */
  fillColor?: string;
  /** 填充透明度 */
  fillOpacity?: number;
  /** 边框颜色 */
  strokeColor?: string;
  /** 边框宽度 */
  strokeWidth?: number;
  /** 边框透明度 */
  strokeOpacity?: number;
  /** 虚线样式 */
  strokeDashArray?: number[];
  /** 标签样式 */
  label?: {
    /** 标签文本 */
    text?: string;
    /** 字体大小 */
    fontSize?: number;
    /** 字体颜色 */
    color?: string;
    /** 背景颜色 */
    backgroundColor?: string;
    /** 是否显示 */
    visible?: boolean;
  };
}

/**
 * 地理围栏触发条件
 */
export interface GeofenceTrigger {
  /** 触发事件类型 */
  event: GeofenceEventType;
  /** 触发条件 */
  condition?: GeofenceTriggerCondition;
  /** 延迟时间（毫秒） */
  delay?: number;
  /** 是否只触发一次 */
  once?: boolean;
}

/**
 * 地理围栏触发条件
 */
export interface GeofenceTriggerCondition {
  /** 最小停留时间（毫秒） */
  minDwellTime?: number;
  /** 最大停留时间（毫秒） */
  maxDwellTime?: number;
  /** 速度条件 */
  speed?: {
    /** 最小速度（米/秒） */
    min?: number;
    /** 最大速度（米/秒） */
    max?: number;
  };
  /** 时间范围 */
  timeRange?: {
    /** 开始时间 */
    start: Date;
    /** 结束时间 */
    end: Date;
  };
  /** 星期几（0-6，0为周日） */
  daysOfWeek?: number[];
}

/**
 * 地理围栏信息
 */
export interface GeofenceInfo {
  /** 围栏唯一标识 */
  id: string;
  /** 围栏名称 */
  name: string;
  /** 围栏描述 */
  description?: string;
  /** 围栏几何数据 */
  geometry: Geometry;
  /** 围栏样式 */
  style: GeofenceStyle;
  /** 是否启用 */
  enabled: boolean;
  /** 缓冲区距离 */
  bufferDistance: number;
  /** 触发条件 */
  triggers: GeofenceTrigger[];
  /** 围栏边界框 */
  bounds: [number, number, number, number];
  /** 围栏面积（平方米） */
  area?: number;
  /** 围栏周长（米） */
  perimeter?: number;
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
  /** 自定义属性 */
  properties: Record<string, any>;
}

/**
 * 地理围栏事件类型
 */
export enum GeofenceEventType {
  /** 进入围栏 */
  ENTER = 'enter',
  /** 离开围栏 */
  EXIT = 'exit',
  /** 在围栏内 */
  INSIDE = 'inside',
  /** 在围栏外 */
  OUTSIDE = 'outside',
  /** 穿越围栏 */
  CROSS = 'cross',
  /** 停留在围栏内 */
  DWELL = 'dwell'
}

/**
 * 地理围栏事件数据
 */
export interface GeofenceEventData {
  /** 事件类型 */
  type: GeofenceEventType;
  /** 围栏信息 */
  geofence: GeofenceInfo;
  /** 触发位置 */
  position: Coordinate;
  /** 前一个位置 */
  previousPosition?: Coordinate;
  /** 事件时间戳 */
  timestamp: Date;
  /** 停留时间（毫秒，仅DWELL事件） */
  dwellTime?: number;
  /** 移动速度（米/秒） */
  speed?: number;
  /** 移动方向（度） */
  bearing?: number;
  /** 距离围栏边界的距离（米） */
  distanceToGeofence?: number;
  /** 额外数据 */
  data?: any;
}

/**
 * 位置跟踪状态
 */
export interface LocationTrackingState {
  /** 当前位置 */
  currentPosition?: Coordinate;
  /** 前一个位置 */
  previousPosition?: Coordinate;
  /** 位置更新时间 */
  lastUpdateTime?: Date;
  /** 移动速度（米/秒） */
  speed?: number;
  /** 移动方向（度） */
  bearing?: number;
  /** 位置精度（米） */
  accuracy?: number;
  /** 是否正在跟踪 */
  isTracking: boolean;
}

/**
 * 地理围栏统计信息
 */
export interface GeofenceStatistics {
  /** 围栏ID */
  geofenceId: string;
  /** 进入次数 */
  enterCount: number;
  /** 离开次数 */
  exitCount: number;
  /** 总停留时间（毫秒） */
  totalDwellTime: number;
  /** 平均停留时间（毫秒） */
  averageDwellTime: number;
  /** 最长停留时间（毫秒） */
  maxDwellTime: number;
  /** 最短停留时间（毫秒） */
  minDwellTime: number;
  /** 首次进入时间 */
  firstEnterTime?: Date;
  /** 最后进入时间 */
  lastEnterTime?: Date;
  /** 最后离开时间 */
  lastExitTime?: Date;
}

/**
 * 地理围栏管理器接口
 */
export interface IGeofenceManager {
  /** 添加地理围栏 */
  addGeofence(options: GeofenceOptions): string;
  /** 删除地理围栏 */
  removeGeofence(geofenceId: string): void;
  /** 获取地理围栏信息 */
  getGeofence(geofenceId: string): GeofenceInfo | null;
  /** 获取所有地理围栏 */
  getAllGeofences(): GeofenceInfo[];
  /** 更新地理围栏 */
  updateGeofence(geofenceId: string, options: Partial<GeofenceOptions>): void;
  /** 启用/禁用地理围栏 */
  setGeofenceEnabled(geofenceId: string, enabled: boolean): void;
  /** 清除所有地理围栏 */
  clearGeofences(): void;
  /** 检查位置是否在围栏内 */
  isPointInGeofence(position: Coordinate, geofenceId: string): boolean;
  /** 检查地理围栏事件 */
  checkGeofenceEvents(currentPosition: Coordinate, previousPosition?: Coordinate): GeofenceEventData[];
  /** 开始位置跟踪 */
  startLocationTracking(): void;
  /** 停止位置跟踪 */
  stopLocationTracking(): void;
  /** 更新位置 */
  updateLocation(position: Coordinate, accuracy?: number): void;
  /** 获取围栏统计信息 */
  getGeofenceStatistics(geofenceId: string): GeofenceStatistics | null;
  /** 重置围栏统计信息 */
  resetGeofenceStatistics(geofenceId: string): void;
  /** 监听地理围栏事件 */
  on(eventType: GeofenceEventType, callback: (data: GeofenceEventData) => void): void;
  /** 移除事件监听 */
  off(eventType: GeofenceEventType, callback: (data: GeofenceEventData) => void): void;
}
