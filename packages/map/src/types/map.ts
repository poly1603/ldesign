/**
 * 地图相关类型定义
 * 基于 OpenLayers 的地图插件核心类型
 */

import type { Coordinate } from 'ol/coordinate';
import type { Extent } from 'ol/extent';
import type { ProjectionLike } from 'ol/proj';

/**
 * 地图配置接口
 * 定义地图初始化时的所有配置选项
 */
export interface MapConfig {
  /** 地图容器 DOM 元素或选择器 */
  container: string | HTMLElement;
  
  /** 地图中心点坐标 [经度, 纬度] */
  center?: Coordinate;
  
  /** 地图缩放级别 */
  zoom?: number;
  
  /** 最小缩放级别 */
  minZoom?: number;
  
  /** 最大缩放级别 */
  maxZoom?: number;
  
  /** 地图投影坐标系 */
  projection?: ProjectionLike;
  
  /** 地图旋转角度（弧度） */
  rotation?: number;
  
  /** 地图视图范围限制 */
  extent?: Extent;
  
  /** 是否启用交互控制 */
  interactions?: {
    /** 是否允许拖拽平移 */
    dragPan?: boolean;
    /** 是否允许鼠标滚轮缩放 */
    mouseWheelZoom?: boolean;
    /** 是否允许双击缩放 */
    doubleClickZoom?: boolean;
    /** 是否允许键盘导航 */
    keyboard?: boolean;
    /** 是否允许拖拽旋转 */
    dragRotate?: boolean;
    /** 是否允许拖拽缩放 */
    dragZoom?: boolean;
  };
  
  /** 地图控件配置 */
  controls?: {
    /** 是否显示缩放控件 */
    zoom?: boolean;
    /** 是否显示全屏控件 */
    fullScreen?: boolean;
    /** 是否显示比例尺控件 */
    scaleLine?: boolean;
    /** 是否显示鼠标位置控件 */
    mousePosition?: boolean;
    /** 是否显示旋转控件 */
    rotate?: boolean;
    /** 是否显示归属信息控件 */
    attribution?: boolean;
  };
  
  /** 地图主题 */
  theme?: 'default' | 'dark' | 'light' | string;
  
  /** 自定义样式 */
  style?: MapStyle;
  
  /** 性能配置 */
  performance?: {
    /** 是否启用瓦片缓存 */
    enableTileCache?: boolean;
    /** 缓存大小限制（MB） */
    cacheSize?: number;
    /** 是否启用懒加载 */
    lazyLoad?: boolean;
    /** 视口优化 */
    viewportOptimization?: boolean;
  };
}

/**
 * 地图样式配置
 */
export interface MapStyle {
  /** 地图背景色 */
  backgroundColor?: string;
  
  /** 地图边框样式 */
  border?: {
    width?: number;
    color?: string;
    style?: 'solid' | 'dashed' | 'dotted';
  };
  
  /** 地图圆角 */
  borderRadius?: number;
  
  /** 地图阴影 */
  boxShadow?: string;
  
  /** 自定义 CSS 类名 */
  className?: string;
}

/**
 * 地图视图状态
 */
export interface MapViewState {
  /** 中心点坐标 */
  center: Coordinate;
  
  /** 缩放级别 */
  zoom: number;
  
  /** 旋转角度 */
  rotation: number;
  
  /** 视图范围 */
  extent: Extent;
  
  /** 投影坐标系 */
  projection: string;
}

/**
 * 地图尺寸信息
 */
export interface MapSize {
  /** 宽度（像素） */
  width: number;
  
  /** 高度（像素） */
  height: number;
}

/**
 * 地图操作选项
 */
export interface MapOperationOptions {
  /** 动画持续时间（毫秒） */
  duration?: number;
  
  /** 动画缓动函数 */
  easing?: (t: number) => number;
  
  /** 是否静默执行（不触发事件） */
  silent?: boolean;
}

/**
 * 地图缩放选项
 */
export interface ZoomOptions extends MapOperationOptions {
  /** 缩放中心点 */
  center?: Coordinate;
  
  /** 缩放增量 */
  delta?: number;
}

/**
 * 地图平移选项
 */
export interface PanOptions extends MapOperationOptions {
  /** 平移距离（像素） */
  delta: [number, number];
}

/**
 * 地图适应范围选项
 */
export interface FitOptions extends MapOperationOptions {
  /** 内边距 */
  padding?: [number, number, number, number];
  
  /** 最大缩放级别 */
  maxZoom?: number;
  
  /** 最小缩放级别 */
  minZoom?: number;
}

/**
 * 坐标转换结果
 */
export interface CoordinateTransformResult {
  /** 转换后的坐标 */
  coordinate: Coordinate;
  
  /** 源坐标系 */
  sourceProjection: string;
  
  /** 目标坐标系 */
  targetProjection: string;
}

/**
 * 地图实例接口
 * 定义地图实例必须实现的方法
 */
export interface IMapInstance {
  /** 获取地图配置 */
  getConfig(): MapConfig;
  
  /** 获取地图视图状态 */
  getViewState(): MapViewState;
  
  /** 获取地图尺寸 */
  getSize(): MapSize;
  
  /** 设置地图中心点 */
  setCenter(center: Coordinate, options?: MapOperationOptions): void;
  
  /** 设置地图缩放级别 */
  setZoom(zoom: number, options?: ZoomOptions): void;
  
  /** 缩放到指定范围 */
  fitExtent(extent: Extent, options?: FitOptions): void;
  
  /** 平移地图 */
  pan(delta: [number, number], options?: PanOptions): void;
  
  /** 旋转地图 */
  rotate(rotation: number, options?: MapOperationOptions): void;
  
  /** 刷新地图 */
  refresh(): void;
  
  /** 销毁地图实例 */
  destroy(): void;
}
