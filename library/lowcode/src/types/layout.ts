/**
 * 布局类型定义
 * 支持 Grid 和 Flex 布局
 */

/**
 * 布局配置
 */
export interface LayoutConfig {
  /** 布局类型 */
  type: 'grid' | 'flex' | 'absolute';

  // Grid 布局属性
  /** Grid 列位置 */
  gridColumn?: string;
  /** Grid 行位置 */
  gridRow?: string;
  /** Grid 区域 */
  gridArea?: string;
  /** Grid 列对齐 */
  justifySelf?: 'start' | 'end' | 'center' | 'stretch';

  // Flex 布局属性
  /** Flex 增长 */
  flexGrow?: number;
  /** Flex 收缩 */
  flexShrink?: number;
  /** Flex 基础值 */
  flexBasis?: string;
  /** Flex 简写 */
  flex?: string;
  /** Flex/Grid 对齐（兼容两种布局） */
  alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch' | 'start' | 'end';
  /** Flex 顺序 */
  order?: number;

  // 绝对定位属性（备用）
  /** 位置 */
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  /** 上偏移 */
  top?: string | number;
  /** 右偏移 */
  right?: string | number;
  /** 下偏移 */
  bottom?: string | number;
  /** 左偏移 */
  left?: string | number;
  /** 层级 */
  zIndex?: number;

  // 通用属性
  /** 宽度 */
  width?: string | number;
  /** 高度 */
  height?: string | number;
  /** 最小宽度 */
  minWidth?: string | number;
  /** 最大宽度 */
  maxWidth?: string | number;
  /** 最小高度 */
  minHeight?: string | number;
  /** 最大高度 */
  maxHeight?: string | number;
  /** 外边距 */
  margin?: string | number;
  /** 内边距 */
  padding?: string | number;
}

/**
 * Grid 容器配置
 */
export interface GridContainerConfig {
  /** 列定义 */
  gridTemplateColumns: string;
  /** 行定义 */
  gridTemplateRows?: string;
  /** 列间距 */
  columnGap?: string | number;
  /** 行间距 */
  rowGap?: string | number;
  /** 间距简写 */
  gap?: string | number;
  /** 列对齐 */
  justifyItems?: 'start' | 'end' | 'center' | 'stretch';
  /** 行对齐 */
  alignItems?: 'start' | 'end' | 'center' | 'stretch' | 'baseline';
  /** 内容列对齐 */
  justifyContent?: 'start' | 'end' | 'center' | 'stretch' | 'space-around' | 'space-between' | 'space-evenly';
  /** 内容行对齐 */
  alignContent?: 'start' | 'end' | 'center' | 'stretch' | 'space-around' | 'space-between' | 'space-evenly';
  /** 自动列大小 */
  gridAutoColumns?: string;
  /** 自动行大小 */
  gridAutoRows?: string;
  /** 自动流向 */
  gridAutoFlow?: 'row' | 'column' | 'row dense' | 'column dense';
}

/**
 * Flex 容器配置
 */
export interface FlexContainerConfig {
  /** 主轴方向 */
  flexDirection?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  /** 换行 */
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  /** 主轴对齐 */
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  /** 交叉轴对齐 */
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  /** 多行对齐 */
  alignContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'stretch';
  /** 间距 */
  gap?: string | number;
  /** 行间距 */
  rowGap?: string | number;
  /** 列间距 */
  columnGap?: string | number;
}

/**
 * 布局位置信息
 */
export interface LayoutPosition {
  /** X 坐标 */
  x: number;
  /** Y 坐标 */
  y: number;
  /** 宽度 */
  width: number;
  /** 高度 */
  height: number;
}

/**
 * 布局引擎接口
 */
export interface LayoutEngine {
  /** 计算组件位置 */
  calculatePosition(component: any, container: HTMLElement): LayoutPosition;
  /** 生成容器样式 */
  generateContainerStyle(config: any): Record<string, any>;
  /** 生成组件样式 */
  generateComponentStyle(layout: LayoutConfig): Record<string, any>;
  /** 计算拖放位置 */
  calculateDropPosition(event: DragEvent, container: HTMLElement): Partial<LayoutConfig>;
}

/**
 * 响应式断点
 */
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

/**
 * 响应式布局配置
 */
export interface ResponsiveLayout {
  /** 默认布局 */
  default: LayoutConfig;
  /** 响应式断点布局 */
  [key: string]: LayoutConfig;
}

/**
 * Grid 区域定义
 */
export interface GridArea {
  /** 区域名称 */
  name: string;
  /** 起始行 */
  rowStart: number;
  /** 结束行 */
  rowEnd: number;
  /** 起始列 */
  columnStart: number;
  /** 结束列 */
  columnEnd: number;
}

/**
 * 布局约束
 */
export interface LayoutConstraints {
  /** 最小列数 */
  minColumns?: number;
  /** 最大列数 */
  maxColumns?: number;
  /** 最小行数 */
  minRows?: number;
  /** 最大行数 */
  maxRows?: number;
  /** 固定宽高比 */
  aspectRatio?: number;
}



