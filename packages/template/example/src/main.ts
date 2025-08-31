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

// 安装模板插件（使用新的配置系统）
app.use(TemplatePlugin, {
  // 基础配置
  templatesDir: '../src/templates',
  autoScan: true,
  enableHMR: import.meta.env.DEV,
  defaultDevice: 'desktop',
  enablePerformanceMonitor: import.meta.env.DEV,
  debug: import.meta.env.DEV,

  // 缓存配置
  cache: {
    enabled: true,
    strategy: 'lru',
    maxSize: 50,
    ttl: 30 * 60 * 1000, // 30分钟
    enableCompression: false,
    enablePersistence: false
  },

  // 设备检测配置
  deviceDetection: {
    breakpoints: {
      mobile: 768,
      tablet: 992,
      desktop: 1200
    },
    debounceDelay: 300,
    enableResize: true,
    enableOrientation: true
  },

  // 预加载策略配置
  preloadStrategy: {
    enabled: true,
    mode: 'lazy',
    limit: 5,
    priority: [], // 移除硬编码的优先级列表
    intersection: {
      rootMargin: '50px',
      threshold: 0.1
    },
    delay: 1000
  },

  // 扫描器配置
  scanner: {
    maxDepth: 5,
    includeExtensions: ['.vue', '.tsx', '.js', '.ts'],
    excludePatterns: ['node_modules', '.git', 'dist', 'coverage'],
    enableCache: true,
    watchMode: import.meta.env.DEV,
    debounceDelay: 300,
    batchSize: 10
  },

  // 性能优化配置
  performance: {
    enableLazyLoading: true,
    enableVirtualScroll: false,
    chunkSize: 20,
    enableMetrics: import.meta.env.DEV,
    metricsInterval: 5000
  },

  // 开发工具配置
  devtools: {
    enabled: import.meta.env.DEV,
    enableInspector: import.meta.env.DEV,
    enableLogger: import.meta.env.DEV,
    logLevel: 'info',
    enableTimeline: import.meta.env.DEV
  }
})

// 安装路由
app.use(router)

// 挂载应用
app.mount('#app')

// 开发环境下的调试信息
if (import.meta.env.DEV && typeof window !== 'undefined') {
  console.log('🎨 LDesign Template 示例项目启动成功！')
  console.log('📊 配置系统已启用，支持动态配置管理')
  console.log('🔧 开发工具已启用，支持实时调试和性能监控')
  console.log('📱 设备类型将根据配置动态检测')
  console.log('🎯 模板分类将通过扫描器自动发现')
}
