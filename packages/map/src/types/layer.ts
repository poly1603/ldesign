/**
 * 图层相关类型定义
 * 定义各种图层类型和配置选项
 */

import type { Extent } from 'ol/extent';
import type { ProjectionLike } from 'ol/proj';
import type { StyleLike } from 'ol/style/Style';

/**
 * 图层类型枚举
 */
export enum LayerType {
  /** 瓦片图层 */
  TILE = 'tile',
  /** 矢量图层 */
  VECTOR = 'vector',
  /** 图像图层 */
  IMAGE = 'image',
  /** 热力图图层 */
  HEATMAP = 'heatmap',
  /** 聚类图层 */
  CLUSTER = 'cluster',
  /** WMS 图层 */
  WMS = 'wms',
  /** WMTS 图层 */
  WMTS = 'wmts',
  /** XYZ 瓦片图层 */
  XYZ = 'xyz',
  /** OSM 图层 */
  OSM = 'osm'
}

/**
 * 图层基础配置接口
 */
export interface BaseLayerConfig {
  /** 图层唯一标识 */
  id: string;
  
  /** 图层名称 */
  name: string;
  
  /** 图层类型 */
  type: LayerType;
  
  /** 图层是否可见 */
  visible?: boolean;
  
  /** 图层透明度 (0-1) */
  opacity?: number;
  
  /** 图层层级 */
  zIndex?: number;
  
  /** 图层范围限制 */
  extent?: Extent;
  
  /** 最小缩放级别 */
  minZoom?: number;
  
  /** 最大缩放级别 */
  maxZoom?: number;
  
  /** 图层描述 */
  description?: string;
  
  /** 自定义属性 */
  properties?: Record<string, any>;
}

/**
 * 瓦片图层配置
 */
export interface TileLayerConfig extends BaseLayerConfig {
  type: LayerType.TILE | LayerType.XYZ | LayerType.OSM;
  
  /** 瓦片服务 URL */
  url?: string;
  
  /** 瓦片服务 URL 数组（用于负载均衡） */
  urls?: string[];
  
  /** 瓦片大小 */
  tileSize?: [number, number];
  
  /** 瓦片网格原点 */
  origin?: [number, number];
  
  /** 瓦片投影坐标系 */
  projection?: ProjectionLike;
  
  /** 瓦片缓存配置 */
  cache?: {
    /** 是否启用缓存 */
    enabled?: boolean;
    /** 缓存大小限制 */
    maxSize?: number;
    /** 缓存过期时间（毫秒） */
    expireTime?: number;
  };
  
  /** 跨域配置 */
  crossOrigin?: string;
  
  /** 请求头 */
  headers?: Record<string, string>;
}

/**
 * WMS 图层配置
 */
export interface WMSLayerConfig extends BaseLayerConfig {
  type: LayerType.WMS;
  
  /** WMS 服务 URL */
  url: string;
  
  /** WMS 图层名称 */
  layers: string;
  
  /** WMS 版本 */
  version?: string;
  
  /** 图像格式 */
  format?: string;
  
  /** 是否透明 */
  transparent?: boolean;
  
  /** 背景色 */
  bgcolor?: string;
  
  /** 自定义参数 */
  params?: Record<string, any>;
}

/**
 * WMTS 图层配置
 */
export interface WMTSLayerConfig extends BaseLayerConfig {
  type: LayerType.WMTS;
  
  /** WMTS 服务 URL */
  url: string;
  
  /** 图层标识 */
  layer: string;
  
  /** 瓦片矩阵集 */
  matrixSet: string;
  
  /** 图像格式 */
  format?: string;
  
  /** 样式 */
  style?: string;
  
  /** 瓦片网格 */
  tileGrid?: {
    /** 原点 */
    origin: [number, number];
    /** 分辨率数组 */
    resolutions: number[];
    /** 瓦片矩阵标识数组 */
    matrixIds: string[];
  };
}

/**
 * 矢量图层配置
 */
export interface VectorLayerConfig extends BaseLayerConfig {
  type: LayerType.VECTOR;
  
  /** 数据源 */
  source?: {
    /** 数据类型 */
    type: 'geojson' | 'kml' | 'gpx' | 'wkt' | 'features';
    /** 数据 URL 或内容 */
    data?: string | object;
    /** 数据 URL */
    url?: string;
    /** 数据格式选项 */
    format?: Record<string, any>;
  };
  
  /** 图层样式 */
  style?: StyleLike;
  
  /** 是否可编辑 */
  editable?: boolean;
  
  /** 是否可选择 */
  selectable?: boolean;
  
  /** 聚类配置 */
  cluster?: {
    /** 是否启用聚类 */
    enabled: boolean;
    /** 聚类距离 */
    distance?: number;
    /** 最小聚类数量 */
    minDistance?: number;
  };
}

/**
 * 热力图图层配置
 */
export interface HeatmapLayerConfig extends BaseLayerConfig {
  type: LayerType.HEATMAP;
  
  /** 热力图数据 */
  data: Array<{
    /** 坐标 */
    coordinate: [number, number];
    /** 权重值 */
    weight?: number;
  }>;
  
  /** 模糊半径 */
  blur?: number;
  
  /** 影响半径 */
  radius?: number;
  
  /** 颜色渐变 */
  gradient?: string[];
  
  /** 权重属性名 */
  weightProperty?: string;
}

/**
 * 图像图层配置
 */
export interface ImageLayerConfig extends BaseLayerConfig {
  type: LayerType.IMAGE;
  
  /** 图像 URL */
  url: string;
  
  /** 图像范围 */
  imageExtent: Extent;
  
  /** 图像投影 */
  projection?: ProjectionLike;
  
  /** 跨域配置 */
  crossOrigin?: string;
}

/**
 * 图层配置联合类型
 */
export type LayerConfig = 
  | TileLayerConfig 
  | WMSLayerConfig 
  | WMTSLayerConfig 
  | VectorLayerConfig 
  | HeatmapLayerConfig 
  | ImageLayerConfig;

/**
 * 图层状态
 */
export interface LayerState {
  /** 图层 ID */
  id: string;
  
  /** 是否可见 */
  visible: boolean;
  
  /** 透明度 */
  opacity: number;
  
  /** 层级 */
  zIndex: number;
  
  /** 是否正在加载 */
  loading: boolean;
  
  /** 加载进度 (0-1) */
  progress: number;
  
  /** 错误信息 */
  error?: string;
}

/**
 * 图层操作选项
 */
export interface LayerOperationOptions {
  /** 是否静默执行 */
  silent?: boolean;
  
  /** 动画持续时间 */
  duration?: number;
}

/**
 * 图层管理器接口
 */
export interface ILayerManager {
  /** 添加图层 */
  addLayer(config: LayerConfig): Promise<string>;
  
  /** 移除图层 */
  removeLayer(id: string): boolean;
  
  /** 获取图层 */
  getLayer(id: string): LayerConfig | null;
  
  /** 获取所有图层 */
  getAllLayers(): LayerConfig[];
  
  /** 显示图层 */
  showLayer(id: string, options?: LayerOperationOptions): void;
  
  /** 隐藏图层 */
  hideLayer(id: string, options?: LayerOperationOptions): void;
  
  /** 设置图层透明度 */
  setLayerOpacity(id: string, opacity: number, options?: LayerOperationOptions): void;
  
  /** 设置图层层级 */
  setLayerZIndex(id: string, zIndex: number): void;
  
  /** 移动图层到顶部 */
  moveLayerToTop(id: string): void;
  
  /** 移动图层到底部 */
  moveLayerToBottom(id: string): void;
  
  /** 获取图层状态 */
  getLayerState(id: string): LayerState | null;
  
  /** 清空所有图层 */
  clearLayers(): void;
}
