/**
 * 格式化相关插件导出
 */

// 重新导出所有插件
export * from './formatting'
export * from './align'
export * from './indent'
export * from './text-transform'
export * from './font'
export * from './color'
export * from './line-height'
export * from './script'


// Export all formatting plugins as array
export const formattingPlugins = []

export { default as FormattingCommandsPlugin } from './formatting-commands'
