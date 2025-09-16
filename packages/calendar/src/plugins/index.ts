/**
 * 插件系统主入口
 */

export { PluginManager } from './PluginManager'
export { TimePickerPlugin } from './TimePicker'
export { ExportPlugin } from './Export'
export { ReminderPlugin } from './Reminder'
export { DragDropPlugin } from './DragDrop'
export { KeyboardPlugin } from './Keyboard'

// 插件接口
export type { CalendarPlugin, PluginContext, PluginOptions } from './types'

// 默认插件集合
export const defaultPlugins = [
  'DragDropPlugin',
  'KeyboardPlugin'
] as const

/**
 * 创建插件实例的工厂函数
 */
export function createPlugin(name: string, options?: any) {
  switch (name) {
    case 'TimePickerPlugin':
      return new TimePickerPlugin(options)
    case 'ExportPlugin':
      return new ExportPlugin(options)
    case 'ReminderPlugin':
      return new ReminderPlugin(options)
    case 'DragDropPlugin':
      return new DragDropPlugin(options)
    case 'KeyboardPlugin':
      return new KeyboardPlugin(options)
    default:
      throw new Error(`Unknown plugin: ${name}`)
  }
}
