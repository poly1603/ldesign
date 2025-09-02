/**
 * Button 组件类型定义
 * 
 * 这个文件包含了 Button 组件的所有类型定义
 * 包括属性接口、事件类型、样式变体等
 */

import { BaseProps, Size, Status, EventHandler } from './index';

// ==================== Button 组件属性 ====================

/**
 * Button 组件的类型枚举
 */
export type ButtonType = 'default' | 'primary' | 'dashed' | 'text' | 'link';

/**
 * Button 组件的形状枚举
 */
export type ButtonShape = 'default' | 'circle' | 'round';

/**
 * Button 组件的 HTML 类型
 */
export type ButtonHtmlType = 'button' | 'submit' | 'reset';

/**
 * Button 组件属性接口
 */
export interface ButtonProps extends BaseProps {
  /**
   * 按钮类型
   * @default 'default'
   */
  type?: ButtonType;

  /**
   * 按钮尺寸
   * @default 'medium'
   */
  size?: Size;

  /**
   * 按钮状态（用于状态色彩）
   */
  status?: Status;

  /**
   * 按钮形状
   * @default 'default'
   */
  shape?: ButtonShape;

  /**
   * HTML button 类型
   * @default 'button'
   */
  htmlType?: ButtonHtmlType;

  /**
   * 是否为块级按钮（占满容器宽度）
   * @default false
   */
  block?: boolean;

  /**
   * 是否显示加载状态
   * @default false
   */
  loading?: boolean;

  /**
   * 是否为危险按钮（红色警告样式）
   * @default false
   */
  danger?: boolean;

  /**
   * 是否为幽灵按钮（透明背景）
   * @default false
   */
  ghost?: boolean;

  /**
   * 按钮图标（左侧）
   */
  icon?: string;

  /**
   * 按钮图标（右侧）
   */
  iconRight?: string;

  /**
   * 自定义加载图标
   */
  loadingIcon?: string;

  /**
   * 按钮链接地址（当 type 为 'link' 时使用）
   */
  href?: string;

  /**
   * 链接打开方式（当 type 为 'link' 时使用）
   */
  target?: '_blank' | '_self' | '_parent' | '_top';

  /**
   * 是否禁用按钮
   * @default false
   */
  disabled?: boolean;

  /**
   * Tab 索引
   */
  tabindex?: number;

  /**
   * 自动聚焦
   * @default false
   */
  autofocus?: boolean;

  /**
   * 按钮文本内容
   */
  text?: string;

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
   * 聚焦事件处理器
   */
  onFocus?: EventHandler<FocusEvent>;

  /**
   * 失焦事件处理器
   */
  onBlur?: EventHandler<FocusEvent>;

  /**
   * 鼠标进入事件处理器
   */
  onMouseEnter?: EventHandler<MouseEvent>;

  /**
   * 鼠标离开事件处理器
   */
  onMouseLeave?: EventHandler<MouseEvent>;

  /**
   * 键盘按下事件处理器
   */
  onKeyDown?: EventHandler<KeyboardEvent>;

  /**
   * 键盘抬起事件处理器
   */
  onKeyUp?: EventHandler<KeyboardEvent>;
}

// ==================== Button 组件事件 ====================

/**
 * Button 点击事件详情
 */
export interface ButtonClickEventDetail {
  /**
   * 原始鼠标事件
   */
  originalEvent: MouseEvent;
  
  /**
   * 按钮元素
   */
  target: HTMLElement;
  
  /**
   * 按钮类型
   */
  type: ButtonType;
  
  /**
   * 是否禁用状态
   */
  disabled: boolean;
  
  /**
   * 是否加载状态
   */
  loading: boolean;
}

/**
 * Button 聚焦事件详情
 */
export interface ButtonFocusEventDetail {
  /**
   * 原始聚焦事件
   */
  originalEvent: FocusEvent;
  
  /**
   * 按钮元素
   */
  target: HTMLElement;
  
  /**
   * 聚焦方向
   */
  direction: 'in' | 'out';
}

// ==================== Button 组件样式配置 ====================

/**
 * Button 尺寸配置
 */
export interface ButtonSizeConfig {
  /**
   * 内边距（垂直方向）
   */
  paddingVertical: string;
  
  /**
   * 内边距（水平方向）
   */
  paddingHorizontal: string;
  
  /**
   * 字体大小
   */
  fontSize: string;
  
  /**
   * 行高
   */
  lineHeight: string;
  
  /**
   * 最小高度
   */
  minHeight: string;
  
  /**
   * 圆角大小
   */
  borderRadius: string;
  
  /**
   * 图标大小
   */
  iconSize: string;
}

/**
 * Button 类型样式配置
 */
export interface ButtonTypeConfig {
  /**
   * 文字颜色
   */
  color: string;
  
  /**
   * 背景颜色
   */
  backgroundColor: string;
  
  /**
   * 边框颜色
   */
  borderColor: string;
  
  /**
   * 悬停状态颜色
   */
  hoverColor: string;
  
  /**
   * 悬停状态背景色
   */
  hoverBackgroundColor: string;
  
  /**
   * 悬停状态边框色
   */
  hoverBorderColor: string;
  
  /**
   * 激活状态颜色
   */
  activeColor: string;
  
  /**
   * 激活状态背景色
   */
  activeBackgroundColor: string;
  
  /**
   * 激活状态边框色
   */
  activeBorderColor: string;
  
  /**
   * 禁用状态颜色
   */
  disabledColor: string;
  
  /**
   * 禁用状态背景色
   */
  disabledBackgroundColor: string;
  
  /**
   * 禁用状态边框色
   */
  disabledBorderColor: string;
}

/**
 * Button 主题配置
 */
export interface ButtonThemeConfig {
  /**
   * 尺寸配置
   */
  sizes: {
    small: ButtonSizeConfig;
    medium: ButtonSizeConfig;
    large: ButtonSizeConfig;
  };
  
  /**
   * 类型样式配置
   */
  types: {
    default: ButtonTypeConfig;
    primary: ButtonTypeConfig;
    dashed: ButtonTypeConfig;
    text: ButtonTypeConfig;
    link: ButtonTypeConfig;
  };
  
  /**
   * 动画配置
   */
  animation: {
    duration: string;
    easing: string;
  };
  
  /**
   * 阴影配置
   */
  shadow: {
    default: string;
    hover: string;
    active: string;
  };
}

// ==================== Button 组件默认配置 ====================

/**
 * Button 组件默认属性
 */
export const defaultButtonProps: Partial<ButtonProps> = {
  type: 'default',
  size: 'medium',
  shape: 'default',
  htmlType: 'button',
  block: false,
  loading: false,
  danger: false,
  ghost: false,
  disabled: false,
  autofocus: false,
  target: '_self',
};

// ==================== 工具类型 ====================

/**
 * Button 组件引用类型
 */
export type ButtonRef = HTMLButtonElement | HTMLAnchorElement;

/**
 * Button 组件实例类型
 */
export interface ButtonInstance {
  /**
   * 获取按钮元素
   */
  getElement(): ButtonRef | null;
  
  /**
   * 聚焦按钮
   */
  focus(): void;
  
  /**
   * 失焦按钮
   */
  blur(): void;
  
  /**
   * 点击按钮
   */
  click(): void;
  
  /**
   * 设置加载状态
   */
  setLoading(loading: boolean): void;
  
  /**
   * 设置禁用状态
   */
  setDisabled(disabled: boolean): void;
}
