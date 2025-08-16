/**
 * 简化的 Source 模式入口文件
 * 只使用基本功能，跳过复杂的插件配置
 */

import { createApp } from 'vue'
import App from './App.tsx'
import './styles/index.less'

console.log('🚀 启动简化版 LDesign 应用...')

async function bootstrap() {
  try {
    // 创建 Vue 应用
    const vueApp = createApp(App)

    // 添加全局属性（模拟引擎功能）
    vueApp.config.globalProperties.$engine = {
      version: '1.0.0',
      mode: 'source-simple',
      debug: true,
    }

    vueApp.config.globalProperties.$device = {
      type: 'desktop',
      orientation: 'landscape',
      width: window.innerWidth,
      height: window.innerHeight,
    }

    // 挂载应用
    vueApp.mount('#app')

    console.log('✅ 简化版 LDesign 应用启动成功!')
    console.log('📱 设备信息:', vueApp.config.globalProperties.$device)
    console.log('🔧 引擎信息:', vueApp.config.globalProperties.$engine)
  } catch (error) {
    console.error('❌ 应用启动失败:', error)
  }
}

// 启动应用
bootstrap()
