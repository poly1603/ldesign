/**
 * Vue 3 应用入口文件
 * 配置和启动 LDesign 节日主题包演示应用
 */

import { createApp } from 'vue'
import App from './App.vue'

// 导入主题相关模块
import { FestivalThemeManager } from '../../../src/core/theme-manager'
import { allThemes } from '../../../src/themes'

// 创建 Vue 应用实例
const app = createApp(App)

// 创建主题管理器实例
const themeManager = new FestivalThemeManager({
  themes: allThemes,
  defaultTheme: 'default',
  autoActivate: true,
  enableCache: true,
  enablePerformanceMonitoring: true
})

// 提供主题管理器给整个应用
app.provide('themeManager', themeManager)

// 全局属性
app.config.globalProperties.$themeManager = themeManager

// 挂载应用
app.mount('#app')

// 开发环境下的调试信息
if (import.meta.env.DEV) {
  console.log('🎨 LDesign 节日主题包 Vue 3 演示已启动')
  console.log('📦 可用主题:', allThemes.map(theme => theme.id))

    // 暴露到全局以便调试
    ; (window as any).__LDESIGN_THEME_APP__ = app
    ; (window as any).__LDESIGN_THEME_MANAGER__ = themeManager
}
