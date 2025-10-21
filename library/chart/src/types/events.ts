/**
 * 事件相关类型定义
 */

/**
 * 图表事件类型
 */
export type ChartEventType =
  // 鼠标事件
  | 'click'
  | 'dblclick'
  | 'mousedown'
  | 'mousemove'
  | 'mouseup'
  | 'mouseover'
  | 'mouseout'
  | 'globalout'
  | 'contextmenu'
  // 图表行为事件
  | 'legendselectchanged'
  | 'legendselected'
  | 'legendunselected'
  | 'datazoom'
  | 'datarangeselected'
  | 'timelinechanged'
  | 'timelineplaychanged'
  | 'restore'
  | 'dataviewchanged'
  | 'magictypechanged'
  | 'geoselectchanged'
  | 'geoselected'
  | 'geounselected'
  | 'pieselectchanged'
  | 'pieselected'
  | 'pieunselected'
  | 'mapselectchanged'
  | 'mapselected'
  | 'mapunselected'
  | 'axisareaselected'
  | 'focusnodeadjacency'
  | 'unfocusnodeadjacency'
  | 'brush'
  | 'brushEnd'
  | 'brushselected'
  | 'globalcursortaken'
  | 'rendered'
  | 'finished';

/**
 * 事件参数
 */
export interface ChartEvent {
  /** 事件类型 */
  type: ChartEventType;
  /** 事件数据 */
  data?: any;
  /** 数据索引 */
  dataIndex?: number;
  /** 系列索引 */
  seriesIndex?: number;
  /** 系列名称 */
  seriesName?: string;
  /** 系列类型 */
  seriesType?: string;
  /** 组件类型 */
  componentType?: string;
  /** 组件索引 */
  componentIndex?: number;
  /** 原生事件 */
  event?: Event;
}

/**
 * 事件处理器
 */
export type ChartEventHandler = (event: ChartEvent) => void;

/**
 * 生命周期事件
 */
export interface LifecycleEvents {
  /** 图表初始化前 */
  beforeInit?: () => void;
  /** 图表初始化后 */
  afterInit?: () => void;
  /** 数据更新前 */
  beforeUpdate?: (data: any) => void;
  /** 数据更新后 */
  afterUpdate?: (data: any) => void;
  /** 图表销毁前 */
  beforeDispose?: () => void;
  /** 图表销毁后 */
  afterDispose?: () => void;
  /** 错误处理 */
  onError?: (error: Error) => void;
}

