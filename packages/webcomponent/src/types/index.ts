/**
 * 通用类型定义
 */

/**
 * 组件尺寸类型
 */
// 对齐 Ant Design：使用 middle；保留 medium 兼容
export type Size = 'small' | 'middle' | 'large' | 'medium';

/**
 * 按钮类型（表现形态）
 * - primary/secondary/success/warning/danger 等通常表示实底（solid）按钮
 * - outline/text/link/dashed 表示样式形态
 */
// 对齐 Ant Design：新增 default；保留旧类型以兼容
export type ButtonType = 'default' | 'primary' | 'secondary' | 'outline' | 'text' | 'danger' | 'success' | 'warning' | 'link' | 'dashed' | 'gradient';

/**
 * 按钮颜色（语义色），用于 outline/dashed/text/link/ghost
 */
export type ButtonColor = 'default' | 'primary' | 'success' | 'warning' | 'danger';

/**
 * 按钮形状
 */
export type ButtonShape = 'default' | 'rectangle' | 'round' | 'circle' | 'square';

/**
 * 图标位置
 */
export type ButtonIconPosition = 'start' | 'end';

/**
 * 原生按钮类型
 */
export type NativeButtonType = 'button' | 'submit' | 'reset';

/**
 * 输入框类型
 */
export type InputType = 'text' | 'password' | 'textarea' | 'email' | 'number' | 'tel' | 'url';

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
  /**
   * 对齐 AntD：危险态（红色语义）
   */
  danger?: boolean;
  /**
   * 颜色（语义色）：用于 outline / dashed / text / link / ghost
   * 注意：对齐 AntD 后不再推荐直接使用 color 控制主类型颜色，仅用于上述形态或兼容用途
   */
  color?: ButtonColor;
  size?: Size;
  shape?: ButtonShape;
  loading?: boolean;
  icon?: string;
  block?: boolean;
  iconPosition?: ButtonIconPosition;
  /**
   * 原生按钮类型（对齐 AntD：htmlType）。两者任选其一，优先 htmlType。
   */
  htmlType?: NativeButtonType;
  nativeType?: NativeButtonType;
  /**
   * 幽灵按钮（一般用于深色背景）
   */
  ghost?: boolean;
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
  showPassword?: boolean;
  prefixIcon?: string;
  suffixIcon?: string;
  maxlength?: number;
  minlength?: number;
  autosize?: boolean;
  rows?: number;
  onInput?: EventHandler<string>;
  onChange?: EventHandler<string>;
  onFocus?: EventHandler;
  onBlur?: EventHandler;
  onClear?: EventHandler;
}

/**
 * 复选框组件属性
 */
export interface CheckboxProps extends BaseComponentProps {
  checked?: boolean;
  indeterminate?: boolean;
  value?: string | number;
  border?: boolean;
  button?: boolean;
  size?: Size;
  onChange?: EventHandler<boolean>;
}

/**
 * 单选框组件属性
 */
export interface RadioProps extends BaseComponentProps {
  checked?: boolean;
  value?: string | number;
  name?: string;
  border?: boolean;
  button?: boolean;
  size?: Size;
  onChange?: EventHandler<string | number>;
}

/**
 * 开关组件属性
 */
export interface SwitchProps extends BaseComponentProps {
  checked?: boolean;
  checkedValue?: string | number | boolean;
  uncheckedValue?: string | number | boolean;
  loading?: boolean;
  size?: Size;
  checkedText?: string;
  uncheckedText?: string;
  checkedIcon?: string;
  uncheckedIcon?: string;
  onChange?: EventHandler<string | number | boolean>;
}

/**
 * 图标组件属性
 */
export interface IconProps extends BaseComponentProps {
  name: string;
  size?: Size | number;
  color?: string;
  spin?: boolean;
  animation?: 'spin' | 'pulse' | 'bounce' | 'flash' | 'shake' | 'none';
  strokeWidth?: number;
  rotate?: number;
  flip?: 'horizontal' | 'vertical' | 'both';
  gradient?: boolean;
  gradientColors?: string | string[];
  gradientDirection?: 'horizontal' | 'vertical' | 'diagonal';
  label?: string;
  decorative?: boolean;
  customSvg?: string;
}

/**
 * 提及项接口
 */
export interface MentionItem {
  /**
   * 唯一标识
   */
  value: string | number;
  
  /**
   * 显示文本
   */
  label: string;
  
  /**
   * 头像URL
   */
  avatar?: string;
  
  /**
   * 描述信息
   */
  description?: string;
  
  /**
   * 是否禁用
   */
  disabled?: boolean;
  
  /**
   * 标签外观类型（影响 token 样式）
   */
  tagType?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  
  /**
   * 标签是否可关闭（优先级高于组件级 closable）
   */
  closable?: boolean;
  
  /** 自定义类名 */
  className?: string;
  /** 自定义内联样式（字符串） */
  style?: string;
  
  /**
   * 额外数据
   */
  data?: any;
}

/**
 * 提及组件属性
 */
export interface MentionTriggerConfig {
  char: string; // 触发字符
  options?: MentionItem[]; // 专属候选
  tokenType?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  closable?: boolean;
}

export interface MentionEntity {
  value: string | number;
  label: string;
  trigger: string; // '@' | '#'
  start: number;  // 在可见文本中的起始位置（包含触发符）
  length: number; // 触发符+label 的长度
  extra?: any;
}
export type MentionSegment =
  | { type: 'text'; text: string }
  | { type: 'mention'; trigger: string; label: string; value: string | number; extra?: any };
export interface MentionModel {
  text: string;
  mentions: MentionEntity[];
}

export interface MentionProps extends BaseComponentProps {
  /** 当前值（受控，纯文本） */
  value?: string;
  /** 默认值（非受控，纯文本） */
  defaultValue?: string;

  /** 结构化初始化（分段） */
  model?: MentionSegment[] | string; // 支持 JSON 字符串
  /** 结构化初始化（模型） */
  valueModel?: MentionModel | string; // 支持 JSON 字符串
  /** 事件/受控值格式（默认 model） */
  valueFormat?: 'model' | 'segments' | 'text';
  
  /** 触发字符（兼容旧属性） */
  trigger?: string;
  /** 多个触发字符 */
  triggers?: string | string[];
  /** 触发符个性化配置 */
  triggerConfigs?: MentionTriggerConfig[] | string; // 可传 JSON 字符串
  
  /** 默认 token 类型 */
  tokenType?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  /** 是否默认可关闭 */
  closable?: boolean;
  
  /**
   * 初始解析：将文本中的 @Alice/#Topic 等转为 token
   */
  parseOnInit?: boolean;
  /**
   * 解析策略：
   * - 'label' 直接使用紧随触发符的文本作为标签
   * - 'options' 仅当在对应触发符的 options 中能找到同名 label 才解析为 token
   */
  parseStrategy?: 'label' | 'options';
  
  /**
   * 提及项数据
   */
  options?: MentionItem[];
  
  /**
   * 输入框占位符
   */
  placeholder?: string;
  
  /**
   * 是否只读
   */
  readonly?: boolean;
  
  /**
   * 是否自动获取焦点
   */
  autofocus?: boolean;
  
  /**
   * 最大行数
   */
  rows?: number;
  
  /**
   * 是否可调整大小
   */
  resizable?: boolean;
  
  /**
   * 过滤函数
   */
  filterOption?: (input: string, option: MentionItem) => boolean;
  
  /**
   * 是否支持多行
   */
  multiline?: boolean;
  
  /**
   * 弹出层的挂载容器
   */
  getPopupContainer?: () => HTMLElement;
  
  /**
   * 加载状态
   */
  loading?: boolean;
  
  /**
   * 下拉面板最大高度
   */
  maxHeight?: number;
  
  /**
   * 搜索事件
   */
  onSearch?: EventHandler<{ value: string; trigger: string }>;
  
  /**
   * 选择事件
   */
  onSelect?: EventHandler<{ value: MentionItem; trigger: string }>;
  
  /**
   * 内容变化事件
   */
  onChange?: EventHandler<string>;
  
  /**
   * 获得焦点事件
   */
  onFocus?: EventHandler<FocusEvent>;
  
  /**
   * 失去焦点事件
   */
  onBlur?: EventHandler<FocusEvent>;
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
