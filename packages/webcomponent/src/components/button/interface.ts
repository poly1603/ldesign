/**
 * Button 组件类型定义
 * 参考 Ant Design 的按钮组件接口设计
 */

import { ButtonType, ButtonShape, ButtonIconPosition } from '../../types';

// 按钮类型 - 使用全局类型定义
// export type ButtonType = 'default' | 'primary' | 'dashed' | 'text' | 'link';

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

// 基础按钮属性
export interface BaseButtonProps {
  /**
   * 按钮类型
   * @default 'default'
   */
  type?: ButtonType;
  
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
  loading?: boolean | { delay?: number };
  
  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean;
  
  /**
   * 是否为危险按钮
   * @default false
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