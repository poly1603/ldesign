import { createApp } from 'vue'
import App from './App.vue'

// 导入全局样式
import './styles/global.css'

// 创建应用实例
const app = createApp(App)

// 挂载应用
app.mount('#app')
