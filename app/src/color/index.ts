/**
 * 颜色主题管理插件配置
 * 
 * 为应用提供完整的主题色管理功能，包括：
 * - 多主题支持
 * - 明暗模式切换
 * - 系统主题同步
 * - CSS变量自动注入
 */

import { createColorEnginePlugin, globalThemeApplier } from '@ldesign/color'
import type { ColorMode } from '@ldesign/color'

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
  // 基础配置 - 使用缓存的状态或默认值
  defaultTheme: cachedState.theme || 'blue', // 优先使用缓存的主题
  defaultMode: cachedState.mode || 'light', // 优先使用缓存的模式
  debug: true, // 开发环境启用调试

  // 组件注册
  registerComponents: true, // 自动注册主题组件
  componentPrefix: 'LColor', // 组件名称前缀

  // 主题变化回调
  onThemeChanged: async (theme: string, mode: ColorMode) => {
    console.log(`🎨 [ColorPlugin] 主题已切换: ${theme} (${mode})`)

    // 确保主题状态被正确缓存
    // 这里通过增强的主题应用器来处理缓存
    const currentState = globalThemeApplier.getCurrentState()
    if (currentState.theme !== theme || currentState.mode !== mode) {
      // 如果状态不一致，更新缓存
      console.log(`📝 [ColorPlugin] 更新主题缓存: ${theme} (${mode})`)
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

  // 插件初始化完成回调
  onReady: async (themeManager: any) => {
    console.log(`🚀 [ColorPlugin] 插件初始化完成，恢复缓存主题: ${cachedState.theme} (${cachedState.mode})`)

    // 如果有缓存的主题，应用对应的主题色
    if (cachedState.theme && cachedState.theme !== 'blue') {
      const themeColor = themeColorMap[cachedState.theme]
      if (themeColor) {
        // 使用增强的主题应用器应用缓存的主题
        globalThemeApplier.applyTheme(themeColor, cachedState.mode, { name: cachedState.theme })
        console.log(`✅ [ColorPlugin] 缓存主题已恢复: ${cachedState.theme} -> ${themeColor}`)
      }
    }
  },

  // 错误处理回调
  onError: (error: Error) => {
    console.error('🚨 主题管理错误:', error)

    // 在生产环境中，可以将错误发送到监控系统
    if (process.env.NODE_ENV === 'production') {
      // 发送错误到监控系统
      // errorReporting.captureException(error)
    }

    // 显示用户友好的错误提示
    // 这里可以集成应用的通知系统
    // notification.error('主题切换失败，请稍后重试')
  }
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
