/**
 * Card 组件类型定义
 * 
 * 这个文件包含了 Card 组件的所有类型定义
 * 包括属性接口、事件类型、布局配置等
 */

import { BaseProps, Size, EventHandler } from './index';

// ==================== Card 组件属性 ====================

/**
 * Card 组件的阴影级别枚举
 */
export type CardShadow = 'never' | 'hover' | 'always';

/**
 * Card 组件的边框样式枚举
 */
export type CardBorder = 'none' | 'solid' | 'dashed';

/**
 * Card 组件属性接口
 */
export interface CardProps extends BaseProps {
  /**
   * 卡片标题
   */
  title?: string;

  /**
   * 卡片副标题
   */
  subtitle?: string;

  /**
   * 卡片描述
   */
  description?: string;

  /**
   * 卡片尺寸
   * @default 'medium'
   */
  size?: Size;

  /**
   * 阴影显示时机
   * @default 'always'
   */
  shadow?: CardShadow;

  /**
   * 边框样式
   * @default 'solid'
   */
  border?: CardBorder;

  /**
   * 是否可悬停
   * @default false
   */
  hoverable?: boolean;

  /**
   * 是否可点击
   * @default false
   */
  clickable?: boolean;

  /**
   * 是否加载中
   * @default false
   */
  loading?: boolean;

  /**
   * 头部图标
   */
  headerIcon?: string;

  /**
   * 头部额外内容
   */
  headerExtra?: string;

  /**
   * 封面图片 URL
   */
  cover?: string;

  /**
   * 封面图片替代文本
   */
  coverAlt?: string;

  /**
   * 封面图片高度
   */
  coverHeight?: string;

  /**
   * 是否显示头部分割线
   * @default true
   */
  headerDivider?: boolean;

  /**
   * 是否显示底部分割线
   * @default false
   */
  footerDivider?: boolean;

  /**
   * 内容区域内边距
   */
  bodyPadding?: string;

  /**
   * 头部内边距
   */
  headerPadding?: string;

  /**
   * 底部内边距
   */
  footerPadding?: string;

  /**
   * 自定义 CSS 类名
   */
  customClass?: string;

  /**
   * 自定义内联样式
   */
  customStyle?: { [key: string]: string };

  // ==================== 事件处理器 ====================

  /**
   * 点击事件处理器
   */
  onClick?: EventHandler<MouseEvent>;

  /**
   * 鼠标进入事件处理器
   */
  onMouseEnter?: EventHandler<MouseEvent>;

  /**
   * 鼠标离开事件处理器
   */
  onMouseLeave?: EventHandler<MouseEvent>;

  /**
   * 头部点击事件处理器
   */
  onHeaderClick?: EventHandler<MouseEvent>;

  /**
   * 封面点击事件处理器
   */
  onCoverClick?: EventHandler<MouseEvent>;
}

// ==================== Card 组件事件 ====================

/**
 * Card 点击事件详情
 */
export interface CardClickEventDetail {
  /**
   * 原始鼠标事件
   */
  originalEvent: MouseEvent;
  
  /**
   * 卡片元素
   */
  target: HTMLElement;
  
  /**
   * 点击区域
   */
  area: 'card' | 'header' | 'cover' | 'body' | 'footer';
}

/**
 * Card 悬停事件详情
 */
export interface CardHoverEventDetail {
  /**
   * 原始鼠标事件
   */
  originalEvent: MouseEvent;
  
  /**
   * 卡片元素
   */
  target: HTMLElement;
  
  /**
   * 悬停状态
   */
  hovered: boolean;
}

// ==================== Card 组件样式配置 ====================

/**
 * Card 尺寸配置
 */
export interface CardSizeConfig {
  /**
   * 内边距
   */
  padding: string;
  
  /**
   * 头部内边距
   */
  headerPadding: string;
  
  /**
   * 底部内边距
   */
  footerPadding: string;
  
  /**
   * 标题字体大小
   */
  titleFontSize: string;
  
  /**
   * 副标题字体大小
   */
  subtitleFontSize: string;
  
  /**
   * 内容字体大小
   */
  bodyFontSize: string;
  
  /**
   * 圆角大小
   */
  borderRadius: string;
  
  /**
   * 最小高度
   */
  minHeight: string;
}

/**
 * Card 阴影配置
 */
export interface CardShadowConfig {
  /**
   * 默认阴影
   */
  default: string;
  
  /**
   * 悬停阴影
   */
  hover: string;
  
  /**
   * 激活阴影
   */
  active: string;
}

/**
 * Card 主题配置
 */
export interface CardThemeConfig {
  /**
   * 尺寸配置
   */
  sizes: {
    small: CardSizeConfig;
    medium: CardSizeConfig;
    large: CardSizeConfig;
  };
  
  /**
   * 阴影配置
   */
  shadows: CardShadowConfig;
  
  /**
   * 颜色配置
   */
  colors: {
    background: string;
    border: string;
    headerBackground: string;
    footerBackground: string;
    titleColor: string;
    subtitleColor: string;
    bodyColor: string;
  };
  
  /**
   * 动画配置
   */
  animation: {
    duration: string;
    easing: string;
  };
}

// ==================== Card 布局配置 ====================

/**
 * Card 布局类型
 */
export type CardLayout = 'vertical' | 'horizontal';

/**
 * Card 内容对齐方式
 */
export type CardAlign = 'left' | 'center' | 'right';

/**
 * Card 布局配置
 */
export interface CardLayoutConfig {
  /**
   * 布局方向
   */
  layout: CardLayout;
  
  /**
   * 内容对齐
   */
  align: CardAlign;
  
  /**
   * 封面位置（水平布局时）
   */
  coverPosition: 'left' | 'right' | 'top' | 'bottom';
  
  /**
   * 封面宽度（水平布局时）
   */
  coverWidth: string;
}

// ==================== Card 组件默认配置 ====================

/**
 * Card 组件默认属性
 */
export const defaultCardProps: Partial<CardProps> = {
  size: 'medium',
  shadow: 'always',
  border: 'solid',
  hoverable: false,
  clickable: false,
  loading: false,
  headerDivider: true,
  footerDivider: false,
  coverHeight: '200px',
};

// ==================== 工具类型 ====================

/**
 * Card 组件引用类型
 */
export type CardRef = HTMLElement;

/**
 * Card 组件实例类型
 */
export interface CardInstance {
  /**
   * 获取卡片元素
   */
  getElement(): CardRef | null;
  
  /**
   * 设置加载状态
   */
  setLoading(loading: boolean): void;
  
  /**
   * 设置标题
   */
  setTitle(title: string): void;
  
  /**
   * 设置副标题
   */
  setSubtitle(subtitle: string): void;
  
  /**
   * 设置描述
   */
  setDescription(description: string): void;
  
  /**
   * 设置封面
   */
  setCover(cover: string, alt?: string): void;
  
  /**
   * 触发点击事件
   */
  click(): void;
}

// ==================== Card 组合组件类型 ====================

/**
 * CardHeader 组件属性
 */
export interface CardHeaderProps {
  /**
   * 标题
   */
  title?: string;
  
  /**
   * 副标题
   */
  subtitle?: string;
  
  /**
   * 图标
   */
  icon?: string;
  
  /**
   * 额外内容
   */
  extra?: string;
  
  /**
   * 是否显示分割线
   */
  divider?: boolean;
}

/**
 * CardBody 组件属性
 */
export interface CardBodyProps {
  /**
   * 内边距
   */
  padding?: string;
  
  /**
   * 文本对齐
   */
  textAlign?: 'left' | 'center' | 'right';
}

/**
 * CardFooter 组件属性
 */
export interface CardFooterProps {
  /**
   * 内边距
   */
  padding?: string;
  
  /**
   * 是否显示分割线
   */
  divider?: boolean;
  
  /**
   * 对齐方式
   */
  align?: 'left' | 'center' | 'right';
}

/**
 * CardCover 组件属性
 */
export interface CardCoverProps {
  /**
   * 图片 URL
   */
  src: string;
  
  /**
   * 替代文本
   */
  alt?: string;
  
  /**
   * 高度
   */
  height?: string;
  
  /**
   * 对象适应方式
   */
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
  
  /**
   * 是否可点击
   */
  clickable?: boolean;
}

// ==================== Card 网格布局类型 ====================

/**
 * CardGrid 组件属性
 */
export interface CardGridProps {
  /**
   * 列数
   */
  columns?: number;
  
  /**
   * 间距
   */
  gap?: string;
  
  /**
   * 响应式断点配置
   */
  responsive?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    xxl?: number;
  };
  
  /**
   * 是否自动填充
   */
  autoFill?: boolean;
  
  /**
   * 最小卡片宽度
   */
  minCardWidth?: string;
}
