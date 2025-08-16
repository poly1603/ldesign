import type { ColorMode } from '@ldesign/color'
import {
  generateColorConfig,
  generateColorScales,
  injectThemeVariables,
} from '@ldesign/color'
import { ThemePlugin } from '@ldesign/color/vue'
import { createApp } from 'vue'
import App from './App.vue'
import './styles/index.css'

const app = createApp(App)

// 安装主题插件
app.use(ThemePlugin, {
  defaultTheme: 'default',
  autoDetect: true,
  idleProcessing: true,
  onThemeChanged: async (theme: string, mode: ColorMode) => {
    console.log(`🎨 主题已切换: ${theme} - ${mode}`)

    // 注入CSS变量
    try {
      // 这里需要获取主题配置，暂时使用默认主色调
      const primaryColor = mode === 'light' ? '#1677ff' : '#4096ff'
      const colorConfig = generateColorConfig(primaryColor)
      // 过滤掉undefined的颜色
      const validColors = Object.fromEntries(
        Object.entries(colorConfig).filter(([_, value]) => value !== undefined)
      ) as Record<string, string>
      const scales = generateColorScales(validColors, mode)
      injectThemeVariables(colorConfig, scales, undefined, mode)
    } catch (error) {
      console.warn('CSS变量注入失败:', error)
    }
  },
  onError: (error: Error) => {
    console.error('🚨 主题错误:', error)
  },
})

app.mount('#app')
