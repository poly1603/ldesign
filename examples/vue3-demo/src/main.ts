/**
 * Vue3 应用入口文件
 */

import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import routes from './router/routes'

// 导入 LDesign Chart Vue 插件
import LDesignChart from '@ldesign/chart/vue'

// 导入样式
import './styles/index.less'

/**
 * 创建路由实例
 */
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

/**
 * 创建 Vue 应用实例
 */
const app = createApp(App)

// 安装路由
app.use(router)

// 安装 LDesign Chart 插件
app.use(LDesignChart, {
  prefix: 'L', // 组件前缀
  directive: true // 启用 v-chart 指令
})

// 全局配置
app.config.globalProperties.$chartTheme = 'light'
app.config.globalProperties.$chartConfig = {
  animation: true,
  animationDuration: 1000
}

// 挂载应用
app.mount('#app')

// 开发环境下的调试信息
if (import.meta.env.DEV) {
  console.log('🚀 LDesign Chart Vue3 示例项目启动成功!')
  console.log('📊 支持的图表类型:', [
    'line', 'bar', 'pie', 'scatter', 'area', 'radar', 
    'gauge', 'funnel', 'treemap', 'sunburst', 'sankey'
  ])
}
