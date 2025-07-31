import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

console.log('🚀 LDesign Template Examples 启动中...')

// 创建应用实例
const app = createApp(App)

// 使用路由
app.use(router)

// 挂载应用
app.mount('#app')

console.log('✅ LDesign Template Examples 启动完成')
