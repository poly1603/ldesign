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
  onThemeChanged: (theme: string, mode: string) => {
    console.log(`🎨 主题已切换: ${theme} - ${mode}`)
  },
  onError: (error: Error) => {
    console.error('🚨 主题错误:', error)
  },
})

app.mount('#app')
