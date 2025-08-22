/**
 * LDesign Router 综合示例应用入口
 */

import { createApp } from 'vue'
import App from './App.vue'
import { createRouter } from './router'
import './styles/main.css'

// 创建应用实例
const app = createApp(App)

// 创建路由器
const router = createRouter()

// 安装路由器
app.use(router)

// 挂载应用
app.mount('#app')

// 开发环境下的调试信息
if (import.meta.env.DEV) {
  console.log('🚀 LDesign Router 综合示例启动成功!')
  console.log('📱 当前设备类型:', router.deviceType)
  console.log('🔗 路由器实例:', router)
  
  // 全局暴露路由器实例，方便调试
  ;(window as any).__ROUTER__ = router
}
