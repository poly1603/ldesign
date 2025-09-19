/**
 * 主题切换组件入口文件
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import ThemeToggle from './ThemeToggle.vue'
import type { App } from 'vue'

// 导出组件类型
export type { 
  ThemeToggleProps, 
  ThemeToggleEmits, 
  ThemeToggleInstance,
  ThemeToggleSize,
  ThemeIconConfig,
  ThemeLabelConfig,
  ThemeToggleConfig
} from './types'

// 组件安装函数
ThemeToggle.install = (app: App): void => {
  app.component('LdThemeToggle', ThemeToggle)
  app.component('ThemeToggle', ThemeToggle)
}

// 导出组件
export { ThemeToggle }
export default ThemeToggle
