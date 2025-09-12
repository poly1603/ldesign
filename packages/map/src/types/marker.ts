/**
 * 标记和弹窗相关类型定义
 * 定义地图标记点、弹窗、信息窗口等相关类型
 */

import type { Coordinate } from 'ol/coordinate';
import type { StyleLike } from 'ol/style/Style';

/**
 * 标记点配置接口
 */
export interface MarkerConfig {
  /** 标记唯一标识 */
  id: string;
  
  /** 标记坐标 */
  coordinate: Coordinate;
  
  /** 标记标题 */
  title?: string;
  
  /** 标记描述 */
  description?: string;
  
  /** 标记图标配置 */
  icon?: MarkerIcon;
  
  /** 标记样式 */
  style?: StyleLike;
  
  /** 是否可拖拽 */
  draggable?: boolean;
  
  /** 是否可点击 */
  clickable?: boolean;
  
  /** 标记层级 */
  zIndex?: number;
  
  /** 标记透明度 */
  opacity?: number;
  
  /** 标记旋转角度 */
  rotation?: number;
  
  /** 标记缩放比例 */
  scale?: number;
  
  /** 弹窗配置 */
  popup?: PopupConfig;
  
  /** 自定义属性 */
  properties?: Record<string, any>;
  
  /** 标记分组 */
  group?: string;
  
  /** 标记标签 */
  tags?: string[];
}

/**
 * 标记图标配置
 */
export interface MarkerIcon {
  /** 图标 URL 或 base64 */
  src: string;
  
  /** 图标尺寸 [宽度, 高度] */
  size?: [number, number];
  
  /** 图标锚点 [x, y] (相对于图标左上角的偏移) */
  anchor?: [number, number];
  
  /** 图标偏移 [x, y] */
  offset?: [number, number];
  
  /** 图标颜色（用于 SVG 图标） */
  color?: string;
  
  /** 图标背景色 */
  backgroundColor?: string;
  
  /** 图标边框 */
  border?: {
    width?: number;
    color?: string;
    style?: 'solid' | 'dashed' | 'dotted';
  };
  
  /** 图标阴影 */
  shadow?: {
    src?: string;
    size?: [number, number];
    anchor?: [number, number];
  };
}

/**
 * 弹窗配置接口
 */
export interface PopupConfig {
  /** 弹窗唯一标识 */
  id?: string;
  
  /** 弹窗内容 */
  content: string | HTMLElement;
  
  /** 弹窗标题 */
  title?: string;
  
  /** 弹窗位置偏移 [x, y] */
  offset?: [number, number];
  
  /** 弹窗定位方式 */
  positioning?: 'bottom-left' | 'bottom-center' | 'bottom-right' | 
                'center-left' | 'center-center' | 'center-right' |
                'top-left' | 'top-center' | 'top-right';
  
  /** 弹窗最大宽度 */
  maxWidth?: number;
  
  /** 弹窗最大高度 */
  maxHeight?: number;
  
  /** 是否显示关闭按钮 */
  closable?: boolean;
  
  /** 是否自动关闭 */
  autoClose?: boolean;
  
  /** 自动关闭延迟时间（毫秒） */
  autoCloseDelay?: number;
  
  /** 弹窗样式类名 */
  className?: string;
  
  /** 弹窗自定义样式 */
  style?: Record<string, string>;
  
  /** 弹窗动画 */
  animation?: {
    /** 显示动画 */
    show?: 'fade' | 'slide' | 'zoom' | 'bounce';
    /** 隐藏动画 */
    hide?: 'fade' | 'slide' | 'zoom' | 'bounce';
    /** 动画持续时间 */
    duration?: number;
  };
}

/**
 * 信息窗口配置
 */
export interface InfoWindowConfig extends PopupConfig {
  /** 信息窗口类型 */
  type?: 'tooltip' | 'infobox' | 'modal';
  
  /** 是否显示箭头 */
  showArrow?: boolean;
  
  /** 箭头大小 */
  arrowSize?: number;
  
  /** 背景色 */
  backgroundColor?: string;
  
  /** 边框配置 */
  border?: {
    width?: number;
    color?: string;
    radius?: number;
  };
  
  /** 阴影配置 */
  shadow?: boolean | string;
}

/**
 * 标记聚类配置
 */
export interface MarkerClusterConfig {
  /** 是否启用聚类 */
  enabled: boolean;
  
  /** 聚类距离（像素） */
  distance?: number;
  
  /** 最小聚类数量 */
  minDistance?: number;
  
  /** 聚类样式 */
  style?: {
    /** 聚类圆圈颜色 */
    fillColor?: string;
    /** 聚类边框颜色 */
    strokeColor?: string;
    /** 聚类边框宽度 */
    strokeWidth?: number;
    /** 聚类圆圈半径 */
    radius?: number;
    /** 文字颜色 */
    textColor?: string;
    /** 文字大小 */
    textSize?: number;
  };
  
  /** 聚类图标配置 */
  icon?: MarkerIcon;
  
  /** 聚类数量显示格式化函数 */
  textFormatter?: (count: number) => string;
}

/**
 * 标记状态
 */
export interface MarkerState {
  /** 标记 ID */
  id: string;
  
  /** 是否可见 */
  visible: boolean;
  
  /** 是否选中 */
  selected: boolean;
  
  /** 是否悬停 */
  hovered: boolean;
  
  /** 是否正在拖拽 */
  dragging: boolean;
  
  /** 当前坐标 */
  coordinate: Coordinate;
  
  /** 弹窗是否打开 */
  popupOpen: boolean;
}

/**
 * 标记操作选项
 */
export interface MarkerOperationOptions {
  /** 是否静默执行 */
  silent?: boolean;
  
  /** 动画持续时间 */
  duration?: number;
  
  /** 动画缓动函数 */
  easing?: (t: number) => number;
}

/**
 * 标记事件数据
 */
export interface MarkerEventData {
  /** 标记 ID */
  markerId: string;
  
  /** 标记配置 */
  marker: MarkerConfig;
  
  /** 事件坐标 */
  coordinate: Coordinate;
  
  /** 像素坐标 */
  pixel: [number, number];
  
  /** 原始事件对象 */
  originalEvent: Event;
}

/**
 * 标记管理器接口
 */
export interface IMarkerManager {
  /** 添加标记 */
  addMarker(config: MarkerConfig): string;
  
  /** 批量添加标记 */
  addMarkers(configs: MarkerConfig[]): string[];
  
  /** 移除标记 */
  removeMarker(id: string): boolean;
  
  /** 批量移除标记 */
  removeMarkers(ids: string[]): boolean;
  
  /** 获取标记 */
  getMarker(id: string): MarkerConfig | null;
  
  /** 获取所有标记 */
  getAllMarkers(): MarkerConfig[];
  
  /** 根据条件查找标记 */
  findMarkers(predicate: (marker: MarkerConfig) => boolean): MarkerConfig[];
  
  /** 显示标记 */
  showMarker(id: string, options?: MarkerOperationOptions): void;
  
  /** 隐藏标记 */
  hideMarker(id: string, options?: MarkerOperationOptions): void;
  
  /** 更新标记 */
  updateMarker(id: string, config: Partial<MarkerConfig>): boolean;
  
  /** 移动标记 */
  moveMarker(id: string, coordinate: Coordinate, options?: MarkerOperationOptions): void;
  
  /** 获取标记状态 */
  getMarkerState(id: string): MarkerState | null;
  
  /** 选择标记 */
  selectMarker(id: string): void;
  
  /** 取消选择标记 */
  deselectMarker(id: string): void;
  
  /** 清空所有标记 */
  clearMarkers(): void;
  
  /** 设置聚类配置 */
  setClusterConfig(config: MarkerClusterConfig): void;
  
  /** 获取聚类配置 */
  getClusterConfig(): MarkerClusterConfig;
  
  /** 打开弹窗 */
  openPopup(markerId: string, config?: PopupConfig): void;
  
  /** 关闭弹窗 */
  closePopup(markerId: string): void;
  
  /** 关闭所有弹窗 */
  closeAllPopups(): void;
}
