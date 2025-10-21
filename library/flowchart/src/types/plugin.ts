/**
 * 插件相关类型定义
 */

import { Graph } from '../core/Graph';

/**
 * 插件接口
 */
export interface Plugin {
  /** 插件名称 */
  name: string;

  /** 插件安装方法 */
  install(graph: Graph): void;

  /** 插件卸载方法 */
  uninstall?(graph: Graph): void;

  /** 插件配置 */
  config?: Record<string, any>;
}

/**
 * 插件配置
 */
export interface PluginConfig {
  [key: string]: any;
}

/**
 * 行为插件配置
 */
export interface BehaviorConfig extends PluginConfig {
  enabled?: boolean;
}

/**
 * 布局插件配置
 */
export interface LayoutConfig extends PluginConfig {
  type?: 'dagre' | 'force' | 'grid' | 'manual';
  direction?: 'TB' | 'BT' | 'LR' | 'RL';
  nodeGap?: number;
  levelGap?: number;
  align?: 'UL' | 'UR' | 'DL' | 'DR';
}

/**
 * 历史插件配置
 */
export interface HistoryConfig extends PluginConfig {
  maxStack?: number;
  ignoreAdd?: boolean;
  ignoreRemove?: boolean;
  ignoreUpdate?: boolean;
}


