/**
 * Button 组件类型定义
 * 参考 Ant Design v5 的按钮组件接口设计
 */

import { ButtonType, ButtonShape, ButtonIconPosition } from '../../types';

// 按钮类型 - 使用全局类型定义
// export type ButtonType = 'default' | 'primary' | 'dashed' | 'text' | 'link';

// 按钮变体 (Ant Design v5.21.0+)
export type ButtonVariant = 'outlined' | 'dashed' | 'solid' | 'filled' | 'text' | 'link';

// 预设颜色 (Ant Design v5.23.0+)
export type PresetColors = 
  | 'blue' 
  | 'purple' 
  | 'cyan' 
  | 'green' 
  | 'magenta' 
  | 'pink' 
  | 'red' 
  | 'orange' 
  | 'yellow' 
  | 'volcano' 
  | 'geekblue' 
  | 'lime' 
  | 'gold';

// 按钮颜色 (Ant Design v5.21.0+)
export type ButtonColor = 'default' | 'primary' | 'danger' | PresetColors;

// 按钮形状 - 使用全局类型定义
// export type ButtonShape = 'default' | 'circle' | 'round';

// 按钮尺寸
export type ButtonSize = 'large' | 'middle' | 'small';

// 按钮 HTML 类型
export type ButtonHTMLType = 'submit' | 'button' | 'reset';

// 图标位置 - 使用全局类型定义
// export type ButtonIconPosition = 'start' | 'end';

// 加载配置
export interface LoadingConfig {
  loading: boolean;
  delay?: number;
}

// 语义化 DOM 结构
export type SemanticDOM = 'root' | 'icon';

// 基础按钮属性
export interface BaseButtonProps {
  /**
   * 按钮类型 (语法糖)
   * @default 'default'
   * @deprecated 推荐使用 variant 和 color 组合
   */
  type?: ButtonType;
  
  /**
   * 按钮变体 (v5.21.0+)
   * 设置按钮的样式变体
   */
  variant?: ButtonVariant;
  
  /**
   * 按钮颜色 (v5.21.0+)
   * 设置按钮的颜色
   */
  color?: ButtonColor;
  
  /**
   * 按钮形状
   * @default 'default'
   */
  shape?: ButtonShape;
  
  /**
   * 按钮尺寸
   * @default 'middle'
   */
  size?: ButtonSize;
  
  /**
   * 按钮图标
   */
  icon?: string;
  
  /**
   * 图标位置
   * @default 'start'
   */
  iconPosition?: ButtonIconPosition;
  
  /**
   * 是否加载中
   * @default false
   */
  loading?: boolean | { delay?: number; icon?: string };
  
  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean;
  
  /**
   * 是否为危险按钮 (语法糖)
   * @default false
   * @note 当设置 color 时会以后者为准
   */
  danger?: boolean;
  
  /**
   * 是否为幽灵按钮
   * @default false
   */
  ghost?: boolean;
  
  /**
   * 是否为块级按钮
   * @default false
   */
  block?: boolean;
  
  /**
   * 我们默认提供两个汉字之间的空格
   * @default true
   * @since v5.17.0
   */
  autoInsertSpace?: boolean;
  
  /**
   * 原生按钮类型
   * @default 'button'
   */
  htmlType?: ButtonHTMLType;
  
  /**
   * 点击跳转的地址
   */
  href?: string;
  
  /**
   * 相当于 a 链接的 target 属性
   */
  target?: string;
  
  /**
   * 语义化结构 class
   * @since v5.4.0
   */
  classNames?: Record<SemanticDOM, string>;
  
  /**
   * 语义化结构 style
   * @since v5.4.0
   */
  styles?: Record<SemanticDOM, { [key: string]: string }>;
  
  /**
   * 自定义类名
   */
  className?: string;
  
  /**
   * 自定义样式
   */
  style?: { [key: string]: string } | string;
  
  /**
   * 点击事件
   */
  onClick?: (event: MouseEvent) => void;
}

// 按钮组属性
export interface ButtonGroupProps {
  /**
   * 按钮组尺寸
   */
  size?: ButtonSize;
  
  /**
   * 自定义类名
   */
  className?: string;
  
  /**
   * 自定义样式
   */
  style?: { [key: string]: string } | string;
}

// 内部使用的完整属性
export interface InternalButtonProps extends BaseButtonProps {
  /**
   * 是否自动插入空格
   * @internal
   */
  autoInsertSpace?: boolean;
  
  /**
   * 前缀类名
   * @internal
   */
  prefixCls?: string;
  
  /**
   * 是否处于按钮组中
   * @internal
   */
  inGroup?: boolean;
}

// 导出工具函数类型
export type GetLoadingConfigType = (loading: BaseButtonProps['loading']) => LoadingConfig;