/**
 * Vue 3 应用主入口文件
 * 
 * 初始化 Vue 应用和相关配置
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

// 导入全局样式
import './styles/global.less'

// 创建 Vue 应用实例
const app = createApp(App)

// 安装 Pinia 状态管理
const pinia = createPinia()
app.use(pinia)

// 安装路由
app.use(router)

// 全局错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue Error:', err)
  console.error('Component:', instance)
  console.error('Info:', info)
}

// 全局警告处理
app.config.warnHandler = (msg, instance, trace) => {
  console.warn('Vue Warning:', msg)
  console.warn('Component:', instance)
  console.warn('Trace:', trace)
}

// 挂载应用
app.mount('#app')
