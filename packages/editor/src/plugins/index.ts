/**
 * 插件模块导出
 * 导出所有插件相关的类和功能
 */

// 导出基础插件类
export { BasePlugin } from './base-plugin'

// 导出格式化插件
export { 
  BoldPlugin, 
  ItalicPlugin, 
  UnderlinePlugin,
  StrikethroughPlugin,
  SuperscriptPlugin,
  SubscriptPlugin,
  CodePlugin
} from './format'

// 导出对齐插件
export {
  AlignLeftPlugin,
  AlignCenterPlugin,
  AlignRightPlugin,
  AlignJustifyPlugin
} from './align'

// 导出块级插件
export { HeadingPlugin, ListPlugin, BlockquotePlugin } from './block'

// 导出表格插件
export { TablePlugin } from './table'
export type { TableConfig } from './table'

// 导出搜索替换插件
export { SearchReplacePlugin } from './search-replace'
export type { SearchReplaceConfig, SearchResult } from './search-replace'

// 导出插件注册表
export {
  PluginRegistry,
  getPlugin,
  isPluginAvailable,
  getAvailablePlugins
} from './plugin-registry'

// 重新导出插件相关类型
export type { IPlugin, PluginState } from '../types'
