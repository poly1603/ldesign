/**
 * @ldesign/cropper UI组件类型定义
 * 
 * 定义UI组件系统相关的所有类型接口
 */

import type { Point, Size } from './index';

// ============================================================================
// 基础UI类型
// ============================================================================

/**
 * UI组件基础接口
 */
export interface UIComponent {
  /** 组件ID */
  id: string;
  /** 组件类型 */
  type: string;
  /** 是否可见 */
  visible: boolean;
  /** 是否启用 */
  enabled: boolean;
  /** 组件位置 */
  position?: Point;
  /** 组件尺寸 */
  size?: Size;
  /** CSS类名 */
  className?: string;
  /** 内联样式 */
  style?: Record<string, string>;
  /** 组件属性 */
  attributes?: Record<string, string>;
}

/**
 * 按钮组件接口
 */
export interface ButtonComponent extends UIComponent {
  type: 'button';
  /** 按钮文本 */
  text?: string;
  /** 按钮图标 */
  icon?: string;
  /** 按钮类型 */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  /** 按钮尺寸 */
  buttonSize?: 'small' | 'medium' | 'large';
  /** 是否加载中 */
  loading?: boolean;
  /** 点击事件处理器 */
  onClick?: (event: MouseEvent) => void;
}

/**
 * 面板组件接口
 */
export interface PanelComponent extends UIComponent {
  type: 'panel';
  /** 面板标题 */
  title?: string;
  /** 是否可折叠 */
  collapsible?: boolean;
  /** 是否已折叠 */
  collapsed?: boolean;
  /** 面板内容 */
  content?: UIComponent[];
  /** 面板位置 */
  placement?: 'top' | 'right' | 'bottom' | 'left' | 'center';
}

/**
 * 工具栏组件接口
 */
export interface ToolbarComponent extends UIComponent {
  type: 'toolbar';
  /** 工具栏方向 */
  orientation?: 'horizontal' | 'vertical';
  /** 工具栏项目 */
  items?: ToolbarItem[];
  /** 是否显示分隔符 */
  showSeparators?: boolean;
}

/**
 * 工具栏项目接口
 */
export interface ToolbarItem {
  /** 项目ID */
  id: string;
  /** 项目类型 */
  type: 'button' | 'separator' | 'group' | 'custom';
  /** 按钮配置（当type为button时） */
  button?: Omit<ButtonComponent, 'id' | 'type'>;
  /** 分组项目（当type为group时） */
  items?: ToolbarItem[];
  /** 自定义内容（当type为custom时） */
  content?: string | HTMLElement;
  /** 是否可见 */
  visible?: boolean;
  /** 是否启用 */
  enabled?: boolean;
}

/**
 * 滑块组件接口
 */
export interface SliderComponent extends UIComponent {
  type: 'slider';
  /** 最小值 */
  min: number;
  /** 最大值 */
  max: number;
  /** 当前值 */
  value: number;
  /** 步长 */
  step?: number;
  /** 是否显示标签 */
  showLabels?: boolean;
  /** 是否显示刻度 */
  showTicks?: boolean;
  /** 值变化事件处理器 */
  onChange?: (value: number) => void;
}

/**
 * 输入框组件接口
 */
export interface InputComponent extends UIComponent {
  type: 'input';
  /** 输入类型 */
  inputType?: 'text' | 'number' | 'email' | 'password';
  /** 占位符 */
  placeholder?: string;
  /** 当前值 */
  value?: string | number;
  /** 是否只读 */
  readonly?: boolean;
  /** 最小值（数字输入） */
  min?: number;
  /** 最大值（数字输入） */
  max?: number;
  /** 值变化事件处理器 */
  onChange?: (value: string | number) => void;
}

/**
 * 选择器组件接口
 */
export interface SelectComponent extends UIComponent {
  type: 'select';
  /** 选项列表 */
  options: SelectOption[];
  /** 当前选中值 */
  value?: string | number;
  /** 占位符 */
  placeholder?: string;
  /** 是否可搜索 */
  searchable?: boolean;
  /** 是否多选 */
  multiple?: boolean;
  /** 值变化事件处理器 */
  onChange?: (value: string | number | (string | number)[]) => void;
}

/**
 * 选择器选项接口
 */
export interface SelectOption {
  /** 选项值 */
  value: string | number;
  /** 选项标签 */
  label: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 选项图标 */
  icon?: string;
}

/**
 * 开关组件接口
 */
export interface SwitchComponent extends UIComponent {
  type: 'switch';
  /** 是否选中 */
  checked: boolean;
  /** 开关标签 */
  label?: string;
  /** 开关尺寸 */
  switchSize?: 'small' | 'medium' | 'large';
  /** 值变化事件处理器 */
  onChange?: (checked: boolean) => void;
}

/**
 * 提示组件接口
 */
export interface TooltipComponent extends UIComponent {
  type: 'tooltip';
  /** 提示内容 */
  content: string;
  /** 提示位置 */
  placement?: 'top' | 'right' | 'bottom' | 'left';
  /** 触发方式 */
  trigger?: 'hover' | 'click' | 'focus';
  /** 目标元素 */
  target?: HTMLElement | string;
}

/**
 * 模态框组件接口
 */
export interface ModalComponent extends UIComponent {
  type: 'modal';
  /** 模态框标题 */
  title?: string;
  /** 模态框内容 */
  content?: UIComponent[] | string | HTMLElement;
  /** 是否显示关闭按钮 */
  closable?: boolean;
  /** 是否点击遮罩关闭 */
  maskClosable?: boolean;
  /** 模态框宽度 */
  width?: number | string;
  /** 模态框高度 */
  height?: number | string;
  /** 关闭事件处理器 */
  onClose?: () => void;
}

// ============================================================================
// 裁剪器专用UI组件
// ============================================================================

/**
 * 裁剪工具栏组件接口
 */
export interface CropToolbarComponent extends ToolbarComponent {
  /** 显示的工具 */
  tools?: CropTool[];
  /** 工具分组 */
  groups?: CropToolGroup[];
}

/**
 * 裁剪工具类型
 */
export type CropTool = 
  | 'select'      // 选择工具
  | 'move'        // 移动工具
  | 'zoom'        // 缩放工具
  | 'rotate'      // 旋转工具
  | 'flip'        // 翻转工具
  | 'reset'       // 重置工具
  | 'undo'        // 撤销工具
  | 'redo'        // 重做工具
  | 'crop'        // 裁剪工具
  | 'export'      // 导出工具
  | 'fullscreen'  // 全屏工具
  | 'settings';   // 设置工具

/**
 * 裁剪工具分组接口
 */
export interface CropToolGroup {
  /** 分组ID */
  id: string;
  /** 分组名称 */
  name: string;
  /** 分组工具 */
  tools: CropTool[];
  /** 是否可折叠 */
  collapsible?: boolean;
  /** 是否已折叠 */
  collapsed?: boolean;
}

/**
 * 控制面板组件接口
 */
export interface ControlPanelComponent extends PanelComponent {
  /** 面板类型 */
  panelType?: 'crop' | 'transform' | 'filter' | 'export' | 'settings';
  /** 面板配置 */
  config?: ControlPanelConfig;
}

/**
 * 控制面板配置接口
 */
export interface ControlPanelConfig {
  /** 显示的控制项 */
  controls?: ControlItem[];
  /** 是否显示预设 */
  showPresets?: boolean;
  /** 是否显示高级选项 */
  showAdvanced?: boolean;
  /** 面板布局 */
  layout?: 'vertical' | 'horizontal' | 'grid';
}

/**
 * 控制项接口
 */
export interface ControlItem {
  /** 控制项ID */
  id: string;
  /** 控制项类型 */
  type: 'slider' | 'input' | 'select' | 'switch' | 'button' | 'color';
  /** 控制项标签 */
  label: string;
  /** 控制项配置 */
  config?: any;
  /** 是否可见 */
  visible?: boolean;
  /** 是否启用 */
  enabled?: boolean;
}

/**
 * 状态指示器组件接口
 */
export interface StatusIndicatorComponent extends UIComponent {
  type: 'status';
  /** 状态类型 */
  status?: 'loading' | 'success' | 'error' | 'warning' | 'info';
  /** 状态消息 */
  message?: string;
  /** 是否显示图标 */
  showIcon?: boolean;
  /** 是否自动隐藏 */
  autoHide?: boolean;
  /** 自动隐藏延迟（毫秒） */
  hideDelay?: number;
}

/**
 * 进度条组件接口
 */
export interface ProgressComponent extends UIComponent {
  type: 'progress';
  /** 当前进度（0-100） */
  progress: number;
  /** 是否显示百分比 */
  showPercent?: boolean;
  /** 进度条类型 */
  progressType?: 'line' | 'circle' | 'dashboard';
  /** 进度条状态 */
  status?: 'normal' | 'success' | 'error' | 'warning';
}

// ============================================================================
// UI事件类型
// ============================================================================

/**
 * UI事件类型
 */
export type UIEventType =
  | 'click'
  | 'hover'
  | 'focus'
  | 'blur'
  | 'change'
  | 'input'
  | 'submit'
  | 'reset'
  | 'show'
  | 'hide'
  | 'open'
  | 'close'
  | 'expand'
  | 'collapse';

/**
 * UI事件接口
 */
export interface UIEvent {
  /** 事件类型 */
  type: UIEventType;
  /** 事件目标组件 */
  target: UIComponent;
  /** 事件数据 */
  data?: any;
  /** 原始DOM事件 */
  originalEvent?: Event;
  /** 事件时间戳 */
  timestamp: number;
}

/**
 * UI事件处理器类型
 */
export type UIEventHandler = (event: UIEvent) => void;

// ============================================================================
// UI布局类型
// ============================================================================

/**
 * 布局类型
 */
export type LayoutType = 'fixed' | 'flex' | 'grid' | 'absolute' | 'relative';

/**
 * 布局配置接口
 */
export interface LayoutConfig {
  /** 布局类型 */
  type: LayoutType;
  /** 布局方向（flex布局） */
  direction?: 'row' | 'column';
  /** 主轴对齐（flex布局） */
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  /** 交叉轴对齐（flex布局） */
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  /** 网格模板列（grid布局） */
  gridTemplateColumns?: string;
  /** 网格模板行（grid布局） */
  gridTemplateRows?: string;
  /** 网格间距 */
  gap?: number | string;
  /** 内边距 */
  padding?: number | string;
  /** 外边距 */
  margin?: number | string;
}

/**
 * 响应式断点
 */
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

/**
 * 响应式配置接口
 */
export interface ResponsiveConfig {
  /** 断点配置 */
  [key in Breakpoint]?: Partial<UIComponent>;
}

// ============================================================================
// UI主题集成
// ============================================================================

/**
 * UI主题配置接口
 */
export interface UIThemeConfig {
  /** 组件样式映射 */
  components: {
    [componentType: string]: ComponentTheme;
  };
  /** 全局样式变量 */
  variables: Record<string, string>;
  /** 响应式断点 */
  breakpoints: Record<Breakpoint, number>;
}

/**
 * 组件主题配置接口
 */
export interface ComponentTheme {
  /** 基础样式 */
  base?: Record<string, string>;
  /** 变体样式 */
  variants?: Record<string, Record<string, string>>;
  /** 尺寸样式 */
  sizes?: Record<string, Record<string, string>>;
  /** 状态样式 */
  states?: Record<string, Record<string, string>>;
}

/**
 * UI组件联合类型
 */
export type AnyUIComponent = 
  | ButtonComponent
  | PanelComponent
  | ToolbarComponent
  | SliderComponent
  | InputComponent
  | SelectComponent
  | SwitchComponent
  | TooltipComponent
  | ModalComponent
  | CropToolbarComponent
  | ControlPanelComponent
  | StatusIndicatorComponent
  | ProgressComponent;
