/**
 * LDesign Template 示例项目入口文件
 */

import { createApp } from 'vue'
import './styles/common.css'
import './styles/demo.css'
// 导入模板组件样式
import './styles/template-components.css'
import { createRouter, createWebHistory } from 'vue-router'
import TemplatePlugin from '@ldesign/template'
import App from './App.vue'
import ComponentDemo from './views/ComponentDemo.vue'
import HookDemo from './views/HookDemo.vue'

// 创建路由
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/component'
    },
    {
      path: '/component',
      name: 'ComponentDemo',
      component: ComponentDemo,
      meta: {
        title: '组件方式演示',
        description: '使用 TemplateRenderer 组件渲染内置 login 模板'
      }
    },
    {
      path: '/hook',
      name: 'HookDemo',
      component: HookDemo,
      meta: {
        title: 'Hook 方式演示',
        description: '使用 useTemplate hook 管理和渲染内置 login 模板'
      }
    },
  ],
})

// 创建应用
const app = createApp(App)

// 安装模板插件（使用内置模板）
app.use(TemplatePlugin, {
  // 模板目录配置 - 指向正确的模板目录
  templatesDir: '../src/templates',
  // 自动扫描模板
  autoScan: true,
  // 启用缓存
  cache: true,
  // 开发环境启用热更新
  enableHMR: import.meta.env.DEV,
  // 默认设备类型
  defaultDevice: 'desktop',
  // 启用性能监控（开发环境）
  enablePerformanceMonitor: import.meta.env.DEV,
  // 预加载策略
  preloadStrategy: {
    enabled: true,
    mode: 'lazy',
    limit: 5,
    priority: ['login-desktop-default', 'login-desktop-modern']
  }
})

// 安装路由
app.use(router)

// 挂载应用
app.mount('#app')

// 开发环境下的调试信息
if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
  console.log('🎨 LDesign Template 示例项目启动成功！')
  console.log('📱 支持的设备类型: desktop, tablet, mobile')
  console.log('🎯 可用的模板分类: login')
}
