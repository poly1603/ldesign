/**
 * 插件入口文件
 * 导出所有内置插件
 */

// 基础插件类
export { BasePlugin, UIPlugin, ControlPlugin, OverlayPlugin } from '../core/base-plugin'

// 弹幕插件
export { DanmakuPlugin } from './danmaku'
export type { DanmakuOptions } from './danmaku'

// 字幕插件
export { SubtitlePlugin } from './subtitle'
export type { SubtitleOptions } from './subtitle'

// 截图插件
export { ScreenshotPlugin } from './screenshot'
export type { ScreenshotOptions, ScreenshotConfig } from './screenshot'

// 画中画插件
export { PipPlugin } from './pip'
export type { PipOptions, PipConfig } from './pip'



/**
 * 内置插件注册表
 */
export const BUILTIN_PLUGINS = {
  get danmaku() { return DanmakuPlugin },
  get subtitle() { return SubtitlePlugin },
  get screenshot() { return ScreenshotPlugin },
  get pip() { return PipPlugin }
} as const

/**
 * 插件类型定义
 */
export type BuiltinPluginName = keyof typeof BUILTIN_PLUGINS
export type BuiltinPluginConstructor = typeof BUILTIN_PLUGINS[BuiltinPluginName]

/**
 * 创建插件实例的工厂函数
 */
export function createPlugin<T extends BuiltinPluginName>(
  name: T,
  options?: any
): InstanceType<typeof BUILTIN_PLUGINS[T]> {
  const PluginConstructor = BUILTIN_PLUGINS[name]
  if (!PluginConstructor) {
    throw new Error(`Unknown plugin: ${name}`)
  }

  return new PluginConstructor(options) as InstanceType<typeof BUILTIN_PLUGINS[T]>
}

/**
 * 获取插件默认配置
 */
export function getPluginDefaults(name: BuiltinPluginName): any {
  const PluginConstructor = BUILTIN_PLUGINS[name]
  if (!PluginConstructor) {
    throw new Error(`Unknown plugin: ${name}`)
  }

  // 返回插件的默认配置
  return (PluginConstructor as any).defaults || {}
}

/**
 * 检查插件是否可用
 */
export function isPluginAvailable(name: BuiltinPluginName): boolean {
  try {
    const PluginConstructor = BUILTIN_PLUGINS[name]
    return !!PluginConstructor && typeof PluginConstructor === 'function'
  } catch {
    return false
  }
}

/**
 * 获取所有可用插件名称
 */
export function getAvailablePlugins(): BuiltinPluginName[] {
  return Object.keys(BUILTIN_PLUGINS) as BuiltinPluginName[]
}

/**
 * 批量创建插件实例
 */
export function createPlugins(configs: Array<{ name: BuiltinPluginName; options?: any }>) {
  return configs.map(({ name, options }) => createPlugin(name, options))
}
