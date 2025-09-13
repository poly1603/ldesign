/**
 * @ldesign/video 主入口文件
 * 导出所有公共API
 */

// 核心播放器
export { VideoPlayer, PlayerControls } from './core'
export type { ControlsOptions } from './core'

// 类型定义
export * from './types'

// 工具函数
export * from './utils'

// 插件系统
export * from './plugins'

// 默认导出播放器类
export { VideoPlayer as default } from './core'

/**
 * 创建视频播放器实例
 */
export function createPlayer(options: import('./types').PlayerOptions) {
  return new (require('./core').VideoPlayer)(options)
}
