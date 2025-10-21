/**
 * 模型相关类型定义
 */

/**
 * 基础模型配置
 */
export interface BaseModelConfig {
  id: string;
  [key: string]: any;
}

/**
 * 节点类型
 */
export enum NodeType {
  START = 'start',
  END = 'end',
  PROCESS = 'process',
  APPROVAL = 'approval',
  CONDITION = 'condition',
  PARALLEL = 'parallel',
  MERGE = 'merge',
}

/**
 * 节点状态
 */
export enum NodeStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
}

/**
 * 位置接口
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * 尺寸接口
 */
export interface Size {
  width: number;
  height: number;
}

/**
 * 节点样式
 */
export interface NodeStyle {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  radius?: number;
  fontSize?: number;
  fontColor?: string;
  fontWeight?: string | number;
  padding?: number;
  [key: string]: any;
}

/**
 * 边样式
 */
export interface EdgeStyle {
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  opacity?: number;
  arrowSize?: number;
  [key: string]: any;
}

/**
 * 节点配置
 */
export interface NodeConfig extends BaseModelConfig {
  type?: NodeType | string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  label?: string;
  status?: NodeStatus;
  style?: NodeStyle;
  data?: Record<string, any>;
}

/**
 * 边配置
 */
export interface EdgeConfig extends BaseModelConfig {
  source: string;
  target: string;
  label?: string;
  style?: EdgeStyle;
  waypoints?: Position[];
  data?: Record<string, any>;
}

/**
 * 模型变更类型
 */
export enum ChangeType {
  ADDED = 'added',
  UPDATED = 'updated',
  REMOVED = 'removed',
}

/**
 * 模型变更事件
 */
export interface ModelChange {
  type: ChangeType;
  model: any;
  previous?: any;
}


