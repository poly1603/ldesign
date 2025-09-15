/**
 * @ldesign/calendar - 功能完整的日历组件库
 *
 * 主要特性：
 * - 多视图支持（月、周、日视图）
 * - 事件管理（添加、编辑、删除）
 * - 国际化支持
 * - 农历显示
 * - 节假日标记
 * - 事件拖拽
 * - 键盘导航
 * - 响应式设计
 * - 插件系统
 * - 主题系统
 * - 性能优化
 */

// 导入样式文件
import './styles/index.less'

// 核心类和接口
export { Calendar } from './core/calendar'
export { EventManager } from './core/event-manager'
export { StateManager } from './core/state-manager'

// 交互管理器
export { ContextMenuManager } from './core/context-menu-manager'
export { DragDropManager } from './core/drag-drop-manager'
export { KeyboardManager } from './core/keyboard-manager'
export type { ContextMenuItem, ContextMenuConfig, ContextMenuContext } from './core/context-menu-manager'
export type { DragContext, DragDropConfig, DragType } from './core/drag-drop-manager'
export type { KeyboardShortcut, KeyboardConfig } from './core/keyboard-manager'

// 视图组件
export { MonthView } from './views/month-view'
export { WeekView } from './views/week-view'
export { DayView } from './views/day-view'
export { BaseView } from './views/base-view'

// 插件系统
export { PluginManager } from './plugins/plugin-manager'
export * from './plugins/time-picker'
export * from './plugins/event-reminder'
export * from './plugins/export'

// 主题系统
export * from './themes'
export { ThemeSwitcher } from './components/theme-switcher'
export type { ThemeSwitcherConfig } from './components/theme-switcher'

// 工具函数
export * from './utils/date-utils'
export * from './utils/i18n'
export * from './utils/lunar'
export * from './utils/holidays'
export * from './utils/dom'

// 类型定义
export * from './types/calendar'
export * from './types/event'
export * from './types/plugin'
export * from './types/theme'
export * from './types/view'

// 默认导出
export { Calendar as default } from './core/calendar'
