/**
 * LDesign Template 示例项目入口文件
 */

import { createApp } from 'vue'
import './styles/common.css'
import './styles/demo.css'
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
  // 使用内置模板，从核心包的 src/templates 目录加载
  templateRoot: [
    // 内置模板目录（相对于包根目录）
    '@ldesign/template/templates',
    // 用户自定义模板目录
    'src/templates'
  ],
  defaultDevice: 'desktop',
  deviceDetection: {
    mobileBreakpoint: 768,
    tabletBreakpoint: 992,
    desktopBreakpoint: 1200,
    autoDetect: false, // 禁用自动检测，强制使用默认设备
  },
  cache: {
    enabled: true,
    strategy: 'lru',
    maxSize: 50,
    ttl: 30 * 60 * 1000, // 30分钟
  },
  debug: true,
  // 组件配置
  componentPrefix: 'L',
  registerComponents: true,
  registerDirectives: true,
  provideGlobalProperties: true,
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
