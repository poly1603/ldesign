/**
 * 颜色主题管理插件配置
 * 
 * 为应用提供完整的主题色管理功能，包括：
 * - 多主题支持
 * - 明暗模式切换
 * - 系统主题同步
 * - CSS变量自动注入
 */

import { createColorEnginePlugin } from '@ldesign/color/vue/index.ts'
import { globalThemeApplier } from '@ldesign/color/index.ts'
import type { ColorMode } from '@ldesign/color/index.ts'

// 暴露全局主题应用器到window对象，供组件使用
if (typeof window !== 'undefined') {
  (window as any).globalThemeApplier = globalThemeApplier
}

// 在插件创建前恢复缓存的主题状态
const cachedState = globalThemeApplier.restoreFromCache()

// 主题名称到颜色的映射
const themeColorMap: Record<string, string> = {
  'blue': '#1677ff',
  'green': '#00b96b',
  'purple': '#722ed1',
  'orange': '#fa8c16',
  'cyan': '#13c2c2',
  'gold': '#faad14',
  'midnight': '#1890ff',
  'graphite': '#52c41a',
  'lavender': '#722ed1',
  'forest': '#389e0d'
}

/**
 * 创建颜色主题管理插件
 *
 * 配置了完整的主题管理功能，包括预设主题、自动检测、
 * 性能优化和错误处理等特性，支持主题状态缓存和恢复
 */
export const colorPlugin = createColorEnginePlugin({
  // 基础配置 - 优先使用缓存的状态，如果没有缓存则使用默认值
  defaultTheme: cachedState?.theme || 'default', // 优先使用缓存的主题
  defaultMode: cachedState?.mode || 'light', // 优先使用缓存的模式
  debug: false, // 关闭调试减少控制台输出

  // 组件注册
  registerComponents: true, // 自动注册主题组件
  componentPrefix: 'LColor', // 组件名称前缀

  // 主题变化回调
  onThemeChanged: async (theme: string, mode: ColorMode) => {
    // 已禁用调试日志输出

    // 确保主题状态被正确缓存
    // 这里通过增强的主题应用器来处理缓存
    const currentState = globalThemeApplier.getCurrentState()
    if (currentState.theme !== theme || currentState.mode !== mode) {
      // 如果状态不一致，更新缓存
      // 已禁用调试日志输出
    }

    // 添加主题切换的动画效果
    document.documentElement.style.setProperty('--theme-transition', 'all 0.3s ease')

    // 延迟移除过渡效果，避免影响后续操作
    setTimeout(() => {
      document.documentElement.style.removeProperty('--theme-transition')
    }, 300)

    // 这里可以添加主题切换后的自定义逻辑
    // 例如：通知其他系统、更新用户偏好设置等
  },

  // 简化配置，移除有问题的回调
  // 主题变化会自动处理，无需手动回调
})

/**
 * 导出颜色主题管理插件
 * 
 * 使用示例：
 * ```typescript
 * import { colorPlugin } from './color'
 * 
 * // 在engine中使用
 * const engine = createAndMountApp(App, '#app', {
 *   plugins: [colorPlugin]
 * })
 * ```
 */
export default colorPlugin
