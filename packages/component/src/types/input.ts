/**
 * Input 组件类型定义
 * 
 * 这个文件包含了 Input 组件的所有类型定义
 * 包括属性接口、事件类型、验证规则等
 */

import { FormControlProps, Size, Status, EventHandler } from './index';

// ==================== Input 组件属性 ====================

/**
 * Input 组件的输入类型枚举
 */
export type InputType = 
  | 'text' 
  | 'password' 
  | 'email' 
  | 'number' 
  | 'tel' 
  | 'url' 
  | 'search'
  | 'textarea';

/**
 * Input 组件的变体枚举
 */
export type InputVariant = 'outlined' | 'filled' | 'borderless';

/**
 * Input 组件属性接口
 */
export interface InputProps extends FormControlProps {
  /**
   * 输入框类型
   * @default 'text'
   */
  type?: InputType;

  /**
   * 输入框变体
   * @default 'outlined'
   */
  variant?: InputVariant;

  /**
   * 输入框尺寸
   * @default 'medium'
   */
  size?: Size;

  /**
   * 输入框状态
   */
  status?: Status;

  /**
   * 输入框值
   */
  value?: string;

  /**
   * 默认值
   */
  defaultValue?: string;

  /**
   * 占位符文本
   */
  placeholder?: string;

  /**
   * 最大长度
   */
  maxlength?: number;

  /**
   * 最小长度
   */
  minlength?: number;

  /**
   * 最大值（数字类型）
   */
  max?: number | string;

  /**
   * 最小值（数字类型）
   */
  min?: number | string;

  /**
   * 步长（数字类型）
   */
  step?: number | string;

  /**
   * 输入模式
   */
  inputmode?: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';

  /**
   * 自动完成
   */
  autocomplete?: string;

  /**
   * 拼写检查
   */
  spellcheck?: boolean;

  /**
   * 是否允许清空
   * @default false
   */
  clearable?: boolean;

  /**
   * 是否显示密码切换按钮（password 类型）
   * @default false
   */
  showPassword?: boolean;

  /**
   * 是否显示字符计数
   * @default false
   */
  showCount?: boolean;

  /**
   * 前缀图标
   */
  prefixIcon?: string;

  /**
   * 后缀图标
   */
  suffixIcon?: string;

  /**
   * 前缀文本
   */
  prefix?: string;

  /**
   * 后缀文本
   */
  suffix?: string;

  /**
   * 输入框前置标签
   */
  addonBefore?: string;

  /**
   * 输入框后置标签
   */
  addonAfter?: string;

  /**
   * 文本域行数（textarea 类型）
   */
  rows?: number;

  /**
   * 文本域最小行数（textarea 类型）
   */
  minRows?: number;

  /**
   * 文本域最大行数（textarea 类型）
   */
  maxRows?: number;

  /**
   * 是否自动调整高度（textarea 类型）
   * @default false
   */
  autosize?: boolean;

  /**
   * 是否可调整大小（textarea 类型）
   * @default true
   */
  resize?: boolean;

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
   * 输入事件处理器
   */
  onInput?: EventHandler<InputEvent>;

  /**
   * 变化事件处理器
   */
  onChange?: EventHandler<Event>;

  /**
   * 聚焦事件处理器
   */
  onFocus?: EventHandler<FocusEvent>;

  /**
   * 失焦事件处理器
   */
  onBlur?: EventHandler<FocusEvent>;

  /**
   * 键盘按下事件处理器
   */
  onKeyDown?: EventHandler<KeyboardEvent>;

  /**
   * 键盘抬起事件处理器
   */
  onKeyUp?: EventHandler<KeyboardEvent>;

  /**
   * 回车事件处理器
   */
  onEnter?: EventHandler<KeyboardEvent>;

  /**
   * 清空事件处理器
   */
  onClear?: EventHandler<MouseEvent>;

  /**
   * 密码可见性切换事件处理器
   */
  onPasswordVisibilityToggle?: EventHandler<MouseEvent>;
}

// ==================== Input 组件事件 ====================

/**
 * Input 输入事件详情
 */
export interface InputInputEventDetail {
  /**
   * 当前值
   */
  value: string;
  
  /**
   * 原始输入事件
   */
  originalEvent: InputEvent;
  
  /**
   * 输入框元素
   */
  target: HTMLInputElement | HTMLTextAreaElement;
}

/**
 * Input 变化事件详情
 */
export interface InputChangeEventDetail {
  /**
   * 当前值
   */
  value: string;
  
  /**
   * 之前的值
   */
  oldValue: string;
  
  /**
   * 原始变化事件
   */
  originalEvent: Event;
  
  /**
   * 输入框元素
   */
  target: HTMLInputElement | HTMLTextAreaElement;
}

/**
 * Input 聚焦事件详情
 */
export interface InputFocusEventDetail {
  /**
   * 原始聚焦事件
   */
  originalEvent: FocusEvent;
  
  /**
   * 输入框元素
   */
  target: HTMLInputElement | HTMLTextAreaElement;
  
  /**
   * 聚焦方向
   */
  direction: 'in' | 'out';
}

/**
 * Input 清空事件详情
 */
export interface InputClearEventDetail {
  /**
   * 原始鼠标事件
   */
  originalEvent: MouseEvent;
  
  /**
   * 输入框元素
   */
  target: HTMLInputElement | HTMLTextAreaElement;
}

// ==================== Input 组件样式配置 ====================

/**
 * Input 尺寸配置
 */
export interface InputSizeConfig {
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
 * Input 变体样式配置
 */
export interface InputVariantConfig {
  /**
   * 背景颜色
   */
  backgroundColor: string;
  
  /**
   * 边框颜色
   */
  borderColor: string;
  
  /**
   * 边框宽度
   */
  borderWidth: string;
  
  /**
   * 边框样式
   */
  borderStyle: string;
  
  /**
   * 聚焦时边框颜色
   */
  focusBorderColor: string;
  
  /**
   * 悬停时边框颜色
   */
  hoverBorderColor: string;
  
  /**
   * 错误状态边框颜色
   */
  errorBorderColor: string;
}

/**
 * Input 主题配置
 */
export interface InputThemeConfig {
  /**
   * 尺寸配置
   */
  sizes: {
    small: InputSizeConfig;
    medium: InputSizeConfig;
    large: InputSizeConfig;
  };
  
  /**
   * 变体样式配置
   */
  variants: {
    outlined: InputVariantConfig;
    filled: InputVariantConfig;
    borderless: InputVariantConfig;
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
    focus: string;
    error: string;
  };
}

// ==================== Input 验证相关 ====================

/**
 * Input 验证规则
 */
export interface InputValidationRule {
  /**
   * 验证器函数
   */
  validator: (value: string) => boolean | Promise<boolean>;
  
  /**
   * 错误消息
   */
  message: string;
  
  /**
   * 触发时机
   */
  trigger?: 'input' | 'change' | 'blur';
}

/**
 * Input 验证结果
 */
export interface InputValidationResult {
  /**
   * 是否验证通过
   */
  valid: boolean;
  
  /**
   * 错误消息列表
   */
  errors: string[];
  
  /**
   * 验证的值
   */
  value: string;
}

// ==================== Input 组件默认配置 ====================

/**
 * Input 组件默认属性
 */
export const defaultInputProps: Partial<InputProps> = {
  type: 'text',
  variant: 'outlined',
  size: 'medium',
  clearable: false,
  showPassword: false,
  showCount: false,
  autosize: false,
  resize: true,
  rows: 3,
  spellcheck: true,
};

// ==================== 工具类型 ====================

/**
 * Input 组件引用类型
 */
export type InputRef = HTMLInputElement | HTMLTextAreaElement;

/**
 * Input 组件实例类型
 */
export interface InputInstance {
  /**
   * 获取输入框元素
   */
  getElement(): InputRef | null;
  
  /**
   * 聚焦输入框
   */
  focus(): void;
  
  /**
   * 失焦输入框
   */
  blur(): void;
  
  /**
   * 选中所有文本
   */
  select(): void;
  
  /**
   * 设置选中范围
   */
  setSelectionRange(start: number, end: number): void;
  
  /**
   * 获取当前值
   */
  getValue(): string;
  
  /**
   * 设置值
   */
  setValue(value: string): void;
  
  /**
   * 清空输入框
   */
  clear(): void;
  
  /**
   * 验证输入值
   */
  validate(): Promise<InputValidationResult>;
  
  /**
   * 重置验证状态
   */
  resetValidation(): void;
}
