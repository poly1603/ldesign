import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles/global.less'

// 创建应用实例
const app = createApp(App)

// 安装插件
app.use(createPinia())
app.use(router)

// 全局错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error('全局错误:', err)
  console.error('错误信息:', info)
  console.error('组件实例:', instance)
}

// 全局警告处理
app.config.warnHandler = (msg, instance, trace) => {
  console.warn('全局警告:', msg)
  console.warn('组件实例:', instance)
  console.warn('组件追踪:', trace)
}

// 挂载应用
app.mount('#app')

// 开发环境下的调试信息
if (import.meta.env.DEV) {
  console.log('🚀 LDesign Router 高级示例启动成功!')
  console.log('📊 路由器实例:', router)
  console.log('🎯 当前路由:', router.currentRoute.value)

  // 监听路由变化
  router.afterEach((to, from) => {
    console.log(`🔄 路由变化: ${from.path} → ${to.path}`)
  })

  // 监听路由错误
  router.onError((error, to, from) => {
    console.error('❌ 路由错误:', error)
    console.error('目标路由:', to)
    console.error('来源路由:', from)
  })
}
