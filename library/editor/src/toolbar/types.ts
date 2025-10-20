/**
 * 工具栏类型定义
 * 支持完整的配置化和自定义功能
 */

import type { Editor } from '../core/Editor'

/**
 * 工具栏项类型
 */
export type ToolbarItemType = 
  | 'button' 
  | 'dropdown' 
  | 'separator' 
  | 'group' 
  | 'custom'
  | 'color-picker'
  | 'input'
  | 'toggle'

/**
 * 工具栏项配置
 */
export interface ToolbarItemConfig {
  /** 唯一标识 */
  id: string
  
  /** 类型 */
  type?: ToolbarItemType
  
  /** 显示标签 */
  label?: string
  
  /** 工具提示 */
  tooltip?: string
  
  /** 图标配置 */
  icon?: IconConfig | string
  
  /** 是否显示 */
  visible?: boolean
  
  /** 是否启用 */
  enabled?: boolean | ((editor: Editor) => boolean)
  
  /** 是否激活状态 */
  active?: boolean | ((editor: Editor) => boolean)
  
  /** 执行动作 */
  action?: (editor: Editor, value?: any) => void
  
  /** 键盘快捷键 */
  shortcut?: string
  
  /** 自定义渲染器 */
  render?: (config: ToolbarItemConfig, editor: Editor) => HTMLElement
  
  /** 子项（用于下拉菜单） */
  items?: ToolbarItemConfig[]
  
  /** 懒加载配置 */
  lazy?: LazyLoadConfig
  
  /** 样式类名 */
  className?: string
  
  /** 自定义样式 */
  style?: Partial<CSSStyleDeclaration>
  
  /** 扩展数据 */
  data?: Record<string, any>
}

/**
 * 图标配置
 */
export interface IconConfig {
  /** 图标名称 */
  name?: string
  
  /** SVG内容 */
  svg?: string
  
  /** 图标URL */
  url?: string
  
  /** CSS类名 */
  className?: string
  
  /** 图标大小 */
  size?: number
  
  /** 图标颜色 */
  color?: string
}

/**
 * 懒加载配置
 */
export interface LazyLoadConfig {
  /** 是否启用懒加载 */
  enabled?: boolean
  
  /** 加载器函数 */
  loader?: () => Promise<ToolbarItemConfig>
  
  /** 加载时显示的占位符 */
  placeholder?: string | HTMLElement
  
  /** 预加载（鼠标悬停时加载） */
  preload?: boolean
  
  /** 加载超时时间 */
  timeout?: number
}

/**
 * 工具栏组配置
 */
export interface ToolbarGroupConfig {
  /** 组ID */
  id: string
  
  /** 组标签 */
  label?: string
  
  /** 组内项目 */
  items: (string | ToolbarItemConfig)[]
  
  /** 是否可折叠 */
  collapsible?: boolean
  
  /** 默认是否折叠 */
  collapsed?: boolean
  
  /** 显示条件 */
  visible?: boolean | ((editor: Editor) => boolean)
  
  /** 排序优先级 */
  priority?: number
  
  /** 样式 */
  style?: 'default' | 'compact' | 'minimal'
}

/**
 * 工具栏配置
 */
export interface ToolbarConfig {
  /** 工具栏项配置 */
  items?: (string | ToolbarItemConfig | ToolbarGroupConfig)[]
  
  /** 位置 */
  position?: 'top' | 'bottom' | 'float' | 'sticky'
  
  /** 主题 */
  theme?: 'light' | 'dark' | 'auto'
  
  /** 大小 */
  size?: 'small' | 'medium' | 'large'
  
  /** 是否显示标签 */
  showLabels?: boolean
  
  /** 是否显示工具提示 */
  showTooltips?: boolean
  
  /** 是否启用懒加载 */
  lazyLoad?: boolean
  
  /** 是否启用虚拟滚动 */
  virtualScroll?: boolean
  
  /** 最大可见项数 */
  maxVisibleItems?: number
  
  /** 溢出处理 */
  overflow?: 'scroll' | 'menu' | 'wrap'
  
  /** 自定义类名 */
  className?: string
  
  /** 自定义样式 */
  style?: Partial<CSSStyleDeclaration>
  
  /** 扩展配置 */
  extensions?: ToolbarExtension[]
}

/**
 * 工具栏扩展
 */
export interface ToolbarExtension {
  /** 扩展名称 */
  name: string
  
  /** 初始化函数 */
  init?: (toolbar: any, editor: Editor) => void
  
  /** 注册项目 */
  items?: ToolbarItemConfig[]
  
  /** 注册组 */
  groups?: ToolbarGroupConfig[]
  
  /** 依赖的其他扩展 */
  dependencies?: string[]
}

/**
 * 工具栏事件
 */
export interface ToolbarEvents {
  'item:click': { id: string; value?: any }
  'item:loaded': { id: string }
  'item:error': { id: string; error: Error }
  'group:toggle': { id: string; collapsed: boolean }
  'toolbar:ready': void
  'toolbar:destroy': void
}

/**
 * 预设配置
 */
export interface ToolbarPreset {
  name: string
  label: string
  description?: string
  config: ToolbarConfig
  items: ToolbarItemConfig[]
}

/**
 * 工具栏管理器接口
 */
export interface IToolbarManager {
  /** 注册工具栏项 */
  register(item: ToolbarItemConfig): void
  
  /** 批量注册 */
  registerBatch(items: ToolbarItemConfig[]): void
  
  /** 注册组 */
  registerGroup(group: ToolbarGroupConfig): void
  
  /** 获取项目 */
  getItem(id: string): ToolbarItemConfig | undefined
  
  /** 更新项目 */
  updateItem(id: string, updates: Partial<ToolbarItemConfig>): void
  
  /** 删除项目 */
  removeItem(id: string): void
  
  /** 显示/隐藏项目 */
  setItemVisibility(id: string, visible: boolean): void
  
  /** 启用/禁用项目 */
  setItemEnabled(id: string, enabled: boolean): void
  
  /** 加载预设 */
  loadPreset(preset: string | ToolbarPreset): void
  
  /** 渲染 */
  render(): HTMLElement
  
  /** 销毁 */
  destroy(): void
}