/**
 * @ldesign/cropper 插件系统类型定义
 * 
 * 定义完整的插件系统类型，支持灵活的插件扩展
 */

import type { EventEmitter, EventTypeMap } from './events';
import type { FullCropperConfig } from './config';

// ============================================================================
// 插件基础类型
// ============================================================================

/**
 * 插件版本接口
 * 定义插件版本信息
 */
export interface PluginVersion {
  /** 主版本号 */
  major: number;
  /** 次版本号 */
  minor: number;
  /** 修订版本号 */
  patch: number;
  /** 预发布版本 */
  prerelease?: string;
  /** 构建元数据 */
  build?: string;
}

/**
 * 插件依赖接口
 * 定义插件依赖关系
 */
export interface PluginDependency {
  /** 依赖插件名称 */
  name: string;
  /** 依赖版本范围 */
  version: string;
  /** 是否为可选依赖 */
  optional?: boolean;
}

/**
 * 插件元数据接口
 * 定义插件的基本信息
 */
export interface PluginMetadata {
  /** 插件名称 */
  name: string;
  /** 插件版本 */
  version: string | PluginVersion;
  /** 插件描述 */
  description?: string;
  /** 插件作者 */
  author?: string;
  /** 插件许可证 */
  license?: string;
  /** 插件主页 */
  homepage?: string;
  /** 插件仓库 */
  repository?: string;
  /** 插件关键词 */
  keywords?: string[];
  /** 插件依赖 */
  dependencies?: PluginDependency[];
  /** 插件分类 */
  category?: PluginCategory;
  /** 插件标签 */
  tags?: string[];
}

/**
 * 插件分类枚举
 * 定义插件的分类
 */
export type PluginCategory = 
  | 'ui'           // UI增强插件
  | 'filter'       // 滤镜插件
  | 'export'       // 导出插件
  | 'gesture'      // 手势插件
  | 'animation'    // 动画插件
  | 'tool'         // 工具插件
  | 'integration'  // 集成插件
  | 'utility'      // 工具类插件
  | 'theme'        // 主题插件
  | 'other';       // 其他插件

// ============================================================================
// 插件生命周期
// ============================================================================

/**
 * 插件生命周期钩子
 * 定义插件在不同阶段的钩子函数
 */
export interface PluginLifecycleHooks {
  /** 插件安装前 */
  beforeInstall?: (cropper: CropperInstance, options: any) => void | Promise<void>;
  /** 插件安装后 */
  afterInstall?: (cropper: CropperInstance, options: any) => void | Promise<void>;
  /** 插件卸载前 */
  beforeUninstall?: (cropper: CropperInstance) => void | Promise<void>;
  /** 插件卸载后 */
  afterUninstall?: (cropper: CropperInstance) => void | Promise<void>;
  /** 裁剪器初始化前 */
  beforeInit?: (cropper: CropperInstance) => void | Promise<void>;
  /** 裁剪器初始化后 */
  afterInit?: (cropper: CropperInstance) => void | Promise<void>;
  /** 裁剪器销毁前 */
  beforeDestroy?: (cropper: CropperInstance) => void | Promise<void>;
  /** 裁剪器销毁后 */
  afterDestroy?: (cropper: CropperInstance) => void | Promise<void>;
}

/**
 * 插件状态枚举
 * 定义插件的状态
 */
export type PluginStatus = 
  | 'registered'   // 已注册
  | 'installing'   // 安装中
  | 'installed'    // 已安装
  | 'active'       // 已激活
  | 'inactive'     // 未激活
  | 'uninstalling' // 卸载中
  | 'error';       // 错误状态

// ============================================================================
// 插件接口定义
// ============================================================================

/**
 * 插件上下文接口
 * 提供给插件的上下文信息
 */
export interface PluginContext {
  /** 裁剪器实例 */
  cropper: CropperInstance;
  /** 插件配置 */
  config: any;
  /** 事件发射器 */
  events: EventEmitter;
  /** 插件管理器 */
  pluginManager: PluginManager;
  /** 工具函数 */
  utils: PluginUtils;
}

/**
 * 插件工具函数接口
 * 提供给插件的工具函数
 */
export interface PluginUtils {
  /** 创建DOM元素 */
  createElement: (tag: string, attributes?: Record<string, any>) => HTMLElement;
  /** 添加CSS类 */
  addClass: (element: HTMLElement, className: string) => void;
  /** 移除CSS类 */
  removeClass: (element: HTMLElement, className: string) => void;
  /** 切换CSS类 */
  toggleClass: (element: HTMLElement, className: string) => void;
  /** 设置样式 */
  setStyle: (element: HTMLElement, styles: Record<string, string>) => void;
  /** 添加事件监听器 */
  addEventListener: (element: HTMLElement, event: string, handler: Function) => void;
  /** 移除事件监听器 */
  removeEventListener: (element: HTMLElement, event: string, handler: Function) => void;
  /** 防抖函数 */
  debounce: (func: Function, delay: number) => Function;
  /** 节流函数 */
  throttle: (func: Function, delay: number) => Function;
  /** 深度合并对象 */
  deepMerge: (target: any, ...sources: any[]) => any;
  /** 深度克隆对象 */
  deepClone: <T>(obj: T) => T;
}

/**
 * 插件API接口
 * 插件可以使用的API
 */
export interface PluginAPI {
  /** 注册命令 */
  registerCommand: (name: string, handler: Function) => void;
  /** 注册工具栏按钮 */
  registerToolbarButton: (button: ToolbarButtonConfig) => void;
  /** 注册菜单项 */
  registerMenuItem: (menu: MenuItemConfig) => void;
  /** 注册快捷键 */
  registerShortcut: (shortcut: ShortcutConfig) => void;
  /** 注册滤镜 */
  registerFilter: (filter: FilterConfig) => void;
  /** 注册导出器 */
  registerExporter: (exporter: ExporterConfig) => void;
  /** 扩展配置 */
  extendConfig: (config: Partial<FullCropperConfig>) => void;
  /** 扩展主题 */
  extendTheme: (theme: ThemeConfig) => void;
}

/**
 * 工具栏按钮配置
 * 插件注册工具栏按钮的配置
 */
export interface ToolbarButtonConfig {
  /** 按钮ID */
  id: string;
  /** 按钮图标 */
  icon: string;
  /** 按钮标题 */
  title: string;
  /** 按钮点击处理函数 */
  onClick: (context: PluginContext) => void;
  /** 按钮位置 */
  position?: 'start' | 'end' | number;
  /** 按钮分组 */
  group?: string;
  /** 是否可见 */
  visible?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
}

/**
 * 菜单项配置
 * 插件注册菜单项的配置
 */
export interface MenuItemConfig {
  /** 菜单项ID */
  id: string;
  /** 菜单项标题 */
  title: string;
  /** 菜单项图标 */
  icon?: string;
  /** 菜单项点击处理函数 */
  onClick: (context: PluginContext) => void;
  /** 父菜单ID */
  parent?: string;
  /** 菜单项位置 */
  position?: number;
  /** 是否为分隔符 */
  separator?: boolean;
}

/**
 * 快捷键配置
 * 插件注册快捷键的配置
 */
export interface ShortcutConfig {
  /** 快捷键组合 */
  key: string;
  /** 快捷键描述 */
  description: string;
  /** 快捷键处理函数 */
  handler: (context: PluginContext) => void;
  /** 是否阻止默认行为 */
  preventDefault?: boolean;
  /** 是否停止传播 */
  stopPropagation?: boolean;
}

/**
 * 滤镜配置
 * 插件注册滤镜的配置
 */
export interface FilterConfig {
  /** 滤镜名称 */
  name: string;
  /** 滤镜显示名称 */
  displayName: string;
  /** 滤镜描述 */
  description?: string;
  /** 滤镜处理函数 */
  process: (imageData: ImageData, options?: any) => ImageData;
  /** 滤镜参数 */
  parameters?: FilterParameter[];
  /** 滤镜预览 */
  preview?: string;
}

/**
 * 滤镜参数配置
 * 滤镜参数的配置
 */
export interface FilterParameter {
  /** 参数名称 */
  name: string;
  /** 参数显示名称 */
  displayName: string;
  /** 参数类型 */
  type: 'number' | 'range' | 'boolean' | 'color' | 'select';
  /** 默认值 */
  defaultValue: any;
  /** 最小值（数值类型） */
  min?: number;
  /** 最大值（数值类型） */
  max?: number;
  /** 步长（数值类型） */
  step?: number;
  /** 选项（选择类型） */
  options?: Array<{ label: string; value: any }>;
}

/**
 * 导出器配置
 * 插件注册导出器的配置
 */
export interface ExporterConfig {
  /** 导出器名称 */
  name: string;
  /** 导出器显示名称 */
  displayName: string;
  /** 支持的格式 */
  formats: string[];
  /** 导出函数 */
  export: (canvas: HTMLCanvasElement, options?: any) => Promise<Blob | string>;
  /** 导出选项 */
  options?: ExporterOption[];
}

/**
 * 导出器选项配置
 * 导出器选项的配置
 */
export interface ExporterOption {
  /** 选项名称 */
  name: string;
  /** 选项显示名称 */
  displayName: string;
  /** 选项类型 */
  type: 'number' | 'range' | 'boolean' | 'select';
  /** 默认值 */
  defaultValue: any;
  /** 最小值（数值类型） */
  min?: number;
  /** 最大值（数值类型） */
  max?: number;
  /** 选项（选择类型） */
  options?: Array<{ label: string; value: any }>;
}

/**
 * 主题配置
 * 插件扩展主题的配置
 */
export interface ThemeConfig {
  /** 主题名称 */
  name: string;
  /** 主题显示名称 */
  displayName: string;
  /** 主题变量 */
  variables: Record<string, string>;
  /** 主题样式 */
  styles?: string;
}

// ============================================================================
// 插件主接口
// ============================================================================

/**
 * 插件接口
 * 定义插件的主要结构
 */
export interface Plugin {
  /** 插件元数据 */
  metadata: PluginMetadata;
  /** 插件生命周期钩子 */
  hooks?: PluginLifecycleHooks;
  /** 插件安装函数 */
  install: (context: PluginContext, api: PluginAPI) => void | Promise<void>;
  /** 插件卸载函数 */
  uninstall?: (context: PluginContext, api: PluginAPI) => void | Promise<void>;
  /** 插件激活函数 */
  activate?: (context: PluginContext, api: PluginAPI) => void | Promise<void>;
  /** 插件停用函数 */
  deactivate?: (context: PluginContext, api: PluginAPI) => void | Promise<void>;
  /** 插件配置验证 */
  validateConfig?: (config: any) => boolean | string[];
  /** 插件默认配置 */
  defaultConfig?: any;
}

/**
 * 插件实例接口
 * 已安装插件的实例
 */
export interface PluginInstance {
  /** 插件定义 */
  plugin: Plugin;
  /** 插件状态 */
  status: PluginStatus;
  /** 插件配置 */
  config: any;
  /** 插件上下文 */
  context: PluginContext;
  /** 插件API */
  api: PluginAPI;
  /** 安装时间 */
  installedAt: Date;
  /** 最后激活时间 */
  lastActivatedAt?: Date;
  /** 错误信息 */
  error?: Error;
}

/**
 * 插件管理器接口
 * 管理插件的注册、安装、卸载等
 */
export interface PluginManager {
  /** 注册插件 */
  register(plugin: Plugin): Promise<void>;
  /** 安装插件 */
  install(name: string, config?: any): Promise<void>;
  /** 卸载插件 */
  uninstall(name: string): Promise<void>;
  /** 激活插件 */
  activate(name: string): Promise<void>;
  /** 停用插件 */
  deactivate(name: string): Promise<void>;
  /** 获取插件实例 */
  getInstance(name: string): PluginInstance | undefined;
  /** 获取所有插件实例 */
  getAllInstances(): PluginInstance[];
  /** 获取已安装的插件列表 */
  getInstalled(): string[];
  /** 获取已激活的插件列表 */
  getActive(): string[];
  /** 检查插件是否已注册 */
  isRegistered(name: string): boolean;
  /** 检查插件是否已安装 */
  isInstalled(name: string): boolean;
  /** 检查插件是否已激活 */
  isActive(name: string): boolean;
  /** 检查插件依赖 */
  checkDependencies(name: string): boolean;
  /** 解析插件依赖 */
  resolveDependencies(name: string): string[];
  /** 更新插件配置 */
  updateConfig(name: string, config: any): Promise<void>;
  /** 重新加载插件 */
  reload(name: string): Promise<void>;
  /** 清理所有插件 */
  cleanup(): Promise<void>;
}

// ============================================================================
// 裁剪器实例接口（简化版）
// ============================================================================

/**
 * 裁剪器实例接口
 * 提供给插件的裁剪器实例接口
 */
export interface CropperInstance {
  /** 获取配置 */
  getConfig(): FullCropperConfig;
  /** 更新配置 */
  updateConfig(config: Partial<FullCropperConfig>): void;
  /** 获取容器元素 */
  getContainer(): HTMLElement;
  /** 获取Canvas元素 */
  getCanvas(): HTMLCanvasElement;
  /** 获取当前图片 */
  getImage(): HTMLImageElement | null;
  /** 设置图片 */
  setImage(src: string | File | HTMLImageElement): Promise<void>;
  /** 获取裁剪区域 */
  getCropArea(): any;
  /** 设置裁剪区域 */
  setCropArea(area: any): void;
  /** 获取裁剪结果 */
  getCroppedCanvas(): HTMLCanvasElement;
  /** 重置裁剪器 */
  reset(): void;
  /** 销毁裁剪器 */
  destroy(): void;
  /** 事件发射器 */
  events: EventEmitter;
  /** 插件管理器 */
  plugins: PluginManager;
}
