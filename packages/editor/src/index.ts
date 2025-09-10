/**
 * LDesign Editor 主入口文件
 * 导出编辑器的所有公共API
 */

// 导出主编辑器类
export { LDesignEditor } from './core/editor'

// 导出核心模块
export {
  EventManager,
  SelectionManager,
  CommandManager,
  EditorStateManager,
  PluginManager
} from './core'

// 导出工具函数
export {
  getElement,
  createElement,
  hasClass,
  addClass,
  removeClass,
  toggleClass,
  getCurrentSelection,
  getSelectionRange,
  setSelectionRange,
  createRange,
  isSelectionInElement,
  isMobile,
  isTablet,
  isDesktop,
  isTouchDevice,
  getDeviceType,
  escapeHtml,
  unescapeHtml,
  stripHtml,
  generateId,
  debounce,
  throttle,
  deepClone
} from './utils'

// 导出所有类型定义
export type {
  // 编辑器相关类型
  IEditor,
  EditorOptions,
  EditorState,

  // 管理器接口
  IEventManager,
  ISelectionManager,
  ICommandManager,
  IPluginManager,

  // 插件相关类型
  IPlugin,
  PluginState,

  // 选区和范围类型
  Selection,
  Range,
  Position,

  // 命令系统类型
  Command,
  CommandResult,

  // 事件系统类型
  EventType,
  EventListener,
  EditorEvent,

  // 历史记录类型
  HistoryState,
  HistoryEntry,

  // 配置类型
  ThemeConfig,
  BreakpointConfig,
  ToolbarConfig,
  ToolbarItem,
  ToolbarGroup,
  ToolbarSeparator,

  // 枚举类型
  DeviceType
} from './types'

// 导入主编辑器类用于默认导出
import { LDesignEditor } from './core/editor'

// 默认导出主编辑器类
export { LDesignEditor as default }

/**
 * 创建编辑器实例的便捷函数
 * @param options 编辑器配置选项
 * @returns 编辑器实例
 */
export function createEditor(options: import('./types').EditorOptions): LDesignEditor {
  return new LDesignEditor(options)
}

/**
 * 编辑器版本信息
 */
export const version = '1.0.0'

/**
 * 编辑器信息
 */
export const editorInfo = {
  name: 'LDesign Editor',
  version,
  description: 'A feature-rich rich text editor with plugin system and theme support',
  author: 'LDesign Team',
  license: 'MIT'
} as const
