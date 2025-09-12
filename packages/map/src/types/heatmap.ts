/**
 * 热力图相关类型定义
 * 支持多种数据源和可视化样式的热力图功能
 */

import type { Coordinate } from 'ol/coordinate';

/**
 * 热力图配置选项
 */
export interface HeatmapOptions {
  /** 热力图唯一标识 */
  id?: string;
  /** 热力图名称 */
  name?: string;
  /** 热力图数据 */
  data: HeatmapDataPoint[];
  /** 热力图样式配置 */
  style?: HeatmapStyle;
  /** 是否可见 */
  visible?: boolean;
  /** 图层层级 */
  zIndex?: number;
  /** 数据更新模式 */
  updateMode?: HeatmapUpdateMode;
  /** 动画配置 */
  animation?: HeatmapAnimationOptions;
}

/**
 * 热力图数据点
 */
export interface HeatmapDataPoint {
  /** 经度 */
  lng: number;
  /** 纬度 */
  lat: number;
  /** 权重值 */
  weight?: number;
  /** 数据值 */
  value?: number;
  /** 时间戳 */
  timestamp?: Date;
  /** 自定义属性 */
  properties?: Record<string, any>;
}

/**
 * 热力图样式配置
 */
export interface HeatmapStyle {
  /** 热力图半径（像素） */
  radius?: number;
  /** 模糊程度 */
  blur?: number;
  /** 强度系数 */
  intensity?: number;
  /** 最大透明度 */
  maxOpacity?: number;
  /** 最小透明度 */
  minOpacity?: number;
  /** 颜色渐变配置 */
  gradient?: HeatmapGradient;
  /** 权重属性名 */
  weightProperty?: string;
  /** 最大权重值 */
  maxWeight?: number;
  /** 最小权重值 */
  minWeight?: number;
  /** 是否使用对数缩放 */
  useLogScale?: boolean;
}

/**
 * 热力图颜色渐变
 */
export interface HeatmapGradient {
  /** 渐变色彩映射 */
  colors: Record<number, string>;
  /** 渐变步数 */
  steps?: number;
  /** 颜色插值模式 */
  interpolation?: HeatmapInterpolation;
}

/**
 * 热力图颜色插值模式
 */
export enum HeatmapInterpolation {
  /** 线性插值 */
  LINEAR = 'linear',
  /** 指数插值 */
  EXPONENTIAL = 'exponential',
  /** 对数插值 */
  LOGARITHMIC = 'logarithmic',
  /** 分段插值 */
  CATEGORICAL = 'categorical'
}

/**
 * 热力图更新模式
 */
export enum HeatmapUpdateMode {
  /** 替换模式 */
  REPLACE = 'replace',
  /** 追加模式 */
  APPEND = 'append',
  /** 增量模式 */
  INCREMENTAL = 'incremental',
  /** 实时模式 */
  REALTIME = 'realtime'
}

/**
 * 热力图动画配置
 */
export interface HeatmapAnimationOptions {
  /** 是否启用动画 */
  enabled?: boolean;
  /** 动画类型 */
  type?: HeatmapAnimationType;
  /** 动画持续时间（毫秒） */
  duration?: number;
  /** 动画延迟（毫秒） */
  delay?: number;
  /** 动画缓动函数 */
  easing?: string;
  /** 是否循环播放 */
  loop?: boolean;
  /** 时间窗口大小（毫秒） */
  timeWindow?: number;
  /** 播放速度倍数 */
  playbackSpeed?: number;
}

/**
 * 热力图动画类型
 */
export enum HeatmapAnimationType {
  /** 淡入淡出 */
  FADE = 'fade',
  /** 缩放 */
  SCALE = 'scale',
  /** 时间轴播放 */
  TIMELINE = 'timeline',
  /** 脉冲效果 */
  PULSE = 'pulse',
  /** 波纹效果 */
  RIPPLE = 'ripple'
}

/**
 * 热力图信息
 */
export interface HeatmapInfo {
  /** 热力图唯一标识 */
  id: string;
  /** 热力图名称 */
  name: string;
  /** 数据点数量 */
  dataPointCount: number;
  /** 数据边界框 */
  bounds: [number, number, number, number];
  /** 最大权重值 */
  maxWeight: number;
  /** 最小权重值 */
  minWeight: number;
  /** 平均权重值 */
  averageWeight: number;
  /** 热力图样式 */
  style: HeatmapStyle;
  /** 是否可见 */
  visible: boolean;
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
  /** 数据统计信息 */
  statistics: HeatmapStatistics;
}

/**
 * 热力图统计信息
 */
export interface HeatmapStatistics {
  /** 总数据点数 */
  totalPoints: number;
  /** 权重分布 */
  weightDistribution: {
    /** 权重区间 */
    range: [number, number];
    /** 该区间内的点数 */
    count: number;
    /** 百分比 */
    percentage: number;
  }[];
  /** 空间分布密度 */
  spatialDensity: number;
  /** 时间分布（如果有时间戳） */
  temporalDistribution?: {
    /** 时间区间 */
    timeRange: [Date, Date];
    /** 该时间段内的点数 */
    count: number;
  }[];
  /** 热点区域 */
  hotspots: HeatmapHotspot[];
}

/**
 * 热力图热点区域
 */
export interface HeatmapHotspot {
  /** 热点中心坐标 */
  center: Coordinate;
  /** 热点半径（米） */
  radius: number;
  /** 热点强度 */
  intensity: number;
  /** 热点内的数据点数 */
  pointCount: number;
  /** 热点权重总和 */
  totalWeight: number;
}

/**
 * 热力图查询选项
 */
export interface HeatmapQueryOptions {
  /** 查询区域边界 */
  bounds?: [number, number, number, number];
  /** 最小权重阈值 */
  minWeight?: number;
  /** 最大权重阈值 */
  maxWeight?: number;
  /** 时间范围 */
  timeRange?: [Date, Date];
  /** 查询半径（米） */
  radius?: number;
  /** 查询中心点 */
  center?: Coordinate;
  /** 返回结果数量限制 */
  limit?: number;
}

/**
 * 热力图导出选项
 */
export interface HeatmapExportOptions {
  /** 导出格式 */
  format: HeatmapExportFormat;
  /** 导出分辨率 */
  resolution?: [number, number];
  /** 导出边界 */
  bounds?: [number, number, number, number];
  /** 是否包含图例 */
  includeLegend?: boolean;
  /** 图例位置 */
  legendPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** 背景颜色 */
  backgroundColor?: string;
  /** 文件名 */
  filename?: string;
}

/**
 * 热力图导出格式
 */
export enum HeatmapExportFormat {
  /** PNG图片 */
  PNG = 'png',
  /** JPEG图片 */
  JPEG = 'jpeg',
  /** SVG矢量图 */
  SVG = 'svg',
  /** GeoJSON数据 */
  GEOJSON = 'geojson',
  /** CSV数据 */
  CSV = 'csv',
  /** KML数据 */
  KML = 'kml'
}

/**
 * 热力图事件类型
 */
export enum HeatmapEventType {
  /** 热力图创建 */
  CREATED = 'created',
  /** 热力图删除 */
  DELETED = 'deleted',
  /** 热力图更新 */
  UPDATED = 'updated',
  /** 数据加载完成 */
  DATA_LOADED = 'data-loaded',
  /** 样式改变 */
  STYLE_CHANGED = 'style-changed',
  /** 可见性改变 */
  VISIBILITY_CHANGED = 'visibility-changed',
  /** 动画开始 */
  ANIMATION_STARTED = 'animation-started',
  /** 动画结束 */
  ANIMATION_ENDED = 'animation-ended',
  /** 热点点击 */
  HOTSPOT_CLICKED = 'hotspot-clicked',
  /** 热点悬停 */
  HOTSPOT_HOVERED = 'hotspot-hovered'
}

/**
 * 热力图事件数据
 */
export interface HeatmapEventData {
  /** 事件类型 */
  type: HeatmapEventType;
  /** 热力图信息 */
  heatmap: HeatmapInfo;
  /** 事件位置（如果适用） */
  position?: Coordinate;
  /** 热点信息（如果适用） */
  hotspot?: HeatmapHotspot;
  /** 事件时间戳 */
  timestamp: Date;
  /** 额外数据 */
  data?: any;
}

/**
 * 热力图管理器接口
 */
export interface IHeatmapManager {
  /** 添加热力图 */
  addHeatmap(options: HeatmapOptions): string;
  /** 删除热力图 */
  removeHeatmap(heatmapId: string): void;
  /** 获取热力图信息 */
  getHeatmap(heatmapId: string): HeatmapInfo | null;
  /** 获取所有热力图 */
  getAllHeatmaps(): HeatmapInfo[];
  /** 更新热力图数据 */
  updateHeatmapData(heatmapId: string, data: HeatmapDataPoint[], mode?: HeatmapUpdateMode): void;
  /** 更新热力图样式 */
  updateHeatmapStyle(heatmapId: string, style: Partial<HeatmapStyle>): void;
  /** 设置热力图可见性 */
  setHeatmapVisible(heatmapId: string, visible: boolean): void;
  /** 清除所有热力图 */
  clearHeatmaps(): void;
  /** 查询热力图数据 */
  queryHeatmapData(heatmapId: string, options: HeatmapQueryOptions): HeatmapDataPoint[];
  /** 获取热点区域 */
  getHotspots(heatmapId: string, threshold?: number): HeatmapHotspot[];
  /** 播放热力图动画 */
  playAnimation(heatmapId: string): void;
  /** 暂停热力图动画 */
  pauseAnimation(heatmapId: string): void;
  /** 停止热力图动画 */
  stopAnimation(heatmapId: string): void;
  /** 导出热力图 */
  exportHeatmap(heatmapId: string, options: HeatmapExportOptions): Promise<Blob>;
  /** 监听热力图事件 */
  on(eventType: HeatmapEventType, callback: (data: HeatmapEventData) => void): void;
  /** 移除事件监听 */
  off(eventType: HeatmapEventType, callback: (data: HeatmapEventData) => void): void;
}
