/**
 * 组件库类型定义文件
 * 
 * 这个文件包含了组件库中所有组件的通用类型定义
 * 包括事件类型、属性类型、配置类型等
 */

// ==================== 基础类型定义 ====================

/**
 * 组件尺寸枚举
 */
export type Size = 'small' | 'medium' | 'large';

/**
 * 组件状态枚举
 */
export type Status = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';

/**
 * 组件形状枚举
 */
export type Shape = 'square' | 'round' | 'circle';

/**
 * 位置枚举
 */
export type Placement =
  | 'top' | 'top-start' | 'top-end'
  | 'bottom' | 'bottom-start' | 'bottom-end'
  | 'left' | 'left-start' | 'left-end'
  | 'right' | 'right-start' | 'right-end';

/**
 * 对齐方式枚举
 */
export type Align = 'left' | 'center' | 'right';

/**
 * 触发方式枚举
 */
export type Trigger = 'hover' | 'click' | 'focus' | 'manual';

// ==================== 事件类型定义 ====================

/**
 * 自定义事件基础接口
 */
export interface CustomEventDetail<T = any> {
  detail: T;
}

/**
 * 点击事件详情
 */
export interface ClickEventDetail {
  originalEvent: MouseEvent;
  target: HTMLElement;
}

/**
 * 输入事件详情
 */
export interface InputEventDetail {
  value: string;
  originalEvent: Event;
}

/**
 * 变化事件详情
 */
export interface ChangeEventDetail<T = any> {
  value: T;
  oldValue: T;
  originalEvent?: Event;
}

/**
 * 选择事件详情
 */
export interface SelectEventDetail<T = any> {
  value: T;
  option: T;
  index: number;
}

/**
 * 关闭事件详情
 */
export interface CloseEventDetail {
  reason: 'user' | 'escape' | 'backdrop' | 'programmatic';
}

// ==================== 组件属性接口 ====================

/**
 * 基础组件属性接口
 */
export interface BaseProps {
  /**
   * 组件的唯一标识符
   */
  id?: string;

  /**
   * CSS 类名
   */
  class?: string;

  /**
   * 内联样式对象
   */
  style?: { [key: string]: string };

  /**
   * 是否禁用组件
   */
  disabled?: boolean;

  /**
   * 组件尺寸
   */
  size?: Size;

  /**
   * 测试标识符
   */
  'data-testid'?: string;

  /**
   * ARIA 标签
   */
  'aria-label'?: string;

  /**
   * ARIA 描述
   */
  'aria-describedby'?: string;
}

/**
 * 可聚焦组件属性接口
 */
export interface FocusableProps extends BaseProps {
  /**
   * Tab 索引
   */
  tabindex?: number;

  /**
   * 自动聚焦
   */
  autofocus?: boolean;
}

/**
 * 表单控件属性接口
 */
export interface FormControlProps extends FocusableProps {
  /**
   * 表单控件名称
   */
  name?: string;

  /**
   * 表单控件值
   */
  value?: string;

  /**
   * 默认值
   */
  defaultValue?: string;

  /**
   * 是否必填
   */
  required?: boolean;

  /**
   * 是否只读
   */
  readonly?: boolean;

  /**
   * 占位符文本
   */
  placeholder?: string;

  /**
   * 验证状态
   */
  status?: Status;

  /**
   * 错误消息
   */
  errorMessage?: string;

  /**
   * 帮助文本
   */
  helpText?: string;
}

// ==================== 配置类型定义 ====================

/**
 * 主题配置接口
 */
export interface ThemeConfig {
  /**
   * 主色调
   */
  primaryColor?: string;

  /**
   * 成功色
   */
  successColor?: string;

  /**
   * 警告色
   */
  warningColor?: string;

  /**
   * 错误色
   */
  errorColor?: string;

  /**
   * 信息色
   */
  infoColor?: string;

  /**
   * 字体族
   */
  fontFamily?: string;

  /**
   * 基础字体大小
   */
  fontSize?: string;

  /**
   * 基础圆角大小
   */
  borderRadius?: string;

  /**
   * 基础间距大小
   */
  spacing?: string;
}

/**
 * 国际化配置接口
 */
export interface I18nConfig {
  /**
   * 当前语言
   */
  locale?: string;

  /**
   * 语言包
   */
  messages?: Record<string, Record<string, string>>;

  /**
   * 回退语言
   */
  fallbackLocale?: string;
}

/**
 * 可访问性配置接口
 */
export interface A11yConfig {
  /**
   * 是否启用键盘导航
   */
  keyboardNavigation?: boolean;

  /**
   * 是否启用屏幕阅读器支持
   */
  screenReader?: boolean;

  /**
   * 是否启用高对比度模式
   */
  highContrast?: boolean;

  /**
   * 是否减少动画
   */
  reducedMotion?: boolean;
}

/**
 * 组件库全局配置接口
 */
export interface GlobalConfig {
  /**
   * 主题配置
   */
  theme?: ThemeConfig;

  /**
   * 国际化配置
   */
  i18n?: I18nConfig;

  /**
   * 可访问性配置
   */
  a11y?: A11yConfig;

  /**
   * 组件默认属性
   */
  componentDefaults?: {
    [componentName: string]: Record<string, any>;
  };
}

// ==================== 工具类型定义 ====================

/**
 * 使属性可选
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * 使属性必需
 */
export type RequiredProps<T, K extends keyof T> = T & globalThis.Required<Pick<T, K>>;

/**
 * 提取事件处理器类型
 */
export type EventHandler<T = Event> = (event: T) => void;

/**
 * 提取组件引用类型
 */
export type ComponentRef<T = HTMLElement> = T | null;

/**
 * 插槽内容类型
 */
export type SlotContent = string | HTMLElement | DocumentFragment;

/**
 * 渲染函数类型
 */
export type RenderFunction<T = any> = (props: T) => SlotContent;

// ==================== 验证类型定义 ====================

/**
 * 验证规则接口
 */
export interface ValidationRule {
  /**
   * 验证器函数
   */
  validator: (value: any) => boolean | Promise<boolean>;

  /**
   * 错误消息
   */
  message: string;

  /**
   * 触发时机
   */
  trigger?: 'change' | 'blur' | 'submit';
}

/**
 * 验证结果接口
 */
export interface ValidationResult {
  /**
   * 是否验证通过
   */
  valid: boolean;

  /**
   * 错误消息列表
   */
  errors: string[];
}

// ==================== 动画类型定义 ====================

/**
 * 动画配置接口
 */
export interface AnimationConfig {
  /**
   * 动画持续时间（毫秒）
   */
  duration?: number;

  /**
   * 动画缓动函数
   */
  easing?: string;

  /**
   * 动画延迟（毫秒）
   */
  delay?: number;

  /**
   * 是否禁用动画
   */
  disabled?: boolean;
}

/**
 * 过渡效果枚举
 */
export type TransitionName =
  | 'fade'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'scale'
  | 'zoom';

// ==================== 响应式类型定义 ====================

/**
 * 断点枚举
 */
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

/**
 * 响应式值类型
 */
export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>;

/**
 * 栅格配置接口
 */
export interface GridConfig {
  /**
   * 列数
   */
  span?: ResponsiveValue<number>;

  /**
   * 偏移量
   */
  offset?: ResponsiveValue<number>;

  /**
   * 排序
   */
  order?: ResponsiveValue<number>;
}

// ==================== 导出所有类型 ====================

export * from './button';
export * from './input';
export * from './card';
export * from './modal';
export * from './table';
export * from './form';
