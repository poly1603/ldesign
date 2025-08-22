/**
 * @ldesign/theme - Festival Demo 主入口文件
 */

import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

console.log('🚀 启动 Festival Demo...')

const app = createApp(App)

// 错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue 应用错误:', err)
  console.error('错误信息:', info)
}

app.mount('#app')

console.log('✅ Festival Demo 启动完成')
