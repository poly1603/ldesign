/**
 * 路径规划相关类型定义
 * 支持多种路径规划模式和导航功能
 */

import type { Coordinate } from 'ol/coordinate';
import type { Feature } from 'ol';
import type { Geometry } from 'ol/geom';

/**
 * 路径规划配置选项
 */
export interface RoutingOptions {
  /** 路径点坐标数组 */
  waypoints: Coordinate[];
  /** 路径规划模式 */
  profile?: RoutingProfile;
  /** 是否避开收费路段 */
  avoidTolls?: boolean;
  /** 是否避开高速公路 */
  avoidHighways?: boolean;
  /** 是否避开轮渡 */
  avoidFerries?: boolean;
  /** 路径优化选项 */
  optimize?: RoutingOptimization;
  /** 自定义样式 */
  style?: RouteStyle;
  /** 是否显示路径指引 */
  showInstructions?: boolean;
  /** 语言设置 */
  language?: string;
}

/**
 * 路径规划模式
 */
export enum RoutingProfile {
  /** 驾车路线 */
  DRIVING = 'driving',
  /** 步行路线 */
  WALKING = 'walking',
  /** 骑行路线 */
  CYCLING = 'cycling',
  /** 公共交通 */
  TRANSIT = 'transit',
  /** 货车路线 */
  TRUCK = 'truck'
}

/**
 * 路径优化选项
 */
export enum RoutingOptimization {
  /** 最短时间 */
  TIME = 'time',
  /** 最短距离 */
  DISTANCE = 'distance',
  /** 最少费用 */
  COST = 'cost',
  /** 最舒适路线 */
  COMFORT = 'comfort'
}

/**
 * 路径样式配置
 */
export interface RouteStyle {
  /** 路径颜色 */
  color?: string;
  /** 路径宽度 */
  width?: number;
  /** 路径透明度 */
  opacity?: number;
  /** 虚线样式 */
  dashArray?: number[];
  /** 起点标记样式 */
  startMarker?: MarkerStyle;
  /** 终点标记样式 */
  endMarker?: MarkerStyle;
  /** 途经点标记样式 */
  waypointMarker?: MarkerStyle;
}

/**
 * 标记样式
 */
export interface MarkerStyle {
  /** 标记颜色 */
  color?: string;
  /** 标记大小 */
  size?: number;
  /** 标记图标 */
  icon?: string;
  /** 标记文本 */
  text?: string;
}

/**
 * 路径信息
 */
export interface RouteInfo {
  /** 路径唯一标识 */
  id: string;
  /** 路径名称 */
  name?: string;
  /** 路径几何数据 */
  geometry: Geometry;
  /** 路径总距离（米） */
  distance: number;
  /** 路径总时间（秒） */
  duration: number;
  /** 路径指引信息 */
  instructions?: RouteInstruction[];
  /** 路径边界框 */
  bounds?: [number, number, number, number];
  /** 路径创建时间 */
  createdAt: Date;
  /** 路径配置选项 */
  options: RoutingOptions;
}

/**
 * 路径指引信息
 */
export interface RouteInstruction {
  /** 指引文本 */
  text: string;
  /** 指引类型 */
  type: InstructionType;
  /** 距离（米） */
  distance: number;
  /** 时间（秒） */
  time: number;
  /** 指引位置坐标 */
  coordinate: Coordinate;
  /** 转向角度 */
  bearing?: number;
  /** 道路名称 */
  roadName?: string;
}

/**
 * 指引类型
 */
export enum InstructionType {
  /** 出发 */
  DEPART = 'depart',
  /** 到达 */
  ARRIVE = 'arrive',
  /** 直行 */
  STRAIGHT = 'straight',
  /** 左转 */
  TURN_LEFT = 'turn-left',
  /** 右转 */
  TURN_RIGHT = 'turn-right',
  /** 急左转 */
  SHARP_LEFT = 'sharp-left',
  /** 急右转 */
  SHARP_RIGHT = 'sharp-right',
  /** 微左转 */
  SLIGHT_LEFT = 'slight-left',
  /** 微右转 */
  SLIGHT_RIGHT = 'slight-right',
  /** 掉头 */
  U_TURN = 'u-turn',
  /** 进入环岛 */
  ROUNDABOUT_ENTER = 'roundabout-enter',
  /** 离开环岛 */
  ROUNDABOUT_EXIT = 'roundabout-exit'
}

/**
 * 导航状态
 */
export interface NavigationState {
  /** 是否正在导航 */
  isNavigating: boolean;
  /** 当前路径ID */
  currentRouteId?: string;
  /** 当前位置 */
  currentPosition?: Coordinate;
  /** 当前指引索引 */
  currentInstructionIndex: number;
  /** 剩余距离（米） */
  remainingDistance: number;
  /** 剩余时间（秒） */
  remainingTime: number;
  /** 导航开始时间 */
  startTime?: Date;
  /** 偏离路径距离阈值（米） */
  offRouteThreshold: number;
}

/**
 * 路径动画配置
 */
export interface RouteAnimationOptions {
  /** 动画持续时间（毫秒） */
  duration?: number;
  /** 动画缓动函数 */
  easing?: string;
  /** 是否显示动画轨迹 */
  showTrail?: boolean;
  /** 轨迹颜色 */
  trailColor?: string;
  /** 动画标记 */
  marker?: {
    /** 标记图标 */
    icon?: string;
    /** 标记大小 */
    size?: number;
    /** 标记颜色 */
    color?: string;
  };
}

/**
 * 路径事件类型
 */
export enum RouteEventType {
  /** 路径创建 */
  ROUTE_CREATED = 'route-created',
  /** 路径删除 */
  ROUTE_DELETED = 'route-deleted',
  /** 路径更新 */
  ROUTE_UPDATED = 'route-updated',
  /** 导航开始 */
  NAVIGATION_STARTED = 'navigation-started',
  /** 导航结束 */
  NAVIGATION_ENDED = 'navigation-ended',
  /** 导航暂停 */
  NAVIGATION_PAUSED = 'navigation-paused',
  /** 导航恢复 */
  NAVIGATION_RESUMED = 'navigation-resumed',
  /** 偏离路径 */
  OFF_ROUTE = 'off-route',
  /** 到达途经点 */
  WAYPOINT_REACHED = 'waypoint-reached',
  /** 到达目的地 */
  DESTINATION_REACHED = 'destination-reached'
}

/**
 * 路径事件数据
 */
export interface RouteEventData {
  /** 事件类型 */
  type: RouteEventType;
  /** 路径信息 */
  route?: RouteInfo;
  /** 导航状态 */
  navigationState?: NavigationState;
  /** 当前位置 */
  position?: Coordinate;
  /** 事件时间戳 */
  timestamp: Date;
  /** 额外数据 */
  data?: any;
}

/**
 * 路径管理器接口
 */
export interface IRoutingManager {
  /** 添加路径 */
  addRoute(options: RoutingOptions): Promise<RouteInfo>;
  /** 删除路径 */
  removeRoute(routeId: string): void;
  /** 获取路径信息 */
  getRoute(routeId: string): RouteInfo | null;
  /** 获取所有路径 */
  getAllRoutes(): RouteInfo[];
  /** 清除所有路径 */
  clearRoutes(): void;
  /** 开始导航 */
  startNavigation(routeId: string, startPosition?: Coordinate): void;
  /** 停止导航 */
  stopNavigation(): void;
  /** 暂停导航 */
  pauseNavigation(): void;
  /** 恢复导航 */
  resumeNavigation(): void;
  /** 更新当前位置 */
  updatePosition(position: Coordinate): void;
  /** 播放路径动画 */
  playRouteAnimation(routeId: string, options?: RouteAnimationOptions): void;
  /** 停止路径动画 */
  stopRouteAnimation(routeId: string): void;
  /** 监听路径事件 */
  on(eventType: RouteEventType, callback: (data: RouteEventData) => void): void;
  /** 移除事件监听 */
  off(eventType: RouteEventType, callback: (data: RouteEventData) => void): void;
}
