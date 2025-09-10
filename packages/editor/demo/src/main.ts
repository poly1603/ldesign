import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './styles/global.less'

const app = createApp(App)

app.use(router)

app.mount('#app')

// 开发环境下的调试信息
if (import.meta.env.DEV) {
  console.log('🚀 LDesign Editor Vite Demo 启动成功')
  console.log('📍 当前环境:', import.meta.env.MODE)
  console.log('🔧 Vite 版本:', import.meta.env.VITE_VERSION || 'Unknown')
}
