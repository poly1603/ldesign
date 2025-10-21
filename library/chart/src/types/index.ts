/**
 * 图表插件类型定义
 */

import type * as echarts from 'echarts/types/dist/echarts';

// ============ 导出 ECharts 类型 ============
export type EChartsOption = echarts.EChartsOption;
export type EChartsInstance = echarts.ECharts;

// ============ 简化数据格式 ============

/**
 * 最简单：纯数字数组
 */
export type SimpleArray = number[];

/**
 * 对象数组格式
 */
export type ObjectArray = Array<Record<string, any>>;

/**
 * 数据集配置
 */
export interface Dataset {
  /** 系列名称 */
  name?: string;
  /** 数据 */
  data: number[] | any[];
  /** 系列类型（用于混合图表） */
  type?: ChartType;
  /** 颜色 */
  color?: string;
  /** 堆叠分组 */
  stack?: string;
  /** 平滑曲线（仅折线图） */
  smooth?: boolean;
  /** 其他 ECharts 系列配置 */
  [key: string]: any;
}

/**
 * 标准格式：带标签和系列
 */
export interface SimpleChartData {
  /** 横坐标标签 */
  labels?: string[] | number[];
  /** 数据集 */
  datasets: Dataset[];
}

/**
 * 图表数据联合类型
 */
export type ChartData = SimpleArray | ObjectArray | SimpleChartData;

// ============ 图表类型 ============

/**
 * 支持的图表类型
 */
export type ChartType =
  // 基础类型
  | 'line'
  | 'bar'
  | 'pie'
  | 'scatter'
  | 'radar'
  | 'effectScatter'
  // 高级类型
  | 'candlestick'
  | 'boxplot'
  | 'heatmap'
  | 'parallel'
  | 'gauge'
  | 'funnel'
  | 'sankey'
  | 'graph'
  | 'tree'
  | 'treemap'
  | 'sunburst'
  | 'map'
  | 'lines'
  | 'pictorialBar'
  | 'themeRiver'
  | 'custom'
  // 混合类型
  | 'mixed';

// ============ 配置选项类型 ============

/**
 * 标题配置
 */
export interface TitleConfig {
  text?: string;
  subtext?: string;
  left?: string | number;
  top?: string | number;
  textStyle?: {
    fontSize?: number;
    color?: string;
    fontWeight?: string | number;
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * 图例配置
 */
export interface LegendConfig {
  show?: boolean;
  orient?: 'horizontal' | 'vertical';
  left?: string | number;
  top?: string | number;
  bottom?: string | number;
  right?: string | number;
  [key: string]: any;
}

/**
 * 提示框配置
 */
export interface TooltipConfig {
  show?: boolean;
  trigger?: 'item' | 'axis' | 'none';
  axisPointer?: {
    type?: 'line' | 'shadow' | 'cross';
    [key: string]: any;
  };
  formatter?: string | ((params: any) => string);
  [key: string]: any;
}

/**
 * 网格配置
 */
export interface GridConfig {
  left?: string | number;
  top?: string | number;
  right?: string | number;
  bottom?: string | number;
  containLabel?: boolean;
  [key: string]: any;
}

/**
 * 坐标轴配置
 */
export interface AxisConfig {
  type?: 'category' | 'value' | 'time' | 'log';
  name?: string;
  data?: any[];
  min?: number | string;
  max?: number | string;
  axisLabel?: {
    formatter?: string | ((value: any) => string);
    rotate?: number;
    [key: string]: any;
  };
  [key: string]: any;
}

export type XAxisConfig = AxisConfig;
export type YAxisConfig = AxisConfig;

/**
 * 数据缩放配置
 */
export interface DataZoomConfig {
  show?: boolean;
  type?: 'inside' | 'slider';
  start?: number;
  end?: number;
  [key: string]: any;
}

/**
 * 工具箱配置
 */
export interface ToolboxConfig {
  show?: boolean;
  feature?: {
    saveAsImage?: { show?: boolean };
    dataZoom?: { show?: boolean };
    dataView?: { show?: boolean };
    restore?: { show?: boolean };
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * 动画配置
 */
export interface AnimationConfig {
  animation?: boolean;
  animationDuration?: number;
  animationEasing?: string;
  animationDelay?: number | ((idx: number) => number);
  [key: string]: any;
}

/**
 * 响应式配置
 */
export interface ResponsiveConfig {
  /** 是否启用响应式 */
  enabled?: boolean;
  /** 防抖延迟（毫秒） */
  debounce?: number;
  /** 是否保持纵横比 */
  maintainAspectRatio?: boolean;
}

/**
 * 字体大小配置
 */
export interface FontSizeConfig {
  /** 基础字体大小 */
  base?: number;
  /** 标题字体大小 */
  title?: number;
  /** 图例字体大小 */
  legend?: number;
  /** 坐标轴标签字体大小 */
  axisLabel?: number;
  /** 提示框字体大小 */
  tooltip?: number;
}

/**
 * 颜色配置
 */
export interface ColorConfig {
  /** 颜色列表 */
  palette?: string[];
  /** 渐变色 */
  gradient?: {
    type?: 'linear' | 'radial';
    colors?: Array<{ offset: number; color: string }>;
    [key: string]: any;
  };
}

/**
 * 主题配置
 */
export interface ThemeConfig {
  /** 颜色列表 */
  color?: string[];
  /** 背景色 */
  backgroundColor?: string;
  /** 文本样式 */
  textStyle?: {
    color?: string;
    fontSize?: number;
    [key: string]: any;
  };
  /** 标题样式 */
  title?: {
    textStyle?: {
      color?: string;
      fontSize?: number;
      [key: string]: any;
    };
    [key: string]: any;
  };
  [key: string]: any;
}

// ============ 智能配置接口 ============

/**
 * 智能图表配置
 */
export interface SmartChartConfig {
  /** 图表类型（必填） */
  type: ChartType;
  /** 数据（必填） */
  data: ChartData;

  // 基础配置
  /** 标题 */
  title?: string | TitleConfig;
  /** 图例 */
  legend?: boolean | LegendConfig;
  /** 提示框 */
  tooltip?: boolean | TooltipConfig;
  /** 网格 */
  grid?: GridConfig;

  // 样式
  /** 主题 */
  theme?: string | ThemeConfig;
  /** 暗黑模式 */
  darkMode?: boolean;
  /** 字体大小 */
  fontSize?: number | FontSizeConfig;
  /** 颜色 */
  color?: string[] | ColorConfig;

  // 坐标轴（可选，自动生成）
  /** X 轴配置 */
  xAxis?: XAxisConfig;
  /** Y 轴配置 */
  yAxis?: YAxisConfig;

  // 性能优化
  /** 懒加载 */
  lazy?: boolean;
  /** 虚拟渲染 */
  virtual?: boolean;
  /** 使用 Worker */
  worker?: boolean;
  /** 启用缓存 */
  cache?: boolean;

  // 响应式
  /** 响应式配置 */
  responsive?: boolean | ResponsiveConfig;

  // 交互
  /** 数据缩放 */
  dataZoom?: boolean | DataZoomConfig | DataZoomConfig[];
  /** 工具箱 */
  toolbox?: boolean | ToolboxConfig;

  // 动画
  /** 动画配置 */
  animation?: boolean | AnimationConfig;

  // 其他
  /** 数据集（用于复杂配置） */
  datasets?: Dataset[];
}

/**
 * 完整图表配置
 */
export interface ChartConfig extends SmartChartConfig {
  /** 完整的 ECharts 配置（覆盖自动配置） */
  echarts?: EChartsOption;

  /** 合并策略 */
  mergeStrategy?: 'replace' | 'merge' | 'deep-merge';

  /** 容器元素 */
  container?: HTMLElement;

  /** 渲染器类型 */
  renderer?: 'canvas' | 'svg';
}

// ============ 解析后的数据格式 ============

/**
 * 解析后的图表数据
 */
export interface ParsedChartData {
  /** X 轴数据 */
  xData?: any[];
  /** Y 轴数据（多系列） */
  series: any[][];
  /** 系列名称 */
  seriesNames: string[];
  /** 原始数据类型 */
  dataType: 'simple' | 'object' | 'standard';
  /** 是否是时间序列 */
  isTimeSeries: boolean;
  /** 数据点总数 */
  totalPoints: number;
}

// ============ 图表实例接口 ============

/**
 * 图表实例接口
 */
export interface ChartInstance {
  /** 更新数据 */
  updateData(data: ChartData): Promise<void>;
  /** 设置主题 */
  setTheme(theme: string | ThemeConfig): void;
  /** 设置暗黑模式 */
  setDarkMode(enabled: boolean): void;
  /** 设置字体大小 */
  setFontSize(size: number): void;
  /** 刷新图表 */
  refresh(): Promise<void>;
  /** 调整大小 */
  resize(): void;
  /** 获取 DataURL */
  getDataURL(options?: any): string;
  /** 事件监听 */
  on(eventName: string, handler: Function): void;
  /** 取消事件监听 */
  off(eventName: string, handler?: Function): void;
  /** 销毁实例 */
  dispose(): void;
  /** 获取 ECharts 实例 */
  getInstance(): EChartsInstance | undefined;
}

// ============ 导出所有类型 ============

export * from './chart-types';
export * from './config';
export * from './events';

