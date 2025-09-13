/**
 * 核心模块入口文件
 * 导出播放器核心功能
 */

export { VideoPlayer } from './player'
export { PlayerControls } from './controls'
export type { ControlsOptions } from './controls'

export { PluginManager } from './plugin-manager'
export { BasePlugin, UIPlugin, ControlPlugin, OverlayPlugin } from './base-plugin'

export { ThemeManager } from './theme-manager'

export { HotkeyManager } from './hotkey-manager'
export type { HotkeyBinding, HotkeyConfig } from './hotkey-manager'

export { GestureManager, GestureType } from './gesture-manager'
export type { GestureEvent, GestureBinding, GestureConfig } from './gesture-manager'
