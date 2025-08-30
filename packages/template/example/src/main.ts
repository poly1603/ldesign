/**
 * LDesign Template 示例项目入口文件
 */

import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { install as TemplatePlugin } from '@ldesign/template'
import App from './App.vue'
import Home from './views/Home.vue'
import BasicExample from './views/BasicExample.vue'
import AdvancedExample from './views/AdvancedExample.vue'
import CompositionExample from './views/CompositionExample.vue'

// 创建路由
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
    },
    {
      path: '/basic',
      name: 'BasicExample',
      component: BasicExample,
    },
    {
      path: '/advanced',
      name: 'AdvancedExample',
      component: AdvancedExample,
    },
    {
      path: '/composition',
      name: 'CompositionExample',
      component: CompositionExample,
    },
  ],
})

// 创建应用
const app = createApp(App)

// 安装模板插件（使用默认配置，会自动包含内置模板）
app.use(TemplatePlugin, {
  defaultDevice: 'desktop',
  deviceDetection: {
    mobileBreakpoint: 768,
    tabletBreakpoint: 992,
    desktopBreakpoint: 1200,
    autoDetect: true,
  },
  cache: {
    enabled: true,
    strategy: 'lru',
    maxSize: 50,
    ttl: 30 * 60 * 1000, // 30分钟
  },
  debug: true,
})

// 安装路由
app.use(router)

// 挂载应用
app.mount('#app')

// 开发环境下的调试信息
if (import.meta.env?.DEV) {
  console.log('🎨 LDesign Template 示例项目启动成功！')
  console.log('📱 支持的设备类型: desktop, tablet, mobile')
  console.log('🎯 可用的模板分类: login, dashboard, profile')
}
