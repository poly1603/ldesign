import { createApp } from 'vue'
import App from './App.vue'

console.log('🚀 Vue 3 应用启动中...')

const app = createApp(App)

app.mount('#app')

console.log('✅ Vue 3 应用已挂载到 #app')

// 添加一些开发时的调试信息
if (import.meta.env.DEV) {
  console.log('🔧 开发模式已启用')
  console.log('📦 Vite 版本:', import.meta.env.VITE_VERSION || 'unknown')
  console.log('🎯 环境变量:', import.meta.env)
}
