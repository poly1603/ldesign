/**
 * 控件相关类型定义
 */

/**
 * 控件类型枚举
 */
export enum ControlType {
  ZOOM = 'zoom',
  ATTRIBUTION = 'attribution',
  SCALE_LINE = 'scaleLine',
  FULL_SCREEN = 'fullScreen',
  MOUSE_POSITION = 'mousePosition',
  OVERVIEW_MAP = 'overviewMap',
  ROTATE = 'rotate',
  ZOOM_SLIDER = 'zoomSlider',
  ZOOM_TO_EXTENT = 'zoomToExtent'
}

/**
 * 控件位置类型
 */
export type ControlPosition = 
  | 'top-left' 
  | 'top-center' 
  | 'top-right' 
  | 'center-left' 
  | 'center-right' 
  | 'bottom-left' 
  | 'bottom-center' 
  | 'bottom-right';

/**
 * 基础控件配置接口
 */
export interface ControlConfig {
  /** 控件唯一标识 */
  id: string;
  /** 控件类型 */
  type: ControlType;
  /** 控件位置 */
  position?: ControlPosition;
  /** 是否可见 */
  visible?: boolean;
  /** 是否启用 */
  enabled?: boolean;
  /** 自定义样式类名 */
  className?: string;
  /** 目标容器元素 */
  target?: HTMLElement | string;
  /** 控件范围 */
  extent?: number[];
}

/**
 * 缩放控件配置
 */
export interface ZoomControlConfig extends ControlConfig {
  type: ControlType.ZOOM;
  /** 放大按钮标签 */
  zoomInLabel?: string;
  /** 缩小按钮标签 */
  zoomOutLabel?: string;
  /** 放大按钮提示文本 */
  zoomInTipLabel?: string;
  /** 缩小按钮提示文本 */
  zoomOutTipLabel?: string;
  /** 缩放增量 */
  delta?: number;
  /** 动画持续时间 */
  duration?: number;
}

/**
 * 比例尺控件配置
 */
export interface ScaleLineControlConfig extends ControlConfig {
  type: ControlType.SCALE_LINE;
  /** 单位类型 */
  units?: 'degrees' | 'imperial' | 'nautical' | 'metric' | 'us';
  /** 是否显示条形图 */
  bar?: boolean;
  /** 步数 */
  steps?: number;
  /** 是否显示文本 */
  text?: boolean;
  /** 最小宽度 */
  minWidth?: number;
}

/**
 * 鼠标位置控件配置
 */
export interface MousePositionControlConfig extends ControlConfig {
  type: ControlType.MOUSE_POSITION;
  /** 坐标格式化函数 */
  coordinateFormat?: (coordinate?: number[]) => string;
  /** 投影坐标系 */
  projection?: string;
  /** 未定义时显示的HTML */
  undefinedHTML?: string;
}

/**
 * 鹰眼图控件配置
 */
export interface OverviewMapControlConfig extends ControlConfig {
  type: ControlType.OVERVIEW_MAP;
  /** 是否折叠 */
  collapsed?: boolean;
  /** 是否可折叠 */
  collapsible?: boolean;
  /** 展开标签 */
  label?: string;
  /** 折叠标签 */
  collapseLabel?: string;
  /** 提示文本 */
  tipLabel?: string;
}

/**
 * 全屏控件配置
 */
export interface FullScreenControlConfig extends ControlConfig {
  type: ControlType.FULL_SCREEN;
  /** 全屏按钮标签 */
  label?: string;
  /** 退出全屏按钮标签 */
  labelActive?: string;
  /** 提示文本 */
  tipLabel?: string;
  /** 是否启用键盘快捷键 */
  keys?: boolean;
  /** 全屏元素 */
  source?: HTMLElement | string;
}

/**
 * 控件状态接口
 */
export interface ControlState {
  /** 控件ID */
  id: string;
  /** 是否可见 */
  visible: boolean;
  /** 是否启用 */
  enabled: boolean;
  /** 控件位置 */
  position: ControlPosition;
}

/**
 * 控件操作选项
 */
export interface ControlOperationOptions {
  /** 是否使用动画 */
  animated?: boolean;
  /** 动画持续时间 */
  duration?: number;
  /** 操作完成回调 */
  onComplete?: () => void;
  /** 操作失败回调 */
  onError?: (error: Error) => void;
}

/**
 * 控件管理器接口
 */
export interface IControlManager {
  /**
   * 添加控件
   * @param config 控件配置
   * @returns 控件ID
   */
  addControl(config: ControlConfig): string;

  /**
   * 移除控件
   * @param id 控件ID
   * @returns 是否移除成功
   */
  removeControl(id: string): boolean;

  /**
   * 获取控件配置
   * @param id 控件ID
   * @returns 控件配置或null
   */
  getControl(id: string): ControlConfig | null;

  /**
   * 获取所有控件配置
   * @returns 控件配置数组
   */
  getAllControls(): ControlConfig[];

  /**
   * 显示控件
   * @param id 控件ID
   * @param options 操作选项
   */
  showControl(id: string, options?: ControlOperationOptions): void;

  /**
   * 隐藏控件
   * @param id 控件ID
   * @param options 操作选项
   */
  hideControl(id: string, options?: ControlOperationOptions): void;

  /**
   * 启用控件
   * @param id 控件ID
   * @param options 操作选项
   */
  enableControl(id: string, options?: ControlOperationOptions): void;

  /**
   * 禁用控件
   * @param id 控件ID
   * @param options 操作选项
   */
  disableControl(id: string, options?: ControlOperationOptions): void;

  /**
   * 获取控件状态
   * @param id 控件ID
   * @returns 控件状态或null
   */
  getControlState(id: string): ControlState | null;

  /**
   * 更新控件配置
   * @param id 控件ID
   * @param config 部分控件配置
   * @returns 是否更新成功
   */
  updateControl(id: string, config: Partial<ControlConfig>): boolean;

  /**
   * 清空所有控件
   */
  clearControls(): void;

  /**
   * 添加默认控件集合
   */
  addDefaultControls(): void;
}
