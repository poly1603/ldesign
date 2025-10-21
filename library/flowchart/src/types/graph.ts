/**
 * 图相关类型定义
 */

import { NodeModel } from '../core/model/Node';
import { EdgeModel } from '../core/model/Edge';

/**
 * 图配置接口
 */
export interface GraphConfig {
  /** 容器元素或选择器 */
  container: HTMLElement | string;
  /** 画布宽度 */
  width?: number;
  /** 画布高度 */
  height?: number;
  /** 是否启用网格 */
  grid?: boolean | GridConfig;
  /** 背景配置 */
  background?: BackgroundConfig;
  /** 是否启用自动布局 */
  autoLayout?: boolean;
  /** 节点间距 */
  nodeGap?: number;
  /** 层级间距 */
  levelGap?: number;
}

/**
 * 网格配置
 */
export interface GridConfig {
  size?: number;
  color?: string;
  thickness?: number;
  type?: 'dot' | 'line';
}

/**
 * 背景配置
 */
export interface BackgroundConfig {
  color?: string;
  image?: string;
  repeat?: 'repeat' | 'no-repeat';
  position?: string;
  size?: string;
}

/**
 * 图事件类型
 */
export enum GraphEvent {
  // 节点事件
  NODE_ADDED = 'node:added',
  NODE_REMOVED = 'node:removed',
  NODE_UPDATED = 'node:updated',
  NODE_SELECTED = 'node:selected',
  NODE_UNSELECTED = 'node:unselected',
  NODE_CLICK = 'node:click',
  NODE_DBLCLICK = 'node:dblclick',
  NODE_CONTEXTMENU = 'node:contextmenu',
  NODE_MOUSEENTER = 'node:mouseenter',
  NODE_MOUSELEAVE = 'node:mouseleave',

  // 边事件
  EDGE_ADDED = 'edge:added',
  EDGE_REMOVED = 'edge:removed',
  EDGE_UPDATED = 'edge:updated',
  EDGE_SELECTED = 'edge:selected',
  EDGE_UNSELECTED = 'edge:unselected',
  EDGE_CLICK = 'edge:click',
  EDGE_DBLCLICK = 'edge:dblclick',
  EDGE_CONTEXTMENU = 'edge:contextmenu',

  // 画布事件
  CANVAS_CLICK = 'canvas:click',
  CANVAS_DBLCLICK = 'canvas:dblclick',
  CANVAS_CONTEXTMENU = 'canvas:contextmenu',

  // 视图事件
  VIEWPORT_CHANGE = 'viewport:change',
  ZOOM_CHANGE = 'zoom:change',

  // 渲染事件
  RENDER_START = 'render:start',
  RENDER_END = 'render:end',

  // 历史事件
  HISTORY_CHANGE = 'history:change',

  // 生命周期事件
  GRAPH_READY = 'graph:ready',
  GRAPH_DESTROY = 'graph:destroy',
}

/**
 * 事件处理器类型
 */
export type EventHandler<T = any> = (event: T) => void;

/**
 * 图数据接口
 */
export interface GraphData {
  nodes: Array<{
    id: string;
    type?: string;
    x?: number;
    y?: number;
    [key: string]: any;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    [key: string]: any;
  }>;
}


