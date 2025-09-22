/**
 * 通用类型定义
 */

/**
 * 组件尺寸类型
 */
export type Size = 'small' | 'medium' | 'large';

/**
 * 按钮类型
 */
export type ButtonType = 'primary' | 'secondary' | 'outline' | 'text' | 'danger';

/**
 * 按钮形状
 */
export type ButtonShape = 'rectangle' | 'round' | 'circle';

/**
 * 输入框类型
 */
export type InputType = 'text' | 'password' | 'email' | 'number' | 'tel' | 'url';

/**
 * 主题类型
 */
export type Theme = 'light' | 'dark';

/**
 * 组件状态
 */
export type ComponentStatus = 'default' | 'success' | 'warning' | 'error';

/**
 * 事件处理器类型
 */
export interface EventHandler<T = any> {
  (event: CustomEvent<T>): void;
}

/**
 * 组件基础属性
 */
export interface BaseComponentProps {
  /**
   * 组件类名
   */
  class?: string;
  
  /**
   * 组件样式
   */
  style?: string | { [key: string]: string };
  
  /**
   * 组件ID
   */
  id?: string;
  
  /**
   * 是否禁用
   */
  disabled?: boolean;
}

/**
 * 按钮组件属性
 */
export interface ButtonProps extends BaseComponentProps {
  type?: ButtonType;
  size?: Size;
  shape?: ButtonShape;
  loading?: boolean;
  icon?: string;
  onClick?: EventHandler;
}

/**
 * 输入框组件属性
 */
export interface InputProps extends BaseComponentProps {
  type?: InputType;
  value?: string;
  placeholder?: string;
  readonly?: boolean;
  size?: Size;
  clearable?: boolean;
  prefixIcon?: string;
  suffixIcon?: string;
  onInput?: EventHandler<string>;
  onChange?: EventHandler<string>;
  onFocus?: EventHandler;
  onBlur?: EventHandler;
}

/**
 * 复选框组件属性
 */
export interface CheckboxProps extends BaseComponentProps {
  checked?: boolean;
  indeterminate?: boolean;
  value?: string;
  label?: string;
  onChange?: EventHandler<boolean>;
}

/**
 * 单选框组件属性
 */
export interface RadioProps extends BaseComponentProps {
  checked?: boolean;
  value?: string;
  label?: string;
  name?: string;
  onChange?: EventHandler<string>;
}

/**
 * 图标组件属性
 */
export interface IconProps extends BaseComponentProps {
  name: string;
  size?: Size | number;
  color?: string;
}

/**
 * 组件配置接口
 */
export interface ComponentConfig {
  /**
   * 组件前缀
   */
  prefix?: string;
  
  /**
   * 默认主题
   */
  theme?: Theme;
  
  /**
   * 默认尺寸
   */
  size?: Size;
  
  /**
   * 是否启用动画
   */
  animation?: boolean;
}
