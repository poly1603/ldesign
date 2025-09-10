/**
 * 核心模块导出
 * 导出编辑器的核心组件和功能
 */

export { EventManager } from './event-manager'
export { SelectionManager } from './selection-manager'
export { CommandManager } from './command-manager'
export { EditorStateManager } from './editor-state'
export { PluginManager } from './plugin-manager'
export { MediaManager } from './media-manager'
export { LDesignEditor } from './editor'

// 重新导出类型
export type {
  IEditor,
  IEventManager,
  ISelectionManager,
  ICommandManager,
  IPluginManager,
  IPlugin,
  EditorOptions,
  EditorState,
  HistoryState,
  HistoryEntry,
  Selection,
  Range,
  Position,
  Command,
  CommandResult,
  EventType,
  EventListener,
  EditorEvent,
  PluginState,
  DeviceType
} from '../types'
