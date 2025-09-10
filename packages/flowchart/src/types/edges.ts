/**
 * 连接线相关类型定义
 * 定义各种连接线类型的数据结构和接口
 */

import type { EdgeData, Point, Size, Style, Renderable, Selectable, EventEmitter } from './core.js';
import type { ConditionConfig } from './nodes.js';

/**
 * 连接线类型枚举
 */
export enum EdgeType {
  /** 直线 */
  STRAIGHT = 'straight',
  /** 贝塞尔曲线 */
  BEZIER = 'bezier',
  /** 直角连接 */
  ORTHOGONAL = 'orthogonal',
  /** 平滑曲线 */
  SMOOTH = 'smooth',
  /** 自定义路径 */
  CUSTOM = 'custom'
}

/**
 * 箭头类型枚举
 */
export enum ArrowType {
  /** 无箭头 */
  NONE = 'none',
  /** 标准箭头 */
  ARROW = 'arrow',
  /** 实心箭头 */
  FILLED_ARROW = 'filled-arrow',
  /** 圆形 */
  CIRCLE = 'circle',
  /** 实心圆形 */
  FILLED_CIRCLE = 'filled-circle',
  /** 菱形 */
  DIAMOND = 'diamond',
  /** 实心菱形 */
  FILLED_DIAMOND = 'filled-diamond',
  /** 方形 */
  SQUARE = 'square',
  /** 实心方形 */
  FILLED_SQUARE = 'filled-square'
}

/**
 * 连接线状态枚举
 */
export enum EdgeStatus {
  /** 正常 */
  NORMAL = 'normal',
  /** 激活 */
  ACTIVE = 'active',
  /** 已执行 */
  EXECUTED = 'executed',
  /** 条件不满足 */
  CONDITION_FALSE = 'condition-false',
  /** 错误 */
  ERROR = 'error'
}

/**
 * 路径点
 */
export interface PathPoint extends Point {
  /** 控制点类型 */
  type?: 'move' | 'line' | 'curve' | 'arc';
  /** 控制点1（贝塞尔曲线） */
  cp1?: Point;
  /** 控制点2（贝塞尔曲线） */
  cp2?: Point;
  /** 半径（圆弧） */
  radius?: number;
}

/**
 * 连接线路径
 */
export interface EdgePath {
  /** 路径点列表 */
  points: PathPoint[];
  /** 路径长度 */
  length: number;
  /** 边界框 */
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * 标签配置
 */
export interface LabelConfig {
  /** 标签文本 */
  text: string;
  /** 标签位置（0-1之间，0表示起点，1表示终点） */
  position: number;
  /** 标签偏移 */
  offset?: Point;
  /** 标签样式 */
  style?: Style;
  /** 是否可编辑 */
  editable?: boolean;
  /** 背景样式 */
  background?: {
    show: boolean;
    padding?: number;
    style?: Style;
  };
}

/**
 * 基础连接线接口
 */
export interface BaseEdge extends Renderable, Selectable, EventEmitter {
  /** 连接线ID */
  id: string;
  /** 连接线类型 */
  type: EdgeType;
  /** 源节点ID */
  source: string;
  /** 目标节点ID */
  target: string;
  /** 源端口ID */
  sourcePort?: string;
  /** 目标端口ID */
  targetPort?: string;
  /** 连接线样式 */
  style: Style;
  /** 连接线状态 */
  status: EdgeStatus;
  /** 起始箭头类型 */
  startArrow: ArrowType;
  /** 结束箭头类型 */
  endArrow: ArrowType;
  /** 标签配置 */
  labels: LabelConfig[];
  /** 是否可见 */
  visible: boolean;
  /** 是否锁定 */
  locked: boolean;
  /** 自定义属性 */
  properties: Record<string, any>;
  
  /** 更新连接线数据 */
  updateData(data: Partial<EdgeData>): void;
  /** 获取连接线数据 */
  getData(): EdgeData;
  /** 计算路径 */
  calculatePath(sourcePoint: Point, targetPoint: Point): EdgePath;
  /** 获取路径上的点 */
  getPointAtPosition(position: number): Point;
  /** 获取路径上点的切线方向 */
  getTangentAtPosition(position: number): Point;
  /** 添加标签 */
  addLabel(label: LabelConfig): void;
  /** 移除标签 */
  removeLabel(index: number): void;
  /** 更新标签 */
  updateLabel(index: number, label: Partial<LabelConfig>): void;
  /** 检测点击 */
  hitTest(point: Point, tolerance?: number): boolean;
  /** 获取最近的点 */
  getClosestPoint(point: Point): Point;
  /** 克隆连接线 */
  clone(): BaseEdge;
  /** 销毁连接线 */
  destroy(): void;
}

/**
 * 直线连接线数据
 */
export interface StraightEdgeData extends EdgeData {
  type: EdgeType.STRAIGHT;
}

/**
 * 贝塞尔曲线连接线数据
 */
export interface BezierEdgeData extends EdgeData {
  type: EdgeType.BEZIER;
  /** 控制点偏移 */
  controlPointOffset?: number;
  /** 自定义控制点 */
  customControlPoints?: Point[];
}

/**
 * 直角连接线数据
 */
export interface OrthogonalEdgeData extends EdgeData {
  type: EdgeType.ORTHOGONAL;
  /** 转折点 */
  waypoints?: Point[];
  /** 最小线段长度 */
  minSegmentLength?: number;
}

/**
 * 平滑曲线连接线数据
 */
export interface SmoothEdgeData extends EdgeData {
  type: EdgeType.SMOOTH;
  /** 平滑度 */
  smoothness?: number;
  /** 张力 */
  tension?: number;
}

/**
 * 自定义路径连接线数据
 */
export interface CustomEdgeData extends EdgeData {
  type: EdgeType.CUSTOM;
  /** 自定义路径 */
  customPath: PathPoint[];
}

/**
 * 条件连接线数据
 */
export interface ConditionalEdgeData extends EdgeData {
  /** 条件配置 */
  condition?: ConditionConfig;
  /** 是否为默认分支 */
  isDefault?: boolean;
  /** 优先级 */
  priority?: number;
}

/**
 * 连接线数据联合类型
 */
export type AnyEdgeData = 
  | StraightEdgeData 
  | BezierEdgeData 
  | OrthogonalEdgeData 
  | SmoothEdgeData 
  | CustomEdgeData;

/**
 * 连接线工厂接口
 */
export interface EdgeFactory {
  /** 创建连接线 */
  createEdge(type: EdgeType, data: Partial<EdgeData>): BaseEdge;
  /** 注册连接线类型 */
  registerEdgeType(type: EdgeType, edgeClass: new (data: EdgeData) => BaseEdge): void;
  /** 获取支持的连接线类型 */
  getSupportedTypes(): EdgeType[];
}

/**
 * 路径计算器接口
 */
export interface PathCalculator {
  /** 计算直线路径 */
  calculateStraightPath(start: Point, end: Point): EdgePath;
  /** 计算贝塞尔曲线路径 */
  calculateBezierPath(start: Point, end: Point, controlPoints: Point[]): EdgePath;
  /** 计算直角路径 */
  calculateOrthogonalPath(start: Point, end: Point, waypoints?: Point[]): EdgePath;
  /** 计算平滑曲线路径 */
  calculateSmoothPath(start: Point, end: Point, tension?: number): EdgePath;
}

/**
 * 箭头渲染器接口
 */
export interface ArrowRenderer {
  /** 渲染箭头 */
  renderArrow(
    ctx: CanvasRenderingContext2D,
    type: ArrowType,
    position: Point,
    direction: Point,
    style: Style
  ): void;
  /** 获取箭头尺寸 */
  getArrowSize(type: ArrowType, style: Style): Size;
}
